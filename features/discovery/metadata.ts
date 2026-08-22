import type { Metadata } from "next";

import { absoluteUrl, getSiteUrl } from "@/features/discovery";

type BuildPageMetadataOptions = {
  path: string;
  title: string;
  description: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
};

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function buildPageMetadata({
  path,
  title,
  description,
  ogType = "website",
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: ogType,
      locale: "en_IN",
      siteName: "ARCHITAK",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
