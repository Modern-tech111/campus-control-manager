/* ------------------------------------------------------------------
 * Campus Control — MySQL schema
 * Tables are created automatically on server start inside the
 * `campus-control` database. No dummy data is seeded anymore — the
 * tables start empty and are filled with real records through the API.
 * The only exception is a default admin account so the app can be
 * logged into right after setup (change the password after first login).
 * ------------------------------------------------------------------ */
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { Connection, RowDataPacket } from "mysql2/promise";

/* ------------------------------ DDL -------------------------------- */
export const TABLES: string[] = [
  // Students
  `CREATE TABLE IF NOT EXISTS students (
    id         VARCHAR(16)  NOT NULL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(160) NOT NULL,
    initials   VARCHAR(4)   NOT NULL,
    avatar     VARCHAR(64)  NOT NULL,
    grade      INT          NOT NULL,
    section    VARCHAR(8)   NOT NULL,
    guardian   VARCHAR(120) NOT NULL,
    phone      VARCHAR(32)  NOT NULL,
    attendance DECIMAL(5,2) NOT NULL DEFAULT 0,
    status     ENUM('active','new','at-risk','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_students_grade (grade),
    INDEX idx_students_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Staff
  `CREATE TABLE IF NOT EXISTS staff (
    id         VARCHAR(16) NOT NULL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(160) NOT NULL,
    initials   VARCHAR(4)  NOT NULL,
    avatar     VARCHAR(64) NOT NULL,
    role       ENUM('principal','teacher','admin','counselor','librarian','support') NOT NULL,
    subject    VARCHAR(80) NULL,
    department VARCHAR(80) NOT NULL,
    attendance DECIMAL(5,2) NOT NULL DEFAULT 0,
    joined     DATE NOT NULL,
    status     ENUM('active','on-leave','new') NOT NULL DEFAULT 'active',
    INDEX idx_staff_role (role)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Classes (homerooms)
  `CREATE TABLE IF NOT EXISTS classes (
    id            VARCHAR(16)  NOT NULL PRIMARY KEY,
    name          VARCHAR(64)  NOT NULL,
    subject       VARCHAR(80)  NOT NULL,
    teacher_id    VARCHAR(16)  NULL,
    room          VARCHAR(32)  NOT NULL,
    student_count INT          NOT NULL DEFAULT 0,
    attendance    DECIMAL(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id)
      REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_classes_teacher (teacher_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Daily attendance register
  `CREATE TABLE IF NOT EXISTS attendance (
    id         VARCHAR(16) NOT NULL PRIMARY KEY,
    student_id VARCHAR(16) NOT NULL,
    date       DATE        NOT NULL,
    status     ENUM('present','late','absent','excused') NOT NULL DEFAULT 'present',
    time       VARCHAR(8)  NOT NULL DEFAULT '-',
    reason     VARCHAR(120) NULL,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id)
      REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_student (student_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Tuition / fee transactions
  `CREATE TABLE IF NOT EXISTS fee_transactions (
    id         VARCHAR(16)    NOT NULL PRIMARY KEY,
    student_id VARCHAR(16)    NOT NULL,
    date       DATETIME       NOT NULL,
    method     VARCHAR(40)    NOT NULL,
    amount     DECIMAL(10,2)  NOT NULL DEFAULT 0,
    status     ENUM('paid','pending','overdue') NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_fees_student FOREIGN KEY (student_id)
      REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_fees_status (status),
    INDEX idx_fees_student (student_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Notifications
  `CREATE TABLE IF NOT EXISTS notifications (
    id      VARCHAR(16) NOT NULL PRIMARY KEY,
    type    ENUM('order','system','billing','alert','user') NOT NULL,
    title   VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    time    DATETIME NOT NULL,
    \`read\` BOOLEAN NOT NULL DEFAULT 0,
    INDEX idx_notifications_read (\`read\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Activity feed
  `CREATE TABLE IF NOT EXISTS activities (
    id     VARCHAR(16) NOT NULL PRIMARY KEY,
    type   ENUM('enroll','user','payment','alert','system') NOT NULL,
    title  VARCHAR(160) NOT NULL,
    detail TEXT NOT NULL,
    time   DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Conversations (parent / staff threads)
  `CREATE TABLE IF NOT EXISTS conversations (
    id           VARCHAR(16) NOT NULL PRIMARY KEY,
    name         VARCHAR(120) NOT NULL,
    initials     VARCHAR(4)  NOT NULL,
    avatar       VARCHAR(64) NOT NULL,
    role         VARCHAR(80) NOT NULL,
    online       BOOLEAN NOT NULL DEFAULT 0,
    unread       INT NOT NULL DEFAULT 0,
    last_message TEXT NOT NULL,
    last_seen    DATETIME NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Messages inside conversations
  `CREATE TABLE IF NOT EXISTS messages (
    id              INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(16) NOT NULL,
    sender          ENUM('me','them') NOT NULL,
    text            TEXT NOT NULL,
    time            DATETIME NOT NULL,
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id)
      REFERENCES conversations(id) ON DELETE CASCADE,
    INDEX idx_messages_conversation (conversation_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Tasks
  `CREATE TABLE IF NOT EXISTS tasks (
    id       VARCHAR(16) NOT NULL PRIMARY KEY,
    title    VARCHAR(200) NOT NULL,
    status   ENUM('todo','in-progress','done') NOT NULL DEFAULT 'todo',
    priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    due      DATE NOT NULL,
    assignee VARCHAR(120) NOT NULL,
    initials VARCHAR(4)  NOT NULL,
    avatar   VARCHAR(64) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Calendar events
  `CREATE TABLE IF NOT EXISTS calendar_events (
    id         VARCHAR(16) NOT NULL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL,
    date       DATE NOT NULL,
    start_time VARCHAR(8) NOT NULL,
    end_time   VARCHAR(8) NOT NULL DEFAULT '',
    type       ENUM('meeting','task','reminder','personal') NOT NULL DEFAULT 'task',
    attendees  INT NULL,
    INDEX idx_events_date (date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analytics — enrollment trend (12 months)
  `CREATE TABLE IF NOT EXISTS enrollment_trend (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    month      VARCHAR(24) NOT NULL,
    enrolled   INT NOT NULL,
    \`active\`   INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analytics — weekly attendance counts
  `CREATE TABLE IF NOT EXISTS attendance_weekly (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    day        VARCHAR(24) NOT NULL,
    present    INT NOT NULL,
    late       INT NOT NULL,
    absent     INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analytics — monthly attendance rate vs target
  `CREATE TABLE IF NOT EXISTS attendance_rate_trend (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    month      VARCHAR(24) NOT NULL,
    rate       DECIMAL(5,2) NOT NULL,
    target     DECIMAL(5,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analytics — students by grade
  `CREATE TABLE IF NOT EXISTS grade_distribution (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    grade      VARCHAR(32) NOT NULL,
    \`count\`    INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analytics — absence reasons
  `CREATE TABLE IF NOT EXISTS absence_reasons (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(64) NOT NULL,
    value      INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Analytics — staff by role
  `CREATE TABLE IF NOT EXISTS staff_by_role (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(64) NOT NULL,
    value      INT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Users (auth accounts)
  `CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('admin','staff') NOT NULL DEFAULT 'admin',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Auth session tokens
  `CREATE TABLE IF NOT EXISTS sessions (
    token      VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME    NOT NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

/* --------------------------- Setup / admin -------------------------- */

async function countRows(conn: Connection, table: string): Promise<number> {
  const [rows] = await conn.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS n FROM \`${table}\``,
  );
  return Number(rows[0]?.n ?? 0);
}

/**
 * Create all tables and seed only the default admin account (so the app
 * can be signed into on a fresh database). All other tables stay empty —
 * real data is added through the API.
 */
export async function createTables(conn: Connection): Promise<void> {
  for (const ddl of TABLES) {
    await conn.query(ddl);
  }

  // Email: admin@campus.edu — Password: admin123 (change after first login)
  if ((await countRows(conn, "users")) === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    await conn.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES (?, 'Campus Admin', 'admin@campus.edu', ?, 'admin')`,
      [crypto.randomUUID(), hash],
    );
  }
}