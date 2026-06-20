import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  CalendarDays,
  Check,
  X,
  Palmtree,
  HeartPulse,
  Sparkles,
  List,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { useState } from "react";
import { api } from "../lib/api";
import { Avatar, Badge, Skeleton } from "../components/ui";
import { LeaveRequestDrawer } from "../components/drawers";
import { useAuth } from "../lib/auth";
import { DatePickerField } from "../components/forms";

type Leave = {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  employee: { firstName: string; lastName: string; department?: { name: string } };
  leaveType: { id: string; name: string; color: string };
};
type LeaveType = { id: string; name: string; color: string };
type Balance = { id: string; allowance: number; used: number; leaveType: LeaveType };

export function LeavePage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>();
  const client = useQueryClient();
  const { user } = useAuth();
  const leave = useQuery({ queryKey: ["leave"], queryFn: () => api.get<Leave[]>("/leave") });
  const balances = useQuery({
    queryKey: ["balances"],
    queryFn: () => api.get<Balance[]>("/leave/balances/me")
  });
  const types = useQuery({ queryKey: ["leave-types"], queryFn: () => api.get<LeaveType[]>("/leave/types") });
  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/leave/${id}/decision`, { status }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["leave"] });
      void client.invalidateQueries({ queryKey: ["balances"] });
    }
  });
  const canApprove =
    ["ADMIN", "HR_MANAGER", "MANAGER"].includes(user?.role ?? "") ||
    user?.permissions.includes("leave.approve");
  const icons = [Palmtree, HeartPulse, Sparkles];
  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Time & attendance</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Time off</h1>
          <p className="mt-2 text-sm text-muted">Plan time away and keep everyone in the loop.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={17} />
          Request time off
        </button>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {balances.isLoading
          ? [1, 2, 3].map((i) => <Skeleton className="h-32" key={i} />)
          : balances.data?.data.map((balance, i) => {
              const Icon = icons[i % icons.length]!;
              const remaining = Number(balance.allowance) - Number(balance.used);
              return (
                <div className="card p-5" key={balance.id}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon size={19} />
                    </span>
                    <span className="text-xs text-muted">{balance.used} used</span>
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="font-display text-3xl font-extrabold">{remaining}</span>
                    <span className="pb-1 text-sm text-muted">days left</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold">{balance.leaveType.name}</div>
                </div>
              );
            })}
      </section>
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <h2 className="font-display text-lg font-bold">{canApprove ? "Team requests" : "My requests"}</h2>
            <p className="mt-1 text-xs text-muted">
              {view === "calendar"
                ? "Approved leave across the month"
                : "Review and manage upcoming absences"}
            </p>
          </div>
          <div className="flex rounded-xl border border-line p-1">
            <button
              aria-label="List view"
              onClick={() => setView("list")}
              className={`rounded-lg p-2 ${view === "list" ? "bg-brand-50 text-brand-700" : "text-muted"}`}
            >
              <List size={17} />
            </button>
            <button
              aria-label="Calendar view"
              onClick={() => setView("calendar")}
              className={`rounded-lg p-2 ${view === "calendar" ? "bg-brand-50 text-brand-700" : "text-muted"}`}
            >
              <CalendarDays size={17} />
            </button>
          </div>
        </div>
        {view === "list" ? (
          <div className="divide-y divide-line">
            {leave.isLoading
              ? [1, 2, 3].map((i) => (
                  <div className="p-5" key={i}>
                    <Skeleton className="h-12" />
                  </div>
                ))
              : leave.data?.data.map((item) => {
                  const name = `${item.employee.firstName} ${item.employee.lastName}`;
                  return (
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={item.id}>
                      <Avatar name={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{name}</span>
                          <Badge
                            tone={
                              item.status === "APPROVED"
                                ? "green"
                                : item.status === "PENDING"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            {item.status.toLowerCase()}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {item.leaveType.name} · {format(new Date(item.startDate), "MMM d")}–
                          {format(new Date(item.endDate), "MMM d, yyyy")} · {item.days} days
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-400">{item.reason}</p>
                      </div>
                      {canApprove && item.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => decide.mutate({ id: item.id, status: "REJECTED" })}
                            className="btn-secondary !px-3 !py-2 text-red-600"
                          >
                            <X size={15} />
                            Decline
                          </button>
                          <button
                            onClick={() => decide.mutate({ id: item.id, status: "APPROVED" })}
                            className="btn-primary !px-3 !py-2"
                          >
                            <Check size={15} />
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>
        ) : (
          <LeaveCalendar
            month={month}
            setMonth={setMonth}
            leave={leave.data?.data ?? []}
            onRequest={(date) => {
              setSelectedDate(format(date, "yyyy-MM-dd"));
              setOpen(true);
            }}
          />
        )}
      </section>
      <LeaveRequestDrawer
        open={open}
        onClose={() => setOpen(false)}
        types={types.data?.data ?? []}
        initialDate={selectedDate}
        onCreated={() => {
          setOpen(false);
          setSelectedDate(undefined);
          void client.invalidateQueries({ queryKey: ["leave"] });
        }}
      />
    </div>
  );
}

function LeaveCalendar({
  month,
  setMonth,
  leave,
  onRequest
}: {
  month: Date;
  setMonth: (date: Date) => void;
  leave: Leave[];
  onRequest: (date: Date) => void;
}) {
  const days: Date[] = [];
  for (let day = startOfWeek(startOfMonth(month)); day <= endOfWeek(endOfMonth(month)); day = addDays(day, 1))
    days.push(day);
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button className="rounded-lg border border-line p-2" onClick={() => setMonth(subMonths(month, 1))}>
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-display font-bold">{format(month, "MMMM yyyy")}</h3>
        <button className="rounded-lg border border-line p-2" onClick={() => setMonth(addMonths(month, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 border-l border-t border-line">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name) => (
          <div
            className="border-b border-r border-line bg-canvas p-2 text-center text-[10px] font-bold uppercase text-muted"
            key={name}
          >
            {name}
          </div>
        ))}
        {days.map((day) => {
          const events = leave.filter((item) =>
            isWithinInterval(day, {
              start: parseISO(item.startDate.slice(0, 10)),
              end: parseISO(item.endDate.slice(0, 10))
            })
          );
          return (
            <button
              type="button"
              onClick={() => onRequest(day)}
              className={`min-h-24 border-b border-r border-line p-2 text-left transition hover:bg-brand-50 ${!isSameMonth(day, month) ? "bg-slate-50 text-slate-300" : ""}`}
              key={day.toISOString()}
              title={`Request time off starting ${format(day, "MMMM d, yyyy")}`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs ${isSameDay(day, new Date()) ? "bg-brand-700 text-white" : ""}`}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {events.slice(0, 3).map((event) => (
                  <div
                    className="truncate rounded px-1.5 py-1 text-[9px] font-semibold text-white"
                    style={{
                      backgroundColor:
                        event.status === "APPROVED"
                          ? event.leaveType.color
                          : event.status === "PENDING"
                            ? "#d97706"
                            : "#94a3b8"
                    }}
                    key={event.id}
                  >
                    {event.employee.firstName} {event.employee.lastName} · {event.status.toLowerCase()}
                  </div>
                ))}
                {events.length > 3 && (
                  <span className="text-[9px] text-muted">+{events.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
