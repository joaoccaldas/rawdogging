// Block Placement Preview System
// Shows ghost preview of where blocks will be placed

import { BLOCK_DATA, BLOCKS, CONFIG } from '../config.js';

export class BlockPlacementPreview {
    constructor(game) {
        this.game = game;
        
        // Preview state
        this.previewBlock = null;
        this.previewPosition = null;
        this.canPlace = false;
        
        // Visual settings
        this.previewAlpha = 0.5;
        this.validColor = 'rgba(100, 255, 100, 0.3)';
        this.invalidColor = 'rgba(255, 100, 100, 0.3)';
        this.outlineColor = '#ffffff';
        
        // Animation
        this.pulsePhase = 0;
        this.pulseSpeed = 3;
    }
    
    update(deltaTime) {
        // Pulse animation
        this.pulsePhase += deltaTime * this.pulseSpeed;
        
        const player = this.game.player;
        if (!player) {
            this.previewPosition = null;
            return;
        }
        
        // Check if player is holding a placeable block
        const heldItem = player.getHeldItem?.();
        if (!heldItem || !this.isPlaceableBlock(heldItem.id)) {
            this.previewPosition = null;
            this.previewBlock = null;
            return;
        }
        
        this.previewBlock = this.getBlockFromItem(heldItem.id);
        
        // Calculate placement position based on mouse/crosshair
        this.calculatePreviewPosition();
        
        // Check if placement is valid
        if (this.previewPosition) {
            this.canPlace = this.isValidPlacement(this.previewPosition);
        }
    }
    
    isPlaceableBlock(itemId) {
        if (!itemId) return false;
        const id = itemId.toLowerCase();
        
        // List of placeable block items
        const placeableBlocks = [
            'dirt', 'stone', 'cobblestone', 'grass', 'sand', 'gravel',
            'wood', 'planks', 'log', 'leaves', 'brick', 'glass',
            'torch', 'chest', 'crafting_table', 'furnace', 'campfire',
            'thatch', 'mud_brick', 'bone_block', 'hay_block',
            'sandstone', 'moss_stone', 'obsidian', 'clay',
            'snow', 'ice', 'fence', 'ladder', 'door',
            'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore',
            'steel_block', 'concrete', 'asphalt'
        ];
        
        return placeableBlocks.some(block => id.includes(block));
    }
    
    getBlockFromItem(itemId) {
        if (!itemId) return BLOCKS.DIRT;
        const id = itemId.toLowerCase();
        
        // Map item IDs to block types
        const blockMap = {
            'dirt': BLOCKS.DIRT,
            'stone': BLOCKS.STONE,
            'cobblestone': BLOCKS.COBBLESTONE,
            'grass': BLOCKS.GRASS,
            'sand': BLOCKS.SAND,
            'gravel': BLOCKS.GRAVEL,
            'wood': BLOCKS.WOOD,
            'log': BLOCKS.WOOD,
            'planks': BLOCKS.PLANKS,
            'leaves': BLOCKS.LEAVES,
            'brick': BLOCKS.BRICK,
            'glass': BLOCKS.GLASS,
            'torch': BLOCKS.TORCH,
            'chest': BLOCKS.CHEST,
            'crafting_table': BLOCKS.CRAFTING_TABLE,
            'furnace': BLOCKS.FURNACE,
            'campfire': BLOCKS.CAMPFIRE,
            'thatch': BLOCKS.THATCH,
            'mud_brick': BLOCKS.MUD_BRICK,
            'bone_block': BLOCKS.BONE_BLOCK,
            'hay_block': BLOCKS.HAY_BLOCK,
            'sandstone': BLOCKS.SANDSTONE,
            'moss_stone': BLOCKS.MOSS_STONE,
            'obsidian': BLOCKS.OBSIDIAN,
            'clay': BLOCKS.CLAY,
            'snow': BLOCKS.SNOW,
            'ice': BLOCKS.ICE,
            'fence': BLOCKS.FENCE,
            'ladder': BLOCKS.LADDER,
            'door': BLOCKS.DOOR,
        };
        
        for (const [key, block] of Object.entries(blockMap)) {
            if (id.includes(key)) return block;
        }
        
        return BLOCKS.DIRT;
    }
    
