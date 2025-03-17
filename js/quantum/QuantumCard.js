import * as THREE from 'three';
import { CardState } from './CardState.js';

export class QuantumCard {
    constructor(state1, state2, assetLoader) {
        this.state1 = state1; // First possible state
        this.state2 = state2; // Second possible state
        this.assetLoader = assetLoader;
        
        // Quantum properties
        this.collapsed = true; // Card starts in a definite state (collapsed)
        this.currentState = this.state1; // Default to first state
        this.entangledWith = null; // Reference to another card this is entangled with
        
        // Card state
        this.isFaceUp = false; // Track if card is face up or face down
        
        // Probability amplitudes (complex numbers represented as {real, imaginary})
        // Initially 100% state1, 0% state2
        this.amplitudes = {
            state1: { real: 1, imaginary: 0 },
            state2: { real: 0, imaginary: 0 }
        };
        
        // Create the 3D mesh
        this.createMesh();
        
        // Animation properties
        this.animating = false;
        this.animationTime = 0;
        this.animationDuration = 0;
        this.animationStart = null;
        this.animationEnd = null;
        this.animationCallback = null;
        this.wobbleAmount = 0;
        this.wobbleSpeed = 0;
        this.glowIntensity = 0;
        this.pulseSpeed = 0;
    }

