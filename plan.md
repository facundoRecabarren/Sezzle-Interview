# Sezzle Calculator — Implementation Plan

> Source of truth: `requirements.txt` (project root) + answers to planning questions.
> Status: **LOCKED** — ready for implementation.
> Note: the spec file is `requirements.txt` (correct spelling).

---

## 1. Goals

Build a calculator application with two parts:

| App | Folder | Stack |
|---|---|---|
| Frontend | `sezzle-front-calculator/` | React + Vite + TypeScript |
| Backend | `sezzle-ms-calculator/` | Node.js + TypeScript + Express (latest) |

The frontend lets the user type a mathematical expression, validates it, sends it to the
backend, and shows the result. The backend validates and evaluates the expression and
returns `{ operation, result, error }`.

---

## 2. Locked decisions

### Repository
- **ONE** git repository containing **two folders** (`sezzle-front-calculator/`, `sezzle-ms-calculator/`).
- `Dockerfile` lives **inside each project** folder.
- `docker-compose.yml` lives at the **repo root**, outside both apps, and runs both images.

### Scope — strict v1
- **Only `+ - * /` are valid operators.**
- `^` (exponentiation), `√` (square root), `%` (percentage) are **rejected as invalid input**.
  This deliberately deviates from the doc's regex line (which lists them) because v2 is
  explicitly "not to implement now". Enabling them later is a small, isolated change.
- Pre-agreed v2 semantics (documented for the future drop-in, not implemented now):
  - Exponent operator is **`^` only** (never `**`).
  - Square root is **prefix unary**, parentheses allowed: `√(9+7)` = 4.
  - Percentage uses the **iOS-style rule (A)**:
    - for `+` and `-` the percentage applies to the **left operand**: `10+50%` = 15, `100-10%` = 90
    - for `*` and `/` the percentage applies to the **number itself**: `200*10%` = 20

### Frontend behaviour
- **Dark mode is the default**, persisted in `localStorage` (persists across reloads).
- History is stored in **`sessionStorage` only** (cleared when the tab closes).
- History stores **operations only — results are NOT stored**.
- Clicking a history entry **loads that operation into the input**.
- No authentication.

