import { injectable } from 'inversify';
import { UpdateWriteOpResult } from 'mongoose';

import { IEvents } from '../models';
import EventModel from '../models/Event';

export interface EventService {
  getAll: () => Promise<IEvents[]>;
  create: (event: IEvents) => Promise<IEvents>;
  findOneById: (id: string) => Promise<IEvents | null>;
  updateOneById: (id: string, param: IEvents) => Promise<UpdateWriteOpResult>;
}

@injectable()
export class EventServiceImpl implements EventService {

  async getAll(): Promise<IEvents[]> {
    const response = await EventModel.find();
    return response
  }

  async create(event: IEvents): Promise<IEvents> {
    const response = await new EventModel(event).save();
    return response
  }

  async findOneById(id: string) {
    const response = await EventModel.findOne({ _id: id });
    return response
  }

  async updateOneById(id: string, param: IEvents): Promise<UpdateWriteOpResult> {
    const response = await EventModel.findOneAndUpdate({ _id: id }, param);
    return response
  }
}