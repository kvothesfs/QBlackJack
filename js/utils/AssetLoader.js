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
        // Load all registered textures
        for (const name in this.textures) {
            const textureData = this.textures[name];
            if (!textureData.loaded) {
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
                        this.loaded++; // Count as loaded even if error
                        this.updateProgress(progressCallback);
                    }
                );
            }
        }
        
        // Load all registered sounds
        for (const name in this.sounds) {
            const soundData = this.sounds[name];
            if (!soundData.loaded) {
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
                        this.loaded++; // Count as loaded even if error
                        this.updateProgress(progressCallback);
                    }
                );
            }
        }
        
        // If there's nothing to load, call the callback immediately
        if (this.toLoad === 0) {
            if (progressCallback) {
                progressCallback(100);
            }
        }
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
        console.warn(`Sound ${name} not found or not loaded.`);
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