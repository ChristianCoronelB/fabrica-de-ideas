'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  Zap,
  FolderKanban,
  ClipboardCheck,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Loader2,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface EvaluatorUser {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  avatar: string | null
  active: boolean
  createdAt: string
  _count: {
    projects: number
    evaluations: number
    assignedProjects: number
  }
}

interface ProjectItem {
  id: string
  name: string
  status: string
  _count?: { evaluators: number }
}

interface EvaluatorFormData {
  name: string
  email: string
  password: string
  phone: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function EvaluatorsView() {
  const { user: currentUser } = useAuthStore()
  const [evaluators, setEvaluators] = useState<EvaluatorUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [autoAssignOpen, setAutoAssignOpen] = useState(false)
  const [selectedEvaluator, setSelectedEvaluator] = useState<EvaluatorUser | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState<EvaluatorFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  // Auto-assign state
  const [evaluatorsPerProject, setEvaluatorsPerProject] = useState('3')
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set())
  const [assignAllProjects, setAssignAllProjects] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [assignPreview, setAssignPreview] = useState<Array<{ projectName: string; evaluatorCount: number }> | null>(null)

  const fetchEvaluators = useCallback(async () => {
    try {
      setLoading(true)
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const data = await apiFetch<{
        users: EvaluatorUser[]
        total: number
        page: number
        totalPages: number
      }>(`/api/admin/users?role=EVALUATOR&limit=100${searchParam}`)
      setEvaluators(data.users)
    } catch (err) {
      toast.error('Error al cargar evaluadores')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchEvaluators()
  }, [fetchEvaluators])

  const totalAssigned = evaluators.reduce((acc, e) => acc + (e._count?.assignedProjects || 0), 0)
  const totalEvaluations = evaluators.reduce((acc, e) => acc + (e._count?.evaluations || 0), 0)
  const activeEvaluators = evaluators.filter((e) => e.active).length

  // Stats
  const stats = [
    {
      label: 'Total Evaluadores',
      value: evaluators.length,
      subtext: `${activeEvaluators} activos`,
      icon: Users,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Proyectos Asignados',
      value: totalAssigned,
      subtext: 'asignaciones totales',
      icon: FolderKanban,
      gradient: 'from-teal-500 to-cyan-600',
    },
    {
      label: 'Evaluaciones Completadas',
      value: totalEvaluations,
      subtext: 'realizadas',
      icon: ClipboardCheck,
      gradient: 'from-cyan-500 to-emerald-600',
    },
    {
      label: 'Evaluaciones Pendientes',
      value: Math.max(0, totalAssigned - totalEvaluations),
      subtext: 'por realizar',
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
    },
  ]

  // Create evaluator
  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Nombre, email y contraseña son obligatorios')
      return
    }
    try {
      setSaving(true)
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'EVALUATOR',
          phone: formData.phone || undefined,
        }),
      })
      toast.success('Evaluador creado exitosamente')
      setCreateOpen(false)
      resetForm()
      fetchEvaluators()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear evaluador')
    } finally {
      setSaving(false)
    }
  }

  // Edit evaluator
  const handleEdit = async () => {
    if (!selectedEvaluator || !formData.name || !formData.email) {
      toast.error('Nombre y email son obligatorios')
      return
    }
    try {
      setSaving(true)
      const body: Record<string, unknown> = {
        name: formData.name,
        phone: formData.phone || null,
      }
      if (formData.password) {
        body.password = formData.password
      }
      await apiFetch(`/api/admin/users/${selectedEvaluator.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      toast.success('Evaluador actualizado')
      setEditOpen(false)
      setSelectedEvaluator(null)
      resetForm()
      fetchEvaluators()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar evaluador')
    } finally {
      setSaving(false)
    }
  }

  // Toggle active
  const handleToggleActive = async (evaluator: EvaluatorUser) => {
    try {
      await apiFetch(`/api/admin/users/${evaluator.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !evaluator.active }),
      })
      toast.success(evaluator.active ? 'Evaluador desactivado' : 'Evaluador activado')
      fetchEvaluators()
    } catch (err) {
      toast.error('Error al cambiar estado')
      console.error(err)
    }
  }

  // Auto-assign
  const fetchProjectsForAssign = async () => {
    try {
      const data = await apiFetch<{
        projects: ProjectItem[]
        total: number
      }>('/api/projects?limit=100')
      setProjects(data.projects || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleAutoAssign = async () => {
    try {
      setAssigning(true)
      const body: { evaluatorsPerProject: number; projectIds?: string[] } = {
        evaluatorsPerProject: parseInt(evaluatorsPerProject),
      }
      if (!assignAllProjects && selectedProjectIds.size > 0) {
        body.projectIds = Array.from(selectedProjectIds)
      }
      const result = await apiFetch<{
        totalAssigned: number
        projectsProcessed: number
        results: Array<{ projectId: string; projectName: string; assignedEvaluators: string[] }>
      }>('/api/projects/auto-assign', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      toast.success(
        `${result.totalAssigned} evaluadores asignados a ${result.projectsProcessed} proyectos`
      )
      setAutoAssignOpen(false)
      setAssignPreview(null)
      fetchEvaluators()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al auto-asignar')
    } finally {
      setAssigning(false)
    }
  }

  const handlePreviewAssign = () => {
    const preview = (assignAllProjects ? projects : projects.filter((p) => selectedProjectIds.has(p.id))).map((p) => ({
      projectName: p.name,
      evaluatorCount: parseInt(evaluatorsPerProject),
    }))
    setAssignPreview(preview)
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', phone: '' })
  }

  const openEditDialog = (evaluator: EvaluatorUser) => {
    setSelectedEvaluator(evaluator)
    setFormData({
      name: evaluator.name,
      email: evaluator.email,
      password: '',
      phone: evaluator.phone || '',
    })
    setEditOpen(true)
  }

  const openAutoAssignDialog = () => {
    setAssignPreview(null)
    setSelectedProjectIds(new Set())
    setAssignAllProjects(true)
    setAutoAssignOpen(true)
    fetchProjectsForAssign()
  }

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
    setAssignPreview(null)
  }

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Acceso no autorizado</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Evaluadores</h1>
          <p className="text-muted-foreground mt-1">
            Administra los evaluadores y sus asignaciones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAutoAssignDialog}>
            <Zap className="mr-2 h-4 w-4" />
            Asignación Automática
          </Button>
          <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Evaluador
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar evaluadores..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Evaluators Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : evaluators.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Sin evaluadores</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Crea un nuevo evaluador para comenzar a asignar proyectos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Proyectos Asignados</TableHead>
                      <TableHead className="text-center">Evaluaciones Completadas</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluators.map((evaluator) => (
                      <TableRow key={evaluator.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                                {evaluator.name
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{evaluator.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{evaluator.email}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{evaluator._count?.assignedProjects || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{evaluator._count?.evaluations || 0}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={evaluator.active}
                              onCheckedChange={() => handleToggleActive(evaluator)}
                            />
                            <span className={`text-xs ${evaluator.active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              {evaluator.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(evaluator)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Evaluator Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Evaluador</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de evaluador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nombre *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Contraseña *</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">Teléfono</Label>
              <Input
                id="create-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+593 000 000 000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Evaluador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Evaluator Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Evaluador</DialogTitle>
            <DialogDescription>
              Actualiza la información del evaluador
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contraseña</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
              />
              <p className="text-xs text-muted-foreground">Dejar vacío si no deseas cambiar la contraseña</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+593 000 000 000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Assign Dialog */}
      <Dialog open={autoAssignOpen} onOpenChange={setAutoAssignOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Asignación Automática</DialogTitle>
            <DialogDescription>
              Distribuye evaluadores equitativamente entre los proyectos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label>Evaluadores por proyecto</Label>
              <Select value={evaluatorsPerProject} onValueChange={(v) => { setEvaluatorsPerProject(v); setAssignPreview(null) }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 evaluadores</SelectItem>
                  <SelectItem value="3">3 evaluadores</SelectItem>
                  <SelectItem value="4">4 evaluadores</SelectItem>
                  <SelectItem value="5">5 evaluadores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Alcance</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant={assignAllProjects ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAssignAllProjects(true); setSelectedProjectIds(new Set()); setAssignPreview(null) }}
                >
                  Todos los proyectos
                </Button>
                <Button
                  variant={!assignAllProjects ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAssignAllProjects(false); setAssignPreview(null) }}
                >
                  Seleccionar proyectos
                </Button>
              </div>
            </div>

            {!assignAllProjects && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Cargando proyectos...</p>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.has(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{project.name}</span>
                    </label>
                  ))
                )}
              </div>
            )}

            {assignPreview && (
              <div className="border rounded-lg p-3 bg-emerald-50 dark:bg-emerald-900/20">
                <h4 className="text-sm font-semibold mb-2">Vista previa de asignación</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {assignPreview.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="truncate mr-2">{item.projectName}</span>
                      <span className="text-emerald-600 font-medium whitespace-nowrap">
                        {item.evaluatorCount} eval.
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total: {assignPreview.length} proyectos, ~{assignPreview.reduce((a, b) => a + b.evaluatorCount, 0)} asignaciones
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setAutoAssignOpen(false)}>
              Cancelar
            </Button>
            {!assignPreview ? (
              <Button variant="outline" onClick={handlePreviewAssign}>
                Vista Previa
              </Button>
            ) : null}
            <Button onClick={handleAutoAssign} disabled={assigning}>
              {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ejecutar Asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
