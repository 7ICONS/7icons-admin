import type { Metadata } from "next";
import Link from "next/link";

import RepresentativeForm from "@/components/representatives/RepresentativeForm";

export const metadata: Metadata = {
  title: "New Fan Representative",
};

export default function NewRepresentativePage() {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/representatives"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <span aria-hidden="true">←</span>
          Back to Fan Representatives
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          Community Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          New Representative
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Add a new ICONIA Fan Representative, profile information,
          regional details, social contacts, portrait, and public
          profile content.
        </p>
      </div>

      <RepresentativeForm />
    </section>
  );
}