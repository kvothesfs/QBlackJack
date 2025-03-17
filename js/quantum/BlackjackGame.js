import { CardState } from './CardState.js';
import { QuantumCard } from './QuantumCard.js';
import * as THREE from 'three';

export class BlackjackGame {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.reset();
    }

    reset() {
        this.playerCards = [];
        this.dealerCards = [];
        this.gameState = 'initial';
        this.deck = CardState.createDeck();
        this.shuffleDeck();
    }

    initialize() {
        this.reset();
        this.gameManager.sceneManager.clearScene();
        this.gameManager.sceneManager.setupTable();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    async startNewGame() {
        this.reset();
        this.gameManager.sceneManager.clearScene();
        this.gameManager.sceneManager.setupTable();
        
        // Deal initial cards
        await this.dealInitialCards();
    }

    async dealInitialCards() {
        // Deal two cards to player
        await this.dealCardToPlayer();
        await this.dealCardToPlayer();
        
        // Deal two cards to dealer (one face up, one face down)
        await this.dealCardToDealer(false);
        await this.dealCardToDealer(true);
        
        this.gameState = 'player_turn';
        this.checkForBlackjack();
    }

    async dealCardToPlayer() {
        const [state1, state2] = this.getNextCardStates();
        const card = new QuantumCard(state1, state2, this.gameManager.assetLoader);
        
        const position = new THREE.Vector3(
            (this.playerCards.length - 1) * 0.8,
            0,
            0
        );
        
        this.gameManager.sceneManager.addCard(card, position);
        this.playerCards.push(card);
        
        await card.flipToFront();
        this.updateHandValue();
    }

    async dealCardToDealer(faceDown = false) {
        const [state1, state2] = this.getNextCardStates();
        const card = new QuantumCard(state1, state2, this.gameManager.assetLoader);
        
        const position = new THREE.Vector3(
            (this.dealerCards.length - 1) * 0.8,
            0,
            0
        );
        
        this.gameManager.sceneManager.addCard(card, position, true);
        this.dealerCards.push(card);
        
        if (!faceDown) {
            await card.flipToFront();
        }
    }

    getNextCardStates() {
        if (this.deck.length < 2) {
            this.deck = CardState.createDeck();
            this.shuffleDeck();
        }
        
        return [this.deck.pop(), this.deck.pop()];
    }

    async hit() {
        if (this.gameState !== 'player_turn') return;
        
        await this.dealCardToPlayer();
        await this.checkForBust();
    }

    async stand() {
        if (this.gameState !== 'player_turn') return;
        
        this.gameState = 'dealer_turn';
        await this.playDealerTurn();
    }

    async checkForBust() {
        const { min } = this.calculateHandValue(this.playerCards);
        
        if (min > 21) {
            this.gameState = 'game_over';
            this.gameManager.endGame('dealer');
        }
    }

    async playDealerTurn() {
        // Reveal dealer's face-down card
        const faceDownCard = this.dealerCards.find(card => !card.isFaceUp);
        if (faceDownCard) {
            await faceDownCard.flipToFront();
        }
        
        // Keep drawing cards until dealer has at least 17
        let dealerValue = this.calculateHandValue(this.dealerCards).min;
        
        while (dealerValue < 17) {
            await this.dealCardToDealer(false);
            dealerValue = this.calculateHandValue(this.dealerCards).min;
        }
        
        // Compare hands and determine winner
        await this.determineWinner();
    }

    async determineWinner() {
        const playerValue = this.calculateHandValue(this.playerCards).min;
        const dealerValue = this.calculateHandValue(this.dealerCards).min;
        
        if (playerValue > 21) {
            this.gameManager.endGame('dealer');
        } else if (dealerValue > 21) {
            this.gameManager.endGame('player');
        } else if (playerValue > dealerValue) {
            this.gameManager.endGame('player');
        } else if (dealerValue > playerValue) {
            this.gameManager.endGame('dealer');
        } else {
            this.gameManager.endGame('tie');
        }
    }

    checkForBlackjack() {
        if (this.playerCards.length === 2 && this.calculateHandValue(this.playerCards).min === 21) {
            this.gameState = 'blackjack';
            this.gameManager.endGame('player');
        }
    }

    calculateHandValue(cards) {
        let minValue = 0;
        let maxValue = 0;
        let aceCount = 0;
        
        for (const card of cards) {
            if (card.collapsed) {
                const value = card.currentState.blackjackValue();
                minValue += value;
                maxValue += value;
                if (value === 11) aceCount++;
            } else {
                const { min, max } = card.getValueRange();
                minValue += min;
                maxValue += max;
                if (min === 11 || max === 11) aceCount++;
            }
        }
        
        // Adjust for aces
        while (maxValue > 21 && aceCount > 0) {
            maxValue -= 10;
            aceCount--;
        }
        
        return { min: minValue, max: maxValue };
    }

    updateHandValue() {
        const { min, max } = this.calculateHandValue(this.playerCards);
        let displayValue = min === max ? min.toString() : `${min}-${max}`;
        
        if (this.playerCards.some(card => !card.collapsed)) {
            displayValue += ' (uncertain)';
        }
        
        this.gameManager.uiManager.updateStatus(`Player's hand: ${displayValue}`);
    }

    update(deltaTime) {
        // Update all player cards
        for (const card of this.playerCards) {
            if (card && card.update) {
                card.update(deltaTime);
            }
        }

        // Update all dealer cards
        for (const card of this.dealerCards) {
            if (card && card.update) {
                card.update(deltaTime);
            }
        }

        // Update game state if needed
        if (this.gameState === 'player_turn') {
            this.updateHandValue();
        }
    }
} 