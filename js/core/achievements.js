// Achievement System - Track milestones and unlock rewards
import { CONFIG } from '../config.js';

export const ACHIEVEMENT_CATEGORIES = {
    EXPLORATION: 'exploration',
    COMBAT: 'combat',
    GATHERING: 'gathering',
    CRAFTING: 'crafting',
    SURVIVAL: 'survival',
    TAMING: 'taming',
    BUILDING: 'building',
    SECRET: 'secret'
};

export const ACHIEVEMENTS = {
    // Exploration Achievements
    FIRST_STEPS: {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Move for the first time',
        icon: '👣',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        requirement: { type: 'distance', value: 10 },
        reward: { xp: 10 }
    },
    WANDERER: {
        id: 'wanderer',
        name: 'Wanderer',
        description: 'Travel 1000 blocks',
        icon: '🚶',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        requirement: { type: 'distance', value: 1000 },
        reward: { xp: 100 }
    },
    EXPLORER: {
        id: 'explorer',
        name: 'Explorer',
        description: 'Discover all biomes',
        icon: '🗺️',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        requirement: { type: 'biomes', value: 5 },
        reward: { xp: 500, item: { id: 'compass', quantity: 1 } }
    },
    MOUNTAINEER: {
        id: 'mountaineer',
        name: 'Mountaineer',
        description: 'Reach elevation 50',
        icon: '⛰️',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        requirement: { type: 'elevation', value: 50 },
        reward: { xp: 200 }
    },
    
    // Combat Achievements
    FIRST_BLOOD: {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        icon: '⚔️',
        category: ACHIEVEMENT_CATEGORIES.COMBAT,
        requirement: { type: 'kills', value: 1 },
        reward: { xp: 25 }
    },
    WARRIOR: {
        id: 'warrior',
        name: 'Warrior',
        description: 'Defeat 50 enemies',
        icon: '🗡️',
        category: ACHIEVEMENT_CATEGORIES.COMBAT,
        requirement: { type: 'kills', value: 50 },
        reward: { xp: 250 }
    },
    SLAYER: {
        id: 'slayer',
        name: 'Slayer',
        description: 'Defeat 200 enemies',
        icon: '💀',
        category: ACHIEVEMENT_CATEGORIES.COMBAT,
        requirement: { type: 'kills', value: 200 },
        reward: { xp: 500, item: { id: 'trophy', quantity: 1 } }
    },
    COMBO_MASTER: {
        id: 'combo_master',
        name: 'Combo Master',
        description: 'Reach a 10x combo streak',
        icon: '🔥',
        category: ACHIEVEMENT_CATEGORIES.COMBAT,
        requirement: { type: 'combo_streak', value: 10 },
        reward: { xp: 300 }
    },
    SURVIVOR: {
        id: 'survivor',
        name: 'Survivor',
        description: 'Survive 10 attacks at low health',
        icon: '💪',
        category: ACHIEVEMENT_CATEGORIES.COMBAT,
        requirement: { type: 'low_health_survived', value: 10 },
        reward: { xp: 200 }
    },
    
    // Gathering Achievements
    GATHERER: {
        id: 'gatherer',
        name: 'Gatherer',
        description: 'Collect 100 resources',
        icon: '🌾',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'resources_gathered', value: 100 },
        reward: { xp: 50 }
    },
    HOARDER: {
        id: 'hoarder',
        name: 'Hoarder',
        description: 'Collect 1000 resources',
        icon: '📦',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'resources_gathered', value: 1000 },
        reward: { xp: 300 }
    },
    LUMBERJACK: {
        id: 'lumberjack',
        name: 'Lumberjack',
        description: 'Chop down 50 trees',
        icon: '🪓',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'trees_chopped', value: 50 },
        reward: { xp: 150 }
    },
    MINER: {
        id: 'miner',
        name: 'Miner',
        description: 'Mine 100 stone blocks',
        icon: '⛏️',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'stone_mined', value: 100 },
        reward: { xp: 150 }
    },
    
    // Crafting Achievements
    CRAFTER: {
        id: 'crafter',
        name: 'Crafter',
        description: 'Craft your first item',
        icon: '🔧',
        category: ACHIEVEMENT_CATEGORIES.CRAFTING,
        requirement: { type: 'items_crafted', value: 1 },
        reward: { xp: 20 }
    },
    ARTISAN: {
        id: 'artisan',
        name: 'Artisan',
        description: 'Craft 50 items',
        icon: '🛠️',
        category: ACHIEVEMENT_CATEGORIES.CRAFTING,
        requirement: { type: 'items_crafted', value: 50 },
        reward: { xp: 200 }
    },
    MASTER_SMITH: {
        id: 'master_smith',
        name: 'Master Smith',
        description: 'Craft a metal weapon',
        icon: '🗡️',
        category: ACHIEVEMENT_CATEGORIES.CRAFTING,
        requirement: { type: 'metal_weapon_crafted', value: 1 },
        reward: { xp: 250 }
    },
    
    // Survival Achievements
    NIGHT_OWL: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Survive your first night',
        icon: '🌙',
        category: ACHIEVEMENT_CATEGORIES.SURVIVAL,
        requirement: { type: 'nights_survived', value: 1 },
        reward: { xp: 50 }
    },
    VETERAN: {
        id: 'veteran',
        name: 'Veteran',
        description: 'Survive 10 nights',
        icon: '⭐',
        category: ACHIEVEMENT_CATEGORIES.SURVIVAL,
        requirement: { type: 'nights_survived', value: 10 },
        reward: { xp: 300 }
    },
    WELL_FED: {
        id: 'well_fed',
        name: 'Well Fed',
        description: 'Eat 100 food items',
        icon: '🍖',
        category: ACHIEVEMENT_CATEGORIES.SURVIVAL,
        requirement: { type: 'food_eaten', value: 100 },
        reward: { xp: 100 }
    },
    STORM_RIDER: {
        id: 'storm_rider',
        name: 'Storm Rider',
        description: 'Survive a thunderstorm',
        icon: '⛈️',
        category: ACHIEVEMENT_CATEGORIES.SURVIVAL,
        requirement: { type: 'storms_survived', value: 1 },
        reward: { xp: 150 }
    },
    
    // Taming Achievements
    ANIMAL_FRIEND: {
        id: 'animal_friend',
        name: 'Animal Friend',
        description: 'Tame your first animal',
        icon: '🐾',
        category: ACHIEVEMENT_CATEGORIES.TAMING,
        requirement: { type: 'animals_tamed', value: 1 },
        reward: { xp: 75 }
    },
    PACK_LEADER: {
        id: 'pack_leader',
        name: 'Pack Leader',
        description: 'Have 5 tamed animals',
        icon: '🐺',
        category: ACHIEVEMENT_CATEGORIES.TAMING,
        requirement: { type: 'max_pets', value: 5 },
        reward: { xp: 400 }
    },
    
    // Building Achievements
    HOME_BUILDER: {
        id: 'home_builder',
        name: 'Home Builder',
        description: 'Place 100 blocks',
        icon: '🏠',
        category: ACHIEVEMENT_CATEGORIES.BUILDING,
        requirement: { type: 'blocks_placed', value: 100 },
        reward: { xp: 150 }
    },
    ARCHITECT: {
        id: 'architect',
        name: 'Architect',
        description: 'Place 1000 blocks',
        icon: '🏰',
        category: ACHIEVEMENT_CATEGORIES.BUILDING,
        requirement: { type: 'blocks_placed', value: 1000 },
        reward: { xp: 500 }
    },
    
    // Secret Achievements
    EASTER_EGG: {
        id: 'easter_egg',
        name: '???',
        description: 'Find the hidden cave',
        icon: '❓',
        category: ACHIEVEMENT_CATEGORIES.SECRET,
        requirement: { type: 'secret_cave_found', value: 1 },
        reward: { xp: 1000, item: { id: 'ancient_artifact', quantity: 1 } },
        hidden: true
    },
    
    // Content Unlock Achievements
    DUNGEON_DELVER: {
        id: 'dungeon_delver',
        name: 'Dungeon Delver',
        description: 'Clear your first dungeon',
        icon: '🏰',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        requirement: { type: 'dungeons_cleared', value: 1 },
        reward: { xp: 200 },
        unlocks: { blueprint: 'blueprint_tower' }
    },
    MASTER_ANGLER: {
        id: 'master_angler',
        name: 'Master Angler',
        description: 'Catch 100 fish',
        icon: '🎣',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'fish_caught', value: 100 },
        reward: { xp: 300, item: { id: 'master_rod', quantity: 1 } },
        unlocks: { recipe: 'golden_lure' }
    },
    LEGENDARY_CATCH: {
        id: 'legendary_angler',
        name: 'Legendary Catch',
        description: 'Catch a legendary fish',
        icon: '🐟',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'legendary_fish_caught', value: 1 },
        reward: { xp: 500, item: { id: 'lucky_charm', quantity: 1 } }
    },
    MASTER_TAMER: {
        id: 'master_tamer',
        name: 'Master Tamer',
        description: 'Level a pet to 10',
        icon: '🐕',
        category: ACHIEVEMENT_CATEGORIES.TAMING,
        requirement: { type: 'pet_max_level', value: 10 },
        reward: { xp: 400 },
        unlocks: { maxPets: 1 }
    },
    PET_EVOLUTION: {
        id: 'pet_evolution',
        name: 'Evolution',
        description: 'Evolve a pet',
        icon: '✨',
        category: ACHIEVEMENT_CATEGORIES.TAMING,
        requirement: { type: 'pets_evolved', value: 1 },
        reward: { xp: 300, item: { id: 'evolution_stone', quantity: 1 } }
    },
    ALCHEMIST: {
        id: 'alchemist',
        name: 'Alchemist',
        description: 'Brew 20 potions',
        icon: '⚗️',
        category: ACHIEVEMENT_CATEGORIES.CRAFTING,
        requirement: { type: 'potions_brewed', value: 20 },
        reward: { xp: 250 },
        unlocks: { recipe: 'advanced_potions' }
    },
    ENCHANTER: {
        id: 'enchanter',
        name: 'Enchanter',
        description: 'Enchant 10 items',
        icon: '✨',
        category: ACHIEVEMENT_CATEGORIES.CRAFTING,
        requirement: { type: 'items_enchanted', value: 10 },
        reward: { xp: 300, item: { id: 'enchanting_crystal', quantity: 3 } }
    },
    FARMER: {
        id: 'farmer',
        name: 'Farmer',
        description: 'Harvest 50 crops',
        icon: '🌾',
        category: ACHIEVEMENT_CATEGORIES.GATHERING,
        requirement: { type: 'crops_harvested', value: 50 },
        reward: { xp: 150 },
        unlocks: { blueprint: 'blueprint_farm', item: { id: 'sprinkler', quantity: 1 } }
    },
    AUTOMATION_MASTER: {
        id: 'automation_master',
        name: 'Automation Master',
        description: 'Place 5 sprinklers or harvesters',
        icon: '⚙️',
        category: ACHIEVEMENT_CATEGORIES.BUILDING,
        requirement: { type: 'automation_placed', value: 5 },
        reward: { xp: 400, item: { id: 'auto_harvester', quantity: 1 } }
    },
    EVENT_SURVIVOR: {
        id: 'event_survivor',
        name: 'Event Survivor',
        description: 'Survive 5 world events',
        icon: '🌍',
        category: ACHIEVEMENT_CATEGORIES.SURVIVAL,
        requirement: { type: 'events_survived', value: 5 },
        reward: { xp: 350, item: { id: 'event_trophy', quantity: 1 } }
    },
    STRUCTURE_EXPLORER: {
        id: 'structure_explorer',
        name: 'Structure Explorer',
        description: 'Discover 10 structures',
        icon: '🏛️',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        requirement: { type: 'structures_discovered', value: 10 },
        reward: { xp: 400, item: { id: 'explorer_compass', quantity: 1 } },
        unlocks: { blueprint: 'blueprint_storage' }
    }
};

