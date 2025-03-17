import { GameState } from '../quantum/GameManager.js';

export class UIManager {
    constructor(gameManager) {
        console.log("Creating UIManager");
        this.gameManager = gameManager;
        this.setupUI();
        this.setupEventListeners();
    }

    setupUI() {
        // Create game selection buttons
        const gameSelection = document.createElement('div');
        gameSelection.id = 'game-selection';
        gameSelection.className = 'game-selection';
        
        const blackjackBtn = document.createElement('button');
        blackjackBtn.textContent = 'Quantum Blackjack';
        blackjackBtn.className = 'game-btn';
        blackjackBtn.disabled = true; // Initially disabled
        
        const pokerBtn = document.createElement('button');
        pokerBtn.textContent = 'Quantum Texas Hold Em';
        pokerBtn.className = 'game-btn';
        pokerBtn.disabled = true; // Initially disabled
        
        gameSelection.appendChild(blackjackBtn);
        gameSelection.appendChild(pokerBtn);
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.id = 'game-container';
        gameContainer.className = 'game-container';
        
        // Create canvas for 3D rendering
        const canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        gameContainer.appendChild(canvas);
        
        // Create UI controls
        const controls = document.createElement('div');
        controls.className = 'game-controls';
        
        // Blackjack controls
        const blackjackControls = document.createElement('div');
        blackjackControls.id = 'blackjack-controls';
        blackjackControls.className = 'game-controls';
        blackjackControls.innerHTML = `
            <button id="hit-btn">Hit</button>
            <button id="stand-btn">Stand</button>
            <button id="double-btn">Double</button>
            <button id="split-btn">Split</button>
        `;
        
        // Poker controls
        const pokerControls = document.createElement('div');
        pokerControls.id = 'poker-controls';
        pokerControls.className = 'game-controls';
        pokerControls.innerHTML = `
            <button id="bet-btn">Bet</button>
            <button id="call-btn">Call</button>
            <button id="raise-btn">Raise</button>
            <button id="fold-btn">Fold</button>
            <button id="deal-flop-btn">Deal Flop</button>
            <button id="deal-turn-btn">Deal Turn</button>
            <button id="deal-river-btn">Deal River</button>
        `;
        
        // Quantum controls
        const quantumControls = document.createElement('div');
        quantumControls.className = 'quantum-controls';
        quantumControls.innerHTML = `
            <button id="hadamard-btn">Hadamard (Superposition)</button>
            <button id="schrodinger-btn">Schrödinger (Measure)</button>
            <button id="entanglement-btn">Entanglement</button>
        `;
        
        // Game info display
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = `
            <div id="player-value"></div>
            <div id="dealer-value"></div>
            <div id="pot-amount"></div>
            <div id="player-chips"></div>
        `;
        
        // Status display
        const statusDisplay = document.createElement('div');
        statusDisplay.id = 'status-display';
        statusDisplay.className = 'status-display';
        
        // Tutorial display
        const tutorialDisplay = document.createElement('div');
        tutorialDisplay.id = 'tutorial-display';
        tutorialDisplay.className = 'tutorial-display';
        
        // Add all elements to the container
        controls.appendChild(blackjackControls);
        controls.appendChild(pokerControls);
        controls.appendChild(quantumControls);
        
        gameContainer.appendChild(controls);
        gameContainer.appendChild(gameInfo);
        gameContainer.appendChild(statusDisplay);
        gameContainer.appendChild(tutorialDisplay);
        
        // Add everything to the document
        document.body.appendChild(gameSelection);
        document.body.appendChild(gameContainer);
        
        // Initially hide game container
        gameContainer.style.display = 'none';
    }

