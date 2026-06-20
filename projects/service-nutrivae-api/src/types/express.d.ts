import type { AuthUser } from "@nutrivae/shared";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
export {};
