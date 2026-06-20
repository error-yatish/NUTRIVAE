import { Router } from "express";
import { prisma } from "@nutrivae/database";
import { projectAssignmentSchema, projectSchema } from "@nutrivae/shared";
import { allowPermissions, authenticate } from "../../lib/auth.js";
import { audit } from "../../lib/audit.js";
import { asyncHandler } from "../../lib/errors.js";

export const projectRouter = Router();
projectRouter.use(authenticate);

projectRouter.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const selfOnly = req.user!.role === "EMPLOYEE";
    const projects = await prisma.project.findMany({
      where: {
        companyId: req.user!.companyId,
        ...(selfOnly ? { assignments: { some: { employeeId: req.user!.employeeId ?? "" } } } : {})
      },
      include: {
        assignments: {
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true, workEmail: true, jobTitle: true }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    res.json({ data: projects });
  })
);

projectRouter.post(
  "/projects",
  allowPermissions("projects.manage"),
  asyncHandler(async (req, res) => {
    const input = projectSchema.parse(req.body);
    const project = await prisma.project.create({ data: { ...input, companyId: req.user!.companyId } });
    await audit(req, "PROJECT_CREATED", "Project", project.id, { code: project.code });
    res.status(201).json({ data: project });
  })
);

projectRouter.post(
  "/projects/:id/assignments",
  allowPermissions("projects.manage"),
  asyncHandler(async (req, res) => {
    const input = projectAssignmentSchema.parse(req.body);
    const project = await prisma.project.findFirstOrThrow({
      where: { id: String(req.params.id), companyId: req.user!.companyId }
    });
    const assignment = await prisma.projectAssignment.upsert({
      where: { projectId_employeeId: { projectId: project.id, employeeId: input.employeeId } },
      update: input,
      create: { ...input, projectId: project.id },
      include: { employee: true }
    });
    await audit(req, "PROJECT_EMPLOYEE_ASSIGNED", "Project", project.id, { employeeId: input.employeeId });
    res.status(201).json({ data: assignment });
  })
);

projectRouter.delete(
  "/projects/:projectId/assignments/:employeeId",
  allowPermissions("projects.manage"),
  asyncHandler(async (req, res) => {
    await prisma.projectAssignment.delete({
      where: {
        projectId_employeeId: {
          projectId: String(req.params.projectId),
          employeeId: String(req.params.employeeId)
        }
      }
    });
    res.status(204).send();
  })
);
