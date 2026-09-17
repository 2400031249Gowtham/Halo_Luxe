"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth, SavedAddress } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/lib/utils";
import { SparkleStar } from "@/components/SparkleStar";
import {
  Shield,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { user, openAuthModal, refreshUser } = useCustomerAuth();

  // Address states
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address form inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work">("Home");
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Checkout process
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Sync user addresses
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setSavedAddresses(user.addresses);
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
      setShowNewAddressForm(false);
    } else {
      setShowNewAddressForm(true);
      if (user?.name) setFullName(user.name);
      if (user?.phone) setPhone(user.phone);
    }
  }, [user]);

  // Handle Save New Address
  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !phone || !street || !pinCode || !stateName || !city) {
      setError("Please fill in all mandatory address fields.");
      return;
    }

    const tempId = "addr_" + Date.now();
    const newAddr: SavedAddress = {
      id: tempId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      pinCode: pinCode.trim(),
      state: stateName.trim(),
      city: city.trim(),
      area: area.trim(),
      type: addressType,
      isDefault: savedAddresses.length === 0,
    };

    if (user) {
      try {
        const res = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddr),
        });
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(data.addresses);
          setSelectedAddressId(newAddr.id);
          setShowNewAddressForm(false);
          await refreshUser();
          return;
        }
      } catch (err) {
        console.error("Failed to save address", err);
      }
    }

    // Guest fallback
    setSavedAddresses((prev) => [...prev, newAddr]);
    setSelectedAddressId(tempId);
    setShowNewAddressForm(false);
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (user) {
      try {
        const res = await fetch(`/api/user/addresses?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(data.addresses);
          if (selectedAddressId === id) {
            setSelectedAddressId(data.addresses[0]?.id || "");
            if (data.addresses.length === 0) setShowNewAddressForm(true);
          }
          await refreshUser();
          return;
        }
      } catch (err) {
        console.error("Failed to delete address", err);
      }
    }

    const remaining = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(remaining);
    if (selectedAddressId === id) {
      setSelectedAddressId(remaining[0]?.id || "");
      if (remaining.length === 0) setShowNewAddressForm(true);
    }
  };

  // Proceed with Razorpay Online Payment
  const handleProceedToRazorpay = async () => {
    setError(null);

    // Identify selected shipping address
    let activeAddress: SavedAddress | undefined = savedAddresses.find(
      (a) => a.id === selectedAddressId
    );

    if (showNewAddressForm || !activeAddress) {
      if (!fullName || !phone || !street || !pinCode || !stateName || !city) {
        setError("Please complete your delivery address before proceeding.");
        return;
      }
      activeAddress = {
        id: "addr_temp",
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        pinCode: pinCode.trim(),
        state: stateName.trim(),
        city: city.trim(),
        area: area.trim(),
        type: addressType,
      };
    }

    if (!window.Razorpay) {
      setError("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Razorpay order on backend
      const createRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: subtotal,
          items,
          customerEmail: user?.email || "",
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment gateway.");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HALO Luxury Dental Crystals",
        description: `Order for ${totalItems} crystal items`,
        image: "/images/editorial-smile.jpg",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify Razorpay signature and persist confirmed order
            const verifyRes = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                items,
                shippingAddress: activeAddress,
                subtotal,
                discount: 0,
                shippingFee: 0,
                tax: 0,
                total: subtotal,
                customerEmail: user?.email || "",
                customerName: activeAddress?.fullName || user?.name || "Customer",
                customerPhone: activeAddress?.phone || "",
                saveAddressToProfile: saveToProfile,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed. Please contact support."
              );
            }

            clearCart();
            router.push(`/account/orders?success=1&orderId=${verifyData.orderId}`);
          } catch (verifyErr: any) {
            setError(verifyErr.message || "Payment verification encountered an issue.");
            setLoading(false);
          }
        },
        prefill: {
          name: activeAddress.fullName,
          email: user?.email || "",
          contact: activeAddress.phone,
        },
        theme: {
          color: "#02281E",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failResponse: any) {
        setError(
          failResponse.error?.description || "Payment failed. Please try another method."
        );
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || "Could not start checkout.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4EEE4] pt-32 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white/80 border border-[#C8A15A]/30 p-8">
          <h2 className="font-serif text-2xl text-[#02281E] mb-2">No items to checkout</h2>
          <p className="text-xs font-sans text-[#1C211E]/70 mb-6">
            Please add crystals or accessories to your cart first.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#02281E] text-[#F4EEE4] text-xs font-sans uppercase tracking-wider"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Step Progress Indicator (Matching Image 3 Breadcrumbs in HALO Luxury Theme) */}
        <div className="mb-8 border-b border-[#C8A15A]/25 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-[#063C2D] hover:text-[#C8A15A]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </Link>

            {/* Breadcrumb Steps */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-sans tracking-wider">
              <span className="text-[#1C211E]/50">Summary</span>
              <span className="text-[#C8A15A]">›</span>
              <span className="text-[#02281E] font-bold border-b-2 border-[#C8A15A] pb-0.5">
                Address
              </span>
              <span className="text-[#C8A15A]">›</span>
              <span className="text-[#1C211E]/50">Payment (Online)</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
            {error}
          </div>
        )}

        {/* Not Logged In Notice */}
        {!user && (
          <div className="mb-6 p-4 bg-[#EDE4D5]/60 border border-[#C8A15A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-sans text-[#02281E]">
              <strong>Have a HALO Account?</strong> Sign in to access your saved clinic addresses and order history.
            </div>
            <button
              onClick={() => openAuthModal("login")}
              className="px-4 py-2 bg-[#02281E] text-[#D9BD82] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-wider font-semibold self-start sm:self-auto"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Delivery Address Section (Matching Image 3 & 4) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header: Delivery Address */}
            <div className="flex items-center justify-between pb-3 border-b border-[#C8A15A]/25">
              <div className="flex items-center gap-2 text-lg font-serif text-[#02281E]">
                <MapPin className="w-5 h-5 text-[#C8A15A]" />
                <span>Delivery Address</span>
              </div>

              {savedAddresses.length > 0 && !showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-[#C8A15A] hover:text-[#02281E] font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* SAVED ADDRESSES SELECTOR (Matching Image 4) */}
            {savedAddresses.length > 0 && !showNewAddressForm && (
              <div className="space-y-4">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 bg-white border cursor-pointer transition-all duration-200 flex items-start justify-between gap-4 ${
                        isSelected
                          ? "border-[#C8A15A] ring-2 ring-[#C8A15A]/40 shadow-sm"
                          : "border-[#C8A15A]/25 hover:border-[#C8A15A]/60"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Radio Selector */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                            isSelected
                              ? "border-[#02281E] bg-[#02281E]"
                              : "border-[#C8A15A]"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#D9BD82]" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-semibold text-[#02281E]">
                              {addr.fullName}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-sans uppercase font-bold tracking-wider bg-[#EDE4D5] text-[#063C2D] rounded">
                              {addr.type || "Home"}
                            </span>
                          </div>

                          <p className="text-xs font-sans text-[#1C211E]/80 leading-relaxed">
                            {addr.street}
                            {addr.area ? `, ${addr.area}` : ""}, {addr.city},{" "}
                            {addr.state} - <strong>{addr.pinCode}</strong>
                          </p>

                          <p className="text-xs font-sans text-[#063C2D] flex items-center gap-1.5 pt-1">
                            <Phone className="w-3.5 h-3.5 text-[#C8A15A]" />
                            <span>+91 {addr.phone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(addr.id);
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-800 transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ADD NEW ADDRESS FORM (Matching Image 3) */}
            {showNewAddressForm && (
              <form
                onSubmit={handleAddNewAddress}
                className="p-6 bg-white/80 border border-[#C8A15A]/30 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#C8A15A]/20">
                  <h3 className="font-serif text-lg text-[#02281E]">
                    Enter Delivery Details
                  </h3>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs font-sans text-[#C8A15A] hover:underline"
                    >
                      Use Saved Address
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Suprasna Sharan"
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Phone Number *
                    </label>
                    <div className="flex">
                      <span className="px-3 py-2.5 bg-[#EDE4D5] border border-r-0 border-[#C8A15A]/30 text-xs font-sans text-[#02281E] font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="10-digit mobile number"
                        className="flex-1 px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                    Street Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="House/Clinic/Flat no., Building name, Street name"
                    className="w-full px-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Pin Code */}
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Pin Code *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) =>
                        setPinCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="6-digit pin code"
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      State *
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City (e.g. Chennai)"
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                    />
                  </div>
                </div>

                {/* Area / Locality */}
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                    Area / Locality
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area, sector, or landmark"
                    className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                  />
                </div>

                {/* Address Type */}
                <div className="flex items-center gap-6 pt-1">
                  <span className="text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium">
                    Type:
                  </span>
                  <label className="flex items-center gap-2 text-xs font-sans text-[#02281E] cursor-pointer">
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressType === "Home"}
                      onChange={() => setAddressType("Home")}
                    />
                    <span>Home</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-sans text-[#02281E] cursor-pointer">
                    <input
                      type="radio"
                      name="addrType"
                      checked={addressType === "Work"}
                      onChange={() => setAddressType("Work")}
                    />
                    <span>Work / Clinic</span>
                  </label>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="submit"
                    className="mt-3 px-6 py-2.5 bg-[#C8A15A] text-[#02281E] text-xs font-sans uppercase tracking-wider font-semibold hover:bg-[#D9BD82] transition-colors"
                  >
                    Save & Use Address
                  </button>
                )}
              </form>
            )}

            {/* Policy Reminder */}
            <div className="p-4 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#C8A15A] shrink-0" />
              <p className="text-xs font-sans text-[#1C211E]/80">
                <strong>Online Payments Only:</strong> As requested, orders are processed strictly via secure online payments. Cash on delivery is not accepted.
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary & Razorpay Trigger (Matching Image 3 & 4 Bottom Card) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-6 bg-white/90 border border-[#C8A15A]/30 shadow-sm space-y-5">
              <h2 className="font-serif text-2xl text-[#02281E] border-b border-[#C8A15A]/20 pb-3">
                Order Review
              </h2>

              {/* Items preview */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex items-center justify-between text-xs font-sans"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 bg-[#EDE4D5] relative shrink-0 border border-[#C8A15A]/20">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-[#02281E] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-[#1C211E]/60">
                          Qty: {item.quantity} · {item.selectedSize}
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-[#02281E] shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-[#C8A15A]/20 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-[#1C211E]/80">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-[#02281E]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#1C211E]/80">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-700">Free</span>
                </div>
                <div className="flex justify-between text-[#1C211E]/60 text-[11px]">
                  <span>GST (18%)</span>
                  <span>Included</span>
                </div>

                <div className="pt-3 border-t border-[#C8A15A]/20 flex items-baseline justify-between">
                  <span className="font-serif text-lg text-[#02281E]">
                    Total Payable
                  </span>
                  <span className="font-serif text-3xl text-[#02281E] font-bold">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Proceed to Razorpay Button */}
              <button
                onClick={handleProceedToRazorpay}
                disabled={loading}
                className="w-full py-3.5 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    <span>Launching Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4 text-[#D9BD82] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {/* Razorpay Trust Badge (Matching Image 3 & 4) */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-sans text-[#1C211E]/70 pt-2 border-t border-[#C8A15A]/15">
                <Lock className="w-3.5 h-3.5 text-[#C8A15A]" />
                <span>Secured by <strong>Razorpay</strong> 🔒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
