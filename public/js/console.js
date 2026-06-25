// Retro-Future Audio Synth Class
class AudioSynth {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    toggle(force) {
        this.enabled = force !== undefined ? force : !this.enabled;
        return this.enabled;
    }

    playTone(freq, type, duration, volume = 0.1, delay = 0) {
        if (!this.enabled) return;
        this.init();
        
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
            
            gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + delay + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(this.ctx.currentTime + delay);
            osc.stop(this.ctx.currentTime + delay + duration);
        } catch (e) {
            console.warn("AudioContext failed to play sound", e);
        }
    }

    playClick() {
        this.playTone(800 + Math.random() * 400, 'triangle', 0.05, 0.03);
    }

    playHover() {
        this.playTone(600, 'sine', 0.02, 0.005);
    }

    playError() {
        this.playTone(150, 'sawtooth', 0.25, 0.1);
        this.playTone(145, 'sawtooth', 0.25, 0.1, 0.04);
    }

    playSuccess() {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
            this.playTone(freq, 'sine', 0.15, 0.06, i * 0.08);
        });
    }

    playCrash() {
        this.init();
        if (!this.enabled) return;
        try {
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(250, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.6);
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(90, this.ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(15, this.ctx.currentTime + 0.6);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

            osc.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc2.start();
            osc.stop(this.ctx.currentTime + 0.6);
            osc2.stop(this.ctx.currentTime + 0.6);
        } catch(e) {}
    }

    playNodeRestored() {
        this.playTone(523.25, 'sine', 0.12, 0.06);
        this.playTone(783.99, 'sine', 0.2, 0.06, 0.06);
    }

    playVictory() {
        const melody = [
            { f: 523.25, d: 0.15 },
            { f: 659.25, d: 0.15 },
            { f: 783.99, d: 0.15 },
            { f: 1046.50, d: 0.35 }
        ];
        melody.forEach((note, i) => {
            this.playTone(note.f, 'triangle', note.d, 0.08, i * 0.1);
        });
    }

    playAlarm() {
        this.playTone(880, 'sine', 0.08, 0.03);
    }
}

const synth = new AudioSynth();

// Matrix Canvas Rain Effect
let matrixInterval = null;
const initMatrixRain = () => {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&*+=:;";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const rainDrops = [];
    
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }
    
    const draw = () => {
        ctx.fillStyle = 'rgba(7, 10, 19, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < rainDrops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            ctx.fillStyle = '#00ff66';
            ctx.fillText(text, i * fontSize, (rainDrops[i] - 1) * fontSize);
            
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };
    
    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(draw, 30);
};

const stopMatrixRain = () => {
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
    }
    const canvas = document.getElementById('matrix-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

// Text Scramble Reveal Effect
const scrambleElement = (element) => {
    const textElements = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
        if (node.nodeValue.trim().length > 0 && node.parentElement.tagName !== 'SCRIPT' && node.parentElement.tagName !== 'STYLE') {
            textElements.push({
                parent: node.parentElement,
                originalText: node.nodeValue,
                node: node
            });
        }
    }
    
    textElements.forEach(item => {
        let iterations = 0;
        const originalText = item.originalText;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&*+=:;";
        
        const interval = setInterval(() => {
            item.node.nodeValue = originalText
                .split("")
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    if (char === " " || char === "\n") return char;
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
                
            if (iterations >= originalText.length) {
                clearInterval(interval);
                item.node.nodeValue = originalText;
            }
            iterations += Math.ceil(originalText.length / 8);
        }, 40);
    });
};

