// Villager NPC System - NPCs with AI, pathfinding, and trading
import { Entity } from './entity.js';
import { CONFIG, BLOCKS, BLOCK_DATA, ITEMS } from '../config.js';

// Villager profession types
export const VILLAGER_PROFESSIONS = {
    FARMER: {
        id: 'farmer',
        name: 'Farmer',
        emoji: '👨‍🌾',
        workBlock: BLOCKS.FARMLAND,
        schedule: { wake: 0.25, workStart: 0.3, workEnd: 0.7, sleep: 0.8 },
        trades: [
            { buy: 'wheat', buyQty: 20, sell: 'bread', sellQty: 3, sellPrice: 5 },
            { buy: 'wheat_seeds', buyQty: 5, sell: 'wheat', sellQty: 10, sellPrice: 3 },
            { buy: 'carrot', buyQty: 10, sell: 'carrot_seeds', sellQty: 2, sellPrice: 2 },
        ]
    },
    BLACKSMITH: {
        id: 'blacksmith',
        name: 'Blacksmith',
        emoji: '⚒️',
        workBlock: BLOCKS.ANVIL,
        schedule: { wake: 0.25, workStart: 0.3, workEnd: 0.75, sleep: 0.85 },
        trades: [
            { buy: 'iron_ingot', buyQty: 5, sell: 'iron_sword', sellQty: 1, sellPrice: 25 },
            { buy: 'iron_ingot', buyQty: 3, sell: 'iron_pickaxe', sellQty: 1, sellPrice: 20 },
            { buy: 'steel_ingot', buyQty: 3, sell: 'steel_sword', sellQty: 1, sellPrice: 50 },
        ]
    },
    MERCHANT: {
        id: 'merchant',
        name: 'Merchant',
        emoji: '🧔',
        workBlock: BLOCKS.MARKET_STALL,
        schedule: { wake: 0.3, workStart: 0.35, workEnd: 0.65, sleep: 0.75 },
        trades: [
            { buy: 'fur', buyQty: 5, sell: 'silver_coin', sellQty: 10, sellPrice: 0 },
            { buy: 'leather', buyQty: 3, sell: 'silver_coin', sellQty: 5, sellPrice: 0 },
            { buy: 'diamond', buyQty: 1, sell: 'silver_coin', sellQty: 50, sellPrice: 0 },
        ]
    },
    GUARD: {
        id: 'guard',
        name: 'Guard',
        emoji: '⚔️',
        workBlock: null,
        schedule: { wake: 0.2, workStart: 0.25, workEnd: 0.9, sleep: 0.95 },
        trades: []
    },
    HERBALIST: {
        id: 'herbalist',
        name: 'Herbalist',
        emoji: '🌿',
        workBlock: BLOCKS.CRAFTING_TABLE,
        schedule: { wake: 0.3, workStart: 0.35, workEnd: 0.7, sleep: 0.8 },
        trades: [
            { buy: 'herb', buyQty: 5, sell: 'health_potion', sellQty: 1, sellPrice: 15 },
            { buy: 'mushroom', buyQty: 3, sell: 'stamina_potion', sellQty: 1, sellPrice: 12 },
        ]
    },
    STABLEMASTER: {
        id: 'stablemaster',
        name: 'Stable Master',
        emoji: '🐴',
        workBlock: BLOCKS.STABLE,
        schedule: { wake: 0.2, workStart: 0.25, workEnd: 0.75, sleep: 0.85 },
        trades: [
            { buy: 'wheat', buyQty: 30, sell: 'horse_token', sellQty: 1, sellPrice: 100 },
            { buy: 'hay_block', buyQty: 10, sell: 'saddle', sellQty: 1, sellPrice: 50 },
        ]
    }
};

// NPC States
export const NPC_STATES = {
    IDLE: 'idle',
    WALKING: 'walking',
    WORKING: 'working',
    TRADING: 'trading',
    SLEEPING: 'sleeping',
    FLEEING: 'fleeing',
    FOLLOWING: 'following',
    PATROLLING: 'patrolling'
};

// Simple A* Pathfinding for NPCs
class PathFinder {
    constructor(world) {
        this.world = world;
        this.maxIterations = 500;
    }

