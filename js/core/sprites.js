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
    }

    async init() {
        // Generate all block textures with unique patterns
        this.generateAllTextures();

        // Generate Block Sprites
        this.generateBlockSprites();

        // Load player sprites
        await this.loadPlayerSprites();

        this.spritesLoaded = true;
        console.log('Sprites Generated and Loaded');
    }

    generateAllTextures() {
        // Natural blocks
        this.generateDirtTexture();
        this.generateGrassTexture();
        this.generateStoneTexture();
        this.generateCobblestoneTexture();
        this.generateWoodTexture();
        this.generateLeavesTexture();
        this.generateSandTexture();
        this.generateWaterTexture();
        this.generateBedrockTexture();
        this.generateSnowTexture();
        this.generateIceTexture();
        this.generateGravelTexture();
        this.generateClayTexture();
        
        // Ores
        this.generateOreTexture('coal_ore', '#808080', '#1a1a1a', 8);
        this.generateOreTexture('iron_ore', '#808080', '#D4A76A', 6);
        this.generateOreTexture('gold_ore', '#808080', '#FFD700', 5);
        this.generateOreTexture('diamond_ore', '#808080', '#4AE0E0', 4);
        
        // Building blocks
        this.generatePlanksTexture();
        this.generateBrickTexture();
        this.generateGlassTexture();
        this.generateSandstoneTexture();
        this.generateMossStoneTexture();
        this.generateObsidianTexture();
        
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

    // === NATURAL BLOCKS ===

    generateDirtTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 16, 16);
        
        // Add brown variation spots
        const browns = ['#5D3A1A', '#A0522D', '#6B4423', '#7A4A2A'];
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = browns[Math.floor(Math.random() * browns.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1 + Math.random(), 1 + Math.random());
        }
        
        // Small rocks
        ctx.fillStyle = '#696969';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(Math.random() * 14 + 1, Math.random() * 14 + 1, 2, 1);
        }
        
        this.textures.set('dirt', canvas);
    }

    generateGrassTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Base green
        ctx.fillStyle = '#3D8B37';
        ctx.fillRect(0, 0, 16, 16);
        
        // Grass variation
        const greens = ['#2E7D32', '#43A047', '#388E3C', '#4CAF50', '#2E5A2E'];
        for (let i = 0; i < 60; i++) {
            ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        // Grass blades effect
        ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * 16;
            ctx.fillRect(x, 0, 1, 2 + Math.random() * 2);
        }
        
        this.textures.set('grass_top', canvas);
    }

    generateStoneTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 16, 16);
        
        // Stone variation
        const grays = ['#696969', '#778899', '#6B6B6B', '#8B8B8B', '#5C5C5C'];
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = grays[Math.floor(Math.random() * grays.length)];
            const size = 1 + Math.random() * 2;
            ctx.fillRect(Math.random() * 16, Math.random() * 16, size, size);
        }
        
        // Cracks
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 16, Math.random() * 16);
            ctx.lineTo(Math.random() * 16, Math.random() * 16);
            ctx.stroke();
        }
        
        this.textures.set('stone', canvas);
    }

    generateCobblestoneTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#606060';
        ctx.fillRect(0, 0, 16, 16);
        
        // Draw cobblestone pattern (irregular stones)
        const stones = [
            {x: 0, y: 0, w: 6, h: 5}, {x: 7, y: 0, w: 5, h: 4}, {x: 13, y: 0, w: 3, h: 5},
            {x: 0, y: 6, w: 4, h: 5}, {x: 5, y: 5, w: 6, h: 6}, {x: 12, y: 5, w: 4, h: 5},
            {x: 0, y: 12, w: 5, h: 4}, {x: 6, y: 12, w: 5, h: 4}, {x: 12, y: 11, w: 4, h: 5}
        ];
        
        stones.forEach(stone => {
            const shade = Math.random() * 40 + 80;
            ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
            ctx.fillRect(stone.x, stone.y, stone.w - 1, stone.h - 1);
        });
        
        this.textures.set('cobblestone', canvas);
    }

    generateWoodTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Base bark color
        ctx.fillStyle = '#6B4423';
        ctx.fillRect(0, 0, 16, 16);
        
        // Vertical wood grain
        const barks = ['#5D3A1A', '#7A4A2A', '#4A3015', '#8B5A2B'];
        for (let x = 0; x < 16; x += 2) {
            ctx.fillStyle = barks[Math.floor(Math.random() * barks.length)];
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x, 0, 1, 16);
        }
        ctx.globalAlpha = 1;
        
        // Bark texture lines
        ctx.strokeStyle = '#3D2A14';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
            const x = Math.random() * 16;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + (Math.random() - 0.5) * 4, 16);
            ctx.stroke();
        }
        
        this.textures.set('wood', canvas);
    }

    generateLeavesTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Transparent background for leaf gaps
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 16, 16);
        
        // Leaf cluster effect
        const greens = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#166616'];
        for (let i = 0; i < 80; i++) {
            ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
            const x = Math.random() * 16;
            const y = Math.random() * 16;
            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Darker gaps
        ctx.fillStyle = '#0D3D0D';
        for (let i = 0; i < 10; i++) {
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        this.textures.set('leaves', canvas);
    }

    generateSandTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#E8D174';
        ctx.fillRect(0, 0, 16, 16);
        
        // Sand grain variation
        const sands = ['#DAA520', '#F0DC82', '#C4A35A', '#E8C872', '#D4B254'];
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = sands[Math.floor(Math.random() * sands.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        this.textures.set('sand', canvas);
    }

    generateWaterTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1E90FF';
        ctx.fillRect(0, 0, 16, 16);
        
        // Water ripples
        ctx.fillStyle = '#4169E1';
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 5; i++) {
            const y = Math.random() * 16;
            ctx.fillRect(0, y, 16, 1);
        }
        
        // Highlights
        ctx.fillStyle = '#87CEEB';
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(Math.random() * 14, Math.random() * 14, 2, 1);
        }
        ctx.globalAlpha = 1;
        
        this.textures.set('water', canvas);
    }

    generateBedrockTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(0, 0, 16, 16);
        
        // Chaotic pattern
        const darks = ['#0A0A0A', '#2A2A2A', '#1A1A1A', '#333333'];
        for (let i = 0; i < 60; i++) {
            ctx.fillStyle = darks[Math.floor(Math.random() * darks.length)];
            const size = 1 + Math.random() * 3;
            ctx.fillRect(Math.random() * 16, Math.random() * 16, size, size);
        }
        
        this.textures.set('bedrock', canvas);
    }

    generateSnowTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, 16, 16);
        
        // Snow sparkle
        const whites = ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#EBEBEB'];
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = whites[Math.floor(Math.random() * whites.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        // Ice crystals
        ctx.fillStyle = '#D0E8FF';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        this.textures.set('snow', canvas);
    }

    generateIceTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#A5D6F7';
        ctx.fillRect(0, 0, 16, 16);
        
        // Ice cracks
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const startX = Math.random() * 16;
            const startY = Math.random() * 16;
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + (Math.random() - 0.5) * 8, startY + (Math.random() - 0.5) * 8);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        this.textures.set('ice', canvas);
    }

    generateGravelTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#6B6B6B';
        ctx.fillRect(0, 0, 16, 16);
        
        // Gravel stones
        const gravels = ['#5A5A5A', '#7A7A7A', '#4A4A4A', '#8A8A8A', '#606060'];
        for (let i = 0; i < 25; i++) {
            ctx.fillStyle = gravels[Math.floor(Math.random() * gravels.length)];
            const x = Math.random() * 14;
            const y = Math.random() * 14;
            ctx.beginPath();
            ctx.ellipse(x, y, 1 + Math.random() * 2, 1 + Math.random(), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.textures.set('gravel', canvas);
    }

    generateClayTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#9FA4A8';
        ctx.fillRect(0, 0, 16, 16);
        
        // Clay lumps
        const clays = ['#8B9093', '#ADB1B5', '#B5BABD', '#7D8285'];
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = clays[Math.floor(Math.random() * clays.length)];
            const size = 1 + Math.random() * 2;
            ctx.fillRect(Math.random() * 16, Math.random() * 16, size, size);
        }
        
        this.textures.set('clay', canvas);
    }

    // === ORE TEXTURES ===

    generateOreTexture(name, baseColor, oreColor, count = 6) {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');

        // Base stone
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 16, 16);

        // Stone noise
        const grays = ['#696969', '#787878', '#6B6B6B'];
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = grays[Math.floor(Math.random() * grays.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }

        // Ore deposits - clustered
        ctx.fillStyle = oreColor;
        for (let i = 0; i < count; i++) {
            const cx = Math.floor(Math.random() * 12) + 2;
            const cy = Math.floor(Math.random() * 12) + 2;
            // Main ore
            ctx.fillRect(cx, cy, 2, 2);
            // Connected pieces
            if (Math.random() > 0.3) ctx.fillRect(cx + 2, cy, 1, 1);
            if (Math.random() > 0.3) ctx.fillRect(cx - 1, cy + 1, 1, 1);
            if (Math.random() > 0.3) ctx.fillRect(cx + 1, cy + 2, 1, 1);
        }

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < count / 2; i++) {
            ctx.fillRect(Math.random() * 14 + 1, Math.random() * 14 + 1, 1, 1);
        }

        this.textures.set(name, canvas);
    }

    // === BUILDING BLOCKS ===

    generatePlanksTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#B8945F';
        ctx.fillRect(0, 0, 16, 16);
        
        // Horizontal plank lines
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 1;
        [0, 4, 8, 12].forEach(y => {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(16, y);
            ctx.stroke();
        });
        
        // Wood grain
        ctx.strokeStyle = '#9B7524';
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 8; i++) {
            const y = Math.random() * 16;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(16, y + (Math.random() - 0.5) * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // Nail holes
        ctx.fillStyle = '#3D2A14';
        ctx.fillRect(2, 2, 1, 1);
        ctx.fillRect(13, 6, 1, 1);
        ctx.fillRect(2, 10, 1, 1);
        ctx.fillRect(13, 14, 1, 1);
        
        this.textures.set('planks', canvas);
    }

    generateBrickTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Mortar background
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(0, 0, 16, 16);
        
        // Brick pattern
        const brickColors = ['#8B4513', '#A0522D', '#6B3A1A', '#9B4A23'];
        
        // Row 1 (offset)
        for (let x = -4; x < 16; x += 8) {
            ctx.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
            ctx.fillRect(x + 1, 1, 6, 3);
        }
        // Row 2
        for (let x = 0; x < 16; x += 8) {
            ctx.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
            ctx.fillRect(x + 1, 5, 6, 3);
        }
        // Row 3 (offset)
        for (let x = -4; x < 16; x += 8) {
            ctx.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
            ctx.fillRect(x + 1, 9, 6, 3);
        }
        // Row 4
        for (let x = 0; x < 16; x += 8) {
            ctx.fillStyle = brickColors[Math.floor(Math.random() * brickColors.length)];
            ctx.fillRect(x + 1, 13, 6, 3);
        }
        
        this.textures.set('brick', canvas);
    }

    generateGlassTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
        ctx.fillRect(0, 0, 16, 16);
        
        // Frame
        ctx.strokeStyle = '#6B8E8E';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, 15, 15);
        
        // Reflection highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(2, 2);
        ctx.lineTo(6, 2);
        ctx.lineTo(2, 6);
        ctx.closePath();
        ctx.fill();
        
        this.textures.set('glass', canvas);
    }

    generateSandstoneTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#D4B896';
        ctx.fillRect(0, 0, 16, 16);
        
        // Sandstone layers
        const sands = ['#C4A876', '#E4C8A6', '#B49866', '#D4B486'];
        for (let y = 0; y < 16; y += 4) {
            ctx.fillStyle = sands[Math.floor(Math.random() * sands.length)];
            ctx.fillRect(0, y, 16, 2);
        }
        
        // Grain texture
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = sands[Math.floor(Math.random() * sands.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
        
        this.textures.set('sandstone', canvas);
    }

    generateMossStoneTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Start with cobblestone base
        ctx.fillStyle = '#606060';
        ctx.fillRect(0, 0, 16, 16);
        
        // Stone pattern
        const grays = ['#505050', '#707070', '#5A5A5A'];
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = grays[Math.floor(Math.random() * grays.length)];
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 2, 2);
        }
        
        // Moss patches
        const greens = ['#2E5A2E', '#3A6B3A', '#4A7A4A', '#264A26'];
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = greens[Math.floor(Math.random() * greens.length)];
            const size = 1 + Math.random() * 3;
            ctx.fillRect(Math.random() * 16, Math.random() * 16, size, size);
        }
        
        this.textures.set('moss_stone', canvas);
    }

    generateObsidianTexture() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#0F0F1A';
        ctx.fillRect(0, 0, 16, 16);
        
        // Purple shimmer
        ctx.fillStyle = '#1A0A2E';
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 2, 2);
        }
        
        // Reflective highlights
        ctx.fillStyle = '#4A2A6A';
        for (let i = 0; i < 8; i++) {
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
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
        };

        // Generate for all blocks
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
