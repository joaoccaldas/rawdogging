// Torch Lighting System - Dynamic illumination from placed light sources
import { CONFIG } from '../config.js';

export const LIGHT_CONFIG = {
    // Light source types
    LIGHT_SOURCES: {
        TORCH: {
            name: 'Torch',
            radius: 6,
            intensity: 1.0,
            color: { r: 255, g: 180, b: 100 },
            flicker: true,
            flickerAmount: 0.15,
            flickerSpeed: 8,
            duration: 600, // 10 minutes in seconds (0 = infinite)
            fuel: 'wood',
            fuelConsumption: 1 // per minute
        },
        CAMPFIRE: {
            name: 'Campfire',
            radius: 10,
            intensity: 1.2,
            color: { r: 255, g: 150, b: 50 },
            flicker: true,
            flickerAmount: 0.25,
            flickerSpeed: 6,
            duration: 0, // Infinite with fuel
            fuel: 'wood',
            fuelConsumption: 2
        },
        LANTERN: {
            name: 'Lantern',
            radius: 8,
            intensity: 0.9,
            color: { r: 255, g: 220, b: 180 },
            flicker: true,
            flickerAmount: 0.08,
            flickerSpeed: 10,
            duration: 1800, // 30 minutes
            fuel: 'oil',
            fuelConsumption: 0.5
        },
        GLOWSTONE: {
            name: 'Glowstone',
            radius: 7,
            intensity: 0.8,
            color: { r: 200, g: 255, b: 200 },
            flicker: false,
            flickerAmount: 0,
            flickerSpeed: 0,
            duration: 0, // Permanent
            fuel: null,
            fuelConsumption: 0
        },
        CRYSTAL: {
            name: 'Crystal Light',
            radius: 5,
            intensity: 0.7,
            color: { r: 150, g: 200, b: 255 },
            flicker: true,
            flickerAmount: 0.1,
            flickerSpeed: 4,
            duration: 0,
            fuel: null,
            fuelConsumption: 0
        },
        BONFIRE: {
            name: 'Bonfire',
            radius: 15,
            intensity: 1.5,
            color: { r: 255, g: 130, b: 30 },
            flicker: true,
            flickerAmount: 0.3,
            flickerSpeed: 5,
            duration: 0,
            fuel: 'wood',
            fuelConsumption: 5
        }
    },
    
    // Ambient light levels
    AMBIENT_LIGHT: {
        DAY: 1.0,
        DUSK: 0.5,
        NIGHT: 0.15,
        CAVE: 0.05
    },
    
    // Light blending
    BLEND_MODE: 'screen',
    MAX_ACTIVE_LIGHTS: 20,
    UPDATE_INTERVAL: 50 // ms between light updates
};

