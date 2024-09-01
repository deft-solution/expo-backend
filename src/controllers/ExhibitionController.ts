import express from 'express';
import { inject, injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import {
    Authorization, ContextRequest, Controller, GET, NotFoundError, POST, PUT
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { IExhibitor } from '../models';
import { ExhibitionService } from '../services';
import { Pagination } from '../utils/Pagination';
import { IResponseList } from '../utils/Paginator';

@Controller('/exhibition')
@injectable()
export class ExhibitionController {

  @inject('ExhibitionService')
  exhibitionService!: ExhibitionService

  @GET('/v1/list')
  @Authorization
  async getAllWithPagination(
    @ContextRequest req: express.Request<any, any, IExhibitor>,
  ): Promise<IResponseList<IExhibitor>> {
    const { name, tags } = req.query;
    const { limit, offset } = new Pagination(req).getParam();

    const filter: FilterQuery<IExhibitor> = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } })
    }

    if (tags?.length) {
      Object.assign(filter, { tags: { $in: tags } })
    }

    const response = await this.exhibitionService.getAllWithPagination({ offset, limit }, filter, { createdAt: 'desc' });
    return response;
  }

  @GET('/v1/:id')
  @Authorization
  async findExhibitionById(
    @ContextRequest req: express.Request<any, any, IExhibitor>,
  ): Promise<IExhibitor> {
    const { id } = req.params;
    const response = await this.exhibitionService.findOneById(id);
    if (!response) {
      throw new NotFoundError('Exhibition does not existed', ErrorCode.ExhibitionDoesNotExisted)
    }

    return response;
  }

  @POST('/v1/create')
  @Authorization
  async createExhibition(
    @ContextRequest req: express.Request<any, any, IExhibitor>,
  ): Promise<IExhibitor> {
    req.body['createdBy'] = req.userId;
    const response = await this.exhibitionService.create(req.body);
    return response;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateExhibition(
    @ContextRequest req: express.Request<any, any, IExhibitor>,
  ): Promise<IExhibitor> {
    const response = await this.exhibitionService.findOneByIdAndUpdate(req.body);
    if (!response) {
      throw new NotFoundError('Exhibition does not existed', ErrorCode.ExhibitionDoesNotExisted)
    }
    return response;
  }
}