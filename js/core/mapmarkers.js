// Map Markers System - Player-placed markers on minimap
import { CONFIG } from '../config.js';

export const MARKER_TYPES = {
    CUSTOM: {
        id: 'custom',
        name: 'Custom',
        icon: '📍',
        color: '#FF0000'
    },
    HOME: {
        id: 'home',
        name: 'Home',
        icon: '🏠',
        color: '#00FF00'
    },
    DANGER: {
        id: 'danger',
        name: 'Danger',
        icon: '⚠️',
        color: '#FF0000'
    },
    TREASURE: {
        id: 'treasure',
        name: 'Treasure',
        icon: '💎',
        color: '#FFFF00'
    },
    RESOURCE: {
        id: 'resource',
        name: 'Resource',
        icon: '⛏️',
        color: '#00FFFF'
    },
    POI: {
        id: 'poi',
        name: 'Point of Interest',
        icon: '⭐',
        color: '#FF00FF'
    },
    QUEST: {
        id: 'quest',
        name: 'Quest',
        icon: '❗',
        color: '#FFD700'
    },
    CAMP: {
        id: 'camp',
        name: 'Camp',
        icon: '🏕️',
        color: '#FFA500'
    },
    DEATH: {
        id: 'death',
        name: 'Death Location',
        icon: '💀',
        color: '#808080'
    },
    WAYPOINT: {
        id: 'waypoint',
        name: 'Waypoint',
        icon: '🚩',
        color: '#00BFFF'
    }
};

