import * as THREE from 'three';

export class SoundManager {
    constructor(assetLoader) {
        this.assetLoader = assetLoader;
        this.sounds = {};
        this.soundEnabled = true;
        
        // Create audio listener
        this.listener = new THREE.AudioListener();
        
        // Volume settings
        this.masterVolume = 0.7;
        this.sfxVolume = 1.0;
        this.musicVolume = 0.5;
        
        // Categories
        this.sfx = {};
        this.music = {};
        
        this.initSounds();
    }

    initSounds() {
        // Add listener to camera (will be done when scene manager is available)
    }

    addListenerToCamera(camera) {
        camera.add(this.listener);
    }

    createSound(name, category = 'sfx', loop = false, volume = 1.0) {
        const buffer = this.assetLoader.getSound(name);
        if (!buffer) return null;
        
        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(buffer);
        sound.setLoop(loop);
        
        // Apply volume based on category
        const categoryVolume = category === 'sfx' ? this.sfxVolume : this.musicVolume;
        sound.setVolume(volume * categoryVolume * this.masterVolume);
        
        // Store by category
        if (category === 'sfx') {
            this.sfx[name] = sound;
        } else if (category === 'music') {
            this.music[name] = sound;
        }
        
        // Store all sounds
        this.sounds[name] = {
            sound,
            category,
            baseVolume: volume
        };
        
        return sound;
    }

    play(name, playbackRate = 1.0) {
        if (!this.soundEnabled) return;
        
        if (this.sounds[name]) {
            const soundData = this.sounds[name];
            const sound = soundData.sound;
            
            // If already playing, stop and reset
            if (sound.isPlaying) {
                sound.stop();
            }
            
            // Play the sound with the given playback rate
            sound.setPlaybackRate(playbackRate);
            sound.play();
            return sound;
        } else {
            // Try to create the sound if it doesn't exist yet
            const buffer = this.assetLoader.getSound(name);
            if (buffer) {
                const sound = this.createSound(name);
                if (sound) {
                    sound.setPlaybackRate(playbackRate);
                    sound.play();
                    return sound;
                }
            }
        }
        
        console.warn(`Sound ${name} not found or failed to play.`);
        return null;
    }

    stop(name) {
        if (this.sounds[name] && this.sounds[name].sound.isPlaying) {
            this.sounds[name].sound.stop();
        }
    }

    stopAll() {
        for (const name in this.sounds) {
            if (this.sounds[name].sound.isPlaying) {
                this.sounds[name].sound.stop();
            }
        }
    }

    stopCategory(category) {
        const sounds = category === 'sfx' ? this.sfx : this.music;
        for (const name in sounds) {
            if (sounds[name].isPlaying) {
                sounds[name].stop();
            }
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateCategoryVolume('sfx');
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateCategoryVolume('music');
    }

    updateAllVolumes() {
        for (const name in this.sounds) {
            const soundData = this.sounds[name];
            const categoryVolume = soundData.category === 'sfx' ? this.sfxVolume : this.musicVolume;
            soundData.sound.setVolume(soundData.baseVolume * categoryVolume * this.masterVolume);
        }
    }

    updateCategoryVolume(category) {
        const sounds = category === 'sfx' ? this.sfx : this.music;
        const categoryVolume = category === 'sfx' ? this.sfxVolume : this.musicVolume;
        
        for (const name in sounds) {
            const soundData = this.sounds[name];
            soundData.sound.setVolume(soundData.baseVolume * categoryVolume * this.masterVolume);
        }
    }

    toggleMute() {
        this.soundEnabled = !this.soundEnabled;
        
        if (!this.soundEnabled) {
            this.stopAll();
        }
        
        return this.soundEnabled;
    }

    playSuperpositionSound() {
        return this.play('superposition', 1.0);
    }

    playEntanglementSound() {
        return this.play('entanglement', 1.0);
    }

    playCollapseSound() {
        return this.play('collapse', 1.0);
    }

    playCardPlace() {
        return this.play('cardPlace', 1.0 + (Math.random() * 0.2 - 0.1));
    }

    playCardFlip() {
        return this.play('cardFlip', 1.0 + (Math.random() * 0.2 - 0.1));
    }

    playWinSound() {
        return this.play('win', 1.0);
    }

    playLoseSound() {
        return this.play('lose', 1.0);
    }
} 