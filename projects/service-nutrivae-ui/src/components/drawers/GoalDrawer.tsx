import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema, type GoalInput } from "@nutrivae/shared";
import { api } from "../../lib/api";
import { Drawer } from "..";
import { ThemedSelect } from "../forms";

export function GoalDrawer({
  open,
  onClose,
  employees,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  onCreated: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<GoalInput>({ resolver: zodResolver(goalSchema), defaultValues: { status: "ACTIVE" } });

  const mutation = useMutation({
    mutationFn: (input: GoalInput) => api.post("/performance/goals", input),
    onSuccess: () => {
      reset();
      onCreated();
    },
    onError: (error: any) => setError("root", { message: error.message })
  });

  return (
    <Drawer open={open} onClose={onClose} title="Create a goal">
      <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div>
          <label className="label">Goal title</label>
          <input className="input" placeholder="e.g. Improve onboarding completion" {...register("title")} />
          <p className="text-xs text-red-600">{errors.title?.message}</p>
        </div>
        <Controller
          control={control}
          name="employeeId"
          render={({ field }) => (
            <ThemedSelect
              label="Owner"
              placeholder="Choose an employee"
              value={field.value}
              options={[{ value: "", label: "Choose an employee" }].concat(
                employees.map((employee) => ({
                  value: employee.id,
                  label: `${employee.firstName} ${employee.lastName}`
                }))
              )}
              onChange={field.onChange}
            />
          )}
        />
        <p className="text-xs text-red-600">{errors.employeeId?.message}</p>
        <div>
          <label className="label">Description</label>
          <textarea className="input !h-24 py-3" {...register("description")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Due date</label>
            <input className="input" type="date" {...register("dueDate")} />
          </div>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <ThemedSelect
                label="Status"
                placeholder="Choose status"
                value={field.value}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "AT_RISK", label: "At risk" }
                ]}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        {errors.root && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create goal"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
