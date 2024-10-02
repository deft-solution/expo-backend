import mongoose, { Document, Schema } from 'mongoose';

export interface IBooth extends Document {
  boothNumber: string;
  hall: string;
  size: string;
  event: mongoose.Types.ObjectId;
  mapUrl: string;
  externalId: string;
  description: string;
  price: Number;
  isActive: boolean;
  boothType: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

export const BoothSchema: Schema = new Schema({
  boothNumber: { type: String, required: true, default: null },
  hall: { type: String, required: true, default: null },
  size: { type: String, required: false, default: null },
  mapUrl: { type: String, required: false, default: null },
  externalId: { type: String, required: false, default: null },
  price: { type: Number, required: false, default: null },
  description: { type: String, required: false, default: null },
  isActive: { type: Boolean, default: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
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
