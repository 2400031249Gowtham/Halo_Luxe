import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const session = await getCustomerSession();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");

    await connectToDatabase();

    // Specific order lookup
    if (orderId || orderNumber) {
      const query: any = {};
      if (orderId) query._id = orderId;
      if (orderNumber) query.orderNumber = orderNumber;

      const order = await Order.findOne(query).lean();
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // If order belongs to a user, ensure authorized access
      if (order.user && session && order.user.toString() !== session.userId && session.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json({ order });
    }

    // List of orders for logged-in customer
    if (!session) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await Order.find({
      $or: [{ user: session.userId }, { customerEmail: session.email.toLowerCase() }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("[Orders GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch orders", orders: [] }, { status: 500 });
  }
}
