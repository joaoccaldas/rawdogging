// Craftable Map System
// Allows players to craft and use maps for navigation

export class MapSystem {
    constructor(game) {
        this.game = game;
        
        // Player maps
        this.maps = [];
        
        // Currently viewing map
        this.activeMap = null;
        this.isViewing = false;
        
        // Map configurations
        this.mapSizes = {
            small: { radius: 64, scale: 4, craftCost: { paper: 4, compass: 1 } },
            medium: { radius: 128, scale: 2, craftCost: { paper: 8, compass: 1, ink: 1 } },
            large: { radius: 256, scale: 1, craftCost: { paper: 12, compass: 1, ink: 2 } }
        };
        
        // Map markers
        this.markerTypes = {
            home: { icon: '🏠', color: '#55FF55' },
            danger: { icon: '⚠️', color: '#FF5555' },
            treasure: { icon: '💎', color: '#FFFF55' },
            poi: { icon: '📍', color: '#5555FF' },
            death: { icon: '☠️', color: '#AA00AA' },
            custom: { icon: '🚩', color: '#FF8800' }
        };
        
        // Fog of war - explored areas
        this.exploredChunks = new Set();
        
        // Biome colors for rendering
        this.biomeColors = {
            plains: '#7CFC00',
            forest: '#228B22',
            desert: '#F4A460',
            mountains: '#808080',
            ocean: '#1E90FF',
            swamp: '#556B2F',
            tundra: '#E0FFFF',
            volcano: '#8B0000',
            beach: '#FFE4B5',
            cave: '#2F2F2F',
            default: '#666666'
        };
    }
    
    // Create a new map item
    createMap(size = 'medium', centerX = null, centerY = null) {
        const player = this.game.player;
        if (!player && !centerX) return null;
        
        const config = this.mapSizes[size];
        if (!config) return null;
        
        const map = {
            id: `map_${Date.now()}`,
            size: size,
            centerX: centerX ?? player.x,
            centerY: centerY ?? player.y,
            radius: config.radius,
            scale: config.scale,
            markers: [],
            explored: new Set(),
            createdAt: Date.now(),
            name: `Map #${this.maps.length + 1}`
        };
        
        this.maps.push(map);
        return map;
    }
    
    // Check if player has materials to craft map
    canCraftMap(size) {
        const config = this.mapSizes[size];
        if (!config) return false;
        
        const inventory = this.game.inventory;
        if (!inventory) return false;
        
        for (const [item, amount] of Object.entries(config.craftCost)) {
            if (!inventory.hasItem(item, amount)) {
                return false;
            }
        }
        return true;
    }
    
    // Craft a map (consume materials)
    craftMap(size = 'medium') {
        if (!this.canCraftMap(size)) {
            return null;
        }
        
        const config = this.mapSizes[size];
        const inventory = this.game.inventory;
        
        // Remove materials
        for (const [item, amount] of Object.entries(config.craftCost)) {
            inventory.removeItem(item, amount);
        }
        
        // Create the map
        const map = this.createMap(size);
        
        // Add to inventory as item
        inventory.addItem({
            id: 'crafted_map',
            name: map.name,
            mapId: map.id,
            icon: '🗺️'
        });
        
        this.game.ui?.showNotification?.('Map crafted!', 'success');
        
        return map;
    }
    
    // Open map viewer
    viewMap(mapId) {
        const map = this.maps.find(m => m.id === mapId);
        if (!map) return;
        
        this.activeMap = map;
        this.isViewing = true;
    }
    
    // Close map viewer
    closeMap() {
        this.isViewing = false;
    }
    
    // Add marker to map
    addMarker(mapId, type, x, y, label = '') {
        const map = this.maps.find(m => m.id === mapId);
        if (!map) return false;
        
        // Check if in map bounds
        const dx = x - map.centerX;
        const dy = y - map.centerY;
        if (Math.sqrt(dx*dx + dy*dy) > map.radius) {
            return false;
        }
        
        map.markers.push({
            id: `marker_${Date.now()}`,
            type: type,
            x: x,
            y: y,
            label: label
        });
        
        return true;
    }
    
