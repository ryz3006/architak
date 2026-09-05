import { GalleryClient } from "@/components/admin/gallery-client";
import { listAdminMedia } from "@/features/media/admin";
import { getStorageUsage } from "@/features/media/storage-accounting";
import { requireAdminSession } from "@/features/auth/session";

export default async function AdminMediaPage() {
  await requireAdminSession();
  const [assets, usage] = await Promise.all([listAdminMedia({ limit: 200 }), getStorageUsage()]);

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Gallery</h1>
      <p className="measure mt-2 text-muted">
        Upload and manage website media. Every object is public or private. Storage is capped at 7
        GB.
      </p>
      <GalleryClient initialAssets={assets} usage={usage} />
    </main>
  );
}
