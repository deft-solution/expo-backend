import mongoose, { Document, Schema } from 'mongoose';
import { Currency } from '../enums/Currency';
import { OrderStatus, PaymentStatus } from '../enums/Order';

export interface IOrder extends Document {
  ip: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  companyName: string | null;
  paymentId: string;
  patentUrl: string | null;
  nationality: string | null;
  totalAmount: number;
  currency: Currency;
  orderNo: string;
  paymentMethod: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  note: string | null;
  event: mongoose.Types.ObjectId;
  items: IOrderItem[];
  provider: number;
  option: string;
  paymentCard: string;
  //
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  boothId: mongoose.Types.ObjectId; // Optional field for referencing booths
  quantity: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

const orderItemSchema = new Schema<IOrderItem>({
  boothId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', required: true }, // Assuming 'Booth' is another model
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    ip: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    option: { type: String, required: true },
    paymentCard: { type: String, required: true },
    provider: { type: Number, required: true },
    email: { type: String, required: true },
    paymentId: { type: String, required: true },
    companyName: { type: String, default: null },
    patentUrl: { type: String, default: null },
    nationality: { type: String, default: null },
    totalAmount: { type: Number, required: true },
    orderNo: { type: String, required: true, unique: true },
    paymentMethod: { type: String, required: true },
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
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
); // This will automatically add createdAt and updatedAt fields

// Create the Mongoose model
const Order = mongoose.model<IOrder>('Order', OrderSchema);
export { Order };
