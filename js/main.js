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

class Game {
    constructor() {
        this.lastTime = 0;
        this.accumulator = 0;
        this.tickRate = 1 / 60;
        this.initialized = false;

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
        // Find safe spawn
        let spawnZ = 20;
        const groundZ = this.world.getHeight(0, 0);
        if (groundZ > 0) {
            spawnZ = groundZ + 2;
        }

        this.player = new Player(this, 0, 0, spawnZ);
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

        // Update
        this.update(deltaTime);

        // Render
        this.renderer.render();
        this.renderer.renderDebug();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    startNewGame() {
        console.log('Game: startNewGame called. Creating fresh world...');

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

        // 3. Find Spawn at chunk center
        this.world.generateChunk(0, 0); // Ensure origin chunk exists
        let spawnZ = this.world.getHeight(8, 8); // Get height at actual spawn point!
        console.log(`Spawn height at (8,8): ${spawnZ}`);

        // DEBUG: Verify ground blocks exist
        const blockAtSpawn = this.world.getBlock(8, 8, spawnZ);
        const blockBelow = this.world.getBlock(8, 8, spawnZ - 1);
        const blockAbove = this.world.getBlock(8, 8, spawnZ + 1);
        console.log(`Ground verification: block@Z${spawnZ}=${blockAtSpawn}, @Z${spawnZ - 1}=${blockBelow}, @Z${spawnZ + 1}=${blockAbove}`);

        if (spawnZ <= 0) spawnZ = 20; // Fallback

        this.player.x = 8.5;
        this.player.y = 8.5;
        this.player.z = spawnZ + 1; // Spawn 1 above ground (feet at spawnZ+1, ground at spawnZ)
        this.player.vx = 0; this.player.vy = 0; this.player.vz = 0;
        this.player.spawnPoint = { x: 8.5, y: 8.5, z: spawnZ + 1 };
        this.player.grounded = true; // Start grounded!
        
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

        // Snap camera to new position
        this.camera.snapToTarget();

        this.paused = false;

        // Overwrite save immediately to prevent loading old state later
        this.saveManager.save();

        console.log(`Game: New Game Started. Spawn at Z=${this.player.z}`);
        this.player.updateUI();
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

        if (this.player) {
            this.player.update(deltaTime);
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
        this.player.health = this.player.maxHealth;
        this.player.hunger = this.player.maxHunger;
        this.player.isDead = false;

        if (this.player.spawnPoint) {
            this.player.x = this.player.spawnPoint.x;
            this.player.y = this.player.spawnPoint.y;
            this.player.z = this.player.spawnPoint.z;
        } else {
            this.player.x = 0;
            this.player.y = 0;
            this.player.z = 20;
        }

        this.player.vx = 0;
        this.player.vy = 0;
        this.player.vz = 0;

        // Reset time? Maybe keep it.
        // Clear enemies nearby?
        this.entities = [];

        this.ui.closeAllModals();
        this.player.updateUI();
    }
}

// Start Game
window.onload = () => {
    const game = new Game();
    window.game = game;
    // Resize is called inside initAsync after initialization
    window.addEventListener('resize', () => game.resize());
};
