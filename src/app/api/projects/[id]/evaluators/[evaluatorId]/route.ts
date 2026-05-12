import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// DELETE /api/projects/[id]/evaluators/[evaluatorId] - Remove evaluator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evaluatorId: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden remover evaluadores' }, { status: 403 })
    }

    const { id, evaluatorId } = await params

    const assignment = await db.projectEvaluator.findUnique({
      where: {
        projectId_evaluatorId: {
          projectId: id,
          evaluatorId,
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Asignación no encontrada' }, { status: 404 })
    }

    await db.projectEvaluator.delete({
      where: { id: assignment.id },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: id,
        action: 'EVALUATOR_REMOVED',
        details: `Evaluador ${evaluatorId} removido del proyecto`,
      },
    })

    return NextResponse.json({ message: 'Evaluador removido exitosamente' })
  } catch (error) {
    console.error('Error removing evaluator:', error)
    return NextResponse.json({ error: 'Error al remover evaluador' }, { status: 500 })
  }
}
