import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import AcceptTeamInvitation from "@/components/team/AcceptTeamInvitation";

export const metadata: Metadata = {
  title: "Team Invitation",
};

type AcceptInvitePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const { token } =
    await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f7ff] px-5 py-12">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-300/25 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-300/25 blur-3xl" />

      <div className="relative w-full max-w-xl">
        <div className="mb-8 text-center">
          <Link
            href="/login"
            className="inline-block"
          >
            <Image
              src="/brand/7icons-admin-logo.png"
              alt="7ICONS Admin"
              width={220}
              height={90}
              priority
              className="mx-auto h-auto w-44 object-contain"
            />
          </Link>

          <p className="mt-3 text-sm text-slate-500">
            Secure staff invitation
          </p>
        </div>

        {token ? (
          <AcceptTeamInvitation
            token={token}
          />
        ) : (
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-violet-950/5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
              !
            </div>

            <h1 className="mt-5 text-xl font-semibold text-slate-950">
              Invalid Invitation
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This invitation link does
              not contain a valid token.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}