'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth-store'
import { useNavStore } from '@/store/nav-store'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface Area {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface Institution {
  id: string
  name: string
}

interface Attachment {
  id: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  category: string | null
}

interface ExistingProject {
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
  areaId: string
  categoryId: string
  institutionId: string
  attachments: Attachment[]
}

const STEPS = [
  { number: 1, title: 'Información General' },
  { number: 2, title: 'Información del Líder' },
  { number: 3, title: 'Ubicación y Tutor' },
  { number: 4, title: 'Archivos y Revisión' },
]

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step.number < currentStep
                    ? 'bg-emerald-500 text-white'
                    : step.number === currentStep
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/30'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={`text-xs sm:text-sm hidden sm:inline ${
                  step.number <= currentStep
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </span>
            </div>
            {step.number < STEPS.length && (
              <div className="mx-2 sm:mx-4 hidden sm:block">
                <ChevronRight
                  className={`h-4 w-4 ${
                    step.number < currentStep ? 'text-emerald-500' : 'text-muted-foreground/30'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Mobile labels */}
      <div className="sm:hidden text-center mt-1">
        <span className="text-xs text-muted-foreground">
          Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].title}
        </span>
      </div>
    </div>
  )
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function ProjectForm() {
  const { user } = useAuthStore()
  const { viewParams, goBack } = useNavStore()
  const editId = viewParams.id
  const isEditing = !!editId

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProject, setIsLoadingProject] = useState(false)

  // Reference data
  const [areas, setAreas] = useState<Area[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    pitch: '',
    description: '',
    team: '',
    imageUrl: '' as string,
    areaId: '',
    categoryId: '',
    leaderName: user?.name || '',
    leaderEmail: user?.email || '',
    leaderPhone: '',
    institutionId: '',
    leaderCourse: '',
    leaderParallel: '',
    locationMatrix: '',
    locationSede: '',
    locationExtension: '',
    tutorName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [direction, setDirection] = useState(0)

  // Load reference data
  useEffect(() => {
    Promise.all([
      apiFetch<Area[]>('/api/ref/areas').catch(() => []),
      apiFetch<Category[]>('/api/ref/categories').catch(() => []),
      apiFetch<Institution[]>('/api/ref/institutions').catch(() => []),
    ]).then(([areasData, categoriesData, institutionsData]) => {
      setAreas(areasData as Area[])
      setCategories(categoriesData as Category[])
      setInstitutions(institutionsData as Institution[])
    })
  }, [])

  // Load existing project for editing
  useEffect(() => {
    if (!editId) return
    setIsLoadingProject(true)
    apiFetch<ExistingProject>(`/api/projects/${editId}`)
      .then((project) => {
        setFormData({
          name: project.name,
          pitch: project.pitch,
          description: project.description,
          team: project.team,
          imageUrl: project.imageUrl || '',
          areaId: project.areaId,
          categoryId: project.categoryId,
          leaderName: project.leaderName,
          leaderEmail: project.leaderEmail,
          leaderPhone: project.leaderPhone || '',
          institutionId: project.institutionId,
          leaderCourse: project.leaderCourse || '',
          leaderParallel: project.leaderParallel || '',
          locationMatrix: project.locationMatrix || '',
          locationSede: project.locationSede || '',
          locationExtension: project.locationExtension || '',
          tutorName: project.tutorName || '',
        })
        setExistingAttachments(project.attachments || [])
      })
      .catch(() => {
        toast.error('Error al cargar el proyecto')
      })
      .finally(() => setIsLoadingProject(false))
  }, [editId])

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
      if (!formData.pitch.trim()) newErrors.pitch = 'El pitch es obligatorio'
      if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria'
      if (!formData.team.trim()) newErrors.team = 'El equipo es obligatorio'
      if (!formData.areaId) newErrors.areaId = 'Selecciona un área'
      if (!formData.categoryId) newErrors.categoryId = 'Selecciona una categoría'
    }

    if (step === 2) {
      if (!formData.leaderName.trim()) newErrors.leaderName = 'El nombre del líder es obligatorio'
      if (!formData.leaderEmail.trim()) newErrors.leaderEmail = 'El correo es obligatorio'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail))
        newErrors.leaderEmail = 'Correo electrónico inválido'
      if (!formData.institutionId) newErrors.institutionId = 'Selecciona una institución'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editId) {
      if (file) {
        // Store for later upload after project creation
        const reader = new FileReader()
        reader.onload = (ev) => {
          updateField('imageUrl', ev.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
      return
    }
    // If editing, upload immediately
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('projectId', editId)
      formDataObj.append('category', 'image')
      const token = localStorage.getItem('fabrica_token')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj,
      })
      if (res.ok) {
        const attachment = await res.json()
        updateField('imageUrl', attachment.filePath)
      }
    } catch {
      toast.error('Error al subir imagen')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await apiFetch(`/api/upload/${attachmentId}`, { method: 'DELETE' })
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      toast.success('Archivo eliminado')
    } catch {
      toast.error('Error al eliminar archivo')
    }
  }

  const handleSubmit = async (submitAsDraft: boolean) => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Completa los campos obligatorios')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name,
        pitch: formData.pitch,
        description: formData.description,
        team: formData.team,
        imageUrl: formData.imageUrl || null,
        areaId: formData.areaId,
        categoryId: formData.categoryId,
        leaderName: formData.leaderName,
        leaderEmail: formData.leaderEmail,
        leaderPhone: formData.leaderPhone || null,
        institutionId: formData.institutionId,
        leaderCourse: formData.leaderCourse || null,
        leaderParallel: formData.leaderParallel || null,
        locationMatrix: formData.locationMatrix || null,
        locationSede: formData.locationSede || null,
        locationExtension: formData.locationExtension || null,
        tutorName: formData.tutorName || null,
        status: submitAsDraft ? 'DRAFT' : 'SUBMITTED',
      }

      let projectId = editId

      if (isEditing) {
        await apiFetch(`/api/projects/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        toast.success('Proyecto actualizado correctamente')
      } else {
        const result = await apiFetch<{ id: string }>('/api/projects', {
          method: 'POST',
          body: JSON.stringify({ ...payload, status: 'DRAFT' }),
        })
        projectId = result.id
        toast.success(submitAsDraft ? 'Borrador guardado' : 'Proyecto enviado correctamente')
      }

      // Upload pending files
      if (projectId && pendingFiles.length > 0) {
        const token = localStorage.getItem('fabrica_token')
        for (const file of pendingFiles) {
          const fd = new FormData()
          fd.append('file', file)
          fd.append('projectId', projectId)
          fd.append('category', 'evidence')
          await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
        }
      }

      // If submitting (not draft), update status
      if (!submitAsDraft && projectId && !isEditing) {
        try {
          await apiFetch(`/api/projects/${projectId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'SUBMITTED' }),
          })
        } catch {
          // Non-critical, project is created
        }
      } else if (!submitAsDraft && isEditing && projectId) {
        try {
          await apiFetch(`/api/projects/${projectId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'SUBMITTED' }),
          })
        } catch {
          // Non-critical
        }
      }

      // Navigate to project detail
      if (projectId) {
        const { navigate } = useNavStore.getState()
        navigate('project-detail', { id: projectId })
      } else {
        goBack()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar proyecto')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }

  const handleNextWithAnim = () => {
    if (validateStep(currentStep)) {
      setDirection(1)
      setCurrentStep((prev) => Math.min(prev + 1, 4))
    }
  }

  const handlePrevWithAnim = () => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Modifica los datos del proyecto' : 'Registra tu proyecto en la Fábrica de Ideas'}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="p-4 sm:p-6">
        <StepIndicator currentStep={currentStep} />
      </Card>

      {/* Form Content */}
      <Card className="overflow-hidden">
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-lg font-semibold">Información General</h2>

                {/* Image Upload */}
                <FormField label="Imagen del Proyecto">
                  <div className="flex items-center gap-4">
                    {formData.imageUrl ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => updateField('imageUrl', '')}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="project-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('project-image')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Imagen
                      </Button>
                    </div>
                  </div>
                </FormField>

                <FormField label="Nombre del Proyecto" required error={errors.name}>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Nombre del proyecto"
                    maxLength={200}
                  />
                </FormField>

                <FormField label="Pitch" required error={errors.pitch}>
                  <div>
                    <Textarea
                      value={formData.pitch}
                      onChange={(e) => updateField('pitch', e.target.value)}
                      placeholder="Describe brevemente tu proyecto en una o dos oraciones"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {formData.pitch.length}/500
                    </p>
                  </div>
                </FormField>

                <FormField label="Equipo" required error={errors.team}>
                  <Input
                    value={formData.team}
                    onChange={(e) => updateField('team', e.target.value)}
                    placeholder="Nombre del equipo"
                    maxLength={100}
                  />
                </FormField>

                <FormField label="Descripción" required error={errors.description}>
                  <div>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Descripción detallada del proyecto"
                      rows={5}
                      maxLength={3000}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {formData.description.length}/3000
                    </p>
                  </div>
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Área" required error={errors.areaId}>
                    <Select value={formData.areaId} onValueChange={(v) => updateField('areaId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Categoría" required error={errors.categoryId}>
                    <Select value={formData.categoryId} onValueChange={(v) => updateField('categoryId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-lg font-semibold">Información del Líder</h2>

                <FormField label="Nombre del líder" required error={errors.leaderName}>
                  <Input
                    value={formData.leaderName}
                    onChange={(e) => updateField('leaderName', e.target.value)}
                    placeholder="Nombre completo del líder"
                  />
                </FormField>

                <FormField label="Correo electrónico" required error={errors.leaderEmail}>
                  <Input
                    type="email"
                    value={formData.leaderEmail}
                    onChange={(e) => updateField('leaderEmail', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </FormField>

                <FormField label="Teléfono">
                  <Input
                    value={formData.leaderPhone}
                    onChange={(e) => updateField('leaderPhone', e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </FormField>

                <FormField label="Institución" required error={errors.institutionId}>
                  <Select
                    value={formData.institutionId}
                    onValueChange={(v) => updateField('institutionId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar institución" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Curso">
                    <Input
                      value={formData.leaderCourse}
                      onChange={(e) => updateField('leaderCourse', e.target.value)}
                      placeholder="Ej: 3ro Bachillerato"
                    />
                  </FormField>

                  <FormField label="Paralelo">
                    <Input
                      value={formData.leaderParallel}
                      onChange={(e) => updateField('leaderParallel', e.target.value)}
                      placeholder="Ej: A"
                    />
                  </FormField>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-lg font-semibold">Ubicación y Tutor</h2>

                <FormField label="Matriz">
                  <Input
                    value={formData.locationMatrix}
                    onChange={(e) => updateField('locationMatrix', e.target.value)}
                    placeholder="Ubicación de la matriz"
                  />
                </FormField>

                <FormField label="Sede">
                  <Input
                    value={formData.locationSede}
                    onChange={(e) => updateField('locationSede', e.target.value)}
                    placeholder="Sede"
                  />
                </FormField>

                <FormField label="Extensión">
                  <Input
                    value={formData.locationExtension}
                    onChange={(e) => updateField('locationExtension', e.target.value)}
                    placeholder="Extensión"
                  />
                </FormField>

                <FormField label="Nombre del Tutor">
                  <Input
                    value={formData.tutorName}
                    onChange={(e) => updateField('tutorName', e.target.value)}
                    placeholder="Nombre del tutor o mentor"
                  />
                </FormField>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="p-6 space-y-6"
              >
                <h2 className="text-lg font-semibold">Archivos y Revisión</h2>

                {/* File Upload */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Archivos Adjuntos</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files) {
                        setPendingFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)])
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, imágenes, documentos (máx. 10MB)
                    </p>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    />
                  </div>
                </div>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Archivos Actuales</Label>
                    {existingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{att.fileName}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Files */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Archivos Pendientes</Label>
                    {pendingFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePendingFile(idx)}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Review Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Revisión de Datos</h3>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nombre:</span>{' '}
                      <span className="font-medium">{formData.name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Equipo:</span>{' '}
                      <span className="font-medium">{formData.team || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Área:</span>{' '}
                      <Badge variant="secondary" className="text-xs">
                        {areas.find((a) => a.id === formData.areaId)?.name || '—'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Categoría:</span>{' '}
                      <Badge variant="outline" className="text-xs">
                        {categories.find((c) => c.id === formData.categoryId)?.name || '—'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Líder:</span>{' '}
                      <span className="font-medium">{formData.leaderName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Correo:</span>{' '}
                      <span className="font-medium">{formData.leaderEmail || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Institución:</span>{' '}
                      <span className="font-medium">
                        {institutions.find((i) => i.id === formData.institutionId)?.name || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tutor:</span>{' '}
                      <span className="font-medium">{formData.tutorName || '—'}</span>
                    </div>
                  </div>

                  {formData.pitch && (
                    <div>
                      <span className="text-sm text-muted-foreground">Pitch:</span>
                      <p className="text-sm mt-1 p-3 rounded-lg bg-muted/50">{formData.pitch}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? goBack : handlePrevWithAnim}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <Button
                  onClick={handleNextWithAnim}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Guardar Borrador
                  </Button>
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Enviar Proyecto
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
