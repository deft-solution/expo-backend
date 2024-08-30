import { injectable } from 'inversify';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import Exhibitors, { IExhibitor } from '../models/Exhibitor';

export interface ExhibitionService extends BaseService<IExhibitor> { }

@injectable()
export class ExhibitionServiceImpl extends BaseServiceImpl<IExhibitor> implements ExhibitionService {

  model = Exhibitors;

  constructor() {
    super();
  }
}