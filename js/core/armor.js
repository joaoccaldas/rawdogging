// Armor System - Damage reduction and defense
import { ITEMS } from '../config.js';

// Armor slots and their protection values
export const ARMOR_SLOTS = {
    HEAD: 'head',
    CHEST: 'chest', 
    LEGS: 'legs',
    FEET: 'feet',
};

// Armor definitions
export const ARMOR_TYPES = {
    // Leather Armor (early game)
    leather_helmet: {
        name: 'Leather Cap',
        emoji: '🎩',
        slot: 'head',
        defense: 1,
        durability: 55,
        material: 'leather',
    },
    leather_chestplate: {
        name: 'Leather Tunic',
        emoji: '👕',
        slot: 'chest',
        defense: 3,
        durability: 80,
        material: 'leather',
    },
    leather_leggings: {
        name: 'Leather Leggings',
        emoji: '👖',
        slot: 'legs',
        defense: 2,
        durability: 75,
        material: 'leather',
    },
    leather_boots: {
        name: 'Leather Boots',
        emoji: '👢',
        slot: 'feet',
        defense: 1,
        durability: 65,
        material: 'leather',
    },
    
    // Bone Armor (mid game)
    bone_helmet: {
        name: 'Bone Helmet',
        emoji: '💀',
        slot: 'head',
        defense: 2,
        durability: 100,
        material: 'bone',
    },
    bone_chestplate: {
        name: 'Bone Chestplate',
        emoji: '🦴',
        slot: 'chest',
        defense: 5,
        durability: 150,
        material: 'bone',
    },
    bone_leggings: {
        name: 'Bone Leggings',
        emoji: '🦴',
        slot: 'legs',
        defense: 4,
        durability: 130,
        material: 'bone',
    },
    bone_boots: {
        name: 'Bone Boots',
        emoji: '🦴',
        slot: 'feet',
        defense: 2,
        durability: 110,
        material: 'bone',
    },
    
    // Bronze Armor (late game)
    bronze_helmet: {
        name: 'Bronze Helmet',
        emoji: '⛑️',
        slot: 'head',
        defense: 3,
        durability: 165,
        material: 'bronze',
    },
    bronze_chestplate: {
        name: 'Bronze Chestplate',
        emoji: '🛡️',
        slot: 'chest',
        defense: 8,
        durability: 240,
        material: 'bronze',
    },
    bronze_leggings: {
        name: 'Bronze Leggings',
        emoji: '🛡️',
        slot: 'legs',
        defense: 6,
        durability: 225,
        material: 'bronze',
    },
    bronze_boots: {
        name: 'Bronze Boots',
        emoji: '🛡️',
        slot: 'feet',
        defense: 3,
        durability: 195,
        material: 'bronze',
    },
};

export class ArmorSystem {
    constructor(game) {
        this.game = game;
        
        // Equipped armor by slot
        this.equipped = {
            head: null,
            chest: null,
            legs: null,
            feet: null,
        };
        
        // Durability tracking for each slot
        this.durability = {
            head: 0,
            chest: 0,
            legs: 0,
            feet: 0,
        };
    }
    
    // Equip armor from inventory
    equipArmor(itemKey) {
        const armorDef = ARMOR_TYPES[itemKey];
        if (!armorDef) return false;
        
        const slot = armorDef.slot;
        
        // Unequip current armor first
        if (this.equipped[slot]) {
            this.unequipArmor(slot);
        }
        
        // Equip new armor
        this.equipped[slot] = itemKey;
        this.durability[slot] = armorDef.durability;
        
        // Remove from inventory
        this.game.player?.removeItem(itemKey, 1);
        
        // Play sound
        this.game.audio?.play('equip');
        
        // Update UI
        this.updateArmorUI();
        
        return true;
    }

    // Equip armor that's already been removed from inventory
    equipArmorFromSlot(itemKey) {
        const armorDef = ARMOR_TYPES[itemKey];
        if (!armorDef) return false;
        
        const slot = armorDef.slot;
        
        // Unequip current armor first
        if (this.equipped[slot]) {
            this.unequipArmor(slot);
        }
        
        // Equip new armor
        this.equipped[slot] = itemKey;
        this.durability[slot] = armorDef.durability;
        
        // Play sound
        this.game.audio?.play('equip');
        
        // Update UI
        this.updateArmorUI();
        
        return true;
    }
    
