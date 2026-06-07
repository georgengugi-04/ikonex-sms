import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendError(res, 'Invalid credentials', 401);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return sendError(res, 'Invalid credentials', 401);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    return sendSuccess(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
  } catch (err) {
    return sendError(res, 'Server error', 500);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return sendError(res, 'User already exists');
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, name, role } });
    return sendSuccess(res, { id: user.id, name: user.name, email: user.email }, 'User created', 201);
  } catch (err) {
    return sendError(res, 'Server error', 500);
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, role: true } });
    return sendSuccess(res, user);
  } catch {
    return sendError(res, 'Server error', 500);
  }
};
