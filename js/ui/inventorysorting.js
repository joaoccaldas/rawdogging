// Inventory Sorting & Quick-Stack System
// One-click sorting and deposit matching items to chests

export class InventorySortingSystem {
    constructor(game) {
        this.game = game;
        
        // Sorting preferences
        this.sortOrder = [
            'weapon', 'tool', 'armor', 'food', 'material', 'block', 'misc'
        ];
        
        // Item category mappings
        this.categoryMap = new Map();
        this.initCategoryMap();
    }
    
    initCategoryMap() {
        // Weapons
        ['sword', 'spear', 'bow', 'axe_weapon', 'club', 'knife', 'dagger'].forEach(item => {
            this.categoryMap.set(item, 'weapon');
        });
        
        // Tools
        ['pickaxe', 'axe', 'shovel', 'hoe', 'fishing_rod', 'shears'].forEach(item => {
            this.categoryMap.set(item, 'tool');
        });
        
        // Armor
        ['helmet', 'chestplate', 'leggings', 'boots', 'shield'].forEach(item => {
            this.categoryMap.set(item, 'armor');
        });
        
        // Food
        ['meat', 'fish', 'berry', 'apple', 'bread', 'stew', 'cooked', 'raw_'].forEach(item => {
            this.categoryMap.set(item, 'food');
        });
        
        // Materials
        ['ingot', 'ore', 'gem', 'leather', 'bone', 'feather', 'string', 'stick', 'flint'].forEach(item => {
            this.categoryMap.set(item, 'material');
        });
        
        // Blocks
        ['dirt', 'stone', 'wood', 'planks', 'brick', 'sand', 'gravel', 'cobblestone'].forEach(item => {
            this.categoryMap.set(item, 'block');
        });
    }
    
    getItemCategory(itemId) {
        if (!itemId) return 'misc';
        const id = itemId.toLowerCase();
        
        for (const [keyword, category] of this.categoryMap.entries()) {
            if (id.includes(keyword)) return category;
        }
        
        return 'misc';
    }
    
    getItemSortPriority(itemId) {
        const category = this.getItemCategory(itemId);
        const categoryIndex = this.sortOrder.indexOf(category);
        return categoryIndex >= 0 ? categoryIndex : this.sortOrder.length;
    }
    
    // Sort player inventory
    sortInventory(inventory) {
        if (!inventory || !Array.isArray(inventory)) return inventory;
        
        // Separate items and empty slots
        const items = inventory.filter(item => item !== null);
        const emptyCount = inventory.length - items.length;
        
        // Sort items
        items.sort((a, b) => {
            // First by category
            const catA = this.getItemSortPriority(a.id);
            const catB = this.getItemSortPriority(b.id);
            if (catA !== catB) return catA - catB;
            
            // Then alphabetically by ID
            return (a.id || '').localeCompare(b.id || '');
        });
        
        // Stack identical items
        const stacked = this.stackItems(items);
        
        // Fill with empty slots
        while (stacked.length < inventory.length) {
            stacked.push(null);
        }
        
        return stacked;
    }
    
    // Stack identical items together
    stackItems(items, maxStack = 64) {
        const stacked = [];
        const itemMap = new Map();
        
        for (const item of items) {
            if (!item) continue;
            
            const key = item.id;
            if (itemMap.has(key)) {
                const existing = itemMap.get(key);
                const totalCount = existing.count + item.count;
                
                if (totalCount <= maxStack) {
                    existing.count = totalCount;
                } else {
                    existing.count = maxStack;
                    // Create overflow stacks
                    let remaining = totalCount - maxStack;
                    while (remaining > 0) {
                        const newStack = { ...item, count: Math.min(remaining, maxStack) };
                        stacked.push(newStack);
                        remaining -= maxStack;
                    }
                }
            } else {
                const newItem = { ...item };
                itemMap.set(key, newItem);
                stacked.push(newItem);
            }
        }
        
        return stacked;
    }
    
