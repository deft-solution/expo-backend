import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import Booth, { IBooth } from '../models/Booth';
import EventModel from '../models/Event';
import { IPagination, IResponseList, Paginator } from '../utils/Paginator';

export interface BoothService extends BaseService<IBooth> {
  createTrx: (data: Partial<IBooth>) => Promise<IBooth>;
  getAllEventId: (eventId: string) => Promise<IBooth[]>;
  getAllWithPagination: (pagination: IPagination, query: FilterQuery<IBooth>, orderObject?: any) => Promise<IResponseList<IBooth>>
}

@injectable()
export class BoothServiceImpl extends BaseServiceImpl<IBooth> implements BoothService {
  model = Booth;

  constructor() {
    super();
  }

  async getAllEventId(eventId: string) {
    const query = await Booth.find({ event: eventId, isActive: true }).populate('boothType');
    return query;
  }

  async createTrx(data: Partial<IBooth>) {
    try {
      const result = await new TransactionManager().runs(async (session) => {
        const booth = await this.create(data, { session });
        await EventModel.findByIdAndUpdate(data.event, { $push: { booths: booth.id } }, { new: true, session });
        return booth;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllWithPagination(pagination: IPagination, query: FilterQuery<IBooth>, orderObject: any = {}): Promise<IResponseList<IBooth>> {
    const { limit, offset } = pagination
    const filter: FilterQuery<IBooth> = {};
    Object.assign(orderObject, { startFrom: 1 })

    if (query) {
      Object.assign(filter, query)
    }

    const data = await this.model.find(filter).populate('event').populate('boothType').sort(orderObject).skip(offset).limit(limit).exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<IBooth>(data, total, offset, limit).paginate();
    return response;
  }
}