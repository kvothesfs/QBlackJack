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
        camera.add(this.listener);
        
        // Start background music
        this.startBackgroundMusic();
    }

    createSound(name, category = 'sfx', loop = false, volume = 1.0) {
        const buffer = this.assetLoader.getSound(name);
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
            const buffer = this.assetLoader.getSound(name);
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
        return this.playProceduralSound('cardPlace', 1.0 + (Math.random() * 0.2 - 0.1));
    }

    playCardFlip() {
        return this.playProceduralSound('cardFlip', 1.0 + (Math.random() * 0.2 - 0.1));
    }

    playWinSound() {
        return this.playProceduralSound('win');
    }

    playLoseSound() {
        return this.playProceduralSound('lose');
    }
} 