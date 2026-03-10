
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, X, Plus } from "lucide-react";
import { useTeachers } from "@/hooks/use-teachers";
import { mockSubjects, getUniqueClassRooms } from "@/lib/mockData";
import { useStudents } from "@/hooks/use-students";
import { toast } from "@/hooks/use-toast";
import { Teacher } from "@/lib/types";

const empty = (): Omit<Teacher, "id"> => ({
  name: "", email: "", phone: "",
  subjectIds: [], classes: [],
  qualification: "", status: "Ativo",
});

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teachers, addTeacher, updateTeacher } = useTeachers();
  const { students } = useStudents();

  const isEditing = id !== "new";
  const [form, setForm] = useState<Omit<Teacher, "id">>(empty());
  const [newClass, setNewClass] = useState("");

  const availableClassRooms = getUniqueClassRooms(students);

  useEffect(() => {
    if (isEditing) {
      const t = teachers.find(t => t.id === id);
      if (t) {
        const { id: _id, ...rest } = t;
        setForm(rest);
      } else {
        toast({ title: "Erro", description: "Professor não encontrado.", variant: "destructive" });
        navigate("/teachers");
      }
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleSubject = (subjectId: string) => {
    setForm(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(s => s !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const addClass = () => {
    if (!newClass) return;
    if (form.classes.includes(newClass)) {
      toast({ title: "Aviso", description: "Turma já adicionada.", variant: "destructive" });
      return;
    }
    setForm(prev => ({ ...prev, classes: [...prev.classes, newClass] }));
    setNewClass("");
  };

  const removeClass = (cls: string) => {
    setForm(prev => ({ ...prev, classes: prev.classes.filter(c => c !== cls) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.qualification) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (form.subjectIds.length === 0) {
      toast({ title: "Erro", description: "Selecione pelo menos uma disciplina.", variant: "destructive" });
      return;
    }
    if (isEditing) {
      updateTeacher({ id: id!, ...form });
    } else {
      addTeacher(form);
    }
    toast({
      title: "Sucesso",
      description: isEditing ? "Professor atualizado com sucesso." : "Professor adicionado com sucesso."
    });
    navigate("/teachers");
  };

  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/teachers")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Professor" : "Novo Professor"}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">

              {/* Personal Info */}
              <Card>
                <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
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
                    <Label htmlFor="qualification">Habilitações Académicas *</Label>
                    <Input id="qualification" name="qualification" value={form.qualification} onChange={handleChange} required placeholder="Ex: Licenciatura em Matemática" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v as "Ativo" | "Inativo" }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Subjects & Classes */}
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Disciplinas que Leciona</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockSubjects.map(subj => (
                        <div key={subj.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subj.id}
                            checked={form.subjectIds.includes(subj.id)}
                            onCheckedChange={() => toggleSubject(subj.id)}
                          />
                          <Label htmlFor={subj.id} className="cursor-pointer font-normal">
                            {subj.name} <span className="text-muted-foreground text-xs">({subj.code})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Turmas Atribuídas</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Select value={newClass} onValueChange={setNewClass}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecionar turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClassRooms.map(cr => (
                            <SelectItem key={cr} value={cr}>{cr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addClass}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {form.classes.length > 0 ? form.classes.map(cls => (
                        <Badge key={cls} variant="secondary" className="flex items-center gap-1">
                          Turma {cls}
                          <button type="button" onClick={() => removeClass(cls)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )) : (
                        <p className="text-sm text-muted-foreground">Nenhuma turma adicionada</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => navigate("/teachers")}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Salvar Alterações" : "Adicionar Professor"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
      </div>
    </PageLayout>
  );
};

export default TeacherForm;
