# sezzle-front-calculator

Frontend application for the Sezzle Calculator take-home challenge, built with **React**, **Vite**, and **TypeScript**.

---

## Features

- **Responsive & Mobile Friendly**: Fully functional across desktop and mobile devices (tested down to 360px viewport).
- **Theme Support**:
  - **Dark Mode (Default)**: Deep espresso `#1C1310`, dark taupe buttons `#2D1F1A`, ivory text `#FDFCE8`, pale gold operation buttons `#A78E68`.
  - **Light Mode**: Champagne cream `#FFF1D9`, ivory number buttons `#FDFCE8`, dark mocha text `#5A3A35`, taupe operation buttons `#3B2A22`, pale gold operator symbols `#A78E68`.
  - Subtle metallic finish on operators.
  - Persisted in `localStorage` across sessions.
- **Calculator Operations (v1)**: Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`).
- **Input & Keyboard Support**:
  - Live input with regex validation for allowed characters and structural syntax checks.
  - Keyboard friendly: write numbers, operators, press `Enter` to calculate, `Backspace`, `Escape` to clear.
- **History Modal**:
  - Clock icon button opens the operation history modal.
  - Operations stored in `sessionStorage` (current browser session only).
  - Stores operation expressions only (no results stored, per requirements).
  - Clicking any previous operation automatically loads it back into the input.
- **Error Handling**:
  - Real-time inline red error message for invalid or empty input (disallows sending invalid requests to the backend).
  - Error modal dialog for backend 4xx and 5xx responses (e.g., division by zero, malformed input).

---

## Prerequisites

- **Node.js**: >= 20.x
- **npm**: >= 10.x

---

## Getting Started

### 1. Install Dependencies

```bash
cd sezzle-front-calculator
npm install
```

### 2. Environment Configuration (Optional)

By default, Vite points to the backend using the relative `/v1` path (which works out of the box when served behind Nginx or with a reverse proxy) or you can specify an explicit backend URL in a `.env` file:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## How to Test the Project

### Running Automated Tests

This project uses **Vitest** and **React Testing Library** for unit and integration testing.

Run all tests once:

```bash
npm test
```

Run tests in watch mode (interactive during development):

```bash
npx vitest
```

### Test Coverage

The test suite covers:
1. **Input & Validation (`src/__tests__/validation.test.ts`)**:
   - Valid arithmetic expressions, decimals, negatives, and parentheses.
   - Operator without right number (e.g., `23+`).
   - Missing/unbalanced parentheses (e.g., `(2+3(1*0)`).
   - Badly written operations (e.g., `2++3`, `3(4)`, `1.2.3`).
   - Disallowed characters, whitespace, and empty input.
2. **Send Button Behavior (`src/__tests__/calculator.send.test.tsx`)**:
   - Empty input prevents backend call and displays inline red error.
   - Invalid input (e.g., `23+`) prevents backend call.
   - Valid input triggers a `POST /v1/calculate` call with the exact payload.
3. **Results & Backend Error Handling (`src/__tests__/calculator.result.test.tsx`)**:
   - Displays result when backend responds with 200 OK.
   - Opens error modal when backend responds with 4xx/5xx (e.g., division by zero).
4. **History Storage (`src/__tests__/history.test.tsx`)**:
   - Stores sent operations into `sessionStorage`.
   - Opens modal on clock icon click, displays past operations.
   - Clicking a past operation restores it into the input.

---

## Production Build

To build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Docker

Build Docker image:

```bash
docker build -t sezzle-front-calculator .
```

Run Docker container:

```bash
docker run -p 8080:80 sezzle-front-calculator
```

Access the application in your browser at `http://localhost:8080`.
