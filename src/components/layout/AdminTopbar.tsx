"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mobileNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Articles",
    href: "/articles",
  },
  {
    label: "Members",
    href: "/members",
  },
  {
    label: "Schedule",
    href: "/schedule",
  },
  {
    label: "Fan Representatives",
    href: "/representatives",
  },
  {
    label: "Users",
    href: "/users",
  },
  {
    label: "Comments",
    href: "/comments",
  },
  {
    label: "Media",
    href: "/media",
  },
];

export default function AdminTopbar() {
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-violet-100 bg-white/95 px-5 backdrop-blur-md sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>

          <div>
            <p className="text-xs font-medium text-slate-400">
              7ICONS Administration
            </p>

            <p className="text-sm font-semibold text-slate-700">
              Digital Platform Management
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative">
            {searchOpen && (
              <div className="absolute right-0 top-12 hidden w-72 rounded-2xl border border-violet-100 bg-white p-2 shadow-xl shadow-violet-950/10 sm:block">
                <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 shrink-0 text-violet-500"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="search"
                    autoFocus
                    placeholder="Search admin..."
                    className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>
          </div>

          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white" />
          </button>

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Admin Profile */}
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-violet-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-purple-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-slate-800">
                Admin ICONIA
              </p>

              <p className="text-xs text-slate-500">
                Super Admin
              </p>
            </div>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="hidden h-4 w-4 text-slate-400 sm:block"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <aside className="relative flex h-full w-[290px] max-w-[85vw] flex-col border-r border-violet-100 bg-white shadow-2xl">
            {/* Brand */}
            <div className="flex h-20 items-center justify-between border-b border-violet-100 px-5">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image
                  src="/brand/7icons-admin-logo.png"
                  alt="7ICONS Admin"
                  width={190}
                  height={75}
                  priority
                  className="h-auto w-36 object-contain"
                />
              </Link>

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M6 6 18 18" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5">
              <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Management
              </p>

              <nav className="space-y-1.5">
                {mobileNavigation.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-violet-700 to-purple-500 text-white shadow-lg shadow-violet-500/15"
                          : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom */}
              <div className="mt-auto pt-7">
                <div className="mb-4 border-t border-violet-100" />

                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive("/settings")
                      ? "bg-gradient-to-r from-violet-700 to-purple-500 text-white"
                      : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  Settings
                </Link>

                <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-purple-500 text-sm font-bold text-white">
                      A
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        Admin ICONIA
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        Super Admin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}