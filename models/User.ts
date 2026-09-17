import mongoose, { Schema, Model, Document } from "mongoose";

export interface IAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  pinCode: string;
  state: string;
  city: string;
  area?: string;
  type: "Home" | "Work";
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  isVerified: boolean;
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    id: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    type: { type: String, enum: ["Home", "Work"], default: "Home" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
    collection: "users",
    strict: false,
  }
);

// Purge any stale cached models in Next.js development memory if schema paths are missing
if (mongoose.models && mongoose.models.User) {
  const paths = (mongoose.models.User.schema as any)?.paths || {};
  if (!paths.phone || !paths.status) {
    delete (mongoose.models as any).User;
    if (mongoose.connection && (mongoose.connection as any).models) {
      delete (mongoose.connection as any).models.User;
    }
  }
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

