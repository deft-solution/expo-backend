import mongoose, { Document, Model, PopulatedDoc, Schema } from 'mongoose';

import { IUser } from './User';

export interface IExhibitor extends Document {
  name: string;
  description: string;
  category: string;
  tags: string[];
  logoUrl: string;
  contact: IContact;
  location: ILocation;
  isActive: boolean;
  socials: ISocials[];
  attachments: IAttachments[];
  //
  createdAt: Date;
  createdBy: PopulatedDoc<IUser>;
}

export interface ILocation {
  country: string;
  city: string;
  state: string;
  postalCode: string;
  addressOne: string;
  addressTwo: string;
}

export interface IContact {
  name: string;
  phoneNumber: string;
  vatNumber: string;
  email: string;
}

export interface ISocials {
  type: string; // EX: FACEBOOK ; WEBSITE; INSTAGRAM ...etc
  url: string;
}

export interface IAttachments {
  type: string; // EX: VIDEO; IMAGE; FILE; ..etc
  url: string;
}

export const LocationSchema: Schema<ILocation> = new Schema<ILocation>({
  country: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  postalCode: {
    type: String,
    required: false,
  },
  addressOne: {
    type: String,
    required: false,
  },
  addressTwo: {
    type: String,
    required: false,
  },
});

export const ContactSchema: Schema<IContact> = new Schema<IContact>({
  name: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  vatNumber: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
});

export const SocialSchema: Schema<ISocials> = new Schema<ISocials>({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const AttachmentSchema: Schema<IAttachments> = new Schema<IAttachments>({
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const ExhibitorSchema: Schema<IExhibitor> = new Schema<IExhibitor>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      required: false,
    },
    logoUrl: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    contact: {
      type: ContactSchema,
      required: true,
    },
    location: {
      type: LocationSchema,
      required: true,
      default: {},
    },
    attachments: {
      type: [AttachmentSchema],
      required: false,
      default: [],
    },
    socials: {
      type: [SocialSchema],
      required: false,
      default: [],
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

const Exhibitors: Model<IExhibitor> = mongoose.model<IExhibitor>('Exhibitors', ExhibitorSchema);
export default Exhibitors;
