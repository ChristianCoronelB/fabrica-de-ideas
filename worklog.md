# Worklog - Fábrica de Ideas

## Task 2: Build Authentication System & Seed Data
**Completed:** 2026-05-11

### What was done:

#### 1. Installed jose package
- `bun add jose` - JWT library compatible with Edge Runtime

#### 2. Created Auth Library (src/lib/auth.ts)
- JWT-based authentication using jose (Edge Runtime compatible)
- `signToken()` - Generates JWT tokens with 7-day expiration
- `verifyToken()` - Verifies and decodes JWT tokens
- `extractTokenFromHeader()` - Extracts Bearer tokens from Authorization header
- JWT secret from `process.env.JWT_SECRET` with dev fallback

#### 3. Created Password Library (src/lib/auth-password.ts)
- Separate file to avoid Edge Runtime incompatibility with Node.js `crypto`
- `hashPassword()` - SHA-256 hashing with salt
- `comparePassword()` - Compares plain vs hashed passwords

#### 4. Created Auth Middleware (src/middleware.ts)
- Protects all `/api/*` routes except `/api/auth/*`
- Extracts and verifies JWT from Authorization header
- Adds user info to request headers (`x-user-id`, `x-user-email`, `x-user-role`)

#### 5. Created Auth API Routes
- **POST /api/auth/register** - User registration with Zod validation, email uniqueness check, password hashing
- **POST /api/auth/login** - Login with email/password validation, account active check
- **GET /api/auth/me** - Get current user with projects, assigned projects, and counts

#### 6. Created Notification API Routes
- **GET /api/notifications** - Get user notifications with pagination, unread filter, unread count
- **POST /api/notifications** - Create notification (admin only) with Zod validation
- **PUT /api/notifications/[id]/read** - Mark notification as read with ownership verification

#### 7. Created Seed Script (prisma/seed.ts)
Seeded data:
- **7 Areas**: Agrotecnología, Bioeconomía, Economía circular, Salud, Innovación Digital, Turismo sostenible, Innovación Abierta
- **4 Categories**: Emprendimiento Escolar, Poster de Emprendimiento, PMV, Emprendimiento en Ejecución
- **3 Institutions**: Universidad Central, Instituto Tecnológico Nacional, Universidad de Innovación
- **6 Evaluation Criteria** with weights totaling 100 pts
- **6 Users** (1 admin, 3 participants, 2 evaluators) with hashed passwords
- **8 Projects** across various statuses (DRAFT, SUBMITTED, APPROVED, FINALIST, WINNER, REJECTED)
- **7 Evaluations** (6 completed, 1 draft) with full EvaluationScores
- **10 Notifications** spread across users
- **10 Audit Log entries**

#### 8. Updated package.json
- Added `"db:seed": "bun prisma/seed.ts"` script

### Key Decisions:
- Split auth into two files (`auth.ts` and `auth-password.ts`) because Next.js middleware runs in Edge Runtime which doesn't support Node.js `crypto` module
- Used SHA-256 with salt for password hashing instead of bcrypt (as specified for MVP)
- All API routes use Zod for request validation
- Middleware passes user info via custom headers for downstream handlers

## Task 3: Build Frontend Core - Auth Store, Navigation Store, Layout, Login Page, Theme
**Completed:** 2026-05-12

### What was done:

#### 1. Created API Client (src/lib/api.ts)
- `getToken()`, `setToken()`, `removeToken()` - localStorage token management
- `apiFetch<T>()` - Generic authenticated API request helper
- Automatically adds `Authorization: Bearer` header from localStorage
- Handles 401 by clearing token and reloading (redirect to login)
- Returns parsed JSON with proper error handling

#### 2. Created Auth Store (src/store/auth-store.ts)
- Zustand store with full auth state management
- `User` interface matching Prisma schema (id, email, name, role, phone, avatar, active, etc.)
- `RegisterData` interface for registration form
- `login(email, password)` - Calls POST /api/auth/login, stores token and user
- `register(data)` - Calls POST /api/auth/register, stores token and user
- `logout()` - Clears localStorage and store state
- `checkAuth()` - Calls GET /api/auth/me to restore session on page load
- `isLoading` state for loading indicators

#### 3. Created Navigation Store (src/store/nav-store.ts)
- Zustand store for SPA client-side navigation (no Next.js routing)
- `View` type union: dashboard, projects, project-new, project-detail, evaluations, evaluation-detail, evaluators, reports, users, settings, notifications
- `navigate(view, params?)` - Changes current view with optional params, pushes to history
- `goBack()` - Navigates to previous view from history stack
- Full history tracking for breadcrumb navigation

#### 4. Created Theme Provider (src/components/theme-provider.tsx)
- Wraps `next-themes` ThemeProvider for dark mode support
- Configured with `attribute="class"`, `defaultTheme="system"`, `enableSystem`

#### 5. Created Login Page (src/components/auth/login-page.tsx)
- Beautiful split-screen layout:
  - Left panel: decorative gradient (emerald/teal/cyan), animated circles, grid pattern, logo, tagline "Fábrica de Ideas - Donde las ideas se transforman en realidad"
  - Right panel: login/register form with toggle
