interface Env {
  DB: D1Database;
  LIMITER: RateLimit;
  ALLOWED_ORIGINS: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGS = new Set(['en', 'pt-BR']);

function reply(status: number, origin: string, body?: object): Response {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
      Vary: 'Origin',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    if (!env.ALLOWED_ORIGINS.split(',').includes(origin)) {
      return new Response(null, { status: 403 });
    }
    if (request.method === 'OPTIONS') return reply(204, origin);
    if (request.method !== 'POST') return reply(405, origin);

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.LIMITER.limit({ key: ip });
    if (!success) return reply(429, origin, { ok: false });

    const data = await request
      .json<{ email?: unknown; lang?: unknown; website?: unknown }>()
      .catch(() => null);
    if (!data) return reply(400, origin, { ok: false });

    // The website field is a honeypot: people never see it, bots fill it in.
    if (data.website) return reply(200, origin, { ok: true });

    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (email.length > 254 || !EMAIL.test(email)) return reply(400, origin, { ok: false });

    const lang = typeof data.lang === 'string' && LANGS.has(data.lang) ? data.lang : 'en';

    // A repeat signup gets the same answer, so the form never reveals who is on the list.
    await env.DB.prepare('INSERT OR IGNORE INTO signups (email, lang) VALUES (?, ?)')
      .bind(email, lang)
      .run();

    return reply(200, origin, { ok: true });
  },
} satisfies ExportedHandler<Env>;
