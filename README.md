# TradeRelay PoC

The fuller TradeRelay application, recovered from ChatGPT Sites and deployed to the existing Vercel project. One demo business, persistent enquiry inbox, test capture, callback statuses, website extraction and receptionist setup handover.

## Run and test

Node.js 24 or later. No runtime dependencies. Run `npm test` for the test suite. Vercel serves `public/` and routes `/api/*` through `api/index.mjs` and `web-api.mjs`.

`npm run build` and `npm run dev` retain the historical Sites build and local Worker preview on port 4173. The local preview is for local use only; production requires Vercel Deployment Protection.

## Deployment and access

Repository: barneytrade/master. Vercel project: master. Production URL: https://master-gamma-three.vercel.app/

Keep Vercel Authentication enabled for every production and preview URL, including API routes. This single-business PoC relies on the platform access gate and must not be deployed as an unprotected public inbox. Do not attach a custom domain unless that domain is protected as well. Restrict project membership and deployment share links to intended collaborators. Application-level customer accounts and multi-tenant isolation are not implemented.

Set TRADERELAY_API_TOKEN as a sensitive server-only Vercel environment variable. Never place it in public files, a URL, Git, browser storage or NEXT_PUBLIC variables. Its SHA-256 hash is stored in tr_access under kind vercel. The original Sites key (app) and voice-ingestion key (webhook) stay separate. The backend accepts app and vercel credentials for app routes; only webhook credentials can ingest voice events. Supabase tables retain RLS with no anonymous grants.

The Supabase Edge Function traderelay continues to run the shared gateway.mjs and domain.mjs. Deploy edge.ts with those dependencies and the existing verify_jwt=false configuration; the handler validates its own hashed credentials. Changing its deployment must preserve the Sites and voice routes.

## Preserved work

- /prototype/ serves the September GitHub prototype and its Retell voice trial. The prompt remains in prompts/smith-plumbing-voice-agent.md.
- prototype/ contains the original September HTML.
- worker.mjs and build.mjs preserve the historical Sites deployment source.
- schema.sql and setup.sql record the existing schema; do not rerun them over the live database.
- docs/receptionist-setup.md records the original local Frontdesk setup worker. Its scheduler needs the connected computer and signed-in browser; deploying this site does not start that scheduler.

## Current limits

A historical Frontdesk browser call reached the inbox. A fresh live call, telephone forwarding, calendar booking, billing, SMS/email delivery and Retell-to-inbox ingestion still need implementation or verification. The Retell widget is a separate voice trial and does not feed this inbox automatically. PostHog is not connected.

public/marketing.html is a proposed launch plan; no campaign or spend is activated by this deployment.
