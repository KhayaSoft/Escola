
import { useState, useEffect, useCallback } from "react";
import PageLayout from "@/components/PageLayout";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  RefreshCw,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Settings,
} from "lucide-react";
import { useStudents } from "@/hooks/use-students";
import { Student } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SmsPayment {
  id: number;
  transaction_id: string | null;
  sender_account: string;
  sender_name: string | null;
  amount: number;
  sms_time: string | null;
  sms_date: string | null;
  raw_message: string;
  received_at: string;
  status: "pending" | "confirmed" | "dismissed";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// Normalise a phone number to digits only, remove leading zeros / country code
function normalisePhone(p: string) {
  return p.replace(/\D/g, "").replace(/^258/, "").replace(/^0/, "");
}

// Build the month key (M-YYYY) for the current or SMS date
function monthKeyFromSmsDate(smsDate: string | null): string {
  if (smsDate) {
    // format: DD/MM/YYYY
    const [, mm, yyyy] = smsDate.split("/");
    return `${parseInt(mm, 10)}-${yyyy}`;
  }
  const now = new Date();
  return `${now.getMonth() + 1}-${now.getFullYear()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-MZ")} ${d.toLocaleTimeString("pt-MZ")}`;
}

const BACKEND_URL_KEY = "escola_backend_url";
const DEFAULT_BACKEND = "";

// ── Component ─────────────────────────────────────────────────────────────────
const SMSWebhook = () => {
  const { students, updateStudent } = useStudents();

  const [backendUrl, setBackendUrl] = useState<string>(
    () => localStorage.getItem(BACKEND_URL_KEY) || DEFAULT_BACKEND
  );
  const [backendInput, setBackendInput] = useState(backendUrl);
  const [connected, setConnected] = useState<boolean | null>(null);

  const [payments, setPayments] = useState<SmsPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Save backend URL ──────────────────────────────────────────────────────
  const saveBackendUrl = () => {
    const url = backendInput.replace(/\/$/, "");
    setBackendUrl(url);
    localStorage.setItem(BACKEND_URL_KEY, url);
    toast({ title: "URL guardada", description: url });
  };

  // ── Health check ──────────────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(4000) });
      setConnected(res.ok);
    } catch {
      setConnected(false);
    }
  }, [backendUrl]);

  // ── Fetch payments ────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/sms-payments`, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error("Falha ao carregar pagamentos");
      const data: SmsPayment[] = await res.json();
      setPayments(data);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // ── Auto-poll every 30 s ──────────────────────────────────────────────────
  useEffect(() => {
    checkHealth();
    fetchPayments();
    const interval = setInterval(fetchPayments, 30_000);
    return () => clearInterval(interval);
  }, [checkHealth, fetchPayments]);

  // ── Find matching student by phone ────────────────────────────────────────
  const findStudent = (senderAccount: string): Student | undefined => {
    const needle = normalisePhone(senderAccount);
    return students.find((s) =>
      s.parentPhones.some((p) => normalisePhone(p) === needle)
    );
  };

  // ── Confirm payment ───────────────────────────────────────────────────────
  const handleConfirm = async (payment: SmsPayment) => {
    const student = findStudent(payment.sender_account);
    if (!student) {
      toast({
        title: "Estudante não encontrado",
        description: `Nenhum estudante com o telefone ${payment.sender_account}. Verifique os dados do estudante.`,
        variant: "destructive",
      });
      return;
    }

    const monthKey = monthKeyFromSmsDate(payment.sms_date);
    const updated: Student = {
      ...student,
      paymentStatus: { ...student.paymentStatus, [monthKey]: "Pago" },
    };

    await updateStudent(updated);

    // Mark as confirmed on the backend
    await fetch(`${backendUrl}/sms-payments/${payment.id}/confirm`, { method: "POST" });

    setPayments((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status: "confirmed" } : p))
    );

    toast({
      title: "Pagamento confirmado!",
      description: `${student.name} — ${monthKey} marcado como Pago (${payment.amount.toFixed(2)} MT).`,
    });
  };

  // ── Dismiss ───────────────────────────────────────────────────────────────
  const handleDismiss = async (payment: SmsPayment) => {
    await fetch(`${backendUrl}/sms-payments/${payment.id}/dismiss`, { method: "POST" });
    setPayments((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status: "dismissed" } : p))
    );
    toast({ title: "Ignorado", description: "Pagamento marcado como ignorado." });
  };

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <PageLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Webhook SMS (M-Pesa)</h1>
          {connected === true && (
            <Badge className="bg-green-600 gap-1">
              <Wifi className="h-3 w-3" /> Conectado
            </Badge>
          )}
          {connected === false && (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" /> Sem ligação
            </Badge>
          )}
          {connected === null && (
            <Badge variant="secondary">A verificar…</Badge>
          )}
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* ── Backend URL config ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Configuração
              </CardTitle>
              <CardDescription>URL do servidor backend que recebe os SMS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Backend</Label>
                <div className="flex gap-2">
                  <Input
                    value={backendInput}
                    onChange={(e) => setBackendInput(e.target.value)}
                    placeholder="https://seu-backend.onrender.com"
                  />
                  <Button onClick={saveBackendUrl}>Guardar</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cole aqui o URL do backend após fazer deploy (ex: Render.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label>URL do Webhook (para o SMS Forwarder)</Label>
                <div className="flex gap-2">
                  <Input
                    value={backendUrl ? `${backendUrl}/incoming-sms` : ""}
                    readOnly
                    placeholder="Guarde a URL do backend primeiro"
                    className="bg-muted text-xs"
                  />
                  <Button
                    variant="outline"
                    disabled={!backendUrl}
                    onClick={() => {
                      navigator.clipboard.writeText(`${backendUrl}/incoming-sms`);
                      toast({ title: "Copiado!" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted rounded-md p-3 space-y-1">
                <p className="text-xs font-semibold">Configuração no SMS Forwarder (Android):</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Method: <strong>POST</strong></li>
                  <li>URL: a URL acima</li>
                  <li>Header: <code>X-Secret-Key: escola123</code></li>
                  <li>Body (JSON): <code>{`{"message":"%sms_body%"}`}</code></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* ── Stats ── */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>Estado dos pagamentos recebidos por SMS.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-green-600">
                  {payments.filter((p) => p.status === "confirmed").length}
                </p>
                <p className="text-xs text-muted-foreground">Confirmados</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-muted-foreground">
                  {payments.filter((p) => p.status === "dismissed").length}
                </p>
                <p className="text-xs text-muted-foreground">Ignorados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Payments table ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pagamentos Recebidos</CardTitle>
              <CardDescription>
                Actualizado automaticamente a cada 30 segundos.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {connected === false
                  ? "Sem ligação ao backend. Verifique a URL acima."
                  : "Nenhum pagamento recebido ainda."}
              </p>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data / Hora</TableHead>
                      <TableHead>Conta</TableHead>
                      <TableHead>Nome M-Pesa</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Estudante</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => {
                      const student = findStudent(p.sender_account);
                      const monthKey = monthKeyFromSmsDate(p.sms_date);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {p.sms_date
                              ? `${p.sms_date} ${p.sms_time ?? ""}`
                              : formatDate(p.received_at)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{p.sender_account}</TableCell>
                          <TableCell className="text-sm">{p.sender_name ?? "—"}</TableCell>
                          <TableCell className="font-semibold">{p.amount.toFixed(2)} MT</TableCell>
                          <TableCell>
                            {student ? (
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Turma {student.class}{student.room} · {monthKey}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-destructive">Não encontrado</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {p.status === "pending" && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                Pendente
                              </Badge>
                            )}
                            {p.status === "confirmed" && (
                              <Badge className="bg-green-600">Confirmado</Badge>
                            )}
                            {p.status === "dismissed" && (
                              <Badge variant="secondary">Ignorado</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {p.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleConfirm(p)}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" /> Confirmar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDismiss(p)}
                                >
                                  <XCircle className="mr-1 h-3 w-3" /> Ignorar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SMSWebhook;
