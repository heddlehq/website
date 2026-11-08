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
  nav: { what: 'What it does', showcase: 'Showcase', early: 'Early access', source: 'GitHub' },
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
    watch: '[ See real flows ]',
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
        title: 'Build it together',
        text: 'Everyone on a flow sees the others’ cursors and changes as they happen. It saves itself, and undo takes back only what you did.',
      },
      {
        title: 'Publish when it’s ready',
        text: 'Edit a draft while production runs the version you published. Every version keeps who changed what and when, and goes back in one click.',
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
  showcase: {
    path: '/showcase/',
    meta: {
      title: 'Showcase: real flows built with Heddle',
      description:
        'Flows people actually run, drawn on Heddle’s own canvas: leads, reports, support, refunds, uptime and orders.',
    },
    title: 'Showcase',
    lead: 'Flows people actually run, drawn on Heddle’s own canvas. Open one to look around it, and click a node to see how it is set up.',
    galleryLabel: 'Flows',
    open: 'Open',
    trigger: { webhook: 'On a webhook', schedule: 'On a schedule' } as Record<string, string>,
    nodes: '{n} nodes',
    close: 'Close',
    canvasLabel: 'The flow on Heddle’s canvas',
    hint: 'Drag to move around, Ctrl and scroll to zoom. Click a node to see how it is set up.',
    noscript: 'Opening a flow needs JavaScript.',
    inspector: {
      label: 'Node details',
      idle: 'Click a node to see how it is set up.',
      fields: 'Fields',
      outputs: 'Goes out through',
    },
    checked:
      'Every flow here passes the checks Heddle makes before it saves one. The credentials are left out, since each person picks their own.',
    tryIt: {
      title: 'Build your own',
      text: 'Heddle installs with one line, on your computer or a server. Draw a flow like these, or describe it and let the AI build it.',
    },
    flows: {
      leads: {
        title: 'Route new leads',
        summary: 'A form sends a lead. The flow looks its company up on GitHub, scores it, and sends it to sales, the pipeline or a welcome email.',
        labels: {
          form: 'Form sent',
          keep: 'Keep the lead',
          lookup: 'Look up the company',
          score: 'Score it',
          route: 'Route by tier',
          sales: 'Tell sales',
          pipeline: 'Add to the pipeline',
          welcome: 'Send the guides',
          join: 'Join',
          answer: 'Answer the form',
        },
        notes: {
          'why-keep':
            'The HTTP Request has a body field of its own, which would hide the form’s. So the lead is kept under another name first.',
        },
      },
      'sales-report': {
        title: 'Daily sales report',
        summary: 'Every weekday at 8, yesterday’s sales come out of the database, an AI sums them up, and the summary goes to Slack and by email.',
        labels: {
          morning: 'Weekdays at 8',
          sales: 'Yesterday’s sales',
          summary: 'Sum it up',
          channel: 'Post in #sales',
          leadership: 'Email leadership',
          failed: 'Tell ops it failed',
        },
        notes: {
          bound: 'The query runs as it is written. Values from a run would go in as bound parameters, never as text.',
        },
      },
      support: {
        title: 'Support triage with AI',
        summary: 'An AI sorts each new ticket. Bugs go to engineering, billing goes to billing, and questions get a first answer right away.',
        labels: {
          ticket: 'New ticket',
          sort: 'Sort it',
          route: 'Route by kind',
          engineering: 'Tell engineering',
          billing: 'Forward to billing',
          draft: 'Write an answer',
          reply: 'Reply to the customer',
          join: 'Join',
          answer: 'Tell the help desk',
        },
        notes: {
          copy: 'The answer goes out with support in copy, so a person sees every one.',
        },
      },
      refunds: {
        title: 'Refunds with approval',
        summary: 'A refund waits for finance to approve it from a link in an email. If nobody does in two days, finance hears about it.',
        labels: {
          request: 'Refund requested',
          keep: 'Keep the request',
          ask: 'Ask finance',
          approval: 'Wait for approval',
          pay: 'Refund the order',
          customer: 'Tell the customer',
          expired: 'Nobody approved it',
        },
        notes: {
          resume: '{{resume_url}} resumes this run. The wait is saved, so it survives a restart of the server.',
        },
      },
      uptime: {
        title: 'Uptime monitor',
        summary: 'Every five minutes the site is checked. Redis counts the failures, and on-call hears about it once, on the third in a row.',
        labels: {
          every: 'Every 5 minutes',
          check: 'Check the site',
          clear: 'Forget the failures',
          count: 'Count the failure',
          third: 'Third in a row?',
          alert: 'Alert on-call',
        },
        notes: {
          once: 'Only the third failure alerts. The ones after it go on counting quietly, until the site is back.',
        },
      },
      orders: {
        title: 'Orders and stock',
        summary: 'A shop sends each order. Every item takes stock off in the database, and the customer gets a confirmation once all of them are done.',
        labels: {
          order: 'New order',
          keep: 'Keep the order',
          each: 'Each item',
          stock: 'Take it from stock',
          confirm: 'Confirm the order',
          answer: 'Answer the shop',
        },
        notes: {
          bound: '{{item.quantity}} and {{item.sku}} go to the database as bound parameters, never pasted into the SQL.',
        },
      },
    } as Record<string, { title: string; summary: string; labels: Record<string, string>; notes: Record<string, string> }>,
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
