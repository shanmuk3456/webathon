# Civic Collaboration Platform

A production-ready full-stack civic collaboration platform built with Next.js 14, PostgreSQL, and Prisma.

## Features

- Role-based authentication (User/Admin)
- Community isolation
- Issue lifecycle management
- GPS-based issue tracking
- Civic points system with weekly leaderboard
- Real-time dashboard
- PWA compatible

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT-based auth with role-based access control

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions and helpers
- `/src/types` - TypeScript type definitions
- `/prisma` - Prisma schema and migrations

## Database

The project uses Prisma ORM. To view/edit the database:

```bash
npx prisma studio
```

## PWA (Progressive Web App)

The app is installable as a PWA with offline support and push notifications.

### Installable app
- **manifest.json** at `/manifest.json` (name, icons, theme, display standalone, shortcuts).
- **Service worker** at `/sw.js`: caches shell and static assets; shows an offline page when navigation fails.
- **Icons**: Add `icon-192.png` and `icon-512.png` to `/public` for install prompts and splash screens.

### Offline
- Shell and key routes are cached. If a page isn’t cached, the **Offline** page at `/offline` is shown with a retry link.

### Push notifications
Push is sent for:
- **Verification requests** (when an issue is approved and you’re assigned to verify)
- **Status changes** (approved, rejected, in progress, resolved)
- **Approval/rejection** (your issue was approved or rejected)
- **Resolution verified** (your issue’s resolution was verified and closed)

**Setup:**
1. Generate VAPID keys: `node scripts/generate-vapid.js`
2. Add to `.env`:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (public key)
   - `VAPID_PRIVATE_KEY` (private key)
3. Run migrations so `PushSubscription` exists: `npx prisma db push`

After login, the app will prompt for notification permission and subscribe the device. Notifications open the relevant issue when clicked.

## Weekly Points Reset

The weekly leaderboard points reset automatically. To set up automatic reset:

1. Use a cron job service (like Vercel Cron, GitHub Actions, or a cloud scheduler)
2. Call `POST /api/cron/weekly-reset` every Monday at midnight
3. Optionally add authentication to the endpoint using `CRON_SECRET` environment variable

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Issues
- `GET /api/issues` - List all issues (community-scoped)
- `POST /api/issues` - Create new issue
- `GET /api/issues/[id]` - Get issue details
- `PATCH /api/issues/[id]` - Update issue (admin only)
- `POST /api/issues/[id]/approve` - Approve issue (admin only)
- `POST /api/issues/[id]/verify` - Verify issue (user only)
- `POST /api/issues/[id]/progress` - Mark in progress (admin only)
- `POST /api/issues/[id]/resolve` - Mark resolved (admin only)
- `POST /api/issues/[id]/close` - Close issue (admin only)
- `POST /api/issues/[id]/false-alarm` - Mark as false alarm (admin only)

### Leaderboard
- `GET /api/leaderboard` - Get top 3 contributors

### Users
- `GET /api/users/me` - Get current user info

## Issue Lifecycle

1. **PENDING_APPROVAL** - User submits issue
2. **APPROVED** - Admin approves (+10 points)
3. **VERIFIED_BY_NEIGHBOR** - Nearest neighbor verifies
4. **IN_PROGRESS** - Admin marks as in progress
5. **RESOLVED** - Admin marks as resolved
6. **CLOSED** - Admin closes after user verification

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Community isolation at database and API level
- Role-based access control
- Input validation with Zod
- SQL injection protection via Prisma ORM
