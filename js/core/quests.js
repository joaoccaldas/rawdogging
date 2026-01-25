import { ITEMS, BLOCKS, BLOCK_DATA } from '../config.js';

// Age definitions - players progress through ages by completing quests
export const AGES = {
    STONE_AGE: {
        id: 'stone_age',
        name: 'Stone Age',
        description: 'The dawn of humanity - 300,000 BC',
        era: '300,000 BC',
        unlocks: ['basic_tools', 'fire', 'shelter'],
        biomeModifier: 1.0, // Normal difficulty
        enemySpawnRate: 0.03,
    },
    TRIBAL_AGE: {
        id: 'tribal_age',
        name: 'Tribal Age',
        description: 'Form your first tribe - 50,000 BC',
        era: '50,000 BC',
        unlocks: ['advanced_tools', 'farming', 'hunting'],
        biomeModifier: 1.2,
        enemySpawnRate: 0.05,
    },
    BRONZE_AGE: {
        id: 'bronze_age',
        name: 'Bronze Age',
        description: 'Master metallurgy - 3,000 BC',
        era: '3,000 BC',
        unlocks: ['metal_tools', 'agriculture', 'villages'],
        biomeModifier: 1.5,
        enemySpawnRate: 0.07,
    }
};

// Quest definitions for the 5 Progressive Successive Quests
export const QUESTS = {
    FIRST_STEPS: {
        id: 'first_steps',
        age: 'STONE_AGE',
        name: 'First Steps',
        description: 'You awake in a new body. Learn to move, gather resources, and craft your first tools.',
        icon: '👣',
        objectives: [
            { id: 'walk', description: 'Walk around to find your bearings', type: 'location', current: 0, required: 15, isDistance: true },
            { id: 'mine_wood', description: 'Mine 3 Wood', type: 'collect', item: 'wood', required: 3, current: 0 },
            { id: 'craft_club', description: 'Craft a Wooden Club', type: 'craft', item: 'club', required: 1, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'berry', count: 4 },
            { type: 'xp', amount: 50 },
        ],
        completed: false,
        unlocked: true,
    },

    TREK_TO_CAVE: {
        id: 'trek_to_cave',
        age: 'STONE_AGE',
        name: 'The Great Journey',
        description: 'You are cold and weak. Reach the Ancient Refuge (Cave) at (35, 10). Use the map!',
        icon: '🏔️',
        objectives: [
            { id: 'reach_cave', description: 'Reach the cave at 35, 10', type: 'location', targetX: 35, targetY: 10, range: 6, current: 0, required: 1 },
        ],
        rewards: [
            { type: 'item', item: 'torch', count: 4 },
            { type: 'xp', amount: 100 },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'first_steps',
    },

    FORAGERS_PATH: {
        id: 'foragers_path',
        age: 'STONE_AGE',
        name: 'Primal Harvest',
        description: 'Hunger gnaws at your belly. Gather fruits or meat to keep your strength.',
        icon: '🍎',
        objectives: [
            { id: 'gather_food', description: 'Gather 6 food items (berries/meat/etc)', type: 'collect', item: 'berry|apple|raw_meat|fish|mushroom', required: 6, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'leather', count: 2 },
            { type: 'xp', amount: 75 },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'trek_to_cave',
    },

    ETERNAL_FLAME: {
        id: 'eternal_flame',
        age: 'STONE_AGE',
        name: 'The Eternal Flame',
        description: 'Darkness is dangerous. Build a campfire to cook food and keep warm.',
        icon: '🔥',
        objectives: [
            { id: 'collect_relics', description: 'Collect the 3 Primal Relics (Flint, Tinder, Stone)', type: 'collect', item: 'relic_flint|relic_tinder|relic_stone', required: 3, current: 0 },
            { id: 'craft_campfire', description: 'Craft and place the Primal Hearth (Campfire)', type: 'place', item: 'campfire', required: 1, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'stone_axe', count: 1 },
            { type: 'xp', amount: 200 },
            { type: 'unlock_age', age: 'TRIBAL_AGE' },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'foragers_path',
    },

    ARMING_UP: {
        id: 'arming_up',
        age: 'STONE_AGE',
        name: 'Arming Up',
        description: 'The wild is unforgiving. Craft a spear and hunt a boar for durable hides.',
        icon: '🔱',
        objectives: [
            { id: 'craft_spear', description: 'Craft a Spear or Bone Blade', type: 'craft', item: 'spear|bone_knife|stone_sword', required: 1, current: 0 },
            { id: 'hunt_boar', description: 'Hunt 2 Boars', type: 'kill', enemy: 'BOAR', required: 2, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'bone', count: 8 },
            { type: 'xp', amount: 150 },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'eternal_flame',
    },

    NIGHT_WATCH: {
        id: 'night_watch',
        age: 'STONE_AGE',
        name: 'Night Watch',
        description: 'Establish dominance. Survive a night and kill the wolves that haunt the dark.',
        icon: '🐺',
        objectives: [
            { id: 'kill_wolves', description: 'Kill 3 Wolves', type: 'kill', enemy: 'WOLF', required: 3, current: 0 },
            { id: 'survive', description: 'Survive one full night', type: 'survive_night', item: 'any', required: 1, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'diamond', count: 1 },
            { type: 'xp', amount: 300 },
            { type: 'unlock_age', age: 'TRIBAL_AGE' },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'arming_up',
    }
};

export class QuestManager {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.currentAge = 'STONE_AGE';
        this.quests = JSON.parse(JSON.stringify(QUESTS)); // Deep copy
        this.activeQuest = null;
        this.completedQuests = [];
        this.nightsSurvived = 0;
        this.wasNight = false;

        // Track statistics for quest progress
        this.stats = {
            itemsCollected: {},
            itemsCrafted: {},
            itemsConsumed: {},
            enemiesKilled: 0,
            blocksPlaced: 0,
        };
    }

    init() {
        // Set first quest as active (Tutorial)
        this.activeQuest = this.quests.FIRST_STEPS;
        this.updateQuestUI();
    }

    // Called when player location updates
    onLocationUpdate(x, y) {
        if (!this.activeQuest) return;

        let updated = false;
        for (const objective of this.activeQuest.objectives) {
            if (objective.current >= (objective.required || 1)) continue;

            if (objective.type === 'location') {
                if (objective.isDistance) {
                    // Track movement distance
                    if (this.lastX !== undefined && this.lastY !== undefined) {
                        const dist = Math.sqrt(Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2));
                        // Filter out micro-movements (idling) and teleports (loading)
                        if (dist > 0.05 && dist < 5) {
                            objective.current += dist;
                            if (objective.current >= objective.required) {
                                objective.current = objective.required;
                            }
                            updated = true;
                        }
                    }
                } else {
                    // Reaching a specific location
                    const distToTarget = Math.sqrt(Math.pow(x - objective.targetX, 2) + Math.pow(y - objective.targetY, 2));
                    if (distToTarget <= objective.range) {
                        objective.current = 1;
                        updated = true;
                    }
                }
            }
        }

        this.lastX = x;
        this.lastY = y;

        if (updated) {
            this.updateQuestUI();
            this.checkQuestCompletion();
        }
    }

    // Called when player collects an item
    onItemCollected(itemKey, count = 1) {
        this.stats.itemsCollected[itemKey] = (this.stats.itemsCollected[itemKey] || 0) + count;

        // Special "Fire" effect for relic collection
        if (itemKey.startsWith('relic_')) {
            this.game.particles?.spawn?.('fire',
                this.game.player.x,
                this.game.player.y,
                this.game.player.z,
                20
            );
            this.game.ui?.showNotification?.('🔥 You feel the heat of a Primal Relic!', 'warning');
            this.game.audio?.play?.('fire_ignite');
        }

        this.checkQuestProgress('collect', itemKey, count);
    }

    // Called when player crafts an item
    onItemCrafted(itemKey, count = 1) {
        this.stats.itemsCrafted[itemKey] = (this.stats.itemsCrafted[itemKey] || 0) + count;
        this.checkQuestProgress('craft', itemKey, count);
    }

    // Called when player consumes food
    onItemConsumed(itemKey) {
        this.stats.itemsConsumed[itemKey] = (this.stats.itemsConsumed[itemKey] || 0) + 1;
        this.checkQuestProgress('consume', itemKey, 1);
    }

    // Called when player kills an enemy
    onEnemyKilled(enemyType) {
        this.stats.enemiesKilled++;
        this.checkQuestProgress('kill', enemyType, 1);
    }

    // Called when player places a block
    onBlockPlaced(blockId) {
        this.stats.blocksPlaced++;

        let blockName = 'any';

        if (typeof blockId === 'string') {
            blockName = blockId.toLowerCase();
        } else if (typeof blockId === 'number') {
            // Find the key in BLOCKS that corresponds to this ID
            for (const [key, value] of Object.entries(BLOCKS)) {
                if (value === blockId) {
                    blockName = key.toLowerCase();
                    break;
                }
            }
        }

        this.checkQuestProgress('place', blockName, 1);
    }

    // Called when smelting/cooking completes
    onSmeltComplete(itemKey) {
        this.checkQuestProgress('smelt', itemKey, 1);
    }

    // Check and update quest progress
    checkQuestProgress(type, item, count) {
        if (!this.activeQuest || this.activeQuest.completed) return;

        let questUpdated = false;

        for (const objective of this.activeQuest.objectives) {
            if (objective.current >= objective.required) continue;

            if (objective.type === type) {
                // Check if item matches (support for multiple items with |)
                const validItems = objective.item ? objective.item.split('|') : ['any'];
                const matches = validItems.includes(item) || validItems.includes('any');

                if (matches || (type === 'kill' && objective.enemy === 'any')) {
                    objective.current = Math.min(objective.required, objective.current + count);
                    questUpdated = true;
                }
            }
        }

        if (questUpdated) {
            this.updateQuestUI();
            this.checkQuestCompletion();
        }
    }

    // Called every game update to track night survival
    update(deltaTime) {
        const timeOfDay = this.game.world?.timeOfDay || 0.5;
        const isNight = timeOfDay < 0.2 || timeOfDay > 0.8;

        // Detect night-to-day transition
        if (this.wasNight && !isNight) {
            this.nightsSurvived++;
            this.checkQuestProgress('survive_night', 'night', 1);
        }
        this.wasNight = isNight;
    }

    checkQuestCompletion() {
        if (!this.activeQuest) return;

        const allComplete = this.activeQuest.objectives.every(obj => obj.current >= obj.required);

        if (allComplete && !this.activeQuest.completed) {
            this.completeQuest(this.activeQuest);
        }
    }

    completeQuest(quest) {
        quest.completed = true;
        this.completedQuests.push(quest.id);

        // Give rewards
        for (const reward of quest.rewards) {
            switch (reward.type) {
                case 'item':
                    const itemDef = ITEMS[reward.item];
                    if (itemDef) {
                        this.game.player.addItem(reward.item, reward.count);
                    }
                    break;
                case 'xp':
                    this.game.player.gainXP(reward.amount);
                    break;
                case 'unlock_age':
                    this.unlockAge(reward.age);
                    break;
            }
        }

        // Show completion notification
        this.game.ui.showQuestComplete(quest);
        this.game.audio.play('pickup');
        this.game.particles.emitText(
            this.game.player.x,
            this.game.player.y,
            this.game.player.z + 2.5,
            `✅ ${quest.name} Complete!`,
            '#4ade80'
        );

        // Unlock next quest
        this.unlockNextQuest(quest.id);
    }

    unlockNextQuest(completedQuestId) {
        for (const [key, quest] of Object.entries(this.quests)) {
            if (quest.prerequisite === completedQuestId && !quest.unlocked) {
                quest.unlocked = true;
                this.activeQuest = quest;
                this.game.ui.showQuestUnlocked(quest);
                break;
            }
        }

        this.updateQuestUI();
    }

    unlockAge(ageKey) {
        this.currentAge = ageKey;
        const age = AGES[ageKey];

        // Show age unlock notification
        this.game.particles.emitText(
            this.game.player.x,
            this.game.player.y,
            this.game.player.z + 3,
            `🎉 ${age.name} Unlocked!`,
            '#ffd700'
        );
    }

    updateQuestUI() {
        const questPanel = document.getElementById('quest-panel');
        if (!questPanel) return;

        if (!this.activeQuest) {
            questPanel.innerHTML = '<div class="quest-empty">All quests complete!</div>';
            return;
        }

        const quest = this.activeQuest;
        const progressItems = quest.objectives.map(obj => {
            const complete = obj.current >= obj.required;
            return `
                <div class="quest-objective ${complete ? 'complete' : ''}">
                    <span class="objective-check">${complete ? '✓' : '○'}</span>
                    <span class="objective-text">${obj.description}</span>
                    <span class="objective-progress">${obj.current}/${obj.required}</span>
                </div>
            `;
        }).join('');

        questPanel.innerHTML = `
            <div class="quest-header">
                <span class="quest-icon">${quest.icon}</span>
                <span class="quest-name">${quest.name}</span>
            </div>
            <div class="quest-description">${quest.description}</div>
            <div class="quest-objectives">${progressItems}</div>
        `;
    }

    // Save quest progress (alias for compatibility)
    serialize() {
        return this.getSaveData();
    }

    getSaveData() {
        return {
            currentAge: this.currentAge,
            quests: this.quests,
            completedQuests: this.completedQuests,
            activeQuestId: this.activeQuest?.id,
            stats: this.stats,
            nightsSurvived: this.nightsSurvived,
        };
    }

    // Load quest progress (alias for compatibility)
    deserialize(data) {
        this.loadSaveData(data);
    }

    // Load quest progress
    loadSaveData(data) {
        if (!data) return;

        this.currentAge = data.currentAge || 'STONE_AGE';
        this.quests = data.quests || JSON.parse(JSON.stringify(QUESTS));
        this.completedQuests = data.completedQuests || [];
        this.stats = data.stats || this.stats;
        this.nightsSurvived = data.nightsSurvived || 0;

        // Restore active quest
        if (data.activeQuestId) {
            for (const quest of Object.values(this.quests)) {
                if (quest.id === data.activeQuestId) {
                    this.activeQuest = quest;
                    break;
                }
            }
        }

        this.updateQuestUI();
    }
}