    findPath(startX, startY, startZ, endX, endY, endZ) {
        const start = { x: Math.floor(startX), y: Math.floor(startY), z: Math.floor(startZ) };
        const end = { x: Math.floor(endX), y: Math.floor(endY), z: Math.floor(endZ) };

        // Quick distance check
        const dist = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        if (dist > 50) return null; // Too far

        const openSet = [{ ...start, g: 0, h: this.heuristic(start, end), f: 0, parent: null }];
        openSet[0].f = openSet[0].h;
        const closedSet = new Set();
        const getKey = (n) => `${n.x},${n.y},${n.z}`;

        let iterations = 0;
        while (openSet.length > 0 && iterations < this.maxIterations) {
            iterations++;

            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            // Goal reached
            if (current.x === end.x && current.y === end.y && Math.abs(current.z - end.z) <= 1) {
                return this.reconstructPath(current);
            }

            closedSet.add(getKey(current));

            // Check neighbors (4-directional movement + up/down)
            const neighbors = [
                { x: current.x + 1, y: current.y, z: current.z },
                { x: current.x - 1, y: current.y, z: current.z },
                { x: current.x, y: current.y + 1, z: current.z },
                { x: current.x, y: current.y - 1, z: current.z },
            ];

            for (const neighbor of neighbors) {
                // Find ground level at this position
                let groundZ = this.findGroundLevel(neighbor.x, neighbor.y, current.z);
                if (groundZ === null) continue;

                neighbor.z = groundZ;

                // Skip if height difference too large (can't jump more than 1 block)
                if (Math.abs(neighbor.z - current.z) > 1) continue;

                const key = getKey(neighbor);
                if (closedSet.has(key)) continue;

                // Check if walkable
                if (!this.isWalkable(neighbor.x, neighbor.y, neighbor.z)) continue;

                const g = current.g + 1 + (neighbor.z > current.z ? 0.5 : 0); // Slight penalty for climbing
                const h = this.heuristic(neighbor, end);
                const f = g + h;

                const existing = openSet.find(n => getKey(n) === key);
                if (existing) {
                    if (g < existing.g) {
                        existing.g = g;
                        existing.f = f;
                        existing.parent = current;
                    }
                } else {
                    openSet.push({ ...neighbor, g, h, f, parent: current });
                }
            }
        }

        return null; // No path found
    }

    findGroundLevel(x, y, referenceZ) {
        // Look for ground near the reference Z level
        for (let z = referenceZ + 2; z >= referenceZ - 3; z--) {
            const block = this.world.getBlock(x, y, z);
            const blockAbove = this.world.getBlock(x, y, z + 1);
            const blockAbove2 = this.world.getBlock(x, y, z + 2);

            if (block !== BLOCKS.AIR && block !== BLOCKS.WATER && 
                BLOCK_DATA[block]?.solid &&
                (blockAbove === BLOCKS.AIR || !BLOCK_DATA[blockAbove]?.solid) &&
                (blockAbove2 === BLOCKS.AIR || !BLOCK_DATA[blockAbove2]?.solid)) {
                return z + 1; // Stand on top of this block
            }
        }
        return null;
    }

    isWalkable(x, y, z) {
        // Check if NPC can stand here (ground below, air at body level)
        const groundBlock = this.world.getBlock(x, y, z - 1);
        const bodyBlock = this.world.getBlock(x, y, z);
        const headBlock = this.world.getBlock(x, y, z + 1);

        const groundSolid = groundBlock !== BLOCKS.AIR && groundBlock !== BLOCKS.WATER && BLOCK_DATA[groundBlock]?.solid;
        const bodyClear = bodyBlock === BLOCKS.AIR || !BLOCK_DATA[bodyBlock]?.solid;
        const headClear = headBlock === BLOCKS.AIR || !BLOCK_DATA[headBlock]?.solid;

        return groundSolid && bodyClear && headClear;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z) * 2;
    }

    reconstructPath(node) {
        const path = [];
        let current = node;
        while (current) {
            path.unshift({ x: current.x + 0.5, y: current.y + 0.5, z: current.z });
            current = current.parent;
        }
        return path;
    }
}