    setupEventListeners() {
        console.log("Setting up UI event listeners");
        
        // Game selection
        const blackjackBtn = document.getElementById('blackjack-btn');
        const pokerBtn = document.getElementById('poker-btn');
        
        console.log("Game selection buttons:", blackjackBtn, pokerBtn);
        
        if (blackjackBtn && pokerBtn) {
            blackjackBtn.addEventListener('click', () => {
                console.log("Blackjack button clicked");
                this.selectGame('blackjack');
            });
            
            pokerBtn.addEventListener('click', () => {
                console.log("Poker button clicked");
                this.selectGame('poker');
            });
        } else {
            console.error("Game selection buttons not found in the DOM");
        }

        // Blackjack controls
        this.addEventListenerSafely('hit-btn', 'click', () => this.gameManager.playerHit());
        this.addEventListenerSafely('stand-btn', 'click', () => this.gameManager.playerStand());
        this.addEventListenerSafely('double-btn', 'click', () => this.gameManager.playerDouble());
        this.addEventListenerSafely('split-btn', 'click', () => this.gameManager.playerSplit());
        
        // Poker controls
        this.addEventListenerSafely('bet-btn', 'click', () => this.gameManager.pokerBet(10));
        this.addEventListenerSafely('call-btn', 'click', () => this.gameManager.pokerCall());
        this.addEventListenerSafely('raise-btn', 'click', () => this.gameManager.pokerRaise(20));
        this.addEventListenerSafely('fold-btn', 'click', () => this.gameManager.pokerFold());
        this.addEventListenerSafely('deal-flop-btn', 'click', () => this.gameManager.pokerDealFlop());
        this.addEventListenerSafely('deal-turn-btn', 'click', () => this.gameManager.pokerDealTurn());
        this.addEventListenerSafely('deal-river-btn', 'click', () => this.gameManager.pokerDealRiver());
        
        // Quantum controls
        this.addEventListenerSafely('hadamard-btn', 'click', () => {
            if (this.gameManager.selectedCard) {
                this.gameManager.applySuperposition(this.gameManager.selectedCard);
            } else {
                this.updateStatus("Select a card first to apply superposition");
            }
        });
        
        this.addEventListenerSafely('schrodinger-btn', 'click', () => {
            if (this.gameManager.selectedCard) {
                this.gameManager.measureCard(this.gameManager.selectedCard);
            } else {
                this.updateStatus("Select a card first to measure");
            }
        });
        
        this.addEventListenerSafely('entanglement-btn', 'click', () => {
            if (this.gameManager.selectedCard && this.gameManager.entanglementTarget) {
                this.gameManager.applyEntanglement(this.gameManager.selectedCard, this.gameManager.entanglementTarget);
            } else {
                this.updateStatus("Select two cards first to entangle them");
            }
        });
        
        // Sound toggle
        this.addEventListenerSafely('sound-toggle', 'click', () => {
            const icon = document.querySelector('.sound-icon');
            if (icon) {
                if (icon.textContent === '🔊') {
                    icon.textContent = '🔇';
                    // Mute sound
                    if (this.gameManager && this.gameManager.soundManager) {
                        this.gameManager.soundManager.mute();
                    }
                } else {
                    icon.textContent = '🔊';
                    // Unmute sound
                    if (this.gameManager && this.gameManager.soundManager) {
                        this.gameManager.soundManager.unmute();
                    }
                }
            }
        });
    }

