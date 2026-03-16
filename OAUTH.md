# Google OAuth Setup

## Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create or select a project.
2. **APIs & Services → Library** → search "Google Identity" → enable **Google Identity**.
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Application type: **Web application**.
5. Authorized redirect URIs:
   - Dev: `http://localhost:3400/auth/google`
   - Prod: `https://<your-domain>/auth/google`
6. Copy **Client ID** → set as `NUXT_OAUTH_GOOGLE_CLIENT_ID` in `.env`.
7. Copy **Client Secret** → set as `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` in `.env`.
8. **OAuth consent screen** → add test users if app status is "Testing".

## Environment variables

```
NUXT_OAUTH_GOOGLE_CLIENT_ID=<your-client-id>
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=<your-client-secret>
ALLOWABLE_EMAILS=user@gmail.com,other@gmail.com
```

Only emails listed in `ALLOWABLE_EMAILS` (comma-separated) are allowed to sign in via Google.
