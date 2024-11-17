import * as express from 'express';
import { inject, injectable } from 'inversify';

import { ContextRequest, Controller, Middleware, NotFoundError, POST } from '../../packages';
import { IOrderRequestParams, validateOrderParam } from '../middlewares/ValidateOrderParam';
import { EventService, OrderService } from '../services';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus } from '../enums/Order';
import { PUT } from '../../packages/REST/decorators/methods';

@Controller('/orders')
@injectable()
export class OrderController {
  @inject('EventService')
  eventSv!: EventService;

  @inject('OrderService')
  orderSv!: OrderService;

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
      throw new NotFoundError('We dont have this order yet.', ErrorCode.WeDontHaveThisOrderYet);
    }
    //
    await this.orderSv.signOrderIsCompleted(order);
  }
}