    // Helper method to safely add event listeners
    addEventListenerSafely(elementId, eventType, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, callback);
        } else {
            console.warn(`Element with ID '${elementId}' not found for event listener`);
        }
    }

    selectGame(gameType) {
        console.log(`Selecting game: ${gameType}`);
        
        if (!this.gameManager) {
            console.error("GameManager not initialized in UIManager");
            this.showError("Game initialization error. Please refresh the page.");
            return;
        }

        // Check if gameManager is properly initialized
        if (!this.gameManager.initialized) {
            console.error("GameManager not fully initialized yet");
            this.showError("Game is still initializing. Please wait a moment and try again.");
            return;
        }

        // Attempt to set the game type
        try {
            const success = this.gameManager.setGameType(gameType);
            
            if (success) {
                console.log(`Successfully selected game: ${gameType}`);
                
                // Hide game selection
                const gameSelection = document.getElementById('game-selection');
                if (gameSelection) {
                    gameSelection.style.display = 'none';
                } else {
                    document.querySelector('.game-selection').style.display = 'none';
                }
                
                // Show game container
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.display = 'block';
                }
                
                // Update UI for game type
                this.updateUIForGameType(gameType);
            } else {
                console.error(`Failed to select game: ${gameType}`);
                this.showError("Failed to start game. Please try again.");
            }
        } catch (error) {
            console.error(`Error selecting game: ${gameType}`, error);
            this.showError("Error starting game. Please refresh and try again.");
        }
    }

    enableGameSelection() {
        console.log("Enabling game selection buttons");
        const buttons = document.querySelectorAll('.game-btn');
        
        if (buttons && buttons.length) {
            buttons.forEach(button => {
                button.disabled = false;
            });
            console.log("Game selection buttons enabled");
        } else {
            console.error("Game selection buttons not found");
        }
    }

    updateUIForGameType(gameType) {
        console.log(`Updating UI for game type: ${gameType}`);
        
        // Hide all game controls first
        const blackjackControls = document.getElementById('blackjack-controls');
        const pokerControls = document.getElementById('poker-controls');
        
        if (blackjackControls && pokerControls) {
            blackjackControls.style.display = 'none';
            pokerControls.style.display = 'none';
            
            // Show controls for the selected game
            if (gameType === 'blackjack') {
                blackjackControls.style.display = 'flex';
                this.updateStatus("Welcome to Quantum Blackjack! Select a card to begin.");
            } else if (gameType === 'poker') {
                pokerControls.style.display = 'flex';
                this.updateStatus("Welcome to Quantum Texas Hold'Em! Place your bets to begin.");
            }
        } else {
            console.error("Game controls not found in the DOM");
        }
    }

    updateStatus(message) {
        const statusDisplay = document.getElementById('status-display');
        if (statusDisplay) {
            statusDisplay.textContent = message;
        }
    }

    showError(message) {
        console.error(message);
        
        // Create error display if it doesn't exist
        let errorDisplay = document.getElementById('error-display');
        
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.id = 'error-display';
            errorDisplay.className = 'error-display';
            document.body.appendChild(errorDisplay);
        }
        
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDisplay.style.display = 'none';
        }, 5000);
    }

    updatePlayerValue(value) {
        const playerValue = document.getElementById('player-value');
        if (playerValue) {
            playerValue.textContent = `Player: ${value}`;
        }
    }

    updateDealerValue(value) {
        const dealerValue = document.getElementById('dealer-value');
        if (dealerValue) {
            dealerValue.textContent = `Dealer: ${value}`;
        }
    }

    updatePotAmount(amount) {
        const potAmount = document.getElementById('pot-amount');
        if (potAmount) {
            potAmount.textContent = `Pot: ${amount}`;
        }
    }

    updatePlayerChips(chips) {
        const playerChips = document.getElementById('player-chips');
        if (playerChips) {
            playerChips.textContent = `Chips: ${chips}`;
        }
    }

    updateQuantumCounts(superposed, entangled) {
        const quantumCounts = document.getElementById('quantum-counts');
        if (quantumCounts) {
            quantumCounts.textContent = `Superposed: ${superposed} | Entangled: ${entangled}`;
        }
    }

    showWin(message = "You Win!") {
        this.updateStatus(message);
        this.playSound('win');
    }

    showLose(message = "You Lose!") {
        this.updateStatus(message);
        this.playSound('lose');
    }

    showTie(message = "It's a Tie!") {
        this.updateStatus(message);
        this.playSound('tie');
    }

    playSound(soundName) {
        if (this.gameManager && this.gameManager.soundManager) {
            this.gameManager.soundManager.play(soundName);
        }
    }
} 