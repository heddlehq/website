// Copies the documentation from the Heddle repository into the site.
//
//     node scripts/sync_docs.mjs [path to the heddle repository] [--if-present]
//
// `npm run dev` and `npm run build` run it with --if-present, which leaves the docs
// as they are when there is no Heddle repository next to this one.
//
// The pages are written there, in docs/site/en and docs/site/pt, so they change with
// the code they describe. The node pages are made here from docs/reference/nodes.json,
// which `mix heddle.docs` writes from the definitions of the nodes. A page asks for a
// drawing of an example flow with `<!-- flow:name -->`, and gets it with a button to
// download it, or with `<!-- flow-art:name -->`, alone. `<!-- icon:hero-play -->` is
// one of the editor's icons. Nothing this writes is kept in
// git: the deploy runs it against the latest release.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const ifPresent = args.includes('--if-present');
const heddle = resolve(args.find((arg) => !arg.startsWith('--')) ?? join(web, '..', 'heddle'));
const docs = join(heddle, 'docs');
const repo = 'https://github.com/heddlehq/Heddle';

if (!existsSync(join(docs, 'site', 'en'))) {
  if (ifPresent) {
    console.log(`No documentation in ${docs}, so the docs stay as they are.`);
    process.exit(0);
  }
  console.error(`No documentation in ${docs}. Pass the path to the heddle repository.`);
  process.exit(1);
}

const content = join(web, 'src', 'content', 'docs');
const data = join(web, 'src', 'data', 'docs');
const assets = join(web, 'public', 'docs');
for (const dir of [content, data, assets]) rmSync(dir, { recursive: true, force: true });

const LOCALES = [
  { id: 'en', root: join(content, 'docs'), prefix: '/docs' },
  { id: 'pt', root: join(content, 'pt', 'docs'), prefix: '/pt/docs' },
];

const reference = JSON.parse(readFileSync(join(docs, 'reference', 'nodes.json'), 'utf8'));
const byType = new Map(
  reference.categories.flatMap((category) => category.nodes.map((node) => [node.name, { ...node, category: category.id }])),
);

const escape = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// ---------------------------------------------------------------- icons

// The icons of the nodes, from the editor's own: Heroicons and the services' logos.
const ui = join(heddle, 'apps', 'heddle_ui', 'priv');
const SETS = [
  ['-solid', '24/solid'],
  ['-mini', '20/solid'],
  ['-micro', '16/solid'],
  ['', '24/outline'],
];

const iconCache = new Map();
function icon(name) {
  if (!name) return null;
  if (iconCache.has(name)) return iconCache.get(name);
  let file;
  if (name.startsWith('logo-')) {
    file = join(ui, 'static', 'images', 'services', `${name.slice('logo-'.length)}.svg`);
  } else {
    const [suffix, dir] = SETS.find(([suffix]) => suffix === '' || name.endsWith(suffix));
    const base = suffix ? name.slice('hero-'.length, -suffix.length) : name.slice('hero-'.length);
    file = join(ui, 'heroicons', dir, `${base}.svg`);
  }
  let found = null;
  if (existsSync(file)) {
    const svg = readFileSync(file, 'utf8');
    const open = svg.match(/<svg\b[^>]*>/)[0];
    const attribute = (key) => open.match(new RegExp(`\\s${key}="([^"]*)"`))?.[1];
    found = {
      viewBox: attribute('viewBox') ?? '0 0 24 24',
      fill: attribute('fill') ?? null,
      stroke: attribute('stroke') ?? null,
      strokeWidth: attribute('stroke-width') ?? null,
      body: svg
        .slice(svg.indexOf(open) + open.length, svg.lastIndexOf('</svg>'))
        .replace(/<title>[^<]*<\/title>/g, '')
        .replace(/\s*\n\s*/g, ' ')
        .trim(),
    };
  }
  iconCache.set(name, found);
  return found;
}

function iconSvg(name, attrs = '') {
  const found = icon(name);
  if (!found) return '';
  const paint = [
    found.fill ? `fill="${found.fill}"` : '',
    found.stroke ? `stroke="${found.stroke}"` : '',
    found.strokeWidth ? `stroke-width="${found.strokeWidth}"` : '',
  ].join(' ');
  return `<svg viewBox="${found.viewBox}" ${paint} ${attrs} aria-hidden="true" focusable="false">${found.body}</svg>`;
}

