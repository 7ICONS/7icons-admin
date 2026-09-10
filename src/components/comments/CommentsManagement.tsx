"use client";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export type CommentStatus =
  | "pending"
  | "approved"
  | "hidden"
  | "spam";

export type CommentTargetType =
  | "article"
  | "gallery";

export type CommentItem = {
  id: string;
  article_id: string | null;
  gallery_album_id: string | null;
  parent_id: string | null;
  author_id: string;
  body: string;
  status: CommentStatus;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;

  author_name: string;
  author_email: string;
  target_title: string;
  target_type: CommentTargetType;
};

type AdminRole =
  | "super_admin"
  | "admin"
  | "editor"
  | "moderator"
  | "representative";

type CommentsManagementProps = {
  comments: CommentItem[];
  currentRole: AdminRole;
};

const statusOptions: Array<{
  value: "all" | CommentStatus;
  label: string;
}> = [
  {
    value: "all",
    label: "All Status",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "hidden",
    label: "Hidden",
  },
  {
    value: "spam",
    label: "Spam",
  },
];

function formatDate(
  dateString: string,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(dateString),
  );
}

function StatusBadge({
  status,
}: {
  status: CommentStatus;
}) {
  const styles: Record<
    CommentStatus,
    string
  > = {
    pending:
      "border border-amber-200 bg-amber-50 text-amber-700",

    approved:
      "border border-emerald-200 bg-emerald-50 text-emerald-700",

    hidden:
      "border border-slate-200 bg-slate-100 text-slate-600",

    spam:
      "border border-red-200 bg-red-50 text-red-700",
  };

  const labels: Record<
    CommentStatus,
    string
  > = {
    pending: "Pending",
    approved: "Approved",
    hidden: "Hidden",
    spam: "Spam",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function CommentsManagement({
  comments,
  currentRole,
}: CommentsManagementProps) {
  const router = useRouter();

  const supabase =
    createClient();

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "all" | CommentStatus
  >("all");

  const [
    targetFilter,
    setTargetFilter,
  ] = useState<
    "all" | CommentTargetType
  >("all");

  const [
    busyCommentId,
    setBusyCommentId,
  ] = useState<
    string | null
  >(null);

  const [
    replyComment,
    setReplyComment,
  ] = useState<
    CommentItem | null
  >(null);

  const [
    replyBody,
    setReplyBody,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const isRepresentative =
    currentRole ===
    "representative";

  const canModerate =
    currentRole ===
      "super_admin" ||
    currentRole ===
      "admin" ||
    currentRole ===
      "moderator";

  const normalizedSearch =
    searchQuery
      .trim()
      .toLowerCase();

  const filteredComments =
    useMemo(() => {
      return comments.filter(
        (comment) => {
          const matchesSearch =
            !normalizedSearch ||
            comment.body
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            comment.author_name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            comment.author_email
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            comment.target_title
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            comment.status ===
              statusFilter;

          const matchesTarget =
            targetFilter ===
              "all" ||
            comment.target_type ===
              targetFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesTarget
          );
        },
      );
    }, [
      comments,
      normalizedSearch,
      statusFilter,
      targetFilter,
    ]);

  async function moderateComment(
    commentId: string,
    status:
      | "approved"
      | "hidden"
      | "spam",
  ) {
    setBusyCommentId(
      commentId,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        error,
      } = await supabase.rpc(
        "moderate_comment",
        {
          p_comment_id:
            commentId,

          p_status:
            status,
        },
      );

      if (error) {
        throw error;
      }

      setSuccessMessage(
        `Comment marked as ${status}.`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Comment moderation failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to moderate comment.",
      );
    } finally {
      setBusyCommentId(null);
    }
  }

  async function deleteComment(
    comment: CommentItem,
  ) {
    const confirmed =
      window.confirm(
        "Delete this comment permanently? Replies under this comment may also be deleted.",
      );

    if (!confirmed) {
      return;
    }

    setBusyCommentId(
      comment.id,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        error,
      } = await supabase
        .from("comments")
        .delete()
        .eq(
          "id",
          comment.id,
        );

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Comment deleted successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Comment deletion failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete comment.",
      );
    } finally {
      setBusyCommentId(null);
    }
  }

  function openReply(
    comment: CommentItem,
  ) {
    setErrorMessage("");
    setSuccessMessage("");
    setReplyBody("");
    setReplyComment(
      comment,
    );
  }

  function closeReply() {
    if (busyCommentId) {
      return;
    }

    setReplyComment(null);
    setReplyBody("");
    setErrorMessage("");
  }

  async function submitReply() {
    if (!replyComment) {
      return;
    }

    const body =
      replyBody.trim();

    if (!body) {
      setErrorMessage(
        "Reply cannot be empty.",
      );

      return;
    }

    setBusyCommentId(
      replyComment.id,
    );

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        error,
      } = await supabase.rpc(
        "reply_to_comment",
        {
          p_parent_comment_id:
            replyComment.id,

          p_body:
            body,
        },
      );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      setReplyComment(null);
      setReplyBody("");

      setSuccessMessage(
        "Reply posted successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Representative reply failed:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to post reply.",
      );
    } finally {
      setBusyCommentId(null);
    }
  }

  const pendingCount =
    comments.filter(
      (comment) =>
        comment.status ===
        "pending",
    ).length;

  const approvedCount =
    comments.filter(
      (comment) =>
        comment.status ===
        "approved",
    ).length;

  const spamCount =
    comments.filter(
      (comment) =>
        comment.status ===
        "spam",
    ).length;

  return (
    <>
      <div className="space-y-6">
        {/* Messages */}
        {errorMessage &&
          !replyComment && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              {isRepresentative
                ? "Comments"
                : "Total Comments"}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {comments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              {isRepresentative
                ? "Needs Attention"
                : "Spam"}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {isRepresentative
                ? pendingCount
                : spamCount}
            </p>
          </div>
        </div>

        {/* Search / Filters */}
        <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-4-4" />
              </svg>

              <input
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
                placeholder="Search comments, authors, or content..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target
                    .value as
                    | "all"
                    | CommentStatus,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 xl:min-w-[170px]"
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>

            <select
              value={
                targetFilter
              }
              onChange={(
                event,
              ) =>
                setTargetFilter(
                  event.target
                    .value as
                    | "all"
                    | CommentTargetType,
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 xl:min-w-[170px]"
            >
              <option value="all">
                All Content
              </option>

              <option value="article">
                Articles
              </option>

              <option value="gallery">
                Gallery
              </option>
            </select>
          </div>

          <p className="mt-4 border-t border-violet-50 pt-4 text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {
                filteredComments.length
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {comments.length}
            </span>{" "}
            comments
          </p>
        </section>

        {/* Comments */}
        <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
          {filteredComments.length ===
          0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                </svg>
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                No comments found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {isRepresentative
                  ? "Comments on your published Articles and Gallery albums will appear here."
                  : "Comments submitted by users will appear here for review and moderation."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-violet-50">
              {filteredComments.map(
                (comment) => {
                  const isBusy =
                    busyCommentId ===
                    comment.id;

                  return (
                    <article
                      key={
                        comment.id
                      }
                      className="p-5 transition hover:bg-violet-50/20 sm:p-6"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          {/* Author */}
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">
                              {
                                comment.author_name
                              }
                            </p>

                            <StatusBadge
                              status={
                                comment.status
                              }
                            />

                            {comment.parent_id && (
                              <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-600">
                                Reply
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              comment.author_email
                            }
                          </p>

                          {/* Body */}
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {
                              comment.body
                            }
                          </p>

                          {/* Target */}
                          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                            <span className="font-semibold capitalize text-violet-600">
                              {
                                comment.target_type
                              }
                            </span>

                            <span>
                              {
                                comment.target_title
                              }
                            </span>

                            <span>
                              {formatDate(
                                comment.created_at,
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[390px] xl:justify-end">
                          {canModerate && (
                            <>
                              {comment.status !==
                                "approved" && (
                                <button
                                  type="button"
                                  disabled={
                                    isBusy
                                  }
                                  onClick={() =>
                                    moderateComment(
                                      comment.id,
                                      "approved",
                                    )
                                  }
                                  className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {comment.status !==
                                "hidden" && (
                                <button
                                  type="button"
                                  disabled={
                                    isBusy
                                  }
                                  onClick={() =>
                                    moderateComment(
                                      comment.id,
                                      "hidden",
                                    )
                                  }
                                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                  Hide
                                </button>
                              )}

                              {comment.status !==
                                "spam" && (
                                <button
                                  type="button"
                                  disabled={
                                    isBusy
                                  }
                                  onClick={() =>
                                    moderateComment(
                                      comment.id,
                                      "spam",
                                    )
                                  }
                                  className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                                >
                                  Spam
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={
                                  isBusy
                                }
                                onClick={() =>
                                  deleteComment(
                                    comment,
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {isRepresentative &&
                            !comment.parent_id && (
                              <button
                                type="button"
                                disabled={
                                  isBusy
                                }
                                onClick={() =>
                                  openReply(
                                    comment,
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                              >
                                Reply
                              </button>
                            )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>

      {/* Representative Reply Modal */}
      {replyComment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReply();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl">
            <div className="border-b border-violet-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Representative Reply
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Reply to Comment
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Replying to{" "}
                <span className="font-semibold text-slate-700">
                  {
                    replyComment.author_name
                  }
                </span>
              </p>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  {
                    replyComment.body
                  }
                </p>
              </div>

              <div>
                <label
                  htmlFor="representative-reply"
                  className="text-sm font-semibold text-slate-700"
                >
                  Your Reply
                </label>

                <textarea
                  id="representative-reply"
                  value={
                    replyBody
                  }
                  onChange={(
                    event,
                  ) =>
                    setReplyBody(
                      event.target
                        .value,
                    )
                  }
                  rows={5}
                  disabled={
                    busyCommentId ===
                    replyComment.id
                  }
                  placeholder="Write your reply..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-violet-100 bg-violet-50/30 px-6 py-4">
              <button
                type="button"
                onClick={
                  closeReply
                }
                disabled={
                  busyCommentId ===
                  replyComment.id
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  submitReply
                }
                disabled={
                  busyCommentId ===
                  replyComment.id
                }
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {busyCommentId ===
                replyComment.id
                  ? "Posting..."
                  : "Post Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}