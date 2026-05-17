'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import {
  Lightbulb,
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  Users,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  Moon,
  Sun,
  PlusCircle,
  FileCheck,
  BookOpen,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore, type View } from '@/store/nav-store'
import { AutoBackup } from '@/components/auto-backup'

// Lazy-loaded view components to reduce initial memory footprint
const AdminDashboard = dynamic(() => import('@/components/dashboard/admin-dashboard').then(m => ({ default: m.AdminDashboard })), { ssr: false })
const EvaluatorDashboard = dynamic(() => import('@/components/dashboard/evaluator-dashboard').then(m => ({ default: m.EvaluatorDashboard })), { ssr: false })
const ParticipantDashboard = dynamic(() => import('@/components/dashboard/participant-dashboard').then(m => ({ default: m.ParticipantDashboard })), { ssr: false })
const ProjectsList = dynamic(() => import('@/components/projects/projects-list').then(m => ({ default: m.ProjectsList })), { ssr: false })
const ProjectDetail = dynamic(() => import('@/components/projects/project-detail').then(m => ({ default: m.ProjectDetail })), { ssr: false })
const ProjectForm = dynamic(() => import('@/components/projects/project-form').then(m => ({ default: m.ProjectForm })), { ssr: false })
const EvaluationsList = dynamic(() => import('@/components/evaluations/evaluations-list').then(m => ({ default: m.EvaluationsList })), { ssr: false })
const EvaluationDetail = dynamic(() => import('@/components/evaluations/evaluation-detail').then(m => ({ default: m.EvaluationDetail })), { ssr: false })
const EvaluatorsView = dynamic(() => import('@/components/evaluators/evaluators-view').then(m => ({ default: m.EvaluatorsView })), { ssr: false })
const UsersView = dynamic(() => import('@/components/users/users-view').then(m => ({ default: m.UsersView })), { ssr: false })
const NotificationsView = dynamic(() => import('@/components/notifications/notifications-view').then(m => ({ default: m.NotificationsView })), { ssr: false })
const SettingsView = dynamic(() => import('@/components/settings/settings-view').then(m => ({ default: m.SettingsView })), { ssr: false })
const ReportsView = dynamic(() => import('@/components/reports/reports-view').then(m => ({ default: m.ReportsView })), { ssr: false })

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
    </div>
  )
}

interface NavItem {
  view: View
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const adminNavItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'projects', label: 'Proyectos', icon: FolderKanban },
  { view: 'evaluators', label: 'Evaluadores', icon: Users },
  { view: 'evaluations', label: 'Evaluaciones', icon: ClipboardCheck },
  { view: 'reports', label: 'Reportes', icon: BarChart3 },
  { view: 'users', label: 'Usuarios', icon: UserCog },
  { view: 'settings', label: 'Configuración', icon: Settings },
]

const evaluatorNavItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'projects', label: 'Proyectos Asignados', icon: FolderKanban },
  { view: 'evaluations', label: 'Mis Evaluaciones', icon: FileCheck },
]

const participantNavItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'projects', label: 'Mi Proyecto', icon: BookOpen },
  { view: 'evaluations', label: 'Evaluaciones', icon: ClipboardCheck },
]

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return adminNavItems
    case 'EVALUATOR':
      return evaluatorNavItems
    case 'PARTICIPANT':
      return participantNavItems
    default:
      return participantNavItems
  }
}

function getViewLabel(view: View): string {
  const labels: Record<View, string> = {
    dashboard: 'Dashboard',
    projects: 'Proyectos',
    'project-new': 'Nuevo Proyecto',
    'project-detail': 'Detalle del Proyecto',
    evaluations: 'Evaluaciones',
    'evaluation-detail': 'Detalle de Evaluación',
    evaluators: 'Evaluadores',
    reports: 'Reportes',
    users: 'Usuarios',
    settings: 'Configuración',
    notifications: 'Notificaciones',
  }
  return labels[view] || view
}


function PlaceholderView({ view }: { view: View }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getViewLabel(view)}</h1>
        <p className="text-muted-foreground mt-1">
          Esta sección está en desarrollo.
        </p>
      </div>
      <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <Lightbulb className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Próximamente</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Esta vista estará disponible próximamente. Estamos trabajando para ofrecerte la mejor experiencia.
        </p>
      </div>
    </div>
  )
}

function ViewRenderer() {
  const { currentView } = useNavStore()
  const { user } = useAuthStore()

  if (currentView === 'dashboard') {
    const role = user?.role
    if (role === 'ADMIN') return <AdminDashboard />
    if (role === 'EVALUATOR') return <EvaluatorDashboard />
    return <ParticipantDashboard />
  }

  if (currentView === 'projects') {
    return <ProjectsList />
  }

  if (currentView === 'project-detail') {
    return <ProjectDetail />
  }

  if (currentView === 'project-new') {
    return <ProjectForm />
  }

  if (currentView === 'evaluations') {
    return <EvaluationsList />
  }

  if (currentView === 'evaluation-detail') {
    return <EvaluationDetail />
  }

  if (currentView === 'reports') {
    return <ReportsView />
  }

  if (currentView === 'evaluators') {
    return <EvaluatorsView />
  }

  if (currentView === 'users') {
    return <UsersView />
  }

  if (currentView === 'notifications') {
    return <NotificationsView />
  }

  if (currentView === 'settings') {
    return <SettingsView />
  }

  return <PlaceholderView view={currentView} />
}

function AppSidebar() {
  const { user, logout } = useAuthStore()
  const { currentView, navigate } = useNavStore()
  const { theme, setTheme } = useTheme()

  const navItems = getNavItems(user?.role || 'PARTICIPANT')
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
              onClick={() => navigate('dashboard')}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <Lightbulb className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Fábrica de Ideas</span>
                <span className="truncate text-xs text-muted-foreground">Plataforma de Innovación</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    isActive={currentView === item.view}
                    onClick={() => navigate(item.view)}
                    tooltip={item.label}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {user?.role === 'ADMIN' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={currentView === 'project-new'}
                    onClick={() => navigate('project-new')}
                    tooltip="Nuevo Proyecto"
                  >
                    <PlusCircle className="size-4" />
                    <span>Nuevo Proyecto</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Separator className="my-1" />
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function TopBar() {
  const { currentView, navigate } = useNavStore()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => navigate('dashboard')}
            >
              Inicio
            </BreadcrumbLink>
          </BreadcrumbItem>
          {currentView !== 'dashboard' && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{getViewLabel(currentView)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('notifications')}
        >
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-emerald-500 text-white border-0">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Suspense fallback={<ViewLoader />}>
              <ViewRenderer />
            </Suspense>
          </div>
        </div>
        <footer className="border-t py-3 px-6 text-center text-xs text-muted-foreground shrink-0">
          © {new Date().getFullYear()} Fábrica de Ideas. Todos los derechos reservados.
        </footer>
      </SidebarInset>
      <AutoBackup />
    </SidebarProvider>
  )
}
