import { Request } from 'express';
import { inject, injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import {
  Authorization,
  BadRequestError,
  ContextRequest,
  Controller,
  DELETE,
  GET,
  NotFoundError,
  POST,
  PUT,
} from '../../packages';
import { Currency } from '../enums/Currency';
import { ErrorCode } from '../enums/ErrorCode';
import { MerchantPaymentType } from '../enums/Payment';
import { GenericParamsChecker } from '../helpers/ValidationParamHelper';
import { IMerchantPaymentValidation } from '../interfaces/MerchantPayments';
import { IMerchantPayment } from '../models/Payment';
import { UserService } from '../services';
import { EventService } from '../services/EventService';
import { MerchantPaymentService } from '../services/MerchantsPaymentService';
import { Pagination } from '../utils/Pagination';

@injectable()
@Controller('/merchants-payment')
export class MerchantPaymentController {
  @inject('MerchantPaymentService')
  merchantPaymentSv!: MerchantPaymentService;

  @inject('EventService')
  eventSv!: EventService;

  @inject('UserService')
  userSv!: UserService;

  @GET('/v1/admin/list')
  @Authorization
  async getAllPagination(@ContextRequest request: Request<any, any, IMerchantPayment>) {
    const { merchant, currency, isActive, isDefault } = request.query;
    const pagination = new Pagination(request).getParam();
    const filter: FilterQuery<IMerchantPayment> = {};

    if (merchant) {
      Object.assign(filter, { 'merchant.refId': merchant });
    }

    if (isActive) {
      filter.isActive = isActive === 'true';
    }

    if (isDefault) {
      filter.isDefault = isDefault === 'true';
    }

    if (currency) {
      Object.assign(filter, { currency });
    }

    const populate = [
      {
        path: 'merchant.refId', // Populate the `refId`
      },
      {
        path: 'createdBy', // Populate the `refId`
      },
    ];

    const data = await this.merchantPaymentSv.getAllWithPaginationAndFilter(pagination, filter, {}, populate as any);
    return data;
  }

  @GET('/v1/:id')
  @Authorization
  async findOneByID(@ContextRequest request: Request<any, any, IMerchantPayment>) {
    const { id } = request.params;
    const merchantPayment = await this.merchantPaymentSv.findOneByIDWithPopulated(id);
    if (!merchantPayment) {
      throw new NotFoundError('This Merchant Payment does not existed', ErrorCode.MerchantPaymentDoesNotExisted);
    }
    return merchantPayment;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateMerchantPaymentByID(@ContextRequest request: Request<any, any, IMerchantPayment>) {
    const { id } = request.params;
    let merchantPayment = await this.merchantPaymentSv.findOneById(id);
    if (!merchantPayment) {
      throw new NotFoundError('This Merchant Payment does not existed', ErrorCode.MerchantPaymentDoesNotExisted);
    }

    const validation = new GenericParamsChecker<IMerchantPaymentValidation>(request as Request, {
      phoneNumber: { isRequired: true, type: 'string' },
      accountId: { isRequired: true, type: 'string' },
      merchantName: { isRequired: true, type: 'string' },
      currency: { isRequired: true, type: 'string', enumValues: Object.values(Currency) },
      merchantType: { isRequired: true, type: 'string', enumValues: Object.values(MerchantPaymentType) },
      storeLabel: { isRequired: true, type: 'string' },
      merchant: { isRequired: true, type: 'string', isObjectId: true },
      tag: { allowNull: true, type: 'string' },
      note: { allowNull: true, type: 'string' },
      isActive: { type: 'boolean', isRequired: true },
      isDefault: { type: 'boolean', isRequired: true },
    });
    const params = validation.getParams();

    const data: Partial<IMerchantPayment> = {
      phoneNumber: params.phoneNumber,
      accountId: params.accountId,
      merchantName: params.merchantName,
      currency: params.currency,
      storeLabel: params.storeLabel,
      tag: params.tag,
      note: params.note,
      isActive: params.isActive,
      isDefault: params.isDefault,
      createdAt: new Date(),
    };

    if (params.merchantType === 'Event') {
      const event = await this.eventSv.findActiveOneById(params.merchant);
      if (!event) {
        throw new BadRequestError('This Merchant does not existed', ErrorCode.EventDoesNotExisted);
      }
      data['merchant'] = {
        refType: 'Event',
        refId: event.id,
      };
    }

    merchantPayment = await this.merchantPaymentSv.findOneByIdAndUpdate(merchantPayment.id, data, { new: true });
    return merchantPayment;
  }

  @POST('/v1/create')
  @Authorization
  async createMerchantPayment(@ContextRequest request: Request<any, any, IMerchantPayment>) {
    const user = await this.userSv.findByIdActive(request.userId as string);
    if (!user) {
      throw new BadRequestError('User Does not existed', ErrorCode.UserDoesNotExist);
    }

    const validation = new GenericParamsChecker<IMerchantPaymentValidation>(request as Request, {
      phoneNumber: { isRequired: true, type: 'string' },
      accountId: { isRequired: true, type: 'string' },
      merchantName: { isRequired: true, type: 'string' },
      currency: { isRequired: true, type: 'string', enumValues: Object.values(Currency) },
      merchantType: { isRequired: true, type: 'string', enumValues: Object.values(MerchantPaymentType) },
      storeLabel: { isRequired: true, type: 'string' },
      merchant: { isRequired: true, type: 'string', isObjectId: true },
      tag: { allowNull: true, type: 'string' },
      note: { allowNull: true, type: 'string' },
      isActive: { type: 'boolean', isRequired: true },
      isDefault: { type: 'boolean', isRequired: true },
    });
    const params = validation.getParams();

    const data: Partial<IMerchantPayment> = {
      phoneNumber: params.phoneNumber,
      accountId: params.accountId,
      merchantName: params.merchantName,
      currency: params.currency,
      storeLabel: params.storeLabel,
      tag: params.tag,
      note: params.note,
      isActive: params.isActive,
      isDefault: params.isDefault,
      createdAt: new Date(),
      createdBy: user,
    };

    if (params.merchantType === 'Event') {
      const event = await this.eventSv.findActiveOneById(params.merchant);
      if (!event) {
        throw new BadRequestError('This Merchant does not existed', ErrorCode.EventDoesNotExisted);
      }
      data['merchant'] = {
        refType: 'Event',
        refId: event.id,
      };
    }

    const merchantPayment = await this.merchantPaymentSv.create(data);
    return merchantPayment;
  }

  @DELETE('/v1/:id')
  @Authorization
  async deleteOneByID(@ContextRequest request: Request<any, any, IMerchantPayment>) {
    const { id } = request.params;
    await this.merchantPaymentSv.deleteOneById(id);
  }
}
