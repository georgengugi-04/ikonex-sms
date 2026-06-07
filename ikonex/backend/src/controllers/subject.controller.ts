import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    return sendSuccess(res, subjects);
  } catch { return sendError(res, 'Server error', 500); }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    return sendSuccess(res, subject, 'Subject created', 201);
  } catch (err: any) {
    if (err.code === 'P2002') return sendError(res, 'Subject code already exists');
    return sendError(res, 'Server error', 500);
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const subject = await prisma.subject.update({ where: { id: req.params.id }, data: req.body });
    return sendSuccess(res, subject, 'Subject updated');
  } catch { return sendError(res, 'Server error', 500); }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Subject deleted');
  } catch { return sendError(res, 'Server error', 500); }
};
