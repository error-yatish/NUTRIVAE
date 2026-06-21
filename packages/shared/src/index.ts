import { z } from "zod";

export const roles = ["ADMIN", "HR_MANAGER", "MANAGER", "EMPLOYEE"] as const;
export type Role = (typeof roles)[number];

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const employeeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  workEmail: z.string().email(),
  phone: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  personalEmail: z.preprocess((value) => (value === "" ? undefined : value), z.string().email().optional()),
  dateOfBirth: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),
  gender: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  maritalStatus: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  nationality: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  bloodGroup: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  address: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  city: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  state: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  postalCode: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  country: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  emergencyContactName: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  emergencyContactPhone: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  taxIdentifier: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  bankName: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  bankAccountNumber: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  jobTitleId: z.preprocess((value) => (value === "" ? undefined : value), z.string().uuid().optional()),
  departmentId: z.preprocess((value) => (value === "" ? undefined : value), z.string().uuid().optional()),
  managerId: z.preprocess((value) => (value === "" ? undefined : value), z.string().uuid().optional()),
  startDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "PROBATION", "INACTIVE"]).default("ACTIVE")
});

export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().min(5).max(500)
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"]
  });

export const goalSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(500).optional()),
  employeeId: z.string().uuid(),
  dueDate: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),
  status: z.enum(["DRAFT", "ACTIVE", "AT_RISK", "COMPLETED"]).default("ACTIVE")
});

export const jobOpeningSchema = z.object({
  title: z.string().min(3).max(120),
  departmentId: z.string().uuid(),
  location: z.string().min(2).max(120),
  employmentType: z.string().min(2).max(60),
  status: z.enum(["DRAFT", "OPEN", "PAUSED", "CLOSED"]).default("OPEN")
});

export const companySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/),
  theme: z.enum(["emerald", "blue", "pink", "violet", "orange"]).default("emerald"),
  currency: z.string().length(3).default("USD"),
  country: z.string().min(2).default("United States"),
  timezone: z.string().min(2).default("America/New_York"),
  legalName: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  registrationNumber: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  taxId: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  website: z.preprocess((value) => (value === "" ? undefined : value), z.string().url().optional()),
  phone: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional()),
  email: z.preprocess((value) => (value === "" ? undefined : value), z.string().email().optional()),
  address: z.preprocess((value) => (value === "" ? undefined : value), z.string().optional())
});

export const projectSchema = z.object({
  name: z.string().min(2).max(100),
  code: z
    .string()
    .min(2)
    .max(20)
    .transform((value) => value.toUpperCase()),
  description: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(500).optional()),
  clientName: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(100).optional()),
  status: z.enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED"]).default("ACTIVE"),
  startDate: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),
  endDate: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional())
});

export const projectAssignmentSchema = z.object({
  employeeId: z.string().uuid(),
  role: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(80).optional()),
  allocation: z.coerce.number().int().min(1).max(100).default(100),
  startDate: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional()),
  endDate: z.preprocess((value) => (value === "" ? undefined : value), z.coerce.date().optional())
});

export const departmentSchema = z.object({
  name: z.string().min(2).max(100),
  code: z
    .string()
    .min(2)
    .max(10)
    .transform((value) => value.toUpperCase())
});

export const jobTitleSchema = z.object({
  name: z.string().min(2).max(100),
  level: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(30).optional())
});

export const roleProfileSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(200).optional()),
  permissions: z.array(z.string()).min(1)
});

export const payoutSchema = z.object({
  employeeId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().length(3),
  type: z.enum(["SALARY", "BONUS", "REIMBURSEMENT", "COMMISSION", "OTHER"]),
  scheduledFor: z.coerce.date(),
  note: z.preprocess((value) => (value === "" ? undefined : value), z.string().max(500).optional())
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type JobOpeningInput = z.infer<typeof jobOpeningSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type JobTitleInput = z.infer<typeof jobTitleSchema>;
export type RoleProfileInput = z.infer<typeof roleProfileSchema>;
export type PayoutInput = z.infer<typeof payoutSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ProjectAssignmentInput = z.infer<typeof projectAssignmentSchema>;

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  roleName?: string;
  permissions: string[];
  companyId: string;
  companyName: string;
  companies: Array<{ id: string; name: string }>;
  employeeId?: string | null;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: { page?: number; pageSize?: number; total?: number };
}
