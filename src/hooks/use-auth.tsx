
import { createContext, useContext, useState } from "react";
import { Staff } from "@/lib/types";
import { mockStaff } from "@/lib/mockData";

const STORAGE_KEY = "escola_auth_user";

const loadUser = (): Staff | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};

interface AuthContextType {
  user: Staff | null;
  login: (username: string, password: string, staffList: Staff[]) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Staff | null>(loadUser);

  const login = (username: string, password: string, staffList: Staff[]): boolean => {
    const found = staffList.find(
      s => s.username === username && s.password === password && s.status === "Ativo"
    );
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
