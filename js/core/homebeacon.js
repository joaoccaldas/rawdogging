// Home Beacon System - Respawn and teleportation
import { CONFIG } from '../config.js';

export const BEACON_CONFIG = {
    // Beacon types
    TYPES: {
        basic_bed: {
            name: 'Basic Bed',
            respawnOnly: true,
            teleport: false,
            recipe: { stick: 6, fiber: 8, leather: 4 }
        },
        campsite: {
            name: 'Campsite',
            respawnOnly: true,
            teleport: false,
            warmth: true,
            recipe: { stick: 10, leather: 6, fur: 4 }
        },
        stone_hearth: {
            name: 'Stone Hearth',
            respawnOnly: false,
            teleport: true,
            cooldown: 300, // 5 minutes
            recipe: { stone: 20, bronze_ingot: 5, crystal: 2 }
        },
        tribal_totem: {
            name: 'Tribal Totem',
            respawnOnly: false,
            teleport: true,
            cooldown: 180, // 3 minutes
            shareWithTamed: true,
            recipe: { log: 10, bone: 20, crystal: 5 }
        }
    },
    
    // Maximum beacons per player
    MAX_BEACONS: 5,
    
    // Default spawn (if no beacon set)
    DEFAULT_SPAWN: { x: 0, y: 0, z: 20 }
};

export class HomeBeaconSystem {
    constructor(game) {
        this.game = game;
        
        // Active beacons placed in the world
        this.beacons = [];
        
        // Current active spawn point
        this.activeSpawnIndex = 0;
        
        // Teleport cooldown
        this.teleportCooldown = 0;
        
        // Death position for "return to death" feature
        this.lastDeathPosition = null;
    }
    
