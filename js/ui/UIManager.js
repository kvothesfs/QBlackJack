import { GameState } from '../quantum/GameManager.js';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.setupUI();
        this.setupEventListeners();
    }

    setupUI() {
        // Game selection elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.gameSelection = document.getElementById('game-selection');
        
        // Game selection buttons
        this.blackjackBtn = document.getElementById('blackjack-btn');
        this.pokerBtn = document.getElementById('poker-btn');
        
        // Blackjack UI elements
        this.hitBtn = document.getElementById('hit-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.superpositionBtn = document.getElementById('superposition-btn');
        this.entanglementBtn = document.getElementById('entanglement-btn');
        this.measureBtn = document.getElementById('measure-btn');
        
        // Poker UI elements
        this.betBtn = document.getElementById('bet-btn');
        this.callBtn = document.getElementById('call-btn');
        this.raiseBtn = document.getElementById('raise-btn');
        this.foldBtn = document.getElementById('fold-btn');
        this.dealFlopBtn = document.getElementById('deal-flop-btn');
        this.dealTurnBtn = document.getElementById('deal-turn-btn');
        this.dealRiverBtn = document.getElementById('deal-river-btn');
        this.showdownBtn = document.getElementById('showdown-btn');
        
        // Common UI elements
        this.gameContainer = document.getElementById('game-container');
        this.statusDisplay = document.getElementById('status-display');
    }

    setupEventListeners() {
        // Start game button
        if (this.startGameBtn) {
            this.startGameBtn.addEventListener('click', () => {
                this.hideLoadingScreen();
                this.showGameSelection();
            });
        }
        
        // Game selection
        if (this.blackjackBtn) {
            this.blackjackBtn.addEventListener('click', () => {
                this.gameManager.setGameType('blackjack');
                this.hideGameSelection();
                this.showGameUI();
                this.updateUIForGameType('blackjack');
            });
        }
        
        if (this.pokerBtn) {
            this.pokerBtn.addEventListener('click', () => {
                this.gameManager.setGameType('poker');
                this.hideGameSelection();
                this.showGameUI();
                this.updateUIForGameType('poker');
            });
        }
        
        // Blackjack controls
        if (this.hitBtn) {
            this.hitBtn.addEventListener('click', () => this.gameManager.playerHit());
        }
        
        if (this.standBtn) {
            this.standBtn.addEventListener('click', () => this.gameManager.playerStand());
        }
        
        if (this.newGameBtn) {
            this.newGameBtn.addEventListener('click', () => this.gameManager.startNewGame());
        }
        
        // Quantum controls
        if (this.superpositionBtn) {
            this.superpositionBtn.addEventListener('click', () => {
                if (this.gameManager.selectedCard) {
                    this.gameManager.applySuperposition(this.gameManager.selectedCard);
                }
            });
        }
        
        if (this.entanglementBtn) {
            this.entanglementBtn.addEventListener('click', () => {
                if (this.gameManager.selectedCard) {
                    if (!this.gameManager.entanglementTarget) {
                        this.gameManager.entanglementTarget = this.gameManager.selectedCard;
                        this.updateStatus("Select another card to entangle with");
                    } else {
                        this.gameManager.applyEntanglement(
                            this.gameManager.entanglementTarget,
                            this.gameManager.selectedCard
                        );
                        this.gameManager.entanglementTarget = null;
                        this.updateStatus("");
                    }
                }
            });
        }
        
        if (this.measureBtn) {
            this.measureBtn.addEventListener('click', () => {
                if (this.gameManager.selectedCard) {
                    this.gameManager.measureCard(this.gameManager.selectedCard);
                }
            });
        }
        
        // Poker controls
        if (this.betBtn) {
            this.betBtn.addEventListener('click', () => {
                const amount = parseInt(prompt("Enter bet amount:"));
                if (!isNaN(amount)) {
                    this.gameManager.pokerPlaceBet(amount);
                }
            });
        }
        
        if (this.callBtn) {
            this.callBtn.addEventListener('click', () => this.gameManager.pokerCall());
        }
        
        if (this.raiseBtn) {
            this.raiseBtn.addEventListener('click', () => {
                const amount = parseInt(prompt("Enter raise amount:"));
                if (!isNaN(amount)) {
                    this.gameManager.pokerRaise(amount);
                }
            });
        }
        
        if (this.foldBtn) {
            this.foldBtn.addEventListener('click', () => this.gameManager.pokerFold());
        }
        
        if (this.dealFlopBtn) {
            this.dealFlopBtn.addEventListener('click', () => this.gameManager.pokerDealFlop());
        }
        
        if (this.dealTurnBtn) {
            this.dealTurnBtn.addEventListener('click', () => this.gameManager.pokerDealTurn());
        }
        
        if (this.dealRiverBtn) {
            this.dealRiverBtn.addEventListener('click', () => this.gameManager.pokerDealRiver());
        }
        
        if (this.showdownBtn) {
            this.showdownBtn.addEventListener('click', () => {
                const winner = this.gameManager.pokerShowdown();
                this.updateStatus(`Winner: ${winner}`);
            });
        }
    }

    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }
    }

    showGameSelection() {
        if (this.gameSelection) {
            this.gameSelection.style.display = 'block';
        }
    }

    hideGameSelection() {
        if (this.gameSelection) {
            this.gameSelection.style.display = 'none';
        }
    }

    showGameUI() {
        if (this.gameContainer) {
            this.gameContainer.style.display = 'block';
        }
    }

    updateUIForGameType(gameType) {
        // Hide all game-specific UI elements
        const blackjackElements = [
            this.hitBtn, this.standBtn, this.newGameBtn,
            this.superpositionBtn, this.entanglementBtn, this.measureBtn
        ];
        
        const pokerElements = [
            this.betBtn, this.callBtn, this.raiseBtn, this.foldBtn,
            this.dealFlopBtn, this.dealTurnBtn, this.dealRiverBtn, this.showdownBtn
        ];
        
        blackjackElements.forEach(el => {
            if (el) el.style.display = gameType === 'blackjack' ? 'block' : 'none';
        });
        
        pokerElements.forEach(el => {
            if (el) el.style.display = gameType === 'poker' ? 'block' : 'none';
        });
        
        // Update status display
        this.updateStatus(`Game type: ${gameType}`);
    }

    updateStatus(message) {
        if (this.statusDisplay) {
            this.statusDisplay.textContent = message;
        }
    }
} 