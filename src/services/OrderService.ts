import * as express from 'express';
import { inject, injectable } from 'inversify';
import { sumBy } from 'lodash';
import mongoose, { ObjectId } from 'mongoose';

import { BadRequestError } from '../../packages';
import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import { Currency } from '../enums/Currency';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../enums/Order';
import { ExpressHelper } from '../helpers/Express';
import { IOrderRequestParams } from '../middlewares/ValidateOrderParam';
import { IOrder, IOrderItem, Order } from '../models';
import { BoothService } from './BoothService';
import { SerialPrefixService } from './SerialPrefixService';

export interface OrderService extends BaseService<IOrder> {
  signOrderIsCompleted: (order: IOrder) => Promise<void>;
  createOrder: (param: IOrderRequestParams, request: express.Request) => Promise<any>;
}

@injectable()
export class OrderServiceImpl extends BaseServiceImpl<IOrder> implements OrderService {
  model = Order;

  @inject('SerialPrefixService')
  prefixSv!: SerialPrefixService;

  @inject('BoothService')
  boothSv!: BoothService;

  constructor() {
    super();
  }

  async signOrderIsCompleted(order: IOrder) {
    const transactionManager = new TransactionManager();
    await transactionManager.runs(async (session) => {
      // Ensure that the session is passed to both update operations
      await this.updateAllReserveBooth(order.id, order.items, session);
      await this.findOneByIdAndUpdate(order.id, { status: OrderStatus.Completed, completedAt: new Date(), }, { session });
    });
  }
  async updateAllReserveBooth(orderId: ObjectId, booths: IOrderItem[], session: mongoose.ClientSession) {
    // Use Promise.all to wait for all booth update operations
    return await Promise.all(
      booths.map(async (booth) => {
        // Find the booth and check if it is already reserved
        const existingBooth = await this.boothSv.findOne({ _id: booth.boothId, isReserved: false }, session);
        if (existingBooth) {
          // Update only if the booth is not reserved
          return this.boothSv.findOneByIdAndUpdate(booth.boothId, { isReserved: true, order: orderId }, { session });
        }
        return null; // Return null if the booth is already reserved, or handle as needed
      }),
    );
  }

  async createOrder(param: IOrderRequestParams, request: express.Request) {
    const ip = ExpressHelper.getClientIp(request);
    const booths = param.booths;

    // Validate and create order items
    const items: IOrderItem[] = await Promise.all(
      booths.map(async (booth): Promise<IOrderItem> => {
        // Check if boothId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(booth.boothId)) {
          throw new BadRequestError(`Invalid booth ID: ${booth.boothId}`);
        }

        // Check if the booth exists and is active
        const existingBooth = await this.boothSv.findOne({
          event: param.event,
          _id: booth.boothId,
          isActive: true,
        });
        if (!existingBooth) {
          throw new BadRequestError(`Booth with ID ${booth.boothId} not found`);
        }

        // Additional validation (e.g., availability)
        if (existingBooth.isReserved) {
          throw new BadRequestError(`Booth with ID ${booth.boothId} is already reserved`);
        }

        // Create and return the order item
        return {
          boothId: booth.boothId as any,
          quantity: booth.quantity,
          unitPrice: existingBooth.price,
          totalPrice: existingBooth.price * booth.quantity,
        };
      }),
    );

    // Calculate the total amount
    const totalAmount = sumBy(items, 'totalPrice');

    const order = {
      event: param.event as any,
      totalAmount,
      ip,
      firstName: param.firstName,
      lastName: param.lastName,
      patentUrl: param.patentUrl,
      email: param.email,
      companyName: param.companyName,
      nationality: param.nationality,
      createdBy: param.userId,
      paymentMethod: PaymentMethod.QRCode,
      paymentCard: param.paymentCard,
      provider: param.provider,
      option: param.option,
      phoneNumber: param.phoneNumber,
      note: param.note ?? null,
      status: OrderStatus.Pending,
      paymentStatus: PaymentStatus.Pending,
      paymentId: param.paymentId,
      currency: Currency.KHR,
      createdAt: new Date(),
      items,
    };

    const response = await new TransactionManager().runs(async (session) => {
      const prefix = await this.prefixSv.retrieveOrGenerateSerialPrefix('Order', 'O', session);

      Object.assign(order, { orderNo: prefix.prefixCode });
      const result = await new Order(order).save({ session });
      return result;
    });

    return response;
  }
}
