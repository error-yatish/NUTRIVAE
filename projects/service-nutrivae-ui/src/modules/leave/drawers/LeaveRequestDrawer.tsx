import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaveRequestSchema, type LeaveRequestInput } from "@nutrivae/shared";
import { api } from "@/lib/api";
import { Drawer } from "@/components";
import { DatePickerField, Select } from "@/components/forms";

type LeaveType = { id: string; name: string; color: string };

export function LeaveRequestDrawer({
  open,
  onClose,
  initialDate,
  types,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  types: LeaveType[];
  onCreated: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<LeaveRequestInput>({ resolver: zodResolver(leaveRequestSchema) });

  useEffect(() => {
    if (!open) return;

    reset({
      leaveTypeId: "",
      startDate: (initialDate ?? new Date().toISOString().slice(0, 10)) as unknown as Date,
      endDate: (initialDate ?? new Date().toISOString().slice(0, 10)) as unknown as Date,
      reason: ""
    });
  }, [initialDate, open, reset]);

  const mutation = useMutation({
    mutationFn: (input: LeaveRequestInput) => api.post("/leave", input),
    onSuccess: () => {
      onCreated();
    },
    onError: (error: Error) => setError("root", { message: error.message })
  });

  return (
    <Drawer open={open} onClose={onClose} title="Request time off">
      <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <Controller
          control={control}
          name="leaveTypeId"
          render={({ field }) => (
            <Select
              label="Leave type"
              placeholder="Choose a leave type"
              value={field.value}
              options={[{ value: "", label: "Choose a leave type" }].concat(
                types.map((type) => ({
                  value: type.id,
                  label: type.name
                }))
              )}
              onChange={field.onChange}
            />
          )}
        />
        <p className="text-xs text-error">{errors.leaveTypeId?.message}</p>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePickerField
                label="From"
                value={field.value ? String(field.value).slice(0, 10) : ""}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DatePickerField
                label="To"
                value={field.value ? String(field.value).slice(0, 10) : ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div>
          <label className="label">Reason</label>
          <textarea className="input !h-24 py-3" {...register("reason")} />
        </div>
        {errors.root && (
          <p className="rounded-xl border border-error bg-base-200 p-3 text-sm text-error">
            {errors.root.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            Request time off
          </button>
        </div>
      </form>
    </Drawer>
  );
}
