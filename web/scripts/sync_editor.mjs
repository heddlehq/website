// Copies Heddle's canvas into the site, so the showcase draws flows with the real one.
//
//     node scripts/sync_editor.mjs [path to the heddle repository]
//
// The files land in src/showcase/editor/ unchanged. The site builds on its own, so
// they are kept in git, and this is run again when the editor changes. It also writes
// icons.css with the icons the showcase flows use: the hero-* ones, the way the
// app's Tailwind plugin makes them, and the logo-* ones of services.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const heddle = resolve(process.argv[2] ?? join(web, '..', 'heddle'));
const assets = join(heddle, 'apps', 'heddle_ui', 'assets');
const heroicons = join(heddle, 'apps', 'heddle_ui', 'priv', 'heroicons');
const services = join(heddle, 'apps', 'heddle_ui', 'priv', 'static', 'images', 'services');
const target = join(web, 'src', 'showcase', 'editor');

if (!existsSync(join(assets, 'js', 'rete_editor.js'))) {
  console.error(`No Heddle editor in ${assets}. Pass the path to the heddle repository.`);
  process.exit(1);
}

mkdirSync(target, { recursive: true });

const scripts = readdirSync(join(assets, 'js')).filter(
  (file) => file === 'rete_editor.js' || /^custom-.*\.js$/.test(file),
);
for (const file of scripts) copyFileSync(join(assets, 'js', file), join(target, file));
copyFileSync(join(assets, 'css', 'rete_custom.css'), join(target, 'rete_custom.css'));

// The icons of the nodes the showcase flows use.
const { definitions } = JSON.parse(readFileSync(join(web, 'src', 'data', 'showcase', 'flows.json'), 'utf8'));
const icons = new Set(Object.values(definitions).map((definition) => definition.icon).filter(Boolean));

const sets = [
  ['-solid', '24/solid'],
  ['-mini', '20/solid'],
  ['-micro', '16/solid'],
  ['', '24/outline'],
];

const svgUrl = (path) =>
  `url('data:image/svg+xml;utf8,${encodeURIComponent(readFileSync(path, 'utf8').replace(/\r?\n|\r/g, ''))}')`;

// A service's logo keeps its colors, so it is a background and not a mask.
const logo = (icon) =>
  `.${icon} {\n  display: inline-block;\n  background: ${svgUrl(join(services, `${icon.slice('logo-'.length)}.svg`))} center / contain no-repeat;\n}`;

const hero = (icon) => {
  const [suffix, dir] = sets.find(([suffix]) => suffix === '' || icon.endsWith(suffix));
  const name = suffix ? icon.slice('hero-'.length, -suffix.length) : icon.slice('hero-'.length);
  const url = svgUrl(join(heroicons, dir, `${name}.svg`));
  return `.${icon} {\n  --${icon}: ${url};\n  -webkit-mask: var(--${icon});\n  mask: var(--${icon});\n  mask-repeat: no-repeat;\n  background-color: currentColor;\n  vertical-align: middle;\n  display: inline-block;\n}`;
};

const css = [
  "/* Written by scripts/sync_editor.mjs from Heddle's icons. Do not edit. */",
  ...[...icons].sort().map((icon) => (icon.startsWith('logo-') ? logo(icon) : hero(icon))),
].join('\n\n');
writeFileSync(join(target, 'icons.css'), `${css}\n`);

// The same icons as SVG, for the drawings of the gallery cards.
const iconFile = (icon) => {
  if (icon.startsWith('logo-')) return join(services, `${icon.slice('logo-'.length)}.svg`);
  const [suffix, dir] = sets.find(([suffix]) => suffix === '' || icon.endsWith(suffix));
  const name = suffix ? icon.slice('hero-'.length, -suffix.length) : icon.slice('hero-'.length);
  return join(heroicons, dir, `${name}.svg`);
};

const svgs = {};
for (const icon of [...icons].sort()) {
  const svg = readFileSync(iconFile(icon), 'utf8');
  const open = svg.match(/<svg\b[^>]*>/)[0];
  const attribute = (name) => open.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
  svgs[icon] = {
    viewBox: attribute('viewBox') ?? '0 0 24 24',
    fill: attribute('fill') ?? null,
    body: svg
      .slice(svg.indexOf(open) + open.length, svg.lastIndexOf('</svg>'))
      .replace(/<title>[^<]*<\/title>/g, '')
      .replace(/\s*\n\s*/g, ' ')
      .trim(),
  };
}
writeFileSync(join(target, 'icons.json'), `${JSON.stringify(svgs, null, 2)}\n`);

console.log(`Copied ${scripts.length + 1} editor files and ${icons.size} icons to ${target}`);
