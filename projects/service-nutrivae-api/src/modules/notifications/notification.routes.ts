import { Router } from "express";
import { prisma } from "@nutrivae/database";
import { authenticate } from "../../lib/auth.js";
import { asyncHandler } from "../../lib/errors.js";

export const notificationRouter = Router();
notificationRouter.use(authenticate);

notificationRouter.get(
  "/notifications",
  asyncHandler(async (req, res) => {
    const canApprove =
      ["ADMIN", "HR_MANAGER", "MANAGER"].includes(req.user!.role) ||
      req.user!.permissions.includes("leave.approve");
    const [pendingLeave, upcomingPayouts, upcomingHolidays] = await Promise.all([
      canApprove
        ? prisma.leaveRequest.findMany({
            where: { employee: { companyId: req.user!.companyId }, status: "PENDING" },
            include: { employee: true },
            take: 5,
            orderBy: { createdAt: "desc" }
          })
        : Promise.resolve([]),
      prisma.payout.findMany({
        where: {
          companyId: req.user!.companyId,
          employeeId: req.user!.employeeId ?? "",
          status: { in: ["DRAFT", "PROCESSING"] }
        },
        take: 3,
        orderBy: { scheduledFor: "asc" }
      }),
      prisma.holiday.findMany({
        where: { companyId: req.user!.companyId, date: { gte: new Date() } },
        take: 2,
        orderBy: { date: "asc" }
      })
    ]);
    const notifications = [
      ...pendingLeave.map((item) => ({
        id: `leave-${item.id}`,
        type: "leave",
        title: "Leave request needs review",
        message: `${item.employee.firstName} ${item.employee.lastName} requested ${Number(item.days)} day(s)`,
        createdAt: item.createdAt,
        href: "/leave"
      })),
      ...upcomingPayouts.map((item) => ({
        id: `payout-${item.id}`,
        type: "payout",
        title: "Upcoming payout",
        message: `${item.currency} ${Number(item.amount).toLocaleString()} is ${item.status.toLowerCase()}`,
        createdAt: item.createdAt,
        href: "/payouts"
      })),
      ...upcomingHolidays.map((item) => ({
        id: `holiday-${item.id}`,
        type: "holiday",
        title: item.name,
        message: `Company holiday on ${item.date.toLocaleDateString()}`,
        createdAt: item.createdAt,
        href: "/leave"
      }))
    ];
    res.json({ data: notifications });
  })
);
