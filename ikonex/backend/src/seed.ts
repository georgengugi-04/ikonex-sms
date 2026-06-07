import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashed = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ikonex.ac.ke' },
    update: {},
    create: { email: 'admin@ikonex.ac.ke', password: hashed, name: 'Admin User', role: 'ADMIN' }
  });

  // Grading scales
  await prisma.gradingScale.deleteMany();
  await prisma.gradingScale.createMany({
    data: [
      { grade: 'A', minMark: 80, maxMark: 100, points: 12 },
      { grade: 'B', minMark: 70, maxMark: 79, points: 11 },
      { grade: 'C', minMark: 60, maxMark: 69, points: 10 },
      { grade: 'D', minMark: 50, maxMark: 59, points: 7 },
      { grade: 'E', minMark: 0, maxMark: 49, points: 4 },
    ]
  });

  // Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({ where: { code: 'MATH' }, update: {}, create: { name: 'Mathematics', code: 'MATH', description: 'Core mathematics' } }),
    prisma.subject.upsert({ where: { code: 'ENG' }, update: {}, create: { name: 'English', code: 'ENG', description: 'English language' } }),
    prisma.subject.upsert({ where: { code: 'KIS' }, update: {}, create: { name: 'Kiswahili', code: 'KIS', description: 'Kiswahili language' } }),
    prisma.subject.upsert({ where: { code: 'PHY' }, update: {}, create: { name: 'Physics', code: 'PHY', description: 'Physics sciences' } }),
    prisma.subject.upsert({ where: { code: 'CHEM' }, update: {}, create: { name: 'Chemistry', code: 'CHEM', description: 'Chemistry sciences' } }),
    prisma.subject.upsert({ where: { code: 'BIO' }, update: {}, create: { name: 'Biology', code: 'BIO', description: 'Biology sciences' } }),
  ]);

  // Streams
  const streams = await Promise.all(['Form 1A', 'Form 1B', 'Form 2A', 'Form 2B'].map(name =>
    prisma.classStream.upsert({ where: { name }, update: {}, create: { name } })
  ));

  // Assign all subjects to all streams
  for (const stream of streams) {
    for (const subject of subjects) {
      await prisma.classSubject.upsert({
        where: { classStreamId_subjectId: { classStreamId: stream.id, subjectId: subject.id } },
        update: {},
        create: { classStreamId: stream.id, subjectId: subject.id }
      });
    }
  }

  console.log('Seed complete. Login: admin@ikonex.ac.ke / Admin@1234');
}

main().finally(() => prisma.$disconnect());