- Login form: email + password with show/hide toggle
- Register form: name, email, password + confirm, role selector (PARTICIPANT/EVALUATOR), phone
- Framer Motion animations (slide-in, fade, AnimatePresence between login/register)
- Quick demo login buttons (Admin, Participante, Evaluador) that pre-fill credentials
- Error handling with sonner toasts
- Loading states with spinner

#### 6. Created App Shell (src/components/app-shell.tsx)
- Full authenticated app layout using shadcn/ui Sidebar component:
  - **Sidebar** (collapsible with icon mode):
    - Logo "Fábrica de Ideas" with lightbulb icon and gradient
    - Navigation items based on role:
      - ADMIN: Dashboard, Proyectos, Evaluadores, Evaluaciones, Reportes, Usuarios, Configuración, Nuevo Proyecto
      - EVALUATOR: Dashboard, Proyectos Asignados, Mis Evaluaciones
      - PARTICIPANT: Dashboard, Mi Proyecto, Evaluaciones
    - Dark mode toggle (Sun/Moon icons)
    - User avatar with initials + dropdown menu (Settings, Logout)
  - **Top bar**: SidebarTrigger, Breadcrumb navigation, Notifications bell with badge
  - **Main content area**: ViewRenderer that displays current view based on nav-store
  - Dashboard placeholder with welcome message and stat cards
  - Placeholder views for other sections with "coming soon" message

#### 7. Updated globals.css
- Teal/emerald primary color scheme (NOT blue/indigo):
  - Light mode primary: `oklch(0.45 0.14 165)` (deep emerald)
  - Dark mode primary: `oklch(0.65 0.16 165)` (bright teal)
  - All color variables updated with emerald/teal hue (155-165 range)
- Custom scrollbar styling (thin, rounded, semi-transparent)
- Smooth scroll behavior
- Subtle transitions on color, background, border, shadow properties

#### 8. Updated Layout (src/app/layout.tsx)
- Added ThemeProvider wrapper with dark mode support
- Updated metadata: title "Fábrica de Ideas", Spanish description, es lang
- Replaced Toaster with Sonner (rich colors, top-right position)
- Kept Geist fonts

#### 9. Updated Main Page (src/app/page.tsx)
- Auth-gated SPA: checks `isLoading` and `isAuthenticated` from auth store
- Loading state: centered spinner with emerald gradient logo
- Not authenticated: shows LoginPage
- Authenticated: shows AppShell
- `checkAuth()` called on mount via useEffect

### Key Decisions:
- Entire app is a SPA with client-side navigation via Zustand (no Next.js routing)
- Token stored in localStorage for persistence across page reloads
- Used shadcn/ui Sidebar component with `collapsible="icon"` for compact mode
- Teal/emerald color palette throughout (hue 155-165 in oklch) - no blue/indigo
- Quick demo login buttons for easy testing during development
- Framer Motion for smooth page transitions and micro-interactions
- Sonner for toast notifications (instead of default shadcn/ui toast)

## Task 3-api: Build All API Routes
**Completed:** 2026-05-12

### What was done:

#### 0. Created API Auth Helper (src/lib/api-auth.ts)
- `getAuthContext(request)` - Extracts userId, userEmail, userRole from x-* headers set by middleware
- `requireAuth(request)` - Alias for getAuthContext, returns null if unauthenticated
- `isAdmin()`, `isEvaluator()`, `isParticipant()` - Role check helpers

#### 1. Projects API (/src/app/api/projects/)
- **GET /api/projects** - List projects with filtering (status, areaId, categoryId, search), pagination (page, limit), sorting (createdAt, name, totalScore, averageScore). Role-based: ADMIN sees all, PARTICIPANT sees own, EVALUATOR sees assigned.
- **POST /api/projects** - Create project (PARTICIPANT/ADMIN). Validates required fields and reference integrity. Defaults to DRAFT status. Creates audit log.
- **GET /api/projects/[id]** - Get single project with full includes (area, category, institution, owner, evaluators, evaluations with scores+criteria, attachments). Access control: admin, owner, or assigned evaluator.
- **PUT /api/projects/[id]** - Update project. Owner (PARTICIPANT) or ADMIN only. Non-admin can only edit DRAFT projects. Partial updates supported. Creates audit log.
- **PATCH /api/projects/[id]/status** - Update project status (ADMIN only). Validates against allowed statuses. Creates audit log + notification for owner with appropriate message/type per status.
- **DELETE /api/projects/[id]** - Soft delete (ADMIN only). Sets deletedAt timestamp. Creates audit log.

#### 2. Evaluators Assignment API (/src/app/api/projects/[id]/evaluators/)
- **POST /api/projects/[id]/evaluators** - Assign evaluators (ADMIN only). Validates evaluator role, prevents duplicate assignments. Creates notifications for new evaluators.
- **DELETE /api/projects/[id]/evaluators/[evaluatorId]** - Remove evaluator (ADMIN only). Creates audit log.
- **POST /api/projects/auto-assign** - Auto-assign evaluators (ADMIN only). Evenly distributes projects among evaluators based on current load. Supports projectIds filter and evaluatorsPerProject config (default 3). Creates notifications + audit log.

