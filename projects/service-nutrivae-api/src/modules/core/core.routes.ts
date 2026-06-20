import { Router } from "express";
import { prisma } from "@nutrivae/database";
import { goalSchema, jobOpeningSchema } from "@nutrivae/shared";
import { allowRoles, authenticate } from "../../lib/auth.js";
import { audit } from "../../lib/audit.js";
import { asyncHandler } from "../../lib/errors.js";

export const coreRouter = Router();
coreRouter.use(authenticate);
coreRouter.get(
  "/performance/goals",
  asyncHandler(async (req, res) =>
    res.json({
      data: await prisma.goal.findMany({
        where: { employee: { companyId: req.user!.companyId } },
        include: { employee: { include: { department: true } } },
        orderBy: { updatedAt: "desc" }
      })
    })
  )
);
coreRouter.post(
  "/performance/goals",
  allowRoles("ADMIN", "HR_MANAGER", "MANAGER"),
  asyncHandler(async (req, res) => {
    const input = goalSchema.parse(req.body);
    const goal = await prisma.goal.create({
      data: input,
      include: { employee: { include: { department: true } } }
    });
    await audit(req, "GOAL_CREATED", "Goal", goal.id, { employeeId: input.employeeId });
    res.status(201).json({ data: goal });
  })
);
coreRouter.get(
  "/recruitment/jobs",
  asyncHandler(async (req, res) =>
    res.json({
      data: await prisma.jobOpening.findMany({
        where: { companyId: req.user!.companyId },
        include: { department: true, candidates: true },
        orderBy: { createdAt: "desc" }
      })
    })
  )
);
coreRouter.post(
  "/recruitment/jobs",
  allowRoles("ADMIN", "HR_MANAGER"),
  asyncHandler(async (req, res) => {
    const input = jobOpeningSchema.parse(req.body);
    const job = await prisma.jobOpening.create({
      data: { ...input, companyId: req.user!.companyId },
      include: { department: true, candidates: true }
    });
    await audit(req, "JOB_OPENING_CREATED", "JobOpening", job.id, { title: input.title });
    res.status(201).json({ data: job });
  })
);
coreRouter.get(
  "/payroll",
  asyncHandler(async (req, res) =>
    res.json({
      data: await prisma.salaryRecord.findMany({
        where: { employee: { companyId: req.user!.companyId } },
        include: { employee: { include: { department: true, jobTitle: true } } },
        orderBy: { effectiveFrom: "desc" }
      })
    })
  )
);