// RESUME DATABASE DEFINITIONS (From SourabhRustagi_Cloud_12y.docx.pdf)
const resumeData = {
    samsung: {
        title: "Chief Engineer",
        org: "Samsung Research Institute",
        duration: "May 2024 - Present",
        bullets: [
            "Leading end-to-end design and development of Samsung Classroom, a multi-region classroom control platform.",
            "Managing the engineering team, conducting technical interviews, and driving hiring decisions.",
            "Architected and built a complete multi-region deployment pipeline using Terraform, GitHub Actions, and ArgoCD (GitOps).",
            "Designed and built the LiveKit Manager service to orchestrate and manage LiveKit media servers powering real-time audio/video sessions.",
            "Developed backend APIs in Golang to support core platform capabilities.",
            "Designed and developed a distributed chat application leveraging .NET and Microsoft Orleans, enabling real-time messaging and state management for over 1 million active users simultaneously.",
            "Integrated Kafka for streaming and event-driven architecture, ensuring high-throughput communication between 10+ microservices.",
            "Implemented grain persistence, Orleans Streams (pub/sub), and EKS Kubernetes deployments."
        ],
        tech: [".NET Core", "Orleans", "Livekit SFU", "WebRTC", "Golang", "Terraform", "GitHub Actions", "ArgoCD", "Kubernetes", "Kafka", "Istio", "Azure"]
    },
    transunion: {
        title: "Lead Engineer",
        org: "TransUnion",
        duration: "May 2023 - May 2024",
        bullets: [
            "Designed and developed a scalable cloud migration solution by building microservices and deploying them on AWS using Terraform and Azure DevOps pipelines, improving deployment speed by 40% and reducing infrastructure provisioning time by 80%.",
            "Devised a migration plan to transition services to Kubernetes (EKS), incorporating service mesh and GitOps with Flux v2 for continuous delivery, improving deployment consistency and reducing rollback incidents by 90%.",
            "Built robust Authentication and Authorization packages leveraging OAuth2 and OpenID Connect (OIDC).",
            "Authored reusable Terraform modules to automate cloud infrastructure provisioning across 10+ teams."
        ],
        tech: ["AWS", "Azure DevOps", "Terraform", "Kubernetes", "Flux v2", "OAuth2", "OIDC", "IAM"]
    },
    saksoft: {
        title: "Senior Engineer",
        org: "Saksoft Ltd. (Client Acquired)",
        duration: "Apr 2021 - May 2023",
        bullets: [
            "Developed secure, versioned REST APIs using .NET Core 6, adhering to CQRS, Dependency Injection (DI), SOLID principles, and Clean Architecture.",
            "Integrated and configured HashiCorp Vault for secure secrets management and custom authentication workflows."
        ],
        tech: [".NET Core 6", "REST APIs", "CQRS", "HashiCorp Vault", "Clean Architecture", "SOLID"]
    },
    daffodil: {
        title: "Software Engineer",
        org: "Daffodil Software Ltd",
        duration: "Apr 2016 - Apr 2021 (5 Years)",
        bullets: [
            "Designed and implemented a scalable serverless architecture using AWS services (Lambda, Cognito, API Gateway, CloudWatch, and S3), resulting in 99.99% uptime.",
            "Developed custom FHIR (Fast Healthcare Interoperability Resources) servers tailored to healthcare compliance.",
            "Developed and deployed cloud-based applications leveraging AWS VPC and EC2 for secure and scalable hosting, supporting 10,000+ concurrent users and reducing latency by 20%.",
            "Migrated standalone services to .NET Core 2, enhancing performance by 40% and maintainability by 50%."
        ],
        tech: ["AWS Lambda", "Cognito", "S3", "API Gateway", "CloudWatch", "EC2", "VPC", "FHIR", ".NET Core 2"]
    },
    inventra: {
        title: "Software Engineer",
        org: "Inventra Technologies Pvt. Ltd",
        duration: "Aug 2014 - Mar 2016",
        bullets: [
            "Developed B2B Travel Domain Application with Booking Engine, integrating Amadeus widgets and white-label services, boosting booking conversions by 20% and supporting 100k+ transactions/month.",
            "Wrote optimized queries, views, and procedures on SQL Server, reducing query execution times by 40% (supporting 200,000+ monthly visitors).",
            "Designed MongoDB database schemas for scalability with 100+ collections, reducing retrieval times by 50%.",
            "Designed and developed web scraper and mapper for data extraction, reducing manual work by 70%."
        ],
        tech: ["ASP.NET", "SQL Server", "MongoDB", "Amadeus API", "Scraper", "Mapper"]
    },
    easemytrip: {
        title: "Web Developer",
        org: "Easemytrip.com",
        duration: "Aug 2013 - Jul 2014",
        bullets: [
            "Assisted in the development of travel applications, contributing to the launch of 3 major applications, boosting user engagement by 20%.",
            "Designed and developed services for mobile applications and web, enabling the platform to handle 100,000+ users.",
            "Integrated Air Costa Booking Engine API, reducing integration time by 30%.",
            "Wrote efficient queries, procedures, triggers, and views on SQL Server, reducing execution times by 35%."
        ],
        tech: ["ASP.NET", "SQL Server", "Web API", "Air Costa API"]
    },
    education: {
        title: "Academic Log",
        org: "PTU & Siliguri High Schools",
        duration: "B.Tech Graduation 2013",
        bullets: [
            "Bachelor of Technology in Computer Science & Engineering (Punjab Technical University) in 2013 | Score: 69%.",
            "12th Standard from Mahbert High School, Siliguri (W.B.), I.S.C Board in 2009 | Score: 69%.",
            "10th Standard from St. Joseph's Convent, Siliguri (W.B.), I.C.S.E Board in 2007 | Score: 72%."
        ],
        tech: ["Computer Science", "B.Tech CSE", "Siliguri High School", "Mathematics"]
    },
    achievements: {
        title: "Honors & Achievements",
        org: "Industry & Personal Milestones",
        duration: "2006 - 2024 Timeline",
        bullets: [
            "Innovation Award (Q2 2018): Developed a conversational chatbot using DialogFlow engines.",
            "Open Source Publisher: Created and published the npm angular package 'ngx-txt-img'.",
            "Process Oriented Award (2018): Recognized for deploying pipeline automation standards.",
            "Project of the Year (2017): Delivered high-concurrency microservice system architectures.",
            "Won Camporee (2006) in Indian Scouts and Guides Organization.",
            "Hobbies: Sports, Photography, Music, Dance, Reading.",
            "Father Name: Anil Kumar Rustagi."
        ],
        tech: ["DialogFlow", "Angular npm Package", "CI/CD Standards", "Scouts and Guides"]
    }
};



const gameState = {
    samsung: true,
    transunion: true,
    saksoft: true,
    daffodil: true,
    inventra: true,
    easemytrip: true,
    education: true,
    achievements: true,
    booted: true
};
const isHacked = false;
let gameActive = false;

window.toggleAudio = () => {
    const btn = document.getElementById('audio-toggle-btn');
    const enabled = synth.toggle();
    if (enabled) {
        btn.innerHTML = `<i class="fas fa-volume-up"></i> Sound: On`;
        btn.classList.remove('muted');
        synth.playClick();
    } else {
        btn.innerHTML = `<i class="fas fa-volume-mute"></i> Sound: Off`;
        btn.classList.add('muted');
    }
};

window.toggleTerminalMaximize = () => {
    const content = document.getElementById('main-content');
    const icon = document.getElementById('max-icon');
    if (!content || !icon) return;
    
    if (content.classList.contains('terminal-maximized')) {
        content.classList.remove('terminal-maximized');
        icon.className = 'fas fa-expand-alt';
    } else {
        content.classList.add('terminal-maximized');
        icon.className = 'fas fa-compress-alt';
    }
    synth.playClick();
};

window.toggleGameMaximize = () => {
    const content = document.getElementById('main-content');
    const container = document.getElementById('game-panel-wrapper');
    const icon = document.getElementById('game-max-icon');
    if (!content || !container || !icon) return;
    
    const isMax = content.classList.contains('game-maximized');
    if (isMax) {
        content.classList.remove('game-maximized');
        icon.className = 'fas fa-expand-alt';
        
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }
    } else {
        content.classList.add('game-maximized');
        icon.className = 'fas fa-compress-alt';
        
        if (container.requestFullscreen) {
            container.requestFullscreen().catch(err => {
                console.log("Fullscreen request failed", err);
            });
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    }
    synth.playClick();
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 100);
};