class MapMarker {
    constructor(x, y, z, type = 'custom', name = '', description = '') {
        this.id = `marker_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        this.x = x;
        this.y = y;
        this.z = z;
        
        const markerType = MARKER_TYPES[type.toUpperCase()] || MARKER_TYPES.CUSTOM;
        this.type = markerType.id;
        this.icon = markerType.icon;
        this.color = markerType.color;
        
        this.name = name || markerType.name;
        this.description = description;
        
        this.visible = true;
        this.createdAt = Date.now();
        
        // Temporary markers auto-remove
        this.temporary = false;
        this.expireTime = null;
    }
    
    // Get distance from player
    distanceFrom(x, y, z = null) {
        const dx = this.x - x;
        const dy = this.y - y;
        const dz = z !== null ? this.z - z : 0;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Check if marker has expired
    isExpired() {
        if (!this.temporary || !this.expireTime) return false;
        return Date.now() > this.expireTime;
    }
    
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            z: this.z,
            type: this.type,
            name: this.name,
            description: this.description,
            visible: this.visible,
            createdAt: this.createdAt,
            temporary: this.temporary,
            expireTime: this.expireTime
        };
    }
    
    static deserialize(data) {
        const marker = new MapMarker(data.x, data.y, data.z, data.type, data.name, data.description);
        marker.id = data.id;
        marker.visible = data.visible !== false;
        marker.createdAt = data.createdAt || Date.now();
        marker.temporary = data.temporary || false;
        marker.expireTime = data.expireTime;
        return marker;
    }
}

export class MapMarkerSystem {
    constructor(game) {
        this.game = game;
        
        // All markers
        this.markers = new Map();
        
        // Max markers
        this.maxMarkers = 50;
        
        // Selected marker for tracking
        this.trackedMarker = null;
        
        // Marker groups for filtering
        this.visibleTypes = new Set(Object.keys(MARKER_TYPES).map(k => MARKER_TYPES[k].id));
    }
    
    update(deltaTime) {
        // Remove expired markers
        for (const [id, marker] of this.markers.entries()) {
            if (marker.isExpired()) {
                this.markers.delete(id);
            }
        }
    }
    
    // Create a new marker
    createMarker(x, y, z, type = 'custom', name = '', description = '') {
        if (this.markers.size >= this.maxMarkers) {
            this.game.ui?.showMessage('❌ Maximum markers reached!', 2000);
            return null;
        }
        
        const marker = new MapMarker(x, y, z, type, name, description);
        this.markers.set(marker.id, marker);
        
        this.game.ui?.showMessage(`${marker.icon} Marker placed: ${marker.name}`, 2000);
        
        return marker;
    }
    
    // Create marker at player position
    createMarkerAtPlayer(type = 'custom', name = '', description = '') {
        const player = this.game.player;
        if (!player) return null;
        
        return this.createMarker(player.x, player.y, player.z, type, name, description);
    }
    
    // Create temporary marker (auto-removes after duration)
    createTemporaryMarker(x, y, z, type, duration = 60000) {
        const marker = this.createMarker(x, y, z, type);
        if (marker) {
            marker.temporary = true;
            marker.expireTime = Date.now() + duration;
        }
        return marker;
    }
    
    // Remove a marker
    removeMarker(markerId) {
        if (this.trackedMarker?.id === markerId) {
            this.trackedMarker = null;
        }
        return this.markers.delete(markerId);
    }
    
    // Remove all markers of a type
    removeMarkersByType(type) {
        let removed = 0;
        for (const [id, marker] of this.markers.entries()) {
            if (marker.type === type) {
                this.markers.delete(id);
                removed++;
            }
        }
        return removed;
    }
    
    // Get marker by ID
    getMarker(markerId) {
        return this.markers.get(markerId);
    }
    
    // Get nearest marker
    getNearestMarker(x, y, z, type = null) {
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const marker of this.markers.values()) {
            if (!marker.visible) continue;
            if (type && marker.type !== type) continue;
            
            const dist = marker.distanceFrom(x, y, z);
            if (dist < nearestDist) {
                nearest = marker;
                nearestDist = dist;
            }
        }
        
        return nearest;
    }
    
    // Get markers within radius
    getMarkersInRadius(x, y, z, radius) {
        const results = [];
        
        for (const marker of this.markers.values()) {
            if (!marker.visible) continue;
            
            const dist = marker.distanceFrom(x, y, z);
            if (dist <= radius) {
                results.push({ marker, distance: dist });
            }
        }
        
        return results.sort((a, b) => a.distance - b.distance);
    }
    
    // Track a marker (shows distance/direction)
    trackMarker(markerId) {
        const marker = this.markers.get(markerId);
        if (marker) {
            this.trackedMarker = marker;
            this.game.ui?.showMessage(`🧭 Tracking: ${marker.name}`, 2000);
            return true;
        }
        return false;
    }
    
    // Stop tracking
    stopTracking() {
        this.trackedMarker = null;
    }
    
    // Get tracking info
    getTrackingInfo() {
        if (!this.trackedMarker) return null;
        
        const player = this.game.player;
        if (!player) return null;
        
        const distance = this.trackedMarker.distanceFrom(player.x, player.y, player.z);
        const dx = this.trackedMarker.x - player.x;
        const dy = this.trackedMarker.y - player.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        // Get cardinal direction
        const directions = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
        const dirIndex = Math.round((angle + 180) / 45) % 8;
        const direction = directions[dirIndex];
        
        return {
            marker: this.trackedMarker,
            distance: Math.round(distance),
            angle: angle,
            direction: direction
        };
    }
    
    // Toggle visibility of a marker type
    toggleTypeVisibility(type) {
        if (this.visibleTypes.has(type)) {
            this.visibleTypes.delete(type);
        } else {
            this.visibleTypes.add(type);
        }
    }
    
    // Check if type is visible
    isTypeVisible(type) {
        return this.visibleTypes.has(type);
    }
    
    // Get all markers for minimap
    getVisibleMarkers() {
        return Array.from(this.markers.values()).filter(m => 
            m.visible && this.visibleTypes.has(m.type)
        );
    }
    
    // Get markers by type
    getMarkersByType(type) {
        return Array.from(this.markers.values()).filter(m => m.type === type);
    }
    
    // Create death marker at player position
    createDeathMarker() {
        const player = this.game.player;
        if (!player) return null;
        
        // Remove old death markers (keep only last 3)
        const deathMarkers = this.getMarkersByType('death');
        if (deathMarkers.length >= 3) {
            deathMarkers.sort((a, b) => a.createdAt - b.createdAt);
            this.removeMarker(deathMarkers[0].id);
        }
        
        return this.createMarker(
            player.x, player.y, player.z,
            'death',
            'Death Location',
            `Died at ${new Date().toLocaleTimeString()}`
        );
    }
    
    // Render markers on minimap
    renderOnMinimap(ctx, minimapX, minimapY, minimapSize, playerX, playerY, scale) {
        const halfSize = minimapSize / 2;
        
        for (const marker of this.getVisibleMarkers()) {
            // Calculate relative position
            const relX = (marker.x - playerX) * scale;
            const relY = (marker.y - playerY) * scale;
            
            // Check if within minimap bounds
            if (Math.abs(relX) > halfSize || Math.abs(relY) > halfSize) {
                // Draw indicator at edge
                const angle = Math.atan2(relY, relX);
                const edgeX = Math.cos(angle) * (halfSize - 5);
                const edgeY = Math.sin(angle) * (halfSize - 5);
                
                ctx.fillStyle = marker.color;
                ctx.beginPath();
                ctx.arc(minimapX + halfSize + edgeX, minimapY + halfSize + edgeY, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw marker
                const screenX = minimapX + halfSize + relX;
                const screenY = minimapY + halfSize + relY;
                
                // Marker background
                ctx.fillStyle = marker.color;
                ctx.beginPath();
                ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Marker icon
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(marker.icon.charAt(0), screenX, screenY);
            }
        }
        
        // Render tracking indicator
        if (this.trackedMarker) {
            const info = this.getTrackingInfo();
            if (info) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(
                    `${info.marker.name}: ${info.distance}m ${info.direction}`,
                    minimapX + halfSize,
                    minimapY + minimapSize + 12
                );
            }
        }
    }
    
    // Serialize
    serialize() {
        return {
            markers: Array.from(this.markers.values()).map(m => m.serialize()),
            trackedMarkerId: this.trackedMarker?.id,
            visibleTypes: Array.from(this.visibleTypes)
        };
    }
    
    deserialize(data) {
        if (data?.markers) {
            this.markers.clear();
            for (const markerData of data.markers) {
                const marker = MapMarker.deserialize(markerData);
                this.markers.set(marker.id, marker);
            }
        }
        
        if (data?.trackedMarkerId) {
            this.trackedMarker = this.markers.get(data.trackedMarkerId);
        }
        
        if (data?.visibleTypes) {
            this.visibleTypes = new Set(data.visibleTypes);
        }
    }
    
    reset() {
        this.markers.clear();
        this.trackedMarker = null;
        this.visibleTypes = new Set(Object.keys(MARKER_TYPES).map(k => MARKER_TYPES[k].id));
    }
}
