'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  FileText,
  Send,
  Loader2,
  BarChart3,
  Eye,
  Trash2,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ScoreCircle } from './score-circle'
import { EvaluationCreateDialog } from './evaluation-create-dialog'
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

interface EvaluationCriteria {
  id: string
  name: string
  description: string
  weight: number
  evidence: string
  order: number
}

interface EvaluationScore {
  id: string
  evaluationId: string
  criteriaId: string
  score: number
  maxScore: number
  observation: string | null
  criteria: EvaluationCriteria
}

interface Evaluation {
  id: string
  projectId: string
  evaluatorId: string
  totalScore: number
  comments: string | null
  isDraft: boolean
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
    status: string
    category: { id: string; name: string }
  }
  evaluator: {
    id: string
    name: string
    email: string
  }
  scores: EvaluationScore[]
}

export function EvaluationsList() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted'>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { navigate } = useNavStore()

  const isAdmin = user?.role === 'ADMIN'
  const isEvaluator = user?.role === 'EVALUATOR'

  const handleDeleteEvaluation = async (id: string) => {
    try {
      await apiFetch(`/api/evaluations/${id}`, { method: 'DELETE' })
      setDeletingId(null)
      fetchEvaluations()
    } catch {
      // handled by apiFetch
    }
  }

  const fetchEvaluations = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/evaluations'
      const params: string[] = []
      if (statusFilter === 'draft') params.push('isDraft=true')
      if (statusFilter === 'submitted') params.push('isDraft=false')
      if (params.length) url += '?' + params.join('&')
      const data = await apiFetch<Evaluation[]>(url)
      setEvaluations(data || [])
    } catch {
      // handled by apiFetch
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchEvaluations()
  }, [fetchEvaluations])

  const uniqueProjects = Array.from(
    new Map(evaluations.map((e) => [e.project.id, e.project])).values()
  )

  const filtered = evaluations.filter((e) => {
    const matchesSearch =
      e.project.name.toLowerCase().includes(search.toLowerCase()) ||
      e.evaluator.name.toLowerCase().includes(search.toLowerCase())
    const matchesProject = projectFilter === 'all' || e.project.id === projectFilter
    return matchesSearch && matchesProject
  })

  const totalEvals = filtered.length
  const submittedCount = filtered.filter((e) => !e.isDraft).length
  const draftCount = filtered.filter((e) => e.isDraft).length
  const avgScore =
    submittedCount > 0
      ? filtered
          .filter((e) => !e.isDraft)
          .reduce((sum, e) => sum + e.totalScore, 0) / submittedCount
      : 0

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (isDraft: boolean) => {
    if (isDraft) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <FileText className="mr-1 h-3 w-3" />
          Borrador
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
        <Send className="mr-1 h-3 w-3" />
        Enviado
      </Badge>
    )
  }

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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-emerald-600" />
            {isEvaluator ? 'Mis Evaluaciones' : 'Evaluaciones'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEvaluator
              ? 'Gestiona y completa tus evaluaciones asignadas'
              : 'Vista general de todas las evaluaciones'}
          </p>
        </div>
        {isEvaluator && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Evaluación
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEvals}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftCount}</p>
                <p className="text-xs text-muted-foreground">Borradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submittedCount}</p>
                <p className="text-xs text-muted-foreground">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Puntaje Prom.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por proyecto o evaluador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'draft' | 'submitted')}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="submitted">Enviados</SelectItem>
            </SelectContent>
          </Select>
          {uniqueProjects.length > 1 && (
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {uniqueProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">Sin evaluaciones</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isEvaluator
                ? 'No tienes evaluaciones aún. Crea una nueva evaluación para comenzar.'
                : 'No se encontraron evaluaciones con los filtros seleccionados.'}
            </p>
          </CardContent>
        </Card>
      ) : isAdmin ? (
        /* ADMIN: Table view */
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Todas las Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Evaluador</TableHead>
                  <TableHead className="text-center">Puntaje</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((evaluation, i) => (
                  <motion.tr
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate('evaluation-detail', { id: evaluation.id })}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{evaluation.project.name}</p>
                        <p className="text-xs text-muted-foreground">{evaluation.project.category?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{evaluation.evaluator.name}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-sm">{Math.round(evaluation.totalScore)}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(evaluation.isDraft)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(evaluation.isDraft ? evaluation.updatedAt : (evaluation.submittedAt || evaluation.updatedAt))}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <AlertDialog open={deletingId === evaluation.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeletingId(evaluation.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvaluation(evaluation.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* EVALUATOR / PARTICIPANT: Card view */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((evaluation, i) => (
            <motion.div
              key={evaluation.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-all hover:border-emerald-300 dark:hover:border-emerald-700"
                onClick={() => navigate('evaluation-detail', { id: evaluation.id })}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{evaluation.project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {evaluation.project.category?.name}
                      </p>
                    </div>
                    <ScoreCircle score={evaluation.totalScore} size={52} strokeWidth={4} showLabel />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {getStatusBadge(evaluation.isDraft)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(evaluation.isDraft ? evaluation.updatedAt : (evaluation.submittedAt || evaluation.updatedAt))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <EvaluationCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={fetchEvaluations}
      />
    </motion.div>
  )
}
