import { SceneManager } from './utils/SceneManager.js';
import { UIManager } from './ui/UIManager.js';
import { GameManager } from './quantum/GameManager.js';
import { SoundManager } from './utils/SoundManager.js';
import { TutorialManager } from './ui/TutorialManager.js';
import { AssetLoader } from './utils/AssetLoader.js';

// Main game class
class QuantumBlackJack {
    constructor() {
        try {
            console.log("Initializing Quantum Black Jack game...");
            this.canvas = document.getElementById('game-canvas');
            if (!this.canvas) {
                console.error("Canvas element not found!");
            }
            
            this.assetLoader = new AssetLoader();
            console.log("AssetLoader created successfully");
            
            // Game state
            this.isInitialized = false;
            
            // Performance monitoring
            this.lastFrameTime = 0;
            this.frameCount = 0;
            this.lastFpsUpdate = 0;
            this.fps = 0;
            
            // Initialize the game
            this.init();
        } catch (error) {
            console.error("Error in constructor:", error);
            this.showErrorMessage("Failed to initialize game: " + error.message);
        }
    }
    
    async init() {
        try {
            console.log("Starting game initialization...");
            
            // Set up asset loader and load assets
            await this.loadAssets();
            console.log("Assets loaded successfully");
            
            // Generate procedural assets
            console.log("Generating procedural assets...");
            this.assetLoader.generateProceduralAssets();
            console.log("Procedural assets generated");
            
            // Set up managers
            console.log("Setting up managers...");
            this.soundManager = new SoundManager(this.assetLoader);
            
            console.log("Creating SceneManager with canvas and assetLoader");
            this.sceneManager = new SceneManager(this.canvas, this.assetLoader);
            
            console.log("Creating GameManager");
            this.gameManager = new GameManager(this.sceneManager, this.soundManager, this.assetLoader);
            
            console.log("Creating UIManager");
            this.uiManager = new UIManager(this.gameManager, this.soundManager);
            
            console.log("Creating TutorialManager");
            this.tutorialManager = new TutorialManager(this.uiManager);
            
            // Connect managers
            this.gameManager.setUIManager(this.uiManager);
            
            // Start the render loop
            this.isInitialized = true;
            this.animate();
            
            // Don't start background music until user interaction
            // this.soundManager.startBackgroundMusic();
            
            // Set up event listeners for resize and visibility changes
            window.addEventListener('resize', () => this.onWindowResize());
            document.addEventListener('visibilitychange', () => this.onVisibilityChange());
            
            console.log("Game initialization complete");
        } catch (error) {
            console.error("Error in init:", error);
            this.showErrorMessage("Failed to initialize game: " + error.message);
        }
    }
    
    async loadAssets() {
        return new Promise((resolve) => {
            try {
                console.log("Starting asset loading process...");
                
                // Simulate loading progress for a better user experience
                let progress = 0;
                const loadingBar = document.getElementById('loading-bar');
                const loadingText = document.getElementById('loading-text');
                const startButton = document.getElementById('start-game-btn');
                
                if (!loadingBar) {
                    console.warn("Loading bar element not found");
                }
                
                if (!loadingText) {
                    console.warn("Loading text element not found");
                }
                
                const interval = setInterval(() => {
                    progress += 5;
                    
                    // Update loading bar
                    if (loadingBar) {
                        loadingBar.style.width = `${progress}%`;
                    }
                    
                    // Update loading text
                    if (loadingText) {
                        loadingText.textContent = `Loading assets: ${progress}%`;
                    }
                    
                    // If the UIManager is initialized, use it to update loading progress
                    if (this.uiManager) {
                        this.uiManager.updateLoadingProgress(progress);
                    }
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        console.log("Loading progress complete");
                        
                        // Show the start button directly
                        if (loadingText) {
                            loadingText.textContent = 'Loading complete! Click "START GAME" to begin.';
                        }
                        
                        if (startButton) {
                            console.log("Displaying start button");
                            startButton.style.display = 'block';
                            startButton.style.margin = '30px auto';
                        } else {
                            console.warn("Start button element not found");
                        }
                        
                        setTimeout(resolve, 500); // Add a small delay after reaching 100%
                    }
                }, 100);
            } catch (error) {
                console.error("Error in loadAssets:", error);
                this.showErrorMessage("Failed to load assets: " + error.message);
                resolve(); // Resolve anyway to prevent hanging
            }
        });
    }
    
    animate(currentTime) {
        try {
            requestAnimationFrame((time) => this.animate(time));
            
            if (!this.isInitialized) return;
            
            // Calculate delta time
            const deltaTime = (currentTime - this.lastFrameTime) / 1000;
            this.lastFrameTime = currentTime;
            
            // Update FPS counter
            this.frameCount++;
            if (currentTime - this.lastFpsUpdate >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastFpsUpdate = currentTime;
            }
            
            // Update scene and game logic
            if (this.sceneManager) {
                this.sceneManager.update(deltaTime);
            }
            
            if (this.gameManager) {
                this.gameManager.update(deltaTime);
            }
        } catch (error) {
            console.error("Error in animation loop:", error);
        }
    }
    
    onWindowResize() {
        try {
            if (this.sceneManager) {
                this.sceneManager.resize(window.innerWidth, window.innerHeight);
            }
        } catch (error) {
            console.error("Error in window resize:", error);
        }
    }
    
    onVisibilityChange() {
        try {
            // Pause audio when tab is not visible
            if (document.hidden && this.soundManager) {
                this.soundManager.pauseAll();
            } else if (this.soundManager) {
                this.soundManager.resumeAll();
            }
        } catch (error) {
            console.error("Error in visibility change:", error);
        }
    }
    
    showErrorMessage(message) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = 'red';
        } else {
            alert(message);
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log("DOM loaded, creating game instance");
        const game = new QuantumBlackJack();
    } catch (error) {
        console.error("Failed to create game:", error);
        alert("Failed to start game: " + error.message);
    }
}); 