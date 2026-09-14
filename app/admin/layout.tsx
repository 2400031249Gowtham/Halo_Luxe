"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { SparkleStar } from "@/components/SparkleStar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Check admin authentication
    async function checkAuth() {
      if (isLoginPage) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/admin/login");
          return;
        }
        setCurrentUser(data.user);
      } catch (e) {
        router.push("/admin/login");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // If on login page, render children directly without admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F4EEE4] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#063C2D] animate-spin mb-4" />
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-[#063C2D]">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: Layers,
      exact: false,
    },
    {
      label: "Media Library",
      href: "/admin/media",
      icon: ImageIcon,
      exact: false,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4EEE4] text-[#1C211E] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-[#02281E] text-[#F4EEE4] px-4 py-3.5 flex items-center justify-between border-b border-[#C8A15A]/20 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <SparkleStar size={12} color="#D9BD82" />
          <span className="font-serif text-lg tracking-wider text-[#F4EEE4]">
            HALO <span className="text-[10px] font-sans tracking-[0.2em] text-[#C8A15A] uppercase">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-[#F4EEE4] hover:text-[#C8A15A]"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#02281E] text-[#F4EEE4] border-r border-[#C8A15A]/20 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#C8A15A]/20">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 focus:outline-none"
              onClick={() => setMobileOpen(false)}
            >
              <SparkleStar size={14} color="#D9BD82" />
              <div>
                <span className="font-serif text-2xl tracking-[0.12em] text-[#F4EEE4] font-normal block leading-none">
                  HALO
                </span>
                <span className="font-sans text-[9px] uppercase tracking-[0.26em] text-[#D9BD82] block mt-1">
                  Management Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-sans uppercase tracking-[0.2em] text-[#EDE4D5]/40 font-semibold">
              Catalogue & System
            </div>

            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-sans uppercase tracking-[0.16em] transition-all rounded ${
                    isActive
                      ? "bg-[#063C2D] text-[#D9BD82] font-semibold border-l-2 border-[#C8A15A]"
                      : "text-[#EDE4D5]/80 hover:bg-[#063C2D]/50 hover:text-[#F4EEE4]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#C8A15A]" : "text-[#EDE4D5]/60"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions: View Store & Logout */}
        <div className="p-4 border-t border-[#C8A15A]/20 space-y-2 bg-[#02281E]/60">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-sans text-[#EDE4D5]/80 hover:text-[#D9BD82] transition-colors rounded hover:bg-[#063C2D]/40"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#C8A15A]" />
              <span className="tracking-wider">View Public Site</span>
            </span>
            <span className="text-[10px] uppercase text-[#D9BD82]">↗</span>
          </Link>

          {currentUser && (
            <div className="px-3 py-2 bg-[#063C2D]/40 rounded border border-[#C8A15A]/15 text-[11px] font-sans">
              <div className="text-[#F4EEE4] font-medium truncate">{currentUser.name}</div>
              <div className="text-[#EDE4D5]/50 text-[10px] truncate">{currentUser.email}</div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-sans text-[#EDE4D5]/80 hover:text-red-400 transition-colors rounded hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4 text-[#C8A15A]" />
            <span className="tracking-wider uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#EDE4D5]/50 border-b border-[#C8A15A]/25 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-sans tracking-wide text-[#1C211E]/70">
            <span className="uppercase text-[#063C2D] font-semibold">HALO Admin</span>
            <span>/</span>
            <span className="uppercase text-[#C8A15A] font-semibold">
              {pathname === "/admin"
                ? "Overview"
                : pathname.split("/")[2]?.toUpperCase() || ""}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-[0.14em] text-[#063C2D] hover:text-[#C8A15A] transition-colors font-medium"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {currentUser && (
              <div className="flex items-center gap-2 pl-4 border-l border-[#C8A15A]/30 text-xs font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[#02281E] font-medium">{currentUser.name}</span>
                <span className="bg-[#063C2D] text-[#D9BD82] text-[9px] uppercase px-1.5 py-0.5 font-bold tracking-wider rounded">
                  Admin
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
