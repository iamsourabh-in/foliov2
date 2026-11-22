/**
 * Interactive Engineering Playbooks, ADRs & Post-Mortem Modal Controller
 */

window.openAdrModal = function(adrId) {
    const adr = PORTFOLIO_DATA.adrs.find(a => a.id === adrId);
    if (!adr) return;

    const modal = document.getElementById('adr-modal');
    if (!modal) return;

    document.getElementById('adr-id-tag').textContent = adr.id;
    document.getElementById('adr-status-badge').textContent = adr.status;
    document.getElementById('adr-modal-title').textContent = adr.title;
    document.getElementById('adr-context').textContent = adr.context;
    document.getElementById('adr-decision').textContent = adr.decision;
    document.getElementById('adr-tradeoffs').textContent = adr.tradeoffs;
    document.getElementById('adr-metrics').textContent = adr.metrics;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.appSynth) window.appSynth.playClick();
};

window.closeAdrModal = function() {
    const modal = document.getElementById('adr-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.openPlaybookModal = function(playbookId) {
    const pb = PORTFOLIO_DATA.playbooks.find(p => p.id === playbookId);
    if (!pb) return;

    const modal = document.getElementById('playbook-modal');
    if (!modal) return;

    document.getElementById('playbook-modal-title').textContent = pb.title;
    document.getElementById('playbook-modal-audience').textContent = pb.targetAudience;
    document.getElementById('playbook-modal-summary').textContent = pb.summary;
    
    // Render formatted markdown
    const contentElem = document.getElementById('playbook-modal-content');
    if (contentElem) {
        contentElem.innerHTML = formatPlaybookMarkdown(pb.content);
    }

    // Set copy button content
    const copyBtn = document.getElementById('btn-copy-playbook');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(`# ${pb.title}\n\n${pb.content}`);
            copyBtn.innerHTML = '<i class="fas fa-check text-green"></i> Copied Markdown!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Markdown';
            }, 2000);
            if (window.appSynth) window.appSynth.playSuccess();
        };
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.appSynth) window.appSynth.playClick();
};

window.closePlaybookModal = function() {
    const modal = document.getElementById('playbook-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.openPostMortemModal = function() {
    const pm = PORTFOLIO_DATA.postMortem;
    const modal = document.getElementById('postmortem-modal');
    if (!modal) return;

    document.getElementById('pm-incident-id').textContent = pm.id;
    document.getElementById('pm-incident-title').textContent = pm.title;
    document.getElementById('pm-impact').textContent = pm.impact;
    document.getElementById('pm-rootcause').textContent = pm.rootCause;
    document.getElementById('pm-mitigation').textContent = pm.immediateMitigation;
    document.getElementById('pm-lessons').textContent = pm.lessonsLearned;

    const safeguardsContainer = document.getElementById('pm-safeguards-list');
    if (safeguardsContainer) {
        safeguardsContainer.innerHTML = pm.architecturalSafeguardsBuilt
            .map(s => `<li><i class="fas fa-shield-halved text-cyan"></i> <span>${s}</span></li>`)
            .join('');
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.appSynth) window.appSynth.playClick();
};

window.closePostMortemModal = function() {
    const modal = document.getElementById('postmortem-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

function formatPlaybookMarkdown(md) {
    return md
        .replace(/^### (.*$)/gim, '<h4 class="playbook-heading">$1</h4>')
        .replace(/^\- (.*$)/gim, '<li class="playbook-li">$1</li>')
        .replace(/`([^`]+)`/g, '<code class="playbook-code">$1</code>')
        .replace(/\n\n/g, '<br><br>');
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup modal backdrop close listeners
    ['adr-modal', 'playbook-modal', 'postmortem-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    el.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    });
});
