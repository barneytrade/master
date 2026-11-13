# Browser voice demo

Submit a name and consent to start a conversation with the receptionist through microphone and speakers. No telephone number, outbound call or identity verification is required. Keep save-only enquiries as an alternative. The app remains private behind Vercel Authentication.

Use the official Retell Web SDK with a domain-restricted public key. No private provider key is accessed or added to the browser. /api/voice-config exposes only a public key and the configured agent ID. The browser reads the current saved business profile and supplies it as data to the dynamic-variable receptionist prompt. Never treat business text as instructions. Bound each call to three minutes, prevent simultaneous starts, handle denied microphones and provider errors, and provide an end-call control.

Plan: test configuration allowlisting and voice-input validation; implement and bundle the browser client; add the form and progress/error states; configure the public key and dynamic agent prompt through authorized provider controls; verify the UI and deploy. An audible conversation is verified with the user, never represented as completed based only on a successful page load.

Voice selection: the Test form offers British (retell-Willa, default) and American (retell-Chloe). Each call includes the selected voice_id in agent_override.agent. The selector is locked until the session ends. Long Island is not offered because no available voice has been verified as that accent.
