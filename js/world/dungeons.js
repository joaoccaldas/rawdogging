// Procedural Dungeon Generation System
// Creates explorable underground dungeons with rooms, corridors, and loot

export class DungeonSystem {
    constructor(game) {
        this.game = game;
        
        // Active dungeons in world
        this.dungeons = new Map();
        
        // Dungeon portals in the world
        this.portals = new Map();
        
        // Player dungeon state
        this.playerInDungeon = false;
        this.currentDungeonId = null;
        this.dungeonEntrancePosition = null;
        
        // Portal spawn settings
        this.portalSpawnChance = 0.15; // Per chunk
        this.maxPortalsPerBiome = 3;
        
        // Dungeon types
        this.dungeonTypes = {
            cave: {
                name: 'Cave System',
                minRooms: 5,
                maxRooms: 12,
                enemyTypes: ['bat', 'spider', 'skeleton'],
                lootTable: 'cave',
                ambiance: 'underground',
                bossChance: 0.2
            },
            mine: {
                name: 'Abandoned Mine',
                minRooms: 8,
                maxRooms: 20,
                enemyTypes: ['zombie', 'skeleton', 'spider'],
                lootTable: 'mine',
                ambiance: 'creepy',
                bossChance: 0.3,
                hasRails: true
            },
            crypt: {
                name: 'Ancient Crypt',
                minRooms: 6,
                maxRooms: 15,
                enemyTypes: ['skeleton', 'ghost', 'zombie'],
                lootTable: 'crypt',
                ambiance: 'spooky',
                bossChance: 0.5,
                hasTombs: true
            },
            fortress: {
                name: 'Underground Fortress',
                minRooms: 10,
                maxRooms: 25,
                enemyTypes: ['skeleton_knight', 'dark_mage', 'golem'],
                lootTable: 'fortress',
                ambiance: 'echo',
                bossChance: 0.7,
                hasTraps: true
            },
            temple: {
                name: 'Lost Temple',
                minRooms: 8,
                maxRooms: 18,
                enemyTypes: ['guardian', 'cultist', 'demon'],
                lootTable: 'temple',
                ambiance: 'mystical',
                bossChance: 0.8,
                hasPuzzles: true
            }
        };
        
        // Room types
        this.roomTypes = {
            entrance: { weight: 0, size: [5, 8], spawners: 0 },
            corridor: { weight: 30, size: [3, 12], spawners: 0 },
            small: { weight: 25, size: [5, 8], spawners: 1 },
            medium: { weight: 20, size: [8, 12], spawners: 2 },
            large: { weight: 10, size: [12, 16], spawners: 3 },
            treasure: { weight: 8, size: [6, 10], spawners: 1, hasTreasure: true },
            boss: { weight: 0, size: [15, 20], spawners: 0, hasBoss: true },
            trap: { weight: 5, size: [6, 10], spawners: 0, hasTraps: true },
            puzzle: { weight: 2, size: [8, 12], spawners: 0, hasPuzzle: true }
        };
        
        // Loot tables
        this.lootTables = {
            cave: [
                { item: 'coal', weight: 30, amount: [2, 8] },
                { item: 'iron_ore', weight: 20, amount: [1, 4] },
                { item: 'gold_nugget', weight: 10, amount: [1, 3] },
                { item: 'torch', weight: 25, amount: [2, 6] },
                { item: 'rope', weight: 10, amount: [1, 2] },
                { item: 'diamond', weight: 5, amount: [1, 1] }
            ],
            mine: [
                { item: 'iron_ore', weight: 25, amount: [2, 6] },
                { item: 'gold_ore', weight: 15, amount: [1, 3] },
                { item: 'diamond', weight: 8, amount: [1, 2] },
                { item: 'minecart', weight: 5, amount: [1, 1] },
                { item: 'tnt', weight: 10, amount: [1, 3] },
                { item: 'lantern', weight: 15, amount: [1, 2] }
            ],
            crypt: [
                { item: 'gold_coin', weight: 30, amount: [5, 20] },
                { item: 'ancient_bone', weight: 20, amount: [1, 4] },
                { item: 'enchanted_book', weight: 10, amount: [1, 1] },
                { item: 'soul_gem', weight: 5, amount: [1, 1] },
                { item: 'cursed_amulet', weight: 8, amount: [1, 1] },
                { item: 'skeleton_key', weight: 7, amount: [1, 1] }
            ],
            fortress: [
                { item: 'iron_ingot', weight: 25, amount: [2, 6] },
                { item: 'steel_ingot', weight: 15, amount: [1, 3] },
                { item: 'ancient_weapon', weight: 5, amount: [1, 1] },
                { item: 'armor_piece', weight: 10, amount: [1, 1] },
                { item: 'potion', weight: 15, amount: [1, 3] },
                { item: 'shield', weight: 8, amount: [1, 1] }
            ],
            temple: [
                { item: 'gold_ingot', weight: 20, amount: [1, 4] },
                { item: 'ruby', weight: 15, amount: [1, 2] },
                { item: 'sacred_artifact', weight: 5, amount: [1, 1] },
                { item: 'blessing_scroll', weight: 10, amount: [1, 2] },
                { item: 'holy_water', weight: 20, amount: [1, 3] },
                { item: 'relic', weight: 8, amount: [1, 1] }
            ]
        };
        
        // Generation parameters
        this.cellSize = 16;
        this.maxAttempts = 100;
    }
    
