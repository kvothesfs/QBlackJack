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
        
        // Create a new deck
        this.createDeck();
    }

    update(deltaTime) {
        // Update card animations and effects
        this.updateCards(deltaTime);
        
        // Update dealer AI if it's the dealer's turn
        if (this.gameState === 'dealer-action') {
            this.updateDealerAction();
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
        
        // Update community cards
        for (const card of this.communityCards) {
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
        console.log("Setting up poker table");
        if (this.gameManager.sceneManager) {
            this.gameManager.sceneManager.clearScene();
            this.gameManager.sceneManager.addTable();
        }
    }

    createDeck() {
        console.log("Creating deck for Texas Hold'Em");
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
        console.log("Starting new Texas Hold'Em game");
        
        // Reset game state
        this.reset();
        
        // Deal initial cards
        await this.dealInitialCards();
        
        // Set initial bet
        const smallBlind = 10;
        const bigBlind = 20;
        
        // Dealer posts small blind
        this.dealerBet = smallBlind;
        this.dealerChips -= smallBlind;
        
        // Player posts big blind
        this.playerBet = bigBlind;
        this.playerChips -= bigBlind;
        
        // Update pot
        this.pot = smallBlind + bigBlind;
        
        // Set game state
        this.gameState = 'pre-flop';
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Pre-flop round. Your action: Call, Raise, or Fold?");
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
        }
        
        // Enable player controls
        this.enablePokerControls('pre-flop');
        
        return true;
    }

    enablePokerControls(round) {
        // Get control buttons
        const betBtn = document.getElementById('bet-btn');
        const callBtn = document.getElementById('call-btn');
        const raiseBtn = document.getElementById('raise-btn');
        const foldBtn = document.getElementById('fold-btn');
        const dealFlopBtn = document.getElementById('deal-flop-btn');
        const dealTurnBtn = document.getElementById('deal-turn-btn');
        const dealRiverBtn = document.getElementById('deal-river-btn');
        
        // Disable all controls first
        if (betBtn) betBtn.disabled = true;
        if (callBtn) callBtn.disabled = true;
        if (raiseBtn) raiseBtn.disabled = true;
        if (foldBtn) foldBtn.disabled = true;
        if (dealFlopBtn) dealFlopBtn.disabled = true;
        if (dealTurnBtn) dealTurnBtn.disabled = true;
        if (dealRiverBtn) dealRiverBtn.disabled = true;
        
        // Enable controls based on round
        if (round === 'pre-flop' || round === 'flop' || round === 'turn' || round === 'river') {
            if (callBtn) callBtn.disabled = false;
            if (raiseBtn) raiseBtn.disabled = false;
            if (foldBtn) foldBtn.disabled = false;
        }
        
        // Enable deal buttons based on round
        if (round === 'pre-flop' && this.playerBet === this.dealerBet) {
            if (dealFlopBtn) dealFlopBtn.disabled = false;
        } else if (round === 'flop' && this.playerBet === this.dealerBet) {
            if (dealTurnBtn) dealTurnBtn.disabled = false;
        } else if (round === 'turn' && this.playerBet === this.dealerBet) {
            if (dealRiverBtn) dealRiverBtn.disabled = false;
        }
    }

    async dealInitialCards() {
        console.log("Dealing initial cards for Texas Hold'Em");
        
        // Deal first card to player (face up)
        await this.dealCardToPlayer(true);
        
        // Deal first card to dealer (face down)
        await this.dealCardToDealer(false);
        
        // Deal second card to player (face up)
        await this.dealCardToPlayer(true);
        
        // Deal second card to dealer (face down)
        await this.dealCardToDealer(false);
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
        const posX = -3 + this.playerCardCount * 2.5;
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
        
        // Add to dealer's hand
        this.dealerHand.push(card);
        
        // Calculate position for the card
        const posX = -3 + this.dealerCardCount * 2.5;
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

    async dealCommunityCard(faceUp = true) {
        if (this.deck.length === 0) {
            console.error("No cards left in deck");
            return null;
        }
        
        // Take the top card from the deck
        const card = this.deck.pop();
        card.isFaceUp = faceUp;
        
        // Add to community cards
        this.communityCards.push(card);
        
        // Calculate position for the card
        const posX = -6 + this.communityCardCount * 3;
        const posY = 0;
        const posZ = 0;
        
        // Create position and rotation vectors
        const position = new THREE.Vector3(posX, posY, posZ);
        const rotation = new THREE.Euler(0, 0, 0);
        
        // Create card mesh and add to scene
        if (this.gameManager.sceneManager) {
            const cardMesh = this.gameManager.sceneManager.addCard(card, position, rotation, false);
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
        
        // Increment community card count
        this.communityCardCount++;
        
        return card;
    }

    async dealFlop() {
        console.log("Dealing the flop");
        
        if (this.gameState !== 'pre-flop') {
            console.error("Cannot deal flop - not in pre-flop state");
            return false;
        }
        
        // Deal three community cards (the flop)
        await this.dealCommunityCard(true);
        await this.dealCommunityCard(true);
        await this.dealCommunityCard(true);
        
        // Update game state
        this.gameState = 'flop';
        
        // Reset bets for this round
        this.playerBet = 0;
        this.dealerBet = 0;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Flop round. Your action: Check, Bet, or Fold?");
        }
        
        // Enable player controls
        this.enablePokerControls('flop');
        
        return true;
    }

    async dealTurn() {
        console.log("Dealing the turn");
        
        if (this.gameState !== 'flop') {
            console.error("Cannot deal turn - not in flop state");
            return false;
        }
        
        // Deal one community card (the turn)
        await this.dealCommunityCard(true);
        
        // Update game state
        this.gameState = 'turn';
        
        // Reset bets for this round
        this.playerBet = 0;
        this.dealerBet = 0;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Turn round. Your action: Check, Bet, or Fold?");
        }
        
        // Enable player controls
        this.enablePokerControls('turn');
        
        return true;
    }

    async dealRiver() {
        console.log("Dealing the river");
        
        if (this.gameState !== 'turn') {
            console.error("Cannot deal river - not in turn state");
            return false;
        }
        
        // Deal one community card (the river)
        await this.dealCommunityCard(true);
        
        // Update game state
        this.gameState = 'river';
        
        // Reset bets for this round
        this.playerBet = 0;
        this.dealerBet = 0;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("River round. Your action: Check, Bet, or Fold?");
        }
        
        // Enable player controls
        this.enablePokerControls('river');
        
        return true;
    }

    pokerBet(amount) {
        if (amount <= 0) {
            console.error("Invalid bet amount:", amount);
            return false;
        }
        
        if (amount > this.playerChips) {
            console.error("Bet amount exceeds available chips:", amount);
            return false;
        }
        
        console.log("Player bets", amount);
        
        // Place bet
        this.playerBet = amount;
        this.playerChips -= amount;
        this.pot += amount;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus(`You bet ${amount} chips. Dealer's action...`);
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
        }
        
        // Switch to dealer's turn
        this.gameState = 'dealer-action';
        
        // Disable player controls while dealer acts
        this.enablePokerControls('dealer-turn');
        
        return true;
    }

    pokerCall() {
        // Calculate call amount (match dealer's bet)
        const callAmount = this.dealerBet - this.playerBet;
        
        if (callAmount <= 0) {
            console.log("Check (no need to call)");
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus("You check. Dealer's action...");
            }
        } else {
            console.log("Player calls", callAmount);
            
            // Place call bet
            this.playerChips -= callAmount;
            this.pot += callAmount;
            this.playerBet = this.dealerBet;
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.updateStatus(`You call ${callAmount} chips. Dealer's action...`);
                this.gameManager.uiManager.updatePotAmount(this.pot);
                this.gameManager.uiManager.updatePlayerChips(this.playerChips);
            }
        }
        
        // Switch to dealer's turn
        this.gameState = 'dealer-action';
        
        // Disable player controls while dealer acts
        this.enablePokerControls('dealer-turn');
        
        return true;
    }

    pokerRaise(amount) {
        if (amount <= this.dealerBet) {
            console.error("Raise amount must be greater than current bet:", amount);
            return false;
        }
        
        if (amount > this.playerChips + this.playerBet) {
            console.error("Raise amount exceeds available chips:", amount);
            return false;
        }
        
        console.log("Player raises to", amount);
        
        // Calculate amount to add
        const raiseAmount = amount - this.playerBet;
        
        // Place raise bet
        this.playerChips -= raiseAmount;
        this.pot += raiseAmount;
        this.playerBet = amount;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus(`You raise to ${amount} chips. Dealer's action...`);
            this.gameManager.uiManager.updatePotAmount(this.pot);
            this.gameManager.uiManager.updatePlayerChips(this.playerChips);
        }
        
        // Switch to dealer's turn
        this.gameState = 'dealer-action';
        
        // Disable player controls while dealer acts
        this.enablePokerControls('dealer-turn');
        
        return true;
    }

    pokerFold() {
        console.log("Player folds");
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("You fold. Dealer wins the pot.");
        }
        
        // End the game with dealer as winner
        this.endGame('dealer');
        
        return true;
    }

    updateDealerAction() {
        // Dealer's simple AI
        setTimeout(() => {
            // Get dealer decision based on current game state
            const decision = this.getDealerDecision();
            
            if (decision === 'fold') {
                // Dealer folds
                if (this.gameManager.uiManager) {
                    this.gameManager.uiManager.updateStatus("Dealer folds. You win the pot!");
                }
                
                // End the game with player as winner
                this.endGame('player');
            } else if (decision === 'call') {
                // Dealer calls player's bet
                const callAmount = this.playerBet - this.dealerBet;
                
                if (callAmount <= 0) {
                    // Check (no need to call)
                    if (this.gameManager.uiManager) {
                        this.gameManager.uiManager.updateStatus("Dealer checks.");
                    }
                } else {
                    // Call player's bet
                    this.dealerChips -= callAmount;
                    this.pot += callAmount;
                    this.dealerBet = this.playerBet;
                    
                    // Update UI
                    if (this.gameManager.uiManager) {
                        this.gameManager.uiManager.updateStatus(`Dealer calls ${callAmount} chips.`);
                        this.gameManager.uiManager.updatePotAmount(this.pot);
                    }
                }
                
                // Proceed to next round or showdown
                this.nextRound();
            } else if (decision === 'raise') {
                // Dealer raises by a random amount
                const minRaise = this.playerBet + 20;
                const maxRaise = this.playerBet + Math.min(100, this.dealerChips);
                const raiseAmount = Math.floor(Math.random() * (maxRaise - minRaise + 1)) + minRaise;
                
                // Calculate amount to add
                const amountToAdd = raiseAmount - this.dealerBet;
                
                // Place raise bet
                this.dealerChips -= amountToAdd;
                this.pot += amountToAdd;
                this.dealerBet = raiseAmount;
                
                // Update UI
                if (this.gameManager.uiManager) {
                    this.gameManager.uiManager.updateStatus(`Dealer raises to ${raiseAmount} chips. Your action?`);
                    this.gameManager.uiManager.updatePotAmount(this.pot);
                }
                
                // Switch back to player's turn
                this.gameState = this.getGameStateFromRound();
                
                // Enable player controls
                this.enablePokerControls(this.getGameStateFromRound());
            }
        }, 1500); // Slight delay for dealer's decision
    }

    getDealerDecision() {
        // Simple AI for dealer's decision
        // More sophisticated AI would consider hand strength, pot odds, etc.
        
        // Random decision with weighted probabilities
        const random = Math.random();
        
        if (random < 0.1) {
            // 10% chance to fold
            return 'fold';
        } else if (random < 0.7) {
            // 60% chance to call/check
            return 'call';
        } else {
            // 30% chance to raise
            return 'raise';
        }
    }

    getGameStateFromRound() {
        // Convert current game state to round name
        if (this.gameState === 'pre-flop' || this.gameState === 'dealer-action' && this.communityCards.length === 0) {
            return 'pre-flop';
        } else if (this.gameState === 'flop' || this.gameState === 'dealer-action' && this.communityCards.length === 3) {
            return 'flop';
        } else if (this.gameState === 'turn' || this.gameState === 'dealer-action' && this.communityCards.length === 4) {
            return 'turn';
        } else if (this.gameState === 'river' || this.gameState === 'dealer-action' && this.communityCards.length === 5) {
            return 'river';
        } else {
            return 'pre-flop';
        }
    }

    nextRound() {
        // Move to the next round of the game
        const currentRound = this.getGameStateFromRound();
        
        if (currentRound === 'pre-flop' && this.communityCards.length === 0) {
            // Move to flop
            this.dealFlop();
        } else if (currentRound === 'flop' && this.communityCards.length === 3) {
            // Move to turn
            this.dealTurn();
        } else if (currentRound === 'turn' && this.communityCards.length === 4) {
            // Move to river
            this.dealRiver();
        } else if (currentRound === 'river' && this.communityCards.length === 5) {
            // Move to showdown
            this.showdown();
        }
    }

    showdown() {
        console.log("Showdown!");
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Showdown! Revealing dealer's cards...");
        }
        
        // Reveal dealer's cards
        for (const card of this.dealerHand) {
            card.isFaceUp = true;
            
            if (card.mesh && this.gameManager.sceneManager) {
                this.gameManager.sceneManager.flipCard(card.mesh, true);
            }
        }
        
        // Determine winner
        setTimeout(() => this.determineWinner(), 2000);
    }

    determineWinner() {
        console.log("Determining winner");
        
        // For simplicity, let's just use a random winner
        // In a real implementation, you would evaluate the poker hands
        const random = Math.random();
        
        if (random < 0.5) {
            // Player wins
            this.endGame('player');
        } else {
            // Dealer wins
            this.endGame('dealer');
        }
    }

    endGame(winner) {
        console.log("Game over. Winner:", winner);
        
        // Update game state
        this.gameState = 'gameOver';
        
        // Update chips based on winner
        if (winner === 'player') {
            this.playerChips += this.pot;
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.showWin();
                this.gameManager.uiManager.updateStatus(`You win ${this.pot} chips!`);
                this.gameManager.uiManager.updatePlayerChips(this.playerChips);
                
                // Play win sound
                if (this.gameManager.soundManager) {
                    this.gameManager.soundManager.playWinSound();
                }
            }
        } else if (winner === 'dealer') {
            this.dealerChips += this.pot;
            
            // Update UI
            if (this.gameManager.uiManager) {
                this.gameManager.uiManager.showLose();
                this.gameManager.uiManager.updateStatus(`Dealer wins ${this.pot} chips!`);
                
                // Play lose sound
                if (this.gameManager.soundManager) {
                    this.gameManager.soundManager.playLoseSound();
                }
            }
        }
        
        // Reset pot
        this.pot = 0;
        
        // Update UI
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updatePotAmount(this.pot);
        }
        
        // Disable all poker controls
        this.enablePokerControls('game-over');
    }
} 