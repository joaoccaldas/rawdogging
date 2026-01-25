/**
 * Main 3D Game Entry Point
 * This file initializes the 3D version of the game using Three.js
 */

import { Player } from './entities/player.js';
import { World } from './world/world.js';
import { CONFIG, ITEMS, BLOCKS, BLOCK_DATA } from './config.js';
import { UIManager } from './ui/ui.js';
import { SaveManager } from './core/save.js';
import { AudioManager } from './core/audio.js';
import { ParticleSystem } from './core/particles.js';
import { Noise } from './utils/math.js';
import { QuestManager } from './core/quests.js';
import { SkillsManager } from './core/skills.js';
import { TamingSystem } from './core/taming.js';

// 3D Systems
import { Renderer3D } from './core/renderer3d.js';
import { Camera3D } from './core/camera3d.js';
import { Input3D } from './core/input3d.js';
import { Collision3D } from './core/collision3d.js';

// Feature Systems (unchanged - they're data-driven)
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
import { SideQuestSystem } from './core/sidequests.js';
import { BlockBreakingSystem } from './core/blockbreaking.js';
import { DeathSystem } from './core/deathscreen.js';
import { BossHealthBarSystem } from './ui/bosshealthbar.js';
import { ToolDurabilitySystem } from './core/tooldurability.js';
import { DifficultySystem } from './core/difficulty.js';
import { BestiarySystem } from './core/bestiary.js';
import { MapSystem } from './core/mapcraft.js';
import { FishingSystem } from './core/fishing.js';
import { PotionSystem } from './core/potions.js';
import { GrapplingSystem } from './core/grappling.js';
import { MusicSystem } from './core/music.js';
import { DungeonSystem } from './world/dungeons.js';
import { StructureSystem } from './world/structures.js';
import { SeasonalEventsSystem } from './core/seasonalevents.js';
import { BlueprintSystem } from './core/blueprints.js';
import { LandingPage } from './ui/landingpage.js';

// Civilization Systems
import { CivilizationManager } from './core/civilization.js';
import { CivilizationUI } from './ui/civilizationUI.js';

class Game3D {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.debugMode = false;
        this.tickRate = 1 / 60;
        this.initialized = false;
        this.firstSteps = false;
        this.introCinematic = false;
        this.builderMode = false;
        
        // 3D Mode flag
        this.is3D = true;
        
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (window.innerWidth <= 1024 && 'ontouchstart' in window);
        
        // Menu state - only show menu when ESC is pressed, not on every pointer lock loss
        this.menuRequested = false;
        
        this.fps = 0;
        this.entities = [];
        this.mining = { currentBlock: null, progress: 0, maxProgress: 0 };
        
        // Dirty chunks queue for mesh rebuilding
        this.dirtyChunks = new Set();
        
        // Landing page
        this.landingPage = new LandingPage();
        
