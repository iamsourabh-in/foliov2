/**
 * Interactive Distributed Architecture Topology & Chaos Engineering Simulator
 * Renders high-fidelity animated node mesh, packet streams, and self-healing events.
 */

class TopologyMeshVisualizer {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.getElementById(containerId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.nodes = JSON.parse(JSON.stringify(PORTFOLIO_DATA.topology.nodes));
        this.links = PORTFOLIO_DATA.topology.links;
        this.particles = [];
        this.hoveredNode = null;
        this.selectedNode = null;
        this.animId = null;
        this.chaosMode = 'normal'; // 'normal' | 'spike' | 'chaos_pod' | 'failover'
        this.dpr = window.devicePixelRatio || 1;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.setupInteractivity();
        this.initParticles();
        this.startLoop();
    }

    resize() {
        if (!this.canvas || !this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = Math.max(520, rect.height || 560);

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(this.dpr, this.dpr);

        // Adjust node positions responsively based on container dimensions
        this.layoutNodes();
    }

    layoutNodes() {
        const w = this.width;
        const h = this.height;

        // Map layout columns: 4 stages (Ingress -> Processing -> Streaming -> Storage/Governance)
        const col1 = w * 0.14;
        const col2 = w * 0.38;
        const col3 = w * 0.62;
        const col4 = w * 0.86;

        this.nodes.forEach(node => {
            switch(node.id) {
                case 'ingress':
                    node.currentX = col1;
                    node.currentY = h * 0.48;
                    break;
                case 'livekit':
                    node.currentX = col2;
                    node.currentY = h * 0.26;
                    break;
                case 'orleans':
                    node.currentX = col2;
                    node.currentY = h * 0.70;
                    break;
                case 'kafka':
                    node.currentX = col3;
                    node.currentY = h * 0.48;
                    break;
                case 'foundationdb':
                    node.currentX = col4;
                    node.currentY = h * 0.28;
                    break;
                case 'argocd':
                    node.currentX = col4;
                    node.currentY = h * 0.72;
                    break;
                case 'vault':
                    node.currentX = col3;
                    node.currentY = h * 0.82;
                    break;
            }
            node.width = Math.min(180, Math.max(140, w * 0.18));
            node.height = 70;
        });
    }

    initParticles() {
        this.particles = [];
        const count = this.chaosMode === 'spike' ? 70 : 35;

        for (let i = 0; i < count; i++) {
            const link = this.links[Math.floor(Math.random() * this.links.length)];
            this.particles.push({
                link: link,
                t: Math.random(),
                speed: 0.003 + Math.random() * 0.005,
                size: 2.5 + Math.random() * 2,
                color: '#38bdf8'
            });
        }
    }

    setupInteractivity() {
        const getCanvasCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        this.canvas.addEventListener('mousemove', (e) => {
            const { x, y } = getCanvasCoords(e);
            let hit = null;

            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const n = this.nodes[i];
                if (x >= n.currentX - n.width/2 && x <= n.currentX + n.width/2 &&
                    y >= n.currentY - n.height/2 && y <= n.currentY + n.height/2) {
                    hit = n;
                    break;
                }
            }

            if (hit !== this.hoveredNode) {
                this.hoveredNode = hit;
                this.canvas.style.cursor = hit ? 'pointer' : 'default';
                if (hit && window.appSynth) window.appSynth.playHover();
            }
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.hoveredNode) {
                this.openBlueprintModal(this.hoveredNode);
                if (window.appSynth) window.appSynth.playClick();
            }
        });
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
        // Particle speed multipliers based on chaos
        let speedMult = 1.0;
        if (this.chaosMode === 'spike') speedMult = 2.8;
        if (this.chaosMode === 'chaos_pod') speedMult = 0.8;

