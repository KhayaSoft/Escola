
import { useState, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, ClipboardList } from "lucide-react";
import { useGrades } from "@/hooks/use-grades";
import { useStudents } from "@/hooks/use-students";
import { mockSubjects, getUniqueClassRooms, calculateFinalGrade, getGradeLabel, getGradeColor, termLabel } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TERMS = [1, 2, 3] as const;
const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const GradeInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <Input
    type="number"
    min={0}
    max={20}
    step={0.5}
    className="w-20 text-center"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder="—"
  />
);

const Grades = () => {
  const { students } = useStudents();
  const { grades, upsertGrade } = useGrades();

  const [selectedClassRoom, setSelectedClassRoom] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<1 | 2 | 3>(1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loaded, setLoaded] = useState(false);

  // Inline grade edits: { studentId -> { ac: string, exam: string } }
  const [edits, setEdits] = useState<Record<string, { ac: string; exam: string }>>({});

  const classRooms = getUniqueClassRooms(students);

  const studentsInClass = useMemo(() =>
    students.filter(s => `${s.class}${s.room}` === selectedClassRoom)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [students, selectedClassRoom]
  );

  const handleLoad = () => {
    if (!selectedClassRoom || !selectedSubject) {
      toast({ title: "Atenção", description: "Selecione a turma e a disciplina.", variant: "destructive" });
      return;
    }
    // Prefill edits from existing grades
    const initial: Record<string, { ac: string; exam: string }> = {};
    studentsInClass.forEach(s => {
      const existing = grades.find(
        g => g.studentId === s.id && g.subjectId === selectedSubject &&
             g.term === selectedTerm && g.year === selectedYear
      );
      initial[s.id] = {
        ac:   existing?.continuousAssessment != null ? String(existing.continuousAssessment) : "",
        exam: existing?.examGrade != null ? String(existing.examGrade) : "",
      };
    });
    setEdits(initial);
    setLoaded(true);
  };

  const handleSave = () => {
    let savedCount = 0;
    Object.entries(edits).forEach(([studentId, vals]) => {
      const ac   = vals.ac   !== "" ? parseFloat(vals.ac)   : null;
      const exam = vals.exam !== "" ? parseFloat(vals.exam) : null;
      if (ac !== null || exam !== null) {
        upsertGrade({
          studentId,
          subjectId: selectedSubject,
          term: selectedTerm,
          year: selectedYear,
          continuousAssessment: ac,
          examGrade: exam,
        });
        savedCount++;
      }
    });
    toast({ title: "Notas guardadas", description: `${savedCount} registo(s) actualizados com sucesso.` });
  };

  const computedFinal = (studentId: string) => {
    const vals = edits[studentId];
    if (!vals) return null;
    const ac   = vals.ac   !== "" ? parseFloat(vals.ac)   : null;
    const exam = vals.exam !== "" ? parseFloat(vals.exam) : null;
    return calculateFinalGrade(ac, exam);
  };

  return (
    <PageLayout>
      <div className="p-4 md:p-6">
          <h1 className="text-3xl font-bold mb-6">Lançamento de Notas</h1>

          {/* Filter bar */}
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Selecionar Turma / Disciplina</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Turma</label>
                  <Select value={selectedClassRoom} onValueChange={v => { setSelectedClassRoom(v); setLoaded(false); }}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {classRooms.map(cr => <SelectItem key={cr} value={cr}>{cr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Disciplina</label>
                  <Select value={selectedSubject} onValueChange={v => { setSelectedSubject(v); setLoaded(false); }}>
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="Disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Trimestre</label>
                  <Select value={String(selectedTerm)} onValueChange={v => { setSelectedTerm(Number(v) as 1|2|3); setLoaded(false); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TERMS.map(t => <SelectItem key={t} value={String(t)}>{termLabel(t)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Ano</label>
                  <Select value={String(selectedYear)} onValueChange={v => { setSelectedYear(Number(v)); setLoaded(false); }}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleLoad} className="mb-0.5">Carregar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Grade table */}
          {loaded && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    Turma {selectedClassRoom} — {mockSubjects.find(s => s.id === selectedSubject)?.name} — {termLabel(selectedTerm)} {selectedYear}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fórmula: NF = (2 × AC + Exame) ÷ 3 &nbsp;|&nbsp; Aprovação ≥ 10
                  </p>
                </div>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Notas
                </Button>
              </CardHeader>
              <CardContent>
                {studentsInClass.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum estudante nesta turma.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 pr-4 font-medium">Estudante</th>
                          <th className="py-3 px-4 font-medium text-center">AC (0–20)</th>
                          <th className="py-3 px-4 font-medium text-center">Exame (0–20)</th>
                          <th className="py-3 px-4 font-medium text-center">Nota Final</th>
                          <th className="py-3 pl-4 font-medium text-center">Classificação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsInClass.map(student => {
                          const final = computedFinal(student.id);
                          return (
                            <tr key={student.id} className="border-b hover:bg-muted/30">
                              <td className="py-3 pr-4 font-medium">{student.name}</td>
                              <td className="py-3 px-4 text-center">
                                <GradeInput
                                  value={edits[student.id]?.ac ?? ""}
                                  onChange={v => setEdits(prev => ({
                                    ...prev,
                                    [student.id]: { ...prev[student.id], ac: v }
                                  }))}
                                />
                              </td>
                              <td className="py-3 px-4 text-center">
                                <GradeInput
                                  value={edits[student.id]?.exam ?? ""}
                                  onChange={v => setEdits(prev => ({
                                    ...prev,
                                    [student.id]: { ...prev[student.id], exam: v }
                                  }))}
                                />
                              </td>
                              <td className={cn("py-3 px-4 text-center text-lg", getGradeColor(final))}>
                                {final != null ? final.toFixed(1) : "—"}
                              </td>
                              <td className="py-3 pl-4 text-center">
                                <Badge variant="outline" className={cn(
                                  final === null ? "" :
                                  final < 10  ? "border-red-300 text-red-600 bg-red-50" :
                                  final < 14  ? "border-yellow-300 text-yellow-700 bg-yellow-50" :
                                  final < 18  ? "border-green-300 text-green-700 bg-green-50" :
                                               "border-blue-300 text-blue-700 bg-blue-50"
                                )}>
                                  {getGradeLabel(final)}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!loaded && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <ClipboardList className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">Selecione a turma, disciplina e trimestre para lançar notas.</p>
            </div>
          )}
      </div>
    </PageLayout>
  );
};

export default Grades;
