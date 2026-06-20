export const openApiDocument = {
  openapi: "3.0.3",
  info: { title: "Nutrivae HRMS API", version: "1.0.0", description: "Domain-oriented HR management API." },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "object", properties: { code: { type: "string" }, message: { type: "string" } } }
        }
      }
    }
  },
  paths: {
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in",
        responses: { "200": { description: "Authenticated" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        responses: { "200": { description: "Token refreshed" } }
      }
    },
    "/employees": {
      get: {
        tags: ["Employees"],
        security: [{ bearerAuth: [] }],
        summary: "List employees",
        responses: { "200": { description: "Employee page" } }
      },
      post: {
        tags: ["Employees"],
        security: [{ bearerAuth: [] }],
        summary: "Create employee",
        responses: { "201": { description: "Employee created" } }
      }
    },
    "/leave": {
      get: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "List leave requests",
        responses: { "200": { description: "Leave requests" } }
      },
      post: {
        tags: ["Leave"],
        security: [{ bearerAuth: [] }],
        summary: "Request leave",
        responses: { "201": { description: "Request created" } }
      }
    },
    "/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Get HR dashboard summary",
        responses: { "200": { description: "Dashboard metrics" } }
      }
    }
  }
};
