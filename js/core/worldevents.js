// World Events System - Random events like meteor showers, blood moons, migrations
import { CONFIG } from '../config.js';

export const EVENT_TYPES = {
    METEOR_SHOWER: {
        id: 'meteor_shower',
        name: 'Meteor Shower',
        icon: '☄️',
        duration: 60, // seconds
        chance: 0.001, // per update
        minDaysBetween: 5,
        nightOnly: true,
        description: 'Meteors fall from the sky, leaving rare materials!'
    },
    BLOOD_MOON: {
        id: 'blood_moon',
        name: 'Blood Moon',
        icon: '🌑',
        duration: 300, // full night
        chance: 0.0005,
        minDaysBetween: 7,
        nightOnly: true,
        description: 'Enemies are stronger and more numerous!'
    },
    MIGRATION: {
        id: 'migration',
        name: 'Animal Migration',
        icon: '🦌',
        duration: 180,
        chance: 0.002,
        minDaysBetween: 3,
        nightOnly: false,
        description: 'A herd of animals passes through the area!'
    },
    THUNDERSTORM: {
        id: 'thunderstorm',
        name: 'Thunderstorm',
        icon: '⛈️',
        duration: 120,
        chance: 0.003,
        minDaysBetween: 2,
        nightOnly: false,
        description: 'Dangerous lightning strikes the land!'
    },
    AURORA: {
        id: 'aurora',
        name: 'Aurora Borealis',
        icon: '🌌',
        duration: 180,
        chance: 0.001,
        minDaysBetween: 5,
        nightOnly: true,
        description: 'Beautiful lights boost experience gain!'
    },
    EARTHQUAKE: {
        id: 'earthquake',
        name: 'Earthquake',
        icon: '🌋',
        duration: 30,
        chance: 0.0008,
        minDaysBetween: 10,
        nightOnly: false,
        description: 'The ground shakes, revealing buried treasures!'
    },
    SOLAR_ECLIPSE: {
        id: 'solar_eclipse',
        name: 'Solar Eclipse',
        icon: '🌘',
        duration: 120,
        chance: 0.0003,
        minDaysBetween: 15,
        nightOnly: false,
        description: 'Darkness at noon! Strange creatures appear!'
    },
    SPIRIT_WIND: {
        id: 'spirit_wind',
        name: 'Spirit Wind',
        icon: '👻',
        duration: 90,
        chance: 0.001,
        minDaysBetween: 7,
        nightOnly: true,
        description: 'Ancestral spirits grant temporary power!'
    },
    HARVEST_MOON: {
        id: 'harvest_moon',
        name: 'Harvest Moon',
        icon: '🌕',
        duration: 300,
        chance: 0.0008,
        minDaysBetween: 10,
        nightOnly: true,
        description: 'Crops grow faster and yield more!'
    },
    PREDATOR_PACK: {
        id: 'predator_pack',
        name: 'Predator Pack',
        icon: '🐺',
        duration: 150,
        chance: 0.002,
        minDaysBetween: 4,
        nightOnly: false,
        description: 'A pack of predators hunts in the area!'
    }
};

export const EVENT_MODIFIERS = {
    meteor_shower: {
        spawnMeteors: true,
        meteorInterval: 3,
        meteorDrops: ['meteor_fragment', 'star_dust', 'ancient_ore']
    },
    blood_moon: {
        enemyDamageMultiplier: 1.5,
        enemyHealthMultiplier: 1.5,
        spawnRateMultiplier: 2.0,
        screenTint: { r: 0.3, g: 0, b: 0, a: 0.2 }
    },
    migration: {
        spawnAnimals: true,
        animalTypes: ['deer', 'rabbit', 'boar'],
        spawnCount: 20,
        direction: 'random'
    },
    thunderstorm: {
        lightningInterval: 5,
        lightningDamage: 30,
        rainMultiplier: 3.0,
        screenTint: { r: 0, g: 0, b: 0.1, a: 0.3 }
    },
    aurora: {
        xpMultiplier: 1.5,
        screenColors: ['#00FF00', '#00FFFF', '#FF00FF'],
        lightingEffect: true
    },
    earthquake: {
        screenShake: true,
        revealTreasures: true,
        treasureCount: 5,
        damageBuildings: false
    },
    solar_eclipse: {
        darkness: 0.8,
        spawnSpecial: true,
        specialEnemies: ['shadow_beast', 'eclipse_spirit']
    },
    spirit_wind: {
        buffPlayer: true,
        buffs: ['speed', 'strength', 'regeneration'],
        buffDuration: 120
    },
    harvest_moon: {
        cropGrowthMultiplier: 3.0,
        harvestYieldMultiplier: 2.0,
        screenTint: { r: 0.2, g: 0.1, b: 0, a: 0.1 }
    },
    predator_pack: {
        spawnPredators: true,
        predatorTypes: ['wolf', 'sabertooth'],
        spawnCount: 6,
        aggressive: true
    }
};

