import { GameState } from '../quantum/GameManager.js';

export class UIManager {
    constructor(gameManager, soundManager) {
        this.gameManager = gameManager;
        this.soundManager = soundManager;
        
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
        this.soundIcon = this.soundToggle ? this.soundToggle.querySelector('.sound-icon') : null;
        
        // UI Container
        this.uiContainer = document.getElementById('ui-container');
        
        // Loading screen
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        
        // Tutorial dialog
        this.tutorialOverlay = document.getElementById('tutorial-overlay');
        this.tutorialContent = document.getElementById('tutorial-content');
        this.tutorialNextBtn = document.getElementById('tutorial-next-btn');
        
        // Initialize UI
        this.initUI();
    }
    
    initUI() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Add visual effects to buttons
        this.addButtonEffects();
    }
    
    setupEventListeners() {
        // Game action buttons
        if (this.hitButton) {
            this.hitButton.addEventListener('click', () => this.onHitClick());
        }
        
        if (this.standButton) {
            this.standButton.addEventListener('click', () => this.onStandClick());
        }
        
        if (this.superpositionButton) {
            this.superpositionButton.addEventListener('click', () => this.onSuperpositionClick());
        }
        
        if (this.entanglementButton) {
            this.entanglementButton.addEventListener('click', () => this.onEntanglementClick());
        }
        
        if (this.measureButton) {
            this.measureButton.addEventListener('click', () => this.onMeasureClick());
        }
        
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', () => this.onNewGameClick());
        }
        
        // Sound toggle
        if (this.soundToggle) {
            this.soundToggle.addEventListener('click', () => this.toggleSound());
        }
        
        // Tutorial next button
        if (this.tutorialNextBtn) {
            this.tutorialNextBtn.addEventListener('click', () => this.nextTutorialStep());
        }
    }
    
    // Click handlers
    onHitClick() {
        if (this.gameManager) {
            this.gameManager.playerHit();
        }
    }
    
    onStandClick() {
        if (this.gameManager) {
            this.gameManager.playerStand();
        }
    }
    
    onSuperpositionClick() {
        if (this.gameManager) {
            this.gameManager.applySuperposition();
        }
    }
    
    onEntanglementClick() {
        if (this.gameManager) {
            this.gameManager.applyEntanglement();
        }
    }
    
    onMeasureClick() {
        if (this.gameManager) {
            this.gameManager.measureCard();
        }
    }
    
    onNewGameClick() {
        if (this.gameManager) {
            this.gameManager.startNewGame();
        }
    }
    
    // ... Keep the existing methods ...
    
    addButtonEffects() {
        const buttons = document.querySelectorAll('.button');
        
        buttons.forEach(button => {
            button.addEventListener('mouseover', () => {
                if (this.soundManager) {
                    this.soundManager.playProceduralSound('hover', 0.1);
                }
            });
            
            button.addEventListener('click', () => {
                if (this.soundManager) {
                    this.soundManager.playProceduralSound('click', 0.2);
                }
            });
        });
    }
    
    toggleSound() {
        if (this.soundManager) {
            this.soundManager.toggleMute();
            
            // Update icon
            if (this.soundIcon) {
                if (this.soundManager.soundEnabled) {
                    this.soundIcon.textContent = '🔊';
                } else {
                    this.soundIcon.textContent = '🔇';
                }
            }
        }
    }
    
    updateLoadingProgress(progress) {
        // Update loading bar width
        if (this.loadingBar) {
            this.loadingBar.style.width = `${progress}%`;
        }
        
        // Update loading text
        if (this.loadingText) {
            this.loadingText.textContent = `Loading assets: ${Math.round(progress)}%`;
        }
        
        // If loading is complete, hide loading screen after a short delay
        if (progress >= 100) {
            setTimeout(() => {
                if (this.loadingScreen) {
                    this.loadingScreen.style.display = 'none';
                }
                
                if (this.uiContainer) {
                    this.uiContainer.style.display = 'flex';
                }
                
                if (this.statusDisplay) {
                    this.statusDisplay.style.display = 'block';
                }
                
                // Start background music when loading is complete
                if (this.soundManager) {
                    this.soundManager.startBackgroundMusic();
                }
                
                // Show tutorial
                this.showTutorial();
            }, 500);
        }
    }
    
    updateHandValues(playerValue, dealerValue) {
        if (this.playerValueElement) {
            this.playerValueElement.textContent = playerValue;
        }
        
        if (this.dealerValueElement) {
            this.dealerValueElement.textContent = dealerValue;
        }
    }
    
    updateQuantumCounts(superpositionCount, entanglementCount) {
        if (this.superpositionCountElement) {
            this.superpositionCountElement.textContent = superpositionCount;
        }
        
        if (this.entanglementCountElement) {
            this.entanglementCountElement.textContent = entanglementCount;
        }
    }
    
    showWin() {
        if (this.resultMessage) {
            this.resultMessage.textContent = 'YOU WIN';
            this.resultMessage.className = 'result-message win-message';
        }
        
        if (this.resultOverlay) {
            this.resultOverlay.classList.add('show');
        }
        
        // Play win sound
        if (this.soundManager) {
            this.soundManager.playWinSound();
        }
        
        setTimeout(() => {
            if (this.resultOverlay) {
                this.resultOverlay.classList.remove('show');
            }
        }, 3000);
    }
    
    showLose() {
        if (this.resultMessage) {
            this.resultMessage.textContent = 'YOU LOSE';
            this.resultMessage.className = 'result-message lose-message';
        }
        
        if (this.resultOverlay) {
            this.resultOverlay.classList.add('show');
        }
        
        // Play lose sound
        if (this.soundManager) {
            this.soundManager.playLoseSound();
        }
        
        setTimeout(() => {
            if (this.resultOverlay) {
                this.resultOverlay.classList.remove('show');
            }
        }, 3000);
    }
    
    showTie() {
        if (this.resultMessage) {
            this.resultMessage.textContent = 'TIE GAME';
            this.resultMessage.className = 'result-message win-message';
        }
        
        if (this.resultOverlay) {
            this.resultOverlay.classList.add('show');
        }
        
        // Play tie sound
        if (this.soundManager) {
            this.soundManager.playCardPlaceSound();
        }
        
        setTimeout(() => {
            if (this.resultOverlay) {
                this.resultOverlay.classList.remove('show');
            }
        }, 3000);
    }
    
    // Tutorial methods
    tutorialSteps = [
        {
            title: "Welcome to Quantum Black Jack!",
            content: "This is a twist on traditional Black Jack that incorporates quantum mechanics. Get ready for an experience that's both familiar and mind-bending!"
        },
        {
            title: "Traditional Rules",
            content: "The goal is still to get as close to 21 as possible without going over. Face cards are worth 10, Aces are 11 or 1."
        },
        {
            title: "Quantum Twist: Superposition",
            content: "Cards can exist in superposition, meaning they're multiple values at once until measured. Use the Superposition button to put a card in this state."
        },
        {
            title: "Quantum Twist: Entanglement",
            content: "Two cards in superposition can be entangled. When one is measured, the other will be affected in a correlated way. Use the Entangle button to link two superposed cards."
        },
        {
            title: "Quantum Twist: Measurement",
            content: "When you're ready to collapse a card's superposition, use the Measure button. This will randomly determine which value it actually has."
        },
        {
            title: "Ready to Play?",
            content: "Click the New Game button to start. Good luck!"
        }
    ];
    
    currentTutorialStep = 0;
    
    showTutorial() {
        if (this.tutorialOverlay) {
            this.tutorialOverlay.style.display = 'flex';
            this.updateTutorialContent();
        }
    }
    
    nextTutorialStep() {
        this.currentTutorialStep++;
        
        if (this.currentTutorialStep >= this.tutorialSteps.length) {
            // End of tutorial
            if (this.tutorialOverlay) {
                this.tutorialOverlay.style.display = 'none';
            }
            this.currentTutorialStep = 0;
        } else {
            this.updateTutorialContent();
        }
    }
    
    updateTutorialContent() {
        const step = this.tutorialSteps[this.currentTutorialStep];
        
        // Update tutorial title and content
        const tutorialTitle = this.tutorialOverlay ? 
            this.tutorialOverlay.querySelector('.tutorial-title') : null;
        
        if (tutorialTitle) {
            tutorialTitle.textContent = step.title;
        }
        
        if (this.tutorialContent) {
            this.tutorialContent.textContent = step.content;
        }
        
        // Update button text for last step
        if (this.tutorialNextBtn) {
            this.tutorialNextBtn.textContent = 
                this.currentTutorialStep === this.tutorialSteps.length - 1 ? 
                'Start Playing' : 'Next';
        }
    }
} 