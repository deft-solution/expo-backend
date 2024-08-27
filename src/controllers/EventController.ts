import * as express from 'express';
import { inject, injectable } from 'inversify';
import { IEvents } from 'src/models';

import {
  Authorization, ContextRequest, Controller, GET, NotFoundError, POST, PUT
} from '../../packages';
import { BadRequestError } from '../../packages/REST/errors/exceptions/BadRequestError';
import { EventService, UserService } from '../services';

@Controller('/event')
@injectable()
export class EventController {

  @inject('EventService')
  eventService!: EventService;

  @inject('UserService')
  userService!: UserService;

  @GET('/v1/list')
  @Authorization
  async getAllEvent(): Promise<IEvents[]> {
    const event = await this.eventService.getAll();
    return event;
  }

  @GET('/v1/:id')
  @Authorization
  async findOneById(
    @ContextRequest request: express.Request<any, any, IEvents>,
  ): Promise<IEvents> {
    const { id } = request.params;
    const event = await this.eventService.findOneById(id);
    if (!event) {
      throw new NotFoundError('This id doesn`t existed.')
    }
    return event;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateOneById(
    @ContextRequest request: express.Request<any, any, IEvents>,
  ): Promise<IEvents> {
    const { id } = request.params;
    const param = request.body;
    const event = await this.eventService.findOneById(id);
    if (!event) {
      throw new NotFoundError('This id doesn`t existed.')
    }
    const response = await this.eventService.updateOneById(id, param)
    return response;
  }

  @POST('/v1/create')
  @Authorization
  async createEvent(
    @ContextRequest request: express.Request<any, any, IEvents>,
  ): Promise<IEvents> {
    if (!request.userId) {
      throw new BadRequestError('Invalid User');
    }
    const param = request.body;
    const user = await this.userService.findByIdActive(request.userId);
    param['createdBy'] = user;
    const event = await this.eventService.create(param);
    return event;
  }
}