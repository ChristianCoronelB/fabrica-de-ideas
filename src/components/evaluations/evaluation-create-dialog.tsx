'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, FolderKanban, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/lib/api'
import { useNavStore } from '@/store/nav-store'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Project {
  id: string
  name: string
  status: string
  category: { id: string; name: string }
  area: { id: string; name: string }
  _count: { evaluations: number }
}

interface Evaluation {
  id: string
  projectId: string
}

interface EvaluationCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EvaluationCreateDialog({ open, onOpenChange }: EvaluationCreateDialogProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { navigate } = useNavStore()
  const { user } = useAuthStore()

  const fetchData = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const [projectsData, evalsData] = await Promise.all([
        apiFetch<{ projects: Project[]; total: number }>('/api/projects?limit=50'),
        apiFetch<Evaluation[]>('/api/evaluations'),
      ])
      setProjects(projectsData.projects || [])
      setEvaluations(evalsData || [])
    } catch {
      // Error handled by apiFetch
    } finally {
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const evaluatedProjectIds = new Set(evaluations.map((e) => e.projectId))

  const availableProjects = projects.filter(
    (p) => !evaluatedProjectIds.has(p.id)
  )

  const filteredProjects = availableProjects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!selectedId) return
    setCreating(true)
    try {
      const evaluation = await apiFetch<{ id: string }>('/api/evaluations', {
        method: 'POST',
        body: JSON.stringify({ projectId: selectedId }),
      })
      onOpenChange(false)
      navigate('evaluation-detail', { id: evaluation.id })
    } catch {
      // Error handled by apiFetch
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Borrador', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
      SUBMITTED: { label: 'Enviado', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
      APPROVED: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
      FINALIST: { label: 'Finalista', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
      WINNER: { label: 'Ganador', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
      REJECTED: { label: 'Rechazado', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    }
    const v = variants[status] || { label: status, className: '' }
    return <Badge variant="secondary" className={`text-[10px] ${v.className}`}>{v.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Evaluación</DialogTitle>
          <DialogDescription>
            Selecciona un proyecto para comenzar a evaluar
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyecto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8">
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {availableProjects.length === 0
                ? 'No hay proyectos disponibles para evaluar'
                : 'No se encontraron proyectos con esa búsqueda'}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-1.5 pr-3">
              {filteredProjects.map((project) => (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full text-left rounded-lg border p-3 transition-all hover:bg-accent ${
                    selectedId === project.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedId(project.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.category?.name} · {project.area?.name}
                      </p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedId || creating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Evaluación'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
