import { Player } from './entities/player.js';
import { Renderer } from './core/renderer.js';
import { InputManager } from './core/input.js';
import { Camera } from './core/camera.js';
import { World } from './world/world.js';

import { CONFIG } from './config.js';

import { UIManager } from './ui/ui.js';

import { SaveManager } from './core/save.js';

import { AudioManager } from './core/audio.js';

import { SpriteManager } from './core/sprites.js';
import { ParticleSystem } from './core/particles.js';
import { Noise } from './utils/math.js';
import { QuestManager } from './core/quests.js';
import { LightingSystem } from './core/lighting.js';
import { SkillsManager } from './core/skills.js';
import { TamingSystem } from './core/taming.js';

// New Systems (10 Feature Update)
import { WeatherSystem } from './core/weather.js';
import { ArmorSystem } from './core/armor.js';
import { Statistics } from './core/statistics.js';
import { ThrowableSystem } from './core/throwables.js';
import { TemperatureSystem } from './core/temperature.js';
import { FoodBuffSystem } from './core/foodbuffs.js';
import { HomeBeaconSystem } from './core/homebeacon.js';
import { WildlifeSystem } from './entities/wildlife.js';
import { AgeProgressionManager } from './core/ageprogression.js';
import { CombatFeelSystem } from './core/combatfeel.js';

// ====== NEW SYSTEMS (20 Feature Expansion) ======
import { StaminaSystem } from './core/stamina.js';
import { StatusEffectSystem } from './core/statuseffects.js';
import { CraftingStationSystem } from './core/craftingstations.js';
import { StorageSystem } from './core/storage.js';
import { FarmingSystem } from './core/farming.js';
import { PetCommandSystem } from './core/petcommands.js';
import { ComboSystem } from './core/combos.js';
import { AchievementSystem } from './core/achievements.js';
import { LootTableSystem } from './core/loottables.js';
import { MapMarkerSystem } from './core/mapmarkers.js';
import { WorldEventSystem } from './core/worldevents.js';
import { EnchantmentSystem } from './core/enchantments.js';
import { SwimmingSystem } from './core/swimming.js';
import { SoundManager } from './core/soundmanager.js';
import { NPCTradingSystem } from './core/npctrading.js';
import { BossSummoningSystem } from './core/bosssummoning.js';
import { DayNightVisualSystem } from './core/daynightvisuals.js';
import { BuildingSnapGridSystem } from './core/buildingsnapgrid.js';
import { TorchLightingSystem } from './core/torchlighting.js';
import { DamageNumberSystem } from './core/damagenumbers.js';
import { SideQuestSystem } from './core/sidequests.js';

// ====== NEW SYSTEMS (20 Additional Features) ======
import { BlockBreakingSystem } from './core/blockbreaking.js';
import { DeathSystem } from './core/deathscreen.js';
import { BossHealthBarSystem } from './ui/bosshealthbar.js';
import { BlockPlacementPreview } from './core/blockpreview.js';
import { InventorySortingSystem } from './ui/inventorysorting.js';
import { ConsumptionEffects } from './core/consumptioneffects.js';
import { ToolDurabilitySystem } from './core/tooldurability.js';
import { DifficultySystem } from './core/difficulty.js';
import { BestiarySystem } from './core/bestiary.js';
import { MapSystem } from './core/mapcraft.js';
import { FishingSystem } from './core/fishing.js';
import { PotionSystem } from './core/potions.js';
import { GrapplingSystem } from './core/grappling.js';
import { PhotoModeSystem } from './ui/photomode.js';
import { MusicSystem } from './core/music.js';
import { DungeonSystem } from './world/dungeons.js';
import { StructureSystem } from './world/structures.js';
import { SeasonalEventsSystem } from './core/seasonalevents.js';
import { BlueprintSystem } from './core/blueprints.js';
import { PerformanceMonitor, SpatialHash } from './utils/performance.js';

