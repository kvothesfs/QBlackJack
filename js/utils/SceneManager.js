import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
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
        
        // Create object containers
        this.playerCardsGroup = new THREE.Group();
        this.playerCardsGroup.position.set(0, 0.1, 1);
        this.scene.add(this.playerCardsGroup);
        
        this.dealerCardsGroup = new THREE.Group();
        this.dealerCardsGroup.position.set(0, 0.1, -1);
        this.scene.add(this.dealerCardsGroup);
        
        // Setup interactive objects registry
        this.interactiveObjects = [];
    }

    setupCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.set(0, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
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
        // Create a vaporwave-themed table
        const tableGeometry = new THREE.BoxGeometry(15, 0.2, 8);
        const tableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a4b40, // Dark teal
            roughness: 0.7,
            metalness: 0.3,
            map: this.assetLoader.getTexture('table')
        });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.receiveShadow = true;
        this.table.position.set(0, -0.1, 0);
        this.scene.add(this.table);
        
        // Add table border with gradient color
        const borderGeometry = new THREE.BoxGeometry(15.5, 0.4, 8.5);
        const borderMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x9400D3, // Violet
            roughness: 0.5,
            metalness: 0.5,
            emissive: 0x450066,
            emissiveIntensity: 0.2
        });
        const tableBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        tableBorder.position.set(0, -0.2, 0);
        tableBorder.receiveShadow = true;
        this.scene.add(tableBorder);
        
        // Add grid lines on the table
        this.addGridLines();
    }
    
    addGridLines() {
        // Create a grid with cyan lines
        const gridSize = 30;
        const gridDivisions = 20;
        const gridColor = 0x00FFFF; // Cyan
        
        const grid = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor);
        grid.position.y = 0.001; // Just above the table
        grid.material.transparent = true;
        grid.material.opacity = 0.15;
        this.scene.add(grid);
        
        // Add a second grid rotated for vaporwave perspective effect
        const grid2 = new THREE.GridHelper(gridSize, gridDivisions, 0xFF00FF, 0xFF00FF); // Magenta
        grid2.position.y = 0.002; // Just above the first grid
        grid2.rotation.z = Math.PI / 4; // 45 degrees
        grid2.material.transparent = true;
        grid2.material.opacity = 0.1;
        this.scene.add(grid2);
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
        const group = isDealer ? this.dealerCardsGroup : this.playerCardsGroup;
        group.add(card.mesh);
        
        // Position the card within its group
        card.mesh.position.copy(position);
        
        // Add to interactive objects if player card
        if (!isDealer) {
            this.interactiveObjects.push(card.mesh);
            card.mesh.userData.card = card;
        }
        
        return card.mesh;
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
        this.container.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
            
            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (onObjectClick && object.userData.card) {
                    onObjectClick(object.userData.card);
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
} 