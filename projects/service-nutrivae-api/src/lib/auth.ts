import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser, Role } from "@nutrivae/shared";
import { config } from "../config.js";
import { AppError } from "./errors.js";

export const signAccessToken = (user: AuthUser) =>
  jwt.sign(user, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"]
  });

export const signRefreshToken = (payload: { id: string }) =>
  jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: `${config.REFRESH_TOKEN_TTL_DAYS}d` });

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return next(new AppError(401, "Authentication required.", "UNAUTHENTICATED"));
  try {
    req.user = jwt.verify(token, config.JWT_ACCESS_SECRET) as AuthUser;
    next();
  } catch {
    next(new AppError(401, "Your session has expired.", "TOKEN_EXPIRED"));
  }
}

export const allowRoles =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new AppError(403, "You do not have permission to perform this action.", "FORBIDDEN"));
    next();
  };

export const allowPermissions =
  (...permissions: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (
      !req.user ||
      (!permissions.some((permission) => req.user!.permissions.includes(permission)) &&
        req.user.role !== "ADMIN")
    ) {
      return next(new AppError(403, "You do not have permission to perform this action.", "FORBIDDEN"));
    }
    next();
  };
