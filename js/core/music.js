// Adaptive Music & Soundtrack System
// Dynamic music that responds to gameplay

export class MusicSystem {
    constructor(game) {
        this.game = game;
        
        // Audio context
        this.audioContext = null;
        this.masterGain = null;
        
        // Current state
        this.currentTrack = null;
        this.currentMood = 'peaceful';
        this.targetMood = 'peaceful';
        this.crossfadeTime = 3; // seconds
        this.crossfadeProgress = 0;
        
        // Volume settings
        this.masterVolume = 0.5;
        this.musicVolume = 0.7;
        this.ambientVolume = 0.4;
        
        // Track layers (for adaptive mixing)
        this.layers = {
            base: null,
            melody: null,
            percussion: null,
            ambient: null
        };
        
        // Mood definitions
        this.moods = {
            peaceful: {
                name: 'Peaceful',
                tempo: 60,
                intensity: 0.2,
                layers: ['base', 'melody'],
                ambientSounds: ['birds', 'wind_soft']
            },
            exploration: {
                name: 'Exploration',
                tempo: 80,
                intensity: 0.4,
                layers: ['base', 'melody', 'ambient'],
                ambientSounds: ['wind', 'footsteps']
            },
            underground: {
                name: 'Underground',
                tempo: 50,
                intensity: 0.3,
                layers: ['base', 'ambient'],
                ambientSounds: ['drips', 'echoes']
            },
            tension: {
                name: 'Tension',
                tempo: 90,
                intensity: 0.6,
                layers: ['base', 'melody', 'percussion'],
                ambientSounds: ['heartbeat']
            },
            combat: {
                name: 'Combat',
                tempo: 140,
                intensity: 1.0,
                layers: ['base', 'melody', 'percussion'],
                ambientSounds: []
            },
            boss: {
                name: 'Boss Fight',
                tempo: 160,
                intensity: 1.0,
                layers: ['base', 'melody', 'percussion'],
                ambientSounds: [],
                special: true
            },
            victory: {
                name: 'Victory',
                tempo: 100,
                intensity: 0.7,
                layers: ['base', 'melody'],
                ambientSounds: ['cheers'],
                duration: 10
            },
            night: {
                name: 'Night',
                tempo: 55,
                intensity: 0.3,
                layers: ['base', 'ambient'],
                ambientSounds: ['crickets', 'owls']
            },
            rain: {
                name: 'Rain',
                tempo: 65,
                intensity: 0.35,
                layers: ['base', 'melody', 'ambient'],
                ambientSounds: ['rain', 'thunder_distant']
            },
            village: {
                name: 'Village',
                tempo: 85,
                intensity: 0.5,
                layers: ['base', 'melody'],
                ambientSounds: ['chatter', 'activity']
            }
        };
        
        // Ambient sound instances
        this.ambientSounds = new Map();
        
        // Combat tracking
        this.combatTimer = 0;
        this.combatCooldown = 5;
        
        // Music enabled flag
        this.enabled = true;
        this.initialized = false;
    }
    
    // Initialize audio system
    async init() {
        if (this.initialized) return;
        
        try {
            // Create audio context on user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;
            
            this.initialized = true;
            console.log('Music system initialized');
            
        } catch (error) {
            console.error('Failed to initialize music system:', error);
        }
    }
    
