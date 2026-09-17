import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireCustomer } from "@/lib/customerAuth";
import User from "@/models/User";
import Product from "@/models/Product";
import mongoose from "mongoose";

// GET wishlisted products
export async function GET() {
  try {
    const session = await requireCustomer();
    await connectToDatabase();

    const user = await User.findById(session.userId).populate({
      path: "wishlist",
      model: Product,
      match: { status: "published" },
    });

    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    return NextResponse.json({ wishlist: user.wishlist || [] });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST toggle wishlist item
export async function POST(req: Request) {
  try {
    const session = await requireCustomer();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const prodIdStr = productId.toString();
    const existingIndex = user.wishlist.findIndex(
      (id) => id.toString() === prodIdStr
    );

    let isWishlisted = false;
    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
      isWishlisted = false;
    } else {
      user.wishlist.push(new mongoose.Types.ObjectId(prodIdStr));
      isWishlisted = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      isWishlisted,
      wishlistCount: user.wishlist.length,
      wishlistIds: user.wishlist.map((id) => id.toString()),
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to toggle wishlist" }, { status: 500 });
  }
}
