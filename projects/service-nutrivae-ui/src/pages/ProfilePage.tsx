import { useQuery } from "@tanstack/react-query";
import { Mail, CalendarDays, Building2, BriefcaseBusiness, WalletCards, Target } from "lucide-react";
import { api } from "../lib/api";
import { Avatar, Badge, Skeleton } from "../components/ui";
import { useAuth } from "../lib/auth";

type Profile = {
  firstName: string;
  lastName: string;
  workEmail: string;
  status: string;
  startDate: string;
  department?: { name: string };
  jobTitle?: { name: string };
  manager?: { firstName: string; lastName: string };
  leaveBalances: Array<{ allowance: number; used: number; leaveType: { name: string } }>;
  goals: Array<{ id: string; title: string; progress: number }>;
  payouts: Array<{ id: string; amount: number; currency: string; status: string }>;
};
export function ProfilePage() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["my-profile", user?.employeeId],
    queryFn: () => api.get<Profile>(`/employees/${user!.employeeId}`),
    enabled: Boolean(user?.employeeId)
  });
  if (query.isLoading) return <Skeleton className="h-96" />;
  const profile = query.data?.data;
  if (!profile) return <div className="card p-8">This account is not linked to an employee profile.</div>;
  const name = `${profile.firstName} ${profile.lastName}`;
  return (
    <div className="animate-in space-y-6">
      <div>
        <p className="eyebrow">Employee self-service</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">My profile</h1>
      </div>
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <Avatar name={name} size="lg" />
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{name}</h2>
            <p className="text-sm text-muted">
              {profile.jobTitle?.name ?? "Employee"} · {profile.department?.name ?? "No department"}
            </p>
          </div>
          <Badge tone="green">{profile.status.toLowerCase()}</Badge>
        </div>
        <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Info icon={Mail} label="Work email" value={profile.workEmail} />
          <Info icon={Building2} label="Department" value={profile.department?.name ?? "—"} />
          <Info
            icon={BriefcaseBusiness}
            label="Manager"
            value={profile.manager ? `${profile.manager.firstName} ${profile.manager.lastName}` : "—"}
          />
          <Info
            icon={CalendarDays}
            label="Start date"
            value={new Date(profile.startDate).toLocaleDateString()}
          />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display font-bold">Leave balances</h2>
          {profile.leaveBalances.map((balance) => (
            <div
              className="mt-3 flex justify-between rounded-xl bg-canvas p-3 text-sm"
              key={balance.leaveType.name}
            >
              <span>{balance.leaveType.name}</span>
              <b>{Number(balance.allowance) - Number(balance.used)} days</b>
            </div>
          ))}
        </div>
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <Target size={18} />
            My goals
          </h2>
          {profile.goals.map((goal) => (
            <div className="mt-4" key={goal.id}>
              <div className="flex justify-between text-sm">
                <span>{goal.title}</span>
                <b>{goal.progress}%</b>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display font-bold">
          <WalletCards size={18} />
          Recent payouts
        </h2>
        <div className="mt-4 flex gap-3">
          {profile.payouts.map((payout) => (
            <div className="rounded-xl border border-line p-4" key={payout.id}>
              <b>
                {payout.currency} {Number(payout.amount).toLocaleString()}
              </b>
              <div>
                <Badge tone={payout.status === "PAID" ? "green" : "amber"}>
                  {payout.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon size={17} className="text-brand-600" />
      <div>
        <span className="block text-xs text-muted">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    </div>
  );
}
