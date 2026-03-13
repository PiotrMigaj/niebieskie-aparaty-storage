# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run preview    # preview production build
npx nuxi typecheck # TypeScript type check (use --legacy-peer-deps for installs)
```

> `npm install` requires `--legacy-peer-deps` due to a vue-router v5 / @nuxt/ui peer conflict.

## Architecture

**Nuxt 4** app with **@nuxt/ui v4**, **nuxt-auth-utils** for sessions, and **AWS SDK v3** for S3 + DynamoDB.

### Auth model
- Admin session via `nuxt-auth-utils` (cookie-based). All routes protected by `app/middleware/auth.ts` except `/upload/*`.
- Upload pages use **token auth**: UUID tokens stored in DynamoDB (`UploadTokens` table) with `expiresAt` TTL. Token is passed as `?token=` query param and validated server-side on every upload API call.
- User type augmented in `auth.d.ts`: `{ name: string, role: string }`.

### S3 / DynamoDB clients
- `server/utils/s3.ts` — singleton `S3Client`, auto-imported in all server routes.
- `server/utils/dynamodb.ts` — singleton `DynamoDBDocumentClient`, same pattern.
- `server/utils/uploadToken.ts` — token CRUD (`createUploadToken`, `validateUploadToken`, `deleteUploadToken`, `listActiveTokens`).

### Server API routes
| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/auth/*` | — | login / logout |
| `/api/folders`, `/api/files`, `/api/download` | session | browse S3 |
| `/api/upload-tokens` (GET/POST/DELETE) | session | admin manages tokens |
| `/api/upload/*` (validate/initiate/presign-part/complete/abort) | token | browser-to-S3 multipart |

### Multipart upload flow
Browser → `POST /api/upload/initiate` → S3 CreateMultipartUpload → `uploadId` + `key`
Browser splits file into 50 MB chunks → per chunk: `POST /api/upload/presign-part` → presigned PUT URL
Browser PUTs chunk directly to S3 (XHR for progress events, ETag from response header)
Browser → `POST /api/upload/complete` with all `{partNumber, etag}` pairs → S3 CompleteMultipartUpload
S3 CORS must expose `ETag` header — see `SETUP.md`.

### Frontend structure
- `app/layouts/dashboard.vue` — sidebar layout used by admin pages.
- `app/layouts/default.vue` — bare layout used by the public upload page.
- `app/composables/useSelectedFolder.ts` — `useState` shared between `DashboardFolderNav` and `FileList`. **Starts `null` on SSR**, so any component that conditionally renders based on it must be wrapped in `<ClientOnly>` to avoid hydration mismatches.
- `app/composables/useMultipartUpload.ts` — manages upload queue (`items` ref), exposes `addFiles`, `removeFile`, `uploadAll`.
- `app/components/GenerateUploadLinkModal.vue` — admin modal to create a token and copy the upload URL.
- `app/pages/upload/[folder].vue` — public upload page; validates token on mount, then shows `UFileUpload` + custom file list with progress.

### SSR / hydration notes
`selectedFolder` is set via a `watch` on `useFetch` data — it's always `null` during SSR. Wrap anything that depends on it in `<ClientOnly>`. The folder list active-class highlight uses an `onMounted` flag for the same reason.
