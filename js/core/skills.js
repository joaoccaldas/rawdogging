// Skills and Perks System
import { CONFIG } from '../config.js';

// Skill definitions
export const SKILLS = {
    // Gathering skills
    MINING: {
        id: 'mining',
        name: 'Mining',
        emoji: '⛏️',
        description: 'Improves mining speed and ore drops',
        maxLevel: 10,
        xpPerAction: 5,
        bonusPerLevel: {
            miningSpeed: 0.1,     // +10% per level
            oreDropChance: 0.05  // +5% chance for extra drops
        }
    },
    WOODCUTTING: {
        id: 'woodcutting',
        name: 'Woodcutting',
        emoji: '🪓',
        description: 'Improves chopping speed and wood drops',
        maxLevel: 10,
        xpPerAction: 4,
        bonusPerLevel: {
            choppingSpeed: 0.1,
            extraWoodChance: 0.05
        }
    },
    GATHERING: {
        id: 'gathering',
        name: 'Gathering',
        emoji: '🌿',
        description: 'Find more resources when foraging',
        maxLevel: 10,
        xpPerAction: 3,
        bonusPerLevel: {
            harvestYield: 0.1,
            rareDropChance: 0.02
        }
    },
    
    // Combat skills
    COMBAT: {
        id: 'combat',
        name: 'Combat',
        emoji: '⚔️',
        description: 'Deal more damage in fights',
        maxLevel: 10,
        xpPerAction: 10,
        bonusPerLevel: {
            damage: 0.08,        // +8% damage per level
            critChance: 0.02    // +2% crit chance per level
        }
    },
    DEFENSE: {
        id: 'defense',
        name: 'Defense',
        emoji: '🛡️',
        description: 'Take less damage from attacks',
        maxLevel: 10,
        xpPerAction: 8,
        bonusPerLevel: {
            damageReduction: 0.05,  // -5% damage taken per level
            knockbackResist: 0.1
        }
    },
    HUNTING: {
        id: 'hunting',
        name: 'Hunting',
        emoji: '🏹',
        description: 'Better drops from animals',
        maxLevel: 10,
        xpPerAction: 6,
        bonusPerLevel: {
            meatDrop: 0.1,
            leatherDrop: 0.08,
            boneDrop: 0.05
        }
    },
    
    // Survival skills
    COOKING: {
        id: 'cooking',
        name: 'Cooking',
        emoji: '🍖',
        description: 'Food restores more hunger',
        maxLevel: 10,
        xpPerAction: 4,
        bonusPerLevel: {
            hungerRestored: 0.1,
            healthBonus: 0.05
        }
    },
    CRAFTING: {
        id: 'crafting',
        name: 'Crafting',
        emoji: '🔨',
        description: 'Craft items with bonus durability',
        maxLevel: 10,
        xpPerAction: 5,
        bonusPerLevel: {
            durabilityBonus: 0.1,
            materialSaveChance: 0.03
        }
    },
    SURVIVAL: {
        id: 'survival',
        name: 'Survival',
        emoji: '🏕️',
        description: 'Reduced hunger drain',
        maxLevel: 10,
        xpPerAction: 2,
        bonusPerLevel: {
            hungerDrainReduction: 0.05,
            maxHealth: 5,
            maxHunger: 5
        }
    },
    
    // Special skills
    TAMING: {
        id: 'taming',
        name: 'Taming',
        emoji: '🐺',
        description: 'Tame and control animals',
        maxLevel: 5,
        xpPerAction: 20,
        bonusPerLevel: {
            tameChance: 0.1,
            petDamage: 0.15,
            petHealth: 0.1
        }
    }
};

