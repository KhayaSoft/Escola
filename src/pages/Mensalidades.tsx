import { useState, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { useStudents } from "@/hooks/use-students";
import { usePayments, calcBalance, currentMonthKey, monthLabel, prevMonthKey } from "@/hooks/use-payments";
import { Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Search, TrendingDown, TrendingUp, CheckCircle, Trash2 } from "lucide-react";

const CLASS_LABELS: Record<string, string> = {
  "1":"1ª Classe","2":"2ª Classe","3":"3ª Classe","4":"4ª Classe",
  "5":"5ª Classe","6":"6ª Classe","7":"7ª Classe","8":"8ª Classe",
  "9":"9ª Classe","10":"10ª Classe","11":"11ª Classe","12":"12ª Classe",
};

function buildMonthOptions(): { key: string; label: string }[] {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    let m = now.getMonth() + 1 - i;
    let y = now.getFullYear();
    if (m <= 0) { m += 12; y -= 1; }
    const key = `${m}-${y}`;
    opts.push({ key, label: monthLabel(key) });
  }
  return opts;
}

export default function Mensalidades() {
  const { students } = useStudents();
  const { payments, addPayment, deletePayment, reload } = usePayments();

  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [classFilter, setClassFilter] = useState("todas");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  // Manual payment dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStudent, setDialogStudent] = useState<Student | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Detail dialog
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Build row data for selected month
  const rows = useMemo(() => {
    return students
      .filter(s => classFilter === "todas" || s.class === classFilter)
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .map(s => {
        const balance = calcBalance(s, selectedMonth, payments.filter(p => p.studentId === s.id));
        let status: "Pago" | "Parcial" | "Em Falta" | "Crédito";
        if (balance.balance >= 0 && balance.totalPaid + balance.creditFromPrev > 0) status = "Pago";
        else if (balance.balance >= 0 && balance.creditFromPrev > 0) status = "Crédito";
        else if (balance.totalPaid + balance.creditFromPrev > 0) status = "Parcial";
        else status = "Em Falta";
        return { student: s, balance, status };
      })
      .filter(r => {
        if (statusFilter === "todos") return true;
        if (statusFilter === "pago") return r.status === "Pago" || r.status === "Crédito";
        if (statusFilter === "falta") return r.status === "Em Falta" || r.status === "Parcial";
        return true;
      });
  }, [students, payments, selectedMonth, classFilter, search, statusFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const pago = rows.filter(r => r.status === "Pago" || r.status === "Crédito").length;
    const falta = rows.filter(r => r.status === "Em Falta").length;
    const parcial = rows.filter(r => r.status === "Parcial").length;
    const totalRecebido = rows.reduce((s, r) => s + r.balance.totalPaid, 0);
    const totalDivida = rows.filter(r => r.balance.balance < 0)
      .reduce((s, r) => s + Math.abs(r.balance.balance), 0);
    const totalCredito = rows.filter(r => r.balance.balance > 0)
      .reduce((s, r) => s + r.balance.balance, 0);
    return { pago, falta, parcial, totalRecebido, totalDivida, totalCredito };
  }, [rows]);

  const openPayDialog = (student: Student) => {
    setDialogStudent(student);
    setPayAmount("");
    setPayNotes("");
    setDialogOpen(true);
  };

  const handlePay = async () => {
    if (!dialogStudent) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const balance = await addPayment(dialogStudent, amount, selectedMonth, "manual", { notes: payNotes });
    setSaving(false);
    setDialogOpen(false);

    const diff = balance.balance;
    if (diff >= 0) {
      toast({
        title: "Pagamento registado",
        description: diff > 0
          ? `${dialogStudent.name} — Pago. Crédito de ${diff.toFixed(2)} MT para o próximo mês.`
          : `${dialogStudent.name} — Mensalidade quitada.`,
      });
    } else {
      toast({
        title: "Pagamento parcial registado",
        description: `${dialogStudent.name} — Ainda deve ${Math.abs(diff).toFixed(2)} MT.`,
        variant: "destructive",
      });
    }
    await reload();
  };

  const handleDelete = async (paymentId: string) => {
    await deletePayment(paymentId);
    await reload();
    toast({ title: "Pagamento removido" });
  };

  const statusBadge = (status: string) => {
    if (status === "Pago") return <Badge className="bg-green-600">Pago</Badge>;
    if (status === "Crédito") return <Badge className="bg-blue-600">Crédito</Badge>;
    if (status === "Parcial") return <Badge className="bg-yellow-500 text-white">Parcial</Badge>;
    return <Badge variant="destructive">Em Falta</Badge>;
  };

  const detailPayments = useMemo(() =>
    detailStudent ? payments.filter(p => p.studentId === detailStudent.id && p.monthKey === selectedMonth) : [],
    [detailStudent, payments, selectedMonth]);

  return (
    <PageLayout>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-3xl font-bold">Gestão de Mensalidades</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.pago}</p>
              <p className="text-xs text-muted-foreground">Pagos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{stats.parcial}</p>
              <p className="text-xs text-muted-foreground">Parcial</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-destructive">{stats.falta}</p>
              <p className="text-xs text-muted-foreground">Em Falta</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-lg font-bold text-green-700">{stats.totalRecebido.toFixed(0)} MT</p>
              <p className="text-xs text-muted-foreground">Recebido</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-lg font-bold text-destructive">{stats.totalDivida.toFixed(0)} MT</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <TrendingDown className="h-3 w-3" /> Dívida
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-lg font-bold text-blue-600">{stats.totalCredito.toFixed(0)} MT</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> Crédito
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-40">
                <Label className="text-xs mb-1 block">Mês</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(o => (
                      <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-40">
                <Label className="text-xs mb-1 block">Classe</Label>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as classes</SelectItem>
                    {Object.entries(CLASS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-40">
                <Label className="text-xs mb-1 block">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="falta">Em Falta / Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-48">
                <Label className="text-xs mb-1 block">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Nome do aluno..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alunos — {monthLabel(selectedMonth)}</CardTitle>
            <CardDescription>{rows.length} alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead className="text-right">Mensalidade</TableHead>
                    <TableHead className="text-right">Crédito Anterior</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(({ student: s, balance, status }) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setDetailStudent(s)}
                    >
                      <TableCell className="font-medium">
                        {s.name}
                        {s.discountPercent && (
                          <Badge variant="outline" className="ml-2 text-xs">50%</Badge>
                        )}
                      </TableCell>
                      <TableCell>{CLASS_LABELS[s.class]}</TableCell>
                      <TableCell className="text-right">{balance.amountDue.toFixed(2)} MT</TableCell>
                      <TableCell className="text-right">
                        {balance.creditFromPrev > 0
                          ? <span className="text-blue-600">+{balance.creditFromPrev.toFixed(2)} MT</span>
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {balance.totalPaid > 0
                          ? <span className="text-green-700">{balance.totalPaid.toFixed(2)} MT</span>
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {balance.balance >= 0
                          ? <span className="text-green-700">+{balance.balance.toFixed(2)} MT</span>
                          : <span className="text-destructive">{balance.balance.toFixed(2)} MT</span>}
                      </TableCell>
                      <TableCell>{statusBadge(status)}</TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => openPayDialog(s)}>
                          <PlusCircle className="mr-1 h-3 w-3" /> Registar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual payment dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registar Pagamento Manual</DialogTitle>
          </DialogHeader>
          {dialogStudent && (
            <div className="space-y-4">
              <div className="bg-muted rounded p-3 text-sm space-y-1">
                <p><strong>{dialogStudent.name}</strong> — {CLASS_LABELS[dialogStudent.class]}</p>
                <p>Mensalidade: <strong>{dialogStudent.monthlyFee.toFixed(2)} MT</strong></p>
                <p>Mês: <strong>{monthLabel(selectedMonth)}</strong></p>
                {(() => {
                  const b = calcBalance(dialogStudent, selectedMonth, payments.filter(p => p.studentId === dialogStudent.id));
                  if (b.totalPaid > 0 || b.creditFromPrev > 0) return (
                    <p>Já pago: <strong>{b.totalPaid.toFixed(2)} MT</strong>
                      {b.creditFromPrev > 0 && ` + crédito ${b.creditFromPrev.toFixed(2)} MT`}
                      {b.balance < 0 && <> · Falta: <span className="text-destructive font-bold">{Math.abs(b.balance).toFixed(2)} MT</span></>}
                    </p>
                  );
                  return null;
                })()}
              </div>
              <div className="space-y-2">
                <Label>Valor (MT)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 1890.00"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Input
                  placeholder="Ex: Referência de pagamento"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handlePay} disabled={saving}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {saving ? "A guardar…" : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog — show payments for a student in this month */}
      <Dialog open={!!detailStudent} onOpenChange={open => { if (!open) setDetailStudent(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {detailStudent?.name} — {monthLabel(selectedMonth)}
            </DialogTitle>
          </DialogHeader>
          {detailStudent && (() => {
            const b = calcBalance(detailStudent, selectedMonth, payments.filter(p => p.studentId === detailStudent.id));
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Mensalidade</p>
                    <p className="font-bold">{b.amountDue.toFixed(2)} MT</p>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Crédito anterior</p>
                    <p className="font-bold text-blue-600">+{b.creditFromPrev.toFixed(2)} MT</p>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Total pago</p>
                    <p className="font-bold text-green-700">{b.totalPaid.toFixed(2)} MT</p>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className={`font-bold ${b.balance >= 0 ? "text-green-700" : "text-destructive"}`}>
                      {b.balance >= 0 ? "+" : ""}{b.balance.toFixed(2)} MT
                    </p>
                  </div>
                </div>
                {detailPayments.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Fonte</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailPayments.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs">
                              {new Date(p.date).toLocaleDateString("pt-MZ")}
                            </TableCell>
                            <TableCell className="font-medium">{p.amount.toFixed(2)} MT</TableCell>
                            <TableCell>
                              <Badge variant={p.source === "sms" ? "default" : "outline"}>
                                {p.source === "sms" ? "M-Pesa" : "Manual"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum pagamento registado este mês.</p>
                )}
                <Button className="w-full" onClick={() => { setDetailStudent(null); openPayDialog(detailStudent); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Registar Pagamento
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
