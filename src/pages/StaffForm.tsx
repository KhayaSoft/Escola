
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useStaff } from "@/hooks/use-staff";
import { useTeachers } from "@/hooks/use-teachers";
import { toast } from "@/hooks/use-toast";
import { Staff, StaffRole } from "@/lib/types";

const emptyForm = (): Omit<Staff, "id"> => ({
  name: "", email: "", phone: "",
  role: "Secretaria", status: "Ativo",
  username: "", password: "",
  teacherId: undefined,
});

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staff, addStaff, updateStaff } = useStaff();
  const { teachers } = useTeachers();

  const isEditing = id !== "new";
  const [form, setForm] = useState<Omit<Staff, "id">>(emptyForm());
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const found = staff.find(s => s.id === id);
      if (found) {
        const { id: _id, ...rest } = found;
        setForm(rest);
      } else {
        toast({ title: "Erro", description: "Funcionário não encontrado.", variant: "destructive" });
        navigate("/staff");
      }
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.username) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (!isEditing && !form.password) {
      toast({ title: "Erro", description: "A senha é obrigatória para novos funcionários.", variant: "destructive" });
      return;
    }
    // Check username uniqueness
    const duplicate = staff.find(s => s.username === form.username && s.id !== id);
    if (duplicate) {
      toast({ title: "Erro", description: "Este nome de utilizador já está em uso.", variant: "destructive" });
      return;
    }

    const data = { ...form, teacherId: form.role === "Professor" ? form.teacherId : undefined };

    if (isEditing) {
      updateStaff({ id: id!, ...data });
    } else {
      addStaff(data);
    }
    toast({
      title: "Sucesso",
      description: isEditing ? "Funcionário actualizado com sucesso." : "Funcionário adicionado com sucesso."
    });
    navigate("/staff");
  };

  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/staff")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Funcionário" : "Novo Funcionário"}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-3xl">

              <Card>
                <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required placeholder="84xxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label>Função *</Label>
                    <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v as StaffRole }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Secretaria">Secretaria</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.role === "Professor" && (
                    <div className="space-y-2">
                      <Label>Perfil de Professor (opcional)</Label>
                      <Select
                        value={form.teacherId ?? "none"}
                        onValueChange={v => setForm(p => ({ ...p, teacherId: v === "none" ? undefined : v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Ligar a professor" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as "Ativo" | "Inativo" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Credenciais de Acesso</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de Utilizador *</Label>
                    <Input
                      id="username" name="username"
                      value={form.username} onChange={handleChange}
                      required placeholder="Ex: prof.joao"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Senha {isEditing ? "(deixe em branco para manter)" : "*"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password" name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password} onChange={handleChange}
                        required={!isEditing}
                        placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
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
                  <div className="pt-2 text-sm text-muted-foreground rounded-lg bg-muted p-3">
                    <p className="font-medium mb-1">Permissões por função:</p>
                    <ul className="space-y-1">
                      <li><strong>Admin:</strong> acesso total ao sistema</li>
                      <li><strong>Secretaria:</strong> estudantes e pagamentos</li>
                      <li><strong>Professor:</strong> notas e exames</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/staff")}>Cancelar</Button>
                <Button type="submit">{isEditing ? "Guardar Alterações" : "Adicionar Funcionário"}</Button>
              </div>
            </div>
          </form>
      </div>
    </PageLayout>
  );
};

export default StaffForm;