class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.debugMode = false;
        this.tickRate = 1 / 60;
        this.initialized = false;
        this.firstSteps = false; // Walking tutorial state
        this.introCinematic = false; // Blocking input during eyes opening
        
        // Performance monitoring
        this.perfMonitor = new PerformanceMonitor();
        this.spatialHash = new SpatialHash(16);
        this.fps = 0;

        this.spriteManager = new SpriteManager();

        // Initialize async components
        this.initAsync();
    }

    async initAsync() {
        // Wait for sprites to load
        await this.spriteManager.init();

        this.renderer = new Renderer(this);
        this.input = new InputManager(this);
        this.camera = new Camera(this);
        this.world = new World(this);
        this.audio = new AudioManager();

        this.particles = new ParticleSystem(this);

        // Initialize Player
        // Find safe spawn (non-water, solid ground)
        this.world.generateChunk(0, 0); // Ensure origin chunk exists
        const safeSpawn = this.world.getSafeSpawnPoint(0, 0);
        this.player = new Player(this, safeSpawn.x, safeSpawn.y, safeSpawn.z);
        this.camera.follow(this.player);

        // UI Manager (after player init as it might need player ref)
        this.ui = new UIManager(this);
        this.saveManager = new SaveManager(this);

        // Quest System
        this.questManager = new QuestManager(this);
        this.questManager.init();

        // Lighting System
        this.lighting = new LightingSystem(this);

        // Skills System
        this.skills = new SkillsManager(this);

        // Taming System
        this.taming = new TamingSystem(this);

        // ====== NEW SYSTEMS (10 Feature Update) ======

        // Weather System - Dynamic weather effects
        this.weather = new WeatherSystem(this);

        // Armor System - Damage reduction
        this.armor = new ArmorSystem(this);

        // Age Progression Manager - Age gates and bonuses
        this.ageProgression = new AgeProgressionManager(this);
        this.ageProgression.init();

        // Combat Feel System - Enhanced combat feedback
        this.combatFeel = new CombatFeelSystem(this);

        // Statistics - Track achievements
        this.statistics = new Statistics(this);

        // Throwables - Ranged combat
        this.throwables = new ThrowableSystem(this);

        // Temperature - Biome survival
        this.temperature = new TemperatureSystem(this);

        // Food Buffs - Cooking benefits
        this.foodBuffs = new FoodBuffSystem(this);

        // Home Beacons - Respawn points
        this.homeBeacons = new HomeBeaconSystem(this);

        // Wildlife - Passive creatures
        this.wildlife = new WildlifeSystem(this);

        // ====== NEW SYSTEMS (20 Feature Expansion) ======

        // Stamina System - Energy for actions
        this.stamina = new StaminaSystem(this);

        // Status Effects - Buffs and debuffs
        this.statusEffects = new StatusEffectSystem(this);

        // Crafting Stations - Advanced crafting
        this.craftingStations = new CraftingStationSystem(this);

        // Storage System - Chests
        this.storage = new StorageSystem(this);

        // Farming System - Crops
        this.farming = new FarmingSystem(this);

        // Pet Commands - Control tamed animals
        this.petCommands = new PetCommandSystem(this);

        // Combo System - Chain attacks
        this.combos = new ComboSystem(this);

        // Achievement System - Milestones
        this.achievements = new AchievementSystem(this);

        // Loot Tables - Random drops
        this.lootTables = new LootTableSystem(this);

        // Map Markers - Waypoints
        this.mapMarkers = new MapMarkerSystem(this);

        // World Events - Random events
        this.worldEvents = new WorldEventSystem(this);

        // Enchantments - Tool upgrades
        this.enchantments = new EnchantmentSystem(this);

        // Swimming - Water mechanics
        this.swimming = new SwimmingSystem(this);

        // Sound Manager - Audio system
        this.soundManager = new SoundManager(this);

        // NPC Trading - Villagers
        this.npcTrading = new NPCTradingSystem(this);

        // Boss Summoning - Epic battles
        this.bossSummoning = new BossSummoningSystem(this);

        // Day/Night Visuals - Sky effects
        this.dayNightVisuals = new DayNightVisualSystem(this);

        // Building Snap Grid - Construction
        this.buildingSnapGrid = new BuildingSnapGridSystem(this);

        // Torch Lighting - Placed lights
        this.torchLighting = new TorchLightingSystem(this);

        // Damage Numbers - Combat feedback
        this.damageNumbers = new DamageNumberSystem(this);

        // Side Quests - Random location-based quests
        this.sideQuests = new SideQuestSystem(this);
        this.sideQuests.init();

        // ====== NEW SYSTEMS (20 Additional Features) ======

        // Block Breaking - Mining animations and progress
        this.blockBreaking = new BlockBreakingSystem(this);

        // Death Screen - Death UI and respawn system
        this.deathScreen = new DeathSystem(this);

        // Boss Health Bars - Boss combat UI
        this.bossHealthBar = new BossHealthBarSystem(this);

        // Block Preview - Ghost preview for placement
        this.blockPreview = new BlockPlacementPreview(this);

        // Inventory Sorting - Sort, quick-stack features
        this.inventorySorting = new InventorySortingSystem(this);

        // Consumption Effects - Eating/drinking visuals
        this.consumptionEffects = new ConsumptionEffects(this);

        // Tool Durability - Tool wear and repair
        this.toolDurability = new ToolDurabilitySystem(this);

        // Difficulty System - Game difficulty settings
        this.difficulty = new DifficultySystem(this);

        // Bestiary - Creature encyclopedia
        this.bestiary = new BestiarySystem(this);

        // Map Craft - Craftable maps
        this.mapCraft = new MapSystem(this);

        // Fishing - Fishing minigame
        this.fishing = new FishingSystem(this);

        // Potion Brewing - Potions and effects
        this.potions = new PotionSystem(this);

        // Grappling Hook - Movement tool
        this.grappling = new GrapplingSystem(this);

        // Photo Mode - Screenshot system
        this.photoMode = new PhotoModeSystem(this);

        // Adaptive Music - Dynamic soundtrack
        this.adaptiveMusic = new MusicSystem(this);

        // Dungeon System - Procedural dungeons
        this.dungeons = new DungeonSystem(this);

        // Structure Generator - World structures
        this.structures = new StructureSystem(this);

        // Seasonal Events - Time-limited events
        this.seasonalEvents = new SeasonalEventsSystem(this);

        // Blueprint System - Building templates
        this.blueprints = new BlueprintSystem(this);

        this.entities = [];
        this.mining = { currentBlock: null, progress: 0, maxProgress: 0 };

        // Debug flag - set to false for production
        this.debugMode = false;

        // Load Save (disabled in debug mode)
        if (!this.debugMode) {
            this.saveManager.load();
        } else {
            console.warn('Save Loading DISABLED for debug mode.');
        }

        // Mark as initialized
        this.initialized = true;

        // Start Loop
        requestAnimationFrame((t) => this.gameLoop(t));

        // Hide loading screen (handled by UI now?)
        // Let's keep loading screen logic but hide it immediately if we have a start screen?
        const loading = document.getElementById('loading-screen');
        if (loading) loading.style.display = 'none';

        console.log('Game Initialized');

        this.paused = true; // Start paused at menu

        // Initial resize after everything is initialized
        this.resize();
    }

    resize() {
        if (!this.renderer) return; // Safety check for async init
        this.renderer.resize();
    }

    gameLoop(timestamp) {
        if (!this.lastTime) {
            this.lastTime = timestamp;
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        if (this.paused) {
            this.lastTime = timestamp; // Prevent delta spikes
            requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // FPS Calculation
        if (deltaTime > 0) {
            const currentFps = 1 / deltaTime;
            this.fps = this.fps ? (this.fps * 0.9 + currentFps * 0.1) : currentFps;
        }

        // Performance: Measure update time
        this.perfMonitor.startMeasure('update');
        this.update(deltaTime);
        this.perfMonitor.endMeasure('update');

        // Performance: Measure render time
        this.perfMonitor.startMeasure('render');
        this.renderer.render();
        this.perfMonitor.endMeasure('render');
        
        if (this.debugMode) {
            this.renderer.renderDebug();
            this.renderPerformanceStats();
        }

        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    renderPerformanceStats() {
        const ctx = this.renderer.ctx;
        const metrics = this.perfMonitor.getAllMetrics();
        
        ctx.save();
        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff00';
        
        let y = 60;
        ctx.fillText(`FPS: ${Math.round(this.fps)}`, 10, y);
        y += 15;
        
        for (const [name, data] of Object.entries(metrics)) {
            ctx.fillText(`${name}: ${data.avg}ms`, 10, y);
            y += 15;
        }
        
        ctx.restore();
    }

    startNewGame() {
        console.log('Game: startNewGame called. Creating fresh world...');
        this.firstSteps = false; // Will be enabled by UIManager after intro
        this.introCinematic = false;

        // 1. Reset World
        this.world.chunks.clear();
        this.world.noise = new Noise(Math.random()); // New Noise instance
        this.world.biomeNoise = new Noise(Math.random());
        this.entities = []; // Clear enemies/items
        this.particles.particles = [];

        // 2. Reset Player (Full Reset)
        this.player.health = CONFIG.PLAYER_MAX_HEALTH;
        this.player.hunger = CONFIG.PLAYER_MAX_HUNGER;
        this.player.inventory.fill(null);
        this.player.hotbar.fill(null);
        this.player.xp = 0;
        this.player.level = 1;
        this.player.nextLevelXp = 100;

        // Give Stone Age starter items
        this.player.addItem('club', 1);
        this.player.addItem('cobblestone', 5);
        this.player.addItem('stick', 8);
        this.player.addItem('raw_meat', 3);

        // 3. Find Safe Spawn
        this.world.generateChunk(0, 0); // Ensure origin chunk is generated first!
        const safeSpawn = this.world.getSafeSpawnPoint(8, 8);
        this.player.x = safeSpawn.x;
        this.player.y = safeSpawn.y;
        this.player.z = safeSpawn.z;
        this.player.vx = 0; this.player.vy = 0; this.player.vz = 0;
        this.player.spawnPoint = { ...safeSpawn };
        this.player.grounded = true; // Start grounded

        // Spawn Easter Egg relics
        this.world.spawnRelics();

        // Reset quest system for new game
        if (this.questManager) {
            this.questManager.reset();
            this.questManager.init();
        }

        // Reset skills system
        if (this.skills) {
            this.skills.reset();
        }

        // Reset taming system
        if (this.taming) {
            this.taming.reset();
        }

        // Reset new systems
        if (this.weather) this.weather.reset();
        if (this.armor) this.armor.reset();
        if (this.statistics) this.statistics.reset();
        if (this.foodBuffs) this.foodBuffs.clearAllBuffs();
        if (this.homeBeacons) {
            this.homeBeacons.beacons = [];
            this.homeBeacons.activeSpawnIndex = 0;
            this.homeBeacons.lastDeathPosition = null;
        }
        if (this.wildlife) this.wildlife.clear();

        // Reset 20 new systems
        if (this.stamina) this.stamina.reset();
        if (this.statusEffects) this.statusEffects.reset();
        if (this.craftingStations) this.craftingStations.reset();
        if (this.storage) this.storage.reset();
        if (this.farming) this.farming.reset();
        if (this.petCommands) this.petCommands.reset();
        if (this.combos) this.combos.reset();
        if (this.achievements) this.achievements.reset();
        if (this.lootTables) this.lootTables.reset();
        if (this.mapMarkers) this.mapMarkers.reset();
        if (this.worldEvents) this.worldEvents.reset();
        if (this.enchantments) this.enchantments.reset();
        if (this.swimming) this.swimming.reset();
        if (this.soundManager) this.soundManager.reset();
        if (this.npcTrading) this.npcTrading.reset();
        if (this.bossSummoning) this.bossSummoning.reset();
        if (this.dayNightVisuals) this.dayNightVisuals.reset();
        if (this.buildingSnapGrid) this.buildingSnapGrid.reset();
        if (this.torchLighting) this.torchLighting.reset();
        if (this.damageNumbers) this.damageNumbers.reset();
        if (this.sideQuests) {
            this.sideQuests.reset();
            this.sideQuests.init();
        }

        // Reset 20 additional feature systems
        if (this.blockBreaking) this.blockBreaking.reset?.();
        if (this.deathScreen) this.deathScreen.reset?.();
        if (this.bossHealthBar) this.bossHealthBar.reset?.();
        if (this.blockPreview) this.blockPreview.reset?.();
        if (this.inventorySorting) this.inventorySorting.reset?.();
        if (this.consumptionEffects) this.consumptionEffects.reset?.();
        if (this.toolDurability) this.toolDurability.reset?.();
        if (this.difficulty) this.difficulty.reset?.();
        if (this.bestiary) this.bestiary.reset?.();
        if (this.mapCraft) this.mapCraft.reset?.();
        if (this.fishing) this.fishing.reset?.();
        if (this.potions) this.potions.reset?.();
        if (this.grappling) this.grappling.reset?.();
        if (this.photoMode) this.photoMode.reset?.();
        if (this.adaptiveMusic) this.adaptiveMusic.reset?.();
        if (this.dungeons) this.dungeons.reset?.();
        if (this.structures) this.structures.reset?.();
        if (this.seasonalEvents) this.seasonalEvents.checkActiveEvents?.();
        if (this.blueprints) this.blueprints.reset?.();

        // Snap camera to new position
        this.camera.snapToTarget();

        this.paused = false;

        // Overwrite save immediately to prevent loading old state later
        this.saveManager.save();

        console.log(`Game: New Game Started. Spawn at Z=${this.player.z}`);
        this.player.updateUI();
    }

    togglePause(paused) {
        this.paused = paused;

        // Clear input state when pausing to prevent stuck keys
        if (this.paused && this.input) {
            this.input.keys = {};
        }

        // Inform UI to show/hide pause menu
        if (this.ui) {
            this.ui.togglePauseUI(this.paused);
        }

        console.log(`Game: ${this.paused ? 'Paused' : 'Resumed'}`);
    }

    update(deltaTime) {
        this.saveManager.update(Date.now());
        this.world.update(deltaTime);

        // Update quest system
        if (this.questManager) {
            this.questManager.update(deltaTime);
        }

        // Update lighting system
        if (this.lighting) {
            this.lighting.update(deltaTime);
        }

        // Update taming system (pets)
        if (this.taming) {
            this.taming.update(deltaTime);
        }

        // ====== UPDATE NEW SYSTEMS ======

        // Weather effects
        if (this.weather) {
            this.weather.update(deltaTime);
        }

        // Statistics tracking
        if (this.statistics) {
            this.statistics.update(deltaTime);
        }

        // Temperature effects
        if (this.temperature) {
            this.temperature.update(deltaTime);
        }

        // Food buffs
        if (this.foodBuffs) {
            this.foodBuffs.update(deltaTime);
        }

        // Home beacon cooldowns
        if (this.homeBeacons) {
            this.homeBeacons.update(deltaTime);
        }

        // Throwable projectiles
        if (this.throwables) {
            this.throwables.update(deltaTime);
        }

        // Ambient wildlife
        if (this.wildlife) {
            this.wildlife.update(deltaTime);
        }

        // ====== UPDATE 20 NEW SYSTEMS ======

        // Stamina management
        if (this.stamina) {
            this.stamina.update(deltaTime);
        }

        // Status effects (poison, burn, etc.)
        if (this.statusEffects) {
            this.statusEffects.update(deltaTime);
        }

        // Crafting stations
        if (this.craftingStations) {
            this.craftingStations.update(deltaTime);
        }

        // Farming (crop growth)
        if (this.farming) {
            this.farming.update(deltaTime);
        }

        // Pet commands
        if (this.petCommands) {
            this.petCommands.update(deltaTime);
        }

        // Combat combos
        if (this.combos) {
            this.combos.update(deltaTime);
        }

        // Achievements
        if (this.achievements) {
            this.achievements.update(deltaTime);
        }

        // World events
        if (this.worldEvents) {
            this.worldEvents.update(deltaTime);
        }

        // Swimming mechanics
        if (this.swimming) {
            this.swimming.update(deltaTime);
        }

        // NPC Trading
        if (this.npcTrading) {
            this.npcTrading.update(deltaTime);
        }

        // Boss summoning
        if (this.bossSummoning) {
            this.bossSummoning.update(deltaTime);
        }

        // Day/Night visuals
        if (this.dayNightVisuals) {
            this.dayNightVisuals.update(deltaTime);
        }

        // Building snap grid
        if (this.buildingSnapGrid) {
            this.buildingSnapGrid.update(deltaTime);
        }

        // Torch lighting
        if (this.torchLighting) {
            this.torchLighting.update(deltaTime);
        }

        // Damage numbers
        if (this.damageNumbers) {
            this.damageNumbers.update(deltaTime);
        }

        // Side quests - random location-based missions
        if (this.sideQuests) {
            this.sideQuests.update(deltaTime);
        }

        // ====== UPDATE 20 ADDITIONAL FEATURE SYSTEMS ======

        // Block breaking animations
        if (this.blockBreaking) {
            this.blockBreaking.update(deltaTime);
        }

        // Death screen
        if (this.deathScreen) {
            this.deathScreen.update(deltaTime);
        }

        // Boss health bars
        if (this.bossHealthBar) {
            this.bossHealthBar.update(deltaTime);
        }

        // Block placement preview
        if (this.blockPreview) {
            this.blockPreview.update(deltaTime);
        }

        // Tool durability
        if (this.toolDurability) {
            this.toolDurability.update(deltaTime);
        }

        // Difficulty system
        if (this.difficulty) {
            this.difficulty.update?.(deltaTime);
        }

        // Fishing minigame
        if (this.fishing) {
            this.fishing.update(deltaTime);
        }

        // Potions brewing
        if (this.potions) {
            this.potions.update(deltaTime);
        }

        // Grappling hook physics
        if (this.grappling) {
            this.grappling.update(deltaTime);
        }

        // Adaptive music
        if (this.adaptiveMusic) {
            this.adaptiveMusic.update(deltaTime);
        }

        // Dungeons
        if (this.dungeons) {
            this.dungeons.update?.(deltaTime);
        }

        // Seasonal events
        if (this.seasonalEvents) {
            this.seasonalEvents.update(deltaTime);
        }

        // Blueprint system
        if (this.blueprints) {
            this.blueprints.update?.(deltaTime);
        }

        if (this.ui) {
            this.ui.update(deltaTime);
        }

        if (this.player) {
            this.player.update(deltaTime);
            if (this.questManager) {
                this.questManager.onLocationUpdate(this.player.x, this.player.y);
            }
        }

        this.camera.update(deltaTime);

        // Debug Log every 60 frames
        if (Math.floor(Date.now() / 1000) % 2 === 0 && Math.random() < 0.05) {
            console.log(`Debug: Player(${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)}, ${this.player.z.toFixed(2)}) Camera(${this.camera.x.toFixed(2)}, ${this.camera.y.toFixed(2)})`);
        }

        // Update entities
        this.entities.forEach(e => e.update(deltaTime));
        this.entities = this.entities.filter(e => !e.isDead);

        this.particles.update(deltaTime);
    }
    respawn() {
        // Track death in statistics
        if (this.statistics) {
            this.statistics.onDeath();
        }

        // Record death position for home beacon system
        if (this.homeBeacons) {
            this.homeBeacons.onPlayerDeath(this.player.x, this.player.y, this.player.z);
        }

        this.player.health = this.player.maxHealth;
        this.player.hunger = this.player.maxHunger;
        this.player.isDead = false;

        // Use home beacon spawn if available
        if (this.homeBeacons && this.homeBeacons.beacons.length > 0) {
            const spawn = this.homeBeacons.getSpawnPosition();
            this.player.x = spawn.x;
            this.player.y = spawn.y;
            this.player.z = spawn.z;
        } else if (this.player.spawnPoint) {
            this.player.x = this.player.spawnPoint.x;
            this.player.y = this.player.spawnPoint.y;
            this.player.z = this.player.spawnPoint.z;
        } else {
            this.world.generateChunk(0, 0); // Ensure origin chunk exists
            const safeSpawn = this.world.getSafeSpawnPoint(0, 0);
            this.player.x = safeSpawn.x;
            this.player.y = safeSpawn.y;
            this.player.z = safeSpawn.z;
        }

        this.player.vx = 0;
        this.player.vy = 0;
        this.player.vz = 0;

        // Clear food buffs on death
        if (this.foodBuffs) {
            this.foodBuffs.clearAllBuffs();
        }

        // Reset time? Maybe keep it.
        // Clear enemies nearby?
        this.entities = [];

        this.ui.closeAllModals();
        this.player.updateUI();
    }

    // ====== HELPER METHODS FOR SYSTEMS ======

    // Spawn an item entity at a location
    spawnItem(itemId, count, x, y, z) {
        // Import ItemEntity dynamically to avoid circular deps
        import('./entities/item.js').then(({ ItemEntity }) => {
            const item = new ItemEntity(this, x, y, z + 1, itemId);
            item.count = count || 1;
            this.entities.push(item);
        });
    }

    // Spawn an entity (enemy, wildlife, etc.)
    spawnEntity(type, x, y, z) {
        // Try wildlife first
        if (this.wildlife?.spawnCreature) {
            return this.wildlife.spawnCreature(type, x, y, z);
        }

        // Try enemy spawning
        import('./entities/enemy.js').then(({ Enemy }) => {
            const enemy = new Enemy(this, x, y, z, type);
            this.entities.push(enemy);
            return enemy;
        });

        return null;
    }

    // Get active world event modifiers
    getEventModifier(modifierName) {
        if (!this.worldEvents) return null;

        for (const event of this.worldEvents.activeEvents.values()) {
            if (event.modifiers && event.modifiers[modifierName] !== undefined) {
                return event.modifiers[modifierName];
            }
        }
        return null;
    }

    // Check if specific event is active
    isEventActive(eventId) {
        return this.worldEvents?.isEventActive?.(eventId) || false;
    }
}

// Start Game
window.onload = () => {
    const game = new Game();
    window.game = game;
    // Resize is called inside initAsync after initialization
    window.addEventListener('resize', () => game.resize());
};
