import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function calculateGrade(total: number): Promise<string> {
  const scales = await prisma.gradingScale.findMany({ orderBy: { minMark: 'desc' } });
  if (scales.length === 0) {
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    if (total >= 50) return 'D';
    return 'E';
  }
  for (const scale of scales) {
    if (total >= scale.minMark && total <= scale.maxMark) return scale.grade;
  }
  return 'E';
}

export async function generateAdmissionNumber(): Promise<string> {
  const count = await prisma.student.count();
  const year = new Date().getFullYear();
  return `IKA/${year}/${String(count + 1).padStart(4, '0')}`;
}
