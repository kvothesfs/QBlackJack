import { GameState } from '../quantum/GameManager.js';

export class UIManager {
    constructor(gameManager) {
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
        // Game selection
        const blackjackBtn = document.querySelector('#game-selection .game-btn:nth-child(1)');
        const pokerBtn = document.querySelector('#game-selection .game-btn:nth-child(2)');
        
        blackjackBtn.addEventListener('click', () => this.selectGame('blackjack'));
        pokerBtn.addEventListener('click', () => this.selectGame('poker'));
        
        // Blackjack controls
        document.getElementById('hit-btn').addEventListener('click', () => this.gameManager.playerHit());
        document.getElementById('stand-btn').addEventListener('click', () => this.gameManager.playerStand());
        document.getElementById('double-btn').addEventListener('click', () => this.gameManager.playerDouble());
        document.getElementById('split-btn').addEventListener('click', () => this.gameManager.playerSplit());
        
        // Poker controls
        document.getElementById('bet-btn').addEventListener('click', () => this.gameManager.pokerPlaceBet(10));
        document.getElementById('call-btn').addEventListener('click', () => this.gameManager.pokerCall());
        document.getElementById('raise-btn').addEventListener('click', () => this.gameManager.pokerRaise(20));
        document.getElementById('fold-btn').addEventListener('click', () => this.gameManager.pokerFold());
        document.getElementById('deal-flop-btn').addEventListener('click', () => this.gameManager.pokerDealFlop());
        document.getElementById('deal-turn-btn').addEventListener('click', () => this.gameManager.pokerDealTurn());
        document.getElementById('deal-river-btn').addEventListener('click', () => this.gameManager.pokerDealRiver());
        
        // Quantum controls
        document.getElementById('hadamard-btn').addEventListener('click', () => this.gameManager.applySuperposition(this.gameManager.selectedCard));
        document.getElementById('schrodinger-btn').addEventListener('click', () => this.gameManager.measureCard(this.gameManager.selectedCard));
        document.getElementById('entanglement-btn').addEventListener('click', () => this.gameManager.applyEntanglement(this.gameManager.selectedCard, this.gameManager.entanglementTarget));
    }

    selectGame(gameType) {
        if (!this.gameManager.isInitialized) {
            console.error("Game not initialized yet. Please wait.");
            return;
        }

        // Hide game selection
        document.getElementById('game-selection').style.display = 'none';
        
        // Show game container
        document.getElementById('game-container').style.display = 'block';
        
        // Set game type
        this.gameManager.setGameType(gameType);
        
        // Update UI for game type
        this.updateUIForGameType(gameType);
    }

    // Add method to enable game selection buttons
    enableGameSelection() {
        const buttons = document.querySelectorAll('#game-selection .game-btn');
        buttons.forEach(button => button.disabled = false);
    }

    updateUIForGameType(gameType) {
        // Show/hide appropriate controls
        document.getElementById('blackjack-controls').style.display = gameType === 'blackjack' ? 'block' : 'none';
        document.getElementById('poker-controls').style.display = gameType === 'poker' ? 'block' : 'none';
        
        // Update status
        this.updateStatus(`Welcome to Quantum ${gameType === 'blackjack' ? 'Blackjack' : 'Texas Hold Em'}!`);
    }

    showTutorial(messages) {
        const tutorialDisplay = document.getElementById('tutorial-display');
        tutorialDisplay.innerHTML = '';
        
        messages.forEach((message, index) => {
            const messageElement = document.createElement('div');
            messageElement.className = 'tutorial-message';
            messageElement.textContent = message;
            tutorialDisplay.appendChild(messageElement);
            
            // Add delay between messages
            setTimeout(() => {
                messageElement.style.opacity = '1';
            }, index * 1000);
        });
        
        // Hide tutorial after all messages are shown
        setTimeout(() => {
            tutorialDisplay.style.opacity = '0';
            setTimeout(() => {
                tutorialDisplay.innerHTML = '';
            }, 500);
        }, messages.length * 1000 + 2000);
    }

    updateStatus(message) {
        const statusDisplay = document.getElementById('status-display');
        statusDisplay.textContent = message;
    }

    updateHandValues(playerValue, dealerValue) {
        document.getElementById('player-value').textContent = `Player: ${playerValue}`;
        document.getElementById('dealer-value').textContent = `Dealer: ${dealerValue}`;
    }

    updateQuantumCounts(superposed, entangled) {
        document.getElementById('quantum-counts').textContent = 
            `Superposed: ${superposed} | Entangled: ${entangled}`;
    }

    showWin() {
        this.updateStatus('You win!');
    }

    showLose() {
        this.updateStatus('Dealer wins!');
    }

    showTie() {
        this.updateStatus('Push! It\'s a tie!');
    }
} 