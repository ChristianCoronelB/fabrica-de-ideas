'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  User,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Building2,
  Tag,
  Users,
  FileText,
  Upload,
  X,
  Star,
  MessageSquare,
  ChevronDown,
  PlusCircle,
  Loader2,
  Paperclip,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { apiFetch } from '@/lib/api'
import { StatusBadge } from '@/components/projects/status-badge'
import { toast } from 'sonner'

interface EvaluatorUser {
  id: string
  name: string
  email: string
}

interface Attachment {
  id: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  category: string | null
  createdAt: string
}

interface EvaluationScore {
  id: string
  criteriaId: string
  score: number
  maxScore: number
  observation: string | null
  criteria: {
    id: string
    name: string
    description: string
    weight: number
  }
}

interface Evaluation {
  id: string
  evaluatorId: string
  totalScore: number
  comments: string | null
  isDraft: boolean
  submittedAt: string | null
  evaluator: EvaluatorUser
  scores: EvaluationScore[]
}

interface ProjectEvaluator {
  id: string
  evaluatorId: string
  evaluator: EvaluatorUser
  assignedAt: string
}

interface ProjectDetail {
  id: string
  name: string
  pitch: string
  description: string
  team: string
  imageUrl: string | null
  status: string
  leaderName: string
  leaderEmail: string
  leaderPhone: string | null
  leaderCourse: string | null
  leaderParallel: string | null
  tutorName: string | null
  locationMatrix: string | null
  locationSede: string | null
  locationExtension: string | null
  totalScore: number
  averageScore: number
  area: { id: string; name: string }
  category: { id: string; name: string }
  institution: { id: string; name: string }
  owner: { id: string; name: string; email: string }
  evaluators: ProjectEvaluator[]
  evaluations: Evaluation[]
  attachments: Attachment[]
  createdAt: string
}

interface EvaluatorOption {
  id: string
  name: string
  email: string
}

const statusOptions = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'FINALIST', 'WINNER']

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('image')) return '🖼️'
  if (fileType.includes('video')) return '🎬'
  if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️'
  return '📎'
}

function ScoreBar({ score, maxScore, name }: { score: number; maxScore: number; name: string }) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{name}</span>
        <span className="font-medium">
          {score.toFixed(1)} / {maxScore.toFixed(0)}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-[300px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    </div>
  )
}