export class AchievementSystem {
    constructor(game) {
        this.game = game;
        
        // Unlocked achievements
        this.unlocked = new Set();
        
        // Progress tracking
        this.progress = {};
        
        // Initialize progress for all achievements
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            this.progress[achievement.id] = 0;
        }
        
        // Notification queue
        this.notificationQueue = [];
        
        // Recently unlocked (for UI animation)
        this.recentlyUnlocked = null;
        this.recentTimer = 0;
    }
    
    update(deltaTime) {
        // Clear recent unlock display
        if (this.recentTimer > 0) {
            this.recentTimer -= deltaTime;
            if (this.recentTimer <= 0) {
                this.recentlyUnlocked = null;
            }
        }
        
        // Process notification queue
        if (this.notificationQueue.length > 0 && !this.recentlyUnlocked) {
            this.recentlyUnlocked = this.notificationQueue.shift();
            this.recentTimer = 5.0;
        }
    }
    
    // Update progress for a stat
    updateProgress(statType, value) {
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            if (this.unlocked.has(achievement.id)) continue;
            if (achievement.requirement.type !== statType) continue;
            
            // Update progress
            if (typeof value === 'number') {
                this.progress[achievement.id] = Math.max(
                    this.progress[achievement.id],
                    value
                );
            }
            
            // Check if unlocked
            if (this.progress[achievement.id] >= achievement.requirement.value) {
                this.unlock(achievement);
            }
        }
    }
    
    // Increment progress for a stat
    incrementProgress(statType, amount = 1) {
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            if (this.unlocked.has(achievement.id)) continue;
            if (achievement.requirement.type !== statType) continue;
            
            // Increment progress
            this.progress[achievement.id] = (this.progress[achievement.id] || 0) + amount;
            
            // Check if unlocked
            if (this.progress[achievement.id] >= achievement.requirement.value) {
                this.unlock(achievement);
            }
        }
    }
    
    // Unlock an achievement
    unlock(achievement) {
        if (typeof achievement === 'string') {
            achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievement);
        }
        if (!achievement || this.unlocked.has(achievement.id)) return;
        
        this.unlocked.add(achievement.id);
        
        // Queue notification
        this.notificationQueue.push(achievement);
        
        // Grant rewards
        this.grantReward(achievement.reward);
        
        // Process content unlocks
        this.processUnlocks(achievement.unlocks);
        
        // Show message
        this.game.ui?.showMessage(
            `🏆 Achievement Unlocked: ${achievement.name}!`,
            3000
        );
        
        // Trigger particles
        this.triggerUnlockEffect();
    }
    
    // Process content unlocks from achievement
    processUnlocks(unlocks) {
        if (!unlocks) return;
        
        // Unlock blueprints
        if (unlocks.blueprint) {
            this.game.blueprints?.unlockBlueprint?.(unlocks.blueprint);
        }
        
        // Unlock recipes
        if (unlocks.recipe) {
            // Add to player's known recipes
            this.game.player?.unlockRecipe?.(unlocks.recipe);
            this.game.ui?.showNotification?.(`📜 Unlocked recipe: ${unlocks.recipe}!`, 'success');
        }
        
        // Increase max pets
        if (unlocks.maxPets) {
            if (this.game.taming) {
                this.game.taming.maxPets += unlocks.maxPets;
                this.game.ui?.showNotification?.(`🐾 Max pets increased!`, 'success');
            }
        }
        
        // Grant item
        if (unlocks.item) {
            this.game.player?.addItem?.(unlocks.item.id, unlocks.item.quantity || 1);
        }
    }
    
    // Check progress for a stat type
    checkProgress(statType, amount = 1) {
        this.incrementProgress(statType, amount);
    }
    
    // Grant achievement reward
    grantReward(reward) {
        if (!reward) return;
        
        // Grant XP
        if (reward.xp) {
            this.game.player?.addExperience?.(reward.xp);
        }
        
        // Grant item
        if (reward.item) {
            this.game.inventory?.addItem(reward.item.id, reward.item.quantity);
        }
    }
    
    // Trigger unlock visual effect
    triggerUnlockEffect() {
        const player = this.game.player;
        if (!player || !this.game.particles) return;
        
        // Golden sparkle effect
        for (let i = 0; i < 20; i++) {
            this.game.particles.spawn(
                player.x + (Math.random() - 0.5) * 2,
                player.y + (Math.random() - 0.5) * 2,
                player.z + 1 + Math.random(),
                {
                    type: 'spark',
                    color: '#FFD700',
                    lifetime: 1.5,
                    velocity: {
                        x: (Math.random() - 0.5) * 2,
                        y: (Math.random() - 0.5) * 2,
                        z: Math.random() * 2
                    }
                }
            );
        }
    }
    
    // Check if achievement is unlocked
    isUnlocked(achievementId) {
        return this.unlocked.has(achievementId);
    }
    
    // Get achievement progress
    getProgress(achievementId) {
        const achievement = ACHIEVEMENTS[achievementId.toUpperCase()] || 
                          Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
        if (!achievement) return null;
        
        return {
            current: this.progress[achievement.id] || 0,
            required: achievement.requirement.value,
            percentage: Math.min(100, Math.floor(
                ((this.progress[achievement.id] || 0) / achievement.requirement.value) * 100
            ))
        };
    }
    
    // Get all achievements by category
    getAchievementsByCategory(category) {
        return Object.values(ACHIEVEMENTS).filter(a => 
            a.category === category && (!a.hidden || this.isUnlocked(a.id))
        );
    }
    
    // Get unlocked count
    getUnlockedCount() {
        return this.unlocked.size;
    }
    
    // Get total count
    getTotalCount() {
        return Object.values(ACHIEVEMENTS).filter(a => !a.hidden).length;
    }
    
    // Get completion percentage
    getCompletionPercentage() {
        const total = this.getTotalCount();
        const unlocked = Array.from(this.unlocked).filter(id => {
            const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === id);
            return achievement && !achievement.hidden;
        }).length;
        
        return total > 0 ? Math.floor((unlocked / total) * 100) : 0;
    }
    
    // Get all achievements with status
    getAllAchievements() {
        return Object.values(ACHIEVEMENTS).map(achievement => ({
            ...achievement,
            unlocked: this.isUnlocked(achievement.id),
            progress: this.getProgress(achievement.id)
        })).filter(a => !a.hidden || a.unlocked);
    }
    
    // Render achievement notification
    render(ctx) {
        if (!this.recentlyUnlocked) return;
        
        const achievement = this.recentlyUnlocked;
        const canvas = ctx.canvas;
        
        // Draw banner
        const bannerHeight = 80;
        const y = 100;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(canvas.width / 2 - 200, y, 400, bannerHeight);
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width / 2 - 200, y, 400, bannerHeight);
        
        // Achievement icon
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(achievement.icon, canvas.width / 2 - 150, y + 50);
        
        // Text
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🏆 Achievement Unlocked!', canvas.width / 2 - 100, y + 25);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(achievement.name, canvas.width / 2 - 100, y + 50);
        
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '14px Arial';
        ctx.fillText(achievement.description, canvas.width / 2 - 100, y + 70);
    }
    
    // Serialize
    serialize() {
        return {
            unlocked: Array.from(this.unlocked),
            progress: this.progress
        };
    }
    
    deserialize(data) {
        if (data?.unlocked) {
            this.unlocked = new Set(data.unlocked);
        }
        if (data?.progress) {
            this.progress = { ...this.progress, ...data.progress };
        }
    }
    
    reset() {
        this.unlocked.clear();
        for (const achievement of Object.values(ACHIEVEMENTS)) {
            this.progress[achievement.id] = 0;
        }
        this.notificationQueue = [];
        this.recentlyUnlocked = null;
    }
}
