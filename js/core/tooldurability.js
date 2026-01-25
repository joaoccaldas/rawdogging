// Tool Durability & Repair System
// Adds durability management to tools and weapons

export class ToolDurabilitySystem {
    constructor(game) {
        this.game = game;
        
        // Durability configurations by tool type and material
        this.durabilityConfig = {
            wood: { baseDurability: 60, speedModifier: 1.0, repairMaterial: 'wood' },
            stone: { baseDurability: 132, speedModifier: 1.3, repairMaterial: 'stone' },
            copper: { baseDurability: 200, speedModifier: 1.5, repairMaterial: 'copper_ingot' },
            iron: { baseDurability: 250, speedModifier: 1.8, repairMaterial: 'iron_ingot' },
            gold: { baseDurability: 33, speedModifier: 2.5, repairMaterial: 'gold_ingot' },
            diamond: { baseDurability: 1561, speedModifier: 2.0, repairMaterial: 'diamond' },
            obsidian: { baseDurability: 2500, speedModifier: 2.2, repairMaterial: 'obsidian' }
        };
        
        // Tool types and their durability cost per action
        this.toolActions = {
            pickaxe: { mine: 1, attack: 2 },
            axe: { chop: 1, attack: 2 },
            shovel: { dig: 1, attack: 2 },
            sword: { attack: 1, mine: 2 },
            hoe: { till: 1 },
            fishing_rod: { cast: 1 },
            bow: { shoot: 1 },
            shield: { block: 1 }
        };
        
        // Repair recipes at anvil
        this.repairRecipes = new Map();
        
        // Warning thresholds
        this.warningThreshold = 0.15; // 15% durability warning
        this.criticalThreshold = 0.05; // 5% critical warning
    }
    
    // Initialize durability on a new tool
    initializeDurability(item) {
        if (!item) return item;
        
        const toolMaterial = this.getToolMaterial(item.id);
        const toolType = this.getToolType(item.id);
        
        if (!toolMaterial || !toolType) return item;
        
        const config = this.durabilityConfig[toolMaterial];
        if (!config) return item;
        
        // Add durability properties if not exist
        if (item.durability === undefined) {
            item.maxDurability = config.baseDurability;
            item.durability = config.baseDurability;
        }
        
        return item;
    }
    
    // Use tool and reduce durability
    useTool(item, action = 'attack') {
        if (!item || item.durability === undefined) return { success: true, broken: false };
        
        const toolType = this.getToolType(item.id);
        if (!toolType) return { success: true, broken: false };
        
        // Get durability cost
        const actions = this.toolActions[toolType];
        let cost = actions?.[action] || 1;
        
        // Apply enchantments
        if (item.enchantments?.includes('unbreaking')) {
            const level = this.getEnchantmentLevel(item, 'unbreaking');
            // Chance to not use durability
            if (Math.random() < (level / (level + 1))) {
                cost = 0;
            }
        }
        
        // Reduce durability
        item.durability = Math.max(0, item.durability - cost);
        
        // Check warnings
        this.checkDurabilityWarnings(item);
        
        // Check if broken
        if (item.durability <= 0) {
            return { success: true, broken: true, item };
        }
        
        return { success: true, broken: false, item };
    }
    
    // Check and show durability warnings
    checkDurabilityWarnings(item) {
        if (!item || !item.maxDurability) return;
        
        const ratio = item.durability / item.maxDurability;
        
        if (ratio <= this.criticalThreshold && ratio > 0) {
            this.showWarning(item, 'critical');
        } else if (ratio <= this.warningThreshold && ratio > this.criticalThreshold) {
            this.showWarning(item, 'low');
        }
    }
    
    showWarning(item, level) {
        if (!this.game.ui) return;
        
        const itemName = item.name || item.id;
        
        if (level === 'critical') {
            this.game.ui.showNotification?.(`⚠️ ${itemName} is about to break!`, 'danger');
        } else if (level === 'low') {
            this.game.ui.showNotification?.(`${itemName} durability is low`, 'warning');
        }
    }
    
    // Break tool and return broken state
    breakTool(item) {
        if (!item) return null;
        
        // Play break sound
        this.game.audio?.play('tool_break');
        
        // Show particles
        if (this.game.particles && this.game.player) {
            const player = this.game.player;
            for (let i = 0; i < 8; i++) {
                this.game.particles.emit({
                    x: player.x,
                    y: player.y,
                    z: player.z + 1,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    vz: Math.random() * 2,
                    color: '#666',
                    size: 4,
                    life: 0.5
                });
            }
        }
        
        // Show notification
        this.game.ui?.showNotification?.(`${item.name || item.id} broke!`, 'danger');
        
        return null; // Return null to remove from inventory
    }
    
