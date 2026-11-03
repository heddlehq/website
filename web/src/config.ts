// Every external address and the install commands live here.
// When the rename happens, this is the only file that has to change.
const repo = 'https://github.com/FusionFlow-app/fusion_flow';

export const site = {
  name: 'Heddle',
  version: '0.3.0',
  description:
    'Heddle is an open-source workflow engine. Draw your business logic as a flow of nodes and run it on Elixir.',
};

export const links = {
  source: repo,
  install: 'https://hexdocs.pm/fusion_flow/installation.html',
  scaling: `${repo}/blob/main/guides/scaling.md`,
  api: `${repo}/blob/main/docs/api/PUBLIC_API_GUIDE.md`,
  license: `${repo}/blob/main/LICENSE`,
  contributing: `${repo}/blob/main/CONTRIBUTING.md`,
  roadmap: 'https://github.com/FusionFlow-app/roadmap',
  board: 'https://github.com/orgs/FusionFlow-app/projects/2',
  discord: 'https://discord.gg/7zjnpna239',
};

export const commands = {
  start: [
    `git clone ${repo}.git`,
    'cd fusion_flow',
    'echo "SECRET_KEY_BASE=$(head -c 48 /dev/urandom | base64)" > .env',
    'docker compose up -d --build db ui worker',
  ],
  scale: ['docker compose up -d --scale worker=5 worker'],
};
