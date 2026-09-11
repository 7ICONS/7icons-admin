"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AdminNotifications from "@/components/layout/AdminNotifications";
import {
  hasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/permissions";
import { createClient } from "@/lib/supabase/client";

type AdminTopbarProps = {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  role: AdminRole;
  roleLabel: string;
};

type MobileNavigationItem = {
  label: string;
  href: string;
  permission: AdminPermission;
  description: string;
  keywords: string[];
};

const mobileNavigation: MobileNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    permission: "dashboard.view",
    description:
      "Overview, statistics, recent activity, and quick actions.",
    keywords: [
      "home",
      "overview",
      "statistics",
      "activity",
    ],
  },
  {
    label: "Articles",
    href: "/articles",
    permission: "articles.view",
    description:
      "Create, edit, review, and manage articles.",
    keywords: [
      "article",
      "blog",
      "news",
      "story",
      "content",
    ],
  },
  {
    label: "Members",
    href: "/members",
    permission: "members.manage",
    description:
      "Manage current and former 7ICONS members.",
    keywords: [
      "member",
      "7icons",
      "profile",
      "former",
    ],
  },
  {
    label: "Gallery",
    href: "/gallery",
    permission: "gallery.view",
    description:
      "Manage gallery albums and photos.",
    keywords: [
      "gallery",
      "album",
      "photo",
      "image",
    ],
  },
  {
    label: "Schedule",
    href: "/schedule",
    permission: "schedule.manage",
    description:
      "Manage events and upcoming schedules.",
    keywords: [
      "schedule",
      "event",
      "calendar",
      "activity",
    ],
  },
  {
    label: "Fan Representatives",
    href: "/representatives",
    permission:
      "representatives.manage",
    description:
      "Manage ICONIA Fan Representatives.",
    keywords: [
      "representative",
      "iconia",
      "region",
      "community",
      "fan",
    ],
  },
  {
    label: "Applications",
    href: "/applications",
    permission: "applications.view",
    description:
      "Review community and representative applications.",
    keywords: [
      "application",
      "apply",
      "review",
      "applicant",
    ],
  },
  {
    label: "Users",
    href: "/users",
    permission: "users.view",
    description:
      "View and manage registered platform users.",
    keywords: [
      "user",
      "account",
      "registered",
    ],
  },
  {
    label: "Comments",
    href: "/comments",
    permission: "comments.view",
    description:
      "Review and moderate community comments.",
    keywords: [
      "comment",
      "moderation",
      "reply",
      "spam",
    ],
  },
  {
    label: "Media",
    href: "/media",
    permission: "media.view",
    description:
      "Manage uploaded media and shared assets.",
    keywords: [
      "media",
      "asset",
      "upload",
      "image",
      "file",
    ],
  },
  {
    label: "Team",
    href: "/team",
    permission: "team.view",
    description:
      "Manage administration team access.",
    keywords: [
      "team",
      "staff",
      "admin",
      "role",
      "permission",
    ],
  },
];

function getInitials(
  displayName: string,
  email: string,
) {
  const source =
    displayName.trim() ||
    email.split("@")[0] ||
    "A";

  const words = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (
    words
      .map((word) =>
        word.charAt(0).toUpperCase(),
      )
      .join("") || "A"
  );
}

