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
        // Create card geometry (slightly elongated rectangle)
        const cardWidth = 0.7;
        const cardHeight = 1.0;
        const cardGeometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
        
        // Create materials for front and back
        this.frontMaterial = new THREE.MeshStandardMaterial({
            map: this.assetLoader.getTexture(`card_${this.state1.value}_of_${this.state1.suit}`),
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.FrontSide
        });
        
        this.backMaterial = new THREE.MeshStandardMaterial({
            map: this.assetLoader.getTexture('cardBack'),
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.BackSide
        });
        
        // Create the alternative state material for superposition
        this.altMaterial = new THREE.MeshStandardMaterial({
            map: this.assetLoader.getTexture(`card_${this.state2.value}_of_${this.state2.suit}`),
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.FrontSide,
            transparent: true,
            opacity: 0
        });
        
        // Create a group to hold the card faces
        this.mesh = new THREE.Group();
        
        // Create front and back faces
        this.frontFace = new THREE.Mesh(cardGeometry, this.frontMaterial);
        this.frontFace.castShadow = true;
        this.frontFace.receiveShadow = true;
        
        this.backFace = new THREE.Mesh(cardGeometry, this.backMaterial);
        this.backFace.castShadow = true;
        this.backFace.receiveShadow = true;
        this.backFace.rotation.y = Math.PI;
        
        // Create alternative state face (for superposition visualization)
        this.altFace = new THREE.Mesh(cardGeometry, this.altMaterial);
        this.altFace.castShadow = true;
        this.altFace.receiveShadow = true;
        this.altFace.visible = false;
        
        // Add faces to the group
        this.mesh.add(this.frontFace);
        this.mesh.add(this.backFace);
        this.mesh.add(this.altFace);
        
        // Create glow effect for superposition
        this.createGlowEffect();
        
        // Set initial rotation (back facing up)
        this.mesh.rotation.x = Math.PI; // Face down initially
        
        // Add userData for raycasting
        this.mesh.userData.card = this;
    }

    createGlowEffect() {
        // Create a subtle glow effect for superposition and entanglement
        const glowGeometry = new THREE.PlaneGeometry(0.8, 1.1); // Slightly larger than card
        
        // Superposition glow (cyan)
        this.superpositionGlow = new THREE.Mesh(
            glowGeometry,
            new THREE.MeshBasicMaterial({
                color: 0x89ddff,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            })
        );
        this.superpositionGlow.position.z = -0.01; // Slightly behind the card
        
        // Entanglement glow (magenta)
        this.entanglementGlow = new THREE.Mesh(
            glowGeometry,
            new THREE.MeshBasicMaterial({
                color: 0xf48fb1,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            })
        );
        this.entanglementGlow.position.z = -0.02; // Even more behind
        
        this.mesh.add(this.superpositionGlow);
        this.mesh.add(this.entanglementGlow);
    }

    flipToFront(duration = 0.5) {
        return this.animateRotation(Math.PI, 0, duration);
    }

    flipToBack(duration = 0.5) {
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
        
        // Superposition effects (wobble and glow)
        if (!this.collapsed) {
            // Update wobble
            if (this.wobbleAmount > 0) {
                this.mesh.rotation.z = Math.sin(Date.now() * this.wobbleSpeed * 0.01) * this.wobbleAmount;
                this.mesh.rotation.y = Math.cos(Date.now() * this.wobbleSpeed * 0.005) * this.wobbleAmount * 0.5;
            }
            
            // Update glow pulse
            if (this.glowIntensity > 0) {
                const pulse = (Math.sin(Date.now() * this.pulseSpeed * 0.001) + 1) * 0.5; // 0 to 1
                this.superpositionGlow.material.opacity = this.glowIntensity * pulse;
                
                // Update alt face opacity for "flickering" between states
                if (this.altFace.visible) {
                    const flicker = Math.sin(Date.now() * 0.01) * 0.5 + 0.5; // 0 to 1
                    this.altMaterial.opacity = flicker * 0.6; // Max 60% opacity
                    this.frontMaterial.opacity = 1 - (flicker * 0.4); // Min 60% opacity
                }
            }
            
            // Entanglement glow
            if (this.entangledWith) {
                const entanglePulse = (Math.sin(Date.now() * 0.002) + 1) * 0.5; // 0 to 1
                this.entanglementGlow.material.opacity = 0.5 * entanglePulse;
            } else {
                this.entanglementGlow.material.opacity = 0;
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
            this.altFace.visible = true;
            
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
            this.frontMaterial.map = this.assetLoader.getTexture(
                `card_${this.currentState.value}_of_${this.currentState.suit}`
            );
            this.frontMaterial.needsUpdate = true;
            this.frontMaterial.opacity = 1.0;
            
            // Hide alternative face
            this.altFace.visible = false;
            
            // Reset quantum effects
            this.collapsed = true;
            this.wobbleAmount = 0;
            this.wobbleSpeed = 0;
            this.glowIntensity = 0;
            this.pulseSpeed = 0;
            this.superpositionGlow.material.opacity = 0;
            this.entanglementGlow.material.opacity = 0;
            
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

    // Easing function for smoother animations
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
} 