export class PlacedLight {
    constructor(type, x, y, z) {
        const config = LIGHT_CONFIG.LIGHT_SOURCES[type];
        
        this.id = `light_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Light properties
        this.radius = config.radius;
        this.intensity = config.intensity;
        this.baseIntensity = config.intensity;
        this.color = { ...config.color };
        
        // Flicker
        this.flicker = config.flicker;
        this.flickerAmount = config.flickerAmount;
        this.flickerSpeed = config.flickerSpeed;
        this.flickerOffset = Math.random() * Math.PI * 2;
        
        // Duration and fuel
        this.duration = config.duration;
        this.remainingDuration = config.duration;
        this.fuel = config.fuel;
        this.fuelConsumption = config.fuelConsumption;
        this.fuelLevel = 100;
        
        // State
        this.active = true;
        this.placedAt = Date.now();
    }
    
    update(deltaTime, time) {
        if (!this.active) return;
        
        // Update flicker
        if (this.flicker) {
            const flickerValue = Math.sin(time * this.flickerSpeed + this.flickerOffset);
            this.intensity = this.baseIntensity * (1 + flickerValue * this.flickerAmount);
        }
        
        // Update duration
        if (this.duration > 0) {
            this.remainingDuration -= deltaTime;
            if (this.remainingDuration <= 0) {
                this.active = false;
            }
        }
        
        // Update fuel (if applicable)
        if (this.fuel && this.fuelConsumption > 0) {
            this.fuelLevel -= (this.fuelConsumption / 60) * deltaTime;
            if (this.fuelLevel <= 0) {
                this.fuelLevel = 0;
                this.intensity *= 0.3; // Dim when low fuel
            }
        }
    }
    
    // Add fuel to light source
    addFuel(amount) {
        if (!this.fuel) return 0;
        
        const oldLevel = this.fuelLevel;
        this.fuelLevel = Math.min(100, this.fuelLevel + amount);
        
        if (this.fuelLevel > 0 && !this.active) {
            this.active = true;
        }
        
        return this.fuelLevel - oldLevel;
    }
    
    // Get current light color with intensity
    getColor() {
        return {
            r: Math.floor(this.color.r * this.intensity),
            g: Math.floor(this.color.g * this.intensity),
            b: Math.floor(this.color.b * this.intensity)
        };
    }
    
    serialize() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            z: this.z,
            remainingDuration: this.remainingDuration,
            fuelLevel: this.fuelLevel,
            active: this.active
        };
    }
}

export class TorchLightingSystem {
    constructor(game) {
        this.game = game;
        
        // All placed lights
        this.lights = new Map();
        
        // Lighting state
        this.ambientLight = LIGHT_CONFIG.AMBIENT_LIGHT.DAY;
        this.globalTime = 0;
        
        // Light map for efficient lookups
        this.lightMap = new Map();
        this.lightMapDirty = true;
        
        // Performance optimization
        this.lastUpdate = 0;
        this.updateInterval = LIGHT_CONFIG.UPDATE_INTERVAL;
        
        // Player light (carried torch)
        this.playerLight = null;
    }
    
    update(deltaTime) {
        this.globalTime += deltaTime;
        
        // Throttle updates for performance
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = now;
        
        // Update ambient light based on time of day
        this.updateAmbientLight();
        
        // Update all placed lights
        for (const [id, light] of this.lights.entries()) {
            light.update(deltaTime, this.globalTime);
            
            // Remove expired lights
            if (!light.active && light.duration > 0) {
                this.lights.delete(id);
                this.lightMapDirty = true;
            }
        }
        
        // Rebuild light map if needed
        if (this.lightMapDirty) {
            this.rebuildLightMap();
        }
    }
    
    // Update ambient light based on day/night cycle
    updateAmbientLight() {
        if (!this.game.dayNight) {
            this.ambientLight = LIGHT_CONFIG.AMBIENT_LIGHT.DAY;
            return;
        }
        
        const timeOfDay = this.game.dayNight.timeOfDay || 0.5;
        
        if (timeOfDay >= 0.25 && timeOfDay < 0.75) {
            // Day
            this.ambientLight = LIGHT_CONFIG.AMBIENT_LIGHT.DAY;
        } else if (timeOfDay >= 0.2 && timeOfDay < 0.25 || timeOfDay >= 0.75 && timeOfDay < 0.8) {
            // Dusk/Dawn
            this.ambientLight = LIGHT_CONFIG.AMBIENT_LIGHT.DUSK;
        } else {
            // Night
            this.ambientLight = LIGHT_CONFIG.AMBIENT_LIGHT.NIGHT;
        }
    }
    
    // Place a light source
    placeLight(type, x, y, z) {
        if (!LIGHT_CONFIG.LIGHT_SOURCES[type]) {
            console.warn(`Unknown light type: ${type}`);
            return null;
        }
        
        // Check if too many lights
        if (this.lights.size >= LIGHT_CONFIG.MAX_ACTIVE_LIGHTS) {
            this.game.ui?.showMessage('❌ Too many light sources', 1500);
            return null;
        }
        
        const light = new PlacedLight(type, x, y, z);
        this.lights.set(light.id, light);
        this.lightMapDirty = true;
        
        // Particles for fire-based lights
        if (this.game.particles && ['TORCH', 'CAMPFIRE', 'BONFIRE'].includes(type)) {
            this.game.particles.emit(x, y, z, 'fire', 5);
        }
        
        this.game.ui?.showMessage(`🔦 Placed ${LIGHT_CONFIG.LIGHT_SOURCES[type].name}`, 1500);
        
        return light;
    }
    
    // Remove a light source
    removeLight(x, y, z, radius = 1) {
        for (const [id, light] of this.lights.entries()) {
            const dx = light.x - x;
            const dy = light.y - y;
            const dz = light.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist <= radius) {
                this.lights.delete(id);
                this.lightMapDirty = true;
                return light;
            }
        }
        return null;
    }
    
    // Set player carried light
    setPlayerLight(type) {
        if (type === null) {
            this.playerLight = null;
            return;
        }
        
        if (!LIGHT_CONFIG.LIGHT_SOURCES[type]) {
            return;
        }
        
        // Create player light (follows player)
        this.playerLight = {
            type,
            config: LIGHT_CONFIG.LIGHT_SOURCES[type]
        };
    }
    
    // Rebuild the light map for efficient queries
    rebuildLightMap() {
        this.lightMap.clear();
        
        for (const light of this.lights.values()) {
            if (!light.active) continue;
            
            const key = `${Math.floor(light.x)},${Math.floor(light.y)},${Math.floor(light.z)}`;
            
            if (!this.lightMap.has(key)) {
                this.lightMap.set(key, []);
            }
            this.lightMap.get(key).push(light);
        }
        
        this.lightMapDirty = false;
    }
    
    // Get light level at a position
    getLightLevel(x, y, z) {
        let totalLight = this.ambientLight;
        
        // Check placed lights
        for (const light of this.lights.values()) {
            if (!light.active) continue;
            
            const dx = light.x - x;
            const dy = light.y - y;
            const dz = light.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < light.radius) {
                // Light falloff (inverse square-ish)
                const falloff = 1 - (dist / light.radius);
                totalLight += light.intensity * falloff * falloff;
            }
        }
        
        // Check player light
        if (this.playerLight && this.game.player) {
            const player = this.game.player;
            const config = this.playerLight.config;
            
            const dx = player.x - x;
            const dy = player.y - y;
            const dz = (player.z || 0) - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < config.radius) {
                const falloff = 1 - (dist / config.radius);
                totalLight += config.intensity * falloff * falloff;
            }
        }
        
        return Math.min(1.5, totalLight); // Cap at 1.5 for over-bright areas
    }
    
    // Get light color at a position (for colored lighting)
    getLightColor(x, y, z) {
        let r = 255 * this.ambientLight;
        let g = 255 * this.ambientLight;
        let b = 255 * this.ambientLight;
        
        // Night ambient is blueish
        if (this.ambientLight < 0.3) {
            b = Math.min(255, b * 1.5);
        }
        
        // Add light source colors
        for (const light of this.lights.values()) {
            if (!light.active) continue;
            
            const dx = light.x - x;
            const dy = light.y - y;
            const dz = light.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < light.radius) {
                const falloff = 1 - (dist / light.radius);
                const contribution = light.intensity * falloff * falloff;
                
                const color = light.getColor();
                r = Math.min(255, r + color.r * contribution);
                g = Math.min(255, g + color.g * contribution);
                b = Math.min(255, b + color.b * contribution);
            }
        }
        
        // Player light
        if (this.playerLight && this.game.player) {
            const player = this.game.player;
            const config = this.playerLight.config;
            
            const dx = player.x - x;
            const dy = player.y - y;
            const dz = (player.z || 0) - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < config.radius) {
                const falloff = 1 - (dist / config.radius);
                const contribution = config.intensity * falloff * falloff;
                
                r = Math.min(255, r + config.color.r * contribution);
                g = Math.min(255, g + config.color.g * contribution);
                b = Math.min(255, b + config.color.b * contribution);
            }
        }
        
        return { 
            r: Math.floor(r), 
            g: Math.floor(g), 
            b: Math.floor(b) 
        };
    }
    
    // Render light effects
    render(ctx, camera) {
        // Draw light radius indicators (debug/placement mode)
        if (this.game.buildingSnapGrid?.buildMode) {
            for (const light of this.lights.values()) {
                if (!light.active) continue;
                
                const screenPos = camera.worldToScreen(light.x, light.y, light.z);
                const screenRadius = light.radius * 20; // Approximate screen scale
                
                // Light radius circle
                ctx.beginPath();
                ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${light.color.r}, ${light.color.g}, ${light.color.b}, 0.3)`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
        
        // Render glow effects for active lights
        for (const light of this.lights.values()) {
            if (!light.active) continue;
            
            const screenPos = camera.worldToScreen(light.x, light.y, light.z);
            const screenRadius = light.radius * 15;
            
            // Create radial gradient for glow
            const gradient = ctx.createRadialGradient(
                screenPos.x, screenPos.y, 0,
                screenPos.x, screenPos.y, screenRadius
            );
            
            const color = light.getColor();
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 * light.intensity})`);
            gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.1 * light.intensity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Light source sprite/icon
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Render darkness overlay
    renderDarkness(ctx, canvasWidth, canvasHeight, camera) {
        if (this.ambientLight >= 0.9) return; // No darkness during day
        
        const darknessLevel = 1 - this.ambientLight;
        
        // Create darkness overlay
        ctx.fillStyle = `rgba(0, 0, 30, ${darknessLevel * 0.7})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Cut out light areas using composite operation
        ctx.globalCompositeOperation = 'destination-out';
        
