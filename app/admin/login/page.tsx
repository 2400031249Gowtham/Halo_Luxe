"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleStar } from "@/components/SparkleStar";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02281E] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(11,89,66,0.35)_0%,rgba(2,40,30,0.95)_70%)] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <SparkleStar size={14} color="#D9BD82" />
            <span className="text-xs font-sans uppercase tracking-[0.28em] text-[#D9BD82]">
              Management Portal
            </span>
            <SparkleStar size={14} color="#D9BD82" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#F4EEE4] tracking-wide uppercase">
            HALO ADMIN
          </h1>
          <p className="mt-2 text-xs font-sans text-[#EDE4D5]/70 tracking-wider">
            Sign in to manage tooth crystal catalogue and clinical inventory
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#063C2D]/60 backdrop-blur-md border border-[#C8A15A]/30 p-8 sm:p-10 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-sans flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-sans uppercase tracking-[0.18em] text-[#EDE4D5]/90 mb-2 font-medium"
              >
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C8A15A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@halosmiles.co"
                  className="w-full pl-10 pr-4 py-3 bg-[#02281E]/80 border border-[#C8A15A]/30 text-[#F4EEE4] text-xs font-sans placeholder-[#EDE4D5]/30 focus:outline-none focus:border-[#C8A15A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-sans uppercase tracking-[0.18em] text-[#EDE4D5]/90 mb-2 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C8A15A]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#02281E]/80 border border-[#C8A15A]/30 text-[#F4EEE4] text-xs font-sans placeholder-[#EDE4D5]/30 focus:outline-none focus:border-[#C8A15A] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-[#C8A15A] text-[#02281E] font-sans text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#D9BD82] transition-colors flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#C8A15A]/20 text-center">
            <p className="text-[11px] font-sans text-[#EDE4D5]/50">
              Authorized personnel only · Encrypted MongoDB Atlas connection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
