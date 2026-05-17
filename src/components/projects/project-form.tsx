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
  Info,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

// ─── FieldTooltip Component ────────────────────────────────
function FieldTooltip({ text }: { text: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex ml-1 text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="text-xs max-w-[250px] p-2">
        {text}
      </PopoverContent>
    </Popover>
  )
}

// ─── StepIndicator Component ────────────────────────────────
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

// ─── FormField Component ────────────────────────────────────
function FormField({
  label,
  required,
  error,
  tooltip,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  tooltip?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {tooltip && <FieldTooltip text={tooltip} />}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Main ProjectForm Component ─────────────────────────────
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

  // Image file state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Video pitch state
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [videoDurationError, setVideoDurationError] = useState('')
  const [existingPitchVideo, setExistingPitchVideo] = useState<Attachment | null>(null)

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
    institutionName: '',
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
        // Find institution name from the loaded list or from project data
        const instName = institutions.find((i) => i.id === project.institutionId)?.name || ''
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
          institutionName: instName,
          leaderCourse: project.leaderCourse || '',
          leaderParallel: project.leaderParallel || '',
          locationMatrix: project.locationMatrix || '',
          locationSede: project.locationSede || '',
          locationExtension: project.locationExtension || '',
          tutorName: project.tutorName || '',
        })
        if (project.imageUrl) {
          setImagePreview(project.imageUrl)
        }
        setExistingAttachments(project.attachments || [])

        // Find existing pitch video
        const pitchVideo = project.attachments?.find((a) => a.category === 'pitch_video')
        if (pitchVideo) {
          setExistingPitchVideo(pitchVideo)
        }
      })
      .catch(() => {
        toast.error('Error al cargar el proyecto')
      })
      .finally(() => setIsLoadingProject(false))
  }, [editId, institutions])

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
      if (videoDurationError) newErrors.videoPitch = videoDurationError
    }

    if (step === 2) {
      if (!formData.leaderName.trim()) newErrors.leaderName = 'El nombre del líder es obligatorio'
      if (!formData.leaderEmail.trim()) newErrors.leaderEmail = 'El correo es obligatorio'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.leaderEmail))
        newErrors.leaderEmail = 'Correo electrónico inválido'
      if (!formData.institutionName.trim()) newErrors.institutionName = 'La institución es obligatoria'
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

  // ─── Image Upload Handler ────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    if (isEditing && editId) {
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
          setImagePreview(attachment.filePath)
          toast.success('Imagen subida correctamente')
        }
      } catch {
        toast.error('Error al subir imagen')
      }
    } else {
      // If creating, store the File object for later upload
      setImageFile(file)
    }
  }

  // ─── Video Pitch Upload Handler ──────────────────────────
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Solo se permiten archivos de video')
      return
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('El video no debe superar los 20MB')
      return
    }

    setVideoDurationError('')

    // Create blob URL for preview and duration check
    const videoUrl = URL.createObjectURL(file)
    const videoElement = document.createElement('video')
    videoElement.preload = 'metadata'

    videoElement.onloadedmetadata = () => {
      if (videoElement.duration > 90) {
        setVideoDurationError('El video debe tener una duración máxima de 1 minuto y 30 segundos')
        URL.revokeObjectURL(videoUrl)
        setVideoFile(null)
        setVideoPreview('')
        return
      }
      setVideoFile(file)
      setVideoPreview(videoUrl)
    }

    videoElement.onerror = () => {
      toast.error('Error al cargar el video. Verifica que el archivo sea válido.')
      URL.revokeObjectURL(videoUrl)
      setVideoFile(null)
      setVideoPreview('')
    }

    videoElement.src = videoUrl
  }

  // ─── File Upload Handler (Step 4) ────────────────────────
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.docx', '.xlsx']

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validFiles: File[] = []
      const newFiles = Array.from(e.target.files)

      for (const file of newFiles) {
        // Validate file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`El archivo "${file.name}" excede el límite de 10MB`)
          continue
        }

        // Validate file type
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
          toast.error(`El archivo "${file.name}" tiene un formato no permitido. Usa PDF, imágenes, DOCX o XLSX.`)
          continue
        }

        validFiles.push(file)
      }

      setPendingFiles((prev) => [...prev, ...validFiles])
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

  // ─── Resolve Institution ID from Name ────────────────────
  const resolveInstitutionId = async (name: string): Promise<string | null> => {
    const trimmedName = name.trim()
    if (!trimmedName) return null

    // Try to find in the loaded list
    const existing = institutions.find(
      (inst) => inst.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (existing) return existing.id

    // If not found, create a new one
    try {
      const newInst = await apiFetch<{ id: string; name: string }>('/api/ref/institutions', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName }),
      })
      // Add to local list
      setInstitutions((prev) => [...prev, newInst])
      return newInst.id
    } catch {
      toast.error('Error al crear institución')
      return null
    }
  }

  // ─── Submit Handler ──────────────────────────────────────
  const handleSubmit = async (submitAsDraft: boolean) => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Completa los campos obligatorios')
      return
    }

    setIsSubmitting(true)
    try {
      // Resolve institution ID from name
      const institutionId = await resolveInstitutionId(formData.institutionName)
      if (!institutionId) {
        toast.error('Error al resolver la institución')
        setIsSubmitting(false)
        return
      }

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
        institutionId,
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

      const token = localStorage.getItem('fabrica_token')

      // Upload image file for new projects
      if (projectId && imageFile && !isEditing) {
        try {
          const fd = new FormData()
          fd.append('file', imageFile)
          fd.append('projectId', projectId)
          fd.append('category', 'image')
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
          if (res.ok) {
            const attachment = await res.json()
            // Update project imageUrl
            await apiFetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              body: JSON.stringify({ imageUrl: attachment.filePath }),
            })
          }
        } catch {
          // Non-critical error
        }
      }

      // Upload video pitch if provided
      if (projectId && videoFile) {
        try {
          // If editing and there's an existing pitch video, delete it first
          if (existingPitchVideo) {
            await apiFetch(`/api/upload/${existingPitchVideo.id}`, { method: 'DELETE' })
          }
          const fd = new FormData()
          fd.append('file', videoFile)
          fd.append('projectId', projectId)
          fd.append('category', 'pitch_video')
          await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
        } catch {
          // Non-critical error
        }
      }

      // Upload pending files
      if (projectId && pendingFiles.length > 0) {
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
      if (!submitAsDraft && projectId) {
        try {
          await apiFetch(`/api/projects/${projectId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'SUBMITTED' }),
          })
        } catch {
          // Non-critical, project is created
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

  // Get institution name for review section
  const institutionDisplayName = formData.institutionName || institutions.find((i) => i.id === formData.institutionId)?.name || ''

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
                <FormField
                  label="Imagen del Proyecto"
                  tooltip="Sube una imagen representativa de tu proyecto. Será la imagen principal que se muestra en las tarjetas y listados."
                >
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setImagePreview('')
                            setImageFile(null)
                            updateField('imageUrl', '')
                          }}
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

                <FormField
                  label="Nombre del Proyecto"
                  required
                  error={errors.name}
                  tooltip="Escribe el nombre de tu proyecto. Debe ser claro, memorable y reflejar la esencia de tu idea."
                >
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Nombre del proyecto"
                    maxLength={200}
                  />
                </FormField>

                <FormField
                  label="Pitch"
                  required
                  error={errors.pitch}
                  tooltip="Describe tu proyecto en 1-2 oraciones. Es tu 'elevator pitch': captura la atención explicando qué haces, para quién y por qué es importante."
                >
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

                {/* Video Pitch Upload */}
                <FormField
                  label="Video Pitch"
                  error={errors.videoPitch}
                  tooltip="Graba un video presentando tu proyecto. Máximo 1:30 minutos. Sé claro, entusiasta y enfócate en el problema que resuelves y tu solución."
                >
                  <div className="space-y-2">
                    {videoPreview ? (
                      <div className="relative rounded-lg overflow-hidden border bg-black">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full max-h-48 object-contain"
                        />
                        <button
                          onClick={() => {
                            setVideoFile(null)
                            setVideoPreview('')
                            setVideoDurationError('')
                            URL.revokeObjectURL(videoPreview)
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : existingPitchVideo ? (
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{existingPitchVideo.fileName}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await handleDeleteAttachment(existingPitchVideo.id)
                            setExistingPitchVideo(null)
                          }}
                          className="text-destructive hover:text-destructive h-7 w-7 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id="video-pitch"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('video-pitch')?.click()}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Subir Video Pitch
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Máximo 20MB. El video debe tener una duración máxima de 1 minuto y 30 segundos.
                    </p>
                  </div>
                </FormField>

                <FormField
                  label="Equipo"
                  required
                  error={errors.team}
                  tooltip="Nombre del equipo o grupo de trabajo. Si eres individual, escribe tu nombre."
                >
                  <Input
                    value={formData.team}
                    onChange={(e) => updateField('team', e.target.value)}
                    placeholder="Nombre del equipo"
                    maxLength={100}
                  />
                </FormField>

                <FormField
                  label="Descripción"
                  required
                  error={errors.description}
                  tooltip="Describe tu proyecto en detalle: problema que resuelve, solución propuesta, beneficiarios, modelo de negocio e impacto esperado."
                >
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
                  <FormField
                    label="Área"
                    required
                    error={errors.areaId}
                    tooltip="Selecciona el área temática que mejor se relaciona con tu proyecto."
                  >
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

                  <FormField
                    label="Categoría"
                    required
                    error={errors.categoryId}
                    tooltip="Selecciona la categoría de participación según la fase de tu proyecto."
                  >
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

                <FormField
                  label="Nombre del líder"
                  required
                  error={errors.leaderName}
                  tooltip="Nombre completo de la persona que lidera el proyecto."
                >
                  <Input
                    value={formData.leaderName}
                    onChange={(e) => updateField('leaderName', e.target.value)}
                    placeholder="Nombre completo del líder"
                  />
                </FormField>

                <FormField
                  label="Correo electrónico"
                  required
                  error={errors.leaderEmail}
                  tooltip="Correo de contacto del líder del proyecto."
                >
                  <Input
                    type="email"
                    value={formData.leaderEmail}
                    onChange={(e) => updateField('leaderEmail', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </FormField>

                <FormField
                  label="Teléfono"
                  tooltip="Número de teléfono del líder (opcional)."
                >
                  <Input
                    value={formData.leaderPhone}
                    onChange={(e) => updateField('leaderPhone', e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </FormField>

                <FormField
                  label="Institución"
                  required
                  error={errors.institutionName}
                  tooltip="Nombre de la institución educativa u organización a la que perteneces."
                >
                  <div>
                    <Input
                      value={formData.institutionName}
                      onChange={(e) => {
                        updateField('institutionName', e.target.value)
                        // Clear institutionId since user is typing
                        updateField('institutionId', '')
                      }}
                      placeholder="Nombre de la institución"
                      list="institutions-list"
                    />
                    <datalist id="institutions-list">
                      {institutions.map((inst) => (
                        <option key={inst.id} value={inst.name} />
                      ))}
                    </datalist>
                  </div>
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Curso"
                    tooltip="Curso, semestre o nivel académico actual (opcional)."
                  >
                    <Input
                      value={formData.leaderCourse}
                      onChange={(e) => updateField('leaderCourse', e.target.value)}
                      placeholder="Ej: 3ro Bachillerato"
                    />
                  </FormField>

                  <FormField
                    label="Paralelo"
                    tooltip="Paralelo o grupo al que perteneces (opcional)."
                  >
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

                <FormField
                  label="Matriz"
                  tooltip="Ciudad o ubicación principal de la institución."
                >
                  <Input
                    value={formData.locationMatrix}
                    onChange={(e) => updateField('locationMatrix', e.target.value)}
                    placeholder="Ubicación de la matriz"
                  />
                </FormField>

                <FormField
                  label="Sede"
                  tooltip="Sede o campus de la institución (opcional)."
                >
                  <Input
                    value={formData.locationSede}
                    onChange={(e) => updateField('locationSede', e.target.value)}
                    placeholder="Sede"
                  />
                </FormField>

                <FormField
                  label="Extensión"
                  tooltip="Extensión o recinto donde participas (opcional)."
                >
                  <Input
                    value={formData.locationExtension}
                    onChange={(e) => updateField('locationExtension', e.target.value)}
                    placeholder="Extensión"
                  />
                </FormField>

                <FormField
                  label="Nombre del Tutor"
                  tooltip="Nombre del docente o mentor que asesora el proyecto (opcional)."
                >
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
                <FormField
                  label="Archivos Adjuntos"
                  tooltip="Sube documentos de soporte: plan de negocio, presentaciones, evidencias, prototipos, etc."
                >
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files) {
                        const validFiles: File[] = []
                        const newFiles = Array.from(e.dataTransfer.files)
                        for (const file of newFiles) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error(`El archivo "${file.name}" excede el límite de 10MB`)
                            continue
                          }
                          const ext = '.' + file.name.split('.').pop()?.toLowerCase()
                          if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
                            toast.error(`El archivo "${file.name}" tiene un formato no permitido.`)
                            continue
                          }
                          validFiles.push(file)
                        }
                        setPendingFiles((prev) => [...prev, ...validFiles])
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, imágenes, DOCX, XLSX (máx. 10MB por archivo)
                    </p>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.docx,.xlsx"
                    />
                  </div>
                </FormField>

                {/* Existing Attachments */}
                {existingAttachments.filter((a) => a.category !== 'pitch_video').length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Archivos Actuales</Label>
                    {existingAttachments
                      .filter((a) => a.category !== 'pitch_video')
                      .map((att) => (
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
                      <span className="font-medium">{institutionDisplayName || '—'}</span>
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

                  {videoFile && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Video Pitch:</span>{' '}
                      <span className="font-medium">{videoFile.name}</span>
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
