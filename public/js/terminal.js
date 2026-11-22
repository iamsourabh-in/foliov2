/**
 * Minimal, Fast-Loading DevSecOps Terminal Emulator
 * Synchronized with the Live Architecture Canvas, ADR Engine, and Load Simulator.
 */

class InteractiveTerminal {
    constructor(outputId, inputId) {
        this.outputElem = document.getElementById(outputId);
        this.inputElem = document.getElementById(inputId);
        this.history = [];
        this.historyIndex = -1;

        this.commands = {
            'help': 'Display list of all interactive commands.',
            'whoami': 'Print identity, current role, and core credentials.',
            'arch-3d': 'Launch interactive 3D Architecture Visualizer & Node Inspector.',
            'inspect --scale': 'Inspect active cluster scale, active silos, and p99 latency.',
            'cat architecture-philosophy.md': 'Read core engineering and distributed systems philosophy.',
            'load-sim <rps>': 'Simulate traffic load on architecture canvas (e.g. load-sim 100000).',
            'adr list': 'List all Architecture Decision Records (The "Why?" pins).',
            'adr view <id>': 'Inspect specific ADR (e.g. adr view ADR-001).',
            'postmortem': 'Read SEV-1 production incident post-mortem (Incident #8942).',
            'playbooks': 'List engineering leadership templates and rubrics.',
            'kubectl get pods': 'Simulate Kubernetes cluster pod status across namespaces.',
            'telemetry': 'Inspect live portfolio system telemetry (edge latency, cache hit ratio).',
            'clear': 'Clear terminal screen.'
        };

        if (this.inputElem) {
            this.setupListeners();
        }
    }

