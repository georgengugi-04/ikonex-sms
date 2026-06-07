import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { calculateGrade } from '../utils/grading';

const prisma = new PrismaClient();

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const { studentId, subjectId, catScore, examScore, term, academicYear } = req.body;
    if (catScore < 0 || catScore > 40) return sendError(res, 'CAT score must be 0-40');
    if (examScore < 0 || examScore > 60) return sendError(res, 'Exam score must be 0-60');
    const total = catScore + examScore;
    const grade = await calculateGrade(total);
    const assessment = await prisma.assessment.create({
      data: { studentId, subjectId, catScore, examScore, total, grade, term, academicYear },
      include: { subject: true, student: true }
    });
    return sendSuccess(res, assessment, 'Assessment recorded', 201);
  } catch (err: any) {
    if (err.code === 'P2002') return sendError(res, 'Score already recorded for this student/subject/term');
    return sendError(res, 'Server error', 500);
  }
};

export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const { catScore, examScore } = req.body;
    if (catScore < 0 || catScore > 40) return sendError(res, 'CAT score must be 0-40');
    if (examScore < 0 || examScore > 60) return sendError(res, 'Exam score must be 0-60');
    const total = catScore + examScore;
    const grade = await calculateGrade(total);
    const assessment = await prisma.assessment.update({
      where: { id: req.params.id },
      data: { catScore, examScore, total, grade },
      include: { subject: true }
    });
    return sendSuccess(res, assessment, 'Assessment updated');
  } catch { return sendError(res, 'Server error', 500); }
};

export const getStudentAssessments = async (req: Request, res: Response) => {
  try {
    const { term, academicYear } = req.query as any;
    const where: any = { studentId: req.params.studentId };
    if (term) where.term = term;
    if (academicYear) where.academicYear = academicYear;
    const assessments = await prisma.assessment.findMany({
      where, include: { subject: true }, orderBy: { subject: { name: 'asc' } }
    });
    const total = assessments.reduce((s, a) => s + a.total, 0);
    const average = assessments.length ? total / assessments.length : 0;
    return sendSuccess(res, { assessments, total, average: average.toFixed(1) });
  } catch { return sendError(res, 'Server error', 500); }
};

export const getClassAssessments = async (req: Request, res: Response) => {
  try {
    const { term, academicYear, subjectId } = req.query as any;
    const students = await prisma.student.findMany({
      where: { classStreamId: req.params.streamId },
      include: {
        assessments: {
          where: { ...(term && { term }), ...(academicYear && { academicYear }), ...(subjectId && { subjectId }) },
          include: { subject: true }
        }
      }
    });
    const ranked = students.map(s => {
      const total = s.assessments.reduce((sum, a) => sum + a.total, 0);
      const avg = s.assessments.length ? total / s.assessments.length : 0;
      return { ...s, totalMarks: total, average: avg.toFixed(1) };
    }).sort((a, b) => b.totalMarks - a.totalMarks)
      .map((s, i) => ({ ...s, position: i + 1 }));
    return sendSuccess(res, ranked);
  } catch { return sendError(res, 'Server error', 500); }
};

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [students, streams, subjects, assessments] = await Promise.all([
      prisma.student.count(),
      prisma.classStream.count(),
      prisma.subject.count(),
      prisma.assessment.findMany({ select: { total: true } })
    ]);
    const avg = assessments.length ? assessments.reduce((s, a) => s + a.total, 0) / assessments.length : 0;
    return sendSuccess(res, {
      totalStudents: students,
      totalStreams: streams,
      totalSubjects: subjects,
      averagePerformance: avg.toFixed(1)
    });
  } catch { return sendError(res, 'Server error', 500); }
};
