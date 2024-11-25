import mongoose, { Document, Schema } from 'mongoose';

import { Currency } from '../enums/Currency';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../enums/Order';

export interface ICalculatedResponse {
  boothId: string;
  price: number;
  convertedPrice: number;
  quantity: number;
  originCurrency: Currency;
  boothName: string;
  boothTypeName: string;
}

export interface IOrder extends Document {
  ip: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  patentUrl: string | null;
  companyName: string | null;
  nationality: string | null;
  totalAmount: number;
  currency: Currency;
  orderNo: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  note: string | null;
  event: mongoose.Types.ObjectId;
  items: IOrderItem[];
  //
  completedAt: Date;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  boothId: mongoose.Types.ObjectId; // Optional field for referencing booths
  quantity: number;
  price: number;
  currency: Currency;
  boothTypeCurrency: Currency;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

// Reusable enum validator function
const enumValidator = (enumObject: object) => ({
  validator: function (value: any) {
    return !Array.isArray(value) && Object.values(enumObject).includes(value);
  },
  message: (props: any) => `${props.value} is not a valid value!`,
});

const orderItemSchema = new Schema<IOrderItem>({
  boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', required: true }, // Assuming 'Booth' is another model
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  currency: {
    type: String,
    required: true,
    validate: enumValidator(Currency),
  },
  boothTypeCurrency: {
    type: String,
    required: true,
    validate: enumValidator(Currency),
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    ip: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    companyName: { type: String, default: null },
    patentUrl: { type: String, default: null },
    nationality: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    orderNo: { type: String, required: true, unique: true },
    paymentMethod: {
      type: Number,
      required: true,
      validate: enumValidator(PaymentMethod),
    },
    completedAt: { type: Date, required: false, default: null },
    currency: {
      type: String,
      required: true,
      validate: {
        validator: function (value: any) {
          return !Array.isArray(value) && Object.values(Currency).includes(value);
        },
        message: (props: any) => `${props.value} is not a valid order status!`,
      },
    },
    status: {
      type: Number,
      default: OrderStatus.Pending,
      required: true,
      validate: {
        validator: function (value: any) {
          return !Array.isArray(value) && Object.values(OrderStatus).includes(value);
        },
        message: (props: any) => `${props.value} is not a valid order status!`,
      },
    },
    paymentStatus: {
      type: Number,
      default: PaymentStatus.Pending,
      required: true,
      validate: {
        validator: function (value: any) {
          return !Array.isArray(value) && Object.values(PaymentStatus).includes(value);
        },
        message: (props: any) => `${props.value} is not a valid order status!`,
      },
    },
    note: { type: String, default: null },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // Assuming 'Event' is another model
    items: { type: [orderItemSchema], required: true },
    createdBy: { type: String, required: false, default: null },
  },
  { timestamps: true },
); // This will automatically add createdAt and updatedAt fields

// Create the Mongoose model
const Order = mongoose.model<IOrder>('Order', OrderSchema);
export { Order };
