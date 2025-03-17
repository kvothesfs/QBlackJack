import { EventEmitter } from '../utils/EventEmitter.js';
import { QuantumCard } from './QuantumCard.js';
import { CardState } from './CardState.js';
import * as THREE from 'three';

// Game states
export const GameState = {
    IDLE: 'idle',
    BETTING: 'betting',
    PLAYER_TURN: 'playerTurn',
    DEALER_TURN: 'dealerTurn',
    RESOLVING: 'resolving',
    GAME_OVER: 'gameOver'
};

export class GameManager extends EventEmitter {
    constructor(sceneManager, soundManager, assetLoader) {
        super();
        this.sceneManager = sceneManager;
        this.soundManager = soundManager;
        this.assetLoader = assetLoader;
        
        // Add the sound listener to the camera
        if (sceneManager && sceneManager.camera) {
            this.soundManager.addListenerToCamera(sceneManager.camera);
        } else {
            console.error("Cannot add sound listener to camera: Camera not found in SceneManager");
        }
        
        // Game variables
        this.money = 1000; // Starting money
        this.bet = 0;
        this.gameState = GameState.IDLE;
        
        // Quantum chips
        this.chips = {
            hadamard: 3, // Put card in superposition
            schrodinger: 3, // Collapse card
            entanglement: 3 // Entangle two cards
        };
        
        // Cards
        this.playerCards = [];
        this.dealerCards = [];
        this.selectedCard = null; // For quantum operations
        this.cardForEntanglement = null; // First card selected for entanglement
        
        // Deck
        this.deck = CardState.createDeck();
        this.shuffleDeck();
        
        // Set up mouse interactions
        this.setupMouseEvents();
        
        // Last game timestamp for update
        this.lastTime = performance.now();
    }

    setupMouseEvents() {
        this.sceneManager.setupMouseEvents((card) => {
            this.handleCardClick(card);
        });
    }

    handleCardClick(card) {
        // Only allow card interaction during player's turn
        if (this.gameState !== GameState.PLAYER_TURN) return;
        
        // If we're selecting cards for entanglement
        if (this.chips.entanglement > 0 && this.cardForEntanglement) {
            if (card !== this.cardForEntanglement && !card.collapsed && !card.entangledWith) {
                this.entangleCards(this.cardForEntanglement, card);
                this.cardForEntanglement = null;
                this.deselectCard();
            }
            return;
        }
        
        // Select/deselect card
        if (this.selectedCard === card) {
            this.deselectCard();
        } else {
            this.selectCard(card);
        }
    }

    selectCard(card) {
        // Deselect previous card if any
        if (this.selectedCard) {
            this.selectedCard.mesh.position.y -= 0.2;
        }
        
        // Select new card
        this.selectedCard = card;
        card.mesh.position.y += 0.2; // Raise the card slightly
    }

    deselectCard() {
        if (this.selectedCard) {
            this.selectedCard.mesh.position.y -= 0.2;
            this.selectedCard = null;
        }
    }

    startGame() {
        // Reset game state
        this.gameState = GameState.BETTING;
        this.emit('gameStateChanged', this.gameState);
        
        // Clear table
        this.clearTable();
        
        // Check if we need to shuffle deck
        if (this.deck.length < 10) {
            this.shuffleDeck();
        }
    }

    placeBet(amount) {
        if (this.gameState === GameState.BETTING) {
            amount = Math.min(amount, this.money);
            this.bet = amount;
            this.money -= amount;
            
            this.emit('betChanged', this.bet);
            this.emit('moneyChanged', this.money);
            
            // Deal cards
            this.dealInitialCards();
        }
    }

    shuffleDeck() {
        this.deck = CardState.createDeck();
        this.deck = CardState.shuffleDeck(this.deck);
    }

    async dealInitialCards() {
        // Change game state
        this.gameState = GameState.PLAYER_TURN;
        this.emit('gameStateChanged', this.gameState);
        
        // Deal initial cards (2 for player, 2 for dealer with one face down)
        await this.dealCardToPlayer();
        await this.dealCardToDealer(false); // Face up
        await this.dealCardToPlayer();
        await this.dealCardToDealer(true); // Face down
        
        // Check for blackjack
        this.checkForBlackjack();
    }

    async dealCardToPlayer() {
        // Draw a card from the deck
        const [state1, state2] = this.getNextCardStates();
        
        // Create a quantum card
        const card = new QuantumCard(state1, state2, this.assetLoader);
        
        // Position the card
        const position = new THREE.Vector3((this.playerCards.length - 1) * 0.8, 0, 0);
        this.sceneManager.addCard(card, position);
        
        // Add to player's hand
        this.playerCards.push(card);
        
        // Play sound
        this.soundManager.playCardPlace();
        
        // Flip the card to reveal it after a small delay
        await this.sleep(300);
        await card.flipToFront();
        this.soundManager.playCardFlip();
        
        // Update hand value display
        this.updateHandValue();
        
        return card;
    }

