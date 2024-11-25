import * as express from 'express';
import { inject, injectable } from 'inversify';
import { ClientSession } from 'mongoose';

import {
  BadRequestError, ContextRequest, Controller, Middleware, NotFoundError, POST
} from '../../packages';
import { TransactionManager } from '../base/TransactionManager';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus } from '../enums/Order';
import { TransactionStatus } from '../enums/Transaction';
import { ExpressHelper } from '../helpers/Express';
import { GenericParamsChecker, ValidationRulesMap } from '../helpers/ValidationParamHelper';
import { IPaymentParam, IPaymentStatusParam, validatePaymentParam } from '../middlewares/Payments';
import { BakongService, OrderService, TransactionService } from '../services';

@Controller('/payments')
@injectable()
export class PaymentController {
  @inject('OrderService')
  orderSv!: OrderService;

  @inject('TransactionService')
  transactionSv!: TransactionService;

  @inject('BakongService')
  bakongSv!: BakongService;

  @POST('/v1/qrcode')
  @Middleware(validatePaymentParam)
  async generatePaymentQRCode(@ContextRequest request: express.Request<any, any, IPaymentParam>) {
    const ip = ExpressHelper.getClientIp(request);
    const { orderId } = request.body;

    const order = await this.orderSv.findOne({ _id: orderId, status: OrderStatus.Pending, });
    if (!order) {
      throw new NotFoundError('We don`t have this order yet.!');
    }

    const payments = await this.transactionSv.createKHQRPayment(order, request.body, ip);
    const response = {
      id: payments.id,
      qrCode: payments.hashBakongCode,
      metaData: payments.paymentMetadata,
      amount: payments.amount,
      transactionNo: payments.transactionNo,
      currency: payments.currency,
      createdAt: payments.createdAt,
    };

    return response;
  }

  @POST('/v1/status')
  async checkTransactionStatus(@ContextRequest request: express.Request<any, any, IPaymentStatusParam>) {
    const rules: ValidationRulesMap<IPaymentStatusParam> = {
      transactionId: { isRequired: true, isObjectId: true },
    };
    const param = new GenericParamsChecker(request, rules).getParams();

    const transaction = await this.transactionSv.findOne({ _id: param.transactionId });
    if (!transaction) {
      throw new NotFoundError('We don`t have this transaction.', ErrorCode.TransactionDoesNotExisted);
    }

    if (transaction.status === TransactionStatus.Completed) {
      throw new BadRequestError(
        'Payment for this transaction has been successfully processed.',
        ErrorCode.TransactionAlreadyCompleted,
      );
    }

    const order = await this.orderSv.findOneById(transaction.order._id as any);
    if (!order) {
      throw new NotFoundError('This order does not existed', ErrorCode.OrderDoesNotExisted);
    }

    const bakong = await this.bakongSv.checkAccountStatus(transaction.paymentMetadata);
    if (!bakong.data) {
      throw new NotFoundError('This Transaction have`t completed yet.', ErrorCode.TransactionHaveNotCompletedYet);
    }

    const paymentData = bakong.data;
    const result = await new TransactionManager().runs(async (session: ClientSession) => {
      const result = await this.transactionSv.singTransactionIsCompleted(transaction.id, paymentData, session);
      await this.orderSv.signOrderIsCompleted(order.id);
      return result;
    });

    const response = {
      orderId: transaction.order,
      transactionNo: transaction.transactionNo,
      createdAt: transaction.createdAt,
      amount: transaction.amount,
      paymentTimestamp: transaction.paymentTimestamp,
      currency: result.currency,
      status: result.status,
    };

    return response;
  }
}