    // Generate a new dungeon at position
    generateDungeon(worldX, worldY, worldZ, type = 'cave', seed = null) {
        const dungeonType = this.dungeonTypes[type];
        if (!dungeonType) return null;
        
        // Initialize random with seed
        const rng = this.createRNG(seed || Date.now());
        
        const dungeon = {
            id: `dungeon_${Date.now()}`,
            type: type,
            typeData: dungeonType,
            worldX: worldX,
            worldY: worldY,
            worldZ: worldZ,
            rooms: [],
            corridors: [],
            enemies: [],
            loot: [],
            boss: null,
            discovered: false,
            cleared: false,
            seed: seed
        };
        
        // Determine room count
        const roomCount = dungeonType.minRooms + 
            Math.floor(rng() * (dungeonType.maxRooms - dungeonType.minRooms));
        
        // Generate entrance room
        const entranceRoom = this.generateRoom('entrance', 0, 0, rng);
        entranceRoom.isEntrance = true;
        dungeon.rooms.push(entranceRoom);
        
        // Generate other rooms using BSP or random placement
        this.generateRoomLayout(dungeon, roomCount - 1, rng);
        
        // Connect rooms with corridors
        this.generateCorridors(dungeon, rng);
        
        // Place boss room if applicable
        if (rng() < dungeonType.bossChance) {
            this.placeBossRoom(dungeon, rng);
        }
        
        // Populate dungeon
        this.populateEnemies(dungeon, rng);
        this.placeLoot(dungeon, rng);
        this.placeTraps(dungeon, rng);
        
        // Store dungeon
        this.dungeons.set(dungeon.id, dungeon);
        
        return dungeon;
    }
    
    // Simple seeded RNG
    createRNG(seed) {
        let s = seed;
        return function() {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        };
    }
    
    // Generate a single room
    generateRoom(type, x, y, rng) {
        const roomType = this.roomTypes[type];
        const width = roomType.size[0] + Math.floor(rng() * (roomType.size[1] - roomType.size[0]));
        const height = roomType.size[0] + Math.floor(rng() * (roomType.size[1] - roomType.size[0]));
        
        return {
            type: type,
            x: x,
            y: y,
            width: width,
            height: height,
            connections: [],
            spawners: roomType.spawners,
            hasTreasure: roomType.hasTreasure || false,
            hasBoss: roomType.hasBoss || false,
            hasTraps: roomType.hasTraps || false,
            hasPuzzle: roomType.hasPuzzle || false,
            cleared: false
        };
    }
    