// Villager Entity
export class Villager extends Entity {
    constructor(game, x, y, z, profession = 'FARMER') {
        super(game, x, y, z);
        
        this.type = 'villager';
        this.profession = VILLAGER_PROFESSIONS[profession] || VILLAGER_PROFESSIONS.FARMER;
        this.emoji = this.profession.emoji;
        this.name = this.generateName();
        
        this.width = 0.6;
        this.height = 0.6;
        this.depth = 1.8;
        
        // Stats
        this.health = 20;
        this.maxHealth = 20;
        this.speed = 1.5;
        
        // AI State
        this.state = NPC_STATES.IDLE;
        this.previousState = NPC_STATES.IDLE;
        this.stateTimer = 0;
        this.stateData = {};
        
        // Pathfinding
        this.pathFinder = new PathFinder(game.world);
        this.currentPath = null;
        this.pathIndex = 0;
        this.pathRecalcTimer = 0;
        
        // Home and work locations
        this.homePos = { x, y, z };
        this.workPos = null;
        this.patrolPoints = [];
        this.patrolIndex = 0;
        
        // Trading
        this.trades = [...this.profession.trades];
        this.tradeLevel = 1;
        this.experience = 0;
        this.tradeCooldowns = new Map();
        
        // Interaction
        this.interactingPlayer = null;
        this.dialogueQueue = [];
        
        // Memory (remembers threats, friends)
        this.memory = {
            lastThreat: null,
            threatTimer: 0,
            friendlyPlayers: new Set(),
            lastInteraction: 0
        };
        
        // Animation
        this.animTimer = 0;
        this.facingDir = { x: 0, y: 1 };
    }

    generateName() {
        const firstNames = ['Erik', 'Olga', 'Hans', 'Ingrid', 'Bjorn', 'Freya', 'Gunnar', 'Helga', 'Leif', 'Sigrid'];
        const titles = ['the Wise', 'the Bold', 'the Kind', 'the Strong', 'the Swift', ''];
        const name = firstNames[Math.floor(Math.random() * firstNames.length)];
        const title = titles[Math.floor(Math.random() * titles.length)];
        return title ? `${name} ${title}` : name;
    }

    update(deltaTime) {
        if (this.isDead) return;
        
        this.updateAI(deltaTime);
        this.applyPhysics(deltaTime);
        this.updateAnimation(deltaTime);
        
        // Update memory
        if (this.memory.threatTimer > 0) {
            this.memory.threatTimer -= deltaTime;
            if (this.memory.threatTimer <= 0) {
                this.memory.lastThreat = null;
            }
        }
    }

    updateAI(deltaTime) {
        const dayProgress = this.game.world.dayProgress;
        const schedule = this.profession.schedule;
        
        // Check for threats
        if (this.checkForThreats()) {
            this.setState(NPC_STATES.FLEEING);
        }
        
        // State machine
        switch (this.state) {
            case NPC_STATES.IDLE:
                this.updateIdle(deltaTime, dayProgress, schedule);
                break;
            case NPC_STATES.WALKING:
                this.updateWalking(deltaTime);
                break;
            case NPC_STATES.WORKING:
                this.updateWorking(deltaTime);
                break;
            case NPC_STATES.TRADING:
                this.updateTrading(deltaTime);
                break;
            case NPC_STATES.SLEEPING:
                this.updateSleeping(deltaTime, dayProgress, schedule);
                break;
            case NPC_STATES.FLEEING:
                this.updateFleeing(deltaTime);
                break;
            case NPC_STATES.PATROLLING:
                this.updatePatrolling(deltaTime);
                break;
        }
        
        // Path following
        this.followPath(deltaTime);
    }

    updateIdle(deltaTime, dayProgress, schedule) {
        this.vx = 0;
        this.vy = 0;
        
        this.stateTimer -= deltaTime;
        
        if (this.stateTimer <= 0) {
            // Decide what to do based on time of day
            if (dayProgress >= schedule.sleep || dayProgress < schedule.wake) {
                // Time to sleep
                this.goToHome();
                this.setState(NPC_STATES.SLEEPING);
            } else if (dayProgress >= schedule.workStart && dayProgress < schedule.workEnd) {
                // Time to work
                if (this.workPos) {
                    this.setPathTo(this.workPos.x, this.workPos.y, this.workPos.z);
                    this.setState(NPC_STATES.WALKING);
                    this.stateData.nextState = NPC_STATES.WORKING;
                } else if (this.profession.id === 'guard') {
                    this.setState(NPC_STATES.PATROLLING);
                } else {
                    // Wander around
                    this.wanderNearby();
                }
            } else {
                // Free time - wander or socialize
                this.wanderNearby();
            }
        }
    }

