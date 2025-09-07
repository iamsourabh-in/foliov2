$(document).ready(function() {
    let isSidebarOpen = false;
    loadLayer(layer='landing'); // Load default layer
    // Initialize Lucide icons
    lucide.createIcons();
    closeSidebar();
    // --- Sidebar Toggle Logic ---
    $('#toggle-sidebar-btn').on('click', function() {
        isSidebarOpen = !isSidebarOpen;
        if (isSidebarOpen) {
            openSidebar();
        } else {
            closeSidebar();
        }
    });

    function openSidebar() {
        $('#sidebar').removeClass('w-20').addClass('w-64');
        $('#main-content').removeClass('ml-20').addClass('ml-64');
        $('#sidebar-title').show();
        $('.nav-item span').show();
        $('#toggle-sidebar-btn').html('<i data-lucide="x"></i>');
        lucide.createIcons();
    }

    function closeSidebar() {
        $('#sidebar').removeClass('w-64').addClass('w-20');
        $('#main-content').removeClass('ml-64').addClass('ml-20');
        $('#sidebar-title').hide();
        $('.nav-item span').hide();
        $('#toggle-sidebar-btn').html('<i data-lucide="menu"></i>');
        lucide.createIcons();
    }
    
    // --- Navigation Logic ---
    $('.nav-item').on('click', function() {
        const layer = $(this).data('layer');
        loadLayer(layer);
    });


    function loadLayer(layer) {
        console.log('Navigating to layer:', layer);
        const pageUrl = `pages/${layer}.html`;

        $('#main-content').load(pageUrl, function(response, status, xhr) {
            if (status == "error") {
                $(this).html(`<div class="p-8 text-red-500">Error: Could not load ${pageUrl}.</div>`);
                return;
            }

            // Layer-specific initialization
            if (layer === 'frontend') {
                initializeFrontendLayer();
            } else if (layer === 'backend') {
                initializeBackendLayer();
            } else if (layer === 'cloud') {
                initializeCloudLayer();
            } else if (layer === 'kubernetes') {
                initializeKubernetesLayer();
            } else if (layer === 'projects') {
                initializeProjectsLayer();
            }

            // Add other 'else if' blocks for other layers
        });
    }
    initializeKubernetesLayer = () => {
         gsap.from('.kubernetes-layer', { opacity: 0, scale: 0.9, duration: 0.5 });
    }
    function initializeProjectsLayer() {
         gsap.from('.projects-layer', { opacity: 0, scale: 0.9, duration: 0.5 });
    }
    function initializeFrontendLayer() {
        const components = [
            { id: 1, type: 'Input', text: 'Input Field' },
            { id: 2, type: 'Button', text: 'Click Me' },
            { id: 3, type: 'TextArea', text: 'Text Area' },
        ];
        let droppedComponents = [];

        const $componentSource = $('#component-source');
        components.forEach(component => {
            const componentEl = $(`<div draggable="true" class="p-4 bg-gray-700 rounded-lg cursor-pointer">${component.text}</div>`);
            componentEl.on('dragstart', function(e) {
                e.originalEvent.dataTransfer.setData('component', JSON.stringify(component));
            });
            $componentSource.append(componentEl);
        });

        const $dropZone = $('#drop-zone');
        $dropZone.on('dragover', function(e) {
            e.preventDefault();
        });

        $dropZone.on('drop', function(e) {
            e.preventDefault();
            const componentData = e.originalEvent.dataTransfer.getData('component');
            const component = JSON.parse(componentData);
            
            if (droppedComponents.length === 0) {
                $dropZone.empty(); // Clear "Drop components here" text
            }

            droppedComponents.push(component);
            $dropZone.append(`<div class="p-2 bg-gray-600 rounded-lg mb-2">${component.text}</div>`);

            if (droppedComponents.length === components.length) {
                console.log("Achievement Unlocked: Frontend Novice");
                // You can add a more visible notification here
            }
        });

        // GSAP Animation
        gsap.from('.frontend-layer', { opacity: 0, scale: 0.9, duration: 0.5 });
    }

    function initializeBackendLayer() {
        const $output = $('#terminal-output');
        const $input = $('#terminal-input');
        let ws;

        function addOutput(line) {
            let colorClass = 'text-white';
            if (line.type === 'info') colorClass = 'text-green-400';
            if (line.type === 'error') colorClass = 'text-red-400';

            $output.append(`<div><span class="${colorClass}">${line.message}</span></div>`);
            // Scroll to the bottom
            $output.scrollTop($output[0].scrollHeight);
        }

        function connectWebSocket() {
            // Close any existing connection
            if (ws) {
                ws.close();
            }
            
            ws = new WebSocket('ws://localhost:8080');

            ws.onopen = () => {
                addOutput({ type: 'info', message: 'Connected to WebSocket server.' });
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    addOutput(data);
                } catch (error) {
                    addOutput({ type: 'info', message: event.data });
                }
            };

            ws.onclose = () => {
                addOutput({ type: 'info', message: 'Disconnected from WebSocket. Type "connect" to reconnect.' });
            };

            ws.onerror = () => {
                addOutput({ type: 'error', message: 'WebSocket connection error. Is the server running?' });
            }
        }

        function executeCommand(command) {
            switch (command) {
                case 'help':
                    addOutput({ type: 'info', message: 'Available commands: help, clear, connect' });
                    break;
                case 'clear':
                    $output.empty();
                    break;
                case 'connect':
                    addOutput({ type: 'info', message: 'Attempting to reconnect...' });
                    connectWebSocket();
                    break;
                default:
                    addOutput({ type: 'error', message: `Command not found: ${command}` });
            }
        }

        $input.on('keydown', function(e) {
            if (e.key === 'Enter') {
                const command = $(this).val().trim();
                if (command) {
                    addOutput({ type: 'command', message: `> ${command}` });
                    executeCommand(command);
                    $(this).val('');
                }
            }
        });

        // Initial connection
        connectWebSocket();

        // GSAP Animation
        gsap.from('.backend-layer', { opacity: 0, y: 50, duration: 0.5 });
    }

    function initializeCloudLayer() {
        // Animate the glow filter instead of just opacity
        const glowFilter = document.querySelector("#glow feGaussianBlur");

        // GSAP Animation Timeline
        const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1 });

        // Helper function to create a glow animation
        const glowOn = (target) => ({
            opacity: 1,
            attr: { filter: "url(#glow)" },
            onStart: () => gsap.to(glowFilter, { attr: { stdDeviation: 4 }, repeat: 1, yoyo: true, duration: 0.5 }),
        });

        tl.to("#user", glowOn("#user"), 0)
          .to("#load-balancer", glowOn("#load-balancer"), 0.5)
          .to(".ec2-instance", glowOn(".ec2-instance"), 1)
          .to("#database", glowOn("#database"), 1.5);

        // Initial page load animation
        gsap.from('.cloud-layer', { opacity: 0, scale: 0.95, duration: 0.5 });
    }

    // --- Project Modal Logic ---
    const projectData = {
        'chat-app': {
            title: 'Distributed Chat Application',
            description: `
                <p class="mb-4">Engineered a real-time, scalable chat system for a large user base using .NET and Microsoft Orleans. This project was a key initiative at Samsung R&D to explore modern distributed application patterns.</p>
                <h4 class="font-bold text-lg mb-2 text-cyan-300">Key Responsibilities & Achievements:</h4>
                <ul class="list-disc list-inside space-y-2">
                    <li>Designed the core architecture leveraging the Actor model with Microsoft Orleans for stateful services, ensuring high concurrency and fault tolerance.</li>
                    <li>Integrated Apache Kafka as the messaging backbone for an event-driven architecture, enabling asynchronous communication and high-throughput data streams between microservices.</li>
                    <li>Implemented FoundationDB for storing chat metadata and user state, chosen for its scalability and transactional guarantees.</li>
                    <li>Managed the deployment lifecycle on Kubernetes (EKS) using GitOps principles with ArgoCD for automated, declarative, and zero-downtime deployments.</li>
                    <li>Architected for key features like guaranteed message ordering, offline message delivery with zero data loss, and real-time presence indicators.</li>
                </ul>
                <p class="mt-4">This is some extra dummy text to demonstrate the scrolling capability of the modal. When the content exceeds the available height, a scrollbar will appear, allowing the user to see all the details without the modal taking over the entire screen. This ensures a good user experience on all screen sizes.</p>
            `,
            link: '#' // Add GitHub link here
        },
        'cloud-migration': {
            title: 'Scalable Cloud Migration Solution',
            description: `
                <p class="mb-4">At TransUnion, I designed and developed a microservices-based solution to migrate legacy services to AWS, significantly improving deployment speed and infrastructure reliability.</p>
                <h4 class="font-bold text-lg mb-2 text-cyan-300">Key Responsibilities & Achievements:</h4>
                <ul class="list-disc list-inside space-y-2">
                    <li>Developed reusable Terraform modules to automate cloud infrastructure provisioning, which empowered over 10 teams to self-serve their environments.</li>
                    <li>Created a detailed migration plan to transition services to Kubernetes (EKS), incorporating a service mesh (like Istio or Linkerd) and GitOps with Flux v2.</li>
                    <li>This approach improved deployment consistency and dramatically reduced rollback incidents.</li>
                    <li>Integrated HashiCorp Vault for centralized and secure secrets management across all services.</li>
                </ul>
            `,
            link: '#' // Add GitHub link here
        },
        'serverless-fhir': {
            title: 'Serverless FHIR Platform',
            description: `
                <p class="mb-4">During my time at Daffodil Software, I built a scalable, serverless architecture for healthcare applications, ensuring strict compliance with FHIR (Fast Healthcare Interoperability Resources) standards.</p>
                <h4 class="font-bold text-lg mb-2 text-cyan-300">Key Responsibilities & Achievements:</h4>
                <ul class="list-disc list-inside space-y-2">
                    <li>Leveraged a suite of AWS services including Lambda for compute, API Gateway for request handling, Cognito for user authentication, and S3 for storage.</li>
                    <li>Developed custom FHIR servers tailored to specific business needs, enabling secure and standardized data exchange.</li>
                    <li>Migrated existing standalone services to .NET Core to ensure compatibility with modern cloud-native environments.</li>
                </ul>
            `,
            link: '#' // Add GitHub link here
        },
        'travel-engine': {
            title: 'B2B Travel Booking Engine',
            description: `
                <p class="mb-4">At Inventra Technologies, I developed a comprehensive B2B travel application featuring a powerful booking engine that integrated multiple third-party APIs and services.</p>
                <h4 class="font-bold text-lg mb-2 text-cyan-300">Key Responsibilities & Achievements:</h4>
                <ul class="list-disc list-inside space-y-2">
                    <li>Successfully integrated the Amadeus GDS and various other white-label travel services.</li>
                    <li>Designed and implemented a highly scalable database schema on MongoDB, managing over 100 collections for flights, hotels, and user data.</li>
                    <li>This work was recognized with the "Employee of the Year" award in 2015.</li>
                </ul>
            `,
            link: '#' // Add GitHub link here
        }
    };

    function openProjectModal(projectId) {
        const project = projectData[projectId];
        if (!project) return;

        $('#modal-title').text(project.title);
        $('#modal-body').html(project.description);
        $('#modal-link').attr('href', project.link);
        $('#project-modal').removeClass('hidden').addClass('flex');
        lucide.createIcons(); // Re-render icons if any in modal
    }

    function closeProjectModal() {
        $('#project-modal').removeClass('flex').addClass('hidden');
    }

    // Event listeners for modal
    $('#main-content').on('click', '.project-card', function() {
        openProjectModal($(this).data('project-id'));
    });
    $('#close-modal-btn').on('click', closeProjectModal);

    // --- Mock functions from the original React app ---
    // You can define what these do in the new vanilla JS app
    window.toggleMindMap = () => console.log("Toggling Mind Map");
    window.toggleTerminal = () => console.log("Toggling Terminal");
});
