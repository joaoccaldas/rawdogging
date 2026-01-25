// Minimap System - Shows terrain, entities, and markers
import { CONFIG, BLOCKS, BLOCK_DATA, BIOMES } from '../config.js';

export class Minimap {
    constructor(game) {
        this.game = game;
        
        // Minimap settings
        this.size = 150; // Pixels
        this.mapRadius = 40; // World units shown
        this.zoom = 1;
        this.visible = true;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'minimap-canvas';
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: ${this.size}px;
            height: ${this.size}px;
            border: 3px solid rgba(139, 69, 19, 0.8);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 100;
            pointer-events: none;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        
        // Markers (home, death, etc.)
        this.markers = [];
        
        // Home marker
        this.homePosition = null;
        
        // Terrain cache
        this.terrainCache = new Map();
        this.cacheRadius = 50;
        this.lastCacheUpdate = 0;
        
        // Add to DOM
        document.body.appendChild(this.canvas);
        
        // Biome colors
        this.biomeColors = {
            PLAINS: '#4a7c23',
            DESERT: '#d4a574',
            SNOW: '#e8e8e8',
            JUNGLE: '#228b22',
            SWAMP: '#556b2f',
            SAVANNA: '#9acd32',
            CAVE: '#404040',
        };
        
        // Block colors for surface
        this.blockColors = {
            [BLOCKS.GRASS]: '#4a7c23',
            [BLOCKS.DIRT]: '#8b4513',
            [BLOCKS.STONE]: '#808080',
            [BLOCKS.SAND]: '#f4d03f',
            [BLOCKS.WATER]: '#4488ff',
            [BLOCKS.SNOW]: '#ffffff',
            [BLOCKS.ICE]: '#aaddff',
            [BLOCKS.GRAVEL]: '#666666',
            [BLOCKS.CLAY]: '#9090a0',
        };
    }
    
    update(deltaTime) {
        if (!this.visible || !this.game.player) return;
        
        // Update terrain cache periodically
        const now = Date.now();
        if (now - this.lastCacheUpdate > 500) {
            this.updateTerrainCache();
            this.lastCacheUpdate = now;
        }
    }
    
    updateTerrainCache() {
        const player = this.game.player;
        const world = this.game.world;
        if (!player || !world) return;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        
        // Clear old cache entries
        for (const [key, _] of this.terrainCache) {
            const [x, y] = key.split(',').map(Number);
            if (Math.abs(x - px) > this.cacheRadius || Math.abs(y - py) > this.cacheRadius) {
                this.terrainCache.delete(key);
            }
        }
        
        // Add new entries
        for (let dx = -this.mapRadius; dx <= this.mapRadius; dx += 2) {
            for (let dy = -this.mapRadius; dy <= this.mapRadius; dy += 2) {
                const x = px + dx;
                const y = py + dy;
                const key = `${x},${y}`;
                
                if (!this.terrainCache.has(key)) {
                    const height = world.getHeight(x, y);
                    const block = world.getBlock(x, y, height);
                    this.terrainCache.set(key, { height, block });
                }
            }
        }
    }
    
    render() {
        if (!this.visible || !this.game.player) {
            this.canvas.style.display = 'none';
            return;
        }
        
        this.canvas.style.display = 'block';
        
        const ctx = this.ctx;
        const player = this.game.player;
        const px = player.x;
        const py = player.y;
        
        // Clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.size / 2, this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw terrain
        this.renderTerrain(ctx, px, py);
        
        // Draw markers
        this.renderMarkers(ctx, px, py);
        
        // Draw entities (enemies, pets)
        this.renderEntities(ctx, px, py);
        
        // Draw player (center)
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.size / 2, this.size / 2, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Player direction indicator
        const angle = Math.atan2(player.facingY || 0, player.facingX || 1);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.size / 2, this.size / 2);
        ctx.lineTo(
            this.size / 2 + Math.cos(angle) * 8,
            this.size / 2 + Math.sin(angle) * 8
        );
        ctx.stroke();
        
        // Draw circular border
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.size / 2, this.size / 2, this.size / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();
        
