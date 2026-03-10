
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Student } from "@/lib/types";
import { db } from "@/lib/db";

interface StudentsContextType {
  students: Student[];
  loading: boolean;
  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (s: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | null>(null);

export const StudentsProvider = ({ children }: { children: React.ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    db.students.orderBy("name").toArray().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  const addStudent = useCallback(async (data: Omit<Student, "id">) => {
    const student: Student = { ...data, id: Date.now().toString() };
    await db.students.add(student);
    setStudents(prev => [...prev, student].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const updateStudent = useCallback(async (student: Student) => {
    await db.students.put(student);
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await db.students.delete(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <StudentsContext.Provider value={{ students, loading, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const ctx = useContext(StudentsContext);
  if (!ctx) throw new Error("useStudents deve ser usado dentro de StudentsProvider");
  return ctx;
};
