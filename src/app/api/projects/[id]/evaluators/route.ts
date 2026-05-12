import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// POST /api/projects/[id]/evaluators - Assign evaluators
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden asignar evaluadores' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { evaluatorIds } = body

    if (!evaluatorIds || !Array.isArray(evaluatorIds) || evaluatorIds.length === 0) {
      return NextResponse.json({ error: 'Se requiere al menos un evaluador' }, { status: 400 })
    }

    const project = await db.project.findFirst({
      where: { id, deletedAt: null },
    })

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }

    // Verify all evaluators exist and have EVALUATOR role
    const evaluators = await db.user.findMany({
      where: {
        id: { in: evaluatorIds },
        role: 'EVALUATOR',
        active: true,
        deletedAt: null,
      },
    })

    if (evaluators.length !== evaluatorIds.length) {
      return NextResponse.json({ error: 'Algunos evaluadores no son válidos' }, { status: 400 })
    }

    // Check which evaluators are already assigned
    const existingAssignments = await db.projectEvaluator.findMany({
      where: {
        projectId: id,
        evaluatorId: { in: evaluatorIds },
      },
    })

    const existingIds = new Set(existingAssignments.map((e) => e.evaluatorId))
    const newEvaluatorIds = evaluatorIds.filter((eid: string) => !existingIds.has(eid))

    if (newEvaluatorIds.length === 0) {
      return NextResponse.json({ error: 'Todos los evaluadores ya están asignados' }, { status: 400 })
    }

    // Create assignments
    await db.projectEvaluator.createMany({
      data: newEvaluatorIds.map((evaluatorId: string) => ({
        projectId: id,
        evaluatorId,
      })),
    })

    // Create notifications for new evaluators
    await db.notification.createMany({
      data: newEvaluatorIds.map((evaluatorId: string) => ({
        userId: evaluatorId,
        title: 'Nuevo proyecto asignado',
        message: `Se te ha asignado el proyecto "${project.name}" para evaluación`,
        type: 'info',
      })),
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: id,
        action: 'EVALUATORS_ASSIGNED',
        details: `Evaluadores asignados: ${newEvaluatorIds.length} nuevos`,
      },
    })

    const updatedProject = await db.project.findUnique({
      where: { id },
      include: {
        evaluators: {
          include: {
            evaluator: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error assigning evaluators:', error)
    return NextResponse.json({ error: 'Error al asignar evaluadores' }, { status: 500 })
  }
}
