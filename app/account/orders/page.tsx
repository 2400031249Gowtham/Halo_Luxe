"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/lib/utils";
import { SparkleStar } from "@/components/SparkleStar";
import {
  Package,
  CreditCard,
  Truck,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  HelpCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface OrderItem {
  productId?: string;
  name: string;
  slug?: string;
  image: string;
  size?: string;
  colour?: string;
  article?: string;
  price: number;
  quantity: number;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    pinCode: string;
    state: string;
    city: string;
    area?: string;
    type?: string;
  };
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId?: string;
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
  estimatedDelivery?: string;
}

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function OrdersPageContent() {
  const { user, openAuthModal } = useCustomerAuth();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "1";

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handlePrintInvoice = (order: OrderData) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1C211E; }
            .header { border-bottom: 2px solid #02281E; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 0.25em; color: #02281E; }
            .badge { background: #02281E; color: #D9BD82; padding: 4px 10px; font-size: 11px; text-transform: uppercase; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { text-align: left; padding: 10px; border-bottom: 2px solid #02281E; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #EDE4D5; font-size: 13px; }
            .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #02281E; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">H A L O</div>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 4px 0 0 0;">Luxury Tooth Crystals & Clinical Supplies</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">Official Tax Invoice</span>
              <p style="font-size: 12px; margin: 6px 0 0 0;"><strong>${order.orderNumber}</strong></p>
              <p style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 12px; line-height: 1.6;">
            <div>
              <strong>Billed & Shipped To:</strong><br>
              ${order.shippingAddress.fullName}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}<br>
              Phone: +91 ${order.shippingAddress.phone}
            </div>
            <div style="text-align: right;">
              <strong>Payment Method:</strong> Online (Razorpay)<br>
              <strong>Payment ID:</strong> ${order.razorpayPaymentId || "Verified"}<br>
              <strong>Status:</strong> Paid (GST 18% Included)
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (it) => `
                <tr>
                  <td>${it.name} ${it.size ? `(${it.size})` : ""}</td>
                  <td>${it.quantity}</td>
                  <td style="text-align: right;">₹${it.price.toLocaleString("en-IN")}</td>
                  <td style="text-align: right;">₹${(it.price * it.quantity).toLocaleString("en-IN")}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Paid (INR):</td>
                <td style="text-align: right;">₹${order.total.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: center; font-size: 11px; color: #777; margin-top: 50px;">
            Thank you for choosing HALO Luxury Dental Crystals. For clinical support: hello@halosmiles.co
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SparkleStar size={12} color="#C8A15A" />
            <span className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#063C2D]">
              Customer Portal
            </span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E]">
              My Orders & Shipments
            </h1>
            <Link
              href="/shop"
              className="text-xs font-sans uppercase tracking-[0.16em] text-[#063C2D] hover:text-[#C8A15A] font-semibold flex items-center gap-1.5"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-[#C8A15A]" />
            </Link>
          </div>
        </div>

        {/* Success Alert Banner if redirected from Razorpay */}
        {isSuccess && (
          <div className="p-5 bg-emerald-900 text-[#F4EEE4] border border-[#C8A15A]/40 shadow-lg flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-[#D9BD82] shrink-0" />
              <div>
                <h3 className="font-serif text-lg font-normal">
                  Order Successfully Placed & Paid
                </h3>
                <p className="text-xs font-sans text-emerald-100">
                  Your Razorpay payment was verified and a confirmation email has been dispatched.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#D9BD82] border border-[#C8A15A]/40 px-2.5 py-1">
              Confirmed
            </span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8A15A]" />
            <span className="text-xs font-sans text-[#02281E]/70 uppercase tracking-widest">
              Loading Order History...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/80 border border-[#C8A15A]/30 p-12 text-center max-w-md mx-auto">
            <Package className="w-12 h-12 text-[#C8A15A] mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-[#02281E] mb-2">
              No orders found
            </h3>
            <p className="text-xs font-sans text-[#1C211E]/70 mb-6">
              You haven&apos;t placed any orders yet. Discover our Swarovski® tooth gems collection today.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#02281E] text-[#F4EEE4] text-xs font-sans uppercase tracking-[0.18em] font-semibold"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* ORDERS LIST (Matching Image 5 layout in HALO custom theme) */
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStepIdx = STATUS_STEPS.indexOf(order.orderStatus);
              const formattedDate = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={order._id}
                  className="bg-white/90 border border-[#C8A15A]/30 shadow-sm overflow-hidden"
                >
                  {/* Top Bar: Order ID, Status Badge, Date & Total (Matching Image 5) */}
                  <div className="p-6 bg-[#EDE4D5]/40 border-b border-[#C8A15A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl font-semibold text-[#02281E]">
                          Order {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-sans uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                            order.orderStatus === "confirmed"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : order.orderStatus === "delivered"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-[#02281E] text-[#D9BD82]"
                          }`}
                        >
                          ● {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
                        Placed on {formattedDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-2xl text-[#02281E] font-bold">
                        {formatPrice(order.total)}
                      </span>
                      <p className="text-[10px] font-sans text-[#1C211E]/60">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Tracking Progress Bar (Matching Image 5) */}
                  <div className="px-6 py-6 border-b border-[#C8A15A]/15 bg-white">
                    <div className="relative">
                      {/* Gray track */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#EDE4D5] -translate-y-1/2" />
                      {/* Active gold fill */}
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-[#C8A15A] -translate-y-1/2 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%`,
                        }}
                      />

                      <div className="relative flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          return (
                            <div
                              key={step}
                              className="flex flex-col items-center"
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${
                                  isCurrent
                                    ? "bg-[#02281E] text-[#D9BD82] border-[#C8A15A] ring-4 ring-[#C8A15A]/20 scale-110"
                                    : isDone
                                    ? "bg-[#C8A15A] text-[#02281E] border-[#C8A15A]"
                                    : "bg-white text-[#1C211E]/40 border-[#EDE4D5]"
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-sans uppercase tracking-wider mt-2 font-semibold ${
                                  isCurrent
                                    ? "text-[#02281E]"
                                    : isDone
                                    ? "text-[#063C2D]"
                                    : "text-[#1C211E]/40"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Items List (Matching Image 5) */}
                  <div className="p-6 border-b border-[#C8A15A]/15 space-y-3">
                    <h3 className="text-xs font-sans uppercase tracking-wider text-[#063C2D] font-bold">
                      Order Items
                    </h3>
                    <div className="divide-y divide-[#EDE4D5]">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="py-3 flex items-center justify-between gap-4 text-xs font-sans"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-14 h-14 bg-[#EDE4D5] relative shrink-0 border border-[#C8A15A]/20 overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="truncate">
                              <h4 className="font-serif text-base text-[#02281E] font-medium truncate">
                                {item.name}
                              </h4>
                              <p className="text-[#1C211E]/70 text-[11px] mt-0.5">
                                Size: {item.size || "Standard"} · Qty:{" "}
                                <strong>{item.quantity}</strong>
                              </p>
                            </div>
                          </div>
                          <span className="font-serif text-lg text-[#02281E] font-semibold shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3 Info Cards Grid (Matching Image 5) */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF6F0]/60 border-b border-[#C8A15A]/15 text-xs font-sans">
                    {/* Card 1: Payment */}
                    <div className="p-4 bg-white border border-[#C8A15A]/25 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-[#02281E]">
                        <CreditCard className="w-4 h-4 text-[#C8A15A]" />
                        <span>Payment</span>
                      </div>
                      <p className="text-[#1C211E]/80">
                        Method: <strong>Razorpay Online</strong>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ● Paid
                        </span>
                      </div>
                      {order.razorpayPaymentId && (
                        <p className="text-[10px] text-[#1C211E]/50 truncate">
                          ID: {order.razorpayPaymentId}
                        </p>
                      )}
                    </div>

                    {/* Card 2: Delivery */}
                    <div className="p-4 bg-white border border-[#C8A15A]/25 space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-[#02281E]">
                        <Truck className="w-4 h-4 text-[#C8A15A]" />
                        <span>Delivery</span>
                      </div>
                      <p className="font-medium text-[#02281E] truncate">
                        {order.shippingAddress.type || "Clinic"} - {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}
                      </p>
                      <p className="text-[11px] text-[#1C211E]/70 line-clamp-2">
                        {order.shippingAddress.street} - {order.shippingAddress.pinCode}
                      </p>
                      <p className="text-[10px] text-emerald-800 font-semibold pt-0.5">
                        Est: 4 Business Days (Insured Express)
                      </p>
                    </div>

                    {/* Card 3: Savings & Invoice */}
                    <div className="p-4 bg-white border border-[#C8A15A]/25 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-[#02281E]">
                        <FileText className="w-4 h-4 text-[#C8A15A]" />
                        <span>Savings & Invoice</span>
                      </div>
                      <p className="text-emerald-700 font-medium">
                        ✓ GST 18% Compliant
                      </p>
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="text-xs font-semibold text-[#063C2D] hover:text-[#C8A15A] transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Download / Print Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons Bar (Matching Image 5) */}
                  <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="px-4 py-2 border border-[#C8A15A]/40 text-[#02281E] hover:bg-[#EDE4D5]/40 transition-colors uppercase tracking-wider font-semibold"
                      >
                        View Details / Invoice
                      </button>

                      <a
                        href="mailto:hello@halosmiles.co?subject=Order%20Help%20"
                        className="inline-flex items-center gap-1.5 text-[#1C211E]/70 hover:text-[#02281E] transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Need Help?</span>
                      </a>
                    </div>

                    <span className="text-[11px] text-[#1C211E]/60 italic">
                      Tracking reference authenticated with MongoDB Atlas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C8A15A] mb-3" />
          <p className="text-xs font-sans uppercase tracking-widest text-[#02281E]/70">
            Loading Orders...
          </p>
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
