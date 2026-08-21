import { requireAdminSession } from "@/features/auth/session";
import { listAdminMedia } from "@/features/media/admin";

export default async function AdminMediaPage() {
  await requireAdminSession();
  const assets = await listAdminMedia();

  return (
    <main id="main-content">
      <h1 className="display text-display-md">Media library</h1>
      <p className="measure mt-2 text-muted">
        Every object must be explicitly public or private. Public keys start with{" "}
        <code>public/</code>; private keys never leave signed URLs.
      </p>

      {assets.length === 0 ? (
        <div className="mt-12 border border-border p-8">
          <h2 className="display text-fluid-xl">No media assets yet</h2>
          <p className="measure mt-3 text-muted">
            Apply the Sprint 0b seed or upload through a forthcoming signed-upload flow. Prefix
            markers already exist in R2 under <code>public/</code> and <code>private/</code>.
          </p>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {assets.map((asset) => (
            <li key={asset.id} className="border border-border p-4">
              <p className="text-fluid-sm">{asset.storage_key}</p>
              <p className="mt-1 text-fluid-xs tracking-widest text-muted uppercase">
                {asset.visibility} · {asset.mime_type}
                {asset.alt_text ? ` · ${asset.alt_text}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