export default function AdminTopbar({
  userId,
  displayName,
  email,
  avatarUrl,
  role,
  roleLabel,
}: AdminTopbarProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const searchInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false);

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false);

  const initials =
    getInitials(
      displayName,
      email,
    );

  const visibleNavigation =
    mobileNavigation.filter(
      (item) =>
        hasPermission(
          role,
          item.permission,
        ),
    );

  const canViewSettings =
    hasPermission(
      role,
      "settings.view",
    );

  const searchableNavigation =
    useMemo(() => {
      const items = [
        ...visibleNavigation,
      ];

      if (canViewSettings) {
        items.push({
          label: "Settings",
          href: "/settings",
          permission:
            "settings.view",
          description:
            "Manage your profile, avatar, password, and account settings.",
          keywords: [
            "settings",
            "profile",
            "account",
            "avatar",
            "password",
            "security",
          ],
        });
      }

      return items;
    }, [
      visibleNavigation,
      canViewSettings,
    ]);

  const searchResults =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      if (!normalizedQuery) {
        return searchableNavigation;
      }

      return searchableNavigation.filter(
        (item) => {
          const haystack = [
            item.label,
            item.description,
            ...item.keywords,
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            normalizedQuery,
          );
        },
      );
    }, [
      searchQuery,
      searchableNavigation,
    ]);

  const isActive = (
    href: string,
  ) => {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  };

  useEffect(() => {
    function handleKeyboard(
      event: KeyboardEvent,
    ) {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        setSearchOpen(true);
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }

      if (
        event.key === "Escape"
      ) {
        setSearchOpen(false);
        setSearchQuery("");
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function openSearch() {
    setSearchOpen(true);
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  }

  function handleSearchResult(
    href: string,
  ) {
    closeSearch();
    router.push(href);
  }

  function handleSearchSubmit() {
    const firstResult =
      searchResults[0];

    if (!firstResult) {
      return;
    }

    handleSearchResult(
      firstResult.href,
    );
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    const supabase =
      createClient();

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Sign out failed:",
        error.message,
      );

      setIsSigningOut(false);
      return;
    }

    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 w-full min-w-0 max-w-full items-center justify-between overflow-visible border-b border-violet-100 bg-white/95 px-3 backdrop-blur-md sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={
              mobileMenuOpen
            }
            onClick={() => {
              setMobileMenuOpen(
                true,
              );

              setProfileMenuOpen(
                false,
              );

              setSearchOpen(
                false,
              );
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 lg:hidden"
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

          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-xs font-medium text-slate-400">
              7ICONS Administration
            </p>

            <p className="truncate text-sm font-semibold text-slate-700">
              Digital Platform Management
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          {/* Search */}
          <button
            type="button"
            aria-label="Global Search"
            title="Search · Ctrl+K"
            onClick={
              openSearch
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 sm:w-auto sm:gap-2 sm:px-3"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m20 20-4-4" />
            </svg>

            <span className="hidden text-xs font-semibold text-slate-400 xl:inline">
              Ctrl K
            </span>
          </button>

          {/* Notifications */}
          <div className="shrink-0">
            <AdminNotifications
              userId={userId}
            />
          </div>

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={
                profileMenuOpen
              }
              onClick={() => {
                setProfileMenuOpen(
                  (current) =>
                    !current,
                );

                setSearchOpen(false);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-0 rounded-xl px-1 py-1.5 transition hover:bg-violet-50 sm:gap-3 sm:px-2"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-700 to-purple-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
                {avatarUrl ? (
                  <div
                    role="img"
                    aria-label={
                      displayName
                    }
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${avatarUrl}")`,
                    }}
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-40 truncate text-sm font-bold text-slate-800">
                  {displayName}
                </p>

                <p className="max-w-40 truncate text-xs text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`hidden h-4 w-4 text-slate-400 transition sm:block ${
                  profileMenuOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-[calc(100vw-1.5rem)] max-w-64 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl shadow-violet-950/10">
                <div className="border-b border-violet-100 px-4 py-4">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {displayName}
                  </p>

                  {email && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {email}
                    </p>
                  )}

                  <span className="mt-3 inline-flex max-w-full rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-700">
                    <span className="truncate">
                      {roleLabel}
                    </span>
                  </span>
                </div>

                <div className="p-2">
                  {canViewSettings && (
                    <Link
                      href="/settings"
                      onClick={() =>
                        setProfileMenuOpen(
                          false,
                        )
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5 shrink-0"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />

                        <path d="M12 2v3" />
                        <path d="M12 19v3" />
                        <path d="m4.9 4.9 2.1 2.1" />
                        <path d="m17 17 2.1 2.1" />
                        <path d="M2 12h3" />
                        <path d="M19 12h3" />
                        <path d="m4.9 19.1 2.1-2.1" />
                        <path d="m17 7 2.1-2.1" />
                      </svg>

                      Settings
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={
                      isSigningOut
                    }
                    onClick={
                      handleSignOut
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 shrink-0"
                    >
                      <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
                      <path d="M14 8l4 4-4 4" />
                      <path d="M18 12H9" />
                    </svg>

                    {isSigningOut
                      ? "Signing out..."
                      : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search */}
      {searchOpen && (
        <div className="fixed inset-0 z-[70] overflow-x-hidden px-3">
          <button
            type="button"
            aria-label="Close search"
            onClick={
              closeSearch
            }
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2px]"
          />

          <div className="relative mx-auto mt-20 w-full max-w-2xl sm:mt-24">
            <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-950/15">
              <div className="border-b border-violet-100 p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-violet-50 px-3 sm:gap-3 sm:px-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 shrink-0 text-violet-500"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />

                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    ref={
                      searchInputRef
                    }
                    type="search"
                    value={
                      searchQuery
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearchQuery(
                        event.target
                          .value,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();

                        handleSearchSubmit();
                      }
                    }}
                    placeholder="Search the admin panel..."
                    className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={
                      closeSearch
                    }
                    className="hidden shrink-0 rounded-lg border border-violet-100 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:block"
                  >
                    ESC
                  </button>
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-2">
                <div className="px-3 pb-2 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {searchQuery.trim()
                      ? `${searchResults.length} result${
                          searchResults.length ===
                          1
                            ? ""
                            : "s"
                        }`
                      : "Available Areas"}
                  </p>
                </div>

                {searchResults.length >
                0 ? (
                  <div className="space-y-1">
                    {searchResults.map(
                      (item) => {
                        const active =
                          isActive(
                            item.href,
                          );

                        return (
                          <button
                            key={
                              item.href
                            }
                            type="button"
                            onClick={() =>
                              handleSearchResult(
                                item.href,
                              )
                            }
                            className={`group flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl px-3 py-3.5 text-left transition sm:gap-4 sm:px-4 ${
                              active
                                ? "bg-violet-50"
                                : "hover:bg-violet-50/70"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-bold text-slate-800 group-hover:text-violet-700">
                                  {
                                    item.label
                                  }
                                </p>

                                {active && (
                                  <span className="hidden shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700 sm:inline-flex">
                                    Current
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {
                                  item.description
                                }
                              </p>
                            </div>

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition group-hover:text-violet-600">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4"
                              >
                                <path d="M5 12h14" />
                                <path d="m15 8 4 4-4 4" />
                              </svg>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                        />

                        <path d="m20 20-4-4" />
                      </svg>
                    </div>

                    <p className="mt-4 text-sm font-bold text-slate-700">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another search
                      term.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-violet-100 bg-slate-50/70 px-4 py-3 text-[10px] font-medium text-slate-400 sm:px-5">
                <span>
                  Results respect your
                  role permissions
                </span>

                <span className="hidden sm:inline">
                  Enter to open · Esc to
                  close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
          />

          <aside className="relative flex h-full w-[290px] max-w-[85vw] flex-col overflow-hidden border-r border-violet-100 bg-white shadow-2xl">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-violet-100 px-5">
              <Link
                href="/dashboard"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="min-w-0"
              >
                <Image
                  src="/brand/7icons-admin-logo.png"
                  alt="7ICONS Admin"
                  width={190}
                  height={75}
                  priority
                  className="h-auto w-36 max-w-full object-contain"
                />
              </Link>

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-violet-50 hover:text-violet-700"
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

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Management
              </p>

              <nav className="space-y-1.5">
                {visibleNavigation.map(
                  (item) => {
                    const active =
                      isActive(
                        item.href,
                      );

                    return (
                      <Link
                        key={
                          item.href
                        }
                        href={
                          item.href
                        }
                        onClick={() =>
                          setMobileMenuOpen(
                            false,
                          )
                        }
                        className={`flex min-w-0 items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          active
                            ? "bg-gradient-to-r from-violet-700 to-purple-500 text-white shadow-lg shadow-violet-500/15"
                            : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                        }`}
                      >
                        <span className="min-w-0 truncate">
                          {item.label}
                        </span>
                      </Link>
                    );
                  },
                )}
              </nav>

              <div className="mt-auto pt-7">
                <div className="mb-4 border-t border-violet-100" />

                {canViewSettings && (
                  <Link
                    href="/settings"
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive(
                        "/settings",
                      )
                        ? "bg-gradient-to-r from-violet-700 to-purple-500 text-white"
                        : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    Settings
                  </Link>
                )}

                <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-700 to-purple-500 text-sm font-bold text-white">
                      {avatarUrl ? (
                        <div
                          role="img"
                          aria-label={
                            displayName
                          }
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${avatarUrl}")`,
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {roleLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    isSigningOut
                  }
                  onClick={
                    handleSignOut
                  }
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningOut
                    ? "Signing out..."
                    : "Sign Out"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}