    async dealCardToDealer(faceDown = false) {
        // Draw a card from the deck
        const [state1, state2] = this.getNextCardStates();
        
        // Create a quantum card
        const card = new QuantumCard(state1, state2, this.assetLoader);
        
        // Position the card
        const position = new THREE.Vector3((this.dealerCards.length - 1) * 0.8, 0, 0);
        this.sceneManager.addCard(card, position, true); // isDealer = true
        
        // Add to dealer's hand
        this.dealerCards.push(card);
        
        // Play sound
        this.soundManager.playCardPlace();
        
        // Flip the card if not face down
        await this.sleep(300);
        if (!faceDown) {
            await card.flipToFront();
            this.soundManager.playCardFlip();
        }
        
        return card;
    }

    getNextCardStates() {
        if (this.deck.length < 2) {
            this.shuffleDeck();
        }
        
        // Draw two states from the deck
        const state1 = this.deck.pop();
        const state2 = this.deck.pop();
        
        return [state1, state2];
    }

    updateHandValue() {
        const { min, max } = this.calculateHandValue(this.playerCards);
        
        let displayValue;
        if (min === max) {
            displayValue = min.toString();
        } else {
            displayValue = `${min}-${max}`;
        }
        
        // If any card is in superposition, show it as "uncertain"
        const isUncertain = this.playerCards.some(card => !card.collapsed);
        if (isUncertain) {
            displayValue = `${displayValue} (uncertain)`;
        }
        
        this.emit('handValueChanged', displayValue);
    }

    calculateHandValue(cards) {
        // For collapsed cards, we have single values
        // For superposition cards, we need to consider all possible combinations
        
        // Separate collapsed and uncollapsed cards
        const collapsedCards = cards.filter(card => card.collapsed);
        const uncollapsedCards = cards.filter(card => !card.collapsed);
        
        // Calculate collapsed cards total
        let collapsedTotal = 0;
        let aceCount = 0;
        
        collapsedCards.forEach(card => {
            const value = card.currentState.blackjackValue();
            collapsedTotal += value;
            if (card.currentState.value === 'ace') {
                aceCount++;
            }
        });
        
        // Adjust for aces if needed
        while (collapsedTotal > 21 && aceCount > 0) {
            collapsedTotal -= 10; // Convert an Ace from 11 to 1
            aceCount--;
        }
        
        // If all cards are collapsed, return single value
        if (uncollapsedCards.length === 0) {
            return { min: collapsedTotal, max: collapsedTotal };
        }
        
        // For uncollapsed cards, we need to consider different combinations
        // This will generate the min and max possible values
        let minTotal = collapsedTotal;
        let maxTotal = collapsedTotal;
        
        uncollapsedCards.forEach(card => {
            const { min, max } = card.getValueRange();
            minTotal += min;
            maxTotal += max;
        });
        
        // Adjust for potential aces in the uncollapsed cards
        const potentialAces = uncollapsedCards.filter(
            card => card.state1.value === 'ace' || card.state2.value === 'ace'
        ).length;
        
        let adjustedMinTotal = minTotal;
        let adjustedMaxTotal = maxTotal;
        
        // Adjust min value: convert aces from 11 to 1 if needed
        let remainingAces = potentialAces + aceCount;
        while (adjustedMinTotal > 21 && remainingAces > 0) {
            adjustedMinTotal -= 10;
            remainingAces--;
        }
        
        // Adjust max value similarly
        remainingAces = potentialAces + aceCount;
        while (adjustedMaxTotal > 21 && remainingAces > 0) {
            adjustedMaxTotal -= 10;
            remainingAces--;
        }
        
        return { 
            min: Math.min(adjustedMinTotal, 21), 
            max: Math.min(adjustedMaxTotal, 21) 
        };
    }

    checkForBlackjack() {
        // Can only have blackjack with 2 cards and if all are collapsed
        if (this.playerCards.length === 2 && this.playerCards.every(card => card.collapsed)) {
            const { min } = this.calculateHandValue(this.playerCards);
            if (min === 21) {
                this.handleBlackjack();
            }
        }
    }

    async handleBlackjack() {
        // Reveal dealer's face-down card
        await this.revealDealerCard();
        
        // Check if dealer also has blackjack
        const { min } = this.calculateHandValue(this.dealerCards);
        
        if (min === 21) {
            // Push - return bet
            this.money += this.bet;
            this.emit('notification', 'Push! Both you and the dealer have Blackjack.');
        } else {
            // Player wins with blackjack (pays 3:2)
            this.money += this.bet * 2.5;
            this.emit('notification', 'Blackjack! You win 3:2.');
            this.soundManager.playWinSound();
        }
        
        this.emit('moneyChanged', this.money);
        this.gameState = GameState.GAME_OVER;
        this.emit('gameStateChanged', this.gameState);
    }

