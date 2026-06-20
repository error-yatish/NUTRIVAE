import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@nutrivae/database";
import {
  companySchema,
  departmentSchema,
  jobTitleSchema,
  payoutSchema,
  roleProfileSchema
} from "@nutrivae/shared";
import { allowPermissions, allowRoles, authenticate } from "../../lib/auth.js";
import { audit } from "../../lib/audit.js";
import { asyncHandler } from "../../lib/errors.js";

export const organizationRouter = Router();
organizationRouter.use(authenticate);

organizationRouter.get(
  "/organization",
  asyncHandler(async (req, res) => {
    const [company, departments, jobTitles, roles] = await Promise.all([
      prisma.company.findUniqueOrThrow({ where: { id: req.user!.companyId } }),
      prisma.department.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } }),
      prisma.jobTitle.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } }),
      prisma.roleProfile.findMany({ where: { companyId: req.user!.companyId }, orderBy: { name: "asc" } })
    ]);
    res.json({ data: { company, departments, jobTitles, roles } });
  })
);

organizationRouter.post(
  "/companies",
  allowRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = companySchema.parse(req.body);
    const company = await prisma.company.create({
      data: {
        ...input,
        memberships: { create: { userId: req.user!.id, systemRole: "ADMIN" } },
        roles: {
          create: [
            { name: "Company admin", description: "Full company access", permissions: ["*"], isSystem: true },
            {
              name: "Employee",
              description: "Employee self-service",
              permissions: ["profile.self", "leave.self", "goals.self", "payouts.self"],
              isSystem: true
            }
          ]
        }
      }
    });
    await audit(req, "COMPANY_CREATED", "Company", company.id);
    res.status(201).json({ data: company });
  })
);

organizationRouter.patch(
  "/company",
  allowRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = companySchema.partial().parse(req.body);
    const company = await prisma.company.update({ where: { id: req.user!.companyId }, data: input });
    res.json({ data: company });
  })
);

organizationRouter.post(
  "/departments",
  allowPermissions("organization.manage"),
  asyncHandler(async (req, res) => {
    const input = departmentSchema.parse(req.body);
    const department = await prisma.department.create({ data: { ...input, companyId: req.user!.companyId } });
    res.status(201).json({ data: department });
  })
);

organizationRouter.post(
  "/job-titles",
  allowPermissions("organization.manage"),
  asyncHandler(async (req, res) => {
    const input = jobTitleSchema.parse(req.body);
    const jobTitle = await prisma.jobTitle.create({ data: { ...input, companyId: req.user!.companyId } });
    res.status(201).json({ data: jobTitle });
  })
);

organizationRouter.post(
  "/roles",
  allowRoles("ADMIN"),
  asyncHandler(async (req, res) => {
    const input = roleProfileSchema.parse(req.body);
    const role = await prisma.roleProfile.create({ data: { ...input, companyId: req.user!.companyId } });
    res.status(201).json({ data: role });
  })
);

organizationRouter.get(
  "/payouts",
  asyncHandler(async (req, res) => {
    const selfOnly = req.user!.role === "EMPLOYEE";
    const payouts = await prisma.payout.findMany({
      where: {
        companyId: req.user!.companyId,
        ...(selfOnly ? { employeeId: req.user!.employeeId ?? "" } : {})
      },
      include: { employee: { select: { firstName: true, lastName: true, workEmail: true } } },
      orderBy: { scheduledFor: "desc" }
    });
    res.json({ data: payouts });
  })
);

organizationRouter.post(
  "/payouts",
  allowPermissions("payouts.manage"),
  asyncHandler(async (req, res) => {
    const input = payoutSchema.parse(req.body);
    const payout = await prisma.payout.create({ data: { ...input, companyId: req.user!.companyId } });
    await audit(req, "PAYOUT_CREATED", "Payout", payout.id, { amount: input.amount });
    res.status(201).json({ data: payout });
  })
);

organizationRouter.patch(
  "/payouts/:id/status",
  allowPermissions("payouts.manage"),
  asyncHandler(async (req, res) => {
    const status = String(req.body.status) as "DRAFT" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
    const payout = await prisma.payout.update({
      where: { id: String(req.params.id), companyId: req.user!.companyId },
      data: { status, paidAt: status === "PAID" ? new Date() : undefined }
    });
    await audit(req, `PAYOUT_${status}`, "Payout", payout.id);
    res.json({ data: payout });
  })
);

organizationRouter.post(
  "/employees/:id/enable-login",
  allowPermissions("employees.manage"),
  asyncHandler(async (req, res) => {
    const employee = await prisma.employee.findFirstOrThrow({
      where: { id: String(req.params.id), companyId: req.user!.companyId }
    });
    const passwordHash = await bcrypt.hash(String(req.body.password || "Welcome123!"), 12);
    const user = await prisma.user.upsert({
      where: { email: employee.workEmail },
      update: { isActive: true },
      create: { email: employee.workEmail, passwordHash, role: "EMPLOYEE" }
    });
    await prisma.employee.update({ where: { id: employee.id }, data: { userId: user.id } });
    await prisma.companyMembership.upsert({
      where: { userId_companyId: { userId: user.id, companyId: req.user!.companyId } },
      update: { isActive: true, roleId: req.body.roleId || null },
      create: {
        userId: user.id,
        companyId: req.user!.companyId,
        systemRole: "EMPLOYEE",
        roleId: req.body.roleId || null
      }
    });
    res.json({ data: { email: user.email, temporaryPassword: String(req.body.password || "Welcome123!") } });
  })
);
