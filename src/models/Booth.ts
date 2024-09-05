import mongoose, { Document, PopulatedDoc, Schema } from 'mongoose';

import { IUser } from './User';

export interface IBooth extends Document {
  boothNumber: string;
  hall: string;
  size: string;
  exhibitor: mongoose.Types.ObjectId;
  mapUrl: string;
  boothType: mongoose.Types.ObjectId;
  createdBy: PopulatedDoc<IUser>;
}

export const BoothSchema: Schema = new Schema({
  boothNumber: { type: String, required: true },
  hall: { type: String, required: true },
  size: { type: String, required: false },
  mapUrl: { type: String, required: false },
  exhibitor: { type: Schema.Types.ObjectId, ref: 'Exhibitor', required: true },
  boothType: { type: Schema.Types.ObjectId, ref: 'BoothType', required: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Users"
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
