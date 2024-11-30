import mongoose, { Document, Schema } from 'mongoose';
import { Currency } from '../enums/Currency';

export interface BoothTemplateExcel {
  'Booth Number': string;
  'Booth Name': string;
  'Event Name': string;
  'Booth Type': string;
  Currency: Currency;
  Hall: string;
  Size: string;
  Price: number;
  Description: string | null;
}

export interface IBooth extends Document {
  boothNumber: string;
  boothName: string;
  hall?: string;
  size: string;
  event: mongoose.Types.ObjectId;
  mapUrl: string | null;
  isReserved: boolean;
  price: number;
  isActive?: boolean;
  boothType: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
}

export const BoothSchema: Schema = new Schema(
  {
    boothNumber: { type: String, required: true, default: null },
    boothName: { type: String, required: true, default: null },
    hall: { type: String, required: true, default: null },
    size: { type: String, required: false, default: null },
    mapUrl: { type: String, required: false, default: null },
    price: { type: Number, required: false, default: null },
    isReserved: { type: Boolean, required: false, default: false },
    isActive: { type: Boolean, default: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
    boothType: {
      type: Schema.Types.ObjectId,
      ref: 'BoothType',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        // Transform the _id field to id
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

const Booth = mongoose.model<IBooth>('Booth', BoothSchema);
export default Booth;
