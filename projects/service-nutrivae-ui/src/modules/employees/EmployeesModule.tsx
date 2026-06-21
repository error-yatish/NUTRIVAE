import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Download,
  Eye,
  Pencil,
  UserX,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Mail
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Avatar, Badge, Empty, Skeleton } from "@/components";
import { EmployeeFormDrawer, EmployeeProfileDrawer } from "@/modules/employees/drawers";
import { useAuth } from "@/lib/auth";
import { downloadCsv } from "@/lib/download";
import { Select } from "@/components/forms";

type Employee = {
  id: string;
  employeeNumber: string;
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
type Meta = {
  departments: Array<{ id: string; name: string }>;
  jobTitles: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string }>;
};

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["employees", search, department, page],
    queryFn: async () => {
      const result = await api.get<Employee[]>(
        `/employees?search=${encodeURIComponent(search)}&department=${department}&page=${page}&pageSize=8`
      );
      return result;
    }
  });
  const meta = useQuery({ queryKey: ["employee-meta"], queryFn: () => api.get<Meta>("/employees/meta") });
  const canEdit = user?.role === "ADMIN" || user?.role === "HR_MANAGER";
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearch(query);
    if (canEdit && searchParams.get("add") === "1") {
      setOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [canEdit, searchParams, setSearchParams]);
  const totalPages = Math.max(1, Math.ceil((query.data?.meta?.total ?? 0) / 8));
  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/employees/${id}/status`, { status }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["employees"] })
  });
  const enableLogin = useMutation({
    mutationFn: (id: string) => api.post(`/employees/${id}/enable-login`, { password: "Welcome123!" }),
    onSuccess: (result) =>
      window.alert(
        `Login enabled.\nEmail: ${(result.data as { email: string }).email}\nTemporary password: Welcome123!`
      )
  });
  const exportEmployees = () =>
    downloadCsv(
      "nutrivae-employees.csv",
      (query.data?.data ?? []).map((employee) => ({
        employee_id: employee.employeeNumber,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.workEmail,
        job_title: employee.jobTitle?.name,
        department: employee.department?.name,
        status: employee.status
      }))
    );
  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Organization</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">People directory</h1>
          <p className="mt-2 text-sm text-muted">
            {query.data?.meta?.total ?? 0} people across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={exportEmployees} disabled={!query.data?.data.length}>
            <Download size={16} />
            Export
          </button>
          {canEdit && (
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <Plus size={17} />
              Add employee
            </button>
          )}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input !h-10 pl-9"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="relative sm:w-56">
            <SlidersHorizontal
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Select
              value={department}
              placeholder="All departments"
              options={[{ value: "", label: "All departments" }].concat(
                meta.data?.data.departments.map((item) => ({
                  value: item.id,
                  label: item.name
                })) ?? []
              )}
              onChange={(value) => {
                setDepartment(value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-canvas/70 text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {query.isLoading
                ? [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="p-5" colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : query.data?.data.map((employee) => {
                    const name = `${employee.firstName} ${employee.lastName}`;
                    return (
                      <tr className="group hover:bg-canvas/50" key={employee.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={name} />
                            <div>
                              <div className="text-sm font-semibold">{name}</div>
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                                <Mail size={11} />
                                {employee.workEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">{employee.jobTitle?.name ?? "—"}</td>
                        <td className="px-4 py-4 text-sm text-muted">{employee.department?.name ?? "—"}</td>
                        <td className="px-4 py-4">
                          <Badge
                            tone={
                              employee.status === "ACTIVE"
                                ? "green"
                                : employee.status === "PROBATION"
                                  ? "amber"
                                  : "neutral"
                            }
                          >
                            {employee.status.toLowerCase().replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-muted">{employee.employeeNumber}</td>
                        <td className="px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View profile"
                              onClick={() => setSelected(employee)}
                              className="rounded-lg p-2 text-muted hover:bg-base-200 hover:text-base-content"
                            >
                              <Eye size={16} />
                            </button>
                            {canEdit && (
                              <>
                                <button
                                  title="Edit employee"
                                  onClick={() => setEditing(employee)}
                                  className="rounded-lg p-2 text-muted hover:bg-base-200 hover:text-base-content"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  title="Enable employee login"
                                  onClick={() => enableLogin.mutate(employee.id)}
                                  className="rounded-lg p-2 text-muted hover:bg-base-200 hover:text-base-content"
                                >
                                  <KeyRound size={16} />
                                </button>
                                <button
                                  title={employee.status === "INACTIVE" ? "Reactivate" : "Deactivate"}
                                  onClick={() =>
                                    changeStatus.mutate({
                                      id: employee.id,
                                      status: employee.status === "INACTIVE" ? "ACTIVE" : "INACTIVE"
                                    })
                                  }
                                  className="rounded-lg p-2 text-muted hover:bg-base-200 hover:text-error"
                                >
                                  <UserX size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {!query.isLoading && !query.data?.data.length && (
          <Empty title="No people found" text="Try another search or add your first employee." />
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-line p-2 disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-line p-2 disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
      <EmployeeFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        meta={meta.data?.data}
        onCreated={() => {
          setOpen(false);
          void queryClient.invalidateQueries({ queryKey: ["employees"] });
        }}
      />
      <EmployeeFormDrawer
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        meta={meta.data?.data}
        employee={editing}
        onCreated={() => {
          setEditing(null);
          void queryClient.invalidateQueries({ queryKey: ["employees"] });
        }}
      />
      <EmployeeProfileDrawer open={Boolean(selected)} onClose={() => setSelected(null)} employee={selected} />
    </div>
  );
}
