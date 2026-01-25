// Game Configuration Constants
export const CONFIG = {
    // Display
    TILE_WIDTH: 64,
    TILE_HEIGHT: 32,
    TILE_DEPTH: 16,

    // World
    CHUNK_SIZE: 16,
    WORLD_HEIGHT: 32,
    RENDER_DISTANCE: 2,
    SEA_LEVEL: 12,

    // Player
    PLAYER_SPEED: 3,
    PLAYER_JUMP_FORCE: 8,
    PLAYER_MAX_HEALTH: 100,
    PLAYER_MAX_HUNGER: 100,
    HUNGER_DRAIN_RATE: 0.5,
    HUNGER_DAMAGE_RATE: 2,
    HUNGER_DAMAGE_THRESHOLD: 0,
    FALL_DAMAGE_MIN_HEIGHT: 4,
    FALL_DAMAGE_MULTIPLIER: 5,

    // Swimming
    SWIM_SPEED: 1.5,
    WATER_DRAG: 0.5,
    DROWNING_TIME: 10,
    DROWNING_DAMAGE: 2,

    // Mobile
    MOBILE_CONTROLS_ENABLED: true,

    // Physics
    GRAVITY: 0.4,
    FRICTION: 0.8,
    AIR_RESISTANCE: 0.98,

    // Mining
    BASE_MINING_SPEED: 1,
    MINING_RANGE: 4,

    // Combat
    ATTACK_RANGE: 1.5,
    ATTACK_COOLDOWN: 500,
    KNOCKBACK_FORCE: 5,
    INVINCIBILITY_TIME: 500,

    // Day/Night Cycle
    DAY_LENGTH: 600, // seconds for full day
    DAWN_START: 0.2,
    DUSK_START: 0.7,

    // Enemies
    ENEMY_SPAWN_RATE: 0.05, // Much higher for testing
    MAX_ENEMIES_PER_CHUNK: 5,
    ENEMY_DESPAWN_DISTANCE: 60,

    // Inventory
    INVENTORY_SIZE: 32,
    HOTBAR_SIZE: 8,
    STACK_SIZE: 64,

    // Save
    SAVE_KEY: 'caveman_survival_save',
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
};

// Block Types - Comprehensive Minecraft-style block system
export const BLOCKS = {
    AIR: 0,
    STONE: 1,
    DIRT: 2,
    GRASS: 3,
    SAND: 4,
    WATER: 5,
    WOOD: 6,
    LEAVES: 7,
    COAL_ORE: 8,
    IRON_ORE: 9,
    GOLD_ORE: 10,
    DIAMOND_ORE: 11,
    BEDROCK: 12,
    GRAVEL: 13,
    CLAY: 14,
    SNOW: 15,
    ICE: 16,
    CRAFTING_TABLE: 17,
    FURNACE: 18,
    CHEST: 19,
    FARMLAND: 20,
    WHEAT_CROP: 21,
    CACTUS: 22,
    // New blocks for building
    COBBLESTONE: 23,
    PLANKS: 24,
    BRICK: 25,
    GLASS: 26,
    TORCH: 27,
    LADDER: 28,
    FENCE: 29,
    DOOR: 30,
    MOSS_STONE: 31,
    SANDSTONE: 32,
    OBSIDIAN: 33,
    CLAY_BRICK: 34,
    BONE_BLOCK: 35,
    HAY_BLOCK: 36,
    THATCH: 37, // Prehistoric roof material
    MUD_BRICK: 38,
    CAMPFIRE: 39,
};

