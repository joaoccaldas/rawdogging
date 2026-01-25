// Side Quest System - Random location-based quests with rewards
// These quests spawn dynamically and guide players to explore the world

import { CONFIG, ITEMS, BLOCKS, BLOCK_DATA } from '../config.js';

// Side Quest Templates - define the types of side quests available
export const SIDE_QUEST_TEMPLATES = {
    // ========== EXPLORATION QUESTS ==========
    DISCOVER_CAVE: {
        id: 'discover_cave',
        name: 'Hidden Depths',
        description: 'Ancient caves hold secrets. Find the entrance at {location}.',
        icon: '🕳️',
        type: 'explore',
        difficulty: 1,
        objectives: [
            { type: 'reach_location', description: 'Find the cave entrance', radius: 3 }
        ],
        locationRequirements: {
            biome: ['any'],
            findBlock: BLOCKS.STONE,
            minDepth: 5, // Must be underground area
        },
        rewards: [
            { type: 'item', item: 'torch', count: 8 },
            { type: 'item', item: 'coal', count: 5 },
            { type: 'xp', amount: 30 },
        ],
        expiresIn: 600, // 10 minutes
        rarity: 'common',
    },

    MOUNTAIN_PEAK: {
        id: 'mountain_peak',
        name: 'Summit Challenge',
        description: 'Reach the mountain peak at {location}. The view is worth it!',
        icon: '🏔️',
        type: 'explore',
        difficulty: 2,
        objectives: [
            { type: 'reach_location', description: 'Climb to the peak', radius: 2 }
        ],
        locationRequirements: {
            biome: ['any'],
            minHeight: 25, // High terrain
        },
        rewards: [
            { type: 'item', item: 'feather', count: 5 },
            { type: 'xp', amount: 50 },
        ],
        expiresIn: 900, // 15 minutes
        rarity: 'common',
    },

    ANCIENT_TREE: {
        id: 'ancient_tree',
        name: 'The Elder Tree',
        description: 'A massive ancient tree grows at {location}. Harvest its rare wood.',
        icon: '🌳',
        type: 'explore',
        difficulty: 1,
        objectives: [
            { type: 'reach_location', description: 'Find the Elder Tree', radius: 4 },
            { type: 'mine_block', block: BLOCKS.WOOD, count: 5, description: 'Harvest Elder Wood' }
        ],
        locationRequirements: {
            biome: ['PLAINS', 'JUNGLE'],
            findBlock: BLOCKS.WOOD,
            minCluster: 8, // Dense tree area
        },
        rewards: [
            { type: 'item', item: 'wood', count: 20 },
            { type: 'item', item: 'apple', count: 3 },
            { type: 'xp', amount: 40 },
        ],
        expiresIn: 600,
        rarity: 'common',
    },

    // ========== HUNTING QUESTS ==========
    PREDATOR_THREAT: {
        id: 'predator_threat',
        name: 'Predator Alert',
        description: 'Dangerous predators spotted near {location}. Eliminate the threat!',
        icon: '🐺',
        type: 'hunt',
        difficulty: 2,
        objectives: [
            { type: 'reach_location', description: 'Go to hunting grounds', radius: 8 },
            { type: 'kill_enemies', count: 3, enemyType: 'any', description: 'Kill predators' }
        ],
        locationRequirements: {
            biome: ['PLAINS', 'SAVANNA'],
        },
        rewards: [
            { type: 'item', item: 'raw_meat', count: 6 },
            { type: 'item', item: 'leather', count: 4 },
            { type: 'item', item: 'bone', count: 3 },
            { type: 'xp', amount: 60 },
        ],
        expiresIn: 480, // 8 minutes
        rarity: 'common',
        spawnEnemiesOnStart: { type: 'wolf', count: 3 },
    },

    BEAST_BOUNTY: {
        id: 'beast_bounty',
        name: 'Beast Bounty',
        description: 'A dangerous beast roams near {location}. Claim the bounty!',
        icon: '🦁',
        type: 'hunt',
        difficulty: 3,
        objectives: [
            { type: 'reach_location', description: 'Track the beast', radius: 6 },
            { type: 'kill_enemies', count: 1, enemyType: 'boss', description: 'Slay the beast' }
        ],
        locationRequirements: {
            biome: ['any'],
        },
        rewards: [
            { type: 'item', item: 'leather', count: 8 },
            { type: 'item', item: 'bone', count: 10 },
            { type: 'item', item: 'raw_meat', count: 8 },
            { type: 'xp', amount: 150 },
        ],
        expiresIn: 600,
        rarity: 'rare',
        spawnEnemiesOnStart: { type: 'sabertooth', count: 1, boss: true },
    },

    // ========== GATHERING QUESTS ==========
    ORE_EXPEDITION: {
        id: 'ore_expedition',
        name: 'Ore Expedition',
        description: 'Rich ore deposits found at {location}. Mine before others find it!',
        icon: '⛏️',
        type: 'gather',
        difficulty: 2,
        objectives: [
            { type: 'reach_location', description: 'Find the ore deposit', radius: 5 },
            { type: 'mine_block', block: BLOCKS.IRON_ORE, count: 3, description: 'Mine iron ore' }
        ],
        locationRequirements: {
            biome: ['any'],
            findBlock: BLOCKS.IRON_ORE,
        },
        rewards: [
            { type: 'item', item: 'raw_iron', count: 5 },
            { type: 'item', item: 'coal', count: 8 },
            { type: 'xp', amount: 70 },
        ],
        expiresIn: 720,
        rarity: 'uncommon',
    },

    DIAMOND_RUSH: {
        id: 'diamond_rush',
        name: 'Diamond Rush',
        description: 'Rare diamonds spotted deep underground at {location}!',
        icon: '💎',
        type: 'gather',
        difficulty: 4,
        objectives: [
            { type: 'reach_location', description: 'Descend to the depths', radius: 4 },
            { type: 'mine_block', block: BLOCKS.DIAMOND_ORE, count: 1, description: 'Mine diamond' }
        ],
        locationRequirements: {
            biome: ['any'],
            findBlock: BLOCKS.DIAMOND_ORE,
            maxHeight: 10, // Deep underground
        },
        rewards: [
            { type: 'item', item: 'diamond', count: 2 },
            { type: 'xp', amount: 200 },
        ],
        expiresIn: 900,
        rarity: 'epic',
    },

    HERB_GATHERING: {
        id: 'herb_gathering',
        name: 'Medicinal Herbs',
        description: 'Healing plants grow near {location}. Gather them for medicine.',
        icon: '🌿',
        type: 'gather',
        difficulty: 1,
        objectives: [
            { type: 'reach_location', description: 'Find the herb patch', radius: 5 },
            { type: 'collect_item', item: 'berry', count: 5, description: 'Gather berries' }
        ],
        locationRequirements: {
            biome: ['PLAINS', 'JUNGLE', 'SWAMP'],
        },
        rewards: [
            { type: 'item', item: 'berry', count: 10 },
            { type: 'item', item: 'golden_apple', count: 1 },
            { type: 'xp', amount: 35 },
        ],
        expiresIn: 480,
        rarity: 'common',
        spawnItemsOnStart: { item: 'berry', count: 8 },
    },

    // ========== SURVIVAL QUESTS ==========
    SURVIVE_NIGHT: {
        id: 'survive_night_quest',
        name: 'Night Watch',
        description: 'Survive the night near the dangerous area at {location}.',
        icon: '🌙',
        type: 'survive',
        difficulty: 2,
        objectives: [
            { type: 'reach_location', description: 'Go to the danger zone', radius: 10 },
            { type: 'survive_time', duration: 120, description: 'Survive for 2 minutes', nightOnly: true }
        ],
        locationRequirements: {
            biome: ['any'],
        },
        rewards: [
            { type: 'item', item: 'torch', count: 12 },
            { type: 'item', item: 'cooked_meat', count: 4 },
            { type: 'xp', amount: 80 },
        ],
        expiresIn: 1200, // Must wait for night
        rarity: 'uncommon',
        nightOnly: true,
    },

    EXTREME_WEATHER: {
        id: 'extreme_weather',
        name: 'Storm Chaser',
        description: 'A storm approaches {location}. Brave the elements!',
        icon: '⛈️',
        type: 'survive',
        difficulty: 3,
        objectives: [
            { type: 'reach_location', description: 'Enter the storm zone', radius: 8 },
            { type: 'survive_time', duration: 90, description: 'Survive the storm' }
        ],
        locationRequirements: {
            biome: ['any'],
        },
        rewards: [
            { type: 'item', item: 'leather_armor', count: 1 },
            { type: 'xp', amount: 100 },
        ],
        expiresIn: 600,
        rarity: 'rare',
        triggerWeather: 'storm',
    },

    // ========== CONSTRUCTION QUESTS ==========
    BUILD_OUTPOST: {
        id: 'build_outpost',
        name: 'Frontier Outpost',
        description: 'Build a small outpost at {location} to claim the territory.',
        icon: '🏗️',
        type: 'build',
        difficulty: 2,
        objectives: [
            { type: 'reach_location', description: 'Survey the area', radius: 5 },
            { type: 'place_blocks', count: 16, description: 'Build walls (16 blocks)' },
            { type: 'place_block', block: BLOCKS.TORCH, count: 2, description: 'Place torches' }
        ],
        locationRequirements: {
            biome: ['PLAINS', 'SAVANNA'],
            flatArea: true, // Prefer flat terrain
        },
        rewards: [
            { type: 'item', item: 'chest', count: 1 },
            { type: 'item', item: 'bed', count: 1 },
            { type: 'xp', amount: 90 },
        ],
        expiresIn: 1200,
        rarity: 'uncommon',
    },

    // ========== RESCUE QUESTS ==========
    LOST_SUPPLIES: {
        id: 'lost_supplies',
        name: 'Lost Supplies',
        description: 'A supply cache was lost at {location}. Retrieve it!',
        icon: '📦',
        type: 'rescue',
        difficulty: 1,
        objectives: [
            { type: 'reach_location', description: 'Find the supply cache', radius: 3 },
            { type: 'interact', description: 'Retrieve supplies' }
        ],
        locationRequirements: {
            biome: ['any'],
        },
        rewards: [
            { type: 'random_items', count: 5, pool: ['coal', 'raw_iron', 'stick', 'leather', 'flint'] },
            { type: 'xp', amount: 45 },
        ],
        expiresIn: 480,
        rarity: 'common',
        spawnChestOnStart: true,
    },

    // ========== SPECIAL QUESTS ==========
    METEOR_SITE: {
        id: 'meteor_site',
        name: 'Fallen Star',
        description: 'A meteor crashed at {location}! Investigate before it cools.',
        icon: '☄️',
        type: 'special',
        difficulty: 3,
        objectives: [
            { type: 'reach_location', description: 'Find the crash site', radius: 4 },
            { type: 'mine_block', block: BLOCKS.OBSIDIAN, count: 2, description: 'Harvest meteor fragments' }
        ],
        locationRequirements: {
            biome: ['any'],
        },
        rewards: [
            { type: 'item', item: 'obsidian', count: 4 },
            { type: 'item', item: 'diamond', count: 1 },
            { type: 'xp', amount: 150 },
        ],
        expiresIn: 300, // Short timer - urgent!
        rarity: 'epic',
        triggerOnWorldEvent: 'meteor_shower',
        spawnBlocksOnStart: { block: BLOCKS.OBSIDIAN, count: 5 },
    },

    ANCIENT_RUINS: {
        id: 'ancient_ruins',
        name: 'Ancient Ruins',
        description: 'Mysterious ruins have been discovered at {location}.',
        icon: '🏛️',
        type: 'special',
        difficulty: 3,
        objectives: [
            { type: 'reach_location', description: 'Explore the ruins', radius: 5 },
            { type: 'kill_enemies', count: 2, enemyType: 'any', description: 'Clear guardians' },
            { type: 'interact', description: 'Loot the treasure' }
        ],
        locationRequirements: {
            biome: ['DESERT', 'JUNGLE'],
        },
        rewards: [
            { type: 'item', item: 'gold_ingot', count: 5 },
            { type: 'item', item: 'golden_apple', count: 2 },
            { type: 'xp', amount: 200 },
        ],
        expiresIn: 720,
        rarity: 'epic',
        spawnStructure: 'ruins',
    },
};

