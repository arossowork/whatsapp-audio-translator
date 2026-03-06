# Architecture & Rules

## Overview

This project follows **Clean Architecture** (Ports & Adapters / Hexagonal Architecture).
All business logic lives in `core/`. Adapters are isolated infrastructure implementations.

```
┌─────────────────────────────────────────────────────────────┐
│                        ADAPTERS (src/adapters/)             │
│                                                             │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   api-in/    │  │   queue/    │  │      llm/        │   │
│  │ (HTTP in)    │  │ (job queue) │  │  (mock/real LLM) │   │
│  └──────┬───────┘  └──────┬──────┘  └────────┬─────────┘   │
│         │                 │                   │             │
│         └─────────────────▼───────────────────┘             │
│                           │  depends on                     │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      CORE (src/core/)                       │
│                                                             │
│  Ports (interfaces)   +   Use Cases   +   Domain Entities   │
└─────────────────────────────────────────────────────────────┘
```

### Bidirectional Flow

```
POST /messages
      │
      ▼
[API-in Adapter]
      │ SendToQueueUseCase
      ▼
[Queue Adapter]  ◄── poller ──► ProcessFromQueueUseCase
                                        │ LlmPort
                                        ▼
                                  [LLM Adapter]
                                        │ SendLlmResponseUseCase
                                        ▼
                               [Reply-Queue Adapter]  ◄── poller ──► DeliverResponseUseCase
                                                                              │ ApiReplyPort
                                                                              ▼
                                                                       [API-in Adapter]
```

---

## Directory Structure

```
src/
├── core/                        # ✅ Zero framework/infra imports
│   ├── domain/                  # Entities, value objects
│   ├── ports/                   # Interfaces (abstract contracts)
│   └── use-cases/               # Application logic
│
└── adapters/
    ├── api-in/                  # HTTP controller + ApiReplyPort impl
    ├── queue/                   # Job queue + poller
    ├── reply-queue/             # Reply queue + poller
    └── llm/                     # LLM mock/real implementation
```

---

## Strict Rules

### Rule 1 — Core has no infrastructure dependencies

> **NEVER** import from `@nestjs/*` (except `@nestjs/common` decorators on use-case classes if needed), `express`, or any adapter module inside `src/core/`.

✅ Allowed in `core/`:
- Domain entities and value objects
- Port interfaces (TypeScript `interface` or `abstract class`)
- Use-case classes (pure TypeScript, injected via constructor)

❌ Forbidden in `core/`:
- `import { Controller, Body } from '@nestjs/common'`
- `import { QueueAdapter } from '../adapters/queue/...'`
- Any database ORM, HTTP library, or cloud SDK

---

### Rule 2 — Adapters NEVER import each other

> Adapters may only import from `src/core/`. Cross-adapter imports are **strictly forbidden**.

❌ Forbidden:
```ts
// Inside api-in.adapter.ts
import { QueueAdapter } from '../queue/queue.adapter'; // ❌
```

✅ Correct pattern — communicate through core use cases:
```ts
// api-in.controller.ts
constructor(private readonly sendToQueue: SendToQueueUseCase) {}
```

---

### Rule 3 — Ports are owned by Core

> Interfaces that adapters must implement (e.g. `QueuePort`, `LlmPort`) are defined in `src/core/ports/`. Adapters implement them; core defines them.

```ts
// core/ports/queue.port.ts
export interface QueuePort {
  enqueue(message: Message): void;
  dequeue(): Message | null;
}

// adapters/queue/queue.adapter.ts
export class QueueAdapter implements QueuePort { ... }
```

---

### Rule 4 — Dependency injection via tokens

> Adapters are bound to port tokens defined in `core/`. Use NestJS injection tokens, never hard-coded class references from adapters.

```ts
// core/ports/tokens.ts
export const QUEUE_PORT = Symbol('QUEUE_PORT');
export const REPLY_QUEUE_PORT = Symbol('REPLY_QUEUE_PORT');
export const LLM_PORT = Symbol('LLM_PORT');
export const API_REPLY_PORT = Symbol('API_REPLY_PORT');
```

Use-cases declare ports via `@Inject(QUEUE_PORT)` — never `@Inject(QueueAdapter)`.

---

### Rule 5 — Use cases are the only entry points into core

> Adapters call use cases; they do not call other adapters' services, repositories, or helpers directly.

---

### Rule 6 — Polling is an adapter responsibility

