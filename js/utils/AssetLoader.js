import * as THREE from 'three';

export class AssetLoader {
    constructor() {
        this.textures = {};
        this.sounds = {};
        this.models = {};
        this.toLoad = 0;
        this.loaded = 0;
        
        // Create loaders
        this.textureLoader = new THREE.TextureLoader();
        this.audioLoader = new THREE.AudioLoader();
    }

    registerTexture(textureData) {
        this.toLoad++;
        if (!Array.isArray(textureData)) {
            textureData = [textureData];
        }
        
        textureData.forEach(data => {
            if (!this.textures[data.name]) {
                this.textures[data.name] = { 
                    path: data.path,
                    loaded: false,
                    texture: null
                };
            }
        });
    }

    registerTextures(texturesArray) {
        this.registerTexture(texturesArray);
    }

    registerSound(soundData) {
        this.toLoad++;
        if (!Array.isArray(soundData)) {
            soundData = [soundData];
        }
        
        soundData.forEach(data => {
            if (!this.sounds[data.name]) {
                this.sounds[data.name] = {
                    path: data.path,
                    loaded: false,
                    buffer: null
                };
            }
        });
    }

    registerSounds(soundsArray) {
        this.registerSound(soundsArray);
    }

    loadAll(progressCallback) {
        // If no assets registered, generate procedural ones
        if (this.toLoad === 0) {
            this.generateProceduralAssets();
        }
        
        // Load all registered textures
        for (const name in this.textures) {
            const textureData = this.textures[name];
            if (!textureData.loaded) {
                if (textureData.path.startsWith('procedural://')) {
                    // This is a procedural texture already generated
                    this.loaded++;
                    this.updateProgress(progressCallback);
                } else {
                    this.textureLoader.load(
                        textureData.path,
                        (texture) => {
                            textureData.texture = texture;
                            textureData.loaded = true;
                            this.loaded++;
                            this.updateProgress(progressCallback);
                        },
                        undefined,
                        (error) => {
                            console.error(`Error loading texture ${name}:`, error);
                            // Generate a procedural fallback
                            textureData.texture = this.generateProceduralCardTexture(name);
                            textureData.loaded = true;
                            this.loaded++;
                            this.updateProgress(progressCallback);
                        }
                    );
                }
            }
        }
        
        // Load all registered sounds
        for (const name in this.sounds) {
            const soundData = this.sounds[name];
            if (!soundData.loaded) {
                if (soundData.path.startsWith('procedural://')) {
                    // Handle procedural audio (using oscillator nodes when played)
                    soundData.loaded = true;
                    this.loaded++;
                    this.updateProgress(progressCallback);
                } else {
                    this.audioLoader.load(
                        soundData.path,
                        (buffer) => {
                            soundData.buffer = buffer;
                            soundData.loaded = true;
                            this.loaded++;
                            this.updateProgress(progressCallback);
                        },
                        undefined,
                        (error) => {
                            console.error(`Error loading sound ${name}:`, error);
                            soundData.loaded = true; // Mark as loaded even if error
                            this.loaded++;
                            this.updateProgress(progressCallback);
                        }
                    );
                }
            }
        }
        
        // If there's nothing to load, call the callback immediately
        if (this.toLoad === 0) {
            if (progressCallback) {
                progressCallback(100);
            }
        }
    }

    generateProceduralAssets() {
        // Generate card textures procedurally
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        
        // Register card back texture
        this.textures['cardBack'] = {
            path: 'procedural://cardBack',
            loaded: true,
            texture: this.generateCardBackTexture()
        };

        // Register table texture
        this.textures['table'] = {
            path: 'procedural://table',
            loaded: true,
            texture: this.generateTableTexture()
        };

        // Register chip texture
        this.textures['chip'] = {
            path: 'procedural://chip',
            loaded: true,
            texture: this.generateChipTexture()
        };
        
        // Register card textures
        for (const suit of suits) {
            for (const value of values) {
                const name = `card_${value}_of_${suit}`;
                this.textures[name] = {
                    path: `procedural://${name}`,
                    loaded: true,
                    texture: this.generateProceduralCardTexture(name)
                };
                this.toLoad++; // Increment toLoad to match each card
                this.loaded++; // And loaded too since we're generating them immediately
            }
        }
        
        // Register procedural sounds
        const soundTypes = [
            'cardPlace', 'cardFlip', 'win', 'lose', 
            'superposition', 'entanglement', 'collapse'
        ];
        
        for (const type of soundTypes) {
            this.sounds[type] = {
                path: `procedural://${type}`,
                loaded: true,
                buffer: null // Will use Web Audio API for procedural sounds
            };
            this.toLoad++;
            this.loaded++;
        }
    }

    generateCardBackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Fill with gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#4B0082'); // Indigo
        gradient.addColorStop(0.5, '#9400D3'); // Violet
        gradient.addColorStop(1, '#00CED1'); // Turquoise
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        const gridSize = 40;
        