// Perks that unlock at certain skill levels
export const PERKS = {
    // Mining perks
    LUCKY_MINER: {
        id: 'lucky_miner',
        name: 'Lucky Miner',
        emoji: '🍀',
        description: 'Small chance for double ore drops',
        skillRequired: 'mining',
        levelRequired: 5,
        effect: { doubleDropChance: 0.15 }
    },
    EFFICIENT_MINING: {
        id: 'efficient_mining',
        name: 'Efficient Mining',
        emoji: '💎',
        description: 'Tools last 25% longer when mining',
        skillRequired: 'mining',
        levelRequired: 8,
        effect: { durabilityReduction: 0.25 }
    },
    
    // Combat perks
    CRITICAL_STRIKER: {
        id: 'critical_striker',
        name: 'Critical Striker',
        emoji: '💥',
        description: 'Critical hits deal 50% more damage',
        skillRequired: 'combat',
        levelRequired: 5,
        effect: { critDamageBonus: 0.5 }
    },
    BERSERKER: {
        id: 'berserker',
        name: 'Berserker',
        emoji: '🔥',
        description: 'Deal more damage when low health',
        skillRequired: 'combat',
        levelRequired: 8,
        effect: { lowHealthDamageBonus: 0.5 }
    },
    
    // Defense perks
    IRON_SKIN: {
        id: 'iron_skin',
        name: 'Iron Skin',
        emoji: '🪨',
        description: 'Take 20% less damage from all sources',
        skillRequired: 'defense',
        levelRequired: 5,
        effect: { flatDamageReduction: 0.2 }
    },
    SECOND_WIND: {
        id: 'second_wind',
        name: 'Second Wind',
        emoji: '💨',
        description: 'Slowly regenerate health when not in combat',
        skillRequired: 'defense',
        levelRequired: 8,
        effect: { passiveRegen: 0.5 }
    },
    
    // Survival perks
    WELL_FED: {
        id: 'well_fed',
        name: 'Well Fed',
        emoji: '🥩',
        description: 'Max hunger increased by 50',
        skillRequired: 'cooking',
        levelRequired: 5,
        effect: { maxHungerBonus: 50 }
    },
    MASTER_CHEF: {
        id: 'master_chef',
        name: 'Master Chef',
        emoji: '👨‍🍳',
        description: 'Cooked food gives regeneration buff',
        skillRequired: 'cooking',
        levelRequired: 8,
        effect: { cookingRegenBuff: true }
    },
    
    // Taming perks
    BEAST_FRIEND: {
        id: 'beast_friend',
        name: 'Beast Friend',
        emoji: '🐕',
        description: 'Can have 2 pets at once',
        skillRequired: 'taming',
        levelRequired: 3,
        effect: { maxPets: 2 }
    },
    ALPHA_BOND: {
        id: 'alpha_bond',
        name: 'Alpha Bond',
        emoji: '👑',
        description: 'Pets deal 50% more damage',
        skillRequired: 'taming',
        levelRequired: 5,
        effect: { petDamageBonus: 0.5 }
    }
};

export class SkillsManager {
    constructor(game) {
        this.game = game;
        this.skills = {};
        this.perks = {};
        this.unlockedPerks = new Set();
        
        // Initialize all skills at level 0
        for (const [key, skill] of Object.entries(SKILLS)) {
            this.skills[skill.id] = {
                level: 0,
                xp: 0,
                xpToNext: this.calculateXpToLevel(1)
            };
        }
    }
    
    calculateXpToLevel(level) {
        // XP curve: 100 * level^1.5
        return Math.floor(100 * Math.pow(level, 1.5));
    }
    
    addSkillXp(skillId, amount) {
        const skillData = this.skills[skillId];
        const skillDef = Object.values(SKILLS).find(s => s.id === skillId);
        
        if (!skillData || !skillDef) return;
        if (skillData.level >= skillDef.maxLevel) return; // Max level reached
        
        skillData.xp += amount;
        
        // Check for level up
        while (skillData.xp >= skillData.xpToNext && skillData.level < skillDef.maxLevel) {
            skillData.xp -= skillData.xpToNext;
            skillData.level++;
            skillData.xpToNext = this.calculateXpToLevel(skillData.level + 1);
            
            this.onSkillLevelUp(skillId, skillData.level);
        }
    }
    