class ActiveEvent {
    constructor(type) {
        const eventType = EVENT_TYPES[type.toUpperCase()] || EVENT_TYPES.METEOR_SHOWER;
        
        this.id = `event_${Date.now()}`;
        this.type = eventType.id;
        this.name = eventType.name;
        this.icon = eventType.icon;
        this.description = eventType.description;
        
        this.duration = eventType.duration;
        this.timeRemaining = eventType.duration;
        this.modifiers = EVENT_MODIFIERS[eventType.id] || {};
        
        this.startTime = Date.now();
        this.actionTimer = 0;
    }
    
    update(deltaTime) {
        this.timeRemaining -= deltaTime;
        this.actionTimer += deltaTime;
        return this.timeRemaining > 0;
    }
    
    get progress() {
        return 1 - (this.timeRemaining / this.duration);
    }
    
    get isEnded() {
        return this.timeRemaining <= 0;
    }
}

export class WorldEventSystem {
    constructor(game) {
        this.game = game;
        
        // Currently active events
        this.activeEvents = new Map();
        
        // Event history (for cooldowns)
        this.eventHistory = new Map();
        
        // Current day (from game time)
        this.currentDay = 0;
        
        // Event check timer
        this.checkTimer = 0;
        this.checkInterval = 10; // Check every 10 seconds
        
        // Manual event queue
        this.eventQueue = [];
    }
    
    update(deltaTime) {
        // Update current day
        if (this.game.world?.timeOfDay !== undefined) {
            const dayLength = CONFIG?.DAY_LENGTH || 600;
            this.currentDay = Math.floor(this.game.world.timeOfDay / dayLength);
        }
        
        // Update active events
        for (const [id, event] of this.activeEvents.entries()) {
            if (!event.update(deltaTime)) {
                this.endEvent(id);
            } else {
                this.processEventEffects(event, deltaTime);
            }
        }
        
        // Check for new events
        this.checkTimer += deltaTime;
        if (this.checkTimer >= this.checkInterval) {
            this.checkTimer = 0;
            this.checkForRandomEvents();
        }
        
        // Process queued events
        if (this.eventQueue.length > 0) {
            const eventType = this.eventQueue.shift();
            this.startEvent(eventType);
        }
    }
    
    // Check if random events should start
    checkForRandomEvents() {
        const isNight = this.game.world?.isNightTime?.() || false;
        
        for (const [key, eventType] of Object.entries(EVENT_TYPES)) {
            // Skip if already active
            if (this.isEventActive(eventType.id)) continue;
            
            // Check night requirement
            if (eventType.nightOnly && !isNight) continue;
            
            // Check cooldown
            if (!this.canTriggerEvent(eventType.id, eventType.minDaysBetween)) continue;
            
            // Roll for event
            if (Math.random() < eventType.chance) {
                this.startEvent(eventType.id);
                break; // Only one new event per check
            }
        }
    }
    
    // Check if event can trigger (cooldown)
    canTriggerEvent(eventId, minDaysBetween) {
        const lastTriggered = this.eventHistory.get(eventId);
        if (!lastTriggered) return true;
        
        const daysSinceLast = this.currentDay - lastTriggered;
        return daysSinceLast >= minDaysBetween;
    }
    
    // Start an event
    startEvent(eventTypeId) {
        const event = new ActiveEvent(eventTypeId);
        this.activeEvents.set(event.id, event);
        this.eventHistory.set(event.type, this.currentDay);
        
        // Show notification
        this.game.ui?.showMessage(
            `${event.icon} ${event.name} has begun! ${event.description}`,
            5000
        );
        
        // Apply initial effects
        this.applyEventStart(event);
        
        return event;
    }
    
    // End an event
    endEvent(eventId) {
        const event = this.activeEvents.get(eventId);
        if (!event) return;
        
        // Show end notification
        this.game.ui?.showMessage(
            `${event.icon} ${event.name} has ended.`,
            3000
        );
        
        // Remove effects
        this.applyEventEnd(event);
        
        this.activeEvents.delete(eventId);
    }
    
