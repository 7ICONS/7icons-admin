import type { Metadata } from "next";
import Link from "next/link";

import DeleteRepresentativeButton from "@/components/representatives/DeleteRepresentativeButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Fan Representatives",
};

function getRepresentativeImageUrl(
  imageUrl: string,
) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `https://7icons-web.vercel.app${imageUrl}`;
}

export default async function RepresentativesPage() {
  const supabase = await createClient();

  const {
    data: representatives,
    error,
  } = await supabase
    .from("fan_representatives")
    .select(
      `
        id,
        slug,
        name,
        region,
        city,
        role,
        image_url,
        storage_path,
        short_bio,
        since,
        instagram,
        whatsapp,
        display_order,
        is_published,
        created_at
      `,
    )
    .order("display_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    return (
      <section>
        <p className="text-sm font-semibold text-violet-600">
          Community Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Fan Representatives
        </h1>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load Fan Representatives
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error.message}
          </p>
        </div>
      </section>
    );
  }

  const data =
    representatives ?? [];

  const totalRepresentatives =
    data.length;

  const publishedRepresentatives =
    data.filter(
      (representative) =>
        representative.is_published,
    ).length;

  const totalRegions =
    new Set(
      data.map(
        (representative) =>
          representative.region,
      ),
    ).size;

  const totalCities =
    new Set(
      data.map(
        (representative) =>
          representative.city,
      ),
    ).size;

  return (
    <section>
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            Community Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Fan Representatives
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage ICONIA Fan Representatives,
            regions, cities, profiles,
            contact information, and
            publishing status.
          </p>
        </div>

        <Link
          href="/representatives/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-purple-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/15 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          New Representative
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Total Representatives
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalRepresentatives}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Published
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {publishedRepresentatives}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Regions
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalRegions}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            Cities
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {totalCities}
          </p>
        </div>
      </div>

      {/* Representatives */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        {data.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-7 w-7"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="3"
                />

                <circle
                  cx="17"
                  cy="9"
                  r="2.4"
                />

                <path d="M2.5 19c.5-3.5 2.4-5.4 5.5-5.4 3.2 0 5 1.9 5.5 5.4" />

                <path d="M14.5 15c3-.5 5.2 1 6 4" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No Fan Representatives yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add the first ICONIA Fan
              Representative to begin
              building the community
              directory.
            </p>

            <Link
              href="/representatives/new"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Add First Representative
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead className="border-b border-violet-100 bg-violet-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Representative
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Region
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    City
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Since
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Published
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-violet-50">
                {data.map(
                  (representative) => {
                    const imageUrl =
                      getRepresentativeImageUrl(
                        representative.image_url,
                      );

                    return (
                      <tr
                        key={
                          representative.id
                        }
                        className="transition hover:bg-violet-50/30"
                      >
                        {/* Representative */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {imageUrl ? (
                              <div
                                role="img"
                                aria-label={
                                  representative.name
                                }
                                className="h-16 w-16 shrink-0 rounded-2xl border border-violet-100 bg-slate-100 bg-cover bg-center shadow-sm"
                                style={{
                                  backgroundImage: `url("${imageUrl}")`,
                                }}
                              />
                            ) : (
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-violet-50 text-sm font-bold text-violet-600">
                                {representative.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-semibold text-slate-800">
                                {
                                  representative.name
                                }
                              </p>

                              <p className="mt-1 max-w-[300px] truncate text-xs text-slate-400">
                                {
                                  representative.short_bio
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Region */}
                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {
                              representative.region
                            }
                          </span>
                        </td>

                        {/* City */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {
                            representative.city
                          }
                        </td>

                        {/* Since */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {representative.since ||
                            "—"}
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="max-w-[180px] truncate text-xs font-semibold text-slate-600">
                              {representative.instagram ||
                                "No Instagram"}
                            </p>

                            <p className="max-w-[180px] truncate text-xs text-slate-400">
                              {representative.whatsapp ||
                                "No WhatsApp"}
                            </p>
                          </div>
                        </td>

                        {/* Published */}
                        <td className="px-6 py-5">
                          {representative.is_published ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                              No
                            </span>
                          )}
                        </td>

                        {/* Order */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {
                            representative.display_order
                          }
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/representatives/${representative.id}/edit`}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-violet-100 px-3 text-xs font-semibold text-violet-700 transition hover:border-violet-200 hover:bg-violet-50"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4"
                              >
                                <path d="M12 20h9" />

                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                              </svg>

                              Edit
                            </Link>

                            <DeleteRepresentativeButton
                              representativeId={
                                representative.id
                              }
                              representativeName={
                                representative.name
                              }
                              storagePath={
                                representative.storage_path
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}