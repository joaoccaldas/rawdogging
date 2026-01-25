// Food Buffs System - Cooking and food effects
import { CONFIG } from '../config.js';

// Buff types and their effects
export const BUFF_TYPES = {
    SPEED: {
        name: 'Swiftness',
        icon: '⚡',
        effect: (player, power) => { player.buffSpeed = 1 + power * 0.2; },
        clear: (player) => { player.buffSpeed = 1; }
    },
    STRENGTH: {
        name: 'Strength',
        icon: '💪',
        effect: (player, power) => { player.buffDamage = 1 + power * 0.25; },
        clear: (player) => { player.buffDamage = 1; }
    },
    REGEN: {
        name: 'Regeneration',
        icon: '💚',
        effect: (player, power, deltaTime) => { 
            player.health = Math.min(player.maxHealth, player.health + power * 0.5 * deltaTime);
        },
        clear: (player) => {}
    },
    DEFENSE: {
        name: 'Toughness',
        icon: '🛡️',
        effect: (player, power) => { player.buffDefense = 1 + power * 0.15; },
        clear: (player) => { player.buffDefense = 1; }
    },
    STAMINA: {
        name: 'Endurance',
        icon: '🏃',
        effect: (player, power) => { player.buffStamina = 1 + power * 0.3; },
        clear: (player) => { player.buffStamina = 1; }
    },
    NIGHT_VISION: {
        name: 'Night Vision',
        icon: '👁️',
        effect: (player, power) => { player.nightVision = true; },
        clear: (player) => { player.nightVision = false; }
    },
    SATIATION: {
        name: 'Well Fed',
        icon: '🍖',
        effect: (player, power) => { player.hungerDrainMult = Math.max(0.1, 1 - power * 0.2); },
        clear: (player) => { player.hungerDrainMult = 1; }
    },
    FIRE_RESIST: {
        name: 'Fire Resistance',
        icon: '🔥',
        effect: (player, power) => { player.fireResist = power * 0.3; },
        clear: (player) => { player.fireResist = 0; }
    },
    COLD_RESIST: {
        name: 'Cold Resistance',
        icon: '❄️',
        effect: (player, power) => { player.coldResist = power * 0.3; },
        clear: (player) => { player.coldResist = 0; }
    }
};

