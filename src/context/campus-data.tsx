import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuthContext } from "@/context/auth";
import type {
  Activity,
  AttendanceRecord,
  AttendanceStatus,
  CalendarEvent,
  Conversation,
  EnrollmentPoint,
  EventType,
  FeeTransaction,
  Notification,
  SchoolClass,
  Slice,
  Staff,
  Student,
  Task,
} from "@/lib/types";

/* ------------------------- API row shapes ------------------------- */
interface StudentRow extends Omit<Student, "className" | "attendance"> {
  attendance: string;
}
interface StaffRow extends Omit<Staff, "attendance"> {
  attendance: string;
}
interface ClassRow extends Omit<SchoolClass, "attendance" | "students"> {
  attendance: string;
  students: string;
}
interface AnalyticsRows {
  enrollmentTrend: { month: string; enrolled: number; active: number }[];
  attendanceRateTrend: { month: string; rate: string; target: string }[];
  weeklyAttendance: { day: string; present: string; late: string; absent: string }[];
  gradeDistribution: { name: string; value: number }[];
  absenceReasons: { name: string; value: number }[];
  staffByRole: { name: string; value: number }[];
}

export interface CampusAnalytics {
  enrollmentTrend: EnrollmentPoint[];
  attendanceRateTrend: { month: string; rate: number; target: number }[];
  weeklyAttendance: { day: string; present: number; late: number; absent: number }[];
  gradeDistribution: Slice[];
  absenceReasons: Slice[];
  staffByRole: Slice[];
}

interface CampusDataState {
  students: Student[];
  staff: Staff[];
  classes: SchoolClass[];
  attendance: AttendanceRecord[];
  fees: FeeTransaction[];
  notifications: Notification[];
  activities: Activity[];
  conversations: Conversation[];
  tasks: Task[];
  events: CalendarEvent[];
  analytics: CampusAnalytics;
}

interface CampusData extends CampusDataState {
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  /* Mutations — call the API and update local state. */
  setAttendanceStatus: (id: string, status: AttendanceStatus) => Promise<void>;
  toggleNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  readConversation: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  addEvent: (event: {
    title: string;
    date: string;
    start: string;
    type: EventType;
  }) => Promise<void>;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const toSlices = (rows: { name: string; value: number }[]): Slice[] =>
  rows.map((row, index) => ({
    name: row.name,
    value: row.value,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

const EMPTY_ANALYTICS: CampusAnalytics = {
  enrollmentTrend: [],
  attendanceRateTrend: [],
  weeklyAttendance: [],
  gradeDistribution: [],
  absenceReasons: [],
  staffByRole: [],
};

const INITIAL_STATE: CampusDataState = {
  students: [],
  staff: [],
  classes: [],
  attendance: [],
  fees: [],
  notifications: [],
  activities: [],
  conversations: [],
  tasks: [],
  events: [],
  analytics: EMPTY_ANALYTICS,
};

const CampusDataContext = createContext<CampusData | null>(null);

export function CampusDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CampusDataState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthContext();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        students,
        staff,
        classes,
        attendance,
        fees,
        notifications,
        activities,
        conversations,
        tasks,
        events,
        analytics,
      ] = await Promise.all([
        api.get<StudentRow[]>("/students"),
        api.get<StaffRow[]>("/staff"),
        api.get<ClassRow[]>("/classes"),
        api.get<AttendanceRecord[]>("/attendance"),
        api.get<FeeTransaction[]>("/fees"),
        api.get<Notification[]>("/notifications"),
        api.get<Activity[]>("/activities"),
        api.get<Conversation[]>("/conversations"),
        api.get<Task[]>("/tasks"),
        api.get<CalendarEvent[]>("/calendar-events"),
        api.get<AnalyticsRows>("/analytics"),
      ]);

      setData({
        students: students.map((s) => ({
          ...s,
          className: `Grade ${s.grade} · ${s.section}`,
          attendance: Number(s.attendance),
        })),
        staff: staff.map((s) => ({ ...s, attendance: Number(s.attendance) })),
        classes: classes.map((c) => ({
          ...c,
          attendance: Number(c.attendance),
          students: Number(c.students),
        })),
        attendance,
        fees,
        notifications,
        activities,
        conversations,
        tasks,
        events,
        analytics: {
          enrollmentTrend: analytics.enrollmentTrend,
          attendanceRateTrend: analytics.attendanceRateTrend.map((r) => ({
            ...r,
            rate: Number(r.rate),
            target: Number(r.target),
          })),
          weeklyAttendance: analytics.weeklyAttendance.map((w) => ({
            ...w,
            present: Number(w.present),
            late: Number(w.late),
            absent: Number(w.absent),
          })),
          gradeDistribution: toSlices(analytics.gradeDistribution),
          absenceReasons: toSlices(analytics.absenceReasons),
          staffByRole: toSlices(analytics.staffByRole),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch data once authenticated; reset when signed out.
  useEffect(() => {
    if (!isAuthenticated) {
      setData(INITIAL_STATE);
      setError(null);
      setLoading(false);
      return;
    }
    void load();
  }, [isAuthenticated, load]);

  /* ------------------------- Mutations ---------------------------- */
  const setAttendanceStatus = useCallback(
    async (id: string, status: AttendanceStatus) => {
      const updated = await api.patch<AttendanceRecord>(`/attendance/${id}`, {
        status,
      });
      setData((prev) => ({
        ...prev,
        attendance: prev.attendance.map((r) => (r.id === id ? updated : r)),
      }));
    },
    [],
  );

  const toggleNotificationRead = useCallback(async (id: string) => {
    const updated = await api.patch<Notification>(`/notifications/${id}`);
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? updated : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await api.post("/notifications/read-all");
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const readConversation = useCallback(async (id: string) => {
    await api.patch(`/conversations/${id}/read`);
    setData((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c,
      ),
    }));
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      const message = await api.post<{ from: "me"; text: string; time: string }>(
        `/conversations/${conversationId}/messages`,
        { text },
      );
      setData((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: text,
                lastSeen: message.time,
                unread: 0,
                messages: [...c.messages, message],
              }
            : c,
        ),
      }));
    },
    [],
  );

  const addTask = useCallback(async (title: string) => {
    const task = await api.post<Task>("/tasks", { title });
    setData((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
  }, []);

  const toggleTaskStatus = useCallback(async (id: string) => {
    const updated = await api.patch<Task>(`/tasks/${id}`);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  }, []);

  const addEvent = useCallback(
    async (event: { title: string; date: string; start: string; type: EventType }) => {
      const created = await api.post<CalendarEvent>("/calendar-events", event);
      setData((prev) => ({ ...prev, events: [...prev.events, created] }));
    },
    [],
  );

  const value = useMemo<CampusData>(
    () => ({
      ...data,
      loading,
      error,
      reload: load,
      setAttendanceStatus,
      toggleNotificationRead,
      markAllNotificationsRead,
      readConversation,
      sendMessage,
      addTask,
      toggleTaskStatus,
      addEvent,
    }),
    [
      data,
      loading,
      error,
      load,
      setAttendanceStatus,
      toggleNotificationRead,
      markAllNotificationsRead,
      readConversation,
      sendMessage,
      addTask,
      toggleTaskStatus,
      addEvent,
    ],
  );

  return (
    <CampusDataContext.Provider value={value}>
      {children}
    </CampusDataContext.Provider>
  );
}

export function useCampusData(): CampusData {
  const ctx = useContext(CampusDataContext);
  if (!ctx) {
    throw new Error("useCampusData must be used within a CampusDataProvider");
  }
  return ctx;
}