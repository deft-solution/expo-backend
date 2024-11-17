import * as express from 'express';
import { inject, injectable } from 'inversify';
import mongoose, { FilterQuery } from 'mongoose';

import { Authorization, ContextRequest, Controller, GET, NotFoundError, POST, PUT } from '../../packages';
import { BadRequestError } from '../../packages/REST/errors/exceptions/BadRequestError';
import { ErrorCode } from '../enums/ErrorCode';
import { IEvents } from '../models';
import { EventService, UserService } from '../services';
import { Pagination } from '../utils/Pagination';
import { IResponseList } from '../utils/Paginator';

@Controller('/events')
@injectable()
export class EventController {
  @inject('EventService')
  eventSv!: EventService;

  @inject('UserService')
  userSv!: UserService;

  @GET('/v1/list')
  @Authorization
  async getAllEvent(@ContextRequest request: express.Request): Promise<IResponseList<IEvents>> {
    const pagination = new Pagination(request).getParam();
    const { name } = request.query;
    const filter: FilterQuery<IEvents> = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const events = await this.eventSv.getAllWithPaginationAndFilter(pagination, filter, { createdAt: 'desc' });
    return events;
  }

  @GET('/v1/on-going')
  @Authorization
  async getAllActiveAndUpcoming(@ContextRequest request: express.Request): Promise<IResponseList<IEvents>> {
    const pagination = new Pagination(request).getParam();
    const { name } = request.query;
    const filter: FilterQuery<IEvents> = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const events = await this.eventSv.getActiveWithUpComingEvent(pagination, filter, { createdAt: 'desc' });
    return events;
  }

  @GET('/v1/autocomplete')
  @Authorization
  async getAllForAutoComplete(@ContextRequest req: express.Request<any, any, IEvents>): Promise<IEvents[]> {
    const { name } = req.query;

    const filter: FilterQuery<IEvents> = { isActive: true };

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const response = await this.eventSv.getAllAutoComplete(filter);
    return response;
  }

  @GET('/v1/:id')
  @Authorization
  async findOneById(@ContextRequest request: express.Request<any, any, IEvents>): Promise<IEvents> {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundError('This event doesn`t existed.', ErrorCode.EventDoesNotExisted);
    }
    const event = await this.eventSv.findOneById(id);
    if (!event) {
      throw new NotFoundError('This event doesn`t existed.', ErrorCode.EventDoesNotExisted);
    }
    return event;
  }

  @GET('/v1/guest/:id')
  async findOneByIdForGuest(@ContextRequest request: express.Request<any, any, IEvents>): Promise<IEvents> {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new NotFoundError('This event doesn`t existed.', ErrorCode.EventDoesNotExisted);
    }

    const event = await this.eventSv.findActiveOneById(id);
    if (!event) {
      throw new NotFoundError('This event doesn`t existed.', ErrorCode.EventDoesNotExisted);
    }

    return event;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateOneById(@ContextRequest request: express.Request<any, any, IEvents>): Promise<IEvents> {
    const { id } = request.params;
    const response = (await this.eventSv.findOneByIdAndUpdate(id, request.body)) as IEvents;
    if (!response) {
      throw new NotFoundError('This event doesn`t existed.', ErrorCode.EventDoesNotExisted);
    }
    return response;
  }

  @POST('/v1/create')
  @Authorization
  async createEvent(@ContextRequest request: express.Request<any, any, IEvents>): Promise<IEvents> {
    if (!request.userId) {
      throw new BadRequestError('Invalid User');
    }
    const param = request.body;
    const user = await this.userSv.findByIdActive(request.userId);
    if (!user) {
      throw new BadRequestError('User does not existed.', ErrorCode.UserDoesNotExist);
    }
    param['createdBy'] = user;
    const event = await this.eventSv.create(param);
    return event;
  }
}
