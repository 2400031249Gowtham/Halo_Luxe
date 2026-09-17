import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    if (!purpose || !["register", "forgot_password"].includes(purpose)) {
      return NextResponse.json(
        { error: "Valid purpose ('register' or 'forgot_password') is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (purpose === "register" && existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please sign in or use forgot password.",
        },
        { status: 400 }
      );
    }

    if (purpose === "forgot_password" && !existingUser) {
      return NextResponse.json(
        { error: "No account exists with this email address." },
        { status: 404 }
      );
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean any previous OTPs for this email & purpose
    await Otp.deleteMany({ email: cleanEmail, purpose });

    // Store in DB with 10-minute expiry
    await Otp.create({
      email: cleanEmail,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send email via Gmail SMTP
    await sendOtpEmail(cleanEmail, otp, purpose);

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error: any) {
    console.error("[Send OTP Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to send verification code." },
      { status: 500 }
    );
  }
}
