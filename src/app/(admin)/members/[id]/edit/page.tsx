import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import MemberForm, {
  type MemberFormData,
} from "@/components/members/MemberForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Member",
};

type EditMemberPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProfileSection = {
  heading: string;
  paragraphs: string[];
};

function normalizeProfileSections(
  value: unknown,
): ProfileSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null,
    )
    .map((item) => ({
      heading:
        typeof item.heading === "string"
          ? item.heading
          : "",

      paragraphs: Array.isArray(
        item.paragraphs,
      )
        ? item.paragraphs.filter(
            (
              paragraph,
            ): paragraph is string =>
              typeof paragraph === "string",
          )
        : [],
    }));
}

export default async function EditMemberPage({
  params,
}: EditMemberPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: member, error } =
    await supabase
      .from("members")
      .select(
        `
          id,
          slug,
          name,
          member_status,
          role,
          image_url,
          short_bio,
          profile_display_name,
          profile_position,
          profile_description,
          profile_sections,
          display_order,
          is_published
        `,
      )
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Unable to load member: ${error.message}`,
    );
  }

  if (!member) {
    notFound();
  }

  const memberData: MemberFormData = {
    id: member.id,
    slug: member.slug,
    name: member.name,

    member_status:
      member.member_status === "former"
        ? "former"
        : "current",

    role: member.role,
    image_url: member.image_url,
    short_bio: member.short_bio,

    profile_display_name:
      member.profile_display_name,

    profile_position:
      member.profile_position,

    profile_description:
      member.profile_description,

    profile_sections:
      normalizeProfileSections(
        member.profile_sections,
      ),

    display_order:
      member.display_order,

    is_published:
      member.is_published,
  };

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
          Edit Member
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Update this member&apos;s profile,
          portrait, biography, status, and
          public profile information.
        </p>
      </div>

      <MemberForm member={memberData} />
    </section>
  );
}