    // Generate room layout using binary space partitioning
    generateRoomLayout(dungeon, count, rng) {
        const placed = [dungeon.rooms[0]]; // Start with entrance
        let attempts = 0;
        
        while (placed.length < count + 1 && attempts < this.maxAttempts) {
            // Select random room type
            const roomType = this.selectRoomType(rng);
            
            // Select random existing room to branch from
            const parentRoom = placed[Math.floor(rng() * placed.length)];
            
            // Try to place room adjacent to parent
            const directions = this.shuffleArray([0, 1, 2, 3], rng); // N, E, S, W
            
            for (const dir of directions) {
                const newRoom = this.tryPlaceRoom(roomType, parentRoom, dir, placed, rng);
                if (newRoom) {
                    placed.push(newRoom);
                    dungeon.rooms.push(newRoom);
                    
                    // Connect to parent
                    newRoom.connections.push(parentRoom);
                    parentRoom.connections.push(newRoom);
                    break;
                }
            }
            
            attempts++;
        }
    }
    
    // Select room type based on weights
    selectRoomType(rng) {
        const types = Object.entries(this.roomTypes).filter(([_, t]) => t.weight > 0);
        const totalWeight = types.reduce((sum, [_, t]) => sum + t.weight, 0);
        let roll = rng() * totalWeight;
        
        for (const [name, type] of types) {
            roll -= type.weight;
            if (roll <= 0) return name;
        }
        
        return 'small';
    }
    
    // Try to place a room in a direction from parent
    tryPlaceRoom(type, parent, direction, existing, rng) {
        const room = this.generateRoom(type, 0, 0, rng);
        
        // Calculate position based on direction
        const gap = 2; // Gap between rooms for corridor
        
        switch (direction) {
            case 0: // North
                room.x = parent.x + Math.floor((parent.width - room.width) / 2);
                room.y = parent.y - room.height - gap;
                break;
            case 1: // East
                room.x = parent.x + parent.width + gap;
                room.y = parent.y + Math.floor((parent.height - room.height) / 2);
                break;
            case 2: // South
                room.x = parent.x + Math.floor((parent.width - room.width) / 2);
                room.y = parent.y + parent.height + gap;
                break;
            case 3: // West
                room.x = parent.x - room.width - gap;
                room.y = parent.y + Math.floor((parent.height - room.height) / 2);
                break;
        }
        
        // Check for overlaps
        for (const other of existing) {
            if (this.roomsOverlap(room, other, 1)) {
                return null;
            }
        }
        
        return room;
    }
    
    // Check if two rooms overlap
    roomsOverlap(a, b, padding = 0) {
        return !(a.x + a.width + padding < b.x ||
                 b.x + b.width + padding < a.x ||
                 a.y + a.height + padding < b.y ||
                 b.y + b.height + padding < a.y);
    }
    
    // Generate corridors between connected rooms
    generateCorridors(dungeon, rng) {
        const processed = new Set();
        
        for (const room of dungeon.rooms) {
            for (const connected of room.connections) {
                const key = [room, connected].sort((a, b) => a.x - b.x).map(r => `${r.x},${r.y}`).join('-');
                if (processed.has(key)) continue;
                processed.add(key);
                
                // Create L-shaped corridor
                const corridor = this.createCorridor(room, connected, rng);
                dungeon.corridors.push(corridor);
            }
        }
    }
    
    // Create corridor between two rooms
    createCorridor(roomA, roomB, rng) {
        // Get room centers
        const ax = roomA.x + Math.floor(roomA.width / 2);
        const ay = roomA.y + Math.floor(roomA.height / 2);
        const bx = roomB.x + Math.floor(roomB.width / 2);
        const by = roomB.y + Math.floor(roomB.height / 2);
        
        // L-shaped path
        const corridor = {
            segments: [],
            width: 3
        };
        
        // Horizontal then vertical, or vice versa
        if (rng() > 0.5) {
            corridor.segments.push({ x1: ax, y1: ay, x2: bx, y2: ay });
            corridor.segments.push({ x1: bx, y1: ay, x2: bx, y2: by });
        } else {
            corridor.segments.push({ x1: ax, y1: ay, x2: ax, y2: by });
            corridor.segments.push({ x1: ax, y1: by, x2: bx, y2: by });
        }
        
        return corridor;
    }
    
