// Crafting Stations - Different workbenches unlock different recipes
import { CONFIG, ITEMS, RECIPES } from '../config.js';

export const STATION_TYPES = {
    HAND: {
        id: 'hand',
        name: 'Hand Crafting',
        icon: '✋',
        description: 'Basic crafting without tools',
        range: 0 // Always available
    },
    WORKBENCH: {
        id: 'workbench',
        name: 'Stone Workbench',
        icon: '🪨',
        blockId: 'crafting_table',
        description: 'Craft tools and basic items',
        range: 3,
        recipe: { stone: 8, stick: 4 }
    },
    FORGE: {
        id: 'forge',
        name: 'Forge',
        icon: '🔥',
        blockId: 'furnace',
        description: 'Smelt ores and craft metal items',
        range: 3,
        requiresFuel: true,
        recipe: { stone: 20, clay: 10 }
    },
    TANNING_RACK: {
        id: 'tanning_rack',
        name: 'Tanning Rack',
        icon: '🦴',
        blockId: 'tanning_rack',
        description: 'Process leather and hides',
        range: 3,
        recipe: { stick: 8, fiber: 10, bone: 4 }
    },
    LOOM: {
        id: 'loom',
        name: 'Loom',
        icon: '🧶',
        blockId: 'loom',
        description: 'Craft cloth and clothing',
        range: 3,
        recipe: { stick: 12, fiber: 20 }
    },
    ALCHEMY_TABLE: {
        id: 'alchemy_table',
        name: 'Alchemy Table',
        icon: '⚗️',
        blockId: 'alchemy_table',
        description: 'Brew potions and elixirs',
        range: 3,
        recipe: { stone: 10, crystal: 5, clay: 8 }
    },
    ANVIL: {
        id: 'anvil',
        name: 'Anvil',
        icon: '🔨',
        blockId: 'anvil',
        description: 'Repair and upgrade tools',
        range: 3,
        recipe: { bronze_ingot: 15 }
    },
    CAMPFIRE: {
        id: 'campfire',
        name: 'Campfire',
        icon: '🏕️',
        blockId: 'campfire',
        description: 'Cook food and stay warm',
        range: 3,
        requiresFuel: true,
        recipe: { stick: 5, stone: 3 }
    },
    
    // Multi-part stations
    KILN: {
        id: 'kiln',
        name: 'Tribal Kiln',
        icon: '🔥',
        description: 'Multi-block structure for pottery and high-temperature cooking',
        range: 4,
        requiresFuel: true,
        multiBlock: true
    },
    
    SMELTERY: {
        id: 'smeltery',
        name: 'Bronze Age Smeltery',
        icon: '🏭',
        description: 'Advanced multi-block furnace for alloy production',
        range: 5,
        requiresFuel: true,
        multiBlock: true
    }
};

// Recipe station requirements
export const STATION_RECIPES = {
    // Hand crafting (always available)
    hand: [
        'stick', 'fiber', 'club', 'stone_axe_basic', 'torch', 'rope',
        'campfire', 'workbench'
    ],
    
    // Workbench recipes
    workbench: [
        'stone_pickaxe', 'stone_axe', 'stone_sword', 'wooden_spear',
        'bow', 'arrow', 'chest', 'bed', 'fence', 'door',
        'tanning_rack', 'loom', 'forge'
    ],
    
    // Forge recipes (metal working)
    forge: [
        'bronze_ingot', 'iron_ingot', 'gold_ingot',
        'bronze_pickaxe', 'bronze_axe', 'bronze_sword',
        'iron_pickaxe', 'iron_axe', 'iron_sword',
        'anvil', 'bucket', 'chain'
    ],
    
    // Tanning rack recipes
    tanning_rack: [
        'leather', 'fur_coat', 'leather_armor', 'leather_boots',
        'quiver', 'leather_bag', 'waterskin'
    ],
    
    // Loom recipes
    loom: [
        'cloth', 'bandage', 'rope_ladder', 'net', 'tent',
        'cloth_armor', 'backpack'
    ],
    
    // Alchemy table recipes
    alchemy_table: [
        'health_potion', 'stamina_potion', 'antidote',
        'strength_elixir', 'speed_elixir', 'invisibility_potion',
        'fire_resist_potion', 'cold_resist_potion'
    ],
    
    // Anvil recipes (repair/upgrade)
    anvil: [
        'reinforced_tools', 'enchanted_weapons'
    ],
    
    // Campfire recipes (cooking)
    campfire: [
        'cooked_meat', 'cooked_fish', 'meat_stew', 'fish_soup',
        'roasted_vegetables', 'berry_jam'
    ],

    // Multi-part station recipes
    kiln: [
        'clay_pot', 'brick', 'cooked_meat', 'bone_meal', 'charcoal'
    ],
    
    smeltery: [
        'bronze_ingot', 'steel_ingot', 'iron_ingot', 'copper_ingot', 'gold_ingot'
    ]
};

