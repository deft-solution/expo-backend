import * as express from 'express';
import { GenericParamsChecker, ValidationRulesMap } from '../helpers/ValidationParamHelper';
import { MAX_QUANTITY } from '../contants/Order';
import { PaymentMethod } from '../enums/Payment';

// Define the interface
export interface IOrderedCalculated {
  event: string;
  booths: IOrderBooths[];
}

export interface IOrderRequestParams {
  event: string; // Machine is represented as an ObjectId in string format
  firstName: string;
  lastName: string;
  phoneNumber: string;
  companyName: string | null;
  nationality: string | null;
  patentUrl: string | null;
  paymentMethod: PaymentMethod;
  email: string;
  note: string | null;
  booths: IOrderBooths[];
}

export interface IOrderBooths {
  quantity: number;
  boothId: string;
}

export function validateCalucatedParam(
  req: express.Request<any, any, IOrderedCalculated>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const rules: ValidationRulesMap<IOrderedCalculated> = {
      event: { isRequired: true, isObjectId: true, type: 'string' },
      booths: {
        isArray: true,
        minLength: 1,
        itemRules: {
          boothId: { isRequired: true, isObjectId: true, type: 'string' },
          quantity: {
            isRequired: true,
            type: 'number',
            isPositiveInteger: true,
            maxQuantity: MAX_QUANTITY,
          },
        },
      },
    };
    new GenericParamsChecker(req, rules);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateOrderParam(
  req: express.Request<any, any, IOrderRequestParams>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const rules: ValidationRulesMap<IOrderRequestParams> = {
      event: { isRequired: true, isObjectId: true, type: 'string' },
      firstName: { isRequired: true, type: 'string' },
      lastName: { isRequired: true, type: 'string' },
      phoneNumber: { isRequired: true, type: 'string' },
      email: { isRequired: true, type: 'string' },
      companyName: { isRequired: false, type: 'string' },
      patentUrl: { isRequired: false, type: 'string', allowNull: true },
      nationality: { isRequired: false, type: 'string' },
      paymentMethod: { isRequired: true, type: 'number', enumValues: Object.values(PaymentMethod) },
      note: { isRequired: false, type: 'string' },
      booths: {
        isArray: true,
        minLength: 1,
        itemRules: {
          boothId: { isRequired: true, isObjectId: true, type: 'string' },
          quantity: {
            isRequired: true,
            type: 'number',
            isPositiveInteger: true,
            maxQuantity: MAX_QUANTITY,
          },
        },
      },
    };
    new GenericParamsChecker(req, rules);
    next();
  } catch (error) {
    next(error);
  }
}
