// Age Progression Manager - Enforces age gates and applies bonuses
import { CONFIG, ITEMS, RECIPES } from '../config.js';
import { AGES, QUESTS } from './quests.js';

export class AgeProgressionManager {
    constructor(game) {
        this.game = game;
        
        // Current age index (0 = Stone Age)
        this.currentAgeIndex = 0;
        this.currentAge = 'STONE_AGE';
        
        // Unlocked ages
        this.unlockedAges = new Set(['STONE_AGE']);
        
        // Age bonuses currently applied
        this.activeBonuses = {};
        
        // Age order for progression
        this.ageOrder = [
            'STONE_AGE',
            'TRIBAL_AGE', 
            'BRONZE_AGE',
            'IRON_AGE',
            'MEDIEVAL_AGE',
            'INDUSTRIAL_AGE',
            'MODERN_AGE'
        ];
        
        // Age requirements (what's needed to unlock each age)
        this.ageRequirements = {
            TRIBAL_AGE: {
                quests: ['eternal_flame', 'night_watch'],
                level: 5,
                items: { leather: 10, bone: 15 }
            },
            BRONZE_AGE: {
                quests: ['tame_companion'],
                level: 10,
                items: { copper_ore: 20, tin_ore: 20 }
            },
            IRON_AGE: {
                quests: ['master_crafter'],
                level: 20,
                items: { bronze_ingot: 30, iron_ore: 50 }
            },
            MEDIEVAL_AGE: {
                quests: ['forge_steel'],
                level: 35,
                items: { iron_ingot: 100, steel_ingot: 20 }
            },
            INDUSTRIAL_AGE: {
                quests: [],
                level: 50,
                items: { steel_ingot: 200, gear: 50 }
            },
            MODERN_AGE: {
                quests: [],
                level: 75,
                items: { electric_motor: 20, microchip: 50 }
            }
        };
        
        // Bonuses per age
        this.ageBonuses = {
            STONE_AGE: {
                miningSpeed: 1.0,
                craftingSpeed: 1.0,
                damageBonus: 1.0,
                defenseBonus: 1.0,
                tamingBonus: 1.0,
                hungerDrain: 1.0
            },
            TRIBAL_AGE: {
                miningSpeed: 1.15,
                craftingSpeed: 1.1,
                damageBonus: 1.1,
                defenseBonus: 1.1,
                tamingBonus: 1.25,
                hungerDrain: 0.95
            },
            BRONZE_AGE: {
                miningSpeed: 1.35,
                craftingSpeed: 1.25,
                damageBonus: 1.25,
                defenseBonus: 1.2,
                tamingBonus: 1.5,
                hungerDrain: 0.9
            },
            IRON_AGE: {
                miningSpeed: 1.6,
                craftingSpeed: 1.4,
                damageBonus: 1.4,
                defenseBonus: 1.35,
                tamingBonus: 1.75,
                hungerDrain: 0.85
            },
            MEDIEVAL_AGE: {
                miningSpeed: 1.9,
                craftingSpeed: 1.6,
                damageBonus: 1.6,
                defenseBonus: 1.5,
                tamingBonus: 2.0,
                hungerDrain: 0.8
            },
            INDUSTRIAL_AGE: {
                miningSpeed: 2.5,
                craftingSpeed: 2.0,
                damageBonus: 2.0,
                defenseBonus: 1.8,
                tamingBonus: 2.5,
                hungerDrain: 0.7
            },
            MODERN_AGE: {
                miningSpeed: 3.5,
                craftingSpeed: 3.0,
                damageBonus: 2.5,
                defenseBonus: 2.2,
                tamingBonus: 3.0,
                hungerDrain: 0.5
            }
        };
    }
    
    init() {
        this.applyAgeBonuses();
        this.updateAgeUI();
    }
    
    // Check if an age is unlocked
    isAgeUnlocked(ageName) {
        return this.unlockedAges.has(ageName);
    }
    
    // Get the age index (for recipe filtering)
    getAgeIndex(ageName) {
        return this.ageOrder.indexOf(ageName);
    }
    
    // Check if player meets requirements for an age
    checkAgeRequirements(ageName) {
        const req = this.ageRequirements[ageName];
        if (!req) return true; // No requirements = unlocked
        
        const player = this.game.player;
        const questManager = this.game.questManager;
        
        // Check level requirement
        if (player.level < req.level) {
            return { met: false, reason: `Requires level ${req.level}` };
        }
        
        // Check quest requirements
        for (const questId of req.quests) {
            if (questManager && !questManager.isQuestCompleted(questId)) {
                return { met: false, reason: `Complete quest: ${questId}` };
            }
        }
        
        // Check item requirements (lifetime collected, not current inventory)
        const stats = this.game.statistics;
        if (stats && req.items) {
            for (const [itemKey, amount] of Object.entries(req.items)) {
                const collected = stats.getItemsCollected(itemKey) || 0;
                if (collected < amount) {
                    return { met: false, reason: `Collect ${amount} ${itemKey} (${collected}/${amount})` };
                }
            }
        }
        
        return { met: true };
    }
    
