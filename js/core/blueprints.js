// Building Blueprint System
// Create and use blueprints for complex structures

import { CONFIG } from '../config.js';

// Pre-defined blueprints
export const BLUEPRINT_TEMPLATES = {
    house_small: {
        id: 'blueprint_house',
        name: 'Small House',
        icon: '🏠',
        size: { width: 7, depth: 7, height: 5 },
        materials: {
            'oak_planks': 80,
            'glass_pane': 6,
            'door': 1,
            'torch': 4
        },
        blocks: [
            // Floor
            ...generateFloor(7, 7, 0, 'oak_planks'),
            // Walls
            ...generateWalls(7, 7, 4, 'oak_planks'),
            // Roof
            ...generateFloor(7, 7, 4, 'oak_planks'),
        ]
    },
    tower: {
        id: 'blueprint_tower',
        name: 'Watchtower',
        icon: '🗼',
        size: { width: 5, depth: 5, height: 12 },
        materials: {
            'cobblestone': 120,
            'oak_planks': 30,
            'ladder': 10,
            'torch': 6
        },
        blocks: []
    },
    farm: {
        id: 'blueprint_farm',
        name: 'Farm Plot',
        icon: '🌾',
        size: { width: 10, depth: 10, height: 2 },
        materials: {
            'fence': 36,
            'farmland': 64,
            'water_bucket': 4
        },
        blocks: []
    },
    storage: {
        id: 'blueprint_storage',
        name: 'Storage Shed',
        icon: '📦',
        size: { width: 6, depth: 8, height: 4 },
        materials: {
            'oak_planks': 60,
            'chest': 6,
            'door': 1
        },
        blocks: []
    },
    wall_section: {
        id: 'blueprint_wall',
        name: 'Wall Section',
        icon: '🧱',
        size: { width: 5, depth: 1, height: 4 },
        materials: {
            'cobblestone': 20
        },
        blocks: []
    }
};

// Helper to generate floor blocks
function generateFloor(width, depth, z, blockType) {
    const blocks = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < depth; y++) {
            blocks.push({ x, y, z, type: blockType });
        }
    }
    return blocks;
}

// Helper to generate walls
function generateWalls(width, depth, height, blockType) {
    const blocks = [];
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            blocks.push({ x, y: 0, z, type: blockType });
            blocks.push({ x, y: depth - 1, z, type: blockType });
        }
        for (let y = 1; y < depth - 1; y++) {
            blocks.push({ x: 0, y, z, type: blockType });
            blocks.push({ x: width - 1, y, z, type: blockType });
        }
    }
    return blocks;
}

export class BlueprintSystem {
    constructor(game) {
        this.game = game;
        
        // Player's unlocked blueprints
        this.unlockedBlueprints = new Set(['blueprint_house', 'blueprint_wall']);
        
        // Custom blueprints created by player
        this.customBlueprints = new Map();
        
        // Currently selected blueprint for placement
        this.selectedBlueprint = null;
        this.previewPosition = null;
        this.previewRotation = 0;
        
        // Building in progress
        this.activeBuilds = new Map();
    }
    
    // Unlock a blueprint
    unlockBlueprint(blueprintId) {
        this.unlockedBlueprints.add(blueprintId);
        
        const template = BLUEPRINT_TEMPLATES[blueprintId.replace('blueprint_', '')];
        if (template) {
            this.game.ui?.showNotification?.(
                `📐 Unlocked blueprint: ${template.name}!`,
                'success'
            );
        }
    }
    
    // Check if blueprint is unlocked
    isUnlocked(blueprintId) {
        return this.unlockedBlueprints.has(blueprintId);
    }
    
    // Get all available blueprints
    getAvailableBlueprints() {
        const available = [];
        
        for (const [key, template] of Object.entries(BLUEPRINT_TEMPLATES)) {
            if (this.isUnlocked(template.id)) {
                available.push({
                    ...template,
                    canBuild: this.canBuild(template.id)
                });
            }
        }
        
        // Add custom blueprints
        for (const [id, blueprint] of this.customBlueprints) {
            available.push({
                ...blueprint,
                canBuild: this.canBuild(id)
            });
        }
        
        return available;
    }
    
