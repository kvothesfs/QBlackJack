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
        this.startNewGame();
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
    }

    update(deltaTime) {
        // Update card animations and effects
        this.updateCards(deltaTime);
        
        // Update dealer AI if it's the dealer's turn
        if (this.gameState === 'dealerTurn') {
            this.updateDealerTurn();
        }
    }

    updateCards(deltaTime) {
        // Update player cards
        for (const card of this.playerHand) {
            if (card.isInSuperposition) {
                // Update superposition effects
                card.phase += deltaTime * 2.0; // Rotate phase for quantum interference
                
                // Update mesh if available
                if (card.mesh && this.gameManager.sceneManager) {
                    this.gameManager.sceneManager.applyQuantumEffects(card.mesh, card);
                }
            }
            
            if (card.isEntangled && card.entangledWith) {
                // Update entanglement effects
                if (card.mesh && this.gameManager.sceneManager) {
                    this.gameManager.sceneManager.applyEntanglementEffects(card.mesh, card);
                }
            }
        }
        
        // Update dealer cards
        for (const card of this.dealerHand) {
            if (card.isInSuperposition) {
                // Update superposition effects
                card.phase += deltaTime * 2.0;
                
                // Update mesh if available
                if (card.mesh && this.gameManager.sceneManager) {
                    this.gameManager.sceneManager.applyQuantumEffects(card.mesh, card);
                }
            }
        }
    }

    setupTable() {
        console.log("Setting up blackjack table");
        if (this.gameManager.sceneManager) {
            this.gameManager.sceneManager.clearScene();
            this.gameManager.sceneManager.addTable();
        }
    }

    createDeck() {
        console.log("Creating deck for blackjack");
        this.deck = [];
        
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // 1=Ace, 11=Jack, 12=Queen, 13=King
        
        for (const suit of suits) {
            for (const value of values) {
                this.deck.push(new QuantumCard(value, suit));
            }
        }
    }

    shuffleDeck() {
        console.log("Shuffling deck");
        
        // Fisher-Yates shuffle algorithm
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    async startNewGame() {
        console.log("Starting new blackjack game");
        
        // Reset game state
        this.reset();
        
        // Deal initial cards
        await this.dealInitialCards();
        
        // Check for blackjack
        if (this.checkForBlackjack()) {
            await this.handleBlackjack();
        } else {
            // Set game state to player's turn
            this.gameState = 'playerTurn';
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus("Your turn. Hit or Stand?");
            }
            
            // Enable player controls
            const hitBtn = document.getElementById('hit-btn');
            const standBtn = document.getElementById('stand-btn');
            
            if (hitBtn) hitBtn.disabled = false;
            if (standBtn) standBtn.disabled = false;
        }
        
        // Update hand values display
        this.updateHandValues();
        
        return true;
    }

    async dealInitialCards() {
        console.log("Dealing initial cards for blackjack");
        
        // Deal first card to player (face up)
        await this.dealCardToPlayer(true);
        
        // Deal first card to dealer (face up)
        await this.dealCardToDealer(true);
        
        // Deal second card to player (face up)
        await this.dealCardToPlayer(true);
        
        // Deal second card to dealer (face down)
        await this.dealCardToDealer(false);
        
        // Update hand values
        this.updateHandValues();
    }

    async dealCardToPlayer(faceUp = true) {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
        // Take the top card from the deck
        const card = this.deck.pop();
        card.isFaceUp = faceUp;
        
        // Add to player's hand
        this.playerHand.push(card);
        
        // Calculate position for the card
        const posX = -10 + this.playerCardCount * 2.5;
        const posY = -2;
        const posZ = 0;
        
        // Create position and rotation vectors
        const position = new THREE.Vector3(posX, posY, posZ);
        const rotation = new THREE.Euler(0, 0, 0);
        
        // Create card mesh and add to scene
        if (this.gameManager.sceneManager) {
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, rotation, true);
            card.mesh = cardMesh;
            
            // Add click handler for the card
            this.gameManager.sceneManager.addClickListener(cardMesh, () => {
                this.gameManager.handleCardSelection(card);
            });
            
            // Animate card dealing
            if (this.gameManager.soundManager) {
                this.gameManager.soundManager.playCardPlaceSound();
            }
        }
        
        // Increment player card count
        this.playerCardCount++;
        
        return card;
    }

    async dealCardToDealer(faceUp = true) {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
        // Take the top card from the deck
        const card = this.deck.pop();
        card.isFaceUp = faceUp;
        
        // Store reference to hidden card
        if (!faceUp) {
            this.dealerHiddenCard = card;
        }
        
        // Add to dealer's hand
        this.dealerHand.push(card);
        
        // Calculate position for the card
        const posX = -10 + this.dealerCardCount * 2.5;
        const posY = 2;
        const posZ = 0;
        
        // Create position and rotation vectors
        const position = new THREE.Vector3(posX, posY, posZ);
        const rotation = new THREE.Euler(0, 0, 0);
        
        // Create card mesh and add to scene
        if (this.gameManager.sceneManager) {
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, rotation, false);
            card.mesh = cardMesh;
            
            // Animate card dealing
            if (this.gameManager.soundManager) {
                this.gameManager.soundManager.playCardPlaceSound();
            }
        }
        
        // Increment dealer card count
        this.dealerCardCount++;
        
        return card;
    }

    updateHandValues() {
        // Calculate player's hand value
        this.playerValue = this.calculateHandValue(this.playerHand);
        
        // Calculate dealer's hand value (only count face-up cards)
        const visibleDealerCards = this.dealerHand.filter(card => card.isFaceUp);
        this.dealerValue = this.calculateHandValue(visibleDealerCards);
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePlayerValue(this.playerValue);
            this.gameManager.uiManager.updateDealerValue(this.dealerValue);
        }
    }

    calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        
        // First pass: calculate basic value and count aces
        for (const card of hand) {
            // Skip cards in superposition since we don't know their value
            if (card.isInSuperposition) {
                // For superposition cards, we use the average of possible values
                const possibleValues = card.getPossibleGameValues();
                const averageValue = possibleValues.reduce((sum, val) => sum + val, 0) / possibleValues.length;
                value += averageValue;
                continue;
            }
            
            // Get card game value
            const cardValue = card.getGameValue();
            
            // Check if it's an ace
            if (cardValue === 1) {
                aceCount++;
                value += 1; // Initially count ace as 1
            } else {
                value += cardValue;
            }
        }
        
        // Second pass: adjust for aces
        // Treat aces as 11 if doing so doesn't cause a bust
        for (let i = 0; i < aceCount; i++) {
            if (value + 10 <= 21) {
                value += 10; // Convert one ace from 1 to 11
            }
        }
        
        return value;
    }

    checkForBlackjack() {
        // Player has blackjack if they have 2 cards and a value of 21
        const playerHasBlackjack = this.playerHand.length === 2 && this.playerValue === 21;
        
        // Calculate dealer's full hand value (including face-down card)
        const dealerFullValue = this.calculateHandValue(this.dealerHand);
        const dealerHasBlackjack = this.dealerHand.length === 2 && dealerFullValue === 21;
        
        return playerHasBlackjack || dealerHasBlackjack;
    }

    async handleBlackjack() {
        console.log("Handling blackjack");
        
        // Reveal dealer's hidden card
        await this.revealDealerCard();
        
        // Calculate dealer's full hand value
        const dealerFullValue = this.calculateHandValue(this.dealerHand);
        const dealerHasBlackjack = this.dealerHand.length === 2 && dealerFullValue === 21;
        
        // Player has blackjack if they have 2 cards and a value of 21
        const playerHasBlackjack = this.playerHand.length === 2 && this.playerValue === 21;
        
        // Determine winner
        if (playerHasBlackjack && dealerHasBlackjack) {
            // It's a tie (push)
            this.endGame('tie');
        } else if (playerHasBlackjack) {
            // Player wins with blackjack
            this.endGame('player');
        } else if (dealerHasBlackjack) {
            // Dealer wins with blackjack
            this.endGame('dealer');
        }
    }

    playerHit() {
        if (this.gameState !== 'playerTurn') {
            console.error("Cannot hit - not player's turn");
            return false;
        }
        
        console.log("Player hits");
        
        // Deal a card to the player
        this.dealCardToPlayer(true);
        
        // Update hand values
        this.updateHandValues();
        
        // Check if player busts
        if (this.playerValue > 21) {
            this.checkForBust();
        }
        
        return true;
    }

    async checkForBust() {
        if (this.playerValue > 21) {
            console.log("Player busts with", this.playerValue);
            
            // Update game state
            this.gameState = 'gameOver';
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus("Bust! You went over 21.");
            }
            
            // End game with dealer as winner
            this.endGame('dealer');
            
            return true;
        }
        
        return false;
    }

    playerStand() {
        if (this.gameState !== 'playerTurn') {
            console.error("Cannot stand - not player's turn");
            return false;
        }
        
        console.log("Player stands");
        
        // Update game state
        this.gameState = 'dealerTurn';
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Dealer's turn...");
        }
        
        // Reveal dealer's hidden card
        this.revealDealerCard();
        
        return true;
    }

    async revealDealerCard() {
        console.log("Revealing dealer's hidden card");
        
        // Find face-down card in dealer's hand
        const hiddenCard = this.dealerHand.find(card => !card.isFaceUp);
        
        if (hiddenCard) {
            // Flip the card face-up
            hiddenCard.isFaceUp = true;
            
            if (hiddenCard.mesh && this.gameManager.sceneManager) {
                this.gameManager.sceneManager.flipCard(hiddenCard.mesh, true);
                
                // Play sound effect
                if (this.gameManager.soundManager) {
                    this.gameManager.soundManager.playCardFlipSound();
                }
            }
            
            // Update hand values
            this.updateHandValues();
        }
    }

    updateDealerTurn() {
        if (this.gameState !== 'dealerTurn') {
            return;
        }
        
        // Play dealer's turn after a short delay
        setTimeout(() => this.playDealerTurn(), 1000);
    }

    async playDealerTurn() {
        console.log("Playing dealer's turn");
        
        // Calculate dealer's full hand value (now that all cards are revealed)
        const dealerFullValue = this.calculateHandValue(this.dealerHand);
        
        // Dealer must hit until their hand value is 17 or higher
        if (dealerFullValue < 17) {
            console.log("Dealer hits with", dealerFullValue);
            
            // Deal a card to the dealer
            await this.dealCardToDealer(true);
            
            // Update hand values
            this.updateHandValues();
            
            // Continue dealer's turn
            setTimeout(() => this.playDealerTurn(), 1000);
        } else {
            console.log("Dealer stands with", dealerFullValue);
            
            // Determine winner
            this.determineWinner();
        }
    }

    determineWinner() {
        console.log("Determining winner");
        
        // Calculate final hand values
        const finalPlayerValue = this.playerValue;
        const finalDealerValue = this.calculateHandValue(this.dealerHand);
        
        // Check for dealer bust
        if (finalDealerValue > 21) {
            console.log("Dealer busts with", finalDealerValue);
            this.endGame('player');
            return;
        }
        
        // Compare hand values
        if (finalPlayerValue > finalDealerValue) {
            console.log("Player wins with", finalPlayerValue, "vs", finalDealerValue);
            this.endGame('player');
        } else if (finalDealerValue > finalPlayerValue) {
            console.log("Dealer wins with", finalDealerValue, "vs", finalPlayerValue);
            this.endGame('dealer');
        } else {
            console.log("It's a tie with", finalPlayerValue);
            this.endGame('tie');
        }
    }

    endGame(winner) {
        console.log("Game over. Winner:", winner);
        
        // Update game state
        this.gameState = 'gameOver';
        
        // Update UI based on winner
        if (this.gameManager.uiManager) {
            if (winner === 'player') {
                this.gameManager.uiManager.showWin();
                this.gameManager.uiManager.updateStatus("You win!");
                
                // Play win sound
                if (this.gameManager.soundManager) {
                    this.gameManager.soundManager.playWinSound();
                }
            } else if (winner === 'dealer') {
                this.gameManager.uiManager.showLose();
                this.gameManager.uiManager.updateStatus("Dealer wins!");
                
                // Play lose sound
                if (this.gameManager.soundManager) {
                    this.gameManager.soundManager.playLoseSound();
                }
            } else {
                this.gameManager.uiManager.showTie();
                this.gameManager.uiManager.updateStatus("It's a tie!");
            }
        }
        
        // Disable player controls
        const hitBtn = document.getElementById('hit-btn');
        const standBtn = document.getElementById('stand-btn');
        
        if (hitBtn) hitBtn.disabled = true;
        if (standBtn) standBtn.disabled = true;
    }
} 