import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IProductImage extends Document {
  productId: Types.ObjectId;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    altText: {
      type: String,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "productImages",
  }
);

const ProductImage: Model<IProductImage> =
  mongoose.models.ProductImage ||
  mongoose.model<IProductImage>("ProductImage", ProductImageSchema);

export default ProductImage;
