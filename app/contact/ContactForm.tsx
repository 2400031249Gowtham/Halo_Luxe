"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { SparkleStar } from "@/components/SparkleStar";
import { CheckCircle2, AlertCircle, Send, MessageSquare } from "lucide-react";

export function ContactForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "Product enquiry";
  const initialOrder = searchParams.get("order") || "";

  const [formData, setFormData] = useState({
    name: "",
    clinicName: "",
    email: "",
    phone: "",
    enquiryType: initialType,
    message: initialOrder ? `Inquiry for order: ${initialOrder}` : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialType) {
      setFormData((prev) => ({ ...prev, enquiryType: initialType }));
    }
    if (initialOrder) {
      setFormData((prev) => ({
        ...prev,
        message: `Clinic order request: ${initialOrder}`,
      }));
    }
  }, [initialType, initialOrder]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Please enter your name";
    if (!formData.email.trim()) {
      errs.email = "Please enter your email address";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      errs.phone = "Please enter your contact phone number";
    }
    if (!formData.message.trim()) {
      errs.message = "Please share details about your inquiry";
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    startTransition(() => {
      // Simulate clean submission
      setTimeout(() => {
        setIsSubmitted(true);
      }, 500);
    });
  };

  if (isSubmitted) {
    return (
      <div className="p-8 sm:p-12 bg-[#EDE4D5]/60 border border-[#C8A15A]/30 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#063C2D] text-[#D9BD82] flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-3xl text-[#02281E] mb-3">
          Inquiry Received
        </h3>

        <p className="text-xs sm:text-sm font-sans text-[#1C211E]/80 leading-relaxed mb-6">
          Thank you, <strong>{formData.name}</strong>. Our dental concierge team has received your <em>{formData.enquiryType}</em> and will contact your clinic shortly via email ({formData.email}) or phone ({formData.phone}).
        </p>

        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              clinicName: "",
              email: "",
              phone: "",
              enquiryType: "Product enquiry",
              message: "",
            });
          }}
          className="text-xs font-sans uppercase tracking-[0.18em] text-[#063C2D] hover:text-[#C8A15A] font-semibold underline underline-offset-4"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="p-8 sm:p-10 bg-[#EDE4D5]/40 border border-[#C8A15A]/30 space-y-6"
    >
      <div className="border-b border-[#C8A15A]/20 pb-4 mb-2">
        <h2 className="font-serif text-2xl text-[#02281E]">
          Send an Inquiry
        </h2>
        <p className="text-xs font-sans text-[#1C211E]/70 mt-1">
          Complete the details below and we will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2"
          >
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Dr. Suprasna Sharan"
            className="w-full px-4 py-3 bg-white border border-[#063C2D]/20 text-xs font-sans text-[#1C211E] focus:outline-none focus:border-[#C8A15A] focus:ring-1 focus:ring-[#C8A15A]"
          />
          {errors.name && (
            <p className="text-[11px] text-red-700 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Dental Clinic / Practice Name */}
        <div>
          <label
            htmlFor="clinicName"
            className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2"
          >
            Clinic / Practice Name
          </label>
          <input
            id="clinicName"
            type="text"
            value={formData.clinicName}
            onChange={(e) =>
              setFormData({ ...formData, clinicName: e.target.value })
            }
            placeholder="Aesthetic Smiles Dental"
            className="w-full px-4 py-3 bg-white border border-[#063C2D]/20 text-xs font-sans text-[#1C211E] focus:outline-none focus:border-[#C8A15A] focus:ring-1 focus:ring-[#C8A15A]"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2"
          >
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="doctor@clinic.com"
            className="w-full px-4 py-3 bg-white border border-[#063C2D]/20 text-xs font-sans text-[#1C211E] focus:outline-none focus:border-[#C8A15A] focus:ring-1 focus:ring-[#C8A15A]"
          />
          {errors.email && (
            <p className="text-[11px] text-red-700 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2"
          >
            Phone / WhatsApp Number *
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+91 98400 00000"
            className="w-full px-4 py-3 bg-white border border-[#063C2D]/20 text-xs font-sans text-[#1C211E] focus:outline-none focus:border-[#C8A15A] focus:ring-1 focus:ring-[#C8A15A]"
          />
          {errors.phone && (
            <p className="text-[11px] text-red-700 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Enquiry Type Selector */}
      <div>
        <label
          htmlFor="enquiryType"
          className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2"
        >
          Enquiry Type *
        </label>
        <select
          id="enquiryType"
          value={formData.enquiryType}
          onChange={(e) =>
            setFormData({ ...formData, enquiryType: e.target.value })
          }
          className="w-full px-4 py-3 bg-white border border-[#063C2D]/20 text-xs font-sans text-[#1C211E] focus:outline-none focus:border-[#C8A15A] focus:ring-1 focus:ring-[#C8A15A]"
        >
          <option value="Product enquiry">Product enquiry</option>
          <option value="Bulk / wholesale">Bulk / wholesale</option>
          <option value="Tooth gem application">
            Tooth gem application (Chennai Clinic)
          </option>
          <option value="General enquiry">General enquiry</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-xs font-sans uppercase tracking-[0.16em] text-[#02281E] font-medium mb-2"
        >
          Message / Order Specifications *
        </label>
        <textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          placeholder="Please describe your requirements, clinic location, or required crystal sizes..."
          className="w-full px-4 py-3 bg-white border border-[#063C2D]/20 text-xs font-sans text-[#1C211E] focus:outline-none focus:border-[#C8A15A] focus:ring-1 focus:ring-[#C8A15A]"
        />
        {errors.message && (
          <p className="text-[11px] text-red-700 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 px-6 bg-[#063C2D] text-[#F4EEE4] font-sans text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#0B5942] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        <span>{isPending ? "Submitting..." : "Send Inquiry"}</span>
        <Send className="w-3.5 h-3.5 text-[#D9BD82] transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}
