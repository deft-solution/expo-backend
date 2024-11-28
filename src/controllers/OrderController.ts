import * as express from 'express';
import { readFile } from 'fs';
import fs from 'fs/promises';
import { inject, injectable } from 'inversify';
import moment from 'moment-timezone';
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
import { formatNumber } from '../helpers/format-number';
import { PdfHelper } from '../helpers/PDFHelper';
import {
  IOrderedCalculated,
  IOrderRequestParams,
  validateCalculatedParam,
  validateOrderParam,
} from '../middlewares/ValidateOrderParam';
import { IEvents } from '../models';
import { IBoothType } from '../models/BoothType';
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

  @GET('/v1/:id/pdf')
  async getReceiptOrder(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const { id } = request.params;

    const order = await this.orderSv.findOneByIdWithPopulate(id);
    if (!order) {
      throw new NotFoundError('This order does not existed.!');
    }
    const data = {
      title: `#${order.orderNo}`,
      message: 'This is a dynamically generated PDF using a Handlebars template.',
      details: ['Item 1', 'Item 2', 'Item 3'],
      date: new Date().toLocaleDateString(),
    };

    const event = order.event as IEvents;
    const booths = order.items.map((item) => {
      const booth = item.boothId as any;
      const boothName = booth.boothName;
      const boothSize = booth.size;
      const boothType = booth.boothType as IBoothType;
      const description = boothType.description;

      return {
        name: `${boothName} (${boothSize}) (${boothType.name})`,
        price: `${order.currency} ${formatNumber(item.unitPrice)}`,
        quantity: item.quantity,
        description,
        totalPrice: formatNumber(item.totalPrice),
      };
    });
    const timezone = process.env.TIMEZONE ?? 'Asia/Phnom_Penh';

    const data = {
      orderNo: `#${order.orderNo}`,
      customerName: [order.firstName, order.lastName].join(' '),
      email: order.email,
      phoneNumber: order.phoneNumber,
      issuedDate: moment().tz(timezone).format('DD MMM yyyy hh:mm A'),
      paymentMethod: 'Bakong KHQR',
      currency: order.currency,
      totalAmount: formatNumber(order.totalAmount),
      booths,
      logoUrl: event.logoUrl,
      eventName: event.name,
      location: event.location,
      eventEmail: event.email,
      eventPhoneNumber: event.phoneNumber,
    };

    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const baseFileName = `Order- 0001 - ${timestamp}.pdf`;

    const templatePath = path.join('src/templates', 'orders/receipts.html');
    const pdfHelper = new PdfHelper(templatePath);
    const file = await pdfHelper.generatePDF(data, { format: 'A4', printBackground: true });

    return new PDFData(file, baseFileName);
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
