export class CardState {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    // Return card value for blackjack calculation
    blackjackValue() {
        if (this.value === 'ace') {
            return 11; // Ace is initially 11, will be handled as 1 if needed in hand calculation
        } else if (['jack', 'queen', 'king'].includes(this.value)) {
            return 10;
        } else {
            return parseInt(this.value, 10);
        }
    }

    // Check if card is red (hearts or diamonds)
    isRed() {
        return this.suit === 'hearts' || this.suit === 'diamonds';
    }

    // Get string representation of card
    toString() {
        let valueStr = this.value.charAt(0).toUpperCase() + this.value.slice(1);
        let suitStr = this.suit.charAt(0).toUpperCase() + this.suit.slice(1);
        return `${valueStr} of ${suitStr}`;
    }

    // Create a card in a random state
    static random() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        const randomValue = values[Math.floor(Math.random() * values.length)];
        
        return new CardState(randomSuit, randomValue);
    }

    // Create a random pair of card states for quantum card
    static randomPair() {
        // First state is completely random
        const state1 = CardState.random();
        
        // For the second state, make sure it's different from the first
        let state2;
        do {
            state2 = CardState.random();
        } while (state1.suit === state2.suit && state1.value === state2.value);
        
        return [state1, state2];
    }

    // Create a random pair with at least one state having the specified value
    static randomPairWithValue(value) {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        
        const state1 = new CardState(randomSuit, value);
        
        // For the second state, make sure it's different from the first
        let state2;
        do {
            state2 = CardState.random();
        } while (state1.suit === state2.suit && state1.value === state2.value);
        
        // Randomly decide which state comes first
        if (Math.random() < 0.5) {
            return [state1, state2];
        } else {
            return [state2, state1];
        }
    }

    // Create a deck of standard cards
    static createDeck() {
        const deck = [];
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        for (const suit of suits) {
            for (const value of values) {
                deck.push(new CardState(suit, value));
            }
        }
        
        return deck;
    }

    // Shuffle an array of card states
    static shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
} 