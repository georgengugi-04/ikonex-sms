import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { generateAdmissionNumber } from '../utils/grading';

const prisma = new PrismaClient();

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { search, streamId, page = 1, limit = 20 } = req.query as any;
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { admissionNo: { contains: search } }
      ];
    }
    if (streamId) where.classStreamId = streamId;
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, include: { classStream: { select: { name: true } } },
        skip: (page - 1) * limit, take: Number(limit), orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);
    return sendSuccess(res, { students, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch { return sendError(res, 'Server error', 500); }
};

export const getStudent = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        classStream: true,
        assessments: { include: { subject: true } }
      }
    });
    if (!student) return sendError(res, 'Student not found', 404);
    return sendSuccess(res, student);
  } catch { return sendError(res, 'Server error', 500); }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const admissionNo = await generateAdmissionNumber();
    const student = await prisma.student.create({
      data: { ...req.body, admissionNo, dateOfBirth: new Date(req.body.dateOfBirth) }
    });
    return sendSuccess(res, student, 'Student registered', 201);
  } catch (err: any) {
    if (err.code === 'P2002') return sendError(res, 'Student already exists');
    return sendError(res, 'Server error', 500);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { ...req.body, dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined }
    });
    return sendSuccess(res, student, 'Student updated');
  } catch { return sendError(res, 'Server error', 500); }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Student deleted');
  } catch { return sendError(res, 'Server error', 500); }
};
