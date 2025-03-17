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
            console.error("Canvas element not found");
            return false;
        }

        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000033);

            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 10, 5);
            this.camera.lookAt(0, 0, 0);

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;

            // Add lights
            this.addLights();

            // Add table
            await this.addTable();

            // Add event listeners
            this.setupMouseEvents();

            this.initialized = true;
            console.log("SceneManager initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing SceneManager:", error);
            return false;
        }
    }

    addLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);

        // Directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light for table
        const pointLight = new THREE.PointLight(0x00ffff, 0.5);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }

    async addTable() {
        try {
            // Create table surface geometry (a simple flat plane)
            const tableGeometry = new THREE.PlaneGeometry(20, 12);
            
            // Create table material with felt texture
            const tableMaterial = new THREE.MeshStandardMaterial({
                color: 0x008800,
                roughness: 0.8,
                metalness: 0.2
            });
            
            // Create table mesh
            this.tableObject = new THREE.Mesh(tableGeometry, tableMaterial);
            this.tableObject.rotation.x = -Math.PI / 2; // Rotate to lay flat
            this.tableObject.position.y = 0;
            this.tableObject.receiveShadow = true;
            
            // Add table to scene
            this.scene.add(this.tableObject);
            
            // Add a rim around the table
            const rimGeometry = new THREE.BoxGeometry(20.5, 0.3, 0.5);
            const rimMaterial = new THREE.MeshStandardMaterial({
                color: 0x4d2800,
                roughness: 0.5,
                metalness: 0.3
            });
            
            // Create the four sides of the rim
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
            
            console.log("Table created successfully");
            return true;
        } catch (error) {
            console.error("Error creating table:", error);
            return false;
        }
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
        
        if (this.scene) {
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
        }
        
        console.log("Scene cleared successfully");
        return true;
    }

    addCard(card, position, rotation, isPlayerCard = true) {
        if (!this.initialized) {
            console.error("Cannot add card - SceneManager not initialized");
            return null;
        }

        try {
            console.log(`Adding card: ${card.toString()} at position`, position);
            
            // Create card mesh
            const cardGeometry = new THREE.BoxGeometry(1, 0.05, 1.5);
            
            // Create materials for each side of the card
            const materials = [
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Right side
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Left side
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Top edge
                new THREE.MeshStandardMaterial({ color: 0xcccccc }), // Bottom edge
                new THREE.MeshStandardMaterial({ map: this.createCardTexture(card) }), // Front face (card face)
                new THREE.MeshStandardMaterial({ map: this.createCardBackTexture() }) // Back face
            ];
            
            // Create card mesh with geometry and materials
            const cardMesh = new THREE.Mesh(cardGeometry, materials);
            
            // Set position and rotation
            cardMesh.position.copy(position);
            if (rotation) {
                cardMesh.rotation.copy(rotation);
            }
            
            // Adjust the Y position slightly to avoid z-fighting with the table
            cardMesh.position.y = 0.03;
            
            // Add shadow casting
            cardMesh.castShadow = true;
            cardMesh.receiveShadow = false;
            
            // Store card reference in userData for raycasting
            cardMesh.userData.card = card;
            
            // Add card to the scene
            this.scene.add(cardMesh);
            this.cardObjects.push(cardMesh);
            
            // Store mesh reference in card
            card.mesh = cardMesh;
            
            // If player card, adjust position to be more visible
            if (isPlayerCard) {
                cardMesh.position.z += 0.1;
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
                    // Make the card pulse/glow
                    const pulseAmount = 0.1 * Math.sin(Date.now() * 0.003);
                    cardObj.scale.set(1 + pulseAmount, 1, 1 + pulseAmount);
                    
                    // Add cyan glow effect
                    if (cardObj.material && Array.isArray(cardObj.material)) {
                        const emissiveIntensity = 0.3 + 0.2 * Math.sin(Date.now() * 0.005);
                        for (const mat of cardObj.material) {
                            mat.emissive = new THREE.Color(0, 1, 1);
                            mat.emissiveIntensity = emissiveIntensity;
                        }
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
        if (this.cardObjects && this.cardObjects.length > 0) {
            for (const cardObj of this.cardObjects) {
                if (cardObj && cardObj.userData && cardObj.userData.card && cardObj.userData.card.entangledWith) {
                    entangledCards.push(cardObj.userData.card);
                }
            }
        } else {
            return; // No cards to process
        }
        
        // Draw lines between entangled cards
        for (const card of entangledCards) {
            if (card && card.mesh && card.entangledWith && card.entangledWith.mesh) {
                const startPos = card.mesh.position.clone();
                const endPos = card.entangledWith.mesh.position.clone();
                
                // Adjust line height to be above cards
                startPos.y += 0.1;
                endPos.y += 0.1;
                
                // Create line geometry
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
                
                // Create line material with glow effect
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xff00ff,
                    linewidth: 3,
                    transparent: true,
                    opacity: 0.7
                });
                
                // Create line
                const line = new THREE.Line(lineGeometry, lineMaterial);
                line.userData.isEntanglementLine = true;
                
                // Add to scene
                this.scene.add(line);
            }
        }
    }
} 