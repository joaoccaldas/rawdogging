// Ambient Wildlife System - Passive creatures that bring the world to life
import { CONFIG } from '../config.js';

// Wildlife types
export const WILDLIFE_TYPES = {
    deer: {
        name: 'Deer',
        sprite: '🦌',
        health: 20,
        speed: 4,
        fleeSpeed: 8,
        detectionRange: 15,
        fleeRange: 25,
        behavior: 'grazer',
        drops: [
            { item: 'raw_meat', min: 1, max: 3 },
            { item: 'leather', min: 1, max: 2 },
            { item: 'bone', min: 0, max: 2 }
        ],
        biomes: ['plains', 'forest'],
        groupSize: [2, 5],
        sound: 'animal_ambient'
    },
    rabbit: {
        name: 'Rabbit',
        sprite: '🐇',
        health: 5,
        speed: 3,
        fleeSpeed: 10,
        detectionRange: 10,
        fleeRange: 20,
        behavior: 'skittish',
        drops: [
            { item: 'raw_meat', min: 1, max: 1 },
            { item: 'fur', min: 1, max: 1 }
        ],
        biomes: ['plains', 'forest', 'tundra'],
        groupSize: [1, 3],
        sound: null
    },
    fish: {
        name: 'Fish',
        sprite: '🐟',
        health: 3,
        speed: 3,
        fleeSpeed: 6,
        detectionRange: 5,
        fleeRange: 10,
        behavior: 'swimmer',
        drops: [
            { item: 'raw_fish', min: 1, max: 2 }
        ],
        biomes: ['ocean', 'swamp', 'beach'],
        groupSize: [3, 8],
        waterOnly: true,
        sound: null
    },
    bird: {
        name: 'Bird',
        sprite: '🐦',
        health: 3,
        speed: 5,
        fleeSpeed: 12,
        detectionRange: 12,
        fleeRange: 30,
        behavior: 'flyer',
        drops: [
            { item: 'feather', min: 1, max: 3 }
        ],
        biomes: ['plains', 'forest', 'beach', 'mountains'],
        groupSize: [3, 7],
        canFly: true,
        sound: 'bird_chirp'
    },
    turtle: {
        name: 'Turtle',
        sprite: '🐢',
        health: 15,
        speed: 1,
        fleeSpeed: 1.5,
        detectionRange: 5,
        fleeRange: 8,
        behavior: 'slow',
        drops: [
            { item: 'raw_meat', min: 1, max: 2 },
            { item: 'turtle_shell', min: 1, max: 1 }
        ],
        biomes: ['beach', 'swamp'],
        groupSize: [1, 2],
        sound: null
    },
    butterfly: {
        name: 'Butterfly',
        sprite: '🦋',
        health: 1,
        speed: 2,
        fleeSpeed: 4,
        detectionRange: 3,
        fleeRange: 8,
        behavior: 'flutter',
        drops: [],
        biomes: ['plains', 'forest'],
        groupSize: [2, 6],
        canFly: true,
        decorative: true, // Cannot be killed
        sound: null
    },
    frog: {
        name: 'Frog',
        sprite: '🐸',
        health: 5,
        speed: 2,
        fleeSpeed: 5,
        detectionRange: 6,
        fleeRange: 12,
        behavior: 'hopper',
        drops: [
            { item: 'slime', min: 1, max: 1 }
        ],
        biomes: ['swamp'],
        groupSize: [2, 5],
        sound: 'frog_croak'
    },
    crab: {
        name: 'Crab',
        sprite: '🦀',
        health: 8,
        speed: 2,
        fleeSpeed: 3,
        detectionRange: 6,
        fleeRange: 10,
        behavior: 'scuttler',
        drops: [
            { item: 'raw_meat', min: 1, max: 1 },
            { item: 'crab_claw', min: 0, max: 2 }
        ],
        biomes: ['beach'],
        groupSize: [2, 4],
        sound: null
    },
    penguin: {
        name: 'Penguin',
        sprite: '🐧',
        health: 12,
        speed: 2,
        fleeSpeed: 4,
        detectionRange: 8,
        fleeRange: 15,
        behavior: 'waddle',
        drops: [
            { item: 'raw_meat', min: 1, max: 2 },
            { item: 'feather', min: 1, max: 2 }
        ],
        biomes: ['tundra'],
        groupSize: [4, 10],
        sound: null
    },
    lizard: {
        name: 'Lizard',
        sprite: '🦎',
        health: 5,
        speed: 4,
        fleeSpeed: 8,
        detectionRange: 8,
        fleeRange: 15,
        behavior: 'basker',
        drops: [
            { item: 'raw_meat', min: 1, max: 1 },
            { item: 'leather', min: 0, max: 1 }
        ],
        biomes: ['desert', 'volcanic'],
        groupSize: [1, 3],
        sound: null
    }
};

