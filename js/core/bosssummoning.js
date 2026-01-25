// Boss Summoning System - Craft totems to summon bosses
import { CONFIG } from '../config.js';

export const BOSS_DEFINITIONS = {
    PRIMAL_MAMMOTH: {
        id: 'primal_mammoth',
        name: 'Primal Mammoth',
        icon: '🦣',
        description: 'An ancient mammoth of immense power',
        summonItem: 'mammoth_totem',
        summonRecipe: {
            mammoth_tusk: 4,
            ancient_bone: 10,
            primal_essence: 2
        },
        stats: {
            health: 1000,
            damage: 40,
            defense: 20,
            speed: 1.5
        },
        attacks: ['charge', 'stomp', 'tusk_swipe'],
        phases: 3,
        minLevel: 10,
        rewards: {
            xp: 5000,
            loot: 'boss_mammoth'
        }
    },
    SHADOW_SABERTOOTH: {
        id: 'shadow_sabertooth',
        name: 'Shadow Sabertooth',
        icon: '🐆',
        description: 'A spectral beast from the spirit realm',
        summonItem: 'sabertooth_totem',
        summonRecipe: {
            fang: 8,
            shadow_essence: 3,
            bone: 20
        },
        stats: {
            health: 750,
            damage: 60,
            defense: 10,
            speed: 4
        },
        attacks: ['pounce', 'fury_swipes', 'shadow_dash'],
        phases: 2,
        minLevel: 15,
        rewards: {
            xp: 6000,
            loot: 'boss_sabertooth'
        }
    },
    ELDER_BEAR: {
        id: 'elder_bear',
        name: 'Elder Cave Bear',
        icon: '🐻',
        description: 'Guardian of the ancient caves',
        summonItem: 'bear_totem',
        summonRecipe: {
            bear_claw: 6,
            cave_crystal: 5,
            ancient_fur: 3
        },
        stats: {
            health: 1200,
            damage: 50,
            defense: 25,
            speed: 2
        },
        attacks: ['maul', 'ground_slam', 'roar'],
        phases: 3,
        minLevel: 20,
        rewards: {
            xp: 8000,
            loot: 'boss_bear'
        }
    },
    STORM_EAGLE: {
        id: 'storm_eagle',
        name: 'Storm Eagle',
        icon: '🦅',
        description: 'Master of lightning and wind',
        summonItem: 'eagle_totem',
        summonRecipe: {
            eagle_feather: 10,
            storm_crystal: 3,
            sky_essence: 2
        },
        stats: {
            health: 600,
            damage: 35,
            defense: 5,
            speed: 6
        },
        attacks: ['dive_bomb', 'lightning_strike', 'wind_gust'],
        phases: 2,
        minLevel: 12,
        rewards: {
            xp: 4500,
            loot: 'boss_eagle'
        }
    },
    ANCIENT_SERPENT: {
        id: 'ancient_serpent',
        name: 'Ancient Serpent',
        icon: '🐍',
        description: 'A venomous titan from the depths',
        summonItem: 'serpent_totem',
        summonRecipe: {
            serpent_scale: 15,
            venom_gland: 5,
            ancient_eye: 2
        },
        stats: {
            health: 800,
            damage: 30,
            defense: 15,
            speed: 3
        },
        attacks: ['constrict', 'venom_spray', 'tail_whip'],
        phases: 3,
        minLevel: 18,
        rewards: {
            xp: 7000,
            loot: 'boss_serpent'
        }
    }
};

