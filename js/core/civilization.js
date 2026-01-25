/**
 * Civilization Management System
 * Core system for managing settlements, population, resources, and civilization progression
 */

import { CONFIG, BLOCKS, ITEMS } from '../config.js';

// Settlement building types
export const BUILDING_TYPES = {
    HUT: {
        id: 'hut',
        name: 'Primitive Hut',
        description: 'Basic shelter for 2 villagers',
        housingCapacity: 2,
        cost: { [ITEMS.WOOD]: 10, [ITEMS.THATCH]: 5 },
        size: { width: 3, depth: 3, height: 3 },
        workSlots: 0,
        age: 'stone',
        buildTime: 30
    },
    CAMPFIRE: {
        id: 'campfire',
        name: 'Campfire',
        description: 'Gathering spot, provides warmth and light',
        housingCapacity: 0,
        cost: { [ITEMS.STONE]: 5, [ITEMS.WOOD]: 3 },
        size: { width: 1, depth: 1, height: 1 },
        workSlots: 1,
        age: 'stone',
        buildTime: 10,
        effect: { happiness: 5, warmth: true }
    },
    STORAGE_PIT: {
        id: 'storage_pit',
        name: 'Storage Pit',
        description: 'Stores resources for the settlement',
        housingCapacity: 0,
        cost: { [ITEMS.STONE]: 15 },
        size: { width: 2, depth: 2, height: 1 },
        workSlots: 0,
        age: 'stone',
        buildTime: 20,
        storageCapacity: 500
    },
    FARM_PLOT: {
        id: 'farm_plot',
        name: 'Farm Plot',
        description: 'Grows food automatically when tended',
        housingCapacity: 0,
        cost: { [ITEMS.WOOD]: 5 },
        size: { width: 4, depth: 4, height: 1 },
        workSlots: 1,
        age: 'stone',
        buildTime: 15,
        production: { type: 'food', rate: 1, requires: 'farmer' }
    },
    WORKSHOP: {
        id: 'workshop',
        name: 'Crafting Workshop',
        description: 'Villagers craft tools and items here',
        housingCapacity: 0,
        cost: { [ITEMS.WOOD]: 20, [ITEMS.STONE]: 10 },
        size: { width: 4, depth: 4, height: 3 },
        workSlots: 2,
        age: 'stone',
        buildTime: 45,
        production: { type: 'tools', rate: 0.5, requires: 'crafter' }
    },
    LONGHOUSE: {
        id: 'longhouse',
        name: 'Longhouse',
        description: 'Large communal dwelling for 6 villagers',
        housingCapacity: 6,
        cost: { [ITEMS.WOOD]: 30, [ITEMS.THATCH]: 15, [ITEMS.STONE]: 5 },
        size: { width: 6, depth: 4, height: 4 },
        workSlots: 0,
        age: 'tribal',
        buildTime: 90
    },
    WATCHTOWER: {
        id: 'watchtower',
        name: 'Watchtower',
        description: 'Extends territory vision, guards patrol here',
        housingCapacity: 0,
        cost: { [ITEMS.WOOD]: 25, [ITEMS.STONE]: 15 },
        size: { width: 2, depth: 2, height: 6 },
        workSlots: 1,
        age: 'tribal',
        buildTime: 60,
        effect: { vision: 20, defense: 10 }
    },
    GRANARY: {
        id: 'granary',
        name: 'Granary',
        description: 'Stores food, prevents spoilage',
        housingCapacity: 0,
        cost: { [ITEMS.WOOD]: 20, [ITEMS.CLAY]: 10 },
        size: { width: 3, depth: 3, height: 3 },
        workSlots: 0,
        age: 'tribal',
        buildTime: 40,
        storageCapacity: 1000,
        storageType: 'food'
    },
    SHRINE: {
        id: 'shrine',
        name: 'Ancient Shrine',
        description: 'Boosts happiness and unlocks rituals',
        housingCapacity: 0,
        cost: { [ITEMS.STONE]: 30, [ITEMS.GOLD_ORE]: 5 },
        size: { width: 3, depth: 3, height: 4 },
        workSlots: 1,
        age: 'tribal',
        buildTime: 80,
        effect: { happiness: 15, unlocks: 'rituals' }
    },
    MINE_ENTRANCE: {
        id: 'mine_entrance',
        name: 'Mine Entrance',
        description: 'Miners gather ore from here automatically',
        housingCapacity: 0,
        cost: { [ITEMS.WOOD]: 15, [ITEMS.STONE]: 25 },
        size: { width: 3, depth: 3, height: 3 },
        workSlots: 3,
        age: 'tribal',
        buildTime: 70,
        production: { type: 'ore', rate: 0.3, requires: 'miner' }
    }
};

