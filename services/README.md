# Domain service boundaries

The first production shape is a modular monolith hosted by `projects/service-nutrivae-api`. Each module owns its routes, application logic, validation, and persistence access. This avoids premature network calls while keeping extraction seams explicit.

| Service boundary     | Current module           | Owns                                       |
| -------------------- | ------------------------ | ------------------------------------------ |
| auth-service         | `modules/auth`           | identities, access/refresh tokens, roles   |
| employee-service     | `modules/employees`      | employee records, org structure, documents |
| leave-service        | `modules/leave`          | balances, requests, approvals, holidays    |
| performance-service  | `modules/core`           | goals, reviews, feedback                   |
| recruitment-service  | `modules/core`           | openings, candidates, pipeline             |
| notification-service | event consumer (planned) | email/in-app delivery and preferences      |

When independent scaling is justified, move a module into this directory as a deployable package, give it ownership of its tables, and replace direct calls with versioned HTTP/events. The gateway route contract can remain stable.
