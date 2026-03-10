
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash, CalendarCheck, CheckCircle, Clock, BookOpen } from "lucide-react";
import { useExams } from "@/hooks/use-exams";
import { useTeachers } from "@/hooks/use-teachers";
import { useStudents } from "@/hooks/use-students";
import { mockSubjects, getUniqueClassRooms, termLabel } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { Exam } from "@/lib/types";
import { cn } from "@/lib/utils";

const TERMS = [1, 2, 3] as const;
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const statusConfig = {
  Agendado:  { label: "Agendado",  icon: Clock,        cls: "border-blue-300 text-blue-700 bg-blue-50"   },
  Realizado: { label: "Realizado", icon: CheckCircle,   cls: "border-yellow-300 text-yellow-700 bg-yellow-50" },
  Corrigido: { label: "Corrigido", icon: CalendarCheck, cls: "border-green-300 text-green-700 bg-green-50" },
};

const emptyForm = (): Omit<Exam, "id"> => ({
  name: "", subjectId: "", teacherId: "", classRoom: "",
  date: "", term: 1, year: currentYear,
  status: "Agendado", description: "",
});

const Exams = () => {
  const navigate = useNavigate();
  const { exams, addExam, updateExam, deleteExam } = useExams();
  const { teachers } = useTeachers();
  const { students } = useStudents();

  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [form, setForm] = useState<Omit<Exam, "id">>(emptyForm());
  const [toDelete, setToDelete] = useState<string | null>(null);

  const classRooms = getUniqueClassRooms(students);

  const filtered = exams.filter(e => {
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchClass  = classFilter  === "all" || e.classRoom === classFilter;
    return matchStatus && matchClass;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openCreate = () => {
    setEditingExam(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    const { id: _id, ...rest } = exam;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.subjectId || !form.teacherId || !form.classRoom || !form.date) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (editingExam) {
      updateExam({ id: editingExam.id, ...form });
      toast({ title: "Exame actualizado", description: "Alterações guardadas com sucesso." });
    } else {
      addExam(form);
      toast({ title: "Exame criado", description: "O exame foi agendado com sucesso." });
    }
    setDialogOpen(false);
  };

  const advanceStatus = (exam: Exam) => {
    const next: Exam["status"] =
      exam.status === "Agendado"  ? "Realizado" :
      exam.status === "Realizado" ? "Corrigido" : "Corrigido";
    updateExam({ ...exam, status: next });
    toast({ title: "Estado actualizado", description: `Exame marcado como "${next}".` });
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("pt-MZ") : "—";

  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Exames</h1>
            <Button onClick={openCreate}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agendar Exame
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Realizado">Realizado</SelectItem>
                <SelectItem value="Corrigido">Corrigido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classRooms.map(cr => <SelectItem key={cr} value={cr}>{cr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Exam cards */}
          {filtered.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(exam => {
                const subject = mockSubjects.find(s => s.id === exam.subjectId);
                const teacher = teachers.find(t => t.id === exam.teacherId);
                const cfg = statusConfig[exam.status];
                const StatusIcon = cfg.icon;
                const isPast = new Date(exam.date) < new Date();

                return (
                  <Card key={exam.id} className={cn("relative", isPast && exam.status === "Agendado" && "border-orange-200 bg-orange-50/30")}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base leading-snug">{exam.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Turma {exam.classRoom} • {termLabel(exam.term)} {exam.year}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("shrink-0", cfg.cls)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{subject?.name ?? "—"}</span>
                        </div>
                        <div className="flex gap-2">
                          <CalendarCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{formatDate(exam.date)}</span>
                        </div>
                        {teacher && (
                          <p className="text-muted-foreground">{teacher.name}</p>
                        )}
                        {exam.description && (
                          <p className="text-muted-foreground text-xs italic">{exam.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        {exam.status !== "Corrigido" && (
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => advanceStatus(exam)}>
                            Marcar como {exam.status === "Agendado" ? "Realizado" : "Corrigido"}
                          </Button>
                        )}
                        {exam.status === "Realizado" && (
                          <Button size="sm" className="flex-1 text-xs" onClick={() => navigate("/grades")}>
                            Lançar Notas
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(exam)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setToDelete(exam.id)}>
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarCheck className="h-14 w-14 text-muted-foreground mb-4 opacity-40" />
              <h2 className="text-xl font-medium mb-2">Nenhum exame encontrado</h2>
              <p className="text-muted-foreground mb-6">Agende o primeiro exame ou ajuste os filtros.</p>
              <Button onClick={openCreate}>Agendar Exame</Button>
            </div>
          )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingExam ? "Editar Exame" : "Agendar Novo Exame"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome do Exame *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Exame de Matemática — 1º Trimestre" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Disciplina *</Label>
                <Select value={form.subjectId} onValueChange={v => setForm(p => ({ ...p, subjectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Disciplina" /></SelectTrigger>
                  <SelectContent>
                    {mockSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Turma *</Label>
                <Select value={form.classRoom} onValueChange={v => setForm(p => ({ ...p, classRoom: v }))}>
                  <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
                  <SelectContent>
                    {classRooms.map(cr => <SelectItem key={cr} value={cr}>{cr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Professor *</Label>
              <Select value={form.teacherId} onValueChange={v => setForm(p => ({ ...p, teacherId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar professor" /></SelectTrigger>
                <SelectContent>
                  {teachers.filter(t => t.status === "Ativo").map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Trimestre</Label>
                <Select value={String(form.term)} onValueChange={v => setForm(p => ({ ...p, term: Number(v) as 1|2|3 }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TERMS.map(t => <SelectItem key={t} value={String(t)}>{t}º Trim.</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={String(form.year)} onValueChange={v => setForm(p => ({ ...p, year: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingExam && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as Exam["status"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agendado">Agendado</SelectItem>
                    <SelectItem value="Realizado">Realizado</SelectItem>
                    <SelectItem value="Corrigido">Corrigido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Tópicos abordados, instruções, etc."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingExam ? "Guardar" : "Agendar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Exame</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este exame? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteExam(toDelete!); setToDelete(null); toast({ title: "Exame removido" }); }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Exams;
