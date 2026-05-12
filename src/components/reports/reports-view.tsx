'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Medal,
  Download,
  FileSpreadsheet,
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Star,
  Filter,
  Loader2,
  TrendingUp,
  Target,
  Award,
  Crown,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
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
  Legend,
} from 'recharts'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { apiFetch } from '@/lib/api'

// ─── Type Definitions ───────────────────────────────────────────────

interface RankingItem {
  rank: number
  project: {
    id: string
    name: string
    pitch: string
    status: string
    totalScore: number
    averageScore: number
    team: string
    area: { id: string; name: string }
    category: { id: string; name: string }
    institution: { id: string; name: string }
    owner: { id: string; name: string; email: string }
  }
  evaluationCount: number
  evaluations: Array<{
    id: string
    evaluator: { id: string; name: string; email: string }
    totalScore: number
    comments: string | null
    submittedAt: string | null
    scores: Array<{
      criteriaId: string
      criteriaName: string
      score: number
      maxScore: number
      observation: string | null
    }>
  }>
}

interface CategoryStats {
  categoryId: string
  categoryName: string
  totalProjects: number
  statusBreakdown: Record<string, number>
  averageScore: number
  highestScore: number
  lowestScore: number
}

interface AreaStats {
  areaId: string
  areaName: string
  totalProjects: number
  statusBreakdown: Record<string, number>
  averageScore: number
  highestScore: number
  lowestScore: number
}

interface EvaluatorStats {
  evaluatorId: string
  evaluatorName: string
  evaluatorEmail: string
  totalAssigned: number
  totalEvaluations: number
  submittedCount: number
  draftCount: number
  pendingCount: number
  averageScore: number
  averageTimeMs: number
  averageTimeDays: number
}

interface RefItem {
  id: string
  name: string
}

// ─── Constants ──────────────────────────────────────────────────────

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
  FINALIST: 'bg-violet-500',
  WINNER: 'bg-yellow-500',
}

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

const RANK_STYLES: Record<number, { bg: string; text: string; border: string; icon: string }> = {
  1: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    icon: '🥇',
  },
  2: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    text: 'text-gray-600 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
    icon: '🥈',
  },
  3: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    icon: '🥉',
  },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

// ─── Helper: CSV Export ─────────────────────────────────────────────

