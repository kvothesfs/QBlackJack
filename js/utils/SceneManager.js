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
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light with shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 30;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // Add some spotlights for dramatic effect
        const spotLight1 = new THREE.SpotLight(0xffffff, 0.8);
        spotLight1.position.set(-5, 8, 0);
        spotLight1.castShadow = true;
        spotLight1.angle = Math.PI / 6;
        this.scene.add(spotLight1);
        
        const spotLight2 = new THREE.SpotLight(0xffffff, 0.8);
        spotLight2.position.set(5, 8, 0);
        spotLight2.castShadow = true;
        spotLight2.angle = Math.PI / 6;
        this.scene.add(spotLight2);
    }

    setupTable() {
        // Create a green felt table
        const tableGeometry = new THREE.BoxGeometry(15, 0.2, 8);
        const tableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a6640,
            roughness: 0.8,
            metalness: 0.2
        });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.receiveShadow = true;
        this.table.position.set(0, -0.1, 0);
        this.scene.add(this.table);
        
        // Add table border
        const borderGeometry = new THREE.BoxGeometry(15.5, 0.4, 8.5);
        const borderMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a2618,
            roughness: 0.5,
            metalness: 0.3
        });
        const tableBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        tableBorder.position.set(0, -0.2, 0);
        this.scene.add(tableBorder);
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