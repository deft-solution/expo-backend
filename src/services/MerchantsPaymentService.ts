import { injectable } from 'inversify';
import { Types } from 'mongoose';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { IMerchantPayment, MerchantPayment } from '../models/Payment';

export interface MerchantPaymentService extends BaseService<IMerchantPayment> {
  findOneByIDWithPopulated: (id: string) => Promise<IMerchantPayment | null>;
}

@injectable()
export class MerchantPaymentServiceImpl extends BaseServiceImpl<IMerchantPayment> implements MerchantPaymentService {
  model = MerchantPayment;

  constructor() {
    super();
  }
  async findOneByIDWithPopulated(id: string): Promise<IMerchantPayment | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }

    return MerchantPayment.findById(id)
      .populate([{ path: 'merchant.refId' }, { path: 'createdBy' }])
      .exec();
  }
}
