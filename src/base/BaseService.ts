import { injectable } from 'inversify';
import { Document, FilterQuery, Model } from 'mongoose';
import { IResponseList } from 'src/utils/Paginator';

import { Paginator } from '../utils/Paginator';

export interface BaseService<T extends Document> {
  create: (data: Partial<T>) => Promise<T>;
  findOneByIdAndUpdate: (data: Partial<T>) => Promise<T | null>;
  getAllWithPagination: (offset: number, limit: number, query: FilterQuery<T>) => Promise<IResponseList<T>>
}

@injectable()
export class BaseServiceImpl<T extends Document> implements BaseService<T> {
  model!: Model<T>;

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async findOneByIdAndUpdate(data: Partial<T>): Promise<T | null> {
    const document = await this.model.findByIdAndUpdate(data._id, data).exec();
    return document;
  }

  async getAllWithPagination(offset: number, limit: number, query: FilterQuery<T>): Promise<IResponseList<T>> {
    const filter: FilterQuery<T> = {};

    if (query) {
      Object.assign(filter, query)
    }

    const data = await this.model.find(filter).skip(offset).limit(limit).exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<T>(data, total, offset, limit).paginate();
    return response;
  }
}