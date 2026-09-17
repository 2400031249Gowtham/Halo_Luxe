import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  verifyPassword,
  signCustomerToken,
  setCustomerSessionCookie,
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customerAuth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign session token & set cookie
    const token = await signCustomerToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setCustomerSessionCookie(token);

    const response = NextResponse.json({
      success: true,
      message: "Signed in successfully.",
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
    console.error("[Login Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign in." },
      { status: 500 }
    );
  }
}