#### 3. Evaluations API (/src/app/api/evaluations/)
- **GET /api/evaluations** - List evaluations with filtering (projectId, evaluatorId, isDraft). ADMIN sees all, EVALUATOR sees own. Includes project info, evaluator info, scores with criteria.
- **POST /api/evaluations** - Create/start evaluation (EVALUATOR/ADMIN). Verifies assignment exists, checks no duplicate evaluation. Creates evaluation with default scores (0) for all criteria. Creates audit log.
- **GET /api/evaluations/[id]** - Get evaluation with full scores and criteria details. Access control: admin or owner evaluator.
- **PUT /api/evaluations/[id]** - Update evaluation/save draft. Owner evaluator or ADMIN. Upserts scores. Recalculates totalScore with special rule: for "Emprendimiento Escolar" and "Poster de Emprendimiento" categories, "Viabilidad del Negocio" criterion is scored but not counted in total.
- **PATCH /api/evaluations/[id]/submit** - Submit final evaluation (EVALUATOR owner only). Sets isDraft=false, submittedAt=now. Recalculates project averageScore (average of non-draft evaluations) and totalScore (max of all). Creates audit log + notification for project owner.

#### 4. Admin API (/src/app/api/admin/)
- **GET /api/admin/stats** - Dashboard statistics: total projects, projects by status/category/area, active evaluators count, total users, total/pending evaluations, average score, top 10 projects by score, recent 5 projects.
- **GET /api/admin/users** - List users with filtering (role, search) and pagination. Includes project/evaluation/assignment counts.
- **POST /api/admin/users** - Create user (ADMIN only). Validates required fields and role. Checks email uniqueness. Hashes password with SHA-256+salt. Creates audit log.
- **PATCH /api/admin/users/[id]** - Update user (ADMIN only). Supports name, role, phone, active fields. Creates audit log.
- **DELETE /api/admin/users/[id]** - Soft delete user (ADMIN only). Prevents self-deletion. Sets deletedAt. Creates audit log.

#### 5. Reference Data API (/src/app/api/ref/)
- **GET /api/ref/areas** - List all areas with project counts, ordered by name.
- **GET /api/ref/categories** - List all categories with project counts, ordered by name.
- **GET /api/ref/institutions** - List all institutions with project counts, ordered by name.
- **GET /api/ref/criteria** - List all evaluation criteria ordered by order field.

#### 6. Reports API (/src/app/api/reports/)
- **GET /api/reports/ranking** - Full ranking of projects by averageScore with filtering (categoryId, areaId, status). Includes all evaluation details with individual scores per criterion.
- **GET /api/reports/by-category** - Stats by category: total projects, status breakdown, average/highest/lowest scores.
- **GET /api/reports/by-area** - Stats by area: total projects, status breakdown, average/highest/lowest scores.
- **GET /api/reports/evaluator-stats** - Evaluator performance: assigned/evaluated/submitted/draft/pending counts, average score, average time to evaluate (in ms and days).

#### 7. File Upload API (/src/app/api/upload/)
- **POST /api/upload** - Upload file (PARTICIPANT/ADMIN). Accepts multipart form data with file, projectId, category. Saves to /public/uploads/ with unique filename. Creates Attachment record. Creates audit log.
- **DELETE /api/upload/[id]** - Delete attachment (owner or ADMIN). Removes file from filesystem. Deletes Attachment record. Creates audit log.

### Key Decisions:
- All routes use `getAuthContext()` from custom headers set by middleware (x-user-id, x-user-email, x-user-role)
- Consistent error handling with try/catch, proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Audit logs created for all significant operations (project CRUD, status changes, evaluator assignments, evaluations, user management, file uploads)
- Notifications created for affected users (project status changes, evaluator assignments, evaluation submissions)
- Special scoring rule: "Viabilidad del Negocio" criterion excluded from total for "Emprendimiento Escolar" and "Poster de Emprendimiento" categories
- Auto-assign algorithm uses load-balancing by tracking evaluator assignment counts and distributing evenly
- File upload uses unique filenames to prevent collisions, stored in /public/uploads/
- All routes pass `bun run lint` with zero errors
- Total: 17 new route files creating 21 API endpoints

## Task 5-6: Build Project List, Detail, and New/Edit Views
**Completed:** 2026-05-12

### What was done:

#### 1. Created Status Badge Component (src/components/projects/status-badge.tsx)
- Reusable `StatusBadge` component with color-coded badges for each project status
- DRAFT: gray, SUBMITTED: amber/yellow, APPROVED: emerald/green, REJECTED: red, FINALIST: violet/purple, WINNER: gold with Trophy icon
- Three sizes: sm, md, lg for different contexts
- Exported `ProjectStatus` type for reuse

#### 2. Created Projects List View (src/components/projects/projects-list.tsx)
- Full project listing page with header and "Nuevo Proyecto" button (PARTICIPANT/ADMIN)
- **Filters bar**: Search input, Status filter (All/Draft/Submitted/Approved/Rejected/Finalist/Winner), Category filter (from API), Area filter (from API)
- **View toggle**: Grid view (cards) / List view (table)
- **Grid view**: Beautiful cards with project image or gradient placeholder, name, pitch (truncated), status badge, area/category badges, score (if available), team name, click to navigate
- **List view**: shadcn/ui Table with columns: Nombre, Equipo, Área, Categoría, Estado, Puntaje, Acciones
- **Pagination**: Page buttons with Previous/Next navigation
- **Empty state**: Illustration with call-to-action for creating projects
- **Loading skeletons**: Both grid and list skeleton loaders
- Data fetched from GET /api/projects with all filter params
- Role-based visibility (PARTICIPANT sees own, EVALUATOR sees assigned, ADMIN sees all)

