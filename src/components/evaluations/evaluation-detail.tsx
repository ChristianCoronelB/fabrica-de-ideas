'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Send,
  Info,
  Loader2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Trophy,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { useNavStore } from '@/store/nav-store'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ScoreCircle } from './score-circle'

/* ── Types ─────────────────────────────────────────── */

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

/* ── Helpers ───────────────────────────────────────── */

function getScoreColorClass(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 85) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 70) return 'text-green-600 dark:text-green-400'
  if (pct >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBgClass(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 85) return 'bg-emerald-500'
  if (pct >= 70) return 'bg-green-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getSliderTrackClass(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  if (pct >= 85) return '[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500'
  if (pct >= 70) return '[&_[data-slot=slider-range]]:bg-green-500 [&_[data-slot=slider-thumb]]:border-green-500'
  if (pct >= 50) return '[&_[data-slot=slider-range]]:bg-yellow-500 [&_[data-slot=slider-thumb]]:border-yellow-500'
  return '[&_[data-slot=slider-range]]:bg-red-500 [&_[data-slot=slider-thumb]]:border-red-500'
}

function isSpecialCategory(categoryName: string | undefined): boolean {
  return categoryName === 'Emprendimiento Escolar' || categoryName === 'Poster de Emprendimiento'
}

/* ── Criterion Card ────────────────────────────────── */

function CriterionCard({
  scoreEntry,
  isOptional,
  isDisabled,
  onScoreChange,
  onObservationChange,
}: {
  scoreEntry: EvaluationScore
  isOptional: boolean
  isDisabled: boolean
  onScoreChange: (criteriaId: string, score: number) => void
  onObservationChange: (criteriaId: string, observation: string) => void
}) {
  const { criteria, score, maxScore } = scoreEntry
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  return (
    <Card className={`relative ${isOptional ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CardTitle className="text-sm font-semibold leading-tight">
              {criteria.name}
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <button className="shrink-0 rounded-full p-0.5 hover:bg-accent transition-colors">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-72" align="start">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">{criteria.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {criteria.description}
                  </p>
                  {criteria.evidence && (
                    <div>
                      <p className="text-xs font-medium mt-1">Evidencia esperada:</p>
                      <p className="text-xs text-muted-foreground">{criteria.evidence}</p>
                    </div>
                  )}
                  <div className="pt-1 border-t">
                    <p className="text-xs font-medium">Puntaje máximo: {maxScore} pts</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-[10px]">
              {maxScore} pts
            </Badge>
            {isOptional && (
              <Badge className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 whitespace-nowrap">
                No obligatorio
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display + Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <motion.span
              key={`score-${score}`}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-2xl font-bold tabular-nums ${getScoreColorClass(score, maxScore)}`}
            >
              {score}
            </motion.span>
            <span className="text-xs text-muted-foreground">{pct}% del máximo</span>
          </div>

          <Slider
            value={[score]}
            min={0}
            max={maxScore}
            step={0.5}
            disabled={isDisabled}
            className={getSliderTrackClass(score, maxScore)}
            onValueChange={(val) => onScoreChange(criteriaId, val[0])}
          />

          {/* Progress bar */}
          <Progress
            value={pct}
            className={`h-1.5 ${getScoreBgClass(score, maxScore)}`}
          />
        </div>

        {/* Observation */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Observación
          </label>
          <Textarea
            placeholder="Escribe tus observaciones sobre este criterio..."
            value={scoreEntry.observation || ''}
            disabled={isDisabled}
            onChange={(e) => onObservationChange(criteriaId, e.target.value)}
            className="text-xs min-h-[60px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}

/* ── Summary Panel ─────────────────────────────────── */

function SummaryPanel({
  scores,
  totalScore,
  maxPossible,
  isOptionalCriteria,
}: {
  scores: EvaluationScore[]
  totalScore: number
  maxPossible: number
  isOptionalCriteria: Record<string, boolean>
}) {
  return (
    <div className="space-y-4">
      {/* Main Score Circle */}
      <div className="flex justify-center">
        <ScoreCircle score={totalScore} maxScore={maxPossible} size={140} strokeWidth={10} />
      </div>

      <Separator />

      {/* Criteria Breakdown */}
      <div className="space-y-3">
        {scores.map((s) => {
          const optional = isOptionalCriteria[s.criteriaId]
          const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0
          return (
            <div key={s.criteriaId} className={`space-y-1 ${optional ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate pr-2">{s.criteria.name}</span>
                <span className={`text-xs font-bold tabular-nums shrink-0 ${getScoreColorClass(s.score, s.maxScore)}`}>
                  {s.score}/{s.maxScore}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getScoreBgClass(s.score, s.maxScore)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Component ────────────────────────────────── */

export function EvaluationDetail() {
  const { viewParams, goBack } = useNavStore()
  const { user } = useAuthStore()
  const evaluationId = viewParams.id

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState('')
  const [localScores, setLocalScores] = useState<Record<string, { score: number; observation: string }>>({})

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Fetch ─────────────────────────────────────── */

  const fetchEvaluation = useCallback(async () => {
    if (!evaluationId) return
    setLoading(true)
    try {
      const data = await apiFetch<Evaluation>(`/api/evaluations/${evaluationId}`)
      setEvaluation(data)
      setComments(data.comments || '')
      const scoreMap: Record<string, { score: number; observation: string }> = {}
      for (const s of data.scores) {
        scoreMap[s.criteriaId] = {
          score: s.score,
          observation: s.observation || '',
        }
      }
      setLocalScores(scoreMap)
    } catch {
      // handled by apiFetch
    } finally {
      setLoading(false)
    }
  }, [evaluationId])

  useEffect(() => {
    fetchEvaluation()
  }, [fetchEvaluation])

  /* ── Computed ──────────────────────────────────── */

  const isSpecial = isSpecialCategory(evaluation?.project?.category?.name)
  const isDisabled = evaluation ? !evaluation.isDraft && user?.role !== 'ADMIN' : true

  const isOptionalCriteria: Record<string, boolean> = {}
  let maxPossible = 0

  if (evaluation) {
    for (const s of evaluation.scores) {
      const optional = isSpecial && s.criteria.name === 'Viabilidad del Negocio'
      isOptionalCriteria[s.criteriaId] = optional
      if (!optional) {
        maxPossible += s.maxScore
      }
    }
  }

  // Calculate total from local scores
  let calculatedTotal = 0
  if (evaluation) {
    for (const s of evaluation.scores) {
      const localScore = localScores[s.criteriaId]
      const scoreValue = localScore ? localScore.score : s.score
      if (!isOptionalCriteria[s.criteriaId]) {
        calculatedTotal += scoreValue
      }
    }
  }

  /* ── Score & Observation Handlers ─────────────── */

  const handleScoreChange = (criteriaId: string, score: number) => {
    setLocalScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], score },
    }))
    debouncedSave()
  }

  const handleObservationChange = (criteriaId: string, observation: string) => {
    setLocalScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], observation },
    }))
    debouncedSave()
  }

  /* ── Auto-save Draft (debounced) ──────────────── */

  const saveDraft = useCallback(async () => {
    if (!evaluation || !evaluation.isDraft) return
    setSaving(true)
    try {
      const scoresArray = Object.entries(localScores).map(([criteriaId, val]) => ({
        criteriaId,
        score: val.score,
        observation: val.observation || null,
      }))
      const updated = await apiFetch<Evaluation>(`/api/evaluations/${evaluation.id}`, {
        method: 'PUT',
        body: JSON.stringify({ scores: scoresArray, comments }),
      })
      setEvaluation(updated)
      setComments(updated.comments || '')
      const scoreMap: Record<string, { score: number; observation: string }> = {}
      for (const s of updated.scores) {
        scoreMap[s.criteriaId] = {
          score: localScores[s.criteriaId]?.score ?? s.score,
          observation: localScores[s.criteriaId]?.observation ?? (s.observation || ''),
        }
      }
      setLocalScores(scoreMap)
    } catch {
      // handled
    } finally {
      setSaving(false)
    }
  }, [evaluation, localScores, comments])

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveDraft()
    }, 1500)
  }, [saveDraft])

  /* ── Manual Save ──────────────────────────────── */

  const handleSaveDraft = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await saveDraft()
    toast.success('Borrador guardado', {
      description: 'La evaluación se ha guardado como borrador',
    })
  }

  /* ── Submit ───────────────────────────────────── */

  const handleSubmit = async () => {
    if (!evaluation) return

    // Check that non-optional criteria have been scored
    const unscored = evaluation.scores.filter(
      (s) => !isOptionalCriteria[s.criteriaId] && (localScores[s.criteriaId]?.score ?? s.score) === 0
    )
    if (unscored.length > 0) {
      toast.warning('Criterios sin evaluar', {
        description: `Faltan por evaluar: ${unscored.map((s) => s.criteria.name).join(', ')}`,
      })
      return
    }

    setSubmitting(true)
    try {
      // Save first
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      await saveDraft()

      // Then submit
      await apiFetch(`/api/evaluations/${evaluation.id}/submit`, {
        method: 'PATCH',
      })
      toast.success('Evaluación enviada', {
        description: 'Tu evaluación ha sido enviada exitosamente',
      })
      await fetchEvaluation()
    } catch (err) {
      toast.error('Error al enviar', {
        description: err instanceof Error ? err.message : 'No se pudo enviar la evaluación',
      })
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render ───────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Evaluación no encontrada</p>
        <Button variant="outline" className="mt-4" onClick={goBack}>
          Volver
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{evaluation.project.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Evaluador: {evaluation.evaluator.name} · {evaluation.project.category?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-11 sm:ml-0">
          {evaluation.isDraft ? (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <FileText className="mr-1 h-3 w-3" />
              Borrador
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Enviado
            </Badge>
          )}
          {saving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Guardando...
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Criteria + Summary */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Criteria Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold">Rúbrica de Evaluación</h2>
            <span className="text-xs text-muted-foreground">
              ({evaluation.scores.length} criterios)
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {evaluation.scores.map((scoreEntry, i) => (
                <motion.div
                  key={scoreEntry.criteriaId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <CriterionCard
                    scoreEntry={{
                      ...scoreEntry,
                      score: localScores[scoreEntry.criteriaId]?.score ?? scoreEntry.score,
                      observation: localScores[scoreEntry.criteriaId]?.observation ?? scoreEntry.observation,
                    }}
                    isOptional={isOptionalCriteria[scoreEntry.criteriaId]}
                    isDisabled={isDisabled}
                    onScoreChange={handleScoreChange}
                    onObservationChange={handleObservationChange}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-sm">Observaciones Generales</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Escribe tus observaciones generales sobre el proyecto..."
                value={comments}
                disabled={isDisabled}
                onChange={(e) => {
                  setComments(e.target.value)
                  debouncedSave()
                }}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1.5 text-right">
                {comments.length} caracteres
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar (sticky on desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-center">Resumen de Puntaje</CardTitle>
              </CardHeader>
              <CardContent>
                <SummaryPanel
                  scores={evaluation.scores.map((s) => ({
                    ...s,
                    score: localScores[s.criteriaId]?.score ?? s.score,
                  }))}
                  totalScore={calculatedTotal}
                  maxPossible={maxPossible}
                  isOptionalCriteria={isOptionalCriteria}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Summary (shown on small screens) */}
      <div className="lg:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-center">Resumen de Puntaje</CardTitle>
          </CardHeader>
          <CardContent>
            <SummaryPanel
              scores={evaluation.scores.map((s) => ({
                ...s,
                score: localScores[s.criteriaId]?.score ?? s.score,
              }))}
              totalScore={calculatedTotal}
              maxPossible={maxPossible}
              isOptionalCriteria={isOptionalCriteria}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bottom Bar */}
      {evaluation.isDraft && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 z-50">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-2">
              <ScoreCircle score={calculatedTotal} maxScore={maxPossible} size={44} strokeWidth={4} />
              <div>
                <p className="text-sm font-bold">{Math.round(calculatedTotal)}/{maxPossible}</p>
                <p className="text-[10px] text-muted-foreground">Puntaje total</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Borrador
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Enviar Evaluación
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Enviar evaluación?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Una vez enviada, no podrás modificar la evaluación. El puntaje total será{' '}
                      <strong className="text-foreground">{Math.round(calculatedTotal)}/{maxPossible}</strong> puntos.
                      ¿Estás seguro de que deseas enviar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Sí, Enviar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      )}

      {/* Submitted - read-only notice */}
      {!evaluation.isDraft && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-emerald-50 dark:bg-emerald-950/30 p-4 z-50">
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Esta evaluación ya fue enviada y no puede ser modificada
          </div>
        </div>
      )}
    </motion.div>
  )
}
