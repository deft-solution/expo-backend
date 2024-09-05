import { injectable } from 'inversify';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import BoothType, { IBoothType } from '../models/BoothType';

export interface BoothTypeService extends BaseService<IBoothType> { }

@injectable()
export class BoothTypeServiceImpl extends BaseServiceImpl<IBoothType> implements BoothTypeService {

  model = BoothType;

  constructor() {
    super();
  }
}