import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { Avatar, Badge, Skeleton } from "../components";
import { useState } from "react";
import { useAuth } from "../lib/auth";
import { GoalDrawer } from "../components/drawers";

type Goal = {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: string;
  dueDate?: string;
  employee: { firstName: string; lastName: string; department?: { name: string } };
};

export function PerformancePage() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["goals"], queryFn: () => api.get<Goal[]>("/performance/goals") });
  const employees = useQuery({
    queryKey: ["goal-employees"],
    queryFn: () =>
      api.get<Array<{ id: string; firstName: string; lastName: string }>>("/employees?pageSize=50")
  });
  const canCreate = ["ADMIN", "HR_MANAGER", "MANAGER"].includes(user?.role ?? "");

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Growth & impact</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Performance</h1>
          <p className="mt-2 text-sm text-muted">Align on meaningful goals and help people grow.</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={17} />
            Create goal
          </button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <Target className="text-brand-600" />
          <div className="mt-4 font-display text-3xl font-extrabold">{query.data?.data.length ?? 0}</div>
          <div className="text-sm font-semibold">Active goals</div>
        </div>
        <div className="card p-5">
          <TrendingUp className="text-violet-600" />
          <div className="mt-4 font-display text-3xl font-extrabold">78%</div>
          <div className="text-sm font-semibold">On-track rate</div>
        </div>
        <div className="rounded-2xl bg-brand-900 p-5 text-white">
          <p className="text-sm text-white/55">Next review cycle</p>
          <div className="mt-3 font-display text-2xl font-bold">Q3 Growth Review</div>
          <p className="mt-2 text-xs text-butter">Starts August 3</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Company goals</h2>
          <button className="btn-secondary !py-2">Filter</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {query.isLoading
            ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)
            : query.data?.data.map((goal) => {
                const name = `${goal.employee.firstName} ${goal.employee.lastName}`;
                return (
                  <div className="rounded-2xl border border-line p-5" key={goal.id}>
                    <div className="flex items-start justify-between gap-3">
                      <Badge tone={goal.status === "AT_RISK" ? "red" : "green"}>
                        {goal.status.toLowerCase().replace("_", " ")}
                      </Badge>
                      <span className="font-display text-xl font-extrabold">{goal.progress}%</span>
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold">{goal.title}</h3>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div
                        className={
                          goal.status === "AT_RISK"
                            ? "h-full rounded-full bg-coral"
                            : "h-full rounded-full bg-brand-600"
                        }
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Avatar name={name} size="sm" />
                      <div>
                        <div className="text-xs font-semibold">{name}</div>
                        <div className="text-[10px] text-muted">{goal.employee.department?.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      <GoalDrawer
        open={open}
        onClose={() => setOpen(false)}
        employees={employees.data?.data ?? []}
        onCreated={() => {
          setOpen(false);
          void client.invalidateQueries({ queryKey: ["goals"] });
          void client.invalidateQueries({ queryKey: ["dashboard"] });
        }}
      />
    </div>
  );
}