export const BOSS_LOOT_TABLES = {
    boss_mammoth: {
        guaranteed: [
            { item: 'mammoth_heart', quantity: 1 },
            { item: 'legendary_tusk', quantity: 2 }
        ],
        random: [
            { item: 'primal_essence', quantity: [3, 6], weight: 40 },
            { item: 'ancient_armor_piece', quantity: [1, 1], weight: 20 },
            { item: 'mammoth_hide', quantity: [5, 10], weight: 30 },
            { item: 'titan_bone', quantity: [2, 4], weight: 10 }
        ]
    },
    boss_sabertooth: {
        guaranteed: [
            { item: 'shadow_fang', quantity: 2 },
            { item: 'spirit_core', quantity: 1 }
        ],
        random: [
            { item: 'shadow_essence', quantity: [4, 8], weight: 35 },
            { item: 'spectral_cloak_piece', quantity: [1, 1], weight: 15 },
            { item: 'ethereal_fur', quantity: [3, 6], weight: 35 },
            { item: 'void_crystal', quantity: [1, 2], weight: 15 }
        ]
    },
    boss_bear: {
        guaranteed: [
            { item: 'bear_soul', quantity: 1 },
            { item: 'cave_guardian_claw', quantity: 4 }
        ],
        random: [
            { item: 'ancient_fur', quantity: [5, 10], weight: 40 },
            { item: 'earth_essence', quantity: [3, 5], weight: 25 },
            { item: 'guardian_armor_piece', quantity: [1, 1], weight: 15 },
            { item: 'cave_crystal', quantity: [5, 10], weight: 20 }
        ]
    },
    boss_eagle: {
        guaranteed: [
            { item: 'storm_heart', quantity: 1 },
            { item: 'divine_feather', quantity: 3 }
        ],
        random: [
            { item: 'lightning_essence', quantity: [3, 6], weight: 35 },
            { item: 'sky_armor_piece', quantity: [1, 1], weight: 15 },
            { item: 'wind_crystal', quantity: [3, 5], weight: 30 },
            { item: 'storm_crystal', quantity: [2, 4], weight: 20 }
        ]
    },
    boss_serpent: {
        guaranteed: [
            { item: 'serpent_eye', quantity: 2 },
            { item: 'venom_heart', quantity: 1 }
        ],
        random: [
            { item: 'serpent_scale', quantity: [10, 20], weight: 35 },
            { item: 'poison_essence', quantity: [4, 7], weight: 25 },
            { item: 'serpent_armor_piece', quantity: [1, 1], weight: 15 },
            { item: 'ancient_venom', quantity: [2, 4], weight: 25 }
        ]
    }
};

class Boss {
    constructor(definition, x, y, z) {
        this.id = `boss_${Date.now()}`;
        this.definition = definition;
        
        this.name = definition.name;
        this.icon = definition.icon;
        
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Stats
        this.maxHealth = definition.stats.health;
        this.health = this.maxHealth;
        this.damage = definition.stats.damage;
        this.defense = definition.stats.defense;
        this.speed = definition.stats.speed;
        
        // Phase system
        this.currentPhase = 1;
        this.maxPhases = definition.phases;
        
        // Attack system
        this.attacks = definition.attacks;
        this.currentAttack = null;
        this.attackCooldown = 0;
        this.attackTimer = 0;
        
        // State
        this.isEnraged = false;
        this.target = null;
        this.dead = false;
        
        // Animation
        this.animationTimer = 0;
        this.hitFlashTimer = 0;
    }
    
    get healthPercent() {
        return this.health / this.maxHealth;
    }
    
    get phaseThreshold() {
        return (this.maxPhases - this.currentPhase + 1) / this.maxPhases;
    }
    
    update(deltaTime, game) {
        if (this.dead) return;
        
        this.animationTimer += deltaTime;
        
        // Update hit flash
        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= deltaTime;
        }
        
        // Find target
        if (!this.target || this.target.dead) {
            this.target = game.player;
        }
        
