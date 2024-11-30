import { Document, model, Schema } from 'mongoose';

// Define the interface with stricter types for `type`
export interface IBakongToken extends Document {
  token: string;
  type: string; // Restrict to specific values
  createdAt: Date;
  updatedAt?: Date; // Added for timestamps
}

// Create the schema
const BakongTokenSchema = new Schema<IBakongToken>(
  {
    token: {
      type: String,
      required: true,
      trim: true,
      minlength: 10, // Minimum length constraint
    },
    type: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    toJSON: {
      transform: function (_doc, ret) {
        // Transform _id to id
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

// Create an index for the `token` field
BakongTokenSchema.index({ token: 1 }, { unique: true }); // Ensures tokens are unique

// Create and export the model
export const BakongToken = model<IBakongToken>('BakongToken', BakongTokenSchema);
