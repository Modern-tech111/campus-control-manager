/* ------------------------------------------------------------------
 * Campus Control — API server
 * Express + mysql2 backed by the local `campus-control` MySQL database.
 * On startup it creates all tables (see server/schema.ts) and seeds
 * them from the app's mock data when empty.
 * ------------------------------------------------------------------ */
import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import { pool, ping } from "./db";
import { createTables } from "./schema";

const app = express();
app.use(express.json());

// Permissive CORS so the Vite dev server (and any other origin) can call us.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ------------------------------ Auth ------------------------------ */
interface AuthedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

type AuthedRequest = Request & { user?: AuthedUser };

const SESSION_DAYS = 30;

/** Extract the Bearer token from the Authorization header. */
function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

/** Middleware that requires a valid session and attaches req.user. */
async function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = bearerToken(req);
    if (!token) return res.status(401).json({ error: "Authentication required" });
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > NOW()`,
      [token],
    );
    const row = (rows as Record<string, unknown>[])[0];
    if (!row) return res.status(401).json({ error: "Invalid or expired session" });
    req.user = {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role),
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Issue a session token for a user (expires in 30 days). */
async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  await pool.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    [token, userId, expires],
  );
  return token;
}

// Everything under /api requires a session, except auth endpoints and health.
app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/auth")) return next();
  return authRequired(req as AuthedRequest, res, next);
});

/** DATETIME columns arrive as "YYYY-MM-DD HH:MM:SS"; the frontend expects ISO. */
const toIso = (value: unknown): string =>
  typeof value === "string" ? value.replace(" ", "T") : String(value ?? "");

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

/* ----------------------------- Health ------------------------------ */
app.get("/api/health", async (_req, res) => {
  const dbOk = await ping();
  res.json({ ok: true, db: dbOk ? "connected" : "unreachable" });
});

/* ------------------------- Auth endpoints ------------------------- */
const EMAIL_RE = /^\S+@\S+\.\S+$/;

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((existing as Record<string, unknown>[]).length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
      [id, name, email, hash],
    );
    const token = await createSession(id);
    res.status(201).json({ token, user: { id, name, email, role: "admin" } });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const [rows] = await pool.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ?",
      [email],
    );
    const row = (rows as Record<string, unknown>[])[0];
    if (!row || !(await bcrypt.compare(password, String(row.password_hash)))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = await createSession(String(row.id));
    res.json({
      token,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/logout", async (req, res, next) => {
  try {
    const token = bearerToken(req);
    if (token) await pool.query("DELETE FROM sessions WHERE token = ?", [token]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get("/api/auth/me", authRequired, async (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});

/* ---------------------------- Students ----------------------------- */
app.get("/api/students", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM students ORDER BY id",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------ Staff ----------------------------- */
app.get("/api/staff", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM staff ORDER BY id");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ----------------------------- Classes ---------------------------- */
app.get("/api/classes", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.name, c.subject, c.room, c.student_count, c.attendance,
              COALESCE(s.name, '—') AS teacher
       FROM classes c
       LEFT JOIN staff s ON s.id = c.teacher_id
       ORDER BY c.id`,
    );
    res.json(
      (rows as Record<string, unknown>[]).map((row) => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        teacher: row.teacher,
        room: row.room,
        students: row.student_count,
        attendance: row.attendance,
      })),
    );
  } catch (err) {
    next(err);
  }
});

/* --------------------------- Attendance --------------------------- */
const ATTENDANCE_SELECT = `
  SELECT a.id, a.student_id, a.date, a.status, a.time, a.reason,
         s.name, s.initials, s.avatar, s.grade, s.section
  FROM attendance a
  JOIN students s ON s.id = a.student_id`;

function mapAttendance(row: Record<string, unknown>) {
  return {
    id: row.id,
    studentId: row.student_id,
    name: row.name,
    initials: row.initials,
    avatar: row.avatar,
    className: `Grade ${row.grade} · ${row.section}`,
    status: row.status,
    time: row.time,
    date: row.date,
    reason: row.reason ?? undefined,
  };
}

app.get("/api/attendance", async (req, res, next) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `${ATTENDANCE_SELECT} WHERE a.date = ? ORDER BY FIELD(a.status, 'absent', 'excused'), s.name`,
      [date],
    );
    res.json((rows as Record<string, unknown>[]).map(mapAttendance));
  } catch (err) {
    next(err);
  }
});

