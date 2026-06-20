import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(16).default("development-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("development-refresh-secret"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7)
});

export const config = schema.parse(process.env);
