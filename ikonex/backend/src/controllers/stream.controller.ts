import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getStreams = async (_req: Request, res: Response) => {
  try {
    const streams = await prisma.classStream.findMany({
      include: {
        _count: { select: { students: true, subjects: true } },
        subjects: { include: { subject: true } }
      },
      orderBy: { name: 'asc' }
    });
    return sendSuccess(res, streams);
  } catch { return sendError(res, 'Server error', 500); }
};

export const getStream = async (req: Request, res: Response) => {
  try {
    const stream = await prisma.classStream.findUnique({
      where: { id: req.params.id },
      include: {
        students: true,
        subjects: { include: { subject: true } },
        _count: { select: { students: true } }
      }
    });
    if (!stream) return sendError(res, 'Stream not found', 404);
    return sendSuccess(res, stream);
  } catch { return sendError(res, 'Server error', 500); }
};

export const createStream = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const stream = await prisma.classStream.create({ data: { name, description } });
    return sendSuccess(res, stream, 'Stream created', 201);
  } catch (err: any) {
    if (err.code === 'P2002') return sendError(res, 'Stream name already exists');
    return sendError(res, 'Server error', 500);
  }
};

export const updateStream = async (req: Request, res: Response) => {
  try {
    const stream = await prisma.classStream.update({
      where: { id: req.params.id },
      data: { name: req.body.name, description: req.body.description }
    });
    return sendSuccess(res, stream, 'Stream updated');
  } catch { return sendError(res, 'Server error', 500); }
};

export const deleteStream = async (req: Request, res: Response) => {
  try {
    await prisma.classStream.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Stream deleted');
  } catch { return sendError(res, 'Server error', 500); }
};

export const assignSubjects = async (req: Request, res: Response) => {
  try {
    const { subjectIds } = req.body;
    await prisma.classSubject.deleteMany({ where: { classStreamId: req.params.id } });
    await prisma.classSubject.createMany({
      data: subjectIds.map((sid: string) => ({ classStreamId: req.params.id, subjectId: sid }))
    });
    return sendSuccess(res, null, 'Subjects assigned');
  } catch { return sendError(res, 'Server error', 500); }
};