    onSkillLevelUp(skillId, newLevel) {
        const skillDef = Object.values(SKILLS).find(s => s.id === skillId);
        if (!skillDef) return;
        
        // Play sound
        if (this.game.audio) {
            this.game.audio.play('level_up');
        }
        
        // Show notification
        if (this.game.ui) {
            this.game.ui.showNotification(
                `${skillDef.emoji} ${skillDef.name} leveled up to ${newLevel}!`, 
                'success', 
                3000
            );
        }
        
        // Check for new perks
        this.checkPerkUnlocks(skillId, newLevel);
    }
    
    checkPerkUnlocks(skillId, level) {
        for (const [key, perk] of Object.entries(PERKS)) {
            if (perk.skillRequired === skillId && 
                perk.levelRequired <= level && 
                !this.unlockedPerks.has(perk.id)) {
                
                this.unlockPerk(perk);
            }
        }
    }
    
    unlockPerk(perk) {
        this.unlockedPerks.add(perk.id);
        
        // Play sound
        if (this.game.audio) {
            this.game.audio.play('quest_complete');
        }
        
        // Show notification
        if (this.game.ui) {
            this.game.ui.showNotification(
                `${perk.emoji} Perk Unlocked: ${perk.name}!`, 
                'success', 
                4000
            );
        }
    }
    
    getSkillLevel(skillId) {
        return this.skills[skillId]?.level || 0;
    }
    
    getSkillBonus(skillId, bonusType) {
        const skillData = this.skills[skillId];
        const skillDef = Object.values(SKILLS).find(s => s.id === skillId);
        
        if (!skillData || !skillDef) return 0;
        
        const bonusPerLevel = skillDef.bonusPerLevel[bonusType] || 0;
        return bonusPerLevel * skillData.level;
    }
    
    hasPerk(perkId) {
        return this.unlockedPerks.has(perkId);
    }
    
    getPerkEffect(perkId, effectKey) {
        if (!this.hasPerk(perkId)) return 0;
        const perk = Object.values(PERKS).find(p => p.id === perkId);
        return perk?.effect[effectKey] || 0;
    }
    
    // Calculate total damage bonus from all sources
    getTotalDamageBonus() {
        let bonus = 1.0;
        bonus += this.getSkillBonus('combat', 'damage');
        
        // Berserker perk (low health bonus)
        if (this.hasPerk('berserker') && this.game.player) {
            const healthPercent = this.game.player.health / this.game.player.maxHealth;
            if (healthPercent < 0.3) {
                bonus += this.getPerkEffect('berserker', 'lowHealthDamageBonus');
            }
        }
        
        return bonus;
    }
    
    // Calculate total damage reduction from all sources
    getTotalDamageReduction() {
        let reduction = 0;
        reduction += this.getSkillBonus('defense', 'damageReduction');
        reduction += this.getPerkEffect('iron_skin', 'flatDamageReduction');
        return Math.min(0.8, reduction); // Cap at 80% reduction
    }
    
    // Calculate mining speed multiplier
    getMiningSpeedMultiplier() {
        let mult = 1.0;
        mult += this.getSkillBonus('mining', 'miningSpeed');
        return mult;
    }
    
    // Calculate extra drop chance
    getExtraDropChance(skillId) {
        let chance = 0;
        if (skillId === 'mining') {
            chance += this.getSkillBonus('mining', 'oreDropChance');
            chance += this.getPerkEffect('lucky_miner', 'doubleDropChance');
        }
        return chance;
    }
    
    // Serialize for save
    serialize() {
        return {
            skills: this.skills,
            unlockedPerks: Array.from(this.unlockedPerks)
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data.skills) {
            this.skills = data.skills;
        }
        if (data.unlockedPerks) {
            this.unlockedPerks = new Set(data.unlockedPerks);
        }
    }
    
    // Reset for new game
    reset() {
        for (const [key, skill] of Object.entries(SKILLS)) {
            this.skills[skill.id] = {
                level: 0,
                xp: 0,
                xpToNext: this.calculateXpToLevel(1)
            };
        }
        this.unlockedPerks.clear();
    }
}
