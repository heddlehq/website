# Heddle landing page

Static Astro site.

```bash
npm install
npm run dev      # local server
npm run check    # type check
npm run build    # static output in dist/
```

- Copy: `src/i18n/en.ts` and `src/i18n/pt.ts`. Both feed `src/components/Landing.astro`, served at `/` and `/pt/`.
- External links and the waitlist address: `src/config.ts`. Change them there when the repo is renamed.
- Domain: the `SITE_URL` and `BASE_PATH` env vars set the public address. The Pages workflow in `.github/workflows/pages.yml` passes them.
- Logo: `public/logo.svg` is the vector version of `brand-src/logo-agy-2.png`, generated with `agy`.

## Showcase

`/showcase/` and `/pt/showcase/` are a gallery of real flows. A card opens its flow on Heddle's own canvas, read-only, and a click on a node shows how it is set up.

- `src/data/showcase/flows.json` holds the flows, in the format Heddle saves, and the definitions of the nodes they use. They are built in `scripts/export_showcase.exs`, which checks each one with the validator the server runs before saving a flow. Write it again from the Heddle repository, next to this one: `cd ../heddle && mix run --no-start ../web/scripts/export_showcase.exs`. A new flow goes in that script, with its title, summary, labels and notes in `showcase.flows` in `src/i18n/`.
- `src/showcase/editor/` is Heddle's canvas (`rete_editor.js`, the `custom-*.js` elements and `rete_custom.css`), copied as it is. Copy it again when the editor changes, or after a new flow uses other nodes, with `node scripts/sync_editor.mjs`. That also writes `icons.css` and `icons.json`, with the icons and service logos the flows use, for the canvas and for the drawings on the cards. Its packages are pinned to the versions the app uses.
- `src/showcase/viewer.ts` opens a flow in the dialog and keeps the canvas read-only. It loads only when a flow is opened.
