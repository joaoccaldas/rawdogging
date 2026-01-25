// Temperature System - Environmental survival mechanics
import { CONFIG } from '../config.js';

// Temperature ranges and effects
export const TEMPERATURE_CONFIG = {
    // Player temperature range (0-100, 50 is comfortable)
    COMFORTABLE_MIN: 35,
    COMFORTABLE_MAX: 65,
    
    // Danger thresholds
    FREEZING: 15,
    COLD: 25,
    HOT: 75,
    BURNING: 85,
    
    // Damage rates per second
    FREEZE_DAMAGE: 2,
    COLD_DAMAGE: 0.5,
    HEAT_DAMAGE: 0.5,
    BURN_DAMAGE: 2,
    
    // Temperature change rate
    CHANGE_RATE: 0.5,
    
    // Effects
    COLD_SLOW: 0.7,  // 30% slower when cold
    HEAT_STAMINA: 1.5 // 50% more stamina drain when hot
};

// Biome base temperatures
const BIOME_TEMPERATURES = {
    plains: 50,
    forest: 45,
    desert: 80,
    tundra: 15,
    swamp: 55,
    mountains: 25,
    volcanic: 90,
    ocean: 40,
    beach: 60,
    caves: 35
};

// Weather temperature modifiers
const WEATHER_MODIFIERS = {
    CLEAR: 0,
    RAIN: -10,
    HEAVY_RAIN: -15,
    SNOW: -25,
    BLIZZARD: -40,
    THUNDERSTORM: -10,
    SANDSTORM: +10,
    FOG: -5
};

export class TemperatureSystem {
    constructor(game) {
        this.game = game;
        
        // Player temperature (starts comfortable)
        this.playerTemp = 50;
        this.targetTemp = 50;
        
        // Environmental factors
        this.ambientTemp = 50;
        this.nearHeatSource = false;
        this.inWater = false;
        this.inShade = false;
        this.altitude = 0;
        
        // Heat sources tracking
        this.heatSources = [];
        
        // Status effects
        this.currentStatus = 'comfortable';
        this.statusTimer = 0;
    }
    
    update(deltaTime) {
        if (!this.game.player) return;
        
        const player = this.game.player;
        
        // Calculate ambient temperature
        this.calculateAmbientTemp();
        
        // Calculate target temperature based on environment
        this.calculateTargetTemp(player);
        
        // Gradually change player temperature
        const tempDiff = this.targetTemp - this.playerTemp;
        const changeRate = TEMPERATURE_CONFIG.CHANGE_RATE * deltaTime;
        
        if (Math.abs(tempDiff) < changeRate) {
            this.playerTemp = this.targetTemp;
        } else {
            this.playerTemp += Math.sign(tempDiff) * changeRate;
        }
        
        // Clamp temperature
        this.playerTemp = Math.max(0, Math.min(100, this.playerTemp));
        
        // Update status and apply effects
        this.updateStatus(player, deltaTime);
    }
    
    calculateAmbientTemp() {
        // Start with biome temperature
        let temp = 50;
        
        if (this.game.world) {
            const player = this.game.player;
            if (player) {
                const biome = this.game.world.getBiome?.(player.x, player.y);
                if (biome && BIOME_TEMPERATURES[biome]) {
                    temp = BIOME_TEMPERATURES[biome];
                }
                
                // Altitude affects temperature (-2 degrees per block above 20)
                this.altitude = player.z || 0;
                if (this.altitude > 20) {
                    temp -= (this.altitude - 20) * 0.5;
                }
            }
            
            // Day/night cycle
            const dayProgress = this.game.world.dayProgress || 0.5;
            // Cooler at night (around 0 and 1), warmer at midday (0.25-0.75)
            const timeTemp = Math.sin(dayProgress * Math.PI * 2) * 10;
            temp += timeTemp;
        }
        
        // Weather affects temperature
        if (this.game.weather) {
            const weatherType = this.game.weather.currentWeather;
            if (WEATHER_MODIFIERS[weatherType] !== undefined) {
                temp += WEATHER_MODIFIERS[weatherType];
            }
        }
        
        this.ambientTemp = temp;
    }
    
    calculateTargetTemp(player) {
        let temp = this.ambientTemp;
        
        // Check if in water
        this.inWater = player.inWater || player.isSwimming || false;
        if (this.inWater) {
            // Water cools you down
            temp -= 20;
        }
        
        // Check heat sources
        this.nearHeatSource = false;
        const heatBonus = this.checkHeatSources(player);
        if (heatBonus > 0) {
            this.nearHeatSource = true;
            temp += heatBonus;
        }
        
        // Check if sheltered (under blocks)
        this.inShade = this.checkShelter(player);
        if (this.inShade) {
            // Shelter moderates temperature toward comfortable
            const comfortMid = (TEMPERATURE_CONFIG.COMFORTABLE_MIN + TEMPERATURE_CONFIG.COMFORTABLE_MAX) / 2;
            temp = temp * 0.7 + comfortMid * 0.3;
        }
        
        // Armor affects temperature
        if (this.game.armor) {
            const armorInsulation = this.game.armor.getInsulation?.() || 0;
            // Armor helps in cold, hurts in heat
            if (temp < 50) {
                temp += armorInsulation * 5;
            } else {
                temp -= armorInsulation * 2;
            }
        }
        
        this.targetTemp = Math.max(0, Math.min(100, temp));
    }
    