export function ProjectDetail() {
  const { user } = useAuthStore()
  const { viewParams, navigate, goBack } = useNavStore()
  const projectId = viewParams.id

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [evaluatorOptions, setEvaluatorOptions] = useState<EvaluatorOption[]>([])
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<string>('')
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isRemovingEvaluator, setIsRemovingEvaluator] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const data = await apiFetch<ProjectDetail>(`/api/projects/${projectId}`)
      setProject(data)
    } catch {
      toast.error('Error al cargar el proyecto')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const isAdminUser = user?.role === 'ADMIN'
  const isOwner = project?.owner.id === user?.id

  const handleStatusChange = async (newStatus: string) => {
    if (!projectId) return
    setIsChangingStatus(true)
    try {
      await apiFetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      toast.success('Estado actualizado correctamente')
      fetchProject()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!projectId) return
    setIsDeleting(true)
    try {
      await apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      toast.success('Proyecto eliminado')
      navigate('projects')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleOpenAssignDialog = async () => {
    try {
      const data = await apiFetch<{ users: EvaluatorOption[] }>(
        '/api/admin/users?role=EVALUATOR&limit=50'
      )
      setEvaluatorOptions(data.users)
      setShowAssignDialog(true)
    } catch {
      toast.error('Error al cargar evaluadores')
    }
  }

  const handleAssignEvaluator = async () => {
    if (!projectId || !selectedEvaluatorId) return
    setIsAssigning(true)
    try {
      await apiFetch(`/api/projects/${projectId}/evaluators`, {
        method: 'POST',
        body: JSON.stringify({ evaluatorIds: [selectedEvaluatorId] }),
      })
      toast.success('Evaluador asignado correctamente')
      setShowAssignDialog(false)
      setSelectedEvaluatorId('')
      fetchProject()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al asignar evaluador')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveEvaluator = async (evaluatorId: string) => {
    if (!projectId) return
    setIsRemovingEvaluator(evaluatorId)
    try {
      await apiFetch(`/api/projects/${projectId}/evaluators/${evaluatorId}`, {
        method: 'DELETE',
      })
      toast.success('Evaluador removido')
      fetchProject()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al remover evaluador')
    } finally {
      setIsRemovingEvaluator(null)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId || !e.target.files?.length) return
    setIsUploading(true)
    try {
      for (const file of Array.from(e.target.files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('projectId', projectId)
        formData.append('category', 'evidence')
        await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('fabrica_token')}`,
          },
          body: formData,
        })
      }
      toast.success('Archivo(s) subido(s) correctamente')
      fetchProject()
    } catch {
      toast.error('Error al subir archivo')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await apiFetch(`/api/upload/${attachmentId}`, { method: 'DELETE' })
      toast.success('Archivo eliminado')
      fetchProject()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar archivo')
    }
  }

  if (isLoading) return <DetailSkeleton />
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Button variant="outline" onClick={goBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  const visibleEvaluations = project.evaluations.filter((ev) => {
    if (isAdminUser) return true
    if (user?.role === 'EVALUATOR') return ev.evaluatorId === user.id
    return !ev.isDraft
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={goBack} className="shrink-0 mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={project.status} size="md" />
              <span className="text-sm text-muted-foreground">
                Creado el {new Date(project.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-14 sm:ml-0">
          {(isOwner || isAdminUser) && project.status === 'DRAFT' && (
            <Button
              variant="outline"
              onClick={() => navigate('project-new', { id: project.id })}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {isAdminUser && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isChangingStatus}>
                    {isChangingStatus ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown className="mr-2 h-4 w-4" />
                    )}
                    Cambiar Estado
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={s === project.status}
                    >
                      <StatusBadge status={s} size="sm" />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project Image */}
      {project.imageUrl && (
        <Card className="overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full max-h-[300px] object-cover"
          />
        </Card>
      )}

      {/* Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Pitch</h4>
                <p className="text-sm leading-relaxed">{project.pitch}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción Completa</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Equipo</h4>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">{project.team}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Líder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{project.leaderName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{project.leaderEmail}</span>
              </div>
              {project.leaderPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.leaderPhone}</span>
                </div>
              )}
              {project.leaderCourse && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.leaderCourse}</span>
                </div>
              )}
              {project.leaderParallel && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground ml-6">Paralelo: {project.leaderParallel}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ubicación y Clasificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.tutorName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tutor: {project.tutorName}</span>
                </div>
              )}
              {(project.locationMatrix || project.locationSede || project.locationExtension) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm space-y-0.5">
                    {project.locationMatrix && <div>Matriz: {project.locationMatrix}</div>}
                    {project.locationSede && <div>Sede: {project.locationSede}</div>}
                    {project.locationExtension && <div>Extensión: {project.locationExtension}</div>}
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Área: </span>
                <Badge variant="secondary">{project.area.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-teal-500" />
                <span className="text-sm">Categoría: </span>
                <Badge variant="outline">{project.category.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-500" />
                <span className="text-sm">Institución: </span>
                <span className="text-sm">{project.institution.name}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evaluators Section (ADMIN only) */}
      {isAdminUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Evaluadores Asignados
              </CardTitle>
              <Button size="sm" onClick={handleOpenAssignDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Asignar Evaluador
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {project.evaluators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay evaluadores asignados
              </p>
            ) : (
              <div className="space-y-2">
                {project.evaluators.map((pe) => (
                  <div
                    key={pe.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {pe.evaluator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{pe.evaluator.name}</p>
                        <p className="text-xs text-muted-foreground">{pe.evaluator.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isRemovingEvaluator === pe.evaluatorId}
                      onClick={() => handleRemoveEvaluator(pe.evaluatorId)}
                      className="text-destructive hover:text-destructive"
                    >
                      {isRemovingEvaluator === pe.evaluatorId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Evaluations Section */}
      {visibleEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Evaluaciones
              </CardTitle>
              {project.averageScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Puntaje promedio:</span>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-base px-3 py-1">
                    <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                    {project.averageScore.toFixed(1)}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {visibleEvaluations.map((evaluation, idx) => (
              <div key={evaluation.id}>
                {idx > 0 && <Separator className="mb-6" />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {evaluation.evaluator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isAdminUser || user?.id === evaluation.evaluatorId
                            ? evaluation.evaluator.name
                            : `Evaluador ${idx + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {evaluation.isDraft ? 'Borrador' : 'Enviada'}
                          {evaluation.submittedAt &&
                            ` — ${new Date(evaluation.submittedAt).toLocaleDateString('es-ES')}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    >
                      {evaluation.totalScore.toFixed(1)} pts
                    </Badge>
                  </div>

                  <div className="space-y-3 pl-2">
                    {evaluation.scores.map((score) => (
                      <ScoreBar
                        key={score.id}
                        score={score.score}
                        maxScore={score.maxScore}
                        name={score.criteria.name}
                      />
                    ))}
                  </div>

                  {evaluation.comments && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attachments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-emerald-500" />
              Archivos Adjuntos
            </CardTitle>
            {(isOwner || isAdminUser) && (
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Subir Archivo
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {project.attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay archivos adjuntos
            </p>
          ) : (
            <div className="space-y-2">
              {project.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                    <div>
                      <p className="text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)} •{' '}
                        {new Date(attachment.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={attachment.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    {(isOwner || isAdminUser) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Evaluator Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Evaluador</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedEvaluatorId} onValueChange={setSelectedEvaluatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar evaluador..." />
              </SelectTrigger>
              <SelectContent>
                {evaluatorOptions
                  .filter(
                    (eo) => !project.evaluators.some((pe) => pe.evaluatorId === eo.id)
                  )
                  .map((eo) => (
                    <SelectItem key={eo.id} value={eo.id}>
                      {eo.name} — {eo.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssignEvaluator}
              disabled={!selectedEvaluatorId || isAssigning}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            >
              {isAssigning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el proyecto &quot;{project.name}&quot;. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
