'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutGrid,
  List,
  PlusCircle,
  FolderKanban,
  Star,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { apiFetch } from '@/lib/api'
import { StatusBadge } from '@/components/projects/status-badge'
import { getFileUrl } from '@/lib/utils'

interface Area {
  id: string
  name: string
  _count?: { projects: number }
}

interface Category {
  id: string
  name: string
  _count?: { projects: number }
}

interface ProjectListItem {
  id: string
  name: string
  pitch: string
  description: string
  team: string
  imageUrl: string | null
  status: string
  totalScore: number
  averageScore: number
  area: { id: string; name: string }
  category: { id: string; name: string }
  institution: { id: string; name: string }
  owner: { id: string; name: string; email: string }
  evaluators: Array<{ evaluator: { id: string; name: string; email: string } }>
  _count: { evaluations: number; attachments: number }
  createdAt: string
}

interface ProjectsResponse {
  projects: ProjectListItem[]
  total: number
  page: number
  totalPages: number
}

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'SUBMITTED', label: 'Enviado' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'FINALIST', label: 'Finalista' },
  { value: 'WINNER', label: 'Ganador' },
]

const gradients = [
  'from-emerald-400 to-teal-500',
  'from-teal-400 to-cyan-500',
  'from-cyan-400 to-sky-500',
  'from-emerald-500 to-cyan-500',
  'from-teal-500 to-emerald-400',
  'from-sky-400 to-emerald-500',
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  const { navigate } = useNavStore()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group border-border/50"
        onClick={() => navigate('project-detail', { id: project.id })}
      >
        {project.imageUrl ? (
          <div className="h-40 overflow-hidden">
            <img
              src={getFileUrl(project.imageUrl)}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div
            className={`h-40 bg-gradient-to-br ${getGradient(project.name)} flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/5" />
            <span className="text-white/90 text-4xl font-bold select-none">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {project.name}
            </h3>
            <StatusBadge status={project.status} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.pitch}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              {project.area.name}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {project.category.name}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FolderKanban className="h-3 w-3" />
              {project.team}
            </span>
            {project.averageScore > 0 && (
              <span className="text-xs font-medium flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                {project.averageScore.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface User {
  id: string
  role: string
}

function ProjectRow({ project, user, onDelete }: { project: ProjectListItem; user: User | null; onDelete: (id: string) => void }) {
  const { navigate } = useNavStore()
  const [deleting, setDeleting] = useState(false)

  const canDelete = user?.role === 'ADMIN' || (user?.role === 'PARTICIPANT' && project.owner.id === user.id)

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      onDelete(project.id)
    } catch {
      // handled by apiFetch
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => navigate('project-detail', { id: project.id })}
    >
      <TableCell className="font-medium max-w-[200px]">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGradient(project.name)} flex items-center justify-center shrink-0`}
          >
            <span className="text-white text-xs font-bold">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="truncate">{project.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{project.team}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {project.area.name}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {project.category.name}
        </Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={project.status} size="sm" />
      </TableCell>
      <TableCell className="text-center">
        {project.averageScore > 0 ? (
          <span className="font-medium flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            {project.averageScore.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate('project-detail', { id: project.id })
            }}
          >
            Ver
          </Button>
          {canDelete && (
            <AlertDialog open={deleting} onOpenChange={(open) => !open && setDeleting(false)}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleting(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-5 w-[80px] rounded-full" />
          <Skeleton className="h-5 w-[60px] rounded-full" />
        </div>
      ))}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()
  const canCreate = user?.role === 'PARTICIPANT' || user?.role === 'ADMIN'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
        <FolderKanban className="w-10 h-10 text-emerald-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No hay proyectos</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {canCreate
          ? 'Aún no has creado ningún proyecto. Comienza registrando tu idea para que pueda ser evaluada.'
          : 'No se encontraron proyectos con los filtros seleccionados.'}
      </p>
      {canCreate && (
        <Button
          onClick={() => navigate('project-new')}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      )}
    </motion.div>
  )
}

export function ProjectsList() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()

  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [areaFilter, setAreaFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [areas, setAreas] = useState<Area[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const canCreate = user?.role === 'PARTICIPANT' || user?.role === 'ADMIN'

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')
      if (search) params.set('search', search)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (areaFilter !== 'ALL') params.set('areaId', areaFilter)
      if (categoryFilter !== 'ALL') params.set('categoryId', categoryFilter)

      const data = await apiFetch<ProjectsResponse>(`/api/projects?${params.toString()}`)
      setProjects(data.projects)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      // Error handled by apiFetch
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter, areaFilter, categoryFilter])

  useEffect(() => {
    apiFetch<Area[]>('/api/ref/areas').then(setAreas).catch(() => {})
    apiFetch<Category[]>('/api/ref/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, areaFilter, categoryFilter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            {total} proyecto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate('project-new')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shrink-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <GridSkeleton />
        ) : (
          <ListSkeleton />
        )
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="hidden md:table-cell">Área</TableHead>
                <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Puntaje</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} user={user} onDelete={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}