#### 3. Created Project Detail View (src/components/projects/project-detail.tsx)
- Get projectId from `useNavStore().viewParams.id`
- **Header section**: Project name, status badge (large), action buttons (Edit if owner/admin on DRAFT, Change Status dropdown for ADMIN, Delete for ADMIN)
- **Info grid** (2 columns desktop):
  - Left: Description, Pitch, Team
  - Right: Leader info (name, email, phone, course, parallel), Tutor, Location (Matrix, Sede, Extension), Area, Category, Institution
- **Project image**: Displayed if available
- **Evaluators section** (ADMIN only): List of assigned evaluators with "Asignar Evaluador" dialog (select from available evaluators), Remove evaluator button
- **Evaluations section**: Role-based visibility (ADMIN: all, EVALUATOR: own only, PARTICIPANT: summary without evaluator names for anonymous), each criteria score with Progress bar, total score prominently displayed, comments/observations
- **Attachments section**: List with icons by type, Upload button (PARTICIPANT/admin), Delete button, Download link
- **Delete confirmation**: AlertDialog before soft delete
- Back button navigation
- Full loading skeleton and error states

#### 4. Created Project Form (src/components/projects/project-form.tsx)
- Multi-step project registration form (4 steps) with animated step transitions (Framer Motion)
- **Step indicator**: Visual stepper showing completed/current/pending steps with checkmarks
- **Step 1 - Información General**: Image upload with preview, Nombre (required), Pitch (required, textarea with char count 500), Equipo (required), Descripción (required, textarea with char count 3000), Área select (from API), Categoría select (from API)
- **Step 2 - Información del Líder**: Nombre (required, pre-filled from user), Email (required, pre-filled, validated), Teléfono, Institución select (from API), Curso, Paralelo
- **Step 3 - Ubicación y Tutor**: Matriz, Sede, Extensión, Nombre del Tutor
- **Step 4 - Archivos y Revisión**: Drag & drop file upload area, Existing attachments management, Pending files list, Full review of all entered data, Submit: "Guardar Borrador" / "Enviar Proyecto"
- Form validation per step with error messages
- AnimatePresence slide transitions between steps
- Edit mode: loads existing project data when viewParams has 'id', uses PUT method
- Image upload: stores preview for new projects, uploads immediately for edits
- Post-submit: navigates to project-detail view

#### 5. Updated App Shell (src/components/app-shell.tsx)
- Added imports for ProjectsList, ProjectDetail, ProjectForm
- Added view routing in ViewRenderer:
  - 'projects' → ProjectsList
  - 'project-detail' → ProjectDetail
  - 'project-new' → ProjectForm

### Key Decisions:
- Used manual form state management instead of react-hook-form to avoid complex zod schema setup per step; validation done via simple `validateStep()` function
- Direction state for slide animations moved to top of component to avoid conditional hook call
- Image upload for new projects stores preview as data URL, actual upload happens after project creation
- Evaluator assignment uses a Dialog with Select for choosing evaluators from API
- Anonymous evaluation display for PARTICIPANT role (evaluator names hidden)
- File icons determined by MIME type with emoji representations
- All components use teal/emerald accent colors consistent with project theme

## Task 4: Build Dashboard Views (Admin, Evaluator, Participant)
**Completed:** 2026-05-12

### What was done:

#### 1. Created Admin Dashboard (src/components/dashboard/admin-dashboard.tsx)
- Welcome message with user's first name
- 4 KPI cards with gradient accents and icons:
  - Total Proyectos (count, shows submitted count as trend)
  - Evaluadores Activos (count, shows total users)
  - Evaluaciones Completadas (completed count, shows pending)
  - Proyectos Finalistas (finalist + winner count)
- "Proyectos por Estado" - Horizontal BarChart (Recharts) with status labels in Spanish
- "Proyectos por Categoría" - Donut PieChart with inner/outer radius
- "Proyectos por Área" - Vertical BarChart with truncated long names
- "Top 5 Proyectos" - Ranked list with score bars (Progress component), badges, and metadata
- "Actividad Reciente" - Timeline of recent projects with status dots and badges
- Data fetched from /api/admin/stats
- Framer Motion staggered entrance animations (container/item variants)
- Full loading skeleton states for all sections
- Responsive grid: 4 cols desktop, 2 tablet, 1 mobile for KPIs; 2 cols for charts/content
- Uses shadcn/ui chart CSS variables (chart-1 through chart-5)
- Teal/emerald gradient accents on all KPI cards

#### 2. Created Evaluator Dashboard (src/components/dashboard/evaluator-dashboard.tsx)
- Welcome message with user's first name
- 3 KPI cards: Proyectos Asignados, Evaluaciones Pendientes, Promedio Evaluado
- "Proyectos Asignados" - Card list with project status badges and evaluation status (Completada/En progreso/Pendiente)
- "Evaluaciones Recientes" - Score bars with Progress component and submission dates
- "Acciones Rápidas" - Quick action buttons to start/continue evaluations
- Data from /api/projects and /api/evaluations
- Click handlers to navigate to project-detail and evaluation-detail views
- Framer Motion animations and loading skeletons
- Responsive: 3 cols desktop, 2 tablet, 1 mobile for KPIs; 2 cols for content
- Max height with scroll overflow for lists

