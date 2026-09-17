import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import {
  requireCustomer,
  signCustomerToken,
  CUSTOMER_COOKIE_NAME,
} from "@/lib/customerAuth";
import User from "@/models/User";

// GET current customer's profile
export async function GET() {
  try {
    const session = await requireCustomer();
    await connectToDatabase();

    const user = await User.findById(session.userId)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        status: (user as any).status || "active",
        addresses: user.addresses || [],
        wishlist: (user.wishlist || []).map((id: any) => id.toString()),
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[User Profile GET Error]", error);
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

// PUT update customer's name and phone
export async function PUT(req: Request) {
  try {
    const session = await requireCustomer();
    await connectToDatabase();

    const { name, phone } = await req.json();

    const updates: Record<string, any> = {};

    if (name !== undefined) {
      const cleanName = name.trim();
      if (!cleanName) {
        return NextResponse.json(
          { error: "Name cannot be empty." },
          { status: 400 }
        );
      }
      updates.name = cleanName;
    }

    if (phone !== undefined) {
      let cleanPhone = (phone || "").trim().replace(/\D/g, "");
      if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
        cleanPhone = cleanPhone.slice(2);
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.slice(1);
      }

      if (cleanPhone && cleanPhone.length !== 10) {
        return NextResponse.json(
          { error: "Please provide a valid 10-digit mobile number." },
          { status: 400 }
        );
      }
      updates.phone = cleanPhone;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update." },
        { status: 400 }
      );
    }

    await User.collection.updateOne(
      { _id: new (await import("mongoose")).default.Types.ObjectId(session.userId) },
      { $set: updates }
    );

    const updatedUser = await User.findById(session.userId)
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Refresh JWT session with updated name
    const newToken = await signCustomerToken({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        role: updatedUser.role,
        status: (updatedUser as any).status || "active",
        addresses: updatedUser.addresses || [],
        wishlist: (updatedUser.wishlist || []).map((id: any) => id.toString()),
      },
    });

    response.cookies.set(CUSTOMER_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[User Profile PUT Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
