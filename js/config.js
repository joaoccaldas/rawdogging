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

// Block Types
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
};

// Block Properties
export const BLOCK_DATA = {
    [BLOCKS.AIR]: { name: 'Air', solid: false, transparent: true, hardness: 0, drops: null, color: 'transparent', emoji: '' },
    [BLOCKS.STONE]: { name: 'Stone', solid: true, transparent: false, hardness: 3, drops: 'cobblestone', color: '#888888', emoji: '🪨' },
    [BLOCKS.DIRT]: { name: 'Dirt', solid: true, transparent: false, hardness: 1, drops: 'dirt', color: '#8B4513', emoji: '🟫' },
    [BLOCKS.GRASS]: { name: 'Grass', solid: true, transparent: false, hardness: 1, drops: 'dirt', color: '#228B22', emoji: '🌿' },
    [BLOCKS.SAND]: { name: 'Sand', solid: true, transparent: false, hardness: 1, drops: 'sand', color: '#F4D03F', emoji: '🏖️' },
    [BLOCKS.WATER]: { name: 'Water', solid: false, transparent: true, hardness: 0, drops: null, color: '#4169E1', emoji: '💧' },
    [BLOCKS.WOOD]: { name: 'Wood', solid: true, transparent: false, hardness: 2, drops: 'wood', color: '#8B5A2B', emoji: '🪵' },
    [BLOCKS.LEAVES]: { name: 'Leaves', solid: false, transparent: true, hardness: 0.5, drops: 'leaves', color: '#32CD32', emoji: '🍃' },
    [BLOCKS.COAL_ORE]: { name: 'Coal Ore', solid: true, transparent: false, hardness: 4, drops: 'coal', color: '#333333', emoji: '�ite' },
    [BLOCKS.IRON_ORE]: { name: 'Iron Ore', solid: true, transparent: false, hardness: 5, drops: 'raw_iron', color: '#CD853F', emoji: '🔶' },
    [BLOCKS.GOLD_ORE]: { name: 'Gold Ore', solid: true, transparent: false, hardness: 5, drops: 'raw_gold', color: '#FFD700', emoji: '🟡' },
    [BLOCKS.DIAMOND_ORE]: { name: 'Diamond Ore', solid: true, transparent: false, hardness: 6, drops: 'diamond', color: '#00FFFF', emoji: '💎' },
    [BLOCKS.BEDROCK]: { name: 'Bedrock', solid: true, transparent: false, hardness: -1, drops: null, color: '#1a1a1a', emoji: '⬛' },
    [BLOCKS.GRAVEL]: { name: 'Gravel', solid: true, transparent: false, hardness: 1, drops: 'gravel', color: '#696969', emoji: '⚫' },
    [BLOCKS.CLAY]: { name: 'Clay', solid: true, transparent: false, hardness: 1, drops: 'clay', color: '#A9A9A9', emoji: '🔘' },
    [BLOCKS.SNOW]: { name: 'Snow', solid: true, transparent: false, hardness: 0.5, drops: 'snowball', color: '#FFFAFA', emoji: '❄️' },
    [BLOCKS.ICE]: { name: 'Ice', solid: true, transparent: true, hardness: 1, drops: null, color: '#ADD8E6', emoji: '🧊' },
    [BLOCKS.CRAFTING_TABLE]: { name: 'Crafting Table', solid: true, transparent: false, hardness: 2, drops: 'crafting_table', color: '#DEB887', emoji: '🔨' },
    [BLOCKS.FURNACE]: { name: 'Furnace', solid: true, transparent: false, hardness: 3, drops: 'furnace', color: '#A0522D', emoji: '🔥' },
    [BLOCKS.CHEST]: { name: 'Chest', solid: true, transparent: false, hardness: 2, drops: 'chest', color: '#D2691E', emoji: '📦' },
    [BLOCKS.FARMLAND]: { name: 'Farmland', solid: true, transparent: false, hardness: 1, drops: 'dirt', color: '#5D4037', emoji: '🌱' },
    [BLOCKS.WHEAT_CROP]: { name: 'Wild Grain', solid: false, transparent: true, hardness: 0, drops: 'wheat', color: '#D4A017', emoji: '🌾' },
    [BLOCKS.CACTUS]: { name: 'Cactus', solid: false, transparent: true, hardness: 1, drops: 'cactus', color: '#2E8B57', emoji: '🌵' },
};

