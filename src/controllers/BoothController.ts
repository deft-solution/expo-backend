import express from 'express';
import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';

import { Authorization, ContextRequest, Controller, POST } from '../../packages';
import { IBooth } from '../models/Booth';
import { BoothService, ExhibitionService } from '../services';

@Controller('/booths')
@injectable()
export class BoothController {

  @inject('BoothService')
  boothSv!: BoothService;

  @inject('ExhibitionService')
  exhibitionSv!: ExhibitionService;

  @POST('/v1/create')
  @Authorization
  async create(
    @ContextRequest req: express.Request<any, any, IBooth>,
  ): Promise<IBooth> {
    req.body['createdBy'] = req.userId;

    const booth = await this.boothSv.createdTrx(req.body);
    return booth;
  }
}