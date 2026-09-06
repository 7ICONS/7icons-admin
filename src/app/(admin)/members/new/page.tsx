import type { Metadata } from "next";
import Link from "next/link";

import MemberForm from "@/components/members/MemberForm";

export const metadata: Metadata = {
  title: "New Member",
};

export default function NewMemberPage() {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <span aria-hidden="true">←</span>
          Back to Members
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          Member Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          New Member
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Add a new current or former 7ICONS member profile,
          portrait, biography, and profile sections.
        </p>
      </div>

      <MemberForm />
    </section>
  );
}