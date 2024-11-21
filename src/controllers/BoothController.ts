import express from 'express';
import { inject, injectable } from 'inversify';
import mongoose, { FilterQuery, Types } from 'mongoose';

import {
  Authorization, BadRequestError, ContextRequest, Controller, GET, Middleware, MissingParamError,
  NotFoundError, POST, PUT
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { ExcelHelper } from '../helpers/ExcelHelper';
import Multer from '../middlewares/multer';
import { BoothTemplateExcel, IBooth } from '../models/Booth';
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
  async getAllBooths(@ContextRequest request: express.Request): Promise<IResponseList<IBooth>> {
    const pagination = new Pagination(request).getParam();
    const { eventId, name } = request.query;

    const filter: FilterQuery<IBooth> = {};

    if (eventId) {
      Object.assign(filter, { event: eventId });
    }

    if (name) {
      Object.assign(filter, { boothName: { $regex: name, $options: 'i' } });
    }

    const booths = await this.boothSv.getAllWithPagination(pagination, filter, { createdAt: 'desc' });
    return booths;
  }

  @GET('/v1/guest/:eventId')
  async getAllBoothsByEventID(@ContextRequest request: express.Request): Promise<IBooth[]> {
    const { eventId } = request.params;
    if (!mongoose.isValidObjectId(eventId)) {
      throw new NotFoundError('We don`t have booth for this event yet.');
    }

    const booths = await this.boothSv.getAllBoothByEventId(eventId);
    return booths;
  }

  @GET('/v1/autocomplete')
  @Authorization
  async getAllBoothsAutoComplete(@ContextRequest request: express.Request): Promise<IBooth[]> {
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
  async findOneById(@ContextRequest request: express.Request): Promise<IBooth> {
    const { id } = request.params;
    const item = await this.boothSv.findOneById(id);
    if (!item) {
      throw new BadRequestError('This booths does not existed', ErrorCode.BoothDoesNotExisted);
    }
    return item;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateOneById(@ContextRequest request: express.Request<any, any, IBooth>): Promise<IBooth> {
    const { id } = request.params;
    const item = await this.boothSv.findOneByIdAndUpdate(id, request.body);
    if (!item) {
      throw new BadRequestError('This booths does not existed', ErrorCode.BoothDoesNotExisted);
    }
    return item;
  }

  @POST('/v1/create')
  @Authorization
  async create(@ContextRequest req: express.Request<any, any, IBooth>): Promise<IBooth> {
    if (req.userId) {
      req.body['createdBy'] = new Types.ObjectId(req.userId);
    }

    const booth = await this.boothSv.createTrx(req.body);
    return booth;
  }

  @POST('/v1/xlsx/upload')
  @Authorization
  @Middleware(Multer)
  async uploadFileExcel(@ContextRequest req: express.Request<any, any, IBooth>) {
    const file = req.file;
    if (!file) {
      throw new MissingParamError('file');
    }

    const excelHelper = new ExcelHelper('Sheet1');
    const data = await excelHelper.readFile<BoothTemplateExcel>(file.buffer);

    const result = await this.boothSv.createBatchByTemplateXlsx(data, req.userId as string);
    return result;
  }
}
