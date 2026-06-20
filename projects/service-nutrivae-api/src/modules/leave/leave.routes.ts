import { Router } from "express";
import { prisma } from "@nutrivae/database";
import { leaveRequestSchema } from "@nutrivae/shared";
import { allowRoles, authenticate } from "../../lib/auth.js";
import { audit } from "../../lib/audit.js";
import { AppError, asyncHandler } from "../../lib/errors.js";

export const leaveRouter = Router();
leaveRouter.use(authenticate);

leaveRouter.get(
  "/types",
  asyncHandler(async (req, res) =>
    res.json({ data: await prisma.leaveType.findMany({ where: { companyId: req.user!.companyId } }) })
  )
);
leaveRouter.get(
  "/holidays",
  asyncHandler(async (req, res) =>
    res.json({
      data: await prisma.holiday.findMany({
        where: { companyId: req.user!.companyId, date: { gte: new Date() } },
        orderBy: { date: "asc" }
      })
    })
  )
);

leaveRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const canViewAll = ["ADMIN", "HR_MANAGER", "MANAGER"].includes(req.user!.role);
    const requests = await prisma.leaveRequest.findMany({
      where: {
        employee: { companyId: req.user!.companyId },
        ...(!canViewAll ? { employeeId: req.user!.employeeId ?? "" } : {})
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, department: true }
        },
        leaveType: true,
        approver: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: requests });
  })
);

leaveRouter.get(
  "/balances/me",
  asyncHandler(async (req, res) => {
    if (!req.user!.employeeId)
      throw new AppError(400, "This account is not linked to an employee.", "NO_EMPLOYEE");
    const balances = await prisma.leaveBalance.findMany({
      where: { employeeId: req.user!.employeeId, year: new Date().getFullYear() },
      include: { leaveType: true }
    });
    res.json({ data: balances });
  })
);

leaveRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.user!.employeeId)
      throw new AppError(400, "This account is not linked to an employee.", "NO_EMPLOYEE");
    const input = leaveRequestSchema.parse(req.body);
    const days = Math.floor((input.endDate.getTime() - input.startDate.getTime()) / 86400000) + 1;
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: req.user!.employeeId,
          leaveTypeId: input.leaveTypeId,
          year: input.startDate.getFullYear()
        }
      }
    });
    if (!balance || Number(balance.allowance) - Number(balance.used) < days)
      throw new AppError(409, "There is not enough leave balance for this request.", "INSUFFICIENT_BALANCE");
    const employee = await prisma.employee.findUnique({ where: { id: req.user!.employeeId } });
    const request = await prisma.leaveRequest.create({
      data: { ...input, days, employeeId: req.user!.employeeId, approverId: employee?.managerId }
    });
    await audit(req, "LEAVE_REQUESTED", "LeaveRequest", request.id, { days });
    res.status(201).json({ data: request });
  })
);

leaveRouter.patch(
  "/:id/decision",
  allowRoles("ADMIN", "HR_MANAGER", "MANAGER"),
  asyncHandler(async (req, res) => {
    const status = req.body.status as "APPROVED" | "REJECTED";
    if (!["APPROVED", "REJECTED"].includes(status))
      throw new AppError(422, "Decision must be APPROVED or REJECTED.", "VALIDATION_ERROR");
    const existing = await prisma.leaveRequest.findFirst({
      where: { id: String(req.params.id), employee: { companyId: req.user!.companyId } }
    });
    if (!existing || existing.status !== "PENDING")
      throw new AppError(409, "This leave request can no longer be decided.", "INVALID_STATE");
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.leaveRequest.update({
        where: { id: existing.id },
        data: {
          status,
          decisionNote: req.body.note,
          approverId: req.user!.employeeId,
          decidedAt: new Date()
        },
        include: { employee: true, leaveType: true }
      });
      if (status === "APPROVED") {
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: existing.employeeId,
              leaveTypeId: existing.leaveTypeId,
              year: existing.startDate.getFullYear()
            }
          },
          data: { used: { increment: existing.days } }
        });
      }
      return result;
    });
    await audit(req, `LEAVE_${status}`, "LeaveRequest", updated.id);
    res.json({ data: updated });
  })
);
