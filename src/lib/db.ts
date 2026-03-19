
import Dexie, { type Table } from "dexie";
import { Student, Teacher, Grade, Exam, Staff, PaymentRecord } from "./types";
import { mockGrades, mockExams, mockStaff } from "./mockData";
import { seedStudents } from "./seedStudents";
import { seedTeachers } from "./seedTeachers";
import { seedPayments } from "./seedPayments";

export class EscolaDB extends Dexie {
  students!: Table<Student>;
  teachers!: Table<Teacher>;
  grades!:   Table<Grade>;
  exams!:    Table<Exam>;
  staff!:    Table<Staff>;
  payments!: Table<PaymentRecord>;

  constructor() {
    super("EscolaDB");
    this.version(1).stores({
      students: "id, name, class, room, gender, situation",
      teachers: "id, name, status",
      grades:   "id, studentId, subjectId, term, year",
      exams:    "id, subjectId, teacherId, classRoom, term, year, status",
      staff:    "id, username, role, status",
    });
    this.version(2).stores({
      students: "id, name, class, room, gender, situation",
      teachers: "id, name, status",
      grades:   "id, studentId, subjectId, term, year",
      exams:    "id, subjectId, teacherId, classRoom, term, year, status",
      staff:    "id, username, role, status",
    }).upgrade(async tx => {
      await tx.table("students").clear();
      await tx.table("teachers").clear();
      await tx.table("students").bulkAdd(seedStudents);
      await tx.table("teachers").bulkAdd(seedTeachers);
    });
    this.version(3).stores({
      students: "id, name, class, room, gender, situation",
      teachers: "id, name, status",
      grades:   "id, studentId, subjectId, term, year",
      exams:    "id, subjectId, teacherId, classRoom, term, year, status",
      staff:    "id, username, role, status",
    }).upgrade(async tx => {
      await tx.table("students").clear();
      await tx.table("students").bulkAdd(seedStudents);
    });
    // Version 4: add payments table + re-seed students with monthlyFee & phones
    this.version(4).stores({
      students: "id, name, class, room, gender, situation",
      teachers: "id, name, status",
      grades:   "id, studentId, subjectId, term, year",
      exams:    "id, subjectId, teacherId, classRoom, term, year, status",
      staff:    "id, username, role, status",
      payments: "id, studentId, monthKey, date, source",
    }).upgrade(async tx => {
      await tx.table("students").clear();
      await tx.table("students").bulkAdd(seedStudents);
    });
    // Version 5: seed historical payments from Pagamentos.xlsx
    this.version(5).stores({
      students: "id, name, class, room, gender, situation",
      teachers: "id, name, status",
      grades:   "id, studentId, subjectId, term, year",
      exams:    "id, subjectId, teacherId, classRoom, term, year, status",
      staff:    "id, username, role, status",
      payments: "id, studentId, monthKey, date, source",
    }).upgrade(async tx => {
      await tx.table("students").clear();
      await tx.table("students").bulkAdd(seedStudents);
      await tx.table("payments").clear();
      await tx.table("payments").bulkAdd(seedPayments);
    });
  }
}

export const db = new EscolaDB();

// ── Seed on first launch ─────────────────────────────────────────────────────
export async function initDB() {
  const count = await db.students.count();
  if (count === 0) {
    await db.transaction("rw", [db.students, db.teachers, db.grades, db.exams, db.staff, db.payments], async () => {
      await db.students.bulkAdd(seedStudents);
      await db.teachers.bulkAdd(seedTeachers);
      await db.grades.bulkAdd(mockGrades);
      await db.exams.bulkAdd(mockExams);
      await db.staff.bulkAdd(mockStaff);
      await db.payments.bulkAdd(seedPayments);
    });
  }
}
