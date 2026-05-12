'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  Pencil,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare,
  Trophy,
  AlertCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { apiFetch } from '@/lib/api'

interface ProjectItem {
  id: string
  name: string
  pitch: string
  description: string
  team: string
  status: string
  averageScore: number
  totalScore: number
  area: { id: string; name: string }
  category: { id: string; name: string }
  institution: { id: string; name: string }
  owner: { id: string; name: string; email: string }
  evaluators: Array<{
    evaluatorId: string
    evaluator: { id: string; name: string; email: string }
  }>
  _count: { evaluations: number; attachments: number }
}

interface EvaluationItem {
  id: string
  projectId: string
  evaluatorId: string
  isDraft: boolean
  totalScore: number
  comments: string | null
  createdAt: string
  submittedAt: string | null
  evaluator: { id: string; name: string; email: string }
  scores: Array<{
    id: string
    criteriaId: string
    score: number
    maxScore: number
    criteria: { id: string; name: string; weight: number }
  }>
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  FINALIST: 'Finalista',
  WINNER: 'Ganador',
}

const STATUS_DESCRIPTIONS: Record<string, string> = {
  DRAFT: 'Tu proyecto está en edición. Puedes modificarlo antes de enviarlo.',
  SUBMITTED: 'Tu proyecto ha sido enviado y está en revisión.',
  APPROVED: '¡Tu proyecto ha sido aprobado! Continuará al siguiente proceso.',
  REJECTED: 'Tu proyecto no fue aprobado. Puedes revisar las observaciones.',
  FINALIST: '¡Felicidades! Tu proyecto es finalista.',
  WINNER: '¡Felicidades! Tu proyecto es ganador.',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-gray-600 dark:text-gray-400',
  SUBMITTED: 'text-amber-600 dark:text-amber-400',
  APPROVED: 'text-emerald-600 dark:text-emerald-400',
  REJECTED: 'text-red-600 dark:text-red-400',
  FINALIST: 'text-teal-600 dark:text-teal-400',
  WINNER: 'text-yellow-600 dark:text-yellow-400',
}

