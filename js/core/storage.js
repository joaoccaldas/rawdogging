// Storage Chests - Allow placing chests in the world to store items
import { CONFIG } from '../config.js';

export const CHEST_TYPES = {
    WOODEN_CHEST: {
        id: 'wooden_chest',
        name: 'Wooden Chest',
        icon: '📦',
        slots: 16,
        recipe: { stick: 10, fiber: 6 }
    },
    LARGE_CHEST: {
        id: 'large_chest',
        name: 'Large Chest',
        icon: '🗃️',
        slots: 32,
        recipe: { wooden_chest: 2, leather: 4, bronze_ingot: 2 }
    },
    REINFORCED_CHEST: {
        id: 'reinforced_chest',
        name: 'Reinforced Chest',
        icon: '🔐',
        slots: 48,
        recipe: { large_chest: 1, iron_ingot: 8 }
    }
};

class StorageChest {
    constructor(type, x, y, z) {
        const chestType = CHEST_TYPES[type.toUpperCase()] || CHEST_TYPES.WOODEN_CHEST;
        
        this.id = `chest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.type = chestType.id;
        this.name = chestType.name;
        this.icon = chestType.icon;
        this.maxSlots = chestType.slots;
        
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Items stored: array of { item, quantity }
        this.items = [];
    }
    
    // Add item to chest
    addItem(itemId, quantity = 1) {
        // Try to stack with existing
        for (const slot of this.items) {
            if (slot.item === itemId) {
                slot.quantity += quantity;
                return { success: true, remaining: 0 };
            }
        }
        
        // Add to new slot if space
        if (this.items.length < this.maxSlots) {
            this.items.push({ item: itemId, quantity });
            return { success: true, remaining: 0 };
        }
        
        return { success: false, remaining: quantity };
    }
    
    // Remove item from chest
    removeItem(itemId, quantity = 1) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].item === itemId) {
                const available = this.items[i].quantity;
                const toRemove = Math.min(available, quantity);
                
                this.items[i].quantity -= toRemove;
                if (this.items[i].quantity <= 0) {
                    this.items.splice(i, 1);
                }
                
                return { success: true, removed: toRemove };
            }
        }
        return { success: false, removed: 0 };
    }
    
    // Check if chest has item
    hasItem(itemId, quantity = 1) {
        for (const slot of this.items) {
            if (slot.item === itemId && slot.quantity >= quantity) {
                return true;
            }
        }
        return false;
    }
    
    // Get item count
    getItemCount(itemId) {
        for (const slot of this.items) {
            if (slot.item === itemId) {
                return slot.quantity;
            }
        }
        return 0;
    }
    
    // Get all items
    getAllItems() {
        return [...this.items];
    }
    
    // Get free slots
    getFreeSlots() {
        return this.maxSlots - this.items.length;
    }
    
    // Serialize
    serialize() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            z: this.z,
            items: this.items
        };
    }
    
    // Deserialize
    static deserialize(data) {
        const chest = new StorageChest(data.type, data.x, data.y, data.z);
        chest.id = data.id;
        chest.items = data.items || [];
        return chest;
    }
}

export class StorageSystem {
    constructor(game) {
        this.game = game;
        
        // All placed chests
        this.chests = new Map();
        
        // Currently open chest (for UI)
        this.openChest = null;
        
        // Interaction range
        this.interactionRange = 3;
    }
    
    update(deltaTime) {
        // Close chest if player moves too far
        if (this.openChest) {
            const dist = this.getDistanceToChest(this.openChest);
            if (dist > this.interactionRange + 1) {
                this.closeChest();
            }
        }
    }
    
    // Get distance from player to chest
    getDistanceToChest(chest) {
        const player = this.game.player;
        if (!player) return Infinity;
        
        const dx = player.x - chest.x;
        const dy = player.y - chest.y;
        const dz = player.z - chest.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Place a new chest
    placeChest(typeId, x, y, z) {
        const chest = new StorageChest(typeId, x, y, z);
        this.chests.set(chest.id, chest);
        
        this.game.ui?.showMessage(`${chest.icon} Placed ${chest.name}`, 2000);
        
        return chest;
    }
    
    // Remove a chest (drops all items)
    removeChest(chestId) {
        const chest = this.chests.get(chestId);
        if (!chest) return false;
        
        // Drop all items
        for (const slot of chest.items) {
            this.game.dropItem?.(slot.item, slot.quantity, chest.x, chest.y, chest.z);
        }
        
        this.chests.delete(chestId);
        
        if (this.openChest?.id === chestId) {
            this.openChest = null;
        }
        
        return true;
    }
    
    // Find chest at position
    getChestAt(x, y, z) {
        for (const chest of this.chests.values()) {
            const dx = Math.abs(chest.x - x);
            const dy = Math.abs(chest.y - y);
            const dz = Math.abs(chest.z - z);
            if (dx < 1 && dy < 1 && dz < 1) {
                return chest;
            }
        }
        return null;
    }
    
    // Get nearby chests
    getNearbyChests() {
        const player = this.game.player;
        if (!player) return [];
        
        const nearby = [];
        for (const chest of this.chests.values()) {
            const dist = this.getDistanceToChest(chest);
            if (dist <= this.interactionRange) {
                nearby.push({ chest, distance: dist });
            }
        }
        
        return nearby.sort((a, b) => a.distance - b.distance).map(n => n.chest);
    }
    
    // Interact with nearest chest
    interactWithNearestChest() {
        const nearby = this.getNearbyChests();
        if (nearby.length > 0) {
            this.openChest = nearby[0];
            return this.openChest;
        }
        return null;
    }
    
    // Open a specific chest
    openChestById(chestId) {
        const chest = this.chests.get(chestId);
        if (chest && this.getDistanceToChest(chest) <= this.interactionRange) {
            this.openChest = chest;
            return true;
        }
        return false;
    }
    
    // Close open chest
    closeChest() {
        this.openChest = null;
    }
    
    // Transfer item from player inventory to chest
    depositItem(itemId, quantity = 1) {
        if (!this.openChest) return false;
        
        const inventory = this.game.inventory;
        if (!inventory) return false;
        
        // Check player has item
        if (!inventory.hasItem(itemId, quantity)) return false;
        
        // Try to add to chest
        const result = this.openChest.addItem(itemId, quantity);
        if (result.success) {
            inventory.removeItem(itemId, quantity - result.remaining);
            return true;
        }
        return false;
    }
    
    // Transfer item from chest to player inventory
    withdrawItem(itemId, quantity = 1) {
        if (!this.openChest) return false;
        
        const inventory = this.game.inventory;
        if (!inventory) return false;
        
        // Check chest has item
        if (!this.openChest.hasItem(itemId, quantity)) return false;
        
        // Try to add to inventory
        const added = inventory.addItem(itemId, quantity);
        if (added > 0) {
            this.openChest.removeItem(itemId, added);
            return true;
        }
        return false;
    }
    
    // Quick deposit - deposit all of one item type
    quickDeposit(itemId) {
        if (!this.openChest) return 0;
        
        const inventory = this.game.inventory;
        if (!inventory) return 0;
        
        const count = inventory.getItemCount(itemId);
        if (count > 0) {
            const result = this.openChest.addItem(itemId, count);
            const deposited = count - result.remaining;
            inventory.removeItem(itemId, deposited);
            return deposited;
        }
        return 0;
    }
    
    // Get total storage across all chests
    getTotalStoredItem(itemId) {
        let total = 0;
        for (const chest of this.chests.values()) {
            total += chest.getItemCount(itemId);
        }
        return total;
    }
    
    // Render chests in world
    render(ctx, camera) {
        for (const chest of this.chests.values()) {
            const screenPos = camera.worldToScreen(chest.x, chest.y, chest.z);
            
            // Draw chest icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(chest.icon, screenPos.x, screenPos.y);
            
            // Highlight if open
            if (this.openChest?.id === chest.id) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenPos.x - 15, screenPos.y - 15, 30, 30);
            }
        }
    }
    
    // Serialize for save
    serialize() {
        return {
            chests: Array.from(this.chests.values()).map(c => c.serialize())
        };
    }
    
    deserialize(data) {
        if (data?.chests) {
            this.chests.clear();
            for (const chestData of data.chests) {
                const chest = StorageChest.deserialize(chestData);
                this.chests.set(chest.id, chest);
            }
        }
    }
    
    reset() {
        this.chests.clear();
        this.openChest = null;
    }
}

// Chest items for config
export const STORAGE_ITEMS = {
    wooden_chest: {
        name: 'Wooden Chest',
        type: 'placeable',
        emoji: '📦',
        stackSize: 5,
        description: 'Place to store 16 item stacks.'
    },
    large_chest: {
        name: 'Large Chest',
        type: 'placeable',
        emoji: '🗃️',
        stackSize: 3,
        description: 'Place to store 32 item stacks.'
    },
    reinforced_chest: {
        name: 'Reinforced Chest',
        type: 'placeable',
        emoji: '🔐',
        stackSize: 1,
        description: 'Place to store 48 item stacks.'
    }
};
