import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@nutrivae/shared";
import { api } from "@/lib/api";
import { Drawer, Tabs } from "@/components";
import { DatePickerField, FormField, Select } from "@/components/forms";
import {
  employeeBloodGroupOptions,
  employeeGenderOptions,
  employeeMaritalStatusOptions,
  employeeStatusOptions
} from "@/modules/employees/constants";

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
  const [activeSection, setActiveSection] = useState<"employment" | "personal" | "compliance">("employment");
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
    onError: (error: Error) => setError("root", { message: error.message })
  });

  return (
    <Drawer open={open} onClose={onClose} title={employee ? "Edit employee" : "Add a new employee"}>
      <form className="space-y-6" onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <Tabs
          value={activeSection}
          onChange={setActiveSection}
          ariaLabel="Employee form sections"
          items={[
            { id: "employment", label: "Employment" },
            { id: "personal", label: "Contact & personal" },
            { id: "compliance", label: "Emergency & bank" }
          ]}
        />
        {activeSection === "employment" && (
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
                <Select
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
                <Select
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
                <Select
                  label="Status"
                  value={field.value}
                  options={employeeStatusOptions}
                  onChange={field.onChange}
                />
              )}
            />
          </fieldset>
        )}
        {activeSection === "personal" && (
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
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  value={field.value}
                  options={employeeGenderOptions}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="maritalStatus"
              render={({ field }) => (
                <Select
                  label="Marital status"
                  placeholder="Select marital status"
                  value={field.value}
                  options={employeeMaritalStatusOptions}
                  onChange={field.onChange}
                />
              )}
            />
            <FormField label="Nationality" {...register("nationality")} />
            <Controller
              control={control}
              name="bloodGroup"
              render={({ field }) => (
                <Select
                  label="Blood group"
                  placeholder="Select blood group"
                  value={field.value}
                  options={employeeBloodGroupOptions}
                  onChange={field.onChange}
                />
              )}
            />
            <FormField label="Country" {...register("country")} />
            <FormField className="sm:col-span-2" label="Address" {...register("address")} />
            <FormField label="City" {...register("city")} />
            <FormField label="State" {...register("state")} />
            <FormField label="Postal code" {...register("postalCode")} />
          </fieldset>
        )}
        {activeSection === "compliance" && (
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
        )}
        {errors.root && (
          <p className="sm:col-span-2 rounded-xl border border-error bg-base-200 p-3 text-sm text-error">
            {errors.root.message}
          </p>
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