// Villager professions
export const PROFESSIONS = {
    IDLE: { id: 'idle', name: 'Idle', color: '#888888', priority: 0 },
    GATHERER: { id: 'gatherer', name: 'Gatherer', color: '#8B4513', priority: 1, gathers: ['wood', 'stone', 'berries'] },
    FARMER: { id: 'farmer', name: 'Farmer', color: '#228B22', priority: 2, works: 'farm_plot' },
    MINER: { id: 'miner', name: 'Miner', color: '#696969', priority: 2, works: 'mine_entrance' },
    CRAFTER: { id: 'crafter', name: 'Crafter', color: '#D2691E', priority: 3, works: 'workshop' },
    BUILDER: { id: 'builder', name: 'Builder', color: '#4169E1', priority: 4, builds: true },
    GUARD: { id: 'guard', name: 'Guard', color: '#DC143C', priority: 5, patrols: true },
    HUNTER: { id: 'hunter', name: 'Hunter', color: '#8B0000', priority: 2, hunts: true }
};

// Technology tree
export const TECHNOLOGIES = {
    // Stone Age
    BASIC_TOOLS: {
        id: 'basic_tools',
        name: 'Basic Tools',
        description: 'Unlock stone tools and faster gathering',
        cost: { research: 50 },
        age: 'stone',
        prerequisites: [],
        unlocks: { gatherSpeed: 1.25, buildings: [] }
    },
    FIRE_MASTERY: {
        id: 'fire_mastery',
        name: 'Fire Mastery',
        description: 'Better campfires, cooking, warmth',
        cost: { research: 75 },
        age: 'stone',
        prerequisites: ['basic_tools'],
        unlocks: { cooking: true, buildings: ['CAMPFIRE'] }
    },
    PRIMITIVE_FARMING: {
        id: 'primitive_farming',
        name: 'Primitive Farming',
        description: 'Plant and harvest crops',
        cost: { research: 100 },
        age: 'stone',
        prerequisites: ['basic_tools'],
        unlocks: { farming: true, buildings: ['FARM_PLOT'] }
    },
    SHELTER_BUILDING: {
        id: 'shelter_building',
        name: 'Shelter Building',
        description: 'Build huts for your people',
        cost: { research: 100 },
        age: 'stone',
        prerequisites: ['basic_tools'],
        unlocks: { buildings: ['HUT', 'STORAGE_PIT'] }
    },
    
    // Tribal Age
    ADVANCED_CONSTRUCTION: {
        id: 'advanced_construction',
        name: 'Advanced Construction',
        description: 'Build larger structures',
        cost: { research: 200 },
        age: 'tribal',
        prerequisites: ['shelter_building'],
        unlocks: { buildings: ['LONGHOUSE', 'WORKSHOP'] }
    },
    MINING: {
        id: 'mining',
        name: 'Mining',
        description: 'Extract ore from the earth',
        cost: { research: 250 },
        age: 'tribal',
        prerequisites: ['basic_tools'],
        unlocks: { mining: true, buildings: ['MINE_ENTRANCE'] }
    },
    WARFARE: {
        id: 'warfare',
        name: 'Warfare',
        description: 'Train guards and build defenses',
        cost: { research: 300 },
        age: 'tribal',
        prerequisites: ['advanced_construction'],
        unlocks: { guards: true, buildings: ['WATCHTOWER'] }
    },
    SPIRITUALITY: {
        id: 'spirituality',
        name: 'Spirituality',
        description: 'Build shrines, perform rituals',
        cost: { research: 350 },
        age: 'tribal',
        prerequisites: ['fire_mastery'],
        unlocks: { rituals: true, buildings: ['SHRINE'] }
    },
    FOOD_STORAGE: {
        id: 'food_storage',
        name: 'Food Storage',
        description: 'Store food without spoilage',
        cost: { research: 200 },
        age: 'tribal',
        prerequisites: ['primitive_farming'],
        unlocks: { buildings: ['GRANARY'] }
    },
    ANIMAL_HUSBANDRY: {
        id: 'animal_husbandry',
        name: 'Animal Husbandry',
        description: 'Tame and breed animals',
        cost: { research: 400 },
        age: 'tribal',
        prerequisites: ['primitive_farming'],
        unlocks: { taming: true, buildings: [] }
    }
};

