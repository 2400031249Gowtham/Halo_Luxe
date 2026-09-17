import mongoose, { Schema, Model, Document } from "mongoose";

export interface IOrderItem {
  productId?: string;
  name: string;
  slug?: string;
  image: string;
  size?: string;
  colour?: string;
  article?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  pinCode: string;
  state: string;
  city: string;
  area?: string;
  type?: string;
}

export interface ITrackingEvent {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: "razorpay";
  paymentStatus: "paid" | "pending" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  orderStatus:
    | "waiting"
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  trackingNumber?: string;
  courierPartner?: string;
  trackingTimeline: ITrackingEvent[];
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String },
    name: { type: String, required: true },
    slug: { type: String },
    image: { type: String, required: true },
    size: { type: String },
    colour: { type: String },
    article: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    pinCode: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String },
    type: { type: String, default: "Home" },
  },
  { _id: false }
);

const TrackingEventSchema = new Schema<ITrackingEvent>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "pending",
      index: true,
    },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    orderStatus: {
      type: String,
      enum: [
        "waiting",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "confirmed",
      index: true,
    },
    trackingNumber: { type: String },
    courierPartner: { type: String },
    trackingTimeline: {
      type: [TrackingEventSchema],
      default: () => [
        {
          status: "confirmed",
          timestamp: new Date(),
          note: "Order confirmed and verified via Razorpay Online Payment.",
        },
      ],
    },
    estimatedDelivery: { type: Date },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