    // Unequip armor to inventory
    unequipArmor(slot) {
        const itemKey = this.equipped[slot];
        if (!itemKey) return false;
        
        // Add back to inventory (if has space)
        const added = this.game.player?.addItem(itemKey, 1);
        if (!added) {
            this.game.ui?.showMessage('Inventory full!', 2000);
            return false;
        }
        
        this.equipped[slot] = null;
        this.durability[slot] = 0;
        
        this.updateArmorUI();
        return true;
    }
    
    // Calculate total defense points
    getTotalDefense() {
        let defense = 0;
        for (const slot of Object.keys(this.equipped)) {
            const itemKey = this.equipped[slot];
            if (itemKey) {
                const armorDef = ARMOR_TYPES[itemKey];
                if (armorDef) {
                    defense += armorDef.defense;
                }
            }
        }

        // Apply age progression defense bonus
        const defenseBonus = this.game.ageProgression?.getBonus('defenseBonus') || 1.0;
        return defense * defenseBonus;
    }
    
    // Calculate damage reduction (percentage)
    getDamageReduction() {
        const defense = this.getTotalDefense();
        // Formula: Each defense point reduces damage by ~4%, max 80% reduction
        return Math.min(0.8, defense * 0.04);
    }
    
    // Apply damage to armor (reduces durability)
    onDamageTaken(damage) {
        // Damage armor in random slots
        const slots = Object.keys(this.equipped).filter(s => this.equipped[s]);
        if (slots.length === 0) return;
        
        // Damage 1-2 armor pieces
        const slotsToHit = Math.min(slots.length, 1 + Math.floor(Math.random() * 2));
        
        for (let i = 0; i < slotsToHit; i++) {
            const slot = slots[Math.floor(Math.random() * slots.length)];
            this.durability[slot] -= Math.ceil(damage / 4);
            
            // Check if armor broke
            if (this.durability[slot] <= 0) {
                this.breakArmor(slot);
            }
        }
        
        this.updateArmorUI();
    }
    
    breakArmor(slot) {
        const itemKey = this.equipped[slot];
        if (!itemKey) return;
        
        this.equipped[slot] = null;
        this.durability[slot] = 0;
        
        // Play break sound and show message
        this.game.audio?.play('break');
        const armorDef = ARMOR_TYPES[itemKey];
        this.game.ui?.showMessage(`💔 ${armorDef?.name || 'Armor'} broke!`, 2000);
        this.game.particles?.spawn('dust', this.game.player.x, this.game.player.y, this.game.player.z + 1, 5);
    }
    
    // Get armor for a specific slot
    getEquipped(slot) {
        return this.equipped[slot];
    }
    
    // Get durability percentage for slot
    getDurabilityPercent(slot) {
        const itemKey = this.equipped[slot];
        if (!itemKey) return 0;
        
        const armorDef = ARMOR_TYPES[itemKey];
        if (!armorDef) return 0;
        
        return Math.max(0, Math.min(100, (this.durability[slot] / armorDef.durability) * 100));
    }
    
    // Update armor display
    updateArmorUI() {
        const armorDisplay = document.getElementById('armor-display');
        if (!armorDisplay) return;
        
        const defense = this.getTotalDefense();
        const reduction = Math.round(this.getDamageReduction() * 100);
        
        let html = `<div class="armor-stat">🛡️ ${defense} (${reduction}% DR)</div>`;
        
        for (const [slot, itemKey] of Object.entries(this.equipped)) {
            if (itemKey) {
                const armorDef = ARMOR_TYPES[itemKey];
                const durPercent = this.getDurabilityPercent(slot);
                const durColor = durPercent > 50 ? '#4ade80' : durPercent > 25 ? '#fbbf24' : '#ef4444';
                
                html += `
                    <div class="armor-slot" title="${armorDef.name}">
                        <span class="armor-emoji">${armorDef.emoji}</span>
                        <div class="armor-durability" style="width: ${durPercent}%; background: ${durColor}"></div>
                    </div>
                `;
            }
        }
        
        armorDisplay.innerHTML = html;
    }
    
