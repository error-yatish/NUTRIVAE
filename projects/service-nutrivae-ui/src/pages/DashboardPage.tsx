import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users,
  UserPlus,
  CalendarClock,
  BriefcaseBusiness,
  ArrowUpRight,
  MoreHorizontal,
  Clock3,
  CheckCircle2
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../lib/api";
import { Avatar, Badge, Skeleton } from "../components/ui";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

type Dashboard = {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    openRoles: number;
    pendingLeave: number;
    joinedThisMonth: number;
  };
  departments: Array<{ id: string; name: string; _count: { employees: number } }>;
  recentLeave: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    employee: { firstName: string; lastName: string };
    leaveType: { name: string };
  }>;
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    status: string;
    employee: { firstName: string; lastName: string };
  }>;
  pipeline: Array<{ status: string; _count: number }>;
};

const colors = ["#30776b", "#ef7f68", "#f4d98a", "#8b72be", "#67a6ce"];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<Dashboard>("/dashboard/summary")
  });
  const dashboard = data?.data;
  const firstName = user?.name.split(" ")[0];
  const stats = [
    {
      label: "Total employees",
      value: dashboard?.stats.totalEmployees,
      sub: `+${dashboard?.stats.joinedThisMonth ?? 0} this month`,
      icon: Users,
      tone: "bg-brand-50 text-brand-700"
    },
    {
      label: "Currently away",
      value: dashboard?.stats.onLeave,
      sub: `${dashboard?.stats.pendingLeave ?? 0} requests pending`,
      icon: CalendarClock,
      tone: "bg-orange-50 text-coral"
    },
    {
      label: "Open positions",
      value: dashboard?.stats.openRoles,
      sub: "Across all departments",
      icon: BriefcaseBusiness,
      tone: "bg-violet-50 text-violet-600"
    },
    {
      label: "Active people",
      value: dashboard?.stats.activeEmployees,
      sub: "Team health is steady",
      icon: UserPlus,
      tone: "bg-amber-50 text-amber-700"
    }
  ];
  return (
    <div className="animate-in space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{format(new Date(), "EEEE · MMMM d")}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
            Good morning, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-muted">Here’s what’s happening across Nutrivae today.</p>
        </div>
        {["ADMIN", "HR_MANAGER"].includes(user?.role ?? "") && (
          <button className="btn-primary" onClick={() => navigate("/employees?add=1")}>
            <UserPlus size={17} />
            Add employee
          </button>
        )}
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, tone }) => (
          <div className="card p-5" key={label}>
            <div className="flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                <Icon size={19} />
              </span>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-5 h-8 w-16" />
            ) : (
              <div className="mt-4 font-display text-3xl font-extrabold">{value ?? 0}</div>
            )}
            <div className="mt-1 text-sm font-semibold">{label}</div>
            <div className="mt-1 text-xs text-muted">{sub}</div>
          </div>
        ))}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.45fr_.85fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="font-display text-lg font-bold">Time-off requests</h2>
              <p className="mt-1 text-xs text-muted">Recent requests that need attention</p>
            </div>
            <button className="btn-secondary !px-3 !py-2" onClick={() => navigate("/leave")}>
              View all
            </button>
          </div>
          <div className="divide-y divide-line">
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <div className="flex gap-3 p-5" key={i}>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                ))
              : dashboard?.recentLeave.map((leave) => {
                  const name = `${leave.employee.firstName} ${leave.employee.lastName}`;
                  return (
                    <div className="flex items-center gap-3 px-5 py-4" key={leave.id}>
                      <Avatar name={name} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{name}</div>
                        <div className="mt-0.5 text-xs text-muted">
                          {leave.leaveType.name} · {format(new Date(leave.startDate), "MMM d")}–
                          {format(new Date(leave.endDate), "MMM d")}
                        </div>
                      </div>
                      <Badge
                        tone={
                          leave.status === "APPROVED" ? "green" : leave.status === "PENDING" ? "amber" : "red"
                        }
                      >
                        {leave.status.toLowerCase()}
                      </Badge>
                      <button className="text-slate-400">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  );
                })}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Team distribution</h2>
              <p className="mt-1 text-xs text-muted">People by department</p>
            </div>
            <button className="text-slate-400">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboard?.departments ?? []}
                  dataKey={(item) => item._count.employees}
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {dashboard?.departments.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e3e8e6", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {dashboard?.departments.slice(0, 4).map((department, i) => (
              <div className="flex items-center gap-2 text-xs" key={department.id}>
                <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
                <span className="min-w-0 flex-1 truncate text-muted">{department.name}</span>
                <b>{department._count.employees}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Goal momentum</h2>
              <p className="mt-1 text-xs text-muted">Current company priorities</p>
            </div>
            <button className="btn-secondary !px-3 !py-2" onClick={() => navigate("/performance")}>
              All goals
            </button>
          </div>
          <div className="space-y-5">
            {dashboard?.goals.map((goal) => (
              <div key={goal.id}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">{goal.title}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {goal.employee.firstName} {goal.employee.lastName}
                    </div>
                  </div>
                  <span className="font-display text-sm font-bold">{goal.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${goal.status === "AT_RISK" ? "bg-coral" : "bg-brand-600"}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-brand-900 p-6 text-white shadow-card">
          <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full border-[34px] border-white/5" />
          <p className="eyebrow !text-butter">People pulse</p>
          <h2 className="mt-2 font-display text-2xl font-bold">Your team is moving well.</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">
            Most goals are on track and response times are down this week. Two leave requests still need a
            quick look.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/7 p-4">
              <Clock3 size={18} className="text-butter" />
              <div className="mt-3 text-2xl font-bold">1.8d</div>
              <div className="text-xs text-white/45">Avg. approval time</div>
            </div>
            <div className="rounded-xl bg-white/7 p-4">
              <CheckCircle2 size={18} className="text-butter" />
              <div className="mt-3 text-2xl font-bold">78%</div>
              <div className="text-xs text-white/45">Goals on track</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
