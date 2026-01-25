import { CONFIG, BLOCKS, ENEMIES, BOSSES, BIOMES, BLOCK_DATA } from '../config.js';
import { Noise } from '../utils/math.js';
import { Enemy } from '../entities/enemy.js';

export class World {
    constructor(game) {
        this.game = game;
        this.chunks = new Map(); // Key: "x,y", Value: Chunk
        this.noise = new Noise();
        this.biomeNoise = new Noise();
        this.humidityNoise = new Noise();
        this.temperatureNoise = new Noise();
        
        // Different seeds for each noise
        this.biomeNoise.seed = Math.random();
        this.humidityNoise.seed = Math.random();
        this.temperatureNoise.seed = Math.random();
        
        this.timeOfDay = 0.5; // 0.0 to 1.0 (noon)
        this.timeSpeed = 1 / CONFIG.DAY_LENGTH; // Progress per second
        this.dayCount = 0;

        this.spawnTimer = 0;
        this.gravityTimer = 0;
        this.gravityBlocks = []; // Queue of blocks to check for gravity
    }

    update(deltaTime) {
        // Update time of day
        this.timeOfDay += this.timeSpeed * deltaTime;
        if (this.timeOfDay >= 1) {
            this.timeOfDay -= 1;
            this.dayCount++;
        }

        // Update chunks if needed (loading/unloading)
        this.updateChunks();

        // Block Gravity (sand, gravel falling)
        this.gravityTimer += deltaTime;
        if (this.gravityTimer >= 0.1) { // Every 100ms
            this.updateBlockGravity();
            this.gravityTimer = 0;
        }

        // Spawning
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawnEnemies();
            this.spawnTimer = 5;
        }

