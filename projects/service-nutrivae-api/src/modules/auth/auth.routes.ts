import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "@nutrivae/database";
import { loginSchema, type AuthUser } from "@nutrivae/shared";
import { config } from "../../config.js";
import { authenticate, signAccessToken, signRefreshToken } from "../../lib/auth.js";
import { AppError, asyncHandler } from "../../lib/errors.js";

export const authRouter = Router();
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

type UserWithAccess = NonNullable<Awaited<ReturnType<typeof findUserAccess>>>;
function findUserAccess(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { isActive: true },
        include: { company: true, role: true },
        orderBy: { createdAt: "asc" }
      },
      employees: true
    }
  });
}

function toAuthUser(user: UserWithAccess, requestedCompanyId?: string): AuthUser {
  const membership =
    user.memberships.find((item) => item.companyId === requestedCompanyId) ?? user.memberships[0];
  if (!membership) throw new AppError(403, "This account has no active company membership.", "NO_COMPANY");
  const employee = user.employees.find((item) => item.companyId === membership.companyId);
  return {
    id: user.id,
    email: user.email,
    role: membership.systemRole,
    roleName: membership.role?.name ?? membership.systemRole.replace("_", " "),
    permissions: membership.role?.permissions ?? [],
    companyId: membership.companyId,
    companyName: membership.company.name,
    companyTheme: membership.company.theme,
    companies: user.memberships.map((item) => ({
      id: item.companyId,
      name: item.company.name,
      theme: item.company.theme
    })),
    employeeId: employee?.id,
    name: employee ? `${employee.firstName} ${employee.lastName}` : user.email
  };
}

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await findUserAccess(input.email.toLowerCase());
    if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
    }
    const authUser = toAuthUser(user);
    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken({ id: user.id });
    await prisma.refreshToken.create({
      data: {
        tokenHash: hash(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 86400000)
      }
    });
    res.json({ data: { user: authUser, accessToken, refreshToken } });
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = String(req.body.refreshToken ?? "");
    let payload: { id: string };
    try {
      payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { id: string };
    } catch {
      throw new AppError(401, "Refresh token is invalid.", "INVALID_REFRESH_TOKEN");
    }
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash(refreshToken) } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.id)
      throw new AppError(401, "Refresh token is no longer valid.", "INVALID_REFRESH_TOKEN");
    const user = await findUserAccess(
      (await prisma.user.findUniqueOrThrow({ where: { id: stored.userId } })).email
    );
    if (!user) throw new AppError(401, "User no longer exists.", "INVALID_REFRESH_TOKEN");
    const authUser = toAuthUser(user, String(req.body.companyId ?? ""));
    res.json({ data: { accessToken: signAccessToken(authUser), user: authUser } });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = String(req.body.refreshToken ?? "");
    if (token)
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hash(token) },
        data: { revokedAt: new Date() }
      });
    res.status(204).send();
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => res.json({ data: req.user }))
);

authRouter.post(
  "/switch-company",
  authenticate,
  asyncHandler(async (req, res) => {
    const userRecord = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    const user = await findUserAccess(userRecord.email);
    if (!user) throw new AppError(404, "User not found.", "NOT_FOUND");
    const authUser = toAuthUser(user, String(req.body.companyId));
    res.json({ data: { user: authUser, accessToken: signAccessToken(authUser) } });
  })
);
