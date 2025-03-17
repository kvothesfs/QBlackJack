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
            // Add cyan glow effect with phase-dependent intensity
            if (this.mesh.material && Array.isArray(this.mesh.material)) {
                for (const mat of this.mesh.material) {
                    mat.emissive = new THREE.Color(0, 1, 1);
                    mat.emissiveIntensity = 0.3 * (1 + Math.sin(this.phase));
                }
            }
        }
        
        console.log(`Card now in superposition: ${this.toString()}`);
        return true;
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
        
        // Collapse to the selected state
        const selectedState = this.superpositionStates[selectedIndex];
        this.value = selectedState.value;
        this.suit = selectedState.suit;
        
        // Update state properties
        this.state1 = { value: this.value, suit: this.suit };
        this.state2 = null;
        
        // Reset superposition properties
        this.isInSuperposition = false;
        this.superpositionStates = [{ value: this.value, suit: this.suit }];
        this.amplitudes = [{ real: 1.0, imag: 0.0 }];
        this.coherence = 0.0; // Coherence is lost after measurement
        
        // Apply visual effect to card mesh if it exists
        if (this.mesh) {
            // Remove glow effect
            if (this.mesh.material && Array.isArray(this.mesh.material)) {
                for (const mat of this.mesh.material) {
                    mat.emissive = new THREE.Color(0, 0, 0);
                    mat.emissiveIntensity = 0;
                }
            }
            
            // Update card texture
            if (this.mesh.material && Array.isArray(this.mesh.material) && this.mesh.material[4]) {
                // Front face is typically index 4
                this.mesh.material[4].map = this.createCardTexture();
                this.mesh.material[4].needsUpdate = true;
            }
        }
        
        console.log(`Superposition collapsed to: ${this.toString()}`);
        
        // If this card is entangled with another, measure that card too with same color outcome
        if (this.isEntangled && this.entangledWith) {
            this.measureEntangledCard();
        }
        
        return true;
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
        
        // Apply visual effect to card meshes if they exist
        if (this.mesh) {
            // Add magenta glow effect
            if (this.mesh.material && Array.isArray(this.mesh.material)) {
                for (const mat of this.mesh.material) {
                    mat.emissive = new THREE.Color(1, 0, 1);
                    mat.emissiveIntensity = 0.3;
                }
            }
        }
        
        if (targetCard.mesh) {
            // Add magenta glow effect
            if (targetCard.mesh.material && Array.isArray(targetCard.mesh.material)) {
                for (const mat of targetCard.mesh.material) {
                    mat.emissive = new THREE.Color(1, 0, 1);
                    mat.emissiveIntensity = 0.3;
                }
            }
        }
        
        console.log(`Cards are now entangled: ${this.toString()} and ${targetCard.toString()}`);
        return true;
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
        
        // Fill background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw card border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Value and suit
        const value = this.value;
        const suit = this.suit;
        
        // Font and color based on suit
        ctx.font = '120px Arial, sans-serif';
        ctx.textAlign = 'center';
        
        if (suit === 'hearts' || suit === 'diamonds') {
            ctx.fillStyle = '#ff0000';
        } else {
            ctx.fillStyle = '#000000';
        }
        
        // Draw value at top left and bottom right
        const valueText = this.getValueText();
        
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
        const suitSymbol = this.getSuitSymbol();
        
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
        
        // Add quantum effects if in superposition
        if (this.isInSuperposition) {
            // Add interference pattern
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            
            // Draw interference lines based on phase
            for (let i = 0; i < 10; i++) {
                const y = canvas.height * (i / 10);
                const amplitude = 20 * Math.sin(this.phase + i * Math.PI / 5);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y + amplitude);
                ctx.stroke();
            }
            ctx.restore();
            
            // Add probability indicators
            this.amplitudes.forEach((amp, index) => {
                const prob = amp.real * amp.real + amp.imag * amp.imag;
                const state = this.superpositionStates[index];
                ctx.font = '20px Arial, sans-serif';
                ctx.fillStyle = '#000000';
                ctx.textAlign = 'left';
                ctx.fillText(`${state.value} of ${state.suit}: ${(prob * 100).toFixed(1)}%`, 
                            40, 300 + index * 30);
            });
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