import * as express from 'express';
import { inject, injectable } from 'inversify';
import { IEvents } from 'src/models';
import { EventService, UserService } from 'src/services';

import { Authorization, ContextRequest, Controller, POST } from '../../packages';
import { BadRequestError } from '../../packages/REST/errors/exceptions/BadRequestError';

@Controller('/event')
@injectable()
export class EventController {

  @inject('EventService')
  eventService!: EventService;

  @inject('UserService')
  userService!: UserService;

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