        // Compass directions
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', this.size / 2, 12);
        ctx.fillText('S', this.size / 2, this.size - 4);
        ctx.fillText('E', this.size - 6, this.size / 2 + 3);
        ctx.fillText('W', 8, this.size / 2 + 3);
    }
    
    renderTerrain(ctx, px, py) {
        const world = this.game.world;
        if (!world) return;
        
        const scale = this.size / (this.mapRadius * 2);
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        
        // Draw cached terrain
        for (const [key, data] of this.terrainCache) {
            const [wx, wy] = key.split(',').map(Number);
            const dx = wx - px;
            const dy = wy - py;
            
            // Skip if outside map radius
            if (Math.abs(dx) > this.mapRadius || Math.abs(dy) > this.mapRadius) continue;
            
            // Calculate screen position
            const sx = centerX + dx * scale;
            const sy = centerY + dy * scale;
            
            // Check if in circle
            const distFromCenter = Math.sqrt((sx - centerX) ** 2 + (sy - centerY) ** 2);
            if (distFromCenter > this.size / 2 - 5) continue;
            
            // Get color from block
            let color = this.blockColors[data.block] || '#555555';
            
            // Height shading
            const heightFactor = Math.min(1, data.height / 25);
            color = this.adjustBrightness(color, 0.7 + heightFactor * 0.3);
            
            ctx.fillStyle = color;
            ctx.fillRect(sx - 1, sy - 1, 3, 3);
        }
    }
    
    renderMarkers(ctx, px, py) {
        const scale = this.size / (this.mapRadius * 2);
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        
        // Home marker
        if (this.homePosition) {
            const dx = this.homePosition.x - px;
            const dy = this.homePosition.y - py;
            
            // If in range, show on map
            if (Math.abs(dx) <= this.mapRadius && Math.abs(dy) <= this.mapRadius) {
                const sx = centerX + dx * scale;
                const sy = centerY + dy * scale;
                
                ctx.fillStyle = '#ffff00';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏠', sx, sy + 5);
            } else {
                // Show at edge pointing toward home
                const angle = Math.atan2(dy, dx);
                const edgeX = centerX + Math.cos(angle) * (this.size / 2 - 15);
                const edgeY = centerY + Math.sin(angle) * (this.size / 2 - 15);
                
                ctx.fillStyle = '#ffff00';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏠', edgeX, edgeY + 4);
            }
        }
        
        // Death marker
        for (const marker of this.markers) {
            const dx = marker.x - px;
            const dy = marker.y - py;
            
            if (Math.abs(dx) <= this.mapRadius && Math.abs(dy) <= this.mapRadius) {
                const sx = centerX + dx * scale;
                const sy = centerY + dy * scale;
                
                ctx.fillStyle = marker.color || '#ff0000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(marker.emoji || '📍', sx, sy + 4);
            }
        }
    }
    
    renderEntities(ctx, px, py) {
        const entities = this.game.entities || [];
        const scale = this.size / (this.mapRadius * 2);
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        
        for (const entity of entities) {
            const dx = entity.x - px;
            const dy = entity.y - py;
            
            if (Math.abs(dx) > this.mapRadius || Math.abs(dy) > this.mapRadius) continue;
            
            const sx = centerX + dx * scale;
            const sy = centerY + dy * scale;
            
            // Check if in circle
            const distFromCenter = Math.sqrt((sx - centerX) ** 2 + (sy - centerY) ** 2);
            if (distFromCenter > this.size / 2 - 10) continue;
            
            // Different colors for different entity types
            if (entity.isBoss) {
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(sx, sy, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (entity.stats?.aggressive) {
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (entity.isPet) {
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(sx, sy, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    adjustBrightness(color, factor) {
        // Convert hex to RGB, adjust, convert back
        let r, g, b;
        if (color.startsWith('#')) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else {
            return color;
        }
        
        r = Math.min(255, Math.floor(r * factor));
        g = Math.min(255, Math.floor(g * factor));
        b = Math.min(255, Math.floor(b * factor));
        
        return `rgb(${r},${g},${b})`;
    }
    
    // Set home position
    setHome(x, y, z) {
        this.homePosition = { x, y, z };
        this.game.ui?.showMessage('🏠 Home position set!', 2000);
    }
    
    // Add a marker
    addMarker(x, y, z, emoji, color) {
        this.markers.push({ x, y, z, emoji, color, time: Date.now() });
        
        // Limit markers
        if (this.markers.length > 10) {
            this.markers.shift();
        }
    }
    
    // Toggle visibility
    toggle() {
        this.visible = !this.visible;
    }
    
    // Zoom in/out
    setZoom(level) {
        this.zoom = Math.max(0.5, Math.min(2, level));
        this.mapRadius = Math.floor(40 / this.zoom);
    }
    
    // Serialize for save
    serialize() {
        return {
            homePosition: this.homePosition,
            markers: this.markers,
        };
    }
    
    deserialize(data) {
        if (data) {
            this.homePosition = data.homePosition || null;
            this.markers = data.markers || [];
        }
    }
}
