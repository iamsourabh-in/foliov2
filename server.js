const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Simulation State for Cluster Telemetry & Portfolio Self-Telemetry
const clusterState = {
    mode: 'normal', // 'normal' | 'spike' | 'chaos_pod' | 'failover'
    activeGrains: 1248000,
    throughput: 14500,
    p99Latency: 11.2,
    activePods: 36,
    totalPods: 36,
    cpuUsage: 48,
    memoryUsage: 62,
    uptime: '99.998%',
    lastIncident: 'Zero downtime in 428 days',
    edgeLatency: 14,
    cacheHit: '98.8%',
    apiResponse: 3.4
};

// Realistic system logs to stream
const logSamples = [
    { level: 'INFO', src: 'samsung-livekit-sfu', msg: 'WebRTC media room [room-sea-894] active. 142 peer tracks muxed with zero jitter.' },
    { level: 'INFO', src: 'orleans-silo-04', msg: 'Grain activation [ClassroomChatGrain-9812] bound to silo-4. Latency: 1.4ms. No lock acquired.' },
    { level: 'INFO', src: 'kafka-broker-02', msg: 'Topic [classroom.chat.fanout] partition-6 committed offset 18492019.' },
    { level: 'INFO', src: 'argocd-controller', msg: 'GitOps sync: revision a91f8c2 matches desired cluster state.' },
    { level: 'INFO', src: 'vault-agent', msg: 'Dynamic database credentials rotated for service [transunion-credit-auth].' },
    { level: 'INFO', src: 'ingress-envoy', msg: 'HTTP/2 stream multiplexing: 14,892 req/s with 0 TLS handshake errors.' },
    { level: 'INFO', src: 'foundationdb-cluster', msg: 'Storage engine transaction commit rate: 28,400 txn/s. Zero conflicts.' },
    { level: 'INFO', src: 'istio-telemetry', msg: 'mTLS mutual auth verified across all namespace boundaries.' }
];

// Profile data
const profileData = {
    name: 'Sourabh Rustagi',
    title: 'Chief Systems Engineer & Cloud-Native Architect',
    location: 'New Delhi, India',
    yearsExp: '13+',
    email: 'sourabh.rustagi@hotmail.com',
    phone: '+918470894772',
    linkedin: 'https://www.linkedin.com/in/sourabhrustagi',
    github: 'https://github.com/iamsourabh-in',
    currentRole: {
        company: 'Samsung R&D Institute India',
        position: 'Chief Engineer',
        period: 'May 2024 - Present',
        summary: 'Leading architecture of Samsung Classroom real-time media & distributed chat engine supporting 1M+ active users.'
    },
    metrics: {
        concurrentUsers: '1,000,000+',
        systemUptime: '99.99%',
        provisioningSpeedup: '80%',
        teamsEmpowered: '10+'
    }
};

// Broadcast telemetry to all connected WebSocket clients
function broadcastTelemetry() {
    let targetGrains = 1248000;
    let targetThroughput = 14500;
    let targetLatency = 11.2;
    let statusLabel = 'HEALTHY';

    if (clusterState.mode === 'spike') {
        targetGrains = 1890000;
        targetThroughput = 94200;
        targetLatency = 24.6;
        clusterState.activePods = 72;
        clusterState.totalPods = 72;
        statusLabel = 'HIGH LOAD (SCALED)';
    } else if (clusterState.mode === 'chaos_pod') {
        targetGrains = 1180000;
        targetThroughput = 12100;
        targetLatency = 38.2;
        clusterState.activePods = 32;
        statusLabel = 'DEGRADED (SELF-HEALING)';
    } else {
        clusterState.activePods = 36;
        clusterState.totalPods = 36;
    }

    clusterState.activeGrains = Math.round(targetGrains + (Math.random() * 8000 - 4000));
    clusterState.throughput = Math.round(targetThroughput + (Math.random() * 400 - 200));
    clusterState.p99Latency = +(targetLatency + (Math.random() * 0.8 - 0.4)).toFixed(2);
    clusterState.edgeLatency = +(14.0 + (Math.random() * 1.2 - 0.6)).toFixed(1);
    clusterState.apiResponse = +(3.4 + (Math.random() * 0.6 - 0.3)).toFixed(1);
    clusterState.cpuUsage = Math.min(95, Math.max(25, Math.round(clusterState.mode === 'spike' ? 78 + Math.random() * 10 : 45 + Math.random() * 8)));
    clusterState.memoryUsage = Math.min(95, Math.max(30, Math.round(clusterState.mode === 'spike' ? 82 + Math.random() * 6 : 58 + Math.random() * 5)));

    const randomLog = logSamples[Math.floor(Math.random() * logSamples.length)];
    const logItem = {
        time: new Date().toISOString().substring(11, 19),
        level: randomLog.level,
        src: randomLog.src,
        msg: randomLog.msg
    };

    const payload = JSON.stringify({
        type: 'telemetry',
        data: {
            ...clusterState,
            status: statusLabel,
            log: logItem
        }
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

// Tick telemetry every 2.5 seconds
setInterval(broadcastTelemetry, 2500);

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
        type: 'init',
        data: {
            profile: profileData,
            cluster: clusterState
        }
    }));

    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message);
            if (parsed.type === 'set_chaos') {
                clusterState.mode = parsed.mode || 'normal';
                broadcastTelemetry();
            }
        } catch (err) {
            console.error('Invalid WS payload', err);
        }
    });
});

