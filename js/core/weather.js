// Weather System - Rain, Snow, Thunderstorms
import { CONFIG, BLOCKS, BLOCK_DATA, BIOMES } from '../config.js';

export const WEATHER_TYPES = {
    CLEAR: {
        name: 'Clear',
        emoji: '☀️',
        particleColor: null,
        particleCount: 0,
        movementModifier: 1.0,
        visibility: 1.0,
        ambientLight: 1.0,
    },
    RAIN: {
        name: 'Rain',
        emoji: '🌧️',
        particleColor: '#6699cc',
        particleCount: 50,
        movementModifier: 0.9,
        visibility: 0.7,
        ambientLight: 0.7,
        extinguishesFire: true,
        cropGrowthBonus: 1.5,
    },
    HEAVY_RAIN: {
        name: 'Heavy Rain',
        emoji: '⛈️',
        particleColor: '#4477aa',
        particleCount: 100,
        movementModifier: 0.75,
        visibility: 0.5,
        ambientLight: 0.5,
        extinguishesFire: true,
        cropGrowthBonus: 2.0,
    },
    SNOW: {
        name: 'Snow',
        emoji: '❄️',
        particleColor: '#ffffff',
        particleCount: 40,
        movementModifier: 0.8,
        visibility: 0.6,
        ambientLight: 0.8,
        coldDamage: 0.5, // per second without shelter
    },
    BLIZZARD: {
        name: 'Blizzard',
        emoji: '🌨️',
        particleColor: '#eeeeff',
        particleCount: 80,
        movementModifier: 0.6,
        visibility: 0.3,
        ambientLight: 0.4,
        coldDamage: 1.5,
    },
    THUNDERSTORM: {
        name: 'Thunderstorm',
        emoji: '⛈️',
        particleColor: '#5588bb',
        particleCount: 80,
        movementModifier: 0.7,
        visibility: 0.4,
        ambientLight: 0.3,
        extinguishesFire: true,
        lightningChance: 0.002, // per tick
    },
    SANDSTORM: {
        name: 'Sandstorm',
        emoji: '🏜️',
        particleColor: '#d4a574',
        particleCount: 60,
        movementModifier: 0.7,
        visibility: 0.4,
        ambientLight: 0.6,
        damage: 0.2, // per second
    },
    FOG: {
        name: 'Fog',
        emoji: '🌫️',
        particleColor: '#cccccc',
        particleCount: 20,
        movementModifier: 1.0,
        visibility: 0.3,
        ambientLight: 0.6,
    },
};

export class WeatherSystem {
    constructor(game) {
        this.game = game;
        
        this.currentWeather = WEATHER_TYPES.CLEAR;
        this.weatherDuration = 0; // Seconds remaining
        this.weatherTimer = 0;
        this.minWeatherDuration = 60;  // 1 minute minimum
        this.maxWeatherDuration = 300; // 5 minutes maximum
        
        // Weather particles
        this.particles = [];
        this.maxParticles = 200;
        
        // Lightning
        this.lightningFlash = 0;
        this.lastLightningTime = 0;
        
        // Initialize with clear weather
        this.setWeather('CLEAR');
    }
    
    update(deltaTime) {
        // Update weather duration
        this.weatherDuration -= deltaTime;
        
        // Change weather when duration expires
        if (this.weatherDuration <= 0) {
            this.randomizeWeather();
        }
        
        // Update weather effects
        this.updateParticles(deltaTime);
        this.applyWeatherEffects(deltaTime);
        
        // Lightning flash decay
        if (this.lightningFlash > 0) {
            this.lightningFlash -= deltaTime * 3;
        }
        
        // Check for lightning in thunderstorm
        if (this.currentWeather.lightningChance && Math.random() < this.currentWeather.lightningChance) {
            this.strikeLightning();
        }
    }
    
