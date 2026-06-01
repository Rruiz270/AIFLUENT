# Test Infrastructure Report - Phase 6

## Current Status

- **Test framework installed**: No (neither Vitest nor Jest found in node_modules)
- **Existing tests**: None
- **Test configuration**: None

## Recommended Framework

**Vitest + React Testing Library + MSW**

- Vitest: Fast, native ESM support, compatible with Next.js and TypeScript
- @testing-library/react: Component testing with user-centric queries
- MSW (Mock Service Worker): API mocking for integration tests

## Critical Paths to Test

### 1. Authentication Flow
| Scenario | Priority |
|----------|----------|
| Login form validation (empty fields, invalid email) | High |
| Successful login redirect to dashboard | High |
| Session expiration handling | Medium |
| Unauthorized access redirect to login | High |

### 2. Lead Management (CRUD)
| Scenario | Priority |
|----------|----------|
| Create new lead with required fields | High |
| Edit lead details | High |
| Delete lead with confirmation | Medium |
| Lead list filtering and search | High |
| Lead import via CSV | Medium |
| Lead detail modal displays correct data | Medium |

### 3. Chat / Inbox
| Scenario | Priority |
|----------|----------|
| Send text message | High |
| Receive and display inbound message | High |
| File upload creates document message | Medium |
| Image upload creates image message | Medium |
| Audio recording toggle and send | Medium |
| Emoji panel select inserts emoji | Low |
| AI-generated message has correct styling | Medium |
| Conversation list filtering by channel | Medium |

### 4. WhatsApp Integration
| Scenario | Priority |
|----------|----------|
| Conversation list renders correctly | High |
| Message send and receive | High |
| Quick reply selection populates input | Medium |
| Bulk send modal opens and submits | Medium |
| Contact info panel toggle | Low |

### 5. Pipeline / Kanban
| Scenario | Priority |
|----------|----------|
| Stages render with correct leads | High |
| Drag-and-drop moves lead between stages | High |
| Add new stage | Medium |
| Rename / delete stage | Medium |
| Stage color update | Low |

### 6. Campaigns
| Scenario | Priority |
|----------|----------|
| Campaign list displays campaigns | High |
| Create new campaign | High |
| Campaign metrics display | Medium |
| Template selector works | Medium |

### 7. Dashboard
| Scenario | Priority |
|----------|----------|
| Stats grid displays correct metrics | High |
| Revenue chart renders | Medium |
| Recent leads list | Medium |
| Active campaigns widget | Medium |

### 8. API Routes
| Scenario | Priority |
|----------|----------|
| GET /api/leads returns leads | High |
| POST /api/leads creates lead | High |
| GET /api/campaigns returns campaigns | High |
| GET /api/pipeline returns stages | High |
| POST /api/ai returns AI response | Medium |

## Coverage Targets

| Category | Target |
|----------|--------|
| Unit tests (utils, hooks) | 90% |
| Component tests (UI) | 70% |
| Integration tests (API routes) | 80% |
| E2E tests (critical flows) | 50% |
| **Overall** | **70%** |

## Setup Instructions (Future)

```bash
# Install dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw

# Add to package.json scripts
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```
