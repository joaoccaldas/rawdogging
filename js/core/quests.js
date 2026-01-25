// Quest System for Stone Age Survival
import { ITEMS } from '../config.js';

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

// Quest definitions for Stone Age
export const QUESTS = {
    // Stone Age Quests
    DISCOVER_FIRE: {
        id: 'discover_fire',
        age: 'STONE_AGE',
        name: 'Discovery of Fire',
        description: 'Fire will protect you from the cold and predators. Craft a torch!',
        icon: '🔥',
        objectives: [
            { id: 'gather_coal', description: 'Gather coal', type: 'collect', item: 'coal', required: 2, current: 0 },
            { id: 'gather_sticks', description: 'Gather sticks', type: 'collect', item: 'stick', required: 4, current: 0 },
            { id: 'craft_torch', description: 'Craft a torch', type: 'craft', item: 'torch', required: 1, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'torch', count: 8 },
            { type: 'xp', amount: 50 },
        ],
        completed: false,
        unlocked: true, // First quest is always unlocked
    },
    
    FIRST_HUNT: {
        id: 'first_hunt',
        age: 'STONE_AGE',
        name: 'The First Hunt',
        description: 'Hunt animals for meat to survive. Cook the meat to restore more hunger!',
        icon: '🥩',
        objectives: [
            { id: 'craft_weapon', description: 'Craft a weapon (club or spear)', type: 'craft', item: 'club|spear|wooden_sword', required: 1, current: 0 },
            { id: 'kill_animal', description: 'Hunt an animal', type: 'kill', enemy: 'any', required: 1, current: 0 },
            { id: 'collect_meat', description: 'Collect raw meat', type: 'collect', item: 'raw_meat', required: 2, current: 0 },
            { id: 'eat_meat', description: 'Eat cooked meat', type: 'consume', item: 'cooked_meat', required: 1, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'cooked_meat', count: 5 },
            { type: 'item', item: 'bone', count: 3 },
            { type: 'xp', amount: 75 },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'discover_fire',
    },
    
    BUILD_SHELTER: {
        id: 'build_shelter',
        age: 'STONE_AGE',
        name: 'Safe Haven',
        description: 'Build a shelter to survive the night. Walls will protect you from predators!',
        icon: '🏠',
        objectives: [
            { id: 'gather_wood', description: 'Gather wood', type: 'collect', item: 'wood', required: 16, current: 0 },
            { id: 'craft_planks', description: 'Craft wooden planks', type: 'craft', item: 'plank', required: 8, current: 0 },
            { id: 'place_blocks', description: 'Place 12 blocks (build walls)', type: 'place', item: 'any', required: 12, current: 0 },
            { id: 'survive_night', description: 'Survive one night', type: 'survive_night', required: 1, current: 0 },
        ],
        rewards: [
            { type: 'item', item: 'bed', count: 1 },
            { type: 'item', item: 'chest', count: 1 },
            { type: 'xp', amount: 100 },
            { type: 'unlock_age', age: 'TRIBAL_AGE' },
        ],
        completed: false,
        unlocked: false,
        prerequisite: 'first_hunt',
    },
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
        // Set first quest as active
        this.activeQuest = this.quests.DISCOVER_FIRE;
        this.updateQuestUI();
    }
    
    // Called when player collects an item
    onItemCollected(itemKey, count = 1) {
        this.stats.itemsCollected[itemKey] = (this.stats.itemsCollected[itemKey] || 0) + count;
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
        this.checkQuestProgress('place', 'any', 1);
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
    
    // Save quest progress
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
