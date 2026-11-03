// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Both come from the deploy workflow. SITE_URL turns on canonical and absolute
  // OG URLs. BASE_PATH is for hosting under a subpath, like GitHub Pages.
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH,
  // Compression drops the line break before an inline link, which glues words together.
  compressHTML: false,
});
