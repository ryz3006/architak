import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { resolvePublishedJournalPosts } from "@/features/journal/resolver";
import { buildPageMetadata } from "@/features/discovery/metadata";
import { PageCta } from "@/components/pages/page-cta";
import { getStudioPageContent } from "@/features/content/site-content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/journal",
    title: "Journal — ARCHITAK",
    description: "Insights, case studies, and announcements from ARCHITAK interior design studio.",
  });
}

export default async function JournalIndexPage() {
  const posts = await resolvePublishedJournalPosts();
  const studioPage = await getStudioPageContent();

  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <SiteHeader />

      <div className="page-frame flex-1 py-fluid-xl">
        <header className="measure">
          <h1 className="display text-display-lg">Journal</h1>
          <p className="mt-4 text-fluid-lg text-muted">
            Insights, case studies, and studio announcements.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="measure mt-fluid-lg">
            <p className="text-fluid-base text-muted">
              No posts published yet. Check back soon for updates from the studio.
            </p>
          </div>
        ) : (
          <ul className="mt-fluid-lg grid gap-fluid-lg md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug} className="group">
                <Link href={`/journal/${post.slug}`} className="block">
                  {post.coverImage && (
                    <div className="aspect-[4/3] overflow-hidden bg-surface">
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className={post.coverImage ? "mt-fluid-sm" : ""}>
                    <h2 className="display text-display-sm group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-fluid-base text-muted line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    {post.published_at && (
                      <time className="mt-2 block text-fluid-sm text-muted" dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PageCta
        eyebrow={studioPage.cta.eyebrow}
        headline={studioPage.cta.headline}
        support={studioPage.cta.support}
        showContactLink={true}
      />

      <SiteFooter />
    </main>
  );
}
