# V-Link

A full-featured link shortener website with bio links, analytics, and modern UI.

## Features

- **URL Shortening**: Shorten URLs with custom aliases, expiration dates, password protection, and QR code generation.
- **Bio Links**: Customizable pages like Linktree with multiple links, social icons, embedded media, themes, and drag-and-drop editor.
- **Analytics**: Track clicks with location (IP), device/browser, timestamp.
- **Authentication**: Login via Gmail OAuth (Firebase), email/password signup, password reset, email verification.
- **Dashboard**: Manage links, bio pages, analytics, and profile.
- **UI**: Professional, responsive design with Tailwind CSS, dark/light mode toggle.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB (Atlas)
- **Auth**: Firebase Auth
- **Storage**: Cloudinary (images)
- **Deployment**: Vercel (frontend), Render (backend)

## Setup

1. Clone the repo: `git clone https://github.com/yourusername/V-Link.git`
2. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
3. Set up environment variables (see .env.example)
4. Run locally:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

## Deployment

- **Frontend**: Connect to Vercel, build command: `npm run build`, output: `out/`
- **Backend**: Connect to Render, build: `npm install`, start: `npm start`, port: 10000
- **Database**: MongoDB Atlas free tier
- **Services**: Firebase (Auth), Cloudinary (images)

## License

MIT
