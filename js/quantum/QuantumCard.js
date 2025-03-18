import * as THREE from 'three';
import { CardState } from './CardState.js';

export class QuantumCard {
    constructor(value, suit) {
        // Base properties
        this.value = value;                 // Card value (1-13, where 1=Ace, 11=Jack, etc.)
        this.suit = suit;                   // Card suit (hearts, diamonds, clubs, spades)
        this.isFaceUp = false;              // Whether the card is face up
        this.isDealt = false;               // Whether the card has been dealt
        this.isSelected = false;            // Whether the card is currently selected
        
        // State properties that can be accessed easily by GameManager
        this.state1 = { value: this.value, suit: this.suit }; // Primary state
        this.state2 = null;                                  // Secondary state (for superposition)
        
        // Enhanced quantum properties
        this.isInSuperposition = false;     // Whether the card is in superposition
        this.isEntangled = false;           // Whether the card is entangled
        this.entangledWith = null;          // Card that this card is entangled with
        this.superpositionStates = [];      // States for superposition
        this.amplitudes = [];               // Complex amplitudes for each superposition state
        this.phase = 0;                     // Phase angle for quantum interference
        this.coherence = 1.0;               // Quantum coherence (decreases with measurement)
        
        // 3D properties
        this.mesh = null;                   // THREE.js mesh for the card
        this.position = null;               // Position in 3D space
        this.rotation = null;               // Rotation in 3D space
        this.flipAnimation = null;          // Animation for flipping the card
        
        // Initial state is the actual card value/suit
        this.superpositionStates.push({ value: this.value, suit: this.suit });
        this.amplitudes.push({ real: 1.0, imag: 0.0 });  // 100% probability for the actual state
    }
    
    /**
     * Convert the card to a string representation
     */
    toString() {
        // If card is in superposition, show both possibilities
        if (this.isInSuperposition) {
            const state1 = this.getValueString(this.superpositionStates[0].value) + 
                           ' of ' + 
                           this.capitalizeFirstLetter(this.superpositionStates[0].suit);
            
            const state2 = this.getValueString(this.superpositionStates[1].value) + 
                           ' of ' + 
                           this.capitalizeFirstLetter(this.superpositionStates[1].suit);
            
            return `[${state1} | ${state2}]`;
        }
        
        // Regular card
        return this.getValueString(this.value) + ' of ' + this.capitalizeFirstLetter(this.suit);
    }
    
    /**
     * Return the string value for a card value
     */
    getValueString(value) {
        switch(value) {
            case 1: return 'Ace';
            case 11: return 'Jack';
            case 12: return 'Queen';
            case 13: return 'King';
            default: return value.toString();
        }
    }
    
    /**
     * Capitalize the first letter of a string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    /**
     * Get the numeric value of the card (for game rules)
     */
    getGameValue() {
        // In Blackjack, Ace can be 1 or 11, face cards are 10
        if (this.value === 1) {
            return 11;  // Default to 11 for Ace
        } else if (this.value >= 11 && this.value <= 13) {
            return 10;  // Jack, Queen, King are worth 10
        } else {
            return this.value;
        }
    }
    
    /**
     * Get possible game values when in superposition
     */
    getPossibleGameValues() {
        if (!this.isInSuperposition) {
            return [this.getGameValue()];
        }
        
        const values = [];
        for (const state of this.superpositionStates) {
            let gameValue;
            if (state.value === 1) {
                gameValue = 11;
            } else if (state.value >= 11 && state.value <= 13) {
                gameValue = 10;
            } else {
                gameValue = state.value;
            }
            values.push(gameValue);
        }
        
        return values;
    }
    
