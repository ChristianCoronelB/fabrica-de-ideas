'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  Clock,
  BarChart3,
  ArrowRight,
  FileText,
  CheckCircle2,
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
  status: string
  pitch: string
  area: { id: string; name: string }
  category: { id: string; name: string }
  owner: { id: string; name: string; email: string }
  evaluators: Array<{ evaluatorId: string; evaluator: { id: string; name: string } }>
  _count: { evaluations: number; attachments: number }
}

interface EvaluationItem {
  id: string
  projectId: string
  evaluatorId: string
  isDraft: boolean
  totalScore: number
  createdAt: string
  submittedAt: string | null
  project: {
    id: string
    name: string
    status: string
    category: { id: string; name: string }
  }
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

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
  FINALIST: 'default',
  WINNER: 'default',
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

function KPICardSkeleton() {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-8 w-16 mt-2" />
        <Skeleton className="h-3 w-20 mt-2" />
      </CardContent>
    </Card>
  )
}

export function EvaluatorDashboard() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, evaluationsData] = await Promise.all([
          apiFetch<{ projects: ProjectItem[]; total: number }>('/api/projects?limit=50'),
          apiFetch<EvaluationItem[]>('/api/evaluations'),
        ])
        setProjects(projectsData.projects || [])
        setEvaluations(evaluationsData || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Evaluador'

  // Calculate KPIs
  const assignedCount = projects.length
  const pendingEvals = evaluations.filter((e) => e.isDraft).length
  const completedEvals = evaluations.filter((e) => !e.isDraft)
  const avgScore =
    completedEvals.length > 0
      ? completedEvals.reduce((sum, e) => sum + e.totalScore, 0) / completedEvals.length
      : 0

  const kpiCards = [
    {
      title: 'Proyectos Asignados',
      value: assignedCount,
      icon: ClipboardCheck,
      trend: `${pendingEvals} pendientes por evaluar`,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Evaluaciones Pendientes',
      value: pendingEvals,
      icon: Clock,
      trend: 'En progreso',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Promedio Evaluado',
      value: avgScore.toFixed(1),
      icon: BarChart3,
      trend: `${completedEvals.length} evaluaciones completadas`,
      gradient: 'from-teal-500 to-cyan-500',
    },
  ]

  // Projects that don't have a submitted evaluation yet
  const pendingProjects = projects.filter((p) => {
    const projectEvals = evaluations.filter((e) => e.projectId === p.id)
    return projectEvals.length === 0 || projectEvals.some((e) => e.isDraft)
  })

  // Recent evaluations (last 5, completed)
  const recentEvals = completedEvals.slice(0, 5)

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
          Aquí tienes un resumen de tus evaluaciones y proyectos asignados.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={item}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <KPICardSkeleton key={i} />
            ))
          : kpiCards.map((card) => (
              <Card key={card.title} className="py-4 relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${card.gradient}`}
                />
                <CardHeader className="pb-0 pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <div
                      className={`h-9 w-9 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}
                    >
                      <card.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
      </motion.div>

      {/* Two-column layout */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Proyectos Asignados</CardTitle>
              <CardDescription>
                {pendingProjects.length} requieren tu evaluación
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('projects')}
              className="gap-1"
            >
              Ver todos
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tienes proyectos asignados aún
              </div>
            ) : (
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {projects.slice(0, 8).map((project, index) => {
                  const projectEvals = evaluations.filter(
                    (e) => e.projectId === project.id
                  )
                  const hasDraft = projectEvals.some((e) => e.isDraft)
                  const hasCompleted = projectEvals.some((e) => !e.isDraft)
                  const evalStatus = hasCompleted
                    ? 'Completada'
                    : hasDraft
                      ? 'En progreso'
                      : 'Pendiente'

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() =>
                        navigate('project-detail', { id: project.id })
                      }
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.area?.name} · {project.category?.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          variant={
                            STATUS_VARIANTS[project.status] || 'outline'
                          }
                          className="text-xs"
                        >
                          {STATUS_LABELS[project.status] || project.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {hasCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          ) : hasDraft ? (
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                          {evalStatus}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Evaluations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Evaluaciones Recientes</CardTitle>
              <CardDescription>
                Tus últimas evaluaciones completadas
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('evaluations')}
              className="gap-1"
            >
              Ver todas
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : recentEvals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aún no has completado evaluaciones
              </div>
            ) : (
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {recentEvals.map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                    onClick={() =>
                      navigate('evaluation-detail', { id: evaluation.id })
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {evaluation.project?.name}
                      </p>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {evaluation.totalScore.toFixed(1)} pts
                      </span>
                    </div>
                    <Progress
                      value={Math.min(evaluation.totalScore, 100)}
                      className="h-2 mb-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      {evaluation.project?.category?.name}
                      {evaluation.submittedAt &&
                        ` · Enviada ${new Date(evaluation.submittedAt).toLocaleDateString('es')}`}
                    </p>
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
              Inicia o continúa evaluaciones rápidamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-3">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
            ) : pendingProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tienes evaluaciones pendientes. ¡Buen trabajo!
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {pendingProjects.slice(0, 3).map((project) => {
                  const existingEval = evaluations.find(
                    (e) => e.projectId === project.id && e.isDraft
                  )
                  return (
                    <Button
                      key={project.id}
                      variant={existingEval ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (existingEval) {
                          navigate('evaluation-detail', {
                            id: existingEval.id,
                          })
                        } else {
                          navigate('project-detail', { id: project.id })
                        }
                      }}
                      className="gap-2"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      {existingEval ? 'Continuar' : 'Iniciar'} Evaluación: {project.name.length > 20 ? project.name.substring(0, 20) + '…' : project.name}
                    </Button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