    updateWalking(deltaTime) {
        // Walking is handled by followPath
        // Check if we've reached destination
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            const nextState = this.stateData.nextState || NPC_STATES.IDLE;
            this.setState(nextState);
            this.stateTimer = 2 + Math.random() * 3;
        }
    }

    updateWorking(deltaTime) {
        this.vx = 0;
        this.vy = 0;
        
        this.stateTimer -= deltaTime;
        
        // Work animation
        this.animTimer += deltaTime;
        if (this.animTimer > 2) {
            this.animTimer = 0;
            // Emit work particles
            this.game.particles.emit(this.x, this.y, this.z + 1, '#ffcc00', 3);
        }
        
        // Check if work time is over
        const dayProgress = this.game.world.dayProgress;
        if (dayProgress >= this.profession.schedule.workEnd || this.stateTimer <= 0) {
            this.setState(NPC_STATES.IDLE);
            this.stateTimer = 1;
        }
    }

    updateTrading(deltaTime) {
        // Stay still while trading
        this.vx = 0;
        this.vy = 0;
        
        // Face the player
        if (this.interactingPlayer) {
            const dx = this.interactingPlayer.x - this.x;
            const dy = this.interactingPlayer.y - this.y;
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 0) {
                this.facingDir = { x: dx / mag, y: dy / mag };
            }
            
            // Check if player walked away
            const dist = Math.hypot(dx, dy);
            if (dist > 4) {
                this.endTrading();
            }
        } else {
            this.endTrading();
        }
    }

    updateSleeping(deltaTime, dayProgress, schedule) {
        this.vx = 0;
        this.vy = 0;
        
        // Wake up at schedule time
        if (dayProgress >= schedule.wake && dayProgress < schedule.sleep) {
            this.setState(NPC_STATES.IDLE);
            this.stateTimer = 1;
        }
        
        // Heal while sleeping
        if (this.health < this.maxHealth) {
            this.health = Math.min(this.maxHealth, this.health + deltaTime * 0.5);
        }
    }

    updateFleeing(deltaTime) {
        // Run away from threat
        if (this.memory.lastThreat) {
            const threat = this.memory.lastThreat;
            const dx = this.x - threat.x;
            const dy = this.y - threat.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 20) {
                // Safe, return to normal
                this.setState(NPC_STATES.IDLE);
                this.stateTimer = 2;
            } else if (dist > 0) {
                // Keep running
                const fleeSpeed = this.speed * 1.5;
                this.vx = (dx / dist) * fleeSpeed;
                this.vy = (dy / dist) * fleeSpeed;
                this.facingDir = { x: dx / dist, y: dy / dist };
            }
        } else {
            this.setState(NPC_STATES.IDLE);
            this.stateTimer = 2;
        }
    }

    updatePatrolling(deltaTime) {
        if (this.patrolPoints.length === 0) {
            // Generate patrol points around home
            this.generatePatrolPoints();
        }
        
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            // Go to next patrol point
            this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
            const target = this.patrolPoints[this.patrolIndex];
            this.setPathTo(target.x, target.y, target.z);
        }
        
        // Check time - stop patrolling at night
        const dayProgress = this.game.world.dayProgress;
        if (dayProgress >= this.profession.schedule.sleep || dayProgress < this.profession.schedule.wake) {
            this.goToHome();
            this.setState(NPC_STATES.SLEEPING);
        }
    }

    updateAnimation(deltaTime) {
        // Simple bob animation while moving
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.animTimer += deltaTime * 5;
        }
    }

    checkForThreats() {
        if (this.state === NPC_STATES.FLEEING) return false;
        
        // Check for nearby enemies
        for (const entity of this.game.entities) {
            if (entity.constructor.name === 'Enemy' && !entity.isDead) {
                const dist = Math.hypot(entity.x - this.x, entity.y - this.y);
                if (dist < 8) {
                    this.memory.lastThreat = { x: entity.x, y: entity.y, z: entity.z };
                    this.memory.threatTimer = 10;
                    return true;
                }
            }
        }
        return false;
    }

    setPathTo(x, y, z) {
        this.currentPath = this.pathFinder.findPath(this.x, this.y, this.z, x, y, z);
        this.pathIndex = 0;
    }

    followPath(deltaTime) {
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            return;
        }
        
        const target = this.currentPath[this.pathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 0.3) {
            // Reached waypoint
            this.pathIndex++;
        } else {
            // Move towards waypoint
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
            this.facingDir = { x: dx / dist, y: dy / dist };
        }
    }

    wanderNearby() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 3 + Math.random() * 5;
        const targetX = this.homePos.x + Math.cos(angle) * dist;
        const targetY = this.homePos.y + Math.sin(angle) * dist;
        const targetZ = this.game.world.getHeight(Math.floor(targetX), Math.floor(targetY)) + 1;
        
        this.setPathTo(targetX, targetY, targetZ);
        this.setState(NPC_STATES.WALKING);
        this.stateData.nextState = NPC_STATES.IDLE;
    }

    goToHome() {
        this.setPathTo(this.homePos.x, this.homePos.y, this.homePos.z);
        this.setState(NPC_STATES.WALKING);
    }

    generatePatrolPoints() {
        this.patrolPoints = [];
        const numPoints = 4 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const dist = 5 + Math.random() * 5;
            const px = this.homePos.x + Math.cos(angle) * dist;
            const py = this.homePos.y + Math.sin(angle) * dist;
            const pz = this.game.world.getHeight(Math.floor(px), Math.floor(py)) + 1;
            
            this.patrolPoints.push({ x: px, y: py, z: pz });
        }
    }

    setState(newState) {
        this.previousState = this.state;
        this.state = newState;
        this.stateData = {};
        this.stateTimer = 0;
    }

    // Trading
    startTrading(player) {
        if (this.state === NPC_STATES.SLEEPING || this.state === NPC_STATES.FLEEING) {
            return false;
        }
        
        this.interactingPlayer = player;
        this.setState(NPC_STATES.TRADING);
        
        // Show greeting
        this.showDialogue(`${this.profession.dialoguePrefix || 'Hello!'} I am ${this.name}.`);
        
        return true;
    }

    endTrading() {
        this.interactingPlayer = null;
        this.setState(NPC_STATES.IDLE);
        this.stateTimer = 2;
    }

    executeTrade(tradeIndex, player) {
        if (tradeIndex < 0 || tradeIndex >= this.trades.length) return false;
        
        const trade = this.trades[tradeIndex];
        
        // Check cooldown
        const cooldownKey = `${trade.buy}_${trade.sell}`;
        if (this.tradeCooldowns.has(cooldownKey)) {
            const remaining = this.tradeCooldowns.get(cooldownKey) - Date.now();
            if (remaining > 0) return false;
        }
        
        // Check if player has required items
        const buyItem = ITEMS[trade.buy];
        const playerHas = player.countItem(trade.buy);
        
        if (playerHas < trade.buyQty) return false;
        
        // Execute trade
        player.removeItem(trade.buy, trade.buyQty);
        player.addItem(trade.sell, trade.sellQty);
        
        // Price in coins (if applicable)
        if (trade.sellPrice > 0) {
            player.removeItem('silver_coin', trade.sellPrice);
        }
        
        // Experience and cooldown
        this.experience++;
        if (this.experience >= this.tradeLevel * 10) {
            this.tradeLevel++;
            this.experience = 0;
            this.showDialogue('I have learned much from our trades!');
        }
        
        this.tradeCooldowns.set(cooldownKey, Date.now() + 60000); // 1 minute cooldown
        
        // Show feedback
        this.game.particles.emit(this.x, this.y, this.z + 1.5, '#ffcc00', 5);
        
        return true;
    }

    showDialogue(text) {
        // Add to game's notification system
        if (this.game.ui) {
            this.game.ui.showMessage(`${this.emoji} ${this.name}: "${text}"`, 3000);
        }
    }

    // Combat
    takeDamage(amount, source) {
        this.health -= amount;
        this.game.particles.emit(this.x, this.y, this.z + 1, '#ff0000', 5);
        
        if (source) {
            this.memory.lastThreat = { x: source.x, y: source.y, z: source.z };
            this.memory.threatTimer = 15;
            this.setState(NPC_STATES.FLEEING);
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.game.particles.emit(this.x, this.y, this.z + 1, '#ffffff', 15);
        
        // Remove from entities
        const index = this.game.entities.indexOf(this);
        if (index !== -1) {
            this.game.entities.splice(index, 1);
        }
        
        // Notify village system
        if (this.game.villageSystem) {
            this.game.villageSystem.onVillagerDeath(this);
        }
    }

    // Serialization
    serialize() {
        return {
            type: 'villager',
            x: this.x,
            y: this.y,
            z: this.z,
            profession: this.profession.id,
            name: this.name,
            health: this.health,
            homePos: this.homePos,
            workPos: this.workPos,
            tradeLevel: this.tradeLevel,
            experience: this.experience
        };
    }

    static deserialize(game, data) {
        const professionKey = Object.keys(VILLAGER_PROFESSIONS).find(
            k => VILLAGER_PROFESSIONS[k].id === data.profession
        ) || 'FARMER';
        
        const villager = new Villager(game, data.x, data.y, data.z, professionKey);
        villager.name = data.name;
        villager.health = data.health;
        villager.homePos = data.homePos;
        villager.workPos = data.workPos;
        villager.tradeLevel = data.tradeLevel || 1;
        villager.experience = data.experience || 0;
        
        return villager;
    }
}

