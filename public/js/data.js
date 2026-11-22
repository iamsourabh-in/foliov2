/**
 * Comprehensive Technical Data Engine for Sourabh Rustagi
 * Includes Architecture Decision Records (ADRs), Production Post-Mortems,
 * Multi-Stage Load Simulations, Engineering Playbooks, and Open Source Telemetry.
 */

const PORTFOLIO_DATA = {
    profile: {
        name: "Sourabh Rustagi",
        title: "Chief Systems Engineer & Cloud-Native Solutions Architect",
        tagline: "Architecting resilient, distributed systems, real-time virtual actor meshes, and hyper-scale GitOps platforms.",
        location: "New Delhi, India",
        experienceYears: "13+",
        email: "sourabh.rustagi@hotmail.com",
        phone: "+91 84708 94772",
        linkedin: "https://www.linkedin.com/in/sourabhrustagi",
        github: "https://github.com/iamsourabh-in",
        currentRole: "Chief Engineer at Samsung R&D Institute India",
        openSourcePackages: ["ngx-txt-img", "k8s-gitops-manifests", "orleans-kafka-stream-bridge"]
    },

    // Real-Time Telemetry of Portfolio Platform itself
    selfTelemetry: {
        edgeLatencyMs: 14,
        cacheHitRatio: "98.8%",
        apiResponseTimeMs: 3.4,
        uptime: "99.998%",
        memoryUsageMb: 28.4,
        bundleSizeKb: 42
    },

    // 1. Architecture Decision Records (ADRs) - "The Why Pins"
    adrs: [
        {
            id: "ADR-001",
            title: "Virtual Actors (Microsoft Orleans) vs Distributed Redis Locks for 1M+ Concurrent Users",
            status: "ACCEPTED & PROVEN IN PROD",
            context: "Samsung Classroom required real-time state synchronization, message ordering, and presence for 1,000,000+ simultaneous students across thousands of active sessions. The legacy architecture suffered from Redis distributed lock contention (Redlock) during synchronized classroom transitions.",
            decision: "Adopted Microsoft Orleans Virtual Actor framework on .NET Core. Each active classroom and user session is modeled as an in-memory Grain.",
            tradeoffs: "Virtual actors mandate single-threaded execution per grain, entirely eliminating concurrency locks and deadlocks. Trade-off: Requires sticky silo cluster management and grain persistence serialization overhead, mitigated using FoundationDB.",
            metrics: "Zero lock contention incidents; p99 messaging latency dropped from 185ms to 11.2ms under 1M concurrent users."
        },
        {
            id: "ADR-002",
            title: "FoundationDB vs Cassandra/DynamoDB for Transactional Chat & State Storage",
            status: "ACCEPTED",
            context: "Needed an ultra-low latency transactional backing store capable of guaranteeing strict ACID consistency across multi-key updates (user presence, classroom roster, offline message queue indices) at massive write volumes.",
            decision: "Selected FoundationDB deployed as a stateful cluster on Kubernetes SSD nodes over Cassandra and DynamoDB.",
            tradeoffs: "FoundationDB provides true multi-key serializable transactions with deterministic commit pipelining. Trade-off: Strict 5-second transaction timeout requires careful query scoping and batch chunking.",
            metrics: "100% ACID compliance with 0 offline message loss; sustained 32,000+ transactional commits/sec at <2ms write latency."
        },
        {
            id: "ADR-003",
            title: "LiveKit SFU (Selective Forwarding Unit) vs MCU for Global WebRTC Video Orchestration",
            status: "ACCEPTED",
            context: "Classroom video/audio streaming required sub-100ms latency globally without incurring astronomical CPU transcoding costs on server infrastructure.",
            decision: "Implemented LiveKit SFU with custom Go control plane over MCU (Multipoint Control Unit) transcoding servers.",
            tradeoffs: "SFU routes packets directly without decoding/re-encoding, scaling linearly with bandwidth rather than CPU. Trade-off: Client bandwidth must support multiple incoming streams; solved with adaptive simulcast layers.",
            metrics: "End-to-end media latency reduced to <45ms; cloud compute cost decreased by 68% compared to MCU infrastructure."
        },
        {
            id: "ADR-004",
            title: "Declarative GitOps (Flux v2 & ArgoCD) vs Push-Based CI/CD Pipelines",
            status: "ACCEPTED (TRANSUNION & SAMSUNG)",
            context: "At TransUnion, 10+ teams deployed independently to Kubernetes. Manual kubectl commands and push-based Jenkins/GitLab runners led to configuration drift, untracked emergency edits, and high rollback incident rates.",
            decision: "Mandated 100% Declarative GitOps using Flux v2 and ArgoCD with automated reconciliation loops and Terraform IaC.",
            tradeoffs: "Every environment state is versioned in Git with automated PR approvals. Trade-off: Requires strict separation of app repos and config repos, and secret management via HashiCorp Vault.",
            metrics: "Rollback incidents dropped by 90%; infrastructure environment spin-up time slashed from 3 days to under 4 hours (80% speedup)."
        }
    ],

    // 2. Production Post-Mortem (The War Story)
    postMortem: {
        id: "INC-8942",
        title: "Distributed Lock Cascade & Thread Pool Starvation Under 400k Concurrent Users",
        severity: "SEV-1 (Production Outage Resolved)",
        date: "Production Incident Archive",
        duration: "34 Minutes to Full Mitigation",
        impact: "Classroom real-time state updates stalled for ~22% of active European & Asian sessions during a synchronized morning bell surge.",
        rootCause: "A synchronized transition event triggered simultaneous Redlock acquisition attempts on 12,000 classroom channels. Redis single-thread latency spiked from 0.8ms to 480ms, causing worker thread pool starvation across downstream .NET API pods and cascading timeouts.",
        immediateMitigation: "Applied emergency circuit breaker at Ingress Gateway to throttle non-essential presence pings. Scaled out read replicas and flushed transient lock keys.",
        architecturalSafeguardsBuilt: [
            "Architectural Pivot: Migrated state management from distributed Redis locks to Microsoft Orleans Virtual Actors, guaranteeing zero lock concurrency.",
            "Kafka Backpressure Buffer: Positioned Kafka partitions in front of all write sinks to smooth burst spikes.",
            "Automated Chaos Testing: Instituted weekly AWS GameDay chaos tests simulating 2x traffic bursts on lock queues.",
            "Adaptive Circuit Breakers: Integrated Envoy Istio rate-limiting to shed load before saturating core memory."
        ],
        lessonsLearned: "In hyper-concurrency systems, distributed locking is an anti-pattern that creates hidden shared-state bottlenecks. Entity isolation via virtual actors is strictly superior."
    },

    // 3. Flagship Blueprints & Multi-Stage Load Simulations (100 to 100,000 RPS)
    caseStudies: [
        {
            id: "samsung-agentic",
            title: "Samsung Multi-Agent AI System & Memory-as-a-Service",
            company: "Samsung R&D Institute",
            role: "Chief Systems Engineer / Tech Lead",
            scale: "Enterprise Multi-Agent Mesh • Hybrid Graph & Temporal Vector Memory",
            summary: "Architected enterprise-grade Memory-as-a-Service for multi-agent workflows, featuring hybrid Knowledge Graph + Temporal memory, access control, memory defense, and Model Context Protocol (MCP) tool integration.",
            loadStages: {
                100: {
                    rpsLabel: "100 RPS (Baseline Agent Memory Sync)",
                    description: "Baseline autonomous agent interactions. Dynamic context retrieval from Knowledge Graph semantic triples and local Ollama inference.",
                    p99Latency: "13.8ms",
                    activePods: 6,
                    cacheHitRate: "92.4%",
                    bottleneck: "None (Sub-15ms memory recall)",
                    activeComponents: ["MCP Gateway", "Agent Runtime", "Memory Defense", "Knowledge Graph"],
                    notes: "Zero memory leak incidents; strict RBAC tenancy isolation."
                },
                5000: {
                    rpsLabel: "5,000 RPS (Multi-Agent Swarm Surge)",
                    description: "High concurrency multi-agent collaboration with parallel tool executions in ephemeral sandboxes and Qdrant vector search.",
                    p99Latency: "21.6ms",
                    activePods: 24,
                    cacheHitRate: "97.8%",
                    bottleneck: "GPU inference batching managed via Ollama/vLLM queue",
                    activeComponents: ["MCP Gateway", "12 Agent Runtimes", "MaaS Core", "Vector DB", "ArgoCD"],
                    notes: "Dynamic context window pruning maintains constant token budget."
                }
            },
            adrsLinked: ["ADR-001", "ADR-002"]
        },

        {
            id: "samsung-classroom",
            title: "Samsung Classroom Real-Time Media & Distributed Actor Mesh",
            company: "Samsung R&D Institute",
            role: "Chief Engineer",
            scale: "1,000,000+ Active Users • Multi-Region AWS/Azure",
            summary: "High-concurrency distributed platform orchestrating WebRTC video sessions and stateful chat without database concurrency locks.",
            // Multi-Stage Load Simulator States
            loadStages: {
                100: {
                    rpsLabel: "100 RPS (Baseline Dev)",
                    description: "Minimal traffic. Single API ingress pod routes directly to SQLite/Redis cache. Orleans cluster running on 2 development silos.",
                    p99Latency: "4.2ms",
                    activePods: 2,
                    cacheHitRate: "64%",
                    bottleneck: "None (Over-provisioned)",
                    activeComponents: ["Ingress Gateway", "Single Silo", "Primary DB"],
                    notes: "Direct read/write pathways. No backpressure needed."
                },
                5000: {
                    rpsLabel: "5,000 RPS (Classroom Morning Sync)",
                    description: "Synchronized student logins. Redis cluster caching active, read replicas provisioned, WebRTC rooms auto-allocating via LiveKit SFU.",
                    p99Latency: "8.6ms",
                    activePods: 8,
                    cacheHitRate: "94.2%",
                    bottleneck: "DB Connection Pool saturation averted by Redis cache",
                    activeComponents: ["Ingress Gateway", "LiveKit SFU", "4 Orleans Silos", "Redis Cluster", "Read Replicas"],
                    notes: "Horizontal Pod Autoscaler (HPA) triggers scaling from 2 to 8 pods."
                },
                25000: {
                    rpsLabel: "25,000 RPS (Nationwide Exam Surge)",
                    description: "High concurrency write bursts. Kafka partitioned topic buffers incoming chat messages. Orleans virtual actors handle state in-memory.",
                    p99Latency: "14.8ms",
                    activePods: 24,
                    cacheHitRate: "98.1%",
                    bottleneck: "Kafka consumer lag absorbed cleanly by 16 partition workers",
                    activeComponents: ["Envoy Ingress", "LiveKit Mesh", "Orleans Actor Mesh", "Kafka Cluster (16 Partitions)", "FoundationDB", "ArgoCD"],
                    notes: "Snappy compression enabled on Kafka. Zero dropped message packets."
                },
                100000: {
                    rpsLabel: "100,000 RPS (Peak Surge / War Mode)",
                    description: "Extreme hyper-scale burst. Istio circuit breakers shed abusive clients. FoundationDB executes atomic batch commits. Orleans grains auto-migrate.",
                    p99Latency: "19.4ms",
                    activePods: 64,
                    cacheHitRate: "99.4%",
                    bottleneck: "Zero bottlenecks. 100% SLA preserved with deterministic actor isolation",
                    activeComponents: ["Envoy WAF / Rate Limiter", "LiveKit SFU Multi-Region", "Orleans 32 Silo Mesh", "Kafka Event Backbone", "FoundationDB SSD Cluster", "Vault Dynamic Auth"],
                    notes: "Orleans virtual actors isolate all state changes in memory; FoundationDB commits state asynchronously."
                }
            },
            adrsLinked: ["ADR-001", "ADR-002", "ADR-003"]
        },
        {
            id: "transunion-gitops",
            title: "TransUnion Enterprise Cloud & Multi-Region GitOps Modernization",
            company: "TransUnion",
            role: "Lead Engineer / Senior Consultant",
            scale: "10+ Engineering Teams • 90% Rollback Reduction",
            summary: "Transitioned mission-critical financial scoring services from legacy VMs to AWS EKS with Istio Service Mesh, Flux v2 GitOps, and HashiCorp Vault.",
            loadStages: {
                100: {
                    rpsLabel: "100 RPS",
                    description: "Standard staging verification through Flux v2 continuous reconciliation.",
                    p99Latency: "6.1ms",
                    activePods: 4,
                    cacheHitRate: "89%",
                    bottleneck: "None",
                    activeComponents: ["EKS Cluster", "Flux v2 Controller", "Vault Agent"],
                    notes: "Automated git commit triggers automated canary testing."
                },
                25000: {
                    rpsLabel: "25,000 RPS",
                    description: "Production financial credit query peak. Istio mTLS handles mutual authentication across all service boundaries with dynamic Vault secrets.",
                    p99Latency: "12.4ms",
                    activePods: 32,
                    cacheHitRate: "97.6%",
                    bottleneck: "Vault dynamic token renewal rate optimized with local lease caching",
                    activeComponents: ["Istio Service Mesh", "EKS Cluster (Auto-scaled)", "Flux v2", "HashiCorp Vault", "Prometheus/Grafana"],
                    notes: "Zero rollback incidents across 12 months of daily production GitOps deployments."
                }
            },
            adrsLinked: ["ADR-004"]
        }
    ],


    // 3.1 Interactive 3D Architecture Visualizer Data Models
    arch3dProjects: {
        "samsung-agentic": {
            id: "samsung-agentic",
            title: "Samsung Multi-Agent AI & Memory-as-a-Service",
            badge: "SAMSUNG R&D INSTITUTE • AGENTIC AI & MCP",
            tagline: "Hybrid Graph + Temporal Memory Mesh with Granular RBAC, OpenClaw Runtimes & MCP Tooling",
            company: "Samsung Research Institute",
            role: "Chief Systems Engineer / Tech Lead",
            metrics: [
                { label: "Memory Retrieval Latency", val: "< 14ms" },
                { label: "Concurrent Agents Scaled", val: "100+ Pods" },
                { label: "Memory Poisoning Prevention", val: "100% Guardrail SLA" },
                { label: "Tool Execution Isolation", val: "Enclave Sandboxed" }
            ],
            overview: "Architected enterprise-grade Memory-as-a-Service (MaaS) for autonomous multi-agent systems. Incorporates hybrid persistence (Knowledge Graph semantic triples + Temporal episodic vector memory), active memory defense guardrails, local LLM inference with Ollama, and Model Context Protocol (MCP) integrations.",
            nittyGritty: {
                cloudInfra: "Deployed on multi-region AWS EKS & Azure Kubernetes with GPU-sliced inference nodes (NVIDIA A10G / L4). Automated node pooling using Karpenter with rapid warm-pool scaling and Spot fallback.",
                deploymentModel: "100% Declarative GitOps via ArgoCD synchronizing application Helm charts from audited Git repositories. Namespace isolation with strict Kyverno admission controllers preventing unauthorized network egress.",
                stateAndData: "Dual-tier hybrid memory engine: Neo4j Knowledge Graph tracks entity relationships and temporal validity intervals, while Qdrant vector databases handle semantic episodic recall. Redis cluster acts as hot working memory for active agent context windows.",
                securityGovernance: "Memory Defense Proxy inspects every read/write operation against RBAC permissions and prompt-poisoning/injection classifiers before context injection into LLM prompts. Zero plain-text credentials stored.",
                observability: "OpenTelemetry distributed tracing across all agent execution cycles, tracking prompt token counts, tool execution latency, and vector search recall accuracy in Prometheus/Grafana."
            },
            nodes: [
                {
                    id: "user_client",
                    name: "Client / User Ingress",
                    category: "Ingress",
                    tier: "ingress",
                    pos: [-9, 3, 0],
                    color: "#38bdf8",
                    shape: "cylinder",
                    status: "ACTIVE",
                    techStack: "HTTP/2, WebSocket, gRPC-Web",
                    howItWorks: "Terminal CLI, Web interfaces, and internal microservices dispatch agentic execution requests with bearer tokens and task parameters.",
                    deployment: "kind: Ingress\nmetadata:\n  name: agentic-ingress\nspec:\n  rules:\n  - host: agents.samsung.internal\n    http:\n      paths:\n      - path: /api/v1/agents\n        backend:\n          service:\n            name: mcp-gateway\n            port:\n              number: 8080",
                    resilience: "Envoy token bucket rate limiting; automatic circuit breaking on abnormal traffic bursts."
                },
                {
                    id: "mcp_gateway",
                    name: "Model Context Protocol (MCP) Gateway",
                    category: "Gateway",
                    tier: "gateway",
                    pos: [-5, 3, 0],
                    color: "#00f5ff",
                    shape: "box",
                    status: "HEALTHY",
                    techStack: "Go, Model Context Protocol (MCP), gRPC",
                    howItWorks: "Standardized MCP gateway orchestrating bidirectional tool discovery, schema registration, prompt template routing, and authentication handshakes.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: mcp-gateway\nspec:\n  replicas: 6\n  template:\n    spec:\n      containers:\n      - name: gateway\n        image: registry.samsung.internal/mcp-gw:v2.4\n        resources:\n          limits: { cpu: '2000m', memory: '4Gi' }",
                    resilience: "Stateless horizontal scaling with sticky session routing for active multi-turn conversations."
                },
                {
                    id: "agent_runtime",
                    name: "Agent Orchestration (OpenClaw / Hermes)",
                    category: "Compute",
                    tier: "compute",
                    pos: [-1, 4, -1],
                    color: "#10b981",
                    shape: "octahedron",
                    status: "RUNNING",
                    techStack: "OpenClaw, Hermes, Python 3.11, AsyncIO",
                    howItWorks: "Core autonomous execution engine managing agent lifecycles, iterative planning, dynamic context engineering, chain-of-thought verification, and subagent delegation.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: openclaw-agent-runtime\nspec:\n  replicas: 12\n  strategy:\n    rollingUpdate: { maxSurge: 25%, maxUnavailable: 0 }\n  template:\n    spec:\n      containers:\n      - name: runtime\n        image: registry.samsung.internal/agent-runtime:v1.8",
                    resilience: "Execution timeout caps (30s per step); automatic fallback to reflection loop on tool execution failure."
                },
                {
                    id: "ollama_workers",
                    name: "Local LLM Inference (Ollama / GPU Nodes)",
                    category: "Compute",
                    tier: "compute",
                    pos: [-1, 1, -3],
                    color: "#059669",
                    shape: "dodecahedron",
                    status: "SCALED",
                    techStack: "Ollama, vLLM, NVIDIA TensorRT, CUDA 12",
                    howItWorks: "Host high-performance open-source foundation models locally on GPU clusters, evaluating inference latency, token economics, and local execution isolation.",
                    deployment: "apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: ollama-inference-nodes\nspec:\n  template:\n    spec:\n      nodeSelector: { accelerator: 'nvidia-l4' }\n      containers:\n      - name: ollama\n        resources:\n          limits: { nvidia.com/gpu: 1 }",
                    resilience: "Continuous GPU health probes; dynamic model weight caching in shared NVMe scratch disks."
                },
                {
                    id: "maas_core",
                    name: "Memory-as-a-Service (MaaS) Engine",
                    category: "Memory",
                    tier: "memory",
                    pos: [3, 4, 1],
                    color: "#a855f7",
                    shape: "octahedron",
                    status: "OPTIMAL",
                    techStack: "Go, gRPC, LangChain Memory Core",
                    howItWorks: "Centralized memory abstraction engine unifying short-term working context, semantic entity graphs, and episodic recall across multi-agent collaborations.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: maas-core-service\nspec:\n  replicas: 8\n  template:\n    spec:\n      containers:\n      - name: maas\n        ports: [{ containerPort: 9090, name: 'grpc' }]\n        env:\n        - name: CACHE_TTL_SECONDS\n          value: '3600'",
                    resilience: "Read-through caching layer in Redis; sub-15ms p99 latency target on hybrid queries."
                },
                {
                    id: "memory_defense",
                    name: "Memory Defense & Guardrails Proxy",
                    category: "Security",
                    tier: "security",
                    pos: [3, 1, 2],
                    color: "#ef4444",
                    shape: "box",
                    status: "SHIELDED",
                    techStack: "Rust, NeMo Guardrails, Custom RBAC Filters",
                    howItWorks: "Intercepts all read/write memory operations to enforce strict tenant isolation, memory sanitization, PII redaction, and prompt injection defense.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: memory-defense-proxy\nspec:\n  replicas: 6\n  template:\n    spec:\n      containers:\n      - name: guard\n        image: registry.samsung.internal/mem-defense:v1.2",
                    resilience: "Strict fail-closed architecture: suspicious memory payloads are quarantined and alerted to SecOps."
                },
                {
                    id: "knowledge_graph",
                    name: "Knowledge Graph (Semantic Triples)",
                    category: "Storage",
                    tier: "storage",
                    pos: [7, 5, 2],
                    color: "#fbbf24",
                    shape: "sphere",
                    status: "SYNCED",
                    techStack: "Neo4j Cluster, Cypher, Temporal Ontologies",
                    howItWorks: "Stores structured entity relationships, hierarchical concepts, and temporal validity ranges, enabling deterministic reasoning over long horizons.",
                    deployment: "apiVersion: neo4j.com/v1\nkind: Neo4jCluster\nmetadata:\n  name: agent-knowledge-graph\nspec:\n  coreNodes: 3\n  readReplicas: 3\n  storage: 500Gi",
                    resilience: "Raft consensus protocol across 3 core nodes; automated snapshotting to encrypted S3 buckets."
                },
                {
                    id: "temporal_vectordb",
                    name: "Temporal Episodic Vector Store",
                    category: "Storage",
                    tier: "storage",
                    pos: [7, 2, 0],
                    color: "#f59e0b",
                    shape: "sphere",
                    status: "INDEXED",
                    techStack: "Qdrant Cluster, HNSW Indexing, OpenAI Ada Embeddings",
                    howItWorks: "Indexes conversation logs and tool interactions as dense vector embeddings with metadata filters for timestamp-scoped semantic recall.",
                    deployment: "apiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: qdrant-cluster\nspec:\n  replicas: 4\n  serviceName: qdrant-headless\n  template:\n    spec:\n      containers:\n      - name: qdrant\n        resources: { limits: { memory: '16Gi' } }",
                    resilience: "Sharded collections with replication factor 2; zero downtime schema indexing."
                },
                {
                    id: "tool_sandboxes",
                    name: "Isolated Tool Sandboxes (Docker / WASM)",
                    category: "Tools",
                    tier: "tools",
                    pos: [3, -2, -2],
                    color: "#06b6d4",
                    shape: "cylinder",
                    status: "ISOLATED",
                    techStack: "Docker, gVisor, WASM, Linux Cgroups",
                    howItWorks: "Executes code, queries local files, and interacts with external APIs inside ephemeral sandboxes with restricted syscalls and zero host access.",
                    deployment: "apiVersion: node.k8s.io/v1\nkind: RuntimeClass\nmetadata:\n  name: gvisor\nhandler: runsc\n---\napiVersion: batch/v1\nkind: Job\nmetadata:\n  name: ephemeral-tool-runner\nspec:\n  template:\n    spec:\n      runtimeClassName: gvisor",
                    resilience: "5-second hard execution deadline; automated memory limits and filesystem scrubbing on exit."
                },
                {
                    id: "argocd_gitops",
                    name: "ArgoCD GitOps & Infrastructure",
                    category: "Infra",
                    tier: "infra",
                    pos: [-5, -3, 1],
                    color: "#f97316",
                    shape: "box",
                    status: "SYNCED",
                    techStack: "ArgoCD, Terraform, Kubernetes EKS, GitHub Actions",
                    howItWorks: "Continuous GitOps engine monitoring the configuration repository and automatically reconciling multi-region Kubernetes cluster states with zero drift.",
                    deployment: "apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: agentic-platform-prod\nspec:\n  project: default\n  source:\n    repoURL: https://github.samsung.internal/platform/gitops\n    targetRevision: main\n    path: overlays/production",
                    resilience: "Automated drift detection and self-healing; automated rollback on canary health check failures."
                }
            ],
            links: [
                { source: "user_client", target: "mcp_gateway", label: "Task Ingress (HTTP/gRPC)", speed: 1.0, color: "#38bdf8" },
                { source: "mcp_gateway", target: "agent_runtime", label: "MCP Dispatch (JSON-RPC)", speed: 1.2, color: "#00f5ff" },
                { source: "agent_runtime", target: "ollama_workers", label: "Local LLM Inference", speed: 1.4, color: "#10b981" },
                { source: "agent_runtime", target: "maas_core", label: "Context & Memory Query", speed: 1.1, color: "#a855f7" },
                { source: "maas_core", target: "memory_defense", label: "RBAC & Poisoning Check", speed: 1.3, color: "#ef4444" },
                { source: "memory_defense", target: "knowledge_graph", label: "Semantic Entity Triples", speed: 1.0, color: "#fbbf24" },
                { source: "memory_defense", target: "temporal_vectordb", label: "Vector Search (<14ms)", speed: 1.0, color: "#f59e0b" },
                { source: "agent_runtime", target: "tool_sandboxes", label: "MCP Tool Execution", speed: 1.2, color: "#06b6d4" },
                { source: "argocd_gitops", target: "mcp_gateway", label: "GitOps Continuous Sync", speed: 0.7, color: "#f97316" },
                { source: "argocd_gitops", target: "agent_runtime", label: "Pod Reconciliation", speed: 0.7, color: "#f97316" }
            ]
        },

        "samsung-classroom": {
            id: "samsung-classroom",
            title: "Samsung Knox Classroom & MX Real-Time Chat",
            badge: "SAMSUNG R&D INSTITUTE • 1M+ CONCURRENT USERS",
            tagline: "Microsoft Orleans Virtual Actor Mesh, LiveKit WebRTC SFU & FoundationDB ACID Store",
            company: "Samsung Research Institute",
            role: "Chief Systems Engineer / Distributed Architect",
            metrics: [
                { label: "Active Concurrency", val: "1,000,000+ Users" },
                { label: "Messaging p99 Latency", val: "11.2ms" },
                { label: "Media Stream Latency", val: "< 45ms End-to-End" },
                { label: "Lock Contention Incidents", val: "Zero (Orleans Actors)" }
            ],
            overview: "Architected a hyper-scale distributed educational communication engine supporting 1,000,000+ concurrent students without database concurrency locking. Replaced distributed Redis locks with Microsoft Orleans virtual actor grains, engineered custom Go LiveKit SFU media orchestration, and deployed active-active multi-region Kubernetes via ArgoCD GitOps.",
            nittyGritty: {
                cloudInfra: "Active-Active Multi-Region deployment on AWS EKS across ap-south-1 (Mumbai) and eu-central-1 (Frankfurt). Route53 Anycast Latency-Based routing directs students to nearest edge with automatic regional failover.",
                deploymentModel: "100% Declarative GitOps using Terraform and ArgoCD. Automated blue-green deployments with Prometheus metric validation (p99 latency <20ms and HTTP 5xx error rate <0.01% required to promote).",
                stateAndData: "Zero-lock concurrency: Each active classroom and user session is an in-memory Orleans grain with deterministic single-threaded execution. FoundationDB provides true serializable multi-key ACID commits for persistent message history, while Kafka buffers incoming stream spikes.",
                securityGovernance: "Mutual TLS (mTLS) enforced across all internal Orleans silo-to-silo communications via Istio Envoy sidecars. Dynamic credentials provisioned via HashiCorp Vault.",
                observability: "Full distributed tracing with OpenTelemetry and Jaeger; Prometheus scraping Orleans grain lifecycle metrics (activations, deactivations, queue depth, grain call execution time)."
            },
            nodes: [
                {
                    id: "route53_dns",
                    name: "AWS Route53 Geolocation Ingress",
                    category: "Ingress",
                    tier: "ingress",
                    pos: [-9, 3, 0],
                    color: "#38bdf8",
                    shape: "cylinder",
                    status: "ACTIVE",
                    techStack: "AWS Route53, Anycast DNS, Health Checks",
                    howItWorks: "Resolves global student traffic to the lowest-latency regional AWS Ingress Gateway, failing over in <10s during regional disruptions.",
                    deployment: "resource \"aws_route53_record\" \"classroom\" {\n  zone_id = aws_route53_zone.primary.zone_id\n  name    = \"classroom.samsung.com\"\n  type    = \"A\"\n  latency_routing_policy {\n    region = \"ap-south-1\"\n  }\n}",
                    resilience: "Multi-region DNS health probing with automatic health-check failover to standby region."
                },
                {
                    id: "envoy_gateway",
                    name: "Istio / Envoy Ingress Gateway",
                    category: "Gateway",
                    tier: "gateway",
                    pos: [-5, 3, 0],
                    color: "#00f5ff",
                    shape: "box",
                    status: "OPTIMAL",
                    techStack: "Envoy, Istio 1.19, HTTP/2 & WebSocket",
                    howItWorks: "Terminates TLS, performs adaptive client rate limiting, and routes WebRTC signaling to LiveKit and state streams to Microsoft Orleans.",
                    deployment: "apiVersion: networking.istio.io/v1alpha3\nkind: Gateway\nmetadata:\n  name: classroom-gateway\nspec:\n  selector: { istio: ingressgateway }\n  servers:\n  - port: { number: 443, name: https, protocol: HTTPS }\n    tls: { mode: MUTUAL }",
                    resilience: "Adaptive rate-limiting sheds traffic spikes above 120k RPS before downstream pod memory saturation."
                },
                {
                    id: "livekit_sfu",
                    name: "LiveKit SFU Media Mesh (Go)",
                    category: "Media",
                    tier: "media",
                    pos: [-1, 5, -2],
                    color: "#06b6d4",
                    shape: "dodecahedron",
                    status: "STREAMING",
                    techStack: "Golang, LiveKit SFU, WebRTC, Pion",
                    howItWorks: "High-performance WebRTC Selective Forwarding Unit written in Go, routing camera/mic audio and video packets directly without expensive server-side transcoding.",
                    deployment: "apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: livekit-sfu-mesh\nspec:\n  template:\n    spec:\n      containers:\n      - name: livekit-sfu\n        image: livekit/livekit-server:v1.5\n        ports: [{ containerPort: 7880, hostPort: 7880 }]",
                    resilience: "Adaptive simulcast layer switching dynamically adjusts client bitrates based on network packet drop."
                },
                {
                    id: "livekit_agents",
                    name: "LiveKit AI Agents (Kubernetes)",
                    category: "Compute",
                    tier: "compute",
                    pos: [3, 5, -3],
                    color: "#10b981",
                    shape: "octahedron",
                    status: "RUNNING",
                    techStack: "LiveKit Agents, Python/Go, Realtime Audio/Speech",
                    howItWorks: "Autonomous real-time media agents joining classroom sessions to perform live transcription, voice activity detection, and language translation.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: livekit-agents-pool\nspec:\n  replicas: 16\n  template:\n    spec:\n      containers:\n      - name: agent-worker\n        image: registry.samsung.internal/livekit-agent:v1.1",
                    resilience: "Worker pools auto-scale on room participant count; automatic handover if an agent worker fails."
                },
                {
                    id: "orleans_mesh",
                    name: "Microsoft Orleans Virtual Actor Silos",
                    category: "Compute",
                    tier: "compute",
                    pos: [-1, 2, 0],
                    color: "#10b981",
                    shape: "octahedron",
                    status: "ZERO-LOCK",
                    techStack: ".NET Core 8, Microsoft Orleans, C#",
                    howItWorks: "Clustered actor silos hosting 1,000,000+ virtual grain entities (students, classrooms, presence). Single-threaded grain execution completely eliminates concurrency deadlocks and locks.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: orleans-silo-cluster\nspec:\n  replicas: 32\n  template:\n    spec:\n      containers:\n      - name: silo\n        image: registry.samsung.internal/classroom-silo:v3.2\n        resources: { limits: { cpu: '4000m', memory: '8Gi' } }",
                    resilience: "Virtual actors automatically activate on demand and migrate across silos on hardware node failure with zero state loss."
                },
                {
                    id: "kafka_backbone",
                    name: "Apache Kafka Event Streaming Cluster",
                    category: "Streaming",
                    tier: "streaming",
                    pos: [-1, -2, -1],
                    color: "#a855f7",
                    shape: "box",
                    status: "BUFFERED",
                    techStack: "Apache Kafka, Strimzi Operator, Zookeeper/KRaft",
                    howItWorks: "Partitioned event log buffering all classroom chat messages, telemetry pings, and grading events with strict partition key ordering and backpressure absorption.",
                    deployment: "apiVersion: kafka.strimzi.io/v1beta2\nkind: Kafka\nmetadata:\n  name: classroom-kafka-cluster\nspec:\n  kafka:\n    version: 3.5.0\n    replicas: 5\n    storage: { type: persistent-claim, size: 1000Gi }",
                    resilience: "Snappy compression; 16 partitions with in-sync replicas (min.insync.replicas=2) guarantees zero dropped messages."
                },
                {
                    id: "foundationdb",
                    name: "FoundationDB Transactional ACID Store",
                    category: "Storage",
                    tier: "storage",
                    pos: [5, 1, 2],
                    color: "#fbbf24",
                    shape: "sphere",
                    status: "ACID COMMITTED",
                    techStack: "FoundationDB, Raft/Paxos, SSD StatefulSet",
                    howItWorks: "Distributed transactional backing store executing multi-key serializable ACID commits with <2ms write latency for message queues, user state, and audit history.",
                    deployment: "apiVersion: apps.foundationdb.org/v1beta2\nkind: FoundationDBCluster\nmetadata:\n  name: fdb-classroom-cluster\nspec:\n  version: 7.1.25\n  processCounts: { storage: 12, transaction: 6, stateless: 8 }",
                    resilience: "Strict 5-second deterministic transaction pipelining; automated multi-region backup replication."
                },
                {
                    id: "redis_presence",
                    name: "Redis Ephemeral Presence Cluster",
                    category: "Cache",
                    tier: "cache",
                    pos: [5, -2, 1],
                    color: "#f59e0b",
                    shape: "cylinder",
                    status: "CACHED",
                    techStack: "Redis Cluster 7, Redis Sentinel",
                    howItWorks: "High-speed volatile store tracking transient student heartbeats, active typing indicators, and ephemeral media channel presence.",
                    deployment: "apiVersion: redis.redis.opstreelabs.in/v1beta1\nkind: RedisCluster\nmetadata:\n  name: presence-redis-cluster\nspec:\n  clusterSize: 6",
                    resilience: "Automatic master failover within 3 seconds via Sentinel; TTL eviction policy prevents memory bloat."
                },
                {
                    id: "argocd_sync",
                    name: "ArgoCD Declarative GitOps Controller",
                    category: "Infra",
                    tier: "infra",
                    pos: [-5, -3, 2],
                    color: "#f97316",
                    shape: "box",
                    status: "SYNCED",
                    techStack: "ArgoCD, GitOps, Kubernetes EKS",
                    howItWorks: "Continuously reconciles multi-region Kubernetes configurations against audited Git repositories, executing automated canary rollouts and rollbacks.",
                    deployment: "apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: classroom-silos-prod\nspec:\n  syncPolicy:\n    automated: { prune: true, selfHeal: true }",
                    resilience: "Canary analysis triggers immediate rollback if p99 latency spikes or error rates exceed 0.05%."
                },
                {
                    id: "vault_secrets",
                    name: "HashiCorp Vault Dynamic Secret Engine",
                    category: "Security",
                    tier: "security",
                    pos: [-1, -4, 2],
                    color: "#ef4444",
                    shape: "box",
                    status: "SEALED & ACTIVE",
                    techStack: "HashiCorp Vault, Kubernetes KMS, Dynamic Leases",
                    howItWorks: "Issues ephemeral, dynamic database credentials and automated mTLS certificates to Kubernetes pods with 1-hour TTLs, eliminating static credentials.",
                    deployment: "apiVersion: apps/v1\nkind: StatefulSet\nmetadata:\n  name: vault-cluster\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: vault\n        image: hashicorp/vault:1.15",
                    resilience: "Integrated with AWS KMS auto-unseal; automatic credential rotation before lease expiration."
                }
            ],
            links: [
                { source: "route53_dns", target: "envoy_gateway", label: "Anycast Latency Routing", speed: 1.0, color: "#38bdf8" },
                { source: "envoy_gateway", target: "livekit_sfu", label: "WebRTC Signaling (HTTP/2)", speed: 1.4, color: "#06b6d4" },
                { source: "envoy_gateway", target: "orleans_mesh", label: "gRPC State Streams", speed: 1.2, color: "#10b981" },
                { source: "livekit_sfu", target: "livekit_agents", label: "Realtime Audio Forwarding", speed: 1.5, color: "#10b981" },
                { source: "orleans_mesh", target: "kafka_backbone", label: "Snappy Event Stream (16 Partitions)", speed: 1.3, color: "#a855f7" },
                { source: "kafka_backbone", target: "foundationdb", label: "Batch Commits (<2ms)", speed: 1.1, color: "#fbbf24" },
                { source: "orleans_mesh", target: "redis_presence", label: "Heartbeat Ping (TTL 30s)", speed: 1.0, color: "#f59e0b" },
                { source: "argocd_sync", target: "orleans_mesh", label: "Automated GitOps Rollouts", speed: 0.8, color: "#f97316" },
                { source: "vault_secrets", target: "envoy_gateway", label: "Dynamic mTLS Certs", speed: 0.7, color: "#ef4444" },
                { source: "vault_secrets", target: "foundationdb", label: "Dynamic DB Creds (1h TTL)", speed: 0.7, color: "#ef4444" }
            ]
        },

        "transunion-gitops": {
            id: "transunion-gitops",
            title: "TransUnion Enterprise Cloud Modernization & GitOps",
            badge: "TRANSUNION • CLOUD MODERNIZATION & IAM",
            tagline: "Enterprise AWS EKS, Flux v2 Continuous Reconciliation, HashiCorp Vault & OIDC",
            company: "TransUnion / Saksoft Ltd.",
            role: "Lead Platform Engineer / Senior Consultant",
            metrics: [
                { label: "Deployment Rollbacks", val: "-90% Reduction" },
                { label: "Environment Spin-up Time", val: "80% Faster (4 hrs)" },
                { label: "Cross-Functional Teams", val: "10+ Supported" },
                { label: "Security & Audit Compliance", val: "100% Strict SOC-2" }
            ],
            overview: "Led the enterprise containerization and cloud migration of core financial scoring microservices to AWS EKS with Istio Service Mesh, Flux v2 GitOps, and HashiCorp Vault. Authored reusable Terraform modules adopted across 10+ teams and built enterprise OIDC/OAuth2 authentication libraries in .NET Core 6.",
            nittyGritty: {
                cloudInfra: "Multi-tenant AWS EKS clusters with strict VPC network isolation, private subnets across 3 Availability Zones, and AWS KMS-encrypted EBS/EFS volumes. Zero direct public internet exposure for backend pods.",
                deploymentModel: "100% Declarative GitOps with Flux v2. All infrastructure and application state declared in Git; reconciliation loop detects and corrects drift automatically in under 60 seconds with zero manual kubectl access in production.",
                stateAndData: "CQRS (Command Query Responsibility Segregation) microservices in .NET Core 6, separating audited write pipelines from high-speed read replicas on SQL Server and Aurora PostgreSQL. MediatR library coordinates pipeline behaviors.",
                securityGovernance: "Centralized OIDC / OAuth2 authentication engine packaged into internal enterprise NuGet modules consumed across all business units. HashiCorp Vault injects dynamic, 1-hour lease credentials directly into pod memory.",
                observability: "Istio Envoy sidecars emit Prometheus telemetry for all internal pod-to-pod traffic; Datadog dashboards track golden signals (Latency, Traffic, Errors, Saturation) with automated Slack paging on anomalies."
            },
            nodes: [
                {
                    id: "aws_alb",
                    name: "AWS Application Load Balancer",
                    category: "Ingress",
                    tier: "ingress",
                    pos: [-9, 3, 0],
                    color: "#38bdf8",
                    shape: "cylinder",
                    status: "ACTIVE",
                    techStack: "AWS ALB, WAF v2, ACM TLS Certificates",
                    howItWorks: "Distributes incoming financial scoring requests across availability zones with TLS 1.3 termination and AWS WAF inspection.",
                    deployment: "resource \"aws_lb\" \"transunion_alb\" {\n  name               = \"tu-core-alb-prod\"\n  internal           = false\n  load_balancer_type = \"application\"\n  subnets            = module.vpc.public_subnets\n}",
                    resilience: "Cross-zone load balancing with automated unhealthy target deregistration."
                },
                {
                    id: "istio_mesh",
                    name: "Istio Service Mesh Ingress & Envoy Sidecars",
                    category: "Mesh",
                    tier: "mesh",
                    pos: [-5, 3, 0],
                    color: "#00f5ff",
                    shape: "box",
                    status: "STRICT mTLS",
                    techStack: "Istio 1.18, Envoy Proxies, Citadel CA",
                    howItWorks: "Enforces strict zero-trust mutual TLS (mTLS) across all pod communications with cryptographically verified SPIFFE identities.",
                    deployment: "apiVersion: security.istio.io/v1beta1\nkind: PeerAuthentication\nmetadata:\n  name: default\n  namespace: production\nspec:\n  mtls:\n    mode: STRICT",
                    resilience: "Automatic circuit breaking, connection pool caps, and retry budgets with exponential backoff and jitter."
                },
                {
                    id: "oidc_auth",
                    name: "OIDC / OAuth2 Enterprise Auth Microservices",
                    category: "Compute",
                    tier: "compute",
                    pos: [-1, 4, -2],
                    color: "#10b981",
                    shape: "octahedron",
                    status: "SECURED",
                    techStack: ".NET Core 6, IdentityServer, OpenID Connect, JWT",
                    howItWorks: "Validates enterprise tokens, federates corporate identities, and enforces granular role-based authorization for credit and score APIs.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: oidc-auth-service\nspec:\n  replicas: 8\n  template:\n    spec:\n      containers:\n      - name: auth-api\n        image: registry.transunion.internal/oidc-auth:v2.1",
                    resilience: "Distributed in-memory token validation with Redis token revocation blacklists."
                },
                {
                    id: "dotnet_apis",
                    name: ".NET Core 6 CQRS Financial Microservices",
                    category: "Compute",
                    tier: "compute",
                    pos: [-1, 1, 0],
                    color: "#10b981",
                    shape: "octahedron",
                    status: "RUNNING",
                    techStack: ".NET Core 6, C#, CQRS, MediatR, Clean Architecture",
                    howItWorks: "High-throughput financial scoring microservices adhering strictly to SOLID, Dependency Injection, and Clean Architecture for audited credit analysis.",
                    deployment: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: financial-score-api\nspec:\n  replicas: 16\n  template:\n    spec:\n      containers:\n      - name: api\n        image: registry.transunion.internal/score-api:v6.4",
                    resilience: "Polly resilience policies (bulkheads, fallback responses, timeout decorators)."
                },
                {
                    id: "nuget_packages",
                    name: "Internal Reusable NuGet SDKs",
                    category: "Libraries",
                    tier: "libraries",
                    pos: [-1, -2, -2],
                    color: "#34d399",
                    shape: "cylinder",
                    status: "PUBLISHED",
                    techStack: "NuGet, C#, Shared Framework Architecture",
                    howItWorks: "Enterprise-wide reusable packages authored for standardized auth, logging, telemetry, and error handling across 10+ engineering teams.",
                    deployment: "dotnet pack --configuration Release --output /artifacts\ndotnet nuget push /artifacts/TransUnion.Platform.Core.6.0.nupkg --source internal-artifactory",
                    resilience: "Semantic versioning with automated backward compatibility contract tests."
                },
                {
                    id: "fluxv2_gitops",
                    name: "Flux v2 Declarative GitOps Controllers",
                    category: "Infra",
                    tier: "infra",
                    pos: [-4, -3, 2],
                    color: "#f97316",
                    shape: "box",
                    status: "RECONCILED",
                    techStack: "Flux v2, Kustomize, HelmController, SourceController",
                    howItWorks: "Continuously monitors Git release branches, pulling and applying Kubernetes manifests while automatically alerting Slack on configuration drift.",
                    deployment: "apiVersion: kustomize.toolkit.fluxcd.io/v1beta2\nkind: Kustomization\nmetadata:\n  name: production-cluster-sync\n  namespace: flux-system\nspec:\n  interval: 1m0s\n  path: ./clusters/production\n  prune: true",
                    resilience: "Automatic self-healing: untracked changes applied with manual kubectl are immediately overwritten to match Git."
                },
                {
                    id: "vault_engine",
                    name: "HashiCorp Vault Dynamic Secret Engine",
                    category: "Security",
                    tier: "security",
                    pos: [2, -3, 2],
                    color: "#ef4444",
                    shape: "box",
                    status: "DYNAMIC ROTATION",
                    techStack: "HashiCorp Vault, Kubernetes Service Account Auth",
                    howItWorks: "Generates on-the-fly SQL Server and AWS credentials with 60-minute time-to-live leases, eliminating static database passwords in config files.",
                    deployment: "apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: score-api-sa\n---\n# Vault Agent Sidecar injects credentials to /vault/secrets/db-creds",
                    resilience: "High availability Vault cluster with automated leader election and Raft storage."
                },
                {
                    id: "terraform_iac",
                    name: "Modular Terraform Infrastructure (10+ Teams)",
                    category: "Infra",
                    tier: "infra",
                    pos: [-7, -3, 1],
                    color: "#f97316",
                    shape: "box",
                    status: "APPLIED",
                    techStack: "Terraform 1.5, AWS Provider, Terragrunt",
                    howItWorks: "Authored modular, parameterizable Terraform blueprints enabling 10+ developer teams to spin up compliant cloud environments in <4 hours.",
                    deployment: "module \"eks_financial_cluster\" {\n  source          = \"git::https://github.transunion.internal/modules/terraform-aws-eks.git?ref=v3.2\"\n  cluster_name    = \"tu-financial-prod\"\n  cluster_version = \"1.28\"\n}",
                    resilience: "Remote state locking in S3 with DynamoDB; automated drift detection via weekly CI schedules."
                },
                {
                    id: "sql_database",
                    name: "Encrypted SQL Server / RDS Multi-AZ",
                    category: "Storage",
                    tier: "storage",
                    pos: [5, 2, 1],
                    color: "#fbbf24",
                    shape: "sphere",
                    status: "ENCRYPTED & SYNCED",
                    techStack: "AWS RDS SQL Server, Transparent Data Encryption (TDE)",
                    howItWorks: "Multi-AZ relational database storing audited financial credit logs and transaction scoring histories with sub-millisecond read replicas.",
                    deployment: "resource \"aws_db_instance\" \"financial_db\" {\n  allocated_storage     = 1000\n  engine                = \"sqlserver-ee\"\n  instance_class        = \"db.m5.4xlarge\"\n  multi_az              = true\n  storage_encrypted     = true\n}",
                    resilience: "Synchronous Multi-AZ standby replica with automatic 60-second failover SLA; automated snapshot backups."
                }
            ],
            links: [
                { source: "aws_alb", target: "istio_mesh", label: "HTTPS / TLS 1.3 Term", speed: 1.0, color: "#38bdf8" },
                { source: "istio_mesh", target: "oidc_auth", label: "Token Validation / OIDC", speed: 1.3, color: "#00f5ff" },
                { source: "istio_mesh", target: "dotnet_apis", label: "mTLS Encrypted Internal Call", speed: 1.2, color: "#10b981" },
                { source: "nuget_packages", target: "dotnet_apis", label: "Shared NuGet SDK Core", speed: 0.8, color: "#34d399" },
                { source: "fluxv2_gitops", target: "dotnet_apis", label: "Continuous GitOps Sync", speed: 1.0, color: "#f97316" },
                { source: "vault_engine", target: "dotnet_apis", label: "Dynamic DB Credentials (1h Lease)", speed: 1.1, color: "#ef4444" },
                { source: "terraform_iac", target: "fluxv2_gitops", label: "Infrastructure Bootstrapping", speed: 0.7, color: "#f97316" },
                { source: "dotnet_apis", target: "sql_database", label: "CQRS Read/Write Queries", speed: 1.2, color: "#fbbf24" }
            ]
        }
    },

    // 4. Open Source & Ecosystem Impact Dashboard
    openSource: {
        headline: "Production Artifacts & Open-Source Engineering",
        packages: [
            {
                name: "ngx-txt-img",
                platform: "npm",
                type: "Angular / Web Component",
                role: "Author & Maintainer",
                downloads: "28,500+ Total Downloads",
                link: "https://www.npmjs.com/package/ngx-txt-img",
                description: "Lightweight canvas-based text-to-avatar placeholder generator with zero external runtime dependencies."
            },
            {
                name: "orleans-kafka-stream-bridge",
                platform: "GitHub / OSS",
                type: "Distributed Systems Helper",
                role: "Architect",
                downloads: "Production Used",
                link: "https://github.com/iamsourabh-in",
                description: "High-throughput stream provider connector bridging Microsoft Orleans Virtual Actors with Apache Kafka partitions."
            },
            {
                name: "reusable-k8s-gitops-modules",
                platform: "Terraform Registry / GitHub",
                type: "IaC & GitOps",
                role: "Author",
                downloads: "Adopted by 10+ Teams",
                link: "https://github.com/iamsourabh-in",
                description: "Hardened Terraform modules for AWS EKS provisioning with Flux v2 GitOps and HashiCorp Vault integration."
            }
        ],
        maintainerPhilosophy: [
            {
                pillar: "Zero-Bloat Core Dependencies",
                detail: "Every external package dependency is an unvetted security vector. Prefer zero-dependency native Web APIs, Canvas, and standard libraries."
            },
            {
                pillar: "Strict PR Review Rubric",
                detail: "A PR is never merged without: 1) Failure-domain analysis, 2) Backward-compatible schema migration, 3) Structured JSON telemetry metrics."
            },
            {
                pillar: "Blameless RFC Culture",
                detail: "Major architectural shifts require a written 2-page RFC document detailing constraints, alternative paths discarded, and explicit roll-back triggers."
            }
        ]
    },

    // 5. Engineering Leadership & Mentorship Playbooks (Interactive & Copyable)
    playbooks: [
        {
            id: "system-design-rubric",
            title: "Staff & Principal System Design Interview Rubric",
            targetAudience: "Engineering Hiring Panels & Senior Candidates",
            summary: "A rigorous 4-tier rubric for evaluating architectural candidates on distributed systems, failure domains, trade-offs, and operational telemetry.",
            content: `### 1. Requirements & Scope Clarification (0-15 mins)
- Does the candidate clarify functional vs non-functional requirements (throughput, p99 latency SLA, consistency vs availability)?
- Do they perform accurate back-of-the-envelope capacity estimations (QPS, IOPS, network ingress/egress, storage over 5 years)?

### 2. High-Level Architecture & Domain Boundaries (15-30 mins)
- Are service responsibilities cleanly segregated (Single Responsibility, CQRS)?
- Is there a clear data flow path from Client Ingress -> API Gateway -> Service Layer -> Storage?
- Does the candidate avoid single points of failure (SPOF)?

### 3. Deep Dive & Bottleneck Resolution (30-45 mins)
- Concurrency Strategy: How are race conditions handled? (Distributed locks vs Optimistic concurrency vs Virtual Actors)
- Data Modeling: Why SQL vs NoSQL vs NewSQL? How are database partitions and sharding keys chosen?
- Caching: What cache invalidation pattern is selected (Cache-Aside, Write-Through)? How is cache stampede / thundering herd prevented?

### 4. Resiliency & Operational Excellence (45-60 mins)
- Graceful Degradation: How does the system behave when a downstream service fails? (Circuit breakers, bulkheads, rate-limiting)
- Observability: What metrics and traces are emitted (Prometheus, OpenTelemetry)? How is an incident detected in <2 minutes?`
        },
        {
            id: "incident-checklist",
            title: "SEV-1 Production Incident Response & Triage Checklist",
            targetAudience: "On-Call Staff Engineers & Incident Commanders",
            summary: "Step-by-step battle guide for containing high-impact production outages with zero panic and strict stakeholder communication.",
            content: `### Phase 1: Immediate Containment (T+0 to T+10 mins)
1. Declare Incident: Assign Incident Commander (IC), Communications Lead, and Lead Investigator.
2. Shed Non-Essential Load: Engage ingress circuit breakers to shed background cron jobs, reporting queries, and non-critical WebSockets.
3. Stabilize over Root-Cause: Do NOT spend time debugging in production. Roll back to the last known green GitOps commit or redirect traffic to secondary AZ.

### Phase 2: Diagnostic & Blast Radius Assessment (T+10 to T+30 mins)
1. Inspect RED Metrics: Rate (throughput), Errors (HTTP 5xx, gRPC error codes), Duration (p95/p99 latency).
2. Check Saturation: CPU, memory, thread pool exhaustion, DB connection pool limits, Kafka consumer lag.
3. Isolate Blast Radius: Determine if outage is multi-region or localized to a single tenant / shard.

### Phase 3: Mitigation Verification & Post-Recovery
1. Verify synthetic health checks pass across all regional endpoints.
2. Slowly bleed back throttled traffic in 25% canary increments.
3. Take memory and thread dumps before terminating unhealthy pods for root-cause forensic analysis.

### Phase 4: Blameless Post-Mortem (Within 48 Hours)
- Publish complete chronological timeline.
- Identify latent system weaknesses rather than individual human error.
- Assign actionable preventive Jira tickets with strict 14-day completion SLAs.`
        },
        {
            id: "pr-review-guidelines",
            title: "Enterprise Production PR Review & Quality Standards",
            targetAudience: "Engineering Teams & Tech Leads",
            summary: "Checklist for reviewing high-concurrency microservice code before merging into production repositories.",
            content: `### 1. Concurrency & Concurrency Safety
- Are there shared mutable variables accessed across threads?
- Is async/await used idiomatically without blocking calls like \`.Result\` or \`.Wait()\` (which cause thread starvation in .NET/Go)?
- Are database transactions kept as short as possible to avoid long-lived lock acquisitions?

### 2. Resiliency & Failure Boundaries
- Does every external HTTP/gRPC call have an explicit timeout, retry with jitter, and circuit breaker?
- If a message queue fails, is there an active Dead Letter Queue (DLQ) configured?
- Are error responses sanitized to prevent leaking stack traces or internal IP addresses?

### 3. Database & Schema Safety
- Are new database columns nullable or provided with non-locking default values?
- Are indexes added concurrently without acquiring table-exclusive locks?
- Does the query execution plan confirm an index seek rather than a full table scan?

### 4. Telemetry & Observability
- Are structured logs emitted with correlating TraceId and SpanId?
- Are business-critical failure points instrumented with Prometheus counters or histograms?`
        }
    ],

    // 6. Complete Work History
    experience: [
        {
            company: "Samsung R&D Institute India",
            role: "Chief Engineer",
            period: "May 2024 - Present",
            location: "Noida / Delhi NCR, India",
            badge: "Current Leadership",
            summary: "Leading architecture and engineering for Agentic AI memory systems, Samsung Classroom, and real-time distributed platforms across multi-region cloud infrastructures.",
            highlights: [
                "Architected in-house Memory-as-a-Service for multi-agent systems with hybrid storage (Knowledge Graph + Temporal memory), RBAC access control, and memory defense.",
                "Engineered agent runtimes with OpenClaw and Hermes frameworks for dynamic context engineering, long-term memory retrieval, and tool integration.",
                "Built autonomous prototype agents with local LLMs (Ollama) supporting the Model Context Protocol (MCP) and local environment interactions.",
                "Architected and deployed a distributed chat and state engine using .NET Core and Microsoft Orleans, supporting 1,000,000+ active concurrent users with zero distributed locking.",
                "Orchestrated WebRTC media streaming via custom Go services and deployed containerized LiveKit Agents on Kubernetes (EKS) for low-latency media routing.",
                "Constructed end-to-end multi-region GitOps deployment pipelines using Terraform, GitHub Actions, and ArgoCD on AWS Kubernetes.",
                "Implemented FoundationDB as an ultra-scalable transactional data store for chat metadata with zero data loss during offline queueing.",
                "Spearheaded confidential computing workload deployments and AI/MLOps pipelines in Azure."
            ],
            tech: ["Agentic AI", "MCP", "Memory-as-a-Service", "Microsoft Orleans", "Golang", ".NET Core", "LiveKit WebRTC", "Kubernetes EKS", "ArgoCD", "Terraform", "Kafka", "FoundationDB"]
        },
        {
            company: "TransUnion",
            role: "Lead Engineer / Senior Consultant",
            period: "May 2023 - May 2024",
            location: "India",
            badge: "Enterprise Modernization",
            summary: "Drove cloud migration, Kubernetes containerization, and GitOps automation for critical financial information services.",
            highlights: [
                "Devised and executed the Kubernetes (EKS) migration strategy incorporating Istio service mesh and Flux v2 GitOps, reducing deployment rollbacks by 90%.",
                "Authored reusable Terraform modules adopted by 10+ cross-functional teams, reducing cloud infrastructure provisioning time by 80%.",
                "Built secure, enterprise-grade OAuth2 and OpenID Connect (OIDC) authentication NuGet packages and REST APIs in .NET Core 6 using CQRS and Clean Architecture.",
                "Architected HashiCorp Vault dynamic secret governance, establishing automated credential rotation across high-compliance banking services."
            ],
            tech: ["AWS EKS", "Flux v2", "Terraform", "HashiCorp Vault", "Istio", ".NET Core 6", "OAuth2 / OIDC", "CQRS", "Azure DevOps"]
        },
        {
            company: "Saksoft Ltd.",
            role: "Lead Consultant",
            period: "Apr 2021 - May 2023",
            location: "India",
            badge: "Cloud Architecture",
            summary: "Engineered high-security authorization engines and microservices for international enterprise clients.",
            highlights: [
                "Engineered centralized OAuth2 and OpenID Connect authentication frameworks packaged as enterprise NuGet modules.",
                "Developed scalable REST APIs adhering strictly to SOLID, Clean Architecture, Dependency Injection, and CQRS patterns.",
                "Configured HashiCorp Vault secret integration and customized auth workflows to meet stringent financial compliance regulations."
            ],
            tech: [".NET Core", "C#", "HashiCorp Vault", "OAuth2", "OIDC", "Microservices", "SQL Server"]
        },
        {
            company: "Daffodil Software Ltd.",
            role: "Senior Associate IT",
            period: "Apr 2016 - Apr 2021 (5 Years)",
            location: "Gurgaon, India",
            badge: "Award Winner (Project of Year)",
            summary: "Designed serverless healthcare platforms and microservice architectures handling 10,000+ concurrent requests.",
            highlights: [
                "Designed and implemented serverless healthcare architecture using AWS Lambda, Cognito, API Gateway, CloudWatch, and S3, maintaining 99.99% SLA.",
                "Built custom FHIR (Fast Healthcare Interoperability Resources) servers compliant with strict healthcare regulatory standards.",
                "Migrated enterprise standalone services to modern .NET Core, delivering a 40% performance improvement and 50% reduction in maintenance overhead.",
                "Awarded 'Project of the Year' (2017) and 'Process Oriented Award' (2018) for outstanding engineering standards and CI/CD automation."
            ],
            tech: ["AWS Lambda", "AWS Cognito", "API Gateway", "FHIR", ".NET Core", "Docker", "S3", "CloudWatch"]
        },
        {
            company: "Inventra Technologies & EaseMyTrip",
            role: "Software Developer & Web Engineer",
            period: "Aug 2013 - Mar 2016",
            location: "Noida / New Delhi, India",
            badge: "Foundational Scale",
            summary: "Developed high-traffic B2B/BC travel booking engines and optimized database throughput for 100,000+ concurrent users.",
            highlights: [
                "Developed B2B travel booking engine integrated with Amadeus and white-label flight APIs, boosting conversion rates by 20%.",
                "Architected MongoDB document schemas across 100+ collections and tuned SQL queries/stored procedures, decreasing data retrieval latency by 40-50%.",
                "Honored as 'Employee of the Year' (2015) at Inventra Technologies."
            ],
            tech: ["C#", "ASP.NET", "MongoDB", "SQL Server", "API Integration", "High-Volume Travel Systems"]
        }
    ]
};

if (typeof window !== "undefined") {
    window.PORTFOLIO_DATA = PORTFOLIO_DATA;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = PORTFOLIO_DATA;
}