// The colors of the canvas, by category, see custom-node.js. The site defines them.
const TONE = {
  trigger: 'trigger',
  flow_control: 'flow',
  code: 'code',
  data_manipulation: 'data',
  ai: 'ai',
  http: 'integration',
  database: 'integration',
  email: 'integration',
  ftp: 'integration',
  google_sheets: 'integration',
  s3: 'integration',
  slack: 'integration',
};
const tone = (category) => `var(--doc-node-${TONE[category] ?? 'utility'})`;

// ---------------------------------------------------------------- drawings of flows

// A flow drawn the way the canvas draws it: circles with the node's icon, its name
// above, sockets on the sides and Rete's curved wires. Sizes are custom-node.js's.
function drawFlow(flow) {
  const size = 88;
  const half = size / 2;
  const socket = 11;
  const iconSize = 36;
  const pad = 36;

  const at = new Map(flow.nodes.map((node) => [node.id, node.position]));
  const wires = flow.connections.flatMap(({ source, target }) => {
    const from = at.get(source);
    const to = at.get(target);
    if (!from || !to) return [];
    const [x1, y1, x2, y2] = [from.x + size, from.y + half, to.x, to.y + half];
    const curve = Math.max(Math.abs(x2 - x1) * 0.4, 40);
    return [`<path class="wire" d="M${x1} ${y1} C${x1 + curve} ${y1} ${x2 - curve} ${y2} ${x2} ${y2}"/>`];
  });

  const nodes = flow.nodes.map((node) => {
    const definition = byType.get(node.type);
    const { x, y } = node.position;
    const glyph = icon(definition?.icon);
    const language = node.controls?.language;
    const badge = language === 'elixir' ? 'EX' : language === 'python' ? 'PY' : null;
    return [
      `<g class="node" style="--node: ${tone(definition?.category)}">`,
      `<text class="name" x="${x + half}" y="${y - 12}">${escape(node.label)}</text>`,
      `<circle class="ring" cx="${x + half}" cy="${y + half}" r="${half - 1.5}"/>`,
      glyph
        ? `<svg class="glyph" x="${x + half - iconSize / 2}" y="${y + half - iconSize / 2}" width="${iconSize}" height="${iconSize}" viewBox="${glyph.viewBox}"${glyph.fill ? ` fill="${glyph.fill}"` : ''}${glyph.stroke ? ` stroke="${glyph.stroke}" stroke-width="${glyph.strokeWidth ?? 1.5}"` : ''}>${glyph.body}</svg>`
        : '',
      badge
        ? `<g class="badge"><rect x="${x + size - 26}" y="${y + size - 20}" width="22" height="15" rx="4"/><text x="${x + size - 15}" y="${y + size - 9}">${badge}</text></g>`
        : '',
      definition?.inputs?.length ? `<circle class="socket" cx="${x}" cy="${y + half}" r="${socket - 1}"/>` : '',
      definition?.outputs?.length ? `<circle class="socket" cx="${x + size}" cy="${y + half}" r="${socket - 1}"/>` : '',
      `</g>`,
    ].join('');
  });

  const boxes = flow.nodes.map((node) => ({
    x: node.position.x - socket - 30,
    y: node.position.y - 36,
    w: size + 2 * socket + 60,
    h: size + 36,
  }));
  const left = Math.min(...boxes.map((box) => box.x)) - pad;
  const top = Math.min(...boxes.map((box) => box.y)) - pad;
  const width = Math.max(...boxes.map((box) => box.x + box.w)) + pad - left;
  const height = Math.max(...boxes.map((box) => box.y + box.h)) + pad - top;

  return `<svg class="flow-drawing" viewBox="${left} ${top} ${width} ${height}" role="img" aria-label="${escape(flow.name)}">${wires.join('')}${nodes.join('')}</svg>`;
}

const FIGURE_WORDS = {
  en: { download: 'Download the flow', how: 'then open a flow and press ⋯ → Import from a file.' },
  pt: { download: 'Baixar o fluxo', how: 'depois abra um fluxo e aperte ⋯ → Import from a file.' },
};