// Rarity weights for quest spawning
const RARITY_WEIGHTS = {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 5,
};

// Active side quest class
class ActiveSideQuest {
    constructor(template, location, game) {
        this.id = `sidequest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.templateId = template.id;
        this.name = template.name;
        this.description = template.description.replace('{location}', this.formatLocation(location));
        this.icon = template.icon;
        this.type = template.type;
        this.difficulty = template.difficulty;
        this.rarity = template.rarity;

        this.location = { ...location };
        this.objectives = JSON.parse(JSON.stringify(template.objectives));
        this.rewards = JSON.parse(JSON.stringify(template.rewards));

        this.startTime = Date.now();
        this.expiresIn = template.expiresIn;
        this.timeRemaining = template.expiresIn;

        this.status = 'active'; // active, completed, failed, expired
        this.currentObjectiveIndex = 0;

        this.game = game;

        // Track progress
        this.progress = {
            enemiesKilled: 0,
            blocksMined: {},
            blocksPlaced: 0,
            itemsCollected: {},
            timeAtLocation: 0,
            reachedLocation: false,
        };
    }

    formatLocation(loc) {
        const dir = this.getCardinalDirection(loc);
        const dist = Math.round(loc.distance);
        return `${dist} blocks ${dir}`;
    }

    getCardinalDirection(loc) {
        const dx = loc.x - (this.game?.player?.x || 0);
        const dy = loc.y - (this.game?.player?.y || 0);

        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        if (angle >= -22.5 && angle < 22.5) return 'East';
        if (angle >= 22.5 && angle < 67.5) return 'Southeast';
        if (angle >= 67.5 && angle < 112.5) return 'South';
        if (angle >= 112.5 && angle < 157.5) return 'Southwest';
        if (angle >= 157.5 || angle < -157.5) return 'West';
        if (angle >= -157.5 && angle < -112.5) return 'Northwest';
        if (angle >= -112.5 && angle < -67.5) return 'North';
        if (angle >= -67.5 && angle < -22.5) return 'Northeast';

        return 'nearby';
    }

    update(deltaTime) {
        if (this.status !== 'active') return;

        // Update timer
        this.timeRemaining -= deltaTime;
        if (this.timeRemaining <= 0) {
            this.fail('expired');
            return;
        }

        // Check current objective
        const objective = this.objectives[this.currentObjectiveIndex];
        if (!objective) {
            this.complete();
            return;
        }

        this.checkObjective(objective, deltaTime);
    }

    checkObjective(objective, deltaTime) {
        const player = this.game.player;
        if (!player) return;

        const distToLocation = Math.hypot(
            player.x - this.location.x,
            player.y - this.location.y
        );

        switch (objective.type) {
            case 'reach_location':
                if (distToLocation <= (objective.radius || 5)) {
                    this.progress.reachedLocation = true;
                    objective.current = 1;
                    objective.required = 1;
                    this.advanceObjective();
                }
                break;

            case 'survive_time':
                if (this.progress.reachedLocation || distToLocation <= 15) {
                    // Check night condition if required
                    if (objective.nightOnly) {
                        const timeOfDay = this.game.world?.timeOfDay || 0.5;
                        const isNight = timeOfDay < 0.2 || timeOfDay > 0.8;
                        if (!isNight) return;
                    }

                    this.progress.timeAtLocation += deltaTime;
                    objective.current = Math.floor(this.progress.timeAtLocation);
                    objective.required = objective.duration;

                    if (this.progress.timeAtLocation >= objective.duration) {
                        this.advanceObjective();
                    }
                }
                break;

            case 'kill_enemies':
                objective.current = this.progress.enemiesKilled;
                objective.required = objective.count;
                if (this.progress.enemiesKilled >= objective.count) {
                    this.advanceObjective();
                }
                break;

            case 'mine_block':
                const minedCount = this.progress.blocksMined[objective.block] || 0;
                objective.current = minedCount;
                objective.required = objective.count;
                if (minedCount >= objective.count) {
                    this.advanceObjective();
                }
                break;

            case 'place_blocks':
                objective.current = this.progress.blocksPlaced;
                objective.required = objective.count;
                if (this.progress.blocksPlaced >= objective.count) {
                    this.advanceObjective();
                }
                break;

            case 'place_block':
                const placedCount = this.progress.blocksMined[objective.block] || 0; // Reuse for placed
                objective.current = placedCount;
                objective.required = objective.count;
                if (placedCount >= objective.count) {
                    this.advanceObjective();
                }
                break;

            case 'collect_item':
                const collected = this.progress.itemsCollected[objective.item] || 0;
                objective.current = collected;
                objective.required = objective.count;
                if (collected >= objective.count) {
                    this.advanceObjective();
                }
                break;

            case 'interact':
                // Interaction checked via onInteract method
                objective.current = objective.current || 0;
                objective.required = 1;
                break;
        }
    }

    advanceObjective() {
        this.currentObjectiveIndex++;

        // Play progress sound
        if (this.game.audio) {
            this.game.audio.play('pickup');
        }

        // Show notification
        if (this.game.ui) {
            this.game.ui.showMessage(`📋 Objective complete!`, 2000);
        }

        // Particles
        if (this.game.particles && this.game.player) {
            this.game.particles.emitText(
                this.game.player.x,
                this.game.player.y,
                this.game.player.z + 2,
                '✓',
                '#4ade80'
            );
        }

        // Check if all objectives done
        if (this.currentObjectiveIndex >= this.objectives.length) {
            this.complete();
        }
    }

    // Event handlers - called by game systems
    onEnemyKilled(enemyType) {
        if (this.status !== 'active') return;
        this.progress.enemiesKilled++;
    }

    onBlockMined(blockId) {
        if (this.status !== 'active') return;
        this.progress.blocksMined[blockId] = (this.progress.blocksMined[blockId] || 0) + 1;
    }

    onBlockPlaced(blockId) {
        if (this.status !== 'active') return;
        this.progress.blocksPlaced++;
        // Track specific block placements
        this.progress.blocksMined[blockId] = (this.progress.blocksMined[blockId] || 0) + 1;
    }

    onItemCollected(itemKey, count = 1) {
        if (this.status !== 'active') return;
        this.progress.itemsCollected[itemKey] = (this.progress.itemsCollected[itemKey] || 0) + count;
    }

    onInteract(x, y, z) {
        if (this.status !== 'active') return;

        const objective = this.objectives[this.currentObjectiveIndex];
        if (objective?.type === 'interact') {
            // Check if within quest area
            const dist = Math.hypot(x - this.location.x, y - this.location.y);
            if (dist <= 10) {
                objective.current = 1;
                this.advanceObjective();
            }
        }
    }

    complete() {
        this.status = 'completed';

        // Give rewards
        this.giveRewards();

        // Effects
        if (this.game.audio) {
            this.game.audio.play('pickup');
        }

        if (this.game.particles && this.game.player) {
            this.game.particles.emitText(
                this.game.player.x,
                this.game.player.y,
                this.game.player.z + 2.5,
                `🎉 ${this.name} Complete!`,
                '#ffd700'
            );
            this.game.particles.emit(
                this.game.player.x,
                this.game.player.y,
                this.game.player.z + 1,
                '#ffd700',
                30
            );
        }

        if (this.game.ui) {
            this.game.ui.showMessage(`🎉 Side Quest Complete: ${this.name}`, 4000);
        }
    }

    fail(reason = 'failed') {
        this.status = 'failed';

        if (this.game.ui) {
            const message = reason === 'expired'
                ? `⏰ Quest Expired: ${this.name}`
                : `❌ Quest Failed: ${this.name}`;
            this.game.ui.showMessage(message, 3000);
        }

        if (this.game.particles && this.game.player) {
            this.game.particles.emitText(
                this.game.player.x,
                this.game.player.y,
                this.game.player.z + 2,
                reason === 'expired' ? '⏰' : '❌',
                '#ff6b6b'
            );
        }
    }

    giveRewards() {
        const player = this.game.player;
        if (!player) return;

        for (const reward of this.rewards) {
            switch (reward.type) {
                case 'item':
                    player.addItem(reward.item, reward.count);
                    break;

                case 'xp':
                    player.gainXP(reward.amount);
                    break;

                case 'random_items':
                    for (let i = 0; i < reward.count; i++) {
                        const item = reward.pool[Math.floor(Math.random() * reward.pool.length)];
                        player.addItem(item, 1);
                    }
                    break;
            }
        }
    }

    // For save/load
    serialize() {
        return {
            id: this.id,
            templateId: this.templateId,
            location: this.location,
            status: this.status,
            timeRemaining: this.timeRemaining,
            currentObjectiveIndex: this.currentObjectiveIndex,
            objectives: this.objectives,
            progress: this.progress,
        };
    }
}

// Main Side Quest Manager
export class SideQuestSystem {
    constructor(game) {
        this.game = game;
        this.reset();
    }

    reset() {
        this.activeQuests = [];
        this.completedQuests = [];
        this.maxActiveQuests = 3;
        this.questCooldown = 0;
        this.minCooldown = 60; // Minimum 60 seconds between quests
        this.maxCooldown = 180; // Maximum 3 minutes
        this.totalCompleted = 0;
        this.questsSpawned = 0;
    }

    init() {
        // Initial quest after short delay
        this.questCooldown = 30;
    }

    update(deltaTime) {
        // Update active quests
        for (const quest of this.activeQuests) {
            quest.update(deltaTime);
        }

        // Remove completed/failed quests
        this.activeQuests = this.activeQuests.filter(q => q.status === 'active');

        // Spawn new quests
        this.questCooldown -= deltaTime;
        if (this.questCooldown <= 0 && this.activeQuests.length < this.maxActiveQuests) {
            this.trySpawnQuest();
            this.questCooldown = this.minCooldown + Math.random() * (this.maxCooldown - this.minCooldown);
        }

        // Update UI
        this.updateUI();
    }

    trySpawnQuest() {
        const player = this.game.player;
        if (!player) return;

        // Select quest template based on rarity
        const template = this.selectQuestTemplate();
        if (!template) return;

        // Find valid location
        const location = this.findQuestLocation(template);
        if (!location) return;

        // Create quest
        const quest = new ActiveSideQuest(template, location, this.game);
        this.activeQuests.push(quest);
        this.questsSpawned++;

        // Spawn any required entities/items
        this.spawnQuestElements(quest, template, location);

        // Notify player
        if (this.game.ui) {
            this.game.ui.showMessage(`📋 New Side Quest: ${quest.name}`, 4000);
        }

        if (this.game.audio) {
            this.game.audio.play('pickup');
        }

        // Add marker to minimap
        if (this.game.mapMarkers) {
            this.game.mapMarkers.createMarker(
                location.x,
                location.y,
                location.z || 0,
                'quest',
                template.name,
                `${template.icon} ${template.description || ''}`
            );
        }
    }

    selectQuestTemplate() {
        // Get current game state for filtering
        const player = this.game.player;
        const currentAge = this.game.questManager?.currentAge || 'STONE_AGE';
        const timeOfDay = this.game.world?.timeOfDay || 0.5;
        const isNight = timeOfDay < 0.2 || timeOfDay > 0.8;

        // Filter templates
        const validTemplates = [];
        const weights = [];

        for (const [key, template] of Object.entries(SIDE_QUEST_TEMPLATES)) {
            // Skip night-only quests during day
            if (template.nightOnly && !isNight) continue;

            // Skip world event quests unless event is active
            if (template.triggerOnWorldEvent) {
                const activeEvents = this.game.worldEvents?.getActiveEvents?.() || [];
                const activeEvent = activeEvents.find(
                    e => e.type === template.triggerOnWorldEvent
                );
                if (!activeEvent) continue;
            }

            // Difficulty check based on player level
            const playerLevel = player?.level || 1;
            if (template.difficulty > playerLevel + 2) continue;

            validTemplates.push(template);
            weights.push(RARITY_WEIGHTS[template.rarity] || 10);
        }

        if (validTemplates.length === 0) return null;

        // Weighted random selection
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < validTemplates.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return validTemplates[i];
            }
        }

        return validTemplates[0];
    }

    findQuestLocation(template) {
        const player = this.game.player;
        if (!player) return null;

        const requirements = template.locationRequirements || {};
        const minDist = 20;
        const maxDist = 60;

        // Try multiple times to find valid location
        for (let attempt = 0; attempt < 20; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = minDist + Math.random() * (maxDist - minDist);

            const x = Math.floor(player.x + Math.cos(angle) * distance);
            const y = Math.floor(player.y + Math.sin(angle) * distance);
            const z = this.game.world?.getHeight(x, y) || 10;

            // Check biome
            if (requirements.biome && !requirements.biome.includes('any')) {
                const biome = this.game.world?.getBiomeAt(x, y);
                if (!biome || !requirements.biome.includes(biome.id)) {
                    continue;
                }
            }

            // Check height requirements
            if (requirements.minHeight && z < requirements.minHeight) continue;
            if (requirements.maxHeight && z > requirements.maxHeight) continue;

            // Check for specific block requirement
            if (requirements.findBlock) {
                let found = false;
                for (let dz = -5; dz <= 5; dz++) {
                    for (let dx = -3; dx <= 3; dx++) {
                        for (let dy = -3; dy <= 3; dy++) {
                            const block = this.game.world?.getBlock(x + dx, y + dy, z + dz);
                            if (block === requirements.findBlock) {
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                    if (found) break;
                }
                if (!found) continue;
            }

            // Valid location found
            return { x, y, z, distance };
        }

        // Fallback - just use a random location
        const angle = Math.random() * Math.PI * 2;
        const distance = minDist + Math.random() * (maxDist - minDist);
        const x = Math.floor(player.x + Math.cos(angle) * distance);
        const y = Math.floor(player.y + Math.sin(angle) * distance);
        const z = this.game.world?.getHeight(x, y) || 10;

        return { x, y, z, distance };
    }

    spawnQuestElements(quest, template, location) {
        // Spawn enemies
        if (template.spawnEnemiesOnStart) {
            const { type, count, boss } = template.spawnEnemiesOnStart;
            // This would integrate with enemy spawning system
            // For now, we'll rely on the world's natural spawning
        }

        // Spawn items
        if (template.spawnItemsOnStart) {
            const { item, count } = template.spawnItemsOnStart;
            // Spawn item entities around location
            for (let i = 0; i < count; i++) {
                const ox = location.x + (Math.random() - 0.5) * 6;
                const oy = location.y + (Math.random() - 0.5) * 6;
                const oz = (this.game.world?.getHeight(Math.floor(ox), Math.floor(oy)) || location.z) + 1;

                // Would need to import ItemEntity to spawn items
                // this.game.entities.push(new ItemEntity(this.game, ox, oy, oz, item, 1));
            }
        }

        // Spawn blocks (like meteor obsidian)
        if (template.spawnBlocksOnStart) {
            const { block, count } = template.spawnBlocksOnStart;
            for (let i = 0; i < count; i++) {
                const ox = Math.floor(location.x + (Math.random() - 0.5) * 4);
                const oy = Math.floor(location.y + (Math.random() - 0.5) * 4);
                const oz = (this.game.world?.getHeight(ox, oy) || location.z);
                this.game.world?.setBlock(ox, oy, oz, block);
            }
        }

        // Trigger weather
        if (template.triggerWeather && this.game.weather) {
            this.game.weather.setWeather(template.triggerWeather);
        }

        // Spawn chest
        if (template.spawnChestOnStart) {
            this.game.world?.setBlock(
                Math.floor(location.x),
                Math.floor(location.y),
                location.z,
                BLOCKS.CHEST
            );
        }
    }

    getRarityColor(rarity) {
        switch (rarity) {
            case 'common': return '#a0a0a0';
            case 'uncommon': return '#4ade80';
            case 'rare': return '#60a5fa';
            case 'epic': return '#c084fc';
            default: return '#ffffff';
        }
    }

    // Event hooks - call these from game systems
    onEnemyKilled(enemyType) {
        for (const quest of this.activeQuests) {
            quest.onEnemyKilled(enemyType);
        }
    }

    onBlockMined(blockId) {
        for (const quest of this.activeQuests) {
            quest.onBlockMined(blockId);
        }
    }

    onBlockPlaced(blockId) {
        for (const quest of this.activeQuests) {
            quest.onBlockPlaced(blockId);
        }
    }

    onItemCollected(itemKey, count = 1) {
        for (const quest of this.activeQuests) {
            quest.onItemCollected(itemKey, count);
        }
    }

    onInteract(x, y, z) {
        for (const quest of this.activeQuests) {
            quest.onInteract(x, y, z);
        }
    }

    // UI
    updateUI() {
        const panel = document.getElementById('side-quest-panel');
        if (!panel) return;

        if (this.activeQuests.length === 0) {
            panel.innerHTML = '<div class="no-quests">No active side quests</div>';
            return;
        }

        const questHTML = this.activeQuests.map(quest => {
            const objective = quest.objectives[quest.currentObjectiveIndex];
            const timeStr = this.formatTime(quest.timeRemaining);
            const rarityClass = `rarity-${quest.rarity}`;

            return `
                <div class="side-quest ${rarityClass}">
                    <div class="quest-header">
                        <span class="quest-icon">${quest.icon}</span>
                        <span class="quest-name">${quest.name}</span>
                        <span class="quest-timer">${timeStr}</span>
                    </div>
                    ${objective ? `
                        <div class="quest-objective">
                            ${objective.description}
                            ${objective.required > 1 ? `(${objective.current || 0}/${objective.required})` : ''}
                        </div>
                    ` : ''}
                    <div class="quest-distance">
                        ${Math.round(Math.hypot(
                (this.game.player?.x || 0) - quest.location.x,
                (this.game.player?.y || 0) - quest.location.y
            ))} blocks away
                    </div>
                </div>
            `;
        }).join('');

        panel.innerHTML = questHTML;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Get active quest by template type (for world event hooks)
    getActiveQuestByType(templateId) {
        return this.activeQuests.find(q => q.templateId === templateId);
    }

    // Abandon a quest
    abandonQuest(questId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (quest) {
            quest.fail('abandoned');
            this.activeQuests = this.activeQuests.filter(q => q.id !== questId);

            // Remove map marker
            if (this.game.mapMarkers) {
                this.game.mapMarkers.removeMarker(questId);
            }
        }
    }

    // Save/Load
    serialize() {
        return {
            activeQuests: this.activeQuests.map(q => q.serialize()),
            completedQuests: this.completedQuests,
            totalCompleted: this.totalCompleted,
            questsSpawned: this.questsSpawned,
            questCooldown: this.questCooldown,
        };
    }

    deserialize(data) {
        if (!data) return;

        this.completedQuests = data.completedQuests || [];
        this.totalCompleted = data.totalCompleted || 0;
        this.questsSpawned = data.questsSpawned || 0;
        this.questCooldown = data.questCooldown || 0;

        // Restore active quests
        this.activeQuests = [];
        if (data.activeQuests) {
            for (const questData of data.activeQuests) {
                const template = SIDE_QUEST_TEMPLATES[questData.templateId?.toUpperCase()];
                if (template) {
                    const quest = new ActiveSideQuest(template, questData.location, this.game);
                    quest.id = questData.id;
                    quest.status = questData.status;
                    quest.timeRemaining = questData.timeRemaining;
                    quest.currentObjectiveIndex = questData.currentObjectiveIndex;
                    quest.objectives = questData.objectives;
                    quest.progress = questData.progress;
                    this.activeQuests.push(quest);
                }
            }
        }
    }
}
