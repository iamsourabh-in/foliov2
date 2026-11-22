/**
 * Live Architecture Playground & Interactive Load Simulator Canvas
 * Renders an Excalidraw/Datadog-grade distributed system diagram across the full stage.
 */

class ArchitecturePlayground {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.getElementById(containerId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        this.currentRps = 100;
        this.particles = [];
        this.hoveredItem = null;
        this.animId = null;

        // Base nodes topology with ADR pins
        this.baseNodes = [
            {
                id: 'ingress',
                name: 'Envoy / API Gateway',
                tier: 'Edge Ingress',
                tech: 'Golang / HTTP/2 & WSS',
                col: 0.12,
                row: 0.50,
                basePods: 2,
                icon: 'fas fa-shield-halved'
            },
            {
                id: 'livekit',
                name: 'LiveKit SFU Cluster',
                tier: 'Real-Time Media',
                tech: 'WebRTC / Golang',
                col: 0.36,
                row: 0.28,
                basePods: 4,
                icon: 'fas fa-video',
                adrId: 'ADR-003'
            },
            {
                id: 'orleans',
                name: 'Orleans Virtual Actor Mesh',
                tier: 'Stateful Compute',
                tech: '.NET Core 8 / Orleans',
                col: 0.36,
                row: 0.72,
                basePods: 4,
                icon: 'fas fa-cubes',
                adrId: 'ADR-001'
            },
            {
                id: 'kafka',
                name: 'Kafka Event Backbone',
                tier: 'Streaming Pipeline',
                tech: 'Apache Kafka (16 Partitions)',
                col: 0.62,
                row: 0.50,
                basePods: 3,
                icon: 'fas fa-stream'
            },
            {
                id: 'redis',
                name: 'Redis Cache Cluster',
                tier: 'In-Memory Cache',
                tech: 'Redis 7.2 Cluster',
                col: 0.62,
                row: 0.20,
                basePods: 3,
                icon: 'fas fa-bolt'
            },
            {
                id: 'foundationdb',
                name: 'FoundationDB ACID Store',
                tier: 'Transaction Sink',
                tech: 'FoundationDB (SSD NVMe)',
                col: 0.88,
                row: 0.72,
                basePods: 6,
                icon: 'fas fa-database',
                adrId: 'ADR-002'
            },
            {
                id: 'argocd',
                name: 'ArgoCD / GitOps Mesh',
                tier: 'Governance CI/CD',
                tech: 'ArgoCD / Flux v2 / Terraform',
                col: 0.88,
                row: 0.28,
                basePods: 2,
                icon: 'fas fa-code-branch',
                adrId: 'ADR-004'
            }
        ];

        this.links = [
            { from: 'ingress', to: 'livekit', label: 'WebRTC Signaling' },
            { from: 'ingress', to: 'orleans', label: 'WebSocket Grains' },
            { from: 'orleans', to: 'redis', label: 'Hot Cache Read' },
            { from: 'orleans', to: 'kafka', label: 'Event Fan-out' },
            { from: 'livekit', to: 'kafka', label: 'Room Telemetry' },
            { from: 'kafka', to: 'foundationdb', label: 'Transactional Sync' },
            { from: 'argocd', to: 'orleans', label: 'Canary Rollout' },
            { from: 'argocd', to: 'ingress', label: 'Config Sync' }
        ];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupEventListeners();
        this.initParticles();
        this.startLoop();
    }

