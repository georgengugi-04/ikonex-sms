export interface User { id: string; name: string; email: string; role: string; }
export interface ClassStream { id: string; name: string; description?: string; _count?: { students: number }; subjects?: ClassSubject[]; }
export interface Subject { id: string; name: string; code: string; description?: string; }
export interface ClassSubject { id: string; subjectId: string; subject: Subject; }
export interface Student {
  id: string; admissionNo: string; firstName: string; lastName: string;
  gender: string; dateOfBirth: string; parentName: string; parentPhone: string;
  email?: string; address?: string; classStreamId: string;
  classStream?: { name: string }; assessments?: Assessment[];
}
export interface Assessment {
  id: string; studentId: string; subjectId: string; catScore: number;
  examScore: number; total: number; grade: string; term: string; academicYear: string;
  subject?: Subject; student?: Student;
}
export interface GradingScale { id?: string; grade: string; minMark: number; maxMark: number; points: number; }
export interface DashboardStats { totalStudents: number; totalStreams: number; totalSubjects: number; averagePerformance: string; }
