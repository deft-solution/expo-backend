import * as express from 'express';
import { inject, injectable } from 'inversify';
import path from 'path';

import {
  Authorization,
  BadRequestError,
  ContextRequest,
  Controller,
  GET,
  Middleware,
  NotFoundError,
  PDFData,
  POST,
  PUT,
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus } from '../enums/Order';
import { PdfHelper } from '../helpers/PDFHelper';
import {
  IOrderedCalculated,
  IOrderRequestParams,
  validateCalucatedParam,
  validateOrderParam,
} from '../middlewares/ValidateOrderParam';
import { EventService, OrderService } from '../services';
import { Pagination } from '../utils/Pagination';
import { FilterQuery } from 'mongoose';
import { IOrder } from '../models/Order';

@Controller('/orders')
@injectable()
export class OrderController {
  @inject('EventService')
  eventSv!: EventService;

  @inject('OrderService')
  orderSv!: OrderService;

  @POST('/v1/calculated')
  @Middleware([validateCalucatedParam])
  async calculatedOrder(@ContextRequest request: express.Request<any, any, IOrderedCalculated>) {
    const body = request.body;

    const event = await this.eventSv.findActiveOneById(body.event);
    if (!event) {
      throw new BadRequestError('The requested event does not exist.', ErrorCode.EventDoesNotExisted);
    }

    if (body.booths.length > event.maxBoothPerOrder) {
      const message = `The number of selected booths (${body.booths.length}) exceeds the maximum allowed (${event.maxBoothPerOrder}).`;
      throw new BadRequestError(message, ErrorCode.TheOrderhasSupersededTheMaxValue);
    }
    const totalAmount = await this.orderSv.calucateAmountByEvent(body.event, body.booths);
    return { totalAmount };
  }

  @GET('/v1/admin/list')
  @Authorization
  async getAllOrderWithPagination(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const pagination = new Pagination(request).getParam();
    const { oderNo } = request.query;

    const filter: FilterQuery<IOrder> = {};

    if (oderNo) {
      Object.assign(filter, { oderNo: { $regex: oderNo, $options: 'i' } });
    }

    const populateKeys = ['event', 'items.boothId'];
    const list = await this.orderSv.getAllWithPaginationAndFilter(
      pagination,
      filter,
      { createdAt: 'desc' },
      populateKeys,
    );
    return list;
  }

  @GET('/v1/:orderNo/pdf/receipts')
  async getReceiptOrder(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const { orderNo } = request.params;
    const order = await this.orderSv.findOne({ orderNo: orderNo });
    if (!order) {
      throw new NotFoundError('This order does not eixsted.!');
    }

    const data = {
      title: `#${order.orderNo}`,
      message: 'This is a dynamically generated PDF using a Handlebars template.',
      details: ['Item 1', 'Item 2', 'Item 3'],
      date: new Date().toLocaleDateString(),
    };

    const templatePath = path.join('src/templates', 'orders/receipts.html');
    const pdfHelper = new PdfHelper(templatePath);

    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const baseFileName = `${orderNo}-${timestamp}.pdf`;

    // Generate the PDF with a timestamped filename
    const pdfBuffer = await pdfHelper.generatePDF(data, { format: 'A4' });

    return new PDFData(pdfBuffer, baseFileName);
  }

  @POST('/v1/create')
  @Middleware([validateOrderParam])
  async createdOrder(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const body = request.body;

    // Validate if Event is exited
    const event = await this.eventSv.findActiveOneById(body.event);
    if (!event) {
      throw new NotFoundError('This Event does not existed.', ErrorCode.EventDoesNotExisted);
    }
    const order = await this.orderSv.createOrder(body, request);
    return order;
  }

  @PUT('/v1/:orderId/completed')
  async orderIsCompleted(@ContextRequest request: express.Request<any, any, any>) {
    const { orderId } = request.params;
    const order = await this.orderSv.findOne({ _id: orderId, status: { $ne: OrderStatus.Completed } });
    if (!order) {
      throw new NotFoundError('We don`t have this order yet.', ErrorCode.WeDontHaveThisOrderYet);
    }
    //
    await this.orderSv.signOrderIsCompleted(order);
  }
}
