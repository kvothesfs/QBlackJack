import { CardState } from './CardState.js';
import { QuantumCard } from './QuantumCard.js';
import * as THREE from 'three';

export class BlackjackGame {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerValue = 0;
        this.dealerValue = 0;
        this.gameState = 'betting';
        this.playerCardCount = 0;
        this.dealerCardCount = 0;
        
        // Additional quantum game properties
        this.quantumBonusApplied = false;      // Track if quantum bonus was applied
        this.quantumStreak = 0;                // Track consecutive quantum plays
        this.dealerHiddenCard = null;          // Reference to dealer's hidden card
    }

    initialize() {
        console.log("Initializing Blackjack game");
        this.reset();
        this.setupTable();
    }

    reset() {
        console.log("Resetting Blackjack game");
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.playerValue = 0;
        this.dealerValue = 0;
        this.gameState = 'betting';
        this.playerCardCount = 0;
        this.dealerCardCount = 0;
        this.quantumBonusApplied = false;
        this.quantumStreak = 0;
        this.dealerHiddenCard = null;

        // Create a new deck
        this.createDeck();
        this.shuffleDeck();
    }

    update(deltaTime) {
        // Check if dealer needs to draw (when player stands)
        if (this.gameState === 'dealer-turn') {
            this.updateDealerTurn();
        }
        
        // Update card states and animations
        this.updateCards(deltaTime);
    }

    updateCards(deltaTime) {
        // Update player cards
        for (const card of this.playerHand) {
            if (card.mesh) {
                // Apply any animations or effects
                if (card.isInSuperposition) {
                    // Superposition effects are handled in SceneManager
                }
            }
        }
        
        // Update dealer cards
        for (const card of this.dealerHand) {
            if (card.mesh) {
                // Apply any animations or effects
                if (card.isInSuperposition) {
                    // Superposition effects are handled in SceneManager
                }
            }
        }
    }

    setupTable() {
        console.log("Setting up Blackjack table");
        const sceneManager = this.gameManager.sceneManager;
        
        if (!sceneManager) {
            console.error("Cannot setup table - SceneManager not available");
            return;
        }
        
        // Table is already set up in SceneManager
        // Just need to reset card positions
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = Array.from({length: 13}, (_, i) => i + 1);
        
        this.deck = [];
        
        for (const suit of suits) {
            for (const value of values) {
                const card = new QuantumCard(value, suit);
                this.deck.push(card);
            }
        }
        
        console.log(`Created deck with ${this.deck.length} cards`);
    }

    shuffleDeck() {
        // Fisher-Yates shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        
        console.log("Deck shuffled");
    }

    async startNewGame() {
        console.log("Starting new Blackjack game");
        
        // Reset game state
        this.reset();
        
        // Clear previous cards from scene
        if (this.gameManager.sceneManager) {
            this.gameManager.sceneManager.clearScene();
        }
        
        // Setup table
        this.setupTable();
        
        // Deal initial cards
        await this.dealInitialCards();
        
        // Update UI using gameManager
        if (this.gameManager.updateUI) {
            this.gameManager.updateUI();
        } else if (this.gameManager.uiManager) {
            // Update hand values
            this.gameManager.uiManager.updatePlayerValue(this.playerValue);
            this.gameManager.uiManager.updateDealerValue(this.dealerValue);
        }
        
        // Set game state
        this.gameState = 'player-turn';
        
        // Check for blackjack
        if (this.playerValue === 21) {
            this.gameManager.uiManager.updateStatus("Blackjack! Dealer's turn...");
            // Short delay before dealer's turn
            setTimeout(() => this.playerStand(), 1500);
        } else {
            // Enable player controls
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus("Your turn. Hit or Stand?");
            }
        }
    }

    async dealInitialCards() {
        console.log("Dealing initial cards");
        
        // Deal first card to player
        await this.dealCardToPlayer();
        
        // Deal first card to dealer
        await this.dealCardToDealer();
        
        // Deal second card to player
        await this.dealCardToPlayer();
        
        // Deal second card to dealer (face down)
        this.dealerHiddenCard = await this.dealCardToDealer(false);
        
        // Calculate initial hand values
        this.updateHandValues();
    }

    async dealCardToPlayer() {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
        console.log("Dealing card to player");
        
        try {
            // Get a card from the deck
            const card = this.deck.pop();
            
            // Add to player's hand
            this.playerHand.push(card);
            this.playerCardCount++;
            
            // Set card position on the table
            // Cards should be spread horizontally based on the number of cards already dealt
            const xOffset = -3 + (this.playerCardCount - 1) * 1.5;
            const position = new THREE.Vector3(xOffset, 0.1, 2); // Positioned in front of the player
            
            // Add card to scene
            if (!this.gameManager || !this.gameManager.sceneManager) {
                console.error("Cannot add player card - SceneManager not available");
                return card; // Return card even if we can't add it to scene
            }
            
            console.log(`Adding player card to scene at position (${position.x}, ${position.y}, ${position.z})`);
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, true);
            
            if (cardMesh) {
                // Flip card face up after a short delay
                setTimeout(() => {
                    card.flip(true);
                }, 300);
                
                console.log("Player card added successfully");
            } else {
                console.error("Failed to add player card to scene");
            }
            
            // Update hand value
            this.updateHandValues();
            
            return card;
        } catch (error) {
            console.error("Error dealing card to player:", error);
            return null;
        }
    }

    async dealCardToDealer(faceUp = true) {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
        console.log("Dealing card to dealer, face up:", faceUp);
        
        try {
            // Get a card from the deck
            const card = this.deck.pop();
            
            // Add to dealer's hand
            this.dealerHand.push(card);
            this.dealerCardCount++;
            
            // Set card position on the table
            // Cards should be spread horizontally based on the number of cards already dealt
            const xOffset = -3 + (this.dealerCardCount - 1) * 1.5;
            const position = new THREE.Vector3(xOffset, 0.1, -2); // Positioned on the dealer's side
            
            // Add card to scene
            if (!this.gameManager || !this.gameManager.sceneManager) {
                console.error("Cannot add dealer card - SceneManager not available");
                return card; // Return card even if we can't add it to scene
            }
            
            console.log(`Adding dealer card to scene at position (${position.x}, ${position.y}, ${position.z})`);
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, false);
            
            if (cardMesh) {
                // Flip card face up or down based on parameter
                setTimeout(() => {
                    card.flip(faceUp);
                }, 300);
                
                console.log("Dealer card added successfully, face up:", faceUp);
            } else {
                console.error("Failed to add dealer card to scene");
            }
            
            // Update hand value
            this.updateHandValues();
            
            return card;
        } catch (error) {
            console.error("Error dealing card to dealer:", error);
            return null;
        }
    }

    updateHandValues() {
        // Calculate player hand value
        this.playerValue = this.calculateHandValue(this.playerHand);
        
        // Calculate dealer hand value (only for face-up cards)
        const visibleDealerCards = this.dealerHand.filter(card => card.isFaceUp);
        this.dealerValue = this.calculateHandValue(visibleDealerCards);
        
        // Update UI with hand values
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePlayerValue(this.playerValue);
            this.gameManager.uiManager.updateDealerValue(this.dealerValue);
        }
    }

    calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        let hasSuperposition = false;
        let hasEntanglement = false;
        
        // First sum up all cards
        for (const card of hand) {
            // For cards in superposition, use the average value weighted by probabilities
            if (card.isInSuperposition) {
                hasSuperposition = true;
                const possibleValues = card.getPossibleGameValues();
                const probabilities = card.amplitudes.map(amp => 
                    amp.real * amp.real + amp.imag * amp.imag
                );
                
                // Calculate weighted average
                let weightedValue = 0;
                for (let i = 0; i < possibleValues.length; i++) {
                    weightedValue += possibleValues[i] * probabilities[i];
                }
                value += Math.round(weightedValue);
                
                // Check if any possible state is an Ace
                if (possibleValues.includes(11)) {
                    aceCount++;
                }
                
                // Note if card is entangled
                if (card.isEntangled) {
                    hasEntanglement = true;
                }
            } else {
                // Regular card
                const cardValue = card.getGameValue();
                value += cardValue;
                
                // Count Aces
                if (cardValue === 11) {
                    aceCount++;
                }
                
                // Note if card is entangled
                if (card.isEntangled) {
                    hasEntanglement = true;
                }
            }
        }
        
        // Adjust for Aces if needed
        while (value > 21 && aceCount > 0) {
            value -= 10; // Convert an Ace from 11 to 1
            aceCount--;
        }
        
        // If quantum effects are active, and this is the player's hand, add quantum bonus
        if (hand === this.playerHand && (hasSuperposition || hasEntanglement) && !this.quantumBonusApplied) {
            // Quantum bonus - apply a small advantage for using quantum effects
            // This makes gameplay more interesting and rewards quantum strategy
            if (value < 21) {
                this.quantumBonusApplied = true;
                this.quantumStreak++;
                
                // Calculate quantum advantage based on coherence and entanglement
                let quantumAdvantage = 0;
                if (hasSuperposition) {
                    // Add advantage based on number of cards in superposition
                    const superposedCards = hand.filter(c => c.isInSuperposition);
                    quantumAdvantage += superposedCards.length * 0.5;
                }
                if (hasEntanglement) {
                    // Add advantage for entangled cards
                    const entangledCards = hand.filter(c => c.isEntangled);
                    quantumAdvantage += entangledCards.length * 0.3;
                }
                
                // Apply the quantum advantage
                value += Math.round(quantumAdvantage);
                
                if (this.gameManager.uiManager) {
                    this.gameManager.uiManager.updateStatus(
                        `Quantum probability shift detected! Streak: ${this.quantumStreak}, Advantage: +${Math.round(quantumAdvantage)}`
                    );
                }
            }
        }
        
        return value;
    }

    updateDealerTurn() {
        // Reveal dealer's face-down card first
        if (this.dealerHiddenCard && !this.dealerHiddenCard.isFaceUp) {
            this.dealerHiddenCard.flip(true);
            this.updateHandValues();
            
            // Show dealer's full hand value after revealing the hidden card
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus(`Dealer reveals ${this.dealerHiddenCard.toString()}`);
            }
            
            return; // Wait one update cycle after revealing card
        }
        
        // Check for quantum effects in dealer's hand
        const hasSuperposition = this.dealerHand.some(card => card.isInSuperposition);
        const hasEntanglement = this.dealerHand.some(card => card.isEntangled);
        
        if (hasSuperposition || hasEntanglement) {
            // Collapse all quantum states before determining final hand value
            for (const card of this.dealerHand) {
                if (card.isInSuperposition) {
                    card.measure();
                    
                    if (this.gameManager.uiManager) {
                        this.gameManager.uiManager.updateStatus(`Dealer's ${card.toString()} collapses from superposition`);
                    }
                }
            }
            
            // Recalculate hand value after collapsing
            this.updateHandValues();
            return; // Wait one cycle after collapsing
        }
        
        // Dealer draws until they have 17 or more
        if (this.dealerValue < 17) {
            this.dealCardToDealer();
            
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus("Dealer draws a card");
            }
        } else {
            // Dealer is done drawing
            this.endGame();
        }
    }

    endGame() {
        // Apply quantum effects for more interesting outcomes
        const playerHasQuantumCards = this.playerHand.some(card => 
            card.isInSuperposition || card.isEntangled);
        
        // Determine winner
        if (this.playerValue > 21) {
            // Player busts
            this.gameState = 'game-over';
            if (playerHasQuantumCards) {
                this.gameManager.uiManager.showLose("Quantum decoherence! Your hand collapses to a bust.");
            } else {
                this.gameManager.uiManager.showLose("Bust! You lose.");
            }
        } else if (this.dealerValue > 21) {
            // Dealer busts
            this.gameState = 'game-over';
            if (playerHasQuantumCards) {
                this.gameManager.uiManager.showWin("Quantum advantage! Dealer busts while you maintain coherence.");
            } else {
                this.gameManager.uiManager.showWin("Dealer busts! You win.");
            }
        } else if (this.playerValue > this.dealerValue) {
            // Player wins
            this.gameState = 'game-over';
            if (playerHasQuantumCards && this.quantumStreak > 1) {
                this.gameManager.uiManager.showWin(`Quantum streak x${this.quantumStreak}! Superior hand value.`);
            } else {
                this.gameManager.uiManager.showWin("You win!");
            }
        } else if (this.playerValue < this.dealerValue) {
            // Dealer wins
            this.gameState = 'game-over';
            if (playerHasQuantumCards) {
                this.gameManager.uiManager.showLose("Your quantum state collapsed unfavorably. Dealer wins.");
            } else {
                this.gameManager.uiManager.showLose("Dealer wins.");
            }
        } else {
            // Push (tie)
            this.gameState = 'game-over';
            if (playerHasQuantumCards) {
                this.gameManager.uiManager.showTie("Quantum equilibrium achieved. It's a tie.");
            } else {
                this.gameManager.uiManager.showTie("Push! It's a tie.");
            }
        }
        
        // Show controls for starting a new game
        if (this.gameManager.uiManager) {
            setTimeout(() => {
                this.gameManager.uiManager.updateStatus("Game over. Start a new game?");
            }, 2000);
        }
    }

    playerHit() {
        if (this.gameState !== 'player-turn') return;
        
        // Deal a card to the player
        this.dealCardToPlayer().then(card => {
            // Check if player has quantum cards
            const hasQuantumCards = this.playerHand.some(c => 
                c.isInSuperposition || c.isEntangled);
            
            if (hasQuantumCards) {
                this.gameManager.uiManager.updateStatus("Your quantum hand evolves. Hit or Stand?");
            } else {
                this.gameManager.uiManager.updateStatus("Hit or Stand?");
            }
            
            // Check if player busts
            if (this.playerValue > 21) {
                // Check if there are cards in superposition that could be measured to avoid bust
                const superpositionCards = this.playerHand.filter(c => c.isInSuperposition);
                
                if (superpositionCards.length > 0) {
                    this.gameManager.uiManager.updateStatus("You're over 21! Try measuring your superposition cards.");
                    
                    // Don't end game yet - player might measure superposition cards to get under 21
                } else {
                    this.gameState = 'game-over';
                    this.endGame();
                }
            }
        });
    }

    playerStand() {
        if (this.gameState !== 'player-turn') return;
        
        // First, collapse any remaining superposition cards if player has any
        const superpositionCards = this.playerHand.filter(card => card.isInSuperposition);
        
        if (superpositionCards.length > 0) {
            // Ask if player wants to collapse cards first
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus("Measuring quantum states before standing...");
            }
            
            // Collapse all cards in superposition
            for (const card of superpositionCards) {
                card.measure();
            }
            
            // Update hand value after collapsing
            this.updateHandValues();
            
            // Short delay before proceeding to dealer's turn
            setTimeout(() => {
                // Switch to dealer's turn
                this.gameState = 'dealer-turn';
                this.gameManager.uiManager.updateStatus("Dealer's turn");
            }, 1500);
        } else {
            // Switch to dealer's turn immediately
            this.gameState = 'dealer-turn';
            this.gameManager.uiManager.updateStatus("Dealer's turn");
        }
    }
} 