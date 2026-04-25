# TKP Sheet Hub

A premium internal web app for searching, editing, and managing entries in your
Google Sheet — built with **Next.js 15 (App Router)**, **TypeScript**,
**Tailwind CSS**, **shadcn/ui**, and **lucide-react**.

Google Sheets is the database. The app reads and writes through the official
Google Sheets API on the server only — credentials are never sent to the
browser. Deployable to Vercel out of the box.

---

## Features

- 🔍 Search-first workflow across name, title, categories, description, notes
- 🗂 Tabs for **Sheets**, **Resources**, and **All** (grouped)
- 🏷 Tag/chip-based categories with autocomplete from existing data
- ⚡️ Filters per tab (status, favorite, source, type, web app, multi-select category)
- ✏️ Right-side drawer panels for Add and Edit (no separate edit pages)
- 📦 Soft archive — items move between active and archived tabs, never deleted
- 🌓 Dark mode
- 🎨 Card-based polished UI with motion, soft shadows, and great spacing

---

## Folder Structure

```
sheets-control-center/
├── app/
│   ├── api/
│   │   ├── categories/route.ts                # GET → all distinct categories
│   │   ├── sheets/
│   │   │   ├── route.ts                       # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts                   # PATCH (update)
│   │   │       ├── archive/route.ts           # POST → move to archived_sheets
│   │   │       └── restore/route.ts           # POST → move back to sheets
│   │   └── resources/
│   │       ├── route.ts                       # GET (list), POST (create)
│   │       └── [id]/
│   │           ├── route.ts                   # PATCH (update)
│   │           ├── archive/route.ts
│   │           └── restore/route.ts
│   ├── archived/page.tsx                      # Archived browsing
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                               # Homepage
│   └── providers.tsx                          # Theme + SWR + Toaster
├── components/
│   ├── ui/                                    # shadcn/ui primitives
│   ├── category-input.tsx                     # Tag/chip input with autocomplete
│   ├── category-multiselect.tsx               # Multi-select filter popover
│   ├── control-center.tsx                     # Main interactive view
│   ├── empty-state.tsx
│   ├── header.tsx
│   ├── resource-card.tsx
│   ├── resource-drawer.tsx
│   ├── sheet-card.tsx
│   ├── sheet-drawer.tsx
│   └── theme-provider.tsx
├── hooks/
│   └── use-data.ts                            # SWR hooks for sheets/resources/categories
├── lib/
│   ├── google-sheets.ts                       # Server-only Google Sheets service
│   ├── normalize.ts                           # Categories + boolean normalization
│   ├── schemas.ts                             # Zod input validation
│   ├── types.ts                               # Domain types
│   └── utils.ts
├── .env.example
├── components.json                            # shadcn config
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Spreadsheet Contract

The app expects a single Google Spreadsheet with **four tabs** named exactly:

| Tab name              | Purpose                              |
| --------------------- | ------------------------------------ |
| `sheets`              | Active sheet entries                 |
| `resources`           | Active resource / link entries       |
| `archived_sheets`     | Archived sheet entries (hidden)      |
| `archived_resources`  | Archived resource entries (hidden)   |

Tab names can be overridden via env (`SHEETS_TAB_NAME`, etc).

### Columns for `sheets` and `archived_sheets` (row 1 = headers)

| Col | Header        | Notes                                           |
| --- | ------------- | ----------------------------------------------- |
| A   | `id`          | unique, stable, auto-generated if missing       |
| B   | `name`        |                                                 |
| C   | `sheet_url`   | raw URL                                         |
| D   | `categories`  | comma-separated text, normalized on save        |
| E   | `web_app_url` | optional                                        |
| F   | `description` | free text                                       |
| G   | `status`      | `active` \| `draft` \| `archived`               |
| H   | `favorite`    | `TRUE` / `FALSE` (also accepts yes/1/x)         |
| I   | `notes`       | free text                                       |

### Columns for `resources` and `archived_resources`

| Col | Header             | Notes                                                                              |
| --- | ------------------ | ---------------------------------------------------------------------------------- |
| A   | `id`               | unique, stable                                                                     |
| B   | `title`            |                                                                                    |
| C   | `url`              | raw URL                                                                            |
| D   | `categories`       | comma-separated                                                                    |
| E   | `resource_type`    | one of: `doc, sheet, dashboard, tool, guide, template, form, folder, website, article, reference` |
| F   | `source`           | `internal` \| `external`                                                           |
| G   | `related_sheet_id` | optional                                                                           |
| H   | `description`      |                                                                                    |
| I   | `favorite`         | `TRUE` / `FALSE`                                                                   |
| J   | `status`           | `active` \| `archived`                                                             |
| K   | `notes`            |                                                                                    |

> Header row is required. Blank rows below the data are ignored automatically.

---

## Setup

### 1. Create a Google Cloud project + Service Account

1. Go to <https://console.cloud.google.com/> → create or select a project.
2. Enable the **Google Sheets API** for the project
   (`APIs & Services → Library → Google Sheets API → Enable`).
3. `IAM & Admin → Service Accounts → Create Service Account`.
4. Open the service account → **Keys → Add Key → Create new key → JSON**. Save the file.
5. Open your spreadsheet → **Share** → add the service account email
   (e.g. `your-svc@your-project.iam.gserviceaccount.com`) with **Editor** access.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```dotenv
