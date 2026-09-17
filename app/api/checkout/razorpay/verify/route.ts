import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendOrderConfirmationEmail } from "@/lib/email";

const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "2iqU8HtVXlk3uUBlRaS9Fuk2";

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    const body = await req.json();

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      shippingAddress,
      subtotal,
      discount = 0,
      shippingFee = 0,
      tax = 0,
      total,
      customerEmail,
      customerName,
      customerPhone,
      saveAddressToProfile = false,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification details missing." },
        { status: 400 }
      );
    }

    // Verify Razorpay HMAC SHA256 Signature
    const bodyString = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Payment verification failed: invalid signature." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if order already recorded for this payment ID
    const existingOrder = await Order.findOne({ razorpayPaymentId });
    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder._id.toString(),
        orderNumber: existingOrder.orderNumber,
      });
    }

    // Generate unique order number (e.g. #ORD000001)
    const count = await Order.countDocuments();
    const orderNumber = `#ORD${String(count + 1).padStart(6, "0")}`;

    // Estimated delivery: 4 days from now
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 4);

    const newOrder = await Order.create({
      orderNumber,
      user: session?.userId || undefined,
      customerEmail: (customerEmail || session?.email || "").toLowerCase(),
      customerName: customerName || session?.name || "Customer",
      customerPhone: customerPhone || shippingAddress.phone || "",
      items: items.map((item: any) => ({
        productId: item.product?.id || item.productId,
        name: item.product?.name || item.name,
        slug: item.product?.slug || item.slug,
        image: item.product?.image || item.image,
        size: item.selectedSize || item.size,
        colour: item.product?.colour || item.colour,
        article: item.product?.article || item.article,
        price: item.product?.price || item.price,
        compareAtPrice: item.product?.compareAtPrice || item.compareAtPrice,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        pinCode: shippingAddress.pinCode,
        state: shippingAddress.state,
        city: shippingAddress.city,
        area: shippingAddress.area || "",
        type: shippingAddress.type || "Home",
      },
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderStatus: "confirmed",
      estimatedDelivery: estDate,
      trackingTimeline: [
        {
          status: "confirmed",
          timestamp: new Date(),
          note: "Order confirmed and verified via Razorpay Online Payment.",
        },
      ],
    });

    // Optionally save address to customer profile if requested and logged in
    if (session?.userId && saveAddressToProfile && shippingAddress) {
      try {
        const user = await User.findById(session.userId);
        if (user) {
          const alreadyExists = user.addresses.some(
            (a) =>
              a.street.toLowerCase() === shippingAddress.street.toLowerCase() &&
              a.pinCode === shippingAddress.pinCode
          );
          if (!alreadyExists) {
            user.addresses.push({
              id: "addr_" + Date.now(),
              fullName: shippingAddress.fullName,
              phone: shippingAddress.phone,
              street: shippingAddress.street,
              pinCode: shippingAddress.pinCode,
              state: shippingAddress.state,
              city: shippingAddress.city,
              area: shippingAddress.area,
              type: shippingAddress.type || "Home",
              isDefault: user.addresses.length === 0,
            });
            await user.save();
          }
        }
      } catch (err) {
        console.error("Failed to auto-save address to user profile", err);
      }
    }

    // Send confirmation email in background
    sendOrderConfirmationEmail(newOrder.customerEmail, newOrder).catch((err) =>
      console.error("Failed to send order confirmation email", err)
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and order confirmed successfully.",
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
    });
  } catch (error: any) {
    console.error("[Razorpay Verify Error]", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed." },
      { status: 500 }
    );
  }
}
