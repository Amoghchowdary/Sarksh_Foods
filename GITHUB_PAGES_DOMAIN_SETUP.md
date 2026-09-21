# www.sarkshfoods.in + GitHub Pages — V8.5

Repository → **Settings → Pages**:

- Source: **GitHub Actions**
- Primary custom domain: `www.sarkshfoods.in`
- Enforce HTTPS after GitHub provisions the certificate

Workflow:

`.github/workflows/deploy-pages.yml`

V8.5 uses `https://www.sarkshfoods.in` as the one canonical production origin. This matches the current GitHub Pages custom-domain configuration and prevents split canonical/session behavior between apex and `www`.

No Google OAuth / Cloud Console variable is required.

Optional GitHub Actions variable:

`GOOGLE_SITE_VERIFICATION`

The production Apps Script `/exec` URL is already wired into the workflow.

## DNS

Keep these apex A records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Set:

`www CNAME AmoghChowdary.github.io`

Remove any old hosting A record such as `2.57.91.91`.

When GitHub Pages validates both hosts, requests to the apex should redirect to the configured `www` primary domain.

## Deployment gate

A push to `main` performs:

1. dependency installation;
2. exact primary-domain/backend validation;
3. TypeScript check;
4. V8.4 backend health check;
5. production build;
6. semantic/crawler/SEO artifact generation;
7. production artifact verification;
8. GitHub Pages deployment.

The frontend release is V8.5; the API remains V8.4 by design.