> Scheduled polling (reading from a queue and triggering a use case) lives in the **adapter layer**, not in core. Core use cases are passive — they are invoked, not self-scheduling.

---

### Rule 7 — No shared mutable state between adapters

> In-memory stores (queues, reply buffers) are encapsulated within their adapter. If two adapters need to share data, it must flow through a core use case and a port.

---

### Rule 8 — Test-Driven Development is mandatory

> **No production code is written before a failing test exists.** All use cases, domain entities, and port implementations must be developed following the Red → Green → Refactor cycle.

---

## Adding a New Adapter

1. Create `src/adapters/<name>/<name>.module.ts`
2. Implement the relevant `Port` interface from `src/core/ports/`
3. Bind with the correct token from `src/core/ports/tokens.ts`
4. Import `CoreModule` — **nothing else from other adapters**
5. Add the new module to `AppModule`

## Swapping an Adapter

Replace the provider binding in `<name>.module.ts`. No changes to `core/` or other adapters required.

---

## Test-Driven Development (TDD)

### The Cycle

Every piece of production code **must** follow this order:

```
 1. 🔴 RED    — Write a failing test that describes the desired behaviour
 2. 🟢 GREEN  — Write the minimum code to make the test pass
 3. 🔵 REFACTOR — Clean up, keeping all tests green
```

Skipping to GREEN without a prior failing RED is a rule violation.

---

### Test Layers

| Layer | Tool | Strategy | Must NOT |
|---|---|---|---|
| **Domain entities** | Jest | Pure unit — no mocks needed | Import any adapter |
| **Core use cases** | Jest | Unit — stub all ports with simple in-memory fakes | Instantiate any adapter class |
| **Adapter (unit)** | Jest | Unit — mock the use case / port it depends on | Call other adapters |
| **Adapter (integration)** | Jest + Supertest | Test the adapter against its real infra (HTTP, in-memory queue) | Touch other adapter modules |
| **E2E** | Jest + Supertest | Full HTTP flow through all layers | Be the primary safety net |

---

### Port Stubs for Use-Case Tests

Define simple in-memory stubs — never import adapters in test files under `core/`:

```ts
// In a test file for a core use case
const fakeQueue: QueuePort = {
  enqueue: jest.fn(),
  dequeue: jest.fn().mockReturnValue(null),
};

const useCase = new SendToQueueUseCase(fakeQueue);
```

---

### File Naming Convention

```
src/core/use-cases/send-to-queue.use-case.ts
src/core/use-cases/send-to-queue.use-case.spec.ts   ← co-located test

src/adapters/queue/queue.adapter.ts
src/adapters/queue/queue.adapter.spec.ts
```

Tests are **co-located** with the file they cover, not in a separate `test/` folder (E2E tests in `test/` are the exception).

---

### TDD Checklist Before Merging

- [ ] Every new use case has a `.spec.ts` written **before** its implementation
- [ ] Every new port implementation has an adapter-level spec
- [ ] No production code exists without at least one covering test
- [ ] `npm run test` passes with **no skipped tests** (`xit`, `xdescribe`, `.skip`)
- [ ] Coverage for `src/core/` is **≥ 90%** (enforced in `jest.config.ts`)

### Rule 9 — Package by Feature / Module (Modular Monolith)

> To prepare for microservices, the application must be divided into business modules (**Bounded Contexts**). Each module contains its own isolated `core/` and `adapters/` layers. 

For example:
```
src/modules/
├── messaging/               # Context 1: Handle WhatsApp/API I/O
│   ├── core/
│   └── adapters/
├── audio-processing/        # Context 2: Processing audio, LLM integration
│   ├── core/
│   └── adapters/
```

---

### Rule 10 — Modules are Strictly Isolated

> A module may **never** import code from another module (except for `_shared` kernel logic, which must contain no business rules, such as generic domain base classes). 

Modules must communicate purely asynchronously via integration events (Event Bus/PubSub), or strictly through defined Facades/Application Services. Direct method calls across modules are an anti-pattern when moving to microservices.

---

### Rule 11 — Decentralized Data

> Each module owns its own database tables or collections. Cross-module database joins are **strictly forbidden**. Inter-module data needs must be resolved via asynchronous replication/events or API calls (simulating real microservices).

---

### Running Tests

```bash
# Unit + integration
npm run test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:cov

# E2E
npm run test:e2e
```