    // Quick-stack: Deposit matching items from player inventory to nearby chest
    quickStackToChest(playerInventory, chestInventory) {
        if (!playerInventory || !chestInventory) return { player: playerInventory, chest: chestInventory };
        
        const result = {
            player: [...playerInventory],
            chest: [...chestInventory],
            transferred: []
        };
        
        // Find items in chest to know what to deposit
        const chestItemTypes = new Set();
        for (const item of chestInventory) {
            if (item) chestItemTypes.add(item.id);
        }
        
        // Transfer matching items from player to chest
        for (let i = 0; i < result.player.length; i++) {
            const item = result.player[i];
            if (!item || !chestItemTypes.has(item.id)) continue;
            
            // Try to add to existing stacks in chest
            let remaining = item.count;
            
            for (let j = 0; j < result.chest.length && remaining > 0; j++) {
                const chestItem = result.chest[j];
                if (chestItem && chestItem.id === item.id && chestItem.count < 64) {
                    const canAdd = Math.min(remaining, 64 - chestItem.count);
                    chestItem.count += canAdd;
                    remaining -= canAdd;
                }
            }
            
            // Try to add to empty slots
            for (let j = 0; j < result.chest.length && remaining > 0; j++) {
                if (!result.chest[j]) {
                    const toAdd = Math.min(remaining, 64);
                    result.chest[j] = { id: item.id, count: toAdd };
                    remaining -= toAdd;
                }
            }
            
            // Update player inventory
            if (remaining <= 0) {
                result.transferred.push({ id: item.id, count: item.count });
                result.player[i] = null;
            } else if (remaining < item.count) {
                result.transferred.push({ id: item.id, count: item.count - remaining });
                result.player[i] = { ...item, count: remaining };
            }
        }
        
        return result;
    }
    
    // Deposit all items to chest
    depositAll(playerInventory, chestInventory, keepHotbar = true) {
        if (!playerInventory || !chestInventory) return { player: playerInventory, chest: chestInventory };
        
        const result = {
            player: [...playerInventory],
            chest: [...chestInventory],
            transferred: []
        };
        
        const hotbarSize = 8; // First 8 slots are hotbar
        const startIndex = keepHotbar ? hotbarSize : 0;
        
        for (let i = startIndex; i < result.player.length; i++) {
            const item = result.player[i];
            if (!item) continue;
            
            let remaining = item.count;
            
            // Try to stack with existing items
            for (let j = 0; j < result.chest.length && remaining > 0; j++) {
                const chestItem = result.chest[j];
                if (chestItem && chestItem.id === item.id && chestItem.count < 64) {
                    const canAdd = Math.min(remaining, 64 - chestItem.count);
                    chestItem.count += canAdd;
                    remaining -= canAdd;
                }
            }
            
            // Add to empty slots
            for (let j = 0; j < result.chest.length && remaining > 0; j++) {
                if (!result.chest[j]) {
                    const toAdd = Math.min(remaining, 64);
                    result.chest[j] = { id: item.id, count: toAdd };
                    remaining -= toAdd;
                }
            }
            
            // Update player slot
            if (remaining <= 0) {
                result.transferred.push({ id: item.id, count: item.count });
                result.player[i] = null;
            } else if (remaining < item.count) {
                result.transferred.push({ id: item.id, count: item.count - remaining });
                result.player[i] = { ...item, count: remaining };
            }
        }
        
        return result;
    }
    
