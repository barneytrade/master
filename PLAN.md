# TradeRelay proof of concept

Preserve the original monochrome, rounded-card prototype design and keep the original HTML in prototype/. Deliver one fictional Smith Plumbing company with an editable configuration, test enquiry capture, persistent Supabase lead inbox, callback status changes and in-app new-enquiry notifications. Host privately on Sites with explicit cofounder access. Never describe synthetic enquiries as live calls or show fabricated commercial metrics.

Architecture: browser -> same-origin Worker API -> authenticated Supabase Edge Function -> Postgres. Sites controls viewer access; the browser never receives the backend credential. All database tables have RLS and no anonymous grants. A separate authenticated webhook accepts Frontdesk events. Provider credentials are independent of the website credential. Preserve raw events privately to verify the provider's actual schema; do not discard an unmapped call. Vercel migration requires equivalent access protection and server-only environment variables before deployment. Do not publish an unprotected inbox.

Implementation sequence:
1. Write tests for validation, source labels, permitted status transitions, and authentication failure. Verify red.
2. Add schema with one company, leads, event deduplication, private integration keys. Deploy authenticated gateway and webhook.
3. Extend existing design into working overview, inbox, test enquiry and business details. Loading, empty, error and success states; safe text rendering.
4. Verify the API rejects unauthorised requests, accepts synthetic enquiries, persists updates, rejects invalid input and handles webhook replay.
5. Build and privately publish; verify final URL and endpoint responses. Add cofounder access only when identified.
6. Verify Frontdesk configuration and configure webhook if account permits it. Report browser/telephony limits honestly.
7. Deliver constrained Google Ads plan with budget, geography, keywords, conversion definitions and stop rules. No campaigns launched.

## Website import and phone-trial handover — 5 September
- Read a public URL and up to two relevant linked pages server-side. Limit redirects, size and duration; reject local/IP/credential URLs and non-public DNS results.
- Extract structured business metadata and short text candidates. Show source links and excerpts; leave unknown facts blank; require explicit save.
- Generate a receptionist brief from saved facts only. Manual Frontdesk handover remains explicit until provider integration is verified.
- Verify extraction, security failures, existing capture tests, production build and private deployment. Browser voice testing needs the signed-in Frontdesk page and a human speaking into the microphone.
