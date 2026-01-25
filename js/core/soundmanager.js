// Sound Manager - Ambient sounds, footsteps, and combat audio
import { CONFIG } from '../config.js';

export const SOUND_CATEGORIES = {
    MASTER: 'master',
    MUSIC: 'music',
    AMBIENT: 'ambient',
    SFX: 'sfx',
    UI: 'ui'
};

export const SOUND_DEFINITIONS = {
    // Footsteps
    footstep_grass: { category: 'sfx', volume: 0.3, variations: 4 },
    footstep_stone: { category: 'sfx', volume: 0.4, variations: 4 },
    footstep_wood: { category: 'sfx', volume: 0.35, variations: 4 },
    footstep_sand: { category: 'sfx', volume: 0.25, variations: 4 },
    footstep_water: { category: 'sfx', volume: 0.5, variations: 3 },
    footstep_snow: { category: 'sfx', volume: 0.2, variations: 3 },
    
    // Combat
    attack_swing: { category: 'sfx', volume: 0.5 },
    attack_hit: { category: 'sfx', volume: 0.6 },
    attack_miss: { category: 'sfx', volume: 0.3 },
    attack_critical: { category: 'sfx', volume: 0.7 },
    block_shield: { category: 'sfx', volume: 0.5 },
    player_hurt: { category: 'sfx', volume: 0.6 },
    player_death: { category: 'sfx', volume: 0.8 },
    enemy_hurt: { category: 'sfx', volume: 0.5 },
    enemy_death: { category: 'sfx', volume: 0.6 },
    
    // Actions
    pickup_item: { category: 'sfx', volume: 0.4 },
    drop_item: { category: 'sfx', volume: 0.3 },
    craft_success: { category: 'sfx', volume: 0.5 },
    craft_fail: { category: 'sfx', volume: 0.4 },
    eat_food: { category: 'sfx', volume: 0.4 },
    drink: { category: 'sfx', volume: 0.4 },
    level_up: { category: 'sfx', volume: 0.7 },
    achievement: { category: 'sfx', volume: 0.6 },
    
    // Building
    place_block: { category: 'sfx', volume: 0.4 },
    break_block: { category: 'sfx', volume: 0.5 },
    chop_wood: { category: 'sfx', volume: 0.5 },
    mine_stone: { category: 'sfx', volume: 0.5 },
    
    // UI
    menu_open: { category: 'ui', volume: 0.3 },
    menu_close: { category: 'ui', volume: 0.3 },
    button_click: { category: 'ui', volume: 0.25 },
    button_hover: { category: 'ui', volume: 0.15 },
    error: { category: 'ui', volume: 0.4 },
    
    // Ambient
    ambient_forest: { category: 'ambient', volume: 0.2, loop: true },
    ambient_cave: { category: 'ambient', volume: 0.15, loop: true },
    ambient_beach: { category: 'ambient', volume: 0.25, loop: true },
    ambient_night: { category: 'ambient', volume: 0.2, loop: true },
    ambient_rain: { category: 'ambient', volume: 0.3, loop: true },
    ambient_wind: { category: 'ambient', volume: 0.2, loop: true },
    ambient_fire: { category: 'ambient', volume: 0.25, loop: true },
    
    // Weather
    thunder: { category: 'ambient', volume: 0.8 },
    rain_start: { category: 'ambient', volume: 0.4 },
    wind_gust: { category: 'ambient', volume: 0.5 },
    
    // Animals
    wolf_growl: { category: 'sfx', volume: 0.5 },
    wolf_bark: { category: 'sfx', volume: 0.4 },
    deer_call: { category: 'sfx', volume: 0.3 },
    boar_grunt: { category: 'sfx', volume: 0.4 },
    bird_chirp: { category: 'ambient', volume: 0.2, variations: 5 },
    
    // Music
    music_menu: { category: 'music', volume: 0.5, loop: true },
    music_day: { category: 'music', volume: 0.4, loop: true },
    music_night: { category: 'music', volume: 0.35, loop: true },
    music_combat: { category: 'music', volume: 0.5, loop: true },
    music_boss: { category: 'music', volume: 0.6, loop: true }
};

export class SoundManager {
    constructor(game) {
        this.game = game;
        
        // Audio context
        this.audioContext = null;
        this.initialized = false;
        
        // Volume settings
        this.volumes = {
            [SOUND_CATEGORIES.MASTER]: 1.0,
            [SOUND_CATEGORIES.MUSIC]: 0.7,
            [SOUND_CATEGORIES.AMBIENT]: 0.5,
            [SOUND_CATEGORIES.SFX]: 0.8,
            [SOUND_CATEGORIES.UI]: 0.6
        };
        
        // Muted state
        this.muted = false;
        
        // Currently playing sounds
        this.activeSounds = new Map();
        
        // Sound pools for frequently used sounds
        this.soundPools = new Map();
        
        // Current ambient sounds
        this.currentAmbient = null;
        this.currentMusic = null;
        
        // Footstep tracking
        this.footstepTimer = 0;
        this.lastFootstepSurface = null;
        
        // Sound queue for preventing overlap
        this.soundQueue = [];
        this.queueDelay = 0.05;
        this.queueTimer = 0;
    }
    
