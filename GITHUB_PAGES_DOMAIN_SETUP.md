# sarkshfoods.in + GitHub Pages — V8.4

Repository → Settings → Pages:

- Source: GitHub Actions
- Custom domain: `sarkshfoods.in`
- Enforce HTTPS after certificate provisioning

Workflow:

`.github/workflows/deploy-pages.yml`

No Google OAuth / Cloud Console variable is required in V8.4.

Optional GitHub Actions variable:

`GOOGLE_SITE_VERIFICATION`

The production Apps Script `/exec` URL is already wired into the workflow.

## DNS

Apex A records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Optional `www` CNAME:

`YOUR-GITHUB-USERNAME.github.io`

## Deployment gate

A push to `main` performs:

1. dependency installation
2. domain/backend validation
3. TypeScript check
4. V8.4 backend health check
5. production build
6. SEO/private-route generation
7. production artifact verification
8. GitHub Pages deployment

The workflow will not publish if the live backend is still on the older Apps Script code.
