import { CONFIG, RECIPES, ITEMS, AGES } from '../config.js';

// Age index mapping for filtering recipes
const AGE_INDEX = {
    'STONE_AGE': 0,
    'TRIBAL_AGE': 1,
    'BRONZE_AGE': 2,
    'IRON_AGE': 3,
    'MEDIEVAL_AGE': 4,
    'INDUSTRIAL_AGE': 5,
    'MODERN_AGE': 6
};

export class InventoryUI {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('inventory-screen');
        this.grid = document.getElementById('inventory-grid');
        this.closeBtn = document.getElementById('close-inventory');

        // Crafting refs
        this.craftingGrid = document.getElementById('crafting-grid');
        this.craftingResult = document.getElementById('crafting-result');
        this.craftBtn = document.getElementById('craft-btn');

        this.selectedRecipe = null;
        this.activeCategory = 'all'; // For category filtering

        this.draggedSlot = null;
        this.draggedIndex = -1;
        this.isHotbarDrag = false;

        this.init();
    }

    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        if (this.craftBtn) {
            this.craftBtn.addEventListener('click', () => this.craftSelected());
        }

        // Close on click outside
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });
    }

    show() {
        this.container.classList.remove('hidden');
        this.render();
    }

    hide() {
        this.container.classList.add('hidden');
        this.draggedSlot = null;
        this.draggedIndex = -1;
    }

    toggle() {
        if (this.container.classList.contains('hidden')) {
            this.show();
        } else {
            this.hide();
        }
    }

    render() {
        if (!this.game.player) return;

        this.grid.innerHTML = '';
        const inventory = this.game.player.inventory;
        const hotbar = this.game.player.hotbar;

        // Render Hotbar (first row usually, or separate section)
        // Let's render hotbar first as a separate row if visuals allow, 
        // or just first 8 slots. 
        // Based on typical inventory, hotbar is separate or bottom row.
        // Let's create a 'Hotbar' section in grid for clarity

        // Hotbar Slots
        for (let i = 0; i < CONFIG.HOTBAR_SIZE; i++) {
            this.createSlot(hotbar[i], i, true);
        }

        // Inventory Slots
        for (let i = 0; i < CONFIG.INVENTORY_SIZE; i++) {
            this.createSlot(inventory[i], i, false);
        }

        this.renderCrafting();
    }

    renderCrafting() {
        if (!this.craftingGrid) return;
        this.craftingGrid.innerHTML = '';
        
        // Get player's current age from quest manager
        const currentAge = this.game.quests?.currentAge || 'STONE_AGE';
        const playerAgeIndex = AGE_INDEX[currentAge] ?? 0;
        
        // Create category filter tabs
        const categories = ['all', 'tools', 'weapons', 'armor', 'building', 'materials', 'stations', 'ammo'];
        const tabsDiv = document.createElement('div');
        tabsDiv.className = 'crafting-tabs';
        
        categories.forEach(cat => {
            const tab = document.createElement('button');
            tab.className = `crafting-tab ${this.activeCategory === cat ? 'active' : ''}`;
            tab.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            tab.addEventListener('click', () => {
                this.activeCategory = cat;
                this.renderCrafting();
            });
            tabsDiv.appendChild(tab);
        });
        
        this.craftingGrid.appendChild(tabsDiv);
        
        // Create recipe grid container
        const recipeGrid = document.createElement('div');
        recipeGrid.className = 'recipe-grid';

        // Filter recipes by player's age and category
        const availableRecipes = RECIPES.filter(recipe => {
            const recipeAge = recipe.age ?? 0;
            // Only show recipes up to player's current age
            if (recipeAge > playerAgeIndex) return false;
            // Category filter
            if (this.activeCategory !== 'all' && recipe.category !== this.activeCategory) return false;
            return true;
        });

        availableRecipes.forEach(recipe => {
            const resultItem = ITEMS[recipe.result];
            if (!resultItem) return;

            const slot = document.createElement('div');
            slot.className = 'crafting-slot';
            if (this.selectedRecipe === recipe) slot.classList.add('selected');

            const canCraft = this.canCraft(recipe);
            if (!canCraft) slot.classList.add('disabled');
            
            // Add age indicator badge
            const ageNames = ['🪨', '🦴', '🥉', '⚔️', '🏰', '⚙️', '💻'];
            const ageBadge = recipe.age > 0 ? `<span class="age-badge">${ageNames[recipe.age] || ''}</span>` : '';

            slot.innerHTML = `
                <div class="item-icon">${resultItem.emoji}</div>
                ${ageBadge}
                <div class="item-tooltip">${resultItem.name}</div>
            `;

            slot.addEventListener('click', () => {
                this.selectedRecipe = recipe;
                this.render(); // Re-render to show selection highlight
                this.updateCraftingPreview();
            });

            recipeGrid.appendChild(slot);
        });
        
        this.craftingGrid.appendChild(recipeGrid);
        
        // Show current age info
        const ageInfo = document.createElement('div');
        ageInfo.className = 'age-info';
        const ageData = AGES[currentAge];
        ageInfo.innerHTML = `<span class="current-age">📜 ${ageData?.name || 'Stone Age'}</span>`;
        this.craftingGrid.appendChild(ageInfo);

        this.updateCraftingPreview();
    }

    updateCraftingPreview() {
        if (!this.craftingResult || !this.craftBtn) return;

        this.craftingResult.innerHTML = '';
        this.craftBtn.disabled = true;

        if (!this.selectedRecipe) {
            this.craftingResult.innerHTML = '<p>Select a recipe</p>';
            return;
        }

        const canCraft = this.canCraft(this.selectedRecipe);
        this.craftBtn.disabled = !canCraft;

        // Show ingredients
        const ingredientsDiv = document.createElement('div');
        ingredientsDiv.className = 'crafting-ingredients';

        this.selectedRecipe.ingredients.forEach(([itemKey, count]) => {
            const itemDef = ITEMS[itemKey];
            const hasCount = this.countItem(itemKey);

            const ingEl = document.createElement('div');
            ingEl.className = 'ingredient';
            ingEl.innerHTML = `
                <span>${itemDef.emoji} ${itemDef.name}</span>
                <span class="${hasCount >= count ? 'success' : 'error'}">${hasCount}/${count}</span>
            `;
            ingredientsDiv.appendChild(ingEl);
        });

        this.craftingResult.appendChild(ingredientsDiv);
    }

    canCraft(recipe) {
        return recipe.ingredients.every(([itemKey, count]) => {
            return this.countItem(itemKey) >= count;
        });
    }

    countItem(itemKey) {
        let count = 0;
        const player = this.game.player;

        // Check inventory
        player.inventory.forEach(item => {
            if (item && item.type === ITEMS[itemKey].type && item.name === ITEMS[itemKey].name) {
                count += item.count;
            }
        });

        // Check hotbar
        player.hotbar.forEach(item => {
            if (item && item.type === ITEMS[itemKey].type && item.name === ITEMS[itemKey].name) {
                count += item.count;
            }
        });

        return count;
    }

    craftSelected() {
        if (!this.selectedRecipe || !this.canCraft(this.selectedRecipe)) return;

        // Consume ingredients
        this.selectedRecipe.ingredients.forEach(([itemKey, count]) => {
            this.consumeItem(itemKey, count);
        });

        // Add result
        const resultCount = this.selectedRecipe.count || 1;
        this.game.player.addItem(this.selectedRecipe.result, resultCount);
        
        // Notify quest system about crafting
        if (this.game.questManager) {
            this.game.questManager.onItemCrafted(this.selectedRecipe.result, resultCount);
        }

        this.render();
    }

    consumeItem(itemKey, amount) {
        let remaining = amount;
        const player = this.game.player;
        const itemDef = ITEMS[itemKey];

        // Helper to reduce from list
        const reduceFromList = (list) => {
            for (let i = 0; i < list.length; i++) {
                if (remaining <= 0) break;
                const item = list[i];
                if (item && item.name === itemDef.name) {
                    if (item.count > remaining) {
                        item.count -= remaining;
                        remaining = 0;
                    } else {
                        remaining -= item.count;
                        list[i] = null;
                    }
                }
            }
        };

        reduceFromList(player.inventory);
        reduceFromList(player.hotbar);
    }

    createSlot(item, index, isHotbar) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        if (isHotbar) slot.classList.add('hotbar-slot-ui');

        if (item) {
            slot.innerHTML = `
                <div class="item-icon">${item.emoji}</div>
                <div class="item-count">${item.count}</div>
                <div class="item-tooltip">${item.name}</div>
            `;
            slot.draggable = true;
        }

        // Drag Events
        slot.addEventListener('dragstart', (e) => this.onDragStart(e, index, isHotbar));
        slot.addEventListener('dragover', (e) => e.preventDefault()); // Allow drop
        slot.addEventListener('drop', (e) => this.onDrop(e, index, isHotbar));
        slot.addEventListener('click', (e) => this.onClick(e, index, isHotbar));

        this.grid.appendChild(slot);
    }

    onDragStart(e, index, isHotbar) {
        this.draggedIndex = index;
        this.isHotbarDrag = isHotbar;
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setData('text/plain', JSON.stringify({ index, isHotbar }));
    }

    onDrop(e, index, isHotbar) {
        e.preventDefault();

        if (this.draggedIndex === -1) return;

        const player = this.game.player;
        const sourceList = this.isHotbarDrag ? player.hotbar : player.inventory;
        const targetList = isHotbar ? player.hotbar : player.inventory;

        const sourceItem = sourceList[this.draggedIndex];
        const targetItem = targetList[index];

        // Swap or Merge
        if (targetItem && sourceItem.name === targetItem.name && sourceItem.stackable) {
            // Merge
            const space = CONFIG.STACK_SIZE - targetItem.count;
            if (space > 0) {
                const moveCount = Math.min(space, sourceItem.count);
                targetItem.count += moveCount;
                sourceItem.count -= moveCount;

                if (sourceItem.count <= 0) {
                    sourceList[this.draggedIndex] = null;
                }
            } else {
                // Swap if full stack? No, just fails.
            }
        } else {
            // Swap
            sourceList[this.draggedIndex] = targetItem;
            targetList[index] = sourceItem;
        }

        this.draggedIndex = -1;
        this.render();
        player.updateUI(); // Update HUD hotbar

        // Reset player selected item if hotbar changed
        // player.selectHotbarSlot(player.selectedSlot); // Should be auto-handled
    }

    onClick(e, index, isHotbar) {
        // Fallback for mobile tap-to-move if needed using a "selected" state
        // For now, assume drag-drop is primary
    }
}
