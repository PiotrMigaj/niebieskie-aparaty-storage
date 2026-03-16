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

### S3 folder conventions
- Folders are zero-byte objects with a trailing slash key (`PutObjectCommand` with `Key: 'name/'`, `Body: ''`).
- Folders are always at bucket root — never nested. `POST /api/folders` enforces this (strips leading/trailing slashes, rejects names containing `/`).

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
- `app/composables/useFolders.ts` — encapsulates folder state (`selectedFolder` via `useState`), folder listing (`useFetch` with `key: 'folders'`), `createFolder`, and `generateUploadToken`. Called from `dashboard.vue` layout; page reads shared state via `useState`.
- `app/composables/useFiles.ts` — encapsulates file listing and download for a given folder ref.
- `app/composables/useMultipartUpload.ts` — manages upload queue (`items` ref), exposes `addFiles`, `removeFile`, `uploadAll`.
- `app/components/GenerateUploadLinkModal.vue` — admin modal to create a token and copy the upload URL.
- `app/pages/upload/[folder].vue` — public upload page; validates token on mount, then shows `UFileUpload` + custom file list with progress.

### SSR / hydration notes
`selectedFolder` (via `useState`) is always `null` during SSR. Wrap anything that depends on it in `<ClientOnly>`. The folder list active-class highlight uses an `onMounted` flag for the same reason.
- When a composable is called from multiple components (e.g. layout + page), `useFetch` without an explicit `key` creates separate fetches per call site. Use `useFetch(url, { key: 'name' })` to deduplicate.
- `server: false` on `useFetch` causes hydration mismatches because SSR renders with `status='idle'` while client starts with `status='pending'`.
- Components use props-down/events-up pattern: `DashboardFolderNav` and `FileList` receive data via props, emit events. API calls happen in the layout (`dashboard.vue`) and page (`index.vue`), not in components.

### DashboardPanel slot gotcha
`UDashboardPanel` renders `#header`, `#body`, and `#footer` as **fallback content** of the default slot. If you pass any content outside a named slot template (e.g. a bare `<ClientOnly>` block), it becomes the default slot and **replaces all named slots**, making the navbar invisible. Always use `<template #body>` for panel content when also using `<template #header>`.

### Mobile / responsive notes
- `UDashboardSidebar` hides on mobile (`< lg`) and shows as a slideover. Set `mode="slideover"` and `:toggle="true"` explicitly on the sidebar.
- `UDashboardNavbar` renders a hamburger toggle on mobile by default (`:toggle="true"`). Use built-in `title`/`icon` props instead of a custom `#left` slot to avoid displacing the toggle button.
- CSS theme tokens: use hex values (`#000`, `#fff`) instead of CSS keywords (`black`, `white`) for `--ui-primary` etc. — keywords break Tailwind v4 opacity modifiers (`bg-primary/75`).
- Explicitly set `--ui-text-inverted` and `--ui-bg-inverted` in `main.css` to ensure button text contrast on solid primary/neutral buttons.
