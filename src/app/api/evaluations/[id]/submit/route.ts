import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isEvaluator } from '@/lib/api-auth'

// PATCH /api/evaluations/[id]/submit - Submit final evaluation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isEvaluator(auth)) {
      return NextResponse.json({ error: 'Solo evaluadores pueden enviar evaluaciones' }, { status: 403 })
    }

    const { id } = await params

    const evaluation = await db.evaluation.findUnique({
      where: { id },
      include: {
        project: { include: { category: true } },
      },
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    // Must be the owner
    if (evaluation.evaluatorId !== auth.userId) {
      return NextResponse.json({ error: 'Solo el evaluador asignado puede enviar esta evaluación' }, { status: 403 })
    }

    // Must be a draft
    if (!evaluation.isDraft) {
      return NextResponse.json({ error: 'Esta evaluación ya fue enviada' }, { status: 400 })
    }

    // Recalculate total score before submitting
    const scores = await db.evaluationScore.findMany({
      where: { evaluationId: id },
      include: { criteria: true },
    })

    const isSpecialCategory =
      evaluation.project.category?.name === 'Emprendimiento Escolar' ||
      evaluation.project.category?.name === 'Poster de Emprendimiento'

    let totalScore = 0
    for (const s of scores) {
      if (isSpecialCategory && s.criteria.name === 'Viabilidad del Negocio') {
        continue
      }
      totalScore += s.score
    }

    // Submit evaluation
    const updatedEvaluation = await db.evaluation.update({
      where: { id },
      data: {
        isDraft: false,
        submittedAt: new Date(),
        totalScore,
      },
    })

    // Recalculate project averageScore (average of all non-draft evaluations)
    const nonDraftEvaluations = await db.evaluation.findMany({
      where: {
        projectId: evaluation.projectId,
        isDraft: false,
      },
      select: { totalScore: true },
    })

    const avgScore =
      nonDraftEvaluations.length > 0
        ? nonDraftEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / nonDraftEvaluations.length
        : 0

    // Find the max totalScore among all evaluations for totalScore
    const allEvaluations = await db.evaluation.findMany({
      where: { projectId: evaluation.projectId },
      select: { totalScore: true },
    })

    const maxScore =
      allEvaluations.length > 0
        ? Math.max(...allEvaluations.map((e) => e.totalScore))
        : 0

    await db.project.update({
      where: { id: evaluation.projectId },
      data: {
        averageScore: Math.round(avgScore * 100) / 100,
        totalScore: Math.round(maxScore * 100) / 100,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        projectId: evaluation.projectId,
        action: 'EVALUATION_SUBMITTED',
        details: `Evaluación enviada para el proyecto "${evaluation.project.name}" con puntaje ${totalScore}`,
      },
    })

    // Notification for project owner
    await db.notification.create({
      data: {
        userId: evaluation.project.ownerId ?? '',
        title: 'Nueva evaluación recibida',
        message: `Tu proyecto "${evaluation.project.name}" ha recibido una nueva evaluación`,
        type: 'info',
      },
    })

    return NextResponse.json(updatedEvaluation)
  } catch (error) {
    console.error('Error submitting evaluation:', error)
    return NextResponse.json({ error: 'Error al enviar evaluación' }, { status: 500 })
  }
}