// REST API Endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        cluster: clusterState
    });
});

app.get('/api/profile', (req, res) => {
    res.json(profileData);
});

app.get('/api/metrics', (req, res) => {
    res.json(clusterState);
});

// RAG / Contextual Architecture Assistant
app.post('/api/chat', (req, res) => {
    const { message } = req.body || {};
    const q = (message || '').toLowerCase();

    let response = {
        reply: '',
        topic: 'general',
        tags: []
    };

    if (q.includes('orleans') || q.includes('redis') || q.includes('lock') || q.includes('adr-001')) {
        response.reply = `### ADR-001: Microsoft Orleans Virtual Actors vs Distributed Redis Locks

**The Context & Problem**:
During synchronized classroom morning bell transitions at Samsung Classroom, 12,000+ classroom channels attempted simultaneous Redis distributed lock (Redlock) acquisitions for state updates. Redis single-thread latency skyrocketed, starving worker thread pools across downstream .NET API pods and causing cascading timeouts.

**The Architectural Solution**:
We migrated from distributed locking to **Microsoft Orleans Virtual Actors**:
• **Entity Isolation**: Each active classroom channel and user session is an in-memory Grain.
• **Single-Threaded Execution**: Orleans guarantees that each Grain processes messages sequentially, **100% eliminating distributed lock contention**.
• **Persistence**: Asynchronous batch writes to **FoundationDB** ensure state is saved without blocking real-time messaging.

**The Metric**: Lock contention dropped to 0; p99 messaging latency dropped from 185ms to 11.2ms under 1,000,000+ concurrent users.`;
        response.topic = 'orleans-architecture';
        response.tags = ['Microsoft Orleans', 'Zero Locks', 'FoundationDB', '1M Users'];
    } else if (q.includes('postmortem') || q.includes('8942') || q.includes('outage') || q.includes('incident')) {
        response.reply = `### Post-Mortem Forensics: Incident #8942 (SEV-1)

**Incident Summary**: Distributed lock cascade & thread pool starvation under 400k concurrent users.
• **Root Cause**: Coarse Redis distributed locks acquired simultaneously during classroom schedule transitions.
• **Immediate Mitigation**: Engaged ingress circuit breaker to throttle non-essential presence telemetry and flushed contentious lock keys.
• **Long-term Safeguards Built**:
  1. Replaced distributed locks with Orleans virtual actor grain isolation.
  2. Integrated Kafka backpressure buffers in front of all state write sinks.
  3. Instituted automated weekly AWS GameDay chaos injection tests.`;
        response.topic = 'postmortem';
        response.tags = ['SEV-1 Post-Mortem', 'Incident #8942', 'Circuit Breakers'];
    } else if (q.includes('samsung') || q.includes('livekit') || q.includes('sfu') || q.includes('classroom')) {
        response.reply = `### Samsung Classroom Media & SFU Architecture (ADR-003)

As **Chief Engineer at Samsung R&D Institute**, Sourabh architected the core platform for Samsung Classroom:
• **LiveKit SFU Orchestration**: Implemented Go microservices to coordinate LiveKit Selective Forwarding Units (SFUs), avoiding server-side video transcoding and maintaining <45ms latency.
• **Multi-Region GitOps**: Declarative infrastructure provisioning across AWS and Azure regions using **Terraform**, **GitHub Actions**, and **ArgoCD**.
• **Confidential Workloads**: Designed confidential computing execution pipelines in Azure.`;
        response.topic = 'samsung-rnd';
        response.tags = ['LiveKit SFU', 'WebRTC', 'Golang', 'ArgoCD'];
    } else if (q.includes('transunion') || q.includes('flux') || q.includes('vault') || q.includes('gitops')) {
        response.reply = `### TransUnion Enterprise GitOps & Cloud Migration (ADR-004)

At **TransUnion**, Sourabh served as **Lead Engineer / Senior Consultant**:
• **Kubernetes Migration**: Spearheaded cloud migration to **AWS EKS** with service mesh and GitOps using **Flux v2**, reducing rollback incidents by **90%**.
• **Reusable Terraform Modules**: Authored enterprise infrastructure modules adopted by **10+ teams**, reducing provisioning time by **80%**.
• **Dynamic Secrets**: Integrated **HashiCorp Vault** for dynamic DB credential leases and zero hardcoded secrets.`;
        response.topic = 'transunion';
        response.tags = ['Flux v2', 'AWS EKS', 'HashiCorp Vault', 'Terraform'];
    } else if (q.includes('playbook') || q.includes('rubric') || q.includes('interview') || q.includes('mentorship')) {
        response.reply = `### Engineering Leadership Playbooks

Sourabh has codified 13+ years of technical leadership into interactive playbooks:
1. **Staff & Principal System Design Interview Rubric**: 4-tier rubric evaluating capacity planning, domain segregation, concurrency strategies, and failure domains.
2. **SEV-1 Incident Response Checklist**: Triage, emergency mitigation, load shedding, and blameless post-mortem standards.
3. **Enterprise Production PR Review Guidelines**: Concurrency safety, backward compatibility, and telemetry instrumentation.

Click the **Playbook Cards** in the UI to read or copy the full Markdown templates!`;
        response.topic = 'leadership';
        response.tags = ['Playbooks', 'System Design Rubric', 'Incident Response'];
    } else if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone')) {
        response.reply = `### Direct Contact Channels — Sourabh Rustagi

• **Email**: sourabh.rustagi@hotmail.com
• **Phone / WhatsApp**: +91-84708-94772
• **LinkedIn**: [linkedin.com/in/sourabhrustagi](https://www.linkedin.com/in/sourabhrustagi)
• **GitHub**: [github.com/iamsourabh-in](https://github.com/iamsourabh-in)
• **Location**: New Delhi, India

Available for Staff / Principal Systems Architect and Engineering Leadership roles.`;
        response.topic = 'contact';
        response.tags = ['Email', 'LinkedIn', 'Phone'];
    } else {
        response.reply = `Sourabh Rustagi is a **Chief Systems Engineer & Cloud-Native Architect** with 13+ years of experience leading teams and building fault-tolerant distributed platforms (1M+ concurrent users) at Samsung R&D and TransUnion.

Ask me about:
1. **ADR-001**: Why Microsoft Orleans virtual actors over Redis locks
2. **Incident #8942**: Production outage forensics and safeguards
3. **Samsung Classroom**: LiveKit SFU media orchestration
4. **Leadership Playbooks**: Staff System Design Rubric & Incident Response`;
        response.topic = 'overview';
        response.tags = ['Chief Engineer', 'Samsung R&D', 'Architecture'];
    }

    res.json(response);
});

// Also expose /api/ask as alias
app.post('/api/ask', (req, res) => {
    res.redirect(307, '/api/chat');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Sourabh Rustagi - The Live Architecture Playground`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket Edge Telemetry Engine Active`);
    console.log(`======================================================\n`);
});