GOOGLE_SHEETS_SPREADSHEET_ID=1AbCDeFGhIJKlmnoPQRsTuvWXyz
GOOGLE_CLIENT_EMAIL=your-svc@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> The private key is multi-line. Wrap it in **double quotes** and keep the
> literal `\n` sequences — the server replaces them with real newlines at
> runtime.

### 3. Install + run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. <https://vercel.com/new> → import the repo.
3. In **Project Settings → Environment Variables**, add:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (paste with `\n` newline escapes — Vercel preserves them)
   - (optional) the four `*_TAB_NAME` overrides
4. Deploy. The default build command (`next build`) and output settings work as-is.

> The Google Sheets service runs only inside server route handlers
> (`app/api/**`), so the credentials are never bundled to the client.

---

## Architecture

- **Server-only Sheets layer** — `lib/google-sheets.ts` is marked `import "server-only"`.
  All read/append/update/delete logic lives there. It maps rows to typed objects
  (ignoring blank rows), normalizes categories on save, and uses
  `spreadsheets.values.append`, `values.update`, and `batchUpdate(deleteDimension)`
  for moves between tabs.
- **Route handlers** — Thin REST endpoints under `app/api/**` validate input
  with Zod (`lib/schemas.ts`) and delegate to the service layer.
- **Client data layer** — `hooks/use-data.ts` provides SWR hooks. The main
  `ControlCenter` component handles search, filters, drawers, and mutation flows
  with optimistic refetching after writes.
- **Archive contract** — Archive = move row from `sheets` → `archived_sheets`
  (or `resources` → `archived_resources`), preserving the `id` and setting
  `status = archived`. Restore moves it back and sets `status = active`. No
  rows are ever hard-deleted.
- **Categories** — Always normalized: trimmed, lowercased, deduplicated,
  sorted. Stored in the sheet as a comma-separated string. Suggestions are
  drawn from the union of all categories across all four tabs.

---

## Environment Variables

| Variable                        | Required | Purpose                                                |
| ------------------------------- | -------- | ------------------------------------------------------ |
| `GOOGLE_SHEETS_SPREADSHEET_ID`  | yes      | The spreadsheet ID from the URL                        |
| `GOOGLE_CLIENT_EMAIL`           | yes      | Service account email                                  |
| `GOOGLE_PRIVATE_KEY`            | yes      | Service account private key (with `\n` escapes)        |
| `SHEETS_TAB_NAME`               | no       | Override — defaults to `sheets`                        |
| `RESOURCES_TAB_NAME`            | no       | Override — defaults to `resources`                     |
| `ARCHIVED_SHEETS_TAB_NAME`      | no       | Override — defaults to `archived_sheets`               |
| `ARCHIVED_RESOURCES_TAB_NAME`   | no       | Override — defaults to `archived_resources`            |
| `NEXT_PUBLIC_ORIGINAL_SHEET_URL`| no       | Master sheet URL shown in the header / hero            |
| `NEXT_PUBLIC_LOGO_URL`          | no       | Brand logo URL shown in the header                     |

---

## Assumptions

- The spreadsheet **already exists** with the exact tab structure above. The app
  does not bootstrap missing tabs; it will throw a clear error on startup if a
  required tab is missing.
- The first row of each tab is the **header row** and exists. Data starts at row 2.
- `id` values are treated as opaque strings; the app generates them when adding
  new items if not provided.
- Concurrent edits from multiple users are not coordinated — last-writer-wins.
  For a small internal team this is acceptable; see future enhancements.
- The app is intended for internal/authenticated use. There is no built-in
  authentication; protect the deployment behind your IdP (Vercel password,
  Cloudflare Access, etc.) or add an auth layer.

---

## Recommended Future Enhancements

These are intentionally **not** part of the core product but are good next
steps after the initial deployment:

1. **Auth** — Add NextAuth (Google Workspace / Okta) for user identity.
2. **Audit log** — Append a row to a hidden `audit_log` tab on every mutation
   (who, what, when, before, after).
3. **Optimistic UI** — Apply mutations to local SWR cache before the server
   round-trip for snappier feel.
4. **Bulk archive / restore** — Multi-select on cards.
5. **Keyboard shortcuts** — `/` to focus search, `n` to add, `e` to edit
   focused card.
6. **Per-user favorites** — Today favorites are global; with auth they could
   be per-user via a `favorites` tab keyed by `userId,itemId`.
7. **Webhook-driven cache** — Use the Sheets push notifications API to
   invalidate server cache instead of `force-dynamic`.
8. **CSV / JSON export** — One-click export of filtered results.
9. **Linked-resources panel** — On a sheet card, show resources whose
   `related_sheet_id` matches.
10. **Soft locking** — Detect when a row was modified externally between
    fetch and update, and prompt for merge.

---

## Scripts

```bash
npm run dev         # local dev
npm run build       # production build
npm run start       # run production build locally
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```
