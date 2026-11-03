# Heddle landing page

Static Astro site.

```bash
npm install
npm run dev      # local server
npm run check    # type check
npm run build    # static output in dist/
```

- External links and install commands: `src/config.ts`. Change them there when the repo is renamed.
- Domain: the `SITE_URL` and `BASE_PATH` env vars set the public address. The Pages workflow in `.github/workflows/pages.yml` passes them.
- Logo: `public/logo.svg` is the vector version of `brand-src/logo-agy-2.png`, generated with `agy`.