    update(deltaTime) {
        // Update teleport cooldown
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= deltaTime;
        }
    }
    
    // Place a new beacon
    placeBeacon(beaconType, x, y, z, name = null) {
        const config = BEACON_CONFIG.TYPES[beaconType];
        if (!config) return false;
        
        // Check max beacons
        if (this.beacons.length >= BEACON_CONFIG.MAX_BEACONS) {
            if (this.game.ui) {
                this.game.ui.showMessage('❌ Maximum beacons reached! Remove one first.', 3000);
            }
            return false;
        }
        
        // Check if beacon already exists at this location
        const existing = this.beacons.find(b => 
            Math.abs(b.x - x) < 2 && Math.abs(b.y - y) < 2 && Math.abs(b.z - z) < 2
        );
        if (existing) {
            if (this.game.ui) {
                this.game.ui.showMessage('❌ Beacon already exists here!', 2000);
            }
            return false;
        }
        
        const beacon = {
            id: Date.now(),
            type: beaconType,
            name: name || `${config.name} ${this.beacons.length + 1}`,
            x, y, z,
            config,
            placedAt: Date.now()
        };
        
        this.beacons.push(beacon);
        
        // Automatically set as active if it's the first beacon
        if (this.beacons.length === 1) {
            this.activeSpawnIndex = 0;
        }
        
        if (this.game.ui) {
            this.game.ui.showMessage(`🏠 ${beacon.name} placed!`, 3000);
        }
        
        // Add to minimap if available
        if (this.game.minimap) {
            this.game.minimap.setHomePosition(beacon.x, beacon.y);
        }
        
        return true;
    }
    
    // Remove a beacon
    removeBeacon(beaconId) {
        const index = this.beacons.findIndex(b => b.id === beaconId);
        if (index === -1) return false;
        
        const beacon = this.beacons[index];
        this.beacons.splice(index, 1);
        
        // Adjust active index if needed
        if (this.activeSpawnIndex >= this.beacons.length) {
            this.activeSpawnIndex = Math.max(0, this.beacons.length - 1);
        }
        
        if (this.game.ui) {
            this.game.ui.showMessage(`🏚️ ${beacon.name} removed.`, 2000);
        }
        
        // Update minimap
        if (this.game.minimap && this.beacons.length > 0) {
            const newActive = this.beacons[this.activeSpawnIndex];
            this.game.minimap.setHomePosition(newActive.x, newActive.y);
        }
        
        return true;
    }
    
    // Set active spawn beacon
    setActiveBeacon(index) {
        if (index < 0 || index >= this.beacons.length) return false;
        
        this.activeSpawnIndex = index;
        const beacon = this.beacons[index];
        
        if (this.game.ui) {
            this.game.ui.showMessage(`🏠 Spawn point set to: ${beacon.name}`, 2000);
        }
        
        // Update minimap
        if (this.game.minimap) {
            this.game.minimap.setHomePosition(beacon.x, beacon.y);
        }
        
        return true;
    }
    
    // Get spawn position
    getSpawnPosition() {
        if (this.beacons.length === 0) {
            return { ...BEACON_CONFIG.DEFAULT_SPAWN };
        }
        
        const beacon = this.beacons[this.activeSpawnIndex];
        return {
            x: beacon.x,
            y: beacon.y,
            z: beacon.z + 1 // Spawn slightly above the beacon
        };
    }
    
    // Teleport to beacon
    teleportToBeacon(beaconIndex) {
        if (beaconIndex < 0 || beaconIndex >= this.beacons.length) return false;
        
        const beacon = this.beacons[beaconIndex];
        const config = beacon.config;
        
        // Check if beacon supports teleport
        if (config.respawnOnly) {
            if (this.game.ui) {
                this.game.ui.showMessage('❌ This beacon does not support teleportation.', 2000);
            }
            return false;
        }
        
        // Check cooldown
        if (this.teleportCooldown > 0) {
            if (this.game.ui) {
                this.game.ui.showMessage(`⏱️ Teleport on cooldown: ${Math.ceil(this.teleportCooldown)}s`, 2000);
            }
            return false;
        }
        
        // Perform teleport
        const player = this.game.player;
        if (player) {
            player.x = beacon.x;
            player.y = beacon.y;
            player.z = beacon.z + 1;
            
            // Reset velocity
            player.vx = 0;
            player.vy = 0;
            player.vz = 0;
        }
        
        // Set cooldown
        this.teleportCooldown = config.cooldown || 60;
        
        // Particles effect
        if (this.game.particles) {
            this.game.particles.spawn(beacon.x, beacon.y, beacon.z, 'teleport', 20);
        }
        
        // Sound effect
        if (this.game.audio) {
            this.game.audio.playSound('teleport');
        }
        
        if (this.game.ui) {
            this.game.ui.showMessage(`✨ Teleported to ${beacon.name}!`, 2000);
        }
        
        // Also teleport tamed pets if beacon supports it
        if (config.shareWithTamed && this.game.tamedPets) {
            for (const pet of this.game.tamedPets) {
                pet.x = beacon.x + (Math.random() - 0.5) * 4;
                pet.y = beacon.y + (Math.random() - 0.5) * 4;
                pet.z = beacon.z + 1;
            }
        }
        
        return true;
    }
    
    // Handle player death
    onPlayerDeath(x, y, z) {
        this.lastDeathPosition = { x, y, z };
        
        // Return spawn position
        return this.getSpawnPosition();
    }
    
    // Teleport to last death position
    returnToDeathPosition() {
        if (!this.lastDeathPosition) {
            if (this.game.ui) {
                this.game.ui.showMessage('❌ No death position recorded.', 2000);
            }
            return false;
        }
        
        // Check cooldown
        if (this.teleportCooldown > 0) {
            if (this.game.ui) {
                this.game.ui.showMessage(`⏱️ Teleport on cooldown: ${Math.ceil(this.teleportCooldown)}s`, 2000);
            }
            return false;
        }
        
        const player = this.game.player;
        if (player) {
            player.x = this.lastDeathPosition.x;
            player.y = this.lastDeathPosition.y;
            player.z = this.lastDeathPosition.z + 1;
        }
        
        // Set cooldown
        this.teleportCooldown = 120; // 2 minute cooldown for death return
        
        if (this.game.ui) {
            this.game.ui.showMessage('💀 Returned to death location.', 2000);
        }
        
        // Clear death position after use
        this.lastDeathPosition = null;
        
        return true;
    }
    
    // Get all beacons for UI
    getBeaconList() {
        return this.beacons.map((beacon, index) => ({
            ...beacon,
            isActive: index === this.activeSpawnIndex,
            canTeleport: !beacon.config.respawnOnly,
            distance: this.getDistanceToBeacon(beacon)
        }));
    }
    
    // Calculate distance to beacon
    getDistanceToBeacon(beacon) {
        const player = this.game.player;
        if (!player) return 0;
        
        const dx = beacon.x - player.x;
        const dy = beacon.y - player.y;
        const dz = beacon.z - player.z;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Render beacons in world
    render(ctx, camera) {
        for (const beacon of this.beacons) {
            const screenPos = camera.worldToScreen(beacon.x, beacon.y, beacon.z);
            
            // Draw beacon marker
            ctx.save();
            ctx.translate(screenPos.x, screenPos.y);
            
            // Beacon icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const isActive = this.beacons.indexOf(beacon) === this.activeSpawnIndex;
            
            // Glow effect for active beacon
            if (isActive) {
                ctx.shadowColor = '#ffff00';
                ctx.shadowBlur = 20;
            }
            
            // Draw based on type
            switch (beacon.type) {
                case 'basic_bed':
                    ctx.fillText('🛏️', 0, 0);
                    break;
                case 'campsite':
                    ctx.fillText('⛺', 0, 0);
                    break;
                case 'stone_hearth':
                    ctx.fillText('🏠', 0, 0);
                    break;
                case 'tribal_totem':
                    ctx.fillText('🗿', 0, 0);
                    break;
                default:
                    ctx.fillText('📍', 0, 0);
            }
            
            // Draw beacon name if close enough
            const dist = this.getDistanceToBeacon(beacon);
            if (dist < 20) {
                ctx.font = '12px Arial';
                ctx.fillStyle = isActive ? '#ffff00' : '#ffffff';
                ctx.fillText(beacon.name, 0, -20);
            }
            
            ctx.restore();
        }
        
        // Render death marker if exists
        if (this.lastDeathPosition) {
            const deathScreen = camera.worldToScreen(
                this.lastDeathPosition.x,
                this.lastDeathPosition.y,
                this.lastDeathPosition.z
            );
            
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💀', deathScreen.x, deathScreen.y);
        }
    }
    
    // Show beacon management UI
    showBeaconUI() {
        const beacons = this.getBeaconList();
        
        let html = `
            <div class="beacon-modal">
                <h2>🏠 Beacons</h2>
                <p>Active Spawn: ${beacons.find(b => b.isActive)?.name || 'Default Spawn'}</p>
                <p>Teleport Cooldown: ${Math.ceil(Math.max(0, this.teleportCooldown))}s</p>
                <hr>
        `;
        
        if (beacons.length === 0) {
            html += '<p>No beacons placed. Craft and place a bed or beacon!</p>';
        } else {
            for (const beacon of beacons) {
                html += `
                    <div class="beacon-item ${beacon.isActive ? 'active' : ''}">
                        <span>${beacon.name}</span>
                        <span>${Math.floor(beacon.distance)} blocks away</span>
                        <button onclick="game.homeBeacons.setActiveBeacon(${beacons.indexOf(beacon)})">
                            Set Spawn
                        </button>
                        ${beacon.canTeleport ? `
                            <button onclick="game.homeBeacons.teleportToBeacon(${beacons.indexOf(beacon)})">
                                Teleport
                            </button>
                        ` : ''}
                    </div>
                `;
            }
        }
        
        if (this.lastDeathPosition) {
            html += `
                <hr>
                <button onclick="game.homeBeacons.returnToDeathPosition()">
                    💀 Return to Death Location
                </button>
            `;
        }
        
        html += `
                <hr>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'beacon-overlay';
        modal.innerHTML = html;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(modal);
    }
    
    // Serialize for save
    serialize() {
        return {
            beacons: this.beacons.map(b => ({
                id: b.id,
                type: b.type,
                name: b.name,
                x: b.x,
                y: b.y,
                z: b.z,
                placedAt: b.placedAt
            })),
            activeSpawnIndex: this.activeSpawnIndex,
            lastDeathPosition: this.lastDeathPosition
        };
    }
    
    deserialize(data) {
        if (!data) return;
        
        this.beacons = (data.beacons || []).map(b => ({
            ...b,
            config: BEACON_CONFIG.TYPES[b.type] || BEACON_CONFIG.TYPES.basic_bed
        }));
        
        this.activeSpawnIndex = data.activeSpawnIndex || 0;
        this.lastDeathPosition = data.lastDeathPosition || null;
        
        // Update minimap with active beacon
        if (this.game.minimap && this.beacons.length > 0) {
            const active = this.beacons[this.activeSpawnIndex];
            if (active) {
                this.game.minimap.setHomePosition(active.x, active.y);
            }
        }
    }
}

// Export beacon items for config integration
export const BEACON_ITEMS = {
    basic_bed: {
        name: 'Basic Bed',
        type: 'placeable',
        stackSize: 1,
        description: 'Sets your respawn point. Does not teleport.'
    },
    campsite: {
        name: 'Campsite',
        type: 'placeable',
        stackSize: 1,
        description: 'Sets your respawn point. Provides warmth at night.'
    },
    stone_hearth: {
        name: 'Stone Hearth',
        type: 'placeable',
        stackSize: 1,
        description: 'Advanced beacon. Allows teleportation (5 min cooldown).'
    },
    tribal_totem: {
        name: 'Tribal Totem',
        type: 'placeable',
        stackSize: 1,
        description: 'Teleport beacon. Also teleports tamed animals.'
    }
};

// Export beacon recipes
export const BEACON_RECIPES = Object.fromEntries(
    Object.entries(BEACON_CONFIG.TYPES).map(([key, config]) => [
        key,
        {
            result: key,
            count: 1,
            requires: config.recipe
        }
    ])
);
