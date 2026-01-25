import { BLOCK_DATA, BLOCKS, CONFIG } from '../config.js';

export class SpriteManager {
    constructor() {
        this.textures = new Map();
        this.blockSprites = new Map(); // Cache for iso blocks
        this.playerSprites = new Map(); // Player animation sprites
        this.enemySprites = new Map(); // Enemy sprites
        this.shadowMask = null;
        this.tileSize = 16; // Texture resolution
        this.isoSize = 64; // Rendered block size (match CONFIG.TILE_WIDTH)
        this.spritesLoaded = false;
        
        // Use seeded random for consistent textures
        this.seed = 12345;
    }
    
    // Seeded random for consistent procedural generation
    seededRandom() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    resetSeed() {
        this.seed = 12345;
    }

    async init() {
        // Generate all block textures with unique Minecraft-style patterns
        this.generateAllTextures();

        // Generate Block Sprites
        this.generateBlockSprites();

        // Load player sprites
        await this.loadPlayerSprites();
        
        // Load enemy sprites
        await this.loadEnemySprites();

        this.spritesLoaded = true;
        console.log('Sprites Generated and Loaded');
    }
    
    async loadGrassBlockSprite() {
        return new Promise((resolve) => {
            this.grassBlockSprite = new Image();
            this.grassBlockSprite.onload = () => {
                this.grassBlockLoaded = true;
                console.log('Grass block sprite loaded successfully');
                resolve();
            };
            this.grassBlockSprite.onerror = () => {
                console.warn('Grass block sprite failed to load, using generated texture');
                this.grassBlockLoaded = false;
                resolve();
            };
            this.grassBlockSprite.src = 'assets/sprites/blocks/grassblock.png';
        });
    }
    
    async loadBlockAtlas() {
        return new Promise((resolve) => {
            this.blockAtlas = new Image();
            this.blockAtlas.onload = () => {
                this.blockAtlasLoaded = true;
                console.log('Block atlas loaded successfully');
                resolve();
            };
            this.blockAtlas.onerror = () => {
                console.warn('Block atlas failed to load, using generated textures');
                this.blockAtlasLoaded = false;
                resolve();
            };
            this.blockAtlas.src = 'assets/sprites/blocks/blocks.png';
        });
    }
    
    // Get a texture from the atlas
    getAtlasTexture(blockType) {
        if (!this.blockAtlasLoaded || !this.atlasBlockMap[blockType]) {
            return null;
        }
        
        const pos = this.atlasBlockMap[blockType];
        const canvas = document.createElement('canvas');
        // Create a smaller texture for pattern use (16x16)
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');
        
        // Extract the block from the atlas and scale down for texture pattern
        ctx.drawImage(
            this.blockAtlas,
            pos.col * this.atlasBlockSize,
            pos.row * this.atlasBlockSize,
            this.atlasBlockSize,
            this.atlasBlockSize,
            0,
            0,
            this.tileSize,
            this.tileSize
        );
        
        return canvas;
    }
    
    // Get a full isometric block sprite from the atlas
    getAtlasBlockSprite(blockType) {
        if (!this.blockAtlasLoaded || !this.atlasBlockMap[blockType]) {
            return null;
        }
        
        const pos = this.atlasBlockMap[blockType];
        const canvas = document.createElement('canvas');
        canvas.width = this.isoSize;
        canvas.height = this.isoSize * 1.5; // Match the expected sprite dimensions
        const ctx = canvas.getContext('2d');
        
        // Draw the atlas block scaled to our iso size
        ctx.drawImage(
            this.blockAtlas,
            pos.col * this.atlasBlockSize,
            pos.row * this.atlasBlockSize,
            this.atlasBlockSize,
            this.atlasBlockSize,
            0,
            (this.isoSize * 1.5 - this.isoSize) / 2, // Center vertically
            this.isoSize,
            this.isoSize
        );
        
        return canvas;
    }

    generateAllTextures() {
        this.resetSeed();
        
        // Natural blocks - Minecraft-inspired stone age textures
        this.generateMinecraftDirt();
        this.generateMinecraftGrass();
        this.generateMinecraftStone();
        this.generateMinecraftCobblestone();
        this.generateMinecraftWood();
        this.generateMinecraftLeaves();
        this.generateMinecraftSand();
        this.generateMinecraftWater();
        this.generateMinecraftBedrock();
        this.generateMinecraftSnow();
        this.generateMinecraftIce();
        this.generateMinecraftGravel();
        this.generateMinecraftClay();
        
        // Ores - Minecraft style
        this.generateMinecraftOre('coal_ore', '#7F7F7F', '#1A1A1A', 8);
        this.generateMinecraftOre('iron_ore', '#7F7F7F', '#C8A882', 6);
        this.generateMinecraftOre('gold_ore', '#7F7F7F', '#F8D52E', 5);
        this.generateMinecraftOre('diamond_ore', '#7F7F7F', '#5EE8D0', 4);
        
        // Building blocks
        this.generateMinecraftPlanks();
        this.generateMinecraftBrick();
        this.generateMinecraftGlass();
        this.generateMinecraftSandstone();
        this.generateMinecraftMossStone();
        this.generateMinecraftObsidian();
        
        // Prehistoric blocks
        this.generateThatchTexture();
        this.generateMudBrickTexture();
        this.generateBoneBlockTexture();
        this.generateHayBlockTexture();
        
        // Functional blocks
        this.generateCraftingTableTexture();
        this.generateFurnaceTexture();
        this.generateChestTexture();
        this.generateTorchTexture();
        this.generateCampfireTexture();
        this.generateFarmlandTexture();
        this.generateCactusTexture();
        this.generateWheatTexture();
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        return canvas;
    }
    