    // Repair tool at anvil
    repairTool(item, repairMaterial, materialCount = 1) {
        if (!item || item.durability === undefined) {
            return { success: false, reason: 'Invalid item' };
        }
        
        const toolMaterial = this.getToolMaterial(item.id);
        const config = this.durabilityConfig[toolMaterial];
        
        if (!config) {
            return { success: false, reason: 'Cannot repair this item' };
        }
        
        // Check repair material
        if (repairMaterial !== config.repairMaterial) {
            return { success: false, reason: `Requires ${config.repairMaterial} to repair` };
        }
        
        // Calculate repair amount (25% per material)
        const repairAmount = Math.floor(item.maxDurability * 0.25) * materialCount;
        
        item.durability = Math.min(item.maxDurability, item.durability + repairAmount);
        
        // Play repair sound
        this.game.audio?.play('anvil');
        
        return { success: true, newDurability: item.durability };
    }
    
    // Combine two tools of same type for durability
    combineTtools(item1, item2) {
        if (!item1 || !item2) {
            return { success: false, reason: 'Invalid items' };
        }
        
        if (item1.id !== item2.id) {
            return { success: false, reason: 'Items must be the same type' };
        }
        
        if (item1.durability === undefined || item2.durability === undefined) {
            return { success: false, reason: 'Items have no durability' };
        }
        
        // Combine durability with 5% bonus
        const combined = item1.durability + item2.durability;
        const bonus = Math.floor(item1.maxDurability * 0.05);
        
        const newItem = { ...item1 };
        newItem.durability = Math.min(item1.maxDurability, combined + bonus);
        
        // Combine enchantments if both have them
        if (item1.enchantments && item2.enchantments) {
            newItem.enchantments = this.mergeEnchantments(item1.enchantments, item2.enchantments);
        }
        
        return { success: true, item: newItem };
    }
    
    mergeEnchantments(ench1, ench2) {
        const merged = [...ench1];
        for (const e of ench2) {
            if (!merged.includes(e)) {
                merged.push(e);
            }
        }
        return merged;
    }
    
    // Get tool material from item ID
    getToolMaterial(itemId) {
        if (!itemId) return null;
        
        const materials = ['wood', 'stone', 'copper', 'iron', 'gold', 'diamond', 'obsidian'];
        for (const mat of materials) {
            if (itemId.startsWith(mat + '_')) {
                return mat;
            }
        }
        return null;
    }
    
    // Get tool type from item ID
    getToolType(itemId) {
        if (!itemId) return null;
        
        const types = ['pickaxe', 'axe', 'shovel', 'sword', 'hoe', 'fishing_rod', 'bow', 'shield'];
        for (const type of types) {
            if (itemId.endsWith('_' + type) || itemId === type) {
                return type;
            }
        }
        return null;
    }
    
    getEnchantmentLevel(item, enchantment) {
        if (!item.enchantments) return 0;
        
        for (const e of item.enchantments) {
            if (e.startsWith(enchantment)) {
                const match = e.match(/(\d+)$/);
                return match ? parseInt(match[1]) : 1;
            }
        }
        return 0;
    }
    
    // Get durability percentage for UI
    getDurabilityPercent(item) {
        if (!item || !item.maxDurability || item.durability === undefined) {
            return 1;
        }
        return item.durability / item.maxDurability;
    }
    
    // Get durability bar color
    getDurabilityColor(item) {
        const percent = this.getDurabilityPercent(item);
        
        if (percent > 0.6) return '#00FF00'; // Green
        if (percent > 0.3) return '#FFFF00'; // Yellow
        if (percent > 0.15) return '#FFA500'; // Orange
        return '#FF0000'; // Red
    }
    
    // Render durability bar on item in inventory
    renderDurabilityBar(ctx, item, x, y, width = 32) {
        if (!item || item.durability === undefined) return;
        
        const percent = this.getDurabilityPercent(item);
        if (percent >= 1) return; // Don't show if full
        
        const barHeight = 3;
        const barY = y + 29;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, barY, width, barHeight);
        
        // Fill
        ctx.fillStyle = this.getDurabilityColor(item);
        ctx.fillRect(x, barY, width * percent, barHeight);
    }
    
    // Update method (required by game loop)
    update(deltaTime) {
        // Durability is checked per-action, no continuous update needed
    }
    
    // Reset system
    reset() {
        // Nothing to reset - durability is per-item
    }
    
    // Serialize for saving
    serialize() {
        return {};
    }
    
    // Deserialize from save
    deserialize(data) {
        // Nothing to restore at system level - durability is per-item
    }
}