    setupListeners() {
        this.inputElem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.inputElem.value.trim();
                if (cmd) {
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    this.execute(cmd);
                }
                this.inputElem.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputElem.value = this.history[this.historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputElem.value = this.history[this.historyIndex] || '';
                } else {
                    this.historyIndex = this.history.length;
                    this.inputElem.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoComplete();
            }
        });
    }

    autoComplete() {
        const val = this.inputElem.value.trim();
        if (!val) return;
        const keys = Object.keys(this.commands);
        const matches = keys.filter(c => c.startsWith(val));
        if (matches.length === 1) {
            this.inputElem.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            this.printLine(`<span class="text-muted">Suggestions: ${matches.join('  ')}</span>`);
        }
    }

    printLine(html) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = html;
        this.outputElem.appendChild(line);
        this.outputElem.scrollTop = this.outputElem.scrollHeight;
    }

    execute(cmdStr) {
        this.printLine(`<div class="terminal-cmd-echo"><span class="terminal-prompt-user">sourabh@arch-control:~$</span> <span class="terminal-cmd-text">${this.escapeHtml(cmdStr)}</span></div>`);

        const parts = cmdStr.split(/\s+/);
        const baseCmd = parts[0].toLowerCase();
        const arg1 = parts[1] ? parts[1].toLowerCase() : '';
        const arg2 = parts[2] ? parts[2].toLowerCase() : '';

        if (window.appSynth) window.appSynth.playClick();

        if (cmdStr === 'cat architecture-philosophy.md') {
            this.cmdCatArch();
            return;
        }

        if (cmdStr.startsWith('inspect --scale') || (baseCmd === 'inspect' && arg1 === '--scale')) {
            this.cmdInspectScale();
            return;
        }

        if (baseCmd === 'load-sim') {
            this.cmdLoadSim(arg1);
            return;
        }

        if (baseCmd === 'adr') {
            if (arg1 === 'list' || !arg1) {
                this.cmdAdrList();
            } else if (arg1 === 'view' && arg2) {
                this.cmdAdrView(arg2.toUpperCase());
            } else {
                this.printLine(`<span class="text-yellow">Usage: adr list | adr view <id> (e.g. adr view ADR-001)</span>`);
            }
            return;
        }

        switch (baseCmd) {
            case 'help':
                this.cmdHelp();
                break;
            case '3d':
            case 'arch-3d':
                this.printLine(`<span class="text-cyan font-bold"><i class="fas fa-cube"></i> Launching Full-Screen 3D Architecture Visualizer...</span>`);
                if (window.open3DArchModal) window.open3DArchModal(arg1 || 'samsung-agentic');
                break;
            case 'whoami':
                this.cmdWhoami();
                break;
            case 'postmortem':
                this.cmdPostMortem();
                break;
            case 'playbooks':
                this.cmdPlaybooks();
                break;
            case 'kubectl':
                this.cmdKubectl(parts.slice(1));
                break;
            case 'telemetry':
                this.cmdTelemetry();
                break;
            case 'clear':
                this.outputElem.innerHTML = '';
                break;
            default:
                this.printLine(`<span class="text-red">command not found: ${this.escapeHtml(baseCmd)}. Type <strong class="text-cyan">help</strong> for available commands.</span>`);
        }
    }

    cmdHelp() {
        let out = `<div class="terminal-box"><div class="text-gold font-bold mb-1">=== SYSTEM COMMAND LIST ===</div>`;
        for (const [cmd, desc] of Object.entries(this.commands)) {
            out += `<div><span class="text-cyan font-bold" style="display:inline-block; width:220px;">${cmd}</span> <span class="text-gray">${desc}</span></div>`;
        }
        out += `</div>`;
        this.printLine(out);
    }

    cmdWhoami() {
        const p = PORTFOLIO_DATA.profile;
        this.printLine(`
<div class="terminal-box">
<div><strong class="text-cyan">${p.name}</strong> — <span class="text-gold">${p.title}</span></div>
<div class="text-gray">${p.currentRole}</div>
<div class="text-muted mt-1">${p.tagline}</div>
<div class="mt-1">Experience: <strong class="text-green">${p.experienceYears}</strong> | Location: <strong>${p.location}</strong></div>
<div>Contact: <a href="mailto:${p.email}" class="text-cyan">${p.email}</a> | <a href="${p.linkedin}" target="_blank" class="text-cyan">LinkedIn</a> | <a href="${p.github}" target="_blank" class="text-cyan">GitHub</a></div>
</div>`);
    }

    cmdCatArch() {
        this.printLine(`
<div class="terminal-box">
<div class="text-gold font-bold"># Core Engineering Philosophy — Sourabh Rustagi</div>
<p class="text-gray mt-1">1. <strong>Resilience Over Perfection</strong>: Systems will degrade. The hallmark of senior architecture is automated self-healing, deterministic backpressure (Kafka), and zero distributed locking.</p>
<p class="text-gray">2. <strong>Entity Isolation via Virtual Actors</strong>: Coarse distributed locks (Redlock) become systemic bottlenecks at 500k+ concurrency. State should live in single-threaded grains (Orleans).</p>
<p class="text-gray">3. <strong>Immutable Declarative GitOps</strong>: No manual production SSH or kubectl edits. 100% of infrastructure and deployments flow through versioned Git pull requests.</p>
<p class="text-gray">4. <strong>Measurable Multiplier Effect</strong>: Code matters, but architectural playbooks, blameless post-mortems, and engineering rubrics protect teams from repeating failures.</p>
</div>`);
    }

    cmdInspectScale() {
        const rps = window.archPlayground ? window.archPlayground.currentRps : 100;
        const stage = PORTFOLIO_DATA.caseStudies[0].loadStages[rps] || PORTFOLIO_DATA.caseStudies[0].loadStages[100];
        this.printLine(`
<div class="terminal-box">
<div class="text-gold font-bold">=== CLUSTER SCALE METRICS (${stage.rpsLabel}) ===</div>
<div>Active Pods: <span class="text-cyan font-bold">${stage.activePods}</span></div>
<div>P99 Latency: <span class="text-green font-bold">${stage.p99Latency}</span></div>
<div>Cache Hit Rate: <span class="text-purple font-bold">${stage.cacheHitRate}</span></div>
<div>Active Bottleneck: <span class="text-yellow">${stage.bottleneck}</span></div>
<div class="text-muted mt-1">To change load, run: <span class="text-cyan">load-sim [100|5000|25000|100000]</span> or use the UI slider on the right canvas.</div>
</div>`);
    }

    cmdLoadSim(val) {
        const targetRps = Number(val);
        const valid = [100, 5000, 25000, 100000];
        if (!valid.includes(targetRps)) {
            this.printLine(`<span class="text-yellow">Invalid RPS. Choose one of: load-sim 100 | load-sim 5000 | load-sim 25000 | load-sim 100000</span>`);
            return;
        }

        if (window.archPlayground) {
            window.archPlayground.setRps(targetRps);
            const slider = document.getElementById('rps-load-slider');
            if (slider) slider.value = targetRps;
        }

        const stage = PORTFOLIO_DATA.caseStudies[0].loadStages[targetRps];
        this.printLine(`<span class="text-green">✔ Traffic scaled to ${stage.rpsLabel}. Canvas updated dynamically!</span>`);
        this.printLine(`<div class="text-muted">${stage.description}</div>`);
    }

    cmdAdrList() {
        let out = `<div class="terminal-box"><div class="text-gold font-bold mb-1">=== ARCHITECTURE DECISION RECORDS (ADRs) ===</div>`;
        PORTFOLIO_DATA.adrs.forEach(adr => {
            out += `<div><span class="text-cyan font-bold" style="display:inline-block; width:90px;">${adr.id}</span> <span class="text-gray">${adr.title}</span></div>`;
        });
        out += `<div class="text-muted mt-1">Run <span class="text-cyan">adr view &lt;id&gt;</span> to inspect full decision record.</div></div>`;
        this.printLine(out);
    }

    cmdAdrView(id) {
        const adr = PORTFOLIO_DATA.adrs.find(a => a.id === id);
        if (!adr) {
            this.printLine(`<span class="text-red">ADR '${id}' not found. Run 'adr list' to see available records.</span>`);
            return;
        }
        window.openAdrModal(id);
        this.printLine(`
<div class="terminal-box">
<div class="text-gold font-bold">[${adr.id}] ${adr.title}</div>
<div class="text-green font-bold">STATUS: ${adr.status}</div>
<p class="text-gray mt-1"><strong>Context:</strong> ${adr.context}</p>
<p class="text-gray"><strong>Decision:</strong> ${adr.decision}</p>
<p class="text-cyan"><strong>Trade-offs:</strong> ${adr.tradeoffs}</p>
<p class="text-purple"><strong>Metrics:</strong> ${adr.metrics}</p>
</div>`);
    }

    cmdPostMortem() {
        window.openPostMortemModal();
        const pm = PORTFOLIO_DATA.postMortem;
        this.printLine(`
<div class="terminal-box">
<div class="text-red font-bold">=== POST-MORTEM: ${pm.id} (${pm.severity}) ===</div>
<div class="text-gray font-bold">${pm.title}</div>
<p class="text-muted mt-1"><strong>Impact:</strong> ${pm.impact}</p>
<p class="text-gray"><strong>Root Cause:</strong> ${pm.rootCause}</p>
<p class="text-green"><strong>Mitigation:</strong> ${pm.immediateMitigation}</p>
<div class="text-gold mt-1">Opened visual post-mortem modal with safeguards and timeline.</div>
</div>`);
    }

    cmdPlaybooks() {
        let out = `<div class="terminal-box"><div class="text-gold font-bold mb-1">=== ENGINEERING LEADERSHIP PLAYBOOKS ===</div>`;
        PORTFOLIO_DATA.playbooks.forEach(pb => {
            out += `<div><span class="text-cyan font-bold">${pb.title}</span> — <span class="text-muted">${pb.targetAudience}</span></div>`;
        });
        out += `<div class="text-muted mt-1">Click any playbook card in the leadership section to read or copy markdown.</div></div>`;
        this.printLine(out);
    }

    cmdKubectl(args) {
        const sub = args[0] ? args[0].toLowerCase() : '';
        const target = args[1] ? args[1].toLowerCase() : '';

        if (sub === 'get' && (target === 'pods' || target === 'po')) {
            const out = `
<div class="terminal-table">
<div class="text-muted font-bold">NAMESPACE           NAME                                  READY   STATUS    RESTARTS   AGE</div>
<div><span class="text-purple">samsung-classroom</span>   orleans-actor-silo-0                  1/1     <span class="text-green">Running</span>   0          42d</div>
<div><span class="text-purple">samsung-classroom</span>   orleans-actor-silo-1                  1/1     <span class="text-green">Running</span>   0          42d</div>
<div><span class="text-purple">samsung-classroom</span>   livekit-sfu-ingress-7b49              1/1     <span class="text-green">Running</span>   0          18d</div>
<div><span class="text-blue">streaming</span>           kafka-broker-cluster-0                1/1     <span class="text-green">Running</span>   0          94d</div>
<div><span class="text-blue">storage</span>             foundationdb-storage-node-2           1/1     <span class="text-green">Running</span>   0          94d</div>
<div><span class="text-gold">gitops</span>              argocd-application-controller         1/1     <span class="text-green">Running</span>   0          120d</div>
<div><span class="text-gold">security</span>            vault-server-0                        1/1     <span class="text-green">Running</span>   0          180d</div>
</div>`;
            this.printLine(out);
        } else {
            this.printLine(`<span class="text-yellow">Usage: kubectl get pods</span>`);
        }
    }

    cmdTelemetry() {
        const t = PORTFOLIO_DATA.selfTelemetry;
        this.printLine(`
<div class="terminal-box">
<div class="text-gold font-bold">=== PORTFOLIO PLATFORM TELEMETRY ===</div>
<div>Edge Latency: <span class="text-cyan font-bold">${t.edgeLatencyMs}ms</span></div>
<div>Cache Hit Ratio: <span class="text-green font-bold">${t.cacheHitRatio}</span></div>
<div>API Response Time: <span class="text-purple font-bold">${t.apiResponseTimeMs}ms</span></div>
<div>Production Uptime: <span class="text-green font-bold">${t.uptime}</span></div>
<div>Bundle Size: <span class="text-cyan font-bold">${t.bundleSizeKb} KB (Zero-Bloat Vanilla)</span></div>
</div>`);
    }

    escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

window.InteractiveTerminal = InteractiveTerminal;
