# DevOps Task Manager

A production-grade, containerized full-stack task manager application designed for high availability, automated CI/CD validation, and seamless developer workflows.

## Architecture & Tech Stack

* **Frontend:** React (Vite), React Router, Axios, served via production-ready Nginx.
* **Backend:** Node.js, Express REST API, featuring secure password hashing and JWT authentication middleware.
* **Database:** PostgreSQL container with persistent volume mapping.
* **DevOps & Tooling:** Docker, multi-stage Dockerfiles, Docker Compose orchestration, GitHub Actions CI/CD pipeline.

## Project Structure

```text
devops-task-manager/
├── .github/workflows/
│   └── ci-cd.yml         # Automated build & test pipeline
├── backend/
│   ├── Dockerfile        # Node.js container configuration
│   └── server.js         # Express API & database integration
├── frontend/
│   ├── Dockerfile        # Multi-stage build (Node -> Nginx)
│   └── src/              # React components & routing
└── docker-compose.yml    # Multi-container orchestration setup

```

## Getting Started Locally

### Prerequisites

* Docker and Docker Compose installed and running.
* Git installed on your local machine.

### Installation & Deployment

1. **Clone the repository:**
```bash
git clone [https://github.com/Jimmy-dev1/devops-task-manager.git](https://github.com/Jimmy-dev1/devops-task-manager.git)
cd devops-task-manager

```


2. **Build and start all containers:**
```bash
docker compose up -d --build

```


3. **Verify running containers:**
```bash
docker ps

```


4. **Access the application:**
* **Frontend UI:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`



## CI/CD Pipeline

This repository uses **GitHub Actions** to automatically build and validate the frontend and backend Docker images on every push to the `main` branch, ensuring zero-regression deployments.

```

### 2. Push the Updated README
Save the file, then run these commands in your terminal:

```bash
git add README.md
git commit -m "Enhance project README with architecture details"
git push origin main

```