    setWeather(weatherKey) {
        this.currentWeather = WEATHER_TYPES[weatherKey] || WEATHER_TYPES.CLEAR;
        this.weatherDuration = this.minWeatherDuration + Math.random() * (this.maxWeatherDuration - this.minWeatherDuration);
        
        // Announce weather change
        if (this.game.ui && weatherKey !== 'CLEAR') {
            this.game.ui.showMessage(`${this.currentWeather.emoji} Weather: ${this.currentWeather.name}`, 3000);
        }
        
        // Clear particles for new weather
        this.particles = [];
    }
    
    randomizeWeather() {
        // Get current biome at player position
        const biome = this.getCurrentBiome();
        
        // Weight weather based on biome
        let possibleWeathers = ['CLEAR', 'CLEAR', 'CLEAR']; // Clear is most common
        
        if (biome === BIOMES.SNOW) {
            possibleWeathers.push('SNOW', 'SNOW', 'BLIZZARD', 'FOG');
        } else if (biome === BIOMES.DESERT) {
            possibleWeathers.push('SANDSTORM', 'CLEAR');
        } else if (biome === BIOMES.JUNGLE || biome === BIOMES.SWAMP) {
            possibleWeathers.push('RAIN', 'RAIN', 'HEAVY_RAIN', 'THUNDERSTORM', 'FOG');
        } else {
            possibleWeathers.push('RAIN', 'THUNDERSTORM', 'FOG');
        }
        
        const chosen = possibleWeathers[Math.floor(Math.random() * possibleWeathers.length)];
        this.setWeather(chosen);
    }
    
    getCurrentBiome() {
        if (!this.game.player || !this.game.world) return BIOMES.PLAINS;
        const px = Math.floor(this.game.player.x);
        const py = Math.floor(this.game.player.y);
        return this.game.world.getBiomeAt ? this.game.world.getBiomeAt(px, py) : BIOMES.PLAINS;
    }
    
