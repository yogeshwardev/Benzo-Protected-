import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://benzo.co.in";

  return ["", "/courses", "/auth/login", "/auth/register"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
}