// Block Properties - Each block has unique characteristics
export const BLOCK_DATA = {
    [BLOCKS.AIR]: { 
        name: 'Air', solid: false, transparent: true, hardness: 0, 
        drops: null, color: 'transparent', emoji: '',
        flammable: false, lightLevel: 0
    },
    [BLOCKS.STONE]: { 
        name: 'Stone', solid: true, transparent: false, hardness: 3, 
        drops: 'cobblestone', color: '#888888', emoji: '🪨',
        toolRequired: 'pickaxe', flammable: false, blastResistance: 6
    },
    [BLOCKS.DIRT]: { 
        name: 'Dirt', solid: true, transparent: false, hardness: 1, 
        drops: 'dirt', color: '#8B4513', emoji: '🟫',
        flammable: false, canGrowGrass: true
    },
    [BLOCKS.GRASS]: { 
        name: 'Grass', solid: true, transparent: false, hardness: 1, 
        drops: 'dirt', color: '#228B22', emoji: '🌿',
        flammable: false, spreadable: true
    },
    [BLOCKS.SAND]: { 
        name: 'Sand', solid: true, transparent: false, hardness: 1, 
        drops: 'sand', color: '#F4D03F', emoji: '🏖️',
        gravity: true, flammable: false
    },
    [BLOCKS.WATER]: { 
        name: 'Water', solid: false, transparent: true, hardness: 0, 
        drops: null, color: '#4169E1', emoji: '💧',
        fluid: true, flowSpeed: 4
    },
    [BLOCKS.WOOD]: { 
        name: 'Wood Log', solid: true, transparent: false, hardness: 2, 
        drops: 'wood', color: '#8B5A2B', emoji: '🪵',
        toolPreferred: 'axe', flammable: true, burnTime: 300
    },
    [BLOCKS.LEAVES]: { 
        name: 'Leaves', solid: false, transparent: true, hardness: 0.5, 
        drops: 'leaves', color: '#32CD32', emoji: '🍃',
        flammable: true, decayable: true, dropChance: { stick: 0.1, apple: 0.02 }
    },
    [BLOCKS.COAL_ORE]: { 
        name: 'Coal Ore', solid: true, transparent: false, hardness: 4, 
        drops: 'coal', color: '#333333', emoji: '⬛',
        toolRequired: 'pickaxe', xpDrop: 1
    },
    [BLOCKS.IRON_ORE]: { 
        name: 'Iron Ore', solid: true, transparent: false, hardness: 5, 
        drops: 'raw_iron', color: '#CD853F', emoji: '🔶',
        toolRequired: 'pickaxe', toolLevel: 1, xpDrop: 2
    },
    [BLOCKS.GOLD_ORE]: { 
        name: 'Gold Ore', solid: true, transparent: false, hardness: 5, 
        drops: 'raw_gold', color: '#FFD700', emoji: '🟡',
        toolRequired: 'pickaxe', toolLevel: 2, xpDrop: 3
    },
    [BLOCKS.DIAMOND_ORE]: { 
        name: 'Diamond Ore', solid: true, transparent: false, hardness: 6, 
        drops: 'diamond', color: '#00FFFF', emoji: '💎',
        toolRequired: 'pickaxe', toolLevel: 2, xpDrop: 5
    },
    [BLOCKS.BEDROCK]: { 
        name: 'Bedrock', solid: true, transparent: false, hardness: -1, 
        drops: null, color: '#1a1a1a', emoji: '⬛',
        unbreakable: true, blastResistance: 999
    },
    [BLOCKS.GRAVEL]: { 
        name: 'Gravel', solid: true, transparent: false, hardness: 1, 
        drops: 'flint', color: '#696969', emoji: '⚫',
        gravity: true, dropChance: { flint: 0.3, gravel: 0.7 }
    },
    [BLOCKS.CLAY]: { 
        name: 'Clay', solid: true, transparent: false, hardness: 1, 
        drops: 'clay', color: '#A9A9A9', emoji: '🔘',
        dropCount: 4
    },
    [BLOCKS.SNOW]: { 
        name: 'Snow', solid: true, transparent: false, hardness: 0.5, 
        drops: 'snowball', color: '#FFFAFA', emoji: '❄️',
        meltsNearFire: true
    },
    [BLOCKS.ICE]: { 
        name: 'Ice', solid: true, transparent: true, hardness: 1, 
        drops: null, color: '#ADD8E6', emoji: '🧊',
        slippery: true, meltsNearFire: true
    },
    [BLOCKS.CRAFTING_TABLE]: { 
        name: 'Crafting Table', solid: true, transparent: false, hardness: 2, 
        drops: 'crafting_table', color: '#DEB887', emoji: '🔨',
        interactive: true, craftingGrid: 3
    },
    [BLOCKS.FURNACE]: { 
        name: 'Furnace', solid: true, transparent: false, hardness: 3, 
        drops: 'furnace', color: '#A0522D', emoji: '🔥',
        interactive: true, canSmelt: true
    },
    [BLOCKS.CHEST]: { 
        name: 'Chest', solid: true, transparent: false, hardness: 2, 
        drops: 'chest', color: '#D2691E', emoji: '📦',
        interactive: true, storage: 27
    },
    [BLOCKS.FARMLAND]: { 
        name: 'Farmland', solid: true, transparent: false, hardness: 1, 
        drops: 'dirt', color: '#5D4037', emoji: '🌱',
        canPlant: true, hydratable: true
    },
    [BLOCKS.WHEAT_CROP]: { 
        name: 'Wild Grain', solid: false, transparent: true, hardness: 0, 
        drops: 'wheat', color: '#D4A017', emoji: '🌾',
        growable: true, growthStages: 7
    },
    [BLOCKS.CACTUS]: { 
        name: 'Cactus', solid: false, transparent: true, hardness: 1, 
        drops: 'cactus', color: '#2E8B57', emoji: '🌵',
        damageOnTouch: 1, maxHeight: 3
    },
    // New building blocks
    [BLOCKS.COBBLESTONE]: { 
        name: 'Cobblestone', solid: true, transparent: false, hardness: 3, 
        drops: 'cobblestone', color: '#696969', emoji: '🧱',
        toolRequired: 'pickaxe', blastResistance: 6
    },
    [BLOCKS.PLANKS]: { 
        name: 'Wood Planks', solid: true, transparent: false, hardness: 2, 
        drops: 'plank', color: '#C19A6B', emoji: '🪵',
        flammable: true, burnTime: 300
    },
    [BLOCKS.BRICK]: { 
        name: 'Brick', solid: true, transparent: false, hardness: 4, 
        drops: 'brick_block', color: '#8B4513', emoji: '🧱',
        toolRequired: 'pickaxe', blastResistance: 6
    },
    [BLOCKS.GLASS]: { 
        name: 'Glass', solid: true, transparent: true, hardness: 0.5, 
        drops: null, color: '#E0FFFF', emoji: '🪟',
        fragile: true
    },
    [BLOCKS.TORCH]: { 
        name: 'Torch', solid: false, transparent: true, hardness: 0, 
        drops: 'torch', color: '#FFA500', emoji: '🔦',
        lightLevel: 14, attachable: true
    },
    [BLOCKS.LADDER]: { 
        name: 'Ladder', solid: false, transparent: true, hardness: 0.5, 
        drops: 'ladder', color: '#8B4513', emoji: '🪜',
        climbable: true
    },
    [BLOCKS.FENCE]: { 
        name: 'Fence', solid: true, transparent: true, hardness: 2, 
        drops: 'fence', color: '#8B5A2B', emoji: '🚧',
        connectsTo: ['fence', 'fence_gate'], collision: { height: 1.5 }
    },
    [BLOCKS.DOOR]: { 
        name: 'Door', solid: true, transparent: true, hardness: 2, 
        drops: 'door', color: '#8B4513', emoji: '🚪',
        interactive: true, openable: true
    },
    [BLOCKS.MOSS_STONE]: { 
        name: 'Mossy Stone', solid: true, transparent: false, hardness: 3, 
        drops: 'moss_stone', color: '#4A7023', emoji: '🪨',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.SANDSTONE]: { 
        name: 'Sandstone', solid: true, transparent: false, hardness: 2, 
        drops: 'sandstone', color: '#D2B48C', emoji: '🟨',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.OBSIDIAN]: { 
        name: 'Obsidian', solid: true, transparent: false, hardness: 10, 
        drops: 'obsidian', color: '#1C1C1C', emoji: '⬛',
        toolRequired: 'pickaxe', toolLevel: 3, blastResistance: 1200
    },
    [BLOCKS.CLAY_BRICK]: { 
        name: 'Clay Brick', solid: true, transparent: false, hardness: 2, 
        drops: 'clay_brick', color: '#BC8F8F', emoji: '🧱',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.BONE_BLOCK]: { 
        name: 'Bone Block', solid: true, transparent: false, hardness: 2, 
        drops: 'bone_block', color: '#F5F5DC', emoji: '🦴',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.HAY_BLOCK]: { 
        name: 'Hay Block', solid: true, transparent: false, hardness: 1, 
        drops: 'hay_block', color: '#DAA520', emoji: '🌾',
        flammable: true, fallDamageReduction: 0.8
    },
    [BLOCKS.THATCH]: { 
        name: 'Thatch Roof', solid: true, transparent: false, hardness: 1, 
        drops: 'thatch', color: '#BDB76B', emoji: '🏠',
        flammable: true
    },
    [BLOCKS.MUD_BRICK]: { 
        name: 'Mud Brick', solid: true, transparent: false, hardness: 1.5, 
        drops: 'mud_brick', color: '#6B4423', emoji: '🟫',
    },
    [BLOCKS.CAMPFIRE]: { 
        name: 'Campfire', solid: false, transparent: true, hardness: 1, 
        drops: 'coal', color: '#FF4500', emoji: '🔥',
        lightLevel: 15, damageOnTouch: 1, canCook: true
    },
};

