// Every external address lives here.
// When the rename happens, this is the only file that has to change.
const repo = 'https://github.com/heddlehq/Heddle';

export const site = {
  name: 'Heddle',
  version: '0.4.0',
};

export const waitlistEndpoint = 'https://heddle-waitlist.pedrohfonseca-1981.workers.dev';

// Served from web/public, so they follow this site if it ever moves to a domain.
const installBase = 'https://heddlehq.github.io/website';

export const installCommands = {
  unix: `curl -fsSL ${installBase}/install.sh | sh`,
  windows: `irm ${installBase}/install.ps1 | iex`,
};

export const links = {
  source: repo,
  install: `${repo}/blob/main/guides/installation.md`,
  scaling: `${repo}/blob/main/guides/scaling.md`,
  api: `${repo}/blob/main/docs/api/PUBLIC_API_GUIDE.md`,
  license: `${repo}/blob/main/LICENSE`,
  contributing: `${repo}/blob/main/CONTRIBUTING.md`,
  roadmap: 'https://github.com/heddlehq/roadmap',
  board: 'https://github.com/orgs/heddlehq/projects/2',
  discord: 'https://discord.gg/7zjnpna239',
  n8nLicense: 'https://github.com/n8n-io/n8n/blob/master/LICENSE.md',
};
