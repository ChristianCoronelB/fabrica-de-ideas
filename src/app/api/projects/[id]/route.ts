import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isParticipant } from '@/lib/api-auth'

// GET /api/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const project = await db.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        area: true,
        category: true,
        institution: true,
        owner: { select: { id: true, name: true, email: true } },
        evaluators: {
          include: {
            evaluator: { select: { id: true, name: true, email: true } },
          },
        },
        evaluations: {
          include: {
            evaluator: { select: { id: true, name: true, email: true } },
            scores: {
              include: {
                criteria: true,
              },
            },
          },
        },
        attachments: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Access check: admin, owner, or assigned evaluator
    const isOwner = project.ownerId === auth.userId
    const isAssignedEvaluator = project.evaluators.some(
      (pe) => pe.evaluatorId === auth.userId
    )

    if (!isAdmin(auth) && !isOwner && !isAssignedEvaluator) {
      return NextResponse.json({ error: 'No tiene acceso a este proyecto' }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error getting project:', error)
    return NextResponse.json({ error: 'Error al obtener proyecto' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const project = await db.project.findFirst({
      where: { id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Only owner (participant) or admin can edit
    const isOwner = project.ownerId === auth.userId
    if (!isAdmin(auth) && !isOwner) {
      return NextResponse.json({ error: 'No tiene permiso para editar este proyecto' }, { status: 403 })
    }

    // Can only edit if DRAFT (unless admin)
    if (!isAdmin(auth) && project.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Solo se pueden editar proyectos en borrador' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name, pitch, description, team, imageUrl,
      leaderName, leaderEmail, leaderPhone, leaderCourse, leaderParallel,
      tutorName, locationMatrix, locationSede, locationExtension,
      areaId, categoryId, institutionId,
    } = body

    // Verify references if being updated
    if (areaId) {
      const area = await db.area.findUnique({ where: { id: areaId } })
      if (!area) return NextResponse.json({ error: 'Área no encontrada' }, { status: 400 })
    }
    if (categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } })
      if (!category) return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 400 })
    }
    if (institutionId) {
      const institution = await db.institution.findUnique({ where: { id: institutionId } })
      if (!institution) return NextResponse.json({ error: 'Institución no encontrada' }, { status: 400 })
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(pitch !== undefined && { pitch }),
        ...(description !== undefined && { description }),
        ...(team !== undefined && { team }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(leaderName !== undefined && { leaderName }),
        ...(leaderEmail !== undefined && { leaderEmail }),
        ...(leaderPhone !== undefined && { leaderPhone }),
        ...(leaderCourse !== undefined && { leaderCourse }),
        ...(leaderParallel !== undefined && { leaderParallel }),
        ...(tutorName !== undefined && { tutorName }),
        ...(locationMatrix !== undefined && { locationMatrix }),
        ...(locationSede !== undefined && { locationSede }),
        ...(locationExtension !== undefined && { locationExtension }),
        ...(areaId !== undefined && { areaId }),
        ...(categoryId !== undefined && { categoryId }),
        ...(institutionId !== undefined && { institutionId }),
      },
      include: {
        area: true,
        category: true,
        institution: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: id,
        action: 'PROJECT_UPDATED',
        details: `Proyecto "${updatedProject.name}" actualizado`,
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Error al actualizar proyecto' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Soft delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar proyectos' }, { status: 403 })
    }

    const { id } = await params

    const project = await db.project.findFirst({
      where: { id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    await db.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: id,
        action: 'PROJECT_DELETED',
        details: `Proyecto "${project.name}" eliminado (soft delete)`,
      },
    })

    return NextResponse.json({ message: 'Proyecto eliminado' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Error al eliminar proyecto' }, { status: 500 })
  }
}
