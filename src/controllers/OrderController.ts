import * as express from 'express';
import { inject, injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
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
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { PdfHelper } from '../helpers/PDFHelper';
import {
  IOrderedCalculated,
  IOrderRequestParams,
  validateCalculatedParam,
  validateOrderParam,
} from '../middlewares/ValidateOrderParam';
import { IOrder } from '../models/Order';
import { EventService, OrderService } from '../services';
import { Pagination } from '../utils/Pagination';

@Controller('/orders')
@injectable()
export class OrderController {
  @inject('EventService')
  eventSv!: EventService;

  @inject('OrderService')
  orderSv!: OrderService;

  @POST('/v1/calculated')
  @Middleware([validateCalculatedParam])
  async calculatedOrder(@ContextRequest request: express.Request<any, any, IOrderedCalculated>) {
    const body = request.body;

    const event = await this.eventSv.findActiveOneById(body.event);
    if (!event) {
      throw new BadRequestError('The requested event does not exist.', ErrorCode.EventDoesNotExisted);
    }

    if (body.booths.length > event.maxBoothPerOrder) {
      const message = `The number of selected booths (${body.booths.length}) exceeds the maximum allowed (${event.maxBoothPerOrder}).`;
      throw new BadRequestError(message, ErrorCode.TheOrderHasSupersededTheMaxValue);
    }

    const order = await this.orderSv.calculatedAmountByEvent(body.event, body.booths, body.currency);
    return order;
  }

  @GET('/v1/admin/list')
  @Authorization
  async getAllOrderWithPagination(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const pagination = new Pagination(request).getParam();
    const { orderNo, eventId, status } = request.query;

    const filter: FilterQuery<IOrder> = {};

    if (orderNo) {
      Object.assign(filter, { orderNo: { $regex: orderNo, $options: 'i' } });
    }

    if (eventId) {
      Object.assign(filter, { event: eventId });
    }

    if (status) {
      Object.assign(filter, { status });
    }

    const populateKeys = ['event', 'items.boothId', 'payments'];
    const list = await this.orderSv.getAllWithPaginationAndFilter(
      pagination,
      filter,
      { createdAt: 'desc' },
      populateKeys,
    );
    return list;
  }

  @GET('/v1/admin/:id')
  @Authorization
  async findOneByIdForAdmin(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const { id } = request.params;

    const order = await this.orderSv.findOneByIdWithPopulate(id);
    if (!order) {
      throw new NotFoundError('This order does not existed', ErrorCode.OrderDoesNotExisted);
    }

    return order;
  }

  @GET('/v1/:orderNo/pdf/receipts')
  async getReceiptOrder(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const { orderNo } = request.params;

    const order = await this.orderSv.findOne({ orderNo: orderNo });
    if (!order) {
      throw new NotFoundError('This order does not existed.!');
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
}