    // Place boss room
    placeBossRoom(dungeon, rng) {
        // Find the room furthest from entrance
        const entrance = dungeon.rooms.find(r => r.isEntrance);
        let furthestRoom = null;
        let maxDist = 0;
        
        for (const room of dungeon.rooms) {
            const dist = Math.abs(room.x - entrance.x) + Math.abs(room.y - entrance.y);
            if (dist > maxDist) {
                maxDist = dist;
                furthestRoom = room;
            }
        }
        
        // Convert to boss room or add new boss room
        if (furthestRoom && furthestRoom !== entrance) {
            // Try to place boss room adjacent to furthest room
            const bossRoom = this.tryPlaceRoom('boss', furthestRoom, 
                Math.floor(rng() * 4), dungeon.rooms, rng);
            
            if (bossRoom) {
                bossRoom.connections.push(furthestRoom);
                furthestRoom.connections.push(bossRoom);
                dungeon.rooms.push(bossRoom);
                dungeon.boss = {
                    room: bossRoom,
                    type: this.selectBossType(dungeon.type, rng),
                    spawned: false,
                    defeated: false
                };
            }
        }
    }
    
    // Select boss type for dungeon
    selectBossType(dungeonType, rng) {
        const bossTypes = {
            cave: ['giant_spider', 'cave_troll'],
            mine: ['mine_golem', 'foreman_zombie'],
            crypt: ['lich', 'death_knight'],
            fortress: ['dark_lord', 'siege_golem'],
            temple: ['guardian_angel', 'demon_lord']
        };
        
        const types = bossTypes[dungeonType] || ['boss'];
        return types[Math.floor(rng() * types.length)];
    }
    
    // Populate dungeon with enemies
    populateEnemies(dungeon, rng) {
        const enemyTypes = dungeon.typeData.enemyTypes;
        
        for (const room of dungeon.rooms) {
            if (room.isEntrance || room.hasBoss) continue;
            
            // Spawn enemies based on room spawner count
            for (let i = 0; i < room.spawners; i++) {
                const enemyType = enemyTypes[Math.floor(rng() * enemyTypes.length)];
                const x = room.x + 2 + Math.floor(rng() * (room.width - 4));
                const y = room.y + 2 + Math.floor(rng() * (room.height - 4));
                
                dungeon.enemies.push({
                    type: enemyType,
                    x: x,
                    y: y,
                    room: room,
                    spawned: false,
                    alive: true
                });
            }
        }
    }
    
    // Place loot chests
    placeLoot(dungeon, rng) {
        const lootTable = this.lootTables[dungeon.type] || this.lootTables.cave;
        
        for (const room of dungeon.rooms) {
            // Treasure rooms always have loot
            if (room.hasTreasure) {
                dungeon.loot.push(this.createLootChest(room, lootTable, rng, 'treasure'));
            }
            
            // Random chance for loot in other rooms
            if (!room.isEntrance && !room.hasBoss && rng() < 0.3) {
                dungeon.loot.push(this.createLootChest(room, lootTable, rng, 'normal'));
            }
        }
        
        // Boss room has guaranteed rare loot
        if (dungeon.boss?.room) {
            dungeon.loot.push(this.createLootChest(dungeon.boss.room, lootTable, rng, 'boss'));
        }
    }
    
    // Create a loot chest
    createLootChest(room, lootTable, rng, tier) {
        const x = room.x + 2 + Math.floor(rng() * (room.width - 4));
        const y = room.y + 2 + Math.floor(rng() * (room.height - 4));
        
        // Generate loot
        const itemCount = tier === 'boss' ? 5 : tier === 'treasure' ? 3 : 1 + Math.floor(rng() * 2);
        const items = [];
        
        for (let i = 0; i < itemCount; i++) {
            const item = this.selectLoot(lootTable, rng);
            if (item) items.push(item);
        }
        
        return {
            x: x,
            y: y,
            room: room,
            tier: tier,
            items: items,
            opened: false
        };
    }
    