// Cooked food definitions
export const COOKED_FOODS = {
    // Basic cooked meats
    cooked_meat: {
        name: 'Cooked Meat',
        hunger: 25,
        health: 5,
        buffs: [{ type: 'REGEN', power: 1, duration: 10 }],
        cookFrom: 'raw_meat',
        cookTime: 5
    },
    cooked_fish: {
        name: 'Cooked Fish',
        hunger: 20,
        health: 3,
        buffs: [{ type: 'STAMINA', power: 1, duration: 30 }],
        cookFrom: 'raw_fish',
        cookTime: 4
    },
    
    // Advanced recipes
    meat_stew: {
        name: 'Meat Stew',
        hunger: 40,
        health: 10,
        buffs: [
            { type: 'REGEN', power: 2, duration: 20 },
            { type: 'SATIATION', power: 2, duration: 60 }
        ],
        recipe: { cooked_meat: 2, carrot: 1, water_bucket: 1 },
        cookTime: 10
    },
    fish_soup: {
        name: 'Fish Soup',
        hunger: 35,
        health: 8,
        buffs: [
            { type: 'STAMINA', power: 2, duration: 45 },
            { type: 'COLD_RESIST', power: 1, duration: 60 }
        ],
        recipe: { cooked_fish: 2, seaweed: 2, water_bucket: 1 },
        cookTime: 8
    },
    
    // Specialty foods
    berry_pie: {
        name: 'Berry Pie',
        hunger: 30,
        health: 5,
        buffs: [
            { type: 'SPEED', power: 2, duration: 45 },
            { type: 'REGEN', power: 1, duration: 15 }
        ],
        recipe: { berries: 5, wheat: 2 },
        cookTime: 8
    },
    mammoth_steak: {
        name: 'Mammoth Steak',
        hunger: 60,
        health: 20,
        buffs: [
            { type: 'STRENGTH', power: 3, duration: 90 },
            { type: 'DEFENSE', power: 2, duration: 90 },
            { type: 'SATIATION', power: 3, duration: 120 }
        ],
        cookFrom: 'mammoth_meat',
        cookTime: 15
    },
    
    // Combat foods
    hunter_ration: {
        name: "Hunter's Ration",
        hunger: 25,
        health: 10,
        buffs: [
            { type: 'STRENGTH', power: 2, duration: 60 },
            { type: 'SPEED', power: 1, duration: 60 }
        ],
        recipe: { cooked_meat: 1, berries: 3, honey: 1 },
        cookTime: 6
    },
    warrior_meal: {
        name: 'Warrior Meal',
        hunger: 45,
        health: 15,
        buffs: [
            { type: 'STRENGTH', power: 3, duration: 90 },
            { type: 'DEFENSE', power: 3, duration: 90 },
            { type: 'REGEN', power: 1, duration: 30 }
        ],
        recipe: { mammoth_steak: 1, mushroom: 2, honey: 1 },
        cookTime: 12
    },
    
    // Exploration foods
    traveler_bread: {
        name: "Traveler's Bread",
        hunger: 35,
        health: 5,
        buffs: [
            { type: 'STAMINA', power: 3, duration: 120 },
            { type: 'SATIATION', power: 2, duration: 90 }
        ],
        recipe: { wheat: 4, honey: 1 },
        cookTime: 10
    },
    night_mushroom_stew: {
        name: 'Night Mushroom Stew',
        hunger: 30,
        health: 8,
        buffs: [
            { type: 'NIGHT_VISION', power: 1, duration: 180 },
            { type: 'REGEN', power: 1, duration: 30 }
        ],
        recipe: { glowing_mushroom: 3, water_bucket: 1 },
        cookTime: 8
    },
    
    // Environment resistance
    spicy_meat: {
        name: 'Spicy Meat',
        hunger: 30,
        health: 8,
        buffs: [
            { type: 'COLD_RESIST', power: 3, duration: 180 },
            { type: 'SPEED', power: 1, duration: 60 }
        ],
        recipe: { cooked_meat: 1, chili_pepper: 2 },
        cookTime: 6
    },
    chilled_fish: {
        name: 'Chilled Fish',
        hunger: 25,
        health: 5,
        buffs: [
            { type: 'FIRE_RESIST', power: 3, duration: 180 },
            { type: 'STAMINA', power: 1, duration: 60 }
        ],
        recipe: { cooked_fish: 1, ice: 2, mint: 1 },
        cookTime: 6
    }
};

// Raw foods (basic, no buffs)
export const RAW_FOODS = {
    raw_meat: { name: 'Raw Meat', hunger: 10, health: -2, spoilTime: 300 },
    raw_fish: { name: 'Raw Fish', hunger: 8, health: -1, spoilTime: 240 },
    berries: { name: 'Berries', hunger: 5, health: 0, spoilTime: 600 },
    mushroom: { name: 'Mushroom', hunger: 4, health: 0, spoilTime: 480 },
    carrot: { name: 'Carrot', hunger: 6, health: 1, spoilTime: 720 },
    apple: { name: 'Apple', hunger: 8, health: 2, spoilTime: 600 },
    honey: { name: 'Honey', hunger: 15, health: 3, spoilTime: null }, // Doesn't spoil
    seaweed: { name: 'Seaweed', hunger: 3, health: 0, spoilTime: 360 }
};

export class FoodBuffSystem {
    constructor(game) {
        this.game = game;
        
        // Active buffs: { type: { power, endTime } }
        this.activeBuffs = {};
        
        // Cooking queue (for campfire cooking)
        this.cookingItems = [];
    }
    