    // Helper to get pixel-perfect color blending
    blendColor(color1, color2, factor) {
        const r1 = parseInt(color1.slice(1,3), 16);
        const g1 = parseInt(color1.slice(3,5), 16);
        const b1 = parseInt(color1.slice(5,7), 16);
        const r2 = parseInt(color2.slice(1,3), 16);
        const g2 = parseInt(color2.slice(3,5), 16);
        const b2 = parseInt(color2.slice(5,7), 16);
        const r = Math.floor(r1 + (r2 - r1) * factor);
        const g = Math.floor(g1 + (g2 - g1) * factor);
        const b = Math.floor(b1 + (b2 - b1) * factor);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    }

    // === MINECRAFT-STYLE NATURAL BLOCKS ===

    generateMinecraftDirt() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Base dirt brown
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(0, 0, 16, 16);
        
        // Minecraft-style pixel noise pattern
        const colors = ['#6B4423', '#9C6B3C', '#7A5230', '#8B5A2B', '#5D4023'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.4) {
                    ctx.fillStyle = colors[Math.floor(this.seededRandom() * colors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Small pebbles (darker spots)
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = '#4A3A1A';
            const x = Math.floor(this.seededRandom() * 14) + 1;
            const y = Math.floor(this.seededRandom() * 14) + 1;
            ctx.fillRect(x, y, 1, 1);
        }
        
        this.textures.set('dirt', canvas);
    }

    generateMinecraftGrass() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Rich green base
        ctx.fillStyle = '#5D9B41';
        ctx.fillRect(0, 0, 16, 16);
        
        // Minecraft grass variation pixels
        const greens = ['#4A8233', '#6BA84E', '#5D9B41', '#7BB35C', '#3D7029'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.3) {
                    ctx.fillStyle = greens[Math.floor(this.seededRandom() * greens.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Occasional darker patches
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#3D6029';
            const x = Math.floor(this.seededRandom() * 14);
            const y = Math.floor(this.seededRandom() * 14);
            ctx.fillRect(x, y, 2, 2);
        }
        
        this.textures.set('grass_top', canvas);
    }

    generateMinecraftStone() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Gray base
        ctx.fillStyle = '#7F7F7F';
        ctx.fillRect(0, 0, 16, 16);
        
        // Minecraft stone pixel variation
        const grays = ['#6B6B6B', '#8C8C8C', '#7F7F7F', '#737373', '#999999'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.35) {
                    ctx.fillStyle = grays[Math.floor(this.seededRandom() * grays.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Dark cracks/spots
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = '#5A5A5A';
            const x = Math.floor(this.seededRandom() * 16);
            const y = Math.floor(this.seededRandom() * 16);
            ctx.fillRect(x, y, 1, 1);
        }
        
        this.textures.set('stone', canvas);
    }

    generateMinecraftCobblestone() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Dark mortar background
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(0, 0, 16, 16);
        
        // Draw irregular cobblestone pattern (Minecraft style)
        const stones = [
            {x: 0, y: 0, w: 5, h: 4, c: '#8C8C8C'},
            {x: 6, y: 0, w: 6, h: 5, c: '#7F7F7F'},
            {x: 13, y: 0, w: 3, h: 4, c: '#858585'},
            {x: 0, y: 5, w: 4, h: 5, c: '#757575'},
            {x: 5, y: 4, w: 5, h: 5, c: '#8A8A8A'},
            {x: 11, y: 5, w: 5, h: 4, c: '#7A7A7A'},
            {x: 0, y: 11, w: 6, h: 5, c: '#828282'},
            {x: 7, y: 10, w: 5, h: 6, c: '#787878'},
            {x: 13, y: 10, w: 3, h: 6, c: '#8E8E8E'}
        ];
        
        stones.forEach(stone => {
            ctx.fillStyle = stone.c;
            ctx.fillRect(stone.x, stone.y, stone.w - 1, stone.h - 1);
            
            // Add pixel noise to each stone
            for (let i = 0; i < 3; i++) {
                const shade = this.seededRandom() > 0.5 ? '#6E6E6E' : '#949494';
                ctx.fillStyle = shade;
                const px = stone.x + Math.floor(this.seededRandom() * (stone.w - 1));
                const py = stone.y + Math.floor(this.seededRandom() * (stone.h - 1));
                ctx.fillRect(px, py, 1, 1);
            }
        });
        
        this.textures.set('cobblestone', canvas);
    }

    generateMinecraftWood() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Oak bark base
        ctx.fillStyle = '#6B5034';
        ctx.fillRect(0, 0, 16, 16);
        
        // Vertical bark lines (Minecraft style)
        const barkColors = ['#5D4427', '#7A5C3E', '#4A3A22', '#6B5034'];
        for (let x = 0; x < 16; x++) {
            const color = barkColors[x % barkColors.length];
            ctx.fillStyle = color;
            for (let y = 0; y < 16; y++) {
                if (this.seededRandom() > 0.3) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Dark vertical line accents
        ctx.fillStyle = '#3D2A18';
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(this.seededRandom() * 16);
            for (let y = 0; y < 16; y += 2 + Math.floor(this.seededRandom() * 3)) {
                ctx.fillRect(x, y, 1, 2);
            }
        }
        
        this.textures.set('wood', canvas);
    }

    generateMinecraftLeaves() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Leaf green base
        ctx.fillStyle = '#3A8B25';
        ctx.fillRect(0, 0, 16, 16);
        
        // Minecraft leaf cluster pattern
        const leafColors = ['#2D6E1C', '#48A833', '#3A8B25', '#54B83F', '#267015'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = leafColors[Math.floor(this.seededRandom() * leafColors.length)];
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Add some transparency gaps (darker spots to simulate holes)
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = '#1A4010';
            const x = Math.floor(this.seededRandom() * 16);
            const y = Math.floor(this.seededRandom() * 16);
            ctx.fillRect(x, y, 1, 1);
        }
        
        this.textures.set('leaves', canvas);
    }

    generateMinecraftSand() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Sandy yellow base
        ctx.fillStyle = '#E3D59B';
        ctx.fillRect(0, 0, 16, 16);
        
        // Sand grain variation
        const sandColors = ['#D4C68D', '#E8DAA5', '#CFBE82', '#E3D59B', '#DBC990'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.25) {
                    ctx.fillStyle = sandColors[Math.floor(this.seededRandom() * sandColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        this.textures.set('sand', canvas);
    }

    generateMinecraftWater() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Deep blue base
        ctx.fillStyle = '#2B5DAA';
        ctx.fillRect(0, 0, 16, 16);
        
        // Water ripple pattern
        const waterColors = ['#2454A0', '#3366B8', '#1E4D96', '#2B5DAA'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = waterColors[Math.floor(this.seededRandom() * waterColors.length)];
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Light reflections
        ctx.fillStyle = '#4A7DC4';
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(this.seededRandom() * 14);
            const y = Math.floor(this.seededRandom() * 14);
            ctx.fillRect(x, y, 2, 1);
        }
        
        this.textures.set('water', canvas);
    }

    generateMinecraftBedrock() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Very dark base
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, 16, 16);
        
        // Bedrock noise pattern
        const bedrockColors = ['#1A1A1A', '#404040', '#2D2D2D', '#4A4A4A', '#262626'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = bedrockColors[Math.floor(this.seededRandom() * bedrockColors.length)];
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        this.textures.set('bedrock', canvas);
    }

    generateMinecraftSnow() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // White base
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, 16, 16);
        
