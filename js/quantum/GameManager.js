import { EventEmitter } from '../utils/EventEmitter.js';
import { QuantumCard } from './QuantumCard.js';
import { CardState } from './CardState.js';
import * as THREE from 'three';
import { TexasHoldEm } from './TexasHoldEm.js';
import { BlackjackGame } from './BlackjackGame.js';

// Game states
export const GameState = {
    IDLE: 'idle',
    BETTING: 'betting',
    PLAYER_TURN: 'playerTurn',
    DEALER_TURN: 'dealerTurn',
    RESOLVING: 'resolving',
    GAME_OVER: 'gameOver',
    WAITING: 'waiting',
    PLAYING: 'playing'
};

export class GameManager extends EventEmitter {
    constructor() {
        super();
        this.sceneManager = null;
        this.assetLoader = null;
        this.uiManager = null;
        this.gameType = null;
        this.gameState = null;
        this.selectedCard = null;
        this.entanglementTarget = null;
        this.tutorialShown = false;
        this.isInitialized = false;
        
        // Initialize game instances
        this.blackjackGame = new BlackjackGame(this);
        this.pokerGame = new TexasHoldEm(this);
    }

    initialize(sceneManager, assetLoader, uiManager) {
        this.sceneManager = sceneManager;
        this.assetLoader = assetLoader;
        this.uiManager = uiManager;
        this.isInitialized = true;
        
        // Set up mouse events for card selection
        this.sceneManager.setupMouseEvents((card) => {
            this.handleCardSelection(card);
        });
    }

    handleCardSelection(card) {
        if (!card) return;
        
        console.log("Card selected:", card);
        this.selectedCard = card;
        
        // Update UI to show card is selected
        if (this.uiManager) {
            this.uiManager.updateStatus("Card selected. Use quantum controls to manipulate it.");
        }
    }

    setGameType(type) {
        if (!this.isInitialized) {
            console.error("GameManager not initialized. Please wait for initialization to complete.");
            return;
        }

        this.gameType = type;
        this.gameState = type === 'blackjack' ? GameState.BETTING : GameState.POKER_BETTING;
        
        // Only clear scene if sceneManager is initialized
        if (this.sceneManager) {
            this.sceneManager.clearScene();
            
            // Initialize the selected game
            if (type === 'blackjack') {
                this.blackjackGame.initialize();
                this.pokerGame.reset();
                this.gameState = GameState.WAITING;
                this.showTutorial('blackjack');
            } else if (type === 'poker') {
                this.pokerGame.initialize();
                this.blackjackGame.reset();
                this.gameState = GameState.WAITING;
                this.showTutorial('poker');
            }
        } else {
            console.error("SceneManager not initialized. Cannot set game type.");
        }
    }

    showTutorial(gameType) {
        if (this.tutorialShown) return;
        
        const tutorials = {
            blackjack: [
                "Welcome to Quantum Blackjack!",
                "You can use quantum mechanics to manipulate your cards:",
                "1. Click a card to select it",
                "2. Use the Hadamard chip to put it in superposition",
                "3. Use the Schrödinger chip to measure it",
                "4. Use the Entanglement chip to entangle two cards",
                "Try to beat the dealer while using quantum mechanics to your advantage!"
            ],
            poker: [
                "Welcome to Quantum Texas Hold Em!",
                "You can use quantum mechanics to manipulate your cards:",
                "1. Click a card to select it",
                "2. Use the Hadamard chip to put it in superposition",
                "3. Use the Schrödinger chip to measure it",
                "4. Use the Entanglement chip to entangle two cards",
                "Try to make the best hand while using quantum mechanics to your advantage!"
            ]
        };

        if (this.uiManager) {
            this.uiManager.showTutorial(tutorials[gameType]);
            this.tutorialShown = true;
        }
    }

    async startNewGame() {
        if (!this.sceneManager) return;
        
        this.tutorialShown = false;
        if (this.gameType === 'blackjack') {
            await this.blackjackGame.startNewGame();
        } else if (this.gameType === 'poker') {
            await this.pokerGame.startNewGame();
        }
    }

    // Blackjack controls
    async playerHit() {
        if (this.gameType === 'blackjack' && this.gameState === GameState.PLAYER_TURN) {
            await this.blackjackGame.playerHit();
        }
    }

    async playerStand() {
        if (this.gameType === 'blackjack' && this.gameState === GameState.PLAYER_TURN) {
            await this.blackjackGame.playerStand();
        }
    }

    async playerDouble() {
        if (this.gameType === 'blackjack' && this.gameState === GameState.PLAYER_TURN) {
            await this.blackjackGame.playerDouble();
        }
    }

