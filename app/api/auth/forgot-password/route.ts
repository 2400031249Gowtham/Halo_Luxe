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
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    await connectToDatabase();

    const validOtp = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      purpose: "forgot_password",
      expiresAt: { $gt: new Date() },
    });

    if (!validOtp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 404 }
      );
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Remove used OTP
    await Otp.deleteMany({ email: cleanEmail });

    // Auto-login user
    const token = await signCustomerToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setCustomerSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      message: "Your password has been successfully reset.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        addresses: user.addresses || [],
        wishlist: (user.wishlist || []).map((id: any) => id.toString()),
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
    console.error("[Forgot Password Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
