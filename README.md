# Sourabh Rustagi — Chief Systems Engineer & Cloud-Native Architect
### High-Concurrency Distributed Systems | Real-Time Actor Meshes | GitOps & Kubernetes at Scale

[![Node.js CI](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Production SLA](https://img.shields.io/badge/SLA-99.99%25-brightgreen.svg)](#)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](#)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS%2FAKS-326CE5.svg)](#)

A world-class, interactive portfolio and observability platform representing **Sourabh Rustagi's** 12+ years of distributed systems engineering and cloud-native architecture leadership (Chief Engineer at **Samsung R&D Institute**, formerly Lead at **TransUnion**).

---

## 🌟 Key Platform Features

### 1. Dual-Persona Navigation
- **Executive Brief (Recruiter / Leadership Mode)**:
  - Clean, high-impact Bento Grid layout featuring verified production metrics (1M+ concurrent users, 99.99% uptime SLA, 80% faster provisioning, 12+ years experience).
  - Flagship Architectural Case Studies (Samsung Classroom, Orleans Virtual Actor Mesh, TransUnion GitOps migration, Serverless FHIR).
  - Chronological Career Trajectory and Technical Competencies Matrix.
  - **1-Click Print & Clean PDF Resume Export** via high-contrast `@media print` engine.

### 2. Interactive Cluster Control Plane & Distributed Topology
- **HTML5 Canvas Digital Twin**:
  - Live animated visual topology representing the end-to-end architecture: Ingress Gateway &rarr; LiveKit SFU & Orleans Actor Silos &rarr; Kafka Event Bus &rarr; FoundationDB & Vault &rarr; ArgoCD GitOps.
  - Continuous animated particle packet streams showing dynamic throughput and latency.
- **Chaos Engineering Simulator**:
  - **Baseline Traffic**: Nominal 15,000 req/s stream.
  - **Flash Load Spike**: Simulates 1,000,000 req/s burst; triggers Horizontal Pod Autoscaling (HPA) from 36 to 72 pods with real-time UI reaction.
  - **Kill Orleans Pod (Self-Healing)**: Simulates a pod failure; demonstrates instant traffic rerouting and Kubernetes replica set self-healing with zero dropped packets.
- **Architectural Blueprint Inspector**:
  - Click any node in the topology to inspect the engineering challenge, architectural solution, design trade-offs, and production code snippets.

### 3. DevSecOps Interactive CLI Terminal
- Dockable and floating retro-modern systems console featuring:
  - `kubectl get pods -A`, `kubectl get nodes`
  - `cat architecture.md`, `cat skills.json`
  - `curl /api/profile`, `curl /api/metrics`
  - `chaos [spike|kill|heal]`
  - Tab autocompletion and command history navigation (`Up` / `Down` arrows).

### 4. AI Architectural Copilot
- Context-aware conversational assistant grounded in Sourabh's verified 12+ years work history and technical decision records.
- Pre-configured architectural prompt chips for instant answers on Orleans, Kafka, LiveKit SFU, Kubernetes, and hiring inquiries.

### 5. Real-Time Telemetry Engine
- Full-duplex **WebSocket stream** broadcasting live cluster metrics, actor grain counts, p99 latency, and realistic microservice system logs.
- Automatic graceful fallback to client-side simulated telemetry when running statically without a backend.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: Vanilla ES6+ Modular Architecture, Canvas 2D Rendering Engine, Web Audio Synthesizer, CSS3 Custom Properties & Glassmorphism.
- **Backend / Telemetry**: Node.js, Express, WebSocket (`ws`) Server.
- **Container & Orchestration**: Docker multi-stage builds, Kubernetes Deployment & LoadBalancer Service.
- **Observability**: Prometheus scrape annotations (`prometheus.io/scrape`), live health probes (`/api/health`).

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v18 or later)
- npm

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/iamsourabh-in/foliov2.git
cd foliov2

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# or: node server.js
```

Open your browser at:
```
http://localhost:8080
```

---

## 🐳 Docker Deployment

Build and run containerized:
```bash
# Build Docker image
docker build -t sourabh-portfolio:latest .

# Run container
docker run -p 8080:8080 sourabh-portfolio:latest
```

---

## ☸️ Kubernetes Deployment

Deploy with automated replicas and Prometheus annotations:

```bash
# Apply deployment and service
kubectl apply -f k8s-deployment.yaml

# Verify pods and service
kubectl get pods -l app=portfolio
kubectl get svc portfolio-service
```

---

## 📬 Contact & Connect

- **Email**: [sourabh.rustagi@hotmail.com](mailto:sourabh.rustagi@hotmail.com)
- **Phone**: +91-84708-94772
- **LinkedIn**: [linkedin.com/in/sourabhrustagi](https://www.linkedin.com/in/sourabhrustagi)
- **GitHub**: [github.com/iamsourabh-in](https://github.com/iamsourabh-in)
- **Location**: New Delhi, India

---
© 2026 Sourabh Rustagi. All rights reserved.
