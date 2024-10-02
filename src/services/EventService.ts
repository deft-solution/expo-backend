import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { IEvents } from '../models';
import EventModel from '../models/Event';
import { IPagination, IResponseList, Paginator } from '../utils/Paginator';

export interface EventService extends BaseService<IEvents> {
  findActiveOneById: (id: string) => Promise<IEvents | null>;
  getActiveWithUpComingEvent: (pagination: IPagination, query: FilterQuery<IEvents>, orderObject?: any) => Promise<IResponseList<IEvents>>
}

@injectable()
export class EventServiceImpl extends BaseServiceImpl<IEvents> implements EventService {

  model = EventModel;

  constructor() {
    super();
  }

  async findActiveOneById(id: string): Promise<IEvents | null> {
    const query = await this.model.findOne({ _id: id, isActive: true });
    return query;
  }

  async getActiveWithUpComingEvent(pagination: IPagination, query: FilterQuery<IEvents>, orderObject: any = {}): Promise<IResponseList<IEvents>> {
    const { limit, offset } = pagination
    const filter: FilterQuery<IEvents> = {
      isActive: true,
      endDate: { $gte: new Date() },
    };

    if (query) {
      Object.assign(filter, query)
    }

    const data = await this.model.find(filter).sort(orderObject).skip(offset).limit(limit).exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<IEvents>(data, total, offset, limit).paginate();
    return response;

  }
}