import { injectable } from 'inversify';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import BoothType, { IBoothType } from '../models/BoothType';
import { trim } from 'lodash';
import { ClientSession } from 'mongoose';
import { MissingParamError } from '../../packages';

export interface BoothTypeService extends BaseService<IBoothType> {
  createBoothTypeIfAbsent: (param: Partial<IBoothType>, session: ClientSession) => Promise<IBoothType>;
  findOneByName: (name: string, session: ClientSession) => Promise<IBoothType | null>;
}

@injectable()
export class BoothTypeServiceImpl extends BaseServiceImpl<IBoothType> implements BoothTypeService {
  model = BoothType;

  constructor() {
    super();
  }

  async createBoothTypeIfAbsent(param: Partial<IBoothType>, session: ClientSession) {
    // Ensure that booth name is provided
    if (!param.name) {
      throw new MissingParamError('Booth Type');
    }

    // Attempt to find an existing booth type by name
    let booth = await this.findOneByName(param.name, session);

    // If the booth exists, return it
    if (booth) {
      return booth;
    }

    // If the booth doesn't exist, create and save a new booth type
    try {
      booth = await new BoothType(param).save({ session });
      return booth;
    } catch (error) {
      // Handle any potential save errors, such as validation errors
      throw new Error('Failed to create new Booth Type');
    }
  }

  async findOneByName(name: string, session: ClientSession): Promise<IBoothType | null> {
    const event = await this.model
      .findOne({
        name: {
          $regex: `^${trim(name)}$`, // Match the exact event name
          $options: 'i', // Case-insensitive match
        },
      })
      .session(session);
    return event;
  }
}
