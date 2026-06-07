import { Router } from 'express';
import authRoutes from './auth.routes';
import streamRoutes from './stream.routes';
import studentRoutes from './student.routes';
import subjectRoutes from './subject.routes';
import assessmentRoutes from './assessment.routes';
import gradingRoutes from './grading.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/streams', streamRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/grading', gradingRoutes);
export default router;