export class CivilizationManager {
    constructor(game) {
        this.game = game;
        
        // Settlement data
        this.settlements = new Map(); // Map of settlement ID -> Settlement
        this.activeSettlement = null;
        
        // Global civilization stats
        this.totalPopulation = 0;
        this.totalHappiness = 50; // 0-100
        this.researchPoints = 0;
        this.unlockedTechnologies = new Set(['BASIC_TOOLS']); // Start with basic tools
        this.currentAge = 'stone';
        
        // Resource stockpile (global)
        this.stockpile = {
            food: 100,
            wood: 50,
            stone: 30,
            ore: 0,
            tools: 5,
            weapons: 0
        };
        
        // Work orders queue
        this.workOrders = [];
        
        // Diplomacy
        this.relations = new Map(); // Other tribe ID -> relation (-100 to 100)
        this.knownTribes = [];
        
        // Milestones
        this.milestones = new Set();
        
        // Update timers
        this.resourceTickTimer = 0;
        this.populationTickTimer = 0;
        this.happinessTickTimer = 0;
    }
    
    init() {
        console.log('CivilizationManager: Initializing...');
        
        // Create initial settlement at player spawn
        if (this.game.player) {
            const spawn = this.game.world?.getSafeSpawnPoint(0, 0) || { x: 0, y: 0, z: 20 };
            this.createSettlement('Home Village', spawn.x, spawn.y);
        }
        
        console.log('CivilizationManager: Initialized');
    }
    
    createSettlement(name, x, y) {
        const id = `settlement_${Date.now()}`;
        const settlement = new Settlement(this, id, name, x, y);
        this.settlements.set(id, settlement);
        
        if (!this.activeSettlement) {
            this.activeSettlement = settlement;
        }
        
        // Spawn initial villagers
        for (let i = 0; i < 3; i++) {
            this.spawnVillager(settlement);
        }
        
        console.log(`CivilizationManager: Created settlement "${name}" at ${x}, ${y}`);
        return settlement;
    }
    
    spawnVillager(settlement, profession = 'IDLE') {
        if (!this.game.villagers) {
            this.game.villagers = [];
        }
        
        // Import Villager class dynamically to avoid circular dependency
        const VillagerClass = this.game.Villager || window.Villager;
        if (!VillagerClass) {
            console.warn('CivilizationManager: Villager class not available');
            return null;
        }
        
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const spawnX = settlement.centerX + offsetX;
        const spawnY = settlement.centerY + offsetY;
        const spawnZ = this.game.world?.getHeight(Math.floor(spawnX), Math.floor(spawnY)) + 1 || 20;
        
        const villager = new VillagerClass(this.game, spawnX, spawnY, spawnZ);
        villager.settlement = settlement;
        villager.civProfession = PROFESSIONS[profession];
        villager.name = this.generateVillagerName();
        
        this.game.villagers.push(villager);
        settlement.villagers.push(villager);
        this.totalPopulation++;
        
        console.log(`CivilizationManager: Spawned villager "${villager.name}" at settlement "${settlement.name}"`);
        return villager;
    }
    
    generateVillagerName() {
        const prefixes = ['Grok', 'Thog', 'Brun', 'Kira', 'Mira', 'Zag', 'Oog', 'Tak', 'Lum', 'Gar'];
        const suffixes = ['ak', 'ok', 'a', 'i', 'un', 'ar', 'or', 'ik', 'ul', ''];
        return prefixes[Math.floor(Math.random() * prefixes.length)] + 
               suffixes[Math.floor(Math.random() * suffixes.length)];
    }
    
