import { injectable } from 'inversify';
import { Document, FilterQuery, Model } from 'mongoose';
import { IPagination, IResponseList } from 'src/utils/Paginator';

import { Paginator } from '../utils/Paginator';

export interface BaseService<T extends Document> {
  create: (data: Partial<T>) => Promise<T>;
  findOneById: (id: string) => Promise<T | null>;
  findOneByIdAndUpdate: (data: Partial<T>) => Promise<T | null>;
  getAllWithPagination: (pagination: IPagination, query: FilterQuery<T>, orderObject?: any) => Promise<IResponseList<T>>
}

@injectable()
export class BaseServiceImpl<T extends Document> implements BaseService<T> {
  model!: Model<T>;

  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return await document.save();
  }

  async findOneById(id: string): Promise<T | null> {
    const data = this.model.findById(id);
    return data;
  };

  async findOneByIdAndUpdate(data: Partial<T>): Promise<T | null> {
    const document = await this.model.findByIdAndUpdate(data._id, data).exec();
    return document;
  }

  async getAllWithPagination(pagination: IPagination, query: FilterQuery<T>, orderObject: any = {}): Promise<IResponseList<T>> {
    const { limit, offset } = pagination
    const filter: FilterQuery<T> = {};

    if (query) {
      Object.assign(filter, query)
    }

    const data = await this.model.find(filter).sort(orderObject).skip(offset).limit(limit).exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<T>(data, total, offset, limit).paginate();
    return response;
  }
}