// Village System - Manages village generation and villager spawning
export class VillageSystem {
    constructor(game) {
        this.game = game;
        this.villages = new Map(); // chunkKey -> Village
        this.maxVillagersPerVillage = 8;
        this.villageSpawnChance = 0.05; // 5% per chunk
    }

    init() {
        console.log('Village System initialized');
    }

    update(deltaTime) {
        // Update villages (spawn villagers, etc.)
        for (const village of this.villages.values()) {
            this.updateVillage(village, deltaTime);
        }
    }

    checkChunkForVillage(chunkX, chunkY) {
        const key = `${chunkX},${chunkY}`;
        if (this.villages.has(key)) return;
        
        // Deterministic random based on chunk position
        const seed = (chunkX * 73856093) ^ (chunkY * 19349663);
        const random = Math.abs(Math.sin(seed)) % 1;
        
        if (random < this.villageSpawnChance) {
            this.generateVillage(chunkX, chunkY);
        }
    }

    generateVillage(chunkX, chunkY) {
        const key = `${chunkX},${chunkY}`;
        const centerX = chunkX * CONFIG.CHUNK_SIZE + CONFIG.CHUNK_SIZE / 2;
        const centerY = chunkY * CONFIG.CHUNK_SIZE + CONFIG.CHUNK_SIZE / 2;
        const centerZ = this.game.world.getHeight(Math.floor(centerX), Math.floor(centerY)) + 1;
        
        const village = {
            key,
            centerX,
            centerY,
            centerZ,
            villagers: [],
            buildings: [],
            reputation: 0
        };
        
        // Generate village structures
        this.generateVillageStructures(village);
        
        // Spawn initial villagers
        this.spawnInitialVillagers(village);
        
        this.villages.set(key, village);
        console.log(`Village generated at chunk (${chunkX}, ${chunkY})`);
    }

