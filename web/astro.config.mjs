// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync, existsSync } from 'node:fs';

// Both come from the deploy workflow. SITE_URL turns on canonical and absolute
// OG URLs. BASE_PATH is for hosting under a subpath, like GitHub Pages.
const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

// Pages link to each other as /docs/..., the way they live in the Heddle repository.
// Under a subpath, those links need it in front.
function baseLinks() {
  /** @param {{ type: string, url?: string, value?: string, children?: any[] }} node */
  const walk = (node) => {
    if ((node.type === 'link' || node.type === 'definition') && node.url && /^\/(?!\/)/.test(node.url)) {
      if (base && !node.url.startsWith(base + '/')) node.url = base + node.url;
    }
    // The drawings and cards scripts/sync_docs.mjs writes are HTML.
    if (node.type === 'html' && base && node.value) {
      node.value = node.value.replace(/href="\/(?!\/)/g, `href="${base}/`);
    }
    for (const child of node.children ?? []) walk(child);
  };
  return () => walk;
}

// The documentation is copied in by scripts/sync_docs.mjs. Without it, the site
// builds with no docs rather than failing on a sidebar that names missing pages.
const hasDocs = existsSync('src/content/docs/docs/index.md');

// The nodes, by category, from the reference scripts/sync_docs.mjs copies in.
const reference = 'src/data/docs/nodes.json';
/** @type {{ id: string, label: string, nodes: { slug: string }[] }[]} */
const categories = existsSync(reference) ? JSON.parse(readFileSync(reference, 'utf8')).categories : [];

/** @param {string} label @param {string} pt @param {string} directory */
const group = (label, pt, directory) => ({
  label,
  translations: { 'pt-BR': pt },
  items: [{ autogenerate: { directory } }],
});

export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.BASE_PATH,
  // Compression drops the line break before an inline link, which glues words together.
  compressHTML: false,
  markdown: { remarkPlugins: [baseLinks()] },
  integrations: [
    starlight({
      title: { en: 'Heddle docs', 'pt-BR': 'Docs do Heddle' },
      logo: { light: './src/assets/logo.svg', dark: './src/assets/logo-dark.svg', alt: 'Heddle' },
      favicon: '/favicon.svg',
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
        pt: { label: 'Português', lang: 'pt-BR' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/heddlehq/Heddle' }],
      editLink: { baseUrl: 'https://github.com/heddlehq/Heddle/edit/main/docs/site/' },
      // Code on paper in light mode and on ink in dark, in the site's typewriter face.
      expressiveCode: {
        themes: ['github-dark-dimmed', 'rose-pine-dawn'],
        styleOverrides: {
          borderRadius: '0.75rem',
          borderColor: 'var(--doc-border)',
          codeFontFamily: "'Courier Prime', 'Courier New', monospace",
          codeFontSize: '0.88rem',
          codeLineHeight: '1.6',
          codeBackground: ({ theme }) => (theme.type === 'dark' ? '#1f2226' : '#efe6d4'),
          frames: {
            shadowColor: 'transparent',
            editorTabBarBackground: ({ theme }) => (theme.type === 'dark' ? '#26292e' : '#e6dcc6'),
            editorActiveTabBackground: ({ theme }) => (theme.type === 'dark' ? '#1f2226' : '#efe6d4'),
            editorActiveTabIndicatorTopColor: 'var(--sl-color-accent)',
            terminalTitlebarBackground: ({ theme }) => (theme.type === 'dark' ? '#26292e' : '#e6dcc6'),
            terminalBackground: ({ theme }) => (theme.type === 'dark' ? '#1f2226' : '#efe6d4'),
          },
        },
      },
      customCss: [
        '@fontsource/courier-prime/latin-400.css',
        '@fontsource/courier-prime/latin-700.css',
        '@fontsource/ia-writer-quattro/latin-400.css',
        '@fontsource/ia-writer-quattro/latin-700.css',
        './src/styles/docs.css',
      ],
      sidebar: hasDocs ? [
        { slug: 'docs' },
        group('Getting started', 'Primeiros passos', 'docs/start'),
        group('Tutorials', 'Tutoriais', 'docs/tutorials'),
        group('Concepts', 'Conceitos', 'docs/concepts'),
        group('Guides', 'Guias', 'docs/guides'),
        {
          label: 'Nodes',
          translations: { 'pt-BR': 'Nós' },
          items: [
            { slug: 'docs/nodes' },
            ...categories.map((category) => ({
              label: category.label,
              collapsed: true,
              items: category.nodes.map((node) => ({ slug: `docs/nodes/${node.slug}` })),
            })),
          ],
        },
        group('Reference', 'Referência', 'docs/reference'),
        group('Self-hosting', 'Hospedagem própria', 'docs/self-hosting'),
      ] : [],
    }),
  ],
});
