import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/db";
import { PaymentRecord, Student } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Current month key helper
export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getMonth() + 1}-${now.getFullYear()}`;
}

export function monthLabel(key: string): string {
  const [m, y] = key.split("-");
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

// Previous month key
export function prevMonthKey(key: string): string {
  let [m, y] = key.split("-").map(Number);
  m -= 1;
  if (m === 0) { m = 12; y -= 1; }
  return `${m}-${y}`;
}

// Calculate balance for a student in a given month.
// Returns: amountDue, totalPaid, creditFromPrev, balance
// balance > 0 → crédito para próximo mês
// balance < 0 → dívida
export interface MonthBalance {
  monthKey: string;
  amountDue: number;
  totalPaid: number;
  creditFromPrev: number;
  balance: number; // (totalPaid + creditFromPrev) - amountDue
  payments: PaymentRecord[];
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const all = await db.payments.toArray();
    setPayments(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Add a payment and update student paymentStatus
  const addPayment = useCallback(async (
    student: Student,
    amount: number,
    monthKey: string,
    source: "sms" | "manual",
    opts?: { transactionId?: string; senderPhone?: string; notes?: string; date?: string }
  ): Promise<MonthBalance> => {
    const record: PaymentRecord = {
      id: uuidv4(),
      studentId: student.id,
      amount,
      date: opts?.date ?? new Date().toISOString(),
      monthKey,
      source,
      transactionId: opts?.transactionId,
      senderPhone: opts?.senderPhone,
      notes: opts?.notes,
    };

    await db.payments.add(record);

    // Recalculate balance for this month
    const allForStudent = await db.payments.where("studentId").equals(student.id).toArray();
    const balance = calcBalance(student, monthKey, allForStudent);

    // Update student paymentStatus
    let status: "Pago" | "Em Falta" | "Parcial";
    if (balance.balance >= 0) status = "Pago";
    else if (balance.totalPaid + balance.creditFromPrev > 0) status = "Parcial";
    else status = "Em Falta";

    await db.students.update(student.id, {
      paymentStatus: { ...student.paymentStatus, [monthKey]: status },
    });

    setPayments(prev => [...prev, record]);
    return balance;
  }, []);

  // Delete a payment
  const deletePayment = useCallback(async (id: string) => {
    await db.payments.delete(id);
    setPayments(prev => prev.filter(p => p.id !== id));
  }, []);

  // Get all payments for a student
  const getStudentPayments = useCallback((studentId: string) =>
    payments.filter(p => p.studentId === studentId), [payments]);

  return { payments, loading, addPayment, deletePayment, getStudentPayments, reload: load };
}

// Pure function — compute monthly balance without DB access
export function calcBalance(
  student: Student,
  monthKey: string,
  allPayments: PaymentRecord[],
): MonthBalance {
  const fee = student.monthlyFee;

  // Credit carried from previous month (recursive: compute prev month balance)
  const prev = prevMonthKey(monthKey);
  let creditFromPrev = 0;

  const prevPayments = allPayments.filter(p => p.monthKey === prev);
  if (prevPayments.length > 0) {
    const prevBalance = calcBalance(student, prev, allPayments);
    if (prevBalance.balance > 0) creditFromPrev = prevBalance.balance;
  }

  const monthPayments = allPayments.filter(p => p.monthKey === monthKey);
  const totalPaid = monthPayments.reduce((s, p) => s + p.amount, 0);
  const balance = totalPaid + creditFromPrev - fee;

  return { monthKey, amountDue: fee, totalPaid, creditFromPrev, balance, payments: monthPayments };
}