#### 3. Created Participant Dashboard (src/components/dashboard/participant-dashboard.tsx)
- Welcome message with user's first name
- Project status card with large icon, badge, description per status, gradient accent
- Empty state when no project exists with "Crear Proyecto" button
- "Mi Proyecto" details card with key-value pairs (name, pitch, team, area, category, evaluators, evaluations)
- "Puntaje Obtenido" - Circular progress (SVG-based) with score display out of 100
  - Individual evaluation scores with evaluator names and progress bars
  - Empty state when no evaluations completed
- "Observaciones" - List of evaluation comments with evaluator avatars, dates, and scores
- "Acciones Rápidas" - Edit Project, Upload Document, View Evaluations buttons
- Data from /api/projects (ownerId filter) and /api/evaluations (projectId filter)
- Framer Motion animations and loading skeletons
- Responsive layout

#### 4. Updated App Shell (src/components/app-shell.tsx)
- Added imports for AdminDashboard, EvaluatorDashboard, ParticipantDashboard
- Removed DashboardPlaceholder component
- Updated ViewRenderer to render role-based dashboard:
  - ADMIN → AdminDashboard
  - EVALUATOR → EvaluatorDashboard
  - PARTICIPANT (default) → ParticipantDashboard
- Uses useAuthStore to get user role

### Key Decisions:
- All dashboards use shadcn/ui Card component consistently
- Recharts used for admin charts (BarChart, PieChart) with shadcn ChartContainer wrapper
- SVG-based circular progress for participant score display (no extra library needed)
- Color palette: teal/emerald gradients, chart-1 through chart-5 CSS variables
- Responsive design with Tailwind breakpoints (sm, md, lg)
- Loading states with Skeleton components for perceived performance
- All text in Spanish matching the app's locale
- Participant dashboard handles empty states gracefully (no project, no evaluations)
- Evaluator dashboard calculates pending/completed counts client-side from API data

## Task 8: Build Evaluation Module (Rubric Scoring System)
**Completed:** 2026-05-13

### What was done:

#### 1. Created Score Circle Component (src/components/evaluations/score-circle.tsx)
- Reusable circular score display using SVG with Framer Motion animation
- `ScoreCircle` component with configurable size, strokeWidth, maxScore
- Dynamic color coding based on score percentage:
  - ≥85%: emerald, ≥70%: green, ≥50%: yellow, <50%: red
- Animated stroke drawing with `motion.circle` (1s easeOut transition)
- Score number animates with scale/opacity entrance
- Shows `/ maxScore` label when maxScore ≠ 100

#### 2. Created Evaluation Create Dialog (src/components/evaluations/evaluation-create-dialog.tsx)
- Dialog component for creating new evaluations
- Fetches assigned projects and existing evaluations to find available (unevaluated) projects
- Search/filter by project name
- Project selection with visual highlight (emerald ring + bg)
- Shows project category, area, and status badge
- Creates evaluation via POST /api/evaluations and navigates to evaluation-detail
- Loading and creating states with spinner
- Empty state when no projects available

#### 3. Created Evaluations List View (src/components/evaluations/evaluations-list.tsx)
- Full evaluations listing page with role-based views:
  - **ADMIN**: Table view with columns: Proyecto, Evaluador, Puntaje, Estado, Fecha, Acciones
  - **EVALUATOR/PARTICIPANT**: Card grid (3 cols desktop, 2 tablet, 1 mobile) with ScoreCircle
- **Stats cards**: Total evaluations, Drafts, Submitted, Average Score
- **Filters**: Search input, Status filter (All/Draft/Submitted), Project filter
- Status badges with color coding (amber for draft, emerald for submitted)
- Click to navigate to evaluation-detail view
- "Nueva Evaluación" button for evaluators (opens create dialog)
- Date formatting in Spanish locale
- Loading spinner and empty state
- Staggered Framer Motion entrance animations

#### 4. Created Evaluation Detail View (src/components/evaluations/evaluation-detail.tsx)
- The main evaluation rubric interface with premium UX:
- **Header**: Project name, evaluator name, category, status badge (draft/submitted), auto-save indicator
- **Criterion Cards** (2 columns desktop, 1 mobile):
  - Each card shows criterion name, weight badge (pts), and info popover
  - **Info Popover** (progressive disclosure): Shows description, expected evidence, max points on (i) icon click
  - **Score slider**: shadcn/ui Slider from 0 to maxScore with 0.5 step
  - Dynamic color class for slider track (red→yellow→green→emerald based on score)
  - Animated score number display (scale pulse on change)
  - Percentage indicator and color-coded progress bar below slider
  - Observation textarea per criterion
  - **Special rule**: "Viabilidad del Negocio" criterion gets "No obligatorio" badge and grayed out (opacity-60) when category is "Emprendimiento Escolar" or "Poster de Emprendimiento"
- **Score Summary Panel** (sticky on desktop right sidebar):
  - ScoreCircle with animated fill (size 140)
  - All 6 criteria breakdown bars with animated width transitions
  - Score/max per criterion with color coding
  - Optional criteria shown with reduced opacity
  - Total score calculation excludes optional criteria
