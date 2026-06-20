import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { api } from "../lib/api";
import { Avatar, Badge } from "../components";
import { PayoutScheduleDrawer } from "../components/drawers";
import { useAuth } from "../lib/auth";
import { ThemedSelect } from "../components/forms";

type Payout = {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  scheduledFor: string;
  employee: { firstName: string; lastName: string; workEmail: string };
};
export function PayoutsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ["payouts"], queryFn: () => api.get<Payout[]>("/payouts") });
  const employees = useQuery({
    queryKey: ["payout-employees"],
    queryFn: () =>
      api.get<Array<{ id: string; firstName: string; lastName: string }>>("/employees?pageSize=50")
  });
  const [form, setForm] = useState({
    employeeId: "",
    amount: "",
    currency: "USD",
    type: "SALARY",
    scheduledFor: new Date().toISOString().slice(0, 10),
    note: ""
  });
  const create = useMutation({
    mutationFn: () => api.post("/payouts", form),
    onSuccess: () => {
      setOpen(false);
      void client.invalidateQueries({ queryKey: ["payouts"] });
    }
  });
  const status = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      api.patch(`/payouts/${id}/status`, { status: value }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["payouts"] })
  });
  const canManage = user?.role === "ADMIN" || user?.permissions.includes("payouts.manage");
  return (
    <div className="animate-in space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Compensation operations</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Payouts</h1>
          <p className="mt-2 text-sm text-muted">
            {canManage
              ? "Schedule, track, and reconcile employee payouts."
              : "View your salary, bonuses, and reimbursements."}
          </p>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus size={17} />
            New payout
          </button>
        )}
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-line">
          {query.data?.data.map((payout) => {
            const name = `${payout.employee.firstName} ${payout.employee.lastName}`;
            return (
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={payout.id}>
                <Avatar name={name} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className="text-xs text-muted">
                    {payout.type.toLowerCase()} · {format(new Date(payout.scheduledFor), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold">
                    {payout.currency} {Number(payout.amount).toLocaleString()}
                  </div>
                  <Badge tone={payout.status === "PAID" ? "green" : "amber"}>
                    {payout.status.toLowerCase()}
                  </Badge>
                </div>
                {canManage && payout.status !== "PAID" && (
                  <button
                    className="btn-secondary !px-3 !py-2"
                    onClick={() => status.mutate({ id: payout.id, value: "PAID" })}
                  >
                    <CheckCircle2 size={15} />
                    Mark paid
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <PayoutScheduleDrawer
        open={open}
        onClose={() => setOpen(false)}
        employees={employees.data?.data ?? []}
        onCreated={() => {
          setOpen(false);
          void client.invalidateQueries({ queryKey: ["payouts"] });
        }}
      />
    </div>
  );
}
