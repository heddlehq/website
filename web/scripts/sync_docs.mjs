// Copies the documentation from the Heddle repository into the site.
//
//     node scripts/sync_docs.mjs [path to the heddle repository] [--if-present]
//
// `npm run dev` and `npm run build` run it with --if-present, which leaves the docs
// as they are when there is no Heddle repository next to this one.
//
// The pages are written there, in docs/site/en and docs/site/pt, so they change with
// the code they describe. The node pages are made here from docs/reference/nodes.json,
// which `mix heddle.docs` writes from the definitions of the nodes. Nothing this
// writes is kept in git: the deploy runs it against the latest release.
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
    writeFileSync(target, text.replace(/^---\n/, `---\neditUrl: ${editUrl}\n`));
    pages++;
  }
}

// ---------------------------------------------------------------- node pages

const reference = JSON.parse(readFileSync(join(docs, 'reference', 'nodes.json'), 'utf8'));
mkdirSync(data, { recursive: true });
writeFileSync(join(data, 'nodes.json'), JSON.stringify(reference));

const WORDS = {
  en: {
    all: 'All nodes',
    allLead: 'Every node Heddle has, by category. Each page says what the node does, its fields, its outputs and what it leaves in the run.',
    category: 'Category',
    inputs: 'Inputs',
    outputs: 'Outputs',
    none: 'None',
    credential: 'Credential',
    fields: 'Fields',
    noFields: 'It has no fields.',
    field: 'Field',
    name: 'Name',
    type: 'Type',
    default: 'Default',
    options: 'Options',
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
    category: 'Categoria',
    inputs: 'Entradas',
    outputs: 'Saídas',
    none: 'Nenhuma',
    credential: 'Credencial',
    fields: 'Campos',
    noFields: 'Não tem campos.',
    field: 'Campo',
    name: 'Nome',
    type: 'Tipo',
    default: 'Padrão',
    options: 'Opções',
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
  return `[${label}](${locale.prefix}/guides/credentials/#${ANCHORS[locale.id]?.[anchor] ?? anchor})`;
};

const yaml = (text) => JSON.stringify(text);
const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const code = (value) => (value === undefined || value === '' ? '' : `\`${cell(value)}\``);
const list = (items, w) => (items.length ? items.map((item) => `\`${item}\``).join(', ') : w.none);

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
    node.description,
    '',
    `| | |`,
    `| --- | --- |`,
    `| **${w.category}** | [${category.label}](${locale.prefix}/nodes/#${category.id.replace(/_/g, '-')}) |`,
    `| **${w.inputs}** | ${list(node.inputs, w)} |`,
    `| **${w.outputs}** | ${list(node.outputs, w)} |`,
  ];
  if (node.credential) out.push(`| **${w.credential}** | ${credentialLink(node.credential, locale)} |`);

  out.push('', `## ${w.fields}`, '');
  if (node.fields.length === 0) {
    out.push(w.noFields);
  } else {
    out.push(`| ${w.field} | ${w.name} | ${w.type} | ${w.default} |`, '| --- | --- | --- | --- |');
    for (const field of node.fields) {
      const options = field.options ? ` (${field.options.map((o) => code(o.value)).join(', ')})` : '';
      const type = (w.types[field.type] ?? field.type) + options;
      out.push(`| ${cell(field.label)} | \`${field.name}\` | ${type} | ${code(field.default)} |`);
    }
  }

  out.push('', `## ${w.returns}`, '');
  if (node.result === null || node.result === undefined) {
    out.push(w.leaves);
  } else {
    out.push(w.returnsLead, '', '```json', JSON.stringify(node.result, null, 2), '```');
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
    out.push(`## ${category.label}`, '', `| | |`, `| --- | --- |`);
    for (const node of category.nodes) {
      out.push(`| [${node.name}](${locale.prefix}/nodes/${node.slug}/) | ${cell(node.description)} |`);
    }
    out.push('');
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
