import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getGradingScales = async (_req: Request, res: Response) => {
  try {
    const scales = await prisma.gradingScale.findMany({ orderBy: { minMark: 'desc' } });
    return sendSuccess(res, scales);
  } catch { return sendError(res, 'Server error', 500); }
};

export const upsertGradingScales = async (req: Request, res: Response) => {
  try {
    const { scales } = req.body;
    await prisma.gradingScale.deleteMany();
    await prisma.gradingScale.createMany({ data: scales });
    const updated = await prisma.gradingScale.findMany({ orderBy: { minMark: 'desc' } });
    return sendSuccess(res, updated, 'Grading scales updated');
  } catch { return sendError(res, 'Server error', 500); }
};
