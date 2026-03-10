
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useStaff } from "@/hooks/use-staff";
import { Eye, EyeOff } from "lucide-react";

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, user } = useAuth();
  const { staff } = useStaff();

  // If already logged in, redirect to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password, staff);
      if (success) {
        toast({ title: "Login bem-sucedido", description: "Bem-vindo ao sistema!" });
        navigate("/dashboard");
      } else {
        toast({
          title: "Erro no login",
          description: "Credenciais incorretas ou conta inativa.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Sistema de Gestão Escolar</CardTitle>
            <CardDescription>
              Entre com as suas credenciais para aceder ao sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Utilizador</Label>
                <Input
                  id="username"
                  placeholder="Digite o seu nome de utilizador"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a sua senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "A entrar..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Credenciais de demonstração:</p>
          <p><strong>admin</strong> / admin123 — Administrador (acesso total)</p>
          <p><strong>secretaria</strong> / sec123 — Secretaria</p>
          <p><strong>prof.joao</strong> / prof123 — Professor</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
