
import Dexie, { type Table } from "dexie";
import { Student, Teacher, Grade, Exam, Staff } from "./types";
import { mockGrades, mockExams, mockStaff } from "./mockData";
import { seedStudents } from "./seedStudents";
import { seedTeachers } from "./seedTeachers";

export class EscolaDB extends Dexie {
  students!: Table<Student>;
  teachers!: Table<Teacher>;
  grades!:   Table<Grade>;
  exams!:    Table<Exam>;
  staff!:    Table<Staff>;

  constructor() {
    super("EscolaDB");
    this.version(1).stores({
      students: "id, name, class, room, gender, situation",
      teachers: "id, name, status",
      grades:   "id, studentId, subjectId, term, year",
      exams:    "id, subjectId, teacherId, classRoom, term, year, status",
      staff:    "id, username, role, status",
    });
    // Version 2: re-seed students and teachers from real Excel data
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
    // Version 3: updated students list (267 students)
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
  }
}

export const db = new EscolaDB();

// ── Seed on first launch ─────────────────────────────────────────────────────
export async function initDB() {
  const count = await db.students.count();
  if (count === 0) {
    await db.transaction("rw", [db.students, db.teachers, db.grades, db.exams, db.staff], async () => {
      await db.students.bulkAdd(seedStudents);
      await db.teachers.bulkAdd(seedTeachers);
      await db.grades.bulkAdd(mockGrades);
      await db.exams.bulkAdd(mockExams);
      await db.staff.bulkAdd(mockStaff);
    });
  }
}
