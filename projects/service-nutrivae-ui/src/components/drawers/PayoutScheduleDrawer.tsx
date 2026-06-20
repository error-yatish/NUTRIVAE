import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Drawer } from "../ui";
import { ThemedSelect } from "../forms";

type Employee = { id: string; firstName: string; lastName: string };

export function PayoutScheduleDrawer({
  open,
  onClose,
  employees,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    employeeId: "",
    amount: "",
    currency: "USD",
    type: "SALARY",
    scheduledFor: new Date().toISOString().slice(0, 10),
    note: ""
  });

  useEffect(() => {
    if (open) {
      setForm({
        employeeId: "",
        amount: "",
        currency: "USD",
        type: "SALARY",
        scheduledFor: new Date().toISOString().slice(0, 10),
        note: ""
      });
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => api.post("/payouts", form),
    onSuccess: () => {
      onCreated();
    }
  });

  return (
    <Drawer open={open} onClose={onClose} title="Schedule payout">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <ThemedSelect
          label="Employee"
          placeholder="Choose employee"
          value={form.employeeId}
          options={[{ value: "", label: "Choose employee" }].concat(
            employees.map((item) => ({
              value: item.id,
              label: `${item.firstName} ${item.lastName}`
            }))
          )}
          onChange={(value) => setForm({ ...form, employeeId: value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Amount</label>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              className="input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              className="input"
              maxLength={3}
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ThemedSelect
            label="Type"
            placeholder="Choose type"
            value={form.type}
            options={[
              { value: "SALARY", label: "SALARY" },
              { value: "BONUS", label: "BONUS" },
              { value: "REIMBURSEMENT", label: "REIMBURSEMENT" },
              { value: "COMMISSION", label: "COMMISSION" },
              { value: "OTHER", label: "OTHER" }
            ]}
            onChange={(value) => setForm({ ...form, type: value })}
          />
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={form.scheduledFor}
              onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            Schedule
          </button>
        </div>
      </form>
    </Drawer>
  );
}
