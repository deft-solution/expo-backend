import mongoose, { Document, Model, PopulatedDoc, Schema } from 'mongoose';

import { IUser } from './User';

export interface ISocialLink extends Document {
  name: string;
  iconUrl: string;
  createdBy: PopulatedDoc<IUser>;
}

const SocialLinkSchema: Schema<ISocialLink> = new Schema<ISocialLink>(
  {
    name: {
      type: String,
      required: true,
    },
    iconUrl: {
      type: String,
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

const SocialLink: Model<ISocialLink> = mongoose.model<ISocialLink>('SocialLink', SocialLinkSchema);
export default SocialLink;
