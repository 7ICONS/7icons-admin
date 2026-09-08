import type { Metadata } from "next";
import Link from "next/link";

import { notFound } from "next/navigation";

import RepresentativeForm, {
  type RepresentativeFormData,
  type RepresentativeSection,
} from "@/components/representatives/RepresentativeForm";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Fan Representative",
};

type EditRepresentativePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeProfileSections(
  value: unknown,
): RepresentativeSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is Record<
        string,
        unknown
      > =>
        typeof item ===
          "object" &&
        item !== null,
    )
    .map((item) => ({
      heading:
        typeof item.heading ===
        "string"
          ? item.heading
          : "",

      paragraphs:
        Array.isArray(
          item.paragraphs,
        )
          ? item.paragraphs.filter(
              (
                paragraph,
              ): paragraph is string =>
                typeof paragraph ===
                "string",
            )
          : [],
    }));
}

export default async function EditRepresentativePage({
  params,
}: EditRepresentativePageProps) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: representative,
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
        instagram_url,
        whatsapp,
        profile_description,
        profile_mission,
        profile_motto,
        profile_sections,
        display_order,
        is_published
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load Fan Representative: ${error.message}`,
    );
  }

  if (!representative) {
    notFound();
  }

  const representativeData: RepresentativeFormData =
    {
      id:
        representative.id,

      slug:
        representative.slug,

      name:
        representative.name,

      region:
        representative.region,

      city:
        representative.city,

      role:
        representative.role,

      image_url:
        representative.image_url,

      storage_path:
        representative.storage_path,

      short_bio:
        representative.short_bio,

      since:
        representative.since,

      instagram:
        representative.instagram,

      instagram_url:
        representative.instagram_url,

      whatsapp:
        representative.whatsapp,

      profile_description:
        representative.profile_description,

      profile_mission:
        representative.profile_mission,

      profile_motto:
        representative.profile_motto,

      profile_sections:
        normalizeProfileSections(
          representative.profile_sections,
        ),

      display_order:
        representative.display_order,

      is_published:
        representative.is_published,
    };

  return (
    <section>
      <div className="mb-8">
        <Link
          href="/representatives"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <span aria-hidden="true">
            ←
          </span>

          Back to Fan Representatives
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          Community Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Edit Representative
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Update this ICONIA Fan
          Representative&apos;s
          regional information,
          portrait, contact details,
          profile content, and
          publishing status.
        </p>
      </div>

      <RepresentativeForm
        representative={
          representativeData
        }
      />
    </section>
  );
}