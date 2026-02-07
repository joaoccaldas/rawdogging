// Multi-Part Crafting System - Kilns and Smelters require multiple connected blocks
import { CONFIG, BLOCKS, ITEMS, BLOCK_DATA } from '../config.js';

// Multi-part station definitions
export const MULTIPART_STATIONS = {
    KILN: {
        id: 'kiln',
        name: 'Tribal Kiln',
        description: 'Fire pottery, bake clay, and cook food at high temperatures',
        requiredBlocks: ['kiln_base', 'kiln_chamber', 'kiln_chimney'],
        fuelTypes: ['wood', 'coal', 'stick'],
        recipes: [
            { input: 'clay_ball', output: 'brick', fuel: 'wood', time: 5000 },
            { input: 'raw_meat', output: 'cooked_meat', fuel: 'wood', time: 3000 },
            { input: 'wet_clay_pot', output: 'clay_pot', fuel: 'coal', time: 8000 },
            { input: 'bone', output: 'bone_meal', fuel: 'stick', time: 2000 }
        ],
        structure: [
            { x: 0, y: 0, z: 0, block: 'kiln_base' },      // Foundation
            { x: 0, y: 0, z: 1, block: 'kiln_chamber' },   // Main chamber
            { x: 0, y: 0, z: 2, block: 'kiln_chimney' }    // Smoke stack
        ],
        range: 4
    },
    
    SMELTERY: {
        id: 'smeltery',
        name: 'Bronze Age Smeltery',
        description: 'Advanced multi-block furnace for alloy production',
        requiredBlocks: ['smeltery_basin', 'smeltery_controller', 'smeltery_drain', 'firing_chamber'],
        fuelTypes: ['coal', 'charcoal'],
        recipes: [
            { input: ['copper_ore', 'tin_ore'], output: 'bronze_ingot', fuel: 'coal', time: 10000 },
            { input: ['iron_ore', 'coal'], output: 'steel_ingot', fuel: 'coal', time: 12000 },
            { input: 'raw_iron', output: 'iron_ingot', fuel: 'coal', time: 6000 },
            { input: 'raw_copper', output: 'copper_ingot', fuel: 'coal', time: 5000 },
            { input: 'raw_gold', output: 'gold_ingot', fuel: 'coal', time: 8000 }
        ],
        structure: [
            { x: 0, y: 0, z: 0, block: 'smeltery_basin' },     // Foundation
            { x: 1, y: 0, z: 0, block: 'smeltery_controller' }, // Controller (interactive)
            { x: 0, y: 1, z: 0, block: 'smeltery_drain' },     // Drain
            { x: 0, y: 0, z: 1, block: 'firing_chamber' }      // Furnace core
        ],
        range: 5
    }
};

export class MultiPartCraftingSystem {
    constructor(game) {
        this.game = game;
        
        // Active multi-part stations in world
        this.activeStations = new Map(); // key: "x,y,z", value: station data
        
        // Current smelting/firing operations
        this.activeOperations = [];
        
        this.checkTimer = 0;
        this.operationTimer = 0;
    }
    
    update(deltaTime) {
        this.checkTimer += deltaTime;
        this.operationTimer += deltaTime;
        
        // Check for new structures every 2 seconds
        if (this.checkTimer >= 2000) {
            this.scanForStructures();
            this.checkTimer = 0;
        }
        
        // Update active operations every 100ms
        if (this.operationTimer >= 100) {
            this.updateOperations(this.operationTimer);
            this.operationTimer = 0;
        }
    }
    
    // Scan world for valid multi-part structures
    scanForStructures() {
        if (!this.game.player || !this.game.world) return;
        
        const player = this.game.player;
        const world = this.game.world;
        const scanRange = 16;
        
        const px = Math.floor(player.x);
        const py = Math.floor(player.y);
        const pz = Math.floor(player.z);
        
        // Clear old structures first
        this.activeStations.clear();
        
        // Scan for structure patterns
        for (let x = px - scanRange; x <= px + scanRange; x++) {
            for (let y = py - scanRange; y <= py + scanRange; y++) {
                for (let z = pz - 5; z <= pz + 5; z++) {
                    this.checkForStructureAt(world, x, y, z);
                }
            }
        }
    }
    
    // Check if a valid multi-part structure exists at position
    checkForStructureAt(world, x, y, z) {
        for (const [stationType, station] of Object.entries(MULTIPART_STATIONS)) {
            if (this.validateStructure(world, x, y, z, station)) {
                const key = `${x},${y},${z}`;
                this.activeStations.set(key, {
                    type: stationType,
                    station: station,
                    x, y, z,
                    fuel: 0,
                    isActive: false
                });
                break; // Only one station type per location
            }
        }
    }
    
    // Validate that all required blocks are in correct positions
    validateStructure(world, baseX, baseY, baseZ, station) {
        if (!station || !station.structure) return false;
        
        for (const part of station.structure) {
            const blockX = baseX + part.x;
            const blockY = baseY + part.y;
            const blockZ = baseZ + part.z;
            
            const actualBlock = world.getBlock(blockX, blockY, blockZ);
            const requiredBlockName = part.block.toUpperCase();
            const requiredBlockId = BLOCKS[requiredBlockName];
            
            // Debug logging for structure validation
            if (this.game.debugMode) {
                console.log(`Validating ${requiredBlockName} at (${blockX},${blockY},${blockZ}): expected ${requiredBlockId}, got ${actualBlock}`);
            }
            
            if (!requiredBlockId || actualBlock !== requiredBlockId) {
                return false;
            }
        }
        return true;
    }
    