        // Snow texture variation
        const snowColors = ['#FFFFFF', '#E8E8E8', '#F5F5F5', '#EBEBEB'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.4) {
                    ctx.fillStyle = snowColors[Math.floor(this.seededRandom() * snowColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        this.textures.set('snow', canvas);
    }

    generateMinecraftIce() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Light blue ice base
        ctx.fillStyle = '#9BC4E2';
        ctx.fillRect(0, 0, 16, 16);
        
        // Ice crystal pattern
        const iceColors = ['#8EBAD8', '#A8CEE8', '#B5D6ED', '#7AAFD0'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = iceColors[Math.floor(this.seededRandom() * iceColors.length)];
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // White streaks
        ctx.fillStyle = '#D0E8F5';
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(this.seededRandom() * 12);
            const y = Math.floor(this.seededRandom() * 16);
            ctx.fillRect(x, y, 4, 1);
        }
        
        this.textures.set('ice', canvas);
    }

    generateMinecraftGravel() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Gray-brown base
        ctx.fillStyle = '#8B8378';
        ctx.fillRect(0, 0, 16, 16);
        
        // Gravel pebble noise
        const gravelColors = ['#706B62', '#9B958A', '#858078', '#7A756C', '#A09890'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = gravelColors[Math.floor(this.seededRandom() * gravelColors.length)];
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Darker pebble spots
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = '#5A564F';
            const x = Math.floor(this.seededRandom() * 16);
            const y = Math.floor(this.seededRandom() * 16);
            ctx.fillRect(x, y, 1, 1);
        }
        
        this.textures.set('gravel', canvas);
    }