app.patch("/api/attendance/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status ?? "present");
    const stamp = new Date().toTimeString().slice(0, 5);
    const isCheckIn = status === "present" || status === "late";
    const [result] = await pool.query(
      `UPDATE attendance
       SET status = ?, time = ?, reason = ?
       WHERE id = ?`,
      [
        status,
        isCheckIn ? stamp : "—",
        status === "absent"
          ? "Unexplained"
          : status === "excused"
            ? "Medical appointment"
            : null,
        id,
      ],
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    const [rows] = await pool.query(
      `${ATTENDANCE_SELECT} WHERE a.id = ?`,
      [id],
    );
    res.json(mapAttendance((rows as Record<string, unknown>[])[0]));
  } catch (err) {
    next(err);
  }
});

/* ------------------------------- Fees ----------------------------- */
app.get("/api/fees", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.id, f.date, f.method, f.amount, f.status, s.name AS student
       FROM fee_transactions f
       JOIN students s ON s.id = f.student_id
       ORDER BY f.date DESC`,
    );
    res.json(
      (rows as Record<string, unknown>[]).map((row) => ({
        id: row.id,
        student: row.student,
        date: toIso(row.date),
        method: row.method,
        amount: row.amount,
        status: row.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

/* -------------------------- Notifications ------------------------- */
app.get("/api/notifications", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, type, title, message, time, `read` FROM notifications ORDER BY time DESC",
    );
    res.json(
      (rows as Record<string, unknown>[]).map((row) => ({
        ...row,
        read: Boolean(row.read),
        time: toIso(row.time),
      })),
    );
  } catch (err) {
    next(err);
  }
});

app.patch("/api/notifications/:id", async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE notifications SET `read` = NOT `read` WHERE id = ?",
      [req.params.id],
    );
    const [rows] = await pool.query(
      "SELECT id, type, title, message, time, `read` FROM notifications WHERE id = ?",
      [req.params.id],
    );
    const row = (rows as Record<string, unknown>[])[0];
    res.json({ ...row, read: Boolean(row.read), time: toIso(row.time) });
  } catch (err) {
    next(err);
  }
});

app.post("/api/notifications/read-all", async (_req, res, next) => {
  try {
    await pool.query("UPDATE notifications SET `read` = 1 WHERE `read` = 0");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------- Activities -------------------------- */
app.get("/api/activities", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, type, title, detail, time FROM activities ORDER BY time DESC",
    );
    res.json(
      (rows as Record<string, unknown>[]).map((row) => ({
        ...row,
        time: toIso(row.time),
      })),
    );
  } catch (err) {
    next(err);
  }
});

/* --------------------------- Conversations ------------------------ */
app.get("/api/conversations", async (_req, res, next) => {
  try {
    const [conversations] = await pool.query(
      `SELECT id, name, initials, avatar, role, online, unread, last_message, last_seen
       FROM conversations ORDER BY last_seen DESC`,
    );
    const [messages] = await pool.query(
      "SELECT conversation_id, sender, text, time FROM messages ORDER BY time ASC",
    );
    const grouped = new Map<string, unknown[]>();
    for (const m of messages as Record<string, unknown>[]) {
      const list = grouped.get(String(m.conversation_id)) ?? [];
      list.push({
        from: m.sender,
        text: m.text,
        time: toIso(m.time),
      });
      grouped.set(String(m.conversation_id), list);
    }
    res.json(
      (conversations as Record<string, unknown>[]).map((row) => ({
        id: row.id,
        name: row.name,
        initials: row.initials,
        avatar: row.avatar,
        role: row.role,
        online: Boolean(row.online),
        unread: Number(row.unread),
        lastMessage: row.last_message,
        lastSeen: toIso(row.last_seen),
        messages: grouped.get(String(row.id)) ?? [],
      })),
    );
  } catch (err) {
    next(err);
  }
});

app.post("/api/conversations/:id/messages", async (req, res, next) => {
  try {
    const text = String(req.body.text ?? "").trim();
    if (!text) return res.status(400).json({ error: "Message text is required" });
    const stamp = now();
    await pool.query(
      `INSERT INTO messages (conversation_id, sender, text, time) VALUES (?, 'me', ?, ?)`,
      [req.params.id, text, stamp],
    );
    await pool.query(
      `UPDATE conversations SET last_message = ?, last_seen = ?, unread = 0 WHERE id = ?`,
      [text, stamp, req.params.id],
    );
    const [rows] = await pool.query(
      "SELECT id FROM conversations WHERE id = ?",
      [req.params.id],
    );
    const updated = (rows as Record<string, unknown>[])[0];
    if (!updated) return res.status(404).json({ error: "Conversation not found" });
    res.status(201).json({ from: "me", text, time: stamp.replace(" ", "T") });
  } catch (err) {
    next(err);
  }
});

app.patch("/api/conversations/:id/read", async (req, res, next) => {
  try {
    await pool.query("UPDATE conversations SET unread = 0 WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------ Tasks ----------------------------- */
app.get("/api/tasks", async (_req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tasks ORDER BY due ASC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post("/api/tasks", async (req, res, next) => {
  try {
    const title = String(req.body.title ?? "").trim();
    if (!title) return res.status(400).json({ error: "Task title is required" });
    const id = `t-${Date.now()}`;
    const due = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    await pool.query(
      `INSERT INTO tasks (id, title, status, priority, due, assignee, initials, avatar)
       VALUES (?, ?, 'todo', 'medium', ?, 'You', 'YO', 'from-lime-400 to-emerald-500')`,
      [id, title, due],
    );
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.status(201).json((rows as Record<string, unknown>[])[0]);
  } catch (err) {
    next(err);
  }
});

app.patch("/api/tasks/:id", async (req, res, next) => {
  try {
    const [current] = await pool.query(
      "SELECT status FROM tasks WHERE id = ?",
      [req.params.id],
    );
    const row = (current as Record<string, unknown>[])[0];
    if (!row) return res.status(404).json({ error: "Task not found" });
    const nextStatus = row.status === "done" ? "todo" : "done";
    await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [
      nextStatus,
      req.params.id,
    ]);
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
      req.params.id,
    ]);
    res.json((rows as Record<string, unknown>[])[0]);
  } catch (err) {
    next(err);
  }
});

/* -------------------------- Calendar events ----------------------- */
app.get("/api/calendar-events", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, date, start_time, end_time, type, attendees
       FROM calendar_events ORDER BY date, start_time`,
    );
    res.json(
      (rows as Record<string, unknown>[]).map((row) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        start: row.start_time,
        end: row.end_time,
        type: row.type,
        attendees: row.attendees === null ? undefined : Number(row.attendees),
      })),
    );
  } catch (err) {
    next(err);
  }
});

