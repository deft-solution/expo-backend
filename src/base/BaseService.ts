import { injectable } from 'inversify';
import mongoose, {
    ClientSession, Document, FilterQuery, Model, SaveOptions, UpdateQuery
} from 'mongoose';
import { IPagination, IResponseList } from 'src/utils/Paginator';

import { Paginator } from '../utils/Paginator';

export interface BaseService<T extends Document> {
  create: (data: Partial<T>) => Promise<T>;
  findOneById: (id: string) => Promise<T | null>;
  findOneByIdAndUpdate: (id: mongoose.Types.ObjectId, data: UpdateQuery<T>) => Promise<T | null>;
  getAllWithPagination: (pagination: IPagination, query: FilterQuery<T>, orderObject?: any) => Promise<IResponseList<T>>
  getAllAutoComplete: (query?: FilterQuery<T>, columns?: string[]) => Promise<T[]>
}

@injectable()
export class BaseServiceImpl<T extends Document> implements BaseService<T> {
  model!: Model<T>;

  async create(data: Partial<T>, options?: SaveOptions): Promise<T> {
    const document = new this.model(data);
    return await document.save(options);
  }

  async findOneById(id: string): Promise<T | null> {
    const data = await this.model.findById(id);
    return data;
  };

  async findOneByIdAndUpdate(id: mongoose.Types.ObjectId, data: UpdateQuery<T>, session: ClientSession | null = null): Promise<T | null> {
    const document = await this.model.findByIdAndUpdate(id, data, { new: true, session }).exec();
    return document;
  }

  async getAllAutoComplete(query: FilterQuery<T> = {}, columns = ['id', 'name']) {
    const filter: FilterQuery<T> = {};

    if (query) {
      Object.assign(filter, query)
    }

    const documents = await this.model.find(filter).select(columns).exec();
    return documents;
  }

  async getAllWithPagination(pagination: IPagination, query: FilterQuery<T>, orderObject: any = {}): Promise<IResponseList<T>> {
    const { limit, offset } = pagination
    const filter: FilterQuery<T> = {};
    Object.assign(orderObject, { startFrom: 1 })

    if (query) {
      Object.assign(filter, query)
    }

    const data = await this.model.find(filter).sort(orderObject).skip(offset).limit(limit).exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<T>(data, total, offset, limit).paginate();
    return response;
  }
}