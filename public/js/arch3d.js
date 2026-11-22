/**
 * Enterprise 3D Architecture Visualizer (Three.js Engine)
 * Renders interactive 3D topology of distributed systems, agentic AI platforms,
 * and GitOps Kubernetes infrastructure with animated data packets and nitty-gritty inspection.
 */

class Architecture3DVisualizer {
    constructor(canvasContainerId) {
        this.container = document.getElementById(canvasContainerId);
        if (!this.container) return;

        this.currentProjectId = 'samsung-agentic';
        this.activeFilter = 'all';
        this.simSpeedMultiplier = 1.0;
        this.autoRotate = false;
        this.selectedNodeId = null;

        this.nodes = new Map();
        this.nodeMeshes = [];
        this.links = [];
        this.packetMeshes = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(-999, -999);
        this.hoveredMesh = null;
        this.animFrameId = null;

        this.initThree();
        this.setupEventListeners();
    }

    initThree() {
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x070b14);
        this.scene.fog = new THREE.FogExp2(0x070b14, 0.022);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
        this.camera.position.set(0, 14, 22);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // 4. OrbitControls
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.06;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
            this.controls.minDistance = 6;
            this.controls.maxDistance = 50;
            this.controls.target.set(0, 1, 0);
        }

        // 5. Lighting
        const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.6);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        keyLight.position.set(15, 25, 20);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xa855f7, 0.8);
        fillLight.position.set(-20, 15, -15);
        this.scene.add(fillLight);

        // 6. Ground Cyber-Grid
        const gridHelper = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
        gridHelper.position.y = -4.5;
        this.scene.add(gridHelper);

        // 7. Base Center Horizon Ring
        const ringGeo = new THREE.RingGeometry(22, 22.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.y = -4.48;
        this.scene.add(ringMesh);
    }

    setupEventListeners() {
        // Window Resize
        window.addEventListener('resize', () => this.onResize());

        // Mouse Move for Raycasting
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            this.checkHover();
        });

        // Click for Node Selection
        this.container.addEventListener('click', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            this.handleClick();
        });

        // Touch events
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
            }
        }, { passive: true });

        this.container.addEventListener('touchend', () => {
            this.handleClick();
        });
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Load an architectural project by ID
     */
    loadProject(projectId) {
        const projectData = window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.arch3dProjects
            ? window.PORTFOLIO_DATA.arch3dProjects[projectId]
            : null;

        if (!projectData) {
            console.error('Project data not found for 3D visualizer:', projectId);
            return;
        }

        this.currentProjectId = projectId;
        this.clearScene();
        this.buildArchitecture(projectData);
        this.updateHeaderUI(projectData);

        // Select first important node by default
        if (projectData.nodes && projectData.nodes.length > 1) {
            const defaultNode = projectData.nodes.find(n => n.tier === 'compute' || n.tier === 'memory') || projectData.nodes[1];
            this.selectNode(defaultNode.id);
        }

        // Reset camera position smoothly
        this.resetCameraView('isometric');
    }

    clearScene() {
        // Remove old node meshes
        this.nodeMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
                else mesh.material.dispose();
            }
        });
        this.nodeMeshes = [];
        this.nodes.clear();

        // Remove old links and packets
        this.links.forEach(l => {
            if (l.mesh) {
                this.scene.remove(l.mesh);
                if (l.mesh.geometry) l.mesh.geometry.dispose();
                if (l.mesh.material) l.mesh.material.dispose();
            }
        });
        this.links = [];

        this.packetMeshes.forEach(p => {
            this.scene.remove(p.mesh);
            if (p.mesh.geometry) p.mesh.geometry.dispose();
            if (p.mesh.material) p.mesh.material.dispose();
        });
        this.packetMeshes = [];
    }

    buildArchitecture(project) {
        const nodeMap = new Map();

        // 1. Create 3D Nodes
        project.nodes.forEach(nodeData => {
            const nodeMeshGroup = this.createNodeMesh(nodeData);
            this.scene.add(nodeMeshGroup);
            this.nodeMeshes.push(nodeMeshGroup);
            this.nodes.set(nodeData.id, { data: nodeData, meshGroup: nodeMeshGroup });
            nodeMap.set(nodeData.id, nodeMeshGroup.position);
        });

        // 2. Create 3D Curved Links & Packet Emitters
        if (project.links) {
            project.links.forEach((linkData, idx) => {
                const sourcePos = nodeMap.get(linkData.source);
                const targetPos = nodeMap.get(linkData.target);
                if (!sourcePos || !targetPos) return;

                const linkObj = this.createLink(sourcePos, targetPos, linkData);
                this.scene.add(linkObj.mesh);
                this.links.push(linkObj);

                // Add 2 glowing packet pulses per link traveling in sequence
                for (let i = 0; i < 2; i++) {
                    const packetMesh = this.createPacket(linkData.color || '#38bdf8');
                    this.scene.add(packetMesh);
                    this.packetMeshes.push({
                        mesh: packetMesh,
                        curve: linkObj.curve,
                        progress: i * 0.5,
                        speed: (linkData.speed || 1.0) * 0.003
                    });
                }
            });
        }
    }

    createNodeMesh(node) {
        const group = new THREE.Group();
        group.position.set(node.pos[0], node.pos[1], node.pos[2]);
        group.userData = { nodeId: node.id, nodeData: node };

        const colorHex = parseInt((node.color || '#38bdf8').replace('#', '0x'), 16);

        // Core Geometry
        let coreGeo;
        switch (node.shape) {
            case 'cylinder':
                coreGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16);
                break;
            case 'sphere':
                coreGeo = new THREE.SphereGeometry(0.9, 24, 24);
                break;
            case 'octahedron':
                coreGeo = new THREE.OctahedronGeometry(1.0);
                break;
            case 'dodecahedron':
                coreGeo = new THREE.DodecahedronGeometry(0.95);
                break;
            case 'box':
            default:
                coreGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
                break;
        }

        const coreMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.35,
            roughness: 0.25,
            metalness: 0.75,
            transparent: true,
            opacity: 0.95
        });

        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.castShadow = true;
        group.add(coreMesh);
        group.coreMesh = coreMesh;

        // Rotating Wireframe Tech Ring
        const ringGeo = new THREE.TorusGeometry(1.5, 0.035, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.65
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);
        group.ringMesh = ringMesh;

        // Base Glow Pedestal
        const baseDiscGeo = new THREE.CircleGeometry(1.4, 24);
        const baseDiscMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
        baseDisc.rotation.x = Math.PI / 2;
        baseDisc.position.y = -1.2;
        group.add(baseDisc);

        // Billboard Floating Name Sprite (High-DPI Canvas)
        const labelSprite = this.createLabelSprite(node.name, node.category, node.color);
        labelSprite.position.set(0, 1.7, 0);
        group.add(labelSprite);
        group.labelSprite = labelSprite;

        // Clickable hitbox sphere
        const hitGeo = new THREE.SphereGeometry(1.7, 12, 12);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData = { nodeId: node.id, parentGroup: group };
        group.add(hitMesh);
        group.hitMesh = hitMesh;

        return group;
    }

    createLabelSprite(text, category, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Draw pill background
        ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
        ctx.strokeStyle = color || '#38bdf8';
        ctx.lineWidth = 4;
        this.roundRect(ctx, 16, 16, 480, 96, 20, true, true);

        // Category Tag
        ctx.fillStyle = color || '#38bdf8';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText((category || 'SERVICE').toUpperCase(), 256, 48);

        // Main Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const truncated = text.length > 28 ? text.substring(0, 26) + '...' : text;
        ctx.fillText(truncated, 256, 88);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(4.2, 1.05, 1);
        return sprite;
    }

    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    createLink(sourcePos, targetPos, linkData) {
        // Curve elevated slightly in Y to form an elegant arc
        const midPoint = new THREE.Vector3().addVectors(sourcePos, targetPos).multiplyScalar(0.5);
        const distance = sourcePos.distanceTo(targetPos);
        midPoint.y += Math.min(distance * 0.22, 3.5);

        const curve = new THREE.QuadraticBezierCurve3(sourcePos, midPoint, targetPos);
        const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.035, 6, false);

        const colorHex = parseInt((linkData.color || '#38bdf8').replace('#', '0x'), 16);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.45
        });

        const mesh = new THREE.Mesh(tubeGeo, tubeMat);
        mesh.userData = { linkData };

        return { mesh, curve, linkData };
    }

    createPacket(color) {
        const geo = new THREE.SphereGeometry(0.18, 12, 12);
        const colorHex = parseInt(color.replace('#', '0x'), 16);
        const mat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.95
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Add small point light around packet
        const light = new THREE.PointLight(colorHex, 0.8, 3);
        mesh.add(light);
        return mesh;
    }

    checkHover() {
        if (!this.nodeMeshes.length) return;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hitMeshes = this.nodeMeshes.map(g => g.hitMesh).filter(Boolean);
        const intersects = this.raycaster.intersectObjects(hitMeshes);

        if (intersects.length > 0) {
            const hitGroup = intersects[0].object.userData.parentGroup;
            if (this.hoveredMesh !== hitGroup) {
                if (this.hoveredMesh && this.hoveredMesh.ringMesh) {
                    this.hoveredMesh.ringMesh.scale.set(1, 1, 1);
                }
                this.hoveredMesh = hitGroup;
                if (this.hoveredMesh.ringMesh) {
                    this.hoveredMesh.ringMesh.scale.set(1.2, 1.2, 1.2);
                }
                this.container.style.cursor = 'pointer';
            }
        } else {
            if (this.hoveredMesh && this.hoveredMesh.ringMesh) {
                this.hoveredMesh.ringMesh.scale.set(1, 1, 1);
            }
            this.hoveredMesh = null;
            this.container.style.cursor = 'default';
        }
    }

    handleClick() {
        if (!this.nodeMeshes.length) return;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hitMeshes = this.nodeMeshes.map(g => g.hitMesh).filter(Boolean);
        const intersects = this.raycaster.intersectObjects(hitMeshes);

        if (intersects.length > 0) {
            const hitGroup = intersects[0].object.userData.parentGroup;
            const nodeId = hitGroup.userData.nodeId;
            this.selectNode(nodeId);
        }
    }

    /**
     * Select a node and populate the Inspector Drawer
     */
    selectNode(nodeId) {
        const nodeEntry = this.nodes.get(nodeId);
        if (!nodeEntry) return;

        this.selectedNodeId = nodeId;
        const node = nodeEntry.data;
        const group = nodeEntry.meshGroup;

        // Highlight selected node
        this.nodeMeshes.forEach(g => {
            if (g.coreMesh) {
                const isSelected = g.userData.nodeId === nodeId;
                g.coreMesh.material.emissiveIntensity = isSelected ? 0.9 : 0.35;
                if (g.ringMesh) {
                    g.ringMesh.material.opacity = isSelected ? 1.0 : 0.5;
                }
            }
        });

        // Smooth camera tween towards target
        this.focusCameraOn(group.position);

        // Update DOM Inspector Drawer
        this.populateInspector(node);
    }

    focusCameraOn(targetPos) {
        if (!this.controls) return;
        const targetX = targetPos.x;
        const targetY = targetPos.y + 1;
        const targetZ = targetPos.z;

        // Smoothly adjust OrbitControls target
        const startTarget = this.controls.target.clone();
        const endTarget = new THREE.Vector3(targetX, targetY, targetZ);

        let progress = 0;
        const step = () => {
            progress += 0.08;
            this.controls.target.lerpVectors(startTarget, endTarget, progress);
            if (progress < 1.0) {
                requestAnimationFrame(step);
            }
        };
        step();
    }

    populateInspector(node) {
        const drawer = document.getElementById('arch3d-inspector-content');
        if (!drawer) return;

        const badgeColor = node.color || '#38bdf8';
        drawer.innerHTML = `
            <div class="inspector-header">
                <div class="flex items-center justify-between">
                    <span class="inspector-tier-chip" style="background:${badgeColor}20; color:${badgeColor}; border:1px solid ${badgeColor}60;">
                        <i class="fas fa-microchip"></i> ${node.category.toUpperCase()}
                    </span>
                    <span class="inspector-status-badge text-green font-mono">
                        <span class="status-dot green"></span> ${node.status || 'ACTIVE'}
                    </span>
                </div>
                <h4 class="inspector-node-title text-white font-bold mt-2">${node.name}</h4>
                <div class="text-muted font-mono" style="font-size:0.75rem;">TIER: ${node.tier.toUpperCase()} • ID: ${node.id}</div>
            </div>

            <!-- Deep Dive: How it works -->
            <div class="inspector-card mt-3">
                <div class="inspector-card-label text-cyan font-mono"><i class="fas fa-gears"></i> HOW THIS COMPONENT OPERATES:</div>
                <p class="inspector-card-text text-gray-200 mt-1">${node.howItWorks}</p>
            </div>

            <!-- Tech Stack Pills -->
            <div class="inspector-card mt-3">
                <div class="inspector-card-label text-gold font-mono"><i class="fas fa-layer-group"></i> PRODUCTION TECH STACK & PROTOCOLS:</div>
                <div class="inspector-tags-row mt-1">
                    ${(node.techStack || '').split(',').map(t => `<span class="inspector-tag-pill font-mono">${t.trim()}</span>`).join('')}
                </div>
            </div>

            <!-- Resilience & Fault-Tolerance -->
            <div class="inspector-card mt-3">
                <div class="inspector-card-label text-purple font-mono"><i class="fas fa-shield-halved"></i> RESILIENCE & FAILURE TOLERANCE:</div>
                <p class="inspector-card-text text-gray-200 mt-1">${node.resilience}</p>
            </div>

            <!-- Deployment Manifest Snippet -->
            <div class="inspector-card mt-3">
                <div class="flex items-center justify-between">
                    <div class="inspector-card-label text-green font-mono"><i class="fas fa-code"></i> DEPLOYMENT / INFRA MANIFEST:</div>
                    <button class="copy-manifest-btn font-mono" onclick="window.copyToClipboard('${encodeURIComponent(node.deployment)}')">
                        <i class="fas fa-copy"></i> COPY
                    </button>
                </div>
                <pre class="inspector-code-block font-mono mt-1"><code>${this.escapeHtml(node.deployment)}</code></pre>
            </div>
        `;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    updateHeaderUI(project) {
        const titleEl = document.getElementById('arch3d-modal-title');
        const badgeEl = document.getElementById('arch3d-modal-badge');
        const taglineEl = document.getElementById('arch3d-modal-tagline');
        const statsEl = document.getElementById('arch3d-modal-stats');

        if (titleEl) titleEl.textContent = project.title;
        if (badgeEl) badgeEl.textContent = project.badge;
        if (taglineEl) taglineEl.textContent = project.tagline;

        if (statsEl && project.metrics) {
            statsEl.innerHTML = project.metrics.map(m => `
                <div class="arch3d-stat-pill font-mono">
                    <span class="text-muted">${m.label}:</span>
                    <span class="text-cyan font-bold">${m.val}</span>
                </div>
            `).join('');
        }

        // Active tab pill highlighting
        document.querySelectorAll('.arch3d-project-tab').forEach(btn => {
            if (btn.dataset.project === project.id) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    applyFilter(tier) {
        this.activeFilter = tier;
        document.querySelectorAll('.arch3d-filter-btn').forEach(btn => {
            if (btn.dataset.tier === tier) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Dim or brighten nodes based on filter
        this.nodeMeshes.forEach(meshGroup => {
            const nodeTier = meshGroup.userData.nodeData.tier;
            const matches = tier === 'all' || nodeTier === tier;
            meshGroup.traverse(child => {
                if (child.material) {
                    child.material.opacity = matches ? 0.95 : 0.15;
                    child.material.transparent = true;
                }
            });
            if (meshGroup.labelSprite) {
                meshGroup.labelSprite.material.opacity = matches ? 0.95 : 0.12;
            }
        });
    }

    resetCameraView(preset) {
        if (!this.controls) return;
        switch (preset) {
            case 'topdown':
                this.camera.position.set(0, 32, 0.1);
                this.controls.target.set(0, 0, 0);
                break;
            case 'front':
                this.camera.position.set(0, 4, 25);
                this.controls.target.set(0, 1, 0);
                break;
            case 'isometric':
            default:
                this.camera.position.set(0, 14, 22);
                this.controls.target.set(0, 1, 0);
                break;
        }
        this.controls.update();
    }

    setTrafficSpeed(multiplier) {
        this.simSpeedMultiplier = parseFloat(multiplier);
        const speedValEl = document.getElementById('arch3d-speed-val');
        if (speedValEl) speedValEl.textContent = `${this.simSpeedMultiplier.toFixed(1)}x`;
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
        if (this.controls) {
            this.controls.autoRotate = this.autoRotate;
            this.controls.autoRotateSpeed = 1.2;
        }
        const btn = document.getElementById('arch3d-autorotate-btn');
        if (btn) {
            if (this.autoRotate) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    }

    startAnimation() {
        if (this.animFrameId) return;

        const clock = new THREE.Clock();

        const animate = () => {
            this.animFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            // 1. Update Controls
            if (this.controls) this.controls.update();

            // 2. Rotate node rings & gentle floating
            const time = clock.getElapsedTime();
            this.nodeMeshes.forEach(meshGroup => {
                if (meshGroup.ringMesh) {
                    meshGroup.ringMesh.rotation.z += 0.015;
                }
                // Gentle floating up/down
                meshGroup.position.y += Math.sin(time * 2 + meshGroup.position.x) * 0.0015;
            });

            // 3. Update Animated Packets
            this.packetMeshes.forEach(packet => {
                packet.progress = (packet.progress + packet.speed * this.simSpeedMultiplier * 1.5) % 1.0;
                const point = packet.curve.getPointAt(packet.progress);
                packet.mesh.position.copy(point);
            });

            // 4. Render
            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    stopAnimation() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }
}

// Global modal handlers
window.open3DArchModal = function(projectId = 'samsung-agentic') {
    const modal = document.getElementById('arch-3d-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!window.arch3dInstance) {
        window.arch3dInstance = new Architecture3DVisualizer('arch3d-canvas-viewport');
    }

    window.arch3dInstance.loadProject(projectId);
    window.arch3dInstance.onResize();
    window.arch3dInstance.startAnimation();
};

window.close3DArchModal = function() {
    const modal = document.getElementById('arch-3d-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';

    if (window.arch3dInstance) {
        window.arch3dInstance.stopAnimation();
    }
};

window.switch3DArchProject = function(projectId) {
    if (window.arch3dInstance) {
        window.arch3dInstance.loadProject(projectId);
    }
};

window.filter3DArchLayer = function(tier) {
    if (window.arch3dInstance) {
        window.arch3dInstance.applyFilter(tier);
    }
};

window.set3DArchCamera = function(preset) {
    if (window.arch3dInstance) {
        window.arch3dInstance.resetCameraView(preset);
    }
};

window.set3DArchSpeed = function(speed) {
    if (window.arch3dInstance) {
        window.arch3dInstance.setTrafficSpeed(speed);
    }
};

window.toggle3DArchAutoRotate = function() {
    if (window.arch3dInstance) {
        window.arch3dInstance.toggleAutoRotate();
    }
};

window.copyToClipboard = function(encodedText) {
    const text = decodeURIComponent(encodedText);
    navigator.clipboard.writeText(text).then(() => {
        if (window.showToast) window.showToast('Copied deployment manifest to clipboard!');
    }).catch(() => {
        console.log('Failed to copy text');
    });
};

// Keyboard ESC to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('arch-3d-modal');
        if (modal && modal.classList.contains('active')) {
            window.close3DArchModal();
        }
    }
});
