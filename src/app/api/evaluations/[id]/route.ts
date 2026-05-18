import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin, isEvaluator } from '@/lib/api-auth'

// GET /api/evaluations/[id] - Get evaluation with scores
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

    const evaluation = await db.evaluation.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            category: { select: { id: true, name: true } },
          },
        },
        evaluator: {
          select: { id: true, name: true, email: true },
        },
        scores: {
          include: {
            criteria: true,
          },
          orderBy: {
            criteria: { order: 'asc' },
          },
        },
      },
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    // Access check: admin, owner of evaluation, or assigned evaluator
    const isOwner = evaluation.evaluatorId === auth.userId
    if (!isAdmin(auth) && !isOwner) {
      return NextResponse.json({ error: 'No tiene acceso a esta evaluación' }, { status: 403 })
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error('Error getting evaluation:', error)
    return NextResponse.json({ error: 'Error al obtener evaluación' }, { status: 500 })
  }
}

// PUT /api/evaluations/[id] - Update evaluation (save draft)
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

    const evaluation = await db.evaluation.findUnique({
      where: { id },
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    // Only owner evaluator or admin can update
    const isOwner = evaluation.evaluatorId === auth.userId
    if (!isAdmin(auth) && !isOwner) {
      return NextResponse.json({ error: 'No tiene permiso para editar esta evaluación' }, { status: 403 })
    }

    // Can't update submitted evaluation
    if (!evaluation.isDraft && !isAdmin(auth)) {
      return NextResponse.json({ error: 'No se puede editar una evaluación ya enviada' }, { status: 400 })
    }

    const body = await request.json()
    const { scores, comments } = body

    // Update scores if provided
    if (scores && Array.isArray(scores)) {
      for (const scoreEntry of scores) {
        const { criteriaId, score, observation } = scoreEntry
        if (!criteriaId) continue

        await db.evaluationScore.upsert({
          where: {
            evaluationId_criteriaId: {
              evaluationId: id,
              criteriaId,
            },
          },
          create: {
            evaluationId: id,
            criteriaId,
            score: score ?? 0,
            maxScore: 0, // Will be set from criteria weight
            observation: observation || null,
          },
          update: {
            ...(score !== undefined && { score }),
            ...(observation !== undefined && { observation }),
          },
        })
      }
    }

    // Recalculate total score
    const updatedScores = await db.evaluationScore.findMany({
      where: { evaluationId: id },
      include: { criteria: true },
    })

    let totalScore = 0
    for (const s of updatedScores) {
      totalScore += s.score
    }

    // Update evaluation
    const updatedEvaluation = await db.evaluation.update({
      where: { id },
      data: {
        totalScore,
        ...(comments !== undefined && { comments }),
      },
      include: {
        project: {
          select: { id: true, name: true, status: true, category: { select: { id: true, name: true } } },
        },
        evaluator: {
          select: { id: true, name: true, email: true },
        },
        scores: {
          include: {
            criteria: true,
          },
          orderBy: {
            criteria: { order: 'asc' },
          },
        },
      },
    })

    return NextResponse.json(updatedEvaluation)
  } catch (error) {
    console.error('Error updating evaluation:', error)
    return NextResponse.json({ error: 'Error al actualizar evaluación' }, { status: 500 })
  }
}

// DELETE /api/evaluations/[id] - Delete evaluation (ADMIN only)
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
      return NextResponse.json({ error: 'Solo administradores pueden eliminar evaluaciones' }, { status: 403 })
    }

    const { id } = await params

    const evaluation = await db.evaluation.findUnique({
      where: { id },
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    // Delete evaluation scores first
    await db.evaluationScore.deleteMany({
      where: { evaluationId: id },
    })

    // Delete the evaluation
    await db.evaluation.delete({
      where: { id },
    })

    // Recalculate project scores
    const remainingEvaluations = await db.evaluation.findMany({
      where: { projectId: evaluation.projectId, isDraft: false },
    })

    if (remainingEvaluations.length > 0) {
      const avgScore = remainingEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / remainingEvaluations.length
      const maxScore = Math.max(...remainingEvaluations.map((e) => e.totalScore))

      await db.project.update({
        where: { id: evaluation.projectId },
        data: {
          averageScore: avgScore,
          totalScore: maxScore,
        },
      })
    } else {
      await db.project.update({
        where: { id: evaluation.projectId },
        data: {
          averageScore: 0,
          totalScore: 0,
        },
      })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: evaluation.projectId,
        action: 'EVALUATION_DELETED',
        details: `Evaluación "${id}" eliminada`,
      },
    })

    return NextResponse.json({ message: 'Evaluación eliminada' })
  } catch (error) {
    console.error('Error deleting evaluation:', error)
    return NextResponse.json({ error: 'Error al eliminar evaluación' }, { status: 500 })
  }
}