    async playerSplit() {
        if (this.gameType === 'blackjack' && this.gameState === GameState.PLAYER_TURN) {
            await this.blackjackGame.playerSplit();
        }
    }

    // Quantum mechanics
    applySuperposition(card) {
        if (!card) return;
        card.putInSuperposition();
        this.updateUI();
    }

    applyEntanglement(card1, card2) {
        if (!card1 || !card2) return;
        card1.entangleWith(card2);
        this.sceneManager.createEntanglementLine(card1, card2);
        this.updateUI();
    }

    measureCard(card) {
        if (!card) return;
        card.collapse();
        this.sceneManager.removeEntanglementLine();
        this.updateUI();
    }

    // UI updates
    updateUI() {
        if (this.uiManager) {
            if (this.gameType === 'blackjack') {
                this.uiManager.updateHandValues(
                    this.blackjackGame.getPlayerHandValue(),
                    this.blackjackGame.getDealerHandValue()
                );
            }
            
            // Update quantum counts
            const superposedCards = this.countSuperposedCards();
            const entangledCards = this.countEntangledCards();
            this.uiManager.updateQuantumCounts(superposedCards, entangledCards);
        }
    }

    countSuperposedCards() {
        let count = 0;
        if (this.gameType === 'blackjack') {
            [...this.blackjackGame.playerCards, ...this.blackjackGame.dealerCards].forEach(card => {
                if (card.isInSuperposition()) count++;
            });
        }
        return count;
    }

    countEntangledCards() {
        let count = 0;
        if (this.gameType === 'blackjack') {
            [...this.blackjackGame.playerCards, ...this.blackjackGame.dealerCards].forEach(card => {
                if (card.isEntangled()) count++;
            });
        }
        return count;
    }