    // Remove marker
    removeMarker(mapId, markerId) {
        const map = this.maps.find(m => m.id === mapId);
        if (!map) return;
        
        map.markers = map.markers.filter(m => m.id !== markerId);
    }
    
    // Update explored areas based on player position
    updateExploration() {
        const player = this.game.player;
        if (!player) return;
        
        // Calculate chunk coordinates
        const chunkSize = 16;
        const chunkX = Math.floor(player.x / chunkSize);
        const chunkY = Math.floor(player.y / chunkSize);
        
        // Mark surrounding chunks as explored
        const viewRadius = 3;
        for (let dx = -viewRadius; dx <= viewRadius; dx++) {
            for (let dy = -viewRadius; dy <= viewRadius; dy++) {
                const key = `${chunkX + dx},${chunkY + dy}`;
                this.exploredChunks.add(key);
            }
        }
        
        // Update active maps
        for (const map of this.maps) {
            map.explored.add(`${chunkX},${chunkY}`);
        }
    }
    
    // Check if area is explored
    isExplored(x, y) {
        const chunkSize = 16;
        const key = `${Math.floor(x / chunkSize)},${Math.floor(y / chunkSize)}`;
        return this.exploredChunks.has(key);
    }
    
    update(deltaTime) {
        // Update exploration
        this.updateExploration();
    }
    
    render(ctx) {
        if (!this.isViewing || !this.activeMap) return;
        
        const canvas = ctx.canvas;
        const map = this.activeMap;
        
        // Map dimensions
        const mapSize = 400;
        const mapX = (canvas.width - mapSize) / 2;
        const mapY = (canvas.height - mapSize) / 2;
        
        ctx.save();
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Map background (parchment style)
        ctx.fillStyle = '#D4B896';
        ctx.fillRect(mapX - 20, mapY - 50, mapSize + 40, mapSize + 80);
        
        // Map border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.strokeRect(mapX - 20, mapY - 50, mapSize + 40, mapSize + 80);
        
        // Map title
        ctx.fillStyle = '#4A3728';
        ctx.font = 'bold 18px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(map.name, mapX + mapSize / 2, mapY - 25);
        
        // Map content area
        ctx.fillStyle = '#C4A87C';
        ctx.fillRect(mapX, mapY, mapSize, mapSize);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX, mapY, mapSize, mapSize);
        
        // Render terrain
        this.renderMapTerrain(ctx, map, mapX, mapY, mapSize);
        
        // Render markers
        this.renderMapMarkers(ctx, map, mapX, mapY, mapSize);
        
        // Render player position
        this.renderPlayerOnMap(ctx, map, mapX, mapY, mapSize);
        
        // Compass rose
        this.renderCompass(ctx, mapX + mapSize - 40, mapY + 40, 30);
        