    update(deltaTime) {
        // Resource production tick (every 5 seconds)
        this.resourceTickTimer += deltaTime;
        if (this.resourceTickTimer >= 5) {
            this.resourceTickTimer = 0;
            this.updateResourceProduction();
        }
        
        // Population tick (every 60 seconds)
        this.populationTickTimer += deltaTime;
        if (this.populationTickTimer >= 60) {
            this.populationTickTimer = 0;
            this.updatePopulationGrowth();
        }
        
        // Happiness tick (every 10 seconds)
        this.happinessTickTimer += deltaTime;
        if (this.happinessTickTimer >= 10) {
            this.happinessTickTimer = 0;
            this.updateHappiness();
        }
        
        // Update settlements
        for (const [id, settlement] of this.settlements) {
            settlement.update(deltaTime);
        }
        
        // Process work orders
        this.processWorkOrders(deltaTime);
        
        // Check milestones
        this.checkMilestones();
    }
    
    updateResourceProduction() {
        for (const [id, settlement] of this.settlements) {
            const production = settlement.calculateProduction();
            
            // Add produced resources to stockpile
            for (const [resource, amount] of Object.entries(production)) {
                this.stockpile[resource] = (this.stockpile[resource] || 0) + amount;
            }
        }
        
        // Food consumption
        const foodConsumption = this.totalPopulation * 0.1;
        this.stockpile.food = Math.max(0, this.stockpile.food - foodConsumption);
        
        // Starvation check
        if (this.stockpile.food <= 0) {
            this.totalHappiness = Math.max(0, this.totalHappiness - 5);
        }
    }
    
    updatePopulationGrowth() {
        // Population grows if: happiness > 60, food surplus, housing available
        for (const [id, settlement] of this.settlements) {
            const housingCap = settlement.getHousingCapacity();
            const currentPop = settlement.villagers.length;
            
            if (currentPop < housingCap && 
                this.totalHappiness > 60 && 
                this.stockpile.food > this.totalPopulation * 10) {
                
                // 10% chance per tick to spawn new villager
                if (Math.random() < 0.1) {
                    this.spawnVillager(settlement, 'IDLE');
                    this.game.ui?.showMessage('A new villager has joined your settlement!', 'success');
                }
            }
        }
    }
    
    updateHappiness() {
        let happiness = 50; // Base happiness
        
        // Food surplus bonus
        if (this.stockpile.food > this.totalPopulation * 20) {
            happiness += 10;
        } else if (this.stockpile.food < this.totalPopulation * 5) {
            happiness -= 20;
        }
        
        // Housing bonus/penalty
        let totalHousing = 0;
        for (const [id, settlement] of this.settlements) {
            totalHousing += settlement.getHousingCapacity();
        }
        if (totalHousing >= this.totalPopulation) {
            happiness += 10;
        } else {
            happiness -= 15;
        }
        
        // Building effects
        for (const [id, settlement] of this.settlements) {
            for (const building of settlement.buildings) {
                if (building.data.effect?.happiness) {
                    happiness += building.data.effect.happiness;
                }
            }
        }
        
        // Smooth transition
        this.totalHappiness = this.totalHappiness * 0.9 + happiness * 0.1;
        this.totalHappiness = Math.max(0, Math.min(100, this.totalHappiness));
    }
    
    processWorkOrders(deltaTime) {
        if (this.workOrders.length === 0) return;
        
        // Find idle villagers to assign work
        const idleVillagers = [];
        for (const [id, settlement] of this.settlements) {
            for (const villager of settlement.villagers) {
                if (villager.civProfession?.id === 'idle' && !villager.currentTask) {
                    idleVillagers.push(villager);
                }
            }
        }
        
        // Assign work orders to idle villagers
        for (const villager of idleVillagers) {
            if (this.workOrders.length === 0) break;
            
            const order = this.workOrders[0];
            villager.currentTask = order;
            villager.taskProgress = 0;
            
            // Remove from queue (will be re-added if not complete)
            this.workOrders.shift();
        }
    }
    
    addWorkOrder(type, data) {
        this.workOrders.push({
            type: type,
            data: data,
            priority: data.priority || 1,
            created: Date.now()
        });
        
        // Sort by priority
        this.workOrders.sort((a, b) => b.priority - a.priority);
    }
    