const STATUS_BG: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800',
  SUBMITTED: 'bg-amber-100 dark:bg-amber-900/30',
  APPROVED: 'bg-emerald-100 dark:bg-emerald-900/30',
  REJECTED: 'bg-red-100 dark:bg-red-900/30',
  FINALIST: 'bg-teal-100 dark:bg-teal-900/30',
  WINNER: 'bg-yellow-100 dark:bg-yellow-900/30',
}

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  DRAFT: Pencil,
  SUBMITTED: Clock,
  APPROVED: CheckCircle2,
  REJECTED: AlertCircle,
  FINALIST: Trophy,
  WINNER: Trophy,
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function ParticipantDashboard() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()
  const [project, setProject] = useState<ProjectItem | null>(null)
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const projectsData = await apiFetch<{
          projects: ProjectItem[]
          total: number
        }>('/api/projects?limit=10')
        const myProject = projectsData.projects?.[0] || null
        setProject(myProject)

        if (myProject) {
          try {
            const evalsData = await apiFetch<EvaluationItem[]>(
              `/api/evaluations?projectId=${myProject.id}`
            )
            setEvaluations(evalsData || [])
          } catch {
            // May fail if not admin/evaluator - that's ok
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Participante'
  const statusIcon = project
    ? STATUS_ICONS[project.status] || AlertCircle
    : AlertCircle
  const StatusIcon = statusIcon

  const completedEvals = evaluations.filter((e) => !e.isDraft)
  const allObservations = completedEvals.filter((e) => e.comments)

  // Score display
  const scoreValue = project?.averageScore || 0
  const scorePercent = Math.min(scoreValue, 100)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">
          ¡Bienvenido, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí puedes ver el estado de tu proyecto y las evaluaciones recibidas.
        </p>
      </motion.div>

      {/* Project Status Card */}
      <motion.div variants={item}>
        {loading ? (
          <Card className="py-4">
            <CardContent className="pt-0">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !project ? (
          <Card className="py-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-0">
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FolderKanban className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Aún no tienes un proyecto
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comienza creando tu proyecto de innovación
                </p>
                <Button
                  onClick={() => navigate('project-new')}
                  className="gap-2"
                >
                  <FolderKanban className="h-4 w-4" />
                  Crear Proyecto
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="py-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-0">
              <div className="flex items-start gap-4">
                <div
                  className={`h-16 w-16 rounded-2xl ${STATUS_BG[project.status] || 'bg-muted'} flex items-center justify-center shrink-0`}
                >
                  <StatusIcon
                    className={`h-8 w-8 ${STATUS_COLORS[project.status] || 'text-muted-foreground'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold truncate">
                      {project.name}
                    </h2>
                    <Badge
                      variant={
                        project.status === 'APPROVED' ||
                        project.status === 'WINNER' ||
                        project.status === 'FINALIST'
                          ? 'default'
                          : project.status === 'REJECTED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {STATUS_LABELS[project.status] || project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.area?.name} · {project.category?.name}
                    {project.institution && ` · ${project.institution.name}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {STATUS_DESCRIPTIONS[project.status] || ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Two-column layout */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Project Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mi Proyecto</CardTitle>
              <CardDescription>Detalles de tu proyecto</CardDescription>
            </div>
            {project && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate('project-detail', { id: project.id })
                }
                className="gap-1"
              >
                <Pencil className="h-3 w-3" />
                Editar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            ) : !project ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No hay proyecto para mostrar
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Nombre</span>
                  <span className="text-sm font-medium text-right max-w-[60%] truncate">
                    {project.name}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Pitch</span>
                  <span className="text-sm font-medium text-right max-w-[60%] line-clamp-2">
                    {project.pitch}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Equipo</span>
                  <span className="text-sm font-medium text-right max-w-[60%] truncate">
                    {project.team}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Área</span>
                  <span className="text-sm font-medium">
                    {project.area?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categoría</span>
                  <span className="text-sm font-medium">
                    {project.category?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Evaluadores</span>
                  <span className="text-sm font-medium">
                    {project.evaluators?.length || 0} asignados
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Evaluaciones
                  </span>
                  <span className="text-sm font-medium">
                    {completedEvals.length} completadas
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Display */}
        <Card>
          <CardHeader>
            <CardTitle>Puntaje Obtenido</CardTitle>
            <CardDescription>
              Promedio de evaluaciones completadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-4 w-24 mt-4" />
              </div>
            ) : !project || completedEvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <div className="h-32 w-32 rounded-full border-4 border-dashed border-muted flex items-center justify-center">
                  <span className="text-2xl font-bold">—</span>
                </div>
                <p className="text-sm mt-4">
                  Aún no hay evaluaciones completadas
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative h-36 w-36">
                  {/* Circular progress background */}
                  <svg
                    className="h-36 w-36 -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/30"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(scorePercent / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                      strokeLinecap="round"
                      className="text-emerald-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tracking-tight">
                      {scoreValue.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">de 100</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {completedEvals.length} evaluación{completedEvals.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>

                {/* Individual evaluation scores */}
                {completedEvals.length > 0 && (
                  <div className="w-full mt-4 space-y-2">
                    {completedEvals.map((evaluation) => (
                      <div
                        key={evaluation.id}
                        className="flex items-center gap-2"
                      >
                        <span className="text-xs text-muted-foreground w-20 truncate">
                          {evaluation.evaluator?.name?.split(' ')[0] || 'Evaluador'}
                        </span>
                        <Progress
                          value={Math.min(evaluation.totalScore, 100)}
                          className="h-2 flex-1"
                        />
                        <span className="text-xs font-medium w-10 text-right">
                          {evaluation.totalScore.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Observations */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Observaciones
            </CardTitle>
            <CardDescription>
              Comentarios de los evaluadores sobre tu proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : allObservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay observaciones disponibles aún
              </div>
            ) : (
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {allObservations.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="py-3 border-b last:border-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {evaluation.evaluator?.name
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || '?'}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {evaluation.evaluator?.name || 'Evaluador'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {evaluation.submittedAt
                          ? new Date(evaluation.submittedAt).toLocaleDateString(
                              'es'
                            )
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 pl-9">
                      {evaluation.comments}
                    </p>
                    <div className="flex items-center gap-1 mt-1 pl-9">
                      <span className="text-xs text-muted-foreground">
                        Puntaje:
                      </span>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {evaluation.totalScore.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tu proyecto rápidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {project && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate('project-detail', { id: project.id })
                      }
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar Proyecto
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate('project-detail', { id: project.id })
                      }
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Subir Documento
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('evaluations')}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Ver Evaluaciones
                    </Button>
                  </>
                )}
                {!project && (
                  <Button
                    onClick={() => navigate('project-new')}
                    className="gap-2"
                  >
                    <FolderKanban className="h-4 w-4" />
                    Crear Proyecto
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