// Monitor native browser fullscreen exit to sync maximize class and icons
document.addEventListener('fullscreenchange', () => {
    const content = document.getElementById('main-content');
    const icon = document.getElementById('game-max-icon');
    if (!content || !icon) return;
    
    if (!document.fullscreenElement) {
        content.classList.remove('game-maximized');
        icon.className = 'fas fa-expand-alt';
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
});

// Helper to query computed theme colors from CSS variables
const getThemeColor = (varName, defaultVal) => {
    const val = getComputedStyle(document.body).getPropertyValue(varName).trim();
    return val || defaultVal;
};

// Dynamic theme changing and persistence
window.changeTheme = (theme) => {
    document.body.classList.remove('theme-cyberpunk', 'theme-dracula', 'theme-solarized', 'theme-nordic');
    if (theme !== 'cyberpunk') {
        document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem('selected-theme', theme);
    
    const select = document.getElementById('theme-select');
    if (select) {
        select.value = theme;
    }
    synth.playClick();
};

const initTheme = () => {
    const savedTheme = localStorage.getItem('selected-theme') || 'cyberpunk';
    document.body.classList.remove('theme-cyberpunk', 'theme-dracula', 'theme-solarized', 'theme-nordic');
    if (savedTheme !== 'cyberpunk') {
        document.body.classList.add(`theme-${savedTheme}`);
    }
    const select = document.getElementById('theme-select');
    if (select) {
        select.value = savedTheme;
    }
};

// Helper for wrapping text on Canvas
const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());
    return lines;
};

// Zone color variables mapping
const zoneColorVars = {
    samsung: '--terminal-purple',
    transunion: '--terminal-blue',
    saksoft: '--terminal-green',
    daffodil: '--terminal-yellow',
    inventra: '--terminal-red',
    easemytrip: '--terminal-gold',
    education: '--terminal-teal',
    achievements: '--terminal-pink'
};

let canvasDetailsPage = 0;
let lastActiveZoneKey = null;

const drawCanvasDetailsBox = (ctx, canvasWidth, canvasHeight, zone) => {
    if (!zone) return;
    
    const isRestored = !isHacked || gameState[zone.key];
    if (!isRestored) return; // Only show decrypted details on canvas
    
    const data = resumeData[zone.key];
    if (!data) return;
    
    // If active zone changed, reset page
    if (lastActiveZoneKey !== zone.key) {
        canvasDetailsPage = 0;
        lastActiveZoneKey = zone.key;
    }
    
    // Dialogue box measurements
    const boxWidth = Math.min(canvasWidth - 40, 720);
    const boxHeight = 180;
    const x = (canvasWidth - boxWidth) / 2;
    const y = canvasHeight - boxHeight - 20; // 20px offset from bottom
    
    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(7, 10, 19, 0.92)';
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 8);
    ctx.fill();
    
    // Neon border
    const themeColor = getThemeColor(zoneColorVars[zone.key] || '--terminal-blue', zone.color);
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 8);
    ctx.stroke();
    
    // Shadow glow
    ctx.save();
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 8);
    ctx.stroke();
    ctx.restore();
    
    // Draw Title (Company / Award Name)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = themeColor;
    ctx.fillText(data.org.toUpperCase(), x + 15, y + 15);
    
    // Draw Role & Duration
    ctx.font = '9px monospace';
    ctx.fillStyle = getThemeColor('--text-muted', '#6272a4');
    ctx.fillText(`${data.title} | ${data.duration}`, x + 15, y + 32);
    
    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 46);
    ctx.lineTo(x + boxWidth - 15, y + 46);
    ctx.stroke();
    
    // Draw bullet points
    const maxTextWidth = boxWidth - 30;
    const allLines = [];
    data.bullets.forEach(bullet => {
        const wrapped = wrapText(ctx, bullet, maxTextWidth - 15);
        wrapped.forEach((line, i) => {
            allLines.push({ text: line, isBulletStart: i === 0 });
        });
    });
    
    const linesPerPage = 5;
    const totalPages = Math.ceil(allLines.length / linesPerPage);
    const currentPage = canvasDetailsPage % totalPages;
    const startIndex = currentPage * linesPerPage;
    const endIndex = Math.min(startIndex + linesPerPage, allLines.length);
    const linesToDraw = allLines.slice(startIndex, endIndex);
    
    let yOffset = y + 55;
    linesToDraw.forEach(line => {
        ctx.font = '10px monospace';
        if (line.isBulletStart) {
            ctx.fillStyle = getThemeColor('--terminal-green', '#00ff66');
            ctx.fillText('>', x + 15, yOffset);
            ctx.fillStyle = getThemeColor('--text-primary', '#eceff4');
            ctx.fillText(line.text, x + 25, yOffset);
        } else {
            ctx.fillStyle = getThemeColor('--text-primary', '#eceff4');
            ctx.fillText(line.text, x + 25, yOffset);
        }
        yOffset += 16;
    });
    
    // Draw page indicator / controls help
    if (totalPages > 1) {
        ctx.textAlign = 'right';
        ctx.font = '8px monospace';
        ctx.fillStyle = getThemeColor('--text-muted', '#6272a4');
        ctx.fillText(`PAGE ${currentPage + 1}/${totalPages} [SPACE / CLICK BOX to flip]`, x + boxWidth - 15, y + boxHeight - 12);
        ctx.textAlign = 'left';
    }
};

