import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import { IEvents } from '../models';
import EventModel from '../models/Event';
import { IResponseList, Paginator } from '../utils/Paginator';

export interface EventService {
  getAll: () => Promise<IEvents[]>;
  getAllWithPagination: (offset: number, limit: number, filter?: FilterQuery<IEvents>) => Promise<IResponseList<IEvents>>;
  create: (event: IEvents) => Promise<IEvents>;
  findOneById: (id: string) => Promise<IEvents | null>;
  updateOneById: (id: string, param: IEvents) => Promise<IEvents | null>;
}

@injectable()
export class EventServiceImpl implements EventService {

  async getAll(): Promise<IEvents[]> {
    const response = await EventModel.find();
    return response
  }

  async getAllWithPagination(offset: number, limit: number, filter: FilterQuery<IEvents> = {}): Promise<IResponseList<IEvents>> {
    if (filter.name) {
      filter['name'] = { $regex: filter['name'], $options: 'i' };
    }
    const data = await EventModel.find(filter).skip(offset).limit(limit).exec();
    const total = await EventModel.countDocuments(filter).exec();


    const response = await new Paginator<IEvents>(data, total, offset, limit).paginate();
    return response;
  }

  async create(event: IEvents): Promise<IEvents> {
    const response = await new EventModel(event).save();
    return response
  }

  async findOneById(id: string) {
    const response = await EventModel.findOne({ _id: id });
    return response
  }

  async updateOneById(id: string, param: IEvents): Promise<IEvents | null> {
    const response = await EventModel.findOneAndUpdate({ _id: id }, param);
    return response
  }
}