        // Player light area
        if (this.playerLight && this.game.player) {
            const player = this.game.player;
            const config = this.playerLight.config;
            const screenPos = camera.worldToScreen(player.x, player.y, player.z || 0);
            const screenRadius = config.radius * 20;
            
            const gradient = ctx.createRadialGradient(
                screenPos.x, screenPos.y, 0,
                screenPos.x, screenPos.y, screenRadius
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${config.intensity})`);
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Placed lights
        for (const light of this.lights.values()) {
            if (!light.active) continue;
            
            const screenPos = camera.worldToScreen(light.x, light.y, light.z);
            const screenRadius = light.radius * 20;
            
            const gradient = ctx.createRadialGradient(
                screenPos.x, screenPos.y, 0,
                screenPos.x, screenPos.y, screenRadius
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity})`);
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    // Refuel a light at position
    refuelLight(x, y, z, fuelType, amount) {
        for (const light of this.lights.values()) {
            const dx = light.x - x;
            const dy = light.y - y;
            const dz = light.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist <= 1.5 && light.fuel === fuelType) {
                const added = light.addFuel(amount);
                if (added > 0) {
                    this.game.ui?.showMessage(`🔥 Refueled ${LIGHT_CONFIG.LIGHT_SOURCES[light.type].name}`, 1500);
                    return true;
                }
            }
        }
        return false;
    }
    
    // Get nearby lights
    getNearbyLights(x, y, z, radius = 15) {
        const nearby = [];
        
        for (const light of this.lights.values()) {
            const dx = light.x - x;
            const dy = light.y - y;
            const dz = light.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist <= radius) {
                nearby.push(light);
            }
        }
        
        return nearby;
    }
    
    // Serialize
    serialize() {
        return {
            lights: Array.from(this.lights.values()).map(l => l.serialize()),
            playerLight: this.playerLight?.type || null
        };
    }
    
    deserialize(data) {
        if (data?.lights) {
            this.lights.clear();
            for (const lightData of data.lights) {
                const light = new PlacedLight(lightData.type, lightData.x, lightData.y, lightData.z);
                light.id = lightData.id;
                light.remainingDuration = lightData.remainingDuration;
                light.fuelLevel = lightData.fuelLevel;
                light.active = lightData.active;
                this.lights.set(light.id, light);
            }
            this.lightMapDirty = true;
        }
        if (data?.playerLight) {
            this.setPlayerLight(data.playerLight);
        }
    }
    
    reset() {
        this.lights.clear();
        this.lightMap.clear();
        this.lightMapDirty = true;
        this.playerLight = null;
        this.ambientLight = LIGHT_CONFIG.AMBIENT_LIGHT.DAY;
    }
}

// Light source items
export const LIGHT_ITEMS = {
    torch: {
        name: 'Torch',
        type: 'light',
        lightType: 'TORCH',
        recipe: { wood: 2, fiber: 1 }
    },
    lantern: {
        name: 'Lantern',
        type: 'light',
        lightType: 'LANTERN',
        recipe: { metal: 3, glass: 1, oil: 1 }
    },
    glowstone: {
        name: 'Glowstone',
        type: 'light',
        lightType: 'GLOWSTONE',
        recipe: { stone: 5, crystal: 2 }
    },
    crystal_light: {
        name: 'Crystal Light',
        type: 'light',
        lightType: 'CRYSTAL',
        recipe: { crystal: 3, fiber: 1 }
    }
};
