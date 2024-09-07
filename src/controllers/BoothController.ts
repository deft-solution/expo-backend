import express from 'express';
import { inject, injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import {
  Authorization, BadRequestError, ContextRequest, Controller, GET, POST, PUT
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { IBooth } from '../models/Booth';
import { BoothService, ExhibitionService } from '../services';
import { Pagination } from '../utils/Pagination';
import { IResponseList } from '../utils/Paginator';

@Controller('/booths')
@injectable()
export class BoothController {

  @inject('BoothService')
  boothSv!: BoothService;

  @inject('ExhibitionService')
  exhibitionSv!: ExhibitionService;

  @GET('/v1/list')
  @Authorization
  async getAllBooths(
    @ContextRequest request: express.Request,
  ): Promise<IResponseList<IBooth>> {
    const pagination = new Pagination(request).getParam();

    const booths = await this.boothSv.getAllWithPagination(pagination, {}, { createdAt: 'desc' });
    return booths;
  }

  @GET('/v1/autocomplete')
  @Authorization
  async getAllBoothsAutoComplete(
    @ContextRequest request: express.Request,
  ): Promise<IBooth[]> {
    const { name } = request.query;

    const filter: FilterQuery<IBooth> = { isActive: true };

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const booths = await this.boothSv.getAllAutoComplete(filter, ['id', 'boothNumber']);
    return booths;
  }

  @GET('/v1/:id')
  @Authorization
  async findOneById(
    @ContextRequest request: express.Request,
  ): Promise<IBooth> {
    const { id } = request.params;
    const item = await this.boothSv.findOneById(id);
    if (!item) {
      throw new BadRequestError('This booths does not existed', ErrorCode.BoothDoesNotExisted);
    }
    return item;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateOneById(
    @ContextRequest request: express.Request<any, any, IBooth>,
  ): Promise<IBooth> {
    const { id } = request.params;
    const item = await this.boothSv.findOneByIdAndUpdate(id, request.body);
    if (!item) {
      throw new BadRequestError('This booths does not existed', ErrorCode.BoothDoesNotExisted);
    }
    return item;
  }

  @POST('/v1/create')
  @Authorization
  async create(
    @ContextRequest req: express.Request<any, any, IBooth>,
  ): Promise<IBooth> {
    req.body['createdBy'] = req.userId;

    const booth = await this.boothSv.createTrx(req.body);
    return booth;
  }
}