    update(deltaTime) {
        const now = Date.now();
        const player = this.game.player;
        if (!player) return;
        
        // Initialize buff multipliers
        player.buffSpeed = player.buffSpeed || 1;
        player.buffDamage = player.buffDamage || 1;
        player.buffDefense = player.buffDefense || 1;
        player.buffStamina = player.buffStamina || 1;
        player.hungerDrainMult = player.hungerDrainMult || 1;
        
        // Update active buffs
        for (const [type, buff] of Object.entries(this.activeBuffs)) {
            if (now >= buff.endTime) {
                // Buff expired
                this.removeBuff(type);
            } else {
                // Apply buff effect
                const buffConfig = BUFF_TYPES[type];
                if (buffConfig && buffConfig.effect) {
                    buffConfig.effect(player, buff.power, deltaTime);
                }
            }
        }
        
        // Update cooking items
        this.updateCooking(deltaTime);
    }
    
    // Add a buff
    addBuff(type, power, duration) {
        const buffConfig = BUFF_TYPES[type];
        if (!buffConfig) return;
        
        const endTime = Date.now() + duration * 1000;
        
        // If buff already exists, extend or upgrade it
        if (this.activeBuffs[type]) {
            this.activeBuffs[type].power = Math.max(this.activeBuffs[type].power, power);
            this.activeBuffs[type].endTime = Math.max(this.activeBuffs[type].endTime, endTime);
        } else {
            this.activeBuffs[type] = { power, endTime };
        }
        
        // Show notification
        if (this.game.ui) {
            this.game.ui.showMessage(`${buffConfig.icon} ${buffConfig.name} activated!`, 2000);
        }
    }
    
    // Remove a buff
    removeBuff(type) {
        const buffConfig = BUFF_TYPES[type];
        if (buffConfig && buffConfig.clear && this.game.player) {
            buffConfig.clear(this.game.player);
        }
        delete this.activeBuffs[type];
    }
    
    // Eat food and apply effects
    eatFood(foodKey, inventory) {
        const player = this.game.player;
        if (!player) return false;
        
        // Check if it's cooked food
        let foodData = COOKED_FOODS[foodKey];
        if (!foodData) {
            // Check raw foods
            foodData = RAW_FOODS[foodKey];
        }
        
        if (!foodData) return false;
        
        // Apply hunger
        if (player.hunger !== undefined) {
            player.hunger = Math.min(100, player.hunger + foodData.hunger);
        }
        
        // Apply health
        if (foodData.health) {
            player.health = Math.min(player.maxHealth, player.health + foodData.health);
        }
        
        // Apply buffs
        if (foodData.buffs) {
            for (const buff of foodData.buffs) {
                this.addBuff(buff.type, buff.power, buff.duration);
            }
        }
        
        // Track statistics
        if (this.game.statistics) {
            this.game.statistics.onFoodEaten(foodKey);
        }
        
        // Play eating sound
        if (this.game.audio) {
            this.game.audio.playSound('eat');
        }
        
        return true;
    }
    
    // Start cooking an item
    startCooking(itemKey, cookingStation = 'campfire') {
        const recipe = COOKED_FOODS[itemKey];
        if (!recipe) return false;
        
        // Check if can be cooked from raw item
        if (recipe.cookFrom) {
            // Check inventory for raw item
            if (!this.game.inventory?.hasItem(recipe.cookFrom)) {
                return false;
            }
            
            // Remove raw item
            this.game.inventory.removeItem(recipe.cookFrom, 1);
        } else if (recipe.recipe) {
            // Check for recipe ingredients
            for (const [ingredient, count] of Object.entries(recipe.recipe)) {
                if (!this.game.inventory?.hasItem(ingredient, count)) {
                    if (this.game.ui) {
                        this.game.ui.showMessage(`Missing: ${ingredient}`, 2000);
                    }
                    return false;
                }
            }
            
            // Remove ingredients
            for (const [ingredient, count] of Object.entries(recipe.recipe)) {
                this.game.inventory.removeItem(ingredient, count);
            }
        }
        
        // Add to cooking queue
        this.cookingItems.push({
            result: itemKey,
            progress: 0,
            cookTime: recipe.cookTime,
            station: cookingStation
        });
        
        if (this.game.ui) {
            this.game.ui.showMessage(`🍳 Cooking ${recipe.name}...`, 2000);
        }
        
        return true;
    }
    