    // Check if player has materials to build
    canBuild(blueprintId) {
        const template = this.getBlueprint(blueprintId);
        if (!template) return false;
        
        const player = this.game.player;
        if (!player) return false;
        
        for (const [material, amount] of Object.entries(template.materials)) {
            if (!player.hasItem?.(material, amount)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get blueprint by ID
    getBlueprint(blueprintId) {
        // Check templates
        const templateKey = blueprintId.replace('blueprint_', '');
        if (BLUEPRINT_TEMPLATES[templateKey]) {
            return BLUEPRINT_TEMPLATES[templateKey];
        }
        
        // Check custom
        return this.customBlueprints.get(blueprintId);
    }
    
    // Get missing materials
    getMissingMaterials(blueprintId) {
        const template = this.getBlueprint(blueprintId);
        if (!template) return [];
        
        const player = this.game.player;
        if (!player) return Object.entries(template.materials);
        
        const missing = [];
        for (const [material, amount] of Object.entries(template.materials)) {
            const has = player.countItem?.(material) || 0;
            if (has < amount) {
                missing.push({ material, needed: amount, has });
            }
        }
        
        return missing;
    }
    
    // Select blueprint for placement
    selectBlueprint(blueprintId) {
        const template = this.getBlueprint(blueprintId);
        if (!template) {
            this.selectedBlueprint = null;
            return false;
        }
        
        this.selectedBlueprint = template;
        this.previewRotation = 0;
        
        this.game.ui?.showMessage?.(
            `📐 Selected: ${template.name}. Click to place, R to rotate.`,
            3000
        );
        
        return true;
    }
    
    // Cancel blueprint placement
    cancelPlacement() {
        this.selectedBlueprint = null;
        this.previewPosition = null;
    }
    
    // Rotate preview
    rotatePreview() {
        this.previewRotation = (this.previewRotation + 90) % 360;
    }
    
    // Update preview position based on mouse/cursor
    updatePreview(worldX, worldY, worldZ) {
        if (!this.selectedBlueprint) return;
        
        this.previewPosition = {
            x: Math.floor(worldX),
            y: Math.floor(worldY),
            z: Math.floor(worldZ)
        };
    }
    
    // Check if position is valid for placement
    canPlaceAt(x, y, z) {
        if (!this.selectedBlueprint) return false;
        
        const size = this.selectedBlueprint.size;
        
        // Check for obstructions
        for (let dx = 0; dx < size.width; dx++) {
            for (let dy = 0; dy < size.depth; dy++) {
                for (let dz = 0; dz < size.height; dz++) {
                    const block = this.game.world?.getBlock?.(x + dx, y + dy, z + dz);
                    if (block && block !== 'air') {
                        return false;
                    }
                }
            }
        }
        
        // Check for solid ground
        for (let dx = 0; dx < size.width; dx++) {
            for (let dy = 0; dy < size.depth; dy++) {
                const groundBlock = this.game.world?.getBlock?.(x + dx, y + dy, z - 1);
                if (!groundBlock || groundBlock === 'air') {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Place blueprint (start building)
    placeBlueprint() {
        if (!this.selectedBlueprint || !this.previewPosition) return false;
        
        const pos = this.previewPosition;
        
        if (!this.canPlaceAt(pos.x, pos.y, pos.z)) {
            this.game.ui?.showNotification?.('Cannot place here!', 'warning');
            return false;
        }
        
        if (!this.canBuild(this.selectedBlueprint.id)) {
            const missing = this.getMissingMaterials(this.selectedBlueprint.id);
            const missingStr = missing.map(m => `${m.material}: ${m.has}/${m.needed}`).join(', ');
            this.game.ui?.showNotification?.(`Missing materials: ${missingStr}`, 'warning');
            return false;
        }
        
        // Consume materials
        const player = this.game.player;
        for (const [material, amount] of Object.entries(this.selectedBlueprint.materials)) {
            player.removeItem?.(material, amount);
        }
        
        // Create active build
        const build = {
            id: `build_${Date.now()}`,
            blueprint: this.selectedBlueprint,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            rotation: this.previewRotation,
            progress: 0,
            blocksPlaced: 0,
            totalBlocks: this.selectedBlueprint.blocks.length || 
                         (this.selectedBlueprint.size.width * 
                          this.selectedBlueprint.size.depth * 
                          this.selectedBlueprint.size.height * 0.3) // Estimate
        };
        
        this.activeBuilds.set(build.id, build);
        
        // Start placing blocks
        this.buildStructure(build);
        
        this.game.ui?.showNotification?.(
            `🏗️ Building ${this.selectedBlueprint.name}!`,
            'success'
        );
        
        this.cancelPlacement();
        return true;
    }
    
    // Build structure blocks
    buildStructure(build) {
        const blueprint = build.blueprint;
        
        if (blueprint.blocks && blueprint.blocks.length > 0) {
            // Use predefined blocks
            for (const block of blueprint.blocks) {
                const rotated = this.rotateBlock(block, build.rotation, blueprint.size);
                this.game.world?.setBlock?.(
                    build.x + rotated.x,
                    build.y + rotated.y,
                    build.z + rotated.z,
                    block.type
                );
            }
        } else {
            // Generate simple structure
            this.generateSimpleStructure(build);
        }
        
        build.progress = 1;
        
        // Particles
        this.game.particles?.spawn?.(
            build.x + blueprint.size.width / 2,
            build.y + blueprint.size.depth / 2,
            build.z + blueprint.size.height / 2,
            {
                type: 'dust',
                count: 20,
                color: '#D2B48C'
            }
        );
        
        // Achievement
        this.game.achievements?.checkProgress?.('structures_built', 1);
    }
    
    // Generate simple structure for blueprints without block data
    generateSimpleStructure(build) {
        const size = build.blueprint.size;
        const blockType = 'oak_planks';
        
        // Floor
        for (let x = 0; x < size.width; x++) {
            for (let y = 0; y < size.depth; y++) {
                this.game.world?.setBlock?.(build.x + x, build.y + y, build.z, blockType);
            }
        }
        
        // Walls (hollow)
        for (let z = 1; z < size.height - 1; z++) {
            for (let x = 0; x < size.width; x++) {
                this.game.world?.setBlock?.(build.x + x, build.y, build.z + z, blockType);
                this.game.world?.setBlock?.(build.x + x, build.y + size.depth - 1, build.z + z, blockType);
            }
            for (let y = 1; y < size.depth - 1; y++) {
                this.game.world?.setBlock?.(build.x, build.y + y, build.z + z, blockType);
                this.game.world?.setBlock?.(build.x + size.width - 1, build.y + y, build.z + z, blockType);
            }
        }
        
        // Roof
        for (let x = 0; x < size.width; x++) {
            for (let y = 0; y < size.depth; y++) {
                this.game.world?.setBlock?.(build.x + x, build.y + y, build.z + size.height - 1, blockType);
            }
        }
    }
    
    // Rotate a block position
    rotateBlock(block, rotation, size) {
        let { x, y, z } = block;
        
        switch (rotation) {
            case 90:
                return { x: size.depth - 1 - y, y: x, z };
            case 180:
                return { x: size.width - 1 - x, y: size.depth - 1 - y, z };
            case 270:
                return { x: y, y: size.width - 1 - x, z };
            default:
                return { x, y, z };
        }
    }
    
    // Create custom blueprint from selection
    createCustomBlueprint(name, startPos, endPos) {
        const minX = Math.min(startPos.x, endPos.x);
        const minY = Math.min(startPos.y, endPos.y);
        const minZ = Math.min(startPos.z, endPos.z);
        const maxX = Math.max(startPos.x, endPos.x);
        const maxY = Math.max(startPos.y, endPos.y);
        const maxZ = Math.max(startPos.z, endPos.z);
        
        const blocks = [];
        const materials = {};
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.game.world?.getBlock?.(x, y, z);
                    if (block && block !== 'air') {
                        blocks.push({
                            x: x - minX,
                            y: y - minY,
                            z: z - minZ,
                            type: block
                        });
                        materials[block] = (materials[block] || 0) + 1;
                    }
                }
            }
        }
        
        const blueprint = {
            id: `custom_${Date.now()}`,
            name: name,
            icon: '📐',
            size: {
                width: maxX - minX + 1,
                depth: maxY - minY + 1,
                height: maxZ - minZ + 1
            },
            materials,
            blocks,
            isCustom: true
        };
        
        this.customBlueprints.set(blueprint.id, blueprint);
        this.unlockedBlueprints.add(blueprint.id);
        
        this.game.ui?.showNotification?.(
            `📐 Created blueprint: ${name}!`,
            'success'
        );
        
        return blueprint;
    }
    
    // Render blueprint preview
    render(ctx, camera) {
        if (!this.selectedBlueprint || !this.previewPosition) return;
        
        const pos = this.previewPosition;
        const size = this.selectedBlueprint.size;
        const canPlace = this.canPlaceAt(pos.x, pos.y, pos.z);
        
        // Draw preview outline
        const corners = [
            { x: pos.x, y: pos.y, z: pos.z },
            { x: pos.x + size.width, y: pos.y, z: pos.z },
            { x: pos.x + size.width, y: pos.y + size.depth, z: pos.z },
            { x: pos.x, y: pos.y + size.depth, z: pos.z },
        ];
        
        ctx.save();
        ctx.strokeStyle = canPlace ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        for (let i = 0; i < corners.length; i++) {
            const screen = camera.worldToScreen(corners[i].x, corners[i].y, corners[i].z);
            if (i === 0) {
                ctx.moveTo(screen.x, screen.y);
            } else {
                ctx.lineTo(screen.x, screen.y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw height indicator
        const topCorner = camera.worldToScreen(pos.x, pos.y, pos.z + size.height);
        const bottomCorner = camera.worldToScreen(pos.x, pos.y, pos.z);
        
        ctx.beginPath();
        ctx.moveTo(bottomCorner.x, bottomCorner.y);
        ctx.lineTo(topCorner.x, topCorner.y);
        ctx.stroke();
        
        // Draw blueprint name
        const centerScreen = camera.worldToScreen(
            pos.x + size.width / 2,
            pos.y + size.depth / 2,
            pos.z + size.height
        );
        
        ctx.setLineDash([]);
        ctx.font = '14px Arial';
        ctx.fillStyle = canPlace ? '#00FF00' : '#FF0000';
        ctx.textAlign = 'center';
        ctx.fillText(this.selectedBlueprint.name, centerScreen.x, centerScreen.y - 10);
        
        ctx.restore();
    }
    
    update(deltaTime) {
        // Update active builds (for animated building)
        for (const [id, build] of this.activeBuilds) {
            if (build.progress >= 1) {
                this.activeBuilds.delete(id);
            }
        }
    }
    
    // Serialize for saving
    serialize() {
        return {
            unlockedBlueprints: Array.from(this.unlockedBlueprints),
            customBlueprints: Array.from(this.customBlueprints.entries()),
            activeBuilds: Array.from(this.activeBuilds.entries())
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.unlockedBlueprints) {
            this.unlockedBlueprints = new Set(data.unlockedBlueprints);
        }
        if (data?.customBlueprints) {
            this.customBlueprints = new Map(data.customBlueprints);
        }
        if (data?.activeBuilds) {
            this.activeBuilds = new Map(data.activeBuilds);
        }
    }
    
    // Reset
    reset() {
        this.unlockedBlueprints = new Set(['blueprint_house', 'blueprint_wall']);
        this.customBlueprints.clear();
        this.activeBuilds.clear();
        this.selectedBlueprint = null;
        this.previewPosition = null;
    }
}
