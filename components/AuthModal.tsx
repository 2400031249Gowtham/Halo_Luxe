"use client";

import React, { useState } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { SparkleStar } from "@/components/SparkleStar";
import { X, Mail, Lock, User, Phone, CheckCircle, ArrowRight, Loader2, KeyRound } from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    setUser,
    refreshUser,
    setIsDrawerOpen,
  } = useCustomerAuth();

  // Registration sub-steps: 1 = Email, 2 = OTP, 3 = Password & Profile
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  // Forgot password sub-steps: 1 = Email, 2 = OTP, 3 = New Password
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);

  // Common input states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
    setRegStep(1);
    setForgotStep(1);
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  };

  const switchTab = (tab: "login" | "register" | "forgot_password") => {
    resetState();
    openAuthModal(tab);
  };

  // 1. Direct Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign in.");

      setUser(data.user);
      closeAuthModal();
      setIsDrawerOpen(true);
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Register: Send OTP
  const handleSendRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "register" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code.");

      setSuccessMsg("Verification code sent to your email inbox!");
      setRegStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Register: Verify OTP
  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "register" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code.");

      setSuccessMsg(null);
      setRegStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Register: Complete Account with Password & Name
  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          password,
          name: name.trim() || email.split("@")[0],
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");

      setUser(data.user);
      closeAuthModal();
      setIsDrawerOpen(true);
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password: Send OTP
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "forgot_password" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset code.");

      setSuccessMsg("Password reset code sent to your email!");
      setForgotStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password: Verify OTP
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "forgot_password" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code.");

      setSuccessMsg(null);
      setForgotStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");

      setUser(data.user);
      closeAuthModal();
      setIsDrawerOpen(true);
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02281E]/75 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#F4EEE4] border border-[#C8A15A]/40 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#02281E] px-6 py-5 border-b border-[#C8A15A]/30 flex items-center justify-between text-[#F4EEE4]">
          <div className="flex items-center gap-2">
            <SparkleStar size={14} color="#D9BD82" />
            <span className="font-serif text-xl tracking-wider text-[#F4EEE4]">
              HALO <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#C8A15A]">Account</span>
            </span>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-[#F4EEE4]/70 hover:text-[#D9BD82] transition-colors p-1"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {authModalTab !== "forgot_password" && (
          <div className="grid grid-cols-2 bg-[#EDE4D5] border-b border-[#C8A15A]/20">
            <button
              onClick={() => switchTab("login")}
              className={`py-3 text-xs font-sans uppercase tracking-[0.16em] font-semibold transition-colors ${
                authModalTab === "login"
                  ? "bg-[#F4EEE4] text-[#02281E] border-b-2 border-[#C8A15A]"
                  : "text-[#1C211E]/60 hover:text-[#02281E]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`py-3 text-xs font-sans uppercase tracking-[0.16em] font-semibold transition-colors ${
                authModalTab === "register"
                  ? "bg-[#F4EEE4] text-[#02281E] border-b-2 border-[#C8A15A]"
                  : "text-[#1C211E]/60 hover:text-[#02281E]"
              }`}
            >
              Register (OTP)
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-5">
          {/* Notification Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN                                             */}
          {/* ======================================================== */}
          {authModalTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@dentalclinic.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchTab("forgot_password")}
                    className="text-[11px] font-sans text-[#C8A15A] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-[#D9BD82]" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs font-sans text-[#1C211E]/70">
                  New to HALO?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => switchTab("register")}
                  className="text-xs font-sans font-semibold text-[#C8A15A] hover:underline"
                >
                  Create Account with OTP
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REGISTER (OTP)                                    */}
          {/* ======================================================== */}
          {authModalTab === "register" && (
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        regStep >= step
                          ? "bg-[#02281E] text-[#D9BD82] border border-[#C8A15A]"
                          : "bg-[#EDE4D5] text-[#1C211E]/40"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 h-[2px] ${
                          regStep > step ? "bg-[#C8A15A]" : "bg-[#EDE4D5]"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Reg Step 1: Input Email */}
              {regStep === 1 && (
                <form onSubmit={handleSendRegisterOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1.5">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@dentalclinic.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                      />
                    </div>
                    <p className="text-[11px] font-sans text-[#1C211E]/60 mt-1.5">
                      We will send a 6-digit verification code to this email via Gmail.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <>
                        <span>Get Verification OTP</span>
                        <ArrowRight className="w-4 h-4 text-[#D9BD82]" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Reg Step 2: Input OTP */}
              {regStep === 2 && (
                <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                  <div className="text-center">
                    <span className="text-xs font-sans text-[#1C211E]/70">
                      Enter the 6-digit code sent to{" "}
                      <strong className="text-[#02281E]">{email}</strong>
                    </span>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-white border border-[#C8A15A]/40 text-[#02281E] focus:outline-none focus:border-[#02281E]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-sans">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-[#1C211E]/60 hover:text-[#02281E]"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleSendRegisterOtp}
                      className="text-[#C8A15A] hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </form>
              )}

              {/* Reg Step 3: Name & Password Setup */}
              {regStep === 3 && (
                <form onSubmit={handleCompleteRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Full Name / Clinic Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Suprasna Sharan"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-semibold mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-sans text-[#1C211E]/60 font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-16 pr-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Create Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#063C2D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <>
                        <span>Create Account & Sign In</span>
                        <CheckCircle className="w-4 h-4 text-[#D9BD82]" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: FORGOT PASSWORD                                   */}
          {/* ======================================================== */}
          {authModalTab === "forgot_password" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#C8A15A]/20">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C8A15A]" />
                  <span className="font-serif text-lg text-[#02281E]">
                    Recover Password
                  </span>
                </div>
                <button
                  onClick={() => switchTab("login")}
                  className="text-xs font-sans text-[#C8A15A] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>

              {forgotStep === 1 && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <p className="text-xs font-sans text-[#1C211E]/70">
                    Enter your account email to receive a password recovery verification code.
                  </p>
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@dentalclinic.com"
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none focus:border-[#C8A15A]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <span>Send Recovery Code</span>
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                  <p className="text-xs font-sans text-[#1C211E]/70 text-center">
                    Enter the 6-digit recovery code sent to <strong>{email}</strong>
                  </p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-white border border-[#C8A15A]/40 text-[#02281E] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans uppercase tracking-wider text-[#063C2D] font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-white border border-[#C8A15A]/30 text-xs font-sans text-[#02281E] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#02281E] text-[#F4EEE4] hover:bg-[#0B5942] transition-colors font-sans text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D9BD82]" />
                    ) : (
                      <span>Reset Password & Sign In</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
