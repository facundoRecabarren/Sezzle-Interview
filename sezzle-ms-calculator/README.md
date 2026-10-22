# sezzle-ms-calculator

Calculator backend microservice built with Node.js, TypeScript, and Express.

## Features

- RESTful API exposed at `POST /v1/calculate`.
- Evaluates arithmetic expressions with standard mathematical operator precedence (`*`, `/` before `+`, `-`).
- Hand-written safe parser and tokenizer (no `eval` or dynamic code evaluation).
- Robust validation:
  - Whitelist character gate (digits, `.` for decimals, `+`, `-`, `*`, `/`, `(`, `)`).
  - Parentheses balance checking.
  - Well-formedness checks (e.g. `23+`, `2++3`, `3(4)`, `1.2.3`).
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

#### Error Response — Invalid Input (400 Bad Request)
```json
{
  "operation": "23+",
  "result": null,
  "error": "operator without right number"
}
```

#### Error Response — Division by Zero (400 Bad Request)
```json
{
  "operation": "10/0",
  "result": null,
  "error": "Error: division by zero"
}
```

#### Error Response — Missing Parenthesis (400 Bad Request)
```json
{
  "operation": "(2+3(1*0)",
  "result": null,
  "error": "parenthesis missing"
}
```

#### Error Response — Bad Written Operation (400 Bad Request)
```json
{
  "operation": "(2++3(1*0)",
  "result": null,
  "error": "bad written operation"
}
```

#### cURL Examples

**Valid arithmetic:**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"(2+3)*4"}'
```

**Negative numbers & decimals:**
```bash
curl -X POST http://localhost:3000/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"-5.5+2.5*2"}'
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
