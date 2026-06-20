import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobOpeningSchema, type JobOpeningInput } from "@nutrivae/shared";
import { api } from "../../lib/api";
import { Drawer } from "../ui";
import { ThemedSelect } from "../forms";

export function JobOpeningDrawer({
  open,
  onClose,
  departments,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  departments: Array<{ id: string; name: string }>;
  onCreated: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<JobOpeningInput>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: { status: "OPEN", employmentType: "Full-time", location: "Remote" }
  });

  const mutation = useMutation({
    mutationFn: (input: JobOpeningInput) => api.post("/recruitment/jobs", input),
    onSuccess: () => {
      reset();
      onCreated();
    },
    onError: (error: any) => setError("root", { message: error.message })
  });

  return (
    <Drawer open={open} onClose={onClose} title="Create a job opening">
      <form className="space-y-4" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div>
          <label className="label">Job title</label>
          <input className="input" placeholder="e.g. Product Engineer" {...register("title")} />
          <p className="text-xs text-red-600">{errors.title?.message}</p>
        </div>
        <Controller
          control={control}
          name="departmentId"
          render={({ field }) => (
            <ThemedSelect
              label="Department"
              placeholder="Choose a department"
              value={field.value}
              options={[{ value: "", label: "Choose a department" }].concat(
                departments.map((department) => ({
                  value: department.id,
                  label: department.name
                }))
              )}
              onChange={field.onChange}
            />
          )}
        />
        <p className="text-xs text-red-600">{errors.departmentId?.message}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" {...register("location")} />
          </div>
          <Controller
            control={control}
            name="employmentType"
            render={({ field }) => (
              <ThemedSelect
                label="Employment type"
                placeholder="Choose employment type"
                value={field.value}
                options={[
                  { value: "Full-time", label: "Full-time" },
                  { value: "Part-time", label: "Part-time" },
                  { value: "Contract", label: "Contract" },
                  { value: "Internship", label: "Internship" }
                ]}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <ThemedSelect
              label="Publishing status"
              placeholder="Choose status"
              value={field.value}
              options={[
                { value: "OPEN", label: "Open" },
                { value: "DRAFT", label: "Save as draft" }
              ]}
              onChange={field.onChange}
            />
          )}
        />
        {errors.root && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create opening"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
