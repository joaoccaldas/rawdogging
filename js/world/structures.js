// Structure Generation System
// Generates buildings, ruins, and landmarks in the world

export class StructureSystem {
    constructor(game) {
        this.game = game;
        
        // Placed structures
        this.structures = new Map();
        
        // Structure definitions
        this.structureTypes = {
            // Villages
            house_small: {
                name: 'Small House',
                category: 'village',
                size: [7, 7, 5],
                rarity: 0.1,
                biomes: ['plains', 'forest'],
                lootTier: 'common',
                canSpawnNPC: true
            },
            house_medium: {
                name: 'House',
                category: 'village',
                size: [10, 10, 6],
                rarity: 0.08,
                biomes: ['plains', 'forest'],
                lootTier: 'common',
                canSpawnNPC: true
            },
            blacksmith: {
                name: 'Blacksmith',
                category: 'village',
                size: [12, 10, 6],
                rarity: 0.03,
                biomes: ['plains', 'forest'],
                lootTier: 'uncommon',
                canSpawnNPC: true,
                npcType: 'blacksmith'
            },
            church: {
                name: 'Church',
                category: 'village',
                size: [15, 10, 12],
                rarity: 0.02,
                biomes: ['plains', 'forest'],
                lootTier: 'uncommon'
            },
            farm: {
                name: 'Farm',
                category: 'village',
                size: [20, 15, 4],
                rarity: 0.05,
                biomes: ['plains'],
                lootTier: 'common',
                canSpawnNPC: true,
                npcType: 'farmer'
            },
            well: {
                name: 'Well',
                category: 'village',
                size: [5, 5, 3],
                rarity: 0.1,
                biomes: ['plains', 'forest', 'desert']
            },
            
            // Wilderness
            watchtower: {
                name: 'Watchtower',
                category: 'wilderness',
                size: [8, 8, 15],
                rarity: 0.02,
                biomes: ['plains', 'mountains', 'forest'],
                lootTier: 'uncommon',
                hasEnemies: true
            },
            ruins: {
                name: 'Ancient Ruins',
                category: 'wilderness',
                size: [15, 15, 5],
                rarity: 0.03,
                biomes: ['plains', 'forest', 'desert'],
                lootTier: 'rare',
                hasEnemies: true
            },
            shrine: {
                name: 'Shrine',
                category: 'wilderness',
                size: [6, 6, 8],
                rarity: 0.02,
                biomes: ['forest', 'mountains'],
                lootTier: 'uncommon',
                isInteractable: true
            },
            camp: {
                name: 'Bandit Camp',
                category: 'wilderness',
                size: [12, 12, 4],
                rarity: 0.04,
                biomes: ['forest', 'plains'],
                lootTier: 'common',
                hasEnemies: true,
                enemyType: 'bandit'
            },
            
            // Desert
            pyramid: {
                name: 'Pyramid',
                category: 'desert',
                size: [25, 25, 20],
                rarity: 0.01,
                biomes: ['desert'],
                lootTier: 'legendary',
                hasDungeon: true
            },
            oasis: {
                name: 'Oasis',
                category: 'desert',
                size: [15, 15, 3],
                rarity: 0.03,
                biomes: ['desert'],
                hasWater: true
            },
            desert_temple: {
                name: 'Desert Temple',
                category: 'desert',
                size: [12, 12, 8],
                rarity: 0.02,
                biomes: ['desert'],
                lootTier: 'rare',
                hasTraps: true
            },
            
            // Mountains
            mountain_cabin: {
                name: 'Mountain Cabin',
                category: 'mountain',
                size: [8, 8, 5],
                rarity: 0.03,
                biomes: ['mountains', 'tundra'],
                lootTier: 'common',
                canSpawnNPC: true
            },
            mine_entrance: {
                name: 'Mine Entrance',
                category: 'mountain',
                size: [8, 6, 6],
                rarity: 0.02,
                biomes: ['mountains'],
                hasDungeon: true,
                dungeonType: 'mine'
            },
            ice_spire: {
                name: 'Ice Spire',
                category: 'mountain',
                size: [10, 10, 25],
                rarity: 0.01,
                biomes: ['tundra'],
                lootTier: 'rare'
            },
            
            // Underground (placed in caves)
            underground_lake: {
                name: 'Underground Lake',
                category: 'underground',
                size: [20, 20, 8],
                rarity: 0.02,
                biomes: ['cave'],
                hasWater: true
            },
            mushroom_grove: {
                name: 'Mushroom Grove',
                category: 'underground',
                size: [15, 15, 10],
                rarity: 0.03,
                biomes: ['cave'],
                lootTier: 'uncommon'
            },
            
            // Special
            portal: {
                name: 'Ancient Portal',
                category: 'special',
                size: [10, 10, 12],
                rarity: 0.005,
                biomes: ['any'],
                lootTier: 'legendary',
                isInteractable: true
            },
            crashed_ship: {
                name: 'Crashed Airship',
                category: 'special',
                size: [30, 12, 15],
                rarity: 0.01,
                biomes: ['plains', 'desert'],
                lootTier: 'legendary',
                hasEnemies: true
            }
        };
        
        // Block palettes for different structure types
        this.palettes = {
            village: {
                wall: 'oak_planks',
                floor: 'cobblestone',
                roof: 'oak_stairs',
                trim: 'oak_log'
            },
            wilderness: {
                wall: 'stone_brick',
                floor: 'stone',
                roof: 'stone_slab',
                trim: 'mossy_stone'
            },
            desert: {
                wall: 'sandstone',
                floor: 'sandstone',
                roof: 'sandstone_slab',
                trim: 'cut_sandstone'
            },
            mountain: {
                wall: 'spruce_planks',
                floor: 'cobblestone',
                roof: 'spruce_stairs',
                trim: 'spruce_log'
            }
        };
    }
    