    // Select loot from table
    selectLoot(lootTable, rng) {
        const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
        let roll = rng() * totalWeight;
        
        for (const entry of lootTable) {
            roll -= entry.weight;
            if (roll <= 0) {
                const amount = entry.amount[0] + 
                    Math.floor(rng() * (entry.amount[1] - entry.amount[0] + 1));
                return { id: entry.item, amount: amount };
            }
        }
        
        return null;
    }
    
    // Place traps
    placeTraps(dungeon, rng) {
        if (!dungeon.typeData.hasTraps) return;
        
        for (const room of dungeon.rooms) {
            if (room.hasTraps || (rng() < 0.2 && !room.isEntrance)) {
                const trapCount = 1 + Math.floor(rng() * 3);
                for (let i = 0; i < trapCount; i++) {
                    const trap = {
                        type: this.selectTrapType(rng),
                        x: room.x + 1 + Math.floor(rng() * (room.width - 2)),
                        y: room.y + 1 + Math.floor(rng() * (room.height - 2)),
                        triggered: false,
                        visible: false
                    };
                    room.traps = room.traps || [];
                    room.traps.push(trap);
                }
            }
        }
    }
    
    // Select trap type
    selectTrapType(rng) {
        const types = ['spike', 'arrow', 'fire', 'pit', 'poison_dart'];
        return types[Math.floor(rng() * types.length)];
    }
    
    // Shuffle array
    shuffleArray(array, rng) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    
    // Get dungeon at world position
    getDungeonAt(worldX, worldY) {
        for (const [id, dungeon] of this.dungeons) {
            // Check if position is within dungeon bounds
            const bounds = this.getDungeonBounds(dungeon);
            if (worldX >= bounds.minX && worldX <= bounds.maxX &&
                worldY >= bounds.minY && worldY <= bounds.maxY) {
                return dungeon;
            }
        }
        return null;
    }
    
