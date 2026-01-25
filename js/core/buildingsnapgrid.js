// Building Snap Grid System - Aligned building placement
import { CONFIG } from '../config.js';

export const SNAP_CONFIG = {
    // Grid settings
    GRID_SIZE: 1, // 1 block grid
    HALF_GRID: 0.5, // Half block for finer placement
    
    // Snap settings
    SNAP_ENABLED: true,
    SNAP_THRESHOLD: 0.3, // Distance to snap
    WALL_SNAP: true,
    FLOOR_SNAP: true,
    
    // Building types
    BUILDING_TYPES: {
        BLOCK: { width: 1, height: 1, depth: 1, snapType: 'block' },
        WALL: { width: 1, height: 3, depth: 0.2, snapType: 'wall' },
        FLOOR: { width: 1, height: 0.2, depth: 1, snapType: 'floor' },
        PILLAR: { width: 0.3, height: 3, depth: 0.3, snapType: 'corner' },
        STAIRS: { width: 1, height: 1, depth: 2, snapType: 'stairs' },
        DOOR: { width: 1, height: 2.5, depth: 0.2, snapType: 'wall' },
        WINDOW: { width: 1, height: 1.5, depth: 0.2, snapType: 'wall' },
        FENCE: { width: 1, height: 1.5, depth: 0.1, snapType: 'fence' },
        ROOF: { width: 1, height: 0.5, depth: 1, snapType: 'roof' }
    },
    
    // Ghost preview
    GHOST_ALPHA: 0.5,
    GHOST_VALID_COLOR: '#00FF00',
    GHOST_INVALID_COLOR: '#FF0000'
};

export class BuildingSnapGridSystem {
    constructor(game) {
        this.game = game;
        
        // Current build mode
        this.buildMode = false;
        this.selectedBuildType = 'BLOCK';
        this.selectedBlock = 'stone';
        
        // Ghost preview position
        this.ghostPosition = { x: 0, y: 0, z: 0 };
        this.ghostRotation = 0; // 0, 90, 180, 270
        this.isValidPlacement = false;
        
        // Snap settings
        this.snapEnabled = SNAP_CONFIG.SNAP_ENABLED;
        this.gridSize = SNAP_CONFIG.GRID_SIZE;
        
        // Placed structures
        this.structures = new Map();
        
        // Build history for undo
        this.buildHistory = [];
        this.maxHistory = 50;
    }
    
    update(deltaTime) {
        if (!this.buildMode) return;
        
        // Update ghost position based on mouse/player position
        this.updateGhostPosition();
        
        // Check placement validity
        this.isValidPlacement = this.checkPlacementValidity();
    }
    
    // Enable/disable build mode
    toggleBuildMode() {
        this.buildMode = !this.buildMode;
        
        if (this.buildMode) {
            this.game.ui?.showMessage('🔨 Build Mode Enabled (G to toggle)', 2000);
        } else {
            this.game.ui?.showMessage('🔨 Build Mode Disabled', 2000);
        }
        
        return this.buildMode;
    }
    
    // Set build type
    setBuildType(type) {
        if (SNAP_CONFIG.BUILDING_TYPES[type]) {
            this.selectedBuildType = type;
            this.game.ui?.showMessage(`Building: ${type}`, 1500);
        }
    }
    
    // Set block type
    setBlockType(block) {
        this.selectedBlock = block;
        this.game.ui?.showMessage(`Block: ${block}`, 1500);
    }
    
    // Rotate ghost preview
    rotate(direction = 1) {
        this.ghostRotation = (this.ghostRotation + 90 * direction) % 360;
        if (this.ghostRotation < 0) this.ghostRotation += 360;
    }
    
    // Update ghost position
    updateGhostPosition() {
        const player = this.game.player;
        if (!player) return;
        
        // Get look direction
        const lookDir = player.lookDirection || { x: 1, y: 0 };
        const placeDistance = 3;
        
        // Calculate target position
        let targetX = player.x + lookDir.x * placeDistance;
        let targetY = player.y + lookDir.y * placeDistance;
        let targetZ = player.z;
        
        // Apply snap to grid
        if (this.snapEnabled) {
            targetX = this.snapToGrid(targetX);
            targetY = this.snapToGrid(targetY);
            targetZ = this.snapToGrid(targetZ);
        }
        
        // Check for nearby structures to snap to
        const snapTarget = this.findSnapTarget(targetX, targetY, targetZ);
        if (snapTarget) {
            targetX = snapTarget.x;
            targetY = snapTarget.y;
            targetZ = snapTarget.z;
        }
        
        this.ghostPosition = { x: targetX, y: targetY, z: targetZ };
    }
    
    // Snap coordinate to grid
    snapToGrid(value) {
        return Math.round(value / this.gridSize) * this.gridSize;
    }
    
