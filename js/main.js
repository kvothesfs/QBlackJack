import { SceneManager } from './utils/SceneManager.js';
import { UIManager } from './ui/UIManager.js';
import { GameManager } from './quantum/GameManager.js';
import { SoundManager } from './utils/SoundManager.js';
import { TutorialManager } from './ui/TutorialManager.js';
import { AssetLoader } from './utils/AssetLoader.js';

// Main entry point for the application
class QuantumBlackJack {
    constructor() {
        this.init();
    }

    async init() {
        // Show loading screen
        this.showLoadingScreen();

        // Set up asset loader and load assets
        this.assetLoader = new AssetLoader();
        await this.loadAssets();

        // Set up game components
        this.setupComponents();

        // Set up event listeners
        this.setupEventListeners();

        // Hide loading screen and show tutorial
        this.hideLoadingScreen();
        this.tutorialManager.showTutorial();
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';
    }

    updateLoadingProgress(progress) {
        const progressBar = document.querySelector('.progress');
        progressBar.style.width = `${progress}%`;
    }

    async loadAssets() {
        // Register all assets to load
        this.assetLoader.registerTextures([
            { name: 'cardBack', path: 'assets/textures/card-back.jpg' },
            { name: 'table', path: 'assets/textures/table.jpg' },
            { name: 'chip', path: 'assets/textures/chip.png' }
        ]);
        
        // Register card textures
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        suits.forEach(suit => {
            values.forEach(value => {
                this.assetLoader.registerTexture({
                    name: `card_${value}_of_${suit}`,
                    path: `assets/textures/cards/${value}_of_${suit}.png`
                });
            });
        });
        
        // Register sounds
        this.assetLoader.registerSounds([
            { name: 'cardPlace', path: 'assets/sounds/card-place.mp3' },
            { name: 'cardFlip', path: 'assets/sounds/card-flip.mp3' },
            { name: 'win', path: 'assets/sounds/win.mp3' },
            { name: 'lose', path: 'assets/sounds/lose.mp3' },
            { name: 'superposition', path: 'assets/sounds/superposition.mp3' },
            { name: 'entanglement', path: 'assets/sounds/entanglement.mp3' },
            { name: 'collapse', path: 'assets/sounds/collapse.mp3' }
        ]);

        // Load all assets with progress tracking
        return new Promise((resolve) => {
            this.assetLoader.loadAll((progress) => {
                this.updateLoadingProgress(progress);
                if (progress === 100) {
                    resolve();
                }
            });
        });
    }

    setupComponents() {
        // Initialize scene and render loop
        this.sceneManager = new SceneManager(document.getElementById('canvas-container'));
        
        // Initialize sound manager
        this.soundManager = new SoundManager(this.assetLoader);
        
        // Initialize game manager
        this.gameManager = new GameManager(this.sceneManager, this.soundManager, this.assetLoader);
        
        // Initialize UI manager
        this.uiManager = new UIManager(this.gameManager);
        
        // Initialize tutorial manager
        this.tutorialManager = new TutorialManager();
        
        // Start render loop
        this.sceneManager.startRenderLoop(() => this.update());
    }

    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', () => {
            this.sceneManager.onWindowResize();
        });
        
        // Connect UI manager to game manager events
        this.gameManager.on('moneyChanged', (money) => {
            this.uiManager.updateMoney(money);
        });
        
        this.gameManager.on('betChanged', (bet) => {
            this.uiManager.updateBet(bet);
        });
        
        this.gameManager.on('handValueChanged', (value) => {
            this.uiManager.updateHandValue(value);
        });
        
        this.gameManager.on('chipsChanged', (chipCounts) => {
            this.uiManager.updateChips(chipCounts);
        });
        
        this.gameManager.on('gameStateChanged', (state) => {
            this.uiManager.updateGameState(state);
        });
        
        this.gameManager.on('notification', (message) => {
            this.uiManager.showNotification(message);
        });
    }

    update() {
        // Update game state
        this.gameManager.update();
    }
}

// Create and initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumBlackJack();
}); 