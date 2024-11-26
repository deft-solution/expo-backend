import * as express from 'express';
import { inject, injectable } from 'inversify';
import { sumBy } from 'lodash';
import moment from 'moment';
import mongoose, { ObjectId } from 'mongoose';
import { AccountTransactionData } from 'src/models/SitAPI';

import { BadRequestError, NotFoundError } from '../../packages';
import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import { Currency } from '../enums/Currency';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus, PaymentStatus } from '../enums/Order';
import { CurrencyHelper } from '../helpers/CurrencyConverter';
import { ExpressHelper } from '../helpers/Express';
import { IOrderBooths, IOrderRequestParams } from '../middlewares/ValidateOrderParam';
import { ICalculatedResponse, IOrder, IOrderItem, Order } from '../models';
import { IBooth } from '../models/Booth';
import { BoothService } from './BoothService';
import { BoothTypeService } from './BoothTypeService';
import { EmailService, EmailServiceImpl } from './EmailService';
import { SerialPrefixService } from './SerialPrefixService';

export interface OrderService extends BaseService<IOrder> {
  calculatedAmountByEvent: (event: string, booths: IOrderBooths[], currency: Currency) => Promise<any>;
  signOrderIsCompleted: (order: IOrder, paymentInfo: AccountTransactionData) => Promise<void>;
  createOrder: (param: IOrderRequestParams, request: express.Request) => Promise<any>;
}

@injectable()
export class OrderServiceImpl extends BaseServiceImpl<IOrder> implements OrderService {
  model = Order;

  @inject('SerialPrefixService')
  prefixSv!: SerialPrefixService;

  @inject('EmailService')
  emailSv!: EmailService;

  @inject('BoothService')
  boothSv!: BoothService;

  @inject('BoothTypeService')
  boothTypeSv!: BoothTypeService;

  constructor() {
    super();
  }

  async signOrderIsCompleted(order: IOrder, paymentInfo: AccountTransactionData) {
    const transactionManager = new TransactionManager();
    await transactionManager.runs(async (session) => {
      // Ensure that the session is passed to both update operations

      await this.updateAllReserveBooth(order.id, order.items, session);
      await this.findOneByIdAndUpdate(
        order.id,
        { status: OrderStatus.Completed, completedAt: new Date() },
        { session },
      );
      await this.sentEmail(order.id, paymentInfo)
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

    const currencyHelper = new CurrencyHelper();
    const targetCurrency = param.currency; // Default to USD if no currency is provided.

    // Validate and create order items with currency conversion
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

        // Get booth type for currency details
        const boothType = await this.boothTypeSv.findOne({ _id: existingBooth.boothType });
        if (!boothType) {
          throw new NotFoundError('Booth Type does not exist');
        }

        // Perform currency conversion
        const convertedPrice = currencyHelper.convertCurrency(existingBooth.price, boothType.currency, targetCurrency);

        // Create and return the order item
        return {
          boothId: booth.boothId as any,
          quantity: booth.quantity,
          price: boothType.price,
          unitPrice: convertedPrice,
          totalPrice: convertedPrice * booth.quantity,
          currency: targetCurrency,
          boothTypeCurrency: boothType.currency,
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
      paymentMethod: param.paymentMethod,
      phoneNumber: param.phoneNumber,
      note: param.note ?? null,
      status: OrderStatus.Pending,
      paymentStatus: PaymentStatus.Pending,
      currency: targetCurrency,
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

  async calculatedAmountByEvent(
    event: string,
    booths: IOrderBooths[],
    currency: Currency,
  ): Promise<{
    totalAmount: number;
    booths: ICalculatedResponse[];
    currency: Currency;
  }> {
    // Initialize total amount
    let totalAmount = 0;
    const boothDetailsWithPrices: ICalculatedResponse[] = [];

    for (const booth of booths) {
      const boothDetail = await this.boothSv.findOne({ event, _id: booth.boothId, isActive: true });
      if (!boothDetail) {
        throw new BadRequestError(`Booth with ID ${booth.boothId} does not exist.`, ErrorCode.BoothDoesNotExisted);
      }
      const bootType = await this.boothTypeSv.findOne({ _id: boothDetail.boothType });
      if (!bootType) {
        throw new NotFoundError('Booth Type does not existed');
      }

      if (boothDetail.isReserved) {
        const message = `Booth with ID ${booth.boothId} is already reserved and cannot be ordered.`;
        throw new BadRequestError(message, ErrorCode.OrderedBoothHasAlreadyReserved);
      }

      // Perform currency conversion
      const convertedPrice = new CurrencyHelper().convertCurrency(boothDetail.price, bootType.currency, currency);

      // Calculate the amount for the current booth
      const boothAmount = booth.quantity * convertedPrice;
      totalAmount += boothAmount;

      // Add booth details with converted price
      boothDetailsWithPrices.push({
        boothId: booth.boothId,
        price: boothDetail.price,
        boothName: boothDetail.boothName,
        boothTypeName: bootType.name,
        convertedPrice,
        originCurrency: bootType.currency,
        quantity: booth.quantity,
        size: boothDetail.size,
      });
    }

    return {
      totalAmount,
      booths: boothDetailsWithPrices,
      currency,
    };
  }

  async sentEmail(orderId: string, paymentInfo: AccountTransactionData) {
    const order = await Order.findOne({ _id: orderId }).populate(['items.boothId']);
    if (!order) {
      return;
    }

    const booths = order.items.map((item) => {
      const booth = (item.boothId as any);
      const boothName = booth.boothName;
      const boothSize = booth.size;

      return {
        name: `${boothName} (${boothSize})`,
        price: `${order.currency} ${item.unitPrice}`,
        quantity: item.quantity,
      }
    });
    const customerName = [order.firstName, order.lastName].join(' ');

    const dataSource = {
      orderNo: order.orderNo,
      customerName,
      totalAmount: `${order.currency} ${order.totalAmount}`,
      year: new Date().getFullYear(),
      paymentTime: moment(paymentInfo.acknowledgedDateMs).format('DD MMM yyyy hh:mm A'),
      booths,
    }

    const templateDir = '/emails/success-order.html';
    const subject = `Cambodia Trade Expo - Here's your receipt for ${customerName}`
    await new EmailServiceImpl().sentEmail(templateDir, order.email, dataSource, subject)
  }
}