    async hit() {
        if (this.gameState === GameState.PLAYER_TURN) {
            // Deal a new card to the player
            await this.dealCardToPlayer();
            
            // Check if player busts
            await this.checkForBust();
        }
    }

    async checkForBust() {
        // First collapse any cards in superposition
        await this.collapseAllSuperpositionCards();
        
        // Calculate hand value after collapse
        const { min } = this.calculateHandValue(this.playerCards);
        
        if (min > 21) {
            // Player busts
            this.emit('notification', 'Bust! Your hand exceeds 21.');
            this.soundManager.playLoseSound();
            
            this.gameState = GameState.GAME_OVER;
            this.emit('gameStateChanged', this.gameState);
        }
    }

    async stand() {
        if (this.gameState === GameState.PLAYER_TURN) {
            // Collapse any cards in superposition
            await this.collapseAllSuperpositionCards();
            
            // Start dealer's turn
            this.gameState = GameState.DEALER_TURN;
            this.emit('gameStateChanged', this.gameState);
            
            // Deal dealer's cards
            await this.playDealerTurn();
        }
    }

    async collapseAllSuperpositionCards() {
        const superpositionCards = this.playerCards.filter(card => !card.collapsed);
        
        for (const card of superpositionCards) {
            await this.sleep(500); // Small delay between collapses
            this.soundManager.playCollapseSound();
            card.collapse();
        }
        
        // Clear any entanglement lines
        this.sceneManager.removeEntanglementLine();
        
        // Update hand value display after all collapses
        this.updateHandValue();
    }

    async revealDealerCard() {
        // Find face-down dealer card
        const faceDownCard = this.dealerCards.find(
            card => card.mesh.rotation.x === Math.PI
        );
        
        if (faceDownCard) {
            await faceDownCard.flipToFront();
            this.soundManager.playCardFlip();
        }
    }

    async playDealerTurn() {
        // Reveal dealer's face-down card
        await this.revealDealerCard();
        
        // Keep drawing cards until the dealer has at least 17
        let dealerValue = this.calculateHandValue(this.dealerCards).min;
        
        while (dealerValue < 17) {
            await this.sleep(1000); // Pause between dealer draws
            
            // Deal a card to the dealer
            await this.dealCardToDealer(false);
            
            // Recalculate dealer's hand
            dealerValue = this.calculateHandValue(this.dealerCards).min;
        }
        
        // Compare hands and determine winner
        await this.determineWinner();
    }

    async determineWinner() {
        this.gameState = GameState.RESOLVING;
        this.emit('gameStateChanged', this.gameState);
        
        const playerValue = this.calculateHandValue(this.playerCards).min;
        const dealerValue = this.calculateHandValue(this.dealerCards).min;
        
        await this.sleep(1000); // Dramatic pause
        
        if (playerValue > 21) {
            // Player busts, dealer wins
            this.emit('notification', 'Dealer wins! You went over 21.');
            this.soundManager.playLoseSound();
        } else if (dealerValue > 21) {
            // Dealer busts, player wins
            this.money += this.bet * 2;
            this.emit('notification', 'You win! Dealer went over 21.');
            this.soundManager.playWinSound();
        } else if (playerValue > dealerValue) {
            // Player wins
            this.money += this.bet * 2;
            this.emit('notification', `You win! Your ${playerValue} beats dealer's ${dealerValue}.`);
            this.soundManager.playWinSound();
        } else if (dealerValue > playerValue) {
            // Dealer wins
            this.emit('notification', `Dealer wins with ${dealerValue} against your ${playerValue}.`);
            this.soundManager.playLoseSound();
        } else {
            // Push - tie
            this.money += this.bet;
            this.emit('notification', `Push! Both you and the dealer have ${playerValue}.`);
        }
        
        this.emit('moneyChanged', this.money);
        this.gameState = GameState.GAME_OVER;
        this.emit('gameStateChanged', this.gameState);
    }