    // Resume audio context (required after user interaction)
    async resume() {
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    // Set target mood (will crossfade)
    setMood(moodName) {
        if (!this.moods[moodName] || moodName === this.targetMood) return;
        
        this.targetMood = moodName;
        this.crossfadeProgress = 0;
        
        // Start crossfade
        this.startCrossfade();
    }
    
    // Immediately change mood (no crossfade)
    setMoodImmediate(moodName) {
        if (!this.moods[moodName]) return;
        
        this.currentMood = moodName;
        this.targetMood = moodName;
        this.updateAmbientSounds();
    }
    
    // Start crossfade transition
    startCrossfade() {
        // In a real implementation, this would blend audio tracks
        // For now, we simulate the concept
    }
    
    // Update ambient sounds based on mood
    updateAmbientSounds() {
        const mood = this.moods[this.currentMood];
        if (!mood) return;
        
        // Stop sounds not in current mood
        for (const [name, sound] of this.ambientSounds) {
            if (!mood.ambientSounds.includes(name)) {
                this.fadeOutAmbient(name);
            }
        }
        
        // Start sounds for current mood
        for (const soundName of mood.ambientSounds) {
            if (!this.ambientSounds.has(soundName)) {
                this.fadeInAmbient(soundName);
            }
        }
    }
    
    fadeInAmbient(soundName) {
        // Would load and fade in ambient sound
        this.ambientSounds.set(soundName, {
            name: soundName,
            volume: 0,
            targetVolume: this.ambientVolume
        });
    }
    
    fadeOutAmbient(soundName) {
        const sound = this.ambientSounds.get(soundName);
        if (sound) {
            sound.targetVolume = 0;
            // Remove after fade out
            setTimeout(() => {
                this.ambientSounds.delete(soundName);
            }, 2000);
        }
    }
    
    // Trigger combat music
    enterCombat() {
        this.combatTimer = this.combatCooldown;
        
        if (this.currentMood !== 'combat' && this.currentMood !== 'boss') {
            this.setMood('combat');
        }
    }
    
    // Trigger boss music
    enterBossFight() {
        this.setMoodImmediate('boss');
    }
    
    // Exit boss fight
    exitBossFight(victory = false) {
        if (victory) {
            this.setMoodImmediate('victory');
            // Return to peaceful after victory fanfare
            setTimeout(() => {
                if (this.currentMood === 'victory') {
                    this.setMood('peaceful');
                }
            }, 10000);
        } else {
            this.setMood('peaceful');
        }
    }
    
    // Determine appropriate mood based on game state
    determineMood() {
        const player = this.game.player;
        const world = this.game.world;
        
        if (!player || !world) return 'peaceful';
        
        // Boss fight takes priority
        if (this.game.bossHealthBar?.currentBoss) {
            return 'boss';
        }
        
        // Combat
        if (this.combatTimer > 0) {
            return 'combat';
        }
        
        // Check for nearby enemies
        const nearbyEnemies = this.game.entities?.getHostilesInRadius?.(player.x, player.y, 15) || [];
        if (nearbyEnemies.length > 0) {
            return nearbyEnemies.length >= 3 ? 'combat' : 'tension';
        }
        
        // Underground
        if (player.z < -5) {
            return 'underground';
        }
        
        // Weather
        const weather = this.game.weather?.getCurrentWeather?.();
        if (weather === 'rain' || weather === 'storm') {
            return 'rain';
        }
        
        // Time of day
        const timeOfDay = world.timeOfDay || 0.5;
        const isNight = timeOfDay < 0.25 || timeOfDay > 0.75;
        if (isNight) {
            return 'night';
        }
        
        // Near village/NPCs
        const nearbyNPCs = this.game.npcs?.getNearby?.(player.x, player.y, 20) || [];
        if (nearbyNPCs.length >= 3) {
            return 'village';
        }
        
        // Default exploration
        return player.isMoving ? 'exploration' : 'peaceful';
    }
    
    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    // Set music volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
    
    // Set ambient volume
    setAmbientVolume(volume) {
        this.ambientVolume = Math.max(0, Math.min(1, volume));
    }
    
    // Toggle music on/off
    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled) {
            this.stopAll();
        }
        
        return this.enabled;
    }
    
    // Stop all sounds
    stopAll() {
        // Stop all ambient sounds
        for (const [name] of this.ambientSounds) {
            this.fadeOutAmbient(name);
        }
        
        // Stop music layers
        for (const layer of Object.values(this.layers)) {
            if (layer) {
                // Would stop the audio
            }
        }
    }
    
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update combat timer
        if (this.combatTimer > 0) {
            this.combatTimer -= deltaTime;
        }
        
        // Determine and set appropriate mood
        const appropriateMood = this.determineMood();
        if (appropriateMood !== this.targetMood && this.currentMood !== 'boss') {
            this.setMood(appropriateMood);
        }
        
        // Handle crossfade
        if (this.currentMood !== this.targetMood) {
            this.crossfadeProgress += deltaTime / this.crossfadeTime;
            
            if (this.crossfadeProgress >= 1) {
                this.currentMood = this.targetMood;
                this.crossfadeProgress = 0;
                this.updateAmbientSounds();
            }
        }
        
        // Update ambient sound volumes (fade in/out)
        for (const [name, sound] of this.ambientSounds) {
            if (sound.volume !== sound.targetVolume) {
                const fadeSpeed = 0.5 * deltaTime;
                if (sound.volume < sound.targetVolume) {
                    sound.volume = Math.min(sound.targetVolume, sound.volume + fadeSpeed);
                } else {
                    sound.volume = Math.max(sound.targetVolume, sound.volume - fadeSpeed);
                }
            }
        }
    }
    
    // Render music/mood indicator (optional debug)
    renderDebug(ctx) {
        const mood = this.moods[this.currentMood];
        if (!mood) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, ctx.canvas.height - 60, 150, 50);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`🎵 ${mood.name}`, 20, ctx.canvas.height - 40);
        ctx.fillText(`Intensity: ${(mood.intensity * 100).toFixed(0)}%`, 20, ctx.canvas.height - 25);
        
        // Crossfade indicator
        if (this.currentMood !== this.targetMood) {
            ctx.fillStyle = '#6496FF';
            ctx.fillText(`→ ${this.moods[this.targetMood]?.name}`, 80, ctx.canvas.height - 40);
        }
        
        ctx.restore();
    }
    
    // Get current mood info for UI
    getCurrentMoodInfo() {
        return {
            name: this.moods[this.currentMood]?.name || 'Unknown',
            intensity: this.moods[this.currentMood]?.intensity || 0,
            transitioning: this.currentMood !== this.targetMood
        };
    }
    
    // Serialize for saving
    serialize() {
        return {
            enabled: this.enabled,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            ambientVolume: this.ambientVolume
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            this.enabled = data.enabled ?? true;
            this.masterVolume = data.masterVolume ?? 0.5;
            this.musicVolume = data.musicVolume ?? 0.7;
            this.ambientVolume = data.ambientVolume ?? 0.4;
        }
    }
}