    // Initialize audio context (must be called after user interaction)
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Sound Manager initialized');
        } catch (e) {
            console.warn('Failed to initialize audio context:', e);
        }
    }
    
    update(deltaTime) {
        if (!this.initialized) return;
        
        // Update footstep timer
        if (this.footstepTimer > 0) {
            this.footstepTimer -= deltaTime;
        }
        
        // Process sound queue
        this.queueTimer += deltaTime;
        if (this.queueTimer >= this.queueDelay && this.soundQueue.length > 0) {
            this.queueTimer = 0;
            const nextSound = this.soundQueue.shift();
            this.playImmediate(nextSound.id, nextSound.options);
        }
        
        // Update ambient based on environment
        this.updateAmbient();
        
        // Update music based on game state
        this.updateMusic();
        
        // Clean up finished sounds
        for (const [id, sound] of this.activeSounds.entries()) {
            if (sound.ended) {
                this.activeSounds.delete(id);
            }
        }
    }
    
    // Play a sound
    play(soundId, options = {}) {
        if (!this.initialized || this.muted) return null;
        
        const def = SOUND_DEFINITIONS[soundId];
        if (!def) {
            console.warn(`Unknown sound: ${soundId}`);
            return null;
        }
        
        // Queue if needed to prevent overlap
        if (options.queue) {
            this.soundQueue.push({ id: soundId, options });
            return null;
        }
        
        return this.playImmediate(soundId, options);
    }
    
    playImmediate(soundId, options = {}) {
        const def = SOUND_DEFINITIONS[soundId];
        if (!def) return null;
        
        // Calculate final volume
        const categoryVolume = this.volumes[def.category] || 1.0;
        const masterVolume = this.volumes[SOUND_CATEGORIES.MASTER];
        const soundVolume = def.volume || 1.0;
        const optionVolume = options.volume || 1.0;
        
        const finalVolume = masterVolume * categoryVolume * soundVolume * optionVolume;
        
        if (finalVolume <= 0) return null;
        
        // Create oscillator-based placeholder sound
        // In a real implementation, this would load and play audio files
        const sound = this.createPlaceholderSound(soundId, def, finalVolume, options);
        
        if (sound) {
            const id = `${soundId}_${Date.now()}`;
            this.activeSounds.set(id, sound);
            return id;
        }
        
        return null;
    }
    
    // Create a placeholder sound using oscillators
    // In production, replace with actual audio file loading
    createPlaceholderSound(soundId, def, volume, options) {
        if (!this.audioContext) return null;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configure based on sound type
            const soundConfig = this.getSoundConfig(soundId);
            oscillator.type = soundConfig.type;
            oscillator.frequency.value = soundConfig.frequency;
            
            gainNode.gain.value = volume * 0.1; // Keep quiet for placeholders
            
            const duration = options.duration || soundConfig.duration || 0.1;
            
            // Fade out
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.audioContext.currentTime + duration
            );
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
            
            return {
                oscillator,
                gainNode,
                ended: false,
                stop: () => {
                    try {
                        oscillator.stop();
                    } catch (e) {}
                }
            };
        } catch (e) {
            return null;
        }
    }
    
    // Get sound configuration based on type
    getSoundConfig(soundId) {
        const configs = {
            // Footsteps - short blips
            footstep: { type: 'sine', frequency: 100, duration: 0.05 },
            
            // Combat - varied
            attack: { type: 'sawtooth', frequency: 200, duration: 0.1 },
            hit: { type: 'square', frequency: 150, duration: 0.08 },
            hurt: { type: 'sine', frequency: 300, duration: 0.15 },
            
            // UI - high pitched
            menu: { type: 'sine', frequency: 500, duration: 0.08 },
            button: { type: 'sine', frequency: 600, duration: 0.05 },
            
            // Ambient - low rumble
            ambient: { type: 'sine', frequency: 60, duration: 0.5 },
            
            // Default
            default: { type: 'sine', frequency: 440, duration: 0.1 }
        };
        
        // Match by prefix
        for (const [prefix, config] of Object.entries(configs)) {
            if (soundId.startsWith(prefix)) {
                return config;
            }
        }
        
        return configs.default;
    }
    
    // Play footstep based on surface
    playFootstep(surface = 'grass') {
        if (this.footstepTimer > 0) return;
        
        const soundId = `footstep_${surface}`;
        const def = SOUND_DEFINITIONS[soundId] || SOUND_DEFINITIONS.footstep_grass;
        
        // Add variation if available
        let finalSoundId = soundId;
        if (def.variations) {
            const variation = Math.floor(Math.random() * def.variations) + 1;
            // In real implementation, would append variation number
        }
        
        this.play(finalSoundId);
        
        // Set cooldown
        this.footstepTimer = 0.3; // 300ms between footsteps
        this.lastFootstepSurface = surface;
    }
    
    // Update ambient sounds based on environment
    updateAmbient() {
        const player = this.game.player;
        if (!player) return;
        
        // Determine ambient sound
        let targetAmbient = 'ambient_forest';
        
        // Check biome
        const biome = this.game.world?.getBiomeAt?.(player.x, player.y);
        if (biome) {
            switch (biome) {
                case 'beach':
                case 'ocean':
                    targetAmbient = 'ambient_beach';
                    break;
                case 'cave':
                    targetAmbient = 'ambient_cave';
                    break;
                case 'desert':
                    targetAmbient = 'ambient_wind';
                    break;
            }
        }
        
        // Check time of day
        if (this.game.world?.isNightTime?.()) {
            targetAmbient = 'ambient_night';
        }
        
        // Check weather
        const weather = this.game.weather?.currentWeather;
        if (weather === 'rain' || weather === 'storm') {
            targetAmbient = 'ambient_rain';
        }
        
        // Change ambient if different
        if (targetAmbient !== this.currentAmbient) {
            // Fade out current
            if (this.currentAmbient) {
                this.stopAmbient();
            }
            
            // Start new ambient
            this.currentAmbient = targetAmbient;
            // In real implementation, would start looping ambient sound
        }
    }
    
    // Update music based on game state
    updateMusic() {
        let targetMusic = 'music_day';
        
        // Check game state
        if (this.game.inCombat) {
            targetMusic = 'music_combat';
        } else if (this.game.world?.isNightTime?.()) {
            targetMusic = 'music_night';
        } else if (this.game.inMenu) {
            targetMusic = 'music_menu';
        }
        
        // Change music if different
        if (targetMusic !== this.currentMusic) {
            this.currentMusic = targetMusic;
            // In real implementation, would crossfade music tracks
        }
    }
    
    // Stop a specific sound
    stop(soundInstanceId) {
        const sound = this.activeSounds.get(soundInstanceId);
        if (sound) {
            sound.stop?.();
            sound.ended = true;
            this.activeSounds.delete(soundInstanceId);
        }
    }
    
    // Stop all sounds in a category
    stopCategory(category) {
        for (const [id, sound] of this.activeSounds.entries()) {
            const soundId = id.split('_')[0];
            const def = SOUND_DEFINITIONS[soundId];
            if (def?.category === category) {
                sound.stop?.();
                this.activeSounds.delete(id);
            }
        }
    }
    
    // Stop ambient sound
    stopAmbient() {
        this.stopCategory(SOUND_CATEGORIES.AMBIENT);
        this.currentAmbient = null;
    }
    
    // Stop music
    stopMusic() {
        this.stopCategory(SOUND_CATEGORIES.MUSIC);
        this.currentMusic = null;
    }
    
    // Stop all sounds
    stopAll() {
        for (const sound of this.activeSounds.values()) {
            sound.stop?.();
        }
        this.activeSounds.clear();
        this.soundQueue = [];
        this.currentAmbient = null;
        this.currentMusic = null;
    }
    
    // Set volume for category
    setVolume(category, volume) {
        this.volumes[category] = Math.max(0, Math.min(1, volume));
    }
    
    // Get volume for category
    getVolume(category) {
        return this.volumes[category] || 1.0;
    }
    
    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopAll();
        }
        return this.muted;
    }
    
    // Set muted state
    setMuted(muted) {
        this.muted = muted;
        if (this.muted) {
            this.stopAll();
        }
    }
    
    // Play positional sound (3D audio)
    playPositional(soundId, x, y, z, options = {}) {
        const player = this.game.player;
        if (!player) return this.play(soundId, options);
        
        // Calculate distance
        const dx = x - player.x;
        const dy = y - player.y;
        const dz = z - player.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Attenuation based on distance
        const maxDistance = options.maxDistance || 20;
        const attenuation = Math.max(0, 1 - (distance / maxDistance));
        
        if (attenuation <= 0) return null;
        
        // Pan based on position (left/right)
        const angle = Math.atan2(dy, dx);
        // In real implementation, would set pan on audio node
        
        return this.play(soundId, {
            ...options,
            volume: (options.volume || 1.0) * attenuation
        });
    }
    
    // Serialize settings
    serialize() {
        return {
            volumes: this.volumes,
            muted: this.muted
        };
    }
    
    deserialize(data) {
        if (data?.volumes) {
            this.volumes = { ...this.volumes, ...data.volumes };
        }
        if (data?.muted !== undefined) {
            this.muted = data.muted;
        }
    }
    
    reset() {
        this.stopAll();
        this.volumes = {
            [SOUND_CATEGORIES.MASTER]: 1.0,
            [SOUND_CATEGORIES.MUSIC]: 0.7,
            [SOUND_CATEGORIES.AMBIENT]: 0.5,
            [SOUND_CATEGORIES.SFX]: 0.8,
            [SOUND_CATEGORIES.UI]: 0.6
        };
        this.muted = false;
    }
}