    // Add a method to safely set the UI manager
    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }
    
    // Add a method to update the camera ref if it wasn't available initially
    update(deltaTime) {
        // If we need to add the listener to the camera and now the camera is available
        if (this._pendingListenerAdd && this.sceneManager && this.sceneManager.camera) {
            try {
                this.soundManager.addListenerToCamera(this.sceneManager.camera);
                this._pendingListenerAdd = false;
                console.log("Sound listener added to camera");
            } catch (error) {
                console.error("Failed to add sound listener to camera during update:", error);
            }
        }
        
        // Update the active game
        if (this.gameType === 'blackjack' && this.blackjackGame) {
            this.blackjackGame.update(deltaTime);
        } else if (this.gameType === 'poker' && this.pokerGame) {
            this.pokerGame.update(deltaTime);
        }

        // Update scene manager
        if (this.sceneManager) {
            this.sceneManager.update(deltaTime);
        }
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
        
        console.log("Dealing initial cards...");
        
        // Deal initial cards (2 for player, 2 for dealer with one face down)
        await this.dealCardToPlayer();
        await this.dealCardToDealer(false); // Face up
        await this.dealCardToPlayer();
        await this.dealCardToDealer(true); // Face down
        
        // Check for blackjack
        this.checkForBlackjack();
        
        console.log("Initial cards dealt - Player:", this.playerCards.length, "Dealer:", this.dealerCards.length);
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

    // Combined method to deal card to either player or dealer
    dealCard(isDealer = false) {
        try {
            // Draw card states from the deck
            const [state1, state2] = this.getNextCardStates();
            
            // Create a quantum card
            const card = new QuantumCard(state1, state2, this.assetLoader);
            
            // Determine position based on which hand and number of cards
            let position;
            if (isDealer) {
                position = new THREE.Vector3((this.dealerCards.length - 1) * 0.8, 0, 0);
                this.sceneManager.addCard(card, position, true); // isDealer = true
                this.dealerCards.push(card);
            } else {
                position = new THREE.Vector3((this.playerCards.length - 1) * 0.8, 0, 0);
                this.sceneManager.addCard(card, position, false);
                this.playerCards.push(card);
            }
            
            // Flip card to face up
            card.flipToFront();
            
            return card;
        } catch (error) {
            console.error("Error dealing card:", error);
            return null;
        }
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Methods called from UI
    playerHit() {
        if (this.gameState === GameState.PLAYER_TURN) {
            this.dealCard(false);
            
            // Play card sound
            if (this.soundManager) {
                this.soundManager.playCardPlaceSound();
            }
            
            // Check if player busts
            const playerValue = this.getHandValue(this.playerCards);
            if (playerValue > 21) {
                this.gameState = GameState.RESOLVING;
                setTimeout(() => this.endGame('dealer'), 1000);
            }
            
            // Update UI
            if (this.uiManager) {
                this.uiManager.updateHandValues(playerValue, this.getHandValue(this.dealerCards));
            }
        }
    }
    
    playerStand() {
        if (this.gameState === GameState.PLAYER_TURN) {
            this.gameState = GameState.DEALER_TURN;
            this.dealerPlay();
        }
    }
    
    applySuperposition() {
        if (this.gameState === GameState.PLAYER_TURN && this.selectedCard) {
            // Check if card is already in superposition
            if (this.selectedCard.isInSuperposition) {
                console.log("Card is already in superposition");
                return;
            }
            
            // Put card in superposition
            this.selectedCard.putInSuperposition();
            
            // Play superposition sound
            if (this.soundManager) {
                this.soundManager.playSuperpositionSound();
            }
            
            // Update UI
            if (this.uiManager) {
                const superposedCards = this.playerCards.filter(c => c.isInSuperposition).length;
                const entangledCards = this.playerCards.filter(c => c.isEntangled).length / 2;
                this.uiManager.updateQuantumCounts(superposedCards, entangledCards);
            }
        }
    }
    
    applyEntanglement() {
        if (this.gameState !== GameState.PLAYER_TURN) return;
        
        if (!this.selectedCard) {
            console.log("Select a card first");
            return;
        }
        
        // First card selected for entanglement
        if (!this.cardForEntanglement) {
            // Check if card is in superposition
            if (!this.selectedCard.isInSuperposition) {
                console.log("Card must be in superposition to entangle");
                return;
            }
            
            // Set as first card for entanglement
            this.cardForEntanglement = this.selectedCard;
            this.cardForEntanglement.highlight(true);
            console.log("First card selected for entanglement");
        } 
        // Second card selected, complete entanglement
        else if (this.selectedCard !== this.cardForEntanglement) {
            // Check if second card is in superposition
            if (!this.selectedCard.isInSuperposition) {
                console.log("Second card must also be in superposition");
                this.cardForEntanglement.highlight(false);
                this.cardForEntanglement = null;
                return;
            }
            
            // Entangle the cards
            this.cardForEntanglement.entangleWith(this.selectedCard);
            this.cardForEntanglement.highlight(false);
            
            // Play entanglement sound
            if (this.soundManager) {
                this.soundManager.playEntanglementSound();
            }
            
            // Reset entanglement selection
            this.cardForEntanglement = null;
            
            // Update UI
            if (this.uiManager) {
                const superposedCards = this.playerCards.filter(c => c.isInSuperposition).length;
                const entangledCards = this.playerCards.filter(c => c.isEntangled).length / 2;
                this.uiManager.updateQuantumCounts(superposedCards, entangledCards);
            }
        } 
        // Same card selected again, cancel entanglement
        else {
            this.cardForEntanglement.highlight(false);
            this.cardForEntanglement = null;
            console.log("Entanglement canceled");
        }
    }
    
    measureCard() {
        if (this.gameState === GameState.PLAYER_TURN && this.selectedCard) {
            // Check if card is in superposition
            if (!this.selectedCard.isInSuperposition) {
                console.log("Card is not in superposition");
                return;
            }
            
            // Measure the card
            this.selectedCard.collapse();
            
            // Play collapse sound
            if (this.soundManager) {
                this.soundManager.playCollapseSound();
            }
            
            // Update UI
            if (this.uiManager) {
                const superposedCards = this.playerCards.filter(c => c.isInSuperposition).length;
                const entangledCards = this.playerCards.filter(c => c.isEntangled).length / 2;
                this.uiManager.updateQuantumCounts(superposedCards, entangledCards);
                this.uiManager.updateHandValues(this.getHandValue(this.playerCards), this.getHandValue(this.dealerCards));
            }
        }
    }
    
    startNewGame() {
        if (!this.gameType) return;
        
        this.gameState = GameState.PLAYING;
        this.selectedCard = null;
        this.entanglementTarget = null;
        
        if (this.gameType === 'blackjack') {
            this.blackjackGame.startNewGame();
        } else if (this.gameType === 'poker') {
            this.pokerGame.startNewGame();
        }
    }
    
    // Calculate hand value accounting for Aces
    getHandValue(cards) {
        if (!cards || cards.length === 0) return 0;
        
        let total = 0;
        let aceCount = 0;
        
        // First pass: Count all cards at face value, mark Aces
        for (const card of cards) {
            if (card.isInSuperposition) {
                // For cards in superposition, use average value
                total += card.getAverageValue();
            } else {
                const value = card.getValue();
                if (value === 1) {
                    aceCount++;
                    total += 11; // Temporarily count Ace as 11
                } else {
                    total += value;
                }
            }
        }
        
        // Second pass: Adjust Aces to 1 as needed
        while (total > 21 && aceCount > 0) {
            total -= 10; // Change an Ace from 11 to 1
            aceCount--;
        }
        
        return Math.round(total);
    }
    
    // Handle dealer's turn
    async dealerPlay() {
        this.gameState = GameState.DEALER_TURN;
        
        // Flip the dealer's hidden card
        if (this.dealerCards.length > 0) {
            const hiddenCard = this.dealerCards[0];
            if (!hiddenCard.isFaceUp) {
                hiddenCard.flip();
                
                // Play card flip sound
                if (this.soundManager) {
                    this.soundManager.playCardFlipSound();
                }
                
                // Small pause after flipping
                await this.sleep(500);
            }
        }
        
        // Keep drawing cards until dealer has 17+
        let dealerValue = this.getHandValue(this.dealerCards);
        while (dealerValue < 17) {
            this.dealCard(true); // Deal to dealer
            
            // Play card sound
            if (this.soundManager) {
                this.soundManager.playCardPlaceSound();
            }
            
            dealerValue = this.getHandValue(this.dealerCards);
            
            // Update UI
            if (this.uiManager) {
                this.uiManager.updateHandValues(this.getHandValue(this.playerCards), dealerValue);
            }
            
            // Small pause between cards
            await this.sleep(500);
        }
        
        // After dealer finishes, determine winner
        this.gameState = GameState.RESOLVING;
        
        // Get final values
        const playerValue = this.getHandValue(this.playerCards);
        
        // Check for dealer bust
        if (dealerValue > 21) {
            this.endGame('player');
        } 
        // Compare hands
        else if (playerValue > dealerValue) {
            this.endGame('player');
        } 
        else if (dealerValue > playerValue) {
            this.endGame('dealer');
        } 
        else {
            this.endGame('tie');
        }
    }
    
    // Determine winner and update UI
    endGame(winner) {
        this.gameState = GameState.GAME_OVER;
        
        if (this.uiManager) {
            if (winner === 'player') {
                this.uiManager.showWin();
            } else if (winner === 'dealer') {
                this.uiManager.showLose();
            } else {
                this.uiManager.showTie();
            }
        }
    }

    initializeGame() {
        if (this.gameType === 'blackjack') {
            this.gameState = 'initial';
            this.playerCards = [];
            this.dealerCards = [];
            this.deck = [];
            this.initializeDeck();
        } else {
            this.pokerGame = new TexasHoldEm(this);
            this.gameState = 'poker_initial';
        }
    }

    // New Poker methods
    pokerPlaceBet(amount) {
        if (this.gameType === 'poker' && this.gameState === 'poker_betting') {
            return this.pokerGame.placeBet(amount);
        }
        return false;
    }

    pokerCall() {
        if (this.gameType === 'poker' && this.gameState === 'poker_betting') {
            return this.pokerGame.call();
        }
        return false;
    }

    pokerRaise(amount) {
        if (this.gameType === 'poker' && this.gameState === 'poker_betting') {
            return this.pokerGame.raise(amount);
        }
        return false;
    }

    pokerFold() {
        if (this.gameType === 'poker' && this.gameState === 'poker_betting') {
            return this.pokerGame.fold();
        }
        return false;
    }

    pokerDealFlop() {
        if (this.gameType === 'poker' && this.gameState === 'poker_betting') {
            this.pokerGame.dealFlop();
            this.gameState = 'poker_flop';
            return true;
        }
        return false;
    }

    pokerDealTurn() {
        if (this.gameType === 'poker' && this.gameState === 'poker_flop') {
            this.pokerGame.dealTurn();
            this.gameState = 'poker_turn';
            return true;
        }
        return false;
    }

    pokerDealRiver() {
        if (this.gameType === 'poker' && this.gameState === 'poker_turn') {
            this.pokerGame.dealRiver();
            this.gameState = 'poker_river';
            return true;
        }
        return false;
    }

    pokerShowdown() {
        if (this.gameType === 'poker' && this.gameState === 'poker_river') {
            const winner = this.pokerGame.determineWinner();
            this.gameState = 'poker_showdown';
            return winner;
        }
        return null;
    }

    handleCardSelection(card) {
        if (!card || this.gameState !== GameState.PLAYING) return;
        
        this.selectedCard = card;
        this.uiManager.updateStatus(`Selected card: ${card.state1.value} of ${card.state1.suit}`);
    }
} 