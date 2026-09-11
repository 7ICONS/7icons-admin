"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

type AdminNotificationsProps = {
  userId: string;
};

function formatNotificationTime(
  value: string,
) {
  const createdAt =
    new Date(value);

  const now = new Date();

  const diff =
    now.getTime() -
    createdAt.getTime();

  const seconds =
    Math.floor(diff / 1000);

  const minutes =
    Math.floor(seconds / 60);

  const hours =
    Math.floor(minutes / 60);

  const days =
    Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(createdAt);
}

function NotificationIcon({
  type,
}: {
  type: string;
}) {
  if (
    type === "comment" ||
    type === "reply"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      </svg>
    );
  }

  if (
    type === "article" ||
    type === "review"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />

        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    );
  }

  if (type === "gallery") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
        />

        <circle
          cx="9"
          cy="9"
          r="2"
        />

        <path d="m4 18 5-5 3 3 2-2 6 6" />
      </svg>
    );
  }

  if (type === "application") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M6 3h12v18H6z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export default function AdminNotifications({
  userId,
}: AdminNotificationsProps) {
  const router = useRouter();

  const [
    notifications,
    setNotifications,
  ] = useState<
    AdminNotification[]
  >([]);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isMarkingAll,
    setIsMarkingAll,
  ] = useState(false);

  const loadNotifications =
    useCallback(async () => {
      const supabase =
        createClient();

      const {
        data,
        error,
      } = await supabase
        .from(
          "admin_notifications",
        )
        .select(
          `
            id,
            type,
            title,
            message,
            href,
            is_read,
            created_at
          `,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        )
        .limit(20);

      if (error) {
        console.error(
          "Unable to load notifications:",
          error.message,
        );

        setIsLoading(false);
        return;
      }

      setNotifications(
        data ?? [],
      );

      setIsLoading(false);
    }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const supabase =
      createClient();

    const channel =
      supabase
        .channel(
          `admin-notifications-${userId}`,
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "admin_notifications",
            filter:
              `recipient_user_id=eq.${userId}`,
          },
          () => {
            void loadNotifications();
          },
        )
        .subscribe();

    return () => {
      void supabase.removeChannel(
        channel,
      );
    };
  }, [
    userId,
    loadNotifications,
  ]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read,
    ).length;

  async function markAsRead(
    notificationId: string,
  ) {
    const supabase =
      createClient();

    const { error } =
      await supabase.rpc(
        "mark_admin_notification_read",
        {
          notification_id:
            notificationId,
        },
      );

    if (error) {
      console.error(
        "Unable to mark notification as read:",
        error.message,
      );

      return;
    }

    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification,
        ),
    );
  }

  async function markAllAsRead() {
    if (
      unreadCount === 0 ||
      isMarkingAll
    ) {
      return;
    }

    setIsMarkingAll(true);

    const supabase =
      createClient();

    const { error } =
      await supabase.rpc(
        "mark_all_admin_notifications_read",
      );

    if (error) {
      console.error(
        "Unable to mark all notifications as read:",
        error.message,
      );

      setIsMarkingAll(false);
      return;
    }

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            is_read: true,
          }),
        ),
    );

    setIsMarkingAll(false);
  }

  async function handleNotificationClick(
    notification: AdminNotification,
  ) {
    if (!notification.is_read) {
      await markAsRead(
        notification.id,
      );
    }

    setNotificationOpen(false);

    if (notification.href) {
      router.push(
        notification.href,
      );
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={
          notificationOpen
        }
        onClick={() =>
          setNotificationOpen(
            (current) =>
              !current,
          )
        }
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

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl shadow-violet-950/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-violet-100 px-4 py-4">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Notifications
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread notification${
                      unreadCount === 1
                        ? ""
                        : "s"
                    }`}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={
                  isMarkingAll
                }
                onClick={() =>
                  void markAllAsRead()
                }
                className="text-xs font-semibold text-violet-600 transition hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMarkingAll
                  ? "Updating..."
                  : "Mark all read"}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[430px] overflow-y-auto">
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
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
                </div>

                <p className="mt-4 text-sm font-bold text-slate-700">
                  No notifications yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Important platform
                  activity will appear
                  here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-violet-50">
                {notifications.map(
                  (notification) => (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() =>
                        void handleNotificationClick(
                          notification,
                        )
                      }
                      className={`flex w-full gap-3 px-4 py-4 text-left transition hover:bg-violet-50/70 ${
                        notification.is_read
                          ? "bg-white"
                          : "bg-violet-50/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          notification.is_read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        <NotificationIcon
                          type={
                            notification.type
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="line-clamp-2 flex-1 text-sm font-bold leading-5 text-slate-800">
                            {
                              notification.title
                            }
                          </p>

                          {!notification.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                          )}
                        </div>

                        {notification.message && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {
                              notification.message
                            }
                          </p>
                        )}

                        <p className="mt-2 text-[10px] font-medium text-slate-400">
                          {formatNotificationTime(
                            notification.created_at,
                          )}
                        </p>
                      </div>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}