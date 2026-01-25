// Farming System - Plant and grow crops over time
import { CONFIG } from '../config.js';

export const CROP_TYPES = {
    WHEAT: {
        id: 'wheat',
        name: 'Wheat',
        seedItem: 'wheat_seeds',
        harvestItem: 'wheat',
        harvestQuantity: [2, 4],
        bonusSeedChance: 0.5,
        growthTime: 120, // seconds
        stages: 4,
        emoji: '🌾',
        preferredBiome: 'plains'
    },
    CORN: {
        id: 'corn',
        name: 'Corn',
        seedItem: 'corn_seeds',
        harvestItem: 'corn',
        harvestQuantity: [1, 3],
        bonusSeedChance: 0.3,
        growthTime: 150,
        stages: 5,
        emoji: '🌽',
        preferredBiome: 'plains'
    },
    CARROT: {
        id: 'carrot',
        name: 'Carrot',
        seedItem: 'carrot_seeds',
        harvestItem: 'carrot',
        harvestQuantity: [2, 5],
        bonusSeedChance: 0.4,
        growthTime: 90,
        stages: 3,
        emoji: '🥕',
        preferredBiome: 'forest'
    },
    BERRY_BUSH: {
        id: 'berry_bush',
        name: 'Berry Bush',
        seedItem: 'berry_seeds',
        harvestItem: 'berries',
        harvestQuantity: [3, 6],
        bonusSeedChance: 0.2,
        growthTime: 60,
        stages: 3,
        emoji: '🫐',
        preferredBiome: 'forest',
        regrows: true,
        regrowTime: 45
    },
    FLAX: {
        id: 'flax',
        name: 'Flax',
        seedItem: 'flax_seeds',
        harvestItem: 'fiber',
        harvestQuantity: [2, 4],
        bonusSeedChance: 0.6,
        growthTime: 80,
        stages: 4,
        emoji: '🌿',
        preferredBiome: 'plains'
    },
    MELON: {
        id: 'melon',
        name: 'Melon',
        seedItem: 'melon_seeds',
        harvestItem: 'melon_slice',
        harvestQuantity: [2, 4],
        bonusSeedChance: 0.3,
        growthTime: 180,
        stages: 5,
        emoji: '🍈',
        preferredBiome: 'jungle'
    }
};

export const GROWTH_STAGE_EMOJIS = ['🌱', '🌿', '🪴', '🌾', '🌻'];

