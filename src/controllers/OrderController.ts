import * as express from 'express';
import { inject, injectable } from 'inversify';
import path from 'path';

import {
    ContextRequest, Controller, DownloadBinaryData, GET, Middleware, NotFoundError, PDFData, POST,
    PUT
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus } from '../enums/Order';
import { PdfHelper } from '../helpers/PDFHelper';
import { IOrderRequestParams, validateOrderParam } from '../middlewares/ValidateOrderParam';
import { EventService, OrderService } from '../services';

@Controller('/orders')
@injectable()
export class OrderController {
  @inject('EventService')
  eventSv!: EventService;

  @inject('OrderService')
  orderSv!: OrderService;

  @GET('/v1/pdf/receipts')
  async getReceiptOrder(@ContextRequest request: express.Request<any, any, IOrderRequestParams>) {
    const data = {
      title: 'PDF Generation Example',
      message: 'This is a dynamically generated PDF using a Handlebars template.',
      details: ['Item 1', 'Item 2', 'Item 3'],
      date: new Date().toLocaleDateString(),
    };
    const templatePath = path.join('src/templates', 'orders/receipts.html');
    const pdfHelper = new PdfHelper(templatePath);

    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const baseFileName = `Order-0001-${timestamp}`;

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
