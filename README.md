# Campus Control
<img width="420" height="340" alt="1" src="https://github.com/user-attachments/assets/bb02b3cd-a5d6-447c-a0da-56ee8f41b6c4" />

<img width="420" height="340" alt="2" src="https://github.com/user-attachments/assets/c0502265-1bb5-47f5-9eb4-f47d50f7b868" />

## Overview

This project is a modern educational institution management dashboard built with React, TypeScript, Vite, Tailwind CSS, Shadcn UI, and MySQL.

The application provides tools for managing students, staff, classes, attendance, activities, and other academic and administrative data.

## Tech Stack

* Vite
* TypeScript
* React 19
* React Router v7
* Tailwind CSS v4
* Shadcn UI
* Lucide Icons
* Framer Motion
* Three.js
* Express.js
* MySQL
* Convex
* phpMyAdmin
* Node.js

## Package Manager

Use npm as the package manager.

## Setup

The project can be run locally using a React/Vite frontend, Express API, MySQL database, and Convex for online backend functionality.

## Running Locally

The application uses a local MySQL database named `campus-control`, managed through phpMyAdmin.

The Express API connects the frontend to MySQL and handles authentication and application data.

Run the complete application with:

```bash
npm run dev:full
```

This starts:

* Express API on `http://localhost:4000`
* Vite development server on `http://localhost:5173`

### Alternative

Run the backend and frontend separately:

```bash
npm run server
```

```bash
npm run dev
```

## Environment Variables

Configure the local database and API through `.env`.

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=campus-control
API_PORT=4000
```

## Authentication

Authentication is handled through the Express backend and MySQL database.

User accounts are stored in the `users` table and sessions are stored in the `sessions` table.

Passwords are securely hashed using bcrypt.

The `/auth` page handles login and registration.

Protected routes use the `RequireAuth` component.

## Frontend Conventions

* Pages belong in `src/pages`.
* Components belong in `src/components`.
* Shadcn UI components belong in `src/components/ui`.
* Reuse existing components whenever possible.
* Keep all pages responsive.
* Use React Router for navigation.

## UI and Styling

The project uses Tailwind CSS v4, Shadcn UI, and OKLCH colors.

Support:

* Light mode
* Dark mode
* Mobile responsiveness
* Tablet layouts
* Desktop layouts

Avoid unnecessary borders, shadows, nested cards, and duplicated components.

## Animations

Framer Motion should be used for meaningful interface animations such as:

* Page transitions
* Component entrances
* Button interactions
* Interactive elements

Three.js can be used when 3D graphics provide meaningful visual value.

## Toasts and Dialogs

Use Sonner for toast notifications.

Use responsive dialogs for interactions that do not require a separate page.

Dialogs should remain accessible and scrollable on smaller screens.

## Database and API

The main local architecture is:

```text
React + Vite
      ↓
Express API
      ↓
MySQL
```

The MySQL database is named:

```text
campus-control
```

The API is located in:

```text
server/
```

The default API port is:

```text
4000
```

Frontend API requests should use the `/api` path.

## Convex

Convex is used for online backend functionality, including cloud data, real-time updates, and file storage when required.

The Convex backend is located in:

```text
convex/
```

The React frontend communicates with Convex through its client and backend functions.

## Convex Storage

Convex Storage can be used for online files such as:

* Images
* Documents
* Attachments
* User-uploaded files

Sensitive configuration and credentials must not be committed to the repository.

## Project Structure

```text
src/
├── components/
├── components/ui/
├── hooks/
├── lib/
├── pages/
├── main.tsx
└── index.css

server/
├── ...
└── ...

convex/
├── ...
└── ...

.env
package.json
vite.config.ts
```

## Development Guidelines

When adding new functionality:

1. Follow the existing project structure.
2. Reuse existing UI components.
3. Keep the interface responsive.
4. Follow the existing theme.
5. Use the existing authentication system.
6. Protect sensitive API endpoints.
7. Validate backend data.
8. Handle loading and error states.
9. Provide useful user feedback.
10. Test on mobile and desktop.

## Code Quality

Keep the codebase clean, maintainable, and consistent.

Avoid:

* Duplicate components.
* Unnecessary dependencies.
* Hardcoded sensitive information.
* Unprotected backend endpoints.
* Unnecessary UI complexity.
* Desktop-only layouts.

Prefer:

* Reusable components.
* Clear naming.
* Strong TypeScript types.
* Centralized configuration.
* Reusable API functions.
* Consistent error handling.
* Responsive layouts.
* Accessible UI components.

