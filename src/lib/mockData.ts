
import { Student, User, Subject, Teacher, Grade, Exam, Staff } from "./types";

// Current date helpers
const currentDate = new Date();
const currentMonth = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
const nextMonth = `${currentDate.getMonth() + 2 > 12 ? 1 : currentDate.getMonth() + 2}-${currentDate.getMonth() + 2 > 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()}`;

export const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const getFormattedMonthYear = (monthIndex: number, year: number) =>
  `${monthNames[monthIndex]} ${year}`;

export const getCurrentMonthYear = () => {
  const now = new Date();
  return getFormattedMonthYear(now.getMonth(), now.getFullYear());
};

export const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getMonth() + 1}-${now.getFullYear()}`;
};

// ─── Subjects ────────────────────────────────────────────────────────────────
export const mockSubjects: Subject[] = [
  { id: "s1",  name: "Português",                    code: "PORT" },
  { id: "s2",  name: "Matemática",                   code: "MAT"  },
  { id: "s3",  name: "Ciências Naturais",             code: "CN"   },
  { id: "s4",  name: "Ciências Sociais",              code: "CS"   },
  { id: "s5",  name: "Inglês",                        code: "ING"  },
  { id: "s6",  name: "Educação Física",               code: "EF"   },
  { id: "s7",  name: "Educação Moral e Cívica",       code: "EMC"  },
  { id: "s8",  name: "Educação Visual e Tecnológica", code: "EVT"  },
  { id: "s9",  name: "Física",                        code: "FIS"  },
  { id: "s10", name: "Química",                       code: "QUI"  },
  { id: "s11", name: "História",                      code: "HIST" },
  { id: "s12", name: "Filosofia",                     code: "FIL"  },
  { id: "s13", name: "Francês",                       code: "FR"   },
  { id: "s14", name: "Geografia",                     code: "GEO"  },
  { id: "s15", name: "TIC",                           code: "TIC"  },
  { id: "s16", name: "Design Gráfico e Digital",      code: "DGD"  },
  { id: "s17", name: "Empreendedorismo",              code: "EMP"  },
];

// ─── Students ────────────────────────────────────────────────────────────────
export const mockStudents: Student[] = [
  {
    id: "1", name: "Ana Silva",
    class: "1", room: "A",
    parentPhones: ["841234567", "851234567"],
    paymentStatus: { [currentMonth]: "Pago", [nextMonth]: "Em Falta" }
  },
  {
    id: "2", name: "Bruno Santos",
    class: "1", room: "A",
    parentPhones: ["842345678"],
    paymentStatus: { [currentMonth]: "Em Falta", [nextMonth]: "Em Falta" }
  },
  {
    id: "3", name: "Carla Mendes",
    class: "1", room: "B",
    parentPhones: ["843456789", "853456789"],
    paymentStatus: { [currentMonth]: "Pago", [nextMonth]: "Em Falta" }
  },
  {
    id: "4", name: "Daniel Ferreira",
    class: "2", room: "A",
    parentPhones: ["844567890"],
    paymentStatus: { [currentMonth]: "Em Falta", [nextMonth]: "Em Falta" }
  },
  {
    id: "5", name: "Eduardo Costa",
    class: "2", room: "A",
    parentPhones: ["845678901"],
    paymentStatus: { [currentMonth]: "Pago", [nextMonth]: "Em Falta" }
  },
  {
    id: "6", name: "Fátima Nhantumbo",
    class: "2", room: "B",
    parentPhones: ["846789012"],
    paymentStatus: { [currentMonth]: "Pago", [nextMonth]: "Pago" }
  },
  {
    id: "7", name: "Gabriel Mondlane",
    class: "3", room: "A",
    parentPhones: ["847890123"],
    paymentStatus: { [currentMonth]: "Em Falta", [nextMonth]: "Em Falta" }
  },
  {
    id: "8", name: "Helena Macuácua",
    class: "3", room: "A",
    parentPhones: ["848901234", "858901234"],
    paymentStatus: { [currentMonth]: "Pago", [nextMonth]: "Em Falta" }
  },
];

// ─── Teachers ────────────────────────────────────────────────────────────────
export const mockTeachers: Teacher[] = [
  {
    id: "t1", name: "Prof. João Cossa",
    email: "joao.cossa@escola.mz", phone: "841111111",
    subjectIds: ["s1", "s7"], classes: ["1A", "1B", "2A"],
    qualification: "Licenciatura em Letras", status: "Ativo"
  },
  {
    id: "t2", name: "Prof. Maria Sitoe",
    email: "maria.sitoe@escola.mz", phone: "842222222",
    subjectIds: ["s2"], classes: ["1A", "1B", "2A", "2B", "3A"],
    qualification: "Licenciatura em Matemática", status: "Ativo"
  },
  {
    id: "t3", name: "Prof. Carlos Machava",
    email: "carlos.machava@escola.mz", phone: "843333333",
    subjectIds: ["s3", "s4"], classes: ["2A", "2B", "3A"],
    qualification: "Licenciatura em Ciências", status: "Ativo"
  },
  {
    id: "t4", name: "Prof. Ana Zunguze",
    email: "ana.zunguze@escola.mz", phone: "844444444",
    subjectIds: ["s5"], classes: ["1A", "2A", "3A"],
    qualification: "Licenciatura em Inglês", status: "Ativo"
  },
  {
    id: "t5", name: "Prof. Pedro Uamusse",
    email: "pedro.uamusse@escola.mz", phone: "845555555",
    subjectIds: ["s6", "s8"], classes: ["1A", "1B", "2A", "2B", "3A"],
    qualification: "Licenciatura em Educação Física", status: "Inativo"
  },
];

// ─── Grades ──────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

export const mockGrades: Grade[] = [
  { id: "g1", studentId: "1", subjectId: "s1", term: 1, year: currentYear, continuousAssessment: 16, examGrade: 14, finalGrade: 15.3 },
  { id: "g2", studentId: "2", subjectId: "s1", term: 1, year: currentYear, continuousAssessment: 10, examGrade: 8,  finalGrade: 9.3  },
  { id: "g3", studentId: "1", subjectId: "s2", term: 1, year: currentYear, continuousAssessment: 18, examGrade: 17, finalGrade: 17.7 },
  { id: "g4", studentId: "2", subjectId: "s2", term: 1, year: currentYear, continuousAssessment: 12, examGrade: 11, finalGrade: 11.7 },
  { id: "g5", studentId: "4", subjectId: "s2", term: 1, year: currentYear, continuousAssessment: 15, examGrade: 13, finalGrade: 14.3 },
  { id: "g6", studentId: "5", subjectId: "s2", term: 1, year: currentYear, continuousAssessment: 9,  examGrade: 7,  finalGrade: 8.3  },
  { id: "g7", studentId: "7", subjectId: "s3", term: 1, year: currentYear, continuousAssessment: 14, examGrade: 16, finalGrade: 14.7 },
  { id: "g8", studentId: "8", subjectId: "s3", term: 1, year: currentYear, continuousAssessment: 19, examGrade: 18, finalGrade: 18.7 },
];

// ─── Exams ───────────────────────────────────────────────────────────────────
const today = new Date();
const offsetDate = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export const mockExams: Exam[] = [
  {
    id: "e1", name: "Exame de Português — 1º Trimestre",
    subjectId: "s1", teacherId: "t1", classRoom: "1A",
    date: offsetDate(-10), term: 1, year: currentYear,
    status: "Corrigido",
    description: "Exame escrito com interpretação e gramática."
  },
  {
    id: "e2", name: "Exame de Matemática — 1º Trimestre",
    subjectId: "s2", teacherId: "t2", classRoom: "1A",
    date: offsetDate(-5), term: 1, year: currentYear,
    status: "Corrigido",
    description: "Aritmética e resolução de problemas."
  },
  {
    id: "e3", name: "Exame de Matemática — 1º Trimestre",
    subjectId: "s2", teacherId: "t2", classRoom: "2A",
    date: offsetDate(-3), term: 1, year: currentYear,
    status: "Realizado",
    description: "Álgebra e geometria básica."
  },
  {
    id: "e4", name: "Exame de Ciências Naturais — 1º Trimestre",
    subjectId: "s3", teacherId: "t3", classRoom: "3A",
    date: offsetDate(7), term: 1, year: currentYear,
    status: "Agendado",
    description: "Ecossistemas e biodiversidade."
  },
  {
    id: "e5", name: "Exame de Inglês — 2º Trimestre",
    subjectId: "s5", teacherId: "t4", classRoom: "1A",
    date: offsetDate(14), term: 2, year: currentYear,
    status: "Agendado",
    description: "Reading comprehension and vocabulary."
  },
  {
    id: "e6", name: "Exame de Matemática — 2º Trimestre",
    subjectId: "s2", teacherId: "t2", classRoom: "3A",
    date: offsetDate(21), term: 2, year: currentYear,
    status: "Agendado",
  },
];

// ─── Staff ───────────────────────────────────────────────────────────────────
export const mockStaff: Staff[] = [
  {
    id: "st1", name: "Administrador",
    email: "admin@escola.mz", phone: "840000001",
    role: "Admin", status: "Ativo",
    username: "admin", password: "admin123",
  },
  {
    id: "st2", name: "Conceição Bila",
    email: "conceicao@escola.mz", phone: "840000002",
    role: "Secretaria", status: "Ativo",
    username: "secretaria", password: "sec123",
  },
  {
    id: "st3", name: "Prof. João Cossa",
    email: "joao.cossa@escola.mz", phone: "841111111",
    role: "Professor", status: "Ativo",
    username: "prof.joao", password: "prof123",
    teacherId: "t1",
  },
  {
    id: "st4", name: "Prof. Maria Sitoe",
    email: "maria.sitoe@escola.mz", phone: "842222222",
    role: "Professor", status: "Ativo",
    username: "prof.maria", password: "prof123",
    teacherId: "t2",
  },
];

// Keep for backward compat
export const mockUsers: User[] = [
  { id: "1", username: "admin", password: "admin123", name: "Administrador" },
];

// ─── Utilities ───────────────────────────────────────────────────────────────
export const getUniqueClasses = (students: Student[]): string[] =>
  Array.from(new Set(students.map(s => s.class))).sort();

export const getUniqueRooms = (students: Student[]): string[] =>
  Array.from(new Set(students.map(s => s.room))).sort();

export const getUniqueClassRooms = (students: Student[]): string[] =>
  Array.from(new Set(students.map(s => `${s.class}${s.room}`))).sort();

export const getPaymentStatistics = (students: Student[], monthKey: string) => {
  const total = students.length;
  const paid = students.filter(s => s.paymentStatus[monthKey] === "Pago").length;
  const unpaid = total - paid;
  const paidPercentage = total > 0 ? (paid / total) * 100 : 0;
  return { total, paid, unpaid, paidPercentage };
};

// Grade utilities (Mozambican formula: NF = (2*AC + Exame) / 3)
export const calculateFinalGrade = (ac: number | null, exam: number | null): number | null => {
  if (ac === null || exam === null) return null;
  return Math.round(((ac * 2 + exam) / 3) * 10) / 10;
};

export const getGradeLabel = (grade: number | null): string => {
  if (grade === null) return "—";
  if (grade < 10) return "Reprovado";
  if (grade < 14) return "Suficiente";
  if (grade < 18) return "Bom";
  return "Muito Bom";
};

export const getGradeColor = (grade: number | null): string => {
  if (grade === null) return "text-muted-foreground";
  if (grade < 10) return "text-red-600 font-semibold";
  if (grade < 14) return "text-yellow-600 font-semibold";
  if (grade < 18) return "text-green-600 font-semibold";
  return "text-blue-600 font-semibold";
};

export const termLabel = (term: 1 | 2 | 3) => `${term}º Trimestre`;
