'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderKanban,
  Users,
  ClipboardCheck,
  Trophy,
  TrendingUp,
  Clock,
  ArrowRight,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { apiFetch } from '@/lib/api'

interface AdminStats {
  totalProjects: number
  projectsByStatus: Record<string, number>
  projectsByCategory: Array<{
    categoryId: string
    categoryName: string
    count: number
  }>
  projectsByArea: Array<{
    areaId: string
    areaName: string
    count: number
  }>
  activeEvaluators: number
  totalUsers: number
  totalEvaluations: number
  pendingEvaluations: number
  averageScore: number
  topProjects: Array<{
    id: string
    name: string
    averageScore: number
    totalScore: number
    status: string
    area: { name: string }
    category: { name: string }
    owner: { name: string }
  }>
  recentProjects: Array<{
    id: string
    name: string
    status: string
    createdAt: string
    area: { name: string }
    category: { name: string }
    owner: { name: string }
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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-400',
  SUBMITTED: 'bg-amber-500',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
  FINALIST: 'bg-teal-500',
  WINNER: 'bg-yellow-500',
}

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

const statusChartConfig: ChartConfig = {
  count: { label: 'Proyectos' },
  DRAFT: { label: 'Borrador', color: 'var(--color-chart-3)' },
  SUBMITTED: { label: 'Enviado', color: 'var(--color-chart-5)' },
  APPROVED: { label: 'Aprobado', color: 'var(--color-chart-1)' },
  REJECTED: { label: 'Rechazado', color: 'var(--color-chart-2)' },
  FINALIST: { label: 'Finalista', color: 'var(--color-chart-4)' },
  WINNER: { label: 'Ganador', color: 'var(--color-chart-1)' },
}

const categoryChartConfig: ChartConfig = {
  count: { label: 'Proyectos' },
}

const areaChartConfig: ChartConfig = {
  count: { label: 'Proyectos' },
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
          <Skeleton className="h-4 w-24" />
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

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await apiFetch<AdminStats>('/api/admin/stats')
        setStats(data)
      } catch {
        // silently fail, keep loading state
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Admin'

  // Prepare chart data
  const statusData = stats
    ? Object.entries(stats.projectsByStatus).map(([status, count]) => ({
        status,
        label: STATUS_LABELS[status] || status,
        count,
        fill: `var(--color-${status})`,
      }))
    : []

  const categoryData = stats
    ? stats.projectsByCategory.map((c, i) => ({
        name: c.categoryName,
        count: c.count,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : []

  const areaData = stats
    ? stats.projectsByArea.map((a, i) => ({
        name: a.areaName.length > 15 ? a.areaName.substring(0, 15) + '…' : a.areaName,
        fullName: a.areaName,
        count: a.count,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : []

  const completedEvaluations = stats
    ? stats.totalEvaluations - stats.pendingEvaluations
    : 0

  const finalistCount = stats?.projectsByStatus?.FINALIST ?? 0
  const winnerCount = stats?.projectsByStatus?.WINNER ?? 0
  const finalistOrWinner = finalistCount + winnerCount

  const kpiCards = [
    {
      title: 'Total Proyectos',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      trend: `${stats?.projectsByStatus?.SUBMITTED ?? 0} enviados`,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Evaluadores Activos',
      value: stats?.activeEvaluators ?? 0,
      icon: Users,
      trend: `${stats?.totalUsers ?? 0} usuarios totales`,
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      title: 'Evaluaciones Completadas',
      value: completedEvaluations,
      icon: ClipboardCheck,
      trend: `${stats?.pendingEvaluations ?? 0} pendientes`,
      gradient: 'from-cyan-500 to-emerald-500',
    },
    {
      title: 'Proyectos Finalistas',
      value: finalistOrWinner,
      icon: Trophy,
      trend: `${winnerCount} ganadores`,
      gradient: 'from-amber-500 to-yellow-500',
    },
  ]

  // Build category chart config dynamically
  const dynamicCategoryConfig: ChartConfig = {
    count: { label: 'Proyectos' },
    ...Object.fromEntries(
      categoryData.map((c, i) => [
        c.name,
        { label: c.name, color: CHART_COLORS[i % CHART_COLORS.length] },
      ])
    ),
  }

  const dynamicAreaConfig: ChartConfig = {
    count: { label: 'Proyectos' },
    ...Object.fromEntries(
      areaData.map((a, i) => [
        a.name,
        { label: a.fullName, color: CHART_COLORS[i % CHART_COLORS.length] },
      ])
    ),
  }

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
          Aquí tienes un resumen general de la Fábrica de Ideas.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={item}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)
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
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <p className="text-xs text-muted-foreground">{card.trend}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div
        variants={item}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Projects by Status */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Proyectos por Estado</CardTitle>
              <CardDescription>
                Distribución actual de proyectos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={statusChartConfig} className="h-[280px] w-full">
                <BarChart
                  data={statusData}
                  layout="horizontal"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Projects by Category - Pie Chart */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Proyectos por Categoría</CardTitle>
              <CardDescription>
                Distribución por tipo de emprendimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={dynamicCategoryConfig}
                className="h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Area Chart + Top Projects */}
      <motion.div
        variants={item}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Projects by Area */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Proyectos por Área</CardTitle>
              <CardDescription>
                Distribución por área de innovación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={dynamicAreaConfig} className="h-[280px] w-full">
                <BarChart
                  data={areaData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {areaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Top 5 Projects */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Proyectos</CardTitle>
              <CardDescription>
                Mejor puntuados por evaluadores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.topProjects.slice(0, 5).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium truncate">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {STATUS_LABELS[project.status] || project.status}
                      </Badge>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {project.averageScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0" />
                    <Progress
                      value={Math.min(project.averageScore, 100)}
                      className="h-2"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">
                    {project.area?.name} · {project.category?.name} · {project.owner?.name}
                  </p>
                </motion.div>
              ))}
              {(!stats?.topProjects || stats.topProjects.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aún no hay proyectos evaluados
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimos proyectos registrados
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
              <div className="space-y-0">
                {stats?.recentProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.3 }}
                    className="flex items-center gap-3 py-3 border-b last:border-0"
                  >
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-muted shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.owner?.name} · {project.area?.name} · {project.category?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`h-2 w-2 rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-400'}`}
                      />
                      <Badge variant="outline" className="text-xs">
                        {STATUS_LABELS[project.status] || project.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {(!stats?.recentProjects || stats.recentProjects.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}
