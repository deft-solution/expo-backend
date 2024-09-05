import { injectable } from 'inversify';
import mongoose from 'mongoose';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import Booth, { IBooth } from '../models/Booth';
import Exhibitors from '../models/Exhibitor';

export interface BoothService extends BaseService<IBooth> {
  createTrx: (data: Partial<IBooth>) => Promise<IBooth>;
  createdTrx: (data: Partial<IBooth>) => Promise<IBooth>;
}

@injectable()
export class BoothServiceImpl extends BaseServiceImpl<IBooth> implements BoothService {

  model = Booth;

  constructor() {
    super();
  }

  async createTrx(data: Partial<IBooth>): Promise<IBooth> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

      const booth = await this.create(data, { session });

      await Exhibitors.findByIdAndUpdate(data.exhibitor, { $push: { booths: booth.id } }, { new: true, session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      return booth;

    } catch (error) {
      // Abort the transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async createdTrx(data: Partial<IBooth>) {
    try {
      const a = await new TransactionManager().runs(async (session) => {
        const booth = await this.create(data, { session });
        await Exhibitors.findByIdAndUpdate(data.exhibitor, { $push: { booths: booth.id } }, { new: true, session });
        return booth;
      });

      return a
    } catch (error) {
      throw error;
    }
  }
}