    generateVillageStructures(village) {
        // Simple structure placement
        const structures = [
            { type: 'house', offset: { x: 0, y: 0 } },
            { type: 'house', offset: { x: 5, y: 0 } },
            { type: 'house', offset: { x: -5, y: 0 } },
            { type: 'market', offset: { x: 0, y: 5 } },
            { type: 'well', offset: { x: 0, y: -3 } }
        ];
        
        for (const struct of structures) {
            const sx = Math.floor(village.centerX + struct.offset.x);
            const sy = Math.floor(village.centerY + struct.offset.y);
            const sz = this.game.world.getHeight(sx, sy);
            
            village.buildings.push({
                type: struct.type,
                x: sx,
                y: sy,
                z: sz
            });
            
            // Place structure blocks
            this.placeStructure(struct.type, sx, sy, sz);
        }
    }

    placeStructure(type, x, y, z) {
        const world = this.game.world;
        
        switch (type) {
            case 'house':
                // Simple 5x5x3 house
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        // Floor
                        world.setBlock(x + dx, y + dy, z, BLOCKS.PLANKS);
                        // Walls (edges only)
                        if (dx === -2 || dx === 2 || dy === -2 || dy === 2) {
                            world.setBlock(x + dx, y + dy, z + 1, BLOCKS.PLANKS);
                            world.setBlock(x + dx, y + dy, z + 2, BLOCKS.PLANKS);
                        }
                        // Roof
                        world.setBlock(x + dx, y + dy, z + 3, BLOCKS.THATCH);
                    }
                }
                // Door opening
                world.setBlock(x, y - 2, z + 1, BLOCKS.AIR);
                world.setBlock(x, y - 2, z + 2, BLOCKS.AIR);
                break;
                
            case 'market':
                // Market stall
                for (let dx = -1; dx <= 1; dx++) {
                    world.setBlock(x + dx, y, z, BLOCKS.PLANKS);
                    world.setBlock(x + dx, y, z + 1, BLOCKS.FENCE);
                }
                world.setBlock(x, y, z + 2, BLOCKS.MARKET_STALL);
                break;
                
