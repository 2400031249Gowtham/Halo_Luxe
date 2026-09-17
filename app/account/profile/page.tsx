"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomerAuth, SavedAddress } from "@/context/CustomerAuthContext";
import { SparkleStar } from "@/components/SparkleStar";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Phone,
  CheckCircle,
  ArrowRight,
  Shield,
  Loader2,
  Edit3,
} from "lucide-react";

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

export default function ProfilePage() {
  const { user, isLoading, refreshUser, openAuthModal } = useCustomerAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const startEditProfile = () => {
    if (!user) return;
    setEditName(user.name || "");
    setEditPhone(user.phone || "");
    setProfileError(null);
    setProfileMsg(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");

      await refreshUser();
      setProfileMsg("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Address inputs
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work">("Home");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          street,
          pinCode,
          state: stateName,
          city,
          area,
          type: addressType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add address.");

      await refreshUser();
      setSuccess("Address saved successfully!");
      setShowAddModal(false);
      // Reset inputs
      setStreet("");
      setPinCode("");
      setCity("");
      setArea("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EEE4] pt-32 pb-20 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8A15A] mx-auto mb-3" />
        <p className="text-xs font-sans uppercase tracking-widest text-[#02281E]/70">
          Loading Profile...
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
            Please Sign In
          </h2>
          <p className="text-xs font-sans text-[#1C211E]/70 mb-6">
            Sign in to view and manage your clinic delivery addresses.
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

  return (
    <div className="min-h-screen bg-[#F4EEE4] pt-28 pb-20 px-4 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SparkleStar size={12} color="#C8A15A" />
            <span className="text-[11px] font-sans uppercase tracking-[0.24em] text-[#063C2D]">
              Account Settings
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E]">
            Profile & Clinical Addresses
          </h1>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-sans flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: User Personal Details */}
          <div className="p-6 bg-white/90 border border-[#C8A15A]/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
              <h2 className="font-serif text-xl text-[#02281E]">
                Account Information
              </h2>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={startEditProfile}
                  className="inline-flex items-center gap-1 text-[11px] font-sans uppercase tracking-wider text-[#C8A15A] hover:text-[#02281E] font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {profileMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans">
                {profileError}
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-wider text-[#063C2D] font-bold mb-1">
                    Name / Clinic *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#C8A15A]/40 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#02281E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-wider text-[#063C2D] font-bold mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 text-xs font-sans text-[#1C211E]/60 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">Email cannot be changed directly</span>
                </div>

                <div>
                  <label className="block text-[10px] font-sans uppercase tracking-wider text-[#063C2D] font-bold mb-1">
                    Mobile Number (10 digits)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-sans text-[#1C211E]/60 font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile"
                      className="w-full pl-11 pr-3 py-2 bg-white border border-[#C8A15A]/40 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#02281E]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 py-2 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D9BD82]" />}
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    disabled={savingProfile}
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-2 border border-gray-300 text-xs font-sans uppercase tracking-wider text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="text-[#063C2D] font-bold block uppercase tracking-wider text-[10px]">
                    Name / Clinic
                  </span>
                  <p className="font-semibold text-sm text-[#02281E] mt-0.5">
                    {user.name}
                  </p>
                </div>
                <div>
                  <span className="text-[#063C2D] font-bold block uppercase tracking-wider text-[10px]">
                    Email Address
                  </span>
                  <p className="text-[#1C211E]/80 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-[#063C2D] font-bold block uppercase tracking-wider text-[10px]">
                    Phone Number
                  </span>
                  <p className="text-[#1C211E]/80 mt-0.5">
                    {user.phone ? `+91 ${user.phone}` : "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-[#063C2D] font-bold block uppercase tracking-wider text-[10px]">
                    Account Status
                  </span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ● Verified Customer
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#C8A15A]/20">
              <button
                onClick={() => openAuthModal("forgot_password")}
                className="text-xs font-sans text-[#C8A15A] hover:underline block"
              >
                Reset Account Password →
              </button>
            </div>
          </div>

          {/* Right: Saved Addresses Manager */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 bg-white/90 border border-[#C8A15A]/30 space-y-5">
              <div className="flex items-center justify-between border-b border-[#C8A15A]/20 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#C8A15A]" />
                  <h2 className="font-serif text-xl text-[#02281E]">
                    Delivery Addresses ({user.addresses?.length || 0})
                  </h2>
                </div>

                <button
                  onClick={() => setShowAddModal(!showAddModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#02281E] text-[#D9BD82] hover:bg-[#0B5942] transition-colors text-xs font-sans uppercase tracking-wider font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddModal ? "Cancel" : "Add Address"}</span>
                </button>
              </div>

              {/* Add Address Form Accordion */}
              {showAddModal && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 bg-[#FAF6F0] border border-[#C8A15A]/30 space-y-3.5 animate-in fade-in"
                >
                  <h3 className="font-serif text-base text-[#02281E] font-medium">
                    New Clinical Delivery Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-sans uppercase text-[#063C2D] font-semibold mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Dr. Suprasna Sharan"
                        className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-sans uppercase text-[#063C2D] font-semibold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#063C2D] font-semibold mb-1">
                      Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Clinic / Building name, street name"
                      className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-sans uppercase text-[#063C2D] font-semibold mb-1">
                        Pin Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="600044"
                        className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-sans uppercase text-[#063C2D] font-semibold mb-1">
                        State *
                      </label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-sans uppercase text-[#063C2D] font-semibold mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Chennai"
                        className="w-full px-3 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <span>Save Address</span>
                    )}
                  </button>
                </form>
              )}

              {/* Addresses List */}
              {user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 bg-white border border-[#C8A15A]/25 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-medium text-[#02281E]">
                            {addr.fullName}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-sans uppercase font-bold tracking-wider bg-[#EDE4D5] text-[#063C2D] rounded">
                            {addr.type || "Home"}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-sans text-emerald-700 font-semibold">
                              (Default)
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-sans text-[#1C211E]/80">
                          {addr.street}
                          {addr.area ? `, ${addr.area}` : ""}, {addr.city},{" "}
                          {addr.state} - {addr.pinCode}
                        </p>
                        <p className="text-xs font-sans text-[#063C2D]">
                          Phone: +91 {addr.phone}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-sans text-[#1C211E]/60 italic">
                  No saved delivery addresses found. Add one above for quicker checkout.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