        // Check if intro should play
        if (this.landingPage && !this.landingPage.completed) {
            this.showLandingPage();
        } else {
            this.initAsync();
        }
    }
    
    showLandingPage() {
        // Show the landing page and start the game when done
        this.landingPage.start(() => {
            this.initAsync();
        });
    }
    
    async initAsync() {
        console.log('Game3D: Initializing...');
        
        // World first (generates terrain)
        this.world = new World(this);
        
        // Generate initial chunks around spawn (0,0) before player exists
        console.log('Game3D: Generating initial chunks around spawn...');
        this.world.generateInitialChunks(8, 8);
        
        // 3D Renderer
        this.renderer3d = new Renderer3D(this);
        
        // 3D Camera
        this.camera3d = new Camera3D(this);
        
        // 3D Input
        this.input = new Input3D(this);
        
        // 3D Collision system
        this.collision = new Collision3D(this);
        
        // Audio
        this.audio = new AudioManager(this);
        
        // Particles (will need 3D adaptation later)
        this.particles = new ParticleSystem(this);
        
        // UI (HTML overlay - stays the same)
        this.ui = new UIManager(this);
        
        // Save system
        this.saveManager = new SaveManager(this);
        
        // Player
        const spawnHeight = this.world.getHeight(8, 8) + 2;
        this.player = new Player(this, 8, 8, spawnHeight);
        
        // All feature systems (unchanged)
        this.initFeatureSystems();
        
        // Build initial chunk meshes after renderer is ready
        console.log('Game3D: Waiting for renderer to initialize...');
        await this.waitForRenderer();
        
        console.log('Game3D: Building initial chunk meshes...');
        console.log('Game3D: Chunks loaded:', this.world.chunks.size);
        this.buildInitialMeshes();
        
        // Snap camera to player position
        this.camera3d.snapToTarget();
        
        this.initialized = true;
        this.paused = true; // Start paused until player clicks to play
        
        // Hide loading screen
        const loading = document.getElementById('loading-screen');
        if (loading) loading.style.display = 'none';
        
        // Show pointer lock prompt
        const prompt = document.getElementById('pointer-lock-prompt');
        if (prompt) prompt.style.display = 'block';
        
        // Setup pointer lock
        this.setupPointerLock();
        
        // Start game loop
        requestAnimationFrame((t) => this.gameLoop(t));
        
        console.log('Game3D: Initialized, player at', this.player.x, this.player.y, this.player.z);
        
        // Expose debug functions globally
        window.debugGame = {
            getTargetBlock: () => this.camera3d.getTargetBlock(5),
            getPlayerPos: () => ({ x: this.player.x, y: this.player.y, z: this.player.z }),
            getBlockAt: (x, y, z) => this.world.getBlock(x, y, z),
            getCameraDir: () => ({
                yaw: this.camera3d.yaw,
                pitch: this.camera3d.pitch,
                forward: this.camera3d.getForwardDirection()
            }),
            testMine: () => this.tryMine3D()
        };
        console.log('Game3D: Debug functions available via window.debugGame');
    }
    
    setupPointerLock() {
        const canvas = this.renderer3d.canvas;
        const prompt = document.getElementById('pointer-lock-prompt');
        const clickToPlay = document.getElementById('click-to-play');
        const pauseMenu = document.getElementById('pause-menu');
        
        // Mobile doesn't use pointer lock
        if (this.isMobile) {
            this.setupMobileControls();
            // Hide pointer lock prompt on mobile
            if (prompt) prompt.style.display = 'none';
            this.paused = false;
            return;
        }
        
        // Request pointer lock when clicking the prompt or canvas
        const requestLock = () => {
            if (!document.pointerLockElement) {
                this.menuRequested = false; // Clear menu request when trying to play
                canvas.requestPointerLock();
            }
        };
        
        if (clickToPlay) {
            clickToPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                requestLock();
            });
        }
        
        if (prompt) {
            prompt.addEventListener('click', (e) => {
                e.stopPropagation();
                requestLock();
            });
        }
        
        // Click on canvas when NOT locked requests lock
        canvas.addEventListener('mousedown', (e) => {
            if (!document.pointerLockElement && !this.menuRequested) {
                requestLock();
            }
        });
        
        // Resume button in pause menu
        const resumeBtn = document.getElementById('btn-resume');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.menuRequested = false;
                if (pauseMenu) pauseMenu.classList.add('hidden');
                requestLock();
            });
        }
        
        // Handle pointer lock change
        document.addEventListener('pointerlockchange', () => {
            const lockedElement = document.pointerLockElement;
            console.log('Game3D: Pointer lock changed:', {
                lockedElement: lockedElement?.id || lockedElement?.tagName || 'null',
                expectedCanvas: canvas?.id || canvas?.tagName,
                matches: lockedElement === canvas
            });
            
            // Check if ANY element is locked (more permissive check)
            if (lockedElement) {
                // Pointer is locked - start playing
                this.paused = false;
                this.menuRequested = false;
                if (prompt) prompt.style.display = 'none';
                if (pauseMenu) pauseMenu.classList.add('hidden');
                console.log('Game3D: Pointer locked, game unpaused, paused =', this.paused);
            } else {
                // Pointer is unlocked
                this.paused = true;
                
                if (this.menuRequested) {
                    // ESC was pressed - show pause menu
                    if (pauseMenu) pauseMenu.classList.remove('hidden');
                    if (prompt) prompt.style.display = 'none';
                    // Update quest info in pause menu
                    this.updatePauseMenuQuests();
                    console.log('Game3D: Showing pause menu');
                } else {
                    // Pointer lock lost for other reason (click outside, etc)
                    // Just show the "click to play" prompt, not the pause menu
                    if (prompt) prompt.style.display = 'block';
                    console.log('Game3D: Pointer unlocked, showing play prompt');
                }
            }
        });
        
        document.addEventListener('pointerlockerror', () => {
            console.error('Game3D: Pointer lock failed');
        });
    }
    
    setupMobileControls() {
        console.log('Game3D: Setting up mobile controls');
        
        // Create mobile UI elements with prehistoric theme
        const mobileUI = document.createElement('div');
        mobileUI.id = 'mobile-controls';
        mobileUI.innerHTML = `
            <div id="joystick-container">
                <div id="joystick-base">
                    <div id="joystick-stick"></div>
                </div>
            </div>
            <div id="look-area"></div>
            <div id="mobile-action-buttons">
                <button id="btn-mobile-jump" class="mobile-btn" title="Jump">🦘</button>
                <button id="btn-mobile-mine" class="mobile-btn" title="Gather">🪨</button>
                <button id="btn-mobile-place" class="mobile-btn" title="Build">🏠</button>
                <button id="btn-mobile-inventory" class="mobile-btn" title="Inventory">🎒</button>
                <button id="btn-mobile-craft" class="mobile-btn" title="Craft">🔥</button>
                <button id="btn-mobile-menu" class="mobile-btn" title="Menu">🦴</button>
            </div>
        `;
        document.body.appendChild(mobileUI);
        
        // Add mobile CSS
        const mobileCSS = document.createElement('style');
        mobileCSS.textContent = `
            #mobile-controls {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 500;
            }
            #joystick-container {
                position: absolute;
                bottom: 100px;
                left: 30px;
                pointer-events: auto;
            }
            #joystick-base {
                width: 120px;
                height: 120px;
                background: rgba(255, 255, 255, 0.2);
                border: 3px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
            }
            #joystick-stick {
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 50%;
                transition: transform 0.05s;
            }
            #look-area {
                position: absolute;
                top: 0;
                right: 0;
                width: 50%;
                height: 100%;
                pointer-events: auto;
                touch-action: none;
            }
            #mobile-action-buttons {
                position: absolute;
                bottom: 100px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: auto;
            }
            .mobile-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 3px solid #8B4513;
                background: linear-gradient(145deg, rgba(139,69,19,0.8), rgba(101,67,33,0.9));
                color: #ffd700;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            }
            .mobile-btn:active, .mobile-btn.active {
                background: linear-gradient(145deg, rgba(255,165,0,0.8), rgba(139,69,19,0.9));
                transform: scale(0.95);
            }
            @media (max-width: 1024px) {
                .crosshair { display: none !important; }
                #pointer-lock-prompt { display: none !important; }
            }
        `;
        document.head.appendChild(mobileCSS);
        
        this.setupJoystick();
        this.setupLookArea();
        this.setupMobileButtons();
    }
    
    setupJoystick() {
        const base = document.getElementById('joystick-base');
        const stick = document.getElementById('joystick-stick');
        if (!base || !stick) return;
        
        let joystickActive = false;
        let joystickOrigin = { x: 0, y: 0 };
        const maxDistance = 40;
        const game = this;
        
        const onStart = (e) => {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const rect = base.getBoundingClientRect();
            joystickOrigin = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            joystickActive = true;
        };
        
        const onMove = (e) => {
            if (!joystickActive) return;
            e.preventDefault();
            
            const touch = e.touches ? e.touches[0] : e;
            let dx = touch.clientX - joystickOrigin.x;
            let dy = touch.clientY - joystickOrigin.y;
            
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDistance) {
                dx = (dx / dist) * maxDistance;
                dy = (dy / dist) * maxDistance;
            }
            
            stick.style.transform = `translate(${dx}px, ${dy}px)`;
            
            if (game.input) {
                game.input.joystick.active = true;
                game.input.joystick.x = dx / maxDistance;
                game.input.joystick.y = dy / maxDistance;
            }
        };
        
        const onEnd = () => {
            joystickActive = false;
            stick.style.transform = 'translate(0, 0)';
            if (game.input) {
                game.input.joystick.active = false;
                game.input.joystick.x = 0;
                game.input.joystick.y = 0;
            }
        };
        
        base.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    }
    
    setupLookArea() {
        const lookArea = document.getElementById('look-area');
        if (!lookArea) return;
        
        let lastTouch = null;
        const sensitivity = 0.005;
        const game = this;
        
        lookArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            lastTouch = e.touches[0];
        }, { passive: false });
        
        lookArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!lastTouch) return;
            
            const touch = e.touches[0];
            const dx = touch.clientX - lastTouch.clientX;
            const dy = touch.clientY - lastTouch.clientY;
            
            if (game.camera3d) {
                game.camera3d.yaw -= dx * sensitivity;
                game.camera3d.pitch -= dy * sensitivity;
                game.camera3d.pitch = Math.max(game.camera3d.minPitch, Math.min(game.camera3d.maxPitch, game.camera3d.pitch));
            }
            
            lastTouch = touch;
        }, { passive: false });
        
        lookArea.addEventListener('touchend', () => {
            lastTouch = null;
        });
    }
    
    setupMobileButtons() {
        const game = this;
        
        // Jump button
        const jumpBtn = document.getElementById('btn-mobile-jump');
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (game.input) game.input.actions.jump = true;
                jumpBtn.classList.add('active');
            }, { passive: false });
            jumpBtn.addEventListener('touchend', () => {
                if (game.input) game.input.actions.jump = false;
                jumpBtn.classList.remove('active');
            });
        }
        
        // Mine button
        const mineBtn = document.getElementById('btn-mobile-mine');
        if (mineBtn) {
            mineBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                game.tryMine3D();
                mineBtn.classList.add('active');
            }, { passive: false });
            mineBtn.addEventListener('touchend', () => {
                mineBtn.classList.remove('active');
            });
        }
        
        // Place button
        const placeBtn = document.getElementById('btn-mobile-place');
        if (placeBtn) {
            placeBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                game.tryPlace3D();
                placeBtn.classList.add('active');
            }, { passive: false });
            placeBtn.addEventListener('touchend', () => {
                placeBtn.classList.remove('active');
            });
        }
        
        // Inventory button
        const invBtn = document.getElementById('btn-mobile-inventory');
        if (invBtn) {
            invBtn.addEventListener('click', () => {
                game.ui?.toggleInventory();
            });
        }
        
        // Craft button
        const craftBtn = document.getElementById('btn-mobile-craft');
        if (craftBtn) {
            craftBtn.addEventListener('click', () => {
                game.ui?.inventory?.toggleCraftingPanel();
            });
        }
        
        // Menu button
        const menuBtn = document.getElementById('btn-mobile-menu');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                const pauseMenu = document.getElementById('pause-menu');
                if (pauseMenu) {
                    if (pauseMenu.classList.contains('hidden')) {
                        pauseMenu.classList.remove('hidden');
                        game.paused = true;
                        // Update pause menu quest info
                        game.updatePauseMenuQuests();
                    } else {
                        pauseMenu.classList.add('hidden');
                        game.paused = false;
                    }
                }
            });
        }
    }
    
    initFeatureSystems() {
        // Quest System
        this.questManager = new QuestManager(this);
        this.questManager.init(); // Initialize first quest!
        
        // Skills
        this.skills = new SkillsManager(this);
        
        // Taming
        this.taming = new TamingSystem(this);
        
        // Weather
        this.weather = new WeatherSystem(this);
        
        // Armor
        this.armor = new ArmorSystem(this);
        
        // Statistics
        this.statistics = new Statistics(this);
        
        // Throwables
        this.throwables = new ThrowableSystem(this);
        
        // Temperature
        this.temperature = new TemperatureSystem(this);
        
        // Food Buffs
        this.foodBuffs = new FoodBuffSystem(this);
        
        // Home Beacons
        this.homeBeacons = new HomeBeaconSystem(this);
        
        // Wildlife
        this.wildlife = new WildlifeSystem(this);
        
        // Age Progression
        this.ageProgression = new AgeProgressionManager(this);
        
        // Combat Feel
        this.combatFeel = new CombatFeelSystem(this);
        
        // Stamina
        this.stamina = new StaminaSystem(this);
        
        // Status Effects
        this.statusEffects = new StatusEffectSystem(this);
        
        // Crafting Stations
        this.craftingStations = new CraftingStationSystem(this);
        
        // Storage
        this.storage = new StorageSystem(this);
        
        // Farming
        this.farming = new FarmingSystem(this);
        
        // Pet Commands
        this.petCommands = new PetCommandSystem(this);
        
        // Combos
        this.combos = new ComboSystem(this);
        
        // Achievements
        this.achievements = new AchievementSystem(this);
        
        // Loot Tables
        this.lootTables = new LootTableSystem(this);
        
        // Map Markers
        this.mapMarkers = new MapMarkerSystem(this);
        
        // World Events
        this.worldEvents = new WorldEventSystem(this);
        
        // Enchantments
        this.enchantments = new EnchantmentSystem(this);
        
        // Swimming
        this.swimming = new SwimmingSystem(this);
        
        // Sound Manager
        this.soundManager = new SoundManager(this);
        
        // NPC Trading
        this.npcTrading = new NPCTradingSystem(this);
        
        // Boss Summoning
        this.bossSummoning = new BossSummoningSystem(this);
        
        // Side Quests
        this.sideQuests = new SideQuestSystem(this);
        this.sideQuests.init(); // Initialize side quests!;
        
        // Block Breaking
        this.blockBreaking = new BlockBreakingSystem(this);
        
        // Death System
        this.deathScreen = new DeathSystem(this);
        
        // Boss Health Bar
        this.bossHealthBar = new BossHealthBarSystem(this);
        
        // Tool Durability
        this.toolDurability = new ToolDurabilitySystem(this);
        
        // Difficulty
        this.difficulty = new DifficultySystem(this);
        
        // Bestiary
        this.bestiary = new BestiarySystem(this);
        
        // Map Craft
        this.mapCraft = new MapSystem(this);
        
        // Fishing
        this.fishing = new FishingSystem(this);
        
        // Potions
        this.potions = new PotionSystem(this);
        
        // Grappling
        this.grappling = new GrapplingSystem(this);
        
        // Music
        this.adaptiveMusic = new MusicSystem(this);
        
        // Dungeons
        this.dungeons = new DungeonSystem(this);
        
        // Structures
        this.structures = new StructureSystem(this);
        
        // Seasonal Events
        this.seasonalEvents = new SeasonalEventsSystem(this);
        
        // Blueprints
        this.blueprints = new BlueprintSystem(this);
        
        // Civilization Management System
        this.civilization = new CivilizationManager(this);
        this.civilizationUI = new CivilizationUI(this);
        this.civilization.init();
        
        // Build mode for placing buildings
        this.buildMode = null;
    }
    
    async waitForRenderer() {
        // Wait for renderer to finish initializing (textures, atlas, etc.)
        while (!this.renderer3d.ready) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    buildInitialMeshes() {
        // Build meshes for all loaded chunks
        let meshCount = 0;
        for (const [key, chunk] of this.world.chunks) {
            const mesh = this.renderer3d.buildChunkMesh(chunk);
            if (mesh) meshCount++;
            console.log(`Game3D: Built mesh for chunk ${key}, has geometry: ${mesh !== null}`);
        }
        console.log(`Game3D: Built ${meshCount} chunk meshes total`);
    }
    
    gameLoop(timestamp) {
        requestAnimationFrame((t) => this.gameLoop(t));
        
        if (!this.lastTime) {
            this.lastTime = timestamp;
            return;
        }
        
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Always render, even when paused
        this.render();
        
        // Debug: Log paused state once per second
        if (!this._lastPausedLog) this._lastPausedLog = 0;
        this._lastPausedLog += deltaTime;
        if (this._lastPausedLog > 2) {
            console.log('Game3D loop: paused =', this.paused, ', pointerLocked =', !!document.pointerLockElement);
            this._lastPausedLog = 0;
        }
        
        if (this.paused) {
            return;
        }
        
        // Cap delta to prevent physics issues
        const dt = Math.min(deltaTime, 0.1);
        this.lastDeltaTime = dt; // Store for render
        
        // FPS calculation
        if (deltaTime > 0) {
            this.fps = this.fps * 0.9 + (1 / deltaTime) * 0.1;
        }
        
        // Update
        this.update(dt);
    }
    
    update(deltaTime) {
        // World update (time, spawning, etc)
        this.world.update(deltaTime);
        
        // Player update with 3D input
        if (this.player) {
            this.updatePlayer3D(deltaTime);
        }
        
        // Camera update
        this.camera3d.update(deltaTime);
        
        // Update day/night lighting
        this.renderer3d.updateDayNightCycle(this.world.timeOfDay);
        
        // Update entities (but NOT the player - player has its own model)
        for (const entity of this.entities) {
            entity.update(deltaTime);
            this.renderer3d.updateEntity(entity);
        }
        
        // Player model is updated in render() via updatePlayerModel()
        
        // Rebuild dirty chunks
        this.rebuildDirtyChunks();
        
        // Update all feature systems
        this.updateFeatureSystems(deltaTime);
        
        // Update block selection
        this.updateBlockSelection();
        
        // Save manager
        this.saveManager.update(Date.now());
    }
    
    updatePlayer3D(deltaTime) {
        const player = this.player;
        const input = this.input;
        
        // Get movement relative to camera
        const movement = input.getWorldMovement(this.camera3d);
        
        // Apply movement to player velocity
        const speed = input.isSprinting() ? player.speed * 1.5 : player.speed;
        
        player.vx = movement.x * speed;
        player.vy = movement.y * speed;
        
        // Jump
        if (input.isJumping() && player.grounded) {
            player.vz = player.jumpForce;
            player.grounded = false;
            this.audio.play('jump');
        }
        
        // Physics
        player.applyPhysics(deltaTime);
        
        // Mining cooldown
        if (!this.miningCooldown) this.miningCooldown = 0;
        this.miningCooldown -= deltaTime;
        
        // Placing cooldown
        if (!this.placingCooldown) this.placingCooldown = 0;
        this.placingCooldown -= deltaTime;
        
        const mining = input.isMining();
        const using = input.isUsing();
        
        // Debug: Log mining state periodically
        if (!this._lastMiningLog) this._lastMiningLog = 0;
        this._lastMiningLog += deltaTime;
        if (this._lastMiningLog > 1 && (mining || using)) {
            console.log('Mining state:', { mining, using, miningCooldown: this.miningCooldown, placingCooldown: this.placingCooldown });
            this._lastMiningLog = 0;
        }
        
        // Mining/Placing with cooldown
        if (mining && this.miningCooldown <= 0) {
            console.log('Attempting to mine...');
            if (this.tryMine3D()) {
                this.miningCooldown = 0.25; // 250ms cooldown
            }
        }
        
        if (using && this.placingCooldown <= 0) {
            if (this.tryPlace3D()) {
                this.placingCooldown = 0.2; // 200ms cooldown
            }
        }
        
        // Update player UI
        player.updateUI();
    }
    
    tryMine3D() {
        const hit = this.camera3d.getTargetBlock(5);
        if (!hit) {
            console.log('tryMine3D: No target block found');
            return false;
        }
        
        const { x, y, z, blockId } = hit;
        const blockData = BLOCK_DATA[blockId];
        
        if (!blockData || blockId === BLOCKS.BEDROCK) {
            console.log('tryMine3D: Invalid block or bedrock');
            return false;
        }
        
        console.log('Mining block:', blockId, 'at', x, y, z);
        
        // Mining logic (simplified for now)
        const tool = this.player.getSelectedItem();
        const miningSpeed = tool?.miningSpeed || 1;
        
        // Add break particles
        this.renderer3d.addBlockBreakParticles(x, y, z, blockId);
        
        // Instant mine for testing (can add progress later)
        this.world.setBlock(x, y, z, BLOCKS.AIR);
        this.markChunkDirty(x, y);
        
        // Drop item
        const drops = blockData.drops || [blockId];
        for (const dropId of drops) {
            // Find item key for this block
            for (const [key, item] of Object.entries(ITEMS)) {
                if (item.blockId === dropId || item.blockId === blockId) {
                    this.player.addItem(key);
                    break;
                }
            }
        }
        
        this.audio.play('break');
        return true;
    }
    
    tryPlace3D() {
        const item = this.player.getSelectedItem();
        if (!item || (item.type !== 'block' && item.type !== 'placeable')) return false;
        
        const hit = this.camera3d.getTargetBlock(CONFIG.MINING_RANGE);
        if (!hit) return false;
        
        // Calculate placement position (adjacent to hit face)
        let px = hit.x, py = hit.y, pz = hit.z;
        
        switch (hit.face) {
            case 'top': pz++; break;
            case 'bottom': pz--; break;
            case 'front': py++; break;
            case 'back': py--; break;
            case 'right': px++; break;
            case 'left': px--; break;
        }
        
        // Check if placement position is empty
        if (this.world.getBlock(px, py, pz) !== BLOCKS.AIR) return false;
        
        // Check collision with player
        if (this.checkPlayerBlockCollision(px, py, pz)) return false;
        
        // Place block
        const blockId = item.blockId;
        if (blockId === undefined) return false;
        
        this.world.setBlock(px, py, pz, blockId);
        this.markChunkDirty(px, py);
        
        // Consume item (unless builder mode)
        if (!this.builderMode) {
            if (item.stackable && item.count > 1) {
                item.count--;
            } else {
                this.player.hotbar[this.player.selectedSlot] = null;
            }
        }
        
        this.player.updateUI();
        this.audio.play('place');
        return true;
    }
    
    checkPlayerBlockCollision(bx, by, bz) {
        const p = this.player;
        const margin = 0.1;
        
        // Simple AABB check
        return !(p.x + p.width < bx + margin || 
                 p.x > bx + 1 - margin ||
                 p.y + p.height < by + margin || 
                 p.y > by + 1 - margin ||
                 p.z + p.depth < bz + margin || 
                 p.z > bz + 1 - margin);
    }
    
    updateBuildMode() {
        if (!this.buildMode?.active) return;
        
        const hit = this.camera3d.getTargetBlock(10);
        if (!hit) {
            this.renderer3d.updatePlacementPreview(null);
            return;
        }
        
        // Calculate placement position on top of hit block
        const building = this.buildMode.data;
        const px = hit.x;
        const py = hit.y;
        const pz = hit.z + 1; // Place on top
        
        this.renderer3d.updatePlacementPreview(px, py, pz, building);
        this.buildMode.previewPos = { x: px, y: py, z: pz };
    }
    
    placeBuildModeBuilding() {
        if (!this.buildMode?.active || !this.buildMode.previewPos) return;
        
        const settlement = this.civilization?.activeSettlement;
        if (!settlement) {
            this.ui?.showMessage('No active settlement!', 'error');
            return;
        }
        
        const pos = this.buildMode.previewPos;
        const success = settlement.queueBuilding(
            this.buildMode.building,
            pos.x, pos.y, pos.z
        );
        
        if (success) {
            this.cancelBuildMode();
        }
    }
    
    cancelBuildMode() {
        this.buildMode = null;
        this.renderer3d.updatePlacementPreview(null);
    }
    
    updateBlockSelection() {
        const hit = this.camera3d.getTargetBlock(CONFIG.MINING_RANGE);
        
        if (hit) {
            this.renderer3d.updateSelectionBox(hit.x, hit.y, hit.z);
        } else {
            this.renderer3d.updateSelectionBox(null, null, null);
        }
    }
    
    markChunkDirty(wx, wy) {
        const cx = Math.floor(wx / CONFIG.CHUNK_SIZE);
        const cy = Math.floor(wy / CONFIG.CHUNK_SIZE);
        this.dirtyChunks.add(`${cx},${cy}`);
        
        // Also mark adjacent chunks if on boundary
        const lx = wx - cx * CONFIG.CHUNK_SIZE;
        const ly = wy - cy * CONFIG.CHUNK_SIZE;
        
        if (lx === 0) this.dirtyChunks.add(`${cx - 1},${cy}`);
        if (lx === CONFIG.CHUNK_SIZE - 1) this.dirtyChunks.add(`${cx + 1},${cy}`);
        if (ly === 0) this.dirtyChunks.add(`${cx},${cy - 1}`);
        if (ly === CONFIG.CHUNK_SIZE - 1) this.dirtyChunks.add(`${cx},${cy + 1}`);
    }
    
    rebuildDirtyChunks() {
        // Limit rebuilds per frame
        let rebuilds = 0;
        const maxRebuilds = 2;
        
        for (const key of this.dirtyChunks) {
            if (rebuilds >= maxRebuilds) break;
            
            const chunk = this.world.chunks.get(key);
            if (chunk) {
                this.renderer3d.buildChunkMesh(chunk);
                rebuilds++;
            }
            
            this.dirtyChunks.delete(key);
        }
    }
    
    updateFeatureSystems(deltaTime) {
        // Update all game systems
        if (this.questManager) {
            this.questManager.update(deltaTime);
            // Track player location for quest updates
            if (this.player) {
                this.questManager.onLocationUpdate(this.player.x, this.player.y);
            }
        }
        if (this.weather) this.weather.update(deltaTime);
        if (this.temperature) this.temperature.update(deltaTime);
        if (this.stamina) this.stamina.update(deltaTime);
        if (this.statusEffects) this.statusEffects.update(deltaTime);
        if (this.foodBuffs) this.foodBuffs.update(deltaTime);
        if (this.taming) this.taming.update(deltaTime);
        if (this.wildlife) this.wildlife.update(deltaTime);
        if (this.farming) this.farming.update(deltaTime);
        if (this.ageProgression) this.ageProgression.update(deltaTime);
        if (this.combatFeel) this.combatFeel.update(deltaTime);
        if (this.worldEvents) this.worldEvents.update(deltaTime);
        if (this.npcTrading) this.npcTrading.update(deltaTime);
        if (this.sideQuests) this.sideQuests.update(deltaTime);
        if (this.adaptiveMusic) this.adaptiveMusic.update(deltaTime);
        if (this.seasonalEvents) this.seasonalEvents.update?.(deltaTime);
        
        // Civilization management system
        if (this.civilization) this.civilization.update(deltaTime);
        
        // Handle build mode
        if (this.buildMode?.active) {
            this.updateBuildMode();
        }
        
        // Update HUD displays
        this.updateHUD();
    }
    
    updateHUD() {
        // Update day/time display
        const dayText = document.getElementById('day-text');
        const timeText = document.getElementById('time-text');
        const weatherText = document.getElementById('weather-text');
        const ageText = document.getElementById('age-text');
        
        if (dayText && this.world) {
            dayText.textContent = `Day ${this.world.dayCount + 1}`;
        }
        
        if (timeText && this.world) {
            const hours = Math.floor(this.world.timeOfDay * 24);
            const minutes = Math.floor((this.world.timeOfDay * 24 - hours) * 60);
            const isDay = this.world.timeOfDay >= 0.25 && this.world.timeOfDay < 0.75;
            timeText.textContent = `${isDay ? '☀️' : '🌙'} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        if (weatherText && this.weather) {
            const weatherIcons = { clear: '☀️', cloudy: '☁️', rain: '🌧️', storm: '⛈️', snow: '❄️' };
            const icon = weatherIcons[this.weather.current] || '☀️';
            weatherText.textContent = `${icon} ${this.weather.current || 'Clear'}`;
        }
        
        if (ageText && this.questManager) {
            const ages = { STONE_AGE: '🦴 Stone Age', TRIBAL_AGE: '🏕️ Tribal Age', BRONZE_AGE: '⚔️ Bronze Age' };
            ageText.textContent = ages[this.questManager.currentAge] || '🦴 Stone Age';
        }
        
        // Update temperature
        const tempText = document.getElementById('temperature-text');
        const tempFill = document.getElementById('temperature-fill');
        if (tempText && this.temperature) {
            const temp = Math.round(this.temperature.currentTemp || 50);
            tempText.textContent = `🌡️ ${temp}°`;
            if (tempFill) {
                tempFill.style.width = `${temp}%`;
                // Color based on temperature
                if (temp < 30) tempFill.style.background = '#3b82f6'; // Cold - blue
                else if (temp > 70) tempFill.style.background = '#ef4444'; // Hot - red
                else tempFill.style.background = '#22c55e'; // Normal - green
            }
        }
        
        // Update armor
        const armorText = document.getElementById('armor-text');
        if (armorText && this.armor) {
            armorText.textContent = `🛡️ ${this.armor.totalArmor || 0}`;
        }
        
        // Update level/XP
        const levelText = document.getElementById('level-text');
        const xpFill = document.getElementById('xp-fill');
        if (levelText && this.player) {
            levelText.textContent = `Lvl ${this.player.level || 1}`;
            if (xpFill) {
                const xpPercent = ((this.player.xp || 0) / (this.player.xpToNextLevel || 100)) * 100;
                xpFill.style.width = `${Math.min(xpPercent, 100)}%`;
            }
        }
    }
    
    updatePauseMenuQuests() {
        const mainQuestDiv = document.getElementById('pause-main-quest');
        const sideQuestsDiv = document.getElementById('pause-side-quests');
        
        if (mainQuestDiv && this.questManager && this.questManager.activeQuest) {
            const quest = this.questManager.activeQuest;
            let html = `<strong>${quest.icon || '📜'} ${quest.name}</strong><br>`;
            html += `<em>${quest.description}</em><br><br>`;
            
            for (const obj of quest.objectives) {
                const done = obj.current >= (obj.required || 1);
                const icon = done ? '✅' : '⬜';
                html += `${icon} ${obj.description} (${Math.floor(obj.current)}/${obj.required})<br>`;
            }
            
            mainQuestDiv.innerHTML = html;
        } else if (mainQuestDiv) {
            mainQuestDiv.innerHTML = 'No active quest';
        }
        
        if (sideQuestsDiv && this.sideQuests && this.sideQuests.activeQuests) {
            const activeQuests = this.sideQuests.activeQuests;
            if (activeQuests.length === 0) {
                sideQuestsDiv.innerHTML = '<em>No active side quests</em>';
            } else {
                let html = '<strong>Side Quests:</strong><br>';
                for (const quest of activeQuests.slice(0, 3)) {
                    html += `• ${quest.name}<br>`;
                }
                sideQuestsDiv.innerHTML = html;
            }
        }
    }
    
    render() {
        // Render 3D scene with deltaTime for animations
        const deltaTime = this.lastDeltaTime || 0.016;
        this.renderer3d.render(this.camera3d, deltaTime);
        
        // Particles (need 3D adaptation)
        // this.particles.render();
    }
    
    togglePause(paused) {
        this.paused = paused;
        
        if (this.paused && this.input) {
            this.input.keys = {};
        }
        
        if (this.ui) {
            this.ui.togglePauseUI(this.paused);
        }
        
        // Release pointer lock when pausing
        if (this.paused && document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    startNewGame() {
        // Reset world
        this.world.chunks.clear();
        this.world.dayCount = 0;
        this.world.timeOfDay = 0.25;
        
        // Reset player
        const spawnHeight = this.world.getHeight(8, 8) + 2;
        this.player = new Player(this, 8, 8, spawnHeight);
        
        // Clear entities
        this.entities = [];
        
        // Clear all chunk meshes
        this.renderer3d.dispose();
        this.renderer3d = new Renderer3D(this);
        
        // Rebuild initial meshes
        this.buildInitialMeshes();
        
        // Reset camera
        this.camera3d.snapToTarget();
        
        // Reset systems
        if (this.questManager) this.questManager.init();
        if (this.sideQuests) this.sideQuests.init();
        
        this.paused = false;
        this.player.updateUI();
        
        console.log('Game3D: New game started');
    }
    
    giveBuilderItems() {
        if (!this.player) return;
        
        this.builderMode = true;
        console.log('Game3D: Builder mode activated');
        
        // God mode
        this.player.health = 9999;
        this.player.maxHealth = 9999;
        this.player.hunger = 9999;
        this.player.maxHunger = 9999;
        
        // Fill hotbar with building blocks
        const hotbarItems = [
            { ...ITEMS.cobblestone, count: 999 },
            { ...ITEMS.plank, count: 999 },
            { ...ITEMS.stone, count: 999 },
            { ...ITEMS.glass, count: 999 },
            { ...ITEMS.thatch, count: 999 },
            { ...ITEMS.mud_brick, count: 999 },
            { ...ITEMS.torch, count: 999 },
            { ...ITEMS.diamond_pickaxe, count: 1 }
        ];
        
        for (let i = 0; i < Math.min(hotbarItems.length, 8); i++) {
            this.player.hotbar[i] = hotbarItems[i];
        }
        
        // Fill inventory with all blocks and tools
        let invIndex = 0;
        for (const [key, item] of Object.entries(ITEMS)) {
            if (item.type === 'block' || item.type === 'placeable' || 
                item.type === 'tool' || item.type === 'weapon') {
                if (invIndex >= this.player.inventory.length) break;
                this.player.inventory[invIndex] = {
                    ...item,
                    count: item.stackable ? 999 : 1
                };
                invIndex++;
            }
        }
        
        this.player.updateUI();
        
        if (this.ageProgression) {
            this.ageProgression.updateAgeUI();
        }
    }
    
    respawn() {
        if (!this.player) return;
        
        const spawn = this.player.spawnPoint;
        this.player.x = spawn.x;
        this.player.y = spawn.y;
        this.player.z = spawn.z + 2;
        
        this.player.health = this.player.maxHealth;
        this.player.hunger = this.player.maxHunger / 2;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.vz = 0;
        
        this.camera3d.snapToTarget();
        this.player.updateUI();
        
        // Hide death screen
        const deathScreen = document.getElementById('death-screen');
        if (deathScreen) deathScreen.classList.add('hidden');
    }
    
    // Legacy compatibility
    get camera() {
        return {
            x: this.camera3d?.currentPosition?.x || 0,
            y: this.camera3d?.currentPosition?.z || 0, // Three.Z = World.Y
            zoom: this.camera3d?.zoom || 1,
            addShake: (i, d) => this.camera3d?.addShake(i, d),
            worldToScreen: (x, y, z) => this.camera3d?.worldToScreen(x, y, z)
        };
    }
}

// Start game
const game = new Game3D();
window.game = game; // Debug access