class FarmPlot {
    constructor(x, y, z, cropType = null) {
        this.id = `plot_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.x = x;
        this.y = y;
        this.z = z;
        
        this.cropType = cropType;
        this.growthProgress = 0;
        this.currentStage = 0;
        this.isWatered = false;
        this.waterTimer = 0;
        
        this.plantedAt = cropType ? Date.now() : null;
        this.harvestedOnce = false; // For regrowing crops
    }
    
    get crop() {
        return this.cropType ? CROP_TYPES[this.cropType.toUpperCase()] : null;
    }
    
    get isReadyToHarvest() {
        const crop = this.crop;
        if (!crop) return false;
        return this.currentStage >= crop.stages - 1;
    }
    
    get isEmpty() {
        return this.cropType === null;
    }
    
    // Plant a crop
    plant(cropTypeId) {
        const cropKey = cropTypeId.toUpperCase();
        if (!CROP_TYPES[cropKey]) return false;
        
        this.cropType = cropKey;
        this.growthProgress = 0;
        this.currentStage = 0;
        this.plantedAt = Date.now();
        this.harvestedOnce = false;
        
        return true;
    }
    
    // Water the plot
    water() {
        this.isWatered = true;
        this.waterTimer = 60; // Water lasts 60 seconds
    }
    
    // Update growth
    update(deltaTime, biome = null) {
        // Update water timer
        if (this.isWatered) {
            this.waterTimer -= deltaTime;
            if (this.waterTimer <= 0) {
                this.isWatered = false;
            }
        }
        
        if (!this.crop || this.isReadyToHarvest) return;
        
        // Calculate growth rate
        let growthRate = 1.0;
        
        // Watering bonus
        if (this.isWatered) {
            growthRate *= 1.5;
        }
        
        // Biome bonus
        if (biome && this.crop.preferredBiome === biome) {
            growthRate *= 1.25;
        }
        
        // Progress growth
        const growthPerSecond = 1 / this.crop.growthTime;
        this.growthProgress += growthPerSecond * deltaTime * growthRate;
        
        // Update stage
        const stageProgress = this.growthProgress * this.crop.stages;
        this.currentStage = Math.min(
            Math.floor(stageProgress),
            this.crop.stages - 1
        );
    }
    
    // Harvest the crop
    harvest() {
        if (!this.isReadyToHarvest) return null;
        
        const crop = this.crop;
        const [minYield, maxYield] = crop.harvestQuantity;
        const quantity = Math.floor(Math.random() * (maxYield - minYield + 1)) + minYield;
        
        const result = {
            item: crop.harvestItem,
            quantity: quantity,
            bonusSeeds: Math.random() < crop.bonusSeedChance ? 1 : 0,
            seedItem: crop.seedItem
        };
        
        // Check if crop regrows
        if (crop.regrows && !this.harvestedOnce) {
            this.harvestedOnce = true;
            this.growthProgress = 0;
            this.currentStage = 0;
            // Regrow faster
            const originalGrowthTime = crop.growthTime;
            // Will regrow in regrowTime instead
        } else {
            // Clear the plot
            this.cropType = null;
            this.growthProgress = 0;
            this.currentStage = 0;
            this.plantedAt = null;
            this.harvestedOnce = false;
        }
        
        return result;
    }
    
    // Get display emoji based on growth stage
    getEmoji() {
        if (this.isEmpty) return '⬜'; // Empty plot
        
        const crop = this.crop;
        if (this.isReadyToHarvest) {
            return crop.emoji;
        }
        
        return GROWTH_STAGE_EMOJIS[Math.min(this.currentStage, GROWTH_STAGE_EMOJIS.length - 1)];
    }
    
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            z: this.z,
            cropType: this.cropType,
            growthProgress: this.growthProgress,
            currentStage: this.currentStage,
            isWatered: this.isWatered,
            waterTimer: this.waterTimer,
            plantedAt: this.plantedAt,
            harvestedOnce: this.harvestedOnce
        };
    }
    
    static deserialize(data) {
        const plot = new FarmPlot(data.x, data.y, data.z, data.cropType);
        plot.id = data.id;
        plot.growthProgress = data.growthProgress || 0;
        plot.currentStage = data.currentStage || 0;
        plot.isWatered = data.isWatered || false;
        plot.waterTimer = data.waterTimer || 0;
        plot.plantedAt = data.plantedAt;
        plot.harvestedOnce = data.harvestedOnce || false;
        return plot;
    }
}

export class FarmingSystem {
    constructor(game) {
        this.game = game;
        
        // All farm plots
        this.plots = new Map();
        
        // Automation structures
        this.sprinklers = new Map();
        this.autoHarvesters = new Map();
        
        // Interaction range
        this.interactionRange = 2;
    }
    
    update(deltaTime) {
        // Update all plots
        for (const plot of this.plots.values()) {
            const biome = this.game.world?.getBiomeAt?.(plot.x, plot.y);
            plot.update(deltaTime, biome);
        }
        
        // Update sprinklers
        this.updateSprinklers(deltaTime);
        
        // Update auto-harvesters
        this.updateAutoHarvesters(deltaTime);
    }
    
    // Update sprinkler systems
    updateSprinklers(deltaTime) {
        for (const [id, sprinkler] of this.sprinklers) {
            sprinkler.timer = (sprinkler.timer || 0) + deltaTime;
            
            // Sprinkler activates every 30 seconds
            if (sprinkler.timer >= 30) {
                sprinkler.timer = 0;
                
                // Water all plots in range
                const range = sprinkler.range || 5;
                for (const plot of this.plots.values()) {
                    const dx = plot.x - sprinkler.x;
                    const dy = plot.y - sprinkler.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist <= range) {
                        plot.water();
                    }
                }
                
                // Visual effect
                this.game.particles?.spawn?.(sprinkler.x, sprinkler.y, sprinkler.z, {
                    type: 'water',
                    count: 15,
                    color: '#4169E1',
                    spread: range
                });
            }
        }
    }
    
    // Update auto-harvester systems
    updateAutoHarvesters(deltaTime) {
        for (const [id, harvester] of this.autoHarvesters) {
            harvester.timer = (harvester.timer || 0) + deltaTime;
            
            // Harvester checks every 10 seconds
            if (harvester.timer >= 10) {
                harvester.timer = 0;
                
                // Check for ripe crops in range
                const range = harvester.range || 4;
                for (const plot of this.plots.values()) {
                    const dx = plot.x - harvester.x;
                    const dy = plot.y - harvester.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist <= range && plot.isReadyToHarvest) {
                        const result = plot.harvest();
                        if (result) {
                            // Store in connected storage or player inventory
                            this.storeHarvestedItems(harvester, result);
                        }
                    }
                }
            }
        }
    }
    
    // Store items from auto-harvester
    storeHarvestedItems(harvester, result) {
        // Try to find nearby storage
        const nearbyStorage = this.game.storage?.getNearestStorage?.(harvester.x, harvester.y);
        
        if (nearbyStorage) {
            this.game.storage?.addToStorage?.(nearbyStorage.id, result.item, result.quantity);
            if (result.bonusSeeds > 0) {
                this.game.storage?.addToStorage?.(nearbyStorage.id, result.seedItem, result.bonusSeeds);
            }
        } else {
            // Add directly to player inventory
            this.game.player?.addItem?.(result.item, result.quantity);
            if (result.bonusSeeds > 0) {
                this.game.player?.addItem?.(result.seedItem, result.bonusSeeds);
            }
        }
    }
    
    // Place a sprinkler
    placeSprinkler(x, y, z, tier = 'basic') {
        const ranges = {
            'basic': 3,
            'advanced': 5,
            'industrial': 8
        };
        
        const sprinkler = {
            id: `sprinkler_${Date.now()}`,
            x, y, z,
            tier,
            range: ranges[tier] || 3,
            timer: 0
        };
        
        this.sprinklers.set(sprinkler.id, sprinkler);
        this.game.ui?.showNotification?.('💧 Sprinkler placed!', 'success');
        return sprinkler;
    }
    
    // Place an auto-harvester
    placeAutoHarvester(x, y, z, tier = 'basic') {
        const ranges = {
            'basic': 2,
            'advanced': 4,
            'industrial': 6
        };
        
        const harvester = {
            id: `harvester_${Date.now()}`,
            x, y, z,
            tier,
            range: ranges[tier] || 2,
            timer: 0
        };
        
        this.autoHarvesters.set(harvester.id, harvester);
        this.game.ui?.showNotification?.('🤖 Auto-Harvester placed!', 'success');
        return harvester;
    }
    
    // Remove sprinkler
    removeSprinkler(sprinklerId) {
        this.sprinklers.delete(sprinklerId);
    }
    
    // Remove auto-harvester
    removeAutoHarvester(harvesterId) {
        this.autoHarvesters.delete(harvesterId);
    }
    
    // Get sprinkler at position
    getSprinklerAt(x, y, z) {
        for (const sprinkler of this.sprinklers.values()) {
            const dx = Math.abs(sprinkler.x - x);
            const dy = Math.abs(sprinkler.y - y);
            if (dx < 1 && dy < 1) {
                return sprinkler;
            }
        }
        return null;
    }
    
    // Get harvester at position
    getHarvesterAt(x, y, z) {
        for (const harvester of this.autoHarvesters.values()) {
            const dx = Math.abs(harvester.x - x);
            const dy = Math.abs(harvester.y - y);
            if (dx < 1 && dy < 1) {
                return harvester;
            }
        }
        return null;
    }
    
    // Create a farm plot
    createPlot(x, y, z) {
        // Check if plot already exists
        const existing = this.getPlotAt(x, y, z);
        if (existing) return existing;
        
        const plot = new FarmPlot(x, y, z);
        this.plots.set(plot.id, plot);
        
        this.game.ui?.showMessage('🌱 Created farm plot', 2000);
        
        return plot;
    }
    
    // Remove a plot
    removePlot(plotId) {
        this.plots.delete(plotId);
    }
    
    // Get plot at position
    getPlotAt(x, y, z) {
        for (const plot of this.plots.values()) {
            const dx = Math.abs(plot.x - x);
            const dy = Math.abs(plot.y - y);
            const dz = Math.abs(plot.z - z);
            if (dx < 1 && dy < 1 && dz < 1) {
                return plot;
            }
        }
        return null;
    }
    
    // Get nearby plots
    getNearbyPlots() {
        const player = this.game.player;
        if (!player) return [];
        
        const nearby = [];
        for (const plot of this.plots.values()) {
            const dx = player.x - plot.x;
            const dy = player.y - plot.y;
            const dz = player.z - plot.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist <= this.interactionRange) {
                nearby.push({ plot, distance: dist });
            }
        }
        
        return nearby.sort((a, b) => a.distance - b.distance).map(n => n.plot);
    }
    
    // Plant seeds at location
    plantAt(x, y, z, seedItem) {
        // Find crop type by seed item
        let cropTypeKey = null;
        for (const [key, crop] of Object.entries(CROP_TYPES)) {
            if (crop.seedItem === seedItem) {
                cropTypeKey = key;
                break;
            }
        }
        
        if (!cropTypeKey) {
            this.game.ui?.showMessage('❌ Not a valid seed', 2000);
            return false;
        }
        
        // Get or create plot
        let plot = this.getPlotAt(x, y, z);
        if (!plot) {
            plot = this.createPlot(x, y, z);
        }
        
        if (!plot.isEmpty) {
            this.game.ui?.showMessage('❌ Plot already has a crop', 2000);
            return false;
        }
        
        if (plot.plant(cropTypeKey)) {
            const crop = CROP_TYPES[cropTypeKey];
            this.game.ui?.showMessage(`${crop.emoji} Planted ${crop.name}`, 2000);
            return true;
        }
        
        return false;
    }
    
    // Water plot at location
    waterAt(x, y, z) {
        const plot = this.getPlotAt(x, y, z);
        if (!plot) {
            this.game.ui?.showMessage('❌ No plot here', 2000);
            return false;
        }
        
        if (plot.isEmpty) {
            this.game.ui?.showMessage('❌ Plot is empty', 2000);
            return false;
        }
        
        plot.water();
        this.game.ui?.showMessage('💧 Watered crop', 2000);
        return true;
    }
    
    // Harvest plot at location
    harvestAt(x, y, z) {
        const plot = this.getPlotAt(x, y, z);
        if (!plot) return null;
        
        if (!plot.isReadyToHarvest) {
            const progress = Math.floor(plot.growthProgress * 100);
            this.game.ui?.showMessage(`🌱 Growing... ${progress}%`, 2000);
            return null;
        }
        
        const result = plot.harvest();
        if (result) {
            // Add items to inventory
            this.game.inventory?.addItem(result.item, result.quantity);
            if (result.bonusSeeds > 0) {
                this.game.inventory?.addItem(result.seedItem, result.bonusSeeds);
            }
            
            const crop = CROP_TYPES[plot.cropType?.toUpperCase() || 'WHEAT'];
            this.game.ui?.showMessage(
                `${crop?.emoji || '🌾'} Harvested ${result.quantity}x ${result.item}!`,
                2000
            );
        }
        
        return result;
    }
    
    // Interact with nearest plot
    interactWithNearestPlot(action = 'harvest') {
        const nearby = this.getNearbyPlots();
        if (nearby.length === 0) return false;
        
        const plot = nearby[0];
        
        switch (action) {
            case 'harvest':
                return this.harvestAt(plot.x, plot.y, plot.z);
            case 'water':
                return this.waterAt(plot.x, plot.y, plot.z);
            default:
                return false;
        }
    }
    
    // Get all plots summary for UI
    getPlotsSummary() {
        const summary = {
            total: this.plots.size,
            empty: 0,
            growing: 0,
            ready: 0,
            crops: {}
        };
        
        for (const plot of this.plots.values()) {
            if (plot.isEmpty) {
                summary.empty++;
            } else if (plot.isReadyToHarvest) {
                summary.ready++;
            } else {
                summary.growing++;
            }
            
            if (plot.cropType) {
                const crop = CROP_TYPES[plot.cropType];
                if (crop) {
                    summary.crops[crop.name] = (summary.crops[crop.name] || 0) + 1;
                }
            }
        }
        
        return summary;
    }
    
    // Render farm plots
    render(ctx, camera) {
        for (const plot of this.plots.values()) {
            const screenPos = camera.worldToScreen(plot.x, plot.y, plot.z);
            
            // Draw plot background
            ctx.fillStyle = plot.isWatered ? '#654321' : '#8B4513';
            ctx.fillRect(screenPos.x - 16, screenPos.y - 8, 32, 16);
            
            // Draw crop emoji
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(plot.getEmoji(), screenPos.x, screenPos.y - 10);
            
            // Draw water indicator
            if (plot.isWatered) {
                ctx.font = '10px Arial';
                ctx.fillText('💧', screenPos.x + 12, screenPos.y);
            }
            
            // Draw growth progress bar if growing
            if (!plot.isEmpty && !plot.isReadyToHarvest) {
                const barWidth = 24;
                const barHeight = 4;
                const progress = plot.growthProgress;
                
                ctx.fillStyle = '#333';
                ctx.fillRect(screenPos.x - barWidth/2, screenPos.y + 5, barWidth, barHeight);
                
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(screenPos.x - barWidth/2, screenPos.y + 5, barWidth * progress, barHeight);
            }
        }
    }
    
    // Serialize for save
    serialize() {
        return {
            plots: Array.from(this.plots.values()).map(p => p.serialize()),
            sprinklers: Array.from(this.sprinklers.values()),
            autoHarvesters: Array.from(this.autoHarvesters.values())
        };
    }
    
    deserialize(data) {
        if (data?.plots) {
            this.plots.clear();
            for (const plotData of data.plots) {
                const plot = FarmPlot.deserialize(plotData);
                this.plots.set(plot.id, plot);
            }
        }
        
        if (data?.sprinklers) {
            this.sprinklers.clear();
            for (const s of data.sprinklers) {
                this.sprinklers.set(s.id, s);
            }
        }
        
        if (data?.autoHarvesters) {
            this.autoHarvesters.clear();
            for (const h of data.autoHarvesters) {
                this.autoHarvesters.set(h.id, h);
            }
        }
    }
    
    reset() {
        this.plots.clear();
        this.sprinklers.clear();
        this.autoHarvesters.clear();
    }
}

// Farm items for config
export const FARMING_ITEMS = {
    wheat_seeds: {
        name: 'Wheat Seeds',
        type: 'seed',
        emoji: '🌾',
        stackSize: 99,
        description: 'Plant to grow wheat.'
    },
    corn_seeds: {
        name: 'Corn Seeds',
        type: 'seed',
        emoji: '🌽',
        stackSize: 99,
        description: 'Plant to grow corn.'
    },
    carrot_seeds: {
        name: 'Carrot Seeds',
        type: 'seed',
        emoji: '🥕',
        stackSize: 99,
        description: 'Plant to grow carrots.'
    },
    berry_seeds: {
        name: 'Berry Seeds',
        type: 'seed',
        emoji: '🫐',
        stackSize: 99,
        description: 'Plant to grow berry bushes.'
    },
    flax_seeds: {
        name: 'Flax Seeds',
        type: 'seed',
        emoji: '🌿',
        stackSize: 99,
        description: 'Plant to grow flax for fiber.'
    },
    melon_seeds: {
        name: 'Melon Seeds',
        type: 'seed',
        emoji: '🍈',
        stackSize: 99,
        description: 'Plant to grow melons.'
    },
    hoe: {
        name: 'Hoe',
        type: 'tool',
        emoji: '🪓',
        stackSize: 1,
        durability: 100,
        description: 'Used to create farm plots.'
    },
    watering_can: {
        name: 'Watering Can',
        type: 'tool',
        emoji: '🚿',
        stackSize: 1,
        description: 'Water crops to speed growth.'
    }
};
