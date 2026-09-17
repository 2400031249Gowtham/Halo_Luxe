import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    const { email, otp, purpose } = await req.json();

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { error: "Email, OTP, and purpose are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    await connectToDatabase();

    const record = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Verification code confirmed successfully.",
    });
  } catch (error: any) {
    console.error("[Verify OTP Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify code." },
      { status: 500 }
    );
  }
}
