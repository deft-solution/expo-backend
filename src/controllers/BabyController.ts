import express from 'express';
import { inject, injectable } from 'inversify';

import { Authorization, ContextRequest, Controller, GET, Middleware } from '../../packages';
import { loggerA, loggerB, loggerC } from '../middlewares';
import { Baby } from '../models/Baby';
import { BabyService } from '../services';

@Controller('/baby')
@injectable()
export class BabyController {

  @inject('BabyService')
  babySv!: BabyService;

  @GET('/v1/list')
  @Middleware(loggerA)
  @Authorization
  async getAllBaby(
    @ContextRequest req: express.Request,
  ): Promise<{ message: string }> {
    return { message: req.body.message ?? '' };
  }

  @GET('/v2/list')
  @Middleware([loggerB, loggerC])
  getAllBabyV2(): Baby[] {
    return [{ id: 1, }, { id: 2, }, { id: 3, }]
  }
}