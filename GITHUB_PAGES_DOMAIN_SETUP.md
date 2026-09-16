# sarkshfoods.in + GitHub Pages + V8.3 Admin Setup

## GitHub Pages

Repository → Settings → Pages:

- Source: **GitHub Actions**
- Custom domain: **sarkshfoods.in**
- Enable **Enforce HTTPS** after GitHub provisions the certificate

The workflow is `.github/workflows/deploy-pages.yml`.

## Required GitHub Actions configuration

Repository → Settings → Secrets and variables → Actions.

### Backend endpoint

No GitHub secret is required for the Apps Script URL. The production `/exec` endpoint is already wired into `.github/workflows/deploy-pages.yml` because a deployed Apps Script Web App URL is a public frontend endpoint, not a credential.

### Variables

`GOOGLE_OAUTH_CLIENT_ID`

Use the Google Identity Services OAuth 2.0 Web Client ID for the Admin portal.

Optional:

`GOOGLE_SITE_VERIFICATION`

## OAuth JavaScript origins

In Google Cloud Console, the OAuth Web Client should authorize:

- `https://sarkshfoods.in`
- `https://www.sarkshfoods.in` if used
- `http://localhost:5173` for local admin testing

The same OAuth Client ID must be configured in Apps Script as Script Property `GOOGLE_CLIENT_ID`.

## DNS for apex domain

GitHub Pages apex A records:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Optional `www` CNAME:

`YOUR-GITHUB-USERNAME.github.io`

## Deployment behavior

A push to `main` triggers:

1. dependency installation
2. validation of domain, Apps Script URL and Google OAuth Client ID
3. TypeScript check
4. production build
5. SEO/static-route generation
6. admin noindex verification
7. production artifact verification
8. GitHub Pages deployment

The Admin portal is available at:

`https://sarkshfoods.in/admin/`

It is excluded from the sitemap and from search-engine indexing.