    useHadamardChip() {
        if (this.gameState === GameState.PLAYER_TURN && this.selectedCard && this.chips.hadamard > 0) {
            // Ensure card is not already in superposition or entangled
            if (this.selectedCard.collapsed && !this.selectedCard.entangledWith) {
                // Apply Hadamard (put in superposition)
                const success = this.selectedCard.putInSuperposition();
                
                if (success) {
                    // Play effect
                    this.soundManager.playSuperpositionSound();
                    
                    // Use up a chip
                    this.chips.hadamard--;
                    this.emit('chipsChanged', this.chips);
                    
                    // Update hand value
                    this.updateHandValue();
                    
                    // Show educational notification
                    this.emit('notification', 'Card is now in superposition! It exists in both states until measured.');
                    
                    return true;
                }
            } else {
                if (this.selectedCard.isInSuperposition()) {
                    this.emit('notification', 'Card is already in superposition.');
                } else if (this.selectedCard.isEntangled()) {
                    this.emit('notification', 'Cannot put an entangled card in superposition.');
                }
            }
        }
        return false;
    }

    useSchrodingerChip() {
        if (this.gameState === GameState.PLAYER_TURN && this.selectedCard && this.chips.schrodinger > 0) {
            // Ensure card is in superposition
            if (!this.selectedCard.collapsed) {
                // Play effect
                this.soundManager.playCollapseSound();
                
                // Collapse the card
                const newState = this.selectedCard.collapse();
                
                // Use up a chip
                this.chips.schrodinger--;
                this.emit('chipsChanged', this.chips);
                
                // Update hand value
                this.updateHandValue();
                
                // Show educational notification
                this.emit('notification', `Card collapsed to ${newState.toString()}! Measurement forces a definite state.`);
                
                // Clear any entanglement lines
                this.sceneManager.removeEntanglementLine();
                
                return true;
            } else {
                this.emit('notification', 'Card is not in superposition. Cannot collapse a definite state.');
            }
        }
        return false;
    }

    startEntanglement() {
        if (this.gameState === GameState.PLAYER_TURN && this.selectedCard && this.chips.entanglement > 0) {
            // Ensure card is in superposition and not already entangled
            if (!this.selectedCard.collapsed && !this.selectedCard.entangledWith) {
                // Mark as first card for entanglement
                this.cardForEntanglement = this.selectedCard;
                
                // Show notification
                this.emit('notification', 'Select another superposed card to entangle with this one.');
                
                return true;
            } else {
                if (this.selectedCard.collapsed) {
                    this.emit('notification', 'Cannot entangle a card that is not in superposition.');
                } else if (this.selectedCard.entangledWith) {
                    this.emit('notification', 'Card is already entangled with another card.');
                }
            }
        }
        return false;
    }

    entangleCards(card1, card2) {
        if (this.chips.entanglement > 0) {
            // Entangle the cards
            const success = card1.entangleWith(card2);
            
            if (success) {
                // Play effect
                this.soundManager.playEntanglementSound();
                
                // Use up a chip
                this.chips.entanglement--;
                this.emit('chipsChanged', this.chips);
                
                // Create visual entanglement line
                this.sceneManager.createEntanglementLine(card1, card2);
                
                // Show educational notification
                this.emit('notification', 'Cards are now entangled! They will collapse to the same color.');
                
                return true;
            }
        }
        return false;
    }

    cancelEntanglement() {
        if (this.cardForEntanglement) {
            this.cardForEntanglement = null;
            this.emit('notification', 'Entanglement cancelled.');
            return true;
        }
        return false;
    }

    buyChip(type) {
        const prices = {
            hadamard: 100,
            schrodinger: 100,
            entanglement: 150
        };
        
        if (this.money >= prices[type]) {
            this.money -= prices[type];
            this.chips[type]++;
            
            this.emit('moneyChanged', this.money);
            this.emit('chipsChanged', this.chips);
            this.emit('notification', `Purchased a ${type.charAt(0).toUpperCase() + type.slice(1)} chip!`);
            
            return true;
        } else {
            this.emit('notification', 'Not enough money to buy this chip.');
            return false;
        }
    }

    clearTable() {
        // Clear selected cards
        this.deselectCard();
        this.cardForEntanglement = null;
        
        // Clear all cards
        this.sceneManager.clearCards();
        this.playerCards = [];
        this.dealerCards = [];
        
        // Clear any entanglement line
        this.sceneManager.removeEntanglementLine();
        
        // Update hand value
        this.updateHandValue();
    }

    update() {
        // Calculate delta time
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = now;
        
        // Update card animations
        [...this.playerCards, ...this.dealerCards].forEach(card => {
            card.update(deltaTime);
        });
        
        // Update entanglement line if it exists
        if (this.sceneManager.entanglementLine) {
            const entangledCards = this.playerCards.filter(card => card.entangledWith);
            if (entangledCards.length >= 2) {
                // Find pairs of entangled cards
                for (let i = 0; i < entangledCards.length; i++) {
                    for (let j = i + 1; j < entangledCards.length; j++) {
                        if (entangledCards[i].entangledWith === entangledCards[j]) {
                            this.sceneManager.updateEntanglementLine(entangledCards[i], entangledCards[j]);
                            break;
                        }
                    }
                }
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
} 