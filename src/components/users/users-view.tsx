'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  UserCog,
  UserPlus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  ClipboardCheck,
  Users,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface UserItem {
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

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
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

const roleBadgeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }> = {
  ADMIN: { label: 'Administrador', variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  PARTICIPANT: { label: 'Participante', variant: 'secondary', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  EVALUATOR: { label: 'Evaluador', variant: 'secondary', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
}

export function UsersView() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
    phone: '',
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('limit', '10')
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter)

      const data = await apiFetch<{
        users: UserItem[]
        total: number
        page: number
        totalPages: number
      }>(`/api/admin/users?${params.toString()}`)
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      toast.error('Error al cargar usuarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [search, roleFilter])

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error('Todos los campos obligatorios son requeridos')
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
          role: formData.role,
          phone: formData.phone || undefined,
        }),
      })
      toast.success('Usuario creado exitosamente')
      setCreateOpen(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser || !formData.name) {
      toast.error('El nombre es obligatorio')
      return
    }
    try {
      setSaving(true)
      await apiFetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name,
          role: formData.role,
          phone: formData.phone || null,
        }),
      })
      toast.success('Usuario actualizado')
      setEditOpen(false)
      setSelectedUser(null)
      resetForm()
      fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      setSaving(true)
      await apiFetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      })
      toast.success('Usuario eliminado')
      setDeleteOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: UserItem) => {
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !user.active }),
      })
      toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado')
      fetchUsers()
    } catch (err) {
      toast.error('Error al cambiar estado')
      console.error(err)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'PARTICIPANT', phone: '' })
  }

  const openEditDialog = (user: UserItem) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
    })
    setEditOpen(true)
  }

  const openDeleteDialog = (user: UserItem) => {
    setSelectedUser(user)
    setDeleteOpen(true)
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra todos los usuarios del sistema ({total} usuarios)
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true) }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={roleFilter} onValueChange={setRoleFilter}>
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="ADMIN" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="PARTICIPANT" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Participantes
            </TabsTrigger>
            <TabsTrigger value="EVALUATOR" className="gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Evaluadores
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <UserCog className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Sin usuarios</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No se encontraron usuarios con los filtros actuales.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const roleBadge = roleBadgeMap[user.role] || {
                        label: user.role,
                        variant: 'outline' as const,
                        className: '',
                      }
                      const initials = user.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || '?'

                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={roleBadge.variant} className={roleBadge.className}>
                              {roleBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.phone || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch
                                checked={user.active}
                                onCheckedChange={() => handleToggleActive(user)}
                                disabled={user.id === currentUser?.id}
                              />
                              <span className={`text-xs ${user.active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                {user.active ? 'Activo' : 'Inactivo'}
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
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                {user.id !== currentUser?.id && (
                                  <DropdownMenuItem
                                    onClick={() => openDeleteDialog(user)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({total} usuarios)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de usuario en el sistema
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
              <Label htmlFor="create-role">Rol *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="PARTICIPANT">Participante</SelectItem>
                  <SelectItem value="EVALUATOR">Evaluador</SelectItem>
                </SelectContent>
              </Select>
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
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario
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
              <Label htmlFor="edit-role">Rol *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="PARTICIPANT">Participante</SelectItem>
                  <SelectItem value="EVALUATOR">Evaluador</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la cuenta de <strong>{selectedUser?.name}</strong>.
              El usuario no podrá iniciar sesión pero sus datos se mantendrán en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