function exportToCSV(data: RankingItem[], filename: string) {
  const headers = [
    '#',
    'Nombre del Proyecto',
    'Equipo',
    'Área',
    'Categoría',
    'Puntaje Promedio',
    'Puntaje Total',
    'Estado',
    'Evaluaciones',
    'Propietario',
  ]

  const rows = data.map((r) => [
    r.rank,
    `"${r.project.name.replace(/"/g, '""')}"`,
    `"${(r.project as Record<string, unknown>).team || ''}"`,
    r.project.area?.name || '',
    r.project.category?.name || '',
    r.project.averageScore.toFixed(2),
    r.project.totalScore.toFixed(2),
    STATUS_LABELS[r.project.status] || r.project.status,
    r.evaluationCount,
    r.project.owner?.name || '',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Skeleton Components ────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="py-4">
          <CardHeader className="pb-0 pt-0">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-7 w-12 mt-2" />
            <Skeleton className="h-3 w-20 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Tab 1: Ranking General ─────────────────────────────────────────

function RankingTab() {
  const { user } = useAuthStore()
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<RefItem[]>([])
  const [areas, setAreas] = useState<RefItem[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterArea, setFilterArea] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    async function loadRef() {
      try {
        const [catData, areaData] = await Promise.all([
          apiFetch<RefItem[]>('/api/ref/categories'),
          apiFetch<RefItem[]>('/api/ref/areas'),
        ])
        setCategories(catData)
        setAreas(areaData)
      } catch {
        // silently fail
      }
    }
    loadRef()
  }, [])

  const loadRanking = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('categoryId', filterCategory)
      if (filterArea !== 'all') params.set('areaId', filterArea)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const qs = params.toString()
      const data = await apiFetch<RankingItem[]>(
        `/api/reports/ranking${qs ? '?' + qs : ''}`
      )
      setRanking(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [filterCategory, filterArea, filterStatus])

  useEffect(() => {
    loadRanking()
  }, [loadRanking])

  const handleExportCSV = () => {
    exportToCSV(ranking, 'ranking-proyectos.csv')
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtros:</span>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-48" size="sm">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44" size="sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" disabled>
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Exportar Excel
          </Button>
        </div>
      </motion.div>

      {/* Ranking Table */}
      <motion.div variants={item}>
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <TableSkeleton />
            </CardContent>
          </Card>
        ) : ranking.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Sin datos</h3>
                <p className="text-sm text-muted-foreground">
                  No se encontraron proyectos con evaluaciones completadas para los filtros seleccionados.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Ranking General de Proyectos</CardTitle>
              <CardDescription>
                {ranking.length} proyecto{ranking.length !== 1 ? 's' : ''} evaluado{ranking.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead className="hidden md:table-cell">Equipo</TableHead>
                      <TableHead className="hidden sm:table-cell">Área</TableHead>
                      <TableHead className="hidden lg:table-cell">Categoría</TableHead>
                      <TableHead>Puntaje</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranking.map((r) => {
                      const style = RANK_STYLES[r.rank]
                      return (
                        <TableRow
                          key={r.project.id}
                          className={style ? `${style.bg} ${style.border} border-l-4` : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {style ? (
                                <span className="text-base">{style.icon}</span>
                              ) : (
                                <span className="text-sm font-bold text-muted-foreground">
                                  {r.rank}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[200px]">
                                {r.project.name}
                              </p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {r.project.team || r.project.owner?.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm truncate max-w-[120px] block">
                              {(r.project as Record<string, unknown>).team || r.project.owner?.name || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-sm">{r.project.area?.name || '-'}</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-sm">{r.project.category?.name || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <div className="min-w-[120px]">
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className={`text-sm font-bold ${
                                    style ? style.text : 'text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  {r.project.averageScore.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">/100</span>
                              </div>
                              <Progress
                                value={Math.min(r.project.averageScore, 100)}
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[r.project.status] || 'bg-gray-400'} mr-1.5`}
                              />
                              {STATUS_LABELS[r.project.status] || r.project.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Tab 2: Por Categoría ───────────────────────────────────────────

function CategoryTab() {
  const [data, setData] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await apiFetch<CategoryStats[]>('/api/reports/by-category')
        setData(result)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const barChartData = data.map((c) => ({
    name: c.categoryName.length > 20 ? c.categoryName.substring(0, 20) + '...' : c.categoryName,
    fullName: c.categoryName,
    proyectos: c.totalProjects,
    puntaje: Math.round(c.averageScore * 10) / 10,
  }))

  const barChartConfig: ChartConfig = {
    proyectos: { label: 'Proyectos', color: 'var(--color-chart-1)' },
    puntaje: { label: 'Puntaje Promedio', color: 'var(--color-chart-3)' },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Category Cards */}
      {loading ? (
        <CardsSkeleton count={4} />
      ) : (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((cat, i) => (
            <Card key={cat.categoryId} className="py-4 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: `hsl(${155 + i * 25}, 60%, 45%)` }}
              />
              <CardHeader className="pb-0 pt-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {cat.categoryName}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold">{cat.totalProjects}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    Puntaje: {cat.averageScore.toFixed(1)} | Max: {cat.highestScore.toFixed(1)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Proyectos por Categoría</CardTitle>
                <CardDescription>Cantidad de proyectos en cada categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="proyectos"
                      fill="var(--color-proyectos)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Puntaje Promedio por Categoría</CardTitle>
                <CardDescription>Rendimiento comparado entre categorías</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="puntaje"
                      fill="var(--color-puntaje)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Tab 3: Por Área ────────────────────────────────────────────────

function AreaTab() {
  const [data, setData] = useState<AreaStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await apiFetch<AreaStats[]>('/api/reports/by-area')
        setData(result)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const horizontalBarData = data.map((a) => ({
    name: a.areaName.length > 18 ? a.areaName.substring(0, 18) + '...' : a.areaName,
    fullName: a.areaName,
    proyectos: a.totalProjects,
  }))

  const pieData = data.map((a) => ({
    name: a.areaName,
    value: a.totalProjects,
  }))

  const areaBarConfig: ChartConfig = {
    proyectos: { label: 'Proyectos', color: 'var(--color-chart-2)' },
  }

  const pieConfig: ChartConfig = {
    value: { label: 'Proyectos' },
    ...Object.fromEntries(
      data.map((a, i) => [
        a.areaName,
        { label: a.areaName, color: CHART_COLORS[i % CHART_COLORS.length] },
      ])
    ),
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Area Cards */}
      {loading ? (
        <CardsSkeleton count={7} />
      ) : (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((area, i) => (
            <Card key={area.areaId} className="py-4 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: `hsl(${165 + i * 20}, 55%, 42%)` }}
              />
              <CardHeader className="pb-0 pt-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {area.areaName}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-bold">{area.totalProjects}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-teal-500" />
                  <p className="text-xs text-muted-foreground">
                    Puntaje: {area.averageScore.toFixed(1)} | Max: {area.highestScore.toFixed(1)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(area.statusBreakdown).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-[10px] px-1.5 py-0">
                      {STATUS_LABELS[status] || status}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Charts */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Horizontal Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Proyectos por Área</CardTitle>
                <CardDescription>Distribución horizontal de proyectos</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={areaBarConfig} className="h-[320px] w-full">
                  <BarChart
                    data={horizontalBarData}
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
                      width={130}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="proyectos" fill="var(--color-proyectos)" radius={[0, 6, 6, 0]}>
                      {horizontalBarData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Área</CardTitle>
                <CardDescription>Proporción de proyectos por área</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={pieConfig} className="h-[320px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Tab 4: Rendimiento de Evaluadores ──────────────────────────────

function EvaluatorTab() {
  const [data, setData] = useState<EvaluatorStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await apiFetch<EvaluatorStats[]>('/api/reports/evaluator-stats')
        setData(result)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartData = data.map((e) => ({
    name: e.evaluatorName.split(' ')[0],
    fullName: e.evaluatorName,
    puntaje: Math.round(e.averageScore * 10) / 10,
    completadas: e.submittedCount,
    pendientes: e.pendingCount,
  }))

  const chartConfig: ChartConfig = {
    puntaje: { label: 'Puntaje Promedio', color: 'var(--color-chart-1)' },
    completadas: { label: 'Completadas', color: 'var(--color-chart-3)' },
    pendientes: { label: 'Pendientes', color: 'var(--color-chart-5)' },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Evaluator Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Evaluadores</CardTitle>
              <CardDescription>
                {data.length} evaluador{data.length !== 1 ? 'es' : ''} activo{data.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluador</TableHead>
                      <TableHead className="text-center">Asignados</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Completadas</TableHead>
                      <TableHead className="text-center hidden md:table-cell">Borradores</TableHead>
                      <TableHead className="text-center">Pendientes</TableHead>
                      <TableHead className="text-center">Puntaje Prom.</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">Tiempo Prom.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((ev) => (
                      <TableRow key={ev.evaluatorId}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{ev.evaluatorName}</p>
                            <p className="text-xs text-muted-foreground">{ev.evaluatorEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {ev.totalAssigned}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                            {ev.submittedCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center hidden md:table-cell">
                          <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                            {ev.draftCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`text-xs border-0 ${
                              ev.pendingCount > 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {ev.pendingCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {ev.averageScore.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {ev.averageTimeDays > 0
                              ? `${ev.averageTimeDays}d`
                              : '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay evaluadores activos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bar Chart */}
      <motion.div variants={item}>
        {loading ? (
          <ChartSkeleton />
        ) : data.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Evaluadores</CardTitle>
              <CardDescription>Puntaje promedio otorgado y evaluaciones completadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="puntaje" fill="var(--color-puntaje)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : null}
      </motion.div>
    </motion.div>
  )
}

// ─── Tab 5: Finalistas y Ganadores ──────────────────────────────────

function FinalistsTab() {
  const { user } = useAuthStore()
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<RankingItem[]>('/api/reports/ranking')
        setRanking(data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const finalists = ranking.filter(
    (r) => r.project.status === 'FINALIST' || r.project.status === 'WINNER'
  )
  const winners = ranking.filter((r) => r.project.status === 'WINNER')
  const top3 = ranking.slice(0, 3)

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Acceso Restringido</h3>
          <p className="text-sm text-muted-foreground">
            Solo los administradores pueden ver esta sección.
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Podium */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Podio - Top 3
            </CardTitle>
            <CardDescription>Los tres proyectos mejor evaluados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-end justify-center gap-4 pt-8">
                {[
                  { h: 140, label: '2do' },
                  { h: 180, label: '1ro' },
                  { h: 100, label: '3ro' },
                ].map((p, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className={`w-24 rounded-t-lg`} style={{ height: p.h * 0.4 }} />
                  </div>
                ))}
              </div>
            ) : top3.length > 0 ? (
              <div className="flex items-end justify-center gap-3 sm:gap-6 pt-8 pb-4">
                {/* 2nd Place - Left */}
                {top3[1] && (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                      <Medal className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-xs font-medium text-center max-w-[100px] truncate mb-1">
                      {top3[1].project.name}
                    </p>
                    <p className="text-lg font-bold text-gray-500 mb-2">
                      {top3[1].project.averageScore.toFixed(1)}
                    </p>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 140 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="w-24 sm:w-32 rounded-t-lg bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500 flex items-start justify-center pt-3"
                    >
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">2do</span>
                    </motion.div>
                  </div>
                )}

                {/* 1st Place - Center */}
                {top3[0] && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-2">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-xs font-medium text-center max-w-[120px] truncate mb-1">
                      {top3[0].project.name}
                    </p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                      {top3[0].project.averageScore.toFixed(1)}
                    </p>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 180 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="w-28 sm:w-36 rounded-t-lg bg-gradient-to-t from-amber-400 to-amber-300 dark:from-amber-600 dark:to-amber-500 flex items-start justify-center pt-3"
                    >
                      <span className="text-sm font-bold text-amber-900 dark:text-amber-100">1ro</span>
                    </motion.div>
                  </div>
                )}

                {/* 3rd Place - Right */}
                {top3[2] && (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-xs font-medium text-center max-w-[100px] truncate mb-1">
                      {top3[2].project.name}
                    </p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {top3[2].project.averageScore.toFixed(1)}
                    </p>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 100 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="w-24 sm:w-32 rounded-t-lg bg-gradient-to-t from-orange-400 to-orange-300 dark:from-orange-700 dark:to-orange-600 flex items-start justify-center pt-3"
                    >
                      <span className="text-sm font-bold text-orange-900 dark:text-orange-100">3ro</span>
                    </motion.div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Aún no hay proyectos evaluados para mostrar el podio
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Winners */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Ganadores
            </CardTitle>
            <CardDescription>Proyectos con estatus de ganador</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : winners.length > 0 ? (
              <div className="space-y-3">
                {winners.map((w, i) => (
                  <motion.div
                    key={w.project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{w.project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.project.area?.name} · {w.project.category?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {w.project.averageScore.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {w.evaluationCount} eval.
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay ganadores registrados aún
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Finalists List */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-violet-500" />
              Finalistas
            </CardTitle>
            <CardDescription>Proyectos con estatus de finalista</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : finalists.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {finalists.map((f, i) => (
                  <motion.div
                    key={f.project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800"
                  >
                    <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.project.area?.name} · {f.project.category?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400">
                        {f.project.averageScore.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {f.evaluationCount} eval.
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] border-0 ${
                        f.project.status === 'WINNER'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                      }`}
                    >
                      {f.project.status === 'WINNER' ? '🏆 Ganador' : 'Finalista'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No hay finalistas registrados aún
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Reports View ──────────────────────────────────────────────

export function ReportsView() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          Reportes y Análisis
        </h1>
        <p className="text-muted-foreground mt-1">
          Estadísticas detalladas y métricas de rendimiento de la Fábrica de Ideas.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ranking" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ranking" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Ranking General
          </TabsTrigger>
          <TabsTrigger value="category" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Por Categoría
          </TabsTrigger>
          <TabsTrigger value="area" className="gap-1.5">
            <PieChartIcon className="h-3.5 w-3.5" />
            Por Área
          </TabsTrigger>
          <TabsTrigger value="evaluators" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Evaluadores
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="finalists" className="gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              Finalistas
            </TabsTrigger>
          )}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="ranking">
            <RankingTab />
          </TabsContent>
          <TabsContent value="category">
            <CategoryTab />
          </TabsContent>
          <TabsContent value="area">
            <AreaTab />
          </TabsContent>
          <TabsContent value="evaluators">
            <EvaluatorTab />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="finalists">
              <FinalistsTab />
            </TabsContent>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  )
}