function figures(text, locale) {
  const w = FIGURE_WORDS[locale.id];
  return text
    .replace(/<!--\s*icon:([\w-]+)\s*-->/g, (_match, name) => iconSvg(name, 'class="docs-icon"'))
    .replace(/<!--\s*(flow|flow-art):([\w-]+)\s*-->/g, (_match, kind, name) => {
    const file = join(docs, 'examples', `${name}.json`);
    if (!existsSync(file)) throw new Error(`No example flow called ${name}, in ${file}`);
    const flow = JSON.parse(readFileSync(file, 'utf8'));
    const drawing = drawFlow(flow);
    if (kind === 'flow-art') return `<div class="flow-art">${drawing}</div>`;
    return [
      `<figure class="flow-figure">`,
      `<div class="flow-canvas">${drawing}</div>`,
      `<figcaption><a class="flow-download" href="/docs/examples/${name}.json" download>`,
      `${iconSvg('hero-arrow-down-tray-mini', 'class="flow-download-icon"')}${escape(w.download)}</a>`,
      `<span>${escape(w.how)}</span></figcaption>`,
      `</figure>`,
    ].join('');
  });
}

// ---------------------------------------------------------------- written pages

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

let pages = 0;
for (const locale of LOCALES) {
  const source = join(docs, 'site', locale.id);
  for (const file of files(source)) {
    const target = join(locale.root, relative(source, file));
    mkdirSync(dirname(target), { recursive: true });
    const text = readFileSync(file, 'utf8');
    const editUrl = `${repo}/edit/main/docs/site/${locale.id}/${relative(source, file)}`;
    writeFileSync(target, figures(text, locale).replace(/^---\n/, `---\neditUrl: ${editUrl}\n`));
    pages++;
  }
}

// ---------------------------------------------------------------- node pages

mkdirSync(data, { recursive: true });
writeFileSync(join(data, 'nodes.json'), JSON.stringify(reference));

const WORDS = {
  en: {
    all: 'All nodes',
    allLead: 'Every node Heddle has, by category. Each page says what the node does, its fields, its outputs and what it leaves in the run.',
    inputs: 'Inputs',
    outputs: 'Outputs',
    none: 'None',
    trigger: 'Starts runs',
    credential: 'Credential',
    fields: 'Fields',
    noFields: 'It has no fields.',
    field: 'Field',
    name: 'Name',
    type: 'Type',
    default: 'Default',
    returns: 'What it returns',
    leaves: 'It leaves `result` as it was.',
    returnsLead: 'An example of `result` after it succeeds:',
    notes: 'How to use it',
    api: 'In a flow file',
    apiLead: 'How the node looks in a flow sent to the [API](/docs/reference/api/) or imported, with its defaults:',
    types: { text: 'Text', textarea: 'Text, several lines', select: 'Choice', model: 'Model', code: 'Code', 'variable-select': 'Variable' },
  },
  pt: {
    all: 'Todos os nós',
    allLead: 'Todos os nós do Heddle, por categoria. Cada página diz o que o nó faz, seus campos, suas saídas e o que ele deixa na execução. Os nomes e campos ficam em inglês, como aparecem no editor.',
    inputs: 'Entradas',
    outputs: 'Saídas',
    none: 'Nenhuma',
    trigger: 'Inicia execuções',
    credential: 'Credencial',
    fields: 'Campos',
    noFields: 'Não tem campos.',
    field: 'Campo',
    name: 'Nome',
    type: 'Tipo',
    default: 'Padrão',
    returns: 'O que devolve',
    leaves: 'Deixa `result` como estava.',
    returnsLead: 'Um exemplo de `result` depois que ele dá certo:',
    notes: 'Como usar',
    api: 'Num arquivo de fluxo',
    apiLead: 'Como o nó aparece num fluxo enviado pela [API](/pt/docs/reference/api/) ou importado, com os padrões:',
    types: { text: 'Texto', textarea: 'Texto, várias linhas', select: 'Escolha', model: 'Modelo', code: 'Código', 'variable-select': 'Variável' },
  },
};

const CREDENTIALS = {
  slack: ['Slack', 'slack'],
  smtp: ['Email (SMTP)', 'email'],
  imap: ['Email (IMAP)', 'email'],
  google: ['Google service account', 'google-sheets'],
  s3: ['S3', 's3'],
  ftp: ['FTP', 'ftp'],
  ai: ['AI provider', 'ai-provider'],
};

// The headings of the credentials page, which differ by language.
const ANCHORS = { pt: { 'ai-provider': 'provedor-de-ia', databases: 'bancos-de-dados' } };

const credentialLink = (kind, locale) => {
  const [label, anchor] = CREDENTIALS[kind] ?? [kind, 'databases'];
  const href = `${locale.prefix}/guides/credentials/#${ANCHORS[locale.id]?.[anchor] ?? anchor}`;
  return `<a href="${href}">${escape(label)}</a>`;
};