        // Check phase transition
        this.checkPhaseTransition();
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Perform AI
        this.updateAI(deltaTime, game);
    }
    
    checkPhaseTransition() {
        const expectedPhase = Math.ceil(this.healthPercent * this.maxPhases);
        const newPhase = Math.max(1, this.maxPhases - expectedPhase + 1);
        
        if (newPhase > this.currentPhase) {
            this.currentPhase = newPhase;
            this.onPhaseChange();
        }
    }
    
    onPhaseChange() {
        // Enrage in final phase
        if (this.currentPhase === this.maxPhases) {
            this.isEnraged = true;
            this.damage *= 1.5;
            this.speed *= 1.3;
        }
    }
    
    updateAI(deltaTime, game) {
        if (!this.target) return;
        
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Move towards target
        if (dist > 2) {
            const moveSpeed = this.speed * (this.isEnraged ? 1.3 : 1);
            this.x += (dx / dist) * moveSpeed * deltaTime;
            this.y += (dy / dist) * moveSpeed * deltaTime;
        }
        
        // Attack if in range
        if (dist <= 3 && this.attackCooldown <= 0) {
            this.performAttack(game);
        }
    }
    
    performAttack(game) {
        const attackIndex = Math.floor(Math.random() * this.attacks.length);
        this.currentAttack = this.attacks[attackIndex];
        
        let damage = this.damage;
        
        // Attack-specific modifiers
        switch (this.currentAttack) {
            case 'charge':
            case 'pounce':
            case 'dive_bomb':
                damage *= 1.5;
                break;
            case 'stomp':
            case 'ground_slam':
                // AOE damage
                damage *= 0.8;
                break;
            case 'fury_swipes':
                // Multiple hits
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        this.target?.takeDamage?.(Math.floor(damage * 0.4));
                    }, i * 200);
                }
                this.attackCooldown = 2;
                return;
        }
        
        // Apply damage
        this.target?.takeDamage?.(Math.floor(damage));
        
        // Set cooldown
        this.attackCooldown = this.isEnraged ? 1.5 : 2.5;
        
        // Visual feedback
        game.ui?.showMessage(`${this.icon} ${this.name} uses ${this.currentAttack}!`, 1500);
        game.camera?.shake?.(0.3, 5);
    }
    
    takeDamage(amount) {
        // Apply defense
        const actualDamage = Math.max(1, amount - this.defense);
        this.health -= actualDamage;
        
        // Hit flash
        this.hitFlashTimer = 0.1;
        
        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
        
        return actualDamage;
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
}

export class BossSummoningSystem {
    constructor(game) {
        this.game = game;
        
        // Active bosses
        this.activeBosses = new Map();
        
        // Boss arena bounds
        this.arenaRadius = 30;
        
        // Summon cooldown
        this.summonCooldown = 0;
        this.summonCooldownDuration = 60;
        
        // Defeated bosses (for tracking)
        this.defeatedBosses = new Map();
    }
    
    update(deltaTime) {
        // Update summon cooldown
        if (this.summonCooldown > 0) {
            this.summonCooldown -= deltaTime;
        }
        
        // Update all active bosses
        for (const [id, boss] of this.activeBosses.entries()) {
            boss.update(deltaTime, this.game);
            
            // Check if defeated
            if (boss.dead) {
                this.onBossDefeated(boss);
                this.activeBosses.delete(id);
            }
        }
    }
    
    // Check if player can summon a boss
    canSummon(bossId) {
        const definition = BOSS_DEFINITIONS[bossId.toUpperCase()];
        if (!definition) return { can: false, reason: 'Unknown boss' };
        
        // Check cooldown
        if (this.summonCooldown > 0) {
            return { can: false, reason: 'Summoning on cooldown' };
        }
        
        // Check if another boss is active
        if (this.activeBosses.size > 0) {
            return { can: false, reason: 'Another boss is already active' };
        }
        
        // Check player level
        const playerLevel = this.game.player?.level || 1;
        if (playerLevel < definition.minLevel) {
            return { can: false, reason: `Requires level ${definition.minLevel}` };
        }
        
        // Check if player has totem
        if (!this.game.inventory?.hasItem(definition.summonItem, 1)) {
            return { can: false, reason: `Requires ${definition.summonItem}` };
        }
        
        return { can: true, reason: '' };
    }
    
