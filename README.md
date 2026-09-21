# Campus Control
<img width="420" height="340" alt="1" src="https://github.com/user-attachments/assets/bb02b3cd-a5d6-447c-a0da-56ee8f41b6c4" />

<img width="420" height="340" alt="2" src="https://github.com/user-attachments/assets/c0502265-1bb5-47f5-9eb4-f47d50f7b868" />

## Overview

This project is a modern educational institution management dashboard built with React, TypeScript, Vite, Tailwind CSS, Shadcn UI, and a local MySQL database.

The application provides tools for managing students, staff, classes, attendance, activities, and other academic and administrative data.

## Tech Stack

This project uses the following tech stack:

* Vite
* TypeScript
* React Router v7
* React 19
* Tailwind CSS v4
* Shadcn UI
* Lucide Icons
* Framer Motion
* Three.js
* Express.js
* MySQL
* phpMyAdmin
* Node.js

All relevant frontend files live in the `src` directory.

The backend API is located in the `server` directory.

## Package Manager

Use npm for the package manager.

## Setup

The project can be run locally using a React/Vite frontend and an Express API connected to MySQL.

## Running Locally with MySQL

The dashboard is backed by a local MySQL database named `campus-control`, managed through phpMyAdmin.

A small Express API server (`server/`) connects to the database, creates the required tables on startup, and seeds them with initial data from the project.

### 1. Start MySQL

Start MySQL using XAMPP, WAMP, or another local MySQL installation.

Make sure the `campus-control` database exists.

### 2. Configure Environment Variables

Check the `.env` file and configure the MySQL connection settings.

Default local settings:

* Host: `localhost`
* Port: `3306`
* User: `root`
* Password: empty

### 3. Start the Application

Run:

```bash
npm run dev:full
```

This starts:

* Express API server on `http://localhost:4000`
* Vite development server on `http://localhost:5173`

Vite proxies `/api` requests to the Express API server.

### Alternative: Run Frontend and Backend Separately

Open two terminals.

Terminal 1:

```bash
npm run server
```

The API will run on port `4000`.

Terminal 2:

```bash
npm run dev
```

The Vite frontend will run on port `5173`.

### Database Initialization

On the first start, the API creates the required database tables and seeds the initial data.

You can inspect and manage the database through phpMyAdmin under the `campus-control` database.

## Environment Variables

The local MySQL/API connection is configured through `.env`.

Available variables:

* `DB_HOST` — MySQL host
* `DB_PORT` — MySQL port
* `DB_USER` — MySQL username
* `DB_PASSWORD` — MySQL password
* `DB_NAME` — MySQL database name
* `API_PORT` — Express API port, default `4000`

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=campus-control
API_PORT=4000
```

# Authentication

Authentication is handled by the Express backend and MySQL database.

## Auth Database

The dashboard requires authentication.

User accounts are stored in the MySQL `users` table, while active sessions are stored in the `sessions` table.

Passwords are securely hashed using bcrypt.

Sessions use bearer tokens with a limited validity period.

### Default Admin Account

A default administrator account is seeded during the initial database setup:

```text
Email: admin@campus.edu
Password: admin123
```

Change the default password after the first login.

### Registration

New users can register through the `/auth` page.

### Protected API Routes

API routes require a valid authentication session except for public authentication and health endpoints.

Public endpoints include:

```text
/api/auth/**
/api/health
```

All other API routes require a valid session token.

## Using Auth on the Frontend

The `/auth` page handles login and registration.

The `useAuth` hook is the supported way to access authentication state.

Example:

```tsx
import { useAuth } from "@/hooks/use-auth";

const {
  isLoading,
  isAuthenticated,
  user,
  signIn,
  signUp,
  signOut
} = useAuth();
```

Protected routes use the `RequireAuth` component from:

```text
@/components/require-auth
```

Signed-out users are redirected to:

```text
/auth?returnTo=<current-route>
```

## Protected Routes

The `/dashboard` route is protected with `RequireAuth`.

When an unauthenticated user attempts to access a protected page, they are redirected to the authentication page.

When authentication succeeds, the user is redirected to the appropriate protected page.

When adding another protected page, reuse the `RequireAuth` component.

## Auth Page

The authentication page is located at:

```text
src/pages/Auth.tsx
```

Login and registration actions should be handled through the `/auth` route.

## Authorization

Authorization checks should be performed on both the frontend and backend.

Frontend components can use the authenticated user's information from the `useAuth` hook.

Backend API routes must also validate the user's authentication and authorization before allowing protected operations.

Never rely exclusively on frontend authorization checks.

## Adding a Redirect After Auth

The `/auth` route redirects authenticated users to the dashboard by default.

If the main authenticated route changes, update the redirect destination accordingly.

A validated `returnTo` query parameter can be used to return users to the protected page they originally requested.

Never redirect authenticated users back to an unrelated public landing page when they should enter the authenticated application.

## Complete Authenticated Products

When the application requires accounts, a workspace, or a dashboard, authentication should not be considered complete with only a login form.

The application should:

* Provide the complete authenticated experience.
* Protect authenticated routes.
* Validate authentication on the backend.
* Redirect authenticated users to the appropriate dashboard or workspace.
* Handle loading and unauthorized states properly.

# Frontend Conventions

The project uses Vite with React 19, Tailwind CSS v4, and Shadcn UI.

Generally:

* Pages should be located in `src/pages`.
* Components should be located in `src/components`.
* Shadcn UI primitives are located in `src/components/ui`.

Use the existing component system whenever possible instead of creating unnecessary duplicate components.

## Page Routing

Page components should be placed inside:

```text
src/pages
```

When adding a page, update the React Router configuration in:

```text
src/main.tsx
```

Add the appropriate route for the new page.

## Shadcn UI Conventions

Follow these conventions when using Shadcn UI components:

* Use `cursor-pointer` on clickable elements.
* Use `tracking-tight font-bold` for important title text.
* Always make the application mobile responsive.
* Avoid nested cards.
* Avoid unnecessary borders and containers.
* Avoid excessive shadows.
* Prefer clean borders and spacing.
* Avoid unnecessary skeleton loaders.
* Use a loading spinner such as `Loader2` when appropriate.

## Landing Pages

Create polished, designer-level interfaces.

Each landing page should have a clear visual direction or theme, such as:

* Glassmorphism
* Neumorphism
* Neo-brutalism
* Minimalist
* Futuristic
* Modern SaaS

Use appropriate animations, typography, spacing, imagery, and visual hierarchy.

If the user is already authenticated, the main call-to-action should lead to the Dashboard or Profile instead of showing an unnecessary Get Started action.

## Responsiveness and Formatting

Pages should be wrapped in a centered container to prevent excessive stretching on large screens.

Always ensure:

* Correct maximum and minimum widths.
* Mobile responsiveness.
* Tablet compatibility.
* Desktop compatibility.
* Proper spacing at different breakpoints.
* No horizontal overflow.

Protected dashboard pages should use a sidebar for navigation.

Landing pages should use a navbar.

The application logo should be clickable and redirect to the main/index page.

## Animations with Framer Motion

Framer Motion is installed and should be used for meaningful interface animations.

Import `motion` from:

```tsx
import { motion } from "framer-motion";
```

Use it to animate components where appropriate.

### Recommended Animations

Examples include:

* Fade in
* Fade out
* Slide in
* Slide out
* Page transitions
* Component entrance animations
* Button interactions
* Interactive UI elements

Animations should improve the user experience without becoming distracting.

## Three.js Graphics

Three.js is available for creating 3D graphics when appropriate.

It can be used for:

* Landing pages
* 3D visualizations
* Interactive elements
* Decorative graphics

Use Three.js only when it adds meaningful visual value.

# Colors

Colors can be configured in:

```text
src/index.css
```

The project uses the OKLCH color format with Tailwind CSS v4.

Use the existing color variables instead of introducing unnecessary hardcoded colors.

All UI components should support:

* Light mode
* Dark mode
* Mobile responsiveness

Theme changes should be applied consistently throughout the application.

## Styling and Theming

When changing the application theme:

* Update the Shadcn UI theme.
* Update the variables in `src/index.css`.
* Keep colors consistent across the application.
* Avoid unnecessary hardcoded colors.
* Ensure both light and dark themes remain usable.

Theme selection should be controlled through the appropriate `dark` or `light` class on the parent element.

Clickable elements should clearly communicate that they are interactive.

Always maintain a consistent visual theme throughout the application.

# Toasts

Use toast notifications to provide feedback for user actions.

Examples include:

* Successful operations
* Errors
* Confirmations
* Updates
* Form submissions

Use the Shadcn Sonner component.

Example:

```tsx
import { toast } from "sonner";

toast("Event has been created.");
```

For more detailed notifications:

```tsx
toast("Event has been created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
});
```

Always provide useful feedback when an operation succeeds or fails.

# Dialogs

Larger dialogs should have scrollable content so that information remains accessible on smaller screens.

Make sure dialog content is never cut off.

When an interaction does not require a completely new page, consider using a Dialog instead.

Dialogs should remain responsive on mobile, tablet, and desktop screens.

# Database and API

The application uses MySQL as its primary database.

The Express server provides the API layer between the React frontend and MySQL.

The general architecture is:

```text
React + Vite
      ↓
Express API
      ↓
MySQL
```

## Database

The database is named:

```text
campus-control
```

Database management can be performed through phpMyAdmin.

The Express server is responsible for:

* Connecting to MySQL.
* Creating required tables.
* Seeding initial data.
* Handling API requests.
* Authenticating users.
* Managing sessions.
* Reading and updating application data.

## API

The API server is located in:

```text
server/
```

The default API port is:

```text
4000
```

Frontend API requests should use the `/api` path.

Example:

```text
/api/auth/login
/api/auth/register
/api/health
```

Vite proxies API requests to the Express server during local development.

# Project Structure

The main project structure is:

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

Keep frontend pages, components, hooks, and utilities organized according to their purpose.

# Development Guidelines

When adding new functionality:

1. Follow the existing project structure.
2. Reuse existing UI components whenever possible.
3. Keep the interface responsive.
4. Follow the existing theme.
5. Use the existing authentication system.
6. Protect sensitive API endpoints.
7. Validate data on the backend.
8. Handle loading and error states.
9. Provide toast feedback for important actions.
10. Test the feature on mobile and desktop layouts.

# Code Quality

Keep the codebase clean, maintainable, and consistent.

Avoid:

* Duplicate components.
* Unnecessary dependencies.
* Hardcoded sensitive information.
* Unprotected backend endpoints.
* Excessive nested components.
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