        // Horizontal grid lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Add retro sun
        ctx.fillStyle = '#FF6AD5'; // Neon pink
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00FFFF'; // Cyan
        ctx.fillText('QUANTUM', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('BLACKJACK', canvas.width / 2, canvas.height / 2 + 60);
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    generateTableTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Fill with dark green base
        ctx.fillStyle = '#0D4B26';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'; // Subtle cyan grid
        ctx.lineWidth = 1;
        const gridSize = 64;
        
        // Horizontal and vertical grid lines
        for (let i = 0; i < canvas.width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Add some retro-futuristic circles
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 50 + Math.random() * 150;
            
            ctx.strokeStyle = `rgba(255, 105, 180, ${0.05 + Math.random() * 0.1})`; // Pink
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    generateChipTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Draw chip circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 2 - 4;
        
        // Gradient fill
        const gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.5,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, '#FF6AD5'); // Pink
        gradient.addColorStop(0.7, '#8A2BE2'); // Purple
        gradient.addColorStop(1, '#00CED1'); // Turquoise
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 16; i++) {
            const angle = (i * Math.PI) / 8;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.stroke();
        }
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    generateProceduralCardTexture(cardName) {
        // Parse card name to get value and suit
        const match = cardName.match(/card_(.+)_of_(.+)/);
        if (!match) return this.generateCardBackTexture();
        
        const value = match[1];
        const suit = match[2];
        
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Fill with gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#000000'); // Black
        gradient.addColorStop(1, '#222222'); // Dark gray
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid pattern for vaporwave aesthetic
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'; // Subtle cyan grid
        ctx.lineWidth = 1;
        const gridSize = 32;
        
        // Horizontal and vertical grid lines
        for (let i = 0; i < canvas.width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Draw card border
        ctx.strokeStyle = '#FF6AD5'; // Neon pink border
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Set color based on suit
        let color;
        let symbol;
        
        switch (suit) {
            case 'hearts':
                color = '#FF6AD5'; // Neon pink
                symbol = '♥';
                break;
            case 'diamonds':
                color = '#FF6AD5'; // Neon pink
                symbol = '♦';
                break;
            case 'clubs':
                color = '#00FFFF'; // Cyan
                symbol = '♣';
                break;
            case 'spades':
                color = '#00FFFF'; // Cyan
                symbol = '♠';
                break;
            default:
                color = '#FFFFFF';
                symbol = '?';
        }
        
        // Draw card value
        ctx.font = 'bold 120px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        
        // Format the display value (10, J, Q, K, A)
        let displayValue = value;
        if (value === 'jack') displayValue = 'J';
        if (value === 'queen') displayValue = 'Q';
        if (value === 'king') displayValue = 'K';
        if (value === 'ace') displayValue = 'A';
        
        // Draw the value in the corners
        ctx.font = 'bold 70px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(displayValue, 40, 80);
        ctx.fillText(symbol, 40, 150);
        
        // Bottom right (upside down)
        ctx.save();
        ctx.translate(canvas.width - 40, canvas.height - 80);
        ctx.rotate(Math.PI);
        ctx.textAlign = 'right';
        ctx.fillText(displayValue, 0, 0);
        ctx.fillText(symbol, 0, 70);
        ctx.restore();
        
        // Draw big center symbol
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(symbol, canvas.width / 2, canvas.height / 2 + 50);
        
        // Add a glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        ctx.fillText(symbol, canvas.width / 2, canvas.height / 2 + 50);
        
        // Create texture from canvas
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    updateProgress(progressCallback) {
        if (progressCallback) {
            const progress = Math.min(Math.round((this.loaded / this.toLoad) * 100), 100);
            progressCallback(progress);
        }
    }

    getTexture(name) {
        if (this.textures[name] && this.textures[name].loaded) {
            return this.textures[name].texture;
        }
        console.warn(`Texture ${name} not found or not loaded.`);
        return null;
    }

    getSound(name) {
        if (this.sounds[name] && this.sounds[name].loaded) {
            return this.sounds[name].buffer;
        }
        
        // If not found, check if we need to generate a procedural sound
        if (!this.sounds[name]) {
            // Automatically register a procedural sound if not found
            this.sounds[name] = {
                path: `procedural://${name}`,
                loaded: true,
                buffer: null // Will use Web Audio API for procedural sounds
            };
            this.toLoad++;
            this.loaded++;
            
            console.log(`Registered procedural sound: ${name}`);
            return null; // Return null to indicate it's a procedural sound
        }
        
        console.warn(`Sound ${name} found but not loaded.`);
        return null;
    }

    isLoaded() {
        return this.loaded === this.toLoad;
    }

    getLoadingProgress() {
        if (this.toLoad === 0) return 100;
        return Math.min(Math.round((this.loaded / this.toLoad) * 100), 100);
    }
} 