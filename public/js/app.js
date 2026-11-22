/**
 * Main Application Coordinator
 * Powers The Live Architecture Playground, Hero Split-Screen, Load Simulator,
 * Telemetry Stream, and Modals.
 */

// Clean Web Audio Synthesizer
class CleanAudioSynth {
    constructor() {
        this.ctx = null;
        this.enabled = false;
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) this.init();
        return this.enabled;
    }

    playTone(freq, type = 'sine', duration = 0.05, volume = 0.03) {
        if (!this.enabled) return;
        this.init();
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    playClick() { this.playTone(900, 'sine', 0.04, 0.02); }
    playHover() { this.playTone(550, 'triangle', 0.02, 0.005); }
    playSuccess() {
        this.playTone(523.25, 'sine', 0.08, 0.03);
        setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.03), 70);
    }
}

window.appSynth = new CleanAudioSynth();

window.showSystemToast = function(msg, type = 'info') {
    const toast = document.getElementById('system-toast');
    if (!toast) return;

    toast.className = `system-toast toast-${type} active`;
    const iconMap = {
        info: 'fas fa-info-circle text-cyan',
        success: 'fas fa-check-circle text-green',
        warning: 'fas fa-exclamation-triangle text-gold',
        error: 'fas fa-times-circle text-red'
    };
    toast.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i> <span>${msg}</span>`;

    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
};

window.printResume = function() {
    window.print();
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Hero Architecture Canvas
    if (document.getElementById('playground-canvas')) {
        window.archPlayground = new ArchitecturePlayground('playground-canvas', 'playground-canvas-container');
    }

    // 2. Initialize Hero Terminal
    if (document.getElementById('hero-terminal-output')) {
        window.terminalInstance = new InteractiveTerminal('hero-terminal-output', 'hero-terminal-input');
    }

    // 3. Load Simulator Slider Listener
    const loadSlider = document.getElementById('rps-load-slider');
    if (loadSlider) {
        loadSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            if (window.archPlayground) {
                window.archPlayground.setRps(val);
            }
        });
    }

    // Load Simulator Quick Jump Buttons
    document.querySelectorAll('.load-jump-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const rps = btn.getAttribute('data-rps');
            if (loadSlider) loadSlider.value = rps;
            if (window.archPlayground) window.archPlayground.setRps(rps);
        });
    });

    // 4. Mobile Split-Screen Switcher (Terminal vs Canvas)
    const mobileHeroTabs = document.querySelectorAll('.mobile-hero-tab-btn');
    const heroLeftCol = document.getElementById('hero-col-terminal');
    const heroRightCol = document.getElementById('hero-col-canvas');

    mobileHeroTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            mobileHeroTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');

            if (target === 'terminal') {
                if (heroLeftCol) heroLeftCol.classList.remove('mobile-hidden');
                if (heroRightCol) heroRightCol.classList.add('mobile-hidden');
            } else {
                if (heroLeftCol) heroLeftCol.classList.add('mobile-hidden');
                if (heroRightCol) heroRightCol.classList.remove('mobile-hidden');
                if (window.archPlayground) setTimeout(() => window.archPlayground.resize(), 50);
            }
            if (window.appSynth) window.appSynth.playClick();
        });
    });

    // 5. Audio Toggle Button
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            const isMuted = !window.appSynth.toggle();
            audioToggleBtn.innerHTML = isMuted 
                ? '<i class="fas fa-volume-mute"></i> <span>Sound: Off</span>'
                : '<i class="fas fa-volume-up text-cyan"></i> <span>Sound: On</span>';
            audioToggleBtn.classList.toggle('active', !isMuted);
            if (!isMuted) window.appSynth.playSuccess();
        });
    }

    // 6. Initialize AI Copilot
    if (document.getElementById('copilot-drawer')) {
        window.copilotInstance = new ArchitectureCopilot(
            'copilot-drawer',
            'copilot-messages',
            'copilot-input',
            'copilot-send'
        );

        const copilotToggleBtn = document.getElementById('btn-copilot-toggle');
        const copilotCloseBtn = document.getElementById('btn-copilot-close');
        if (copilotToggleBtn) {
            copilotToggleBtn.addEventListener('click', () => window.copilotInstance.toggle());
        }
        if (copilotCloseBtn) {
            copilotCloseBtn.addEventListener('click', () => window.copilotInstance.toggle());
        }
    }

    // 7. Render Sections
    renderPlaybooksGrid();
    renderExperienceTimeline();
    renderOpenSourceGrid();

    // 8. Start Telemetry Stream
    initTelemetryStream();
});

// Render Playbooks Grid
function renderPlaybooksGrid() {
    const container = document.getElementById('playbooks-container');
    if (!container || !PORTFOLIO_DATA.playbooks) return;

    let html = '';
    PORTFOLIO_DATA.playbooks.forEach(pb => {
        html += `
        <div class="playbook-card" onclick="window.openPlaybookModal('${pb.id}')">
            <div class="playbook-card-header">
                <span class="playbook-badge"><i class="fas fa-book-bookmark text-cyan"></i> PLAYBOOK</span>
                <span class="text-muted font-mono" style="font-size:0.75rem;">1-CLICK READ</span>
            </div>
            <h4 class="playbook-card-title">${pb.title}</h4>
            <div class="playbook-card-audience"><i class="fas fa-users text-purple"></i> ${pb.targetAudience}</div>
            <p class="playbook-card-summary">${pb.summary}</p>
            <div class="playbook-card-footer">
                <span class="playbook-action-link"><i class="fas fa-eye text-cyan"></i> Inspect Full Rubric & Copy Markdown &rarr;</span>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

// Render Experience Timeline
function renderExperienceTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container || !PORTFOLIO_DATA.experience) return;

    let html = '';
    PORTFOLIO_DATA.experience.forEach((exp, idx) => {
        const isCurrent = idx === 0;
        html += `
        <div class="timeline-item ${isCurrent ? 'is-current' : ''}">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="timeline-header">
                    <div>
                        <div class="company-badge-wrap">
                            <h3 class="company-name">${exp.company}</h3>
                            <span class="role-badge ${isCurrent ? 'badge-primary' : 'badge-neutral'}">${exp.badge}</span>
                        </div>
                        <div class="role-title">${exp.role}</div>
                    </div>
                    <div class="role-period"><i class="far fa-calendar-alt"></i> ${exp.period}</div>
                </div>
                <p class="role-summary">${exp.summary}</p>
                <ul class="role-highlights">
                    ${exp.highlights.map(h => `<li><i class="fas fa-arrow-right text-cyan"></i> <span>${h}</span></li>`).join('')}
                </ul>
                <div class="role-tech-tags">
                    ${exp.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

// Render Open Source Grid
function renderOpenSourceGrid() {
    const pkgContainer = document.getElementById('oss-packages-container');
    if (!pkgContainer || !PORTFOLIO_DATA.openSource) return;

    let html = '';
    PORTFOLIO_DATA.openSource.packages.forEach(pkg => {
        html += `
        <div class="oss-card">
            <div class="oss-card-header">
                <div>
                    <h4 class="oss-pkg-name">${pkg.name}</h4>
                    <span class="oss-badge font-mono">${pkg.platform}</span>
                </div>
                <div class="oss-downloads font-mono text-green"><i class="fas fa-download"></i> ${pkg.downloads}</div>
            </div>
            <p class="oss-desc">${pkg.description}</p>
            <div class="oss-footer">
                <a href="${pkg.link}" target="_blank" class="oss-link"><i class="fab fa-github text-cyan"></i> Inspect Artifact / Package &rarr;</a>
            </div>
        </div>`;
    });
    pkgContainer.innerHTML = html;

    const philContainer = document.getElementById('oss-philosophy-container');
    if (philContainer) {
        let philHtml = '';
        PORTFOLIO_DATA.openSource.maintainerPhilosophy.forEach(p => {
            philHtml += `
            <div class="phil-item">
                <div class="phil-title"><i class="fas fa-check text-cyan"></i> ${p.pillar}</div>
                <div class="phil-detail">${p.detail}</div>
            </div>`;
        });
        philContainer.innerHTML = philHtml;
    }
}

// Real-Time Telemetry Stream
function initTelemetryStream() {
    let wsConnected = false;

    try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        const ws = new WebSocket(wsUrl);
        window.wsClient = ws;

        ws.onopen = () => {
            wsConnected = true;
            updateStatusPill(true);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'telemetry') {
                    updateTelemetryUI(msg.data);
                }
            } catch (e) {}
        };

        ws.onclose = () => {
            wsConnected = false;
            updateStatusPill(false);
            startMockTelemetry();
        };

        ws.onerror = () => {
            wsConnected = false;
            updateStatusPill(false);
            startMockTelemetry();
        };
    } catch (e) {
        startMockTelemetry();
    }

    function startMockTelemetry() {
        if (window.mockInterval) return;
        window.mockInterval = setInterval(() => {
            const jitterLatency = +(13.8 + (Math.random() * 0.8 - 0.4)).toFixed(1);
            const jitterApi = +(3.4 + (Math.random() * 0.4 - 0.2)).toFixed(1);
            updateTelemetryUI({
                edgeLatency: jitterLatency,
                apiResponse: jitterApi,
                cacheHit: "98.9%",
                uptime: "99.998%"
            });
        }, 3000);
    }
}

function updateStatusPill(isLive) {
    const pill = document.getElementById('cluster-status-pill');
    if (!pill) return;
    if (isLive) {
        pill.innerHTML = '<span class="status-dot green"></span> Edge Live: 14ms | 98.8% Cache';
    } else {
        pill.innerHTML = '<span class="status-dot green"></span> Edge Nominal (14ms)';
    }
}

function updateTelemetryUI(data) {
    const edgeElem = document.getElementById('stat-edge-latency');
    const apiElem = document.getElementById('stat-api-time');
    const cacheElem = document.getElementById('stat-cache-ratio');

    if (edgeElem && data.edgeLatency) edgeElem.textContent = `${data.edgeLatency}ms`;
    if (apiElem && data.apiResponse) apiElem.textContent = `${data.apiResponse}ms`;
    if (cacheElem && data.cacheHit) cacheElem.textContent = data.cacheHit;
}
