import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// The documentation, written in the Heddle repository and copied in by
// scripts/sync_docs.mjs. See README.md.
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
