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
            this.gameManager = new GameManager();
            
            console.log("Creating UIManager");
            this.uiManager = new UIManager(this.gameManager);
            
            // Initialize SceneManager first, as it's a dependency for the game
            console.log("Initializing SceneManager...");
            const sceneInitialized = await this.sceneManager.initialize();
            
            if (!sceneInitialized) {
                throw new Error("Failed to initialize SceneManager");
            }
            
            // Initialize GameManager with required dependencies
            console.log("Initializing GameManager with dependencies...");
            const gameInitialized = this.gameManager.initialize(this.sceneManager, this.assetLoader, this.uiManager);
            
            if (!gameInitialized) {
                throw new Error("Failed to initialize GameManager");
            }
            
            // Connect managers
            this.gameManager.setUIManager(this.uiManager);
            
            // Start the render loop
            this.isInitialized = true;
            this.animate();
            
            // Set up event listeners for resize and visibility changes
            window.addEventListener('resize', () => this.onWindowResize());
            document.addEventListener('visibilitychange', () => this.onVisibilityChange());
            
            // Enable game selection buttons after initialization
            console.log("Enabling game selection buttons...");
            this.uiManager.enableGameSelection();
            
            console.log("Game initialization complete!");
            
            // Update loading text to indicate completion with vaporwave style
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.textContent = "Quantum initialization complete!";
                loadingText.style.color = "#00ffff";
                loadingText.style.textShadow = "0 0 10px #ff00ff";
            }
            
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
                const gameSelection = document.getElementById('game-selection');
                
                // Initially hide game selection
                if (gameSelection) {
                    gameSelection.style.display = 'none';
                }
                
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
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        console.log("Loading progress complete");
                        
                        // Show the start button
                        if (loadingText) {
                            loadingText.textContent = 'Loading complete! Click "START GAME" to begin.';
                        }
                        
                        if (startButton) {
                            console.log("Displaying start button");
                            startButton.style.display = 'block';
                            startButton.style.margin = '30px auto';
                            
                            // Add click handler for start button
                            startButton.onclick = () => {
                                // Hide loading screen
                                document.getElementById('loading-screen').style.display = 'none';
                                // Show game selection
                                if (gameSelection) {
                                    gameSelection.style.display = 'flex';
                                }
                            };
                        } else {
                            console.warn("Start button element not found");
                        }
                        
                        setTimeout(resolve, 500);
                    }
                }, 100);
            } catch (error) {
                console.error("Error in loadAssets:", error);
                this.showErrorMessage("Failed to load assets: " + error.message);
                resolve();
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

// Main initialization and loading handling
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("DOM loaded, starting game initialization");
        
        // Create loading screen if it doesn't exist
        ensureLoadingScreenExists();
        
        // Global error handler for uncaught errors
        window.addEventListener('error', (event) => {
            console.error("Global error caught:", event.error);
            showErrorMessage("An error occurred: " + event.error.message);
        });

        // Create game instance - store in global variable for access
        window.qbjGame = new QuantumBlackJack();
        console.log("QuantumBlackJack instance created");
        
        // Set up start button click handler - needed after loading is complete
        setupStartButton();
        
    } catch (error) {
        console.error("Failed to initialize game:", error);
        showErrorMessage("Failed to start game: " + error.message);
    }
});

// Helper functions for cleaner initialization
function ensureLoadingScreenExists() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) {
        console.warn("Loading screen element not found, creating dynamically");
        
        // Create loading screen dynamically if not present
        const newLoadingScreen = document.createElement('div');
        newLoadingScreen.id = 'loading-screen';
        newLoadingScreen.innerHTML = `
            <div id="loading-content">
                <h1>Quantum Card Games</h1>
                <div id="loading-bar-container">
                    <div id="loading-bar"></div>
                </div>
                <div id="loading-text">Loading assets...</div>
                <button id="start-game-btn" style="display:none;">START GAME</button>
            </div>
        `;
        document.body.appendChild(newLoadingScreen);
    }
}

function setupStartButton() {
    const startButton = document.getElementById('start-game-btn');
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("Start button clicked");
            
            // Hide loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
            
            // Show game selection
            const gameSelection = document.querySelector('.game-selection');
            if (gameSelection) {
                console.log("Showing game selection");
                gameSelection.style.display = 'flex';
            } else {
                console.error("Game selection element not found");
                showErrorMessage("Game selection screen not found. Please refresh the page.");
            }
        });
    } else {
        console.error("Start button not found");
    }
}

function showErrorMessage(message) {
    // Display error in the loading screen's text element
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = message;
        loadingText.style.color = 'red';
    } else {
        // Fallback to alert if loading text element not found
        alert(message);
    }
} 