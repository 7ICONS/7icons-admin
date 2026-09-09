import Image from "next/image";
import Link from "next/link";

import AcceptRepresentativeInvitation from "@/components/applications/AcceptRepresentativeInvitation";

type AcceptRepresentativeInvitePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function AcceptRepresentativeInvitePage({
  searchParams,
}: AcceptRepresentativeInvitePageProps) {
  const { token } =
    await searchParams;

  const normalizedToken =
    token?.trim() ?? "";

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 px-5 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-lg">
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex justify-center"
          >
            <Image
              src="/brand/7icons-admin-logo.png"
              alt="7ICONS Admin"
              width={220}
              height={90}
              priority
              className="h-auto w-44 object-contain sm:w-48"
            />
          </Link>

          <div className="mt-5">
            <span className="inline-flex rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-violet-600 shadow-sm">
              Secure Representative Invitation
            </span>
          </div>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
            Join the 7ICONS digital
            platform as an ICONIA
            Representative and access
            the tools available for
            your community role.
          </p>
        </div>

        {normalizedToken ? (
          <AcceptRepresentativeInvitation
            token={
              normalizedToken
            }
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-xl shadow-violet-950/5">
            <div className="px-6 py-10 text-center sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl font-semibold text-red-500">
                !
              </div>

              <h1 className="mt-5 text-xl font-semibold text-slate-950">
                Invalid Invitation
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                This Representative
                invitation link does
                not contain a valid
                invitation token.
              </p>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                Go to Admin Login
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs leading-5 text-slate-400">
            7ICONS Administration
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Built for ICONIA by
            ICONIA.
          </p>
        </div>
      </div>
    </main>
  );
}