    calculatePreviewPosition() {
        const player = this.game.player;
        const input = this.game.input;
        const camera = this.game.camera;
        
        if (!player || !input || !camera) {
            this.previewPosition = null;
            return;
        }
        
        const mouseX = input.mouse.x;
        const mouseY = input.mouse.y;
        
        // Get player screen position
        const playerScreen = camera.worldToScreen(player.x, player.y, player.z);
        
        // Calculate direction from player to mouse
        const dx = mouseX - playerScreen.x;
        const dy = mouseY - playerScreen.y;
        
        // Convert screen direction to isometric world direction
        const isoX = (dx / (CONFIG.TILE_WIDTH / 2) + dy / (CONFIG.TILE_HEIGHT / 2)) / 2;
        const isoY = (dy / (CONFIG.TILE_HEIGHT / 2) - dx / (CONFIG.TILE_WIDTH / 2)) / 2;
        
        // Normalize and scale
        const mag = Math.sqrt(isoX * isoX + isoY * isoY);
        let targetOffsetX = 0, targetOffsetY = 0;
        if (mag > 0.5) {
            const scale = Math.min(CONFIG.MINING_RANGE, mag) / mag;
            targetOffsetX = isoX * scale;
            targetOffsetY = isoY * scale;
        }
        
        const targetX = Math.floor(player.x + targetOffsetX);
        const targetY = Math.floor(player.y + targetOffsetY);
        
        // Find placement Z (on top of existing block or adjacent)
        let targetZ = Math.floor(player.z);
        
        // Try to place on top of existing block
        const groundZ = this.game.world?.getHeight?.(targetX, targetY) || 0;
        targetZ = groundZ + 1;
        
        // Check range
        const dist = Math.hypot(targetX + 0.5 - player.x, targetY + 0.5 - player.y);
        if (dist > CONFIG.MINING_RANGE) {
            this.previewPosition = null;
            return;
        }
        
        this.previewPosition = { x: targetX, y: targetY, z: targetZ };
    }
    
    isValidPlacement(pos) {
        if (!pos || !this.game.world) return false;
        
        const { x, y, z } = pos;
        
        // Check if position is in valid range
        if (z < 0 || z >= CONFIG.WORLD_HEIGHT) return false;
        
        // Check if position is empty
        const existingBlock = this.game.world.getBlock(x, y, z);
        if (existingBlock !== BLOCKS.AIR && existingBlock !== BLOCKS.WATER) {
            return false;
        }
        
        // Check if there's support (block below or adjacent)
        const hasSupport = 
            this.game.world.getBlock(x, y, z - 1) !== BLOCKS.AIR ||
            this.game.world.getBlock(x - 1, y, z) !== BLOCKS.AIR ||
            this.game.world.getBlock(x + 1, y, z) !== BLOCKS.AIR ||
            this.game.world.getBlock(x, y - 1, z) !== BLOCKS.AIR ||
            this.game.world.getBlock(x, y + 1, z) !== BLOCKS.AIR;
        
        if (!hasSupport) return false;
        
        // Check player collision (can't place where player is)
        const player = this.game.player;
        if (player) {
            const px = Math.floor(player.x);
            const py = Math.floor(player.y);
            const pz = Math.floor(player.z);
            
            if (x === px && y === py && (z === pz || z === pz + 1)) {
                return false;
            }
        }
        
        return true;
    }
    
