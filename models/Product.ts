import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type ProductStatus = "draft" | "published" | "archived";
export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "made_to_order"
  | "hidden";

export interface IProduct extends Document {
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  article?: string;
  shortDescription?: string;
  description?: string;
  brand?: string;
  type?: string;
  backing?: string;
  quantity?: number;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  application?: string;
  featured: boolean;
  status: ProductStatus;
  stockStatus: StockStatus;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    article: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "Swarovski®",
    },
    type: {
      type: String,
      default: "Flat Back No Hotfix",
    },
    backing: {
      type: String,
      default: "Platinum foiling, where applicable",
    },
    quantity: {
      type: Number,
      default: 10,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: "INR",
    },
    application: {
      type: String,
      default: "Professional dental application",
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    stockStatus: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "made_to_order", "hidden"],
      default: "in_stock",
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
