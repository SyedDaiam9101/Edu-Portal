import { prisma } from '../prisma/client';

type GpaResult = {
  gpa: number;
  examsTaken: number;
};

function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function scoreToGpa(percent: number) {
  if (percent >= 90) return 4.0;
  if (percent >= 80) return 3.0;
  if (percent >= 70) return 2.0;
  if (percent >= 60) return 1.0;
  return 0.0;
}

export const examService = {
  async calculateStudentGPA(studentId: string): Promise<GpaResult> {
    const results = await prisma.examResult.findMany({
      where: { studentId },
      select: {
        score: true,
        exam: { select: { maxScore: true } },
      },
    });

    if (results.length === 0) {
      return { gpa: 0, examsTaken: 0 };
    }

    let total = 0;
    let count = 0;

    for (const result of results) {
      const score = toNumber(result.score);
      const maxScore = toNumber(result.exam.maxScore);
      if (maxScore <= 0) continue;
      const percent = (score / maxScore) * 100;
      total += scoreToGpa(percent);
      count += 1;
    }

    const gpa = count === 0 ? 0 : Math.round((total / count) * 100) / 100;
    return { gpa, examsTaken: count };
  },
};