    /**
     * Get the probability of each possible game value
     */
    getValueProbabilities() {
        const probabilities = {};
        
        if (this.isInSuperposition) {
            for (let i = 0; i < this.superpositionStates.length; i++) {
                const state = this.superpositionStates[i];
                const amplitude = this.amplitudes[i];
                const probability = amplitude.real * amplitude.real + amplitude.imag * amplitude.imag;  // Quantum probability is the square of the amplitude
                
                let gameValue;
                if (state.value === 1) {
                    gameValue = 11;
                } else if (state.value >= 11 && state.value <= 13) {
                    gameValue = 10;
                } else {
                    gameValue = state.value;
                }
                
                if (probabilities[gameValue]) {
                    probabilities[gameValue] += probability;
                } else {
                    probabilities[gameValue] = probability;
                }
            }
        } else {
            probabilities[this.getGameValue()] = 1.0;
        }
        
        return probabilities;
    }
    
    /**
     * Apply Hadamard gate to put card in superposition
     */
    applySuperposition() {
        if (this.isInSuperposition) {
            console.log("Card is already in superposition");
            return false;
        }
        
        console.log(`Applying superposition to ${this.toString()}`);
        
        // Generate a random alternative state
        const alternativeState = this.generateAlternativeState();
        
        // Add the alternative state to superposition states
        this.superpositionStates.push(alternativeState);
        
        // Set complex amplitudes for both states (1/sqrt(2) ≈ 0.7071)
        // Add a random phase for quantum interference effects
        this.phase = Math.random() * Math.PI * 2;
        this.amplitudes = [
            { real: 0.7071 * Math.cos(this.phase), imag: 0.7071 * Math.sin(this.phase) },
            { real: 0.7071 * Math.cos(this.phase + Math.PI), imag: 0.7071 * Math.sin(this.phase + Math.PI) }
        ];
        
        // Update state properties for easier access
        this.state1 = this.superpositionStates[0];
        this.state2 = this.superpositionStates[1];
        
        // Mark card as in superposition
        this.isInSuperposition = true;
        this.coherence = 1.0; // Reset coherence when entering superposition
        
        // Apply visual effect to card mesh if it exists
        if (this.mesh) {
            // Save original scale for animation
            const originalScale = this.mesh.scale.clone();
            
            // Animate entering superposition
            const duration = 800; // ms
            const startTime = Date.now();
            
            const animate = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(1, elapsed / duration);
                
                // Easing function for smoother animation
                const eased = this.easeInOutCubic(progress);
                
                // Scale effect (pulse out and back)
                if (progress < 0.5) {
                    const scale = 1 + eased * 0.3; // Expand by 30%
                    this.mesh.scale.set(scale, scale, scale);
                } else {
                    const scale = 1.3 - (eased - 0.5) * 0.6; // Contract back to slightly larger than original
                    this.mesh.scale.set(scale, scale, scale);
                }
                
                // Rotation effect (wobble)
                this.mesh.rotation.z = Math.sin(progress * Math.PI * 4) * 0.2;
                
                // Add cyan glow effect with increasing intensity
                if (this.mesh.material && Array.isArray(this.mesh.material)) {
                    const emissiveIntensity = progress * 0.3; // Ramp up to 0.3
                    for (const mat of this.mesh.material) {
                        mat.emissive = new THREE.Color(0, 1, 1);
                        mat.emissiveIntensity = emissiveIntensity;
                    }
                }
                
                // Update texture as we progress
                if (progress > 0.7 && this.mesh.material && Array.isArray(this.mesh.material) && this.mesh.material[4]) {
                    this.mesh.material[4].map = this.createCardTexture();
                    this.mesh.material[4].needsUpdate = true;
                }
                
                // Continue animation if not complete
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation complete - set final values
                    this.mesh.scale.set(1.1, 1.1, 1.1); // Slightly larger than original
                    this.mesh.rotation.z = 0;
                    
                    // Add subtle pulsing animation for superposition state
                    this.startSuperpositionPulse();
                }
            };
            
