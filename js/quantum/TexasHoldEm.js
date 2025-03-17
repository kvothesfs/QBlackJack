import * as THREE from 'three';
import { QuantumCard } from './QuantumCard.js';

export class TexasHoldEm {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];     // Dealer/opponent hand
        this.communityCards = []; // Flop, turn, river cards
        this.pot = 0;
        this.playerChips = 1000;
        this.dealerChips = 1000;
        this.playerBet = 0;
        this.dealerBet = 0;
        this.gameState = 'betting'; // betting, pre-flop, flop, turn, river, showdown
        this.playerCardCount = 0;
        this.dealerCardCount = 0;
        this.communityCardCount = 0;
    }

    initialize() {
        console.log("Initializing Texas Hold'Em game");
        this.reset();
        this.setupTable();
    }

    reset() {
        console.log("Resetting Texas Hold'Em game");
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.communityCards = [];
        this.pot = 0;
        this.playerBet = 0;
        this.dealerBet = 0;
        this.gameState = 'betting';
        this.playerCardCount = 0;
        this.dealerCardCount = 0;
        this.communityCardCount = 0;

        // Create a new deck
        this.createDeck();
        this.shuffleDeck();
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updateStatus("Place your bet to start a new hand");
        }
    }

    update(deltaTime) {
        // Update card states and animations
        this.updateCards(deltaTime);
        
        // Update AI decisions if it's dealer's turn
        if (this.gameState === 'dealer-action') {
            this.updateDealerAction();
        }
    }

    updateCards(deltaTime) {
        // Update player hand cards
        for (const card of this.playerHand) {
            if (card.mesh) {
                // Animation effects handled by SceneManager
            }
        }
        
        // Update dealer hand cards
        for (const card of this.dealerHand) {
            if (card.mesh) {
                // Animation effects handled by SceneManager
            }
        }
        
        // Update community cards
        for (const card of this.communityCards) {
            if (card.mesh) {
                // Animation effects handled by SceneManager
            }
        }
    }

    setupTable() {
        console.log("Setting up Texas Hold'Em table");
        const sceneManager = this.gameManager.sceneManager;
        
        if (!sceneManager) {
            console.error("Cannot setup table - SceneManager not available");
            return;
        }
        
        // Table is already set up in SceneManager
        // Card positions will be set during dealing
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
        console.log("Starting new Texas Hold'Em game");
        
        // Reset game state
        this.reset();
        
        // Clear previous cards from scene
        if (this.gameManager && this.gameManager.sceneManager) {
            this.gameManager.sceneManager.clearScene();
        }
        
        // Setup table
        this.setupTable();
        
        // Deal initial cards
        await this.dealInitialCards();
        
        // Set game state
        this.gameState = 'pre-flop';
        
        // Enable player controls
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Pre-flop. Place your bet or fold.");
        }
    }

    async dealInitialCards() {
        console.log("Dealing initial cards for Texas Hold Em");
        
        // Shuffle the deck first
        this.shuffleDeck();
        
        // Deal two cards to the player
        for (let i = 0; i < 2; i++) {
            const card = this.deck.pop();
            this.playerHand.push(card);
            
            // Position player cards at the bottom of the screen
            const x = -1 + (i * 1.5); // Space cards horizontally
            const position = new THREE.Vector3(x, 0.1, 2);
            
            if (this.gameManager && this.gameManager.sceneManager) {
                console.log(`Adding player card ${i+1} at position (${position.x}, ${position.y}, ${position.z})`);
                const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, true);
                
                if (cardMesh) {
                    // Flip card face up
                    setTimeout(() => {
                        card.flip(true);
                    }, 300 * (i + 1)); // Stagger the flips
                    
                    // Create quantum state for the card (superposition)
                    if (Math.random() < 0.3) { // 30% chance for superposition
                        setTimeout(() => {
                            card.applySuperposition();
                        }, 1000 + 500 * i);
                    }
                } else {
                    console.error("Failed to add player card to scene");
                }
            }
        }
        
        // Deal two cards to the dealer (AI opponent)
        for (let i = 0; i < 2; i++) {
            const card = this.deck.pop();
            this.dealerHand.push(card);
            
            // Position dealer cards at the top of the screen
            const x = -1 + (i * 1.5); // Space cards horizontally
            const position = new THREE.Vector3(x, 0.1, -2);
            
            if (this.gameManager && this.gameManager.sceneManager) {
                console.log(`Adding dealer card ${i+1} at position (${position.x}, ${position.y}, ${position.z})`);
                const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, false);
                
                if (cardMesh) {
                    // Initially face down
                    card.flip(false);
                } else {
                    console.error("Failed to add dealer card to scene");
                }
            }
        }
        
        // Update UI
        if (this.gameManager && this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Your turn. Place your bet.");
        }
    }

    async dealFlop() {
        console.log("Dealing the flop");
        
        // Deal three community cards
        for (let i = 0; i < 3; i++) {
            const card = this.deck.pop();
            this.communityCards.push(card);
            
            // Position in the center of the table
            const flopStartX = -2;
            const position = new THREE.Vector3(flopStartX + (i * 1.5), 0.1, 0);
            
            if (this.gameManager && this.gameManager.sceneManager) {
                console.log(`Adding flop card ${i+1} at position (${position.x}, ${position.y}, ${position.z})`);
                const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, false);
                
                if (cardMesh) {
                    // Flip card face up with a delay
                    setTimeout(() => {
                        card.flip(true);
                    }, 300 * (i + 1));
                    
                    // Create quantum state for some cards
                    if (Math.random() < 0.3) { // 30% chance
                        setTimeout(() => {
                            card.applySuperposition();
                        }, 1000 + 500 * i);
                    }
                } else {
                    console.error("Failed to add flop card to scene");
                }
            }
        }
        
        // Update game state
        this.gameState = 'flop';
        
        // Update UI
        if (this.gameManager && this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Flop dealt. Your turn.");
        }
    }
    
    async dealTurn() {
        console.log("Dealing the turn");
        
        // Deal the turn card (4th community card)
        const card = this.deck.pop();
        this.communityCards.push(card);
        
        // Position next to the flop
        const position = new THREE.Vector3(2.5, 0.1, 0);
        
        if (this.gameManager && this.gameManager.sceneManager) {
            console.log(`Adding turn card at position (${position.x}, ${position.y}, ${position.z})`);
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, false);
            
            if (cardMesh) {
                // Flip card face up
                setTimeout(() => {
                    card.flip(true);
                }, 300);
                
                // Create quantum state
                if (Math.random() < 0.3) { // 30% chance
                    setTimeout(() => {
                        card.applySuperposition();
                    }, 1000);
                }
            } else {
                console.error("Failed to add turn card to scene");
            }
        }
        
        // Update game state
        this.gameState = 'turn';
        
        // Update UI
        if (this.gameManager && this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Turn dealt. Your turn.");
        }
    }
    
    async dealRiver() {
        console.log("Dealing the river");
        
        // Deal the river card (5th community card)
        const card = this.deck.pop();
        this.communityCards.push(card);
        
        // Position next to the turn card
        const position = new THREE.Vector3(4, 0.1, 0);
        
        if (this.gameManager && this.gameManager.sceneManager) {
            console.log(`Adding river card at position (${position.x}, ${position.y}, ${position.z})`);
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, false);
            
            if (cardMesh) {
                // Flip card face up
                setTimeout(() => {
                    card.flip(true);
                }, 300);
                
                // Create quantum state
                if (Math.random() < 0.3) { // 30% chance
                    setTimeout(() => {
                        card.applySuperposition();
                    }, 1000);
                }
            } else {
                console.error("Failed to add river card to scene");
            }
        }
        
        // Update game state
        this.gameState = 'river';
        
        // Update UI
        if (this.gameManager && this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("River dealt. Final betting round.");
        }
    }

    pokerBet(amount) {
        if (['pre-flop', 'flop', 'turn', 'river'].indexOf(this.gameState) === -1) {
            console.error("Cannot bet - wrong game state:", this.gameState);
            return false;
        }
        
        if (amount <= 0 || amount > this.playerChips) {
            console.error("Invalid bet amount:", amount);
            return false;
        }
        
        // Place bet
        this.playerBet += amount;
        this.playerChips -= amount;
        this.pot += amount;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updateStatus(`You bet ${amount}. Dealer's action.`);
        }
        
        // Switch to dealer action
        this.gameState = 'dealer-action';
        
        return true;
    }

    pokerCall() {
        if (['pre-flop', 'flop', 'turn', 'river'].indexOf(this.gameState) === -1) {
            console.error("Cannot call - wrong game state:", this.gameState);
            return false;
        }
        
        const amountToCall = this.dealerBet - this.playerBet;
        
        if (amountToCall <= 0) {
            console.error("Nothing to call");
            return false;
        }
        
        if (amountToCall > this.playerChips) {
            console.error("Not enough chips to call");
            return false;
        }
        
        // Call bet
        this.playerChips -= amountToCall;
        this.playerBet += amountToCall;
        this.pot += amountToCall;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updateStatus(`You called ${amountToCall}. Dealer's action.`);
        }
        
        // Switch to dealer action
        this.gameState = 'dealer-action';
        
        return true;
    }

    pokerRaise(amount) {
        if (['pre-flop', 'flop', 'turn', 'river'].indexOf(this.gameState) === -1) {
            console.error("Cannot raise - wrong game state:", this.gameState);
            return false;
        }
        
        const amountToCall = this.dealerBet - this.playerBet;
        const totalAmount = amountToCall + amount;
        
        if (amount <= 0) {
            console.error("Raise amount must be positive");
            return false;
        }
        
        if (totalAmount > this.playerChips) {
            console.error("Not enough chips to raise");
            return false;
        }
        
        // Raise bet
        this.playerChips -= totalAmount;
        this.playerBet += totalAmount;
        this.pot += totalAmount;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updateStatus(`You raised by ${amount}. Dealer's action.`);
        }
        
        // Switch to dealer action
        this.gameState = 'dealer-action';
        
        return true;
    }

    pokerFold() {
        // Player folds, dealer wins the pot
        this.dealerChips += this.pot;
        this.pot = 0;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.showLose("You folded. Dealer wins the pot.");
        }
        
        // End the game
        this.gameState = 'game-over';
        
        return true;
    }

    updateDealerAction() {
        // Simple AI for dealer actions
        
        // Reveal dealer's face-down cards if at showdown
        if (this.gameState === 'showdown') {
            this.dealerHand.forEach(card => {
                if (!card.isFaceUp) {
                    card.flip(true);
                }
            });
            
            // Determine winner
            this.determineWinner();
            return;
        }
        
        // Make a decision
        const decision = this.getDealerDecision();
        
        if (decision === 'fold') {
            // Dealer folds, player wins the pot
            this.playerChips += this.pot;
            this.pot = 0;
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updatePlayerChips(this.playerChips);
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.showWin("Dealer folds. You win the pot!");
            }
            
            // End the game
            this.gameState = 'game-over';
        } else if (decision === 'call') {
            // Dealer calls
            const amountToCall = this.playerBet - this.dealerBet;
            this.dealerChips -= amountToCall;
            this.dealerBet += amountToCall;
            this.pot += amountToCall;
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.updateStatus("Dealer calls.");
            }
            
            // Move to next betting round or showdown
            this.nextRound();
        } else if (decision === 'raise') {
            // Dealer raises
            const raiseAmount = 20; // Fixed raise amount for simplicity
            const amountToCall = this.playerBet - this.dealerBet;
            const totalAmount = amountToCall + raiseAmount;
            
            this.dealerChips -= totalAmount;
            this.dealerBet += totalAmount;
            this.pot += totalAmount;
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.updateStatus(`Dealer raises by ${raiseAmount}.`);
            }
            
            // Switch back to player action
            this.gameState = this.getGameStateFromRound();
        }
    }

    getDealerDecision() {
        // Very basic AI decision making
        // In a real game, this would be based on hand strength, pot odds, etc.
        const rand = Math.random();
        
        if (rand < 0.1) {
            return 'fold';
        } else if (rand < 0.6) {
            return 'call';
        } else {
            return 'raise';
        }
    }

    getGameStateFromRound() {
        // Return the current game state based on community cards
        if (this.communityCards.length === 0) {
            return 'pre-flop';
        } else if (this.communityCards.length === 3) {
            return 'flop';
        } else if (this.communityCards.length === 4) {
            return 'turn';
        } else if (this.communityCards.length === 5) {
            return 'river';
        }
        
        return 'pre-flop'; // Default
    }

    nextRound() {
        // Move to the next betting round based on current state
        if (this.gameState === 'dealer-action') {
            if (this.communityCards.length === 0) {
                // Deal the flop
                this.dealFlop();
            } else if (this.communityCards.length === 3) {
                // Deal the turn
                this.dealTurn();
            } else if (this.communityCards.length === 4) {
                // Deal the river
                this.dealRiver();
            } else if (this.communityCards.length === 5) {
                // Showdown
                this.gameState = 'showdown';
                this.updateDealerAction(); // Trigger showdown logic
            }
        }
    }

    determineWinner() {
        // In a real game, this would evaluate poker hands
        // For simplicity, we'll use a random outcome
        const rand = Math.random();
        
        if (rand < 0.45) {
            // Player wins
            this.playerChips += this.pot;
            this.pot = 0;
            
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updatePlayerChips(this.playerChips);
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.showWin("You win the pot!");
            }
        } else if (rand < 0.9) {
            // Dealer wins
            this.dealerChips += this.pot;
            this.pot = 0;
            
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.showLose("Dealer wins the pot.");
            }
        } else {
            // Split pot
            const halfPot = Math.floor(this.pot / 2);
            this.playerChips += halfPot;
            this.dealerChips += this.pot - halfPot;
            this.pot = 0;
            
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updatePlayerChips(this.playerChips);
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.showTie("It's a tie! Pot is split.");
            }
        }
        
        this.gameState = 'game-over';
    }
} 