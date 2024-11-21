import mongoose, { Document, Schema } from 'mongoose';

export interface IBoothType extends Document {
  name: string; // Name of the booth type, e.g., "Standard", "Premium", etc.
  description: string | null; // Description of the booth type
  price: number; // Price for the booth type
  isActive?: boolean;
  createdAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
}

export const BoothTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

const BoothType = mongoose.model<IBoothType>('BoothType', BoothTypeSchema);
export default BoothType;