// Item Types
export const ITEMS = {
    // Blocks as items
    dirt: { name: 'Dirt', emoji: '🟫', stackable: true, type: 'block', blockId: BLOCKS.DIRT },
    cobblestone: { name: 'Cobblestone', emoji: '🪨', stackable: true, type: 'block', blockId: BLOCKS.STONE },
    sand: { name: 'Sand', emoji: '🏖️', stackable: true, type: 'block', blockId: BLOCKS.SAND },
    wood: { name: 'Wood', emoji: '🪵', stackable: true, type: 'block', blockId: BLOCKS.WOOD },
    leaves: { name: 'Leaves', emoji: '🍃', stackable: true, type: 'block', blockId: BLOCKS.LEAVES },
    gravel: { name: 'Gravel', emoji: '⚫', stackable: true, type: 'block', blockId: BLOCKS.GRAVEL },
    clay: { name: 'Clay', emoji: '🔘', stackable: true, type: 'block', blockId: BLOCKS.CLAY },
    crafting_table: { name: 'Crafting Table', emoji: '🔨', stackable: true, type: 'block', blockId: BLOCKS.CRAFTING_TABLE },
    furnace: { name: 'Furnace', emoji: '🔥', stackable: true, type: 'block', blockId: BLOCKS.FURNACE },
    chest: { name: 'Chest', emoji: '📦', stackable: true, type: 'block', blockId: BLOCKS.CHEST },

    // Raw materials
    coal: { name: 'Coal', emoji: '⚫', stackable: true, type: 'material' },
    raw_iron: { name: 'Raw Iron', emoji: '🔶', stackable: true, type: 'material' },
    raw_gold: { name: 'Raw Gold', emoji: '🟡', stackable: true, type: 'material' },
    diamond: { name: 'Diamond', emoji: '💎', stackable: true, type: 'material' },
    stick: { name: 'Stick', emoji: '🥢', stackable: true, type: 'material' },
    plank: { name: 'Wooden Plank', emoji: '🪵', stackable: true, type: 'material' },
    iron_ingot: { name: 'Iron Ingot', emoji: '🔩', stackable: true, type: 'material' },
    gold_ingot: { name: 'Gold Ingot', emoji: '🪙', stackable: true, type: 'material' },
    flint: { name: 'Flint', emoji: '🔺', stackable: true, type: 'material' },
    leather: { name: 'Leather', emoji: '🟤', stackable: true, type: 'material' },
    bone: { name: 'Bone', emoji: '🦴', stackable: true, type: 'material' },
    string: { name: 'String', emoji: '🧵', stackable: true, type: 'material' },
    feather: { name: 'Feather', emoji: '🪶', stackable: true, type: 'material' },

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
    bread: { name: 'Bread', emoji: '🍞', stackable: true, type: 'food', hunger: 6, health: 1 },
    seeds: { name: 'Seeds', emoji: '🌰', stackable: true, type: 'placeable', blockId: BLOCKS.WHEAT_CROP },
    cactus: { name: 'Cactus', emoji: '🌵', stackable: true, type: 'placeable', blockId: BLOCKS.CACTUS },

    // Special
    torch: { name: 'Torch', emoji: '🔦', stackable: true, type: 'placeable', light: 10 },
    bed: { name: 'Bed', emoji: '🛏️', stackable: false, type: 'placeable' },
};

// Crafting Recipes - Prehistoric themed
export const RECIPES = [
    // Basic
    { result: 'plank', count: 4, ingredients: [['wood', 1]], shape: null },
    { result: 'stick', count: 4, ingredients: [['plank', 2]], shape: null },
    { result: 'crafting_table', count: 1, ingredients: [['plank', 4]], shape: null },
    { result: 'furnace', count: 1, ingredients: [['cobblestone', 8]], shape: null },
    { result: 'chest', count: 1, ingredients: [['plank', 8]], shape: null },
    { result: 'torch', count: 4, ingredients: [['coal', 1], ['stick', 1]], shape: null },

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
};


// Enemy Types
export const ENEMIES = {
    WOLF: {
        name: 'Dire Wolf',
        emoji: '🐺',
        health: 25,
        damage: 5,
        speed: 2.8,
        aggressive: true,
        xp: 20,
        drops: [['raw_meat', 2, 3], ['leather', 1, 2], ['bone', 1, 2]],
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
};
