# Gemma 15 - RSVP App

A responsive React application for Event Management using Supabase.

## Requirements

- Node.js 18+
- Supabase Project

## Setup Instructions

### 1. Environment Variables

Create a file named `.env.local` in the root directory.

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Auth Configuration

1. Go to your Supabase Dashboard > Authentication > URL Configuration.
2. Add `http://localhost:5173` to **Redirect URLs**.
3. Ensure Email provider is enabled.

### 4. Admin Setup (First Time Only)

1. Start the app: `npm run dev`.
2. Navigate to `http://localhost:5173`.
3. Enter invite code: `ADMIN-SETUP`.
   *Note: Ensure your `claim_invite_code` RPC handles this specific string, or manually insert this code into the `invites` table via Supabase SQL Editor if required.*
4. Enter your email.
5. Click the Magic Link in your email.
6. Complete your profile.

### 5. Run Local

```bash
npm run dev
```

- Open `http://localhost:5173`.
- Visit `/debug` to verify DB connection.

## Build

```bash
npm run build
```

This generates a static build in the `dist` folder.
