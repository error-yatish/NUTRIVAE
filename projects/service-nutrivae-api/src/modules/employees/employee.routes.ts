import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "@nutrivae/database";
import { employeeSchema } from "@nutrivae/shared";
import { allowRoles, authenticate } from "../../lib/auth.js";
import { audit } from "../../lib/audit.js";
import { AppError, asyncHandler } from "../../lib/errors.js";

export const employeeRouter = Router();
employeeRouter.use(authenticate);

employeeRouter.get(
  "/meta",
  asyncHandler(async (req, res) => {
    const [departments, jobTitles, teams, roles] = await Promise.all([
      prisma.department.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } }),
      prisma.jobTitle.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } }),
      prisma.team.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } }),
      prisma.roleProfile.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } })
    ]);
    res.json({ data: { departments, jobTitles, teams, roles } });
  })
);

employeeRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const search = String(req.query.search ?? "");
    const department = String(req.query.department ?? "");
    const where: Prisma.EmployeeWhereInput = {
      companyId: req.user!.companyId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { workEmail: { contains: search, mode: "insensitive" } }
        ]
      }),
      ...(department && { departmentId: department })
    };
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { firstName: "asc" },
        include: {
          department: true,
          jobTitle: true,
          manager: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.employee.count({ where })
    ]);
    res.json({ data: employees, meta: { page, pageSize, total } });
  })
);

employeeRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const employee = await prisma.employee.findUnique({
      where: { id: String(req.params.id), companyId: req.user!.companyId },
      include: {
        department: true,
        team: true,
        jobTitle: true,
        manager: true,
        documents: true,
        leaveBalances: { include: { leaveType: true } },
        goals: true,
        salaryRecords: { orderBy: { effectiveFrom: "desc" } },
        payouts: { orderBy: { scheduledFor: "desc" } },
        projectAssignments: { include: { project: true } },
        user: {
          include: { memberships: { where: { companyId: req.user!.companyId }, include: { role: true } } }
        }
      }
    });
    if (!employee) throw new AppError(404, "Employee not found.", "NOT_FOUND");
    res.json({ data: employee });
  })
);

employeeRouter.post(
  "/",
  allowRoles("ADMIN", "HR_MANAGER"),
  asyncHandler(async (req, res) => {
    const input = employeeSchema.parse(req.body);
    const count = await prisma.employee.count({ where: { companyId: req.user!.companyId } });
    const employee = await prisma.employee.create({
      data: {
        ...input,
        companyId: req.user!.companyId,
        employeeNumber: `NV-${String(1001 + count).padStart(4, "0")}`
      },
      include: { department: true, jobTitle: true }
    });
    await audit(req, "EMPLOYEE_CREATED", "Employee", employee.id, { workEmail: employee.workEmail });
    res.status(201).json({ data: employee });
  })
);

employeeRouter.patch(
  "/:id",
  allowRoles("ADMIN", "HR_MANAGER"),
  asyncHandler(async (req, res) => {
    const input = employeeSchema.partial().parse(req.body);
    const employee = await prisma.employee.update({
      where: { id: String(req.params.id), companyId: req.user!.companyId },
      data: input,
      include: { department: true, jobTitle: true }
    });
    await audit(req, "EMPLOYEE_UPDATED", "Employee", employee.id, { fields: Object.keys(input) });
    res.json({ data: employee });
  })
);

employeeRouter.patch(
  "/:id/status",
  allowRoles("ADMIN", "HR_MANAGER"),
  asyncHandler(async (req, res) => {
    const status = String(req.body.status) as "ACTIVE" | "ON_LEAVE" | "PROBATION" | "INACTIVE";
    const employee = await prisma.employee.update({
      where: { id: String(req.params.id), companyId: req.user!.companyId },
      data: { status }
    });
    if (employee.userId)
      await prisma.companyMembership.updateMany({
        where: { userId: employee.userId, companyId: req.user!.companyId },
        data: { isActive: status !== "INACTIVE" }
      });
    await audit(req, "EMPLOYEE_STATUS_CHANGED", "Employee", employee.id, { status });
    res.json({ data: employee });
  })
);