    checkHeatSources(player) {
        let totalHeat = 0;
        
        if (!this.game.world) return 0;
        
        // Check for nearby campfires, torches, lava
        const checkRadius = 5;
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                for (let dz = -2; dz <= 2; dz++) {
                    const block = this.game.world.getBlock?.(px + dx, py + dy, pz + dz);
                    if (!block) continue;
                    
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (dist > checkRadius) continue;
                    
                    let heat = 0;
                    if (block === 'campfire' || block === 'fire') {
                        heat = 40;
                    } else if (block === 'torch') {
                        heat = 10;
                    } else if (block === 'lava') {
                        heat = 60;
                    } else if (block === 'furnace') {
                        heat = 20;
                    }
                    
                    if (heat > 0) {
                        // Heat diminishes with distance
                        totalHeat += heat * (1 - dist / checkRadius);
                    }
                }
            }
        }
        
        return totalHeat;
    }
    
    checkShelter(player) {
        if (!this.game.world) return false;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        // Check if there's a block above the player
        for (let z = pz + 2; z < pz + 6; z++) {
            const block = this.game.world.getBlock?.(px, py, z);
            if (block && block !== 'air' && block !== 'leaves') {
                return true;
            }
        }
        
        return false;
    }
    
    updateStatus(player, deltaTime) {
        const temp = this.playerTemp;
        let newStatus = 'comfortable';
        let damage = 0;
        
        if (temp <= TEMPERATURE_CONFIG.FREEZING) {
            newStatus = 'freezing';
            damage = TEMPERATURE_CONFIG.FREEZE_DAMAGE;
        } else if (temp <= TEMPERATURE_CONFIG.COLD) {
            newStatus = 'cold';
            damage = TEMPERATURE_CONFIG.COLD_DAMAGE;
        } else if (temp >= TEMPERATURE_CONFIG.BURNING) {
            newStatus = 'burning';
            damage = TEMPERATURE_CONFIG.BURN_DAMAGE;
        } else if (temp >= TEMPERATURE_CONFIG.HOT) {
            newStatus = 'hot';
            damage = TEMPERATURE_CONFIG.HEAT_DAMAGE;
        }
        
        // Status change notification
        if (newStatus !== this.currentStatus) {
            this.currentStatus = newStatus;
            this.showStatusMessage(newStatus);
        }
        
        // Apply damage
        if (damage > 0) {
            if (typeof player.takeDamage === 'function') {
                player.takeDamage(damage * deltaTime, 'temperature');
            } else if (player.health !== undefined) {
                player.health -= damage * deltaTime;
            }
        }
        
        // Apply movement penalty when cold
        if (temp <= TEMPERATURE_CONFIG.COLD) {
            player.temperatureSlow = TEMPERATURE_CONFIG.COLD_SLOW;
        } else {
            player.temperatureSlow = 1;
        }
        
        // Apply stamina penalty when hot
        if (temp >= TEMPERATURE_CONFIG.HOT) {
            player.temperatureStaminaDrain = TEMPERATURE_CONFIG.HEAT_STAMINA;
        } else {
            player.temperatureStaminaDrain = 1;
        }
    }
    
    showStatusMessage(status) {
        if (!this.game.ui) return;
        
        const messages = {
            freezing: '🥶 You are freezing! Find warmth!',
            cold: '❄️ You are getting cold...',
            comfortable: '😊 Temperature is comfortable',
            hot: '🌡️ You are overheating...',
            burning: '🔥 You are burning up! Cool down!'
        };
        
        if (messages[status]) {
            this.game.ui.showMessage(messages[status], 3000);
        }
    }
    
    // Get current temperature for UI
    getTemperature() {
        return Math.round(this.playerTemp);
    }
    
    // Get status icon for UI
    getStatusIcon() {
        if (this.playerTemp <= TEMPERATURE_CONFIG.FREEZING) return '🥶';
        if (this.playerTemp <= TEMPERATURE_CONFIG.COLD) return '❄️';
        if (this.playerTemp >= TEMPERATURE_CONFIG.BURNING) return '🔥';
        if (this.playerTemp >= TEMPERATURE_CONFIG.HOT) return '🌡️';
        return '😊';
    }
    
    // Get temperature color for UI bar
    getTemperatureColor() {
        const temp = this.playerTemp;
        
        if (temp <= TEMPERATURE_CONFIG.FREEZING) return '#0000ff';
        if (temp <= TEMPERATURE_CONFIG.COLD) return '#00aaff';
        if (temp >= TEMPERATURE_CONFIG.BURNING) return '#ff0000';
        if (temp >= TEMPERATURE_CONFIG.HOT) return '#ff8800';
        return '#00ff00';
    }
    
    render(ctx) {
        // Temperature UI is rendered in ui.js
        // This renders environmental indicators
        
        if (this.nearHeatSource) {
            // Render heat shimmer effect near heat sources
            // (optional visual effect)
        }
    }
    
    // Serialize for save
    serialize() {
        return {
            playerTemp: this.playerTemp,
            currentStatus: this.currentStatus
        };
    }
    
    deserialize(data) {
        if (!data) return;
        this.playerTemp = data.playerTemp || 50;
        this.currentStatus = data.currentStatus || 'comfortable';
    }
}

// Items that affect temperature
export const TEMPERATURE_ITEMS = {
    fur_coat: {
        name: 'Fur Coat',
        type: 'armor_chest',
        insulation: 3,
        description: 'Keeps you warm in cold biomes.'
    },
    straw_hat: {
        name: 'Straw Hat',
        type: 'armor_head',
        heatResist: 2,
        description: 'Protects from the hot sun.'
    },
    ice_pack: {
        name: 'Ice Pack',
        type: 'consumable',
        effect: 'cooling',
        duration: 60,
        description: 'Cools you down in hot areas.'
    },
    warming_potion: {
        name: 'Warming Potion',
        type: 'consumable',
        effect: 'warming',
        duration: 60,
        description: 'Warms you up in cold areas.'
    }
};
