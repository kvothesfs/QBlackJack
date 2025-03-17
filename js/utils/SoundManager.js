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
        
        // Audio context (for procedural sounds)
        this.audioContext = this.listener.context;
        
        // Background music
        this.backgroundMusic = null;
        
        this.initSounds();
    }

    initSounds() {
        // Add listener to camera (will be done when scene manager is available)
    }

    addListenerToCamera(camera) {
        if (camera && this.listener) {
            camera.add(this.listener);
            
            // Start background music
            this.startBackgroundMusic();
        } else {
            console.error("Cannot add listener to camera: Camera or listener is undefined");
        }
    }

    getSound(name) {
        // Check if the assetLoader exists and has the getSound method
        if (this.assetLoader && typeof this.assetLoader.getSound === 'function') {
            return this.assetLoader.getSound(name);
        }
        // Return null if assetLoader doesn't exist or doesn't have getSound
        return null;
    }

    createSound(name, category = 'sfx', loop = false, volume = 1.0) {
        const buffer = this.getSound(name);
        if (buffer) {
            // Use loaded sound buffer
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
        } else {
            // Create a procedural sound
            return this.createProceduralSound(name, category, loop, volume);
        }
    }

    createProceduralSound(name, category = 'sfx', loop = false, volume = 1.0) {
        const sound = new THREE.Audio(this.listener);
        
        // Apply volume based on category
        const categoryVolume = category === 'sfx' ? this.sfxVolume : this.musicVolume;
        sound.setVolume(volume * categoryVolume * this.masterVolume);
        
        // Store by category
        if (category === 'sfx') {
            this.sfx[name] = sound;
        } else if (category === 'music') {
            this.music[name] = sound;
        }
        
        // Store in all sounds
        this.sounds[name] = {
            sound,
            category,
            baseVolume: volume,
            procedural: true
        };
        
        return sound;
    }

    startBackgroundMusic() {
        // Make sure audio context is running
        this.resumeAudioContext();
        
        // Create vaporwave style background music
        const musicSound = new THREE.Audio(this.listener);
        
        // Create audio source
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const oscillator3 = this.audioContext.createOscillator();
        
        // Set oscillator types
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        oscillator3.type = 'triangle';
        
        // Set frequencies for synth chord (vaporwave style)
        oscillator1.frequency.value = 220; // A3
        oscillator2.frequency.value = 277.18; // C#4
        oscillator3.frequency.value = 329.63; // E4
        
        // Create gain nodes
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        const masterGain = this.audioContext.createGain();
        
        // Set volumes
        gain1.gain.value = 0.15;
        gain2.gain.value = 0.15;
        gain3.gain.value = 0.10;
        masterGain.gain.value = 0.2 * this.musicVolume * this.masterVolume;
        
        // Connect oscillators to gain nodes
        oscillator1.connect(gain1);
        oscillator2.connect(gain2);
        oscillator3.connect(gain3);
        
        // Connect gain nodes to master gain
        gain1.connect(masterGain);
        gain2.connect(masterGain);
        gain3.connect(masterGain);
        
        // Connect master gain to audio destination
        masterGain.connect(this.audioContext.destination);
        
        // Start oscillators
        oscillator1.start();
        oscillator2.start();
        oscillator3.start();
        
        // Add LFO for slow pulsing effect
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow modulation
        
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.1;
        
        lfo.connect(lfoGain);
        lfoGain.connect(masterGain.gain);
        lfo.start();
        
        // Store references
        this.backgroundMusic = {
            oscillators: [oscillator1, oscillator2, oscillator3, lfo],
            gains: [gain1, gain2, gain3, lfoGain, masterGain]
        };
        
        // Schedule chord changes
        this.scheduleChordChanges();
    }

    scheduleChordChanges() {
        // Change chords every 10 seconds
        setInterval(() => {
            if (!this.soundEnabled || !this.backgroundMusic) return;
            
            const chords = [
                // A minor (A, C, E)
                [220, 261.63, 329.63],
                // F major (F, A, C)
                [174.61, 220, 261.63],
                // C major (C, E, G)
                [261.63, 329.63, 392],
                // G major (G, B, D)
                [196, 246.94, 293.66]
            ];
            
            const randomChord = chords[Math.floor(Math.random() * chords.length)];
            
            // Smoothly transition to new frequencies
            const [osc1, osc2, osc3] = this.backgroundMusic.oscillators;
            
            osc1.frequency.setTargetAtTime(randomChord[0], this.audioContext.currentTime, 1);
            osc2.frequency.setTargetAtTime(randomChord[1], this.audioContext.currentTime, 1);
            osc3.frequency.setTargetAtTime(randomChord[2], this.audioContext.currentTime, 1);
            
        }, 10000);
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            // Stop oscillators
            this.backgroundMusic.oscillators.forEach(osc => {
                osc.stop();
            });
            
            // Disconnect gains
            this.backgroundMusic.gains.forEach(gain => {
                gain.disconnect();
            });
            
            this.backgroundMusic = null;
        }
    }

    play(name, playbackRate = 1.0) {
        if (!this.soundEnabled) return;
        
        if (this.sounds[name]) {
            const soundData = this.sounds[name];
            
            // For procedural sounds, generate them on the fly
            if (soundData.procedural) {
                return this.playProceduralSound(name, playbackRate);
            }
            
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
            const buffer = this.getSound(name);
            if (buffer) {
                const sound = this.createSound(name);
                if (sound) {
                    sound.setPlaybackRate(playbackRate);
                    sound.play();
                    return sound;
                }
            } else {
                // Create and play procedural sound
                return this.playProceduralSound(name, playbackRate);
            }
        }
        
        console.warn(`Sound ${name} not found or failed to play.`);
        return null;
    }

    playProceduralSound(name, playbackRate = 1.0) {
        // Configure sound based on type
        switch (name) {
            case 'cardPlace':
                return this.playCardPlaceSound(playbackRate);
            case 'cardFlip':
                return this.playCardFlipSound(playbackRate);
            case 'win':
                return this.playWinSound();
            case 'lose':
                return this.playLoseSound();
            case 'superposition':
                return this.playSuperpositionSound();
            case 'entanglement':
                return this.playEntanglementSound();
            case 'collapse':
                return this.playCollapseSound();
            default:
                console.warn(`No procedural sound defined for ${name}`);
                return null;
        }
    }
    
    playTone(frequency, duration, type = 'sine', volume = 0.5, fadeDuration = 0.1) {
        if (!this.soundEnabled) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = 0;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        // Fade in
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + fadeDuration);
        
        // Fade out
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration + 0.1); // Add a little extra time for the fade out
        
        return {
            oscillator,
            gainNode,
            endTime: now + duration
        };
    }

    playSweep(startFreq, endFreq, duration, type = 'sine', volume = 0.5) {
        if (!this.soundEnabled) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = startFreq;
        
        gainNode.gain.value = volume;
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        // Frequency sweep
        oscillator.frequency.linearRampToValueAtTime(endFreq, now + duration);
        
        // Amplitude envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + duration * 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration + 0.1);
        
        return {
            oscillator,
            gainNode,
            endTime: now + duration
        };
    }

    playNoise(duration, volume = 0.5) {
        if (!this.soundEnabled) return null;
        
        // Create buffer for white noise
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Fill with random values
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume;
        
        noise.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        // Amplitude envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + duration * 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        noise.start(now);
        
        return {
            source: noise,
            gainNode,
            endTime: now + duration
        };
    }

    playCardPlaceSound(playbackRate = 1.0) {
        // Vaporwave aesthetic card place sound
        const duration = 0.2 / playbackRate;
        const volume = 0.3 * this.sfxVolume * this.masterVolume;
        
        // Play two tones with slight delay
        this.playTone(880, duration, 'sine', volume * 0.7, duration * 0.5);
        
        return this.playTone(440, duration * 1.5, 'sine', volume, duration * 0.5);
    }

    playCardFlipSound(playbackRate = 1.0) {
        // Vaporwave aesthetic card flip sound
        const duration = 0.3 / playbackRate;
        const volume = 0.3 * this.sfxVolume * this.masterVolume;
        
        // Sweep from high to low frequency
        return this.playSweep(1200, 300, duration, 'sine', volume);
    }

    playSuperpositionSound() {
        // Vaporwave aesthetic superposition sound
        const volume = 0.4 * this.sfxVolume * this.masterVolume;
        
        // Ethereal rising chord
        this.playTone(440, 0.5, 'sine', volume * 0.7);
        this.playTone(554.37, 0.6, 'sine', volume * 0.5, 0.1);
        return this.playTone(659.25, 0.7, 'sine', volume * 0.3, 0.2);
    }

    playEntanglementSound() {
        // Vaporwave aesthetic entanglement sound
        const volume = 0.4 * this.sfxVolume * this.masterVolume;
        
        // Two tones that converge
        this.playSweep(300, 440, 0.5, 'sine', volume * 0.5);
        return this.playSweep(600, 440, 0.5, 'sine', volume * 0.5);
    }

    playCollapseSound() {
        // Vaporwave aesthetic collapse sound
        const volume = 0.4 * this.sfxVolume * this.masterVolume;
        
        // Descending tones with noise
        this.playSweep(880, 220, 0.4, 'sine', volume * 0.6);
        this.playNoise(0.3, volume * 0.2);
        
        return this.playTone(220, 0.5, 'square', volume * 0.3, 0.05);
    }

    playWinSound() {
        // Vaporwave aesthetic win sound
        const volume = 0.5 * this.sfxVolume * this.masterVolume;
        
        // Rising arpeggio
        this.playTone(440, 0.2, 'sine', volume * 0.7);
        setTimeout(() => this.playTone(554.37, 0.2, 'sine', volume * 0.8), 150);
        setTimeout(() => this.playTone(659.25, 0.2, 'sine', volume * 0.9), 300);
        setTimeout(() => this.playTone(880, 0.4, 'sine', volume), 450);
        
        return { isPlaying: true };
    }

    playLoseSound() {
        // Vaporwave aesthetic lose sound
        const volume = 0.5 * this.sfxVolume * this.masterVolume;
        
        // Descending tones
        this.playTone(440, 0.2, 'sine', volume * 0.7);
        setTimeout(() => this.playTone(415.3, 0.2, 'sine', volume * 0.8), 150);
        setTimeout(() => this.playTone(392, 0.2, 'sine', volume * 0.9), 300);
        setTimeout(() => this.playTone(349.23, 0.4, 'sine', volume), 450);
        
        return { isPlaying: true };
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
        
        // Update background music volume if playing
        if (this.backgroundMusic) {
            const masterGain = this.backgroundMusic.gains[4]; // Last gain is master
            masterGain.gain.value = 0.2 * this.musicVolume * this.masterVolume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateCategoryVolume('sfx');
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateCategoryVolume('music');
        
        // Update background music volume if playing
        if (this.backgroundMusic) {
            const masterGain = this.backgroundMusic.gains[4]; // Last gain is master
            masterGain.gain.value = 0.2 * this.musicVolume * this.masterVolume;
        }
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
            
            // Silence background music without stopping it
            if (this.backgroundMusic) {
                const masterGain = this.backgroundMusic.gains[4]; // Last gain is master
                masterGain.gain.value = 0;
            }
        } else {
            // Restore background music volume
            if (this.backgroundMusic) {
                const masterGain = this.backgroundMusic.gains[4]; // Last gain is master
                masterGain.gain.value = 0.2 * this.musicVolume * this.masterVolume;
            }
        }
        
        return this.soundEnabled;
    }
    
    // Compatibility methods with the original interface
    playSuperpositionSound() {
        return this.playProceduralSound('superposition');
    }

    playEntanglementSound() {
        return this.playProceduralSound('entanglement');
    }

    playCollapseSound() {
        return this.playProceduralSound('collapse');
    }

    playCardPlace() {
        return this.playProceduralSound('cardPlace', 1.0);
    }

    playCardFlip() {
        return this.playProceduralSound('cardFlip', 1.0);
    }

    playWinSound() {
        return this.playProceduralSound('win', 1.0);
    }

    playLoseSound() {
        return this.playProceduralSound('lose', 1.0);
    }

    // Add these missing methods that might be called elsewhere in the code
    
    pauseAll() {
        // Pause all sounds
        Object.values(this.sounds).forEach(soundData => {
            if (soundData.sound && soundData.sound.isPlaying) {
                soundData.sound.pause();
            }
        });
        
        // Pause background music
        if (this.backgroundMusic) {
            // Store current volumes before pausing
            this.backgroundMusic.gains.forEach(gain => {
                gain._pausedValue = gain.gain.value;
                gain.gain.value = 0;
            });
        }
    }
    
    resumeAll() {
        // Resume all sounds
        Object.values(this.sounds).forEach(soundData => {
            // Don't automatically resume all sounds, only the background music
        });
        
        // Resume background music
        if (this.backgroundMusic) {
            // Restore volumes
            this.backgroundMusic.gains.forEach(gain => {
                if (gain._pausedValue !== undefined) {
                    gain.gain.value = gain._pausedValue;
                    delete gain._pausedValue;
                }
            });
        }
    }
    
    // Update this method to safely play procedural sounds
    playProceduralSound(type, volume = 0.5) {
        try {
            if (!this.soundEnabled) return null;
            
            // Create oscillator and gain nodes
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Connect oscillator to gain node and gain node to destination
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Set volume
            gainNode.gain.value = volume * this.masterVolume;
            
            // Set sound parameters based on type
            switch (type) {
                case 'cardPlace':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 300;
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                    break;
                    
                case 'cardFlip':
                    oscillator.type = 'triangle';
                    oscillator.frequency.value = 500;
                    gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(volume * this.masterVolume, this.audioContext.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                    break;
                    
                case 'win':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.4);
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.6);
                    break;
                    
                case 'lose':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
                    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.4);
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.6);
                    break;
                    
                case 'superposition':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.1);
                    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.4);
                    break;
                    
                case 'entanglement':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                    break;
                    
                case 'collapse':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                    break;
                    
                case 'hover':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(volume * this.masterVolume * 0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                    break;
                    
                case 'click':
                    oscillator.type = 'square';
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(volume * this.masterVolume * 0.3, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                    break;
                    
                default:
                    // Default simple beep
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 500;
                    gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.2);
            }
            
            return { oscillator, gainNode };
        } catch (error) {
            console.error("Error playing procedural sound:", error);
            return null;
        }
    }
    
    toggleMute() {
        this.soundEnabled = !this.soundEnabled;
        
        if (!this.soundEnabled) {
            // Mute all sounds
            this.pauseAll();
        } else {
            // Unmute and resume background music
            this.resumeAll();
        }
        
        return this.soundEnabled;
    }

    resumeAudioContext() {
        // Resume the audio context after user interaction
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                console.log("Resuming audio context...");
                this.audioContext.resume().then(() => {
                    console.log("Audio context resumed successfully!");
                }).catch(error => {
                    console.error("Failed to resume audio context:", error);
                });
            } catch (error) {
                console.error("Error resuming audio context:", error);
            }
        }
    }
} 