    render(ctx) {
        if (!this.previewPosition || !this.previewBlock) return;
        
        const { x, y, z } = this.previewPosition;
        const camera = this.game.camera;
        
        // Get screen position
        const screen = camera.worldToScreen(x + 0.5, y + 0.5, z);
        const zoom = camera.zoom;
        
        // Isometric block dimensions
        const halfW = (CONFIG.TILE_WIDTH / 2) * zoom;
        const quartH = (CONFIG.TILE_HEIGHT / 2) * zoom;
        const depth = CONFIG.TILE_DEPTH * zoom;
        
        // Pulse effect
        const pulse = 0.3 + Math.sin(this.pulsePhase) * 0.2;
        const alpha = this.previewAlpha + pulse;
        
        // Choose color based on validity
        const fillColor = this.canPlace ? this.validColor : this.invalidColor;
        const strokeColor = this.canPlace ? '#00ff00' : '#ff0000';
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw ghost block (isometric cube)
        // Top face
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y - depth - quartH);
        ctx.lineTo(screen.x + halfW, screen.y - depth);
        ctx.lineTo(screen.x, screen.y - depth + quartH);
        ctx.lineTo(screen.x - halfW, screen.y - depth);
        ctx.closePath();
        ctx.fill();
        
        // Right face
        ctx.fillStyle = this.canPlace ? 'rgba(80, 200, 80, 0.3)' : 'rgba(200, 80, 80, 0.3)';
        ctx.beginPath();
        ctx.moveTo(screen.x + halfW, screen.y - depth);
        ctx.lineTo(screen.x + halfW, screen.y);
        ctx.lineTo(screen.x, screen.y + quartH);
        ctx.lineTo(screen.x, screen.y - depth + quartH);
        ctx.closePath();
        ctx.fill();
        
        // Left face
        ctx.fillStyle = this.canPlace ? 'rgba(60, 180, 60, 0.3)' : 'rgba(180, 60, 60, 0.3)';
        ctx.beginPath();
        ctx.moveTo(screen.x - halfW, screen.y - depth);
        ctx.lineTo(screen.x - halfW, screen.y);
        ctx.lineTo(screen.x, screen.y + quartH);
        ctx.lineTo(screen.x, screen.y - depth + quartH);
        ctx.closePath();
        ctx.fill();
        
        // Draw outlines
        ctx.globalAlpha = alpha + 0.3;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        
        // Top face outline
        ctx.beginPath();
        ctx.moveTo(screen.x, screen.y - depth - quartH);
        ctx.lineTo(screen.x + halfW, screen.y - depth);
        ctx.lineTo(screen.x, screen.y - depth + quartH);
        ctx.lineTo(screen.x - halfW, screen.y - depth);
        ctx.closePath();
        ctx.stroke();
        
        // Vertical edges
        ctx.beginPath();
        ctx.moveTo(screen.x + halfW, screen.y - depth);
        ctx.lineTo(screen.x + halfW, screen.y);
        ctx.moveTo(screen.x - halfW, screen.y - depth);
        ctx.lineTo(screen.x - halfW, screen.y);
        ctx.moveTo(screen.x, screen.y - depth + quartH);
        ctx.lineTo(screen.x, screen.y + quartH);
        ctx.stroke();
        
        // Bottom edges
        ctx.beginPath();
        ctx.moveTo(screen.x + halfW, screen.y);
        ctx.lineTo(screen.x, screen.y + quartH);
        ctx.lineTo(screen.x - halfW, screen.y);
        ctx.stroke();
        
        ctx.restore();
        
        // Draw placement hint text
        if (!this.canPlace && this.previewPosition) {
            ctx.fillStyle = '#ff6666';
            ctx.font = '12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('Cannot place here', screen.x, screen.y - depth - quartH - 15);
        }
    }
    
    // Get the current valid placement position (for actual placement)
    getPlacementPosition() {
        if (this.canPlace && this.previewPosition) {
            return { ...this.previewPosition, block: this.previewBlock };
        }
        return null;
    }
    
    reset() {
        this.previewPosition = null;
        this.previewBlock = null;
        this.canPlace = false;
    }
}
