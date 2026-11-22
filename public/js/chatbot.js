/**
 * AI Architectural Copilot
 * Context-aware intelligent assistant with quick prompts and offline fallback intelligence.
 */

class ArchitectureCopilot {
    constructor(drawerId, messagesId, inputId, sendBtnId) {
        this.drawer = document.getElementById(drawerId);
        this.messagesContainer = document.getElementById(messagesId);
        this.inputElem = document.getElementById(inputId);
        this.sendBtn = document.getElementById(sendBtnId);

        this.init();
    }

    init() {
        if (this.sendBtn && this.inputElem) {
            this.sendBtn.addEventListener('click', () => this.handleUserSubmit());
            this.inputElem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleUserSubmit();
                }
            });
        }

        // Setup quick prompt chips
        document.querySelectorAll('.copilot-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.getAttribute('data-prompt');
                if (prompt) {
                    this.inputElem.value = prompt;
                    this.handleUserSubmit();
                }
            });
        });
    }

    toggle() {
        if (!this.drawer) return;
        const isActive = this.drawer.classList.contains('active');
        if (isActive) {
            this.drawer.classList.remove('active');
        } else {
            this.drawer.classList.add('active');
            if (this.inputElem) setTimeout(() => this.inputElem.focus(), 200);
        }
    }

    async handleUserSubmit() {
        const text = this.inputElem.value.trim();
        if (!text) return;

        this.inputElem.value = '';
        this.appendMessage('user', text);
        this.showTypingIndicator();

        if (window.appSynth) window.appSynth.playClick();

        try {
            // Attempt to query real backend /api/chat
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            if (res.ok) {
                const data = await res.json();
                this.removeTypingIndicator();
                this.appendMessage('bot', data.reply);
                return;
            }
        } catch (e) {
            // Fallback to client-side offline knowledge base
        }

        setTimeout(() => {
            this.removeTypingIndicator();
            const fallbackReply = this.generateOfflineReply(text);
            this.appendMessage('bot', fallbackReply);
        }, 600);
    }

    generateOfflineReply(query) {
        const q = query.toLowerCase();

        if (q.includes('orleans') || q.includes('chat') || q.includes('1m') || q.includes('actor')) {
            return `At **Samsung R&D**, Sourabh architected a distributed real-time messaging system supporting **1M+ concurrent users** using **Microsoft Orleans** and **.NET Core**.\n\n• **Virtual Actor Model**: Eliminates distributed locks by giving each active classroom channel and user an in-memory stateful grain.\n• **Event-Driven Backing**: Integrated **Apache Kafka** for guaranteed message ordering and fan-out.\n• **ACID Storage**: Backed by **FoundationDB** for zero data loss offline queueing.`;
        }

        if (q.includes('samsung') || q.includes('livekit') || q.includes('classroom') || q.includes('webrtc')) {
            return `As **Chief Engineer at Samsung R&D Institute**, Sourabh leads the platform architecture for **Samsung Classroom**:\n\n• **LiveKit SFU Orchestration**: Implemented Go microservices to coordinate LiveKit media servers powering low-latency video and audio classroom interactions.\n• **Multi-Region GitOps**: Declarative infrastructure across AWS/Azure Kubernetes (EKS/AKS) using **ArgoCD** and **Terraform**.\n• **Confidential Workloads**: Designed confidential computing execution pipelines in Azure.`;
        }

        if (q.includes('transunion') || q.includes('flux') || q.includes('vault') || q.includes('migration')) {
            return `At **TransUnion**, Sourabh served as **Lead Engineer / Senior Consultant**:\n\n• **Kubernetes Migration**: Spearheaded the transition of legacy services to **AWS EKS** with Istio Service Mesh and **Flux v2 GitOps**, reducing rollback incidents by **90%**.\n• **Reusable Terraform**: Authored infrastructure modules across **10+ teams**, accelerating environment provisioning by **80%**.\n• **Secret Governance**: Designed **HashiCorp Vault** automated credential rotations.`;
        }

        if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('phone')) {
            return `You can connect directly with Sourabh:\n\n• **Email**: sourabh.rustagi@hotmail.com\n• **Phone**: +91-84708-94772\n• **LinkedIn**: [linkedin.com/in/sourabhrustagi](https://www.linkedin.com/in/sourabhrustagi)\n• **GitHub**: [github.com/iamsourabh-in](https://github.com/iamsourabh-in)`;
        }

        return `Sourabh Rustagi is a **Chief Systems Engineer & Cloud-Native Architect** with 12+ years of experience leading teams, building ultra-scalable platforms (1M+ concurrent users), and automating GitOps infrastructure at Samsung R&D and TransUnion.\n\nFeel free to ask about his **Microsoft Orleans** actor architecture, **LiveKit SFU video platforms**, or **Kubernetes & GitOps** achievements!`;
    }

    appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `copilot-msg ${sender}-msg`;

        const avatar = document.createElement('div');
        avatar.className = 'copilot-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-brain text-cyan"></i>';

        const bubble = document.createElement('div');
        bubble.className = 'copilot-bubble';
        bubble.innerHTML = this.formatMarkdown(text);

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);

        this.messagesContainer.appendChild(msgDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const ind = document.createElement('div');
        ind.id = 'copilot-typing';
        ind.className = 'copilot-msg bot-msg';
        ind.innerHTML = `
            <div class="copilot-avatar"><i class="fas fa-brain text-cyan"></i></div>
            <div class="copilot-bubble typing-dots">
                <span></span><span></span><span></span>
            </div>`;
        this.messagesContainer.appendChild(ind);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const ind = document.getElementById('copilot-typing');
        if (ind) ind.remove();
    }

    formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-cyan underline">$1</a>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n•/g, '<br>•')
            .replace(/\n/g, '<br>');
    }
}

window.ArchitectureCopilot = ArchitectureCopilot;
