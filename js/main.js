import { SceneManager } from './utils/SceneManager.js';
import { UIManager } from './ui/UIManager.js';
import { GameManager } from './quantum/GameManager.js';
import { SoundManager } from './utils/SoundManager.js';
import { TutorialManager } from './ui/TutorialManager.js';
import { AssetLoader } from './utils/AssetLoader.js';

// Main game class
class QuantumBlackJack {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.assetLoader = new AssetLoader();
        
        // Game state
        this.isInitialized = false;
        
        // Performance monitoring
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
        
        // Initialize the game
        this.init();
    }
    
    async init() {
        // Set up asset loader and load assets
        await this.loadAssets();
        
        // Set up managers
        this.soundManager = new SoundManager();
        this.sceneManager = new SceneManager(this.canvas, this.assetLoader);
        this.gameManager = new GameManager(this.sceneManager, this.assetLoader, this.soundManager);
        this.uiManager = new UIManager(this.gameManager, this.soundManager);
        this.tutorialManager = new TutorialManager(this.uiManager);
        
        // Connect managers
        this.gameManager.setUIManager(this.uiManager);
        
        // Start the render loop
        this.isInitialized = true;
        this.animate();
        
        // Start game music
        this.soundManager.startBackgroundMusic();
        
        // Set up event listeners for resize and visibility changes
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    }
    
    async loadAssets() {
        return new Promise((resolve) => {
            // Generate procedural assets instead of loading physical ones
            this.assetLoader.generateProceduralAssets();
            
            // Simulate loading progress for a better user experience
            let progress = 0;
            const uiManager = document.getElementById('loading-bar');
            const loadingText = document.getElementById('loading-text');
            
            const interval = setInterval(() => {
                progress += 5;
                
                // Update loading bar
                if (uiManager) {
                    uiManager.style.width = `${progress}%`;
                }
                
                // Update loading text
                if (loadingText) {
                    loadingText.textContent = `Loading assets: ${progress}%`;
                }
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(resolve, 500); // Add a small delay after reaching 100%
                }
            }, 100);
        });
    }
    
    animate(currentTime) {
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
    }
    
    onWindowResize() {
        if (this.sceneManager) {
            this.sceneManager.resize(window.innerWidth, window.innerHeight);
        }
    }
    
    onVisibilityChange() {
        // Pause audio when tab is not visible
        if (document.hidden && this.soundManager) {
            this.soundManager.pauseAll();
        } else if (this.soundManager) {
            this.soundManager.resumeAll();
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new QuantumBlackJack();
}); 