import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import {
  hashPassword,
  signCustomerToken,
  setCustomerSessionCookie,
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customerAuth";

export async function POST(req: Request) {
  try {
    const { email, otp, password, name, phone } = await req.json();

    if (!email || !otp || !password || !phone) {
      return NextResponse.json(
        { error: "Email, OTP, password, and phone number are required." },
        { status: 400 }
      );
    }

    let cleanPhone = (phone || "").trim().replace(/\D/g, "");
    if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    }

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile phone number." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const cleanName = (name || "").trim() || cleanEmail.split("@")[0];

    await connectToDatabase();

    // Verify OTP
    const validOtp = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      purpose: "register",
      expiresAt: { $gt: new Date() },
    });

    if (!validOtp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: "user",
      status: "active",
      isVerified: true,
      addresses: [],
      wishlist: [],
    });

    // Directly write to MongoDB collection to guarantee persistence
    await User.collection.updateOne(
      { _id: newUser._id },
      { $set: { phone: cleanPhone, status: "active", isVerified: true } }
    );

    // Delete used OTP
    await Otp.deleteMany({ email: cleanEmail });

    // Sign session token and set cookie
    const token = await signCustomerToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    await setCustomerSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: cleanPhone,
        status: "active",
        role: newUser.role,
        addresses: [],
        wishlist: [],
      },
    });

    response.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
