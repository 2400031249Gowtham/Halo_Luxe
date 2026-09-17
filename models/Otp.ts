import mongoose, { Schema, Model, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: "register" | "forgot_password";
  expiresAt: Date;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["register", "forgot_password"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "10m" }, // Automatically expire documents after 10 minutes
    },
  },
  {
    timestamps: true,
    collection: "otps",
  }
);

const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