// Individual wildlife creature
class WildlifeCreature {
    constructor(type, x, y, z) {
        this.type = type;
        this.config = WILDLIFE_TYPES[type];
        
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.alive = true;
        
        // AI state
        this.state = 'idle'; // idle, wander, flee, swim
        this.stateTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.fleeFrom = null;
        
        // Animation
        this.animTimer = Math.random() * Math.PI * 2;
        this.facing = Math.random() > 0.5 ? 1 : -1;
    }
    
    update(deltaTime, player, world) {
        if (!this.alive) return;
        
        this.animTimer += deltaTime * 3;
        this.stateTimer -= deltaTime;
        
        // Check for player proximity
        const distToPlayer = this.distanceTo(player);
        
        // Flee behavior
        if (distToPlayer < this.config.detectionRange && !this.config.decorative) {
            this.state = 'flee';
            this.fleeFrom = { x: player.x, y: player.y };
            this.stateTimer = 2;
        }
        
        // State machine
        switch (this.state) {
            case 'idle':
                this.updateIdle(deltaTime);
                break;
            case 'wander':
                this.updateWander(deltaTime, world);
                break;
            case 'flee':
                this.updateFlee(deltaTime, player, world);
                break;
        }
        
        // Apply movement
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Flying/swimming creatures
        if (this.config.canFly) {
            this.z += this.vz * deltaTime;
            this.z = Math.max(5, Math.min(30, this.z));
        } else if (this.config.waterOnly) {
            // Fish stay in water
            if (world) {
                const groundZ = this.findWaterSurface(world);
                this.z = groundZ - 1;
            }
        } else {
            // Ground creatures follow terrain
            if (world) {
                const groundZ = this.findGroundLevel(world);
                this.z = groundZ + 0.5;
            }
        }
        
        // Friction
        this.vx *= 0.9;
        this.vy *= 0.9;
        this.vz *= 0.9;
    }
    
    updateIdle(deltaTime) {
        // Occasionally start wandering
        if (this.stateTimer <= 0) {
            if (Math.random() < 0.3) {
                this.state = 'wander';
                this.stateTimer = 2 + Math.random() * 3;
                
                // Pick random nearby target
                const angle = Math.random() * Math.PI * 2;
                const dist = 3 + Math.random() * 5;
                this.targetX = this.x + Math.cos(angle) * dist;
                this.targetY = this.y + Math.sin(angle) * dist;
            } else {
                this.stateTimer = 1 + Math.random() * 2;
            }
        }
    }
    
    updateWander(deltaTime, world) {
        // Move toward target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.5) {
            const speed = this.config.speed;
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            this.facing = dx > 0 ? 1 : -1;
        } else {
            this.state = 'idle';
            this.stateTimer = 1 + Math.random() * 3;
        }
        
