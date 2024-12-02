import mongoose, { Document, Model, PopulatedDoc, Schema } from 'mongoose';

import { IUser } from './User';

export interface IEvents extends Document {
  name: string;
  description: string;
  floorPlanUrl: string;
  mainWebsiteUrl: string;
  logoUrl: string;
  startFrom: Date;
  endDate: Date;
  phoneNumber: string;
  email: string;
  location: string;
  createdBy: PopulatedDoc<IUser>;
  createdAt: Date;
  isActive: boolean;
  isUsingWonderPassPayment: boolean;
  maxBoothPerOrder: number; // Updated field name
}

const EventSchema: Schema<IEvents> = new Schema<IEvents>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    floorPlanUrl: {
      type: String,
      required: false,
    },
    mainWebsiteUrl: {
      type: String,
      required: false,
    },
    logoUrl: {
      type: String,
      required: false,
    },
    startFrom: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isUsingWonderPassPayment: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    maxBoothPerOrder: {
      type: Number,
      default: 1, // Default value
      required: true,
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

const EventModel: Model<IEvents> = mongoose.model<IEvents>('Event', EventSchema);
export default EventModel;