    canAfford(costs) {
        for (const [resource, amount] of Object.entries(costs)) {
            const stockpileKey = this.getStockpileKey(resource);
            if ((this.stockpile[stockpileKey] || 0) < amount) {
                return false;
            }
        }
        return true;
    }
    
    spendResources(costs) {
        for (const [resource, amount] of Object.entries(costs)) {
            const stockpileKey = this.getStockpileKey(resource);
            this.stockpile[stockpileKey] = (this.stockpile[stockpileKey] || 0) - amount;
        }
    }
    
    getStockpileKey(itemId) {
        // Map item IDs to stockpile categories
        if (itemId === ITEMS.WOOD || itemId === ITEMS.PLANKS) return 'wood';
        if (itemId === ITEMS.STONE || itemId === ITEMS.COBBLESTONE) return 'stone';
        if (itemId === ITEMS.IRON_ORE || itemId === ITEMS.GOLD_ORE) return 'ore';
        if (itemId === ITEMS.RAW_MEAT || itemId === ITEMS.BERRIES || itemId === ITEMS.COOKED_MEAT) return 'food';
        return 'misc';
    }
    
    unlockTechnology(techId) {
        const tech = TECHNOLOGIES[techId];
        if (!tech) return false;
        
        // Check prerequisites
        for (const prereq of tech.prerequisites) {
            if (!this.unlockedTechnologies.has(prereq)) {
                return false;
            }
        }
        
        // Check research cost
        if (this.researchPoints < tech.cost.research) {
            return false;
        }
        
        // Spend research points
        this.researchPoints -= tech.cost.research;
        this.unlockedTechnologies.add(techId);
        
        this.game.ui?.showMessage(`Technology unlocked: ${tech.name}!`, 'success');
        console.log(`CivilizationManager: Unlocked technology "${tech.name}"`);
        
        return true;
    }
    
    isTechnologyUnlocked(techId) {
        return this.unlockedTechnologies.has(techId);
    }
    
    canBuildBuilding(buildingType) {
        const building = BUILDING_TYPES[buildingType];
        if (!building) return false;
        
        // Check age requirement
        const ages = ['stone', 'tribal', 'bronze', 'iron'];
        const currentAgeIndex = ages.indexOf(this.currentAge);
        const requiredAgeIndex = ages.indexOf(building.age);
        if (requiredAgeIndex > currentAgeIndex) return false;
        
        // Check technology unlocks
        for (const [techId, tech] of Object.entries(TECHNOLOGIES)) {
            if (tech.unlocks?.buildings?.includes(buildingType)) {
                if (!this.isTechnologyUnlocked(techId)) return false;
            }
        }
        
        // Check resources
        return this.canAfford(building.cost);
    }
    
    checkMilestones() {
        // First villager
        if (this.totalPopulation >= 1 && !this.milestones.has('first_villager')) {
            this.milestones.add('first_villager');
            this.game.ui?.showMessage('🏆 Milestone: First Villager!', 'success');
        }
        
        // Small tribe
        if (this.totalPopulation >= 10 && !this.milestones.has('small_tribe')) {
            this.milestones.add('small_tribe');
            this.game.ui?.showMessage('🏆 Milestone: Small Tribe (10 villagers)!', 'success');
            this.researchPoints += 50;
        }
        
        // First building
        let totalBuildings = 0;
        for (const [id, settlement] of this.settlements) {
            totalBuildings += settlement.buildings.length;
        }
        if (totalBuildings >= 1 && !this.milestones.has('first_building')) {
            this.milestones.add('first_building');
            this.game.ui?.showMessage('🏆 Milestone: First Building!', 'success');
        }
        
        // Self-sufficient
        if (this.stockpile.food >= 500 && !this.milestones.has('self_sufficient')) {
            this.milestones.add('self_sufficient');
            this.game.ui?.showMessage('🏆 Milestone: Self-Sufficient (500 food stored)!', 'success');
            this.researchPoints += 100;
        }
    }
    
    getStats() {
        return {
            population: this.totalPopulation,
            happiness: Math.round(this.totalHappiness),
            stockpile: { ...this.stockpile },
            researchPoints: this.researchPoints,
            currentAge: this.currentAge,
            settlements: this.settlements.size,
            technologies: this.unlockedTechnologies.size,
            milestones: this.milestones.size
        };
    }
    
