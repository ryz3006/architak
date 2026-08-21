import { ImageResponse } from "next/og";

import { getStaticProjectBySlug, getStaticProjects } from "@/content/static";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getStaticProjects().map((project) => ({ slug: project.slug }));
}

export default async function ProjectOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getStaticProjectBySlug(slug);
  const title = project?.title ?? "ARCHITAK";
  const meta = project ? `${project.category} · ${project.location}` : "Interiors studio, Kochi";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f5f2eb",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "20px solid transparent",
              borderRight: "20px solid transparent",
              borderBottom: "34px solid #c4a574",
            }}
          />
          <div style={{ fontSize: 30, letterSpacing: "0.24em" }}>ARCHITAK</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 28, letterSpacing: "0.2em", color: "#c4a574" }}>
            {meta.toUpperCase()}
          </div>
          <div style={{ fontSize: 84, lineHeight: 1.04, letterSpacing: "-0.02em" }}>{title}</div>
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#a5a09a",
            borderTop: "1px solid #2a2a2a",
            paddingTop: "24px",
          }}
        >
          architak.in
        </div>
      </div>
    ),
    size,
  );
}
