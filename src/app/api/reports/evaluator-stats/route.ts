import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, isAdmin } from '@/lib/api-auth'

// GET /api/reports/evaluator-stats - Evaluator performance stats
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isAdmin(auth)) {
      return NextResponse.json({ error: 'Solo administradores pueden ver reportes' }, { status: 403 })
    }

    const evaluators = await db.user.findMany({
      where: {
        role: 'EVALUATOR',
        active: true,
        deletedAt: null,
      },
      include: {
        assignedProjects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                category: { select: { name: true } },
              },
            },
          },
        },
        evaluations: {
          include: {
            project: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const stats = evaluators.map((evaluator) => {
      const totalAssigned = evaluator.assignedProjects.length
      const totalEvaluations = evaluator.evaluations.length
      const submittedEvaluations = evaluator.evaluations.filter((e) => !e.isDraft)
      const draftEvaluations = evaluator.evaluations.filter((e) => e.isDraft)
      const pendingCount = totalAssigned - totalEvaluations

      const avgScore =
        submittedEvaluations.length > 0
          ? submittedEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / submittedEvaluations.length
          : 0

      // Time to evaluate (average time between assignment and submission)
      const evaluationTimes = submittedEvaluations
        .filter((e) => e.submittedAt)
        .map((e) => {
          const assignment = evaluator.assignedProjects.find(
            (a) => a.projectId === e.projectId
          )
          if (assignment) {
            return new Date(e.submittedAt!).getTime() - new Date(assignment.assignedAt).getTime()
          }
          return null
        })
        .filter((t): t is number => t !== null)

      const avgTimeMs =
        evaluationTimes.length > 0
          ? evaluationTimes.reduce((sum, t) => sum + t, 0) / evaluationTimes.length
          : 0

      return {
        evaluatorId: evaluator.id,
        evaluatorName: evaluator.name,
        evaluatorEmail: evaluator.email,
        totalAssigned,
        totalEvaluations,
        submittedCount: submittedEvaluations.length,
        draftCount: draftEvaluations.length,
        pendingCount: Math.max(0, pendingCount),
        averageScore: Math.round(avgScore * 100) / 100,
        averageTimeMs,
        averageTimeDays: Math.round((avgTimeMs / (1000 * 60 * 60 * 24)) * 100) / 100,
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting evaluator stats:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas de evaluadores' }, { status: 500 })
  }
}