// ACTIVE HUB DETAIL SCRAMBLE LOADER
const displayActiveHubDetails = (key) => {
    const card = document.getElementById('hub-data-card');
    const msg = document.getElementById('no-active-hub-msg');
    if (!card || !msg) return;

    if (!key) {
        card.style.display = 'none';
        msg.style.display = 'block';
        msg.innerHTML = `
            <i class="fas fa-satellite fa-spin text-muted" style="font-size: 32px; margin-bottom: 15px; display: block; text-align: center;"></i>
            <h4>NO ACTIVE HUB CONNECTION</h4>
            <p>Drive your cybercar into a glowing neon circle on the map, or select a teleport target from the sidebar to establish a connection.</p>
        `;
        return;
    }

    const data = resumeData[key];
    if (!data) return;

    msg.style.display = 'none';
    card.style.display = 'block';

    document.getElementById('hub-job-title').innerText = data.title;
    document.getElementById('hub-org').innerText = data.org;
    document.getElementById('hub-duration').innerText = data.duration;

    const bulletsUl = document.getElementById('hub-bullets');
    bulletsUl.innerHTML = data.bullets.map(b => `<li>${b}</li>`).join('');

    const tagsDiv = document.getElementById('hub-tech-tags');
    tagsDiv.innerHTML = data.tech.map(t => `<span class="tech-tag-chip">${t}</span>`).join('');

    scrambleElement(card);
    
    // Highlight sidebar nav item
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === `nav-${key}`) {
            link.classList.add('active');
        }
    });

    const activeZonePath = document.getElementById('current-zone-path');
    if (activeZonePath) activeZonePath.innerText = key;
};

// TOGGLE VIEW MODE (ACTIVE HUB VS FULL RESUME)
window.setResumeViewMode = (mode) => {
    synth.playClick();
    const btnGame = document.getElementById('btn-game-view');
    const btnFull = document.getElementById('btn-full-view');
    const activeDiv = document.getElementById('active-hub-detail');
    const fullDiv = document.getElementById('full-resume-detail');

    if (mode === 'game') {
        btnGame.classList.add('active');
        btnFull.classList.remove('active');
        activeDiv.style.display = 'block';
        fullDiv.style.display = 'none';
    } else {
        btnGame.classList.remove('active');
        btnFull.classList.add('active');
        activeDiv.style.display = 'none';
        fullDiv.style.display = 'block';
    }
};

const defaultCommands = {
    help: () => `Available CLI commands: skills, experience, contact, clear.`,
    skills: () => `Expertise: .NET Core, C#, WebRTC, Livekit SFU, Microsoft Orleans, Golang, Node.js, Terraform, AWS, Kubernetes, Service Mesh, Kafka, MongoDB, SQL Server.`,
    experience: () => `Jobs: Chief Engineer (Samsung), Lead Engineer (TransUnion), Senior Engineer (Saksoft), Software Engineer (Daffodil/Inventra), Web Developer (Easemytrip).`,
    contact: () => `Contact: sourabh.rustagi@hotmail.com | +91-84708-94772 | www.linkedin.com/in/sourabhrustagi`,
    clear: () => { document.getElementById('consoleOutput').innerHTML = ''; return ''; }
};

const executeCommand = (cmd) => {
    const out = document.getElementById('consoleOutput');
    const div = document.createElement('div');
    
    div.innerHTML = `<div style="margin-top:8px"><span class="console-prompt">sourabh@portfolio:~$</span> ${cmd}</div>`;
    if (defaultCommands[cmd]) {
        synth.playClick();
        const result = defaultCommands[cmd]();
        if (result) div.innerHTML += `<div style="margin:4px 0 0 12px; color:var(--text-secondary)">${result}</div>`;
    } else if (cmd) {
        synth.playError();
        div.innerHTML += `<div style="margin:4px 0 0 12px;color:var(--terminal-red)">Command not found. Try 'help'.</div>`;
    }
    if (cmd !== 'clear') {
        out.appendChild(div);
        setTimeout(() => out.parentElement.scrollTop = out.parentElement.scrollHeight, 10);
    }
};

// Console key event bindings
document.getElementById('consoleInput').addEventListener('keydown', (e) => {
    if (e.key.length === 1) {
        synth.playClick();
    }
});

document.getElementById('consoleInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.trim().toLowerCase();
        executeCommand(cmd);
        e.target.value = '';
    }
});

// Setup click/hover sounds
const addHoverListeners = () => {
    const selectors = ['.nav-item', '.footer-contacts a', '.audio-toggle', '.window-btn', '.toggle-view-btn', '.gamepad-btn'];
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.addEventListener('mouseenter', () => synth.playHover());
            el.addEventListener('click', () => synth.playClick());
        });
    });
};

document.addEventListener('DOMContentLoaded', addHoverListeners);

// Mobile Sidebar Hamburger toggle
const toggleBtn = document.getElementById('mobile-toggle');
const sidebarPanel = document.getElementById('sidebar-panel');

if (toggleBtn && sidebarPanel) {
    toggleBtn.addEventListener('click', () => {
        sidebarPanel.classList.toggle('open');
        synth.playClick();
    });
}

// Click outside mobile menu collapse
document.getElementById('main-content').addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && sidebarPanel.classList.contains('open')) {
        if (!sidebarPanel.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebarPanel.classList.remove('open');
        }
    }
});

// 2D SCROLLING OPEN-WORLD DRIVING GAME ENGINE
const keys = { up: false, down: false, left: false, right: false };
let autopilotTarget = null;

