import mongoose, { Document, Model, PopulatedDoc, Schema } from 'mongoose';

import { IUser } from './User';

export interface IEvents extends Document {
  name: string;
  description: string;
  thumbnailUrl: string;
  startFrom: Date;
  endDate: Date;
  location: string;
  createdBy: PopulatedDoc<IUser>;
  createdAt: Date;
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
    thumbnailUrl: {
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users"
    }
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