    generateMinecraftClay() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Gray-blue clay base
        ctx.fillStyle = '#9BA3AE';
        ctx.fillRect(0, 0, 16, 16);
        
        // Clay texture
        const clayColors = ['#8F97A2', '#A5ADB8', '#9BA3AE', '#949CA7'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.3) {
                    ctx.fillStyle = clayColors[Math.floor(this.seededRandom() * clayColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        this.textures.set('clay', canvas);
    }

    // === MINECRAFT-STYLE ORE BLOCKS ===
    
    generateMinecraftOre(name, baseColor, oreColor, count) {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Start with stone texture base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 16, 16);
        
        // Stone pixel variation
        const grays = ['#6B6B6B', '#8C8C8C', '#7F7F7F', '#737373'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.4) {
                    ctx.fillStyle = grays[Math.floor(this.seededRandom() * grays.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Add ore clusters (Minecraft style - small grouped pixels)
        for (let i = 0; i < count; i++) {
            const cx = 2 + Math.floor(this.seededRandom() * 12);
            const cy = 2 + Math.floor(this.seededRandom() * 12);
            
            // Draw a small ore cluster (2-4 pixels)
            ctx.fillStyle = oreColor;
            ctx.fillRect(cx, cy, 1, 1);
            if (this.seededRandom() > 0.3) ctx.fillRect(cx + 1, cy, 1, 1);
            if (this.seededRandom() > 0.3) ctx.fillRect(cx, cy + 1, 1, 1);
            if (this.seededRandom() > 0.5) ctx.fillRect(cx + 1, cy + 1, 1, 1);
        }
        
        this.textures.set(name, canvas);
    }

    // === MINECRAFT-STYLE BUILDING BLOCKS ===

    generateMinecraftPlanks() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Oak plank base
        ctx.fillStyle = '#BC9456';
        ctx.fillRect(0, 0, 16, 16);
        
        // Horizontal plank lines
        const plankColors = ['#A88347', '#C9A162', '#B58E4F', '#BC9456'];
        
        // Draw 4 horizontal planks
        for (let plank = 0; plank < 4; plank++) {
            const y = plank * 4;
            ctx.fillStyle = plankColors[plank];
            ctx.fillRect(0, y, 16, 4);
            
            // Add wood grain pixels
            for (let px = 0; px < 16; px++) {
                for (let py = y; py < y + 4; py++) {
                    if (this.seededRandom() > 0.6) {
                        ctx.fillStyle = this.seededRandom() > 0.5 ? '#A07840' : '#C8A060';
                        ctx.fillRect(px, py, 1, 1);
                    }
                }
            }
            
            // Dark line at bottom of each plank
            ctx.fillStyle = '#8A6E3B';
            ctx.fillRect(0, y + 3, 16, 1);
        }
        
        this.textures.set('planks', canvas);
    }

    generateMinecraftBrick() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Mortar background
        ctx.fillStyle = '#8B8378';
        ctx.fillRect(0, 0, 16, 16);
        
        // Draw brick pattern
        const brickColor = '#9B4B4B';
        const brickAlt = '#8A4242';
        
        // Row 1: full bricks
        for (let i = 0; i < 2; i++) {
            ctx.fillStyle = this.seededRandom() > 0.5 ? brickColor : brickAlt;
            ctx.fillRect(i * 8, 0, 7, 3);
        }
        
        // Row 2: offset bricks
        ctx.fillStyle = brickAlt;
        ctx.fillRect(0, 4, 3, 3);
        ctx.fillStyle = brickColor;
        ctx.fillRect(4, 4, 7, 3);
        ctx.fillStyle = brickAlt;
        ctx.fillRect(12, 4, 4, 3);
        
        // Row 3: full bricks
        for (let i = 0; i < 2; i++) {
            ctx.fillStyle = this.seededRandom() > 0.5 ? brickColor : brickAlt;
            ctx.fillRect(i * 8, 8, 7, 3);
        }
        
        // Row 4: offset bricks
        ctx.fillStyle = brickColor;
        ctx.fillRect(0, 12, 3, 3);
        ctx.fillStyle = brickAlt;
        ctx.fillRect(4, 12, 7, 3);
        ctx.fillStyle = brickColor;
        ctx.fillRect(12, 12, 4, 3);
        
        this.textures.set('brick', canvas);
    }

    generateMinecraftGlass() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Light blue transparent base
        ctx.fillStyle = '#C8DFEF';
        ctx.fillRect(0, 0, 16, 16);
        
        // Glass border
        ctx.fillStyle = '#9CBCD6';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 0, 1, 16);
        ctx.fillRect(15, 0, 1, 16);
        
        // Light streaks
        ctx.fillStyle = '#E0F0FF';
        ctx.fillRect(2, 2, 3, 1);
        ctx.fillRect(2, 3, 1, 2);
        
        this.textures.set('glass', canvas);
    }

