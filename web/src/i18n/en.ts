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
    lead: 'Connect your tools and automate the work in between. Draw the flow yourself, or describe what you need and let AI build it. One line installs it on your computer.',
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
      'Each circle is a step, called a node. Slack, Google Sheets, email and file storage have steps of their own, anything else with an API is one HTTP request away, and when a step needs real logic you can write it in Elixir or Python.',
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
    title: 'What’s in the box',
    claim: 'Your tools,',
    claimAccent: 'already wired.',
    lead: 'Countless ready-made nodes. Drop one on the canvas, pick a credential, and it runs. Anything else with an API is one HTTP request away.',
    stampsLabel: 'Works with',
    stamps: ['Slack', 'Google Sheets', 'Email', 'S3', 'FTP', 'CSV', 'HTTP', 'Claude', 'GPT', 'Gemini', 'Grok', 'MCP'],
    stampsMore: 'and more',
    statsLabel: 'Heddle in numbers',
    stats: [
      { value: '387', label: 'runs per second' },
      { value: '11 ms', label: 'for one run' },
      { value: '0', label: 'runs lost in a crash' },
    ],
    features: [
      {
        title: 'AI that does the work',
        text: 'Summarize, classify, translate and extract data. Read and create images, transcribe audio, turn text into speech. Ready to drop in.',
      },
      {
        title: 'Agents with real tools',
        text: 'Hand an AI Agent your other steps, and it uses them as tools to get the job done.',
      },
      {
        title: 'Describe it, get a flow',
        text: 'Tell the AI chat what you need. It plans the flow and builds it once you approve.',
      },
      {
        title: 'Open to your AI tools',
        text: 'A built-in MCP server lets them read, build and run your flows.',
      },
      {
        title: 'Runs on its own',
        text: 'Cron schedules, webhooks that answer with the result, automatic retries and a history of every run.',
      },
      {
        title: 'Secrets stay secret',
        text: 'Credentials are encrypted. A flow keeps only their name, so a key never lands in a log.',
      },
      {
        title: 'Canvas or terminal',
        text: 'Draw in the browser, with notes and sections that explain the flow. Or stay in the terminal with Treadle.',
      },
      {
        title: 'Code when you want it',
        text: 'Drop into Elixir or Python for real logic, and drive everything through a public API.',
      },
    ],
    nextLabel: 'What’s next is on the',
    nextLink: 'project board',
  },
  bench: {
    title: 'Benchmark',
    why: 'Heddle runs on the BEAM, Erlang’s virtual machine, built to keep thousands of lightweight processes going at once. Each run is one of those processes, and the queue lives in Postgres itself, with no Redis or other service in the way.',
    result:
      'Among tools that record every run, it was the fastest: 387 runs per second, 4 times the runner-up and about 13 times n8n, compared inside each round. A run takes 11 ms from webhook to destination, against 52 ms or more in the others, with the least memory and disk in the table.',
    how: 'Same flow, same machine, default settings: a webhook triggers one HTTP call, and a run counts when that call reaches its destination. That’s 20,000 calls, and every number is the median of three rounds.',
    caption: 'Results of the same job in each tool, fastest first',
    tool: 'Tool',
    perSecond: 'Runs per second',
    oneRun: 'One run',
    memory: 'Idle memory',
    disk: 'Disk',
    star: '* Didn’t finish within the test’s 5-minute limit.',
    method: '[ See the method and the data ]',
    tabsLabel: 'Benchmark results',
    tabs: { speed: '[ Speed ]', slow: '[ Slow API ]', crash: '[ Crashes ]' },
    slow: {
      why: 'A real API takes a while to answer, so what counts is how many runs a tool keeps going at once. Each Heddle worker runs 50 by default, and a waiting run holds no database connection.',
      result:
        'Among tools that record every run, it was the fastest: 395 runs per second, 4.7 times the runner-up and about 10 times n8n, compared inside each round.',
      how: 'Same flow and default settings, with a destination that takes 100 ms to answer. That’s 3,000 calls, and every number is the median of three rounds.',
      caption: 'Runs per second with a slow destination, fastest first',
      limit: 'Each worker makes at most 50 calls at once, so a slower destination lowers this number.',
    },
    crash: {
      why: 'Heddle’s queue lives in Postgres, so what it accepted survives a crash, even with the whole machine going down. When it comes back, it carries on with the queue and restarts what was running.',
      result:
        'Among tools that record every run, Heddle was one of the two that lost nothing and left nothing stuck, with more than half of the work still queued. Windmill tied with it on that. Heddle’s 50 repeats are the runs that were in progress at the crash: the more runs at once, the more of them start over.',
      how: 'We took down each whole tool, database included, with kill -9 after 1,000 accepted calls, and checked call by call. The destination takes 100 ms to answer. Every number is the median of three rounds.',
      caption: 'What happened to the accepted calls after each crash',
      lost: 'Lost',
      stuck: 'Stuck',
      repeated: 'Repeated',
      star: '* With Redis on its default settings, without persistence.',
      rescue: 'In this test, Heddle waits 1 minute before restarting what was running. The default is 60 minutes.',
    },
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
      'Prefer to run it yourself? It’s free, and it’s yours. Paste one line in a terminal, answer a few questions, and Heddle opens in your browser. There’s no Docker to install and no database to set up.',
    unix: 'Mac and Linux',
    windows: 'Windows (PowerShell)',
    treadle: 'Only Treadle, the terminal editor',
    agent: 'Or ask your favorite AI agent',
    agentPrompt:
      'Install Heddle on this computer for me, following {guide}. First ask me which AI provider and model I want, and whether I also want Treadle, the terminal editor. Then run the one-line install with --yes, so it asks nothing, plus the options for my answers: passing --help to it lists them. If I give you an API key, pass it in the HEDDLE_LLM_API_KEY variable and never on the command line. If I’d rather not share one here, skip the AI: I can add it later on the AI page. When it finishes, run heddle doctor and tell me the address.',
    copy: '[ Copy ]',
    copied: '[ Copied ]',
    safety:
      'Heddle stays on your computer and can’t be reached from your network. Flows can run code with your account’s permissions, so run only the ones you trust.',
    after:
      'The installer asks which AI to use and whether you also want Treadle. Your key is checked before anything is installed. After that, the heddle command starts it, stops it, updates it and backs up your data.',
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

export type Copy = Omit<typeof en, 'lang' | 'path' | 'og'> & {
  lang: string;
  path: string;
  og: string;
};
