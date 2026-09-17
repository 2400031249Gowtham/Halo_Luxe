"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { SparkleStar } from "@/components/SparkleStar";
import {
  ShoppingBag,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Edit,
  Printer,
  ChevronDown,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
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
  compareAtPrice?: number;
  quantity: number;
}

interface TrackingEvent {
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderRecord {
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
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus:
    | "waiting"
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  trackingNumber?: string;
  courierPartner?: string;
  trackingTimeline: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "waiting", label: "Waiting" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "all", label: "All Payments" },
  { value: "paid", label: "Paid / Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals state
  const [viewOrder, setViewOrder] = useState<OrderRecord | null>(null);
  const [editOrder, setEditOrder] = useState<OrderRecord | null>(null);

  // Edit form inputs (Matching Reference Screenshots 3 & 4)
  const [newStatus, setNewStatus] = useState<string>("confirmed");
  const [statusMessage, setStatusMessage] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierPartner, setCourierPartner] = useState("");
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Expanded table row
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedPayment !== "all") params.append("paymentStatus", selectedPayment);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedPayment, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedPayment("all");
    setStartDate("");
    setEndDate("");
  };

  // Open Edit Modal
  const handleOpenEdit = (order: OrderRecord) => {
    setEditOrder(order);
    setNewStatus(order.orderStatus);
    setStatusMessage("");
    setTrackingNumber(order.trackingNumber || "");
    setCourierPartner(order.courierPartner || "");
    setActionError(null);
  };

  // Submit Status Update
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;
    setUpdating(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: editOrder._id,
          orderStatus: newStatus,
          message: statusMessage,
          trackingNumber: newStatus === "shipped" ? trackingNumber : undefined,
          courierPartner: newStatus === "shipped" ? courierPartner : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status");

      setEditOrder(null);
      await fetchOrders();

      // If view modal is open with the same order, update it as well
      if (viewOrder && viewOrder._id === editOrder._id) {
        setViewOrder(data.order);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Print Invoice
  const handlePrintInvoice = (order: OrderRecord) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>HALO Tax Invoice - ${order.orderNumber}</title>
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
              <strong>Customer / Clinic:</strong><br>
              ${order.customerName}<br>
              ${order.customerEmail}<br>
              Phone: +91 ${order.customerPhone}<br><br>
              <strong>Shipping Address:</strong><br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}
            </div>
            <div style="text-align: right;">
              <strong>Payment Method:</strong> Razorpay Online<br>
              <strong>Transaction ID:</strong> ${order.razorpayPaymentId || "N/A"}<br>
              <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}<br>
              <strong>Fulfillment Status:</strong> ${order.orderStatus.toUpperCase()}
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
            HALO Dental Supply • Authorised Swarovski® Distribution • contact: admin@halosmiles.co
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "confirmed":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "waiting":
      case "pending":
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C8A15A]/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SparkleStar size={12} color="#C8A15A" />
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A] font-semibold">
              E-Commerce Fulfillment
            </span>
          </div>
          <h1 className="font-serif text-3xl text-[#02281E] mt-1 font-normal">
            Orders Management
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-0.5">
            {orders.length} total customer orders persisted in MongoDB Atlas
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#C8A15A]/30 bg-white text-[#02281E] hover:bg-[#EDE4D5] transition-colors text-xs font-sans uppercase tracking-wider font-semibold self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* FILTER BAR (Matching Reference Screenshot 1 & 2) */}
      <div className="p-4 bg-white/80 border border-[#C8A15A]/30 shadow-xs space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID, customer, email, phone, or items..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Dropdown */}
          <div className="w-full sm:w-44">
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
            >
              {PAYMENT_OPTIONS.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="From Date"
              className="px-2.5 py-1.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            />
            <span className="text-xs text-[#1C211E]/40">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="To Date"
              className="px-2.5 py-1.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-wider font-semibold"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 bg-[#EDE4D5] text-[#02281E] hover:bg-[#E5DAC8] transition-colors text-xs font-sans uppercase tracking-wider"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* ORDERS TABLE (Matching Reference Screenshot 1 & 2 in HALO Theme) */}
      <div className="bg-white border border-[#C8A15A]/30 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header with HALO Custom Deep Emerald & Gold Banner */}
          <thead>
            <tr className="bg-[#02281E] text-[#F4EEE4] text-[11px] font-sans uppercase tracking-[0.16em] border-b-2 border-[#C8A15A]">
              <th className="py-3.5 px-4 font-semibold">Order</th>
              <th className="py-3.5 px-4 font-semibold">Customer</th>
              <th className="py-3.5 px-4 font-semibold">Items</th>
              <th className="py-3.5 px-4 font-semibold">Amount</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Payment</th>
              <th className="py-3.5 px-4 font-semibold">Invoice</th>
              <th className="py-3.5 px-4 font-semibold">Date</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EDE4D5] text-xs font-sans">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#1C211E]/60">
                  <Loader2 className="w-7 h-7 animate-spin text-[#C8A15A] mx-auto mb-2" />
                  <span className="uppercase tracking-widest text-[11px]">
                    Loading customer orders...
                  </span>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#1C211E]/60">
                  <ShoppingBag className="w-10 h-10 text-[#C8A15A] mx-auto mb-2 opacity-60" />
                  <p className="font-serif text-lg text-[#02281E]">No orders found</p>
                  <p className="text-[11px] text-[#1C211E]/60 mt-0.5">
                    Try adjusting your search query or status filter.
                  </p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedRowId === order._id;
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
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-[#FAF6F0] transition-colors">
                      {/* Column 1: Order */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setExpandedRowId(isExpanded ? null : order._id)
                            }
                            className="p-1 text-[#063C2D] hover:text-[#C8A15A] transition-colors"
                            aria-label="Expand order row"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#C8A15A]" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span className="font-serif font-semibold text-sm text-[#02281E] block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#1C211E]/60">
                              {order.items.length}{" "}
                              {order.items.length === 1 ? "item" : "items"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#02281E] block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-[#1C211E]/70 block truncate max-w-[170px]">
                          {order.customerEmail}
                        </span>
                        <span className="text-[10px] text-[#063C2D] block">
                          +91 {order.customerPhone}
                        </span>
                      </td>

                      {/* Column 3: Items */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((it, idx) => (
                            <p key={idx} className="truncate text-[11px] text-[#02281E]">
                              {it.name}{" "}
                              <strong className="text-[#063C2D]">
                                × {it.quantity}
                              </strong>
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] text-[#C8A15A] font-semibold italic">
                              +{order.items.length - 2} more item(s)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 4: Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-serif font-bold text-sm text-[#02281E] block">
                          {formatPrice(order.total)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Saved / GST 18%
                        </span>
                      </td>

                      {/* Column 5: Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans uppercase font-bold tracking-wider border ${getStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Column 6: Payment */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "Completed" : "Pending"}
                        </span>
                        <span className="text-[10px] text-[#1C211E]/60 block mt-0.5">
                          Razorpay
                        </span>
                      </td>

                      {/* Column 7: Invoice */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Emailed
                        </span>
                        <span className="text-[10px] text-[#1C211E]/50 block mt-0.5 truncate max-w-[120px]">
                          {order.orderNumber}-INV
                        </span>
                      </td>

                      {/* Column 8: Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-[#1C211E]/80">
                        {formattedDate}
                      </td>

                      {/* Column 9: Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setViewOrder(order)}
                            className="p-1.5 text-[#063C2D] hover:text-[#C8A15A] hover:bg-[#EDE4D5] rounded transition-colors"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(order)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Update Status"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                            title="Print / Download Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Accordion Details */}
                    {isExpanded && (
                      <tr className="bg-[#FAF6F0] border-b border-[#C8A15A]/20">
                        <td colSpan={9} className="p-4 pl-12">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                            <div className="space-y-1">
                              <p className="font-semibold text-[#02281E]">
                                Shipping Address:
                              </p>
                              <p className="text-[#1C211E]/80">
                                {order.shippingAddress.fullName} (
                                {order.shippingAddress.type || "Home"})
                              </p>
                              <p className="text-[#1C211E]/70">
                                {order.shippingAddress.street},{" "}
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.state} -{" "}
                                <strong>{order.shippingAddress.pinCode}</strong>
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold text-[#02281E]">
                                Gateway Verification:
                              </p>
                              <p className="text-[#1C211E]/80">
                                Order ID: {order.razorpayOrderId || "N/A"}
                              </p>
                              <p className="text-[#1C211E]/80">
                                Payment ID: {order.razorpayPaymentId || "Verified"}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold text-[#02281E]">
                                Shipping Partner:
                              </p>
                              <p className="text-[#1C211E]/80">
                                Carrier: {order.courierPartner || "Express Courier"}
                              </p>
                              <p className="text-[#1C211E]/80">
                                AWB / Tracking:{" "}
                                {order.trackingNumber || "Pending Assignment"}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: UPDATE ORDER STATUS (Matching Screenshots 3 & 4)*/}
      {/* ======================================================== */}
      {editOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02281E]/75 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-[#F4EEE4] border border-[#C8A15A]/40 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#02281E] px-6 py-4 text-[#F4EEE4] border-b border-[#C8A15A]/30 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#F4EEE4]">
                  Update Order Status
                </h3>
                <p className="text-xs font-sans text-[#D9BD82] mt-0.5">
                  Order: {editOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setEditOrder(null)}
                className="text-[#F4EEE4]/70 hover:text-[#D9BD82] transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
                  {actionError}
                </div>
              )}

              {/* Order Status Dropdown */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1.5">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                >
                  <option value="waiting">Waiting</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Update Message */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1.5">
                  Update Message
                </label>
                <textarea
                  rows={3}
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="Enter status update message (optional)..."
                  className="w-full px-3.5 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                />
              </div>

              {/* Additional fields when 'Shipped' is chosen (Matching Screenshot 4) */}
              {newStatus === "shipped" && (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number (e.g. BD789123)"
                      className="w-full px-3.5 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={courierPartner}
                      onChange={(e) => setCourierPartner(e.target.value)}
                      placeholder="e.g., Blue Dart, DTDC, Delhivery, etc."
                      className="w-full px-3.5 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#C8A15A]/20">
                <button
                  type="button"
                  onClick={() => setEditOrder(null)}
                  className="px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-[#02281E] hover:bg-[#EDE4D5] text-xs font-sans uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-2"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                  ) : (
                    <span>Update Status</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ORDER DETAILS (VIEW) (Matching Screenshot 5)    */}
      {/* ======================================================== */}
      {viewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02281E]/75 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-[#F4EEE4] border border-[#C8A15A]/40 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#02281E] px-6 py-4 text-[#F4EEE4] border-b border-[#C8A15A]/30 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-xl font-normal text-[#F4EEE4]">
                  Order Details
                </h3>
                <p className="text-xs font-sans text-[#D9BD82] mt-0.5">
                  {viewOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setViewOrder(null)}
                className="text-[#F4EEE4]/70 hover:text-[#D9BD82] transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* 3 Metric Stat Cards (Matching Screenshot 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                {/* Stat 1: Order Status */}
                <div className="p-4 bg-white border border-[#C8A15A]/25 space-y-1.5">
                  <span className="text-[#063C2D] font-semibold uppercase tracking-wider text-[10px] block">
                    Order Status
                  </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                      viewOrder.orderStatus
                    )}`}
                  >
                    {viewOrder.orderStatus}
                  </span>
                </div>

                {/* Stat 2: Payment Status */}
                <div className="p-4 bg-white border border-[#C8A15A]/25 space-y-1.5">
                  <span className="text-[#063C2D] font-semibold uppercase tracking-wider text-[10px] block">
                    Payment Status
                  </span>
                  <span className="inline-block px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                    {viewOrder.paymentStatus === "paid" ? "Completed" : "Pending"}
                  </span>
                  <p className="text-[10px] text-[#1C211E]/50">Razorpay Online</p>
                </div>

                {/* Stat 3: Total Amount */}
                <div className="p-4 bg-white border border-[#C8A15A]/25 space-y-1">
                  <span className="text-[#063C2D] font-semibold uppercase tracking-wider text-[10px] block">
                    Total Amount
                  </span>
                  <span className="font-serif text-2xl font-bold text-[#02281E] block">
                    {formatPrice(viewOrder.total)}
                  </span>
                  <p className="text-[10px] text-emerald-700">GST 18% Included</p>
                </div>
              </div>

              {/* Order Timeline (Matching Screenshot 5) */}
              <div className="space-y-3">
                <h4 className="text-xs font-sans uppercase tracking-wider text-[#02281E] font-bold">
                  Order Timeline
                </h4>
                <div className="space-y-3 bg-white p-4 border border-[#C8A15A]/20">
                  {viewOrder.trackingTimeline.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs font-sans">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C8A15A] mt-1 shrink-0 ring-4 ring-[#C8A15A]/20" />
                      <div>
                        <p className="font-semibold text-[#02281E]">
                          <span className="capitalize">{ev.status}</span>
                          <span className="font-normal text-[#1C211E]/60 text-[11px] ml-2">
                            {new Date(ev.timestamp).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        <p className="text-[#1C211E]/70 text-[11px] mt-0.5">
                          {ev.note || "Status updated"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items (Matching Screenshot 5) */}
              <div className="space-y-3">
                <h4 className="text-xs font-sans uppercase tracking-wider text-[#02281E] font-bold">
                  Order Items
                </h4>
                <div className="bg-white divide-y divide-[#EDE4D5] border border-[#C8A15A]/20">
                  {viewOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 flex items-center justify-between gap-4 text-xs font-sans"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#EDE4D5] relative shrink-0 border border-[#C8A15A]/20 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-serif font-medium text-sm text-[#02281E]">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#1C211E]/60">
                            Article: {item.article || "Swarovski®"} · Size:{" "}
                            {item.size || "Standard"} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="font-serif font-bold text-base text-[#02281E]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-white border border-[#C8A15A]/20 space-y-1">
                  <span className="font-bold text-[#063C2D] uppercase tracking-wider text-[10px] block">
                    Customer Details
                  </span>
                  <p className="font-semibold text-[#02281E]">
                    {viewOrder.customerName}
                  </p>
                  <p className="text-[#1C211E]/80">{viewOrder.customerEmail}</p>
                  <p className="text-[#1C211E]/80">
                    Phone: +91 {viewOrder.customerPhone}
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#C8A15A]/20 space-y-1">
                  <span className="font-bold text-[#063C2D] uppercase tracking-wider text-[10px] block">
                    Delivery Address
                  </span>
                  <p className="font-semibold text-[#02281E]">
                    {viewOrder.shippingAddress.fullName} (
                    {viewOrder.shippingAddress.type || "Home"})
                  </p>
                  <p className="text-[#1C211E]/80">
                    {viewOrder.shippingAddress.street},{" "}
                    {viewOrder.shippingAddress.city},{" "}
                    {viewOrder.shippingAddress.state} -{" "}
                    {viewOrder.shippingAddress.pinCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-white border-t border-[#C8A15A]/20 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  const o = viewOrder;
                  setViewOrder(null);
                  handleOpenEdit(o);
                }}
                className="px-4 py-2 bg-[#02281E] text-[#D9BD82] hover:bg-[#0B5942] text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>

              <button
                onClick={() => handlePrintInvoice(viewOrder)}
                className="px-4 py-2 border border-[#C8A15A]/40 text-[#02281E] hover:bg-[#EDE4D5] text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#C8A15A]" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
