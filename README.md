# Ripple 🌊

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://ripple-ten-blue.vercel.app/)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue?style=for-the-badge&logo=docker)](#architecture)

Ripple is a modern, cloud-native social content platform (similar to Twitter/Instagram) built entirely on a **Microservices Architecture**. It is designed to be highly scalable, event-driven, and completely decoupled.

---

## 🌐 Live Demo & Deployment Status

You can view the live frontend interface here: **[Ripple Frontend on Vercel](https://ripple-ten-blue.vercel.app/)**

> **⚠️ Important Note on Backend Deployment:**
> Currently, **only the frontend UI is deployed live to the internet.** 
> Because this project utilizes a heavy, production-grade microservices architecture (requiring 15+ simultaneous Docker containers including Apache Kafka, Zookeeper, Redis, MinIO, and 4 separate PostgreSQL instances), deploying the full backend to a cloud provider incurs significant monthly infrastructure charges. 
> 
> Therefore, to interact with the API, fetch real data, or log in, you must run the backend services locally on your machine using Docker (see instructions below).

---

## 📸 Screenshots

<table align="center">
<tr>
<td align="center">
<img src="https://github.com/user-attachments/assets/b898ebe0-7b14-4c5f-9df0-211294237489" width="420"><br>
<b>Home Feed</b>
</td>

<td align="center">
<img src="https://github.com/user-attachments/assets/8afbc38e-0ab5-47ad-9e20-d0e7bb81937e" width="420"><br>
<b>Login</b>
</td>
</tr>

<tr>
<td align="center">
<img src="https://github.com/user-attachments/assets/6247674f-2788-4b05-b1ee-a692c26b7bed" width="420"><br>
<b>Search</b>
</td>

<td align="center">
<img src="https://github.com/user-attachments/assets/85d6999f-d910-4da2-af30-d8e15f165c57" width="420"><br>
<b>Profile</b>
</td>
</tr>

<tr>
<td align="center">
<img src="https://github.com/user-attachments/assets/9d89b8fc-5eb9-4153-a36a-52cad32dac6f" width="420"><br>
<b>Notifications</b>
</td>

<td align="center">
<img src="https://github.com/user-attachments/assets/7742b09b-c77d-4cd5-b9e9-b9166df7bebe" width="420"><br>
<b>Create Post</b>
</td>
</tr>
</table>
---

## 🏗️ Architecture

Ripple breaks down traditional monolithic social network features into isolated, highly-specialized services that communicate asynchronously via **Apache Kafka**.

### Microservices
*   **🌐 API Gateway (`:4000`)**: The single entry point for all client requests. Handles routing to the appropriate underlying microservice.
*   **🔐 Auth Service (`:3000`)**: Handles user registration, authentication, and JWT token generation. Owns the `auth_db`.
*   **👥 User Service (`:3001`)**: Manages user profiles, following/followers, and relationships. Owns the `user_db`.
*   **📝 Post Service (`:3002`)**: Handles creating, reading, and deleting posts. Emits events to Kafka when new content is created. Owns the `post_db`.
*   **📰 Feed Service (`:3003`)**: Aggregates posts to generate customized user timelines. Uses **Redis** for fast feed caching and retrieval.
*   **🔔 Notification Service (`:3004`)**: Manages real-time alerts. Consumes Kafka events (like new followers or posts) and pushes them to the client via WebSockets. Owns the `notification_db`.
*   **🖼️ Media Service (`:3005`)**: Handles image/video uploads and interacts with **MinIO** (S3-compatible object storage).

---

## 🛠️ Tech Stack

**Frontend**
*   React 18 + Vite
*   Tailwind CSS v4 (Custom UI System)
*   Lucide React Icons

**Backend & Infrastructure**
*   Node.js & Express.js
*   **Message Broker:** Apache Kafka + Zookeeper
*   **Databases:** PostgreSQL (x4 isolated DBs)
*   **Caching:** Redis
*   **Object Storage:** MinIO (Local S3 Alternative)
*   **Containerization:** Docker & Docker Compose
*   **Orchestration:** Kubernetes (Manifests in `/k8s`)

---

## 🚀 Running Locally

Because the live deployment does not include the backend, you can spin up the entire ecosystem on your local machine using Docker.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running)
*   Git

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ripple.git
   cd ripple
   ```

2. **Spin up the infrastructure and services:**
   Run the following command in the root directory. Docker will automatically pull the images for Kafka, Redis, Postgres, MinIO, and build all 7 of your Node.js microservices.
   ```bash
   docker-compose up -d
   ```
   *(Note: The initial build may take a few minutes as it compiles all services).*

3. **Verify it is running:**
   Ensure all containers are healthy:
   ```bash
   docker-compose ps
   ```

4. **Access the application:**
   *   **Frontend UI:** `http://localhost:3000`
   *   **API Gateway:** `http://localhost:4000/api`
   *   **MinIO Console (Storage):** `http://localhost:9001` (User: `minioadmin` / Pass: `minioadmin`)

### Shutting Down
To gracefully stop all services and preserve your database data:
```bash
docker-compose stop
```
To tear everything down (including volumes/data):
```bash
docker-compose down -v
```

---

## 📂 Project Structure

```text
ripple/
├── api-gateway/         # Routes traffic to microservices
├── auth-service/        # JWT & Login/Signup
├── feed-service/        # Redis Timeline Caching
├── media-service/       # MinIO image uploads
├── notification-service/# WebSockets
├── post-service/        # Content creation
├── user-service/        # Profiles & Following
├── frontend/            # React/Vite UI
├── k8s/                 # Kubernetes Deployment Manifests
├── docs/                # Project documentation
└── docker-compose.yml   # Infrastructure blueprint
```
