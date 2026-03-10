
export interface Student {
  id: string;
  name: string;
  class: string;         // "1" – "12"
  room: string;          // "A", "B", ...
  gender?: "M" | "F";
  situation?: "Antigo" | "Novo Ingresso";
  parentPhones: string[];
  paymentStatus: { [key: string]: PaymentStatus };
}

export type PaymentStatus = "Pago" | "Em Falta";

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjectIds: string[];
  classes: string[]; // e.g. ["1A", "2B"]
  qualification: string;
  status: "Ativo" | "Inativo";
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  term: 1 | 2 | 3;
  year: number;
  continuousAssessment: number | null; // 0-20
  examGrade: number | null;            // 0-20
  finalGrade: number | null;           // calculated: (2*AC + Exame) / 3
}

export interface Exam {
  id: string;
  name: string;
  subjectId: string;
  teacherId: string;
  classRoom: string; // e.g. "1A" = class + room
  date: string;
  term: 1 | 2 | 3;
  year: number;
  status: "Agendado" | "Realizado" | "Corrigido";
  description?: string;
}

export type StaffRole = "Admin" | "Secretaria" | "Professor";

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: "Ativo" | "Inativo";
  username: string;
  password: string;
  teacherId?: string;
}

// Keep for backward compat
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface SMSWebhookData {
  sender: string;
  message: string;
  timestamp: string;
}
