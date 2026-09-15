import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { resolvePublishedJournalPost, resolvePublishedJournalPosts } from "@/features/journal/resolver";
import { buildPageMetadata } from "@/features/discovery/metadata";
import { buildJournalPostJsonLd, buildBreadcrumbJsonLd, jsonLdScript } from "@/features/discovery/structured-data";
import { ShareButton } from "./_components/share-button";

import "@/styles/journal-post.css";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await resolvePublishedJournalPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePublishedJournalPost(slug);
  if (!post) return {};

  return buildPageMetadata({
    path: `/journal/${post.slug}`,
    title: post.title,
    description: post.excerpt || post.title,
    ogType: "article",
  });
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await resolvePublishedJournalPost(slug);
  if (!post) notFound();

  const lang = post.lang || "en";
  const dir = post.dir === "ltr" || post.dir === "rtl" ? post.dir : undefined;

  return (
    <main id="main-content" className="journal-post flex min-h-dvh flex-col" lang={lang} dir={dir}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildJournalPostJsonLd(post))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Journal", path: "/journal" },
            { name: post.title, path: `/journal/${post.slug}` },
          ]),
        )}
      />

      <SiteHeader />

      <article className="page-frame flex-1 py-fluid-xl">
        <header className="measure">
          <h1 className="display text-display-lg">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-4 text-fluid-lg text-muted">{post.excerpt}</p>
          )}
          <div className="mt-6 flex items-center gap-4 text-fluid-sm text-muted">
            {post.published_at && (
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            <ShareButton slug={post.slug} title={post.title} />
          </div>
        </header>

        {post.coverImage && (
          <div className="mt-fluid-lg">
            <img
              src={post.coverImage}
              alt=""
              className="w-full object-cover"
            />
          </div>
        )}

        {post.body && (post.body.intro || post.body.sections?.length) ? (
          <div className="measure mt-fluid-lg">
            {post.body.intro && (
              <p className="text-fluid-lg text-muted">{post.body.intro}</p>
            )}
            {post.body.sections?.map((section, index) => (
              <div key={index} className="mt-fluid-md">
                {section.heading && (
                  <h2 className="display text-display-sm">{section.heading}</h2>
                )}
                {section.body && (
                  <p className="mt-3 text-fluid-base whitespace-pre-line">{section.body}</p>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {post.relatedProjects.length > 0 && (
          <aside className="measure mt-fluid-lg border-t border-border pt-fluid-md">
            <h2 className="display text-display-sm">Related Work</h2>
            <ul className="mt-4 space-y-3">
              {post.relatedProjects.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/work/${project.slug}`}
                    className="text-fluid-base text-accent hover:underline"
                  >
                    {project.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="measure mt-fluid-lg">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-fluid-base text-accent hover:underline"
          >
            ← Back to Journal
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
