"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { SparkleStar } from "@/components/SparkleStar";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  ArrowRight,
  User,
  Clock,
  Loader2,
} from "lucide-react";

export default function AccountDashboardPage() {
  const { user, isLoading, openAuthModal } = useCustomerAuth();
  const { wishlistCount } = useWishlist();
  const { totalItems } = useCart();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadRecent() {
      if (!user) return;
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setRecentOrders((data.orders || []).slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to load dashboard orders", e);
      }
    }
    loadRecent();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EEE4] pt-32 pb-20 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A15A] mx-auto mb-3" />
        <p className="text-xs font-sans uppercase tracking-widest text-[#02281E]/70">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4EEE4] pt-32 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white/90 border border-[#C8A15A]/30 p-8 shadow-sm">
          <User className="w-12 h-12 text-[#C8A15A] mx-auto mb-3" />
          <h2 className="font-serif text-2xl text-[#02281E] mb-2">
            Customer Dashboard
          </h2>
          <p className="text-xs font-sans text-[#1C211E]/70 mb-6">
            Sign in to view your order tracking, clinical invoices, and saved items.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="px-6 py-2.5 bg-[#02281E] text-[#F4EEE4] text-xs font-sans uppercase tracking-wider font-semibold hover:bg-[#0B5942]"
          >
            Sign In with OTP / Password
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "My Orders",
      count: recentOrders.length > 0 ? `${recentOrders.length} placed` : "Track Shipments",
      icon: Package,
      href: "/account/orders",
      action: "View Orders",
    },
    {
      title: "Wishlist",
      count: `${wishlistCount} saved`,
      icon: Heart,
      href: "/account/wishlist",
      action: "View Wishlist",
    },
    {
      title: "Active Bag",
      count: `${totalItems} items`,
      icon: ShoppingBag,
      href: "/cart",
      action: "Review Cart",
    },
    {
      title: "Clinic Addresses",
      count: `${user.addresses?.length || 0} saved`,
      icon: MapPin,
      href: "/account/profile",
      action: "Manage Addresses",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="p-8 bg-[#02281E] text-[#F4EEE4] border border-[#C8A15A]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#C8A15A] text-[#02281E] font-serif text-2xl font-bold flex items-center justify-center border-2 border-[#D9BD82]">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SparkleStar size={12} color="#D9BD82" />
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#D9BD82]">
                  HALO Customer
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal mt-0.5">
                Welcome back, {user.name}
              </h1>
              <p className="text-xs font-sans text-emerald-100/70 mt-1">
                {user.email}
              </p>
            </div>
          </div>

          <Link
            href="/shop"
            className="self-start sm:self-auto px-5 py-2.5 bg-[#C8A15A] text-[#02281E] hover:bg-[#D9BD82] transition-colors text-xs font-sans uppercase tracking-[0.16em] font-semibold"
          >
            Order Tooth Crystals
          </Link>
        </div>

        {/* 4 Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className="p-5 bg-white border border-[#C8A15A]/25 hover:border-[#C8A15A] transition-all hover:shadow-xs group flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg text-[#02281E] group-hover:text-[#063C2D]">
                    {c.title}
                  </span>
                  <Icon className="w-5 h-5 text-[#C8A15A]" />
                </div>
                <div>
                  <p className="text-xs font-sans text-[#1C211E]/70">
                    {c.count}
                  </p>
                  <p className="text-[11px] font-sans uppercase tracking-wider text-[#063C2D] font-semibold mt-2 flex items-center gap-1">
                    <span>{c.action}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Orders Section */}
        <div className="p-6 bg-white border border-[#C8A15A]/25 space-y-4">
          <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
            <h2 className="font-serif text-xl text-[#02281E]">
              Recent Orders
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-sans uppercase tracking-wider text-[#C8A15A] hover:underline font-semibold"
            >
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs font-sans text-[#1C211E]/60 italic py-4">
              No recent orders found. Check out our latest collections.
            </p>
          ) : (
            <div className="divide-y divide-[#EDE4D5]">
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-semibold text-[#02281E]">
                        {ord.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                        ● {ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-[#1C211E]/70 text-[11px] mt-0.5">
                      {ord.items.length} {ord.items.length === 1 ? "item" : "items"} · Placed on{" "}
                      {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <span className="font-serif text-base font-bold text-[#02281E]">
                      {formatPrice(ord.total)}
                    </span>
                    <Link
                      href="/account/orders"
                      className="px-3 py-1.5 border border-[#C8A15A]/40 text-[#02281E] hover:bg-[#EDE4D5]/50 text-[11px] font-sans uppercase tracking-wider font-semibold"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
