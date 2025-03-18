import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(canvas, assetLoader) {
        console.log("Creating SceneManager");
        this.canvas = canvas;
        this.assetLoader = assetLoader;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cardObjects = [];
        this.tableObject = null;
        this.clickListeners = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.initialized = false;
    }

    async initialize() {
        console.log("Initializing SceneManager");
        
        if (!this.canvas) {
            console.error("Cannot initialize SceneManager - Canvas element not found");
            return false;
        }

        try {
            // Create scene with vaporwave colors
            this.scene = new THREE.Scene();
            console.log("Scene created");
            
            if (!this.scene) {
                console.error("Failed to create Three.js scene");
                return false;
            }
            
            // Create a gradient background for vaporwave feel
            const bgTexture = this.createVaporwaveBackground();
            this.scene.background = bgTexture;

            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            console.log("Camera created");
            
            if (!this.camera) {
                console.error("Failed to create Three.js camera");
                return false;
            }
            
            // Improved camera positioning for better card viewing
            this.camera.position.set(0, 8, 7); // Higher and further back for better overview
            this.camera.lookAt(0, 0, 0);

            // Add orbit controls for better user interaction
            this.controls = new OrbitControls(this.camera, this.canvas);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 3;
            this.controls.maxDistance = 20;
            this.controls.maxPolarAngle = Math.PI / 2;
            console.log("Orbit controls added");

            // Create renderer
            try {
                this.renderer = new THREE.WebGLRenderer({
                    canvas: this.canvas,
                    antialias: true
                });
                console.log("Renderer created");
                
                if (!this.renderer) {
                    console.error("Failed to create Three.js renderer");
                    return false;
                }
                
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            } catch (rendererError) {
                console.error("Error creating WebGL renderer:", rendererError);
                
                // Create a message on the canvas that WebGL failed
                const ctx = this.canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#000033'; // Dark blue background
                    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    ctx.fillStyle = '#ff00ff'; // Magenta text
                    ctx.font = '24px VT323, monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('WebGL not supported', this.canvas.width/2, this.canvas.height/2);
                    ctx.fillText('Please use a WebGL-compatible browser', this.canvas.width/2, this.canvas.height/2 + 30);
                }
                
                return false;
            }

            // Add vaporwave-styled lights
            console.log("Adding lights with vaporwave colors");
            this.addLights();
            console.log("Lights added");

            // Add table with vaporwave styling
            console.log("Adding table with vaporwave styling");
            const tableResult = await this.addTable();
            if (!tableResult) {
                console.error("Failed to add table to scene");
                return false;
            }
            console.log("Table added");

            // Add event listeners
            this.setupMouseEvents();
            console.log("Mouse events set up");

            // Initialize card objects array
            this.cardObjects = [];
            
            // Mark as initialized
            this.initialized = true;
            console.log("SceneManager initialized successfully");
            
            // Start animation
            this.animate();
            
            return true;
        } catch (error) {
            console.error("Error initializing SceneManager:", error);
            return false;
        }
    }
    
    animate() {
        if (!this.initialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        try {
            // Update animations and effects
            this.update(0.016); // Approximately 60fps
            
            // Update orbit controls
            if (this.controls) {
                this.controls.update();
            }
            
            // Render the scene
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.error("Error in animation loop:", error);
        }
    }

    addLights() {
        // Ambient light for overall illumination - brighter
        const ambientLight = new THREE.AmbientLight(0x606060, 1.2);
        this.scene.add(ambientLight);

        // Directional light for shadows - positioned for better card visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 12, 8);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -15;
        directionalLight.shadow.camera.right = 15;
        directionalLight.shadow.camera.top = 15;
        directionalLight.shadow.camera.bottom = -15;
        directionalLight.shadow.mapSize.width = 4096; // Higher resolution shadows
        directionalLight.shadow.mapSize.height = 4096;
        this.scene.add(directionalLight);

        // Add a helper light from player's perspective for better card illumination
        const playerLight = new THREE.PointLight(0xffffff, 0.6);
        playerLight.position.set(0, 5, 6);
        this.scene.add(playerLight);

        // Point light for table with quantum-themed color
        const tableLight = new THREE.PointLight(0x00ffff, 0.7);
        tableLight.position.set(0, 3, 0);
        this.scene.add(tableLight);
        
        // Add subtle red point light for dealer's side
        const dealerLight = new THREE.PointLight(0xff6ad5, 0.5); // Magenta
        dealerLight.position.set(0, 3, -6);
        this.scene.add(dealerLight);
    }

    async addTable() {
        try {
            console.log("Creating vaporwave-style table");
            
            // Create table surface geometry (a simple flat plane)
            const tableGeometry = new THREE.PlaneGeometry(20, 12);
            
            // Create table material with vaporwave look
            const tableMaterial = new THREE.MeshStandardMaterial({
                color: 0x330066, // Deep purple
                roughness: 0.7,
                metalness: 0.3,
                emissive: 0x000033, // Dark blue glow
                emissiveIntensity: 0.2
            });
            
            // Create table mesh
            this.tableObject = new THREE.Mesh(tableGeometry, tableMaterial);
            this.tableObject.rotation.x = -Math.PI / 2; // Rotate to lay flat
            this.tableObject.position.y = 0;
            this.tableObject.receiveShadow = true;
            
            // Add table to scene
            this.scene.add(this.tableObject);
            
            // Add table grid lines (for vaporwave aesthetic)
            await this.addTableGridLines();
            
            // Add a rim around the table with neon colors
            const rimGeometry = new THREE.BoxGeometry(20.5, 0.3, 0.5);
            const rimMaterial = new THREE.MeshStandardMaterial({
                color: 0x000033, // Dark blue
                roughness: 0.3,
                metalness: 0.8,
                emissive: 0x00ffff, // Cyan glow
                emissiveIntensity: 0.8
            });
            
            // Create the four sides of the rim with neon effect
            const topRim = new THREE.Mesh(rimGeometry, rimMaterial);
            topRim.position.set(0, 0.15, -6.25);
            this.scene.add(topRim);
            
            const bottomRim = new THREE.Mesh(rimGeometry, rimMaterial);
            bottomRim.position.set(0, 0.15, 6.25);
            this.scene.add(bottomRim);
            
            const leftRimGeometry = new THREE.BoxGeometry(0.5, 0.3, 12.5);
            const leftRim = new THREE.Mesh(leftRimGeometry, rimMaterial);
            leftRim.position.set(-10.25, 0.15, 0);
            this.scene.add(leftRim);
            
            const rightRim = new THREE.Mesh(leftRimGeometry, rimMaterial);
            rightRim.position.set(10.25, 0.15, 0);
            this.scene.add(rightRim);
            
            console.log("Vaporwave table created successfully");
            return true;
        } catch (error) {
            console.error("Error creating table:", error);
            return false;
        }
    }
    
    async addTableGridLines() {
        // Add grid lines to the table for vaporwave aesthetic
        const gridSize = 1; // Grid cell size
        const tableWidth = 20;
        const tableLength = 12;
        
        // Create materials for grid lines
        const horizontalLineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, // Cyan for horizontal lines
            transparent: true,
            opacity: 0.3
        });
        
        const verticalLineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xff00ff, // Magenta for vertical lines
            transparent: true,
            opacity: 0.3
        });
        
        // Create horizontal grid lines
        for (let z = -tableLength/2; z <= tableLength/2; z += gridSize) {
            const points = [];
            points.push(new THREE.Vector3(-tableWidth/2, 0.01, z));
            points.push(new THREE.Vector3(tableWidth/2, 0.01, z));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, horizontalLineMaterial);
            this.scene.add(line);
        }
        
        // Create vertical grid lines
        for (let x = -tableWidth/2; x <= tableWidth/2; x += gridSize) {
            const points = [];
            points.push(new THREE.Vector3(x, 0.01, -tableLength/2));
            points.push(new THREE.Vector3(x, 0.01, tableLength/2));
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, verticalLineMaterial);
            this.scene.add(line);
        }
        
        return true;
    }

    setupMouseEvents(onCardClick) {
        if (!this.canvas) {
            console.error("Canvas element not found for mouse events");
            return;
        }

        // Mouse move event handler
        this.canvas.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Mouse click event handler
        this.canvas.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects(this.cardObjects);

            if (intersects.length > 0) {
                // Get the first intersected card
                const selectedCard = intersects[0].object.userData.card;
                
                if (selectedCard && onCardClick) {
                    onCardClick(selectedCard);
                }
            }
        });

        if (onCardClick) {
            this.clickListeners.push(onCardClick);
        }
    }

    clearScene() {
        console.log("Clearing scene");
        
        if (!this.scene) {
            console.error("Cannot clear scene - scene object is null");
            return false;
        }
        
        if (!this.initialized) {
            console.error("Cannot clear scene - SceneManager not initialized");
            return false;
        }

        try {
            // Remove all card objects
            if (this.cardObjects && this.cardObjects.length > 0) {
                for (const cardObj of this.cardObjects) {
                    if (!cardObj) continue;
                    
                    // Remove from scene
                    this.scene.remove(cardObj);
                    
                    // Dispose of geometries and materials
                    if (cardObj.geometry) cardObj.geometry.dispose();
                    if (cardObj.material) {
                        if (Array.isArray(cardObj.material)) {
                            cardObj.material.forEach(material => {
                                if (material) material.dispose();
                            });
                        } else if (cardObj.material) {
                            cardObj.material.dispose();
                        }
                    }
                }
            }
            
            // Clear the card objects array
            this.cardObjects = [];
            
            // Keep the table and lights, but remove other objects
            const objectsToKeep = [this.tableObject];
            const objectsToRemove = [];
            
            this.scene.traverse(object => {
                if (object instanceof THREE.Mesh && !objectsToKeep.includes(object)) {
                    objectsToRemove.push(object);
                }
            });
            
            // Remove objects
            for (const obj of objectsToRemove) {
                if (!obj) continue;
                
                this.scene.remove(obj);
                
                // Dispose of geometries and materials
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(material => {
                            if (material) material.dispose();
                        });
                    } else if (obj.material) {
                        obj.material.dispose();
                    }
                }
            }
            
            console.log("Scene cleared successfully");
            return true;
        } catch (error) {
            console.error("Error clearing scene:", error);
            return false;
        }
    }

    addCard(card, position, rotation, isPlayerCard = true) {
        if (!this.initialized) {
            console.error("Cannot add card - SceneManager not initialized");
            return null;
        }

        try {
            console.log(`Adding card: ${card.toString()} at position`, position);
            
            // Create card mesh with slightly larger dimensions for better visibility
            const cardGeometry = new THREE.BoxGeometry(1.2, 0.05, 1.8);
            
            // Create materials for each side of the card - using card's own texture generation methods
            let frontTexture, backTexture;
            
            try {
                // Use the card's own createCardTexture method if it exists
                if (typeof card.createCardTexture === 'function') {
                    console.log("Using card's own texture generation");
                    frontTexture = card.createCardTexture();
                } else {
                    console.log("Falling back to SceneManager texture generation");
                    frontTexture = this.createCardTexture(card);
                }
                
                // Always use SceneManager's back texture for consistency
                backTexture = this.createCardBackTexture();
                
                console.log("Card textures created successfully");
            } catch (textureError) {
                console.error("Error creating card textures:", textureError);
                // Fallback to simple colored materials if texture creation fails
                frontTexture = null;
                backTexture = null;
            }
            
            // Create materials with or without textures
            const materials = [
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Right side
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Left side
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Top edge
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Bottom edge
                new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.2, metalness: 0.1 }), // Front face
                new THREE.MeshStandardMaterial({ map: backTexture, roughness: 0.3, metalness: 0.2 }) // Back face
            ];
            
            // Save original textures in userData for reference/restoration
            if (frontTexture) {
                materials[4].userData.originalMap = frontTexture;
            }
            if (backTexture) {
                materials[5].userData.originalMap = backTexture;
            }
            
            // Create card mesh with geometry and materials
            const cardMesh = new THREE.Mesh(cardGeometry, materials);
            
            // Set position and rotation
            cardMesh.position.copy(position);
            if (rotation) {
                cardMesh.rotation.copy(rotation);
            }
            
            // Adjust the Y position slightly to avoid z-fighting with the table
            cardMesh.position.y = 0.03;
            
            // Add shadow casting and receiving
            cardMesh.castShadow = true;
            cardMesh.receiveShadow = true;
            
            // Store card reference in userData for raycasting and interaction
            cardMesh.userData.card = card;
            cardMesh.userData.isCard = true; // Mark as card for quick filtering
            
            // Store orientation info
            cardMesh.userData.isPlayerCard = isPlayerCard;
            
            // Add card to the scene
            this.scene.add(cardMesh);
            this.cardObjects.push(cardMesh);
            
            // Store mesh reference in card
            card.mesh = cardMesh;
            
            // Apply quantum effects if the card is already in a quantum state
            if (card.isInSuperposition) {
                console.log("Card is in superposition - applying visual effects");
                this.applyQuantumEffects(cardMesh, card);
            } else if (card.isEntangled) {
                console.log("Card is entangled - applying visual effects");
                this.applyEntanglementEffects(cardMesh, card);
            }
            
            // If player card, adjust position to be more visible
            if (isPlayerCard) {
                cardMesh.position.z += 0.1;
                cardMesh.rotation.x = -0.2; // Tilt slightly toward camera
            }
            
            console.log("Card added successfully:", card.toString());
            return cardMesh;
        } catch (error) {
            console.error("Error adding card:", error);
            return null;
        }
    }

    createCardTexture(card) {
        // Canvas for drawing card face
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        
        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw card border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Value and suit
        const value = card.value;
        const suit = card.suit;
        
        // Font and color based on suit
        ctx.font = '120px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        if (suit === 'hearts' || suit === 'diamonds') {
            ctx.fillStyle = '#ff0000';
        } else {
            ctx.fillStyle = '#000000';
        }
        
        // Draw value at top left and bottom right
        const valueText = this.getCardValueText(value);
        
        // Top left value
        ctx.font = '80px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(valueText, 40, 100);
        
        // Bottom right value (upside down)
        ctx.save();
        ctx.translate(canvas.width - 40, canvas.height - 40);
        ctx.rotate(Math.PI);
        ctx.textAlign = 'right';
        ctx.fillText(valueText, 0, 0);
        ctx.restore();
        
        // Draw suit symbols
        const suitSymbol = this.getSuitSymbol(suit);
        
        // Top left suit
        ctx.font = '80px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(suitSymbol, 40, 170);
        
        // Bottom right suit (upside down)
        ctx.save();
        ctx.translate(canvas.width - 40, canvas.height - 100);
        ctx.rotate(Math.PI);
        ctx.textAlign = 'right';
        ctx.fillText(suitSymbol, 0, 0);
        ctx.restore();
        
        // Large central suit
        ctx.font = '300px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(suitSymbol, canvas.width / 2, canvas.height / 2 + 75);
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }

    createCardBackTexture() {
        // Canvas for drawing card back
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        
        // Background color
        ctx.fillStyle = '#0000cc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Card pattern (simple grid)
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        
        // Draw grid
        const gridSize = 30;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw decorative elements
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QUANTUM', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('CARDS', canvas.width / 2, canvas.height / 2 + 30);
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }

    getCardValueText(value) {
        // Convert numerical card values to text representation
        switch (value) {
            case 1: return 'A';
            case 11: return 'J';
            case 12: return 'Q';
            case 13: return 'K';
            default: return value.toString();
        }
    }

    getSuitSymbol(suit) {
        // Convert suit names to unicode symbols
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '?';
        }
    }

    flipCard(card, faceUp = true) {
        if (!card || !card.mesh) {
            console.error("Cannot flip card - invalid card or missing mesh", card);
            return;
        }

        try {
            // Animate the card flip
            const mesh = card.mesh;
            const initialRotation = mesh.rotation.y;
            const targetRotation = faceUp ? 0 : Math.PI;
            
            // Use a simple animation loop
            let progress = 0;
            const duration = 500; // ms
            const startTime = Date.now();
            
            const animate = () => {
                const currentTime = Date.now();
                progress = Math.min(1, (currentTime - startTime) / duration);
                
                // Easing function for smoother animation
                const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                
                // Update rotation
                mesh.rotation.y = initialRotation * (1 - eased) + targetRotation * eased;
                
                // Continue animation if not complete
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation complete
                    card.isFaceUp = faceUp;
                    mesh.rotation.y = targetRotation;
                }
            };
            
            // Start animation
            animate();
        } catch (error) {
            console.error("Error flipping card:", error);
        }
    }

    render() {
        if (!this.renderer || !this.scene || !this.camera) return;
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        if (!this.renderer || !this.camera) return;
        
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    update(deltaTime) {
        // Update card animations, effects, etc.
        for (const cardObj of this.cardObjects) {
            const card = cardObj.userData.card;
            if (card) {
                // Update superposition effects
                if (card.isInSuperposition) {
                    // Make the card pulse/glow with phase-dependent intensity
                    const pulseAmount = 0.1 * Math.sin(Date.now() * 0.003 + card.phase);
                    cardObj.scale.set(1 + pulseAmount, 1, 1 + pulseAmount);
                    
                    // Add cyan glow effect with phase-dependent intensity
                    if (cardObj.material && Array.isArray(cardObj.material)) {
                        const emissiveIntensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.005 + card.phase);
                        for (const mat of cardObj.material) {
                            mat.emissive = new THREE.Color(0, 1, 1);
                            mat.emissiveIntensity = emissiveIntensity;
                        }
                    }
                    
                    // Add interference pattern effect
                    if (cardObj.material && Array.isArray(cardObj.material) && cardObj.material[4]) {
                        // Front face material
                        const frontMat = cardObj.material[4];
                        if (!frontMat.userData.originalMap) {
                            frontMat.userData.originalMap = frontMat.map;
                        }
                        
                        // Create interference pattern texture
                        const interferenceTexture = this.createInterferenceTexture(card.phase);
                        frontMat.map = interferenceTexture;
                        frontMat.needsUpdate = true;
                    }
                } else if (card.isEntangled) {
                    // Add magenta glow for entangled cards
                    const pulseAmount = 0.05 * Math.sin(Date.now() * 0.002);
                    cardObj.scale.set(1 + pulseAmount, 1, 1 + pulseAmount);
                    
                    if (cardObj.material && Array.isArray(cardObj.material)) {
                        const emissiveIntensity = 0.3 + 0.1 * Math.sin(Date.now() * 0.004);
                        for (const mat of cardObj.material) {
                            mat.emissive = new THREE.Color(1, 0, 1);
                            mat.emissiveIntensity = emissiveIntensity;
                        }
                    }
                } else {
                    // Reset normal card appearance
                    cardObj.scale.set(1, 1, 1);
                    
                    if (cardObj.material && Array.isArray(cardObj.material)) {
                        for (const mat of cardObj.material) {
                            mat.emissive = new THREE.Color(0, 0, 0);
                            mat.emissiveIntensity = 0;
                        }
                    }
                    
                    // Restore original texture if it exists
                    if (cardObj.material && Array.isArray(cardObj.material) && cardObj.material[4]) {
                        const frontMat = cardObj.material[4];
                        if (frontMat.userData.originalMap) {
                            frontMat.map = frontMat.userData.originalMap;
                            frontMat.needsUpdate = true;
                        }
                    }
                }
            }
        }
        
        // Draw entanglement lines between entangled cards
        this.updateEntanglementLines();
    }

    updateEntanglementLines() {
        if (!this.scene) {
            console.warn("Cannot update entanglement lines - scene is null");
            return;
        }
        
        // Skip if the cardObjects array is empty
        if (!this.cardObjects || this.cardObjects.length === 0) {
            return;
        }
        
        try {
            // Remove existing entanglement lines
            const linesToRemove = [];
            this.scene.children.forEach(child => {
                if (child && child.userData && child.userData.isEntanglementLine) {
                    linesToRemove.push(child);
                }
            });
            
            // Remove lines in a separate loop to avoid modifying the array while iterating
            for (const line of linesToRemove) {
                this.scene.remove(line);
                if (line.geometry) line.geometry.dispose();
                if (line.material) line.material.dispose();
            }
            
            // Find all entangled cards
            const entangledCards = [];
            for (const cardObj of this.cardObjects) {
                if (cardObj && cardObj.userData && cardObj.userData.card && 
                    cardObj.userData.card.entangledWith) {
                    entangledCards.push(cardObj.userData.card);
                }
            }
            
            // Create new entanglement lines
            for (const card of entangledCards) {
                if (card.entangledWith && card.mesh && card.entangledWith.mesh) {
                    // Create line geometry
                    const points = [];
                    points.push(card.mesh.position);
                    points.push(card.entangledWith.mesh.position);
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0xff00ff,
                        transparent: true,
                        opacity: 0.5 + 0.3 * Math.sin(Date.now() * 0.002),
                        linewidth: 2
                    });
                    
                    // Create line
                    const line = new THREE.Line(geometry, material);
                    line.userData.isEntanglementLine = true;
                    
                    // Add to scene
                    this.scene.add(line);
                }
            }
        } catch (error) {
            console.error("Error updating entanglement lines:", error);
        }
    }

    createVaporwaveBackground() {
        // Create a canvas for the background
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Create gradient from purple to blue
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#330066'); // Deep purple
        gradient.addColorStop(1, '#000033'); // Dark blue
        
        // Fill background
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid lines for vaporwave aesthetic
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'; // Cyan with transparency
        ctx.lineWidth = 2;
        
        // Draw horizontal grid lines
        const gridSize = 50;
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw vertical grid lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        
        return texture;
    }

    createInterferenceTexture(phase) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create interference pattern
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            
            // Calculate interference pattern
            const dx = x - canvas.width / 2;
            const dy = y - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Create interference rings
            const intensity = Math.sin(distance * 0.1 + phase) * 0.5 + 0.5;
            
            // Set RGBA values
            data[i] = 0;     // R
            data[i + 1] = 255 * intensity; // G
            data[i + 2] = 255 * intensity; // B
            data[i + 3] = 128 * intensity; // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }

    // Apply quantum visual effects to a card mesh
    applyQuantumEffects(cardMesh, card) {
        if (!cardMesh || !card) return;
        
        // Add cyan glow effect
        if (cardMesh.material && Array.isArray(cardMesh.material)) {
            const emissiveIntensity = 0.3 * (1 + Math.sin(card.phase || 0));
            for (const mat of cardMesh.material) {
                mat.emissive = new THREE.Color(0, 1, 1);
                mat.emissiveIntensity = emissiveIntensity;
            }
        }
        
        // Start pulsing animation
        if (typeof card.startSuperpositionPulse === 'function') {
            card.startSuperpositionPulse();
        }
    }

    // Apply entanglement visual effects to a card mesh
    applyEntanglementEffects(cardMesh, card) {
        if (!cardMesh || !card) return;
        
        // Add magenta glow effect
        if (cardMesh.material && Array.isArray(cardMesh.material)) {
            const emissiveIntensity = 0.3;
            for (const mat of cardMesh.material) {
                mat.emissive = new THREE.Color(1, 0, 1);
                mat.emissiveIntensity = emissiveIntensity;
            }
        }
        
        // Start pulsing animation
        if (typeof card.startEntanglementPulse === 'function') {
            card.startEntanglementPulse();
        }
    }
} 