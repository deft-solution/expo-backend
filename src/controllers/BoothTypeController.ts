import express from 'express';
import { inject, injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';

import {
  Authorization, ContextRequest, Controller, GET, NotFoundError, POST, PUT
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { IBoothType } from '../models/BoothType';
import { BoothTypeService } from '../services';
import { Pagination } from '../utils/Pagination';
import { IResponseList } from '../utils/Paginator';

@Controller('/booth-types')
@injectable()
export class BoothTypeController {

  @inject('BoothTypeService')
  boothTypeSv!: BoothTypeService;

  @GET('/v1/list')
  @Authorization
  async getAllBoothType(
    @ContextRequest req: express.Request<any, any, IBoothType>,
  ): Promise<IResponseList<IBoothType>> {
    const pagination = new Pagination(req).getParam();
    const response = await this.boothTypeSv.getAllWithPagination(pagination, {}, { createdAt: 'desc' })
    return response;
  }

  @GET('/v1/autocomplete')
  @Authorization
  async getAllForAutoComplete(
    @ContextRequest req: express.Request<any, any, IBoothType>,
  ): Promise<IBoothType[]> {
    const { name } = req.query;

    const filter: FilterQuery<IBoothType> = { isActive: true };

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const response = await this.boothTypeSv.getAllAutoComplete(filter)
    return response;
  }

  @GET('/v1/:id')
  @Authorization
  async findOneByID(
    @ContextRequest req: express.Request<any, any, IBoothType>,
  ): Promise<IBoothType> {
    const { id } = req.params;
    const response = await this.boothTypeSv.findOneById(id);
    if (!response) {
      throw new NotFoundError('BoothType does not existed', ErrorCode.BoothTypeDoesNotExisted);
    }
    return response;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateBootType(
    @ContextRequest req: express.Request<any, any, IBoothType>,
  ): Promise<IBoothType> {
    const { id } = req.params;
    const response = await this.boothTypeSv.findOneByIdAndUpdate(id, req.body);
    if (!response) {
      throw new NotFoundError('BoothType does not existed', ErrorCode.BoothTypeDoesNotExisted);
    }
    return response;
  }

  @POST('/v1/create')
  @Authorization
  async create(
    @ContextRequest req: express.Request<any, any, IBoothType>,
  ): Promise<IBoothType> {
    if (req.userId) {
      req.body['createdBy'] = new Types.ObjectId(req.userId);
    }
    const response = await this.boothTypeSv.create(req.body)
    return response;
  }
}