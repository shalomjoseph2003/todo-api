# Todo API — SIT753 DevOps Pipeline Project

A simple REST API built with Node.js and Express, designed for the SIT753/SIT223 Jenkins DevOps Pipeline task.

## Tech Stack
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Testing:** Jest + Supertest
- **Containerisation:** Docker
- **Code Quality:** SonarQube
- **Security:** Trivy
- **Monitoring:** Prometheus + Grafana
- **CI/CD:** Jenkins

## API Endpoints

| Method | Endpoint            | Description        |
|--------|---------------------|--------------------|
| GET    | /health             | Health check       |
| GET    | /api/todos          | Get all todos      |
| GET    | /api/todos/:id      | Get single todo    |
| POST   | /api/todos          | Create a todo      |
| PUT    | /api/todos/:id      | Update a todo      |
| DELETE | /api/todos/:id      | Delete a todo      |

## Running Locally

```bash
npm install
npm start
# App runs at http://localhost:3000
```

## Running Tests

```bash
npm test
```

## Docker

```bash
docker build -t todo-api .
docker run -p 3000:3000 todo-api
```

## Pipeline Stages
1. Build — Docker image creation
2. Test — Jest automated tests
3. Code Quality — SonarQube analysis
4. Security — Trivy vulnerability scan
5. Deploy — Staging deployment
6. Release — Production promotion
7. Monitoring — Prometheus + Grafana
