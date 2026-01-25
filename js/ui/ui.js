import { InventoryUI } from './inventory.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.inventory = new InventoryUI(game);

        // References to modal overlays
        this.modals = [
            document.getElementById('inventory-screen'),
            document.getElementById('death-screen'),
            document.getElementById('furnace-screen')
        ];

        this.deathScreen = document.getElementById('death-screen');
        this.respawnBtn = document.getElementById('respawn-btn');

        // Furnace
        this.furnaceScreen = document.getElementById('furnace-screen');
        this.furnaceInput = document.getElementById('furnace-input');
        this.furnaceOutput = document.getElementById('furnace-output');
        this.smeltBtn = document.getElementById('smelt-btn');
        this.closeFurnaceBtn = document.getElementById('close-furnace');

        // Menus
        this.startScreen = document.getElementById('start-screen');
        this.pauseMenu = document.getElementById('pause-menu');

        console.log('UIManager: Initializing...');
        const newGameBtn = document.getElementById('btn-new-game');
        if (newGameBtn) {
            console.log('UIManager: Found New Game Button');
            newGameBtn.addEventListener('click', () => {
                console.log('UIManager: New Game Clicked');
                this.startNewGame();
            });
        } else {
            console.error('UIManager: New Game Button NOT FOUND');
        }

        document.getElementById('btn-load-game')?.addEventListener('click', () => this.loadGameMenu());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause(false));
        document.getElementById('btn-save')?.addEventListener('click', () => { this.game.saveManager.save(); this.togglePause(false); });
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToTitle());

        // Key listener for Escape
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (!this.startScreen.classList.contains('hidden')) return;
                // Toggle Pause
                const isPaused = !this.pauseMenu.classList.contains('hidden');
                this.togglePause(!isPaused);
            }
        });

        if (this.respawnBtn) {
            this.respawnBtn.addEventListener('click', () => this.game.respawn());
        }

        if (this.closeFurnaceBtn) {
            this.closeFurnaceBtn.addEventListener('click', () => this.toggleFurnace(false));
        }

        if (this.smeltBtn) {
            this.smeltBtn.addEventListener('click', () => this.trySmelt());
        }
    }

    toggleFurnace(show) {
        if (show) {
            this.closeAllModals();
            this.furnaceScreen.classList.remove('hidden');
            this.updateFurnaceUI();
        } else {
            this.furnaceScreen.classList.add('hidden');
        }
    }

    updateFurnaceUI() {
        // Find smeltable items in inventory (Ore/Sand)
        // For prototype, automatically find first smeltable logic?
        // Or just let user click smelt and we search inventory?
        // Let's search inventory for inputs.
    }

    trySmelt() {
        // Check for Coal
        const coalIdx = this.findItem('coal');
        if (coalIdx === -1) {
            alert('Need Coal!');
            return;
        }

        // Check for smeltable
        // Raw Iron -> Iron Ingot
        // Sand -> Glass
        // Raw Gold -> Gold Ingot
        // Raw Meat -> Cooked Meat

        const recipes = [
            { in: 'raw_iron', out: 'iron_ingot' },
            { in: 'raw_gold', out: 'gold_ingot' },
            { in: 'sand', out: 'glass' },
            { in: 'raw_meat', out: 'cooked_meat' }
        ];

        let worked = false;

        for (const recipe of recipes) {
            const inIdx = this.findItem(recipe.in);
            if (inIdx !== -1) {
                // Consume Inputs
                this.game.player.inventory[coalIdx].count--;
                if (this.game.player.inventory[coalIdx].count <= 0) this.game.player.inventory[coalIdx] = null;

                this.game.player.inventory[inIdx].count--;
                if (this.game.player.inventory[inIdx].count <= 0) this.game.player.inventory[inIdx] = null;

                // Add Output
                this.game.player.addItem(recipe.out);
                this.game.audio.play('place'); // Sizzle?
                worked = true;
                break;
            }
        }

        if (!worked) alert('Nothing to smelt!');
        this.game.player.updateUI();
    }

    showDeathScreen(daysSurvived) {
        if (this.deathScreen) {
            this.deathScreen.classList.remove('hidden');
            const daysEl = document.getElementById('survival-days');
            if (daysEl) daysEl.innerText = daysSurvived.toFixed(1);
        }
    }

    toggleInventory() {
        this.inventory.toggle();
    }

    closeAllModals() {
        this.modals.forEach(modal => {
            if (modal) modal.classList.add('hidden');
        });

        // Ensure paused state is cleared if we had one
    }

    findItem(key) {
        // Helper to find index in inventory
        // Note: Config names are capitalized usually, keys are lowercase
        // But saved items have 'name'.
        // Let's import ITEMS globally or access game.player items?
        // Simplest: loop inventory, convert name to key? Reverse lookup?
        // Or just hardcode names for this simple prototype.
        const map = {
            'coal': 'Coal',
            'raw_iron': 'Raw Iron',
            'raw_gold': 'Raw Gold',
            'sand': 'Sand',
            'raw_meat': 'Raw Meat',
            'glass': 'Glass',
            'cooked_meat': 'Cooked Meat',
            'iron_ingot': 'Iron Ingot',
            'gold_ingot': 'Gold Ingot'
        };

        const targetName = map[key];
        return this.game.player.inventory.findIndex(i => i && i.name === targetName);
    }

    update() {
        // Any continuous UI updates
    }

    startNewGame() {
        console.log('UIManager: Starting New Game...');
        // Use Slot 1 by default for New Game or ask?
        // Let's just default to 'save_1' and overwrite?
        // Better: Quick Slot Selection Modal?
        // For simplicity: New Game = Slot 1.
        this.game.saveManager.setSlot('save_1');
        this.startScreen.classList.add('hidden');
        console.log('UIManager: Start Screen Hidden');
        this.game.startNewGame();
    }

    loadGameMenu() {
        // Show Slot selection?
        // Let's create a simple submenu in the start screen container if possible
        // Actually, let's just cycle slots or confirm.
        // Prompt user?
        const slot = prompt("Enter Save Slot (1-3):", "1");
        if (slot && ['1', '2', '3'].includes(slot)) {
            this.game.saveManager.setSlot('save_' + slot);
            this.startScreen.classList.add('hidden');
            if (!this.game.saveManager.load()) {
                alert('No save found in Slot ' + slot + '. Starting new game.');
                this.game.startNewGame();
            } else {
                this.game.paused = false;
            }
        }
    }

    togglePause(paused) {
        if (paused) {
            this.pauseMenu.classList.remove('hidden');
            this.game.paused = true;
            // Clear any stuck input when pausing
            if (this.game.input) {
                this.game.input.keys = {};
            }
        } else {
            this.pauseMenu.classList.add('hidden');
            this.game.paused = false;
        }
    }

    quitToTitle() {
        this.game.saveManager.save();
        this.pauseMenu.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
        this.game.paused = true;
        // Ideally reset game state too, but reload page is safer for prototype
        location.reload();
    }
    
    // Quest notification methods
    showQuestComplete(quest) {
        this.showNotification(`✅ Quest Complete: ${quest.name}`, 'success', 4000);
    }
    
    showQuestUnlocked(quest) {
        this.showNotification(`🆕 New Quest: ${quest.name}`, 'info', 3000);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `game-notification notification-${type}`;
        notification.innerHTML = message;
        
        // Style based on type
        const colors = {
            success: { bg: 'rgba(74, 222, 128, 0.9)', border: '#22c55e' },
            info: { bg: 'rgba(59, 130, 246, 0.9)', border: '#3b82f6' },
            warning: { bg: 'rgba(251, 191, 36, 0.9)', border: '#f59e0b' },
            error: { bg: 'rgba(239, 68, 68, 0.9)', border: '#ef4444' }
        };
        
        const style = colors[type] || colors.info;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${style.bg};
            border: 2px solid ${style.border};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            z-index: 5000;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}
