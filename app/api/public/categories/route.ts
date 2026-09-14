import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find({ status: "published" })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("[Public Categories GET Error]", error);
    return NextResponse.json(
      { error: "Failed to load categories", categories: [] },
      { status: 500 }
    );
  }
}
