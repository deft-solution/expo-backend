import { injectable } from 'inversify';

import { IEvents } from '../models';
import EventModel from '../models/Event';

export interface EventService {
  create: (event: IEvents) => Promise<IEvents>;
}

@injectable()
export class EventServiceImpl implements EventService {

  async create(event: IEvents): Promise<IEvents> {
    const response = await new EventModel(event).save();
    return response
  }
}