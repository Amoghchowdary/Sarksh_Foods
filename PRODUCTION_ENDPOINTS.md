# SARKSH Foods Production Endpoints

## Website

- Canonical domain: `https://sarkshfoods.in`
- GitHub Pages deployment: GitHub Actions

## Backend

- Google Apps Script Web App:
  `https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

This URL is a public web-app endpoint and is intentionally compiled into the production frontend. It is not treated as a password or API secret. Admin operations remain protected by Google Identity token verification in Apps Script.

## Remaining production value

The admin portal still requires the Google OAuth Web Client ID:

- GitHub Actions variable: `GOOGLE_OAUTH_CLIENT_ID`
- Apps Script Script Property: `GOOGLE_CLIENT_ID`

Both values must be the same OAuth Web Client ID.

## Local backend health test

From PowerShell:

```powershell
Invoke-RestMethod -Uri "https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec" -Method Get
```

Expected response should include `ok = true`, service/version information, and backend configuration flags.

Or run the project preflight command:

```powershell
npm run backend:health
```

## Deployment-code check

This package is configured to call the URL above. Ensure that deployment is pointing to the included Apps Script backend (`apps-script/Code.gs`). If the Apps Script code was updated after the deployment was created, update the existing Web App deployment to the latest version so the `/exec` URL can stay unchanged.