const initCyberDriverGame = () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Map virtual size (open world coordinates)
    const mapWidth = 1600;
    const mapHeight = 1200;
    
    // Viewport coordinates
    const viewWidth = 800;
    
    const handleResize = () => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Physics variables
    const car = {
        x: 400,
        y: 400,
        vx: 0,
        vy: 0,
        speed: 0,
        maxSpeed: 5.5,
        accel: 0.18,
        friction: 0.06,
        angle: -Math.PI / 2,
        steerSpeed: 0.055,
        width: 20,
        height: 10
    };
    
    const camera = { x: 0, y: 0 };
    let insideZone = null;
    
    // Key listeners
    window.addEventListener('keydown', (e) => {
        if (!gameActive) return;
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        const k = e.key.toLowerCase();
        
        if (k === 'w' || e.key === 'ArrowUp') { keys.up = true; e.preventDefault(); autopilotTarget = null; }
        if (k === 's' || e.key === 'ArrowDown') { keys.down = true; e.preventDefault(); autopilotTarget = null; }
        if (k === 'a' || e.key === 'ArrowLeft') { keys.left = true; e.preventDefault(); autopilotTarget = null; }
        if (k === 'd' || e.key === 'ArrowRight') { keys.right = true; e.preventDefault(); autopilotTarget = null; }
        
        // Paging through dialogue details using Spacebar
        if (e.key === ' ' || k === 'spacebar') {
            if (insideZone && (!isHacked || gameState[insideZone.key])) {
                const boxWidth = Math.min(canvas.width - 40, 720);
                const data = resumeData[insideZone.key];
                if (data) {
                    const maxTextWidth = boxWidth - 30;
                    const allLines = [];
                    data.bullets.forEach(bullet => {
                        const wrapped = wrapText(ctx, bullet, maxTextWidth - 15);
                        wrapped.forEach((line, i) => {
                            allLines.push({ text: line, isBulletStart: i === 0 });
                        });
                    });
                    const linesPerPage = 5;
                    const totalPages = Math.ceil(allLines.length / linesPerPage);
                    if (totalPages > 1) {
                        canvasDetailsPage = (canvasDetailsPage + 1) % totalPages;
                        synth.playClick();
                        e.preventDefault();
                    }
                }
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (!gameActive) return;
        const k = e.key.toLowerCase();
        if (k === 'w' || e.key === 'ArrowUp') keys.up = false;
        if (k === 's' || e.key === 'ArrowDown') keys.down = false;
        if (k === 'a' || e.key === 'ArrowLeft') keys.left = false;
        if (k === 'd' || e.key === 'ArrowRight') keys.right = false;
    });

    canvas.addEventListener('click', (e) => {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (insideZone && (!isHacked || gameState[insideZone.key])) {
            const boxWidth = Math.min(canvas.width - 40, 720);
            const boxHeight = 180;
            const x = (canvas.width - boxWidth) / 2;
            const y = canvas.height - boxHeight - 20;
            
            if (clickX >= x && clickX <= x + boxWidth &&
                clickY >= y && clickY <= y + boxHeight) {
                
                const data = resumeData[insideZone.key];
                if (data) {
                    const maxTextWidth = boxWidth - 30;
                    const allLines = [];
                    data.bullets.forEach(bullet => {
                        const wrapped = wrapText(ctx, bullet, maxTextWidth - 15);
                        wrapped.forEach((line, i) => {
                            allLines.push({ text: line, isBulletStart: i === 0 });
                        });
                    });
                    const linesPerPage = 5;
                    const totalPages = Math.ceil(allLines.length / linesPerPage);
                    if (totalPages > 1) {
                        canvasDetailsPage = (canvasDetailsPage + 1) % totalPages;
                        synth.playClick();
                    }
                }
            }
        }
    });

    // Touch Controls Binder Helper
    const bindGamepadBtn = (btnId, keyName) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        const handleStart = (e) => {
            if (!gameActive) return;
            autopilotTarget = null;
            keys[keyName] = true;
            e.preventDefault();
        };
        const handleEnd = (e) => {
            if (!gameActive) return;
            keys[keyName] = false;
            e.preventDefault();
        };
        
        btn.addEventListener('touchstart', handleStart, { passive: false });
        btn.addEventListener('touchend', handleEnd, { passive: false });
        btn.addEventListener('mousedown', handleStart);
        btn.addEventListener('mouseup', handleEnd);
        btn.addEventListener('mouseleave', handleEnd);
    };

    bindGamepadBtn('gamepad-up', 'up');
    bindGamepadBtn('gamepad-down', 'down');
    bindGamepadBtn('gamepad-left', 'left');
    bindGamepadBtn('gamepad-right', 'right');
    
    // 8 neon hub zones across the 1600x1200 open world
    const zones = [
        { name: "SAMSUNG TOWER", key: "samsung", x: 200, y: 200, radius: 55, color: "#bd93f9", cmd: "decrypt samsung", desc: "Samsung Classroom, Orleans, Livekit, WebRTC" },
        { name: "TRANSUNION PARK", key: "transunion", x: 750, y: 200, radius: 55, color: "#00e5ff", cmd: "decrypt transunion", desc: "AWS/Azure Terraform migration" },
        { name: "SAKSOFT OFFICE", key: "saksoft", x: 1350, y: 200, radius: 55, color: "#00ff66", cmd: "decrypt saksoft", desc: "REST APIs, CQRS, OIDC, Vault integration" },
        { name: "DAFFODIL HUB", key: "daffodil", x: 1350, y: 700, radius: 55, color: "#ffb86c", cmd: "decrypt daffodil", desc: "AWS Lambda serverless infrastructure" },
        { name: "INVENTRA DEPOT", key: "inventra", x: 750, y: 700, radius: 55, color: "#ff3366", cmd: "decrypt inventra", desc: "Amadeus widget, MongoDB schema collection" },
        { name: "EASEMYTRIP DEPOT", key: "easemytrip", x: 200, y: 700, radius: 55, color: "#f1fa8c", cmd: "decrypt easemytrip", desc: "Air Costa API, SQL query optimization" },
        { name: "PTU ACADEMY", key: "education", x: 450, y: 1000, radius: 55, color: "#8be9fd", cmd: "decrypt education", desc: "B.Tech Graduation CSE academic registry" },
        { name: "AWARDS ARENA", key: "achievements", x: 1100, y: 1000, radius: 55, color: "#ff79c6", cmd: "decrypt achievements", desc: "ngx-txt-img npm library & DialogFlow chatbot" }
    ];

    // Solid obstacle server blocks
    const obstacles = [
        { x: 450, y: 450, w: 100, h: 100, name: "CENTRAL ROUTER" },
        { x: 1030, y: 450, w: 100, h: 100, name: "KAFKA EVENT" },
        { x: 450, y: 830, w: 100, h: 100, name: "LOAD BALANCER" },
        { x: 1030, y: 830, w: 100, h: 100, name: "TELEMETRY AGENT" }
    ];
    
    let activeZoneKey = null;
    let chargePct = 0;
    const sparks = [];
    const skidMarks = [];
    
    const createSparks = (x, y) => {
        synth.playTone(180 + Math.random() * 30, 'sawtooth', 0.05, 0.015);
        for (let i = 0; i < 5; i++) {
            sparks.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1.0,
                color: Math.random() > 0.5 ? '#ff3366' : '#00e5ff'
            });
        }
    };

    // Sidebar navigation autopilot connector
    window.teleportToZone = (zoneKey) => {
        if (!gameActive) {
            gameActive = true;
            const overlay = document.getElementById('game-overlay');
            if (overlay) overlay.style.display = 'none';
            window.setPageMode('game');
        }
        if (zoneKey === 'dashboard') {
            autopilotTarget = null;
            car.x = 400;
            car.y = 400;
            car.speed = 0;
            displayActiveHubDetails('');
            return;
        }
        const zone = zones.find(z => z.key === zoneKey);
        if (zone) {
            autopilotTarget = null; // Clear manual autopilot pathing
            car.x = zone.x;
            car.y = zone.y;
            car.speed = 0;
            createSparks(car.x, car.y); // Teleportation spark burst
            triggerZoneActivation(zone); // Instantly decrypt/reveal node details
        }
    };
    
    const update = () => {
        if (!gameActive) {
            // spark particles decay even when not playing
            for (let i = sparks.length - 1; i >= 0; i--) {
                const p = sparks[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.05;
                if (p.life <= 0) sparks.splice(i, 1);
            }
            return;
        }
        
        // AUTOPILOT STEERING OVERRIDE
        if (autopilotTarget) {
            const dx = autopilotTarget.x - car.x;
            const dy = autopilotTarget.y - car.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 15) {
                const targetAngle = Math.atan2(dy, dx);
                let diff = targetAngle - car.angle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                
                car.angle += diff * 0.12;
                car.speed = Math.min(car.speed + car.accel, 4.5);
                
                car.x += Math.cos(car.angle) * car.speed;
                car.y += Math.sin(car.angle) * car.speed;
            } else {
                car.speed = 0;
                autopilotTarget = null;
            }
        } else {
            // MANUAL DRIVING STEERING
            const speedRatio = Math.abs(car.speed) / car.maxSpeed;
            const steerDir = car.speed < 0 ? -1 : 1;
            
            if (keys.left) {
                car.angle -= car.steerSpeed * speedRatio * steerDir;
            }
            if (keys.right) {
                car.angle += car.steerSpeed * speedRatio * steerDir;
            }
            
            if (keys.up) {
                car.speed = Math.min(car.speed + car.accel, car.maxSpeed);
            } else if (keys.down) {
                car.speed = Math.max(car.speed - car.accel, -car.maxSpeed / 2);
            } else {
                if (car.speed > 0) car.speed = Math.max(car.speed - car.friction, 0);
                else if (car.speed < 0) car.speed = Math.min(car.speed + car.friction, 0);
            }
            
            car.x += Math.cos(car.angle) * car.speed;
            car.y += Math.sin(car.angle) * car.speed;
        }
        
        // BOUNDARY CHECK COLLISIONS
        if (car.x < 15) { car.x = 15; car.speed *= -0.4; createSparks(car.x, car.y); }
        if (car.x > mapWidth - 15) { car.x = mapWidth - 15; car.speed *= -0.4; createSparks(car.x, car.y); }
        if (car.y < 15) { car.y = 15; car.speed *= -0.4; createSparks(car.x, car.y); }
        if (car.y > mapHeight - 15) { car.y = mapHeight - 15; car.speed *= -0.4; createSparks(car.x, car.y); }
        
        // OBSTACLES CHECK COLLISIONS
        if (!autopilotTarget) {
            obstacles.forEach(o => {
                const pad = 12;
                if (car.x > o.x - pad && car.x < o.x + o.w + pad &&
                    car.y > o.y - pad && car.y < o.y + o.h + pad) {
                    
                    createSparks(car.x, car.y);
                    car.speed = -car.speed * 0.4;
                    // push out
                    car.x -= Math.cos(car.angle) * 6;
                    car.y -= Math.sin(car.angle) * 6;
                }
            });
        }
        
        // skidmarks drift logic
        if (Math.abs(car.speed) > 2.0 && (keys.left || keys.right)) {
            skidMarks.push({ x: car.x, y: car.y, life: 1.0 });
            if (skidMarks.length > 100) skidMarks.shift();
        }
        
        // spark particles decay
        for (let i = sparks.length - 1; i >= 0; i--) {
            const p = sparks[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) sparks.splice(i, 1);
        }
        
        // Check parking/docking distance
        let insideZone = null;
        zones.forEach(z => {
            const dist = Math.hypot(car.x - z.x, car.y - z.y);
            if (dist < z.radius) {
                insideZone = z;
            }
        });
        
        if (insideZone) {
            if (activeZoneKey !== insideZone.key) {
                chargePct += 3;
                if (chargePct >= 100) {
                    chargePct = 100;
                    activeZoneKey = insideZone.key;
                    triggerZoneActivation(insideZone);
                }
            }
        } else {
            activeZoneKey = null;
            chargePct = Math.max(chargePct - 5, 0);
        }
        
        // CAMERA DYNAMIC TRACKING COLLAPSE
        camera.x = car.x - canvas.width / 2;
        camera.y = car.y - canvas.height / 2;
        camera.x = Math.max(0, Math.min(camera.x, mapWidth - canvas.width));
        camera.y = Math.max(0, Math.min(camera.y, mapHeight - canvas.height));
    };
    
    const triggerZoneActivation = (zone) => {
        synth.playNodeRestored();
        
        // print audit log in shell
        const consoleOut = document.getElementById('consoleOutput');
        if (consoleOut) {
            const div = document.createElement('div');
            div.style.marginTop = "8px";
            div.innerHTML = `<span style="color:var(--terminal-blue)">[CYBER-VEHICLE DOCK]:</span> Connection verified with <strong>${zone.name}</strong>.<br><span style="color:var(--text-muted)">&gt; Pulling resume registry archive...</span>`;
            consoleOut.appendChild(div);
            setTimeout(() => consoleOut.parentElement.scrollTop = consoleOut.parentElement.scrollHeight, 10);
        }
        
        displayActiveHubDetails(zone.key);
    };
    
    const draw = () => {
        // Resolve dynamic styles from document.body variables
        const bgPrimary = getThemeColor('--bg-primary', '#05070e');
        const bgSecondary = getThemeColor('--bg-secondary', '#0c1020');
        const bgTertiary = getThemeColor('--bg-tertiary', '#131930');
        const terminalBlue = getThemeColor('--terminal-blue', '#00e5ff');
        const terminalGreen = getThemeColor('--terminal-green', '#00ff66');
        const terminalRed = getThemeColor('--terminal-red', '#ff3366');
        const textMuted = getThemeColor('--text-muted', '#6272a4');
        const textPrimary = getThemeColor('--text-primary', '#f8f8f2');

        ctx.fillStyle = bgPrimary;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        
        // Draw grid
        ctx.strokeStyle = terminalBlue + '05'; // very low opacity
        ctx.lineWidth = 1;
        for (let x = 0; x < mapWidth; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, mapHeight); ctx.stroke();
        }
        for (let y = 0; y < mapHeight; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(mapWidth, y); ctx.stroke();
        }
        
        // Draw connecting highway ring roads
        ctx.strokeStyle = terminalBlue + '0c'; // low opacity
        ctx.lineWidth = 10;
        ctx.beginPath();
        // ring roads
        ctx.moveTo(200, 200);
        ctx.lineTo(750, 200);
        ctx.lineTo(1350, 200);
        ctx.lineTo(1350, 700);
        ctx.lineTo(750, 700);
        ctx.lineTo(200, 700);
        ctx.closePath();
        ctx.stroke();
        
        // roads to education and awards
        ctx.beginPath();
        ctx.moveTo(200, 700);
        ctx.lineTo(450, 1000);
        ctx.lineTo(1100, 1000);
        ctx.lineTo(1350, 700);
        ctx.stroke();
        
        // center connector
        ctx.beginPath();
        ctx.moveTo(750, 200);
        ctx.lineTo(750, 700);
        ctx.stroke();
        
        // Draw skid marks
        ctx.fillStyle = terminalBlue + '15';
        skidMarks.forEach(sm => {
            ctx.beginPath(); ctx.arc(sm.x, sm.y, 2, 0, Math.PI * 2); ctx.fill();
        });
        
        // Draw Obstacle buildings (tech server nodes)
        obstacles.forEach(o => {
            ctx.fillStyle = bgSecondary;
            ctx.strokeStyle = terminalRed + '66'; // low opacity red
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(o.x, o.y, o.w, o.h);
            ctx.fill();
            ctx.stroke();
            
            // Neon cross lines
            ctx.strokeStyle = terminalRed + '1a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(o.x, o.y); ctx.lineTo(o.x+o.w, o.y+o.h);
            ctx.moveTo(o.x+o.w, o.y); ctx.lineTo(o.x, o.y+o.h);
            ctx.stroke();
            
            ctx.fillStyle = textMuted;
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(o.name, o.x + o.w/2, o.y + o.h/2 + 2.5);
        });
        
        // Draw Hub Docks
        zones.forEach(z => {
            const isRestored = !isHacked || gameState[z.key];
            const baseColorVar = zoneColorVars[z.key] || '--terminal-blue';
            const baseColor = getThemeColor(baseColorVar, z.color);
            const glowColor = isRestored ? baseColor : terminalRed;
            
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 10;
            
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = isRestored ? terminalGreen + '1e' : terminalRed + '14';
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.radius - 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = isRestored ? terminalGreen : terminalRed;
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(isRestored ? "[ONLINE]" : "[OFFLINE]", z.x, z.y - 12);
            
            ctx.fillStyle = textPrimary;
            ctx.font = 'bold 8px monospace';
            ctx.fillText(z.name, z.x, z.y + 2);
            
            ctx.font = '6px monospace';
            ctx.fillStyle = textMuted;
            ctx.fillText(isRestored ? "CONNECTED" : z.cmd, z.x, z.y + 14);
        });
        
        // Draw connection loading bar
        if (chargePct > 0 && chargePct < 100) {
            ctx.strokeStyle = terminalGreen;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(car.x, car.y, 20, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (chargePct / 100)));
            ctx.stroke();
        }
        
        // Draw spark particles
        sparks.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 2.5, 2.5);
        });
        
        // Draw Car vector vehicle
        ctx.save();
        ctx.translate(car.x, car.y);
        ctx.rotate(car.angle);
        
        ctx.shadowColor = terminalBlue;
        ctx.shadowBlur = 6;
        
        ctx.fillStyle = bgTertiary;
        ctx.strokeStyle = terminalBlue;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-car.width/2, -car.height/2, car.width, car.height);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Wheels
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -6, 3, 1.5);
        ctx.fillRect(3, -6, 3, 1.5);
        ctx.fillRect(-6, 4.5, 3, 1.5);
        ctx.fillRect(3, 4.5, 3, 1.5);
        
        // Cabin
        ctx.fillStyle = terminalBlue + '70'; // translucent cabin
        ctx.fillRect(-2, -3, 5, 6);
        
        // Headlights
        ctx.fillStyle = '#ffeb3b';
        ctx.fillRect(car.width/2 - 1, -3, 1.5, 1);
        ctx.fillRect(car.width/2 - 1, 2, 1.5, 1);
        
        ctx.restore();
        ctx.restore();
        
        // DRAW TRANSPARENT HUD RADAR MINIMAP
        const radarSize = 80;
        const radarX = canvas.width - radarSize - 15;
        const radarY = 15;
        
        ctx.fillStyle = bgSecondary + 'c0'; // translucent background
        ctx.strokeStyle = terminalBlue + '4d'; // border with transparency
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(radarX, radarY, radarSize, radarSize);
        ctx.fill();
        ctx.stroke();
        
        // Grid pattern in minimap
        ctx.strokeStyle = terminalBlue + '14';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(radarX + radarSize/2, radarY); ctx.lineTo(radarX + radarSize/2, radarY + radarSize);
        ctx.moveTo(radarX, radarY + radarSize/2); ctx.lineTo(radarX + radarSize, radarY + radarSize/2);
        ctx.stroke();
        
        // Draw relative spots
        const mapToRadar = (mx, my) => {
            const rx = radarX + (mx / mapWidth) * radarSize;
            const ry = radarY + (my / mapHeight) * radarSize;
            return { x: rx, y: ry };
        };
        
        // Obstacles (red blocks)
        ctx.fillStyle = terminalRed + '4d';
        obstacles.forEach(o => {
            const p = mapToRadar(o.x, o.y);
            const w = (o.w / mapWidth) * radarSize;
            const h = (o.h / mapHeight) * radarSize;
            ctx.fillRect(p.x, p.y, w, h);
        });
        
        // Docks (colored dots)
        zones.forEach(z => {
            const p = mapToRadar(z.x, z.y);
            const isRestored = !isHacked || gameState[z.key];
            const baseColorVar = zoneColorVars[z.key] || '--terminal-blue';
            ctx.fillStyle = isRestored ? getThemeColor(baseColorVar, z.color) : terminalRed;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
        });
        
        // Car (pulsing blue dot)
        const cp = mapToRadar(car.x, car.y);
        ctx.fillStyle = terminalBlue;
        ctx.shadowColor = terminalBlue;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw company/award details box directly on canvas
        if (insideZone) {
            drawCanvasDetailsBox(ctx, canvas.width, canvas.height, insideZone);
        }
        
        requestAnimationFrame(draw);
    };
    
    // loops
    setInterval(update, 1000 / 60);
    requestAnimationFrame(draw);
};

