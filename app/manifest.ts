import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ARCHITAK",
    short_name: "ARCHITAK",
    description: "Interior design studio in Vyttila, Kochi.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/brand/logo-mark.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/logo-mark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