    serialize() {
        return {
            settlements: Array.from(this.settlements.entries()).map(([id, s]) => s.serialize()),
            stockpile: this.stockpile,
            researchPoints: this.researchPoints,
            unlockedTechnologies: Array.from(this.unlockedTechnologies),
            currentAge: this.currentAge,
            milestones: Array.from(this.milestones),
            relations: Array.from(this.relations.entries())
        };
    }
    
    deserialize(data) {
        if (!data) return;
        
        this.stockpile = data.stockpile || this.stockpile;
        this.researchPoints = data.researchPoints || 0;
        this.unlockedTechnologies = new Set(data.unlockedTechnologies || ['BASIC_TOOLS']);
        this.currentAge = data.currentAge || 'stone';
        this.milestones = new Set(data.milestones || []);
        this.relations = new Map(data.relations || []);
        
        // Settlements need to be reconstructed with game reference
        // This will be done when villagers are loaded
    }
}

class Settlement {
    constructor(civManager, id, name, centerX, centerY) {
        this.civManager = civManager;
        this.game = civManager.game;
        this.id = id;
        this.name = name;
        this.centerX = centerX;
        this.centerY = centerY;
        this.radius = 30; // Territory radius
        
        this.villagers = [];
        this.buildings = [];
        this.buildQueue = [];
        
        this.founded = Date.now();
    }
    
    update(deltaTime) {
        // Process build queue
        if (this.buildQueue.length > 0) {
            const current = this.buildQueue[0];
            current.progress += deltaTime;
            
            // Count builders working on it
            const builders = this.villagers.filter(v => 
                v.civProfession?.id === 'builder' && v.currentTask?.building === current
            );
            const buildSpeed = 1 + builders.length * 0.5;
            current.progress += deltaTime * buildSpeed;
            
            if (current.progress >= current.buildTime) {
                this.completeBuilding(current);
                this.buildQueue.shift();
            }
        }
        
        // Update villager tasks
        for (const villager of this.villagers) {
            this.updateVillagerTask(villager, deltaTime);
        }
    }
    
    updateVillagerTask(villager, deltaTime) {
        if (!villager.civProfession || villager.civProfession.id === 'idle') {
            // Auto-assign profession based on needs
            this.autoAssignProfession(villager);
            return;
        }
        
        // Execute profession-specific behavior
        switch (villager.civProfession.id) {
            case 'gatherer':
                this.doGatheringTask(villager, deltaTime);
                break;
            case 'farmer':
                this.doFarmingTask(villager, deltaTime);
                break;
            case 'builder':
                this.doBuildingTask(villager, deltaTime);
                break;
            case 'guard':
                this.doGuardTask(villager, deltaTime);
                break;
            case 'miner':
                this.doMiningTask(villager, deltaTime);
                break;
        }
    }
    
    autoAssignProfession(villager) {
        // Priority: builder (if build queue) > farmer > gatherer > guard
        if (this.buildQueue.length > 0) {
            const builders = this.villagers.filter(v => v.civProfession?.id === 'builder');
            if (builders.length < 2) {
                villager.civProfession = PROFESSIONS.BUILDER;
                return;
            }
        }
        
        const farmers = this.villagers.filter(v => v.civProfession?.id === 'farmer');
        const farmPlots = this.buildings.filter(b => b.data.id === 'farm_plot');
        if (farmers.length < farmPlots.length) {
            villager.civProfession = PROFESSIONS.FARMER;
            return;
        }
        
        const gatherers = this.villagers.filter(v => v.civProfession?.id === 'gatherer');
        if (gatherers.length < 3) {
            villager.civProfession = PROFESSIONS.GATHERER;
            return;
        }
        
        // Default to gatherer
        villager.civProfession = PROFESSIONS.GATHERER;
    }
    
    doGatheringTask(villager, deltaTime) {
        // Simple gathering: wander and collect resources periodically
        if (!villager.gatherTimer) villager.gatherTimer = 0;
        villager.gatherTimer += deltaTime;
        
        if (villager.gatherTimer >= 10) { // Every 10 seconds
            villager.gatherTimer = 0;
            
            // Random resource gain
            const resources = ['wood', 'stone', 'food'];
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const amount = Math.floor(Math.random() * 3) + 1;
            
            this.civManager.stockpile[resource] += amount;
        }
    }
    