app.post("/api/calendar-events", async (req, res, next) => {
  try {
    const { title, date, start, type } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }
    const id = `e-${Date.now()}`;
    await pool.query(
      `INSERT INTO calendar_events (id, title, date, start_time, end_time, type, attendees)
       VALUES (?, ?, ?, ?, '', ?, NULL)`,
      [id, String(title).trim(), date, start || "09:00", type || "task"],
    );
    const [rows] = await pool.query(
      `SELECT id, title, date, start_time, end_time, type, attendees
       FROM calendar_events WHERE id = ?`,
      [id],
    );
    const row = (rows as Record<string, unknown>[])[0];
    res.status(201).json({
      id: row.id,
      title: row.title,
      date: row.date,
      start: row.start_time,
      end: row.end_time,
      type: row.type,
      attendees: row.attendees === null ? undefined : Number(row.attendees),
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------------------- Analytics --------------------------- */
app.get("/api/analytics", async (_req, res, next) => {
  try {
    const [enrollment] = await pool.query(
      "SELECT month, enrolled, `active` FROM enrollment_trend ORDER BY sort_order",
    );
    const [weekly] = await pool.query(
      "SELECT day, present, late, absent FROM attendance_weekly ORDER BY sort_order",
    );
    const [rate] = await pool.query(
      "SELECT month, rate, target FROM attendance_rate_trend ORDER BY sort_order",
    );
    const [grades] = await pool.query(
      "SELECT grade AS name, `count` AS value FROM grade_distribution ORDER BY sort_order",
    );
    const [reasons] = await pool.query(
      "SELECT name, value FROM absence_reasons ORDER BY sort_order",
    );
    const [roles] = await pool.query(
      "SELECT name, value FROM staff_by_role ORDER BY sort_order",
    );
    res.json({
      enrollmentTrend: enrollment,
      weeklyAttendance: weekly,
      attendanceRateTrend: rate,
      gradeDistribution: grades,
      absenceReasons: reasons,
      staffByRole: roles,
    });
  } catch (err) {
    next(err);
  }
});

/* --------------------------- Error handling ----------------------- */
app.use(
  (err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error("[api] error:", err.message);
    res.status(500).json({ error: err.message });
  },
);

/* ------------------------------ Boot ------------------------------ */
const PORT = Number(process.env.API_PORT || 4000);

async function main() {
  try {
    const conn = await pool.getConnection();
    console.log("[api] connected to MySQL, creating tables…");
    await createTables(conn);
    conn.release();
    console.log("[api] tables ready (no dummy data seeded)");
  } catch (err) {
    console.error("[api] database setup failed:", err);
    console.error(
      "[api] is MySQL running? Check XAMPP/WAMP and the credentials in .env",
    );
  }
  app.listen(PORT, () => {
    console.log(`[api] Campus Control API listening on http://localhost:${PORT}`);
  });
}

main();