# TradeRelay Vercel migration

Move the recovered 5 September application into barneytrade/master and deploy it to the existing master Vercel project. Keep Supabase and the Sites deployment working. Preserve the later Retell prototype at /prototype/.

Use Vercel's existing whole-deployment sign-in protection for the private inbox. All API paths run through a Node.js function, with the backend token only in Vercel environment variables. Do not publish the inbox without platform protection. Add a separate hashed Vercel client credential to Supabase, retaining the Sites and webhook credentials.

Implementation and verification:
- Recover the complete source and preserve the GitHub prototype and voice prompt.
- Test the server adapter's allowed routes, same-origin writes, body limits, upstream errors and server-only authentication.
- Extend backend authentication to accept the separate Vercel credential while rejecting webhook credentials on app routes.
- Deploy the backend change, configure Vercel's server secret, and test the existing Sites deployment.
- Commit the source and adapter to GitHub, build and deploy to the existing Vercel project.
- Verify anonymous requests cannot read the inbox or API; verify signed-in reads and a clearly labelled synthetic enquiry. No real calls or receptionist changes.

Calendar integration and Retell-to-inbox wiring remain future work. Moving hosts does not complete them.
