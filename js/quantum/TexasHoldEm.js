import { CardState } from './CardState.js';
import { QuantumCard } from './QuantumCard.js';

export class TexasHoldEm {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.reset();
    }

    reset() {
        this.deck = [];
        this.communityCards = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.pot = 0;
        this.currentBet = 0;
        this.playerChips = 1000;
        this.dealerChips = 1000;
        this.gameState = 'betting'; // betting, flop, turn, river, showdown
        this.initializeDeck();
    }

    initialize() {
        this.reset();
        this.gameManager.sceneManager.clearScene();
        this.gameManager.sceneManager.setupTable();
    }

    initializeDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        for (const suit of suits) {
            for (const value of values) {
                this.deck.push(new CardState(value, suit));
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    async dealInitialCards() {
        this.shuffleDeck();
        
        // Deal two cards to player and dealer
        for (let i = 0; i < 2; i++) {
            const playerCard = this.deck.pop();
            const dealerCard = this.deck.pop();
            
            // Create quantum states for each card
            const playerQuantumCard = new QuantumCard(
                playerCard,
                this.deck.pop(), // Alternative state
                this.gameManager.assetLoader
            );
            
            const dealerQuantumCard = new QuantumCard(
                dealerCard,
                this.deck.pop(), // Alternative state
                this.gameManager.assetLoader
            );
            
            // Position cards
            const playerXOffset = (this.playerHand.length - 1) * 1.5;
            const dealerXOffset = (this.dealerHand.length - 1) * 1.5;
            
            const playerPosition = new THREE.Vector3(playerXOffset, 0.1, 2);
            const dealerPosition = new THREE.Vector3(dealerXOffset, 0.1, -2);
            
            this.gameManager.sceneManager.addCard(playerQuantumCard, playerPosition);
            this.gameManager.sceneManager.addCard(dealerQuantumCard, dealerPosition, true);
            
            this.playerHand.push(playerQuantumCard);
            this.dealerHand.push(dealerQuantumCard);
            
            // Flip player cards face up
            await playerQuantumCard.flipToFront();
        }
    }

    async dealFlop() {
        this.gameState = 'flop';
        const flopStartX = -2; // Start position for flop cards
        
        for (let i = 0; i < 3; i++) {
            const card = this.deck.pop();
            const quantumCard = new QuantumCard(
                card,
                this.deck.pop(), // Alternative state
                this.gameManager.assetLoader
            );
            
            // Position flop cards in the middle
            const position = new THREE.Vector3(flopStartX + (i * 1.5), 0.1, 0);
            this.gameManager.sceneManager.addCard(quantumCard, position);
            this.communityCards.push(quantumCard);
            
            await quantumCard.flipToFront();
        }
    }

    async dealTurn() {
        this.gameState = 'turn';
        const card = this.deck.pop();
        const quantumCard = new QuantumCard(
            card,
            this.deck.pop(), // Alternative state
            this.gameManager.assetLoader
        );
        
        // Position turn card after flop
        const position = new THREE.Vector3(2.5, 0.1, 0);
        this.gameManager.sceneManager.addCard(quantumCard, position);
        this.communityCards.push(quantumCard);
        
        await quantumCard.flipToFront();
    }

    async dealRiver() {
        this.gameState = 'river';
        const card = this.deck.pop();
        const quantumCard = new QuantumCard(
            card,
            this.deck.pop(), // Alternative state
            this.gameManager.assetLoader
        );
        
        // Position river card after turn
        const position = new THREE.Vector3(4, 0.1, 0);
        this.gameManager.sceneManager.addCard(quantumCard, position);
        this.communityCards.push(quantumCard);
        
        await quantumCard.flipToFront();
    }

    placeBet(amount) {
        if (amount > this.playerChips) {
            console.warn("Not enough chips!");
            return false;
        }
        
        this.playerChips -= amount;
        this.pot += amount;
        this.currentBet = amount;
        return true;
    }

    fold() {
        this.gameState = 'folded';
        return this.dealerChips;
    }

    call() {
        const callAmount = this.currentBet;
        this.playerChips -= callAmount;
        this.pot += callAmount;
        return true;
    }

    raise(amount) {
        if (amount <= this.currentBet) {
            console.warn("Raise amount must be greater than current bet!");
            return false;
        }
        
        if (amount > this.playerChips) {
            console.warn("Not enough chips!");
            return false;
        }
        
        this.playerChips -= amount;
        this.pot += amount;
        this.currentBet = amount;
        return true;
    }

    // Quantum mechanics for poker
    entangleCards(card1, card2) {
        if (card1 && card2) {
            return card1.entangleWith(card2);
        }
        return false;
    }

    putCardInSuperposition(card) {
        if (card) {
            return card.putInSuperposition();
        }
        return false;
    }

    measureCard(card) {
        if (card) {
            return card.collapse();
        }
        return null;
    }

    // Evaluate hand strength
    evaluateHand(cards) {
        // Convert quantum cards to definite states
        const definiteCards = cards.map(card => {
            if (!card.collapsed) {
                card.collapse();
            }
            return card.currentState;
        });

        // Basic hand evaluation (can be expanded)
        const values = definiteCards.map(card => card.blackjackValue());
        const suits = definiteCards.map(card => card.suit);
        
        // Check for pairs, three of a kind, etc.
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });

        // Check for flush
        const isFlush = suits.every(suit => suit === suits[0]);

        // Simple hand strength calculation
        let strength = 0;
        for (const count of Object.values(valueCounts)) {
            if (count === 2) strength += 1;
            if (count === 3) strength += 3;
            if (count === 4) strength += 5;
        }
        if (isFlush) strength += 2;

        return strength;
    }

    determineWinner() {
        const playerStrength = this.evaluateHand([...this.playerHand, ...this.communityCards]);
        const dealerStrength = this.evaluateHand([...this.dealerHand, ...this.communityCards]);
        
        if (playerStrength > dealerStrength) {
            this.playerChips += this.pot;
            return 'player';
        } else if (dealerStrength > playerStrength) {
            this.dealerChips += this.pot;
            return 'dealer';
        } else {
            // Split pot on tie
            this.playerChips += this.pot / 2;
            this.dealerChips += this.pot / 2;
            return 'tie';
        }
    }

    update(deltaTime) {
        // Update all community cards
        for (const card of this.communityCards) {
            if (card && card.update) {
                card.update(deltaTime);
            }
        }

        // Update player's hand
        for (const card of this.playerHand) {
            if (card && card.update) {
                card.update(deltaTime);
            }
        }

        // Update dealer's hand
        for (const card of this.dealerHand) {
            if (card && card.update) {
                card.update(deltaTime);
            }
        }

        // Update game state if needed
        if (this.gameState === 'betting') {
            this.updateUI();
        }
    }

    updateUI() {
        // Update pot and player chips display
        if (this.gameManager && this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus(
                `Pot: ${this.pot} | Your chips: ${this.playerChips}`
            );
        }
    }

    async startNewGame() {
        this.reset();
        this.gameManager.sceneManager.clearScene();
        this.gameManager.sceneManager.setupTable();
        
        // Deal initial cards
        await this.dealInitialCards();
        
        // Update UI
        this.updateUI();
        
        // Enable betting controls
        if (this.gameManager.uiManager) {
            this.gameManager.uiManager.updateStatus("Place your bet!");
        }
    }
} 