            case 'well':
                // Simple well
                world.setBlock(x, y, z, BLOCKS.COBBLESTONE);
                world.setBlock(x, y, z + 1, BLOCKS.WELL);
                break;
        }
    }

    spawnInitialVillagers(village) {
        const professions = ['FARMER', 'BLACKSMITH', 'MERCHANT', 'GUARD', 'HERBALIST'];
        const numVillagers = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numVillagers; i++) {
            const profession = professions[i % professions.length];
            const offsetX = (Math.random() - 0.5) * 8;
            const offsetY = (Math.random() - 0.5) * 8;
            const vx = village.centerX + offsetX;
            const vy = village.centerY + offsetY;
            const vz = this.game.world.getHeight(Math.floor(vx), Math.floor(vy)) + 1;
            
            const villager = new Villager(this.game, vx, vy, vz, profession);
            villager.homePos = { x: vx, y: vy, z: vz };
            
            // Assign work position if applicable
            const workBuilding = village.buildings.find(b => 
                (profession === 'MERCHANT' && b.type === 'market') ||
                (profession === 'BLACKSMITH' && b.type === 'forge')
            );
            if (workBuilding) {
                villager.workPos = { x: workBuilding.x, y: workBuilding.y, z: workBuilding.z + 1 };
            }
            
            village.villagers.push(villager);
            this.game.entities.push(villager);
        }
    }

    updateVillage(village, deltaTime) {
        // Respawn villagers if population low
        const aliveVillagers = village.villagers.filter(v => !v.isDead);
        village.villagers = aliveVillagers;
        
        if (aliveVillagers.length < 2 && Math.random() < 0.001) {
            // Spawn a new villager
            const profession = Object.keys(VILLAGER_PROFESSIONS)[
                Math.floor(Math.random() * Object.keys(VILLAGER_PROFESSIONS).length)
            ];
            const vx = village.centerX + (Math.random() - 0.5) * 8;
            const vy = village.centerY + (Math.random() - 0.5) * 8;
            const vz = this.game.world.getHeight(Math.floor(vx), Math.floor(vy)) + 1;
            
            const villager = new Villager(this.game, vx, vy, vz, profession);
            villager.homePos = { x: vx, y: vy, z: vz };
            
            village.villagers.push(villager);
            this.game.entities.push(villager);
        }
    }

    onVillagerDeath(villager) {
        // Find village and decrease reputation
        for (const village of this.villages.values()) {
            if (village.villagers.includes(villager)) {
                village.reputation -= 10;
                break;
            }
        }
    }

    getVillageAt(x, y) {
        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE);
        const chunkY = Math.floor(y / CONFIG.CHUNK_SIZE);
        return this.villages.get(`${chunkX},${chunkY}`);
    }

    getNearestVillager(x, y, z, maxDist = 10) {
        let nearest = null;
        let nearestDist = maxDist;
        
        for (const entity of this.game.entities) {
            if (entity instanceof Villager && !entity.isDead) {
                const dist = Math.hypot(entity.x - x, entity.y - y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = entity;
                }
            }
        }
        
        return nearest;
    }

    // Serialization
    serialize() {
        return {
            villages: Array.from(this.villages.entries()).map(([key, village]) => ({
                key,
                centerX: village.centerX,
                centerY: village.centerY,
                centerZ: village.centerZ,
                buildings: village.buildings,
                reputation: village.reputation,
                villagers: village.villagers.map(v => v.serialize())
            }))
        };
    }

    deserialize(data) {
        if (!data || !data.villages) return;
        
        this.villages.clear();
        
        for (const vData of data.villages) {
            const village = {
                key: vData.key,
                centerX: vData.centerX,
                centerY: vData.centerY,
                centerZ: vData.centerZ,
                buildings: vData.buildings,
                reputation: vData.reputation,
                villagers: []
            };
            
            for (const vdData of vData.villagers) {
                const villager = Villager.deserialize(this.game, vdData);
                village.villagers.push(villager);
                this.game.entities.push(villager);
            }
            
            this.villages.set(vData.key, village);
        }
    }

    reset() {
        // Remove all villagers from entities
        this.game.entities = this.game.entities.filter(e => !(e instanceof Villager));
        this.villages.clear();
    }
}