- **Comments Section**: General observations textarea with character count
- **Sticky Bottom Bar** (draft only):
  - Mini ScoreCircle (size 44) + score/total display
  - "Guardar Borrador" button with manual save + toast
  - "Enviar Evaluación" button with AlertDialog confirmation showing final score
  - Validates all non-optional criteria are scored before submission
- **Submitted notice bar**: Green banner showing evaluation is locked
- **Auto-save**: Debounced 1.5s auto-save on slider/observation/comment changes
- Back button navigation via `goBack()`
- Read-only mode for submitted evaluations (all inputs disabled)

#### 5. Updated App Shell (src/components/app-shell.tsx)
- Added imports for EvaluationsList and EvaluationDetail
- Restored DashboardPlaceholder (was removed by previous agent but dashboard components don't exist)
- Added view routing in ViewRenderer:
  - 'evaluations' → EvaluationsList
  - 'evaluation-detail' → EvaluationDetail
- Removed broken imports for non-existent AdminDashboard, EvaluatorDashboard, ParticipantDashboard, ProjectsList, ProjectDetail, ProjectForm

### Key Decisions:
- ScoreCircle uses SVG + Framer Motion for smooth animated fills (no extra charting library)
- Progressive disclosure for criterion descriptions via Popover instead of cluttering the screen
- Auto-save with 1.5s debounce prevents data loss without overwhelming the API
- Local state management for scores (localScores) with sync from server on save
- Dynamic color classes for slider/progress based on score ranges
- Special category handling computed once (isSpecialCategory) and passed as isOptionalCriteria map
- Max possible score dynamically calculated excluding optional criteria
- Read-only mode enforced when evaluation is submitted (isDraft=false)
- Sticky bottom action bar for easy access on mobile
- All components pass `bun run lint` with zero errors

## Task 9: Build Reports & Analytics View
**Completed:** 2026-05-13

### What was done:

#### 1. Created Reports View (src/components/reports/reports-view.tsx)
Full reports and analytics page with 5 tabs using shadcn/ui Tabs component:

**Tab 1: Ranking General**
- Table showing all projects ranked by averageScore with columns: #, Proyecto, Equipo, Área, Categoría, Puntaje, Estado
- Top 3 projects highlighted with gold (🥇), silver (🥈), bronze (🥉) medal emojis and colored row backgrounds (amber, gray, orange)
- Visual progress bar in the score column showing score out of 100
- Filters: Category (from /api/ref/categories), Area (from /api/ref/areas), Status (all 6 statuses)
- Filters trigger re-fetch from /api/reports/ranking with query params
- Export buttons: "Exportar CSV" (functional - generates and downloads CSV with BOM for UTF-8), "Exportar Excel" (disabled placeholder)
- CSV export includes: rank, project name, team, area, category, average score, total score, status, evaluation count, owner
- Responsive: hides Equipo/Área/Categoría columns on smaller screens
- Loading skeleton with filters bar and table rows
- Empty state when no evaluated projects match filters
- Scrollable table body (max-h-[600px])

**Tab 2: Por Categoría**
- Category stat cards (4-col grid): each showing category name, total projects count, average score, highest score, color-coded top accent bar
- Bar chart: projects count per category (ChartContainer + Recharts BarChart)
- Bar chart: average score per category (domain 0-100)
- Data from /api/reports/by-category
- Loading skeletons for cards and charts

**Tab 3: Por Área**
- Area stat cards (4-col grid): each showing area name, total projects, average/highest score, status breakdown badges
- Horizontal bar chart: projects per area (layout="vertical" BarChart with truncated names)
- Donut pie chart: distribution of projects by area (innerRadius=60, outerRadius=100, paddingAngle=3, Legend)
- Data from /api/reports/by-area
- Dynamic pie chart config with CHART_COLORS per area

**Tab 4: Rendimiento de Evaluadores**
- Table of evaluators with columns: Evaluador (name+email), Asignados, Completadas, Borradores, Pendientes, Puntaje Promedio, Tiempo Promedio (days)
- Color-coded badges: emerald for completed, amber for drafts, red for pending >0, gray for 0 pending
- Bar chart comparing evaluator average scores (domain 0-100)
- Data from /api/reports/evaluator-stats
- Responsive: hides Borradores and Tiempo columns on smaller screens

**Tab 5: Finalistas y Ganadores (ADMIN only)**
- Access restricted to ADMIN role - shows "Acceso Restringido" message for other roles
- **Podium visualization**: Animated bars with Framer Motion height transitions (1st center=180px, 2nd left=140px, 3rd right=100px)
  - Gold gradient for 1st place with Trophy icon
  - Silver gradient for 2nd place with Medal icon
  - Bronze gradient for 3rd place with Award icon
  - Project name and score displayed above each podium position
- **Winners section**: Yellow/gold bordered cards with Trophy icon, project name, area, category, score, evaluation count
- **Finalists section**: Violet bordered cards with Star icon, scrollable list (max-h-96), status badge showing "Ganador" or "Finalista"
- Data from /api/reports/ranking (filters FINALIST/WINNER from full ranking)

#### 2. Updated App Shell (src/components/app-shell.tsx)
- Added import for ReportsView from '@/components/reports/reports-view'
- Added view routing: 'reports' → ReportsView in ViewRenderer

### Key Decisions:
- All 5 tabs implemented as separate sub-components (RankingTab, CategoryTab, AreaTab, EvaluatorTab, FinalistsTab) within single file for cohesion
- CSV export uses BOM (\uFEFF) prefix for proper UTF-8 encoding in Excel
- Used RANK_STYLES object for clean top-3 highlighting instead of inline conditionals
- Podium uses Framer Motion `initial/animate` for dramatic bar height reveal with staggered delays
- Reports API routes require ADMIN role - non-admin users see restricted access message on Tab 5
- Chart colors use CSS variables (var(--color-chart-1) through var(--color-chart-5)) for theme consistency
- RankingTab uses useCallback for loadRanking to properly handle filter dependency in useEffect
- All text in Spanish consistent with app locale
- Responsive design with Tailwind breakpoints - columns hidden on mobile, scrollable containers
- Custom scrollbar styling via max-h + overflow-y-auto on tables and lists
- All components pass `bun run lint` with zero errors

## Task 7-11: Build Evaluators Management, Users Management, Notifications, and Settings Views
**Completed:** 2026-05-13

### What was done:

#### 1. Created Evaluators View (src/components/evaluators/evaluators-view.tsx)
Full evaluators management page (ADMIN only) with:
- **Header**: "Gestión de Evaluadores" title + "Nuevo Evaluador" button + "Asignación Automática" button
- **Stats cards** (4-card grid): Total Evaluadores, Proyectos Asignados, Evaluaciones Completadas, Evaluaciones Pendientes
  - Each card has gradient icon background, main value, and subtext
  - Computed from evaluator data (assignedProjects count, evaluations count)
- **Search bar**: Filters evaluators by name/email via API search param
- **Evaluators table**: shadcn/ui Table with columns: Nombre (avatar + name), Email, Proyectos Asignados (badge), Evaluaciones Completadas (badge), Estado (Switch toggle), Acciones (dropdown menu)
- **Create evaluator dialog**: Form with name, email, password, phone fields. POST /api/admin/users with role=EVALUATOR
- **Edit evaluator dialog**: Same form but email disabled, password optional ("Dejar vacío para no cambiar"). PATCH /api/admin/users/[id]
- **Toggle active/inactive**: Switch component that calls PATCH /api/admin/users/[id] with active field
- **Auto-assign dialog**:
  - Select evaluators per project (2-5) via Select component
  - Toggle between "All projects" and "Select specific projects" modes
  - Checkbox list of projects fetched from /api/projects
  - Preview button shows assignment preview (project name + evaluator count)
  - Execute button calls POST /api/projects/auto-assign
  - Shows success toast with total assigned count
- Access control: renders "Acceso no autorizado" for non-ADMIN users
- Framer Motion staggered entrance animations
- Loading spinner and empty state

#### 2. Created Users View (src/components/users/users-view.tsx)
Full users management page (ADMIN only) with:
- **Header**: "Gestión de Usuarios" title with total user count + "Nuevo Usuario" button
- **Role filter tabs**: Todos, Administradores, Participantes, Evaluadores (shadcn/ui Tabs with icons)
- **Search bar**: Filters by name or email via API search param
- **Users table**: shadcn/ui Table with columns: Usuario (avatar + name + email), Rol (color-coded badge), Teléfono, Estado (Switch toggle), Acciones (dropdown menu)
  - Role badges: ADMIN=emerald default, PARTICIPANT=teal secondary, EVALUATOR=cyan secondary
- **Pagination**: Page buttons with Previous/Next navigation, shows "Página X de Y (Z usuarios)"
- **Create user dialog**: Form with name, email, password, role selector (ADMIN/PARTICIPANT/EVALUATOR), phone
- **Edit user dialog**: Update name, role, phone. Email displayed but disabled.
- **Delete confirmation**: AlertDialog before soft delete. Warns that account will be deactivated but data preserved.
- **Toggle active/inactive**: Switch component (disabled for current user to prevent self-deactivation)
- Self-deletion prevention in dropdown menu (delete option hidden for current user)
- Access control for non-ADMIN users
- Framer Motion staggered entrance animations
- Loading spinner and empty state

#### 3. Created Notifications View (src/components/notifications/notifications-view.tsx)
Notifications page accessible to all authenticated users with:
- **Header**: "Notificaciones" title + "Marcar todas como leídas" button (shown when unread > 0)
- **Unread count display**: Dynamic message "Tienes X notificaciones sin leer"
- **Filter tabs**: Todas, No leídas (with emerald badge count), Leídas (shadcn/ui Tabs)
- **Notification list**: Cards showing:
  - Icon based on type (info=Info/blue, success=CheckCircle/emerald, warning=AlertTriangle/amber, error=XCircle/red)
  - Colored background circle for each type icon
  - Title (bold for unread) + message (line-clamp-2)
  - Unread indicator: emerald dot + left border accent (border-l-4 border-l-emerald-500) + subtle emerald background
  - Read notifications shown with reduced opacity (opacity-75)
  - Time ago formatting: "Ahora mismo", "Hace X min", "Hace Xh", "Hace Xd", or date
  - Click to mark as read (PUT /api/notifications/[id]/read)
- **Mark all as read**: Batch marks all unread notifications via parallel PUT requests
- **Auto-refresh**: Polls every 30 seconds for new notifications via setInterval
- **Empty state**: BellOff icon with "No tienes notificaciones" message
- AnimatePresence for smooth notification card transitions
- Framer Motion staggered entrance animations

#### 4. Created Settings View (src/components/settings/settings-view.tsx)
Settings page accessible to all authenticated users with:
- **Profile section** (User icon):
  - Avatar (initials with emerald-teal gradient, 80px)
  - Name, email, role badge display
  - Editable fields: Name, Phone (email shown as disabled)
  - "Guardar Cambios" button - PATCH /api/admin/users/[id] + refreshes auth state via checkAuth()
- **Preferences section** (Palette icon):
  - Dark mode toggle: Switch component using next-themes (theme === 'dark')
  - Language preference: Shows "Próximamente" badge (not yet implemented)
- **Security section** (Shield icon):
  - Change password form: Current password, New password, Confirm password
  - Validation: all fields required, passwords must match, min 6 chars
  - PATCH /api/admin/users/[id] with password field
  - Two-factor authentication: Shows "Próximamente" badge
- **About section** (Info icon):
  - App logo (Lightbulb with emerald-teal gradient)
  - "Fábrica de Ideas v1.0.0"
  - Description text
  - Version number display
- Max width container (max-w-3xl) for comfortable reading
- Framer Motion staggered entrance animations

#### 5. Updated App Shell (src/components/app-shell.tsx)
- Added imports for EvaluatorsView, UsersView, NotificationsView, SettingsView (imports were already present from a prior agent)
- Added view routing in ViewRenderer:
  - 'evaluators' → EvaluatorsView
  - 'users' → UsersView
  - 'notifications' → NotificationsView
  - 'settings' → SettingsView
- All existing view routes preserved (dashboard, evaluations, evaluation-detail, reports)

### Key Decisions:
- EvaluatorsView fetches evaluators via /api/admin/users?role=EVALUATOR (reuses admin endpoint with role filter)
- Auto-assign preview computed client-side from project list + evaluatorsPerProject setting before sending to API
- UsersView uses Tabs component for role filtering instead of separate Select, for cleaner UX
- Pagination in UsersView uses page buttons with direct page number click + prev/next
- NotificationsView filters on client-side for "read" tab, and via API unread param for "unread" tab
- Time ago formatting handles Spanish locale: "Ahora mismo", "Hace X min", "Hace Xh", "Hace Xd"
- SettingsView reuses /api/admin/users/[id] endpoint for profile updates since it's the same data model
- Password change in Settings doesn't verify current password client-side (API would need a dedicated endpoint for proper verification)
- All views use Framer Motion containerVariants/itemVariants pattern for consistent staggered animations
- All views use teal/emerald accent colors matching the app theme
- shadcn/ui components used throughout: Card, Table, Dialog, AlertDialog, Tabs, Badge, Switch, Select, Button, Input, Label, Avatar
- All components pass `bun run lint` with zero errors

---
Task ID: fix-preview
Agent: Main Agent
Task: Fix application preview not visible - dev server OOM crash

Work Log:
- Investigated dev server crash: FATAL ERROR: Ineffective mark-compacts near heap limit (JavaScript heap out of memory)
- Fixed duplicate key error from previous session (reports-view.tsx AnimatePresence)
- Converted all 11 view component imports from static to dynamic imports using `next/dynamic` in app-shell.tsx to reduce initial compilation memory
- Also made LoginPage and AppShell dynamic imports in page.tsx
- Removed framer-motion from app-shell.tsx (AnimatePresence, motion.div) to reduce bundle size
- Disabled Prisma query logging (was flooding dev.log with thousands of query lines)
- Set NODE_OPTIONS="--max-old-space-size=1536" to balance between memory ceiling and GC aggressiveness
- Added allowedDevOrigins to next.config.ts for .space-z.ai domain
- Created auto-restart supervisor script (start-dev.sh)
- Server now compiles and serves pages successfully at ~1.1GB memory usage

Stage Summary:
- Root cause: Next.js Turbopack dev server OOM during compilation with many heavy dependencies (recharts, framer-motion, prisma, shadcn/ui)
- Fix: Dynamic imports for all view components + reduced Prisma logging + memory limit tuning
- Server is stable for ~90-120 seconds before OS OOM killer terminates it
- Application works correctly during uptime: login, dashboard, API calls all functional
- Auto-restart supervisor created to recover from crashes

---
Task ID: 1
Agent: Main Agent
Task: Fix auto-save overwriting evaluator's selected scores in evaluation-detail.tsx

Work Log:
- Read and analyzed evaluation-detail.tsx to understand auto-save flow
- Identified root cause: stale closure bug in `saveDraft` useCallback
- `saveDraft` had `localScores` and `comments` in its dependency array, causing it to capture stale values
- When auto-save completed, `setLocalScores(scoreMap)` overwrote user's current edits with old values from the closure
- Added `localScoresRef` and `commentsRef` refs to always access latest state values without stale closures
- Changed `saveDraft` to read from refs instead of closure variables
- Changed post-save `setLocalScores` to use functional update, always preferring `prevLocal` values over server response
- Removed `localScores` and `comments` from `saveDraft` dependency array (now using refs)
- Cleaned up unused `skipScoreOverwriteRef`
- Verified lint passes with no errors

Stage Summary:
- Fixed the bug where scores would change/reset when auto-save triggered
- Root cause was stale closure in useCallback + overwriting local state with server response
- Solution: use refs for latest values + functional setState to preserve user edits