    resize() {
        if (!this.canvas || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = Math.max(480, Math.min(580, rect.height || 520));

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(this.dpr, this.dpr);
        this.layoutNodes();
    }

    layoutNodes() {
        const isMobile = this.width < 800;

        this.baseNodes.forEach(node => {
            if (isMobile) {
                node.x = this.width * (node.col * 0.86 + 0.07);
                node.y = this.height * node.row;
                node.width = Math.min(140, this.width * 0.26);
                node.height = 58;
            } else {
                node.x = this.width * node.col;
                node.y = this.height * node.row;
                node.width = Math.min(190, Math.max(145, this.width * 0.16));
                node.height = 68;
            }

            if (node.adrId) {
                node.adrPin = {
                    x: node.x + node.width / 2 - 10,
                    y: node.y - node.height / 2 - 8,
                    radius: 12,
                    adrId: node.adrId
                };
            }
        });
    }

    initParticles() {
        this.particles = [];
        let count = 25;
        if (this.currentRps >= 5000) count = 45;
        if (this.currentRps >= 25000) count = 75;
        if (this.currentRps >= 100000) count = 120;

        for (let i = 0; i < count; i++) {
            const link = this.links[Math.floor(Math.random() * this.links.length)];
            this.particles.push({
                link: link,
                t: Math.random(),
                speed: 0.003 + Math.random() * 0.004,
                size: 2.2 + Math.random() * 1.6,
                color: this.currentRps >= 100000 ? '#f59e0b' : '#38bdf8'
            });
        }
    }

    setRps(rps) {
        this.currentRps = Number(rps);
        this.initParticles();
        this.updateStatsHud();

        if (window.appSynth) {
            if (this.currentRps >= 100000) window.appSynth.playTone(880, 'sawtooth', 0.08, 0.04);
            else window.appSynth.playClick();
        }
    }

    updateStatsHud() {
        const stage = PORTFOLIO_DATA.caseStudies[0].loadStages[this.currentRps] || PORTFOLIO_DATA.caseStudies[0].loadStages[100];
        
        const rpsLabelElem = document.getElementById('hud-rps-label');
        const latencyElem = document.getElementById('hud-latency');
        const podsElem = document.getElementById('hud-pods');
        const cacheElem = document.getElementById('hud-cache-hit');
        const descElem = document.getElementById('hud-stage-desc');
        const bottleneckElem = document.getElementById('hud-bottleneck');

        if (rpsLabelElem) rpsLabelElem.textContent = stage.rpsLabel;
        if (latencyElem) latencyElem.textContent = stage.p99Latency;
        if (podsElem) podsElem.textContent = `${stage.activePods} Pods (Auto-Scaled)`;
        if (cacheElem) cacheElem.textContent = stage.cacheHitRate;
        if (descElem) descElem.textContent = stage.description;
        if (bottleneckElem) bottleneckElem.textContent = stage.bottleneck;
    }

    setupEventListeners() {
        const getCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const handleMove = (e) => {
            const { x, y } = getCoords(e);
            let hit = null;

            // Check ADR pins first
            for (const node of this.baseNodes) {
                if (node.adrPin) {
                    const dx = x - node.adrPin.x;
                    const dy = y - node.adrPin.y;
                    if (Math.sqrt(dx * dx + dy * dy) <= node.adrPin.radius + 6) {
                        hit = { type: 'adr', data: node.adrPin };
                        break;
                    }
                }
            }

            // Check node cards
            if (!hit) {
                for (let i = this.baseNodes.length - 1; i >= 0; i--) {
                    const n = this.baseNodes[i];
                    if (x >= n.x - n.width/2 && x <= n.x + n.width/2 &&
                        y >= n.y - n.height/2 && y <= n.y + n.height/2) {
                        hit = { type: 'node', data: n };
                        break;
                    }
                }
            }

            if (hit !== this.hoveredItem) {
                this.hoveredItem = hit;
                this.canvas.style.cursor = hit ? 'pointer' : 'default';
                if (hit && window.appSynth) window.appSynth.playHover();
            }
        };

        const handleClick = (e) => {
            if (this.hoveredItem) {
                if (this.hoveredItem.type === 'adr') {
                    window.openAdrModal(this.hoveredItem.data.adrId);
                } else if (this.hoveredItem.type === 'node') {
                    if (this.hoveredItem.data.adrId) {
                        window.openAdrModal(this.hoveredItem.data.adrId);
                    } else {
                        window.showSystemToast(`Inspecting ${this.hoveredItem.data.name} (${this.hoveredItem.data.tech})`, 'info');
                    }
                }
                if (window.appSynth) window.appSynth.playClick();
            }
        };

        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('click', handleClick);
        this.canvas.addEventListener('touchstart', handleMove, { passive: true });
        this.canvas.addEventListener('touchend', handleClick);
    }

    getNodeById(id) {
        return this.baseNodes.find(n => n.id === id);
    }

    startLoop() {
        let lastTime = performance.now();
        const render = (time) => {
            const dt = time - lastTime;
            lastTime = time;

            this.update(dt);
            this.draw();

            this.animId = requestAnimationFrame(render);
        };
        this.animId = requestAnimationFrame(render);
    }

    update(dt) {
        let speedMult = 1.0;
        if (this.currentRps >= 5000) speedMult = 1.6;
        if (this.currentRps >= 25000) speedMult = 2.4;
        if (this.currentRps >= 100000) speedMult = 3.6;

        this.particles.forEach(p => {
            p.t += p.speed * speedMult;
            if (p.t > 1) {
                p.t = 0;
                p.link = this.links[Math.floor(Math.random() * this.links.length)];
            }
        });
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Technical Grid
        this.drawTechnicalGrid();

        // 2. Links
        this.drawLinks();

        // 3. Particles
        this.drawParticles();

        // 4. Nodes
        this.drawNodes();
    }

    drawTechnicalGrid() {
        const ctx = this.ctx;
        const step = 40;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
    }

    drawLinks() {
        const ctx = this.ctx;

        this.links.forEach(link => {
            const from = this.getNodeById(link.from);
            const to = this.getNodeById(link.to);
            if (!from || !to) return;

            const isHot = (this.currentRps >= 25000 && (link.from === 'orleans' || link.to === 'kafka' || link.to === 'foundationdb'));

            ctx.save();
            ctx.beginPath();
            const cp1x = from.x + (to.x - from.x) * 0.5;
            const cp1y = from.y;
            const cp2x = from.x + (to.x - from.x) * 0.5;
            const cp2y = to.y;

            ctx.moveTo(from.x, from.y);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);

            ctx.strokeStyle = isHot ? 'rgba(245, 158, 11, 0.4)' : 'rgba(148, 163, 184, 0.14)';
            ctx.lineWidth = isHot ? 2 : 1.2;
            ctx.stroke();
            ctx.restore();
        });
    }

