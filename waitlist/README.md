# Heddle waitlist

Cloudflare Worker with a D1 database. Stores the email and language sent by the early access form.

```bash
npm install
npm run deploy   # publish the Worker
npm run export   # print the list as JSON
```

- Allowed sites: `ALLOWED_ORIGINS` in `wrangler.jsonc`. Add the final domain there before launch.
- Limit: 5 requests per minute per IP. Cloudflare counts per location and lags a few seconds, so it stops floods, not every extra request.
