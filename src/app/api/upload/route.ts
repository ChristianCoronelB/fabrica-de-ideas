import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isParticipant } from '@/lib/api-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isParticipant(auth) && !isAdmin(auth)) {
      return NextResponse.json({ error: 'No tiene permiso para subir archivos' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null
    const category = formData.get('category') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se encontró el archivo' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId es requerido' }, { status: 400 })
    }

    // Verify project exists
    const project = await db.project.findFirst({
      where: { id: projectId, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Check permission: owner or admin
    if (project.ownerId !== auth.userId && !isAdmin(auth)) {
      return NextResponse.json({ error: 'No tiene permiso para subir archivos a este proyecto' }, { status: 403 })
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`
    const filePath = path.join(uploadsDir, uniqueName)

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Create attachment record
    const attachment = await db.attachment.create({
      data: {
        projectId,
        fileName: file.name,
        filePath: `/uploads/${uniqueName}`,
        fileType: file.type,
        fileSize: file.size,
        category: category || null,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId,
        action: 'FILE_UPLOADED',
        details: `Archivo "${file.name}" subido al proyecto`,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
