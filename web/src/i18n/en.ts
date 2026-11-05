export const en = {
  lang: 'en',
  path: '/',
  og: 'og.png',
  meta: {
    title: 'Heddle: automation you actually own',
    description:
      'Open-source workflow automation under the MIT license. Connect your tools in a visual editor, and run it, embed it or sell it.',
  },
  skip: 'Skip to content',
  home: 'Heddle, home',
  navLabel: 'Main',
  nav: { what: 'What it does', early: 'Early access', source: 'GitHub' },
  switchTo: { label: 'PT', title: 'Ver em português', lang: 'pt-BR', path: '/pt/' },
  hero: {
    lines: ['Automation you', 'actually own.'],
    accent: 'own',
    lead: 'Connect your tools and automate the work in between, in a visual editor. MIT licensed: run it, embed it, sell it.',
    join: '[ Join the early access list ]',
    selfHost: '[ Self-host it ]',
  },
  entry: {
    kind: 'noun.',
    text: 'The part of a loom that lifts each warp thread so the weft can pass through. It decides which way every thread goes.',
  },
  what: {
    title: 'What it does',
    intro:
      'Most companies run on small jobs that repeat: copy this over there, tell that person, check this before that. Heddle does them for you. You draw the steps once, and it follows them every time.',
    after:
      'Each circle is a step, called a node. Anything with an API can be a step through an HTTP request, and when a step needs real logic you can write it in Elixir or Python.',
  },
  figure: {
    title: 'A new order drawn as a flow of threads',
    desc: 'A new order leads to a check: is it paid? If yes, the warehouse is told. If no, it is logged. If telling the warehouse fails, that is logged too. Both paths end at done. A red thread marks one run: new order, paid, warehouse told, done.',
    webhook: 'New order',
    condition: 'Is it paid?',
    http: 'Tell warehouse',
    logger: 'Log it',
    output: 'Done',
    yes: 'yes',
    no: 'no',
    failed: 'failed',
    fig: 'Fig. 1.',
    caption: 'A new order comes in. The red thread is one run: the order was paid, so the warehouse was told.',
  },
  today: {
    title: 'Today, and what’s next',
    intro:
      'Heddle is young, and we’d rather say so. There are no ready-made connectors yet: today, you reach other services through HTTP.',
    nowLabel: 'Works today',
    now: [
      'A visual editor with eight kinds of step: Start, Webhook, HTTP Request, Condition, Evaluate Code, Variable, Logger and Output',
      'An AI chat that plans a flow and builds it once you approve (needs an OpenAI key)',
      'A history of every run',
      'A public API for your flows',
      'Up to three attempts when a run fails',
    ],
    nextLabel: 'Coming next',
    next: [
      'Scheduled runs',
      'A safe place for your credentials',
      'First integrations, like Slack, Google Sheets and email',
      'Data and file steps: CSV, S3, FTP',
      'Native AI agents',
      'Flow versions with rollback',
      'Run metrics',
    ],
    note: 'These are plans, not dates. Follow them on the',
    noteLink: 'project board',
  },
  own: {
    title: 'Yours to keep',
    intro:
      'Heddle is under the MIT license: use it, change it, build it into what you sell. Not every tool in this space works that way. n8n, for example, uses the Sustainable Use License, which limits use to internal business, personal or non-commercial purposes.',
    caption: 'What each license allows',
    want: 'You want to',
    heddle: 'Heddle',
    n8n: 'n8n',
    yes: 'yes',
    no: 'no*',
    rows: [
      ['Run it inside your company', true],
      ['Change the code for your own use', true],
      ['Build it into a product you sell', false],
      ['Host it for paying customers', false],
    ] as [string, boolean][],
    star: '* Not under that license. n8n also has separate enterprise licensing.',
    fair: 'n8n is mature, with over 500 integrations, and that counts. This table is only about who owns what. It comes from the license texts and isn’t legal advice:',
    mit: 'MIT',
    sul: 'Sustainable Use License',
    and: 'and',
  },
  early: {
    title: 'Early access',
    intro:
      'A hosted Heddle is planned, so you won’t have to install anything. Join the list and we’ll write when early access opens.',
    label: 'Your email',
    placeholder: 'you@company.com',
    submit: '[ Join the list ]',
    sending: '[ Sending ]',
    success: 'You’re on the list. We’ll write when it opens.',
    error: 'That didn’t go through. Try again in a minute.',
    consent: 'We’ll use your email only for this. To leave the list, reply to any message.',
    noscript: 'This form needs JavaScript. You can also find us on',
  },
  selfHost: {
    title: 'Self-host it',
    intro:
      'Prefer to run it yourself? It’s free, and it’s yours. Paste one line in a terminal and Heddle opens in your browser. There’s no Docker to install and no database to set up.',
    unix: 'Mac and Linux',
    windows: 'Windows (PowerShell)',
    copy: '[ Copy ]',
    copied: '[ Copied ]',
    safety:
      'Heddle stays on your computer and can’t be reached from your network. Flows can run code with your account’s permissions, so run only the ones you trust.',
    guide: '[ Install on a server ]',
    tech: 'For the technical reader: two roles share one Postgres database. The UI serves the editor and queues each run, workers execute them, and you add workers as volume grows. The',
    scaling: 'scaling guide',
    techEnd: 'has the details, and the',
    api: 'public API guide',
    techTail: 'covers the rest.',
  },
  open: {
    title: 'In the open',
    a: 'Heddle is built in public. The plans are on the',
    roadmap: 'roadmap',
    b: 'and the conversation is on',
    c: 'If you want to help, start with the',
    contributing: 'contributing guide',
  },
  footer: {
    closing: 'Every thread goes where it should.',
    license: 'MIT license',
  },
};

type Rows = (typeof en)['own']['rows'];

export type Copy = Omit<typeof en, 'lang' | 'path' | 'og'> & {
  lang: string;
  path: string;
  og: string;
  own: Omit<(typeof en)['own'], 'rows'> & { rows: Rows };
};