// INITIALIZATION LOGIC
const initGameOverlay = () => {
    const btnStart = document.getElementById('btn-overlay-start');
    const btnLaunch = document.getElementById('btn-overlay-launch');
    const startScreen = document.getElementById('game-overlay-start');
    const instructionsScreen = document.getElementById('game-overlay-instructions');
    const overlay = document.getElementById('game-overlay');
    
    if (btnStart && btnLaunch && startScreen && instructionsScreen && overlay) {
        btnStart.addEventListener('click', () => {
            synth.playClick();
            startScreen.style.display = 'none';
            instructionsScreen.style.display = 'block';
        });
        
        btnLaunch.addEventListener('click', () => {
            synth.playSuccess();
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                gameActive = true;
                
                // Automatically activate active hub details view in right panel
                window.setResumeViewMode('game');
            }, 300);
        });
    }
};

window.setPageMode = (mode) => {
    const body = document.body;
    const btn = document.getElementById('mode-toggle-btn');
    if (mode === 'game') {
        body.classList.remove('mode-resume');
        if (btn) {
            btn.innerHTML = `<i class="fas fa-file-alt"></i> Resume View`;
        }
        
        // Resize canvas
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    } else {
        body.classList.add('mode-resume');
        if (btn) {
            btn.innerHTML = `<i class="fas fa-gamepad"></i> Explore via Game`;
        }
    }
    synth.playClick();
};

