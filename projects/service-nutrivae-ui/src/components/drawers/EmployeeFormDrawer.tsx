import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@nutrivae/shared";
import { api } from "../../lib/api";
import { Drawer } from "../ui";
import { DatePickerField, FormField, ThemedSelect } from "../forms";

type Meta = {
  departments: Array<{ id: string; name: string }>;
  jobTitles: Array<{ id: string; name: string }>;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  status: string;
  startDate: string;
  personalEmail?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  taxIdentifier?: string;
  bankName?: string;
  bankAccountNumber?: string;
  department?: { id: string; name: string };
  jobTitle?: { id: string; name: string };
};

export function EmployeeFormDrawer({
  open,
  onClose,
  meta,
  employee,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  meta?: Meta;
  employee?: Employee | null;
  onCreated: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: "ACTIVE", startDate: new Date().toISOString().slice(0, 10) as unknown as Date }
  });

  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        workEmail: employee.workEmail,
        departmentId: employee.department?.id,
        jobTitleId: employee.jobTitle?.id,
        startDate: employee.startDate.slice(0, 10) as unknown as Date,
        status: employee.status as EmployeeInput["status"],
        personalEmail: employee.personalEmail,
        phone: employee.phone,
        dateOfBirth: employee.dateOfBirth?.slice(0, 10) as unknown as Date,
        gender: employee.gender,
        maritalStatus: employee.maritalStatus,
        nationality: employee.nationality,
        bloodGroup: employee.bloodGroup,
        address: employee.address,
        city: employee.city,
        state: employee.state,
        postalCode: employee.postalCode,
        country: employee.country,
        emergencyContactName: employee.emergencyContactName,
        emergencyContactPhone: employee.emergencyContactPhone,
        taxIdentifier: employee.taxIdentifier,
        bankName: employee.bankName,
        bankAccountNumber: employee.bankAccountNumber
      });
    } else {
      reset({ status: "ACTIVE", startDate: new Date().toISOString().slice(0, 10) as unknown as Date });
    }
  }, [employee, reset]);

  const mutation = useMutation({
    mutationFn: (input: EmployeeInput) =>
      employee ? api.patch(`/employees/${employee.id}`, input) : api.post("/employees", input),
    onSuccess: () => {
      reset();
      onCreated();
    },
    onError: (error: any) => setError("root", { message: error.message })
  });

  return (
    <Drawer open={open} onClose={onClose} title={employee ? "Edit employee" : "Add a new employee"}>
      <form className="space-y-6" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <fieldset className="form-grid">
          <legend className="mb-3 w-full font-display font-bold sm:col-span-2">Employment</legend>
          <FormField label="First name" error={errors.firstName?.message} {...register("firstName")} />
          <FormField label="Last name" error={errors.lastName?.message} {...register("lastName")} />
          <FormField
            className="sm:col-span-2"
            label="Work email"
            type="email"
            error={errors.workEmail?.message}
            {...register("workEmail")}
          />
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <ThemedSelect
                label="Department"
                placeholder="Select department"
                value={field.value}
                options={(meta?.departments ?? []).map((item) => ({
                  value: item.id,
                  label: item.name
                }))}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="jobTitleId"
            render={({ field }) => (
              <ThemedSelect
                label="Job title"
                placeholder="Select job title"
                value={field.value}
                options={(meta?.jobTitles ?? []).map((item) => ({
                  value: item.id,
                  label: item.name
                }))}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePickerField
                label="Start date"
                value={field.value ? String(field.value).slice(0, 10) : ""}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <ThemedSelect
                label="Status"
                value={field.value}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "PROBATION", label: "Probation" },
                  { value: "ON_LEAVE", label: "On leave" },
                  { value: "INACTIVE", label: "Inactive" }
                ]}
                onChange={field.onChange}
              />
            )}
          />
        </fieldset>
        <fieldset className="form-grid">
          <legend className="mb-3 w-full font-display font-bold sm:col-span-2">Contact and personal</legend>
          <FormField label="Personal email" type="email" {...register("personalEmail")} />
          <FormField label="Phone" {...register("phone")} />
          <Controller
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <DatePickerField
                label="Date of birth"
                max={new Date().toISOString().slice(0, 10)}
                value={field.value ? String(field.value).slice(0, 10) : ""}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <ThemedSelect
                label="Gender"
                placeholder="Select gender"
                value={field.value}
                options={[
                  { value: "Female", label: "Female" },
                  { value: "Male", label: "Male" },
                  { value: "Non-binary", label: "Non-binary" },
                  { value: "Prefer not to say", label: "Prefer not to say" }
                ]}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="maritalStatus"
            render={({ field }) => (
              <ThemedSelect
                label="Marital status"
                placeholder="Select marital status"
                value={field.value}
                options={[
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                  { value: "Divorced", label: "Divorced" },
                  { value: "Widowed", label: "Widowed" }
                ]}
                onChange={field.onChange}
              />
            )}
          />
          <FormField label="Nationality" {...register("nationality")} />
          <FormField label="Blood group" {...register("bloodGroup")} />
          <FormField label="Country" {...register("country")} />
          <FormField className="sm:col-span-2" label="Address" {...register("address")} />
          <FormField label="City" {...register("city")} />
          <FormField label="State" {...register("state")} />
          <FormField label="Postal code" {...register("postalCode")} />
        </fieldset>
        <fieldset className="form-grid">
          <legend className="mb-3 w-full font-display font-bold sm:col-span-2">
            Emergency, statutory and bank
          </legend>
          <FormField label="Emergency contact" {...register("emergencyContactName")} />
          <FormField label="Emergency phone" {...register("emergencyContactPhone")} />
          <FormField label="Tax identifier" {...register("taxIdentifier")} />
          <FormField label="Bank name" {...register("bankName")} />
          <FormField
            className="sm:col-span-2"
            label="Bank account number"
            {...register("bankAccountNumber")}
          />
        </fieldset>
        {errors.root && (
          <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p>
        )}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" disabled={mutation.isPending}>
            {employee ? "Save changes" : "Add employee"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
