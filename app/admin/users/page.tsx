"use client";

import React, { useState, useEffect } from "react";
import { SparkleStar } from "@/components/SparkleStar";
import {
  Users,
  UserCheck,
  TrendingUp,
  Search,
  RotateCcw,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Edit,
  X,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface CustomerRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: "active" | "inactive";
  isVerified?: boolean;
  addresses?: any[];
  wishlist?: any[];
  createdAt: string;
}

interface StatsData {
  total: number;
  new30Days: number;
  existing: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    new30Days: 0,
    existing: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Modal (Matching Screenshot 2)
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCustomersWithParams = async (sTerm = search, stFilter = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sTerm.trim()) params.append("search", sTerm.trim());
      if (stFilter !== "all") params.append("status", stFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.users || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = () => fetchCustomersWithParams(search, statusFilter);

  useEffect(() => {
    fetchCustomersWithParams(search, statusFilter);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomersWithParams(search, statusFilter);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    fetchCustomersWithParams("", "all");
  };

  // Quick toggle active / inactive status
  const handleToggleStatus = async (c: CustomerRecord) => {
    const nextStatus = c.status === "inactive" ? "active" : "inactive";
    setTogglingId(c._id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: c._id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((item) =>
            item._id === c._id ? { ...item, status: nextStatus } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (c: CustomerRecord) => {
    setEditingCustomer(c);
    setEditName(c.name || "");
    setEditPhone(c.phone || "");
    setEditStatus(c.status === "inactive" ? "inactive" : "active");
    setErrorMsg(null);
  };

  // Submit Edit
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const cleanPhone = editPhone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setUpdating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingCustomer._id,
          name: editName,
          phone: cleanPhone,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update customer");

      // Update state locally & refresh
      setCustomers((prev) =>
        prev.map((item) =>
          item._id === editingCustomer._id
            ? { ...item, name: editName, phone: cleanPhone, status: editStatus }
            : item
        )
      );
      setEditingCustomer(null);
      await fetchCustomers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdating(false);
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
              Clientèle Management
            </span>
          </div>
          <h1 className="font-serif text-3xl text-[#02281E] mt-1 font-normal">
            Customer Directory
          </h1>
          <p className="text-xs font-sans text-[#1C211E]/70 mt-0.5">
            Manage registered dental professionals and customer clinic accounts
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#C8A15A]/30 bg-white text-[#02281E] hover:bg-[#EDE4D5] transition-colors text-xs font-sans uppercase tracking-wider font-semibold self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 3 STATS CARDS (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Customers */}
        <div className="p-5 bg-white border border-[#C8A15A]/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold">
              Total Customers
            </p>
            <span className="font-serif text-3xl font-bold text-[#02281E] mt-1 block">
              {stats.total}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#EDE4D5] text-[#02281E] flex items-center justify-center border border-[#C8A15A]/30">
            <Users className="w-6 h-6 text-[#063C2D]" />
          </div>
        </div>

        {/* Card 2: New Customers (30 days) */}
        <div className="p-5 bg-white border border-[#C8A15A]/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold">
              New Customers (30 days)
            </p>
            <span className="font-serif text-3xl font-bold text-[#02281E] mt-1 block">
              {stats.new30Days}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        {/* Card 3: Existing Customers */}
        <div className="p-5 bg-white border border-[#C8A15A]/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold">
              Existing Customers
            </p>
            <span className="font-serif text-3xl font-bold text-[#02281E] mt-1 block">
              {stats.existing}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <UserCheck className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* FILTER BAR (Matching Screenshot 1) */}
      <div className="p-4 bg-white/80 border border-[#C8A15A]/30 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-3 flex-1"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-wider font-semibold"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-2 bg-[#EDE4D5] text-[#02281E] hover:bg-[#E5DAC8] transition-colors text-xs font-sans uppercase tracking-wider"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* CUSTOMERS TABLE (Matching Screenshot 1 in HALO Luxury Theme) */}
      <div className="bg-white border border-[#C8A15A]/30 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#02281E] text-[#F4EEE4] text-[11px] font-sans uppercase tracking-[0.16em] border-b-2 border-[#C8A15A]">
              <th className="py-3.5 px-4 font-semibold">Customer</th>
              <th className="py-3.5 px-4 font-semibold">Contact</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold">Verification</th>
              <th className="py-3.5 px-4 font-semibold">Joined</th>
              <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EDE4D5] text-xs font-sans">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[#1C211E]/60">
                  <Loader2 className="w-7 h-7 animate-spin text-[#C8A15A] mx-auto mb-2" />
                  <span className="uppercase tracking-widest text-[11px]">
                    Loading registered customers...
                  </span>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[#1C211E]/60">
                  <Users className="w-10 h-10 text-[#C8A15A] mx-auto mb-2 opacity-60" />
                  <p className="font-serif text-lg text-[#02281E]">
                    No registered customers found
                  </p>
                  <p className="text-[11px] text-[#1C211E]/60 mt-0.5">
                    Customer registrations will appear here automatically.
                  </p>
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const initial = (c.name || c.email || "C").charAt(0).toUpperCase();
                const shortId = c._id.substring(c._id.length - 8);
                const joinDate = new Date(c.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );
                const isActive = c.status !== "inactive";

                return (
                  <tr key={c._id} className="hover:bg-[#FAF6F0] transition-colors">
                    {/* Customer Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EDE4D5] text-[#02281E] font-serif font-bold text-sm flex items-center justify-center border border-[#C8A15A]/30 shrink-0">
                          {initial}
                        </div>
                        <div>
                          <span className="font-serif font-semibold text-sm text-[#02281E] block">
                            {c.name || "Customer"}
                          </span>
                          <span className="text-[10px] text-[#1C211E]/50 font-mono">
                            ID: {shortId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#1C211E]/80">
                        <Mail className="w-3.5 h-3.5 text-[#063C2D]/60 shrink-0" />
                        <span className="font-mono text-[11px]">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-[#C8A15A] shrink-0" />
                        {c.phone ? (
                          <span className="text-[#063C2D] font-semibold">+91 {c.phone}</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#1C211E]/40 italic">Not provided</span>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(c)}
                              className="text-[10px] text-[#C8A15A] hover:text-[#02281E] font-semibold underline not-italic"
                            >
                              + Add Phone
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        disabled={togglingId === c._id}
                        onClick={() => handleToggleStatus(c)}
                        title={`Click to set as ${isActive ? "Inactive" : "Active"}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer hover:shadow-xs active:scale-95 disabled:opacity-50 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        <span>{isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Verification Column */}
                    <td className="py-3.5 px-4 space-y-1">
                      {c.isVerified !== false ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Email (OTP Verified)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Email Pending</span>
                        </div>
                      )}

                      {c.phone ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Phone Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700/80">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Phone Pending</span>
                        </div>
                      )}
                    </td>

                    {/* Joined Date Column */}
                    <td className="py-3.5 px-4 text-[11px] text-[#1C211E]/70 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C8A15A]" />
                        <span>{joinDate}</span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-[#063C2D] hover:text-[#C8A15A] hover:bg-[#EDE4D5] rounded transition-colors"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================== */}
      {/* EDIT CUSTOMER MODAL (Matching Screenshot 2)              */}
      {/* ======================================================== */}
      {editingCustomer && (
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
                  Edit Customer
                </h3>
                <p className="text-xs font-sans text-[#D9BD82] mt-0.5">
                  ID: {editingCustomer._id.substring(editingCustomer._id.length - 8)}
                </p>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-[#F4EEE4]/70 hover:text-[#D9BD82] transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Matching Screenshot 2) */}
            <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
                  {errorMsg}
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                />
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={editingCustomer.email}
                  className="w-full px-3.5 py-2.5 bg-[#EDE4D5]/40 border border-[#C8A15A]/20 text-xs font-sans text-[#1C211E]/70 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                  Phone (10 Digits) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-sans text-[#1C211E]/60 font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3.5 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                  Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "active" | "inactive")
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#C8A15A]/20">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
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
                    <span>Update Customer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
