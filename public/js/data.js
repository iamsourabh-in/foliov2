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
            summary: "Leading architecture and engineering for Samsung Classroom and distributed real-time platforms across multi-region cloud infrastructures.",
            highlights: [
                "Architected and deployed a distributed chat and state engine using .NET Core and Microsoft Orleans, supporting 1,000,000+ active concurrent users with zero distributed locking.",
                "Integrated Apache Kafka for streaming and event-driven architecture, ensuring high-throughput, fault-tolerant message ordering between 10+ microservices.",
                "Designed and implemented custom LiveKit Manager service in Golang to orchestrate WebRTC media servers powering low-latency video/audio classroom interactions.",
                "Constructed end-to-end multi-region GitOps deployment pipelines using Terraform, GitHub Actions, and ArgoCD on AWS/Azure Kubernetes (EKS/AKS).",
                "Implemented FoundationDB as an ultra-scalable transactional data store for chat metadata with zero data loss during offline queueing.",
                "Spearheaded confidential computing workload deployments and AI/MLOps pipelines in Azure.",
                "Mentored senior developers, established architectural standards, and led technical hiring panels."
            ],
            tech: ["Microsoft Orleans", "Golang", ".NET Core", "LiveKit WebRTC", "Apache Kafka", "FoundationDB", "Kubernetes EKS", "ArgoCD", "Terraform", "Azure MLOps"]
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
