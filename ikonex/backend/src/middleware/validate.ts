import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: err.issues[0].message });
      }
      next(err);
    }
  };