    // Apply effects when event starts
    applyEventStart(event) {
        const mods = event.modifiers;
        
        // Spirit Wind buffs
        if (mods.buffPlayer && mods.buffs) {
            for (const buff of mods.buffs) {
                this.game.statusEffects?.applyToPlayer?.(buff, mods.buffDuration || 60);
            }
        }
        
        // Migration animals
        if (mods.spawnAnimals && mods.animalTypes) {
            this.spawnMigrationAnimals(mods);
        }
        
        // Predator pack
        if (mods.spawnPredators && mods.predatorTypes) {
            this.spawnPredatorPack(mods);
        }
    }
    
    // Apply effects when event ends
    applyEventEnd(event) {
        // Clean up any event-specific state
        const mods = event.modifiers;
        
        // Remove screen tint handled by render
    }
    
    // Process ongoing event effects
    processEventEffects(event, deltaTime) {
        const mods = event.modifiers;
        
        // Meteor spawning
        if (mods.spawnMeteors) {
            if (event.actionTimer >= mods.meteorInterval) {
                event.actionTimer = 0;
                this.spawnMeteor(mods.meteorDrops);
            }
        }
        
        // Lightning strikes
        if (mods.lightningInterval) {
            if (event.actionTimer >= mods.lightningInterval) {
                event.actionTimer = 0;
                this.spawnLightning(mods.lightningDamage);
            }
        }
        
        // Earthquake shake
        if (mods.screenShake) {
            this.game.camera?.addShake?.(2, deltaTime * 2);
        }
    }
    
    // Spawn a meteor
    spawnMeteor(possibleDrops) {
        const player = this.game.player;
        if (!player) return;
        
        // Random position near player
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 30;
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;
        const z = player.z;
        
        // Spawn particles
        if (this.game.particles) {
            for (let i = 0; i < 15; i++) {
                this.game.particles.spawn(x, y, z + 10, {
                    type: 'fire',
                    color: '#FF6600',
                    lifetime: 1.5,
                    velocity: {
                        x: (Math.random() - 0.5) * 3,
                        y: (Math.random() - 0.5) * 3,
                        z: -5 - Math.random() * 3
                    }
                });
            }
        }
        
        // Drop item
        if (possibleDrops && possibleDrops.length > 0) {
            const drop = possibleDrops[Math.floor(Math.random() * possibleDrops.length)];
            this.game.spawnItem?.(drop, 1, x, y, z);
        }
        
        // Camera shake
        this.game.camera?.addShake?.(4, 0.3);
    }
    
    // Spawn lightning
    spawnLightning(damage) {
        const player = this.game.player;
        if (!player) return;
        
        // Random position
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 20;
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;
        const z = player.z;
        
        // Check if hits player
        const playerDist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        if (playerDist < 2) {
            player.takeDamage?.(damage);
            this.game.ui?.showMessage('⚡ Struck by lightning!', 2000);
        }
        
        // Visual effect
        if (this.game.particles) {
            for (let i = 0; i < 20; i++) {
                this.game.particles.spawn(x, y, z + Math.random() * 10, {
                    type: 'spark',
                    color: '#FFFFFF',
                    lifetime: 0.3,
                    velocity: {
                        x: (Math.random() - 0.5) * 5,
                        y: (Math.random() - 0.5) * 5,
                        z: Math.random() * 5
                    }
                });
            }
        }
        
        this.game.camera?.addShake?.(6, 0.2);
    }
    
