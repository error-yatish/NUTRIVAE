import type { LucideIcon } from "lucide-react";
import { BarChart3, WalletCards, ArrowUpRight, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { downloadCsv } from "../lib/download";

export function PayrollPage() {
  const payroll = useQuery({
    queryKey: ["payroll"],
    queryFn: () =>
      api.get<
        Array<{
          amount: number;
          currency: string;
          frequency: string;
          effectiveFrom: string;
          employee: {
            firstName: string;
            lastName: string;
            workEmail: string;
            department?: { name: string };
            jobTitle?: { name: string };
          };
        }>
      >("/payroll")
  });
  const exportPayroll = () =>
    downloadCsv(
      "nutrivae-payroll.csv",
      payroll.data?.data.length
        ? payroll.data.data.map((record) => ({
            employee: `${record.employee.firstName} ${record.employee.lastName}`,
            email: record.employee.workEmail,
            department: record.employee.department?.name,
            job_title: record.employee.jobTitle?.name,
            amount: Number(record.amount),
            currency: record.currency,
            frequency: record.frequency,
            effective_from: record.effectiveFrom
          }))
        : [
            {
              employee: "No compensation records",
              email: "",
              department: "",
              job_title: "",
              amount: 0,
              currency: "USD",
              frequency: "ANNUAL",
              effective_from: ""
            }
          ]
    );
  return (
    <ModulePage
      icon={WalletCards}
      eyebrow="Rewards"
      title="Compensation"
      description="A clear, private view of salary history and payroll-ready data."
      action="Export payroll"
      onAction={exportPayroll}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Monthly payroll" value="$184,200" note="+3.2% from last month" />
        <Metric label="Average salary" value="$92,100" note="Across active employees" />
        <Metric label="Next payroll" value="Jun 30" note="9 days remaining" />
      </div>
      <div className="card mt-5 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <WalletCards />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold">Payroll exports are ready</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Connect a payroll provider or export normalized compensation data for your existing process.
        </p>
        <button className="btn-primary mt-5" onClick={exportPayroll}>
          <Download size={16} />
          Create export
        </button>
      </div>
    </ModulePage>
  );
}
export function AnalyticsPage() {
  const buildReport = () =>
    downloadCsv("nutrivae-people-insights.csv", [
      { metric: "Retention rate", value: "96.4%", period: "Current year" },
      { metric: "Average tenure", value: "2.8 years", period: "Current" },
      { metric: "Headcount growth", value: "12%", period: "Last 12 months" }
    ]);
  return (
    <ModulePage
      icon={BarChart3}
      eyebrow="People intelligence"
      title="Analytics"
      description="See the patterns behind growth, retention, and team health."
      action="Build report"
      onAction={buildReport}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Retention rate" value="96.4%" note="+1.2% year over year" />
        <Metric label="Average tenure" value="2.8y" note="Steady this quarter" />
        <Metric label="Headcount growth" value="+12%" note="In the last 12 months" />
      </div>
      <div className="card mt-5 flex min-h-80 items-center justify-center p-8 text-center">
        <div>
          <BarChart3 className="mx-auto text-brand-600" size={36} />
          <h2 className="mt-4 font-display text-xl font-bold">Your insight library</h2>
          <p className="mt-2 text-sm text-muted">
            Use “Build report” to download the current people metrics.
          </p>
        </div>
      </div>
    </ModulePage>
  );
}
function ModulePage({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  onAction,
  children
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
        <button className="btn-primary" onClick={onAction}>
          <Icon size={17} />
          {action}
        </button>
      </div>
      {children}
    </div>
  );
}
function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card p-5">
      <div className="flex justify-between text-sm text-muted">
        <span>{label}</span>
        <ArrowUpRight size={16} />
      </div>
      <div className="mt-4 font-display text-3xl font-extrabold">{value}</div>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}