    generateMinecraftSandstone() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Sandstone base
        ctx.fillStyle = '#E3D6A8';
        ctx.fillRect(0, 0, 16, 16);
        
        // Sandstone bands
        const sandstoneColors = ['#D6C99B', '#E8DDB5', '#CFBF8E'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.4) {
                    ctx.fillStyle = sandstoneColors[Math.floor(this.seededRandom() * sandstoneColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        // Horizontal bands
        ctx.fillStyle = '#C8BA85';
        ctx.fillRect(0, 4, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        
        this.textures.set('sandstone', canvas);
    }

    generateMinecraftMossStone() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Start with cobblestone base
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(0, 0, 16, 16);
        
        // Cobblestone pattern
        const stones = [
            {x: 0, y: 0, w: 5, h: 4}, {x: 6, y: 0, w: 6, h: 5},
            {x: 0, y: 5, w: 4, h: 5}, {x: 5, y: 4, w: 5, h: 5},
            {x: 0, y: 11, w: 6, h: 5}, {x: 7, y: 10, w: 5, h: 6}
        ];
        
        stones.forEach(stone => {
            ctx.fillStyle = '#7A7A7A';
            ctx.fillRect(stone.x, stone.y, stone.w - 1, stone.h - 1);
        });
        
        // Add moss patches
        const mossColors = ['#4A7335', '#3D6028', '#5A8540'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                if (this.seededRandom() > 0.65) {
                    ctx.fillStyle = mossColors[Math.floor(this.seededRandom() * mossColors.length)];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        this.textures.set('moss_stone', canvas);
    }

    generateMinecraftObsidian() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Very dark purple-black base
        ctx.fillStyle = '#1B0F2E';
        ctx.fillRect(0, 0, 16, 16);
        
        // Obsidian shine pattern
        const obsidianColors = ['#0F0820', '#2A1840', '#1B0F2E', '#3D2060'];
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                ctx.fillStyle = obsidianColors[Math.floor(this.seededRandom() * obsidianColors.length)];
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Purple highlights
        ctx.fillStyle = '#5030A0';
        for (let i = 0; i < 4; i++) {
            const x = Math.floor(this.seededRandom() * 16);
            const y = Math.floor(this.seededRandom() * 16);
            ctx.fillRect(x, y, 1, 1);
        }
        
        this.textures.set('obsidian', canvas);
    }

    // === PREHISTORIC BLOCKS ===

    generateThatchTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#B8A060';
        ctx.fillRect(0, 0, 16, 16);
        
        // Straw pattern (diagonal lines)
        ctx.strokeStyle = '#8B7A40';
        ctx.lineWidth = 1;
        for (let i = -16; i < 32; i += 3) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 16, 16);
            ctx.stroke();
        }
        
        // Straw variation
        const straws = ['#A09050', '#C8B870', '#9A8A48'];
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = straws[Math.floor(Math.random() * straws.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 2);
        }
        
        this.textures.set('thatch', canvas);
    }

    generateMudBrickTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#6B4423';
        ctx.fillRect(0, 0, 16, 16);
        