    createMesh() {
        // Create a larger card for better visibility
        const cardGeometry = new THREE.BoxGeometry(2.8, 0.01, 4);
        
        // Get the texture or generate a fallback
        let frontTexture;
        try {
            frontTexture = this.assetLoader.getTexture(`card_${this.state1.value}_of_${this.state1.suit}`);
            // If texture is undefined, generate a procedural one
            if (!frontTexture) {
                console.log(`Creating procedural texture for ${this.state1.value} of ${this.state1.suit}`);
                frontTexture = this.createCardTexture(this.state1);
            }
        } catch (error) {
            console.warn("Error loading card texture:", error);
            frontTexture = this.createCardTexture(this.state1);
        }
        
        const cardMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.7,
            map: frontTexture
        });
        
        // Get or generate back texture
        let backTexture;
        try {
            backTexture = this.assetLoader.getTexture('cardBack');
            if (!backTexture) {
                console.log("Creating procedural card back texture");
                backTexture = this.createCardBackTexture();
            }
        } catch (error) {
            console.warn("Error loading card back texture:", error);
            backTexture = this.createCardBackTexture();
        }
        
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.7,
            map: backTexture
        });
        
        // Create materials array with front and back textures
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.5 }), // right
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.5 }), // left
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.5 }), // top
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.5 }), // bottom
            cardMaterial, // front
            backMaterial  // back
        ];
        
        this.mesh = new THREE.Mesh(cardGeometry, materials);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add vaporwave neon edge effect
        this.addNeonEdges();
        
        // Create the superposition effect
        this.createSuperpositionEffect();
        
        // Create the entanglement effect
        this.createEntanglementEffect();
        
        // Set initial rotation (back facing up)
        this.mesh.rotation.x = Math.PI; // Face down initially
        
        // Add userData for raycasting
        this.mesh.userData.card = this;
        
        console.log(`Created card mesh for ${this.state1.value} of ${this.state1.suit}`);
    }
    
    addNeonEdges() {
        // Create neon edges for the card
        const edges = new THREE.EdgesGeometry(this.mesh.geometry);
        this.edgesLine = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ 
                color: this.isEntangled ? 0xff00ff : 0x00ffff,
                transparent: true,
                opacity: 0.8,
                linewidth: 1
            })
        );
        
        // Scale slightly larger than the card to avoid z-fighting
        this.edgesLine.scale.set(1.02, 1.2, 1.02);
        this.mesh.add(this.edgesLine);
        
        // Add pulsing animation for the edges
        this.edgePulseTime = 0;
    }

    createSuperpositionEffect() {
        // Create particle system for superposition effect
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions around the card
            particlePositions[i * 3] = (Math.random() - 0.5) * 1.5;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.1;
            
            // Random sizes for the particles
            particleSizes[i] = Math.random() * 0.05 + 0.02;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        
        // Create shader material for the particles
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x00ffff) },
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                varying float vAlpha;
                
                void main() {
                    vec3 pos = position;
                    // Add wavy motion
                    pos.x += sin(time * 2.0 + position.z * 5.0) * 0.05;
                    pos.y += cos(time * 2.5 + position.x * 4.0) * 0.05;
                    pos.z += sin(time * 3.0 + position.y * 3.0) * 0.05;
                    
                    vAlpha = 0.7 + 0.3 * sin(time * 3.0 + position.y * 5.0);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                
                void main() {
                    // Create a circular point
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;
                    
                    // Add glow effect
                    float glow = 1.0 - dist * 2.0;
                    gl_FragColor = vec4(color, vAlpha * glow);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.superpositionParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.superpositionParticles.visible = false;
        this.mesh.add(this.superpositionParticles);
    }
    
    createEntanglementEffect() {
        // Create entanglement visual effect
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        // Will be populated when entanglement is established
        this.entanglementLine = new THREE.Line(lineGeometry, lineMaterial);
        this.entanglementLine.visible = false;
    }

    flipToFront(duration = 0.5) {
        this.isFaceUp = true; // Set card as face up
        return this.animateRotation(Math.PI, 0, duration);
    }

    flipToBack(duration = 0.5) {
        this.isFaceUp = false; // Set card as face down
        return this.animateRotation(0, Math.PI, duration);
    }

    animateRotation(startRotationX, endRotationX, duration) {
        return new Promise((resolve) => {
            this.animating = true;
            this.animationTime = 0;
            this.animationDuration = duration;
            this.animationStart = { rotationX: startRotationX };
            this.animationEnd = { rotationX: endRotationX };
            this.mesh.rotation.x = startRotationX;
            this.animationCallback = () => {
                resolve();
                this.animating = false;
            };
        });
    }

    update(deltaTime) {
        // Handle ongoing animations
        if (this.animating) {
            this.animationTime += deltaTime;
            const t = Math.min(this.animationTime / this.animationDuration, 1.0);
            const smoothT = this.easeInOutQuad(t);
            
            // Interpolate rotation
            if (this.animationStart && this.animationEnd) {
                this.mesh.rotation.x = this.animationStart.rotationX + 
                    (this.animationEnd.rotationX - this.animationStart.rotationX) * smoothT;
            }
            
            // Check if animation is complete
            if (t >= 1.0 && this.animationCallback) {
                this.animationCallback();
            }
        }
        
        // Update superposition effect
        if (this.isInSuperposition && this.superpositionParticles) {
            this.superpositionParticles.visible = true;
            this.superpositionParticles.material.uniforms.time.value += deltaTime;
            
            if (this.edgesLine) {
                // Pulse the edge color and opacity for superposition
                this.edgePulseTime += deltaTime * 2;
                const pulseValue = (Math.sin(this.edgePulseTime) + 1) / 2;
                this.edgesLine.material.opacity = 0.5 + pulseValue * 0.5;
                
                // Slowly cycle colors for superposition
                const hue = (this.edgePulseTime * 0.1) % 1;
                const color = new THREE.Color().setHSL(hue, 1, 0.5);
                this.edgesLine.material.color = color;
            }
        } else if (this.superpositionParticles) {
            this.superpositionParticles.visible = false;
        }
        
        // Update entanglement effect
        if (this.isEntangled && this.entangledWith && this.entanglementLine) {
            this.entanglementLine.visible = true;
            
            // Get position of this card and entangled card
            const pos1 = new THREE.Vector3();
            this.mesh.getWorldPosition(pos1);
            
            const pos2 = new THREE.Vector3();
            this.entangledWith.mesh.getWorldPosition(pos2);
            
            // Update line geometry to connect the cards
            const points = [pos1, pos2];
            this.entanglementLine.geometry.setFromPoints(points);
            
            // Add pulsing effect to entanglement line
            const pulseValue = (Math.sin(this.edgePulseTime) + 1) / 2;
            this.entanglementLine.material.opacity = 0.5 + pulseValue * 0.5;
            
            // Set edge color to magenta for entanglement
            if (this.edgesLine) {
                this.edgesLine.material.color.set(0xff00ff);
            }
        } else if (this.entanglementLine) {
            this.entanglementLine.visible = false;
            
            // Reset edge color to cyan if not entangled
            if (this.edgesLine && !this.isEntangled) {
                this.edgesLine.material.color.set(0x00ffff);
            }
        }
    }

    putInSuperposition() {
        if (this.collapsed) {
            // Set to superposition state
            this.collapsed = false;
            
            // Set equal probabilities for both states
            this.amplitudes.state1 = { real: 1/Math.sqrt(2), imaginary: 0 };
            this.amplitudes.state2 = { real: 1/Math.sqrt(2), imaginary: 0 };
            
            // Show alternative state
            this.superpositionParticles.visible = true;
            
            // Enable wobble and glow effects
            this.wobbleAmount = 0.1;
            this.wobbleSpeed = 1.0;
            this.glowIntensity = 0.5;
            this.pulseSpeed = 1.0;
            
            return true;
        }
        return false; // Already in superposition
    }

    collapse(forcedState = null) {
        if (!this.collapsed) {
            // If we have a forced state (from entanglement), use it
            if (forcedState) {
                this.currentState = forcedState;
            } else {
                // Randomly collapse based on probabilities
                const p1 = this.getProbability(this.state1);
                const random = Math.random();
                
                if (random < p1) {
                    this.currentState = this.state1;
                } else {
                    this.currentState = this.state2;
                }
            }
            
            // Update front material to show the collapsed state
            this.mesh.children[4].material.map = this.assetLoader.getTexture(
                `card_${this.currentState.value}_of_${this.currentState.suit}`
            );
            this.mesh.children[4].material.needsUpdate = true;
            this.mesh.children[4].material.opacity = 1.0;
            
            // Hide superposition particles
            this.superpositionParticles.visible = false;
            
            // Reset quantum effects
            this.collapsed = true;
            this.wobbleAmount = 0;
            this.wobbleSpeed = 0;
            this.glowIntensity = 0;
            this.pulseSpeed = 0;
            this.superpositionParticles.material.uniforms.time.value = 0;
            this.entanglementLine.visible = false;
            
            // Reset mesh rotation
            this.mesh.rotation.z = 0;
            this.mesh.rotation.y = 0;
            
            // Clear entanglement
            if (this.entangledWith) {
                const otherCard = this.entangledWith;
                this.entangledWith = null;
                
                // Also collapse the other card if it's still in superposition
                if (otherCard && !otherCard.collapsed) {
                    // Ensure entangled cards collapse to matching colors
                    const matchingColor = this.currentState.isRed() ? 'red' : 'black';
                    let forcedState;
                    
                    if (matchingColor === 'red') {
                        // Force to a red state
                        forcedState = otherCard.state1.isRed() ? otherCard.state1 : otherCard.state2;
                    } else {
                        // Force to a black state
                        forcedState = !otherCard.state1.isRed() ? otherCard.state1 : otherCard.state2;
                    }
                    
                    otherCard.collapse(forcedState);
                }
            }
            
            return this.currentState;
        }
        
        return null; // Already collapsed
    }

    entangleWith(otherCard) {
        if (!this.collapsed && !otherCard.collapsed) {
            this.entangledWith = otherCard;
            otherCard.entangledWith = this;
            return true;
        }
        return false;
    }

    // Calculate probability of measuring a specific state
    getProbability(state) {
        const amplitudeKey = state === this.state1 ? 'state1' : 'state2';
        const amplitude = this.amplitudes[amplitudeKey];
        
        // Probability = |amplitude|²
        return amplitude.real * amplitude.real + amplitude.imaginary * amplitude.imaginary;
    }

    // Get possible values for blackjack calculation
    getPossibleValues() {
        if (this.collapsed) {
            return [this.currentState.blackjackValue()];
        } else {
            return [
                this.state1.blackjackValue(), 
                this.state2.blackjackValue()
            ];
        }
    }

    // Return the minimum and maximum possible values
    getValueRange() {
        const values = this.getPossibleValues();
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    isInSuperposition() {
        return !this.collapsed;
    }

    isEntangled() {
        return this.entangledWith !== null;
    }

    // Get the current value of the card (for collapsed cards)
    getValue() {
        if (this.collapsed) {
            return this.currentState.blackjackValue();
        } else {
            // If not collapsed, return average value
            return this.getAverageValue();
        }
    }
    
    // Get the average value for cards in superposition
    getAverageValue() {
        const values = this.getPossibleValues();
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    // Easing function for smoother animations
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    // Simple flip method that flips card to front
    flip() {
        // Set that the card is now face up
        this.isFaceUp = true;
        // Just call the existing flipToFront method
        return this.flipToFront();
    }

    createCardTexture(cardState) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Card background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Card border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Set color based on suit
        const isRed = cardState.suit === 'hearts' || cardState.suit === 'diamonds';
        ctx.fillStyle = isRed ? '#ff0000' : '#000000';
        
        // Draw value in top-left and bottom-right
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'left';
        
        let valueText = cardState.value;
        if (valueText === 'ace') valueText = 'A';
        else if (valueText === 'king') valueText = 'K';
        else if (valueText === 'queen') valueText = 'Q';
        else if (valueText === 'jack') valueText = 'J';
        
        // Top-left value
        ctx.fillText(valueText.toUpperCase(), 40, 100);
        
        // Bottom-right value (upside down)
        ctx.save();
        ctx.translate(canvas.width - 40, canvas.height - 40);
        ctx.rotate(Math.PI);
        ctx.fillText(valueText.toUpperCase(), 0, 0);
        ctx.restore();
        
        // Draw suit symbol
        let suitSymbol = '♠'; // Default spades
        if (cardState.suit === 'hearts') suitSymbol = '♥';
        else if (cardState.suit === 'diamonds') suitSymbol = '♦';
        else if (cardState.suit === 'clubs') suitSymbol = '♣';
        
        // Center suit
        ctx.font = 'bold 240px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(suitSymbol, canvas.width / 2, canvas.height / 2 + 50);
        
        // Draw small suit in top-left and bottom-right
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'left';
        
        // Top-left suit
        ctx.fillText(suitSymbol, 40, 160);
        
        // Bottom-right suit (upside down)
        ctx.save();
        ctx.translate(canvas.width - 40, canvas.height - 100);
        ctx.rotate(Math.PI);
        ctx.fillText(suitSymbol, 0, 0);
        ctx.restore();
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    createCardBackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Fill with gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#4B0082'); // Indigo
        gradient.addColorStop(0.5, '#9400D3'); // Violet
        gradient.addColorStop(1, '#00CED1'); // Turquoise
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        const gridSize = 40;
        
        // Horizontal grid lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Add text
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00FFFF'; // Cyan
        ctx.fillText('QUANTUM', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('BLACKJACK', canvas.width / 2, canvas.height / 2 + 60);
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
} 