    drawParticles() {
        const ctx = this.ctx;

        this.particles.forEach(p => {
            const from = this.getNodeById(p.link.from);
            const to = this.getNodeById(p.link.to);
            if (!from || !to) return;

            const cp1x = from.x + (to.x - from.x) * 0.5;
            const cp1y = from.y;
            const cp2x = from.x + (to.x - from.x) * 0.5;
            const cp2y = to.y;

            const t = p.t;
            const cx = Math.pow(1 - t, 3) * from.x +
                       3 * Math.pow(1 - t, 2) * t * cp1x +
                       3 * (1 - t) * Math.pow(t, 2) * cp2x +
                       Math.pow(t, 3) * to.x;
            const cy = Math.pow(1 - t, 3) * from.y +
                       3 * Math.pow(1 - t, 2) * t * cp1y +
                       3 * (1 - t) * Math.pow(t, 2) * cp2y +
                       Math.pow(t, 3) * to.y;

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.currentRps >= 100000 ? '#f59e0b' : '#38bdf8';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = this.currentRps >= 100000 ? 10 : 5;
            ctx.fill();
            ctx.restore();
        });
    }

    drawNodes() {
        const ctx = this.ctx;

        this.baseNodes.forEach(node => {
            const isHovered = this.hoveredItem && this.hoveredItem.type === 'node' && this.hoveredItem.data === node;
            const isUnderLoad = this.currentRps >= 25000 && (node.id === 'orleans' || node.id === 'kafka' || node.id === 'foundationdb');
            const isPeak = this.currentRps >= 100000;

            const x = node.x - node.width / 2;
            const y = node.y - node.height / 2;
            const w = node.width;
            const h = node.height;
            const r = 10;

            ctx.save();

            // Glow on hover or peak load
            if (isHovered || isPeak) {
                ctx.shadowColor = isPeak ? 'rgba(245, 158, 11, 0.35)' : 'rgba(56, 189, 248, 0.3)';
                ctx.shadowBlur = 18;
            }

            // Card Body Fill
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fillStyle = isUnderLoad ? 'rgba(18, 24, 38, 0.95)' : 'rgba(13, 17, 28, 0.92)';
            ctx.fill();

            // Border
            ctx.lineWidth = isHovered ? 2 : 1;
            if (isPeak && isUnderLoad) {
                ctx.strokeStyle = '#f59e0b';
            } else if (isHovered) {
                ctx.strokeStyle = '#38bdf8';
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            }
            ctx.stroke();

            // Status Dot
            ctx.beginPath();
            ctx.arc(x + 16, y + 18, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = isPeak ? '#f59e0b' : '#10b981';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6;
            ctx.fill();

            // Node Name
            ctx.shadowBlur = 0;
            ctx.font = '600 13px Inter, sans-serif';
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(node.name, x + 26, y + 22);

            // Tech Subtext
            ctx.font = '500 10.5px JetBrains Mono, monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(node.tech, x + 14, y + 42);

            // Tier Label
            ctx.font = '500 9.5px JetBrains Mono, monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(`TIER: ${node.tier}`, x + 14, y + 58);

            // "WHY?" ADR Pin Badge
            if (node.adrPin) {
                const pin = node.adrPin;
                const isPinHovered = this.hoveredItem && this.hoveredItem.type === 'adr' && this.hoveredItem.data === pin;

                ctx.save();
                ctx.beginPath();
                ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
                ctx.fillStyle = isPinHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.16)';
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = isPinHovered ? 12 : 5;
                ctx.fill();
                ctx.stroke();

                ctx.font = '700 9px JetBrains Mono, monospace';
                ctx.fillStyle = isPinHovered ? '#07090e' : '#38bdf8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('WHY?', pin.x, pin.y);
                ctx.restore();
            }

            ctx.restore();
        });
    }
}

window.ArchitecturePlayground = ArchitecturePlayground;