        // Hopping behavior
        if (this.config.behavior === 'hopper' && Math.random() < 0.1) {
            this.vz = 3;
        }
    }
    
    updateFlee(deltaTime, player, world) {
        if (!this.fleeFrom) {
            this.state = 'idle';
            return;
        }
        
        // Run away from threat
        const dx = this.x - this.fleeFrom.x;
        const dy = this.y - this.fleeFrom.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const speed = this.config.fleeSpeed;
            this.vx = (dx / dist) * speed;
            this.vy = (dy / dist) * speed;
            this.facing = dx > 0 ? 1 : -1;
        }
        
        // Stop fleeing after distance or time
        const playerDist = this.distanceTo(player);
        if (playerDist > this.config.fleeRange || this.stateTimer <= 0) {
            this.state = 'idle';
            this.fleeFrom = null;
            this.stateTimer = 2;
        }
    }
    
    distanceTo(entity) {
        if (!entity) return Infinity;
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    findGroundLevel(world) {
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        
        for (let z = Math.floor(this.z) + 2; z >= 0; z--) {
            const block = world.getBlock?.(bx, by, z);
            if (block && block !== 'air' && block !== 'water') {
                return z + 1;
            }
        }
        return 10;
    }
    
    findWaterSurface(world) {
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        
        for (let z = 30; z >= 0; z--) {
            const block = world.getBlock?.(bx, by, z);
            if (block === 'water') {
                return z;
            }
        }
        return 10;
    }
    
    takeDamage(amount) {
        if (this.config.decorative) return; // Butterflies can't be hurt
        
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            this.state = 'flee';
            this.stateTimer = 3;
        }
    }
    
    die() {
        this.alive = false;
        // Drops are handled by WildlifeSystem
    }
    
    getDrops() {
        const drops = [];
        for (const drop of this.config.drops) {
            const count = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
            if (count > 0) {
                drops.push({ item: drop.item, count });
            }
        }
        return drops;
    }
    
    render(ctx, camera) {
        const screenPos = camera.worldToScreen(this.x, this.y, this.z);
        
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        
        // Flip based on facing
        ctx.scale(this.facing, 1);
        
        // Bobbing animation
        const bob = Math.sin(this.animTimer) * 2;
        ctx.translate(0, bob);
        
        // Draw sprite
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.sprite, 0, 0);
        
        ctx.restore();
    }
}

export class WildlifeSystem {
    constructor(game) {
        this.game = game;
        this.creatures = [];
        this.maxCreatures = 50;
        this.spawnRadius = 40;
        this.despawnRadius = 60;
        this.spawnCooldown = 0;
    }
    
