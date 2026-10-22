# Sezzle Calculator Monorepo

Monorepo containing the calculator frontend and backend microservice.

## Projects

- `sezzle-front-calculator`: React + Vite + TypeScript frontend.
- `sezzle-ms-calculator`: Node.js + TypeScript + Express backend microservice.

## Docker Setup

Run both services with Docker Compose:

```bash
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend: http://localhost:3000

Each project has its own Readme with instructions to run and test them.

## OpenCode conversation-decisions
Before starting the development I made a requirements.txt file where I defined all the requirements and needs for the app, including tech stach, color pallete, design decisions, repo structure, constraints and what goes in each version.
Then I used OpenCode to create and implement a plan based in the requirements file.
Used Gemini 3.8 Flash in low mode

### Conversation
1. Read the requierements.txt and build a plan to implement it. Ask all the necesary question you need
2. I have just added some clarifications to the doc, it will anser some of your questions
3. write the plan in a plan.md file
3.1 I answer questions about CORS (added nginx), test suite and repo organization
4. Start the implementation of the plan
5. Update readme of the frontend with instruccion about running and testing 
6. now implement v2