import * as THREE from 'three';

export class SoundManager {
    constructor(assetLoader) {
        this.assetLoader = assetLoader;
        this.sounds = {};
        this.soundEnabled = true;
        
        // Create audio listener but don't initialize the audio context yet
        this.listener = null;
        this.audioContext = null;
        
        // Volume settings
        this.masterVolume = 0.7;
        this.sfxVolume = 1.0;
        this.musicVolume = 0.5;
        
        // Categories
        this.sfx = {};
        this.music = {};
        
        // Background music
        this.backgroundMusic = null;
        
        // Flag to track if audio has been initialized
        this.isAudioInitialized = false;
        
        this.initSounds();
    }

    initSounds() {
        // Create sound effects and music
        this.createSound('cardPlace', 'sfx', false, 0.5);
        this.createSound('cardFlip', 'sfx', false, 0.6);
        this.createSound('win', 'sfx', false, 0.8);
        this.createSound('lose', 'sfx', false, 0.7);
        this.createSound('bet', 'sfx', false, 0.5);
        this.createSound('menu', 'sfx', false, 0.6);
        this.createSound('start', 'sfx', false, 0.7);
        this.createSound('superposition', 'sfx', false, 0.8);
        this.createSound('entanglement', 'sfx', false, 0.9);
        this.createSound('collapse', 'sfx', false, 0.8);
    }

    addListenerToCamera(camera) {
        // Create audio listener if it doesn't exist
        if (!this.listener) {
            this.listener = new THREE.AudioListener();
            this.audioContext = this.listener.context;
            
            // Add listener to camera
            camera.add(this.listener);
            
            // Initialize all sounds now that audio context exists
            this.initializeAudio();
        }
    }
    
    initializeAudio() {
        if (this.isAudioInitialized) return;
        
        // Create sounds with audio context
        this.createProceduralSound('cardPlace', 'sfx', false, 0.5);
        this.createProceduralSound('cardFlip', 'sfx', false, 0.6);
        this.createProceduralSound('win', 'sfx', false, 0.8);
        this.createProceduralSound('lose', 'sfx', false, 0.7);
        this.createProceduralSound('bet', 'sfx', false, 0.5);
        this.createProceduralSound('menu', 'sfx', false, 0.6);
        this.createProceduralSound('start', 'sfx', false, 0.7);
        this.createProceduralSound('superposition', 'sfx', false, 0.8);
        this.createProceduralSound('entanglement', 'sfx', false, 0.9);
        this.createProceduralSound('collapse', 'sfx', false, 0.8);
        
        // Start background music
        this.startBackgroundMusic();
        
        this.isAudioInitialized = true;
    }

    getSound(name) {
        if (this.sounds[name]) {
            return this.sounds[name];
        }
        
        console.error(`Sound '${name}' not found`);
        return null;
    }

    createSound(name, category = 'sfx', loop = false, volume = 1.0) {
        // Create empty placeholder for now (actual sound will be created in initializeAudio)
        this.sounds[name] = {
            name: name,
            category: category,
            loop: loop,
            volume: volume,
            audio: null
        };
        
        // Add to category
        if (category === 'sfx') {
            this.sfx[name] = this.sounds[name];
        } else if (category === 'music') {
            this.music[name] = this.sounds[name];
        }
    }

    createProceduralSound(name, category = 'sfx', loop = false, volume = 1.0) {
        if (!this.listener || !this.audioContext) {
            console.error("Cannot create sound - AudioListener not initialized");
            return;
        }
        
        // Get sound if it exists
        const sound = this.getSound(name);
        if (!sound) return;
        
        // Create audio object
        const audio = new THREE.Audio(this.listener);
        sound.audio = audio;
        
        // Setup sound based on type
        switch (name) {
            case 'cardPlace':
                this.createCardPlaceSound(audio, volume);
                break;
            case 'cardFlip':
                this.createCardFlipSound(audio, volume);
                break;
            case 'win':
                this.createWinSound(audio, volume);
                break;
            case 'lose':
                this.createLoseSound(audio, volume);
                break;
            case 'bet':
                this.createBetSound(audio, volume);
                break;
            case 'menu':
                this.createMenuSound(audio, volume);
                break;
            case 'start':
                this.createStartSound(audio, volume);
                break;
            case 'superposition':
                this.createSuperpositionSound(audio, volume);
                break;
            case 'entanglement':
                this.createEntanglementSound(audio, volume);
                break;
            case 'collapse':
                this.createCollapseSound(audio, volume);
                break;
            default:
                // Generic sound
                this.createGenericSound(audio, volume);
                break;
        }
    }
    
