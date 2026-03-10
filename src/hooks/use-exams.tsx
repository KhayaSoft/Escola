
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Exam } from "@/lib/types";
import { db } from "@/lib/db";

interface ExamsContextType {
  exams: Exam[];
  loading: boolean;
  addExam: (e: Omit<Exam, "id">) => Promise<void>;
  updateExam: (e: Exam) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
}

const ExamsContext = createContext<ExamsContextType | null>(null);

export const ExamsProvider = ({ children }: { children: React.ReactNode }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.exams.toArray().then(data => { setExams(data); setLoading(false); });
  }, []);

  const addExam = useCallback(async (data: Omit<Exam, "id">) => {
    const exam: Exam = { ...data, id: `e${Date.now()}` };
    await db.exams.add(exam);
    setExams(prev => [...prev, exam]);
  }, []);

  const updateExam = useCallback(async (exam: Exam) => {
    await db.exams.put(exam);
    setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
  }, []);

  const deleteExam = useCallback(async (id: string) => {
    await db.exams.delete(id);
    setExams(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <ExamsContext.Provider value={{ exams, loading, addExam, updateExam, deleteExam }}>
      {children}
    </ExamsContext.Provider>
  );
};

export const useExams = () => {
  const ctx = useContext(ExamsContext);
  if (!ctx) throw new Error("useExams deve ser usado dentro de ExamsProvider");
  return ctx;
};
