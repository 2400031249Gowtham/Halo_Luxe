import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireCustomer } from "@/lib/customerAuth";
import User, { IAddress } from "@/models/User";

// GET user addresses
export async function GET() {
  try {
    const session = await requireCustomer();
    await connectToDatabase();

    const user = await User.findById(session.userId).select("addresses").lean();
    return NextResponse.json({ addresses: user?.addresses || [] });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST add new address
export async function POST(req: Request) {
  try {
    const session = await requireCustomer();
    const body = await req.json();

    const { fullName, phone, street, pinCode, state, city, area, type, isDefault } = body;

    if (!fullName || !phone || !street || !pinCode || !state || !city) {
      return NextResponse.json(
        { error: "Please provide all required address fields." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newAddress: IAddress = {
      id: "addr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      pinCode: pinCode.trim(),
      state: state.trim(),
      city: city.trim(),
      area: (area || "").trim(),
      type: type === "Work" ? "Work" : "Home",
      isDefault: Boolean(isDefault || user.addresses.length === 0),
    };

    if (newAddress.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({
      success: true,
      address: newAddress,
      addresses: user.addresses,
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

// DELETE address
export async function DELETE(req: Request) {
  try {
    const session = await requireCustomer();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.addresses = user.addresses.filter((a) => a.id !== id);
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address removed",
      addresses: user.addresses,
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
