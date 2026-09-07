import type { Metadata } from "next";
import Link from "next/link";

import GalleryAlbumForm from "@/components/gallery/GalleryAlbumForm";

export const metadata: Metadata = {
  title: "New Gallery Album",
};

export default function NewGalleryAlbumPage() {
  return (
    <section>
      <div className="mb-8">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800"
        >
          <span aria-hidden="true">←</span>
          Back to Gallery
        </Link>

        <p className="mt-6 text-sm font-semibold text-violet-600">
          Gallery Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          New Album
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Create a Gallery album and add multiple photographs to the
          same collection.
        </p>
      </div>

      <GalleryAlbumForm />
    </section>
  );
}