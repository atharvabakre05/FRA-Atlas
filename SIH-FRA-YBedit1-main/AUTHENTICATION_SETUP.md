# Authentication System Setup Guide

This guide will help you set up the authentication system for the FRA Atlas application with Google OAuth and OTP-based authentication using Supabase.

## Prerequisites

1. Supabase account and project
2. Google Cloud Console account (for Google OAuth)
3. Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration (Optional - for Google Sign-in)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Application Configuration
VITE_APP_NAME=FRA Atlas
VITE_APP_VERSION=1.0.0
```

## Supabase Setup

### 1. Database Schema

The following SQL schema has already been created in your Supabase project:

```sql
-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Create claims table
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  village text not null,
  area numeric not null,
  coordinates text not null,
  document_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  applicant_name text,
  claim_type text,
  documents text[] default '{}',
  aadhaar text,
  ack_id text,
  rejection_reason text
);

-- Create claim_geojson table
create table if not exists public.claim_geojson (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  geojson jsonb not null,
  created_at timestamptz not null default now(),
  unique (claim_id)
);

-- Enable RLS and create policies
alter table public.claims enable row level security;
alter table public.claim_geojson enable row level security;

-- Create policies for public access
create policy "Public read claims" on public.claims for select using (true);
create policy "Public insert claims" on public.claims for insert with check (true);
create policy "public_update_claims" on public.claims for update using (true) with check (true);

create policy "Public read geo" on public.claim_geojson for select using (true);
create policy "Public upsert geo" on public.claim_geojson for insert with check (true);
create policy "Public update geo" on public.claim_geojson for update using (true) with check (true);

-- Create indexes
create index if not exists claims_ack_id_idx on public.claims(ack_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_claims_created_at on public.claims(created_at desc);
create index if not exists idx_claims_applicant on public.claims(applicant_name);
create index if not exists idx_claims_village on public.claims(village);
```

### 2. Authentication Configuration

#### Enable Google OAuth Provider

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Providers
3. Find Google in the list and enable it
4. You'll need:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console

#### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to APIs & Services → Credentials
5. Create OAuth 2.0 Client ID
6. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret to Supabase

#### Enable Email Authentication

1. Go to Authentication → Providers → Email
2. Toggle "Enable Email Signups"
3. Optionally enable:
   - Confirm email (users must verify before logging in)
   - Passwordless login (magic links)

#### Configure Redirect URLs

1. Go to Authentication → URL Configuration
2. Add your Site URL (e.g., `http://localhost:3000` for dev)
3. Add extra redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

#### Configure Email Templates

1. Go to Authentication → Templates
2. Customize templates for:
   - Confirm signup
   - Invite user
   - Magic link
   - Reset password

Example template:
```html
<h1>Welcome to FRA Atlas!</h1>
<p>Click below to confirm your email:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>
```

## Admin Access Control

The following email addresses have admin access:
- `yashsbharambe@gmail.com`
- `chinchalkarparas@gmail.com`
- `atharva.bakre05@gmail.com`

These are configured in `src/services/authService.ts` in the `ADMIN_EMAILS` array.

## Authentication Features

### 1. Google OAuth Sign-in
- One-click sign-in with Google account
- Automatic user profile creation
- Admin access for specified emails

### 2. Email/Password Authentication
- Traditional email and password sign-up/sign-in
- Password validation and security
- Fallback authentication for demo purposes

### 3. OTP-based Authentication
- Email OTP for passwordless login
- 6-digit verification code
- Secure token-based verification

### 4. Admin Access Control
- Role-based access control
- Admin dashboard for specified users
- Public portal for regular users

## Usage

### For Users
1. Visit the landing page
2. Click "Google Sign-in" or "Email & OTP" for modern authentication
3. Or use traditional "Public Claim Submission" for email/password

### For Admins
1. Use Google OAuth with admin email addresses
2. Or use employee login with admin credentials
3. Access admin dashboard and claim review features

## Security Features

- Row Level Security (RLS) enabled on all tables
- PKCE flow for OAuth
- Secure session management
- Admin email verification
- Token-based authentication
- Automatic session refresh

## Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Check redirect URIs in Google Cloud Console
   - Verify Client ID and Secret in Supabase
   - Ensure Google+ API is enabled

2. **OTP not sending**
   - Check email configuration in Supabase
   - Verify email templates
   - Check spam folder

3. **Admin access not working**
   - Verify email addresses in `authService.ts`
   - Check user metadata in Supabase
   - Ensure proper session handling

### Support

For technical support, contact the development team or check the Supabase documentation.

## Next Steps

1. Configure environment variables
2. Set up Google OAuth credentials
3. Test authentication flows
4. Customize email templates
5. Deploy to production with proper domain configuration