            // Start animation
            animate();
        }
        
        console.log(`Card now in superposition: ${this.toString()}`);
        return true;
    }
    
    /**
     * Start subtle pulsing animation for cards in superposition
     */
    startSuperpositionPulse() {
        if (!this.mesh) return;
        
        // Clear existing animation if any
        if (this.pulseAnimation) {
            cancelAnimationFrame(this.pulseAnimation);
        }
        
        const animate = () => {
            if (!this.isInSuperposition || !this.mesh) return;
            
            // Subtle scale pulsing
            const pulseAmount = 0.05 * Math.sin(Date.now() * 0.003 + this.phase);
            this.mesh.scale.set(1.1 + pulseAmount, 1.1, 1.1 + pulseAmount);
            
            // Update glow intensity
            if (this.mesh.material && Array.isArray(this.mesh.material)) {
                const emissiveIntensity = 0.2 + 0.1 * Math.sin(Date.now() * 0.004 + this.phase);
                for (const mat of this.mesh.material) {
                    mat.emissive = new THREE.Color(0, 1, 1);
                    mat.emissiveIntensity = emissiveIntensity;
                }
            }
            
            // Continue animation as long as card is in superposition
            this.pulseAnimation = requestAnimationFrame(animate);
        };
        
        // Start the continuous animation
        this.pulseAnimation = requestAnimationFrame(animate);
    }
    
    /**
     * Easing function for smooth animations
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    /**
     * Generate a random alternative state for superposition
     */
    generateAlternativeState() {
        // Generate a different value and suit than the current one
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = Array.from({length: 13}, (_, i) => i + 1);
        
        // Remove current value and suit
        const availableSuits = suits.filter(s => s !== this.suit);
        const availableValues = values.filter(v => v !== this.value);
        
        // Randomly select a new value and suit
        const newValue = availableValues[Math.floor(Math.random() * availableValues.length)];
        const newSuit = availableSuits[Math.floor(Math.random() * availableSuits.length)];
        
        return { value: newValue, suit: newSuit };
    }
    
    /**
     * Measure card to collapse superposition
     */
    measure() {
        if (!this.isInSuperposition) {
            console.log("Card is not in superposition, nothing to measure");
            return false;
        }
        
        console.log(`Measuring superposition: ${this.toString()}`);
        
        // Calculate probabilities from amplitudes
        const probabilities = this.amplitudes.map(a => 
            a.real * a.real + a.imag * a.imag
        );
        
        // Choose a random outcome based on probabilities
        const random = Math.random();
        let cumulativeProbability = 0;
        let selectedIndex = 0;
        
        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i];
            if (random < cumulativeProbability) {
                selectedIndex = i;
                break;
            }
        }
        
        // Store the selected state before collapse (for animation)
        const selectedState = this.superpositionStates[selectedIndex];
        const collapsedValue = selectedState.value;
        const collapsedSuit = selectedState.suit;
        
        // Animate the collapse
        this.animateCollapse(collapsedValue, collapsedSuit);
        
        // Now collapse to the selected state
        this.value = collapsedValue;
        this.suit = collapsedSuit;
        
        // Update state properties
        this.state1 = { value: this.value, suit: this.suit };
        this.state2 = null;
        
        // Reset superposition properties
        this.isInSuperposition = false;
        this.superpositionStates = [{ value: this.value, suit: this.suit }];
        this.amplitudes = [{ real: 1.0, imag: 0.0 }];
        this.coherence = 0.0; // Coherence is lost after measurement
        
        console.log(`Superposition collapsed to: ${this.toString()}`);
        
        // If this card is entangled with another, measure that card too with same color outcome
        if (this.isEntangled && this.entangledWith) {
            this.measureEntangledCard();
        }
        
        return true;
    }
    
    /**
     * Animate the collapse of superposition
     */
    animateCollapse(collapsedValue, collapsedSuit) {
        if (!this.mesh) return;
        
        // Stop any ongoing pulse animations
        if (this.pulseAnimation) {
            cancelAnimationFrame(this.pulseAnimation);
            this.pulseAnimation = null;
        }
        
        // Create animation
        const duration = 700; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // Easing function
            const eased = this.easeInOutCubic(progress);
            
            // Phase 1: Collapse effect
            if (progress < 0.5) {
                // Rapidly pulse scale
                const scale = 1.1 + 0.2 * Math.sin(progress * Math.PI * 10);
                this.mesh.scale.set(scale, scale, scale);
                
                // Flicker intensity
                if (this.mesh.material && Array.isArray(this.mesh.material)) {
                    const flicker = Math.random() * progress;
                    for (const mat of this.mesh.material) {
                        mat.emissive = new THREE.Color(0, 1 - progress * 2, 1 - progress * 2);
                        mat.emissiveIntensity = 0.3 * (1 - flicker);
                    }
                }
                
                // Spin the card
                this.mesh.rotation.z = Math.sin(progress * Math.PI * 6) * 0.3;
            } 
            // Phase 2: Settle into final state
            else {
                // Return to normal scale with damping
                const dampedScale = 1 + 0.1 * Math.sin(progress * Math.PI * 6) * Math.exp(-(progress - 0.5) * 10);
                this.mesh.scale.set(dampedScale, dampedScale, dampedScale);
                
                // Fade out glow
                if (this.mesh.material && Array.isArray(this.mesh.material)) {
                    const fadeOut = 0.3 * (1 - eased);
                    for (const mat of this.mesh.material) {
                        mat.emissive = new THREE.Color(0, 0, 0);
                        mat.emissiveIntensity = fadeOut;
                    }
                }
                
                // Stabilize rotation
                this.mesh.rotation.z = Math.sin(progress * Math.PI * 4) * 0.1 * (1 - eased);
                
                // Update texture to show collapsed state
                if (progress > 0.8 && this.mesh.material && Array.isArray(this.mesh.material) && this.mesh.material[4]) {
                    this.mesh.material[4].map = this.createCardTexture();
                    this.mesh.material[4].needsUpdate = true;
                }
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - reset to normal
                this.mesh.scale.set(1, 1, 1);
                this.mesh.rotation.z = 0;
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Measure an entangled card to match this card's suit color
     */
    measureEntangledCard() {
        if (!this.entangledWith || !this.entangledWith.isInSuperposition) {
            return;
        }
        
        const entangledCard = this.entangledWith;
        console.log(`Measuring entangled card: ${entangledCard.toString()}`);
        
        // Determine the color of this card's suit
        const thisColor = this.getCardColor();
        
        // Filter the entangled card's states to match the same color
        const matchingStates = entangledCard.superpositionStates.filter(state => {
            return this.getSuitColor(state.suit) === thisColor;
        });
        
        if (matchingStates.length === 0) {
            console.error("No matching color states found for entangled card");
            return;
        }
        
        // Pick a random state from the matching states
        const selectedState = matchingStates[Math.floor(Math.random() * matchingStates.length)];
        
        // Collapse the entangled card to this state
        entangledCard.value = selectedState.value;
        entangledCard.suit = selectedState.suit;
        
        // Reset superposition properties of entangled card
        entangledCard.isInSuperposition = false;
        entangledCard.isEntangled = false;
        entangledCard.entangledWith = null;
        entangledCard.superpositionStates = [{ value: entangledCard.value, suit: entangledCard.suit }];
        entangledCard.amplitudes = [{ real: 1.0, imag: 0.0 }];
        
        // Update the entangled card's mesh
        if (entangledCard.mesh) {
            // Remove glow effect
            if (entangledCard.mesh.material && Array.isArray(entangledCard.mesh.material)) {
                for (const mat of entangledCard.mesh.material) {
                    mat.emissive = new THREE.Color(0, 0, 0);
                    mat.emissiveIntensity = 0;
                }
            }
            
            // Update card texture
            if (entangledCard.mesh.material && Array.isArray(entangledCard.mesh.material) && entangledCard.mesh.material[4]) {
                entangledCard.mesh.material[4].map = entangledCard.createCardTexture();
                entangledCard.mesh.material[4].needsUpdate = true;
            }
        }
        
        console.log(`Entangled card collapsed to: ${entangledCard.toString()}`);
        
        // Reset this card's entanglement
        this.isEntangled = false;
        this.entangledWith = null;
    }
    
    /**
     * Get the color of the card's suit (red or black)
     */
    getCardColor() {
        return this.getSuitColor(this.suit);
    }
    
    /**
     * Get the color for a given suit
     */
    getSuitColor(suit) {
        return (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black';
    }
    
    /**
     * Entangle this card with another card
     */
    entangleWith(targetCard) {
        if (this.isEntangled || targetCard.isEntangled) {
            console.log("One of the cards is already entangled");
            return false;
        }
        
        if (!this.isInSuperposition || !targetCard.isInSuperposition) {
            console.log("Both cards must be in superposition to entangle");
            return false;
        }
        
        console.log(`Entangling ${this.toString()} with ${targetCard.toString()}`);
        
        // Set entanglement properties
        this.isEntangled = true;
        targetCard.isEntangled = true;
        this.entangledWith = targetCard;
        targetCard.entangledWith = this;
        
        // Animate both cards during entanglement
        this.animateEntanglement(targetCard);
        
        console.log(`Cards are now entangled: ${this.toString()} and ${targetCard.toString()}`);
        return true;
    }
    
    /**
     * Animate the entanglement effect between two cards
     */
    animateEntanglement(targetCard) {
        if (!this.mesh || !targetCard.mesh) return;
        
        // Save original positions and rotations
        const thisOrigPos = this.mesh.position.clone();
        const targetOrigPos = targetCard.mesh.position.clone();
        const thisOrigRot = this.mesh.rotation.clone();
        const targetOrigRot = targetCard.mesh.rotation.clone();
        
        // Create animation
        const duration = 1500; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // Easing function
            const eased = this.easeInOutCubic(progress);
            
            // Phase 1 (0-0.4): Cards move toward each other slightly
            if (progress < 0.4) {
                const p = eased * 2.5; // Remap to 0-1 for this phase
                
                // Move cards closer
                const midpoint = new THREE.Vector3().addVectors(thisOrigPos, targetOrigPos).multiplyScalar(0.5);
                this.mesh.position.lerpVectors(thisOrigPos, midpoint, p * 0.3);
                targetCard.mesh.position.lerpVectors(targetOrigPos, midpoint, p * 0.3);
                
                // Add magenta color with increasing intensity
                if (this.mesh.material && Array.isArray(this.mesh.material)) {
                    const intensity = p * 0.3;
                    for (const mat of this.mesh.material) {
                        mat.emissive = new THREE.Color(1, 0, 1);
                        mat.emissiveIntensity = intensity;
                    }
                }
                
                if (targetCard.mesh.material && Array.isArray(targetCard.mesh.material)) {
                    const intensity = p * 0.3;
                    for (const mat of targetCard.mesh.material) {
                        mat.emissive = new THREE.Color(1, 0, 1);
                        mat.emissiveIntensity = intensity;
                    }
                }
            } 
            // Phase 2 (0.4-0.6): Spin effect
            else if (progress < 0.6) {
                const p = (progress - 0.4) * 5; // Remap to 0-1 for this phase
                
                // Spin the cards
                this.mesh.rotation.z = thisOrigRot.z + p * Math.PI * 2;
                targetCard.mesh.rotation.z = targetOrigRot.z + p * Math.PI * 2;
                
                // Pulse scale
                const scale = 1 + 0.2 * Math.sin(p * Math.PI * 3);
                this.mesh.scale.set(scale, scale, scale);
                targetCard.mesh.scale.set(scale, scale, scale);
            }
            // Phase 3 (0.6-1.0): Return to original positions with glow
            else {
                const p = (progress - 0.6) * 2.5; // Remap to 0-1 for this phase
                
                // Return to original positions
                this.mesh.position.lerpVectors(this.mesh.position, thisOrigPos, p);
                targetCard.mesh.position.lerpVectors(targetCard.mesh.position, targetOrigPos, p);
                
                // Return to original rotation
                this.mesh.rotation.z = thisOrigRot.z;
                targetCard.mesh.rotation.z = targetOrigRot.z;
                
                // Set final scale
                this.mesh.scale.set(1.1, 1.1, 1.1);
                targetCard.mesh.scale.set(1.1, 1.1, 1.1);
                
                // Update card textures to show entangled state
                if (progress > 0.8) {
                    if (this.mesh.material && Array.isArray(this.mesh.material) && this.mesh.material[4]) {
                        this.mesh.material[4].map = this.createCardTexture();
                        this.mesh.material[4].needsUpdate = true;
                    }
                    
                    if (targetCard.mesh.material && Array.isArray(targetCard.mesh.material) && targetCard.mesh.material[4]) {
                        targetCard.mesh.material[4].map = targetCard.createCardTexture();
                        targetCard.mesh.material[4].needsUpdate = true;
                    }
                }
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete
                this.startEntanglementPulse();
                targetCard.startEntanglementPulse();
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Start subtle pulsing animation for entangled cards
     */
    startEntanglementPulse() {
        if (!this.mesh) return;
        
        // Clear existing animation if any
        if (this.pulseAnimation) {
            cancelAnimationFrame(this.pulseAnimation);
        }
        
        const animate = () => {
            if (!this.isEntangled || !this.mesh) return;
            
            // Subtle scale pulsing
            const pulseAmount = 0.05 * Math.sin(Date.now() * 0.002);
            this.mesh.scale.set(1.1 + pulseAmount, 1.1, 1.1 + pulseAmount);
            
            // Update glow intensity
            if (this.mesh.material && Array.isArray(this.mesh.material)) {
                const emissiveIntensity = 0.2 + 0.1 * Math.sin(Date.now() * 0.003);
                for (const mat of this.mesh.material) {
                    mat.emissive = new THREE.Color(1, 0, 1);
                    mat.emissiveIntensity = emissiveIntensity;
                }
            }
            
            // Continue animation as long as card is entangled
            this.pulseAnimation = requestAnimationFrame(animate);
        };
        
        // Start the continuous animation
        this.pulseAnimation = requestAnimationFrame(animate);
    }
    
    /**
     * Create a texture for the card
     */
    createCardTexture() {
        // Canvas for drawing card face
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        
        // Create gradient background based on suit
        let gradientColors;
        if (this.suit === 'hearts' || this.suit === 'diamonds') {
            gradientColors = ['#ffeeee', '#ffffff', '#ffdddd']; // Red suits
        } else {
            gradientColors = ['#eeeeff', '#ffffff', '#ddddff']; // Black suits
        }
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, gradientColors[0]);
        gradient.addColorStop(0.5, gradientColors[1]);
        gradient.addColorStop(1, gradientColors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw card border with rounded corners
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
        ctx.stroke();
        
        // Determine color based on suit
        const color = (this.suit === 'hearts' || this.suit === 'diamonds') ? '#ee0000' : '#000066';
        
        // Get value and suit symbols
        const valueText = this.getValueText();
        const suitSymbol = this.getSuitSymbol();
        
        // Top left value and suit with decorative styling
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        
        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw value
        ctx.fillText(valueText, 40, 100);
        
        // Draw suit with slight offset
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.fillText(suitSymbol, 40, 180);
        
        // Bottom right value and suit (upside down)
        ctx.save();
        ctx.translate(canvas.width - 40, canvas.height - 40);
        ctx.rotate(Math.PI);
        ctx.textAlign = 'right';
        ctx.fillText(valueText, 0, 0);
        ctx.fillText(suitSymbol, 0, 80);
        ctx.restore();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw decorative suit pattern in the background
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = color;
        
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                ctx.font = '50px Arial, sans-serif';
                ctx.fillText(suitSymbol, 100 + i * 80, 150 + j * 80);
            }
        }
        ctx.restore();
        
        // Large central suit with glow
        ctx.font = 'bold 300px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        
        // Add glow effect
        ctx.shadowColor = this.isInSuperposition ? '#00ffff' : (this.isEntangled ? '#ff00ff' : color);
        ctx.shadowBlur = this.isInSuperposition || this.isEntangled ? 30 : 10;
        
        // Draw the central suit symbol
        ctx.fillText(suitSymbol, canvas.width / 2, canvas.height / 2 + 75);
        
        // Reset shadow for further drawing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Add quantum effects if in superposition
        if (this.isInSuperposition) {
            // Add wave interference pattern
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            
            // Draw interference waves based on phase
            for (let i = 0; i < 20; i++) {
                const y = canvas.height * (i / 20);
                const amplitude = 30 * Math.sin(this.phase + i * Math.PI / 10);
                const wavelength = 15 + 10 * Math.sin(this.phase / 2);
                
                ctx.beginPath();
                ctx.moveTo(0, y);
                
                for (let x = 0; x < canvas.width; x += 5) {
                    const yOffset = amplitude * Math.sin((x / wavelength) + this.phase);
                    ctx.lineTo(x, y + yOffset);
                }
                
                ctx.stroke();
            }
            ctx.restore();
            
            // Add probability indicators in a more visually appealing display
            ctx.save();
            
            // Create a semi-transparent panel for probabilities
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.roundRect(40, canvas.height - 200, canvas.width - 80, 160, 10);
            ctx.fill();
            
            // Title for probability panel
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('QUANTUM STATES', canvas.width / 2, canvas.height - 170);
            
            // Display each state with probability bars
            this.superpositionStates.forEach((state, index) => {
                const prob = this.amplitudes[index].real * this.amplitudes[index].real + 
                            this.amplitudes[index].imag * this.amplitudes[index].imag;
                
                // Get display values
                const displayValue = this.getValueString(state.value);
                const displaySuit = this.capitalizeFirstLetter(state.suit);
                const stateColor = (state.suit === 'hearts' || state.suit === 'diamonds') ? '#ff6666' : '#6666ff';
                
                // Position for this state entry
                const y = canvas.height - 140 + index * 50;
                
                // Draw state description
                ctx.textAlign = 'left';
                ctx.font = '20px Arial, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(`${displayValue} of ${displaySuit}:`, 50, y);
                
                // Draw probability bar background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.roundRect(250, y - 15, 200, 20, 5);
                ctx.fill();
                
                // Draw probability bar
                ctx.fillStyle = stateColor;
                ctx.beginPath();
                ctx.roundRect(250, y - 15, 200 * prob, 20, 5);
                ctx.fill();
                
                // Draw probability percentage
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillText(`${(prob * 100).toFixed(1)}%`, canvas.width - 50, y);
            });
            
            ctx.restore();
        }
        
        // Add entanglement indicators
        if (this.isEntangled && this.entangledWith) {
            ctx.save();
            
            // Add entanglement indicator at top
            ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
            ctx.beginPath();
            ctx.roundRect(canvas.width / 2 - 100, 20, 200, 40, 10);
            ctx.fill();
            
            ctx.font = 'bold 20px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('ENTANGLED', canvas.width / 2, 48);
            
            // Add pulsing effect
            const pulseOpacity = 0.3 + 0.2 * Math.sin(Date.now() * 0.003);
            ctx.globalAlpha = pulseOpacity;
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 5;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.roundRect(20, 20, canvas.width - 40, canvas.height - 40, 20);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }
    
    /**
     * Get the text representation of the card's value
     */
    getValueText() {
        switch (this.value) {
            case 1: return 'A';
            case 11: return 'J';
            case 12: return 'Q';
            case 13: return 'K';
            default: return this.value.toString();
        }
    }
    
    /**
     * Get the Unicode symbol for the card's suit
     */
    getSuitSymbol() {
        switch (this.suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '?';
        }
    }
    
    /**
     * Flip the card
     */
    flip(faceUp = !this.isFaceUp) {
        this.isFaceUp = faceUp;
        
        // If the card has a mesh, animate the flip
        if (this.mesh) {
            // Animate flip
            const initialRotation = this.mesh.rotation.y;
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
                this.mesh.rotation.y = initialRotation * (1 - eased) + targetRotation * eased;
                
                // Continue animation if not complete
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation complete
                    this.mesh.rotation.y = targetRotation;
                }
            };
            
            // Start animation
            animate();
        }
    }
} 