    // Generate structure at position
    generateStructure(type, worldX, worldY, worldZ, rotation = 0, seed = null) {
        const structureType = this.structureTypes[type];
        if (!structureType) return null;
        
        const rng = this.createRNG(seed || Date.now());
        
        const structure = {
            id: `structure_${Date.now()}_${Math.floor(rng() * 10000)}`,
            type: type,
            typeData: structureType,
            worldX: worldX,
            worldY: worldY,
            worldZ: worldZ,
            rotation: rotation,
            blocks: [],
            entities: [],
            loot: [],
            discovered: false,
            explored: false,
            seed: seed
        };
        
        // Generate structure blocks based on type
        this.generateBlocks(structure, rng);
        
        // Place loot if applicable
        if (structureType.lootTier) {
            this.placeLoot(structure, rng);
        }
        
        // Spawn NPCs if applicable
        if (structureType.canSpawnNPC) {
            this.spawnNPCs(structure, rng);
        }
        
        // Spawn enemies if applicable
        if (structureType.hasEnemies) {
            this.spawnEnemies(structure, rng);
        }
        
        // Store structure
        this.structures.set(structure.id, structure);
        
        return structure;
    }
    
    // Simple seeded RNG
    createRNG(seed) {
        let s = seed;
        return function() {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };
    }
    
    // Generate structure blocks
    generateBlocks(structure, rng) {
        const type = structure.typeData;
        const [width, depth, height] = type.size;
        const palette = this.palettes[type.category] || this.palettes.village;
        
        // Simple procedural building generation
        // This is a simplified version - real implementation would have templates
        
        switch (structure.type) {
            case 'house_small':
            case 'house_medium':
                this.generateHouse(structure, palette, rng);
                break;
            case 'watchtower':
                this.generateTower(structure, palette, rng);
                break;
            case 'ruins':
                this.generateRuins(structure, palette, rng);
                break;
            case 'well':
                this.generateWell(structure, rng);
                break;
            case 'shrine':
                this.generateShrine(structure, rng);
                break;
            default:
                this.generateGenericBuilding(structure, palette, rng);
        }
    }
    