    // Get dungeon world bounds
    getDungeonBounds(dungeon) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const room of dungeon.rooms) {
            minX = Math.min(minX, room.x);
            minY = Math.min(minY, room.y);
            maxX = Math.max(maxX, room.x + room.width);
            maxY = Math.max(maxY, room.y + room.height);
        }
        
        return {
            minX: dungeon.worldX + minX * this.cellSize,
            minY: dungeon.worldY + minY * this.cellSize,
            maxX: dungeon.worldX + maxX * this.cellSize,
            maxY: dungeon.worldY + maxY * this.cellSize
        };
    }
    
    // Enter dungeon
    enterDungeon(dungeonId) {
        const dungeon = this.dungeons.get(dungeonId);
        if (!dungeon) return false;
        
        dungeon.discovered = true;
        
        // Trigger dungeon music
        this.game.music?.setMoodImmediate?.('underground');
        
        // Show notification
        this.game.ui?.showNotification?.(`Entered: ${dungeon.typeData.name}`, 'info');
        
        return true;
    }
    
    // Mark dungeon as cleared
    clearDungeon(dungeonId) {
        const dungeon = this.dungeons.get(dungeonId);
        if (!dungeon) return;
        
        dungeon.cleared = true;
        
        // Achievement
        this.game.achievements?.unlock?.('dungeon_cleared');
        
        this.game.ui?.showNotification?.(`${dungeon.typeData.name} cleared!`, 'success');
    }
    
    update(deltaTime) {
        // Update active dungeons (spawn enemies when player enters rooms, etc.)
        this.updatePlayerDungeonState();
        this.updatePortals(deltaTime);
        this.updateDungeonEnemies(deltaTime);
    }
    
    // Update player's dungeon state
    updatePlayerDungeonState() {
        const player = this.game.player;
        if (!player) return;
        
        if (this.playerInDungeon && this.currentDungeonId) {
            const dungeon = this.dungeons.get(this.currentDungeonId);
            if (dungeon) {
                // Check if player is near exit portal
                const entrance = dungeon.rooms.find(r => r.isEntrance);
                if (entrance) {
                    const exitX = dungeon.worldX + entrance.x * this.cellSize + entrance.width * this.cellSize / 2;
                    const exitY = dungeon.worldY + entrance.y * this.cellSize + entrance.height * this.cellSize / 2;
                    const dist = Math.sqrt((player.x - exitX) ** 2 + (player.y - exitY) ** 2);
                    
                    if (dist < 2) {
                        // Show exit prompt
                        this.game.ui?.showHint?.('Press E to exit dungeon');
                    }
                }
            }
        }
    }
    
    // Update portal visuals and interactions
    updatePortals(deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        for (const [id, portal] of this.portals) {
            // Animate portal
            portal.rotation = (portal.rotation || 0) + deltaTime * 2;
            portal.pulsePhase = (portal.pulsePhase || 0) + deltaTime * 3;
            
            // Check player proximity
            const dist = Math.sqrt((player.x - portal.x) ** 2 + (player.y - portal.y) ** 2);
            portal.playerNearby = dist < 3;
            
            if (portal.playerNearby && dist < 2) {
                this.game.ui?.showHint?.(`Press E to enter ${portal.dungeonType} dungeon`);
            }
        }
    }
    
    // Update enemies in active dungeons
    updateDungeonEnemies(deltaTime) {
        if (!this.playerInDungeon || !this.currentDungeonId) return;
        
        const dungeon = this.dungeons.get(this.currentDungeonId);
        if (!dungeon) return;
        
        const player = this.game.player;
        
        // Check which room player is in
        for (const room of dungeon.rooms) {
            const roomWorldX = dungeon.worldX + room.x * this.cellSize;
            const roomWorldY = dungeon.worldY + room.y * this.cellSize;
            const roomWorldW = room.width * this.cellSize;
            const roomWorldH = room.height * this.cellSize;
            
            if (player.x >= roomWorldX && player.x < roomWorldX + roomWorldW &&
                player.y >= roomWorldY && player.y < roomWorldY + roomWorldH) {
                
                // Spawn enemies in this room if not spawned
                for (const enemy of dungeon.enemies) {
                    if (enemy.room === room && !enemy.spawned && enemy.alive) {
                        this.spawnDungeonEnemy(enemy, dungeon);
                    }
                }
                
                // Spawn boss if in boss room
                if (room.hasBoss && dungeon.boss && !dungeon.boss.spawned) {
                    this.spawnBoss(dungeon);
                }
            }
        }
    }
    
    // Spawn a dungeon enemy
    spawnDungeonEnemy(enemyData, dungeon) {
        const worldX = dungeon.worldX + enemyData.x * this.cellSize;
        const worldY = dungeon.worldY + enemyData.y * this.cellSize;
        
        const entity = this.game.spawnEntity?.(enemyData.type, worldX, worldY, dungeon.worldZ + 1);
        if (entity) {
            entity.dungeonId = dungeon.id;
            enemyData.spawned = true;
            enemyData.entity = entity;
        }
    }
    
    // Spawn dungeon boss
    spawnBoss(dungeon) {
        const bossRoom = dungeon.boss.room;
        const worldX = dungeon.worldX + (bossRoom.x + bossRoom.width / 2) * this.cellSize;
        const worldY = dungeon.worldY + (bossRoom.y + bossRoom.height / 2) * this.cellSize;
        
        const boss = this.game.spawnEntity?.(dungeon.boss.type, worldX, worldY, dungeon.worldZ + 1);
        if (boss) {
            boss.isBoss = true;
            boss.dungeonId = dungeon.id;
            dungeon.boss.spawned = true;
            dungeon.boss.entity = boss;
            
            // Show boss health bar
            this.game.bossHealthBar?.showBoss?.(boss, dungeon.boss.type);
            
            this.game.ui?.showMessage?.(`⚔️ ${dungeon.boss.type.replace('_', ' ').toUpperCase()} appears!`, 4000);
        }
    }
    
    // Create a portal in the world
    createPortal(x, y, z, dungeonType = 'cave') {
        const portal = {
            id: `portal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            x, y, z,
            dungeonType,
            dungeonId: null,
            active: true,
            rotation: 0,
            pulsePhase: 0,
            playerNearby: false
        };
        
        this.portals.set(portal.id, portal);
        return portal;
    }
    
    // Try to spawn portal during chunk generation
    trySpawnPortalInChunk(chunkX, chunkY, biome) {
        if (Math.random() > this.portalSpawnChance) return null;
        
        // Random position within chunk
        const x = chunkX * 16 + 4 + Math.random() * 8;
        const y = chunkY * 16 + 4 + Math.random() * 8;
        const z = this.game.world?.getHeight?.(Math.floor(x), Math.floor(y)) || 10;
        
        // Select dungeon type based on biome
        const dungeonType = this.getDungeonTypeForBiome(biome);
        
        return this.createPortal(x, y, z + 1, dungeonType);
    }
    
    // Get dungeon type for biome
    getDungeonTypeForBiome(biome) {
        const biomeMapping = {
            'mountain': 'mine',
            'desert': 'temple',
            'forest': 'cave',
            'swamp': 'crypt',
            'tundra': 'fortress',
            'volcanic': 'fortress',
            'plains': 'cave'
        };
        
        return biomeMapping[biome] || 'cave';
    }
    
    // Enter a dungeon through portal
    enterDungeonFromPortal(portalId) {
        const portal = this.portals.get(portalId);
        if (!portal || !portal.active) return false;
        
        const player = this.game.player;
        if (!player) return false;
        
        // Save entrance position
        this.dungeonEntrancePosition = { x: player.x, y: player.y, z: player.z };
        
        // Generate dungeon if not exists
        if (!portal.dungeonId) {
            const dungeon = this.generateDungeon(
                portal.x, portal.y, portal.z - 30, // Underground
                portal.dungeonType,
                Date.now()
            );
            portal.dungeonId = dungeon.id;
        }
        
        const dungeon = this.dungeons.get(portal.dungeonId);
        if (!dungeon) return false;
        
        // Teleport player to dungeon entrance
        const entrance = dungeon.rooms.find(r => r.isEntrance);
        if (entrance) {
            player.x = dungeon.worldX + entrance.x * this.cellSize + entrance.width * this.cellSize / 2;
            player.y = dungeon.worldY + entrance.y * this.cellSize + entrance.height * this.cellSize / 2;
            player.z = dungeon.worldZ + 1;
        }
        
        this.playerInDungeon = true;
        this.currentDungeonId = portal.dungeonId;
        
        return this.enterDungeon(portal.dungeonId);
    }
    
    // Exit current dungeon
    exitDungeon() {
        if (!this.playerInDungeon) return false;
        
        const player = this.game.player;
        if (!player || !this.dungeonEntrancePosition) return false;
        
        // Teleport back
        player.x = this.dungeonEntrancePosition.x;
        player.y = this.dungeonEntrancePosition.y;
        player.z = this.dungeonEntrancePosition.z;
        
        this.playerInDungeon = false;
        this.currentDungeonId = null;
        this.dungeonEntrancePosition = null;
        
        // Reset music
        this.game.music?.setMoodImmediate?.('exploration');
        
        this.game.ui?.showNotification?.('Exited dungeon', 'info');
        
        return true;
    }
    
    // Use portal stone item to create a portal
    usePortalStone(dungeonType = 'cave') {
        const player = this.game.player;
        if (!player) return false;
        
        // Check if player has portal stone
        const hasStone = player.hasItem?.('portal_stone');
        if (!hasStone) {
            this.game.ui?.showMessage?.('You need a Portal Stone to create a dungeon portal!', 2000);
            return false;
        }
        
        // Remove portal stone
        player.removeItem?.('portal_stone', 1);
        
        // Create portal near player
        const portal = this.createPortal(
            player.x + 2, 
            player.y + 2, 
            this.game.world?.getHeight?.(Math.floor(player.x + 2), Math.floor(player.y + 2)) + 1 || player.z,
            dungeonType
        );
        
        this.game.ui?.showMessage?.(`🌀 Dungeon portal created!`, 3000);
        this.game.particles?.spawn?.(portal.x, portal.y, portal.z, {
            type: 'magic',
            count: 20,
            color: '#8800FF'
        });
        
        return true;
    }
    
    // Interact with nearest portal (called from input)
    interactWithNearestPortal() {
        const player = this.game.player;
        if (!player) return false;
        
        // If in dungeon, try to exit
        if (this.playerInDungeon) {
            return this.exitDungeon();
        }
        
        // Find nearest portal
        let nearestPortal = null;
        let nearestDist = Infinity;
        
        for (const [id, portal] of this.portals) {
            const dist = Math.sqrt((player.x - portal.x) ** 2 + (player.y - portal.y) ** 2);
            if (dist < 3 && dist < nearestDist) {
                nearestDist = dist;
                nearestPortal = portal;
            }
        }
        
        if (nearestPortal) {
            return this.enterDungeonFromPortal(nearestPortal.id);
        }
        
        return false;
    }
    
    // Render portals
    render(ctx, camera) {
        for (const [id, portal] of this.portals) {
            this.renderPortal(ctx, camera, portal);
        }
    }
    
    // Render a single portal
    renderPortal(ctx, camera, portal) {
        const screenPos = camera.worldToScreen(portal.x, portal.y, portal.z);
        if (!screenPos) return;
        
        const { x, y } = screenPos;
        const baseSize = 30;
        const pulse = 1 + Math.sin(portal.pulsePhase) * 0.15;
        const size = baseSize * pulse;
        
        // Portal glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
        gradient.addColorStop(0, 'rgba(136, 0, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(136, 0, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(136, 0, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Portal ring
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(portal.rotation);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = portal.playerNearby ? '#FF00FF' : '#8800FF';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Inner spiral
        ctx.strokeStyle = '#CC88FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 4 + portal.rotation * 2;
            const r = (i / 60) * size * 0.8;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r * 0.6;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        ctx.restore();
        
        // Dungeon type label
        if (portal.playerNearby) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(portal.dungeonType.toUpperCase(), x, y - size - 10);
        }
    }
    
    // Serialize for saving
    serialize() {
        const serializedDungeons = [];
        for (const [id, dungeon] of this.dungeons) {
            serializedDungeons.push({
                ...dungeon,
                rooms: dungeon.rooms.map(r => ({
                    ...r,
                    connections: [] // Don't serialize circular references
                }))
            });
        }
        
        const serializedPortals = [];
        for (const [id, portal] of this.portals) {
            serializedPortals.push({ ...portal });
        }
        
        return { 
            dungeons: serializedDungeons,
            portals: serializedPortals,
            playerInDungeon: this.playerInDungeon,
            currentDungeonId: this.currentDungeonId,
            dungeonEntrancePosition: this.dungeonEntrancePosition
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.dungeons) {
            this.dungeons.clear();
            for (const d of data.dungeons) {
                this.dungeons.set(d.id, d);
            }
        }
        
        if (data?.portals) {
            this.portals.clear();
            for (const p of data.portals) {
                this.portals.set(p.id, p);
            }
        }
        
        this.playerInDungeon = data?.playerInDungeon || false;
        this.currentDungeonId = data?.currentDungeonId || null;
        this.dungeonEntrancePosition = data?.dungeonEntrancePosition || null;
    }
    
    // Reset system
    reset() {
        this.dungeons.clear();
        this.portals.clear();
        this.playerInDungeon = false;
        this.currentDungeonId = null;
        this.dungeonEntrancePosition = null;
    }
}