    // Attempt to unlock the next age
    tryUnlockNextAge() {
        const nextIndex = this.currentAgeIndex + 1;
        if (nextIndex >= this.ageOrder.length) return false;
        
        const nextAge = this.ageOrder[nextIndex];
        const check = this.checkAgeRequirements(nextAge);
        
        if (check.met) {
            this.unlockAge(nextAge);
            return true;
        }
        
        return false;
    }
    
    // Unlock a specific age
    unlockAge(ageName) {
        if (this.unlockedAges.has(ageName)) return;
        
        this.unlockedAges.add(ageName);
        
        // If this is the next progression, advance current age
        const ageIndex = this.getAgeIndex(ageName);
        if (ageIndex === this.currentAgeIndex + 1) {
            this.currentAgeIndex = ageIndex;
            this.currentAge = ageName;
            this.applyAgeBonuses();
            
            // Announce age advancement
            const ageData = AGES[ageName];
            this.game.ui?.showNotification(
                `🎉 Welcome to the ${ageData?.name || ageName}!`,
                'success',
                5000
            );
            
            // Play fanfare
            this.game.audio?.play('level_up');
            
            // Grant bonus rewards
            this.grantAgeRewards(ageName);
        }
        
        this.updateAgeUI();
    }
    
    // Grant rewards for reaching a new age
    grantAgeRewards(ageName) {
        const player = this.game.player;
        
        switch (ageName) {
            case 'TRIBAL_AGE':
                player.addItem('bone_tools', 1);
                player.addItem('leather', 10);
                player.gainXP(500);
                break;
            case 'BRONZE_AGE':
                player.addItem('bronze_pickaxe', 1);
                player.addItem('bronze_sword', 1);
                player.gainXP(1000);
                break;
            case 'IRON_AGE':
                player.addItem('iron_pickaxe', 1);
                player.addItem('iron_armor', 1);
                player.gainXP(2000);
                break;
            case 'MEDIEVAL_AGE':
                player.addItem('steel_sword', 1);
                player.addItem('chainmail_chestplate', 1);
                player.gainXP(5000);
                break;
            case 'INDUSTRIAL_AGE':
                player.addItem('rifle', 1);
                player.addItem('bullet', 50);
                player.gainXP(10000);
                break;
            case 'MODERN_AGE':
                player.addItem('exo_suit', 1);
                player.addItem('laser_rifle', 1);
                player.gainXP(25000);
                break;
        }
    }
    
    // Apply bonuses for current age
    applyAgeBonuses() {
        this.activeBonuses = this.ageBonuses[this.currentAge] || this.ageBonuses.STONE_AGE;
    }
    
    // Get a specific bonus value
    getBonus(bonusType) {
        return this.activeBonuses[bonusType] || 1.0;
    }
    
    // Check if a recipe is available in current age
    isRecipeAvailable(recipe) {
        if (!recipe.age) return true; // No age requirement
        const recipeAgeIndex = recipe.age;
        return recipeAgeIndex <= this.currentAgeIndex;
    }
    
    // Update the age display in UI
    updateAgeUI() {
        const ageText = document.getElementById('age-text');
        if (ageText) {
            const ageData = AGES[this.currentAge];
            const icons = ['🦴', '🦴', '🥉', '⚔️', '🏰', '⚙️', '💻'];
            const icon = icons[this.currentAgeIndex] || '🦴';
            ageText.textContent = `${icon} ${ageData?.name || 'Stone Age'}`;
        }
    }
    
    // Update called each frame
    update(deltaTime) {
        // Periodically check if player can advance
        if (Math.random() < 0.01) { // ~1% chance per frame to check
            this.tryUnlockNextAge();
        }
    }
    
    // Serialize for save
    serialize() {
        return {
            currentAgeIndex: this.currentAgeIndex,
            currentAge: this.currentAge,
            unlockedAges: Array.from(this.unlockedAges)
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            this.currentAgeIndex = data.currentAgeIndex || 0;
            this.currentAge = data.currentAge || 'STONE_AGE';
            this.unlockedAges = new Set(data.unlockedAges || ['STONE_AGE']);
            this.applyAgeBonuses();
            this.updateAgeUI();
        }
    }
    
    // Reset
    reset() {
        this.currentAgeIndex = 0;
        this.currentAge = 'STONE_AGE';
        this.unlockedAges = new Set(['STONE_AGE']);
        this.applyAgeBonuses();
        this.updateAgeUI();
    }
}
