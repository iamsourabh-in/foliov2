const gameState = {
    db: false,
    webrtc: false,
    api: false,
    profile: false,
    booted: false
};

const sysNodes = {
    db: ['.sys-db'],
    webrtc: ['.sys-webrtc'],
    api: ['.sys-api'],
    profile: ['.sys-profile']
};

const bootOverlay = document.getElementById('boot-overlay');
setTimeout(() => {
    bootOverlay.style.opacity = '0';
    setTimeout(() => {
        bootOverlay.remove();
        gameState.booted = true;
    }, 1000);
}, 2500);

const checkAllRestored = () => {
    if(gameState.db && gameState.webrtc && gameState.api && gameState.profile) {
        document.getElementById('interactive-console').classList.remove('game-focus');
        document.getElementById('interactive-console-header').classList.add('glitch-reveal');
        document.getElementById('interactive-console-header').classList.remove('hidden-sys');
        
        // also restore static terminal
        document.getElementById('static-terminal').classList.add('glitch-reveal');
        document.getElementById('static-terminal').classList.remove('hidden-sys');
        
        // reset console prompt
        document.getElementById('main-prompt').innerText = "sourabh@portfolio:~$";
        return `<br><span style="color:var(--terminal-green); font-weight:bold; font-size: 18px">SYSTEM FULLY RESTORED. Welcome to the Portfolio.</span><br>Try: help, skills, experience, contact`;
    }
    return '';
};

const restoreSection = (key) => {
    if(gameState[key]) return `<span style="color:var(--terminal-blue)">[SYS] ${key.toUpperCase()} node already online.</span>`;
    gameState[key] = true;
    sysNodes[key].forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.remove('hidden-sys');
            el.classList.add('glitch-reveal');
        });
    });
    let restoredMsg = checkAllRestored();
    return `<span style="color:var(--terminal-green)">[✓] Successfully restored ${key.toUpperCase()} node.</span>` + restoredMsg;
};

const commands = {
    analyze: () => {
        let out = `<br><span style="color:var(--terminal-blue); font-weight:bold">SYSTEM DIAGNOSTICS:</span><br>`;
        out += `---------------------------------<br>`;
        out += `DATABASE: ${gameState.db ? '<span style="color:var(--terminal-green)">[ONLINE]</span>' : '<span style="color:var(--terminal-red)">[OFFLINE] - hint: "ping database"</span>'}<br>`;
        out += `WEBRTC:   ${gameState.webrtc ? '<span style="color:var(--terminal-green)">[ONLINE]</span>' : '<span style="color:var(--terminal-red)">[OFFLINE] - hint: "start webrtc"</span>'}<br>`;
        out += `API:      ${gameState.api ? '<span style="color:var(--terminal-green)">[ONLINE]</span>' : '<span style="color:var(--terminal-red)">[OFFLINE] - hint: "deploy api"</span>'}<br>`;
        out += `PROFILE:  ${gameState.profile ? '<span style="color:var(--terminal-green)">[ONLINE]</span>' : '<span style="color:var(--terminal-red)">[OFFLINE] - hint: "decrypt profile"</span>'}<br>`;
        out += `---------------------------------<br>`;
        return out;
    },
    'ping database': () => restoreSection('db'),
    'start webrtc': () => restoreSection('webrtc'),
    'deploy api': () => restoreSection('api'),
    'decrypt profile': () => restoreSection('profile'),
    'sudo restore all': () => {
        let msg = '';
        msg += restoreSection('db') + '<br>';
        msg += restoreSection('webrtc') + '<br>';
        msg += restoreSection('api') + '<br>';
        msg += restoreSection('profile');
        return `<span style="color:var(--terminal-purple)">God mode activated. Overriding system locks...</span><br>` + msg;
    },
    help: () => Object.values(gameState).every(v=>v) ? `Commands: skills, experience, contact, clear` : `Commands: analyze, ping database, start webrtc, deploy api, decrypt profile, sudo restore all`,
    skills: () => Object.values(gameState).every(v=>v) ? `.NET Core, AWS, Kubernetes, Kafka, MongoDB, Redis, Terraform` : `<span style="color:var(--terminal-red)">[ERROR] Profile node offline. Run "decrypt profile"</span>`,
    experience: () => Object.values(gameState).every(v=>v) ? `Samsung (2024-Present), TransUnion (2021-2024), Daffodil (2016-2021)` : `<span style="color:var(--terminal-red)">[ERROR] Profile node offline. Run "decrypt profile"</span>`,
    contact: () => `📧 sourabh.rustagi@hotmail.com<br>📱 +91-84708-94772`,
    clear: () => { document.getElementById('consoleOutput').innerHTML = ''; return ''; }
};

// initialize console input listener
document.getElementById('consoleInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.trim().toLowerCase();
        const out = document.getElementById('consoleOutput');
        const div = document.createElement('div');
        div.innerHTML = `<div style="margin-top:15px"><span class="prompt">${Object.values(gameState).every(v=>v) ? "sourabh@portfolio:~$" : "root@system:~$"}</span> ${cmd}</div>`;
        if (commands[cmd]) {
            const result = commands[cmd]();
            if (result) div.innerHTML += `<div style="margin:5px 0 0 20px">${result}</div>`;
        } else if (cmd) {
            div.innerHTML += `<div style="margin:5px 0 0 20px;color:var(--terminal-red)">Command not found</div>`;
        }
        if (cmd !== 'clear') {
            out.appendChild(div);
            // Scroll to bottom
            setTimeout(() => {
                out.parentElement.scrollTop = out.parentElement.scrollHeight;
            }, 10);
        }
        e.target.value = '';
    }
});

// sidebar link activation
const sidebar = document.querySelector('.sidebar');
const sidebarLinks = document.querySelectorAll('.sidebar a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        sidebarLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
            updateToggleIcon();
        }
    });
});

// update active link on scroll
window.addEventListener('scroll', () => {
    const fromTop = window.scrollY + 80;
    sidebarLinks.forEach(link => {
        // Skip hidden sections so they don't break scroll logic
        if (link.hash) {
            const section = document.querySelector(link.hash);
            if (section && !section.classList.contains('hidden-sys') && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
                sidebarLinks.forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
});

// mobile toggle button
const toggleBtn = document.getElementById('mobile-toggle');
const updateToggleIcon = () => {
    if (window.innerWidth <= 1024) {
        toggleBtn.innerHTML = sidebar.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    } else {
        toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-chevron-left"></i>';
    }
};

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
            document.getElementById('main-container').classList.toggle('shifted');
        }
        updateToggleIcon();
    });
}

window.addEventListener('resize', updateToggleIcon);
updateToggleIcon();

window.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('open');
            updateToggleIcon();
        }
    }
});