    // Generate a house
    generateHouse(structure, palette, rng) {
        const [width, depth, height] = structure.typeData.size;
        
        // Floor
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                this.addBlock(structure, x, y, 0, palette.floor);
            }
        }
        
        // Walls
        for (let z = 1; z < height - 1; z++) {
            for (let x = 0; x < width; x++) {
                // Front and back walls
                this.addBlock(structure, x, 0, z, palette.wall);
                this.addBlock(structure, x, depth - 1, z, palette.wall);
            }
            for (let y = 1; y < depth - 1; y++) {
                // Side walls
                this.addBlock(structure, 0, y, z, palette.wall);
                this.addBlock(structure, width - 1, y, z, palette.wall);
            }
        }
        
        // Door opening
        const doorX = Math.floor(width / 2);
        this.removeBlock(structure, doorX, 0, 1);
        this.removeBlock(structure, doorX, 0, 2);
        this.addBlock(structure, doorX, 0, 1, 'door');
        
        // Windows
        const windowZ = 2;
        this.addBlock(structure, 1, 0, windowZ, 'glass_pane');
        this.addBlock(structure, width - 2, 0, windowZ, 'glass_pane');
        
        // Simple roof
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                this.addBlock(structure, x, y, height - 1, palette.roof);
            }
        }
        
        // Interior items
        this.addBlock(structure, 1, 1, 1, 'crafting_table');
        this.addBlock(structure, width - 2, 1, 1, 'chest');
        this.addBlock(structure, 1, depth - 2, 1, 'bed');
    }
    
    // Generate a watchtower
    generateTower(structure, palette, rng) {
        const [width, depth, height] = structure.typeData.size;
        const radius = Math.floor(width / 2);
        
        // Build cylindrical tower
        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < depth; y++) {
                    const dx = x - radius;
                    const dy = y - radius;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist <= radius && dist >= radius - 1) {
                        this.addBlock(structure, x, y, z, palette.wall);
                    } else if (dist < radius - 1 && z === 0) {
                        this.addBlock(structure, x, y, z, palette.floor);
                    }
                }
            }
            
            // Floors every 4 blocks
            if (z > 0 && z % 4 === 0) {
                for (let x = 1; x < width - 1; x++) {
                    for (let y = 1; y < depth - 1; y++) {
                        const dx = x - radius;
                        const dy = y - radius;
                        if (Math.sqrt(dx * dx + dy * dy) < radius - 1) {
                            this.addBlock(structure, x, y, z, palette.floor);
                        }
                    }
                }
            }
        }
        
        // Ladder
        for (let z = 1; z < height - 1; z++) {
            this.addBlock(structure, radius, 1, z, 'ladder');
        }
        
        // Top platform
        for (let x = -1; x <= width; x++) {
            for (let y = -1; y <= depth; y++) {
                const dx = x - radius;
                const dy = y - radius;
                if (Math.sqrt(dx * dx + dy * dy) <= radius + 1) {
                    this.addBlock(structure, x, y, height - 1, palette.floor);
                }
            }
        }
    }
    
    // Generate ruins
    generateRuins(structure, palette, rng) {
        const [width, depth, height] = structure.typeData.size;
        
        // Scattered wall fragments
        for (let i = 0; i < 20; i++) {
            const x = Math.floor(rng() * width);
            const y = Math.floor(rng() * depth);
            const wallHeight = 1 + Math.floor(rng() * 3);
            
            for (let z = 0; z < wallHeight; z++) {
                if (rng() > 0.3) { // Broken look
                    this.addBlock(structure, x, y, z, 
                        rng() > 0.5 ? 'mossy_stone' : 'cracked_stone');
                }
            }
        }
        
        // Floor remnants
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                if (rng() > 0.6) {
                    this.addBlock(structure, x, y, 0, 
                        rng() > 0.5 ? 'stone' : 'mossy_cobblestone');
                }
            }
        }
        
        // Treasure chest hidden in ruins
        const chestX = Math.floor(width / 2);
        const chestY = Math.floor(depth / 2);
        this.addBlock(structure, chestX, chestY, 1, 'chest');
    }
    
    // Generate well
    generateWell(structure, rng) {
        const [width, depth, height] = structure.typeData.size;
        const cx = Math.floor(width / 2);
        const cy = Math.floor(depth / 2);
        
        // Stone ring
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist <= 2 && dist >= 1) {
                    this.addBlock(structure, x, y, 0, 'cobblestone');
                    this.addBlock(structure, x, y, 1, 'cobblestone');
                } else if (dist < 1) {
                    this.addBlock(structure, x, y, 0, 'water');
                }
            }
        }
        
        // Roof supports
        this.addBlock(structure, 0, cy, 0, 'oak_fence');
        this.addBlock(structure, 0, cy, 1, 'oak_fence');
        this.addBlock(structure, 0, cy, 2, 'oak_fence');
        this.addBlock(structure, width - 1, cy, 0, 'oak_fence');
        this.addBlock(structure, width - 1, cy, 1, 'oak_fence');
        this.addBlock(structure, width - 1, cy, 2, 'oak_fence');
        
        // Roof beam
        for (let x = 0; x < width; x++) {
            this.addBlock(structure, x, cy, height - 1, 'oak_slab');
        }
    }
    
    // Generate shrine
    generateShrine(structure, rng) {
        const [width, depth, height] = structure.typeData.size;
        const cx = Math.floor(width / 2);
        const cy = Math.floor(depth / 2);
        
        // Platform
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                this.addBlock(structure, x, y, 0, 'stone_brick');
            }
        }
        
        // Pillars
        this.addBlock(structure, 0, 0, 1, 'stone_pillar');
        this.addBlock(structure, 0, 0, 2, 'stone_pillar');
        this.addBlock(structure, width - 1, 0, 1, 'stone_pillar');
        this.addBlock(structure, width - 1, 0, 2, 'stone_pillar');
        this.addBlock(structure, 0, depth - 1, 1, 'stone_pillar');
        this.addBlock(structure, 0, depth - 1, 2, 'stone_pillar');
        this.addBlock(structure, width - 1, depth - 1, 1, 'stone_pillar');
        this.addBlock(structure, width - 1, depth - 1, 2, 'stone_pillar');
        
        // Altar
        this.addBlock(structure, cx, cy, 1, 'altar');
        this.addBlock(structure, cx, cy, 2, 'shrine_orb');
    }
    
    // Generate generic building
    generateGenericBuilding(structure, palette, rng) {
        const [width, depth, height] = structure.typeData.size;
        
        // Simple box building
        // Floor
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                this.addBlock(structure, x, y, 0, palette.floor);
            }
        }
        
        // Walls
        for (let z = 1; z < height; z++) {
            for (let x = 0; x < width; x++) {
                this.addBlock(structure, x, 0, z, palette.wall);
                this.addBlock(structure, x, depth - 1, z, palette.wall);
            }
            for (let y = 1; y < depth - 1; y++) {
                this.addBlock(structure, 0, y, z, palette.wall);
                this.addBlock(structure, width - 1, y, z, palette.wall);
            }
        }
        
        // Roof
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < depth; y++) {
                this.addBlock(structure, x, y, height, palette.roof);
            }
        }
    }
    
    // Add block to structure
    addBlock(structure, x, y, z, blockType) {
        structure.blocks.push({
            x: x,
            y: y,
            z: z,
            type: blockType
        });
    }
    
    // Remove block from structure
    removeBlock(structure, x, y, z) {
        structure.blocks = structure.blocks.filter(b => 
            !(b.x === x && b.y === y && b.z === z)
        );
    }
    
    // Place loot
    placeLoot(structure, rng) {
        const lootTables = {
            common: [
                { item: 'bread', weight: 30, amount: [1, 3] },
                { item: 'torch', weight: 25, amount: [2, 5] },
                { item: 'coal', weight: 20, amount: [3, 8] },
                { item: 'iron_nugget', weight: 15, amount: [1, 4] },
                { item: 'gold_nugget', weight: 10, amount: [1, 2] }
            ],
            uncommon: [
                { item: 'iron_ingot', weight: 25, amount: [1, 3] },
                { item: 'gold_ingot', weight: 15, amount: [1, 2] },
                { item: 'diamond', weight: 5, amount: [1, 1] },
                { item: 'enchanted_book', weight: 10, amount: [1, 1] },
                { item: 'potion', weight: 20, amount: [1, 2] }
            ],
            rare: [
                { item: 'diamond', weight: 20, amount: [1, 3] },
                { item: 'enchanted_weapon', weight: 10, amount: [1, 1] },
                { item: 'enchanted_armor', weight: 10, amount: [1, 1] },
                { item: 'ancient_artifact', weight: 5, amount: [1, 1] },
                { item: 'gold_ingot', weight: 30, amount: [2, 5] }
            ],
            legendary: [
                { item: 'diamond', weight: 30, amount: [3, 8] },
                { item: 'legendary_weapon', weight: 5, amount: [1, 1] },
                { item: 'legendary_armor', weight: 5, amount: [1, 1] },
                { item: 'ancient_relic', weight: 10, amount: [1, 1] },
                { item: 'dragon_scale', weight: 3, amount: [1, 2] }
            ]
        };
        
        const table = lootTables[structure.typeData.lootTier] || lootTables.common;
        
        // Find chest blocks and fill them
        const chests = structure.blocks.filter(b => b.type === 'chest');
        
        for (const chest of chests) {
            const itemCount = 2 + Math.floor(rng() * 4);
            const items = [];
            
            for (let i = 0; i < itemCount; i++) {
                const item = this.selectLoot(table, rng);
                if (item) items.push(item);
            }
            
            structure.loot.push({
                x: chest.x,
                y: chest.y,
                z: chest.z,
                items: items,
                opened: false
            });
        }
    }
    
    // Select loot from table
    selectLoot(table, rng) {
        const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
        let roll = rng() * totalWeight;
        
        for (const entry of table) {
            roll -= entry.weight;
            if (roll <= 0) {
                const amount = entry.amount[0] + 
                    Math.floor(rng() * (entry.amount[1] - entry.amount[0] + 1));
                return { id: entry.item, amount: amount };
            }
        }
        return null;
    }
    
    // Spawn NPCs
    spawnNPCs(structure, rng) {
        const npcType = structure.typeData.npcType || 'villager';
        
        structure.entities.push({
            type: 'npc',
            npcType: npcType,
            x: Math.floor(structure.typeData.size[0] / 2),
            y: Math.floor(structure.typeData.size[1] / 2),
            z: 1,
            spawned: false
        });
    }
    
    // Spawn enemies
    spawnEnemies(structure, rng) {
        const enemyType = structure.typeData.enemyType || 'zombie';
        const count = 2 + Math.floor(rng() * 4);
        
        for (let i = 0; i < count; i++) {
            structure.entities.push({
                type: 'enemy',
                enemyType: enemyType,
                x: 2 + Math.floor(rng() * (structure.typeData.size[0] - 4)),
                y: 2 + Math.floor(rng() * (structure.typeData.size[1] - 4)),
                z: 1,
                spawned: false
            });
        }
    }
    
    // Get structure at world position
    getStructureAt(worldX, worldY, worldZ) {
        for (const [id, structure] of this.structures) {
            const [width, depth, height] = structure.typeData.size;
            
            if (worldX >= structure.worldX && worldX < structure.worldX + width &&
                worldY >= structure.worldY && worldY < structure.worldY + depth &&
                worldZ >= structure.worldZ && worldZ < structure.worldZ + height) {
                return structure;
            }
        }
        return null;
    }
    
    // Apply structure to world
    applyToWorld(structureId) {
        const structure = this.structures.get(structureId);
        if (!structure || !this.game.world) return;
        
        for (const block of structure.blocks) {
            const worldX = structure.worldX + block.x;
            const worldY = structure.worldY + block.y;
            const worldZ = structure.worldZ + block.z;
            
            this.game.world.setBlock(worldX, worldY, worldZ, block.type);
        }
    }
    
    update(deltaTime) {
        // Check for player discovery of structures
        this.checkStructureDiscovery();
        
        // Update structure logic (NPC spawning, etc.)
        this.updateStructureEntities(deltaTime);
    }
    
    // Check if player discovers any structures
    checkStructureDiscovery() {
        const player = this.game.player;
        if (!player) return;
        
        for (const [id, structure] of this.structures) {
            if (structure.discovered) continue;
            
            const [width, depth] = structure.typeData.size;
            const centerX = structure.worldX + width / 2;
            const centerY = structure.worldY + depth / 2;
            
            const dist = Math.sqrt(
                (player.x - centerX) ** 2 + 
                (player.y - centerY) ** 2
            );
            
            // Discover when within range
            if (dist < 20) {
                this.discoverStructure(id);
            }
        }
    }
    
    // Mark structure as discovered and give rewards
    discoverStructure(structureId) {
        const structure = this.structures.get(structureId);
        if (!structure || structure.discovered) return;
        
        structure.discovered = true;
        
        // Show notification
        this.game.ui?.showNotification?.(`🏛️ Discovered: ${structure.typeData.name}`, 'success');
        
        // Grant XP reward
        const xpRewards = {
            common: 25,
            uncommon: 50,
            rare: 100,
            legendary: 250
        };
        const xp = xpRewards[structure.typeData.lootTier] || 10;
        this.game.player?.addXP?.(xp);
        
        // Add map marker
        if (this.game.mapMarkers) {
            this.game.mapMarkers.createMarker?.(
                structure.worldX,
                structure.worldY,
                structure.typeData.name,
                this.getStructureIcon(structure.type)
            );
        }
        
        // Trigger discovery achievement
        this.game.achievements?.checkProgress?.('structures_discovered', 1);
        
        // Special rewards for certain structures
        this.grantDiscoveryReward(structure);
    }
    
    // Grant special rewards for discovering structures
    grantDiscoveryReward(structure) {
        const player = this.game.player;
        if (!player) return;
        
        const rewards = {
            shrine: {
                buff: 'blessing',
                duration: 300,
                message: '✨ You receive a blessing from the shrine!'
            },
            ruins: {
                item: 'ancient_tablet',
                amount: 1,
                message: '📜 You found an ancient tablet!'
            },
            portal: {
                item: 'portal_stone',
                amount: 1,
                message: '🌀 You obtained a portal stone!'
            },
            pyramid: {
                item: 'ancient_crown',
                amount: 1,
                message: '👑 You discovered royal treasure!'
            },
            crashed_ship: {
                item: 'blueprint_airship',
                amount: 1,
                message: '📐 You found airship blueprints!'
            },
            ice_spire: {
                item: 'frost_crystal',
                amount: 3,
                message: '❄️ You gathered frost crystals!'
            }
        };
        
        const reward = rewards[structure.type];
        if (!reward) return;
        
        // Apply buff
        if (reward.buff) {
            this.game.statusEffects?.applyToPlayer?.(reward.buff, reward.duration);
        }
        
        // Give item
        if (reward.item) {
            player.addItem?.(reward.item, reward.amount);
        }
        
        // Show message
        if (reward.message) {
            this.game.ui?.showMessage?.(reward.message, 4000);
        }
        
        // Particles
        this.game.particles?.spawn?.(player.x, player.y, player.z + 1, {
            type: 'magic',
            count: 15,
            color: '#FFD700'
        });
    }
    
    // Get icon for structure type
    getStructureIcon(type) {
        const icons = {
            house_small: '🏠',
            house_medium: '🏠',
            blacksmith: '⚒️',
            church: '⛪',
            farm: '🌾',
            well: '🪣',
            watchtower: '🗼',
            ruins: '🏚️',
            shrine: '⛩️',
            camp: '⛺',
            pyramid: '🔺',
            oasis: '🌴',
            desert_temple: '🏛️',
            mountain_cabin: '🏔️',
            mine_entrance: '⛏️',
            ice_spire: '🧊',
            mushroom_grove: '🍄',
            portal: '🌀',
            crashed_ship: '🛸'
        };
        return icons[type] || '📍';
    }
    
    // Update entities in structures
    updateStructureEntities(deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        for (const [id, structure] of this.structures) {
            if (!structure.discovered) continue;
            
            const [width, depth] = structure.typeData.size;
            const dist = Math.sqrt(
                (player.x - (structure.worldX + width / 2)) ** 2 +
                (player.y - (structure.worldY + depth / 2)) ** 2
            );
            
            // Only update nearby structures
            if (dist > 50) continue;
            
            // Spawn entities if player is close enough
            if (dist < 30) {
                for (const entity of structure.entities) {
                    if (entity.spawned) continue;
                    
                    const worldX = structure.worldX + entity.x;
                    const worldY = structure.worldY + entity.y;
                    const worldZ = structure.worldZ + entity.z;
                    
                    if (entity.type === 'enemy') {
                        this.game.spawnEntity?.(entity.enemyType, worldX, worldY, worldZ);
                    } else if (entity.type === 'npc') {
                        this.game.spawnEntity?.(`npc_${entity.npcType}`, worldX, worldY, worldZ);
                    }
                    
                    entity.spawned = true;
                }
            }
        }
    }
    
    // Try to spawn a structure during world generation
    trySpawnStructureInChunk(chunkX, chunkY, biome) {
        // Check probability for each structure type
        for (const [type, data] of Object.entries(this.structureTypes)) {
            // Check biome compatibility
            if (data.biomes[0] !== 'any' && !data.biomes.includes(biome)) continue;
            
            // Roll for spawn
            if (Math.random() > data.rarity) continue;
            
            // Random position in chunk
            const x = chunkX * 16 + Math.floor(Math.random() * 8) + 4;
            const y = chunkY * 16 + Math.floor(Math.random() * 8) + 4;
            const z = this.game.world?.getHeight?.(x, y) || 10;
            
            return this.generateStructure(type, x, y, z, Math.floor(Math.random() * 4), Date.now());
        }
        
        return null;
    }
    
    // Reset system
    reset() {
        this.structures.clear();
    }
    
    // Serialize for saving
    serialize() {
        return {
            structures: Array.from(this.structures.entries())
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.structures) {
            this.structures = new Map(data.structures);
        }
    }
}