    // Loot all items from chest to player
    lootAll(playerInventory, chestInventory) {
        if (!playerInventory || !chestInventory) return { player: playerInventory, chest: chestInventory };
        
        const result = {
            player: [...playerInventory],
            chest: [...chestInventory],
            transferred: []
        };
        
        for (let i = 0; i < result.chest.length; i++) {
            const item = result.chest[i];
            if (!item) continue;
            
            let remaining = item.count;
            
            // Try to stack
            for (let j = 0; j < result.player.length && remaining > 0; j++) {
                const playerItem = result.player[j];
                if (playerItem && playerItem.id === item.id && playerItem.count < 64) {
                    const canAdd = Math.min(remaining, 64 - playerItem.count);
                    playerItem.count += canAdd;
                    remaining -= canAdd;
                }
            }
            
            // Add to empty slots
            for (let j = 0; j < result.player.length && remaining > 0; j++) {
                if (!result.player[j]) {
                    const toAdd = Math.min(remaining, 64);
                    result.player[j] = { id: item.id, count: toAdd };
                    remaining -= toAdd;
                }
            }
            
            // Update chest slot
            if (remaining <= 0) {
                result.transferred.push({ id: item.id, count: item.count });
                result.chest[i] = null;
            } else if (remaining < item.count) {
                result.transferred.push({ id: item.id, count: item.count - remaining });
                result.chest[i] = { ...item, count: remaining };
            }
        }
        
        return result;
    }
    
    // Restock: Take items from chest that player has but needs more of
    restock(playerInventory, chestInventory) {
        if (!playerInventory || !chestInventory) return { player: playerInventory, chest: chestInventory };
        
        const result = {
            player: [...playerInventory],
            chest: [...chestInventory],
            transferred: []
        };
        
        // Find items player has that aren't full stacks
        for (let i = 0; i < result.player.length; i++) {
            const playerItem = result.player[i];
            if (!playerItem || playerItem.count >= 64) continue;
            
            const needed = 64 - playerItem.count;
            let taken = 0;
            
            // Find matching items in chest
            for (let j = 0; j < result.chest.length && taken < needed; j++) {
                const chestItem = result.chest[j];
                if (chestItem && chestItem.id === playerItem.id) {
                    const canTake = Math.min(needed - taken, chestItem.count);
                    chestItem.count -= canTake;
                    taken += canTake;
                    
                    if (chestItem.count <= 0) {
                        result.chest[j] = null;
                    }
                }
            }
            
            if (taken > 0) {
                playerItem.count += taken;
                result.transferred.push({ id: playerItem.id, count: taken });
            }
        }
        
        return result;
    }
    
    // Create sort button for UI
    createSortButton(container, onClick) {
        const btn = document.createElement('button');
        btn.className = 'inventory-sort-btn';
        btn.innerHTML = '↕️ Sort';
        btn.style.cssText = `
            padding: 8px 15px;
            background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
            color: #fff;
            border: 2px solid #666;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin: 5px;
            transition: all 0.2s ease;
        `;
        
        btn.onmouseenter = () => {
            btn.style.background = 'linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 100%)';
            btn.style.borderColor = '#888';
        };
        btn.onmouseleave = () => {
            btn.style.background = 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)';
            btn.style.borderColor = '#666';
        };
        
        btn.onclick = onClick;
        container.appendChild(btn);
        return btn;
    }
    
    // Create quick-stack button
    createQuickStackButton(container, onClick) {
        const btn = document.createElement('button');
        btn.className = 'inventory-quickstack-btn';
        btn.innerHTML = '📦 Quick Stack';
        btn.style.cssText = `
            padding: 8px 15px;
            background: linear-gradient(180deg, #4a6a4a 0%, #2a4a2a 100%);
            color: #fff;
            border: 2px solid #5a8a5a;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin: 5px;
            transition: all 0.2s ease;
        `;
        
        btn.onmouseenter = () => {
            btn.style.background = 'linear-gradient(180deg, #5a8a5a 0%, #3a6a3a 100%)';
        };
        btn.onmouseleave = () => {
            btn.style.background = 'linear-gradient(180deg, #4a6a4a 0%, #2a4a2a 100%)';
        };
        
        btn.onclick = onClick;
        container.appendChild(btn);
        return btn;
    }
}
