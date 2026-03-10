
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Staff } from "@/lib/types";
import { db } from "@/lib/db";

interface StaffContextType {
  staff: Staff[];
  loading: boolean;
  addStaff: (s: Omit<Staff, "id">) => Promise<void>;
  updateStaff: (s: Staff) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}

const StaffContext = createContext<StaffContextType | null>(null);

export const StaffProvider = ({ children }: { children: React.ReactNode }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.staff.toArray().then(data => { setStaff(data); setLoading(false); });
  }, []);

  const addStaff = useCallback(async (data: Omit<Staff, "id">) => {
    const member: Staff = { ...data, id: `st${Date.now()}` };
    await db.staff.add(member);
    setStaff(prev => [...prev, member]);
  }, []);

  const updateStaff = useCallback(async (member: Staff) => {
    await db.staff.put(member);
    setStaff(prev => prev.map(s => s.id === member.id ? member : s));
  }, []);

  const deleteStaff = useCallback(async (id: string) => {
    await db.staff.delete(id);
    setStaff(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <StaffContext.Provider value={{ staff, loading, addStaff, updateStaff, deleteStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff deve ser usado dentro de StaffProvider");
  return ctx;
};