        // Mud brick pattern
        ctx.strokeStyle = '#4A3015';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, 6, 6);
        ctx.strokeRect(9, 1, 6, 6);
        ctx.strokeRect(1, 9, 6, 6);
        ctx.strokeRect(9, 9, 6, 6);
        
        // Texture variation
        const muds = ['#5A3A1A', '#7A5A3A', '#6A4A2A'];
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = muds[Math.floor(Math.random() * muds.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        // Straw bits in mud
        ctx.fillStyle = '#A09050';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(Math.random() * 14 + 1, Math.random() * 14 + 1, 2, 1);
        }
        
        this.textures.set('mud_brick', canvas);
    }

    generateBoneBlockTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#E8E0D0';
        ctx.fillRect(0, 0, 16, 16);
        
        // Bone structure lines (vertical)
        ctx.strokeStyle = '#C8C0B0';
        ctx.lineWidth = 2;
        for (let x = 2; x < 16; x += 4) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 16);
            ctx.stroke();
        }
        
        // Horizontal bands
        ctx.fillStyle = '#D8D0C0';
        ctx.fillRect(0, 4, 16, 2);
        ctx.fillRect(0, 10, 16, 2);
        
        // Cracks
        ctx.strokeStyle = '#B8B0A0';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 16, Math.random() * 16);
            ctx.lineTo(Math.random() * 16, Math.random() * 16);
            ctx.stroke();
        }
        
        this.textures.set('bone_block', canvas);
    }

    generateHayBlockTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#D4A030';
        ctx.fillRect(0, 0, 16, 16);
        
        // Hay strands
        ctx.strokeStyle = '#B48820';
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 16, 0);
            ctx.lineTo(Math.random() * 16, 16);
            ctx.stroke();
        }
        
        // Binding rope
        ctx.strokeStyle = '#6B4423';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(16, 5);
        ctx.moveTo(0, 11);
        ctx.lineTo(16, 11);
        ctx.stroke();
        
        this.textures.set('hay_block', canvas);
    }

    // === FUNCTIONAL BLOCKS ===

    generateCraftingTableTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Wood base
        ctx.fillStyle = '#A0784B';
        ctx.fillRect(0, 0, 16, 16);
        
        // Grid pattern on top
        ctx.strokeStyle = '#6B4423';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 16; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 16);
            ctx.moveTo(0, i);
            ctx.lineTo(16, i);
            ctx.stroke();
        }
        
        // Tools decoration
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(2, 2, 3, 1); // hammer head
        ctx.fillRect(3, 2, 1, 4); // hammer handle
        ctx.fillRect(10, 10, 4, 1); // saw
        
        this.textures.set('crafting_table', canvas);
    }

    generateFurnaceTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Stone base
        ctx.fillStyle = '#6B6B6B';
        ctx.fillRect(0, 0, 16, 16);
        
        // Stone brick pattern
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 1;
        ctx.strokeRect(1, 1, 6, 3);
        ctx.strokeRect(9, 1, 6, 3);
        ctx.strokeRect(1, 6, 14, 6);
        ctx.strokeRect(1, 13, 6, 3);
        ctx.strokeRect(9, 13, 6, 3);
        
        // Fire opening
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(4, 7, 8, 4);
        
        // Fire glow
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(5, 8, 2, 2);
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(8, 8, 2, 2);
        
        this.textures.set('furnace', canvas);
    }

    generateChestTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Wood body
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(0, 0, 16, 16);
        
        // Lid line
        ctx.fillStyle = '#5A3A1A';
        ctx.fillRect(0, 5, 16, 2);
        
        // Metal bands
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(0, 0, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(0, 7, 16, 1);
        
        // Latch
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(6, 8, 4, 3);
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(7, 9, 2, 1);
        
        this.textures.set('chest', canvas);
    }

    generateTorchTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Transparent background
        ctx.clearRect(0, 0, 16, 16);
        
        // Stick
        ctx.fillStyle = '#6B4423';
        ctx.fillRect(7, 6, 2, 10);
        
        // Flame
        const gradient = ctx.createRadialGradient(8, 4, 0, 8, 4, 4);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.5, '#FF8800');
        gradient.addColorStop(1, 'rgba(255, 68, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(8, 4, 4, 0, Math.PI * 2);
        ctx.fill();
        
        this.textures.set('torch', canvas);
    }

    generateCampfireTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Ground/ash
        ctx.fillStyle = '#3A3A3A';
        ctx.beginPath();
        ctx.ellipse(8, 12, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Logs
        ctx.fillStyle = '#5A3A1A';
        ctx.fillRect(2, 10, 5, 2);
        ctx.fillRect(9, 10, 5, 2);
        ctx.fillRect(5, 8, 6, 2);
        
        // Fire
        const gradient = ctx.createRadialGradient(8, 6, 0, 8, 8, 6);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.4, '#FF8800');
        gradient.addColorStop(0.8, '#FF4400');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(12, 10);
        ctx.lineTo(4, 10);
        ctx.closePath();
        ctx.fill();
        
        this.textures.set('campfire', canvas);
    }

    generateFarmlandTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(0, 0, 16, 16);
        
        // Plowed rows
        ctx.fillStyle = '#3E2723';
        for (let y = 0; y < 16; y += 4) {
            ctx.fillRect(0, y, 16, 2);
        }
        
        // Moisture spots
        ctx.fillStyle = '#4A3728';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(Math.random() * 14 + 1, Math.random() * 14 + 1, 2, 1);
        }
        
        this.textures.set('farmland', canvas);
    }

    generateCactusTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(0, 0, 16, 16);
        
        // Vertical ridges
        ctx.fillStyle = '#1B5E20';
        for (let x = 2; x < 16; x += 4) {
            ctx.fillRect(x, 0, 1, 16);
        }
        
        // Spines
        ctx.fillStyle = '#C8E6C9';
        for (let i = 0; i < 15; i++) {
            ctx.fillRect(Math.random() * 14 + 1, Math.random() * 14 + 1, 1, 1);
        }
        
        this.textures.set('cactus', canvas);
    }

    generateWheatTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Transparent background
        ctx.clearRect(0, 0, 16, 16);
        
        // Wheat stalks
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1;
        for (let x = 2; x < 16; x += 3) {
            ctx.beginPath();
            ctx.moveTo(x, 16);
            ctx.lineTo(x + (Math.random() - 0.5) * 2, 4);
            ctx.stroke();
        }
        
        // Wheat heads
        ctx.fillStyle = '#DAA520';
        for (let x = 2; x < 16; x += 3) {
            ctx.fillRect(x - 1, 2, 3, 4);
        }
        
        this.textures.set('wheat', canvas);
    }

    async loadPlayerSprites() {
        // Load the main player sprite (PNG)
        const mainSprite = new Image();
        mainSprite.src = 'assets/sprites/player/playercave.png';
        await new Promise((resolve, reject) => {
            mainSprite.onload = resolve;
            mainSprite.onerror = () => {
                console.warn('Failed to load main player sprite');
                resolve();
            };
        });
        this.playerSprites.set('main', mainSprite);
        this.playerSprites.set('idle', mainSprite);
        this.playerSprites.set('walk1', mainSprite);
        this.playerSprites.set('walk2', mainSprite);
        this.playerSprites.set('attack', mainSprite);
        
        console.log('Player sprites loaded');
    }

    getPlayerSprite(state = 'idle', frame = 0) {
        return this.playerSprites.get('main') || this.playerSprites.get('idle');
    }
    
    async loadEnemySprites() {
        // Enemy sprites to load - key is the sprite name in ENEMIES config
        const enemySprites = [
            'wolf', 'bear', 'boar', 'snake', 'mammoth', 'sabertooth',
            'terror_bird', 'giant_sloth', 'hyena', 'crocodile', 'spider',
            'cave_lion', 'rhino', 'catenemy'
        ];
        
        const loadPromises = enemySprites.map(name => {
            return new Promise((resolve) => {
                const sprite = new Image();
                sprite.src = `assets/sprites/enemies/${name}.png`;
                sprite.onload = () => {
                    this.enemySprites.set(name, sprite);
                    resolve();
                };
                sprite.onerror = () => {
                    console.warn(`Failed to load enemy sprite: ${name}`);
                    resolve();
                };
            });
        });
        
        await Promise.all(loadPromises);
        console.log(`Loaded ${this.enemySprites.size} enemy sprites`);
    }
    
    getEnemySprite(spriteName) {
        return this.enemySprites.get(spriteName) || null;
    }

    getTexture(name) {
        return this.textures.get(name);
    }

    getBlockSprite(id) {
        return this.blockSprites.get(id);
    }

    generateBlockSprites() {
        // Shadow Mask (Generic)
        this.shadowMask = this.renderIsoBlock(null, 'black');

        // Map block IDs to texture names
        const textureMap = {
            [BLOCKS.GRASS]: 'grass_top',
            [BLOCKS.DIRT]: 'dirt',
            [BLOCKS.STONE]: 'stone',
            [BLOCKS.COBBLESTONE]: 'cobblestone',
            [BLOCKS.WOOD]: 'wood',
            [BLOCKS.LEAVES]: 'leaves',
            [BLOCKS.SAND]: 'sand',
            [BLOCKS.WATER]: 'water',
            [BLOCKS.BEDROCK]: 'bedrock',
            [BLOCKS.COAL_ORE]: 'coal_ore',
            [BLOCKS.IRON_ORE]: 'iron_ore',
            [BLOCKS.GOLD_ORE]: 'gold_ore',
            [BLOCKS.DIAMOND_ORE]: 'diamond_ore',
            [BLOCKS.SNOW]: 'snow',
            [BLOCKS.ICE]: 'ice',
            [BLOCKS.GRAVEL]: 'gravel',
            [BLOCKS.CLAY]: 'clay',
            [BLOCKS.PLANKS]: 'planks',
            [BLOCKS.BRICK]: 'brick',
            [BLOCKS.GLASS]: 'glass',
            [BLOCKS.SANDSTONE]: 'sandstone',
            [BLOCKS.MOSS_STONE]: 'moss_stone',
            [BLOCKS.OBSIDIAN]: 'obsidian',
            [BLOCKS.THATCH]: 'thatch',
            [BLOCKS.MUD_BRICK]: 'mud_brick',
            [BLOCKS.BONE_BLOCK]: 'bone_block',
            [BLOCKS.HAY_BLOCK]: 'hay_block',
            [BLOCKS.CRAFTING_TABLE]: 'crafting_table',
            [BLOCKS.FURNACE]: 'furnace',
            [BLOCKS.CHEST]: 'chest',
            [BLOCKS.TORCH]: 'torch',
            [BLOCKS.CAMPFIRE]: 'campfire',
            [BLOCKS.FARMLAND]: 'farmland',
            [BLOCKS.CACTUS]: 'cactus',
            [BLOCKS.WHEAT_CROP]: 'wheat',
            // Medieval Age blocks
            [BLOCKS.WOOD_BEAM]: 'wood_beam',
            [BLOCKS.COBBLESTONE_WALL]: 'cobblestone_wall',
            [BLOCKS.IRON_BARS]: 'iron_bars',
            [BLOCKS.GATE]: 'gate',
            [BLOCKS.PORTCULLIS]: 'portcullis',
            [BLOCKS.IRRIGATION]: 'irrigation',
            [BLOCKS.BARLEY_CROP]: 'barley',
            [BLOCKS.FLAX_CROP]: 'flax',
            [BLOCKS.LOOM]: 'loom',
            [BLOCKS.STABLE]: 'stable',
            [BLOCKS.MARKET_STALL]: 'market_stall',
            [BLOCKS.WELL]: 'well',
            // Industrial Age blocks
            [BLOCKS.STEEL_BLOCK]: 'steel_block',
            [BLOCKS.STEAM_ENGINE]: 'steam_engine',
            [BLOCKS.BOILER]: 'boiler',
            [BLOCKS.CONVEYOR_BELT]: 'conveyor',
            [BLOCKS.ASSEMBLER]: 'assembler',
            [BLOCKS.CRUSHER]: 'crusher',
            [BLOCKS.METAL_PIPE]: 'metal_pipe',
            [BLOCKS.GEAR_BLOCK]: 'gear_block',
            [BLOCKS.CHIMNEY]: 'chimney',
            [BLOCKS.RAIL]: 'rail',
            [BLOCKS.OIL_DEPOSIT]: 'oil',
            [BLOCKS.ASPHALT]: 'asphalt',
            // Modern Age blocks
            [BLOCKS.CONCRETE]: 'concrete',
            [BLOCKS.GLASS_PANEL]: 'glass_panel',
            [BLOCKS.STEEL_FRAME]: 'steel_frame',
            [BLOCKS.SOLAR_PANEL]: 'solar_panel',
            [BLOCKS.WIND_TURBINE]: 'wind_turbine',
            [BLOCKS.BATTERY]: 'battery',
            [BLOCKS.COMPUTER]: 'computer',
            [BLOCKS.WIRE]: 'wire',
            [BLOCKS.CIRCUIT_BOARD]: 'circuit_board',
        };

        // Generate isometric sprites for all blocks
        for (const [id, data] of Object.entries(BLOCK_DATA)) {
            if (parseInt(id) === BLOCKS.AIR) continue;

            const textureName = textureMap[parseInt(id)];
            const texture = textureName ? this.textures.get(textureName) : null;
            const color = data.color;
            const isLiquid = parseInt(id) === BLOCKS.WATER;
            const isTransparent = data.transparent && parseInt(id) !== BLOCKS.WATER;

            const sprite = this.renderIsoBlock(texture, color, isLiquid, isTransparent);
            this.blockSprites.set(parseInt(id), sprite);
        }
    }

    renderIsoBlock(texture, color, isLiquid = false, isTransparent = false) {
        const canvas = document.createElement('canvas');
        canvas.width = this.isoSize;
        canvas.height = this.isoSize * 1.5;
        const ctx = canvas.getContext('2d');

        const w = this.isoSize;
        const h = this.isoSize / 2;
        const depth = isLiquid ? 4 : (this.isoSize * 0.5);

        const cx = w / 2;
        const cy = this.isoSize / 2;

        const drawFace = (path, brightness = 1, faceTexture = null) => {
            ctx.save();
            ctx.beginPath();
            path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.closePath();

            if (faceTexture) {
                ctx.clip();
                const pat = ctx.createPattern(faceTexture, 'repeat');
                if (pat) {
                    ctx.fillStyle = pat;
                    ctx.fill();
                }
            } else {
                ctx.fillStyle = color || '#888888';
                ctx.fill();
            }

            if (brightness < 1) {
                ctx.fillStyle = `rgba(0,0,0,${1 - brightness})`;
                ctx.fill();
            }

            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        };

        // Top Face
        drawFace([
            { x: cx, y: cy - h },
            { x: w, y: cy },
            { x: cx, y: cy + h },
            { x: 0, y: cy }
        ], 1.0, texture);

        if (!isLiquid && !isTransparent) {
            // Right Face (darker)
            drawFace([
                { x: w, y: cy },
                { x: w, y: cy + depth },
                { x: cx, y: cy + h + depth },
                { x: cx, y: cy + h }
            ], 0.55, texture);

            // Left Face (medium)
            drawFace([
                { x: cx, y: cy + h },
                { x: cx, y: cy + h + depth },
                { x: 0, y: cy + depth },
                { x: 0, y: cy }
            ], 0.75, texture);
        } else if (isLiquid) {
            // Just draw slightly darker water edges
            ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
            ctx.beginPath();
            ctx.moveTo(w, cy);
            ctx.lineTo(w, cy + depth);
            ctx.lineTo(cx, cy + h + depth);
            ctx.lineTo(cx, cy + h);
            ctx.closePath();
            ctx.fill();
        }

        return canvas;
    }
}
