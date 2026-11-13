# TradeRelay PoC

The fuller TradeRelay application, recovered from ChatGPT Sites and deployed to the existing Vercel project. One demo business, persistent enquiry inbox, test capture, callback statuses, website extraction and receptionist setup handover.

## Run and test

Node.js 24 or later. Run `npm ci` to install the pinned Retell browser SDK and build tools. Run `npm test` for the test suite. Vercel serves `public/` and routes `/api/*` through `api/index.mjs` and `web-api.mjs`.

`npm run build` and `npm run dev` retain the historical Sites build and local Worker preview on port 4173. The local preview is for local use only; production requires Vercel Deployment Protection.

## Deployment and access

Repository: barneytrade/master. Vercel project: master. Production URL: https://master-gamma-three.vercel.app/

Keep Vercel Authentication enabled for every production and preview URL, including API routes. This single-business PoC relies on the platform access gate and must not be deployed as an unprotected public inbox. Do not attach a custom domain unless that domain is protected as well. Restrict project membership and deployment share links to intended collaborators. Application-level customer accounts and multi-tenant isolation are not implemented.

Set TRADERELAY_API_TOKEN as a sensitive server-only Vercel environment variable. Never place it in public files, a URL, Git, browser storage or NEXT_PUBLIC variables. Its SHA-256 hash is stored in tr_access under kind vercel. The original Sites key (app) and voice-ingestion key (webhook) stay separate. The backend accepts app and vercel credentials for app routes; only webhook credentials can ingest voice events. Supabase tables retain RLS with no anonymous grants.

The Supabase Edge Function traderelay continues to run the shared gateway.mjs and domain.mjs. Deploy edge.ts with those dependencies and the existing verify_jwt=false configuration; the handler validates its own hashed credentials. Changing its deployment must preserve the Sites and voice routes.

## Browser voice demo

`npm run build:vercel` runs the tests and bundles the browser voice client into `public/voice.js`. Set `RETELL_PUBLIC_KEY` and `RETELL_AGENT_ID` in Vercel; these are browser-visible values. Never use a private Retell API key. Restrict the public key to `master-gamma-three.vercel.app`. The dedicated agent prompt is in `prompts/traderelay-browser-demo.md`.

The Test tab starts a microphone conversation only after a name and explicit consent. It sends saved business facts to Retell, limits the session to three minutes and provides End call and audio recovery controls. It does not call a telephone or write voice transcripts to the enquiry inbox. Live microphone and speaker testing remains a manual check.

## Preserved work

- /prototype/ serves the September GitHub prototype and its Retell voice trial. The prompt remains in prompts/smith-plumbing-voice-agent.md.
- prototype/ contains the original September HTML.
- worker.mjs and build.mjs preserve the historical Sites deployment source.
- schema.sql and setup.sql record the existing schema; do not rerun them over the live database.
- docs/receptionist-setup.md records the original local Frontdesk setup worker. Its scheduler needs the connected computer and signed-in browser; deploying this site does not start that scheduler.

## Current limits

A historical Frontdesk browser call reached the inbox. A fresh live call, telephone forwarding, calendar booking, billing, SMS/email delivery and Retell-to-inbox ingestion still need implementation or verification. The Retell widget is a separate voice trial and does not feed this inbox automatically. PostHog is not connected.

public/marketing.html is a proposed launch plan; no campaign or spend is activated by this deployment.
