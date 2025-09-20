# BGG Authorization Token Support

BGG now requires that API requests include an Authorization header containing a Bearer token. This project has been updated to optionally send this header on all BGG API requests made from the frontend.

Implementation details:

- The helper in `src/BggApi.ts` reads `process.env.REACT_APP_BGG_TOKEN`.
- If present, requests are sent with:

  Authorization: Bearer <your-token>

- If not present, requests proceed without the header (useful during BGG's transition period).

Local development setup:

1. Copy `.env.example` to `.env` in the project root.
2. Add your token to `.env`:

   REACT_APP_BGG_TOKEN=YOUR_TOKEN_HERE

3. Restart `npm start` after changing `.env` (CRA only reads env vars at startup).

Production considerations (important):

- Create React App inlines any `REACT_APP_*` env vars into the built JavaScript bundle, which means any token set this way becomes publicly visible to anyone who can access your site. If BGG associates tokens with a specific application and rate limits, exposing the token may be undesirable.
- Short-term: you may build with the token set for expediency, understanding the exposure risk.
- Recommended long-term: implement a lightweight server-side proxy that adds the Authorization header on behalf of the client (e.g., a Cloud Function/Run/AE service). The frontend would call your proxy, and the proxy would call BGG, injecting the token securely via server-side environment variables.

Deployment notes:

- For Google App Engine static hosting (this repo's current `app.yaml` serves a static CRA build), there is no runtime environment for env vars. Any token must be provided at build time (and thus would be exposed). Prefer the proxy approach for production.
- If you use a CI pipeline, add the token as a secret and inject it into the build environment as `REACT_APP_BGG_TOKEN` only if you accept exposure.

---

# Quick Start (Temporary - Option 3)

This is the fastest way to get back online before the deadline by sending the token directly from the client. Note: the token will be embedded in the built JS and publicly visible. Prefer the proxy approach below for long-term.

1. Create `.env` in the project root (or edit it if it exists):

   REACT_APP_BGG_TOKEN=YOUR_TOKEN_HERE
   REACT_APP_BGG_PROXY_URL=

   Ensure `REACT_APP_BGG_PROXY_URL` is empty/unset so the app calls BGG directly.

2. Run locally for verification:

   npm install
   npm start

3. Deploy to GitHub Pages (if you already use the provided scripts):

   npm run predeploy
   npm run deploy

   The `deploy` script uses `gh-pages` to publish the `build/` directory. Ensure `gh-pages` is installed in your environment if the script is not present as a dependency.

If you encounter CORS failures after adding Authorization headers, switch to the proxy approach below immediately.

