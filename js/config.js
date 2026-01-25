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
    // Stone Age Building Extensions
    THATCH_STAIRS_N: 400, THATCH_STAIRS_S: 401, THATCH_STAIRS_E: 402, THATCH_STAIRS_W: 403,
    THATCH_SLAB: 404,
    MUD_BRICK_STAIRS_N: 410, MUD_BRICK_STAIRS_S: 411, MUD_BRICK_STAIRS_E: 412, MUD_BRICK_STAIRS_W: 413,
    MUD_BRICK_SLAB: 414,
    COBBLE_STAIRS_N: 420, COBBLE_STAIRS_S: 421, COBBLE_STAIRS_E: 422, COBBLE_STAIRS_W: 423,
    COBBLE_SLAB: 424,
    WALL_COBBLE: 425,
    // New blocks for progression
    STONE_BRICKS: 40,
    VINES: 41,
    BED: 42,
    COPPER_ORE: 43,
    TIN_ORE: 44,
    FORGE: 45,
    ANVIL: 46,
    TANNING_RACK: 47,
    // Medieval Age blocks
    WOOD_BEAM: 48,
    COBBLESTONE_WALL: 49,
    IRON_BARS: 50,
    GATE: 51,
    PORTCULLIS: 52,
    IRRIGATION: 53,
    BARLEY_CROP: 54,
    FLAX_CROP: 55,
    LOOM: 56,
    STABLE: 57,
    MARKET_STALL: 58,
    WELL: 59,
    // Industrial Age blocks
    STEEL_BLOCK: 60,
    STEAM_ENGINE: 61,
    BOILER: 62,
    CONVEYOR_BELT: 63,
    ASSEMBLER: 64,
    CRUSHER: 65,
    METAL_PIPE: 66,
    GEAR_BLOCK: 67,
    CHIMNEY: 68,
    RAIL: 69,
    OIL_DEPOSIT: 70,
    ASPHALT: 71,
    // Modern Age blocks
    CONCRETE: 72,
    GLASS_PANEL: 73,
    STEEL_FRAME: 74,
    SOLAR_PANEL: 75,
    WIND_TURBINE: 76,
    BATTERY: 77,
    COMPUTER: 78,
    WIRE: 79,
    CIRCUIT_BOARD: 80,
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
    // THATCH VARIANTS
    [BLOCKS.THATCH_STAIRS_N]: { name: 'Thatch Stairs', solid: true, transparent: true, hardness: 1, drops: 'thatch_stairs', color: '#BDB76B', shape: 'stairs', dir: 'N' },
    [BLOCKS.THATCH_STAIRS_S]: { name: 'Thatch Stairs', solid: true, transparent: true, hardness: 1, drops: 'thatch_stairs', color: '#BDB76B', shape: 'stairs', dir: 'S' },
    [BLOCKS.THATCH_STAIRS_E]: { name: 'Thatch Stairs', solid: true, transparent: true, hardness: 1, drops: 'thatch_stairs', color: '#BDB76B', shape: 'stairs', dir: 'E' },
    [BLOCKS.THATCH_STAIRS_W]: { name: 'Thatch Stairs', solid: true, transparent: true, hardness: 1, drops: 'thatch_stairs', color: '#BDB76B', shape: 'stairs', dir: 'W' },
    [BLOCKS.THATCH_SLAB]: { name: 'Thatch Slab', solid: true, transparent: true, hardness: 1, drops: 'thatch_slab', color: '#BDB76B', shape: 'slab' },

    // MUD BRICK VARIANTS
    [BLOCKS.MUD_BRICK_STAIRS_N]: { name: 'Mud Brick Stairs', solid: true, transparent: true, hardness: 1.5, drops: 'mud_brick_stairs', color: '#6B4423', shape: 'stairs', dir: 'N' },
    [BLOCKS.MUD_BRICK_STAIRS_S]: { name: 'Mud Brick Stairs', solid: true, transparent: true, hardness: 1.5, drops: 'mud_brick_stairs', color: '#6B4423', shape: 'stairs', dir: 'S' },
    [BLOCKS.MUD_BRICK_STAIRS_E]: { name: 'Mud Brick Stairs', solid: true, transparent: true, hardness: 1.5, drops: 'mud_brick_stairs', color: '#6B4423', shape: 'stairs', dir: 'E' },
    [BLOCKS.MUD_BRICK_STAIRS_W]: { name: 'Mud Brick Stairs', solid: true, transparent: true, hardness: 1.5, drops: 'mud_brick_stairs', color: '#6B4423', shape: 'stairs', dir: 'W' },
    [BLOCKS.MUD_BRICK_SLAB]: { name: 'Mud Brick Slab', solid: true, transparent: true, hardness: 1.5, drops: 'mud_brick_slab', color: '#6B4423', shape: 'slab' },

    // COBBLE VARIANTS
    [BLOCKS.COBBLE_STAIRS_N]: { name: 'Cobble Stairs', solid: true, transparent: true, hardness: 3, drops: 'cobble_stairs', color: '#696969', shape: 'stairs', dir: 'N' },
    [BLOCKS.COBBLE_STAIRS_S]: { name: 'Cobble Stairs', solid: true, transparent: true, hardness: 3, drops: 'cobble_stairs', color: '#696969', shape: 'stairs', dir: 'S' },
    [BLOCKS.COBBLE_STAIRS_E]: { name: 'Cobble Stairs', solid: true, transparent: true, hardness: 3, drops: 'cobble_stairs', color: '#696969', shape: 'stairs', dir: 'E' },
    [BLOCKS.COBBLE_STAIRS_W]: { name: 'Cobble Stairs', solid: true, transparent: true, hardness: 3, drops: 'cobble_stairs', color: '#696969', shape: 'stairs', dir: 'W' },
    [BLOCKS.COBBLE_SLAB]: { name: 'Cobble Slab', solid: true, transparent: true, hardness: 3, drops: 'cobble_slab', color: '#696969', shape: 'slab' },
    [BLOCKS.WALL_COBBLE]: { name: 'Cobble Wall', solid: true, transparent: true, hardness: 3, drops: 'wall_cobble', color: '#696969', shape: 'wall' },
    [BLOCKS.CAMPFIRE]: {
        name: 'Campfire', solid: false, transparent: true, hardness: 1,
        drops: 'coal', color: '#FF4500', emoji: '🔥',
        lightLevel: 15, damageOnTouch: 1, canCook: true
    },
    [BLOCKS.STONE_BRICKS]: {
        name: 'Stone Bricks', solid: true, transparent: false, hardness: 3,
        drops: 'stone_bricks', color: '#808080', emoji: '🧱',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.VINES]: {
        name: 'Vines', solid: false, transparent: true, hardness: 0.5,
        drops: 'vines', color: '#228B22', emoji: '🌿',
        climbable: true
    },
    [BLOCKS.BED]: {
        name: 'Bed', solid: true, transparent: false, hardness: 1,
        drops: 'bed', color: '#8B0000', emoji: '🛏️',
        setSpawn: true
    },
    [BLOCKS.COPPER_ORE]: {
        name: 'Copper Ore', solid: true, transparent: false, hardness: 4,
        drops: 'raw_copper', color: '#B87333', emoji: '🟠',
        toolRequired: 'pickaxe', toolLevel: 1, xpDrop: 2
    },
    [BLOCKS.TIN_ORE]: {
        name: 'Tin Ore', solid: true, transparent: false, hardness: 4,
        drops: 'raw_tin', color: '#D3D3D3', emoji: '⚪',
        toolRequired: 'pickaxe', toolLevel: 1, xpDrop: 2
    },
    [BLOCKS.FORGE]: {
        name: 'Forge', solid: true, transparent: false, hardness: 5,
        drops: 'forge', color: '#8B4513', emoji: '🔥',
        toolRequired: 'pickaxe', craftingStation: true
    },
    [BLOCKS.ANVIL]: {
        name: 'Anvil', solid: true, transparent: false, hardness: 6,
        drops: 'anvil', color: '#4A4A4A', emoji: '🔨',
        toolRequired: 'pickaxe', craftingStation: true
    },
    [BLOCKS.TANNING_RACK]: {
        name: 'Tanning Rack', solid: true, transparent: true, hardness: 2,
        drops: 'tanning_rack', color: '#8B4513', emoji: '🦌',
        craftingStation: true
    },

    // Medieval Age Blocks
    [BLOCKS.WOOD_BEAM]: {
        name: 'Wood Beam', solid: true, transparent: false, hardness: 3,
        drops: 'wood_beam', color: '#8B4513', emoji: '🪵',
        toolRequired: 'axe'
    },
    [BLOCKS.COBBLESTONE_WALL]: {
        name: 'Cobblestone Wall', solid: true, transparent: false, hardness: 4,
        drops: 'cobblestone_wall', color: '#696969', emoji: '🧱',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.IRON_BARS]: {
        name: 'Iron Bars', solid: true, transparent: true, hardness: 5,
        drops: 'iron_bars', color: '#808080', emoji: '⬜',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.GATE]: {
        name: 'Gate', solid: true, transparent: true, hardness: 3,
        drops: 'gate', color: '#8B4513', emoji: '🚪',
        toolRequired: 'axe', interactable: true
    },
    [BLOCKS.PORTCULLIS]: {
        name: 'Portcullis', solid: true, transparent: true, hardness: 6,
        drops: 'portcullis', color: '#4A4A4A', emoji: '🚧',
        toolRequired: 'pickaxe', interactable: true
    },
    [BLOCKS.IRRIGATION]: {
        name: 'Irrigation Channel', solid: false, transparent: true, hardness: 1,
        drops: 'irrigation', color: '#4169E1', emoji: '💧',
        waterSource: true
    },
    [BLOCKS.BARLEY_CROP]: {
        name: 'Barley', solid: false, transparent: true, hardness: 0.5,
        drops: 'barley', color: '#DAA520', emoji: '🌾',
        growthStages: 4, cropType: true
    },
    [BLOCKS.FLAX_CROP]: {
        name: 'Flax', solid: false, transparent: true, hardness: 0.5,
        drops: 'flax', color: '#6495ED', emoji: '🌿',
        growthStages: 4, cropType: true
    },
    [BLOCKS.LOOM]: {
        name: 'Loom', solid: true, transparent: false, hardness: 2,
        drops: 'loom', color: '#DEB887', emoji: '🧵',
        craftingStation: true
    },
    [BLOCKS.STABLE]: {
        name: 'Stable', solid: true, transparent: false, hardness: 3,
        drops: 'stable', color: '#8B4513', emoji: '🏠',
        animalHousing: true
    },
    [BLOCKS.MARKET_STALL]: {
        name: 'Market Stall', solid: true, transparent: false, hardness: 2,
        drops: 'market_stall', color: '#F4A460', emoji: '🏪',
        tradingStation: true
    },
    [BLOCKS.WELL]: {
        name: 'Well', solid: true, transparent: false, hardness: 4,
        drops: 'well', color: '#696969', emoji: '🪣',
        waterSource: true, infiniteWater: true
    },

    // Industrial Age Blocks
    [BLOCKS.STEEL_BLOCK]: {
        name: 'Steel Block', solid: true, transparent: false, hardness: 8,
        drops: 'steel_block', color: '#708090', emoji: '⬜',
        toolRequired: 'pickaxe', toolLevel: 3
    },
    [BLOCKS.STEAM_ENGINE]: {
        name: 'Steam Engine', solid: true, transparent: false, hardness: 6,
        drops: 'steam_engine', color: '#4A4A4A', emoji: '⚙️',
        toolRequired: 'pickaxe', powerSource: true, powerOutput: 50
    },
    [BLOCKS.BOILER]: {
        name: 'Boiler', solid: true, transparent: false, hardness: 6,
        drops: 'boiler', color: '#B22222', emoji: '🔥',
        toolRequired: 'pickaxe', fuelConsumer: true
    },
    [BLOCKS.CONVEYOR_BELT]: {
        name: 'Conveyor Belt', solid: false, transparent: true, hardness: 3,
        drops: 'conveyor_belt', color: '#2F4F4F', emoji: '➡️',
        moveItems: true, powerConsumer: true
    },
    [BLOCKS.ASSEMBLER]: {
        name: 'Assembler', solid: true, transparent: false, hardness: 5,
        drops: 'assembler', color: '#4682B4', emoji: '🏭',
        toolRequired: 'pickaxe', craftingStation: true, autoCraft: true
    },
    [BLOCKS.CRUSHER]: {
        name: 'Crusher', solid: true, transparent: false, hardness: 6,
        drops: 'crusher', color: '#696969', emoji: '⚒️',
        toolRequired: 'pickaxe', processingStation: true
    },
    [BLOCKS.METAL_PIPE]: {
        name: 'Metal Pipe', solid: true, transparent: true, hardness: 4,
        drops: 'metal_pipe', color: '#808080', emoji: '🔧',
        toolRequired: 'pickaxe', fluidTransport: true
    },
    [BLOCKS.GEAR_BLOCK]: {
        name: 'Gear Block', solid: true, transparent: false, hardness: 5,
        drops: 'gear_block', color: '#B8860B', emoji: '⚙️',
        toolRequired: 'pickaxe', powerTransfer: true
    },
    [BLOCKS.CHIMNEY]: {
        name: 'Chimney', solid: true, transparent: false, hardness: 4,
        drops: 'chimney', color: '#8B0000', emoji: '🏭',
        toolRequired: 'pickaxe', pollutionOutput: true
    },
    [BLOCKS.RAIL]: {
        name: 'Rail', solid: false, transparent: true, hardness: 3,
        drops: 'rail', color: '#4A4A4A', emoji: '🛤️',
        toolRequired: 'pickaxe', vehicleTrack: true
    },
    [BLOCKS.OIL_DEPOSIT]: {
        name: 'Oil Deposit', solid: true, transparent: false, hardness: 2,
        drops: 'crude_oil', color: '#1C1C1C', emoji: '🛢️',
        toolRequired: 'pickaxe', liquidSource: true
    },
    [BLOCKS.ASPHALT]: {
        name: 'Asphalt', solid: true, transparent: false, hardness: 4,
        drops: 'asphalt', color: '#2F2F2F', emoji: '⬛',
        toolRequired: 'pickaxe', speedBoost: 1.3
    },

    // Modern Age Blocks
    [BLOCKS.CONCRETE]: {
        name: 'Concrete', solid: true, transparent: false, hardness: 6,
        drops: 'concrete', color: '#A9A9A9', emoji: '🧱',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.GLASS_PANEL]: {
        name: 'Glass Panel', solid: true, transparent: true, hardness: 2,
        drops: 'glass_panel', color: '#87CEEB', emoji: '🪟',
        toolRequired: 'pickaxe'
    },
    [BLOCKS.STEEL_FRAME]: {
        name: 'Steel Frame', solid: true, transparent: true, hardness: 7,
        drops: 'steel_frame', color: '#708090', emoji: '🏗️',
        toolRequired: 'pickaxe', toolLevel: 3
    },
    [BLOCKS.SOLAR_PANEL]: {
        name: 'Solar Panel', solid: true, transparent: false, hardness: 3,
        drops: 'solar_panel', color: '#4169E1', emoji: '☀️',
        powerSource: true, powerOutput: 30, requiresDaylight: true
    },
    [BLOCKS.WIND_TURBINE]: {
        name: 'Wind Turbine', solid: true, transparent: true, hardness: 4,
        drops: 'wind_turbine', color: '#F5F5F5', emoji: '🌬️',
        powerSource: true, powerOutput: 40, heightBonus: true
    },
    [BLOCKS.BATTERY]: {
        name: 'Battery', solid: true, transparent: false, hardness: 4,
        drops: 'battery', color: '#32CD32', emoji: '🔋',
        powerStorage: true, capacity: 1000
    },
    [BLOCKS.COMPUTER]: {
        name: 'Computer', solid: true, transparent: false, hardness: 3,
        drops: 'computer', color: '#1C1C1C', emoji: '💻',
        craftingStation: true, programmable: true
    },
    [BLOCKS.WIRE]: {
        name: 'Wire', solid: false, transparent: true, hardness: 1,
        drops: 'wire', color: '#FFD700', emoji: '〰️',
        powerTransfer: true, maxPower: 100
    },
    [BLOCKS.CIRCUIT_BOARD]: {
        name: 'Circuit Board', solid: true, transparent: false, hardness: 2,
        drops: 'circuit_board', color: '#228B22', emoji: '🔌',
        logicComponent: true
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

    // Building Variants Items
    thatch_stairs: { name: 'Thatch Stairs', emoji: '🪜', stackable: true, type: 'block', blockId: BLOCKS.THATCH_STAIRS_N, placeFunc: 'stairs', baseId: 'THATCH_STAIRS_' },
    thatch_slab: { name: 'Thatch Slab', emoji: '🟫', stackable: true, type: 'block', blockId: BLOCKS.THATCH_SLAB },
    mud_brick_stairs: { name: 'Mud Brick Stairs', emoji: '🪜', stackable: true, type: 'block', blockId: BLOCKS.MUD_BRICK_STAIRS_N, placeFunc: 'stairs', baseId: 'MUD_BRICK_STAIRS_' },
    mud_brick_slab: { name: 'Mud Brick Slab', emoji: '🟫', stackable: true, type: 'block', blockId: BLOCKS.MUD_BRICK_SLAB },
    cobble_stairs: { name: 'Cobble Stairs', emoji: '🪜', stackable: true, type: 'block', blockId: BLOCKS.COBBLE_STAIRS_N, placeFunc: 'stairs', baseId: 'COBBLE_STAIRS_' },
    cobble_slab: { name: 'Cobble Slab', emoji: '🟫', stackable: true, type: 'block', blockId: BLOCKS.COBBLE_SLAB },
    wall_cobble: { name: 'Cobble Wall', emoji: '🚧', stackable: true, type: 'block', blockId: BLOCKS.WALL_COBBLE },

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
    raw_copper: { name: 'Raw Copper', emoji: '🟠', stackable: true, type: 'material' },
    raw_tin: { name: 'Raw Tin', emoji: '⚪', stackable: true, type: 'material' },
    diamond: { name: 'Diamond', emoji: '💎', stackable: true, type: 'material' },
    stick: { name: 'Stick', emoji: '🥢', stackable: true, type: 'material' },
    iron_ingot: { name: 'Iron Ingot', emoji: '🔩', stackable: true, type: 'material' },
    gold_ingot: { name: 'Gold Ingot', emoji: '🪙', stackable: true, type: 'material' },
    copper_ingot: { name: 'Copper Ingot', emoji: '🟠', stackable: true, type: 'material' },
    tin_ingot: { name: 'Tin Ingot', emoji: '⚪', stackable: true, type: 'material' },
    bronze_ingot: { name: 'Bronze Ingot', emoji: '🟤', stackable: true, type: 'material' },
    flint: { name: 'Flint', emoji: '🔺', stackable: true, type: 'material' },
    leather: { name: 'Leather', emoji: '🟤', stackable: true, type: 'material' },
    bone: { name: 'Bone', emoji: '🦴', stackable: true, type: 'material' },
    string: { name: 'String', emoji: '🧵', stackable: true, type: 'material' },
    feather: { name: 'Feather', emoji: '🪶', stackable: true, type: 'material' },
    clay_ball: { name: 'Clay Ball', emoji: '🔘', stackable: true, type: 'material' },
    brick: { name: 'Brick', emoji: '🧱', stackable: true, type: 'material' },
    vines: { name: 'Vines', emoji: '🌿', stackable: true, type: 'block', blockId: BLOCKS.VINES },
    stone_bricks: { name: 'Stone Bricks', emoji: '🧱', stackable: true, type: 'block', blockId: BLOCKS.STONE_BRICKS },
    rope: { name: 'Rope', emoji: '🪢', stackable: true, type: 'material' },
    arrow: { name: 'Arrow', emoji: '🏹', stackable: true, type: 'ammo', damage: 5 },
    water_bucket: { name: 'Water Bucket', emoji: '🪣', stackable: false, type: 'tool' },
    dragon_scale: { name: 'Dragon Scale', emoji: '🐉', stackable: true, type: 'material', rare: true },
    relic_flint: { name: 'Primal Flint', emoji: '✨', stackable: false, type: 'material', rare: true, description: 'One of the three relics needed to master fire.' },
    relic_tinder: { name: 'Sacred Tinder', emoji: '🌿', stackable: false, type: 'material', rare: true, description: 'One of the three relics needed to master fire.' },
    relic_stone: { name: 'Ancient Hearthstone', emoji: '🌑', stackable: false, type: 'material', rare: true, description: 'One of the three relics needed to master fire.' },

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

    // Bronze Age tools (explicit names for age progression)
    bronze_pickaxe: { name: 'Bronze Pickaxe', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', damage: 4, miningSpeed: 3, durability: 251 },
    bronze_axe: { name: 'Bronze Axe', emoji: '🪓', stackable: false, type: 'tool', toolType: 'axe', damage: 6, miningSpeed: 3, durability: 251 },
    bronze_sword: { name: 'Bronze Sword', emoji: '🗡️', stackable: false, type: 'weapon', damage: 8, durability: 251 },

    // Bone tools (Tribal Age)
    bone_knife: { name: 'Bone Knife', emoji: '🔪', stackable: false, type: 'weapon', damage: 4, durability: 60 },
    bone_pickaxe: { name: 'Bone Pick', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', damage: 3, miningSpeed: 1.8, durability: 80 },
    bone_tools: { name: 'Bone Tools Set', emoji: '🦴', stackable: false, type: 'tool', toolType: 'multi', damage: 3, miningSpeed: 1.5, durability: 80 },

    // Armor - Prehistoric
    leather_armor: { name: 'Leather Armor', emoji: '🦺', stackable: false, type: 'armor', slot: 'chest', defense: 3, durability: 80 },
    leather_boots: { name: 'Leather Boots', emoji: '👢', stackable: false, type: 'armor', slot: 'feet', defense: 1, durability: 65 },
    leather_helmet: { name: 'Leather Cap', emoji: '🎓', stackable: false, type: 'armor', slot: 'head', defense: 1, durability: 55 },
    fur_coat: { name: 'Fur Coat', emoji: '🧥', stackable: false, type: 'armor', slot: 'chest', defense: 2, durability: 60, coldResist: 0.3 },

    // Armor - Bronze Age
    bronze_armor: { name: 'Bronze Armor', emoji: '🛡️', stackable: false, type: 'armor', slot: 'chest', defense: 5, durability: 165 },
    bronze_helmet: { name: 'Bronze Helmet', emoji: '⛑️', stackable: false, type: 'armor', slot: 'head', defense: 2, durability: 165 },
    bronze_boots: { name: 'Bronze Boots', emoji: '👢', stackable: false, type: 'armor', slot: 'feet', defense: 2, durability: 195 },

    // Armor - Iron Age
    iron_armor: { name: 'Iron Armor', emoji: '🛡️', stackable: false, type: 'armor', slot: 'chest', defense: 6, durability: 240 },
    iron_helmet: { name: 'Iron Helmet', emoji: '⛑️', stackable: false, type: 'armor', slot: 'head', defense: 3, durability: 165 },
    iron_boots: { name: 'Iron Boots', emoji: '👢', stackable: false, type: 'armor', slot: 'feet', defense: 2, durability: 195 },

    // Crafting stations
    tanning_rack: { name: 'Tanning Rack', emoji: '🦌', stackable: true, type: 'block', blockId: BLOCKS.TANNING_RACK },
    forge: { name: 'Forge', emoji: '🔥', stackable: true, type: 'block', blockId: BLOCKS.FORGE },
    anvil: { name: 'Anvil', emoji: '🔨', stackable: true, type: 'block', blockId: BLOCKS.ANVIL },

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

    // Medieval Age Items - Blocks
    wood_beam: { name: 'Wood Beam', emoji: '🪵', stackable: true, type: 'block', blockId: BLOCKS.WOOD_BEAM },
    cobblestone_wall: { name: 'Cobblestone Wall', emoji: '🧱', stackable: true, type: 'block', blockId: BLOCKS.COBBLESTONE_WALL },
    iron_bars: { name: 'Iron Bars', emoji: '⬜', stackable: true, type: 'block', blockId: BLOCKS.IRON_BARS },
    gate: { name: 'Gate', emoji: '🚪', stackable: true, type: 'block', blockId: BLOCKS.GATE },
    portcullis: { name: 'Portcullis', emoji: '🚧', stackable: true, type: 'block', blockId: BLOCKS.PORTCULLIS },
    irrigation: { name: 'Irrigation Channel', emoji: '💧', stackable: true, type: 'block', blockId: BLOCKS.IRRIGATION },
    loom: { name: 'Loom', emoji: '🧵', stackable: true, type: 'block', blockId: BLOCKS.LOOM },
    stable: { name: 'Stable', emoji: '🏠', stackable: true, type: 'block', blockId: BLOCKS.STABLE },
    market_stall: { name: 'Market Stall', emoji: '🏪', stackable: true, type: 'block', blockId: BLOCKS.MARKET_STALL },
    well: { name: 'Well', emoji: '🪣', stackable: true, type: 'block', blockId: BLOCKS.WELL },

    // Medieval Age Items - Resources
    barley: { name: 'Barley', emoji: '🌾', stackable: true, type: 'material' },
    barley_seeds: { name: 'Barley Seeds', emoji: '🌰', stackable: true, type: 'placeable', blockId: BLOCKS.BARLEY_CROP },
    flax: { name: 'Flax', emoji: '🌿', stackable: true, type: 'material' },
    flax_seeds: { name: 'Flax Seeds', emoji: '🌰', stackable: true, type: 'placeable', blockId: BLOCKS.FLAX_CROP },
    linen: { name: 'Linen', emoji: '🧶', stackable: true, type: 'material' },
    cloth: { name: 'Cloth', emoji: '🧵', stackable: true, type: 'material' },
    silver_coin: { name: 'Silver Coin', emoji: '🪙', stackable: true, type: 'currency', value: 1 },
    gold_coin: { name: 'Gold Coin', emoji: '💰', stackable: true, type: 'currency', value: 10 },
    steel_ingot: { name: 'Steel Ingot', emoji: '⬜', stackable: true, type: 'material' },

    // Medieval Age Items - Weapons
    crossbow: { name: 'Crossbow', emoji: '🏹', stackable: false, type: 'weapon', damage: 12, durability: 300, ranged: true, ammo: 'bolt' },
    longbow: { name: 'Longbow', emoji: '🏹', stackable: false, type: 'weapon', damage: 10, durability: 250, ranged: true, ammo: 'arrow' },
    bolt: { name: 'Bolt', emoji: '➡️', stackable: true, type: 'ammo', damage: 8 },
    steel_sword: { name: 'Steel Sword', emoji: '⚔️', stackable: false, type: 'weapon', damage: 12, durability: 500 },
    halberd: { name: 'Halberd', emoji: '🔱', stackable: false, type: 'weapon', damage: 14, durability: 400, reach: 2 },
    mace: { name: 'Mace', emoji: '🔨', stackable: false, type: 'weapon', damage: 11, durability: 350, armorPiercing: true },

    // Medieval Age Items - Armor
    chainmail_helmet: { name: 'Chainmail Helmet', emoji: '⛑️', stackable: false, type: 'armor', slot: 'head', defense: 3, durability: 200 },
    chainmail_chestplate: { name: 'Chainmail Chestplate', emoji: '🦺', stackable: false, type: 'armor', slot: 'chest', defense: 6, durability: 280 },
    chainmail_leggings: { name: 'Chainmail Leggings', emoji: '👖', stackable: false, type: 'armor', slot: 'legs', defense: 5, durability: 260 },
    chainmail_boots: { name: 'Chainmail Boots', emoji: '👢', stackable: false, type: 'armor', slot: 'feet', defense: 3, durability: 220 },
    plate_helmet: { name: 'Plate Helmet', emoji: '🪖', stackable: false, type: 'armor', slot: 'head', defense: 4, durability: 300 },
    plate_chestplate: { name: 'Plate Chestplate', emoji: '🦺', stackable: false, type: 'armor', slot: 'chest', defense: 8, durability: 400 },
    plate_leggings: { name: 'Plate Leggings', emoji: '👖', stackable: false, type: 'armor', slot: 'legs', defense: 7, durability: 380 },
    plate_boots: { name: 'Plate Boots', emoji: '👢', stackable: false, type: 'armor', slot: 'feet', defense: 4, durability: 340 },

    // Medieval Age Items - Tools
    plough: { name: 'Plough', emoji: '🔧', stackable: false, type: 'tool', toolType: 'hoe', tier: 4, durability: 400, efficiency: 3 },
    steel_pickaxe: { name: 'Steel Pickaxe', emoji: '⛏️', stackable: false, type: 'tool', toolType: 'pickaxe', tier: 4, damage: 6, durability: 600, efficiency: 3 },
    steel_axe: { name: 'Steel Axe', emoji: '🪓', stackable: false, type: 'tool', toolType: 'axe', tier: 4, damage: 8, durability: 600, efficiency: 3 },

    // Industrial Age Items - Blocks
    steel_block: { name: 'Steel Block', emoji: '⬜', stackable: true, type: 'block', blockId: BLOCKS.STEEL_BLOCK },
    steam_engine: { name: 'Steam Engine', emoji: '⚙️', stackable: true, type: 'block', blockId: BLOCKS.STEAM_ENGINE },
    boiler: { name: 'Boiler', emoji: '🔥', stackable: true, type: 'block', blockId: BLOCKS.BOILER },
    conveyor_belt: { name: 'Conveyor Belt', emoji: '➡️', stackable: true, type: 'block', blockId: BLOCKS.CONVEYOR_BELT },
    assembler: { name: 'Assembler', emoji: '🏭', stackable: true, type: 'block', blockId: BLOCKS.ASSEMBLER },
    crusher: { name: 'Crusher', emoji: '⚒️', stackable: true, type: 'block', blockId: BLOCKS.CRUSHER },
    metal_pipe: { name: 'Metal Pipe', emoji: '🔧', stackable: true, type: 'block', blockId: BLOCKS.METAL_PIPE },
    gear_block: { name: 'Gear Block', emoji: '⚙️', stackable: true, type: 'block', blockId: BLOCKS.GEAR_BLOCK },
    chimney: { name: 'Chimney', emoji: '🏭', stackable: true, type: 'block', blockId: BLOCKS.CHIMNEY },
    rail: { name: 'Rail', emoji: '🛤️', stackable: true, type: 'block', blockId: BLOCKS.RAIL },
    asphalt: { name: 'Asphalt', emoji: '⬛', stackable: true, type: 'block', blockId: BLOCKS.ASPHALT },

    // Industrial Age Items - Resources
    crude_oil: { name: 'Crude Oil', emoji: '🛢️', stackable: true, type: 'material' },
    refined_oil: { name: 'Refined Oil', emoji: '🛢️', stackable: true, type: 'fuel', burnTime: 200 },
    rubber: { name: 'Rubber', emoji: '⚫', stackable: true, type: 'material' },
    plastic: { name: 'Plastic', emoji: '⬜', stackable: true, type: 'material' },
    gunpowder: { name: 'Gunpowder', emoji: '💥', stackable: true, type: 'material' },
    gear: { name: 'Gear', emoji: '⚙️', stackable: true, type: 'material' },
    spring: { name: 'Spring', emoji: '🔩', stackable: true, type: 'material' },

    // Industrial Age Items - Weapons
    musket: { name: 'Musket', emoji: '🔫', stackable: false, type: 'weapon', damage: 20, durability: 200, ranged: true, ammo: 'bullet', reloadTime: 3 },
    rifle: { name: 'Rifle', emoji: '🔫', stackable: false, type: 'weapon', damage: 25, durability: 300, ranged: true, ammo: 'bullet', reloadTime: 1.5 },
    bullet: { name: 'Bullet', emoji: '🔘', stackable: true, type: 'ammo', damage: 15 },
    dynamite: { name: 'Dynamite', emoji: '🧨', stackable: true, type: 'throwable', damage: 30, explosionRadius: 3 },

    // Modern Age Items - Blocks
    concrete: { name: 'Concrete', emoji: '🧱', stackable: true, type: 'block', blockId: BLOCKS.CONCRETE },
    glass_panel: { name: 'Glass Panel', emoji: '🪟', stackable: true, type: 'block', blockId: BLOCKS.GLASS_PANEL },
    steel_frame: { name: 'Steel Frame', emoji: '🏗️', stackable: true, type: 'block', blockId: BLOCKS.STEEL_FRAME },
    solar_panel: { name: 'Solar Panel', emoji: '☀️', stackable: true, type: 'block', blockId: BLOCKS.SOLAR_PANEL },
    wind_turbine: { name: 'Wind Turbine', emoji: '🌬️', stackable: true, type: 'block', blockId: BLOCKS.WIND_TURBINE },
    battery_block: { name: 'Battery', emoji: '🔋', stackable: true, type: 'block', blockId: BLOCKS.BATTERY },
    computer: { name: 'Computer', emoji: '💻', stackable: true, type: 'block', blockId: BLOCKS.COMPUTER },
    wire: { name: 'Wire', emoji: '〰️', stackable: true, type: 'block', blockId: BLOCKS.WIRE },
    circuit_board: { name: 'Circuit Board', emoji: '🔌', stackable: true, type: 'block', blockId: BLOCKS.CIRCUIT_BOARD },

    // Modern Age Items - Resources
    silicon: { name: 'Silicon', emoji: '💎', stackable: true, type: 'material' },
    copper_wire: { name: 'Copper Wire', emoji: '〰️', stackable: true, type: 'material' },
    microchip: { name: 'Microchip', emoji: '🔲', stackable: true, type: 'material' },
    battery_cell: { name: 'Battery Cell', emoji: '🔋', stackable: true, type: 'material' },
    electric_motor: { name: 'Electric Motor', emoji: '⚡', stackable: true, type: 'material' },

    // Modern Age Items - Weapons
    laser_rifle: { name: 'Laser Rifle', emoji: '🔫', stackable: false, type: 'weapon', damage: 30, durability: 500, ranged: true, ammo: 'energy_cell', instantHit: true },
    energy_cell: { name: 'Energy Cell', emoji: '⚡', stackable: true, type: 'ammo', damage: 25 },
    plasma_sword: { name: 'Plasma Sword', emoji: '⚔️', stackable: false, type: 'weapon', damage: 25, durability: 800, lightSaber: true },
    drone: { name: 'Combat Drone', emoji: '🛸', stackable: false, type: 'tool', deployable: true, attackDamage: 10, health: 50 },

    // Modern Age Items - Armor
    kevlar_vest: { name: 'Kevlar Vest', emoji: '🦺', stackable: false, type: 'armor', slot: 'chest', defense: 10, durability: 500, bulletResistance: 0.5 },
    tactical_helmet: { name: 'Tactical Helmet', emoji: '⛑️', stackable: false, type: 'armor', slot: 'head', defense: 6, durability: 400, nightVision: true },
    exo_suit: { name: 'Exo-Suit', emoji: '🤖', stackable: false, type: 'armor', slot: 'chest', defense: 15, durability: 1000, strengthBoost: 2, speedBoost: 1.5 },

    // ====== EVENT-SPECIFIC ITEMS ======

    // Meteor Shower Drops
    meteor_fragment: { name: 'Meteor Fragment', emoji: '☄️', stackable: true, type: 'material', rare: true, value: 50 },
    star_dust: { name: 'Star Dust', emoji: '✨', stackable: true, type: 'material', rare: true, value: 100, enchantPower: 2 },
    ancient_ore: { name: 'Ancient Ore', emoji: '🌟', stackable: true, type: 'material', rare: true, value: 200 },

    // Dungeon Loot
    dungeon_key: { name: 'Dungeon Key', emoji: '🗝️', stackable: true, type: 'key', unlocks: 'dungeon' },
    boss_trophy: { name: 'Boss Trophy', emoji: '🏆', stackable: true, type: 'material', rare: true },
    ancient_tablet: { name: 'Ancient Tablet', emoji: '📜', stackable: true, type: 'lore', givesRecipe: true },
    cursed_relic: { name: 'Cursed Relic', emoji: '💀', stackable: false, type: 'equipment', curse: true, power: 15 },

    // Portal Items
    portal_stone: { name: 'Portal Stone', emoji: '🔮', stackable: true, type: 'consumable', opensPortal: true },
    void_shard: { name: 'Void Shard', emoji: '🌑', stackable: true, type: 'material', rare: true },
    rift_essence: { name: 'Rift Essence', emoji: '💜', stackable: true, type: 'material', rare: true },

    // Fishing Items
    fishing_rod: { name: 'Fishing Rod', emoji: '🎣', stackable: false, type: 'tool', toolType: 'fishing_rod', durability: 65 },
    fishing_rod_upgraded: { name: 'Pro Fishing Rod', emoji: '🎣', stackable: false, type: 'tool', toolType: 'fishing_rod', durability: 200, luck: 1.5 },
    bait: { name: 'Bait', emoji: '🪱', stackable: true, type: 'consumable', baitPower: 1 },
    golden_bait: { name: 'Golden Bait', emoji: '✨', stackable: true, type: 'consumable', baitPower: 3 },
    legendary_fish: { name: 'Legendary Fish', emoji: '🐠', stackable: true, type: 'food', hunger: 15, health: 10, rare: true },
    treasure_chest: { name: 'Treasure Chest', emoji: '💰', stackable: true, type: 'lootbox', rare: true },

    // Potion Items
    empty_bottle: { name: 'Empty Bottle', emoji: '🫙', stackable: true, type: 'material' },
    healing_potion: { name: 'Healing Potion', emoji: '❤️', stackable: true, type: 'consumable', effect: 'heal', power: 30 },
    speed_potion: { name: 'Speed Potion', emoji: '💨', stackable: true, type: 'consumable', effect: 'speed', duration: 60, power: 1.5 },
    strength_potion: { name: 'Strength Potion', emoji: '💪', stackable: true, type: 'consumable', effect: 'strength', duration: 60, power: 2 },
    invisibility_potion: { name: 'Invisibility Potion', emoji: '👻', stackable: true, type: 'consumable', effect: 'invisible', duration: 30 },
    fire_resist_potion: { name: 'Fire Resist Potion', emoji: '🔥', stackable: true, type: 'consumable', effect: 'fire_resist', duration: 120 },
    night_vision_potion: { name: 'Night Vision Potion', emoji: '👁️', stackable: true, type: 'consumable', effect: 'night_vision', duration: 180 },
    water_breathing_potion: { name: 'Water Breathing', emoji: '🫧', stackable: true, type: 'consumable', effect: 'water_breathing', duration: 180 },

    // Potion Ingredients
    herb_red: { name: 'Red Herb', emoji: '🌺', stackable: true, type: 'material', potionIngredient: true },
    herb_blue: { name: 'Blue Herb', emoji: '💠', stackable: true, type: 'material', potionIngredient: true },
    herb_green: { name: 'Green Herb', emoji: '🌿', stackable: true, type: 'material', potionIngredient: true },
    glowshroom: { name: 'Glowshroom', emoji: '🍄', stackable: true, type: 'material', potionIngredient: true },
    spider_eye: { name: 'Spider Eye', emoji: '👁️', stackable: true, type: 'material', potionIngredient: true },
    magma_cream: { name: 'Magma Cream', emoji: '🔶', stackable: true, type: 'material', potionIngredient: true },

    // Grappling Hook
    grappling_hook: { name: 'Grappling Hook', emoji: '🪝', stackable: false, type: 'tool', toolType: 'grapple', range: 15, durability: 100 },
    rope_ladder: { name: 'Rope Ladder', emoji: '🪜', stackable: true, type: 'block', placeable: true },

    // Pet Items
    pet_food: { name: 'Pet Food', emoji: '🦴', stackable: true, type: 'consumable', petFood: true, xp: 10 },
    pet_treat: { name: 'Pet Treat', emoji: '🍖', stackable: true, type: 'consumable', petFood: true, xp: 50, evolveChance: 0.1 },
    pet_armor: { name: 'Pet Armor', emoji: '🛡️', stackable: false, type: 'equipment', petEquipment: true, defense: 5 },
    pet_collar: { name: 'Magic Collar', emoji: '📿', stackable: false, type: 'equipment', petEquipment: true, healthBoost: 20 },

    // Blueprint Items
    blueprint_house: { name: 'House Blueprint', emoji: '📋', stackable: true, type: 'blueprint', structure: 'simple_house' },
    blueprint_tower: { name: 'Tower Blueprint', emoji: '📋', stackable: true, type: 'blueprint', structure: 'watchtower' },
    blueprint_farm: { name: 'Farm Blueprint', emoji: '📋', stackable: true, type: 'blueprint', structure: 'farm_plot' },
    blueprint_workshop: { name: 'Workshop Blueprint', emoji: '📋', stackable: true, type: 'blueprint', structure: 'workshop' },

    // Achievement Rewards
    explorer_compass: { name: 'Explorer Compass', emoji: '🧭', stackable: false, type: 'tool', revealsMap: true, showsStructures: true },
    lucky_charm: { name: 'Lucky Charm', emoji: '🍀', stackable: false, type: 'equipment', luckBoost: 0.25 },
    ancient_crown: { name: 'Ancient Crown', emoji: '👑', stackable: false, type: 'armor', slot: 'head', defense: 5, xpBoost: 1.5 },
    titan_gauntlet: { name: 'Titan Gauntlet', emoji: '🧤', stackable: false, type: 'equipment', damageBoost: 1.5, miningBoost: 2 },
};

// Crafting Recipes - Prehistoric themed with age requirements
// age: 0 = Stone Age, 1 = Tribal Age, 2 = Bronze Age, 3 = Iron Age, 4 = Medieval, 5 = Industrial, 6 = Modern
export const RECIPES = [
    // ========== STONE AGE (age: 0) - Basic Survival ==========
    // Basic wood processing
    { result: 'plank', count: 4, ingredients: [['wood', 1]], shape: null, age: 0, category: 'materials' },
    { result: 'stick', count: 4, ingredients: [['plank', 2]], shape: null, age: 0, category: 'materials' },

    // Functional blocks
    { result: 'crafting_table', count: 1, ingredients: [['plank', 4]], shape: null, age: 0, category: 'stations' },
    { result: 'furnace', count: 1, ingredients: [['cobblestone', 8]], shape: null, age: 0, category: 'stations' },
    { result: 'chest', count: 1, ingredients: [['plank', 8]], shape: null, age: 0, category: 'storage' },
    { result: 'campfire', count: 1, ingredients: [['relic_flint', 1], ['relic_tinder', 1], ['relic_stone', 1]], shape: null, age: 0, category: 'stations' },

    // Light sources
    { result: 'torch', count: 4, ingredients: [['coal', 1], ['stick', 1]], shape: null, age: 0, category: 'light' },

    // Primitive weapons - easiest to craft
    { result: 'club', count: 1, ingredients: [['wood', 2]], shape: null, age: 0, category: 'weapons' },
    { result: 'wooden_sword', count: 1, ingredients: [['stick', 2], ['flint', 1]], shape: null, age: 0, category: 'weapons' },
    { result: 'spear', count: 1, ingredients: [['stick', 2], ['flint', 2]], shape: null, age: 0, category: 'weapons' },

    // Stone tools
    { result: 'wooden_pickaxe', count: 1, ingredients: [['cobblestone', 2], ['stick', 2]], shape: null, age: 0, category: 'tools' },
    { result: 'wooden_axe', count: 1, ingredients: [['cobblestone', 2], ['stick', 2]], shape: null, age: 0, category: 'tools' },
    { result: 'wooden_hoe', count: 1, ingredients: [['stick', 2], ['flint', 1]], shape: null, age: 0, category: 'tools' },

    // Building blocks - Stone Age
    { result: 'sandstone', count: 4, ingredients: [['sand', 4]], shape: null, age: 0, category: 'building' },
    { result: 'ladder', count: 3, ingredients: [['stick', 7]], shape: null, age: 0, category: 'building' },
    { result: 'fence', count: 3, ingredients: [['plank', 4], ['stick', 2]], shape: null, age: 0, category: 'building' },
    { result: 'door', count: 3, ingredients: [['plank', 6]], shape: null, age: 0, category: 'building' },

    // ========== TRIBAL AGE (age: 1) - Hunting & Gathering ==========
    // Building blocks - Prehistoric
    { result: 'thatch', count: 4, ingredients: [['wheat', 4], ['stick', 2]], shape: null, age: 1, category: 'building' },
    { result: 'mud_brick', count: 4, ingredients: [['clay', 2], ['wheat', 1]], shape: null, age: 1, category: 'building' },
    { result: 'bone_block', count: 1, ingredients: [['bone', 9]], shape: null, age: 1, category: 'building' },
    { result: 'hay_block', count: 1, ingredients: [['wheat', 9]], shape: null, age: 1, category: 'building' },
    { result: 'moss_stone', count: 1, ingredients: [['cobblestone', 1], ['leaves', 1]], shape: null, age: 1, category: 'building' },

    // Tribal weapons
    { result: 'bone_club', count: 1, ingredients: [['bone', 3], ['leather', 1]], shape: null, age: 1, category: 'weapons' },
    { result: 'bone_knife', count: 1, ingredients: [['bone', 2], ['flint', 1]], shape: null, age: 1, category: 'weapons' },

    // Better stone tools
    { result: 'stone_pickaxe', count: 1, ingredients: [['flint', 3], ['stick', 2], ['leather', 1]], shape: null, age: 1, category: 'tools' },
    { result: 'stone_axe', count: 1, ingredients: [['flint', 3], ['stick', 2], ['leather', 1]], shape: null, age: 1, category: 'tools' },
    { result: 'stone_sword', count: 1, ingredients: [['flint', 2], ['stick', 1], ['leather', 1]], shape: null, age: 1, category: 'weapons' },

    // Bone tools
    { result: 'bone_pickaxe', count: 1, ingredients: [['bone', 3], ['stick', 2]], shape: null, age: 1, category: 'tools' },
    { result: 'bone_tools', count: 1, ingredients: [['bone', 5], ['leather', 2], ['stick', 2]], shape: null, age: 1, category: 'tools' },

    // Crafting stations
    { result: 'tanning_rack', count: 1, ingredients: [['wood', 4], ['leather', 2], ['stick', 4]], shape: null, age: 1, category: 'stations' },

    // Armor - Prehistoric
    { result: 'leather_armor', count: 1, ingredients: [['leather', 8]], shape: null, age: 1, category: 'armor' },
    { result: 'leather_boots', count: 1, ingredients: [['leather', 4]], shape: null, age: 1, category: 'armor' },
    { result: 'leather_helmet', count: 1, ingredients: [['leather', 5]], shape: null, age: 1, category: 'armor' },
    { result: 'fur_coat', count: 1, ingredients: [['leather', 6], ['string', 2]], shape: null, age: 1, category: 'armor' },

    // Survival items
    { result: 'bed', count: 1, ingredients: [['plank', 3], ['leather', 3]], shape: null, age: 1, category: 'building' },
    { result: 'leather', count: 1, ingredients: [['raw_meat', 1]], shape: null, age: 1, category: 'materials' },

    // ========== BRONZE AGE (age: 2) - Metallurgy ==========
    { result: 'forge', count: 1, ingredients: [['cobblestone', 8], ['iron_ingot', 4], ['coal', 8]], shape: null, age: 2, category: 'stations' },
    { result: 'brick_block', count: 1, ingredients: [['brick', 4]], shape: null, age: 2, category: 'building' },
    { result: 'stone_bricks', count: 4, ingredients: [['stone', 4]], shape: null, age: 2, category: 'building' },

    // Bronze tools
    { result: 'bronze_pickaxe', count: 1, ingredients: [['bronze_ingot', 3], ['stick', 2]], shape: null, age: 2, category: 'tools' },
    { result: 'bronze_axe', count: 1, ingredients: [['bronze_ingot', 3], ['stick', 2]], shape: null, age: 2, category: 'tools' },
    { result: 'bronze_sword', count: 1, ingredients: [['bronze_ingot', 2], ['stick', 1]], shape: null, age: 2, category: 'weapons' },

    // Armor - Bronze Age
    { result: 'bronze_armor', count: 1, ingredients: [['bronze_ingot', 8]], shape: null, age: 2, category: 'armor' },
    { result: 'bronze_helmet', count: 1, ingredients: [['bronze_ingot', 5]], shape: null, age: 2, category: 'armor' },
    { result: 'bronze_boots', count: 1, ingredients: [['bronze_ingot', 4]], shape: null, age: 2, category: 'armor' },

    // ========== IRON AGE (age: 3) - Advanced Metalworking ==========
    { result: 'anvil', count: 1, ingredients: [['iron_ingot', 10], ['cobblestone', 4]], shape: null, age: 3, category: 'stations' },

    // Iron tools
    { result: 'iron_pickaxe', count: 1, ingredients: [['iron_ingot', 3], ['stick', 2]], shape: null, age: 3, category: 'tools' },
    { result: 'iron_axe', count: 1, ingredients: [['iron_ingot', 3], ['stick', 2]], shape: null, age: 3, category: 'tools' },
    { result: 'iron_sword', count: 1, ingredients: [['iron_ingot', 2], ['stick', 1]], shape: null, age: 3, category: 'weapons' },

    // Rare obsidian tools
    { result: 'diamond_pickaxe', count: 1, ingredients: [['diamond', 3], ['stick', 2]], shape: null, age: 3, category: 'tools' },
    { result: 'diamond_sword', count: 1, ingredients: [['diamond', 2], ['stick', 1]], shape: null, age: 3, category: 'weapons' },

    // Armor - Iron Age
    { result: 'iron_armor', count: 1, ingredients: [['iron_ingot', 8]], shape: null, age: 3, category: 'armor' },
    { result: 'iron_helmet', count: 1, ingredients: [['iron_ingot', 5]], shape: null, age: 3, category: 'armor' },
    { result: 'iron_boots', count: 1, ingredients: [['iron_ingot', 4]], shape: null, age: 3, category: 'armor' },

    // ========== MEDIEVAL AGE (age: 4) ==========
    // Building blocks
    { result: 'wood_beam', count: 4, ingredients: [['wood', 2], ['plank', 2]], shape: null, age: 4, category: 'building' },
    { result: 'cobblestone_wall', count: 6, ingredients: [['cobblestone', 6]], shape: null, age: 4, category: 'building' },
    { result: 'iron_bars', count: 16, ingredients: [['iron_ingot', 6]], shape: null, age: 4, category: 'building' },
    { result: 'gate', count: 1, ingredients: [['plank', 4], ['iron_ingot', 2]], shape: null, age: 4, category: 'building' },
    { result: 'portcullis', count: 1, ingredients: [['iron_bars', 6], ['gear', 2]], shape: null, age: 4, category: 'building' },
    { result: 'irrigation', count: 4, ingredients: [['cobblestone', 4], ['plank', 2]], shape: null, age: 4, category: 'building' },
    { result: 'well', count: 1, ingredients: [['cobblestone', 16], ['iron_ingot', 4], ['rope', 2]], shape: null, age: 4, category: 'building' },

    // Crafting stations
    { result: 'loom', count: 1, ingredients: [['plank', 6], ['stick', 4], ['string', 4]], shape: null, age: 4, category: 'stations' },
    { result: 'stable', count: 1, ingredients: [['wood_beam', 8], ['plank', 12], ['hay_block', 4]], shape: null, age: 4, category: 'stations' },
    { result: 'market_stall', count: 1, ingredients: [['plank', 8], ['cloth', 4], ['wood_beam', 4]], shape: null, age: 4, category: 'stations' },

    // Materials
    { result: 'linen', count: 2, ingredients: [['flax', 4]], shape: null, age: 4, category: 'materials' },
    { result: 'cloth', count: 1, ingredients: [['linen', 2]], shape: null, station: 'loom', age: 4, category: 'materials' },
    { result: 'steel_ingot', count: 1, ingredients: [['iron_ingot', 2], ['coal', 4]], shape: null, station: 'forge', age: 4, category: 'materials' },
    { result: 'rope', count: 2, ingredients: [['string', 4]], shape: null, age: 4, category: 'materials' },
    { result: 'gear', count: 2, ingredients: [['iron_ingot', 2]], shape: null, station: 'anvil', age: 4, category: 'materials' },

    // Medieval weapons
    { result: 'crossbow', count: 1, ingredients: [['plank', 3], ['iron_ingot', 2], ['string', 2], ['gear', 1]], shape: null, age: 4, category: 'weapons' },
    { result: 'longbow', count: 1, ingredients: [['wood', 3], ['string', 3]], shape: null, age: 4, category: 'weapons' },
    { result: 'bolt', count: 8, ingredients: [['iron_ingot', 1], ['stick', 2]], shape: null, age: 4, category: 'ammo' },
    { result: 'arrow', count: 8, ingredients: [['stick', 1], ['flint', 1], ['feather', 2]], shape: null, age: 4, category: 'ammo' },
    { result: 'steel_sword', count: 1, ingredients: [['steel_ingot', 3], ['leather', 1]], shape: null, station: 'anvil', age: 4, category: 'weapons' },
    { result: 'halberd', count: 1, ingredients: [['steel_ingot', 2], ['wood_beam', 2]], shape: null, station: 'anvil', age: 4, category: 'weapons' },
    { result: 'mace', count: 1, ingredients: [['steel_ingot', 4], ['leather', 1]], shape: null, station: 'anvil', age: 4, category: 'weapons' },

    // Medieval armor (chainmail)
    { result: 'chainmail_helmet', count: 1, ingredients: [['iron_ingot', 5], ['leather', 1]], shape: null, station: 'anvil', age: 4, category: 'armor' },
    { result: 'chainmail_chestplate', count: 1, ingredients: [['iron_ingot', 8], ['leather', 2]], shape: null, station: 'anvil', age: 4, category: 'armor' },
    { result: 'chainmail_leggings', count: 1, ingredients: [['iron_ingot', 7], ['leather', 2]], shape: null, station: 'anvil', age: 4, category: 'armor' },
    { result: 'chainmail_boots', count: 1, ingredients: [['iron_ingot', 4], ['leather', 1]], shape: null, station: 'anvil', age: 4, category: 'armor' },

    // Medieval armor (plate)
    { result: 'plate_helmet', count: 1, ingredients: [['steel_ingot', 5], ['leather', 1]], shape: null, station: 'anvil', age: 4, category: 'armor' },
    { result: 'plate_chestplate', count: 1, ingredients: [['steel_ingot', 8], ['cloth', 2]], shape: null, station: 'anvil', age: 4, category: 'armor' },
    { result: 'plate_leggings', count: 1, ingredients: [['steel_ingot', 7], ['cloth', 2]], shape: null, station: 'anvil', age: 4, category: 'armor' },
    { result: 'plate_boots', count: 1, ingredients: [['steel_ingot', 4], ['leather', 1]], shape: null, station: 'anvil', age: 4, category: 'armor' },

    // Medieval tools
    { result: 'plough', count: 1, ingredients: [['steel_ingot', 3], ['wood_beam', 2]], shape: null, station: 'anvil', age: 4, category: 'tools' },
    { result: 'steel_pickaxe', count: 1, ingredients: [['steel_ingot', 3], ['wood_beam', 2]], shape: null, station: 'anvil', age: 4, category: 'tools' },
    { result: 'steel_axe', count: 1, ingredients: [['steel_ingot', 3], ['wood_beam', 2]], shape: null, station: 'anvil', age: 4, category: 'tools' },

    // ========== INDUSTRIAL AGE (age: 5) ==========
    // Building blocks
    { result: 'steel_block', count: 1, ingredients: [['steel_ingot', 9]], shape: null, age: 5, category: 'building' },
    { result: 'chimney', count: 1, ingredients: [['brick_block', 8], ['steel_ingot', 2]], shape: null, age: 5, category: 'building' },
    { result: 'rail', count: 16, ingredients: [['steel_ingot', 6], ['wood_beam', 2]], shape: null, age: 5, category: 'building' },
    { result: 'asphalt', count: 4, ingredients: [['gravel', 4], ['crude_oil', 2]], shape: null, age: 5, category: 'building' },

    // Machines
    { result: 'steam_engine', count: 1, ingredients: [['steel_block', 2], ['gear', 6], ['metal_pipe', 4], ['boiler', 1]], shape: null, age: 5, category: 'stations' },
    { result: 'boiler', count: 1, ingredients: [['steel_ingot', 8], ['metal_pipe', 4]], shape: null, age: 5, category: 'stations' },
    { result: 'conveyor_belt', count: 4, ingredients: [['steel_ingot', 2], ['rubber', 4], ['gear', 2]], shape: null, age: 5, category: 'building' },
    { result: 'assembler', count: 1, ingredients: [['steel_block', 4], ['gear', 8], ['conveyor_belt', 4]], shape: null, age: 5, category: 'stations' },
    { result: 'crusher', count: 1, ingredients: [['steel_block', 4], ['gear', 6], ['steel_ingot', 8]], shape: null, age: 5, category: 'stations' },
    { result: 'metal_pipe', count: 4, ingredients: [['steel_ingot', 4]], shape: null, age: 5, category: 'materials' },
    { result: 'gear_block', count: 1, ingredients: [['gear', 4], ['steel_ingot', 4]], shape: null, age: 5, category: 'building' },

    // Industrial materials
    { result: 'gunpowder', count: 2, ingredients: [['coal', 2], ['sand', 1]], shape: null, age: 5, category: 'materials' },
    { result: 'spring', count: 2, ingredients: [['steel_ingot', 1]], shape: null, age: 5, category: 'materials' },
    { result: 'rubber', count: 2, ingredients: [['crude_oil', 2]], shape: null, station: 'boiler', age: 5, category: 'materials' },
    { result: 'plastic', count: 2, ingredients: [['crude_oil', 3]], shape: null, station: 'assembler', age: 5, category: 'materials' },
    { result: 'refined_oil', count: 2, ingredients: [['crude_oil', 4]], shape: null, station: 'boiler', age: 5, category: 'materials' },

    // Industrial weapons
    { result: 'musket', count: 1, ingredients: [['steel_ingot', 6], ['wood_beam', 2], ['gear', 2]], shape: null, station: 'assembler', age: 5, category: 'weapons' },
    { result: 'rifle', count: 1, ingredients: [['steel_ingot', 8], ['wood_beam', 2], ['gear', 4], ['spring', 2]], shape: null, station: 'assembler', age: 5, category: 'weapons' },
    { result: 'bullet', count: 8, ingredients: [['steel_ingot', 1], ['gunpowder', 2]], shape: null, age: 5, category: 'ammo' },
    { result: 'dynamite', count: 2, ingredients: [['gunpowder', 4], ['cloth', 1], ['string', 1]], shape: null, age: 5, category: 'weapons' },

    // ========== MODERN AGE (age: 6) ==========
    // Building blocks
    { result: 'concrete', count: 4, ingredients: [['gravel', 4], ['sand', 4], ['water_bucket', 1]], shape: null, age: 6, category: 'building' },
    { result: 'glass_panel', count: 4, ingredients: [['glass', 4], ['steel_frame', 1]], shape: null, age: 6, category: 'building' },
    { result: 'steel_frame', count: 4, ingredients: [['steel_ingot', 6]], shape: null, age: 6, category: 'building' },

    // Electronics
    { result: 'wire', count: 8, ingredients: [['copper_wire', 2], ['plastic', 1]], shape: null, age: 6, category: 'materials' },
    { result: 'copper_wire', count: 4, ingredients: [['copper_ingot', 1]], shape: null, age: 6, category: 'materials' },
    { result: 'silicon', count: 2, ingredients: [['sand', 8]], shape: null, station: 'furnace', age: 6, category: 'materials' },
    { result: 'microchip', count: 1, ingredients: [['silicon', 2], ['gold_ingot', 1], ['copper_wire', 4]], shape: null, station: 'assembler', age: 6, category: 'materials' },
    { result: 'circuit_board', count: 1, ingredients: [['plastic', 2], ['copper_wire', 4], ['microchip', 2]], shape: null, station: 'assembler', age: 6, category: 'materials' },
    { result: 'battery_cell', count: 1, ingredients: [['steel_ingot', 2], ['copper_wire', 2], ['refined_oil', 1]], shape: null, age: 6, category: 'materials' },
    { result: 'electric_motor', count: 1, ingredients: [['copper_wire', 8], ['steel_ingot', 4], ['gear', 2]], shape: null, station: 'assembler', age: 6, category: 'materials' },

    // Power systems
    { result: 'solar_panel', count: 1, ingredients: [['glass_panel', 4], ['silicon', 4], ['wire', 8], ['steel_frame', 2]], shape: null, age: 6, category: 'stations' },
    { result: 'wind_turbine', count: 1, ingredients: [['steel_frame', 8], ['gear', 6], ['electric_motor', 1], ['wire', 8]], shape: null, age: 6, category: 'stations' },
    { result: 'battery_block', count: 1, ingredients: [['battery_cell', 8], ['steel_frame', 1], ['wire', 4]], shape: null, age: 6, category: 'stations' },
    { result: 'computer', count: 1, ingredients: [['circuit_board', 4], ['microchip', 4], ['glass_panel', 1], ['steel_frame', 2]], shape: null, age: 6, category: 'stations' },

    // Modern weapons
    { result: 'laser_rifle', count: 1, ingredients: [['steel_frame', 2], ['circuit_board', 2], ['battery_cell', 4], ['glass', 2]], shape: null, station: 'computer', age: 6, category: 'weapons' },
    { result: 'energy_cell', count: 4, ingredients: [['battery_cell', 2], ['microchip', 1]], shape: null, age: 6, category: 'ammo' },
    { result: 'plasma_sword', count: 1, ingredients: [['steel_ingot', 4], ['circuit_board', 2], ['battery_cell', 4], ['glass', 1]], shape: null, station: 'computer', age: 6, category: 'weapons' },
    { result: 'drone', count: 1, ingredients: [['steel_frame', 2], ['electric_motor', 4], ['circuit_board', 2], ['microchip', 2], ['battery_cell', 4]], shape: null, station: 'computer', age: 6, category: 'tools' },

    // Modern armor
    { result: 'kevlar_vest', count: 1, ingredients: [['plastic', 8], ['cloth', 4], ['steel_ingot', 4]], shape: null, station: 'assembler', age: 6, category: 'armor' },
    { result: 'tactical_helmet', count: 1, ingredients: [['plastic', 4], ['glass_panel', 1], ['circuit_board', 1], ['steel_frame', 2]], shape: null, station: 'assembler', age: 6, category: 'armor' },
    { result: 'exo_suit', count: 1, ingredients: [['steel_frame', 8], ['electric_motor', 4], ['circuit_board', 4], ['battery_cell', 8], ['kevlar_vest', 1]], shape: null, station: 'computer', age: 6, category: 'armor' },
];

// Smelting Recipes
export const SMELTING = {
    raw_iron: 'iron_ingot',
    raw_gold: 'gold_ingot',
    raw_copper: 'copper_ingot',
    raw_tin: 'tin_ingot',
    raw_meat: 'cooked_meat',
    fish: 'cooked_fish',
    sand: 'glass',
    clay: 'brick',
    cobblestone: 'stone',
    wheat: 'bread',
    wood: 'coal', // Charcoal from wood
    // Industrial/Modern smelting
    iron_ingot: 'steel_ingot', // Combine with coal at forge
    crude_oil: 'refined_oil',
};

// Bronze alloy (special recipe - 3 copper + 1 tin = 4 bronze)
export const ALLOY_RECIPES = {
    bronze_ingot: { ingredients: { copper_ingot: 3, tin_ingot: 1 }, count: 4 },
    steel_ingot: { ingredients: { iron_ingot: 2, coal: 4 }, count: 2 }
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
    SABER_CAT: {
        name: 'Saber Cat',
        emoji: '🐱',
        sprite: 'catenemy',
        health: 80,
        damage: 18,
        speed: 3.5,
        aggressive: true,
        xp: 120,
        drops: [['raw_meat', 4, 6], ['leather', 3, 5], ['bone', 3, 4]],
        size: 2.0, // Double the size of player
        nightOnly: false,
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

    // ========== MEDIEVAL AGE ENEMIES ==========
    BANDIT: {
        name: 'Bandit',
        emoji: '🥷',
        health: 40,
        damage: 8,
        speed: 2.5,
        aggressive: true,
        xp: 35,
        drops: [['silver_coin', 1, 5], ['arrow', 2, 5], ['leather', 1, 2]],
        age: 'medieval',
        canUseWeapons: true,
    },
    KNIGHT: {
        name: 'Rogue Knight',
        emoji: '🛡️',
        health: 80,
        damage: 15,
        speed: 1.8,
        aggressive: true,
        xp: 75,
        drops: [['steel_ingot', 1, 3], ['silver_coin', 3, 8], ['iron_ingot', 2, 4]],
        age: 'medieval',
        armor: 5,
        canUseWeapons: true,
    },
    HIGHWAYMAN: {
        name: 'Highwayman',
        emoji: '🏴‍☠️',
        health: 35,
        damage: 10,
        speed: 3,
        aggressive: true,
        xp: 40,
        drops: [['silver_coin', 2, 8], ['crossbow', 0, 1], ['bolt', 4, 8]],
        age: 'medieval',
        rangedAttack: true,
    },

    // ========== INDUSTRIAL AGE ENEMIES ==========
    STEAM_GOLEM: {
        name: 'Steam Golem',
        emoji: '🤖',
        health: 100,
        damage: 18,
        speed: 1.5,
        aggressive: true,
        xp: 90,
        drops: [['gear', 3, 6], ['steel_ingot', 2, 4], ['coal', 5, 10]],
        age: 'industrial',
        armor: 8,
        abilities: ['steam_blast'],
    },
    FACTORY_DRONE: {
        name: 'Factory Drone',
        emoji: '🔩',
        health: 30,
        damage: 8,
        speed: 4,
        aggressive: true,
        xp: 30,
        drops: [['gear', 1, 2], ['steel_ingot', 1, 2], ['spring', 1, 2]],
        age: 'industrial',
        flying: true,
    },
    REBEL_SOLDIER: {
        name: 'Rebel Soldier',
        emoji: '🪖',
        health: 50,
        damage: 20,
        speed: 2.5,
        aggressive: true,
        xp: 55,
        drops: [['bullet', 5, 10], ['gunpowder', 2, 4], ['steel_ingot', 1, 2]],
        age: 'industrial',
        rangedAttack: true,
        canUseWeapons: true,
    },

    // ========== MODERN AGE ENEMIES ==========
    HACKER_DRONE: {
        name: 'Hacker Drone',
        emoji: '🛸',
        health: 40,
        damage: 15,
        speed: 5,
        aggressive: true,
        xp: 45,
        drops: [['microchip', 1, 2], ['wire', 2, 4], ['battery_cell', 1, 2]],
        age: 'modern',
        flying: true,
        canHack: true,
    },
    CYBER_SOLDIER: {
        name: 'Cyber Soldier',
        emoji: '🦾',
        health: 70,
        damage: 25,
        speed: 3,
        aggressive: true,
        xp: 70,
        drops: [['energy_cell', 2, 4], ['circuit_board', 1, 2], ['plastic', 2, 4]],
        age: 'modern',
        rangedAttack: true,
        armor: 6,
    },
    SECURITY_BOT: {
        name: 'Security Bot',
        emoji: '🤖',
        health: 90,
        damage: 20,
        speed: 2,
        aggressive: true,
        xp: 80,
        drops: [['steel_frame', 1, 2], ['electric_motor', 1, 2], ['microchip', 1, 3]],
        age: 'modern',
        armor: 10,
        abilities: ['laser_sweep'],
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

    // ========== MEDIEVAL AGE BOSSES ==========
    WARLORD: {
        name: 'The Warlord',
        emoji: '⚔️',
        health: 600,
        damage: 35,
        speed: 2.2,
        aggressive: true,
        xp: 600,
        drops: [['steel_sword', 1, 1], ['plate_chestplate', 1, 1], ['gold_coin', 10, 20], ['steel_ingot', 5, 10]],
        abilities: ['rallying_cry', 'shield_bash', 'summon_knights'],
        spawnCondition: 'medieval_age',
        age: 'medieval',
        armor: 12,
    },
    DRAGON: {
        name: 'Ancient Dragon',
        emoji: '🐉',
        health: 1000,
        damage: 50,
        speed: 3,
        aggressive: true,
        xp: 1000,
        drops: [['diamond', 5, 10], ['gold_ingot', 15, 25], ['dragon_scale', 3, 5]],
        abilities: ['fire_breath', 'wing_gust', 'tail_sweep'],
        spawnCondition: 'dragon_egg_ritual',
        age: 'medieval',
        flying: true,
    },

    // ========== INDUSTRIAL AGE BOSSES ==========
    IRON_TITAN: {
        name: 'Iron Titan',
        emoji: '🦾',
        health: 800,
        damage: 40,
        speed: 1.5,
        aggressive: true,
        xp: 800,
        drops: [['steel_block', 5, 8], ['gear', 10, 15], ['steam_engine', 1, 1], ['gold_coin', 15, 30]],
        abilities: ['piston_punch', 'steam_explosion', 'gear_barrage'],
        spawnCondition: 'industrial_age',
        age: 'industrial',
        armor: 20,
    },
    TRAIN_BOSS: {
        name: 'Rogue Locomotive',
        emoji: '🚂',
        health: 700,
        damage: 60,
        speed: 4,
        aggressive: true,
        xp: 700,
        drops: [['steel_ingot', 20, 30], ['coal', 30, 50], ['rail', 20, 30]],
        abilities: ['charge', 'whistle_stun', 'coal_explosion'],
        spawnCondition: 'rail_complete',
        age: 'industrial',
        armor: 15,
        onRailsOnly: true,
    },

    // ========== MODERN AGE BOSSES ==========
    AI_CORE: {
        name: 'Rogue AI Core',
        emoji: '🧠',
        health: 1200,
        damage: 45,
        speed: 0,
        aggressive: true,
        xp: 1200,
        drops: [['computer', 3, 5], ['circuit_board', 10, 15], ['microchip', 15, 25], ['exo_suit', 1, 1]],
        abilities: ['emp_pulse', 'drone_swarm', 'laser_grid', 'system_hack'],
        spawnCondition: 'modern_age',
        age: 'modern',
        stationary: true,
        armor: 25,
        shieldPhases: 3,
    },
    MECH_WARRIOR: {
        name: 'Mech Warrior',
        emoji: '🤖',
        health: 900,
        damage: 55,
        speed: 2,
        aggressive: true,
        xp: 900,
        drops: [['steel_frame', 8, 12], ['electric_motor', 5, 8], ['battery_cell', 10, 15], ['laser_rifle', 1, 1]],
        abilities: ['rocket_barrage', 'laser_beam', 'jump_slam'],
        spawnCondition: 'mech_summoning',
        age: 'modern',
        armor: 18,
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
        enemies: ['WOLF', 'MAMMOTH', 'RHINO', 'SABER_CAT'],
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
        enemies: ['CAVE_LION', 'HYENA', 'RHINO', 'SABER_CAT'],
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

    // ========== MEDIEVAL AGE QUESTS ==========
    FORGE_STEEL: {
        id: 'forge_steel',
        name: 'Steel Forging',
        description: 'Learn to forge steel, the strongest metal',
        type: 'craft',
        requirements: [
            { item: 'steel_ingot', count: 10 }
        ],
        rewards: { xp: 500, items: [['silver_coin', 20]] },
        unlocks: ['DEFEAT_BANDITS'],
        age: 'MEDIEVAL_AGE',
    },
    DEFEAT_BANDITS: {
        id: 'defeat_bandits',
        name: 'Bandit Trouble',
        description: 'Clear the roads of dangerous bandits',
        type: 'kill',
        requirements: [
            { enemy: 'BANDIT', count: 10 },
            { enemy: 'HIGHWAYMAN', count: 5 }
        ],
        rewards: { xp: 600, items: [['silver_coin', 50], ['crossbow', 1]] },
        unlocks: ['BUILD_CASTLE'],
        age: 'MEDIEVAL_AGE',
    },
    BUILD_CASTLE: {
        id: 'build_castle',
        name: 'Castle Builder',
        description: 'Construct a defensive castle with walls and a gate',
        type: 'place',
        requirements: [
            { block: 'COBBLESTONE_WALL', count: 50 },
            { block: 'GATE', count: 2 },
            { block: 'IRON_BARS', count: 20 }
        ],
        rewards: { xp: 800, items: [['gold_coin', 10]] },
        unlocks: ['ESTABLISH_TRADE'],
        age: 'MEDIEVAL_AGE',
    },
    ESTABLISH_TRADE: {
        id: 'establish_trade',
        name: 'Merchant Prince',
        description: 'Set up a market stall and accumulate wealth',
        type: 'collect',
        requirements: [
            { item: 'silver_coin', count: 200 },
            { item: 'gold_coin', count: 20 }
        ],
        rewards: { xp: 700, items: [['steel_sword', 1], ['plate_helmet', 1]] },
        unlocks: ['DEFEAT_WARLORD'],
        age: 'MEDIEVAL_AGE',
    },
    DEFEAT_WARLORD: {
        id: 'defeat_warlord',
        name: 'The Warlord Falls',
        description: 'Defeat the Warlord threatening the realm',
        type: 'kill',
        requirements: [
            { enemy: 'WARLORD', count: 1 }
        ],
        rewards: { xp: 2000, items: [['gold_coin', 50], ['diamond', 5]] },
        unlocks: ['DRAGON_SLAYER'],
        age: 'MEDIEVAL_AGE',
    },
    DRAGON_SLAYER: {
        id: 'dragon_slayer',
        name: 'Dragon Slayer',
        description: 'Slay the Ancient Dragon terrorizing the lands',
        type: 'kill',
        requirements: [
            { enemy: 'DRAGON', count: 1 }
        ],
        rewards: { xp: 3000, items: [['dragon_scale', 5], ['gold_coin', 100]] },
        unlocks: ['BUILD_FACTORY'],
        age: 'MEDIEVAL_AGE',
    },

    // ========== INDUSTRIAL AGE QUESTS ==========
    BUILD_FACTORY: {
        id: 'build_factory',
        name: 'Industrial Revolution',
        description: 'Build your first automated factory',
        type: 'place',
        requirements: [
            { block: 'STEAM_ENGINE', count: 1 },
            { block: 'CONVEYOR_BELT', count: 10 },
            { block: 'ASSEMBLER', count: 1 }
        ],
        rewards: { xp: 1000, items: [['gear', 30], ['steel_ingot', 20]] },
        unlocks: ['DEFEAT_GOLEMS'],
        age: 'INDUSTRIAL_AGE',
    },
    DEFEAT_GOLEMS: {
        id: 'defeat_golems',
        name: 'Machine Breaker',
        description: 'Destroy the rogue steam golems',
        type: 'kill',
        requirements: [
            { enemy: 'STEAM_GOLEM', count: 5 },
            { enemy: 'FACTORY_DRONE', count: 10 }
        ],
        rewards: { xp: 1200, items: [['musket', 1], ['bullet', 50]] },
        unlocks: ['BUILD_RAILROAD'],
        age: 'INDUSTRIAL_AGE',
    },
    BUILD_RAILROAD: {
        id: 'build_railroad',
        name: 'Railroad Tycoon',
        description: 'Construct a railway network',
        type: 'place',
        requirements: [
            { block: 'RAIL', count: 100 }
        ],
        rewards: { xp: 1500, items: [['steel_block', 10], ['coal', 100]] },
        unlocks: ['DEFEAT_TITAN'],
        age: 'INDUSTRIAL_AGE',
    },
    DEFEAT_TITAN: {
        id: 'defeat_titan',
        name: 'Titan Slayer',
        description: 'Bring down the Iron Titan',
        type: 'kill',
        requirements: [
            { enemy: 'IRON_TITAN', count: 1 }
        ],
        rewards: { xp: 2500, items: [['steam_engine', 2], ['rifle', 1]] },
        unlocks: ['POWER_GRID'],
        age: 'INDUSTRIAL_AGE',
    },

    // ========== MODERN AGE QUESTS ==========
    POWER_GRID: {
        id: 'power_grid',
        name: 'Power Grid',
        description: 'Establish a renewable energy network',
        type: 'place',
        requirements: [
            { block: 'SOLAR_PANEL', count: 10 },
            { block: 'WIND_TURBINE', count: 5 },
            { block: 'BATTERY', count: 5 }
        ],
        rewards: { xp: 2000, items: [['circuit_board', 20], ['microchip', 15]] },
        unlocks: ['BUILD_COMPUTER'],
        age: 'MODERN_AGE',
    },
    BUILD_COMPUTER: {
        id: 'build_computer',
        name: 'Digital Dawn',
        description: 'Build and program a computer system',
        type: 'place',
        requirements: [
            { block: 'COMPUTER', count: 3 },
            { block: 'WIRE', count: 50 }
        ],
        rewards: { xp: 2200, items: [['laser_rifle', 1], ['energy_cell', 30]] },
        unlocks: ['DEFEAT_HACKERS'],
        age: 'MODERN_AGE',
    },
    DEFEAT_HACKERS: {
        id: 'defeat_hackers',
        name: 'Cyber Warfare',
        description: 'Eliminate the hacker drone threat',
        type: 'kill',
        requirements: [
            { enemy: 'HACKER_DRONE', count: 15 },
            { enemy: 'CYBER_SOLDIER', count: 10 }
        ],
        rewards: { xp: 2500, items: [['drone', 1], ['microchip', 30]] },
        unlocks: ['DEFEAT_AI_CORE'],
        age: 'MODERN_AGE',
    },
    DEFEAT_AI_CORE: {
        id: 'defeat_ai_core',
        name: 'System Shutdown',
        description: 'Destroy the Rogue AI Core before it takes over',
        type: 'kill',
        requirements: [
            { enemy: 'AI_CORE', count: 1 }
        ],
        rewards: { xp: 5000, items: [['exo_suit', 1], ['plasma_sword', 1]] },
        unlocks: [],
        age: 'MODERN_AGE',
        finalBoss: true,
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
    MEDIEVAL_AGE: {
        name: 'Medieval Age',
        description: 'Build castles, train knights, and establish trade routes',
        unlockRequirements: {
            quests: ['DEFEAT_WARLORD'],
            level: 30,
            items: { 'steel_ingot': 30, 'silver_coin': 100 },
        },
        unlocksRecipes: ['steel_sword', 'crossbow', 'longbow', 'chainmail_armor', 'plate_armor', 'loom', 'stable', 'market_stall'],
        bonuses: {
            tradingBonus: 0.2,
            combatDamage: 0.35,
            maxHealth: 40,
            armorBonus: 0.2,
        },
        unlockEnemies: ['BANDIT', 'KNIGHT', 'HIGHWAYMAN'],
        unlockBosses: ['WARLORD', 'DRAGON'],
    },
    INDUSTRIAL_AGE: {
        name: 'Industrial Age',
        description: 'Harness steam power and build factories',
        unlockRequirements: {
            quests: ['BUILD_FACTORY', 'DRAGON_SLAYER'],
            level: 40,
            items: { 'steel_block': 20, 'gear': 50, 'crude_oil': 30 },
        },
        unlocksRecipes: ['steam_engine', 'conveyor_belt', 'assembler', 'crusher', 'musket', 'rifle', 'dynamite'],
        bonuses: {
            craftingSpeed: 0.5,
            miningSpeed: 0.5,
            combatDamage: 0.5,
            maxHealth: 60,
            autoCrafting: true,
        },
        unlockEnemies: ['STEAM_GOLEM', 'FACTORY_DRONE', 'REBEL_SOLDIER'],
        unlockBosses: ['IRON_TITAN', 'TRAIN_BOSS'],
    },
    MODERN_AGE: {
        name: 'Modern Age',
        description: 'Embrace technology, electronics, and automation',
        unlockRequirements: {
            quests: ['DEFEAT_TITAN', 'POWER_GRID'],
            level: 50,
            items: { 'circuit_board': 30, 'microchip': 50, 'battery_cell': 40 },
        },
        unlocksRecipes: ['solar_panel', 'wind_turbine', 'battery_block', 'computer', 'laser_rifle', 'plasma_sword', 'drone', 'exo_suit'],
        bonuses: {
            craftingSpeed: 1.0,
            miningSpeed: 0.8,
            combatDamage: 0.75,
            maxHealth: 100,
            autoCrafting: true,
            nightVision: true,
            powerGeneration: true,
        },
        unlockEnemies: ['HACKER_DRONE', 'CYBER_SOLDIER', 'SECURITY_BOT'],
        unlockBosses: ['AI_CORE', 'MECH_WARRIOR'],
    },
};