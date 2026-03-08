let isHacked = false;

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
    profile: ['.sys-profile'],
    terminal: ['.sys-terminal']
};

window.startHack = () => {
    isHacked = true;
    document.getElementById('hack-btn').style.display = 'none';
    document.body.classList.add('system-crashed');
    
    // Hide all systems
    Object.keys(sysNodes).forEach(key => {
        sysNodes[key].forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('hidden-sys');
                el.classList.remove('glitch-reveal');
            });
        });
    });

    // Make interactive console take over
    document.getElementById('interactive-console').classList.add('game-focus');
    document.getElementById('main-prompt').innerText = "root@system:~$";
    
    // Show boot overlay
    const bootOverlay = document.getElementById('boot-overlay');
    bootOverlay.style.display = 'flex';
    bootOverlay.style.opacity = '1';
    
    setTimeout(() => {
        bootOverlay.style.opacity = '0';
        setTimeout(() => {
            bootOverlay.style.display = 'none';
            gameState.booted = true;
            document.getElementById('consoleInput').focus();
        }, 1000);
    }, 2500);
};

const checkAllRestored = () => {
    if(gameState.db && gameState.webrtc && gameState.api && gameState.profile) {
        document.getElementById('interactive-console').classList.remove('game-focus');
        
        // Restore terminal header
        document.getElementById('interactive-console-header').classList.add('glitch-reveal');
        document.getElementById('interactive-console-header').classList.remove('hidden-sys');
        
        // Restore static terminal
        document.getElementById('static-terminal').classList.add('glitch-reveal');
        document.getElementById('static-terminal').classList.remove('hidden-sys');
        
        document.body.classList.remove('system-crashed');
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
    help: () => Object.values(gameState).every(v=>typeof v === 'boolean' && v===true) ? `Commands: skills, experience, contact, clear` : `Commands: analyze, ping database, start webrtc, deploy api, decrypt profile, sudo restore all`,
    skills: () => Object.values(gameState).every(v=>typeof v === 'boolean' && v===true) ? `.NET Core, AWS, Kubernetes, Kafka, MongoDB, Redis, Terraform` : `<span style="color:var(--terminal-red)">[ERROR] Profile node offline. Run "decrypt profile"</span>`,
    experience: () => Object.values(gameState).every(v=>typeof v === 'boolean' && v===true) ? `Samsung (2024-Present), TransUnion (2021-2024), Daffodil (2016-2021)` : `<span style="color:var(--terminal-red)">[ERROR] Profile node offline. Run "decrypt profile"</span>`,
    contact: () => `📧 sourabh.rustagi@hotmail.com<br>📱 +91-84708-94772`,
    clear: () => { document.getElementById('consoleOutput').innerHTML = ''; return ''; }
};

const defaultCommands = {
    help: () => `Commands: skills, experience, contact, clear`,
    skills: () => `.NET Core, AWS, Kubernetes, Kafka, MongoDB, Redis, Terraform`,
    experience: () => `Samsung (2024-Present), TransUnion (2021-2024), Daffodil (2016-2021)`,
    contact: () => `📧 sourabh.rustagi@hotmail.com<br>📱 +91-84708-94772`,
    clear: () => { document.getElementById('consoleOutput').innerHTML = ''; return ''; }
};

// initialize console input listener
document.getElementById('consoleInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = e.target.value.trim().toLowerCase();
        const out = document.getElementById('consoleOutput');
        const div = document.createElement('div');
        
        if (!isHacked) {
            div.innerHTML = `<div style="margin-top:15px"><span class="prompt">sourabh@portfolio:~$</span> ${cmd}</div>`;
            if (defaultCommands[cmd]) {
                const result = defaultCommands[cmd]();
                if (result) div.innerHTML += `<div style="margin:5px 0 0 20px">${result}</div>`;
            } else if (cmd) {
                div.innerHTML += `<div style="margin:5px 0 0 20px;color:var(--terminal-red)">Command not found</div>`;
            }
            if (cmd !== 'clear') {
                out.appendChild(div);
                setTimeout(() => out.parentElement.scrollTop = out.parentElement.scrollHeight, 10);
            }
            e.target.value = '';
            return;
        }

        // Processing commands in hack mode
        div.innerHTML = `<div style="margin-top:15px"><span class="prompt">${Object.values(gameState).every(v=>typeof v === 'boolean' && v===true) ? "sourabh@portfolio:~$" : "root@system:~$"}</span> ${cmd}</div>`;
        if (commands[cmd]) {
            const result = commands[cmd]();
            if (result) div.innerHTML += `<div style="margin:5px 0 0 20px">${result}</div>`;
        } else if (cmd) {
            div.innerHTML += `<div style="margin:5px 0 0 20px;color:var(--terminal-red)">Command not found</div>`;
        }
        if (cmd !== 'clear') {
            out.appendChild(div);
            setTimeout(() => {
                out.parentElement.scrollTop = out.parentElement.scrollHeight;
            }, 10);
        }
        e.target.value = '';
    }
});

// Default starting point for console if not hacked
document.getElementById('consoleOutput').innerHTML = `<div><span style="color:var(--terminal-green)">Welcome! Type 'help' for commands</span></div>`;

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
