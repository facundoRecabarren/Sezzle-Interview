# sezzle-ms-calculator

Calculator backend microservice built with Node.js, TypeScript, and Express.

## Features

- RESTful API exposed at `POST /v1/calculate`.
- Evaluates arithmetic expressions with standard mathematical operator precedence (`*`, `/` before `+`, `-`).
- **v1 Operations**: Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`).
- **v2 Operations**:
  - Exponentiation (`^`): Right-associative exponentiation (`2^3 = 8`, `2^3^2 = 512`).
  - Square Root (`√`): Prefix unary with or without parentheses (`√9+7 = 10`, `√(9+7) = 4`).
  - Percentage (`%`): Context-aware calculation (`10+50% = 15`, `200*10% = 20`).
- Hand-written safe recursive-descent parser and tokenizer (no `eval` or dynamic code evaluation).
- Robust validation:
  - Whitelist character gate (digits, `.` for decimals, `+`, `-`, `*`, `/`, `(`, `)`, `^`, `√`, `%`).
  - Parentheses balance checking.
  - Well-formedness checks (e.g. `23+`, `2++3`, `3(4)`, `1.2.3`, `3√9`, `%5`).
  - Division by zero detection.
- Unit and integration tests with Jest and Supertest.

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x

## Setup & Installation

```bash
cd sezzle-ms-calculator
npm install
```

## Running the Application

### Development mode:
```bash
npm run dev
```

### Production build & start:
```bash
npm run build
npm start
```

Default listening port: `3000` (configurable via `PORT` environment variable).

## Running Tests

```bash
npm test
```

## API Documentation

### Calculate Expression

- **URL:** `/v1/calculate`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "operation": "2+3*4"
}
```

#### Successful Response (200 OK)
```json
{
  "operation": "2+3*4",
  "result": 14,
  "error": null
}
```

#### cURL Examples

**Basic arithmetic (v1):**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"(2+3)*4"}'
```

**Exponentiation (v2):**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"2^3"}'
```

**Square Root (v2):**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"√(9+7)"}'
```

**Percentage (v2):**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"10+50%"}'
```

**Division by zero:**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"4/0"}'
```

## Docker

Build Docker image:
```bash
docker build -t sezzle-ms-calculator .
```

Run Docker container:
```bash
docker run -p 3000:3000 sezzle-ms-calculator
```
