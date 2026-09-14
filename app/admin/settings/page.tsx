"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, Database, Server } from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("HALO");
  const [currency, setCurrency] = useState("INR");
  const [defaultVisibility, setDefaultVisibility] = useState("draft");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="pb-4 border-b border-[#C8A15A]/25">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#02281E] font-normal tracking-wide">
          Admin Settings
        </h1>
        <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
          Store configurations, database environment status, and catalogue defaults
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-sans rounded flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-5">
          <h2 className="font-serif text-xl text-[#02281E] font-normal border-b border-[#C8A15A]/20 pb-3">
            Storefront Configuration
          </h2>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2">
              Default Product Visibility on Creation
            </label>
            <select
              value={defaultVisibility}
              onChange={(e) => setDefaultVisibility(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 bg-white/90 border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
            >
              <option value="draft">Draft (Review before publishing)</option>
              <option value="published">Published (Immediately live)</option>
            </select>
          </div>
        </div>

        {/* Database & Infrastructure Status */}
        <div className="bg-[#EDE4D5]/40 border border-[#C8A15A]/25 p-6 sm:p-8 space-y-4">
          <h2 className="font-serif text-xl text-[#02281E] font-normal border-b border-[#C8A15A]/20 pb-3">
            Infrastructure & Atlas Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/80 border border-[#C8A15A]/20 flex items-start gap-3">
              <Database className="w-5 h-5 text-[#063C2D] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-[#1C211E]/60 block">
                  Database Cluster
                </span>
                <span className="font-sans text-xs font-semibold text-[#02281E] block">
                  HALO-Production (MongoDB Atlas)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 block mt-0.5">
                  Database: halo · Mongoose Active
                </span>
              </div>
            </div>

            <div className="p-4 bg-white/80 border border-[#C8A15A]/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#063C2D] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-[#1C211E]/60 block">
                  Authentication & Role Guard
                </span>
                <span className="font-sans text-xs font-semibold text-[#02281E] block">
                  Encrypted JWT Sessions
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  HttpOnly Secure Cookies Enabled
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#063C2D] hover:bg-[#0B5942] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
        >
          SAVE SETTINGS
        </button>
      </form>
    </div>
  );
}
