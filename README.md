# Campus Control

<img width="420" height="340" alt="1" src="https://github.com/user-attachments/assets/bb02b3cd-a5d6-447c-a0da-56ee8f41b6c4" />

<img width="420" height="340" alt="2" src="https://github.com/user-attachments/assets/c0502265-1bb5-47f5-9eb4-f47d50f7b868" />

## Overview

Campus Control is a modern educational institution management dashboard built with React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Express.js, and MySQL.

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
* Node.js

## Package Manager

Use **npm** as the package manager.

## Setup

The project uses a React/Vite frontend, an Express API, and a MySQL database.

Install the dependencies:

```bash
npm install
```

Configure the database connection in `.env`, then start the application:

```bash
npm run dev:full
```

### Alternative

Run the backend and frontend separately:

```bash
npm run server
```

```bash
npm run dev
```

## Environment Variables

Configure the database and API through `.env`.

```env
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=campus-control
API_PORT=4000
```

The application expects a MySQL database named:

```text
campus-control
```

The backend handles the database connection and application data through the Express API.

## Authentication

Authentication is handled through the Express backend and MySQL database.

User accounts are stored in the `users` table, while active sessions are stored in the `sessions` table.

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

The project uses Tailwind CSS v4 and Shadcn UI.

The interface supports:

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

The application follows this architecture:

```text
React + Vite
      ↓
Express API
      ↓
MySQL
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
