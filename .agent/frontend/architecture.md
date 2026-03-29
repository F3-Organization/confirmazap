# Senior Architecture: Feature-Driven Monorepo

ConfirmaZap uses a Feature-Driven architecture within a Monorepo structure to ensure high scalability and developer velocity.

## 1. Directory Structure (Monorepo)

```plaintext
/ (Project Root)
├── shared/               # COMMON: Zod Schemas & Shared Types
├── src/                  # BACKEND: Fastify API (FastifyAdapter)
│   ├── usecase/          # Pure business logic
│   └── infra/            # Controllers, Database, Adapters
└── web/                  # FRONTEND: React (Vite)
    ├── src/
    │   ├── app/          # Providers & Router
    │   ├── features/     # Isolated Domain Modules
    │   └── shared/       # Shared UI/API instances
    └── Dockerfile
```

## 2. Docker Service Map

The orchestration is handled via `compose.yaml` at the root, ensuring all services communicate seamlessly:

- **Service: `api`** (Fastify): Port 3000. Accesses `shared/` via `@shared`.
- **Service: `web`** (Vite): Port 5173. Accesses `shared/` via `@shared`.
- **Service: `evolution-api`**: Ports 8080. WhatsApp instance provider.
- **Service: `database`**: Postgres 16.
- **Service: `redis`**: Cache and BullMQ.

## 3. Core Rules

- **Feature Encapsulation**: A feature (e.g., `auth`) must not import directly from another feature (e.g., `calendar`). Shared logic must reside in `web/src/shared` or root `shared/`.
- **Type Safety**: All API contracts must be defined as Zod schemas in `shared/schemas` and used by both Backend and Frontend.
- **Logic Isolation**: Components should remain "dumb" or focus on UI state. Data fetching and mutations are handled exclusively by TanStack Query hooks.
