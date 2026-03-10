
import { useEffect, useState } from "react";
import { initDB } from "@/lib/db";

const AppLoader = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch(e => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
        <p className="text-destructive font-semibold text-lg">Erro ao inicializar a base de dados</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <button className="underline text-sm" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">A inicializar base de dados...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppLoader;
