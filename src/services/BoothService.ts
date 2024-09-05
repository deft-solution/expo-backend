import { injectable } from 'inversify';
import mongoose from 'mongoose';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import Booth, { IBooth } from '../models/Booth';
import EventModel from '../models/Event';

export interface BoothService extends BaseService<IBooth> {
  createTrx: (data: Partial<IBooth>) => Promise<IBooth>;
}

@injectable()
export class BoothServiceImpl extends BaseServiceImpl<IBooth> implements BoothService {
  model = Booth;

  constructor() {
    super();
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
}