const yaml = (text) => JSON.stringify(text);
const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const code = (value) => (value === undefined || value === '' ? '' : `\`${cell(value)}\``);
const anchorOf = (category) => category.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const ports = (items, kind, w) =>
  items.length
    ? items.map((item) => `<span class="port port-${kind}">${escape(item)}</span>`).join('')
    : `<span class="port-none">${escape(kind === 'in' ? w.trigger : w.none)}</span>`;

function nodePage(node, category, locale, order) {
  const w = WORDS[locale.id];
  const out = [
    '---',
    `title: ${yaml(node.name)}`,
    `description: ${yaml(node.description)}`,
    `editUrl: ${repo}/edit/main/docs/nodes/${category.id}.json`,
    `sidebar:\n  order: ${order}`,
    '---',
    '',
    `<div class="node-hero" style="--node: ${tone(category.id)}">`,
    `<div class="node-hero-icon">${iconSvg(node.icon)}</div>`,
    `<div class="node-hero-text">`,
    `<a class="node-chip" href="${locale.prefix}/nodes/#${anchorOf(category)}">${escape(category.label)}</a>`,
    `<p>${escape(node.description)}</p>`,
    `</div>`,
    `</div>`,
    // On one line: a blank line would end the HTML block.
    `<dl class="node-facts">` +
      `<div><dt>${w.inputs}</dt><dd>${ports(node.inputs, 'in', w)}</dd></div>` +
      `<div><dt>${w.outputs}</dt><dd>${ports(node.outputs, 'out', w)}</dd></div>` +
      (node.credential ? `<div><dt>${w.credential}</dt><dd>${credentialLink(node.credential, locale)}</dd></div>` : '') +
      `</dl>`,
    '',
    `## ${w.fields}`,
    '',
  ];

  if (node.fields.length === 0) {
    out.push(w.noFields);
  } else {
    out.push(`| ${w.field} | ${w.name} | ${w.type} | ${w.default} |`, '| --- | --- | --- | --- |');
    for (const field of node.fields) {
      const options = field.options ? `<br/>${field.options.map((o) => code(o.value)).join(' ')}` : '';
      const type = (w.types[field.type] ?? field.type) + options;
      out.push(`| **${cell(field.label)}** | \`${field.name}\` | ${type} | ${code(field.default)} |`);
    }
  }

  out.push('', `## ${w.returns}`, '');
  if (node.result === null || node.result === undefined) {
    out.push(w.leaves);
  } else {
    out.push(w.returnsLead, '', '```json title="result"', JSON.stringify(node.result, null, 2), '```');
  }

  const notes = node.notes?.[locale.id];
  if (notes) out.push('', `## ${w.notes}`, '', notes);

  const controls = Object.fromEntries(node.fields.map((field) => [field.name, field.default ?? '']));
  if (node.credential) controls.credential = '';
  const example = { id: node.slug.replace(/-/g, '_'), type: node.name, label: node.name, controls };
  out.push('', `## ${w.api}`, '', w.apiLead, '', '```json', JSON.stringify(example, null, 2), '```', '');

  return out.join('\n');
}

function indexPage(locale) {
  const w = WORDS[locale.id];
  const out = ['---', `title: ${yaml(w.all)}`, `description: ${yaml(w.allLead)}`, 'editUrl: false', '---', '', w.allLead, ''];
  for (const category of reference.categories) {
    out.push(`## ${category.label}`, '', `<div class="node-grid">`);
    for (const node of category.nodes) {
      out.push(
        `<a class="node-card" href="${locale.prefix}/nodes/${node.slug}/" style="--node: ${tone(category.id)}">` +
          `<span class="node-card-icon">${iconSvg(node.icon)}</span>` +
          `<span class="node-card-text"><strong>${escape(node.name)}</strong><span>${escape(node.description)}</span></span>` +
          `</a>`,
      );
    }
    out.push(`</div>`, '');
  }
  return out.join('\n');
}

let nodes = 0;
for (const locale of LOCALES) {
  const dir = join(locale.root, 'nodes');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.md'), indexPage(locale));
  for (const category of reference.categories) {
    category.nodes.forEach((node, index) => {
      writeFileSync(join(dir, `${node.slug}.md`), nodePage(node, category, locale, index));
      nodes++;
    });
  }
}

// ---------------------------------------------------------------- files to download

mkdirSync(assets, { recursive: true });
cpSync(join(docs, 'examples'), join(assets, 'examples'), { recursive: true });
cpSync(join(docs, 'api', 'openapi.yaml'), join(assets, 'openapi.yaml'));

console.log(`Copied ${pages} pages and wrote ${nodes} node pages from ${heddle}`);
