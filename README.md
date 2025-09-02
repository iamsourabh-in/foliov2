# Journey Through the Stack - Portfolio Website

This is a personal portfolio website for Sourabh Rustagi, a full-stack developer. The website is designed as an interactive journey through the different layers of a technology stack: Frontend, Backend, Cloud, and Kubernetes.

## Features

- **Interactive Layers**: Explore different layers of the tech stack, each with its own unique design and interactive elements.
- **Gamified Experience**: Engage with mini-games and challenges in each layer.
- **AI Chatbot**: Ask questions about Sourabh's experience and skills.
- **Live Metrics**: View (mock) live metrics from a Kubernetes cluster.
- **Dark/Light Mode**: Switch between dark and light themes.

## Tech Stack

- **Frontend**: React, Tailwind CSS, GSAP
- **Backend**: Node.js, Express, WebSocket
- **Cloud**: AWS/GCP/Azure
- **Kubernetes**: Docker, Prometheus, Grafana

## Running the Application Locally

### Prerequisites

- Node.js and npm

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8080`

## Deploying to Kubernetes

### Prerequisites

- A running Kubernetes cluster
- Docker installed and configured
- `kubectl` configured to connect to your cluster

### Steps

1. **Build and push the Docker image:**
   ```bash
   docker build -t your-docker-registry/portfolio:latest .
   docker push your-docker-registry/portfolio:latest
   ```

2. **Update the Kubernetes manifest:**
   In `k8s-deployment.yaml`, replace `your-docker-registry/portfolio:latest` with the path to your Docker image.

3. **Apply the Kubernetes manifest:**
   ```bash
   kubectl apply -f k8s-deployment.yaml
   ```

4. **Get the external IP of the service:**
   ```bash
   kubectl get svc portfolio-service
   ```

5. **Access the application:**
   Open your browser and navigate to the external IP address of the service.
