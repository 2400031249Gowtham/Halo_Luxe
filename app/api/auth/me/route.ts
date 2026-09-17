import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();

    const user = await User.findById(session.userId)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
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
  } catch (error: any) {
    console.error("[Auth Me Error]", error);
    return NextResponse.json({ user: null });
  }
}