window.togglePageMode = () => {
    const isResume = document.body.classList.contains('mode-resume');
    window.setPageMode(isResume ? 'game' : 'resume');
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    addHoverListeners();
    initCyberDriverGame();
    initGameOverlay();
    
    // Bind sidebar teleport clicks
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            
            const id = link.id;
            if (id) {
                const zoneKey = id.replace('nav-', '');
                window.teleportToZone(zoneKey);
            }
        });
    });
    
    // Initial welcome message
    setTimeout(() => {
        const out = document.getElementById('consoleOutput');
        if (out) {
            out.innerHTML = `
                <div style="color:var(--terminal-green); font-weight:bold; margin-bottom:8px;">
                    [✓ SYSTEM ONLINE: CONNECTED]
                </div>
                <div style="color:var(--text-primary); margin-bottom:8px; line-height:1.6; font-size:11px;">
                    Welcome to Sourabh Rustagi's Systems Engineering & DevOps Portfolio.<br><br>
                    <strong>OPEN WORLD TIMELINE:</strong><br>
                    &gt; Drive your cybercar on the map, park in neon hubs, or select teleport links from the sidebar to query sub-system logs. Company and award details will display directly in-game on the canvas!<br><br>
                    <strong>ADMIN TERMINAL:</strong><br>
                    &gt; Type <strong>help</strong> in the shell below to see query commands (e.g. skills, experience, contact).
                </div>
                <hr style="border:none; border-top:1px solid rgba(255,255,255,0.06); margin:10px 0;">
            `;
        }
    }, 100);
});

// Websocket Mock Telemetry Scraper
const connectWS = () => {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//${window.location.host}`;
    
    try {
        const socket = new WebSocket(wsUrl);
        socket.onopen = () => console.log("Websocket telemetry scraper online");

    } catch(e) {}
};
setTimeout(connectWS, 1000);
