import { inject, injectable } from 'inversify';

import { Controller, GET } from '../../packages';
import { Baby } from '../models/Baby';
import { BabyService } from '../services';

@Controller('/warrior')
@injectable()
export class WarriorController {
  @inject('BabyService')
  babySv!: BabyService;

  @GET('/v1/list')
  async getAllBaby(): Promise<{ message: string }> {
    const message = await this.babySv.letPlay([{ id: 1 }, { id: 2 }, { id: 3 }]);
    return { message };
  }

  @GET('/v2/list')
  getAllBabyV2(): Baby[] {
    return [{ id: 1 }, { id: 2 }, { id: 3 }];
  }
}
