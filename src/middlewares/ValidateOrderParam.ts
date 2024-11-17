import * as express from 'express';
import { GenericParamsChecker, ValidationRulesMap } from '../helpers/ValidationParamHelper';
import { MAX_PER_ORDER, MAX_QUANTITY } from '../contants/Order';

// Define the interface
export interface IOrderRequestParams {
  event: string; // Machine is represented as an ObjectId in string format
  firstName: string;
  lastName: string;
  phoneNumber: string;
  provider: number;
  paymentCard: string;
  option: string;
  userId: string;
  email: string;
  companyName: string | null;
  patentUrl: string | null;
  nationality: string | null;
  note: string | null;
  booths: IOrderBooths[];
  paymentId: string;
}

export interface IOrderBooths {
  quantity: number;
  boothId: string;
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
      paymentId: { isRequired: true, type: 'string' },
      userId: { isRequired: true, type: 'string' },
      email: { isRequired: true, type: 'string' },
      provider: { isRequired: true, type: 'number' },
      option: { isRequired: true, type: 'string' },
      paymentCard: { isRequired: true, type: 'string' },
      companyName: { isRequired: false, type: 'string' },
      patentUrl: { isRequired: false, type: 'string', allowNull: true },
      nationality: { isRequired: false, type: 'string' },
      note: { isRequired: false, type: 'string' },
      booths: {
        isArray: true,
        minLength: 1,
        maxLength: MAX_PER_ORDER,
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
