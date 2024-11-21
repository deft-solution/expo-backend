import { inject, injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { IBoothType } from 'src/models/BoothType';

import { BadRequestError, MissingParamError } from '../../packages';
import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import Booth, { BoothTemplateExcel, IBooth } from '../models/Booth';
import { IPagination, IResponseList, Paginator } from '../utils/Paginator';
import { BoothTypeService } from './BoothTypeService';
import { EventService } from './EventService';

export interface BoothService extends BaseService<IBooth> {
  createTrx: (data: Partial<IBooth>) => Promise<IBooth>;
  getAllBoothByEventId: (eventId: string) => Promise<IBooth[]>;
  createBatchByTemplateXlsx: (booths: BoothTemplateExcel[], userId: string) => Promise<void>;
  getAllWithPagination: (
    pagination: IPagination,
    query: FilterQuery<IBooth>,
    orderObject?: any,
  ) => Promise<IResponseList<IBooth>>;
}

@injectable()
export class BoothServiceImpl extends BaseServiceImpl<IBooth> implements BoothService {
  model = Booth;

  @inject('EventService')
  eventSv!: EventService;

  @inject('BoothTypeService')
  boothTypeSv!: BoothTypeService;

  constructor() {
    super();
  }

  async getAllBoothByEventId(eventId: string) {
    const query = await Booth.find({ event: eventId, isActive: true }).populate('boothType');
    return query;
  }

  async createTrx(data: Partial<IBooth>) {
    try {
      const result = await new TransactionManager().runs(async (session) => {
        const booth = await this.create(data, { session });
        return booth;
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllWithPagination(
    pagination: IPagination,
    query: FilterQuery<IBooth>,
    orderObject: any = {},
  ): Promise<IResponseList<IBooth>> {
    const { limit, offset } = pagination;
    const filter: FilterQuery<IBooth> = {};
    Object.assign(orderObject, { startFrom: 1 });

    if (query) {
      Object.assign(filter, query);
    }

    const data = await this.model
      .find(filter)
      .populate('event')
      .populate('boothType')
      .sort(orderObject)
      .skip(offset)
      .limit(limit)
      .exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<IBooth>(data, total, offset, limit).paginate();
    return response;
  }

  async createBatchByTemplateXlsx(booths: BoothTemplateExcel[], userId: string): Promise<any> {
    const response = await new TransactionManager().runs(async (session) => {
      let result: any = [];

      // Initialize the first resolved promise as a starting point
      let chain = Promise.resolve();

      // Process each booth one by one by chaining promises
      for (let i = 0; i < booths.length; i++) {
        chain = chain.then(async () => {
          const booth = booths[i]; // Access booth by index
          const eventName = booth['Event Name']?.trim() ?? ''; // Trim leading and trailing spaces
          const boothName = booth['Booth Name']?.trim() ?? ''; // Trim leading and trailing spaces
          const boothNumber = booth['Booth Number'];
          // Find the event by its name
          const event = await this.eventSv.findOneByName(eventName, session);

          if (!event) {
            throw new BadRequestError(`Event of rows ${i} ${eventName} does not exist!`);
          }
          if (!boothNumber) {
            throw new MissingParamError('Booth Number');
          }

          // Check if the booth number already exists
          const existingBooth = await this.findByBoothNumber(boothNumber, event.id, session);
          if (existingBooth) {
            return; // Skip creating the booth if it already exists
          }

          // Example of boothType processing (commented out, but you can include as needed)
          const boothTypeData: Partial<IBoothType> = {
            name: booth['Booth Type'],
            price: booth.Price,
            createdBy: userId as any,
            description: booth.Description,
          };
          const boothType = await this.boothTypeSv.createBoothTypeIfAbsent(boothTypeData, session);

          // Example of booth creation (commented out, but you can include as needed)
          const boothData: Partial<IBooth> = {
            boothNumber,
            boothName,
            hall: booth.Hall,
            event: event.id,
            boothType: boothType.id,
            createdBy: userId as any,
            price: booth.Price,
            size: booth.Size,
            mapUrl: null,
            externalId: booth['External ID'],
          };
          const boothResponse = await this.create(boothData, { session });

          result.push(boothResponse); // Or you can push boothResponse here
        });
      }

      // Wait for all promises in the chain to resolve
      await chain;

      return result; // Return the result after processing all booths sequentially
    });

    return response; // Return the final response
  }

  async findByBoothNumber(boothNumber: string, event: string, session: any): Promise<IBooth | null> {
    return this.model.findOne({ boothNumber, event }).session(session).exec();
  }
}