        // Scale indicator
        ctx.fillStyle = '#4A3728';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`Scale: 1:${map.scale * 8}`, mapX + 5, mapY + mapSize + 20);
        
        // Close hint
        ctx.textAlign = 'center';
        ctx.fillText('Press M or ESC to close', mapX + mapSize / 2, mapY + mapSize + 40);
        
        ctx.restore();
    }
    
    renderMapTerrain(ctx, map, mapX, mapY, mapSize) {
        if (!this.game.world) return;
        
        const pixelSize = 4;
        const gridSize = mapSize / pixelSize;
        const worldScale = (map.radius * 2) / gridSize;
        
        for (let gx = 0; gx < gridSize; gx++) {
            for (let gy = 0; gy < gridSize; gy++) {
                const worldX = map.centerX - map.radius + gx * worldScale;
                const worldY = map.centerY - map.radius + gy * worldScale;
                
                // Check if explored
                if (!this.isExplored(worldX, worldY) && !map.explored.has(`${Math.floor(worldX/16)},${Math.floor(worldY/16)}`)) {
                    ctx.fillStyle = '#8B7355'; // Unexplored = dark
                    ctx.fillRect(mapX + gx * pixelSize, mapY + gy * pixelSize, pixelSize, pixelSize);
                    continue;
                }
                
                // Get biome at position
                const biome = this.game.world.getBiomeAt?.(worldX, worldY) || 'default';
                const height = this.game.world.getHeightAt?.(worldX, worldY) || 0;
                
                // Get biome color
                let color = this.biomeColors[biome] || this.biomeColors.default;
                
                // Darken based on height for depth effect
                const brightness = 0.7 + (height / 50) * 0.3;
                color = this.adjustBrightness(color, brightness);
                
                ctx.fillStyle = color;
                ctx.fillRect(mapX + gx * pixelSize, mapY + gy * pixelSize, pixelSize, pixelSize);
            }
        }
    }
    
    renderMapMarkers(ctx, map, mapX, mapY, mapSize) {
        const scale = mapSize / (map.radius * 2);
        
        for (const marker of map.markers) {
            const dx = marker.x - map.centerX;
            const dy = marker.y - map.centerY;
            
            const screenX = mapX + mapSize / 2 + dx * scale;
            const screenY = mapY + mapSize / 2 + dy * scale;
            
            // Skip if outside map bounds
            if (screenX < mapX || screenX > mapX + mapSize ||
                screenY < mapY || screenY > mapY + mapSize) {
                continue;
            }
            
            const markerType = this.markerTypes[marker.type] || this.markerTypes.custom;
            
            // Marker icon
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(markerType.icon, screenX, screenY);
            
            // Label if present
            if (marker.label) {
                ctx.fillStyle = '#4A3728';
                ctx.font = '10px Courier New';
                ctx.fillText(marker.label, screenX, screenY + 15);
            }
        }
    }
    
    renderPlayerOnMap(ctx, map, mapX, mapY, mapSize) {
        const player = this.game.player;
        if (!player) return;
        
        const scale = mapSize / (map.radius * 2);
        const dx = player.x - map.centerX;
        const dy = player.y - map.centerY;
        
        const screenX = mapX + mapSize / 2 + dx * scale;
        const screenY = mapY + mapSize / 2 + dy * scale;
        
        // Clamp to map bounds
        const clampedX = Math.max(mapX + 10, Math.min(mapX + mapSize - 10, screenX));
        const clampedY = Math.max(mapY + 10, Math.min(mapY + mapSize - 10, screenY));
        
        // Player triangle pointing in movement direction
        ctx.save();
        ctx.translate(clampedX, clampedY);
        
        // Rotate based on player facing
        const angle = player.facingAngle || 0;
        ctx.rotate(angle);
        
        // Draw triangle
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-5, 5);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
        
        // "You are here" text if near edge
        if (screenX !== clampedX || screenY !== clampedY) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('(off map)', clampedX, clampedY + 15);
        }
    }
    
    renderCompass(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        
        // Compass circle
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = '#F5DEB3';
        ctx.fill();
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Cardinal directions
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillStyle = '#FF0000'; // North is red
        ctx.fillText('N', 0, -size + 10);
        ctx.fillStyle = '#8B4513';
        ctx.fillText('S', 0, size - 10);
        ctx.fillText('E', size - 10, 0);
        ctx.fillText('W', -size + 10, 0);
        
        // Compass needle
        ctx.beginPath();
        ctx.moveTo(0, -size + 18);
        ctx.lineTo(-4, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        
        ctx.restore();
    }
    
    adjustBrightness(hex, factor) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        const nr = Math.min(255, Math.floor(r * factor));
        const ng = Math.min(255, Math.floor(g * factor));
        const nb = Math.min(255, Math.floor(b * factor));
        
        return `rgb(${nr}, ${ng}, ${nb})`;
    }
    
    // Rename a map
    renameMap(mapId, newName) {
        const map = this.maps.find(m => m.id === mapId);
        if (map) {
            map.name = newName;
        }
    }
    
    // Delete a map
    deleteMap(mapId) {
        this.maps = this.maps.filter(m => m.id !== mapId);
        if (this.activeMap?.id === mapId) {
            this.activeMap = null;
            this.isViewing = false;
        }
    }
    
    // Serialize for saving
    serialize() {
        return {
            maps: this.maps.map(m => ({
                ...m,
                explored: Array.from(m.explored)
            })),
            exploredChunks: Array.from(this.exploredChunks)
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            if (data.maps) {
                this.maps = data.maps.map(m => ({
                    ...m,
                    explored: new Set(m.explored)
                }));
            }
            if (data.exploredChunks) {
                this.exploredChunks = new Set(data.exploredChunks);
            }
        }
    }
}
