
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Grade } from "@/lib/types";
import { calculateFinalGrade } from "@/lib/mockData";
import { db } from "@/lib/db";

interface GradesContextType {
  grades: Grade[];
  loading: boolean;
  upsertGrade: (g: Omit<Grade, "id" | "finalGrade">) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  getGrade: (studentId: string, subjectId: string, term: 1 | 2 | 3, year: number) => Grade | undefined;
}

const GradesContext = createContext<GradesContextType | null>(null);

export const GradesProvider = ({ children }: { children: React.ReactNode }) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.grades.toArray().then(data => { setGrades(data); setLoading(false); });
  }, []);

  const upsertGrade = useCallback(async (data: Omit<Grade, "id" | "finalGrade">) => {
    const finalGrade = calculateFinalGrade(data.continuousAssessment, data.examGrade);
    const existing = grades.find(
      g => g.studentId === data.studentId && g.subjectId === data.subjectId &&
           g.term === data.term && g.year === data.year
    );
    if (existing) {
      const updated = { ...existing, ...data, finalGrade };
      await db.grades.put(updated);
      setGrades(prev => prev.map(g => g.id === existing.id ? updated : g));
    } else {
      const grade: Grade = { ...data, id: `g${Date.now()}_${Math.random()}`, finalGrade };
      await db.grades.add(grade);
      setGrades(prev => [...prev, grade]);
    }
  }, [grades]);

  const deleteGrade = useCallback(async (id: string) => {
    await db.grades.delete(id);
    setGrades(prev => prev.filter(g => g.id !== id));
  }, []);

  const getGrade = useCallback((studentId: string, subjectId: string, term: 1 | 2 | 3, year: number) =>
    grades.find(g => g.studentId === studentId && g.subjectId === subjectId &&
                     g.term === term && g.year === year),
  [grades]);

  return (
    <GradesContext.Provider value={{ grades, loading, upsertGrade, deleteGrade, getGrade }}>
      {children}
    </GradesContext.Provider>
  );
};

export const useGrades = () => {
  const ctx = useContext(GradesContext);
  if (!ctx) throw new Error("useGrades deve ser usado dentro de GradesProvider");
  return ctx;
};
