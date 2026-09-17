import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import Order from "@/models/Order";

// GET all orders with filtering
export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search.trim()) {
      const s = search.trim();
      query.$or = [
        { orderNumber: { $regex: s, $options: "i" } },
        { customerName: { $regex: s, $options: "i" } },
        { customerEmail: { $regex: s, $options: "i" } },
        { customerPhone: { $regex: s, $options: "i" } },
        { "items.name": { $regex: s, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Admin Orders GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}

// PUT update order status & tracking info
export async function PUT(req: Request) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const body = await req.json();
    const { orderId, orderStatus, message, trackingNumber, courierPartner } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json(
        { error: "Order ID and status are required." },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.orderStatus = orderStatus;

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber.trim();
    }
    if (courierPartner !== undefined) {
      order.courierPartner = courierPartner.trim();
    }

    // Append new tracking event to timeline
    const noteText =
      (message || "").trim() ||
      (orderStatus === "shipped" && trackingNumber
        ? `Shipped via ${courierPartner || "Express Partner"}. Tracking: ${trackingNumber}`
        : `Order status updated to ${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}`);

    order.trackingTimeline.push({
      status: orderStatus,
      timestamp: new Date(),
      note: noteText,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[Admin Orders PUT Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
