import { Router } from "express";
import { prisma } from "@nutrivae/database";
import { authenticate } from "../../lib/auth.js";
import { asyncHandler } from "../../lib/errors.js";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [
      totalEmployees,
      activeEmployees,
      onLeave,
      openRoles,
      pendingLeave,
      departments,
      recentLeave,
      goals,
      pipeline
    ] = await Promise.all([
      prisma.employee.count({ where: { companyId: _req.user!.companyId } }),
      prisma.employee.count({ where: { companyId: _req.user!.companyId, status: "ACTIVE" } }),
      prisma.leaveRequest.count({
        where: {
          employee: { companyId: _req.user!.companyId },
          status: "APPROVED",
          startDate: { lte: now },
          endDate: { gte: now }
        }
      }),
      prisma.jobOpening.count({ where: { companyId: _req.user!.companyId, status: "OPEN" } }),
      prisma.leaveRequest.count({
        where: { employee: { companyId: _req.user!.companyId }, status: "PENDING" }
      }),
      prisma.department.findMany({
        where: { companyId: _req.user!.companyId },
        include: { _count: { select: { employees: true } } },
        orderBy: { employees: { _count: "desc" } }
      }),
      prisma.leaveRequest.findMany({
        where: { employee: { companyId: _req.user!.companyId } },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { employee: true, leaveType: true }
      }),
      prisma.goal.findMany({
        where: { employee: { companyId: _req.user!.companyId } },
        take: 4,
        orderBy: { updatedAt: "desc" },
        include: { employee: true }
      }),
      prisma.candidate.groupBy({
        by: ["status"],
        where: { jobOpening: { companyId: _req.user!.companyId } },
        _count: true
      })
    ]);
    const joinedThisMonth = await prisma.employee.count({
      where: { companyId: _req.user!.companyId, startDate: { gte: monthStart } }
    });
    res.json({
      data: {
        stats: { totalEmployees, activeEmployees, onLeave, openRoles, pendingLeave, joinedThisMonth },
        departments,
        recentLeave,
        goals,
        pipeline
      }
    });
  })
);