    // Summon a boss
    summon(bossId) {
        const check = this.canSummon(bossId);
        if (!check.can) {
            this.game.ui?.showMessage(`❌ ${check.reason}`, 2000);
            return null;
        }
        
        const definition = BOSS_DEFINITIONS[bossId.toUpperCase()];
        
        // Consume totem
        this.game.inventory?.removeItem(definition.summonItem, 1);
        
        // Get summon position
        const player = this.game.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 10;
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;
        const z = player.z;
        
        // Create boss
        const boss = new Boss(definition, x, y, z);
        this.activeBosses.set(boss.id, boss);
        
        // Start cooldown
        this.summonCooldown = this.summonCooldownDuration;
        
        // Announcement
        this.game.ui?.showMessage(
            `${boss.icon} ${boss.name} has been summoned!`,
            5000
        );
        
        // Dramatic effect
        this.game.camera?.shake?.(0.5, 8);
        this.spawnSummonEffect(x, y, z);
        
        return boss;
    }
    
    // Spawn visual effect for summoning
    spawnSummonEffect(x, y, z) {
        if (!this.game.particles) return;
        
        // Dark swirling particles
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            this.game.particles.spawn(
                x + Math.cos(angle) * 3,
                y + Math.sin(angle) * 3,
                z,
                {
                    type: 'magic',
                    color: '#800080',
                    lifetime: 2,
                    velocity: {
                        x: -Math.cos(angle) * 2,
                        y: -Math.sin(angle) * 2,
                        z: Math.random() * 2
                    }
                }
            );
        }
    }
    
    // Handle boss defeat
    onBossDefeated(boss) {
        // Track defeat
        const defeatCount = (this.defeatedBosses.get(boss.definition.id) || 0) + 1;
        this.defeatedBosses.set(boss.definition.id, defeatCount);
        
        // Announcement
        this.game.ui?.showMessage(
            `🏆 ${boss.name} has been defeated!`,
            5000
        );
        
        // Grant rewards
        this.grantRewards(boss);
        
        // Victory effect
        this.game.camera?.shake?.(0.3, 4);
        this.spawnVictoryEffect(boss.x, boss.y, boss.z);
        
        // Achievement
        this.game.achievements?.incrementProgress?.('bosses_defeated', 1);
    }
    
    // Grant boss rewards
    grantRewards(boss) {
        const rewards = boss.definition.rewards;
        
        // XP
        if (rewards.xp) {
            this.game.player?.addExperience?.(rewards.xp);
        }
        
        // Loot
        if (rewards.loot && BOSS_LOOT_TABLES[rewards.loot]) {
            const lootTable = BOSS_LOOT_TABLES[rewards.loot];
            
            // Guaranteed drops
            for (const drop of lootTable.guaranteed) {
                this.game.spawnItem?.(drop.item, drop.quantity, boss.x, boss.y, boss.z);
            }
            
            // Random drops (roll 3-5 items)
            const numRolls = 3 + Math.floor(Math.random() * 3);
            const totalWeight = lootTable.random.reduce((sum, d) => sum + d.weight, 0);
            
            for (let i = 0; i < numRolls; i++) {
                let roll = Math.random() * totalWeight;
                for (const drop of lootTable.random) {
                    roll -= drop.weight;
                    if (roll <= 0) {
                        const [min, max] = drop.quantity;
                        const qty = min + Math.floor(Math.random() * (max - min + 1));
                        this.game.spawnItem?.(drop.item, qty, boss.x, boss.y, boss.z);
                        break;
                    }
                }
            }
        }
    }
    
    // Spawn victory effect
    spawnVictoryEffect(x, y, z) {
        if (!this.game.particles) return;
        
        // Golden sparkles
        for (let i = 0; i < 50; i++) {
            this.game.particles.spawn(
                x + (Math.random() - 0.5) * 4,
                y + (Math.random() - 0.5) * 4,
                z + Math.random() * 2,
                {
                    type: 'spark',
                    color: '#FFD700',
                    lifetime: 2,
                    velocity: {
                        x: (Math.random() - 0.5) * 5,
                        y: (Math.random() - 0.5) * 5,
                        z: Math.random() * 5
                    }
                }
            );
        }
    }
    
    // Craft a totem
    craftTotem(bossId) {
        const definition = BOSS_DEFINITIONS[bossId.toUpperCase()];
        if (!definition) return false;
        
        const recipe = definition.summonRecipe;
        const inventory = this.game.inventory;
        
        // Check if player has materials
        for (const [item, qty] of Object.entries(recipe)) {
            if (!inventory.hasItem(item, qty)) {
                this.game.ui?.showMessage(`❌ Missing ${qty}x ${item}`, 2000);
                return false;
            }
        }
        
        // Consume materials
        for (const [item, qty] of Object.entries(recipe)) {
            inventory.removeItem(item, qty);
        }
        
        // Give totem
        inventory.addItem(definition.summonItem, 1);
        
        this.game.ui?.showMessage(`✅ Crafted ${definition.summonItem}!`, 2000);
        return true;
    }
    
    // Get active boss
    getActiveBoss() {
        if (this.activeBosses.size === 0) return null;
        return this.activeBosses.values().next().value;
    }
    
    // Check if in boss fight
    isInBossFight() {
        return this.activeBosses.size > 0;
    }
    
    // Render bosses
    render(ctx, camera) {
        for (const boss of this.activeBosses.values()) {
            const screenPos = camera.worldToScreen(boss.x, boss.y, boss.z);
            
            // Boss body
            const flash = boss.hitFlashTimer > 0;
            ctx.fillStyle = flash ? '#FFFFFF' : (boss.isEnraged ? '#FF0000' : '#8B4513');
            
            const size = 30;
            ctx.fillRect(screenPos.x - size/2, screenPos.y - size, size, size);
            
            // Boss icon
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(boss.icon, screenPos.x, screenPos.y - size/2);
            
            // Health bar
            const barWidth = 60;
            const barHeight = 8;
            const barY = screenPos.y - size - 15;
            
            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(screenPos.x - barWidth/2, barY, barWidth, barHeight);
            
            // Health fill
            let healthColor = '#4CAF50';
            if (boss.healthPercent < 0.3) healthColor = '#FF0000';
            else if (boss.healthPercent < 0.6) healthColor = '#FFC107';
            
            ctx.fillStyle = healthColor;
            ctx.fillRect(screenPos.x - barWidth/2, barY, barWidth * boss.healthPercent, barHeight);
            
            // Border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenPos.x - barWidth/2, barY, barWidth, barHeight);
            
            // Phase indicator
            ctx.fillStyle = '#FFD700';
            ctx.font = '10px Arial';
            ctx.fillText(`Phase ${boss.currentPhase}/${boss.maxPhases}`, screenPos.x, barY - 8);
            
            // Name
            ctx.fillStyle = boss.isEnraged ? '#FF0000' : '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.fillText(boss.name, screenPos.x, screenPos.y + 15);
            
            // Enraged indicator
            if (boss.isEnraged) {
                ctx.fillStyle = '#FF0000';
                ctx.fillText('ENRAGED!', screenPos.x, screenPos.y + 28);
            }
        }
    }
    
    // Serialize
    serialize() {
        return {
            summonCooldown: this.summonCooldown,
            defeatedBosses: Array.from(this.defeatedBosses.entries())
        };
    }
    
    deserialize(data) {
        if (data?.summonCooldown !== undefined) {
            this.summonCooldown = data.summonCooldown;
        }
        if (data?.defeatedBosses) {
            this.defeatedBosses = new Map(data.defeatedBosses);
        }
    }
    
    reset() {
        this.activeBosses.clear();
        this.summonCooldown = 0;
        this.defeatedBosses.clear();
    }
}