    // Spawn migration animals
    spawnMigrationAnimals(mods) {
        const player = this.game.player;
        if (!player) return;
        
        const count = mods.spawnCount || 10;
        const types = mods.animalTypes || ['deer'];
        
        // Pick a direction
        const baseAngle = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const angle = baseAngle + (Math.random() - 0.5) * 0.5;
            const distance = 30 + Math.random() * 20;
            
            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;
            
            this.game.spawnEntity?.(type, x, y, player.z);
        }
    }
    
    // Spawn predator pack
    spawnPredatorPack(mods) {
        const player = this.game.player;
        if (!player) return;
        
        const count = mods.spawnCount || 5;
        const types = mods.predatorTypes || ['wolf'];
        
        const baseAngle = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const angle = baseAngle + (Math.random() - 0.5) * 0.8;
            const distance = 25 + Math.random() * 15;
            
            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;
            
            const entity = this.game.spawnEntity?.(type, x, y, player.z);
            if (entity && mods.aggressive) {
                entity.aggressive = true;
                entity.target = player;
            }
        }
    }
    
    // Check if event is active
    isEventActive(eventTypeId) {
        for (const event of this.activeEvents.values()) {
            if (event.type === eventTypeId) return true;
        }
        return false;
    }
    
    // Get active event by type
    getActiveEvent(eventTypeId) {
        for (const event of this.activeEvents.values()) {
            if (event.type === eventTypeId) return event;
        }
        return null;
    }
    
    // Get all active events
    getActiveEvents() {
        return Array.from(this.activeEvents.values());
    }
    
    // Get current modifiers (combined from all active events)
    getCurrentModifiers() {
        const combined = {
            enemyDamageMultiplier: 1.0,
            enemyHealthMultiplier: 1.0,
            spawnRateMultiplier: 1.0,
            xpMultiplier: 1.0,
            cropGrowthMultiplier: 1.0,
            harvestYieldMultiplier: 1.0,
            screenTint: null
        };
        
        for (const event of this.activeEvents.values()) {
            const mods = event.modifiers;
            
            if (mods.enemyDamageMultiplier) combined.enemyDamageMultiplier *= mods.enemyDamageMultiplier;
            if (mods.enemyHealthMultiplier) combined.enemyHealthMultiplier *= mods.enemyHealthMultiplier;
            if (mods.spawnRateMultiplier) combined.spawnRateMultiplier *= mods.spawnRateMultiplier;
            if (mods.xpMultiplier) combined.xpMultiplier *= mods.xpMultiplier;
            if (mods.cropGrowthMultiplier) combined.cropGrowthMultiplier *= mods.cropGrowthMultiplier;
            if (mods.harvestYieldMultiplier) combined.harvestYieldMultiplier *= mods.harvestYieldMultiplier;
            if (mods.screenTint) combined.screenTint = mods.screenTint;
        }
        
        return combined;
    }
    
    // Queue an event to start
    queueEvent(eventTypeId) {
        this.eventQueue.push(eventTypeId);
    }
    
    // Force start an event (debug/admin)
    forceStartEvent(eventTypeId) {
        return this.startEvent(eventTypeId);
    }
    
    // Render active events UI
    render(ctx) {
        if (this.activeEvents.size === 0) return;
        
        // Event indicator in corner
        const startY = 150;
        let y = startY;
        
        for (const event of this.activeEvents.values()) {
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, y, 200, 40);
            
            // Icon and name
            ctx.font = '20px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.fillText(event.icon, 20, y + 28);
            
            ctx.font = '14px Arial';
            ctx.fillText(event.name, 50, y + 20);
            
            // Progress bar
            const barWidth = 140;
            const progress = 1 - event.progress;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(50, y + 26, barWidth, 6);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(50, y + 26, barWidth * progress, 6);
            
            // Time remaining
            const minutes = Math.floor(event.timeRemaining / 60);
            const seconds = Math.floor(event.timeRemaining % 60);
            ctx.font = '10px Arial';
            ctx.fillStyle = '#AAA';
            ctx.textAlign = 'right';
            ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, 200, y + 35);
            
            y += 45;
        }
        
        // Apply screen tint
        const mods = this.getCurrentModifiers();
        if (mods.screenTint) {
            const tint = mods.screenTint;
            ctx.fillStyle = `rgba(${tint.r * 255}, ${tint.g * 255}, ${tint.b * 255}, ${tint.a})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
    
    // Serialize
    serialize() {
        return {
            activeEvents: Array.from(this.activeEvents.entries()).map(([id, event]) => ({
                id,
                type: event.type,
                timeRemaining: event.timeRemaining,
                startTime: event.startTime
            })),
            eventHistory: Array.from(this.eventHistory.entries()),
            currentDay: this.currentDay
        };
    }
    
    deserialize(data) {
        if (data?.activeEvents) {
            this.activeEvents.clear();
            for (const eventData of data.activeEvents) {
                const event = new ActiveEvent(eventData.type);
                event.id = eventData.id;
                event.timeRemaining = eventData.timeRemaining;
                event.startTime = eventData.startTime;
                this.activeEvents.set(event.id, event);
            }
        }
        
        if (data?.eventHistory) {
            this.eventHistory = new Map(data.eventHistory);
        }
        
        if (data?.currentDay !== undefined) {
            this.currentDay = data.currentDay;
        }
    }
    
    reset() {
        this.activeEvents.clear();
        this.eventHistory.clear();
        this.eventQueue = [];
        this.currentDay = 0;
    }
}
