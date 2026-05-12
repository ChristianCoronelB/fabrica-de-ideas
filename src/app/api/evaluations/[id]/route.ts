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

    // Get the project's category to check for special rules
    const projectWithCategory = await db.project.findUnique({
      where: { id: evaluation.projectId },
      include: { category: true },
    })

    const isSpecialCategory =
      projectWithCategory?.category?.name === 'Emprendimiento Escolar' ||
      projectWithCategory?.category?.name === 'Poster de Emprendimiento'

    let totalScore = 0
    for (const s of updatedScores) {
      // For special categories, "Viabilidad del Negocio" criterion is not counted
      if (isSpecialCategory && s.criteria.name === 'Viabilidad del Negocio') {
        continue
      }
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