        this.particles.forEach(p => {
            p.t += p.speed * speedMult;
            if (p.t > 1) {
                p.t = 0;
                // Switch link randomly for dynamic flow
                p.link = this.links[Math.floor(Math.random() * this.links.length)];
            }
        });
    }

    getNodeById(id) {
        return this.nodes.find(n => n.id === id);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw subtle background grid
        this.drawBackgroundGrid();

        // 2. Draw connections (links)
        this.drawLinks();

        // 3. Draw streaming data packets
        this.drawParticles();

        // 4. Draw nodes
        this.drawNodes();
    }

    drawBackgroundGrid() {
        const ctx = this.ctx;
        const step = 40;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
            const fromNode = this.getNodeById(link.from);
            const toNode = this.getNodeById(link.to);
            if (!fromNode || !toNode) return;

            ctx.save();
            ctx.beginPath();
            
            // Curved cubic bezier connection
            const cp1x = fromNode.currentX + (toNode.currentX - fromNode.currentX) * 0.5;
            const cp1y = fromNode.currentY;
            const cp2x = fromNode.currentX + (toNode.currentX - fromNode.currentX) * 0.5;
            const cp2y = toNode.currentY;

            ctx.moveTo(fromNode.currentX, fromNode.currentY);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toNode.currentX, toNode.currentY);

            const isHighActivity = this.chaosMode === 'spike';
            ctx.strokeStyle = isHighActivity ? 'rgba(56, 189, 248, 0.45)' : 'rgba(148, 163, 184, 0.18)';
            ctx.lineWidth = isHighActivity ? 2 : 1.5;
            ctx.stroke();

            ctx.restore();
        });
    }

    drawParticles() {
        const ctx = this.ctx;

        this.particles.forEach(p => {
            const fromNode = this.getNodeById(p.link.from);
            const toNode = this.getNodeById(p.link.to);
            if (!fromNode || !toNode) return;

            const cp1x = fromNode.currentX + (toNode.currentX - fromNode.currentX) * 0.5;
            const cp1y = fromNode.currentY;
            const cp2x = fromNode.currentX + (toNode.currentX - fromNode.currentX) * 0.5;
            const cp2y = toNode.currentY;

            // Compute point on cubic bezier at parameter t
            const t = p.t;
            const cx = Math.pow(1 - t, 3) * fromNode.currentX +
                       3 * Math.pow(1 - t, 2) * t * cp1x +
                       3 * (1 - t) * Math.pow(t, 2) * cp2x +
                       Math.pow(t, 3) * toNode.currentX;
            const cy = Math.pow(1 - t, 3) * fromNode.currentY +
                       3 * Math.pow(1 - t, 2) * t * cp1y +
                       3 * (1 - t) * Math.pow(t, 2) * cp2y +
                       Math.pow(t, 3) * toNode.currentY;

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.chaosMode === 'spike' ? '#f59e0b' : '#38bdf8';
            ctx.shadowColor = this.chaosMode === 'spike' ? '#f59e0b' : '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        });
    }

    drawNodes() {
        const ctx = this.ctx;

        this.nodes.forEach(node => {
            const isHovered = this.hoveredNode === node;
            const isFailed = (this.chaosMode === 'chaos_pod' && node.id === 'orleans');
            const isSpiked = (this.chaosMode === 'spike' && (node.id === 'orleans' || node.id === 'kafka'));

            ctx.save();

            const x = node.currentX - node.width / 2;
            const y = node.currentY - node.height / 2;
            const w = node.width;
            const h = node.height;
            const r = 10;

            // Glowing aura on hover or spike
            if (isHovered || isSpiked) {
                ctx.shadowColor = isSpiked ? '#f59e0b' : '#38bdf8';
                ctx.shadowBlur = isSpiked ? 22 : 16;
            } else if (isFailed) {
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 25;
            }

            // Draw Node Card Body
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fillStyle = isFailed ? 'rgba(35, 10, 15, 0.92)' : 'rgba(15, 23, 42, 0.88)';
            ctx.fill();

            // Border
            ctx.lineWidth = isHovered ? 2 : 1;
            if (isFailed) {
                ctx.strokeStyle = '#ef4444';
            } else if (isSpiked) {
                ctx.strokeStyle = '#f59e0b';
            } else if (isHovered) {
                ctx.strokeStyle = '#38bdf8';
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            }
            ctx.stroke();

            // Status Indicator Dot
            const dotX = x + 16;
            const dotY = y + 20;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = isFailed ? '#ef4444' : (isSpiked ? '#f59e0b' : '#10b981');
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6;
            ctx.fill();

            // Node Name
            ctx.shadowBlur = 0;
            ctx.font = '600 13px Inter, -apple-system, sans-serif';
            ctx.fillStyle = isFailed ? '#fca5a5' : '#f8fafc';
            ctx.fillText(node.name, x + 28, y + 24);

            // Tech Stack Badge
            ctx.font = '500 11px JetBrains Mono, monospace';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(node.tech, x + 16, y + 43);

            // Metrics row: Latency & Throughput
            ctx.font = '500 10px JetBrains Mono, monospace';
            ctx.fillStyle = isFailed ? '#ef4444' : '#38bdf8';
            const statText = isFailed ? 'STATUS: RE-ROUTING...' : `${node.latency} | ${node.throughput}`;
            ctx.fillText(statText, x + 16, y + 59);

            ctx.restore();
        });
    }

    // Trigger Chaos Modes
    setChaosMode(mode) {
        this.chaosMode = mode;
        this.initParticles();

        if (mode === 'chaos_pod') {
            const orleansNode = this.getNodeById('orleans');
            if (orleansNode) orleansNode.status = 're-routing';
            // Auto heal after 4.5 seconds
            setTimeout(() => {
                this.setChaosMode('normal');
                if (window.showSystemToast) {
                    window.showSystemToast('Kubernetes ReplicaSet auto-healed Orleans silo. 0 dropped packets.', 'success');
                }
            }, 4500);
        } else if (mode === 'spike') {
            if (window.showSystemToast) {
                window.showSystemToast('Simulated 1,000,000 req/s load spike! HPA scaling pods from 36 to 72.', 'warning');
            }
        } else {
            if (window.showSystemToast) {
                window.showSystemToast('System restored to nominal operating state.', 'info');
            }
        }
    }

    // Open Architectural Blueprint Deep-Dive Modal
    openBlueprintModal(node) {
        const modal = document.getElementById('blueprint-modal');
        if (!modal) return;

        document.getElementById('blueprint-node-title').textContent = `${node.name} — Architecture Blueprint`;
        document.getElementById('blueprint-tech-tag').textContent = node.tech;
        document.getElementById('blueprint-challenge').textContent = node.caseStudy.challenge;
        document.getElementById('blueprint-solution').textContent = node.caseStudy.solution;
        document.getElementById('blueprint-tradeoffs').textContent = node.caseStudy.tradeoffs;
        
        const codeElem = document.getElementById('blueprint-code');
        if (codeElem) codeElem.textContent = node.caseStudy.codeSnippet;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

window.TopologyMeshVisualizer = TopologyMeshVisualizer;