export class CraftingStationSystem {
    constructor(game) {
        this.game = game;
        
        // Cache of nearby stations
        this.nearbyStations = new Set(['hand']); // Hand is always available
        
        // Placed stations in world (for custom placed ones)
        this.worldStations = [];
    }
    
    update(deltaTime) {
        // Update nearby stations based on player position
        this.updateNearbyStations();
    }
    
    updateNearbyStations() {
        const player = this.game.player;
        if (!player) return;
        
        this.nearbyStations.clear();
        this.nearbyStations.add('hand'); // Always available
        
        const world = this.game.world;
        if (!world) return;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        // Check blocks around player for stations
        const checkRadius = 4;
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                for (let dz = -2; dz <= 2; dz++) {
                    const block = world.getBlock(px + dx, py + dy, pz + dz);
                    if (!block || block === 'air') continue;
                    
                    // Check if block is a crafting station
                    for (const [key, station] of Object.entries(STATION_TYPES)) {
                        if (station.blockId === block) {
                            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                            if (dist <= station.range) {
                                this.nearbyStations.add(station.id);
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Check if player can craft a recipe
    canCraft(recipeKey) {
        // Find which station the recipe requires
        const requiredStation = this.getRequiredStation(recipeKey);
        return this.nearbyStations.has(requiredStation);
    }
    
    // Get required station for recipe
    getRequiredStation(recipeKey) {
        for (const [station, recipes] of Object.entries(STATION_RECIPES)) {
            if (recipes.includes(recipeKey)) {
                return station;
            }
        }
        return 'hand'; // Default to hand crafting
    }
    
    // Get list of available recipes based on nearby stations
    getAvailableRecipes() {
        const available = [];
        for (const stationId of this.nearbyStations) {
            const recipes = STATION_RECIPES[stationId] || [];
            available.push(...recipes);
        }
        return [...new Set(available)]; // Remove duplicates
    }
    
    // Check if station is nearby
    hasStation(stationId) {
        return this.nearbyStations.has(stationId);
    }
    
    // Get station info
    getStationInfo(stationId) {
        for (const [key, station] of Object.entries(STATION_TYPES)) {
            if (station.id === stationId) {
                return station;
            }
        }
        return null;
    }
    
    // Get list of nearby stations for UI
    getNearbyStationsList() {
        return Array.from(this.nearbyStations).map(id => {
            const station = this.getStationInfo(id);
            return station || { id, name: id, icon: '❓' };
        });
    }
    
    // Place a station in the world
    placeStation(stationId, x, y, z) {
        const stationInfo = this.getStationInfo(stationId);
        if (!stationInfo || !stationInfo.blockId) return false;
        
        // Place the block
        if (this.game.world) {
            this.game.world.setBlock(x, y, z, stationInfo.blockId);
            
            this.worldStations.push({
                id: stationId,
                x, y, z
            });
            
            this.game.ui?.showMessage(`${stationInfo.icon} Placed ${stationInfo.name}`, 2000);
            return true;
        }
        return false;
    }
    
    // Serialize for save
    serialize() {
        return {
            worldStations: this.worldStations
        };
    }
    
    deserialize(data) {
        if (data?.worldStations) {
            this.worldStations = data.worldStations;
        }
    }
    
    // Open a crafting station UI
    openStation(stationType, x, y, z) {
        const station = STATION_TYPES[stationType];
        if (!station) return false;

        const player = this.game.player;
        if (!player) return false;

        // Check distance to station
        const distance = Math.sqrt(
            Math.pow(player.x - x, 2) +
            Math.pow(player.y - y, 2) +
            Math.pow(player.z - z, 2)
        );

        if (distance > (station.range || 3)) return false;

        // Open appropriate UI based on station type
        if (stationType === 'FORGE' || station.blockId === 'furnace') {
            this.game.ui?.toggleFurnace?.(true);
            return true;
        }

        return false;
    }

    reset() {
        this.nearbyStations.clear();
        this.nearbyStations.add('hand');
        this.worldStations = [];
    }
}

// Export station items for config
export const STATION_ITEMS = {
    workbench: {
        name: 'Stone Workbench',
        type: 'placeable',
        emoji: '🪨',
        stackSize: 1,
        description: 'Place to unlock workbench recipes.'
    },
    tanning_rack: {
        name: 'Tanning Rack',
        type: 'placeable',
        emoji: '🦴',
        stackSize: 1,
        description: 'Place to process leather and hides.'
    },
    loom: {
        name: 'Loom',
        type: 'placeable',
        emoji: '🧶',
        stackSize: 1,
        description: 'Place to craft cloth items.'
    },
    alchemy_table: {
        name: 'Alchemy Table',
        type: 'placeable',
        emoji: '⚗️',
        stackSize: 1,
        description: 'Place to brew potions.'
    },
    anvil: {
        name: 'Anvil',
        type: 'placeable',
        emoji: '🔨',
        stackSize: 1,
        description: 'Place to repair and upgrade tools.'
    }
};
