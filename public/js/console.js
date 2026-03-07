const commands = {
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
        div.innerHTML = `<div style="margin-top:15px"><span class="prompt">~$</span> ${cmd}</div>`;
        if (commands[cmd]) {
            const result = commands[cmd]();
            if (result) div.innerHTML += `<div style="margin:5px 0 0 20px">${result}</div>`;
        } else if (cmd) {
            div.innerHTML += `<div style="margin:5px 0 0 20px;color:var(--terminal-red)">Command not found</div>`;
        }
        if (cmd !== 'clear') out.appendChild(div);
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
        // if mobile, close after click
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    });
});

// update active link on scroll
window.addEventListener('scroll', () => {
    const fromTop = window.scrollY + 80;
    sidebarLinks.forEach(link => {
        const section = document.querySelector(link.hash);
        if (section && section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
            sidebarLinks.forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// mobile toggle button (now universal toggle)
const toggleBtn = document.querySelector('.mobile-toggle');

const updateToggleIcon = () => {
    if (window.innerWidth <= 768) {
        toggleBtn.innerHTML = sidebar.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    } else {
        toggleBtn.innerHTML = sidebar.classList.contains('collapsed') ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-chevron-left"></i>';
    }
};

toggleBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
        document.querySelector('.container').classList.toggle('shifted');
    }
    updateToggleIcon();
});

// update icon on resize
window.addEventListener('resize', updateToggleIcon);
// initial icon
updateToggleIcon();

// click outside to close on mobile and update icon
window.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('open');
            updateToggleIcon();
        }
    }
});