// Item Types
export const ITEMS = {
    // Blocks as items - Natural
    dirt: { name: 'Dirt', emoji: '🟫', stackable: true, type: 'block', blockId: BLOCKS.DIRT },
    cobblestone: { name: 'Cobblestone', emoji: '🪨', stackable: true, type: 'block', blockId: BLOCKS.COBBLESTONE },
    stone: { name: 'Stone', emoji: '🪨', stackable: true, type: 'block', blockId: BLOCKS.STONE },
    sand: { name: 'Sand', emoji: '🏖️', stackable: true, type: 'block', blockId: BLOCKS.SAND },
    wood: { name: 'Wood Log', emoji: '🪵', stackable: true, type: 'block', blockId: BLOCKS.WOOD },
    leaves: { name: 'Leaves', emoji: '🍃', stackable: true, type: 'block', blockId: BLOCKS.LEAVES },
    gravel: { name: 'Gravel', emoji: '⚫', stackable: true, type: 'block', blockId: BLOCKS.GRAVEL },
    clay: { name: 'Clay', emoji: '🔘', stackable: true, type: 'block', blockId: BLOCKS.CLAY },
    snow: { name: 'Snow', emoji: '❄️', stackable: true, type: 'block', blockId: BLOCKS.SNOW },
    ice: { name: 'Ice', emoji: '🧊', stackable: true, type: 'block', blockId: BLOCKS.ICE },
    
    // Blocks as items - Building
    plank: { name: 'Wood Planks', emoji: '🪵', stackable: true, type: 'block', blockId: BLOCKS.PLANKS },
    brick_block: { name: 'Brick Block', emoji: '🧱', stackable: true, type: 'block', blockId: BLOCKS.BRICK },
    glass: { name: 'Glass', emoji: '🪟', stackable: true, type: 'block', blockId: BLOCKS.GLASS },
    sandstone: { name: 'Sandstone', emoji: '🟨', stackable: true, type: 'block', blockId: BLOCKS.SANDSTONE },
    moss_stone: { name: 'Mossy Stone', emoji: '🪨', stackable: true, type: 'block', blockId: BLOCKS.MOSS_STONE },
    obsidian: { name: 'Obsidian', emoji: '⬛', stackable: true, type: 'block', blockId: BLOCKS.OBSIDIAN },
    
    // Blocks as items - Prehistoric
    thatch: { name: 'Thatch', emoji: '🏠', stackable: true, type: 'block', blockId: BLOCKS.THATCH },
    mud_brick: { name: 'Mud Brick', emoji: '🟫', stackable: true, type: 'block', blockId: BLOCKS.MUD_BRICK },
    bone_block: { name: 'Bone Block', emoji: '🦴', stackable: true, type: 'block', blockId: BLOCKS.BONE_BLOCK },
    hay_block: { name: 'Hay Block', emoji: '🌾', stackable: true, type: 'block', blockId: BLOCKS.HAY_BLOCK },
    
    // Blocks as items - Functional
    crafting_table: { name: 'Crafting Table', emoji: '🔨', stackable: true, type: 'block', blockId: BLOCKS.CRAFTING_TABLE },
    furnace: { name: 'Furnace', emoji: '🔥', stackable: true, type: 'block', blockId: BLOCKS.FURNACE },
    chest: { name: 'Chest', emoji: '📦', stackable: true, type: 'block', blockId: BLOCKS.CHEST },
    campfire: { name: 'Campfire', emoji: '🔥', stackable: true, type: 'block', blockId: BLOCKS.CAMPFIRE },
    ladder: { name: 'Ladder', emoji: '🪜', stackable: true, type: 'block', blockId: BLOCKS.LADDER },
    fence: { name: 'Fence', emoji: '🚧', stackable: true, type: 'block', blockId: BLOCKS.FENCE },
    door: { name: 'Door', emoji: '🚪', stackable: true, type: 'block', blockId: BLOCKS.DOOR },

    // Raw materials
    coal: { name: 'Coal', emoji: '⚫', stackable: true, type: 'material' },
    raw_iron: { name: 'Raw Iron', emoji: '🔶', stackable: true, type: 'material' },
    raw_gold: { name: 'Raw Gold', emoji: '🟡', stackable: true, type: 'material' },
    diamond: { name: 'Diamond', emoji: '💎', stackable: true, type: 'material' },
    stick: { name: 'Stick', emoji: '🥢', stackable: true, type: 'material' },
    iron_ingot: { name: 'Iron Ingot', emoji: '🔩', stackable: true, type: 'material' },
    gold_ingot: { name: 'Gold Ingot', emoji: '🪙', stackable: true, type: 'material' },
    flint: { name: 'Flint', emoji: '🔺', stackable: true, type: 'material' },
    leather: { name: 'Leather', emoji: '🟤', stackable: true, type: 'material' },
    bone: { name: 'Bone', emoji: '🦴', stackable: true, type: 'material' },
    string: { name: 'String', emoji: '🧵', stackable: true, type: 'material' },
    feather: { name: 'Feather', emoji: '🪶', stackable: true, type: 'material' },
    clay_ball: { name: 'Clay Ball', emoji: '🔘', stackable: true, type: 'material' },
    brick: { name: 'Brick', emoji: '🧱', stackable: true, type: 'material' },

    // Tools - Prehistoric themed
    wooden_pickaxe: { name: 'Stone Pick', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', damage: 2, miningSpeed: 1.5, durability: 60 },
    stone_pickaxe: { name: 'Flint Pick', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', damage: 3, miningSpeed: 2, durability: 132 },
    iron_pickaxe: { name: 'Bronze Pick', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', damage: 4, miningSpeed: 3, durability: 251 },
    diamond_pickaxe: { name: 'Obsidian Pick', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', damage: 5, miningSpeed: 4, durability: 1562 },

    wooden_axe: { name: 'Stone Hatchet', emoji: '🪓', stackable: false, type: 'tool', toolType: 'axe', damage: 4, miningSpeed: 1.5, durability: 60 },
    stone_axe: { name: 'Flint Hatchet', emoji: '🪓', stackable: false, type: 'tool', toolType: 'axe', damage: 5, miningSpeed: 2, durability: 132 },
    iron_axe: { name: 'Bronze Hatchet', emoji: '🪓', stackable: false, type: 'tool', toolType: 'axe', damage: 6, miningSpeed: 3, durability: 251 },

    wooden_hoe: { name: 'Digging Stick', emoji: '🥢', stackable: false, type: 'tool', toolType: 'hoe', damage: 2, durability: 60 },
    stone_hoe: { name: 'Flint Hoe', emoji: '👩‍🌾', stackable: false, type: 'tool', toolType: 'hoe', damage: 3, durability: 132 },

    wooden_sword: { name: 'Sharpened Stick', emoji: '🗡️', stackable: false, type: 'weapon', damage: 3, durability: 40 },
    stone_sword: { name: 'Stone Blade', emoji: '🗡️', stackable: false, type: 'weapon', damage: 5, durability: 100 },
    iron_sword: { name: 'Bronze Blade', emoji: '🗡️', stackable: false, type: 'weapon', damage: 8, durability: 251 },
    diamond_sword: { name: 'Obsidian Blade', emoji: '🗡️', stackable: false, type: 'weapon', damage: 10, durability: 1562 },

    club: { name: 'Wooden Club', emoji: '🏏', stackable: false, type: 'weapon', damage: 4, durability: 50 },
    bone_club: { name: 'Bone Club', emoji: '🦴', stackable: false, type: 'weapon', damage: 6, durability: 100 },
    spear: { name: 'Flint Spear', emoji: '🔱', stackable: false, type: 'weapon', damage: 7, durability: 80 },

    // Food
    raw_meat: { name: 'Raw Meat', emoji: '🥩', stackable: true, type: 'food', hunger: 3, health: 0 },
    cooked_meat: { name: 'Cooked Meat', emoji: '🍖', stackable: true, type: 'food', hunger: 8, health: 2 },
    berry: { name: 'Berry', emoji: '🫐', stackable: true, type: 'food', hunger: 2, health: 0 },
    apple: { name: 'Apple', emoji: '🍎', stackable: true, type: 'food', hunger: 4, health: 0 },
    golden_apple: { name: 'Golden Apple', emoji: '🍏', stackable: true, type: 'food', hunger: 6, health: 10, effect: 'regen', effectDuration: 10 },
    mushroom: { name: 'Mushroom', emoji: '🍄', stackable: true, type: 'food', hunger: 3, health: -2 },
    fish: { name: 'Fish', emoji: '🐟', stackable: true, type: 'food', hunger: 5, health: 1 },
    cooked_fish: { name: 'Cooked Fish', emoji: '🍣', stackable: true, type: 'food', hunger: 7, health: 2 },
    bread: { name: 'Bread', emoji: '🍞', stackable: true, type: 'food', hunger: 6, health: 0 },
    steak: { name: 'Steak', emoji: '🥩', stackable: true, type: 'food', hunger: 10, health: 3 },
    wheat: { name: 'Wheat', emoji: '🌾', stackable: true, type: 'material' },
    seeds: { name: 'Seeds', emoji: '🌰', stackable: true, type: 'placeable', blockId: BLOCKS.WHEAT_CROP },
    cactus: { name: 'Cactus', emoji: '🌵', stackable: true, type: 'placeable', blockId: BLOCKS.CACTUS },
    snowball: { name: 'Snowball', emoji: '❄️', stackable: true, type: 'throwable' },

    // Special
    torch: { name: 'Torch', emoji: '🔦', stackable: true, type: 'block', blockId: BLOCKS.TORCH, light: 14 },
    bed: { name: 'Bed', emoji: '🛏️', stackable: false, type: 'placeable' },
};

// Crafting Recipes - Prehistoric themed
export const RECIPES = [
    // Basic wood processing
    { result: 'plank', count: 4, ingredients: [['wood', 1]], shape: null },
    { result: 'stick', count: 4, ingredients: [['plank', 2]], shape: null },
    
    // Functional blocks
    { result: 'crafting_table', count: 1, ingredients: [['plank', 4]], shape: null },
    { result: 'furnace', count: 1, ingredients: [['cobblestone', 8]], shape: null },
    { result: 'chest', count: 1, ingredients: [['plank', 8]], shape: null },
    { result: 'campfire', count: 1, ingredients: [['stick', 3], ['coal', 1], ['wood', 3]], shape: null },
    
    // Light sources
    { result: 'torch', count: 4, ingredients: [['coal', 1], ['stick', 1]], shape: null },
    
    // Building blocks - Prehistoric
    { result: 'thatch', count: 4, ingredients: [['wheat', 4], ['stick', 2]], shape: null },
    { result: 'mud_brick', count: 4, ingredients: [['clay', 2], ['wheat', 1]], shape: null },
    { result: 'bone_block', count: 1, ingredients: [['bone', 9]], shape: null },
    { result: 'hay_block', count: 1, ingredients: [['wheat', 9]], shape: null },
    
    // Building blocks - Stone
    { result: 'sandstone', count: 4, ingredients: [['sand', 4]], shape: null },
    { result: 'brick_block', count: 1, ingredients: [['brick', 4]], shape: null },
    { result: 'moss_stone', count: 1, ingredients: [['cobblestone', 1], ['leaves', 1]], shape: null },
    
    // Utility blocks
    { result: 'ladder', count: 3, ingredients: [['stick', 7]], shape: null },
    { result: 'fence', count: 3, ingredients: [['plank', 4], ['stick', 2]], shape: null },
    { result: 'door', count: 3, ingredients: [['plank', 6]], shape: null },

    // Primitive weapons - easiest to craft
    { result: 'club', count: 1, ingredients: [['wood', 2]], shape: null },
    { result: 'wooden_sword', count: 1, ingredients: [['stick', 2], ['flint', 1]], shape: null },
    { result: 'spear', count: 1, ingredients: [['stick', 2], ['flint', 2]], shape: null },
    { result: 'bone_club', count: 1, ingredients: [['bone', 3], ['leather', 1]], shape: null },

    // Stone tools (using flint for prehistoric accuracy)
    { result: 'wooden_pickaxe', count: 1, ingredients: [['cobblestone', 2], ['stick', 2]], shape: null },
    { result: 'wooden_axe', count: 1, ingredients: [['cobblestone', 2], ['stick', 2]], shape: null },
    { result: 'wooden_hoe', count: 1, ingredients: [['stick', 2], ['flint', 1]], shape: null },
    
    // Better stone tools
    { result: 'stone_pickaxe', count: 1, ingredients: [['flint', 3], ['stick', 2], ['leather', 1]], shape: null },
    { result: 'stone_axe', count: 1, ingredients: [['flint', 3], ['stick', 2], ['leather', 1]], shape: null },
    { result: 'stone_sword', count: 1, ingredients: [['flint', 2], ['stick', 1], ['leather', 1]], shape: null },

    // Bronze age tools (late game)
    { result: 'iron_pickaxe', count: 1, ingredients: [['iron_ingot', 3], ['stick', 2]], shape: null },
    { result: 'iron_axe', count: 1, ingredients: [['iron_ingot', 3], ['stick', 2]], shape: null },
    { result: 'iron_sword', count: 1, ingredients: [['iron_ingot', 2], ['stick', 1]], shape: null },

    // Rare obsidian tools
    { result: 'diamond_pickaxe', count: 1, ingredients: [['diamond', 3], ['stick', 2]], shape: null },
    { result: 'diamond_sword', count: 1, ingredients: [['diamond', 2], ['stick', 1]], shape: null },

    // Survival items
    { result: 'bed', count: 1, ingredients: [['plank', 3], ['leather', 3]], shape: null },
    { result: 'leather', count: 1, ingredients: [['raw_meat', 1]], shape: null }, // Scrape hide
];

// Smelting Recipes
export const SMELTING = {
    raw_iron: 'iron_ingot',
    raw_gold: 'gold_ingot',
    raw_meat: 'cooked_meat',
    fish: 'cooked_fish',
    sand: 'glass',
    clay: 'brick',
    cobblestone: 'stone',
    wheat: 'bread',
    wood: 'coal', // Charcoal from wood
};


// Enemy Types
export const ENEMIES = {
    // Common animals
    WOLF: {
        name: 'Dire Wolf',
        emoji: '🐺',
        health: 25,
        damage: 5,
        speed: 2.8,
        aggressive: true,
        xp: 20,
        drops: [['raw_meat', 2, 3], ['leather', 1, 2], ['bone', 1, 2]],
        tameable: true,
    },
    BEAR: {
        name: 'Cave Bear',
        emoji: '🐻',
        health: 60,
        damage: 12,
        speed: 1.5,
        aggressive: true,
        xp: 50,
        drops: [['raw_meat', 3, 5], ['leather', 2, 3], ['bone', 2, 4]],
    },
    SNAKE: {
        name: 'Giant Viper',
        emoji: '🐍',
        health: 15,
        damage: 8,
        speed: 3.5,
        aggressive: true,
        xp: 15,
        drops: [['leather', 1, 2]],
    },
    BOAR: {
        name: 'Wild Boar',
        emoji: '🐗',
        health: 20,
        damage: 4,
        speed: 2.2,
        aggressive: false,
        xp: 15,
        drops: [['raw_meat', 2, 4], ['leather', 1, 2], ['bone', 0, 1]],
        tameable: true,
    },
    MAMMOTH: {
        name: 'Woolly Mammoth',
        emoji: '🦣',
        health: 100,
        damage: 15,
        speed: 1.2,
        aggressive: false,
        xp: 100,
        drops: [['raw_meat', 5, 8], ['leather', 3, 5], ['bone', 4, 6]],
    },
    SABERTOOTH: {
        name: 'Sabertooth',
        emoji: '🐅',
        health: 45,
        damage: 10,
        speed: 3,
        aggressive: true,
        xp: 60,
        drops: [['raw_meat', 2, 4], ['leather', 2, 3], ['bone', 2, 3]],
        nightOnly: true,
    },
    // New enemies
    TERROR_BIRD: {
        name: 'Terror Bird',
        emoji: '🦅',
        health: 35,
        damage: 8,
        speed: 4,
        aggressive: true,
        xp: 40,
        drops: [['raw_meat', 2, 3], ['feather', 3, 5], ['bone', 1, 2]],
    },
    GIANT_SLOTH: {
        name: 'Giant Sloth',
        emoji: '🦥',
        health: 80,
        damage: 6,
        speed: 0.8,
        aggressive: false,
        xp: 45,
        drops: [['raw_meat', 4, 6], ['leather', 3, 4]],
    },
    CAVE_LION: {
        name: 'Cave Lion',
        emoji: '🦁',
        health: 55,
        damage: 12,
        speed: 3.2,
        aggressive: true,
        xp: 70,
        drops: [['raw_meat', 3, 5], ['leather', 2, 4], ['bone', 2, 3]],
        nightOnly: true,
    },
    HYENA: {
        name: 'Giant Hyena',
        emoji: '🐕',
        health: 30,
        damage: 6,
        speed: 3,
        aggressive: true,
        xp: 25,
        drops: [['raw_meat', 2, 3], ['leather', 1, 2], ['bone', 1, 2]],
        packAnimal: true, // Spawns in groups
    },
    RHINO: {
        name: 'Woolly Rhino',
        emoji: '🦏',
        health: 90,
        damage: 18,
        speed: 2,
        aggressive: false,
        xp: 80,
        drops: [['raw_meat', 5, 7], ['leather', 3, 5], ['bone', 3, 5]],
    },
    CROCODILE: {
        name: 'Giant Crocodile',
        emoji: '🐊',
        health: 50,
        damage: 14,
        speed: 2.5,
        aggressive: true,
        xp: 55,
        drops: [['raw_meat', 3, 5], ['leather', 3, 4]],
        waterOnly: true,
    },
    SPIDER: {
        name: 'Giant Spider',
        emoji: '🕷️',
        health: 20,
        damage: 6,
        speed: 2.8,
        aggressive: true,
        xp: 25,
        drops: [['string', 2, 4], ['leather', 1, 2]],
        caveOnly: true,
    },
};

// Boss creatures
export const BOSSES = {
    ALPHA_MAMMOTH: {
        name: 'Alpha Mammoth',
        emoji: '🦣',
        health: 500,
        damage: 30,
        speed: 1.5,
        aggressive: true,
        xp: 500,
        drops: [['raw_meat', 15, 20], ['leather', 10, 15], ['bone', 10, 15], ['diamond', 1, 3]],
        abilities: ['charge', 'stomp'],
        spawnCondition: 'day_10',
    },
    PACK_LEADER: {
        name: 'Pack Leader Wolf',
        emoji: '🐺',
        health: 200,
        damage: 15,
        speed: 3.5,
        aggressive: true,
        xp: 300,
        drops: [['raw_meat', 8, 12], ['leather', 5, 8], ['bone', 5, 8]],
        abilities: ['summon_pack', 'howl'],
        spawnCondition: 'night',
    },
    CAVE_GUARDIAN: {
        name: 'Cave Guardian Bear',
        emoji: '🐻',
        health: 400,
        damage: 25,
        speed: 2,
        aggressive: true,
        xp: 400,
        drops: [['raw_meat', 12, 18], ['leather', 8, 12], ['bone', 8, 12], ['gold_ingot', 2, 5]],
        abilities: ['roar', 'swipe'],
        spawnCondition: 'cave_depth_10',
    },
};

// Biome definitions
export const BIOMES = {
    PLAINS: {
        name: 'Plains',
        groundBlock: 'GRASS',
        subBlock: 'DIRT',
        treeChance: 0.005,
        grassChance: 0.02,
        enemies: ['WOLF', 'BOAR', 'HYENA'],
        temperature: 0.5,
        humidity: 0.5,
    },
    DESERT: {
        name: 'Desert',
        groundBlock: 'SAND',
        subBlock: 'SANDSTONE',
        treeChance: 0,
        cactusChance: 0.005,
        enemies: ['SNAKE', 'HYENA'],
        temperature: 0.9,
        humidity: 0.1,
    },
    SNOW: {
        name: 'Frozen Tundra',
        groundBlock: 'SNOW',
        subBlock: 'DIRT',
        treeChance: 0.003,
        enemies: ['WOLF', 'MAMMOTH', 'RHINO'],
        temperature: 0.1,
        humidity: 0.3,
    },
    JUNGLE: {
        name: 'Dense Jungle',
        groundBlock: 'GRASS',
        subBlock: 'DIRT',
        treeChance: 0.03,
        vineChance: 0.01,
        enemies: ['SNAKE', 'TERROR_BIRD', 'SPIDER'],
        temperature: 0.8,
        humidity: 0.9,
    },
    SWAMP: {
        name: 'Murky Swamp',
        groundBlock: 'GRASS',
        subBlock: 'CLAY',
        waterChance: 0.3,
        treeChance: 0.01,
        enemies: ['CROCODILE', 'SNAKE', 'GIANT_SLOTH'],
        temperature: 0.6,
        humidity: 0.9,
    },
    CAVE: {
        name: 'Deep Caves',
        groundBlock: 'STONE',
        subBlock: 'STONE',
        oreChance: 0.05,
        enemies: ['SPIDER', 'BEAR'],
        temperature: 0.4,
        humidity: 0.6,
        underground: true,
    },
    SAVANNA: {
        name: 'Savanna',
        groundBlock: 'GRASS',
        subBlock: 'DIRT',
        treeChance: 0.002,
        grassChance: 0.05,
        enemies: ['CAVE_LION', 'HYENA', 'RHINO'],
        temperature: 0.7,
        humidity: 0.3,
    },
};

// Quest System
export const QUESTS = {
    // Tutorial/Early Quests
    FIRST_TOOLS: {
        id: 'first_tools',
        name: 'First Steps',
        description: 'Craft your first stone tools',
        type: 'craft',
        requirements: [
            { item: 'stone_pickaxe', count: 1 },
            { item: 'stone_axe', count: 1 }
        ],
        rewards: { xp: 50, items: [['leather', 3]] },
        unlocks: ['BUILD_SHELTER'],
    },
    BUILD_SHELTER: {
        id: 'build_shelter',
        name: 'Shelter from the Storm',
        description: 'Build a basic shelter to survive the nights',
        type: 'place',
        requirements: [
            { block: 'COBBLESTONE', count: 20 },
            { block: 'WOOD', count: 10 }
        ],
        rewards: { xp: 100, items: [['torch', 5]] },
        unlocks: ['HUNT_PREY'],
    },
    HUNT_PREY: {
        id: 'hunt_prey',
        name: 'The Hunt Begins',
        description: 'Hunt wildlife for food and resources',
        type: 'kill',
        requirements: [
            { enemy: 'BOAR', count: 3 }
        ],
        rewards: { xp: 75, items: [['cooked_meat', 5]] },
        unlocks: ['WOLF_SLAYER'],
    },
    WOLF_SLAYER: {
        id: 'wolf_slayer',
        name: 'Wolf Slayer',
        description: 'Defend yourself against the dire wolves',
        type: 'kill',
        requirements: [
            { enemy: 'WOLF', count: 5 }
        ],
        rewards: { xp: 150, items: [['bone', 10], ['leather', 5]] },
        unlocks: ['TAME_COMPANION'],
    },
    TAME_COMPANION: {
        id: 'tame_companion',
        name: 'Best Friend',
        description: 'Tame a wolf or boar as your companion',
        type: 'tame',
        requirements: [
            { tamed: 1 }
        ],
        rewards: { xp: 200, items: [['raw_meat', 10]] },
        unlocks: ['DEEP_MINING'],
    },
    DEEP_MINING: {
        id: 'deep_mining',
        name: 'Into the Depths',
        description: 'Mine valuable ores from deep underground',
        type: 'collect',
        requirements: [
            { item: 'iron_ingot', count: 10 },
            { item: 'gold_ingot', count: 5 }
        ],
        rewards: { xp: 250, items: [['diamond', 2]] },
        unlocks: ['BEAR_HUNTER'],
    },
    BEAR_HUNTER: {
        id: 'bear_hunter',
        name: 'Bear Hunter',
        description: 'Defeat a fearsome cave bear',
        type: 'kill',
        requirements: [
            { enemy: 'BEAR', count: 1 }
        ],
        rewards: { xp: 200, items: [['leather', 10], ['bone', 8]] },
        unlocks: ['MAMMOTH_SLAYER'],
    },
    MAMMOTH_SLAYER: {
        id: 'mammoth_slayer',
        name: 'Mammoth Slayer',
        description: 'Take down a mighty woolly mammoth',
        type: 'kill',
        requirements: [
            { enemy: 'MAMMOTH', count: 1 }
        ],
        rewards: { xp: 500, items: [['raw_meat', 20], ['bone', 15]] },
        unlocks: ['BOSS_ALPHA'],
    },
    BOSS_ALPHA: {
        id: 'boss_alpha',
        name: 'Alpha Challenge',
        description: 'Defeat the Alpha Mammoth boss',
        type: 'kill',
        requirements: [
            { enemy: 'ALPHA_MAMMOTH', count: 1 }
        ],
        rewards: { xp: 1000, items: [['diamond', 5]] },
        unlocks: [],
    },
    SURVIVAL_10: {
        id: 'survival_10',
        name: 'Seasoned Survivor',
        description: 'Survive for 10 days in the wilderness',
        type: 'survive',
        requirements: [
            { days: 10 }
        ],
        rewards: { xp: 300, items: [['torch', 10], ['cooked_meat', 10]] },
        unlocks: [],
    },
    MASTER_CRAFTER: {
        id: 'master_crafter',
        name: 'Master Crafter',
        description: 'Craft 50 different items',
        type: 'craft_total',
        requirements: [
            { crafted: 50 }
        ],
        rewards: { xp: 400, items: [['iron_ingot', 10]] },
        unlocks: [],
    },
};

// Age Progression System
export const AGES = {
    STONE_AGE: {
        name: 'Stone Age',
        description: 'The beginning of human civilization',
        unlockRequirements: null, // Starting age
        unlocksRecipes: ['stone_pickaxe', 'stone_axe', 'stone_sword', 'campfire', 'torch'],
        bonuses: {},
    },
    TRIBAL_AGE: {
        name: 'Tribal Age',
        description: 'Form tribes and develop culture',
        unlockRequirements: {
            quests: ['HUNT_PREY', 'BUILD_SHELTER'],
            level: 5,
        },
        unlocksRecipes: ['leather_armor', 'bone_tools', 'tanning_rack'],
        bonuses: {
            tamingBonus: 0.1,
            craftingSpeed: 0.1,
        },
    },
    BRONZE_AGE: {
        name: 'Bronze Age',
        description: 'Discover metallurgy and forge stronger tools',
        unlockRequirements: {
            quests: ['DEEP_MINING'],
            level: 10,
            items: { 'copper_ingot': 20, 'tin_ingot': 10 },
        },
        unlocksRecipes: ['bronze_pickaxe', 'bronze_axe', 'bronze_sword', 'bronze_armor', 'forge'],
        bonuses: {
            miningSpeed: 0.2,
            combatDamage: 0.15,
        },
    },
    IRON_AGE: {
        name: 'Iron Age',
        description: 'Master iron working and build settlements',
        unlockRequirements: {
            quests: ['BOSS_ALPHA'],
            level: 20,
            items: { 'iron_ingot': 50 },
        },
        unlocksRecipes: ['iron_pickaxe', 'iron_axe', 'iron_sword', 'iron_armor', 'anvil'],
        bonuses: {
            miningSpeed: 0.3,
            combatDamage: 0.25,
            maxHealth: 20,
        },
    },
};
