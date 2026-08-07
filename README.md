# UBIT Study Hub

A crowdsourced study resource platform built for UBIT (University of Karachi CS department) students — share notes, past papers, and course material in one place, track your CGPA, and keep the archive clean through community moderation.

**Live:** [ubit-study-hub.vercel.app](https://ubit-study-hub.vercel.app)

## Features

- **Crowdsourced resource library** — students upload and browse notes, past papers, and course material organized by subject.
- **Role-based access control** — separate permissions for students, contributors, and moderators/admins.
- **Direct-to-storage uploads** — files go straight to Backblaze B2 via presigned URLs, keeping the app server out of the upload path.
- **Moderation queue** — new submissions are reviewed before going live, keeping the archive accurate and spam-free.
- **Grade tracking & CGPA calculator** — students can log grades per course and track their cumulative GPA over time.
- **Library archive aesthetic** — a distinct, minimal visual identity built around the idea of a physical study archive.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Database | MongoDB + Mongoose |
| Auth | [Better Auth](https://www.better-auth.com/) |
| File Storage | Backblaze B2 (S3-compatible, via `@aws-sdk/client-s3` + presigned URLs) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide |

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or Atlas)
- A Backblaze B2 bucket with S3-compatible API keys

### Installation

```bash
git clone https://github.com/khizeryz14/UBIT-study-hub.git
cd UBIT-study-hub
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Backblaze B2 (S3-compatible)
B2_ENDPOINT=
B2_REGION=
B2_ACCESS_KEY_ID=
B2_SECRET_ACCESS_KEY=
B2_BUCKET_NAME=
```

> Adjust variable names to match what's used in `src/` if they differ — update this section once confirmed.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/          # App source (routes, components, models, lib)
scripts/      # Utility / maintenance scripts
```

## Contributing

This project is actively evolving as part of ongoing development for UBIT. Issues and pull requests are welcome.

## License

Not yet specified.