    // Serialize for save
    serialize() {
        return {
            equipped: { ...this.equipped },
            durability: { ...this.durability },
        };
    }
    
    deserialize(data) {
        if (data) {
            this.equipped = data.equipped || { head: null, chest: null, legs: null, feet: null };
            this.durability = data.durability || { head: 0, chest: 0, legs: 0, feet: 0 };
            this.updateArmorUI();
        }
    }
    
    reset() {
        this.equipped = { head: null, chest: null, legs: null, feet: null };
        this.durability = { head: 0, chest: 0, legs: 0, feet: 0 };
        this.updateArmorUI();
    }
}

// Add armor items to ITEMS config
export const ARMOR_ITEMS = {
    leather_helmet: { name: 'Leather Cap', emoji: '🎩', stackable: false, type: 'armor', armorSlot: 'head' },
    leather_chestplate: { name: 'Leather Tunic', emoji: '👕', stackable: false, type: 'armor', armorSlot: 'chest' },
    leather_leggings: { name: 'Leather Leggings', emoji: '👖', stackable: false, type: 'armor', armorSlot: 'legs' },
    leather_boots: { name: 'Leather Boots', emoji: '👢', stackable: false, type: 'armor', armorSlot: 'feet' },
    
    bone_helmet: { name: 'Bone Helmet', emoji: '💀', stackable: false, type: 'armor', armorSlot: 'head' },
    bone_chestplate: { name: 'Bone Chestplate', emoji: '🦴', stackable: false, type: 'armor', armorSlot: 'chest' },
    bone_leggings: { name: 'Bone Leggings', emoji: '🦴', stackable: false, type: 'armor', armorSlot: 'legs' },
    bone_boots: { name: 'Bone Boots', emoji: '🦴', stackable: false, type: 'armor', armorSlot: 'feet' },
    
    bronze_helmet: { name: 'Bronze Helmet', emoji: '⛑️', stackable: false, type: 'armor', armorSlot: 'head' },
    bronze_chestplate: { name: 'Bronze Chestplate', emoji: '🛡️', stackable: false, type: 'armor', armorSlot: 'chest' },
    bronze_leggings: { name: 'Bronze Leggings', emoji: '🛡️', stackable: false, type: 'armor', armorSlot: 'legs' },
    bronze_boots: { name: 'Bronze Boots', emoji: '🛡️', stackable: false, type: 'armor', armorSlot: 'feet' },
};

// Armor crafting recipes
export const ARMOR_RECIPES = [
    // Leather armor
    { result: 'leather_helmet', count: 1, ingredients: [['leather', 5]] },
    { result: 'leather_chestplate', count: 1, ingredients: [['leather', 8]] },
    { result: 'leather_leggings', count: 1, ingredients: [['leather', 7]] },
    { result: 'leather_boots', count: 1, ingredients: [['leather', 4]] },
    
    // Bone armor
    { result: 'bone_helmet', count: 1, ingredients: [['bone', 5], ['leather', 2]] },
    { result: 'bone_chestplate', count: 1, ingredients: [['bone', 8], ['leather', 3]] },
    { result: 'bone_leggings', count: 1, ingredients: [['bone', 7], ['leather', 2]] },
    { result: 'bone_boots', count: 1, ingredients: [['bone', 4], ['leather', 1]] },
    
    // Bronze armor (requires iron ingots as bronze substitute for now)
    { result: 'bronze_helmet', count: 1, ingredients: [['iron_ingot', 5]] },
    { result: 'bronze_chestplate', count: 1, ingredients: [['iron_ingot', 8]] },
    { result: 'bronze_leggings', count: 1, ingredients: [['iron_ingot', 7]] },
    { result: 'bronze_boots', count: 1, ingredients: [['iron_ingot', 4]] },
];