        // Random Ticks (Crop growth, etc)
        if (this.game.player) {
            for (let i = 0; i < 10; i++) {
                this.randomTick();
            }
        }
    }

    // Block Gravity System - makes sand and gravel fall
    updateBlockGravity() {
        if (!this.game.player) return;
        
        const px = Math.floor(this.game.player.x);
        const py = Math.floor(this.game.player.y);
        const range = 32;
        
        // Check random blocks around player for gravity
        for (let i = 0; i < 5; i++) {
            const x = px + Math.floor((Math.random() - 0.5) * range * 2);
            const y = py + Math.floor((Math.random() - 0.5) * range * 2);
            
            for (let z = CONFIG.WORLD_HEIGHT - 1; z > 0; z--) {
                const block = this.getBlock(x, y, z);
                const blockData = BLOCK_DATA[block];
                
                // Check if block has gravity
                if (blockData && blockData.gravity) {
                    const blockBelow = this.getBlock(x, y, z - 1);
                    const belowData = BLOCK_DATA[blockBelow];
                    
                    // Fall if block below is air or non-solid (water, etc)
                    if (blockBelow === BLOCKS.AIR || (belowData && !belowData.solid)) {
                        this.setBlock(x, y, z, BLOCKS.AIR);
                        this.setBlock(x, y, z - 1, block);
                        
                        // Play sound and particles
                        if (this.game.audio) {
                            this.game.audio.play('step');
                        }
                        if (this.game.particles) {
                            this.game.particles.spawn('dust', x, y, z - 1, 3);
                        }
                    }
                }
            }
        }
    }

    // Get biome at world position using temperature/humidity
    getBiomeAt(wx, wy) {
        const temp = (this.temperatureNoise.perlin2(wx * 0.008, wy * 0.008) + 1) / 2; // 0-1
        const humid = (this.humidityNoise.perlin2(wx * 0.008, wy * 0.008) + 1) / 2; // 0-1
        
        // Biome selection based on temperature and humidity
        if (temp < 0.25) {
            return BIOMES.SNOW; // Cold
        } else if (temp > 0.75 && humid < 0.3) {
            return BIOMES.DESERT; // Hot and dry
        } else if (temp > 0.6 && humid > 0.7) {
            return BIOMES.JUNGLE; // Hot and wet
        } else if (humid > 0.7 && temp > 0.3) {
            return BIOMES.SWAMP; // Wet
        } else if (temp > 0.6 && humid < 0.5) {
            return BIOMES.SAVANNA; // Warm and dry-ish
        } else {
            return BIOMES.PLAINS; // Default
        }
    }

    randomTick() {
        const px = Math.floor(this.game.player.x);
        const py = Math.floor(this.game.player.y);
        const range = 32;

        const x = px + Math.floor((Math.random() - 0.5) * range * 2);
        const y = py + Math.floor((Math.random() - 0.5) * range * 2);
        const z = this.getHeight(x, y);

        if (z < 0) return;

        const block = this.getBlock(x, y, z);
        const blockAbove = this.getBlock(x, y, z + 1);

        // Farmland Logic
        if (block === BLOCKS.FARMLAND) {
            if (blockAbove === BLOCKS.AIR && Math.random() < 0.01) {
                this.setBlock(x, y, z, BLOCKS.DIRT);
            }
        }
        
        // Water Flow Physics
        if (block === BLOCKS.WATER) {
            this.updateWaterFlow(x, y, z);
        }
        
        // Fire spread (campfires, torches can spread fire to adjacent flammable blocks)
        if (block === BLOCKS.CAMPFIRE || block === BLOCKS.TORCH) {
            this.trySpreadFire(x, y, z);
        }
    }
    
    // Simplified water flow - water spreads to adjacent lower blocks
    updateWaterFlow(x, y, z) {
        // Water flows down first
        const blockBelow = this.getBlock(x, y, z - 1);
        if (blockBelow === BLOCKS.AIR) {
            this.setBlock(x, y, z - 1, BLOCKS.WATER);
            return; // Water flowed down, no need to spread horizontally
        }
        
        // Then spreads horizontally to adjacent air blocks at same or lower level
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dx, dy] of dirs) {
            const adjBlock = this.getBlock(x + dx, y + dy, z);
            if (adjBlock === BLOCKS.AIR) {
                // Only spread if there's support below
                const adjBelow = this.getBlock(x + dx, y + dy, z - 1);
                if (adjBelow !== BLOCKS.AIR && adjBelow !== BLOCKS.WATER) {
                    // 10% chance to spread per tick
                    if (Math.random() < 0.1) {
                        this.setBlock(x + dx, y + dy, z, BLOCKS.WATER);
                        if (this.game.particles) {
                            this.game.particles.spawn('water', x + dx, y + dy, z, 2);
                        }
                    }
                }
            }
        }
    }
    
    // Fire spread mechanics
    trySpreadFire(x, y, z) {
        // Small chance to spread fire to adjacent flammable blocks
        if (Math.random() > 0.002) return; // Very rare
        
        const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]];
        for (const [dx, dy, dz] of dirs) {
            const adjBlock = this.getBlock(x + dx, y + dy, z + dz);
            const adjData = BLOCK_DATA[adjBlock];
            
            if (adjData && adjData.flammable) {
                // Destroy the flammable block
                this.setBlock(x + dx, y + dy, z + dz, BLOCKS.AIR);
                if (this.game.particles) {
                    this.game.particles.spawn('fire', x + dx, y + dy, z + dz, 10);
                }
                if (this.game.audio) {
                    this.game.audio.play('fire');
                }
                break; // Only burn one block per tick
            }
        }
    }

    spawnEnemies() {
        if (!this.game.player) return;

        // Cap max enemies
        const currentEnemies = this.game.entities.filter(e => e instanceof Enemy).length;
        if (currentEnemies >= 15) return;

        // Try to spawn one
        const px = this.game.player.x;
        const py = this.game.player.y;

        // Random pos around player
        const dist = 20 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const x = px + Math.cos(angle) * dist;
        const y = py + Math.sin(angle) * dist;
        const wx = Math.floor(x);
        const wy = Math.floor(y);

        const z = this.getHeight(wx, wy);
        if (z <= 0) return; // Invalid position

        // Check Time/Conditions
        const isNight = this.timeOfDay < CONFIG.DAWN_START || this.timeOfDay > CONFIG.DUSK_START;
        
        // Get biome at spawn location
        const biome = this.getBiomeAt(wx, wy);
        
        // Check for boss spawn conditions
        if (this.dayCount >= 10 && Math.random() < 0.02) {
            this.trySpawnBoss(x, y, z + 1);
            return;
        }
        
        // Get biome-appropriate enemies
        let validTypes = [];
        if (biome && biome.enemies) {
            for (const enemyType of biome.enemies) {
                if (ENEMIES[enemyType]) {
                    const stats = ENEMIES[enemyType];
                    // Check time conditions
                    if (stats.nightOnly && !isNight) continue;
                    // Check water conditions
                    if (stats.waterOnly) {
                        const blockAtSpawn = this.getBlock(wx, wy, z);
                        if (blockAtSpawn !== BLOCKS.WATER) continue;
                    }
                    validTypes.push(enemyType);
                }
            }
        }
        
        // Fallback to random enemy if no biome enemies
        if (validTypes.length === 0) {
            validTypes = Object.keys(ENEMIES).filter(type => {
                const stats = ENEMIES[type];
                if (stats.nightOnly && !isNight) return false;
                if (stats.waterOnly || stats.caveOnly) return false;
                return true;
            });
        }
        
        if (validTypes.length === 0) return;

        const type = validTypes[Math.floor(Math.random() * validTypes.length)];
        const stats = ENEMIES[type];

        const enemy = new Enemy(this.game, x, y, z + 1, type);
        this.game.entities.push(enemy);
        
        // Pack animals spawn in groups
        if (stats.packAnimal && Math.random() < 0.5) {
            for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
                const packX = x + (Math.random() - 0.5) * 6;
                const packY = y + (Math.random() - 0.5) * 6;
                const packZ = this.getHeight(Math.floor(packX), Math.floor(packY));
                if (packZ > 0) {
                    const packEnemy = new Enemy(this.game, packX, packY, packZ + 1, type);
                    this.game.entities.push(packEnemy);
                }
            }
        }
    }
    
    trySpawnBoss(x, y, z) {
        const isNight = this.timeOfDay < CONFIG.DAWN_START || this.timeOfDay > CONFIG.DUSK_START;
        
        // Determine which boss can spawn
        const validBosses = [];
        
        for (const [bossType, bossData] of Object.entries(BOSSES)) {
            if (bossData.spawnCondition === 'day_10' && this.dayCount >= 10) {
                validBosses.push(bossType);
            }
            if (bossData.spawnCondition === 'night' && isNight) {
                validBosses.push(bossType);
            }
            if (bossData.spawnCondition === 'cave_depth_10') {
                // Check if we're underground
                const height = this.getHeight(Math.floor(x), Math.floor(y));
                if (z < height - 10) {
                    validBosses.push(bossType);
                }
            }
        }
        
        if (validBosses.length === 0) return;
        
        const bossType = validBosses[Math.floor(Math.random() * validBosses.length)];
        const boss = new Enemy(this.game, x, y, z, bossType, true); // true = isBoss
        this.game.entities.push(boss);
        
        // Announce boss spawn
        if (this.game.ui) {
            this.game.ui.showMessage(`⚠️ ${BOSSES[bossType].name} has appeared!`, 5000);
        }
        if (this.game.audio) {
            this.game.audio.play('boss_spawn');
        }
    }

    updateChunks() {
        if (!this.game.player) return;

        const playerChunkX = Math.floor(this.game.player.x / CONFIG.CHUNK_SIZE);
        const playerChunkY = Math.floor(this.game.player.y / CONFIG.CHUNK_SIZE);
        const renderDist = CONFIG.RENDER_DISTANCE;

        // Load chunks
        for (let x = playerChunkX - renderDist; x <= playerChunkX + renderDist; x++) {
            for (let y = playerChunkY - renderDist; y <= playerChunkY + renderDist; y++) {
                if (!this.getChunk(x, y)) {
                    this.generateChunk(x, y);
                }
            }
        }

        // Optional: Unload far chunks to save memory
    }

    getChunk(x, y) {
        return this.chunks.get(`${x},${y}`);
    }

    // Move getBiome helper to class method if needed, but simple inline for now

    generateChunk(cx, cy) {
        const chunk = {
            width: CONFIG.CHUNK_SIZE,
            height: CONFIG.WORLD_HEIGHT,
            blocks: new Uint8Array(CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE * CONFIG.WORLD_HEIGHT),
            getBlock: function (x, y, z) {
                if (x < 0 || x >= this.width || y < 0 || y >= this.width || z < 0 || z >= this.height) return BLOCKS.AIR;
                return this.blocks[x + y * this.width + z * this.width * this.width];
            },
            setBlock: function (x, y, z, id) {
                if (x < 0 || x >= this.width || y < 0 || y >= this.width || z < 0 || z >= this.height) return;
                this.blocks[x + y * this.width + z * this.width * this.width] = id;
            }
        };

        const trees = [];
        const structures = [];

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let y = 0; y < CONFIG.CHUNK_SIZE; y++) {
                const wx = cx * CONFIG.CHUNK_SIZE + x;
                const wy = cy * CONFIG.CHUNK_SIZE + y;

                // Height Noise with multiple octaves for varied terrain
                let n = this.noise.perlin2(wx * 0.05, wy * 0.05);
                n += this.noise.perlin2(wx * 0.1, wy * 0.1) * 0.5;
                n += this.noise.perlin2(wx * 0.02, wy * 0.02) * 2;
                n /= 3.5;
                
                let height = Math.floor(n * 12 + 15);

                // Get biome using temperature/humidity
                const biome = this.getBiomeAt(wx, wy);
                const biomeName = biome ? biome.name : 'Plains';

                // Biome-specific height modifications
                if (biome === BIOMES.DESERT) {
                    height = Math.floor(height * 0.7 + 5); // Flatter deserts
                } else if (biome === BIOMES.SWAMP) {
                    height = Math.min(height, CONFIG.SEA_LEVEL + 2); // Swamps are low
                } else if (biome === BIOMES.JUNGLE) {
                    height = Math.floor(height * 1.1); // Slightly hillier
                }

                // Floor limit
                height = Math.max(1, Math.min(height, CONFIG.WORLD_HEIGHT - 5));

                for (let z = 0; z < CONFIG.WORLD_HEIGHT; z++) {
                    let block = BLOCKS.AIR;
                    
                    if (z === 0) {
                        block = BLOCKS.BEDROCK;
                    } else if (z < height) {
                        block = BLOCKS.STONE;
                        
                        // Sub-surface layers based on biome
                        if (z >= height - 3) {
                            block = biome === BIOMES.SWAMP ? BLOCKS.CLAY : BLOCKS.DIRT;
                        }
                        
                        // Ore generation
                        if (z >= height - 8 && z < height - 2) {
                            const oreNoise = this.noise.perlin3(wx * 0.15, wy * 0.15, z * 0.15);
                            if (oreNoise > 0.6) block = BLOCKS.COAL_ORE;
                        }
                        if (z >= 5 && z < height - 6) {
                            const oreNoise = this.noise.perlin3(wx * 0.12, wy * 0.12, z * 0.12);
                            if (oreNoise > 0.7) block = BLOCKS.IRON_ORE;
                        }
                        // Gold deeper
                        if (z >= 3 && z < height - 10) {
                            const oreNoise = this.noise.perlin3(wx * 0.1, wy * 0.1, z * 0.1);
                            if (oreNoise > 0.75) block = BLOCKS.GOLD_ORE;
                        }
                        // Diamonds very deep
                        if (z >= 1 && z < 12) {
                            const oreNoise = this.noise.perlin3(wx * 0.08, wy * 0.08, z * 0.08);
                            if (oreNoise > 0.82) block = BLOCKS.DIAMOND_ORE;
                        }
                        
                        // Gravel pockets
                        if (z >= height - 6 && z < height - 2) {
                            const gravelNoise = this.noise.perlin3(wx * 0.2, wy * 0.2, z * 0.2);
                            if (gravelNoise > 0.65) block = BLOCKS.GRAVEL;
                        }
                        
                        // Cave generation
                        const caveNoise = this.noise.perlin3(wx * 0.08, wy * 0.08, z * 0.1);
                        if (caveNoise > 0.55 && z > 3 && z < height - 2) {
                            block = BLOCKS.AIR;
                        }
                        
                    } else if (z === height) {
                        // Surface block based on biome
                        if (biome === BIOMES.DESERT) {
                            block = BLOCKS.SAND;
                        } else if (biome === BIOMES.SNOW) {
                            block = BLOCKS.SNOW;
                        } else if (biome === BIOMES.SWAMP) {
                            block = Math.random() < 0.3 ? BLOCKS.CLAY : BLOCKS.GRASS;
                        } else {
                            block = BLOCKS.GRASS;
                        }
                    } else if (z > height && z <= CONFIG.SEA_LEVEL) {
                        // Water
                        block = BLOCKS.WATER;
                        if (biome === BIOMES.SNOW && z === CONFIG.SEA_LEVEL) {
                            block = BLOCKS.ICE;
                        }
                    }

                    // Desert sand depth
                    if (z < height && z >= height - 3 && biome === BIOMES.DESERT) {
                        block = BLOCKS.SAND;
                    }

                    chunk.setBlock(x, y, z, block);
                }
                
                // Tree generation based on biome
                const treeChance = biome ? (biome.treeChance || 0.005) : 0.005;
                if (Math.random() < treeChance && height > CONFIG.SEA_LEVEL && biome !== BIOMES.DESERT) {
                    trees.push({ x, y, height, biome });
                }
                
                // Grass/Vegetation based on biome
                const grassChance = biome ? (biome.grassChance || 0.01) : 0.01;
                if (Math.random() < grassChance && height > CONFIG.SEA_LEVEL) {
                    chunk.setBlock(x, y, height + 1, BLOCKS.WHEAT_CROP);
                }
                
                // Cactus in desert
                if (biome === BIOMES.DESERT && Math.random() < 0.005 && height > CONFIG.SEA_LEVEL) {
                    const cactusHeight = 1 + Math.floor(Math.random() * 2);
                    for (let cz = 1; cz <= cactusHeight; cz++) {
                        chunk.setBlock(x, y, height + cz, BLOCKS.CACTUS);
                    }
                }
                
                // Jungle vines
                if (biome === BIOMES.JUNGLE && Math.random() < 0.01 && height > CONFIG.SEA_LEVEL) {
                    if (BLOCKS.VINES) {
                        chunk.setBlock(x, y, height + 1, BLOCKS.VINES);
                    }
                }
                
                // Structure generation (rare)
                if (Math.random() < 0.0005 && height > CONFIG.SEA_LEVEL) {
                    structures.push({ x, y, height, type: 'shelter' });
                }
            }
        }

        // Generate trees
        for (const tree of trees) {
            this.generateTree(chunk, tree.x, tree.y, tree.height, tree.biome);
        }
        
        // Generate structures
        for (const structure of structures) {
            this.generateStructure(chunk, structure.x, structure.y, structure.height, structure.type);
        }

        this.chunks.set(`${cx},${cy}`, chunk);
        return chunk;
    }
    
    // Generate prehistoric structures
    generateStructure(chunk, x, y, groundHeight, type) {
        if (type === 'shelter') {
            // Simple cave shelter with stone walls
            const width = 3;
            const height = 3;
            
            // Only generate if we have space
            if (x + width >= CONFIG.CHUNK_SIZE || y + width >= CONFIG.CHUNK_SIZE) return;
            
            // Floor
            for (let dx = 0; dx < width; dx++) {
                for (let dy = 0; dy < width; dy++) {
                    chunk.setBlock(x + dx, y + dy, groundHeight, BLOCKS.STONE_BRICKS || BLOCKS.COBBLESTONE);
                }
            }
            
            // Walls
            for (let dz = 1; dz <= height; dz++) {
                for (let dx = 0; dx < width; dx++) {
                    chunk.setBlock(x + dx, y, groundHeight + dz, BLOCKS.COBBLESTONE);
                    chunk.setBlock(x + dx, y + width - 1, groundHeight + dz, BLOCKS.COBBLESTONE);
                }
                for (let dy = 1; dy < width - 1; dy++) {
                    chunk.setBlock(x, y + dy, groundHeight + dz, BLOCKS.COBBLESTONE);
                    chunk.setBlock(x + width - 1, y + dy, groundHeight + dz, BLOCKS.COBBLESTONE);
                }
            }
            
            // Door opening
            chunk.setBlock(x + 1, y, groundHeight + 1, BLOCKS.AIR);
            chunk.setBlock(x + 1, y, groundHeight + 2, BLOCKS.AIR);
            
            // Maybe a chest or campfire inside
            if (Math.random() < 0.5) {
                chunk.setBlock(x + 1, y + 1, groundHeight + 1, BLOCKS.CAMPFIRE || BLOCKS.TORCH);
            }
        }
    }

    generateTree(chunk, x, y, groundHeight, biome) {
        // Tree parameters based on biome object
        const isSnow = biome === BIOMES.SNOW;
        const isJungle = biome === BIOMES.JUNGLE;
        
        let trunkHeight, leafRadius, leafStart;
        
        if (isSnow) {
            trunkHeight = 4 + Math.floor(Math.random() * 2);
            leafRadius = 1;
            leafStart = trunkHeight - 2;
        } else if (isJungle) {
            trunkHeight = 6 + Math.floor(Math.random() * 4); // Tall jungle trees
            leafRadius = 3;
            leafStart = trunkHeight - 3;
        } else {
            trunkHeight = 3 + Math.floor(Math.random() * 3);
            leafRadius = 2;
            leafStart = trunkHeight - 2;
        }

        // Generate trunk
        for (let z = 1; z <= trunkHeight; z++) {
            chunk.setBlock(x, y, groundHeight + z, BLOCKS.WOOD);
        }

        // Generate leaves (sphere-ish canopy)
        for (let lz = leafStart; lz <= trunkHeight + 1; lz++) {
            const layerRadius = lz === trunkHeight + 1 ? leafRadius - 1 : leafRadius;
            for (let lx = -layerRadius; lx <= layerRadius; lx++) {
                for (let ly = -layerRadius; ly <= layerRadius; ly++) {
                    // Skip corners for more natural shape
                    if (Math.abs(lx) === layerRadius && Math.abs(ly) === layerRadius) continue;
                    // Skip trunk position except for top
                    if (lx === 0 && ly === 0 && lz < trunkHeight) continue;
                    
                    const leafX = x + lx;
                    const leafY = y + ly;
                    const leafZ = groundHeight + lz;
                    
                    // Only place if within chunk bounds and position is air
                    if (leafX >= 0 && leafX < CONFIG.CHUNK_SIZE && 
                        leafY >= 0 && leafY < CONFIG.CHUNK_SIZE &&
                        leafZ < CONFIG.WORLD_HEIGHT) {
                        if (chunk.getBlock(leafX, leafY, leafZ) === BLOCKS.AIR) {
                            chunk.setBlock(leafX, leafY, leafZ, BLOCKS.LEAVES);
                        }
                    }
                }
            }
        }
    }

    getBlock(x, y, z) {
        // Check bounds
        if (z < 0 || z >= CONFIG.WORLD_HEIGHT) return BLOCKS.AIR;

        const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
        const cy = Math.floor(y / CONFIG.CHUNK_SIZE);
        const lx = Math.floor(x % CONFIG.CHUNK_SIZE);
        const ly = Math.floor(y % CONFIG.CHUNK_SIZE);

        // Handle negative coordinates for local block index
        const actualLx = lx < 0 ? lx + CONFIG.CHUNK_SIZE : lx;
        const actualLy = ly < 0 ? ly + CONFIG.CHUNK_SIZE : ly;

        const chunk = this.getChunk(cx, cy);
        return chunk ? chunk.getBlock(actualLx, actualLy, z) : BLOCKS.AIR;
    }

    setBlock(x, y, z, blockId) {
        if (z < 0 || z >= CONFIG.WORLD_HEIGHT) return;

        const cx = Math.floor(x / CONFIG.CHUNK_SIZE);
        const cy = Math.floor(y / CONFIG.CHUNK_SIZE);
        const lx = Math.floor(x % CONFIG.CHUNK_SIZE);
        const ly = Math.floor(y % CONFIG.CHUNK_SIZE);

        const actualLx = lx < 0 ? lx + CONFIG.CHUNK_SIZE : lx;
        const actualLy = ly < 0 ? ly + CONFIG.CHUNK_SIZE : ly;

        const chunk = this.getChunk(cx, cy);
        if (chunk) {
            chunk.setBlock(actualLx, actualLy, z, blockId);
        }
    }

    // Helper to get highest SOLID block at x,y
    getHeight(x, y) {
        for (let z = CONFIG.WORLD_HEIGHT - 1; z >= 0; z--) {
            const block = this.getBlock(x, y, z);
            const data = BLOCK_DATA[block];
            // Return first solid block (not water, not air)
            if (block !== BLOCKS.AIR && data && data.solid) {
                return z;
            }
        }
        return 0;
    }
}

class Chunk {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // 3D array flattened or just nested arrays. Let's use nested for simplicity for now
        // [x][y][z]
        this.blocks = new Array(CONFIG.CHUNK_SIZE).fill(0).map(() =>
            new Array(CONFIG.CHUNK_SIZE).fill(0).map(() =>
                new Array(CONFIG.WORLD_HEIGHT).fill(BLOCKS.AIR)
            )
        );
    }

    getBlock(x, y, z) {
        if (x >= 0 && x < CONFIG.CHUNK_SIZE && y >= 0 && y < CONFIG.CHUNK_SIZE && z >= 0 && z < CONFIG.WORLD_HEIGHT) {
            return this.blocks[x][y][z];
        }
        return BLOCKS.AIR;
    }

    setBlock(x, y, z, id) {
        if (x >= 0 && x < CONFIG.CHUNK_SIZE && y >= 0 && y < CONFIG.CHUNK_SIZE && z >= 0 && z < CONFIG.WORLD_HEIGHT) {
            this.blocks[x][y][z] = id;
        }
    }
}
