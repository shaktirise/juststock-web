# JustStock Signup (React + Tailwind)

Single-page React app with Tailwind CSS:
- Signup form posts to `https://backend-server-11f5.onrender.com/api/auth/signup`.
- On success, stores tokens in `localStorage` and shows a “Download App” button that redirects to `https://juststock.in/assets/app/app-release.apk`.
- Theme: white background with dark red accents.

## Quick Start

1. Install dependencies:
   - `cd juststock-signup`
   - `npm install`
2. Run dev server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
- `npm run preview`

## Deploy (Vercel)
- This repo is Vercel-ready. Vercel auto-detects Vite and builds to `dist`.
- Client-side routing is supported via `vercel.json` rewrite to `/`.
- Steps:
  - Push to a Git provider (GitHub/GitLab/Bitbucket).
  - Import the repo in Vercel and keep defaults:
    - Framework: Vite
    - Build Command: `npm run build`
    - Output Directory: `dist`
  - Or use CLI: `npm i -g vercel && vercel && vercel --prod`.

## Notes
- Success response expected (201) with `token`, `tokenExpiresAt`, `refreshToken`, `refreshTokenExpiresAt`, and `user`.
- Tokens are saved to `localStorage` as `token`, `refreshToken`, etc., so follow-up API calls can use `Authorization: Bearer <token>`.
- To change the download URL or API endpoint, edit `src/App.jsx` (`API_URL`, `DOWNLOAD_URL`).

## Referral Links
- Supported URL formats to auto-fill the referral code field:
  - `https://juststock.vercel.app/ABC123` (single segment at root)
  - `https://juststock.vercel.app/ref/ABC123`
  - `https://juststock.vercel.app/d/ABC123`
  - `https://juststock.vercel.app/invite/ABC123`
  - Query variants like `?ref=ABC123`, `?referral=ABC123`, `?referralCode=ABC123`, `?r=ABC123`
- The code is stored in `localStorage` as `referralCode` for subsequent visits.

## Fields
- name (required)
- email (required)
- mobile (required)
- password (required)
- confirmPassword (required)
- referralCode (optional)

## Styling
- Tailwind config defines `primary` color shades (dark red). Buttons and focus states use this color.
