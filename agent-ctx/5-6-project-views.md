# Task 5-6: Build Project List, Detail, and New/Edit Views

**Agent**: Main Agent
**Status**: Completed
**Date**: 2026-05-12

## Summary

Built all project-related views for the Fábrica de Ideas platform: projects list, project detail, and project creation/editing form.

## Files Created

1. **src/components/projects/status-badge.tsx** - Reusable status badge with color-coded states (DRAFT=gray, SUBMITTED=amber, APPROVED=emerald, REJECTED=red, FINALIST=violet, WINNER=gold+trophy)
2. **src/components/projects/projects-list.tsx** - Full listing page with grid/list views, search, filters (status/area/category), pagination, empty state, loading skeletons
3. **src/components/projects/project-detail.tsx** - Detailed view with info grid, evaluators section (ADMIN), evaluations with score bars, attachments with upload/delete, status change dropdown (ADMIN), delete dialog
4. **src/components/projects/project-form.tsx** - 4-step form with animated transitions: General Info → Leader Info → Location/Tutor → Files/Review. Supports create and edit modes.

## Files Modified

5. **src/components/app-shell.tsx** - Added imports and ViewRenderer routes for 'projects', 'project-detail', 'project-new'

## Key Notes for Next Agents

- All project views use `useNavStore().navigate()` for navigation (SPA, no Next.js routing)
- `useAuthStore().user.role` determines visibility of admin/owner features
- API calls use `apiFetch()` from `@/lib/api` with automatic auth headers
- File uploads use raw `fetch()` with FormData (not apiFetch, which sets JSON content-type)
- `StatusBadge` component exported from status-badge.tsx for reuse elsewhere
- The direction state for form animations is at top of component to avoid conditional hook violation
- Lint passes with zero errors