### Conventions
- **camelCase** variables (the doc's earlier "snakeCase" was corrected to camelCase).
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- Ports: backend `3000`, frontend `5173` in dev, frontend `8080` in Docker. CORS enabled on the backend.

### Test tooling
- Frontend: **Vitest + React Testing Library** (+ jsdom, mocked `fetch`).
- Backend: **Jest + Supertest**.

---

## 3. Expression rules (identical on frontend and backend)

### Allowed characters
Digits `0-9`, decimal point `.`, parentheses `(` `)`, operators `+ - * /`.

- **Whitespace is not valid** (rejected).
- **Decimals are allowed** (`3.14`).
- **Negative numbers are allowed** via unary minus (`-5+3`, `2*-3`).

### Whitelist regex (first gate)
```
/^[0-9.+\-*/()]+$/
```
Anything else (letters, `^`, `√`, `%`, spaces, `**`) fails the regex gate.

### Well-formedness rules (second gate)
| Input | Error message |
|---|---|
| `23+` | `operator without right number` |
| `(2+3(1*0)` | `parenthesis missing` |
| `2++3` | `bad written operation` |
| `3(4)` | `bad written operation` (no implicit multiplication) |
| `4/0` | `Error: division by zero` |
| any other malformed input | `Error: Input bad written` |

Additional decisions on operators:
- `2--3` is **valid** (unary minus after a binary operator) = 5.
- `2+-3` is **invalid** → `bad written operation` (only `-` may act as a unary sign).
- Standard operator precedence, left-to-right among equals.
- Empty parentheses `()` → `bad written operation`.
- Malformed numbers (`1..2`, `.`, `1.2.3`) → `bad written operation`.

### Error message catalogue (exact strings)
```
operator without right number
parenthesis missing
bad written operation
Error: division by zero
Error: Input bad written
```

---

## 4. Backend — `sezzle-ms-calculator/`

### Structure
```
sezzle-ms-calculator/
├── src/
│   ├── app.ts                 # Express app factory
│   ├── server.ts              # bootstrap, listens on :3000
│   ├── routes/
│   │   └── calculate.ts       # POST /v1/calculate
│   ├── controllers/
│   │   └── calculate.controller.ts
│   ├── services/
│   │   ├── tokenizer.ts       # number/operator/paren tokens
│   │   └── evaluator.ts       # recursive-descent evaluation (no eval/Function)
│   ├── validators/
│   │   └── expression.ts      # regex gate + well-formedness checks
│   ├── errors/
│   │   └── calculationError.ts
│   └── types/
│       └── calculation.ts     # {operation, result, error}
├── tests/
│   ├── expression.validator.test.ts
│   ├── evaluator.test.ts
│   └── calculate.routes.test.ts
├── Dockerfile
├── package.json
├── tsconfig.json
├── .eslintrc / eslint.config.js
└── README.md
```

### Endpoint
`POST /v1/calculate`

Request:
```json
{ "operation": "2+3*4" }
```

Response (success):
```json
{ "operation": "2+3*4", "result": 14, "error": null }
```

Response (invalid input) — HTTP **400**:
```json
{ "operation": "23+", "result": null, "error": "operator without right number" }
```

Response (unexpected failure) — HTTP **500**:
```json
{ "operation": "2+2", "result": null, "error": "Error: Input bad written" }
```

Rules:
- Body must be an object with a non-empty string `operation`; otherwise 400.
- The **regex gate** runs first, then the **well-formedness gate**, then **evaluation**.
- Division by zero → 400 with `Error: division by zero`.
- Evaluation uses a hand-written tokenizer + recursive-descent parser.
  **`eval`, `new Function` and dynamic `require` are forbidden** (security + correctness).
- CORS enabled (frontend origin).
- JSON body limit set (e.g. `10kb`).

### Backend tests
- Invalid payload: missing body, empty string, non-string `operation`.
- Regex gate: rejects `^`, `√`, `%`, letters, whitespace, `**`.
- Well-formedness: `23+` → `operator without right number`; `(2+3(1*0)` → `parenthesis missing`;
  `2++3` → `bad written operation`.
- Valid results: `2+2` = 4; `2+3*4` = 14 (standard precedence); `(2+3)*4` = 20;
  `7/2` = 3.5; `-5+3` = -2; `2*-3` = -6; `2--3` = 5; `10/2/5` = 1.
- `4/0` → error message `Error: division by zero`.
- Successful response has `error: null` and HTTP 200.

---

## 5. Frontend — `sezzle-front-calculator/`

### Structure
```
sezzle-front-calculator/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Button.tsx          # generic reusable button (variants)
│   │   ├── Display.tsx         # current expression + last result
│   │   ├── Keypad.tsx          # number/operator/utility buttons
│   │   ├── HistoryModal.tsx    # clock icon modal, sessionStorage history
│   │   ├── ErrorModal.tsx      # backend 4xx/5xx + network errors
│   │   └── ThemeToggle.tsx     # light/dark switch
│   ├── lib/
│   │   ├── validation.ts       # mirror of backend rules
│   │   ├── api.ts              # POST /v1/calculate
│   │   └── history.ts          # sessionStorage helpers
│   ├── hooks/
│   │   ├── useCalculator.ts    # expression state + actions
│   │   └── useTheme.ts         # dark default + localStorage
│   ├── theme/
│   │   └── theme.css           # CSS variables for both palettes
│   └── types/
│       └── calculation.ts
├── src/__tests__/              # Vitest + React Testing Library
│   ├── validation.test.ts
│   ├── calculator.send.test.tsx
│   ├── calculator.result.test.tsx
│   └── history.test.tsx
├── Dockerfile
├── nginx.conf                  # serves SPA + proxies /v1 to backend
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

### Generic button component
```tsx
<Button variant="number" | "operator" | "utility" | "danger" onClick={...} ariaLabel="...">
```
Single reusable component used for digits, operators, clear, run and history trigger.

### Colour palette (CSS variables)

**Light mode**
| Element | Colour |
|---|---|
| Main background | champagne cream `#FFF1D9` |
| Number buttons | pure ivory `#FDFCE8` |
| Number text | dark mocha coffee `#5A3A35` |
| Operation buttons | taupe `#3B2A22` |
| Operator symbols | pale gold `#A78E68` (subtle metallic finish) |

**Dark mode (default)**
| Element | Colour |
|---|---|
| Main background | deep espresso `#1C1310` |
| Number buttons | dark taupe `#2D1F1A` |
| Number text | pure ivory `#FDFCE8` |
| Operation buttons | pale gold `#A78E68` |
| Operator symbols | deep espresso `#1C1310` (subtle metallic finish) |

- High contrast throughout; the metallic finish on operator symbols is a subtle
  gradient/text-shadow treatment, keeping the base colour exact.
- Theme applied **before first paint** (inline bootstrap script in `index.html`) to avoid a flash.
- Toggle button switches themes and persists to `localStorage`; **dark is the default**
  when no stored preference exists.

### Input handling
- **Buttons**: digits `0-9`, `.`, operators `+ - * /`, parentheses `( )`, `⌫` backspace, `C` clear, `=` run.
- **Keyboard**: digits, `+ - * / ( ) .`, `Backspace`, `Escape`/`Delete` (clear), `Enter` (run).
- The input is a **single expression string**; the whole string is sent to the backend.
- Buttons append to the expression; `=` triggers the request.
- Local validation mirrors the backend rules (regex + well-formedness) **before** calling the API.

### Error handling
- **Invalid or empty input** → **red inline message** under the display, and **no request is sent**.
- **Backend 4xx / 5xx** → **error modal** showing the backend `error` string.
- **Network failure / unexpected response shape** → error modal with a generic message.

### History
- Stored in `sessionStorage` under a dedicated key (e.g. `calculator.history`).
- **Only the operation strings** are stored — never the results.
- Clock icon button opens a **modal** listing previous operations, newest first.
- Clicking an entry **puts that operation into the input** (ready to edit/re-run).
- A "clear history" control lives inside the modal.

### Frontend tests
- `validation.test.ts`: valid and invalid inputs (mirror of the backend table).
- `calculator.send.test.tsx`: clicking run with an **empty** or **invalid** expression →
  `fetch` **not** called; with a valid expression → `fetch` **called once** with the right body/URL.
- `calculator.result.test.tsx`: valid response → result rendered; 4xx/5xx → error modal rendered.
- `history.test.tsx`: history modal opens, lists stored operations, clicking one fills the input.

---

## 6. Delivery

### `sezzle-ms-calculator/Dockerfile` (multi-stage)
1. Stage 1 (`node:20-alpine`): install deps, `tsc` build → `dist/`.
2. Stage 2 (`node:20-alpine`): install **production** deps only, copy `dist/`, run `node dist/server.js`.
3. `EXPOSE 3000`; container listens on `PORT` (default 3000).

### `sezzle-front-calculator/Dockerfile` (multi-stage)
1. Stage 1 (`node:20-alpine`): install deps, `vite build` with `VITE_API_BASE_URL` build arg.
2. Stage 2 (`nginx:alpine`): copy `dist/` + `nginx.conf`; nginx serves the SPA and proxies
   `/v1/` → `http://backend:3000/` so the browser needs no cross-origin call.
3. `EXPOSE 80`.

### Root `docker-compose.yml`
```yaml
services:
  backend:
    build: ./sezzle-ms-calculator
    ports: ["3000:3000"]
    environment: [PORT=3000]
  frontend:
    build: ./sezzle-front-calculator
    ports: ["8080:80"]
    depends_on: [backend]
```

### READMEs
- `sezzle-ms-calculator/README.md`: prerequisites, install, dev, test, build, docker run,
  **API examples** (`curl` with request/response bodies, error cases), error message list.
- `sezzle-front-calculator/README.md`: prerequisites, install, dev, test, build, docker run,
  env vars (`VITE_API_BASE_URL`), feature overview, v2 roadmap note.
- Root `README.md`: repo layout, how to run both locally, how to run with Docker.

---

## 7. Implementation order

1. **Repo skeleton** — `git init` at root, create both folders, `.gitignore`, root `README.md`.
2. **Backend** — scaffold (TS, Express, Jest/Supertest, ESLint) → `validators/expression.ts`
   → `services/tokenizer.ts` + `services/evaluator.ts` → `routes/calculate.ts` + error
   middleware → tests → `README.md` + `Dockerfile`.
3. **Frontend** — scaffold (Vite, Vitest/RTL) → theme CSS variables + `useTheme` toggle
   → generic `Button` → `Display` → `Keypad` + input/keyboard handling → `lib/validation.ts`
   → `lib/api.ts` → `lib/history.ts` (sessionStorage) → `HistoryModal` + `ErrorModal`
   → tests → `README.md` + `Dockerfile` + `nginx.conf`.
4. **Infra** — root `docker-compose.yml`; verify both images build and the frontend can
   reach the backend through the nginx proxy.
5. **Polish** — accessibility/high-contrast pass, mobile (360px) pass, final test run,
   conventional commits on every step.

### Commit plan (conventional commits)
```
chore: scaffold monorepo with frontend and backend folders
feat(backend): add expression validation and tokenizer
feat(backend): add recursive-descent evaluator with standard precedence
feat(backend): add POST /v1/calculate endpoint and error handling
test(backend): cover invalid inputs and division by zero
feat(frontend): add theme system with dark mode default
feat(frontend): add generic button and keypad components
feat(frontend): add expression validation and API client
feat(frontend): add history modal backed by sessionStorage
feat(frontend): add error modal for backend failures
test(frontend): cover validation, send behaviour, results and errors
chore: add Dockerfiles and docker-compose
docs: add READMEs with setup instructions and API examples
```

---

## 8. Out of scope (v2, later)

- Exponentiation (`^`), square root (`√`), percentage (`%`) — validator must be extended and
  the evaluator extended per the pre-agreed semantics in section 2.
- v2 buttons in the UI, extra keypad rows.
- Result persistence in history (v1 stores operations only).
- Authentication (explicitly not needed).