    // Update cooking progress
    updateCooking(deltaTime) {
        for (let i = this.cookingItems.length - 1; i >= 0; i--) {
            const item = this.cookingItems[i];
            item.progress += deltaTime;
            
            if (item.progress >= item.cookTime) {
                // Cooking complete
                if (this.game.inventory) {
                    this.game.inventory.addItem(item.result, 1);
                }
                
                const recipe = COOKED_FOODS[item.result];
                if (this.game.ui && recipe) {
                    this.game.ui.showMessage(`✅ ${recipe.name} is ready!`, 3000);
                }
                
                if (this.game.audio) {
                    this.game.audio.playSound('craft');
                }
                
                this.cookingItems.splice(i, 1);
            }
        }
    }
    
    // Get active buffs for UI display
    getActiveBuffs() {
        const now = Date.now();
        const result = [];
        
        for (const [type, buff] of Object.entries(this.activeBuffs)) {
            const config = BUFF_TYPES[type];
            if (!config) continue;
            
            const remaining = Math.max(0, (buff.endTime - now) / 1000);
            result.push({
                type,
                name: config.name,
                icon: config.icon,
                power: buff.power,
                remaining: Math.ceil(remaining)
            });
        }
        
        return result;
    }
    
    // Get cooking progress for UI
    getCookingProgress() {
        return this.cookingItems.map(item => ({
            result: item.result,
            progress: item.progress / item.cookTime,
            name: COOKED_FOODS[item.result]?.name || item.result
        }));
    }
    
    // Check if player has a specific buff
    hasBuff(type) {
        return !!this.activeBuffs[type];
    }
    
    // Get buff remaining time
    getBuffRemaining(type) {
        if (!this.activeBuffs[type]) return 0;
        return Math.max(0, (this.activeBuffs[type].endTime - Date.now()) / 1000);
    }
    
    // Serialize for save
    serialize() {
        return {
            activeBuffs: this.activeBuffs,
            cookingItems: this.cookingItems
        };
    }
    
    deserialize(data) {
        if (!data) return;
        
        this.activeBuffs = data.activeBuffs || {};
        this.cookingItems = data.cookingItems || [];
        
        // Adjust buff end times based on current time
        // (In case save/load happens across sessions)
    }
    
    // Clear all buffs
    clearAllBuffs() {
        for (const type of Object.keys(this.activeBuffs)) {
            this.removeBuff(type);
        }
    }
}

// Export food items for config integration
export const FOOD_ITEMS = {
    ...Object.fromEntries(
        Object.entries(COOKED_FOODS).map(([key, food]) => [
            key,
            {
                name: food.name,
                type: 'food',
                stackSize: 16,
                hunger: food.hunger,
                health: food.health,
                description: food.buffs 
                    ? `Grants: ${food.buffs.map(b => BUFF_TYPES[b.type]?.name).join(', ')}`
                    : 'Restores hunger.'
            }
        ])
    ),
    ...Object.fromEntries(
        Object.entries(RAW_FOODS).map(([key, food]) => [
            key,
            {
                name: food.name,
                type: 'food',
                stackSize: 32,
                hunger: food.hunger,
                health: food.health,
                description: food.spoilTime ? 'Will spoil over time.' : 'Does not spoil.'
            }
        ])
    )
};

// Export cooking recipes for crafting integration
export const COOKING_RECIPES = Object.fromEntries(
    Object.entries(COOKED_FOODS)
        .filter(([_, food]) => food.recipe || food.cookFrom)
        .map(([key, food]) => [
            key,
            {
                result: key,
                count: 1,
                requires: food.recipe || { [food.cookFrom]: 1 },
                station: 'campfire',
                cookTime: food.cookTime
            }
        ])
);
