
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Teacher } from "@/lib/types";
import { db } from "@/lib/db";

interface TeachersContextType {
  teachers: Teacher[];
  loading: boolean;
  addTeacher: (t: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (t: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
}

const TeachersContext = createContext<TeachersContextType | null>(null);

export const TeachersProvider = ({ children }: { children: React.ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    db.teachers.toArray().then(data => { setTeachers(data); setLoading(false); });
  }, []);

  const addTeacher = useCallback(async (data: Omit<Teacher, "id">) => {
    const teacher: Teacher = { ...data, id: `t${Date.now()}` };
    await db.teachers.add(teacher);
    setTeachers(prev => [...prev, teacher]);
  }, []);

  const updateTeacher = useCallback(async (teacher: Teacher) => {
    await db.teachers.put(teacher);
    setTeachers(prev => prev.map(t => t.id === teacher.id ? teacher : t));
  }, []);

  const deleteTeacher = useCallback(async (id: string) => {
    await db.teachers.delete(id);
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <TeachersContext.Provider value={{ teachers, loading, addTeacher, updateTeacher, deleteTeacher }}>
      {children}
    </TeachersContext.Provider>
  );
};

export const useTeachers = () => {
  const ctx = useContext(TeachersContext);
  if (!ctx) throw new Error("useTeachers deve ser usado dentro de TeachersProvider");
  return ctx;
};
