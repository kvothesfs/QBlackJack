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
        
        // Update UI
        this.updateUI();
        
        // Set game state
        this.gameState = 'player-turn';
        
        // Enable player controls
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Your turn. Hit or Stand?");
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
        await this.dealCardToDealer(false);
        
        // Calculate initial hand values
        this.updateHandValues();
    }

    async dealCardToPlayer() {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
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
        if (this.gameManager.sceneManager) {
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, true);
            
            // Flip card face up
            if (cardMesh) {
                setTimeout(() => {
                    card.flip(true);
                }, 300);
            }
        }
        
        // Update hand value
        this.updateHandValues();
        
        return card;
    }

    async dealCardToDealer(faceUp = true) {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
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
        if (this.gameManager.sceneManager) {
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, null, false);
            
            // Flip card face up or down based on parameter
            if (cardMesh) {
                setTimeout(() => {
                    card.flip(faceUp);
                }, 300);
            }
        }
        
        // Update hand value
        this.updateHandValues();
        
        return card;
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
        
        // First sum up all cards
        for (const card of hand) {
            // For cards in superposition, use the average value
            if (card.isInSuperposition) {
                const possibleValues = card.getPossibleGameValues();
                const avgValue = possibleValues.reduce((a, b) => a + b, 0) / possibleValues.length;
                value += Math.round(avgValue);
                
                // Check if any possible state is an Ace
                if (possibleValues.includes(11)) {
                    aceCount++;
                }
            } else {
                // Regular card
                const cardValue = card.getGameValue();
                value += cardValue;
                
                // Count Aces
                if (cardValue === 11) {
                    aceCount++;
                }
            }
        }
        
        // Adjust for Aces if needed
        while (value > 21 && aceCount > 0) {
            value -= 10; // Convert an Ace from 11 to 1
            aceCount--;
        }
        
        return value;
    }

    updateDealerTurn() {
        // Reveal dealer's face-down card first
        const faceDownCard = this.dealerHand.find(card => !card.isFaceUp);
        if (faceDownCard) {
            faceDownCard.flip(true);
            this.updateHandValues();
            return; // Wait one update cycle after revealing card
        }
        
        // Dealer draws until they have 17 or more
        if (this.dealerValue < 17) {
            this.dealCardToDealer();
        } else {
            // Dealer is done drawing
            this.endGame();
        }
    }

    endGame() {
        // Determine winner
        if (this.playerValue > 21) {
            // Player busts
            this.gameState = 'game-over';
            this.gameManager.uiManager.showLose("Bust! You lose.");
        } else if (this.dealerValue > 21) {
            // Dealer busts
            this.gameState = 'game-over';
            this.gameManager.uiManager.showWin("Dealer busts! You win.");
        } else if (this.playerValue > this.dealerValue) {
            // Player wins
            this.gameState = 'game-over';
            this.gameManager.uiManager.showWin("You win!");
        } else if (this.playerValue < this.dealerValue) {
            // Dealer wins
            this.gameState = 'game-over';
            this.gameManager.uiManager.showLose("Dealer wins.");
        } else {
            // Push (tie)
            this.gameState = 'game-over';
            this.gameManager.uiManager.showTie("Push! It's a tie.");
        }
    }

    playerHit() {
        if (this.gameState !== 'player-turn') return;
        
        // Deal a card to the player
        this.dealCardToPlayer();
        
        // Check if player busts
        if (this.playerValue > 21) {
            this.gameState = 'game-over';
            this.gameManager.uiManager.showLose("Bust! You lose.");
        }
    }

    playerStand() {
        if (this.gameState !== 'player-turn') return;
        
        // Switch to dealer's turn
        this.gameState = 'dealer-turn';
        this.gameManager.uiManager.updateStatus("Dealer's turn");
    }
} 