    // Find nearby structure to snap to
    findSnapTarget(x, y, z) {
        const buildType = SNAP_CONFIG.BUILDING_TYPES[this.selectedBuildType];
        if (!buildType) return null;
        
        const snapThreshold = SNAP_CONFIG.SNAP_THRESHOLD;
        let bestSnap = null;
        let bestDist = snapThreshold;
        
        for (const structure of this.structures.values()) {
            const structType = SNAP_CONFIG.BUILDING_TYPES[structure.type];
            if (!structType) continue;
            
            // Calculate snap points based on structure type
            const snapPoints = this.getSnapPoints(structure, structType);
            
            for (const point of snapPoints) {
                const dx = point.x - x;
                const dy = point.y - y;
                const dz = point.z - z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < bestDist) {
                    bestDist = dist;
                    bestSnap = point;
                }
            }
        }
        
        return bestSnap;
    }
    
    // Get snap points for a structure
    getSnapPoints(structure, structType) {
        const points = [];
        const { x, y, z } = structure;
        const { width, height, depth } = structType;
        
        switch (structType.snapType) {
            case 'block':
                // All 6 faces
                points.push(
                    { x: x + width, y, z },
                    { x: x - width, y, z },
                    { x, y: y + depth, z },
                    { x, y: y - depth, z },
                    { x, y, z: z + height },
                    { x, y, z: z - height }
                );
                break;
                
            case 'wall':
                // Top and sides
                points.push(
                    { x: x + width, y, z },
                    { x: x - width, y, z },
                    { x, y, z: z + height }
                );
                break;
                
            case 'floor':
                // All 4 edges
                points.push(
                    { x: x + width, y, z },
                    { x: x - width, y, z },
                    { x, y: y + depth, z },
                    { x, y: y - depth, z }
                );
                break;
                
            case 'corner':
                // Wall connections
                points.push(
                    { x: x + 1, y, z },
                    { x: x - 1, y, z },
                    { x, y: y + 1, z },
                    { x, y: y - 1, z }
                );
                break;
        }
        
        return points;
    }
    
    // Check if placement is valid
    checkPlacementValidity() {
        const { x, y, z } = this.ghostPosition;
        const buildType = SNAP_CONFIG.BUILDING_TYPES[this.selectedBuildType];
        if (!buildType) return false;
        
        // Check world collision
        if (this.game.world) {
            const block = this.game.world.getBlock(
                Math.floor(x),
                Math.floor(y),
                Math.floor(z)
            );
            
            // Can't place in solid blocks
            if (block && block !== 'air' && block !== 'water') {
                return false;
            }
        }
        
        // Check for existing structure collision
        for (const structure of this.structures.values()) {
            if (this.structuresOverlap(this.ghostPosition, buildType, structure)) {
                return false;
            }
        }
        
        // Check distance from player
        const player = this.game.player;
        if (player) {
            const dx = player.x - x;
            const dy = player.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) return false; // Max build range
        }
        
        return true;
    }
    
    // Check if two structures overlap
    structuresOverlap(pos1, type1, structure2) {
        const type2 = SNAP_CONFIG.BUILDING_TYPES[structure2.type];
        if (!type2) return false;
        
        const overlap = (min1, max1, min2, max2) => !(max1 <= min2 || max2 <= min1);
        
        return overlap(pos1.x, pos1.x + type1.width, structure2.x, structure2.x + type2.width) &&
               overlap(pos1.y, pos1.y + type1.depth, structure2.y, structure2.y + type2.depth) &&
               overlap(pos1.z, pos1.z + type1.height, structure2.z, structure2.z + type2.height);
    }
    
    // Place structure
    placeStructure() {
        if (!this.buildMode || !this.isValidPlacement) {
            this.game.ui?.showMessage('❌ Cannot place here', 1500);
            return false;
        }
        
        // Check if player has required block
        if (!this.game.inventory?.hasItem(this.selectedBlock, 1)) {
            this.game.ui?.showMessage(`❌ Need ${this.selectedBlock}`, 1500);
            return false;
        }
        
        // Remove block from inventory
        this.game.inventory.removeItem(this.selectedBlock, 1);
        
        // Create structure
        const structure = {
            id: `struct_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            type: this.selectedBuildType,
            block: this.selectedBlock,
            x: this.ghostPosition.x,
            y: this.ghostPosition.y,
            z: this.ghostPosition.z,
            rotation: this.ghostRotation
        };
        
        this.structures.set(structure.id, structure);
        
        // Add to history
        this.buildHistory.push({ action: 'place', structure: { ...structure } });
        if (this.buildHistory.length > this.maxHistory) {
            this.buildHistory.shift();
        }
        
        // Place block in world
        if (this.game.world) {
            this.game.world.setBlock(
                Math.floor(structure.x),
                Math.floor(structure.y),
                Math.floor(structure.z),
                structure.block
            );
        }
        
        this.game.ui?.showMessage(`✅ Placed ${this.selectedBuildType}`, 1500);
        
        // Achievement tracking
        this.game.achievements?.incrementProgress?.('blocks_placed', 1);
        
        return true;
    }
    
    // Remove structure at position
    removeStructure(x, y, z) {
        for (const [id, structure] of this.structures.entries()) {
            const type = SNAP_CONFIG.BUILDING_TYPES[structure.type];
            if (!type) continue;
            
            // Check if position is within structure
            if (x >= structure.x && x < structure.x + type.width &&
                y >= structure.y && y < structure.y + type.depth &&
                z >= structure.z && z < structure.z + type.height) {
                
                // Add to history
                this.buildHistory.push({ action: 'remove', structure: { ...structure } });
                
                // Remove from world
                if (this.game.world) {
                    this.game.world.setBlock(
                        Math.floor(structure.x),
                        Math.floor(structure.y),
                        Math.floor(structure.z),
                        'air'
                    );
                }
                
                // Return block to inventory
                this.game.inventory?.addItem(structure.block, 1);
                
                this.structures.delete(id);
                this.game.ui?.showMessage(`🗑️ Removed ${structure.type}`, 1500);
                
                return true;
            }
        }
        
        return false;
    }
    
    // Undo last action
    undo() {
        if (this.buildHistory.length === 0) {
            this.game.ui?.showMessage('Nothing to undo', 1500);
            return false;
        }
        
        const lastAction = this.buildHistory.pop();
        
        if (lastAction.action === 'place') {
            // Remove placed structure
            this.structures.delete(lastAction.structure.id);
            
            if (this.game.world) {
                this.game.world.setBlock(
                    Math.floor(lastAction.structure.x),
                    Math.floor(lastAction.structure.y),
                    Math.floor(lastAction.structure.z),
                    'air'
                );
            }
            
            this.game.inventory?.addItem(lastAction.structure.block, 1);
        } else if (lastAction.action === 'remove') {
            // Restore removed structure
            this.structures.set(lastAction.structure.id, lastAction.structure);
            
            if (this.game.world) {
                this.game.world.setBlock(
                    Math.floor(lastAction.structure.x),
                    Math.floor(lastAction.structure.y),
                    Math.floor(lastAction.structure.z),
                    lastAction.structure.block
                );
            }
            
            this.game.inventory?.removeItem(lastAction.structure.block, 1);
        }
        
        this.game.ui?.showMessage('↩️ Undo', 1500);
        return true;
    }
    
    // Toggle snap
    toggleSnap() {
        this.snapEnabled = !this.snapEnabled;
        this.game.ui?.showMessage(
            this.snapEnabled ? '📐 Snap Enabled' : '📐 Snap Disabled',
            1500
        );
        return this.snapEnabled;
    }
    
    // Render ghost preview
    render(ctx, camera) {
        if (!this.buildMode) return;
        
        const screenPos = camera.worldToScreen(
            this.ghostPosition.x,
            this.ghostPosition.y,
            this.ghostPosition.z
        );
        
        const buildType = SNAP_CONFIG.BUILDING_TYPES[this.selectedBuildType];
        if (!buildType) return;
        
        // Ghost outline
        ctx.globalAlpha = SNAP_CONFIG.GHOST_ALPHA;
        ctx.fillStyle = this.isValidPlacement ? 
            SNAP_CONFIG.GHOST_VALID_COLOR : 
            SNAP_CONFIG.GHOST_INVALID_COLOR;
        
        // Draw based on build type
        const size = Math.max(buildType.width, buildType.depth) * 20;
        ctx.fillRect(screenPos.x - size/2, screenPos.y - size, size, size);
        
        ctx.globalAlpha = 1;
        
        // Draw grid overlay
        if (this.snapEnabled) {
            this.drawGrid(ctx, camera);
        }
        
        // Build mode indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Build: ${this.selectedBuildType} (${this.selectedBlock})`, 10, ctx.canvas.height - 60);
        ctx.fillText(`Rotation: ${this.ghostRotation}° | Snap: ${this.snapEnabled ? 'ON' : 'OFF'}`, 10, ctx.canvas.height - 40);
        ctx.fillText('R: Rotate | G: Toggle Build | U: Undo | Tab: Snap', 10, ctx.canvas.height - 20);
    }
    
    // Draw grid overlay
    drawGrid(ctx, camera) {
        const player = this.game.player;
        if (!player) return;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        const gridRange = 5;
        const centerX = Math.floor(player.x);
        const centerY = Math.floor(player.y);
        
        for (let dx = -gridRange; dx <= gridRange; dx++) {
            for (let dy = -gridRange; dy <= gridRange; dy++) {
                const worldX = centerX + dx;
                const worldY = centerY + dy;
                
                const screenPos = camera.worldToScreen(worldX, worldY, player.z);
                
                ctx.strokeRect(screenPos.x - 10, screenPos.y - 5, 20, 10);
            }
        }
    }
    
    // Serialize
    serialize() {
        return {
            structures: Array.from(this.structures.values()),
            snapEnabled: this.snapEnabled
        };
    }
    
    deserialize(data) {
        if (data?.structures) {
            this.structures.clear();
            for (const struct of data.structures) {
                this.structures.set(struct.id, struct);
            }
        }
        if (data?.snapEnabled !== undefined) {
            this.snapEnabled = data.snapEnabled;
        }
    }
    
    reset() {
        this.structures.clear();
        this.buildHistory = [];
        this.buildMode = false;
        this.ghostRotation = 0;
    }
}
