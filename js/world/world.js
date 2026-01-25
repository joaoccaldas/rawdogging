import { CONFIG, BLOCKS, ENEMIES, BLOCK_DATA } from '../config.js';
import { Noise } from '../utils/math.js';
import { Enemy } from '../entities/enemy.js';

export class World {
    constructor(game) {
        this.game = game;
        this.chunks = new Map(); // Key: "x,y", Value: Chunk
        this.noise = new Noise();
        this.biomeNoise = new Noise();
        this.biomeNoise.seed = Math.random(); // Different seed
        this.timeOfDay = 0.5; // 0.0 to 1.0 (noon)
        this.timeSpeed = 1 / CONFIG.DAY_LENGTH; // Progress per second

        this.spawnTimer = 0;
    }

    update(deltaTime) {
        // Update time of day
        this.timeOfDay += this.timeSpeed * deltaTime;
        if (this.timeOfDay >= 1) {
            this.timeOfDay -= 1;
        }

        // Update chunks if needed (loading/unloading)
        this.updateChunks();

        // Spawning
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawnEnemies();
            this.spawnTimer = 5;
        }

        // Random Ticks (Crop growth, etc)
        // Simulate random ticks
        // For performance, just pick N random blocks near player?
        // Minecraft does 3 blocks per subchunk per tick.
        // Let's do 10 random blocks around player per frame for now.
        if (this.game.player) {
            for (let i = 0; i < 10; i++) {
                this.randomTick();
            }
        }
    }

    randomTick() {
        const px = Math.floor(this.game.player.x);
        const py = Math.floor(this.game.player.y);
        const range = 32;

        const x = px + Math.floor((Math.random() - 0.5) * range * 2);
        const y = py + Math.floor((Math.random() - 0.5) * range * 2);
        const z = this.getHeight(x, y); // Optimization: only check surface for crops usually

        // Actually need to check specific block at z+1 for crops
        // Let's just pick a random Z too? No, mostly surface.
        // Let's check block at surface.

        if (z < 0) return;

        const block = this.getBlock(x, y, z);
        const blockAbove = this.getBlock(x, y, z + 1);

        // Farmland Logic
        if (block === BLOCKS.FARMLAND) {
            // Check hydration (water nearby?)
            // Simplified: Randomly turn back to dirt if nothing above
            if (blockAbove === BLOCKS.AIR && Math.random() < 0.01) {
                this.setBlock(x, y, z, BLOCKS.DIRT);
            }
        }

        // Crop Growth
        if (blockAbove === BLOCKS.WHEAT_CROP) {
            // Grow?
            // Not implemented stages yet. 
            // Let's just say drops wheat.
            // We need metadata for growth stages. 
            // Prototype: "Grow" = spawn drop? No.
            // Prototype: Wheat block has explicit stages? 
            // Let's omit visual stages for now and just have "Mature" wheat.
            // Maybe wait for "Bonemeal" logic purely or simple timer.
            // Actually, let's skip complex growth stages and just assume placed seeds = wheat instantly or timer based entity.
            // Better: Wheat is an Entity that grows? No, too many entities.
            // Correct way: Metadata in chunks.
            // For this prototype: Placed seeds = small yellow block. 
            // Wait... we don't have block data/metadata support in getBlock/setBlock (just ID).
            // Hack: Different block IDs for stages? WHEAT_STAGE_0, WHEAT_STAGE_7?
            // Too complex for 2 mins.
            // COMPROMISE: Placed seeds (WHEAT_CROP) is the final stage. Breaking it drops Wheat + Seeds.
            // So no growth logic needed yet, just breaking logic.
        }
    }

    spawnEnemies() {
        if (!this.game.player) return;

        // Cap max enemies
        const currentEnemies = this.game.entities.filter(e => e instanceof Enemy).length;
        if (currentEnemies >= 10) return; // Hard limit for now

        // Try to spawn one
        const px = this.game.player.x;
        const py = this.game.player.y;

        // Random pos around player
        const dist = 20 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const x = px + Math.cos(angle) * dist;
        const y = py + Math.sin(angle) * dist;

        const z = this.getHeight(Math.floor(x), Math.floor(y));
        if (z <= 0) return; // Invalid position

        // Check Time/Conditions
        const isNight = this.timeOfDay < CONFIG.DAWN_START || this.timeOfDay > CONFIG.DUSK_START;

        // Select type
        const types = Object.keys(ENEMIES);
        const type = types[Math.floor(Math.random() * types.length)];
        const stats = ENEMIES[type];

        if (stats.nightOnly && !isNight) return;

        const enemy = new Enemy(this.game, x, y, z + 1, type);
        this.game.entities.push(enemy);
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

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let y = 0; y < CONFIG.CHUNK_SIZE; y++) {
                const wx = cx * CONFIG.CHUNK_SIZE + x;
                const wy = cy * CONFIG.CHUNK_SIZE + y;

                // Height Noise
                let n = this.noise.perlin2(wx * 0.05, wy * 0.05);
                let height = Math.floor(n * 10 + 15);

                // Biome Noise
                // Low = Desert, Mid = Plains/Forest, High = Snow
                let biomeVal = this.biomeNoise.perlin2(wx * 0.01, wy * 0.01);

                let biome = 'PLAINS';
                if (biomeVal < -0.3) biome = 'DESERT';
                if (biomeVal > 0.4) biome = 'SNOW';

                // Flatten height for desert/water
                if (biome === 'DESERT') height = Math.floor(height * 0.8 + 2);

                // Floor limit
                height = Math.max(1, Math.min(height, CONFIG.WORLD_HEIGHT - 5));

                for (let z = 0; z < CONFIG.WORLD_HEIGHT; z++) {
                    let block = BLOCKS.AIR;
                    if (z === 0) block = BLOCKS.BEDROCK;
                    else if (z < height) {
                        block = BLOCKS.STONE;
                        if (z >= height - 3) block = BLOCKS.DIRT;
                        
                        // Stone Age specific: Ore generation
                        // Coal near surface
                        if (z >= height - 8 && z < height - 2) {
                            const oreNoise = this.noise.perlin3(wx * 0.15, wy * 0.15, z * 0.15);
                            if (oreNoise > 0.6) block = BLOCKS.COAL_ORE;
                        }
                        // Iron deeper
                        if (z >= 5 && z < height - 6) {
                            const oreNoise = this.noise.perlin3(wx * 0.12, wy * 0.12, z * 0.12);
                            if (oreNoise > 0.7) block = BLOCKS.IRON_ORE;
                        }
                        // Gravel pockets (for flint)
                        if (z >= height - 6 && z < height - 2) {
                            const gravelNoise = this.noise.perlin3(wx * 0.2, wy * 0.2, z * 0.2);
                            if (gravelNoise > 0.65) block = BLOCKS.GRAVEL;
                        }
                        
                        // Cave generation for prehistoric shelters
                        const caveNoise = this.noise.perlin3(wx * 0.08, wy * 0.08, z * 0.1);
                        if (caveNoise > 0.55 && z > 3 && z < height - 2) {
                            block = BLOCKS.AIR;
                        }
                    } else if (z === height) {
                        // Top block based on biome
                        if (biome === 'DESERT') {
                            block = BLOCKS.SAND;
                            // Sand depth
                            if (this.chunk && chunk.setBlock) { // We can't reach back easily, so just logic here
                                // Actually we iterate up, so just set what we are.
                            }
                        } else if (biome === 'SNOW') {
                            block = BLOCKS.SNOW;
                        } else {
                            block = BLOCKS.GRASS;
                        }
                    } else if (z > height && z <= CONFIG.SEA_LEVEL) {
                        // Water overrides biome?
                        // Desert water = oasis?
                        block = BLOCKS.WATER;
                        if (biome === 'SNOW' && z === CONFIG.SEA_LEVEL) block = BLOCKS.ICE;
                    }

                    // Fix: If sand on top, make dirt below sand
                    if (z < height && z >= height - 3 && biome === 'DESERT') block = BLOCKS.SAND;

                    chunk.setBlock(x, y, z, block);
                }
                
                // Queue trees for generation - REDUCED for clearer prehistoric landscape
                // Only 0.5% chance instead of 1.5% for sparser forests
                if (Math.random() < 0.005 && height > CONFIG.SEA_LEVEL && biome !== 'DESERT') {
                    trees.push({ x, y, height, biome });
                }
                
                // Tall grass/ferns for prehistoric feel (non-blocking decoration)
                if (Math.random() < 0.02 && height > CONFIG.SEA_LEVEL && biome === 'PLAINS') {
                    // Just spawn wild grain as decoration (already non-solid)
                    chunk.setBlock(x, y, height + 1, BLOCKS.WHEAT_CROP);
                }
                
                // Cactus in desert - also reduced
                if (biome === 'DESERT' && Math.random() < 0.005 && height > CONFIG.SEA_LEVEL) {
                    const cactusHeight = 1 + Math.floor(Math.random() * 2);
                    for (let cz = 1; cz <= cactusHeight; cz++) {
                        chunk.setBlock(x, y, height + cz, BLOCKS.CACTUS);
                    }
                }
            }
        }

        // Generate trees (after terrain so we can check neighbors)
        for (const tree of trees) {
            this.generateTree(chunk, tree.x, tree.y, tree.height, tree.biome);
        }

        this.chunks.set(`${cx},${cy}`, chunk);
        return chunk;
    }

    generateTree(chunk, x, y, groundHeight, biome) {
        // Tree parameters based on biome
        const trunkHeight = biome === 'SNOW' ? 4 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
        const leafRadius = biome === 'SNOW' ? 1 : 2;
        const leafStart = trunkHeight - 2;

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
