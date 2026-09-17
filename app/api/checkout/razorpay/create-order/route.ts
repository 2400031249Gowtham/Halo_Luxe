import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getCustomerSession } from "@/lib/customerAuth";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_Bxws59lK5DunaZ";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "2iqU8HtVXlk3uUBlRaS9Fuk2";

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    const body = await req.json();

    const { amount, items } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order total amount." },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    // Razorpay requires amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(Number(amount) * 100);

    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        customerId: session?.userId || "guest",
        customerEmail: session?.email || body.customerEmail || "",
        itemsCount: String(items.length),
      },
    };

    const razorpayOrder = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("[Razorpay Order Creation Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize Razorpay order." },
      { status: 500 }
    );
  }
}
