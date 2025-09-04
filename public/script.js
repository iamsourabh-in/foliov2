$(document).ready(function() {
    let isSidebarOpen = true;
    loadLayer(layer='landing'); // Load default layer
    // Initialize Lucide icons
    lucide.createIcons();

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
            }
            // Add other 'else if' blocks for other layers
        });
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

    // --- Mock functions from the original React app ---
    // You can define what these do in the new vanilla JS app
    window.toggleMindMap = () => console.log("Toggling Mind Map");
    window.toggleTerminal = () => console.log("Toggling Terminal");
});
