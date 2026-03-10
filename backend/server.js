require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
const path    = require("path");

const app       = express();
const PORT      = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || "escola123";
const DB_FILE   = path.join(__dirname, "payments.json");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── JSON file store ───────────────────────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) return { payments: [], nextId: 1 };
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return { payments: [], nextId: 1 }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── M-Pesa SMS parser ─────────────────────────────────────────────────────────
// Format: "ID da transacao: PP260310.1120.C87384. Recebeste 50.00MT de conta
//          874639983, nome: Guiwan Teodosio Castro as 11:20:25 de 10/03/2026.
//          Conteudo: 1. O saldo da tua conta e 52.98MT. ..."
function parseMpesaSMS(message) {
  const txMatch      = message.match(/ID da transacao[:\s]+([A-Z0-9.]+)\./i);
  const amountMatch  = message.match(/Recebeste\s+([\d.]+)MT/i);
  const accountMatch = message.match(/de conta\s+(\d+)/i);
  const nameMatch    = message.match(/nome:\s*(.+?)\s+as\s+\d{2}:\d{2}/i);
  const timeMatch    = message.match(/as\s+(\d{2}:\d{2}:\d{2})/i);
  const dateMatch    = message.match(/de\s+(\d{2}\/\d{2}\/\d{4})/i);

  if (!amountMatch || !accountMatch) return null;

  return {
    transactionId: txMatch     ? txMatch[1].trim()   : null,
    senderAccount: accountMatch[1],
    senderName:    nameMatch   ? nameMatch[1].trim() : null,
    amount:        parseFloat(amountMatch[1]),
    smsTime:       timeMatch   ? timeMatch[1]        : null,
    smsDate:       dateMatch   ? dateMatch[1]        : null,
  };
}

// ── POST /incoming-sms ────────────────────────────────────────────────────────
// Called by the Android SMS Forwarder app.
// Body fields accepted:  message | body | smsBody
// Secret:  X-Secret-Key header  OR  body.secret
app.post("/incoming-sms", (req, res) => {
  // Accept message from any field the SMS Forwarder app may use
  const message = req.body.message || req.body.body || req.body.smsBody
    || req.body.text || req.body.sms || req.body.content;
  if (!message) return res.status(400).json({ error: "No message field provided" });

  const parsed = parseMpesaSMS(message);
  if (!parsed) {
    return res.status(422).json({
      error: "Could not parse M-Pesa SMS. Check the expected format.",
      raw: message,
    });
  }

  const db = readDB();

  // Duplicate check by transaction ID
  if (parsed.transactionId &&
      db.payments.some(p => p.transaction_id === parsed.transactionId)) {
    return res.status(409).json({
      error: "Duplicate transaction already recorded",
      transactionId: parsed.transactionId,
    });
  }

  const record = {
    id:             db.nextId++,
    transaction_id: parsed.transactionId,
    sender_account: parsed.senderAccount,
    sender_name:    parsed.senderName,
    amount:         parsed.amount,
    sms_time:       parsed.smsTime,
    sms_date:       parsed.smsDate,
    raw_message:    message,
    received_at:    new Date().toISOString(),
    status:         "pending",
  };

  db.payments.unshift(record);
  writeDB(db);

  res.json({ success: true, id: record.id, parsed });
});

// ── GET /sms-payments ─────────────────────────────────────────────────────────
// ?status=pending | confirmed | dismissed   (omit for all)
app.get("/sms-payments", (req, res) => {
  const { status } = req.query;
  const { payments } = readDB();
  res.json(status ? payments.filter(p => p.status === status) : payments);
});

// ── POST /sms-payments/:id/confirm ───────────────────────────────────────────
app.post("/sms-payments/:id/confirm", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = readDB();
  const p  = db.payments.find(p => p.id === id);
  if (!p) return res.status(404).json({ error: "Not found" });
  p.status = "confirmed";
  writeDB(db);
  res.json({ success: true });
});

// ── POST /sms-payments/:id/dismiss ───────────────────────────────────────────
app.post("/sms-payments/:id/dismiss", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = readDB();
  const p  = db.payments.find(p => p.id === id);
  if (!p) return res.status(404).json({ error: "Not found" });
  p.status = "dismissed";
  writeDB(db);
  res.json({ success: true });
});

// ── GET /health ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.listen(PORT, () =>
  console.log(`Escola SMS backend running on http://localhost:${PORT}`)
);
