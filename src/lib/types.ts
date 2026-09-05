/* ------------------------------------------------------------------
 * Campus Control — shared data types.
 * These describe the records served by the local API (server/index.ts)
 * which reads and writes the `campus-control` MySQL database.
 * ------------------------------------------------------------------ */

/* -------------------------- Enrollment trend ----------------------- */
export interface EnrollmentPoint {
  month: string;
  enrolled: number;
  active: number;
}

/* ------------------------------ Slice ------------------------------ */
export interface Slice {
  name: string;
  value: number;
  color: string;
}

/* ----------------------------- Students ---------------------------- */
export type StudentStatus = "active" | "new" | "at-risk" | "inactive";

export interface Student {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar: string;
  className: string; // "Grade 10 · A"
  grade: number;
  section: string;
  guardian: string;
  phone: string;
  attendance: number; // %
  status: StudentStatus;
}

/* ------------------------------ Staff ------------------------------ */
export type StaffRole =
  | "principal"
  | "teacher"
  | "admin"
  | "counselor"
  | "librarian"
  | "support";

export type StaffStatus = "active" | "on-leave" | "new";

export interface Staff {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar: string;
  role: StaffRole;
  subject?: string;
  department: string;
  attendance: number; // %
  joined: string;
  status: StaffStatus;
}

/* ---------------------------- Attendance --------------------------- */
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  name: string;
  initials: string;
  avatar: string;
  className: string;
  status: AttendanceStatus;
  time: string; // check-in time for present/late
  date: string;
  reason?: string;
}

/* ------------------------------ Classes ---------------------------- */
export interface SchoolClass {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  room: string;
  students: number;
  attendance: number; // %
}

/* --------------------------- Activities ---------------------------- */
export interface Activity {
  id: string;
  type: "enroll" | "user" | "payment" | "alert" | "system";
  title: string;
  detail: string;
  time: string;
}

/* -------------------------- Notifications -------------------------- */
export type NotificationType = "order" | "system" | "billing" | "alert" | "user";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

/* ---------------------------- Messages ----------------------------- */
export interface ChatMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  role: string;
  online: boolean;
  unread: number;
  lastMessage: string;
  lastSeen: string;
  messages: ChatMessage[];
}

/* ------------------------------ Tasks ------------------------------ */
export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  assignee: string;
  initials: string;
  avatar: string;
}

/* -------------------------- Calendar events ------------------------ */
export type EventType = "meeting" | "task" | "reminder" | "personal";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  start: string;
  end: string;
  type: EventType;
  attendees?: number;
}

/* ---------------------------- Fee payments ------------------------- */
export interface FeeTransaction {
  id: string;
  student: string;
  date: string;
  method: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}