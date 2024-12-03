import { Document, model, Schema, Types } from 'mongoose';

import { Currency } from '../enums/Currency';
import { IUser } from './User';

export interface IMerchantPayment extends Document {
  phoneNumber: string;
  accountId: string;
  merchantName: string;
  tag: string;
  currency: Currency;
  storeLabel: string;
  merchant: {
    refType: 'Event'; // Indicates the referenced schema Ex: 'User' | 'Merchant' | 'Event'
    refId: Types.ObjectId; // The ObjectId of the referenced document
  };
  note: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  createdBy: IUser;
}

const MerchantPaymentSchema = new Schema<IMerchantPayment>({
  phoneNumber: { type: String, required: true },
  accountId: { type: String, required: true },
  merchantName: { type: String, required: true },
  tag: { type: String, required: true },
  currency: { type: String, enum: Object.values(Currency), required: true },
  storeLabel: { type: String, required: true },
  merchant: {
    refType: { type: String, enum: ['Event'], required: true },
    refId: { type: Schema.Types.ObjectId, required: true, refPath: 'merchant.refType' },
  },
  note: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Model
export const MerchantPayment = model<IMerchantPayment>('MerchantPayment', MerchantPaymentSchema);