    doFarmingTask(villager, deltaTime) {
        // Farming produces food over time
        if (!villager.farmTimer) villager.farmTimer = 0;
        villager.farmTimer += deltaTime;
        
        if (villager.farmTimer >= 15) {
            villager.farmTimer = 0;
            this.civManager.stockpile.food += 5;
        }
    }
    
    doBuildingTask(villager, deltaTime) {
        // Building is handled in settlement.update()
        if (this.buildQueue.length > 0) {
            villager.currentTask = { building: this.buildQueue[0] };
        }
    }
    
    doGuardTask(villager, deltaTime) {
        // Guards patrol and defend
        // For now, just presence increases defense
    }
    
    doMiningTask(villager, deltaTime) {
        if (!villager.mineTimer) villager.mineTimer = 0;
        villager.mineTimer += deltaTime;
        
        if (villager.mineTimer >= 20) {
            villager.mineTimer = 0;
            this.civManager.stockpile.ore += 2;
            this.civManager.stockpile.stone += 1;
        }
    }
    
    queueBuilding(buildingType, x, y, z) {
        const buildingData = BUILDING_TYPES[buildingType];
        if (!buildingData) return false;
        
        // Check if can afford
        if (!this.civManager.canAfford(buildingData.cost)) {
            this.game.ui?.showMessage('Not enough resources!', 'error');
            return false;
        }
        
        // Spend resources
        this.civManager.spendResources(buildingData.cost);
        
        const buildOrder = {
            type: buildingType,
            data: buildingData,
            x: x,
            y: y,
            z: z,
            progress: 0,
            buildTime: buildingData.buildTime
        };
        
        this.buildQueue.push(buildOrder);
        this.game.ui?.showMessage(`Queued building: ${buildingData.name}`, 'info');
        
        return true;
    }
    
    completeBuilding(buildOrder) {
        const building = {
            type: buildOrder.type,
            data: buildOrder.data,
            x: buildOrder.x,
            y: buildOrder.y,
            z: buildOrder.z,
            built: Date.now()
        };
        
        this.buildings.push(building);
        
        // Place blocks in world
        this.placeStructureBlocks(building);
        
        this.game.ui?.showMessage(`Building complete: ${buildOrder.data.name}!`, 'success');
    }
    
    placeStructureBlocks(building) {
        const data = building.data;
        const world = this.game.world;
        if (!world) return;
        
        // Simple block placement based on building type
        const baseBlock = BLOCKS.PLANKS;
        const roofBlock = BLOCKS.THATCH;
        
        for (let dx = 0; dx < data.size.width; dx++) {
            for (let dy = 0; dy < data.size.depth; dy++) {
                for (let dz = 0; dz < data.size.height; dz++) {
                    const wx = building.x + dx;
                    const wy = building.y + dy;
                    const wz = building.z + dz;
                    
                    // Walls on edges, roof on top
                    if (dx === 0 || dx === data.size.width - 1 ||
                        dy === 0 || dy === data.size.depth - 1) {
                        world.setBlock(wx, wy, wz, baseBlock);
                    } else if (dz === data.size.height - 1) {
                        world.setBlock(wx, wy, wz, roofBlock);
                    }
                }
            }
        }
    }
    
    getHousingCapacity() {
        let capacity = 5; // Base capacity (camping)
        for (const building of this.buildings) {
            capacity += building.data.housingCapacity || 0;
        }
        return capacity;
    }
    
    calculateProduction() {
        const production = {};
        
        for (const building of this.buildings) {
            if (building.data.production) {
                const prod = building.data.production;
                const workers = this.villagers.filter(v => 
                    v.civProfession?.works === building.data.id
                );
                
                if (workers.length > 0) {
                    const type = prod.type;
                    const amount = prod.rate * workers.length;
                    production[type] = (production[type] || 0) + amount;
                }
            }
        }
        
        return production;
    }
    
    serialize() {
        return {
            id: this.id,
            name: this.name,
            centerX: this.centerX,
            centerY: this.centerY,
            radius: this.radius,
            buildings: this.buildings,
            buildQueue: this.buildQueue,
            founded: this.founded
        };
    }
}

export { Settlement };