    // Procedural sound generators
    createCardPlaceSound(audio, volume = 0.5) {
        const buffer = this.createSoundBuffer(0.3);
        const data = buffer.getChannelData(0);
        
        // Quick attack, fast decay
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            // Quick thump followed by short decay
            if (t < 0.01) {
                data[i] = Math.sin(2 * Math.PI * 100 * t) * (1 - t / 0.01) * 0.8;
            } else if (t < 0.1) {
                data[i] = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-(t - 0.01) * 20) * 0.3;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createCardFlipSound(audio, volume = 0.5) {
        const buffer = this.createSoundBuffer(0.4);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            // Swoosh sound
            if (t < 0.2) {
                // Frequency sweep from high to low
                const freq = 2000 - t * 4000;
                data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 10) * (1 - t / 0.2) * 0.5;
            } else if (t < 0.4) {
                // Soft snap at the end
                const snap = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-(t - 0.2) * 30) * 0.8;
                data[i] = snap;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createWinSound(audio, volume = 0.7) {
        const buffer = this.createSoundBuffer(1.0);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 1.0) {
                // Ascending chime sound
                const chord = 
                    Math.sin(2 * Math.PI * 440 * t) * 0.3 +
                    Math.sin(2 * Math.PI * 554 * t) * 0.3 +
                    Math.sin(2 * Math.PI * 659 * t) * 0.3;
                
                // Apply envelope
                const env = Math.min(1, t * 10) * Math.exp(-t * 2);
                
                // Add vibrato for vaporwave feel
                const vibrato = Math.sin(2 * Math.PI * 6 * t) * 0.1;
                
                data[i] = chord * env * (1 + vibrato);
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createLoseSound(audio, volume = 0.7) {
        const buffer = this.createSoundBuffer(1.0);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 1.0) {
                // Descending sad sound
                const chord = 
                    Math.sin(2 * Math.PI * (400 - t * 100) * t) * 0.3 +
                    Math.sin(2 * Math.PI * (500 - t * 150) * t) * 0.2;
                
                // Apply envelope
                const env = Math.min(1, t * 10) * Math.exp(-t * 3);
                
                data[i] = chord * env;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createBetSound(audio, volume = 0.5) {
        const buffer = this.createSoundBuffer(0.3);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 0.3) {
                // Coins sound
                const clink1 = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-(t) * 30) * 0.5;
                const clink2 = Math.sin(2 * Math.PI * 800 * (t - 0.1)) * Math.exp(-(t - 0.1) * 30) * (t > 0.1 ? 0.7 : 0);
                
                data[i] = clink1 + clink2;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createMenuSound(audio, volume = 0.6) {
        const buffer = this.createSoundBuffer(0.3);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 0.3) {
                // Menu beep with vaporwave feel
                const beep = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 10);
                
                // Add reverb
                const reverb = Math.sin(2 * Math.PI * 880 * (t - 0.05)) * Math.exp(-(t - 0.05) * 15) * (t > 0.05 ? 0.3 : 0);
                
                data[i] = (beep + reverb) * 0.7;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createStartSound(audio, volume = 0.7) {
        const buffer = this.createSoundBuffer(0.5);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 0.5) {
                // Game start sound with vaporwave aesthetic
                const chord = 
                    Math.sin(2 * Math.PI * 523.25 * t) * 0.3 + // C
                    Math.sin(2 * Math.PI * 659.26 * t) * 0.3 + // E
                    Math.sin(2 * Math.PI * 783.99 * t) * 0.3;  // G
                
                // Apply envelope with slow attack and decay
                const env = (t < 0.1 ? t / 0.1 : 1) * Math.exp(-(t - 0.1) * 3);
                
                // Add vibrato for vaporwave feel
                const vibrato = Math.sin(2 * Math.PI * 5 * t) * 0.1;
                
                data[i] = chord * env * (1 + vibrato);
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createSuperpositionSound(audio, volume = 0.8) {
        const buffer = this.createSoundBuffer(0.8);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 0.8) {
                // Quantum superposition sound - ethereal and shimmering
                // Using frequency beats to create a quantum-like interference pattern
                const f1 = 440 + Math.sin(2 * Math.PI * 0.5 * t) * 20;
                const f2 = 443 + Math.sin(2 * Math.PI * 0.7 * t) * 20;
                
                const wave1 = Math.sin(2 * Math.PI * f1 * t);
                const wave2 = Math.sin(2 * Math.PI * f2 * t);
                
                // Higher frequency shimmer
                const shimmer = Math.sin(2 * Math.PI * 1200 * t) * Math.sin(2 * Math.PI * 3 * t) * 0.3;
                
                // Envelope
                const env = Math.min(1, t * 5) * Math.exp(-t * 2);
                
                data[i] = (wave1 + wave2 + shimmer) * env * 0.3;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createEntanglementSound(audio, volume = 0.8) {
        const buffer = this.createSoundBuffer(1.0);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 1.0) {
                // Quantum entanglement sound - two frequencies that intertwine
                const f1 = 300 + Math.sin(2 * Math.PI * t) * 50;
                const f2 = 600 + Math.sin(2 * Math.PI * t + Math.PI) * 50; // Phase shifted to create interaction
                
                const wave1 = Math.sin(2 * Math.PI * f1 * t) * 0.4;
                const wave2 = Math.sin(2 * Math.PI * f2 * t) * 0.4;
                
                // Create a pulsating interaction between the waves
                const interaction = Math.sin(2 * Math.PI * 3 * t) * 0.2;
                
                // Envelope with slow attack and long decay
                const env = Math.min(1, t * 3) * Math.exp(-t * 1.5);
                
                data[i] = (wave1 + wave2) * (1 + interaction) * env;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createCollapseSound(audio, volume = 0.8) {
        const buffer = this.createSoundBuffer(0.5);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 0.5) {
                // Quantum collapse sound - high frequency descending to a point
                const freq = 2000 - t * 3000; // Rapid decline in frequency
                
                const wave = Math.sin(2 * Math.PI * freq * t) * 0.5;
                
                // Add some noise during collapse
                const noise = (Math.random() * 2 - 1) * Math.exp(-t * 20) * 0.3;
                
                // Snappy envelope
                const env = Math.exp(-t * 8);
                
                data[i] = (wave + noise) * env;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createGenericSound(audio, volume = 0.5) {
        const buffer = this.createSoundBuffer(0.3);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const t = i / buffer.sampleRate;
            
            if (t < 0.3) {
                // Simple beep
                const beep = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 10);
                data[i] = beep * 0.7;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.masterVolume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        audio.setNodeSource(source);
    }
    
    createSoundBuffer(duration = 1.0) {
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        return buffer;
    }

    startBackgroundMusic() {
        // Create ambient vaporwave background music
        if (!this.audioContext) {
            console.error("Cannot start background music - AudioContext not initialized");
            return;
        }
        
        // Create oscillators for chords
        const synthA = this.audioContext.createOscillator();
        const synthB = this.audioContext.createOscillator();
        const synthC = this.audioContext.createOscillator();
        const synthD = this.audioContext.createOscillator();
        
        // Set waveform types
        synthA.type = 'sine';
        synthB.type = 'triangle';
        synthC.type = 'sine';
        synthD.type = 'sawtooth';
        
        // Set initial frequencies for vaporwave chord
        synthA.frequency.value = 261.63; // C4
        synthB.frequency.value = 329.63; // E4
        synthC.frequency.value = 392.00; // G4
        synthD.frequency.value = 130.81; // C3 (bass)
        
        // Create gain nodes for volume control
        const gainA = this.audioContext.createGain();
        const gainB = this.audioContext.createGain();
        const gainC = this.audioContext.createGain();
        const gainD = this.audioContext.createGain();
        
        // Set initial volumes
        gainA.gain.value = 0.15 * this.musicVolume * this.masterVolume;
        gainB.gain.value = 0.12 * this.musicVolume * this.masterVolume;
        gainC.gain.value = 0.10 * this.musicVolume * this.masterVolume;
        gainD.gain.value = 0.20 * this.musicVolume * this.masterVolume;
        
        // Connect oscillators to gain nodes
        synthA.connect(gainA);
        synthB.connect(gainB);
        synthC.connect(gainC);
        synthD.connect(gainD);
        
        // Create reverb for vaporwave feel
        const convolver = this.audioContext.createConvolver();
        const reverbBuffer = this.createReverbBuffer(2, this.audioContext.sampleRate, 3);
        convolver.buffer = reverbBuffer;
        
        // Connect gain nodes to convolver
        gainA.connect(convolver);
        gainB.connect(convolver);
        gainC.connect(convolver);
        gainD.connect(convolver);
        
        // Create master gain for all music
        const masterGain = this.audioContext.createGain();
        masterGain.gain.value = this.musicVolume * this.masterVolume;
        
        // Connect convolver to master gain
        convolver.connect(masterGain);
        
        // Connect master gain to destination
        masterGain.connect(this.audioContext.destination);
        
        // Start oscillators
        synthA.start();
        synthB.start();
        synthC.start();
        synthD.start();
        
        // Store references for later use
        this.backgroundMusic = {
            synths: [synthA, synthB, synthC, synthD],
            gains: [gainA, gainB, gainC, gainD],
            masterGain: masterGain,
            isPlaying: true
        };
        
        // Schedule chord changes
        this.scheduleChordChanges();
    }
    
    createReverbBuffer(duration, sampleRate, decay = 2.0) {
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);
        const dataL = buffer.getChannelData(0);
        const dataR = buffer.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const amplitude = Math.exp(-t * decay);
            
            // Add some randomness for a natural reverb
            dataL[i] = (Math.random() * 2 - 1) * amplitude;
            dataR[i] = (Math.random() * 2 - 1) * amplitude;
        }
        
        return buffer;
    }
    
    scheduleChordChanges() {
        if (!this.backgroundMusic || !this.backgroundMusic.isPlaying) return;
        
        // Define chord progressions for vaporwave
        const chords = [
            // Cmaj7: C E G B
            [261.63, 329.63, 392.00, 493.88, 130.81],
            // Fmaj7: F A C E
            [349.23, 440.00, 523.25, 659.26, 174.61],
            // Dm7: D F A C
            [293.66, 349.23, 440.00, 523.25, 146.83],
            // G7: G B D F
            [392.00, 493.88, 587.33, 698.46, 196.00]
        ];
        
        // Change chords every 8 seconds
        setInterval(() => {
            if (!this.backgroundMusic || !this.backgroundMusic.isPlaying) return;
            
            // Select a random chord
            const chord = chords[Math.floor(Math.random() * chords.length)];
            
            // Change frequencies gradually
            const [synthA, synthB, synthC, synthD] = this.backgroundMusic.synths;
            
            // Use exponential ramps for smooth transitions
            const now = this.audioContext.currentTime;
            synthA.frequency.exponentialRampToValueAtTime(chord[0], now + 2);
            synthB.frequency.exponentialRampToValueAtTime(chord[1], now + 2);
            synthC.frequency.exponentialRampToValueAtTime(chord[2], now + 2);
            synthD.frequency.exponentialRampToValueAtTime(chord[4], now + 2); // Bass note
        }, 8000);
    }

    stopBackgroundMusic() {
        if (!this.backgroundMusic) return;
        
        // Gradually fade out
        if (this.backgroundMusic.masterGain) {
            const now = this.audioContext.currentTime;
            this.backgroundMusic.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
            
            // Stop after fade out
            setTimeout(() => {
                if (this.backgroundMusic.synths) {
                    for (const synth of this.backgroundMusic.synths) {
                        synth.stop();
                    }
                }
                this.backgroundMusic.isPlaying = false;
            }, 1000);
        }
    }

    // Sound playback methods
    playCardPlaceSound(playbackRate = 1.0) {
        this.play('cardPlace', playbackRate);
    }
    
    playCardFlipSound(playbackRate = 1.0) {
        this.play('cardFlip', playbackRate);
    }
    
    playSuperpositionSound() {
        this.play('superposition');
    }
    
    playEntanglementSound() {
        this.play('entanglement');
    }
    
    playCollapseSound() {
        this.play('collapse');
    }
    
    playWinSound() {
        this.play('win');
    }
    
    playLoseSound() {
        this.play('lose');
    }
    
    playBetSound() {
        this.play('bet');
    }
    
    playMenuSound() {
        this.play('menu');
    }
    
    playStartSound() {
        this.play('start');
    }

    play(name, playbackRate = 1.0) {
        if (!this.soundEnabled) return;
        
        const sound = this.getSound(name);
        if (!sound || !sound.audio) {
            // Try to create the sound if it doesn't exist
            this.createProceduralSound(name);
            
            // Try again after creation
            const newSound = this.getSound(name);
            if (!newSound || !newSound.audio) {
                console.error(`Cannot play sound '${name}' - Sound not initialized`);
                return;
            }
            
            // Play the newly created sound
            newSound.audio.setPlaybackRate(playbackRate);
            newSound.audio.play();
            return;
        }
        
        // Recreate the sound for each play
        // This allows multiple instances of the same sound to play simultaneously
        this.createProceduralSound(name, sound.category, sound.loop, sound.volume);
        
        // Play the sound
        sound.audio.setPlaybackRate(playbackRate);
        sound.audio.play();
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
            
            // Initialize audio if needed
            if (!this.isAudioInitialized) {
                this.initAudio();
            }
            
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
        // Initialize audio if not done already
        if (!this.isAudioInitialized) {
            this.initAudio();
        }
        
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

    // Initialize the audio context and listener on user interaction
    initAudio() {
        if (this.isAudioInitialized) return;
        
        console.log("Initializing audio context on user interaction");
        // Create the audio listener and context
        this.listener = new THREE.AudioListener();
        this.audioContext = this.listener.context;
        this.isAudioInitialized = true;
    }
} 