import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(container, assetLoader) {
        this.container = container;
        this.assetLoader = assetLoader;
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Create camera
        this.setupCamera();
        
        // Create renderer
        this.setupRenderer();
        
        // Create lighting
        this.setupLights();
        
        // Create table
        this.setupTable();
        
        // Set up orbit controls for development
        this.setupOrbitControls();
        
        // Create raycaster for object interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Create object containers with adjusted positions for better visibility
        this.playerCardsGroup = new THREE.Group();
        this.playerCardsGroup.position.set(0, 0.5, 3); // Move player cards closer to camera
        this.scene.add(this.playerCardsGroup);
        console.log("Player cards group position:", this.playerCardsGroup.position);
        
        this.dealerCardsGroup = new THREE.Group();
        this.dealerCardsGroup.position.set(0, 0.5, -3); // Move dealer cards further from camera
        this.scene.add(this.dealerCardsGroup);
        console.log("Dealer cards group position:", this.dealerCardsGroup.position);
        
        // Setup interactive objects registry
        this.interactiveObjects = [];
    }

    setupCamera() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.set(0, 12, 10); // Higher and further back for better view
        this.camera.lookAt(0, 0, 0);
        console.log("Camera position:", this.camera.position);
    }

    setupRenderer() {
        // Check if container is already a canvas
        if (this.container instanceof HTMLCanvasElement) {
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                canvas: this.container
            });
        } else {
            // Create new canvas if container is not a canvas
            const canvas = document.createElement('canvas');
            this.container.appendChild(canvas);
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true,
                canvas: canvas
            });
        }

        // Set renderer size to window size
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Force a render to check if WebGL is working
        this.renderer.render(this.scene, this.camera);
        console.log("Initial render complete - WebGL context:", this.renderer.getContext());
    }

    setupLights() {
        // Main directional light
        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.dirLight.position.set(5, 5, 5);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 1024;
        this.dirLight.shadow.mapSize.height = 1024;
        this.dirLight.shadow.camera.near = 0.5;
        this.dirLight.shadow.camera.far = 50;
        this.dirLight.shadow.bias = -0.001;
        this.scene.add(this.dirLight);
        
        // Add vaporwave ambient light
        const ambientLight = new THREE.AmbientLight(0x33007a, 0.3);
        this.scene.add(ambientLight);
        
        // Add neon style point lights
        this.addNeonLight(0xff00ff, 3, 1, -3, 0.7); // Magenta
        this.addNeonLight(0x00ffff, -3, 1, 3, 0.7); // Cyan
        
        // Animated rotating light for vaporwave effect
        this.rotatingLight = new THREE.PointLight(0xff0080, 0.5, 15);
        this.rotatingLight.position.set(0, 4, 0);
        this.scene.add(this.rotatingLight);
    }
    
    addNeonLight(color, x, y, z, intensity) {
        const light = new THREE.PointLight(color, intensity, 10);
        light.position.set(x, y, z);
        
        // Add a small sphere to represent the light source
        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 })
        );
        lightSphere.position.copy(light.position);
        
        this.scene.add(light);
        this.scene.add(lightSphere);
    }

    setupTable() {
        // Create table geometry
        const tableGeometry = new THREE.PlaneGeometry(20, 20);
        const tableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x006400, // Dark green
            roughness: 0.8,
            metalness: 0.2
        });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.rotation.x = -Math.PI / 2;
        this.table.position.y = -0.1;
        this.table.receiveShadow = true;
        this.scene.add(this.table);

        // Add table border
        const borderGeometry = new THREE.BoxGeometry(22, 0.5, 22);
        const borderMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // Brown
            roughness: 0.7,
            metalness: 0.3
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.y = 0.2;
        border.castShadow = true;
        this.scene.add(border);

        // Add felt texture
        const feltTexture = new THREE.TextureLoader().load('assets/textures/felt.jpg');
        feltTexture.wrapS = THREE.RepeatWrapping;
        feltTexture.wrapT = THREE.RepeatWrapping;
        feltTexture.repeat.set(4, 4);
        this.table.material.map = feltTexture;
        this.table.material.needsUpdate = true;
    }

    setupOrbitControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.update();
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    startRenderLoop(updateCallback) {
        this.updateCallback = updateCallback;
        this.render();
    }

    render() {
        requestAnimationFrame(() => this.render());
        
        // Update orbit controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Call the update callback
        if (this.updateCallback) {
            this.updateCallback();
        }
        
        // Rotate the light for vaporwave effect
        if (this.rotatingLight) {
            const time = Date.now() * 0.001;
            this.rotatingLight.position.x = Math.sin(time * 0.5) * 5;
            this.rotatingLight.position.z = Math.cos(time * 0.5) * 5;
            
            // Slowly cycle the color
            const hue = (time * 0.1) % 1;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            this.rotatingLight.color = color;
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    addCard(card, position, isDealer = false) {
        if (!card || !card.mesh) {
            console.error("Invalid card object:", card);
            return;
        }

        // Set position
        card.mesh.position.copy(position);
        
        // Adjust position based on whether it's dealer's card
        if (isDealer) {
            card.mesh.position.z = -2; // Dealer's cards are further back
        } else {
            card.mesh.position.z = 2; // Player's cards are closer
        }

        // Add to scene
        this.scene.add(card.mesh);
        
        // Add to interactive objects for raycasting
        this.interactiveObjects.push(card.mesh);
        
        // Store card reference in userData
        card.mesh.userData.card = card;
        
        // Enable shadows
        card.mesh.castShadow = true;
        card.mesh.receiveShadow = true;
        
        console.log("Added card to scene:", {
            position: card.mesh.position,
            isDealer: isDealer,
            card: card
        });
    }

    removeCard(cardMesh) {
        // Find and remove from appropriate group
        if (this.playerCardsGroup.children.includes(cardMesh)) {
            this.playerCardsGroup.remove(cardMesh);
        } else if (this.dealerCardsGroup.children.includes(cardMesh)) {
            this.dealerCardsGroup.remove(cardMesh);
        }
        
        // Remove from interactive objects
        const index = this.interactiveObjects.indexOf(cardMesh);
        if (index !== -1) {
            this.interactiveObjects.splice(index, 1);
        }
    }

    clearCards() {
        // Clear player cards
        while (this.playerCardsGroup.children.length > 0) {
            const card = this.playerCardsGroup.children[0];
            this.playerCardsGroup.remove(card);
        }
        
        // Clear dealer cards
        while (this.dealerCardsGroup.children.length > 0) {
            const card = this.dealerCardsGroup.children[0];
            this.dealerCardsGroup.remove(card);
        }
        
        // Clear interactive objects that are cards
        this.interactiveObjects = this.interactiveObjects.filter(obj => !obj.userData.card);
    }

    setupMouseEvents(onObjectClick) {
        this.onObjectClick = onObjectClick; // Store the callback
        
        // Add click event listener
        this.container.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            console.log("Mouse click at:", this.mouse.x, this.mouse.y);
            console.log("Interactive objects:", this.interactiveObjects.length);
            
            // Update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);
            console.log("Intersections:", intersects.length);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                console.log("Clicked on object:", object);
                
                // Find the card associated with this object
                let card = null;
                if (object.userData.card) {
                    card = object.userData.card;
                } else if (object.parent && object.parent.userData.card) {
                    card = object.parent.userData.card;
                }
                
                if (card && this.onObjectClick) {
                    console.log("Card selected:", card);
                    this.onObjectClick(card);
                }
            }
        });
    }

    createEntanglementLine(card1, card2) {
        // Remove any existing entanglement line
        this.removeEntanglementLine();
        
        // Create a line between the two cards
        const points = [];
        points.push(new THREE.Vector3().copy(card1.mesh.position));
        points.push(new THREE.Vector3().copy(card2.mesh.position));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xf48fb1, 
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        
        this.entanglementLine = new THREE.Line(geometry, material);
        this.scene.add(this.entanglementLine);
        
        // Create glowing particles along the line
        this.createEntanglementParticles(points[0], points[1]);
        
        return this.entanglementLine;
    }

    createEntanglementParticles(start, end) {
        // Create particles to visualize entanglement
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xf48fb1,
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / (particleCount - 1);
            const x = start.x + (end.x - start.x) * t;
            const y = start.y + (end.y - start.y) * t;
            const z = start.z + (end.z - start.z) * t;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        this.entanglementParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.entanglementParticles);
    }

    removeEntanglementLine() {
        if (this.entanglementLine) {
            this.scene.remove(this.entanglementLine);
            this.entanglementLine = null;
        }
        
        if (this.entanglementParticles) {
            this.scene.remove(this.entanglementParticles);
            this.entanglementParticles = null;
        }
    }

    updateEntanglementLine(card1, card2) {
        if (this.entanglementLine && card1 && card2) {
            // Update line geometry
            const positions = this.entanglementLine.geometry.attributes.position.array;
            positions[0] = card1.mesh.position.x;
            positions[1] = card1.mesh.position.y;
            positions[2] = card1.mesh.position.z;
            positions[3] = card2.mesh.position.x;
            positions[4] = card2.mesh.position.y;
            positions[5] = card2.mesh.position.z;
            this.entanglementLine.geometry.attributes.position.needsUpdate = true;
            
            // Update particles
            if (this.entanglementParticles) {
                const particlePositions = this.entanglementParticles.geometry.attributes.position.array;
                const particleCount = particlePositions.length / 3;
                
                for (let i = 0; i < particleCount; i++) {
                    const t = i / (particleCount - 1);
                    particlePositions[i * 3] = card1.mesh.position.x + (card2.mesh.position.x - card1.mesh.position.x) * t;
                    particlePositions[i * 3 + 1] = card1.mesh.position.y + (card2.mesh.position.y - card1.mesh.position.y) * t;
                    particlePositions[i * 3 + 2] = card1.mesh.position.z + (card2.mesh.position.z - card1.mesh.position.z) * t;
                }
                
                this.entanglementParticles.geometry.attributes.position.needsUpdate = true;
            }
        }
    }

    update(deltaTime) {
        // Update orbit controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Rotate the light for vaporwave effect
        if (this.rotatingLight) {
            const time = Date.now() * 0.001;
            this.rotatingLight.position.x = Math.sin(time * 0.5) * 5;
            this.rotatingLight.position.z = Math.cos(time * 0.5) * 5;
            
            // Slowly cycle the color
            const hue = (time * 0.1) % 1;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            this.rotatingLight.color = color;
        }
        
        // Log rendering activity occasionally
        if (Math.random() < 0.01) { // Log only 1% of the time to avoid console spam
            console.log("Scene rendering - Player cards:", 
                this.playerCardsGroup.children.length, 
                "Dealer cards:", this.dealerCardsGroup.children.length);
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
} 