    // Try to start an operation at a station
    startOperation(stationKey, recipe, fuelAmount) {
        const station = this.activeStations.get(stationKey);
        if (!station || station.isActive) return false;
        
        // Validate recipe
        const stationRecipe = station.station.recipes.find(r => 
            r.output === recipe.output && r.fuel === recipe.fuel
        );
        if (!stationRecipe) return false;
        
        // Check fuel availability
        if (fuelAmount < 1) return false;
        
        // Start operation
        station.isActive = true;
        station.fuel = fuelAmount;
        
        this.activeOperations.push({
            stationKey,
            recipe: stationRecipe,
            timeRemaining: stationRecipe.time,
            totalTime: stationRecipe.time
        });
        
        // Visual feedback
        if (this.game.particles) {
            this.game.particles.spawn('fire', station.x, station.y, station.z + 1, 5);
        }
        
        return true;
    }
    
    // Update all active operations
    updateOperations(deltaTime) {
        for (let i = this.activeOperations.length - 1; i >= 0; i--) {
            const operation = this.activeOperations[i];
            operation.timeRemaining -= deltaTime;
            
            // Complete operation
            if (operation.timeRemaining <= 0) {
                this.completeOperation(operation);
                this.activeOperations.splice(i, 1);
            }
            // Visual updates
            else {
                const station = this.activeStations.get(operation.stationKey);
                if (station && Math.random() < 0.1) {
                    // Particle effects during operation
                    if (this.game.particles) {
                        this.game.particles.spawn('smoke', station.x, station.y, station.z + 2, 2);
                    }
                }
            }
        }
    }
    
    // Complete an operation and produce output
    completeOperation(operation) {
        const station = this.activeStations.get(operation.stationKey);
        if (!station) return;
        
        station.isActive = false;
        station.fuel = Math.max(0, station.fuel - 1);
        
        // Spawn result item
        const recipe = operation.recipe;
        this.game.spawnItem(recipe.output, 1, station.x + 0.5, station.y + 0.5, station.z + 0.5);
        
        // Visual completion effects
        if (this.game.particles) {
            this.game.particles.spawn('magic', station.x, station.y, station.z + 1, 8);
        }
        if (this.game.audio) {
            this.game.audio.play('craft_complete');
        }
        
        // UI notification
        if (this.game.ui) {
            this.game.ui.showMessage(`${station.station.name} completed: ${recipe.output}`, 3000);
        }
    }
    
    // Get nearest station to player
    getNearestStation() {
        if (!this.game.player) return null;
        
        const player = this.game.player;
        let nearest = null;
        let minDist = Infinity;
        
        for (const [key, station] of this.activeStations.entries()) {
            const dist = Math.sqrt(
                Math.pow(player.x - station.x, 2) + 
                Math.pow(player.y - station.y, 2) + 
                Math.pow(player.z - station.z, 2)
            );
            
            if (dist <= station.station.range && dist < minDist) {
                minDist = dist;
                nearest = { key, ...station };
            }
        }
        
        return nearest;
    }
    
    // Check if player can interact with a station
    canInteract() {
        const station = this.getNearestStation();
        return station !== null;
    }
    
    // Get available recipes for nearest station
    getAvailableRecipes() {
        const station = this.getNearestStation();
        if (!station) return [];
        
        const player = this.game.player;
        const inventory = player.inventory;
        
        return station.station.recipes.filter(recipe => {
            // Check if player has ingredients
            if (Array.isArray(recipe.input)) {
                // Multiple ingredients (like copper + tin)
                return recipe.input.every(item => inventory.hasItem(item, 1));
            } else {
                // Single ingredient
                return inventory.hasItem(recipe.input, 1);
            }
        });
    }
    
    // Interact with station (open UI)
    interact() {
        const station = this.getNearestStation();
        if (!station) return false;
        
        // Open multi-part station UI
        if (this.game.ui) {
            this.game.ui.openMultiPartStationUI(station);
        }
        
        return true;
    }
    
    // Try to add fuel to a station
    addFuel(stationKey, fuelType, amount) {
        const station = this.activeStations.get(stationKey);
        if (!station) return false;
        
        // Check if fuel type is valid
        if (!station.station.fuelTypes.includes(fuelType)) return false;
        
        station.fuel += amount;
        return true;
    }
    
    // Get fuel level for station
    getFuelLevel(stationKey) {
        const station = this.activeStations.get(stationKey);
        return station ? station.fuel : 0;
    }
    
    // Check if station is currently operating
    isOperating(stationKey) {
        const station = this.activeStations.get(stationKey);
        return station ? station.isActive : false;
    }
    
    // Get list of all active stations for UI
    getActiveStations() {
        return Array.from(this.activeStations.values());
    }
    
    // Serialize for saving
    serialize() {
        return {
            activeStations: Array.from(this.activeStations.entries()),
            activeOperations: this.activeOperations
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.activeStations) {
            this.activeStations = new Map(data.activeStations);
        }
        if (data?.activeOperations) {
            this.activeOperations = data.activeOperations || [];
        }
    }
    
    reset() {
        this.activeStations.clear();
        this.activeOperations = [];
    }
}

// Helper function to get station requirements for UI
export function getStationRequirements(stationType) {
    const station = MULTIPART_STATIONS[stationType];
    if (!station) return null;
    
    return {
        name: station.name,
        description: station.description,
        blocks: station.requiredBlocks,
        structure: station.structure
    };
}