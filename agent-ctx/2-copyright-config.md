# Task 2: Make Copyright Configurable from Settings

## Status: COMPLETED

## Summary
Made the copyright text in the footer configurable from the Settings (Configuración) page for admins.

## Changes Made
1. **prisma/schema.prisma** - Added `AppSetting` model (id, key, value, timestamps)
2. **src/app/api/settings/route.ts** - Created GET (public) and PUT (admin-only) endpoints
3. **src/components/settings/settings-view.tsx** - Added "Aplicación" section for admins with organization name and copyright text fields
4. **src/components/app-shell.tsx** - Updated footer to dynamically fetch and display copyright text from /api/settings

## Key Technical Decisions
- PUT /api/settings manually verifies JWT (since middleware skips auth for /api/settings to allow public GET)
- Used Prisma upsert for settings updates
- Footer gracefully falls back to "Fábrica de Ideas" if API fails
- Admin-only UI section consistent with existing admin patterns

## Files Modified
- prisma/schema.prisma
- src/app/api/settings/route.ts (new)
- src/components/settings/settings-view.tsx
- src/components/app-shell.tsx
