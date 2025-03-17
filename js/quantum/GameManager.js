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
    PLAYING: 'playing',
    INITIALIZING: 'initializing'
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
        this.initialized = false;
        
        // Initialize game instances
        this.blackjackGame = new BlackjackGame(this);
        this.pokerGame = new TexasHoldEm(this);
    }

    initialize(sceneManager, assetLoader, uiManager) {
        try {
            console.log("Initializing GameManager");
            
            // Store references to managers
            this.sceneManager = sceneManager;
            this.assetLoader = assetLoader;
            this.uiManager = uiManager;
            
            // Initialize in idle state
            this.gameState = GameState.INITIALIZING;
            
            // Set initial quantum chip counts
            this.hadamardChips = 3;
            this.schrodingerChips = 2;
            this.entanglementChips = 2;
            
            // Set up mouse events for card selection
            this.setupMouseEvents();
            
            // Mark as initialized
            this.initialized = true;
            
            console.log("GameManager initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing GameManager:", error);
            return false;
        }
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
        console.log(`Setting game type to ${type}`);
        
        // Validate type
        if (type !== 'blackjack' && type !== 'poker') {
            console.error(`Invalid game type: ${type}`);
            return false;
        }
        
        try {
            // Check if sceneManager is initialized
            if (!this.sceneManager || !this.sceneManager.initialized) {
                console.error("Cannot set game type - SceneManager not initialized");
                return false;
            }
            
            // Set game type
            this.gameType = type;
            
            // Initialize game based on type (lazy loading)
            if (type === 'blackjack') {
                console.log("Loading Blackjack game...");
                
                // Only create a new instance if one doesn't exist
                if (!this.blackjackGame) {
                    // Dynamic import for the BlackjackGame class
                    import('./BlackjackGame.js').then(module => {
                        const BlackjackGame = module.BlackjackGame;
                        this.blackjackGame = new BlackjackGame(this);
                        
                        // Initialize the game
                        this.blackjackGame.initialize();
                        
                        // Set game state
                        this.gameState = GameState.BETTING;
                        
                        console.log("Blackjack game loaded and initialized");
                        
                        // Show tutorial if not shown before
                        if (!this.tutorialShown) {
                            this.showTutorial('blackjack');
                        } else {
                            // Start new game
                            this.startNewGame();
                        }
                    }).catch(error => {
                        console.error("Error loading BlackjackGame:", error);
                        return false;
                    });
                } else {
                    // Just initialize the existing instance
                    this.blackjackGame.initialize();
                    
                    // Set game state
                    this.gameState = GameState.BETTING;
                    
                    console.log("Using existing Blackjack game instance");
                    
                    // Show tutorial or start game
                    if (!this.tutorialShown) {
                        this.showTutorial('blackjack');
                    } else {
                        // Start new game
                        this.startNewGame();
                    }
                }
            } else if (type === 'poker') {
                console.log("Loading Texas Hold'Em game...");
                
                // Only create a new instance if one doesn't exist
                if (!this.pokerGame) {
                    // Dynamic import for the TexasHoldEm class
                    import('./TexasHoldEm.js').then(module => {
                        const TexasHoldEm = module.TexasHoldEm;
                        this.pokerGame = new TexasHoldEm(this);
                        
                        // Initialize the game
                        this.pokerGame.initialize();
                        
                        // Set game state
                        this.gameState = GameState.BETTING;
                        
                        console.log("Texas Hold'Em game loaded and initialized");
                        
                        // Show tutorial if not shown before
                        if (!this.tutorialShown) {
                            this.showTutorial('poker');
                        } else {
                            // Start new game
                            this.startNewGame();
                        }
                    }).catch(error => {
                        console.error("Error loading TexasHoldEm:", error);
                        return false;
                    });
                } else {
                    // Just initialize the existing instance
                    this.pokerGame.initialize();
                    
                    // Set game state
                    this.gameState = GameState.BETTING;
                    
                    console.log("Using existing Texas Hold'Em game instance");
                    
                    // Show tutorial or start game
                    if (!this.tutorialShown) {
                        this.showTutorial('poker');
                    } else {
                        // Start new game
                        this.startNewGame();
                    }
                }
            }
            
            // Update UI to reflect the current game type
            if (this.uiManager) {
                this.uiManager.updateUIForGameType(this.gameType);
            }
            
            return true;
        } catch (error) {
            console.error("Error setting game type:", error);
            return false;
        }
    }

    showTutorial(gameType) {
        const tutorialDisplay = document.getElementById('tutorial-display');
        if (!tutorialDisplay) return;
        
        // Clear previous tutorial messages
        tutorialDisplay.innerHTML = '';
        
        // Define tutorial messages based on game type
        let messages = [];
        
        if (gameType === 'blackjack') {
            messages = [
                "Welcome to Quantum Blackjack!",
                "Your goal is to get a hand value closer to 21 than the dealer without going over.",
                "The Hadamard button puts a card in superposition between two states.",
                "The Schrödinger button measures a superposed card, collapsing it to one state.",
                "The Entanglement button links two superposed cards, forcing them to collapse to the same suit color.",
                "Use quantum mechanics wisely to beat the dealer!"
            ];
        } else if (gameType === 'poker') {
            messages = [
                "Welcome to Quantum Texas Hold'Em!",
                "You'll be dealt two cards, followed by five community cards.",
                "Use quantum mechanics to create the best five-card hand.",
                "The Hadamard button puts a card in superposition between two states.",
                "The Schrödinger button measures a superposed card, collapsing it to one state.",
                "The Entanglement button links two superposed cards, forcing them to collapse to the same suit color.",
                "Use your quantum powers wisely to win the pot!"
            ];
        }
        
        // Display messages with fade-in effect
        tutorialDisplay.style.display = 'block';
        
        const displayMessages = async () => {
            for (let i = 0; i < messages.length; i++) {
                const messageElem = document.createElement('div');
                messageElem.className = 'tutorial-message';
                messageElem.textContent = messages[i];
                tutorialDisplay.appendChild(messageElem);
                
                // Fade in the message
                await new Promise(resolve => {
                    setTimeout(() => {
                        messageElem.style.opacity = '1';
                        resolve();
                    }, 500);
                });
                
                // Wait before showing next message
                if (i < messages.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            
            // Hide tutorial after all messages are shown
            await new Promise(resolve => setTimeout(resolve, 4000));
            tutorialDisplay.style.opacity = '0';
            
            // Remove tutorial after fade out
            setTimeout(() => {
                tutorialDisplay.style.display = 'none';
                tutorialDisplay.style.opacity = '1';
                tutorialDisplay.innerHTML = '';
            }, 1000);
        };
        
        displayMessages();
    }

    startNewGame() {
        console.log("Starting new game of type:", this.gameType);
        
        if (!this.initialized) {
            console.error("Cannot start game - GameManager not initialized");
            return false;
        }
        
        try {
            // Reset selection state
            this.selectedCard = null;
            this.entanglementMode = false;
            this.entanglementCard1 = null;
            
            if (this.gameType === 'blackjack') {
                if (!this.blackjackGame) {
                    console.error("Blackjack game not initialized");
                    return false;
                }
                
                // Start new blackjack game
                this.blackjackGame.startNewGame();
                
                // Update game state
                this.gameState = GameState.PLAYING;
                
                // Update UI
                if (this.uiManager) {
                    this.uiManager.updateStatus("Blackjack game started. Your turn!");
                }
                
                return true;
            } else if (this.gameType === 'poker') {
                if (!this.pokerGame) {
                    console.error("Poker game not initialized");
                    return false;
                }
                
                // Start new poker game
                this.pokerGame.startNewGame();
                
                // Update game state
                this.gameState = GameState.PLAYING;
                
                // Update UI
                if (this.uiManager) {
                    this.uiManager.updateStatus("Texas Hold'Em game started. Place your bets!");
                }
                
                return true;
            } else {
                console.error("Cannot start game - Invalid game type:", this.gameType);
                return false;
            }
        } catch (error) {
            console.error("Error starting new game:", error);
            return false;
        }
    }

    // Blackjack controls
    async playerHit() {
        console.log("Player hit");
        if (this.gameType === 'blackjack' && this.blackjackGame) {
            await this.blackjackGame.playerHit();
        }
    }

    async playerStand() {
        console.log("Player stand");
        if (this.gameType === 'blackjack' && this.blackjackGame) {
            await this.blackjackGame.playerStand();
        }
    }

    async playerDouble() {
        console.log("Player double");
        if (this.gameType === 'blackjack' && this.blackjackGame) {
            // Implementation for doubling down would go here
            this.uiManager.updateStatus("Double down not implemented yet");
        }
    }

    async playerSplit() {
        console.log("Player split");
        if (this.gameType === 'blackjack' && this.blackjackGame) {
            // Implementation for splitting pairs would go here
            this.uiManager.updateStatus("Split not implemented yet");
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
        if (!this.uiManager) {
            console.error("Cannot update UI - UIManager not available");
            return;
        }
        
        try {
            // Update UI based on game type
            if (this.gameType === 'blackjack' && this.blackjackGame) {
                // Update Blackjack UI
                this.uiManager.updatePlayerValue(this.blackjackGame.playerValue);
                this.uiManager.updateDealerValue(this.blackjackGame.dealerValue);
            } else if (this.gameType === 'poker' && this.pokerGame) {
                // Update Poker UI
                this.uiManager.updatePlayerChips(this.pokerGame.playerChips);
                this.uiManager.updatePotAmount(this.pokerGame.pot);
            }
            
            // Update quantum counts
            const superposed = this.countSuperposedCards();
            const entangled = this.countEntangledCards();
            this.uiManager.updateQuantumCounts(superposed, entangled);
        } catch (error) {
            console.error("Error updating UI:", error);
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
        if (!this.sceneManager) {
            console.error("Cannot setup mouse events - SceneManager not available");
            return;
        }
        
        // Set up mouse event to handle card clicking
        this.sceneManager.setupMouseEvents((card) => {
            if (card) {
                this.handleCardClick(card);
            }
        });
        
        console.log("Mouse events set up for card interaction");
    }

    handleCardClick(card) {
        console.log("Card clicked:", card);
        
        // Only allow selection during player's turn
        if (this.gameState !== GameState.PLAYING) {
            console.log(`Cannot select cards in current state: ${this.gameState}`);
            return;
        }
        
        // Handle different selection modes
        if (this.entanglementMode) {
            // In entanglement mode, we're selecting the second card
            if (this.entanglementCard1 === card) {
                // Can't entangle a card with itself
                if (this.uiManager) {
                    this.uiManager.updateStatus("Cannot entangle a card with itself");
                }
                return;
            }
            
            // Select this card as the second entanglement card
            this.selectCard(card);
            
            // Complete the entanglement
            this.applyEntanglement();
        } else {
            // Normal card selection
            this.selectCard(card);
            
            // Show available actions for this card
            if (this.uiManager) {
                let message = `Selected: ${card.toString()}`;
                
                if (card.isInSuperposition) {
                    message += " (in superposition)";
                }
                
                if (card.isEntangled) {
                    message += " (entangled)";
                }
                
                this.uiManager.updateStatus(message);
            }
        }
    }

    selectCard(card) {
        // Deselect previous card if there was one
        if (this.selectedCard && this.selectedCard !== card) {
            this.deselectCard();
        }
        
        // Select the new card
        this.selectedCard = card;
        card.isSelected = true;
        
        // Highlight the card in the scene
        if (card.mesh && card.mesh.material) {
            // Apply selection effect to card
            if (Array.isArray(card.mesh.material)) {
                for (const mat of card.mesh.material) {
                    // Don't override existing effects like superposition or entanglement
                    if (!card.isInSuperposition && !card.isEntangled) {
                        mat.emissive = new THREE.Color(1, 1, 0); // Yellow highlight
                        mat.emissiveIntensity = 0.3;
                    }
                }
            }
        }
        
        console.log("Selected card:", card.toString());
    }

    deselectCard() {
        if (!this.selectedCard) return;
        
        // Remove selection state
        this.selectedCard.isSelected = false;
        
        // Remove highlight effect
        if (this.selectedCard.mesh && this.selectedCard.mesh.material) {
            if (Array.isArray(this.selectedCard.mesh.material)) {
                for (const mat of this.selectedCard.mesh.material) {
                    // Don't override existing effects
                    if (!this.selectedCard.isInSuperposition && !this.selectedCard.isEntangled) {
                        mat.emissive = new THREE.Color(0, 0, 0);
                        mat.emissiveIntensity = 0;
                    } else if (this.selectedCard.isInSuperposition) {
                        mat.emissive = new THREE.Color(0, 1, 1); // Cyan for superposition
                        mat.emissiveIntensity = 0.3;
                    } else if (this.selectedCard.isEntangled) {
                        mat.emissive = new THREE.Color(1, 0, 1); // Magenta for entanglement
                        mat.emissiveIntensity = 0.3;
                    }
                }
            }
        }
        
        console.log("Deselected card");
        this.selectedCard = null;
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