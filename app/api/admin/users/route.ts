import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import mongoose from "mongoose";

// GET all registered customers with stats and filtering
export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    // Filter to customers (role: "user")
    const query: any = { role: "user" };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { phone: { $regex: s, $options: "i" } },
      ];
    }

    const rawUsers = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    // Dynamically backfill phone or status if missing from addresses/orders
    const users = await Promise.all(
      rawUsers.map(async (u: any) => {
        let phone = (u.phone || "").trim();
        let statusVal = u.status || "active";
        let needsDbUpdate = false;
        const updatesToApply: any = {};

        if (!phone) {
          // Check saved addresses
          if (u.addresses && Array.isArray(u.addresses) && u.addresses.length > 0) {
            const addrPhone = u.addresses.find((a: any) => a?.phone)?.phone;
            if (addrPhone) {
              phone = addrPhone.trim().replace(/\D/g, "");
              if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);
              updatesToApply.phone = phone;
              needsDbUpdate = true;
            }
          }

          // If still no phone, check order history
          if (!phone) {
            const orderWithPhone = await mongoose.connection
              .collection("orders")
              .findOne({ customerEmail: u.email, customerPhone: { $exists: true, $ne: "" } });
            if (orderWithPhone && orderWithPhone.customerPhone) {
              phone = orderWithPhone.customerPhone.trim().replace(/\D/g, "");
              if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);
              updatesToApply.phone = phone;
              needsDbUpdate = true;
            }
          }
        }

        if (!u.status) {
          updatesToApply.status = "active";
          needsDbUpdate = true;
        }

        if (needsDbUpdate) {
          await User.collection.updateOne(
            { _id: u._id },
            { $set: updatesToApply }
          );
        }

        return {
          ...u,
          phone: phone || "",
          status: statusVal,
        };
      })
    );

    // Stats calculations
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const totalCustomers = await User.countDocuments({ role: "user" });
    const newCustomers30Days = await User.countDocuments({
      role: "user",
      createdAt: { $gte: thirtyDaysAgo },
    });
    const existingCustomers = Math.max(0, totalCustomers - newCustomers30Days);

    return NextResponse.json({
      users,
      stats: {
        total: totalCustomers,
        new30Days: newCustomers30Days,
        existing: existingCustomers,
      },
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Admin Users GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to load customers" },
      { status: 500 }
    );
  }
}

// PUT update customer profile details & status
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { userId, name, phone, status } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    let cleanPhone = phone !== undefined ? (phone || "").trim().replace(/\D/g, "") : undefined;
    if (cleanPhone && cleanPhone.length === 12 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(2);
    } else if (cleanPhone && cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.slice(1);
    }

    const updateFields: any = {};
    if (name !== undefined && name.trim()) updateFields.name = name.trim();
    if (cleanPhone !== undefined) updateFields.phone = cleanPhone;
    if (status && ["active", "inactive"].includes(status)) {
      updateFields.status = status;
    }

    const objId = new mongoose.Types.ObjectId(userId);
    await User.collection.updateOne(
      { _id: objId },
      { $set: updateFields }
    );

    const updatedUser = await User.findById(userId).select("-passwordHash").lean();
    if (!updatedUser) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully.",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || cleanPhone || "",
        status: (updatedUser as any).status || status || "active",
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Admin Users PUT Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update customer" },
      { status: 500 }
    );
  }
}