    update(deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        // Spawn new wildlife
        this.spawnCooldown -= deltaTime;
        if (this.spawnCooldown <= 0 && this.creatures.length < this.maxCreatures) {
            this.trySpawnWildlife(player);
            this.spawnCooldown = 1 + Math.random() * 2;
        }
        
        // Update creatures
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            
            // Despawn if too far
            const dist = creature.distanceTo(player);
            if (dist > this.despawnRadius) {
                this.creatures.splice(i, 1);
                continue;
            }
            
            // Update creature
            creature.update(deltaTime, player, this.game.world);
            
            // Remove dead creatures and spawn drops
            if (!creature.alive) {
                this.spawnDrops(creature);
                this.creatures.splice(i, 1);
                
                // Track statistic
                if (this.game.statistics) {
                    this.game.statistics.onEnemyKilled(creature.type);
                }
            }
        }
    }
    
    trySpawnWildlife(player) {
        // Get current biome
        const biome = this.game.world?.getBiome?.(player.x, player.y) || 'plains';
        
        // Find wildlife types for this biome
        const validTypes = Object.entries(WILDLIFE_TYPES)
            .filter(([_, config]) => config.biomes.includes(biome))
            .map(([type]) => type);
        
        if (validTypes.length === 0) return;
        
        // Pick random type
        const type = validTypes[Math.floor(Math.random() * validTypes.length)];
        const config = WILDLIFE_TYPES[type];
        
        // Pick spawn position
        const angle = Math.random() * Math.PI * 2;
        const dist = this.spawnRadius * (0.5 + Math.random() * 0.5);
        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;
        
        // Find appropriate Z level
        let z = 15;
        if (this.game.world) {
            if (config.waterOnly) {
                // Check for water
                for (let checkZ = 20; checkZ >= 0; checkZ--) {
                    if (this.game.world.getBlock?.(Math.floor(x), Math.floor(y), checkZ) === 'water') {
                        z = checkZ;
                        break;
                    }
                }
            } else {
                // Find ground
                for (let checkZ = 25; checkZ >= 0; checkZ--) {
                    const block = this.game.world.getBlock?.(Math.floor(x), Math.floor(y), checkZ);
                    if (block && block !== 'air' && block !== 'water') {
                        z = checkZ + 1;
                        break;
                    }
                }
            }
        }
        
        // Flying creatures spawn higher
        if (config.canFly) {
            z += 5 + Math.random() * 10;
        }
        
        // Spawn group
        const groupSize = config.groupSize[0] + Math.floor(Math.random() * (config.groupSize[1] - config.groupSize[0] + 1));
        
        for (let i = 0; i < groupSize; i++) {
            if (this.creatures.length >= this.maxCreatures) break;
            
            const offsetX = (Math.random() - 0.5) * 5;
            const offsetY = (Math.random() - 0.5) * 5;
            
            const creature = new WildlifeCreature(type, x + offsetX, y + offsetY, z);
            this.creatures.push(creature);
        }
    }
    
    spawnDrops(creature) {
        const drops = creature.getDrops();
        
        for (const drop of drops) {
            // Add to player inventory if close, otherwise spawn item entity
            if (this.game.inventory) {
                this.game.inventory.addItem(drop.item, drop.count);
            }
            
            // Spawn particles
            if (this.game.particles) {
                this.game.particles.spawn(creature.x, creature.y, creature.z, 'item', 3);
            }
        }
    }
    
    // Get creature at position (for player attacks)
    getCreatureAt(x, y, z, radius = 1.5) {
        for (const creature of this.creatures) {
            const dx = creature.x - x;
            const dy = creature.y - y;
            const dz = creature.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < radius) {
                return creature;
            }
        }
        return null;
    }
    
    // Get creatures in area
    getCreaturesInArea(x, y, radius) {
        return this.creatures.filter(c => {
            const dx = c.x - x;
            const dy = c.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });
    }
    
    render(ctx, camera) {
        // Sort by Y for proper depth
        const sorted = [...this.creatures].sort((a, b) => b.y - a.y);
        
        for (const creature of sorted) {
            creature.render(ctx, camera);
        }
    }
    
    // Serialize for save (optional - wildlife respawns naturally)
    serialize() {
        return {
            creatures: this.creatures.map(c => ({
                type: c.type,
                x: c.x,
                y: c.y,
                z: c.z,
                health: c.health
            }))
        };
    }
    
    deserialize(data) {
        if (!data || !data.creatures) return;
        
        this.creatures = data.creatures.map(c => {
            const creature = new WildlifeCreature(c.type, c.x, c.y, c.z);
            creature.health = c.health;
            return creature;
        });
    }
    
    // Clear all wildlife
    clear() {
        this.creatures = [];
    }
}

// Export items that wildlife can drop
export const WILDLIFE_ITEMS = {
    feather: {
        name: 'Feather',
        type: 'material',
        stackSize: 64,
        description: 'A soft feather. Used for arrows and pillows.'
    },
    turtle_shell: {
        name: 'Turtle Shell',
        type: 'material',
        stackSize: 16,
        description: 'A sturdy shell. Can be crafted into armor.'
    },
    slime: {
        name: 'Slime',
        type: 'material',
        stackSize: 64,
        description: 'Sticky slime. Used in various crafts.'
    },
    crab_claw: {
        name: 'Crab Claw',
        type: 'material',
        stackSize: 32,
        description: 'A sharp claw. Makes a decent weapon component.'
    },
    fur: {
        name: 'Fur',
        type: 'material',
        stackSize: 64,
        description: 'Warm fur. Great for cold weather clothing.'
    }
};