    updateParticles(deltaTime) {
        const weather = this.currentWeather;
        if (!weather.particleColor || !this.game.player) return;
        
        // Spawn new particles
        const spawnCount = Math.floor(weather.particleCount * deltaTime);
        for (let i = 0; i < spawnCount && this.particles.length < this.maxParticles; i++) {
            this.spawnWeatherParticle();
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.z += p.vz * deltaTime;
            p.life -= deltaTime;
            
            // Remove dead or grounded particles
            if (p.life <= 0 || p.z <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    spawnWeatherParticle() {
        const player = this.game.player;
        const range = 20;
        
        // Spawn around player in the sky
        const p = {
            x: player.x + (Math.random() - 0.5) * range * 2,
            y: player.y + (Math.random() - 0.5) * range * 2,
            z: player.z + 15 + Math.random() * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            vz: -8 - Math.random() * 4, // Fall speed
            life: 3,
            color: this.currentWeather.particleColor,
            size: 2 + Math.random() * 2,
        };
        
        // Wind effect for sandstorm
        if (this.currentWeather === WEATHER_TYPES.SANDSTORM) {
            p.vx = 5 + Math.random() * 3;
            p.vz = -4;
        }
        
        this.particles.push(p);
    }
    
    applyWeatherEffects(deltaTime) {
        if (!this.game.player) return;
        const player = this.game.player;
        const weather = this.currentWeather;
        
        // Check if player is sheltered (has block above)
        const isSheltered = this.isPlayerSheltered();
        
        // Cold damage (snow, blizzard)
        if (weather.coldDamage && !isSheltered && !this.isNearHeat()) {
            player.takeDamage(weather.coldDamage * deltaTime, null);
            // Show freezing effect
            if (Math.random() < 0.1) {
                this.game.particles?.spawn('dust', player.x, player.y, player.z + 1, 2);
            }
        }
        
        // Sandstorm damage
        if (weather.damage && !isSheltered) {
            player.takeDamage(weather.damage * deltaTime, null);
        }
        
        // Extinguish fire blocks
        if (weather.extinguishesFire && Math.random() < 0.001) {
            this.tryExtinguishFires();
        }
    }
    
    isPlayerSheltered() {
        const player = this.game.player;
        const world = this.game.world;
        if (!player || !world) return false;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        // Check for solid block above
        for (let z = pz + 2; z < pz + 6; z++) {
            const block = world.getBlock(px, py, z);
            if (block !== BLOCKS.AIR && BLOCK_DATA[block]?.solid) {
                return true;
            }
        }
        return false;
    }
    
    isNearHeat() {
        const player = this.game.player;
        const world = this.game.world;
        if (!player || !world) return false;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        // Check for campfire/torch nearby
        for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
                for (let dz = -2; dz <= 2; dz++) {
                    const block = world.getBlock(px + dx, py + dy, pz + dz);
                    if (block === BLOCKS.CAMPFIRE || block === BLOCKS.TORCH) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    tryExtinguishFires() {
        // Extinguish exposed campfires/torches in rain
        const player = this.game.player;
        const world = this.game.world;
        if (!player || !world) return;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        
        for (let dx = -10; dx <= 10; dx++) {
            for (let dy = -10; dy <= 10; dy++) {
                const x = px + dx;
                const y = py + dy;
                const height = world.getHeight(x, y);
                const block = world.getBlock(x, y, height + 1);
                
                if ((block === BLOCKS.CAMPFIRE || block === BLOCKS.TORCH) && Math.random() < 0.01) {
                    world.setBlock(x, y, height + 1, BLOCKS.AIR);
                    this.game.particles?.spawn('smoke', x, y, height + 1, 5);
                }
            }
        }
    }
    
    strikeLightning() {
        const player = this.game.player;
        if (!player) return;
        
        // Lightning flash
        this.lightningFlash = 1.0;
        this.lastLightningTime = Date.now();
        
        // Play thunder sound
        this.game.audio?.play('thunder');
        
        // Random chance to strike near player
        if (Math.random() < 0.1) {
            const x = player.x + (Math.random() - 0.5) * 30;
            const y = player.y + (Math.random() - 0.5) * 30;
            const z = this.game.world?.getHeight(Math.floor(x), Math.floor(y)) || 15;
            
            // Visual effect
            this.game.particles?.spawn('star', x, y, z + 5, 20);
            this.game.particles?.spawn('fire', x, y, z + 1, 10);
            
            // Damage if very close
            const dist = Math.hypot(player.x - x, player.y - y);
            if (dist < 3) {
                player.takeDamage(20, null);
                this.game.ui?.showMessage('⚡ Struck by lightning!', 2000);
            }
        }
    }
    
    // Get weather modifiers for other systems
    getMovementModifier() {
        return this.currentWeather.movementModifier || 1.0;
    }
    
    getVisibility() {
        return this.currentWeather.visibility || 1.0;
    }
    
    getAmbientLightModifier() {
        let light = this.currentWeather.ambientLight || 1.0;
        if (this.lightningFlash > 0) {
            light = Math.min(1.5, light + this.lightningFlash);
        }
        return light;
    }
    
    // Render weather particles
    render(ctx, width, height) {
        if (!ctx) return;
        
        const camera = this.game.camera;
        
        for (const p of this.particles) {
            const screen = camera.worldToScreen(p.x, p.y, p.z);
            const size = p.size * camera.zoom;
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, p.life);
            ctx.fillRect(screen.x - size / 2, screen.y - size / 2, size, size * 2);
            ctx.globalAlpha = 1;
        }
        
        // Lightning flash overlay
        if (this.lightningFlash > 0.1) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.3})`;
            ctx.fillRect(0, 0, width, height);
        }
    }
    
    // Serialize for save
    serialize() {
        return {
            weatherKey: Object.keys(WEATHER_TYPES).find(k => WEATHER_TYPES[k] === this.currentWeather) || 'CLEAR',
            duration: this.weatherDuration,
        };
    }
    
    deserialize(data) {
        if (data) {
            this.setWeather(data.weatherKey || 'CLEAR');
            this.weatherDuration = data.duration || 60;
        }
    }
    
    reset() {
        this.currentWeather = WEATHER_TYPES.CLEAR;
        this.weatherDuration = 60;
        this.weatherTransition = 0;
        this.weatherParticles = [];
        this.lightningFlash = 0;
    }
}
