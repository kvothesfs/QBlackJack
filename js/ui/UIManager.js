import { GameState } from '../quantum/GameManager.js';

export class UIManager {
    constructor(gameManager, soundManager) {
        this.gameManager = gameManager;
        this.soundManager = soundManager;
        
        // UI elements
        this.moneyDisplay = document.getElementById('money');
        this.betDisplay = document.getElementById('bet');
        this.handValueDisplay = document.getElementById('hand-value');
        
        // Chips display
        this.hadamardChipDisplay = document.getElementById('hadamard-chip').querySelector('.count');
        this.schrodingerChipDisplay = document.getElementById('schrodinger-chip').querySelector('.count');
        this.entanglementChipDisplay = document.getElementById('entanglement-chip').querySelector('.count');
        
        // Action buttons
        this.betBtn = document.getElementById('bet-btn');
        this.hitBtn = document.getElementById('hit-btn');
        this.standBtn = document.getElementById('stand-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // Dialogs
        this.betDialog = document.getElementById('bet-dialog');
        this.shopDialog = document.getElementById('shop-dialog');
        this.tutorialDialog = document.getElementById('tutorial-dialog');
        
        // Bet dialog elements
        this.betAmount = document.getElementById('bet-amount');
        this.betMinus = document.getElementById('bet-minus');
        this.betPlus = document.getElementById('bet-plus');
        this.betConfirm = document.getElementById('bet-confirm');
        
        // Other UI controls
        this.shopBtn = document.getElementById('shop-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.shopClose = document.getElementById('shop-close');
        this.notification = document.getElementById('notification');
        
        // Tutorial elements
        this.tutorialContent = document.getElementById('tutorial-content');
        this.tutorialNext = document.getElementById('tutorial-next');
        
        // UI Elements
        this.hitButton = document.getElementById('hit-btn');
        this.standButton = document.getElementById('stand-btn');
        this.superpositionButton = document.getElementById('superposition-btn');
        this.entanglementButton = document.getElementById('entanglement-btn');
        this.measureButton = document.getElementById('measure-btn');
        this.newGameButton = document.getElementById('new-game-btn');
        
        // Status display
        this.statusDisplay = document.getElementById('status-display');
        this.playerValueElement = document.getElementById('player-value');
        this.dealerValueElement = document.getElementById('dealer-value');
        this.superpositionCountElement = document.getElementById('superposition-count');
        this.entanglementCountElement = document.getElementById('entanglement-count');
        
        // Result overlay
        this.resultOverlay = document.getElementById('result-overlay');
        this.resultMessage = document.getElementById('result-message');
        
        // Sound toggle button
        this.soundToggle = document.getElementById('sound-toggle');
        this.soundIcon = this.soundToggle.querySelector('.sound-icon');
        
        // UI Container
        this.uiContainer = document.getElementById('ui-container');
        
        // Loading screen
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        
        // Initialize UI
        this.initUI();
    }

    initUI() {
        // Initialize with default values
        this.updateMoney(this.gameManager.money);
        this.updateBet(this.gameManager.bet);
        this.updateHandValue('0');
        this.updateChips(this.gameManager.chips);
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Game buttons
        this.betBtn.addEventListener('click', () => this.openBetDialog());
        this.hitBtn.addEventListener('click', () => this.gameManager.hit());
        this.standBtn.addEventListener('click', () => this.gameManager.stand());
        this.resetBtn.addEventListener('click', () => this.gameManager.startGame());
        
        // Bet dialog
        this.betMinus.addEventListener('click', () => this.adjustBetAmount(-50));
        this.betPlus.addEventListener('click', () => this.adjustBetAmount(50));
        this.betConfirm.addEventListener('click', () => this.confirmBet());
        
        // Shop
        this.shopBtn.addEventListener('click', () => this.openShopDialog());
        this.shopClose.addEventListener('click', () => this.closeShopDialog());
        
        // Buy buttons
        const buyButtons = document.querySelectorAll('.buy-btn');
        buyButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const chipType = event.target.getAttribute('data-chip');
                this.gameManager.buyChip(chipType);
            });
        });
        
        // Help
        this.helpBtn.addEventListener('click', () => this.showTutorial());
        this.tutorialNext.addEventListener('click', () => this.nextTutorialStep());
        
        // Share
        this.shareBtn.addEventListener('click', () => this.shareGame());
        
        // Quantum chip buttons
        document.getElementById('hadamard-chip').addEventListener('click', () => this.useHadamardChip());
        document.getElementById('schrodinger-chip').addEventListener('click', () => this.useSchrodingerChip());
        document.getElementById('entanglement-chip').addEventListener('click', () => this.useEntanglementChip());
        
        // Close dialogs when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.betDialog) {
                this.closeBetDialog();
            } else if (event.target === this.shopDialog) {
                this.closeShopDialog();
            }
        });
        
        // Set up event listeners for new UI elements
        this.hitButton.addEventListener('click', () => this.onHitClick());
        this.standButton.addEventListener('click', () => this.onStandClick());
        this.superpositionButton.addEventListener('click', () => this.onSuperpositionClick());
        this.entanglementButton.addEventListener('click', () => this.onEntanglementClick());
        this.measureButton.addEventListener('click', () => this.onMeasureClick());
        this.newGameButton.addEventListener('click', () => this.onNewGameClick());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Set initial button states
        this.updateButtonStates();
        
        // Add neon glow effect to buttons on hover
        this.addButtonEffects();
    }

    updateMoney(money) {
        this.moneyDisplay.textContent = `Money: $${money}`;
    }

    updateBet(bet) {
        this.betDisplay.textContent = `Bet: $${bet}`;
    }

    updateHandValue(value) {
        this.handValueDisplay.textContent = `Hand: ${value}`;
    }

    updateChips(chips) {
        this.hadamardChipDisplay.textContent = chips.hadamard;
        this.schrodingerChipDisplay.textContent = chips.schrodinger;
        this.entanglementChipDisplay.textContent = chips.entanglement;
    }

    updateGameState(state) {
        // Update UI based on game state
        switch (state) {
            case GameState.IDLE:
                this.betBtn.disabled = false;
                this.hitBtn.disabled = true;
                this.standBtn.disabled = true;
                this.resetBtn.disabled = true;
                break;
                
            case GameState.BETTING:
                this.betBtn.disabled = false;
                this.hitBtn.disabled = true;
                this.standBtn.disabled = true;
                this.resetBtn.disabled = true;
                break;
                
            case GameState.PLAYER_TURN:
                this.betBtn.disabled = true;
                this.hitBtn.disabled = false;
                this.standBtn.disabled = false;
                this.resetBtn.disabled = true;
                break;
                
            case GameState.DEALER_TURN:
                this.betBtn.disabled = true;
                this.hitBtn.disabled = true;
                this.standBtn.disabled = true;
                this.resetBtn.disabled = true;
                break;
                
            case GameState.RESOLVING:
                this.betBtn.disabled = true;
                this.hitBtn.disabled = true;
                this.standBtn.disabled = true;
                this.resetBtn.disabled = true;
                break;
                
            case GameState.GAME_OVER:
                this.betBtn.disabled = true;
                this.hitBtn.disabled = true;
                this.standBtn.disabled = true;
                this.resetBtn.disabled = false;
                break;
        }
    }

    openBetDialog() {
        // Set initial bet amount to minimum of (100, player's money)
        const initialBet = Math.min(100, this.gameManager.money);
        this.betAmount.textContent = initialBet;
        
        // Show dialog
        this.betDialog.style.display = 'block';
    }

    closeBetDialog() {
        this.betDialog.style.display = 'none';
    }

    adjustBetAmount(delta) {
        let amount = parseInt(this.betAmount.textContent);
        amount += delta;
        
        // Constrain amount
        amount = Math.max(10, Math.min(amount, this.gameManager.money));
        
        this.betAmount.textContent = amount;
    }

    confirmBet() {
        const bet = parseInt(this.betAmount.textContent);
        this.gameManager.placeBet(bet);
        this.closeBetDialog();
    }

    openShopDialog() {
        this.shopDialog.style.display = 'block';
    }

    closeShopDialog() {
        this.shopDialog.style.display = 'none';
    }

    showNotification(message) {
        // Set message
        this.notification.textContent = message;
        
        // Show notification
        this.notification.classList.remove('hidden');
        
        // Hide after a delay
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 5000);
    }

    useHadamardChip() {
        if (this.gameManager.gameState === GameState.PLAYER_TURN) {
            if (this.gameManager.chips.hadamard > 0) {
                if (!this.gameManager.selectedCard) {
                    this.showNotification('Select a card first to use the Hadamard chip.');
                } else {
                    this.gameManager.useHadamardChip();
                }
            } else {
                this.showNotification('No Hadamard chips left. Buy more in the shop!');
            }
        }
    }

    useSchrodingerChip() {
        if (this.gameManager.gameState === GameState.PLAYER_TURN) {
            if (this.gameManager.chips.schrodinger > 0) {
                if (!this.gameManager.selectedCard) {
                    this.showNotification('Select a card first to use the Schrödinger chip.');
                } else {
                    this.gameManager.useSchrodingerChip();
                }
            } else {
                this.showNotification('No Schrödinger chips left. Buy more in the shop!');
            }
        }
    }

    useEntanglementChip() {
        if (this.gameManager.gameState === GameState.PLAYER_TURN) {
            if (this.gameManager.chips.entanglement > 0) {
                if (!this.gameManager.selectedCard) {
                    this.showNotification('Select a card first to use the Entanglement chip.');
                } else if (this.gameManager.cardForEntanglement) {
                    // Cancel in-progress entanglement
                    this.gameManager.cancelEntanglement();
                } else {
                    this.gameManager.startEntanglement();
                }
            } else {
                this.showNotification('No Entanglement chips left. Buy more in the shop!');
            }
        }
    }

    // Tutorial management
    tutorialSteps = [
        {
            title: 'Welcome to Quantum Black Jack!',
            content: `
                <p>In this game, you'll be playing a quantum twist on the classic Blackjack card game. 
                The goal is still to beat the dealer without going over 21, but with some quantum mechanics mixed in!</p>
                <p>This tutorial will guide you through the basics of the game.</p>
            `
        },
        {
            title: 'Basic Rules',
            content: `
                <p>The basic rules of Blackjack still apply:</p>
                <ul>
                    <li>Cards 2-10 are worth their face value</li>
                    <li>Face cards (Jack, Queen, King) are worth 10</li>
                    <li>Aces are worth 11 or 1, whichever is more favorable</li>
                    <li>Your goal is to get closer to 21 than the dealer without going over</li>
                </ul>
            `
        },
        {
            title: 'Quantum Cards',
            content: `
                <p>In Quantum Black Jack, each card can exist in a <strong>superposition</strong> of two possible states!</p>
                <p>A card in superposition (glowing cyan) is not just one card, but exists as two cards simultaneously until measured.</p>
                <p>When the hand ends, all cards in superposition will "collapse" to a single state.</p>
            `
        },
        {
            title: 'Quantum Chips',
            content: `
                <p>You can manipulate cards using three types of quantum chips:</p>
                <ul>
                    <li><strong>Hadamard (H)</strong>: Put a card into superposition, so it exists in two states at once</li>
                    <li><strong>Schrödinger (S)</strong>: Force a card in superposition to collapse to a single state</li>
                    <li><strong>Entanglement (E)</strong>: Link two cards in superposition so they collapse to matching colors</li>
                </ul>
                <p>Use these chips strategically to improve your chances of winning!</p>
            `
        },
        {
            title: 'How to Play',
            content: `
                <p>1. Place your bet</p>
                <p>2. Use quantum chips strategically on your cards</p>
                <p>3. Hit to draw more cards or Stand to end your turn</p>
                <p>4. When you stand, all your superposed cards will collapse and the dealer will play</p>
                <p>5. The hand closest to 21 without going over wins!</p>
            `
        },
        {
            title: 'Ready to Play?',
            content: `
                <p>You start with 3 of each quantum chip and $1000.</p>
                <p>You can buy more chips in the shop as you win money.</p>
                <p>Good luck, and may quantum uncertainty be in your favor!</p>
            `
        }
    ];

    currentTutorialStep = 0;

    showTutorial() {
        this.currentTutorialStep = 0;
        this.updateTutorialContent();
        this.tutorialDialog.style.display = 'block';
    }

    nextTutorialStep() {
        this.currentTutorialStep++;
        
        if (this.currentTutorialStep >= this.tutorialSteps.length) {
            // End of tutorial
            this.tutorialDialog.style.display = 'none';
            this.currentTutorialStep = 0;
        } else {
            this.updateTutorialContent();
        }
    }

    updateTutorialContent() {
        const step = this.tutorialSteps[this.currentTutorialStep];
        
        // Update tutorial dialog title
        this.tutorialDialog.querySelector('h2').textContent = step.title;
        
        // Update content
        this.tutorialContent.innerHTML = step.content;
        
        // Update button text for last step
        if (this.currentTutorialStep === this.tutorialSteps.length - 1) {
            this.tutorialNext.textContent = 'Start Playing';
        } else {
            this.tutorialNext.textContent = 'Next';
        }
    }

    shareGame() {
        // Create share text
        const shareText = `I'm playing Quantum Black Jack! Currently have $${this.gameManager.money}. Can you beat my score?`;
        
        // Try to use the Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'Quantum Black Jack',
                text: shareText,
                url: window.location.href
            }).catch(error => {
                console.log('Error sharing:', error);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        // Fallback to copying to clipboard
        const textArea = document.createElement('textarea');
        textArea.value = text + ' ' + window.location.href;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Share text copied to clipboard!');
        } catch (err) {
            this.showNotification('Failed to copy share text.');
        }
        
        document.body.removeChild(textArea);
    }

    addButtonEffects() {
        const buttons = document.querySelectorAll('.button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseover', () => {
                this.soundManager.playProceduralSound('hover', 0.1);
            });
            
            button.addEventListener('click', () => {
                this.soundManager.playProceduralSound('click', 0.2);
            });
        });
    }

    toggleSound() {
        this.soundManager.toggleMute();
        
        // Update icon
        if (this.soundManager.soundEnabled) {
            this.soundIcon.textContent = '🔊';
        } else {
            this.soundIcon.textContent = '��';
        }
    }

    updateLoadingProgress(progress) {
        // Update loading bar width
        this.loadingBar.style.width = `${progress}%`;
        this.loadingText.textContent = `Loading assets: ${Math.round(progress)}%`;
        
        // If loading is complete, hide loading screen after a short delay
        if (progress >= 100) {
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.uiContainer.style.display = 'flex';
                this.statusDisplay.style.display = 'block';
                
                // Start background music when loading is complete
                this.soundManager.startBackgroundMusic();
                
                // Show tutorial
                this.showTutorial();
            }, 500);
        }
    }

    updateHandValues(playerValue, dealerValue) {
        this.playerValueElement.textContent = playerValue;
        this.dealerValueElement.textContent = dealerValue;
    }
    
    updateQuantumCounts(superpositionCount, entanglementCount) {
        this.superpositionCountElement.textContent = superpositionCount;
        this.entanglementCountElement.textContent = entanglementCount;
    }
    
    showWin() {
        this.resultMessage.textContent = 'YOU WIN';
        this.resultMessage.className = 'result-message win-message';
        this.resultOverlay.classList.add('show');
        
        // Play win sound
        this.soundManager.playWinSound();
        
        setTimeout(() => {
            this.resultOverlay.classList.remove('show');
        }, 3000);
    }
    
    showLose() {
        this.resultMessage.textContent = 'YOU LOSE';
        this.resultMessage.className = 'result-message lose-message';
        this.resultOverlay.classList.add('show');
        
        // Play lose sound
        this.soundManager.playLoseSound();
        
        setTimeout(() => {
            this.resultOverlay.classList.remove('show');
        }, 3000);
    }
    
    showTie() {
        this.resultMessage.textContent = 'TIE GAME';
        this.resultMessage.className = 'result-message win-message';
        this.resultOverlay.classList.add('show');
        
        // Play tie sound
        this.soundManager.playCardPlaceSound();
        
        setTimeout(() => {
            this.resultOverlay.classList.remove('show');
        }, 3000);
    }
} 