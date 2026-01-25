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
        // Generate base textures
        this.generateTexture('dirt', '#8B4513', ['#5D2906', '#A0522D']);
        this.generateTexture('grass_top', '#32CD32', ['#228B22', '#006400']);
        this.generateTexture('stone', '#808080', ['#696969', '#A9A9A9']);
        this.generateTexture('wood', '#8B5A2B', ['#5D2906', '#A0522D'], 'vertical');
        this.generateTexture('leaves', '#228B22', ['#006400', '#32CD32'], 'noise');
        this.generateTexture('sand', '#F4D03F', ['#DAA520', '#F0E68C'], 'noise');
        this.generateTexture('water', '#4169E1', ['#1E90FF', '#0000CD'], 'liquid');
        this.generateTexture('bedrock', '#2F4F4F', ['#000000', '#696969']);
        this.generateTexture('snow', '#fffff0', ['#e0e0e0', '#ffffff']);
        this.generateTexture('glass', '#ADD8E6', ['#E0FFFF'], 'liquid');

        // Ores
        this.generateOreTexture('coal_ore', '#808080', '#000000');
        this.generateOreTexture('iron_ore', '#808080', '#E6C288');
        this.generateOreTexture('gold_ore', '#808080', '#FFD700');
        this.generateOreTexture('diamond_ore', '#808080', '#00FFFF');

        // Generate Block Sprites
        this.generateBlockSprites();

        // Load player sprites
        await this.loadPlayerSprites();

        this.spritesLoaded = true;
        console.log('Sprites Generated and Loaded');
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
        // For now, use the main sprite for all states
        // In the future, we can add animation frames
        return this.playerSprites.get('main') || this.playerSprites.get('idle');
    }

    getTexture(name) {
        return this.textures.get(name);
    }

    getBlockSprite(id) {
        return this.blockSprites.get(id);
    }

    generateTexture(name, baseColor, accents, pattern = 'noise') {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);

        // Pattern
        if (pattern === 'noise') {
            for (let i = 0; i < 40; i++) {
                ctx.fillStyle = accents[Math.floor(Math.random() * accents.length)];
                const x = Math.floor(Math.random() * this.tileSize);
                const y = Math.floor(Math.random() * this.tileSize);
                ctx.fillRect(x, y, 1, 1);
            }
        } else if (pattern === 'vertical') {
            // Wood grain
            for (let x = 0; x < this.tileSize; x += 2) {
                ctx.fillStyle = accents[Math.floor(Math.random() * accents.length)];
                ctx.globalAlpha = 0.5;
                ctx.fillRect(x, 0, 1, this.tileSize);
            }
        } else if (pattern === 'liquid') {
            ctx.fillStyle = accents[0];
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(Math.random() * 16, Math.random() * 16, 4, 1);
            }
        }

        this.textures.set(name, canvas);
    }

    generateOreTexture(name, baseColor, oreColor) {
        const canvas = document.createElement('canvas');
        canvas.width = this.tileSize;
        canvas.height = this.tileSize;
        const ctx = canvas.getContext('2d');

        // Base stone
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, this.tileSize, this.tileSize);

        // Noise
        ctx.fillStyle = '#696969';
        for (let i = 0; i < 30; i++) {
            ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }

        // Ore specks
        ctx.fillStyle = oreColor;
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * 12) + 2;
            const y = Math.floor(Math.random() * 12) + 2;
            ctx.fillRect(x, y, 2, 2);
            ctx.fillRect(x + 1, y - 1, 1, 1);
        }

        this.textures.set(name, canvas);
    }

    generateBlockSprites() {
        // Shadow Mask (Generic)
        this.shadowMask = this.renderIsoBlock(null, 'black');

        // Generate for known blocks
        for (const [id, data] of Object.entries(BLOCK_DATA)) {
            if (id == BLOCKS.AIR) continue;

            // Map ID to texture name logic
            let textureName = null;
            if (id == BLOCKS.GRASS) textureName = 'grass_top';
            else if (id == BLOCKS.DIRT) textureName = 'dirt';
            else if (id == BLOCKS.STONE) textureName = 'stone';
            else if (id == BLOCKS.WOOD) textureName = 'wood';
            else if (id == BLOCKS.LEAVES) textureName = 'leaves';
            else if (id == BLOCKS.SAND) textureName = 'sand';
            else if (id == BLOCKS.WATER) textureName = 'water';
            else if (id == BLOCKS.BEDROCK) textureName = 'bedrock';
            else if (id == BLOCKS.COAL_ORE) textureName = 'coal_ore';
            else if (id == BLOCKS.IRON_ORE) textureName = 'iron_ore';
            else if (id == BLOCKS.GOLD_ORE) textureName = 'gold_ore';
            else if (id == BLOCKS.DIAMOND_ORE) textureName = 'diamond_ore';
            else if (id == BLOCKS.SNOW) textureName = 'snow';

            // Fallback color if no texture
            const texture = textureName ? this.textures.get(textureName) : null;
            const color = data.color;

            const sprite = this.renderIsoBlock(texture, color, id == BLOCKS.WATER);
            this.blockSprites.set(parseInt(id), sprite);
        }
    }

    renderIsoBlock(texture, color, isLiquid = false) {
        const canvas = document.createElement('canvas');
        canvas.width = this.isoSize;
        canvas.height = this.isoSize * 1.5; // Enough for height
        const ctx = canvas.getContext('2d');

        const w = this.isoSize;
        const h = this.isoSize / 2; // Iso ratio 2:1
        const depth = isLiquid ? 2 : (this.isoSize * 0.5); // Depth logic

        // Center
        const cx = w / 2;
        const cy = this.isoSize / 2; // Start Y (top face center)

        // Helper to draw face
        const drawFace = (path, brightness = 1, faceTexture = null) => {
            ctx.save();
            ctx.beginPath();
            path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.closePath();

            if (faceTexture) {
                ctx.clip();
                // Simple stretch fill
                // ctx.drawImage(faceTexture, 0, 0, w, h * 2); 
                // Better: Pattern
                const pat = ctx.createPattern(faceTexture, 'repeat');
                ctx.fillStyle = pat;
                ctx.fill();
            } else {
                ctx.fillStyle = color || 'white';
                ctx.fill();
            }

            // Tint for lighting/shading
            if (brightness < 1) {
                ctx.fillStyle = `rgba(0,0,0,${1 - brightness})`;
                ctx.fill();
            }

            // Border/Highlight
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        };

        // Top Face
        drawFace([
            { x: cx, y: cy - h },         // Top
            { x: w, y: cy },              // Right
            { x: cx, y: cy + h },         // Bottom
            { x: 0, y: cy }               // Left
        ], 1.0, texture);

        if (!isLiquid) {
            // Right Face
            drawFace([
                { x: w, y: cy },
                { x: w, y: cy + depth },
                { x: cx, y: cy + h + depth },
                { x: cx, y: cy + h }
            ], 0.6, texture);

            // Left Face
            drawFace([
                { x: cx, y: cy + h },
                { x: cx, y: cy + h + depth },
                { x: 0, y: cy + depth },
                { x: 0, y: cy }
            ], 0.8, texture);
        }

        return canvas;
    }
}
