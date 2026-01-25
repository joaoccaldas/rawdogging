import { InventoryUI } from './inventory.js';
import { LandingPage } from './landingpage.js';
import { Minimap } from './minimap.js';

export class UIManager {
    constructor(game) {
        this.game = game;
        this.inventory = new InventoryUI(game);

        // Landing page / story intro
        this.landingPage = new LandingPage();

        // Minimap
        this.minimap = new Minimap(game);

        // References to modal overlays

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
        this.playerNameInput = document.getElementById('player-name');

        // Landing page is hidden by default, start screen shows first

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

        // Builder Mode button
        const builderModeBtn = document.getElementById('btn-builder-mode');
        if (builderModeBtn) {
            console.log('UIManager: Found Builder Mode Button');
            builderModeBtn.addEventListener('click', () => {
                console.log('UIManager: Builder Mode Clicked');
                this.startBuilderMode();
            });
        }

        document.getElementById('btn-load-game')?.addEventListener('click', () => this.loadGameMenu());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePauseUI(false));
        document.getElementById('btn-save')?.addEventListener('click', () => { this.game.saveManager.save(); this.togglePauseUI(false); });
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToTitle());

        // Key listener for Escape
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (!this.startScreen.classList.contains('hidden')) return;
                // Toggle Pause
                const isPaused = !this.pauseMenu.classList.contains('hidden');
                this.togglePauseUI(!isPaused);
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

        // Initialize Story Screen
        this.createStoryScreen();
    }

    createStoryScreen() {
        if (document.getElementById('story-screen')) return;

        const screen = document.createElement('div');
        screen.id = 'story-screen';
        screen.className = 'hidden';
        screen.innerHTML = `
            <div class="story-content">
                <h1 id="story-title">Title</h1>
                <p id="story-text-body">Body text...</p>
                <button id="story-continue-btn">Continue</button>
            </div>
        `;
        document.body.appendChild(screen);

        document.getElementById('story-continue-btn').addEventListener('click', () => {
            document.getElementById('story-screen').classList.add('hidden');
            this.game.togglePause(false);
        });
    }

    showStoryScreen(title, text) {
        const screen = document.getElementById('story-screen');
        if (!screen) return;

        document.getElementById('story-title').innerText = title;
        document.getElementById('story-text-body').innerText = text; // or innerHTML for formatting

        screen.classList.remove('hidden');
        this.game.togglePause(true); // Pause game while reading
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
                this.game.audio.play('place');

                if (this.game.questManager) {
                    this.game.questManager.onSmeltComplete(recipe.out);
                }

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
        if (this.game.firstSteps) return;
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
        if (this.minimap) this.minimap.update(1 / 60); // Pass a default delta if main loop doesn't pass it? 
        // UIManager doesn't seem to receive DeltaTime in methods seen so far, 
        // Main loop calls `this.ui.update(deltaTime)?` No, main loop calls `this.player.update` etc.
        // Let's check main.js call site. Assuming update(deltaTime) signature.

        // Actually main.js doesn't seem to call ui.update().
        // I should add ui.update(deltaTime) to main loop or handle it here if called.
        // Let's assume I need to hook it up.
    }

    startNewGame() {
        console.log('UIManager: Starting New Game...');

        // Get player name from input
        const playerName = this.playerNameInput?.value.trim() || 'Survivor';
        this.game.playerName = playerName;
        console.log(`UIManager: Player name set to "${playerName}"`);

        // Hide start screen
        this.startScreen.classList.add('hidden');

        // Start game world first so it renders behind the cinematic
        this.game.saveManager.setSlot('save_1');
        this.game.startNewGame();
        this.game.paused = false;
        this.game.introCinematic = true;

        // Play story animation
        this.landingPage.start(() => {
            console.log('UIManager: Animation complete, starting walking test...');
            this.game.introCinematic = false;
            this.game.firstSteps = true;
            // The quest manager init is called inside game.startNewGame()
        });
    }

    startBuilderMode() {
        console.log('UIManager: Starting Builder Mode...');

        // Get player name from input
        const playerName = this.playerNameInput?.value.trim() || 'Builder';
        this.game.playerName = playerName;
        console.log(`UIManager: Player name set to "${playerName}"`);

        // Hide start screen
        this.startScreen.classList.add('hidden');

        // Start new game with builder mode flag
        this.game.builderMode = true;
        this.game.saveManager.setSlot('builder_save');
        this.game.startNewGame();
        this.game.paused = false;
        
        // Skip the intro cinematic for builder mode
        this.game.introCinematic = false;
        this.game.firstSteps = false;
        
        // Give the player all items after a short delay
        setTimeout(() => {
            this.game.giveBuilderItems();
            this.showNotification('🔨 Builder Mode Active - All items unlocked!', 'success');
        }, 500);
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

    togglePauseUI(paused) {
        if (!this.pauseMenu) return;

        if (paused) {
            this.pauseMenu.classList.remove('hidden');
            this.updatePauseQuestInfo(); // Refresh quest info when pausing
        } else {
            this.pauseMenu.classList.add('hidden');
        }
    }

    updatePauseQuestInfo() {
        const mainQuestEl = document.getElementById('pause-main-quest');
        const sideQuestsEl = document.getElementById('pause-side-quests');

        if (mainQuestEl) {
            const hudQuestName = document.querySelector('#quest-panel .quest-name')?.innerText;
            const hudQuestObjs = document.querySelector('#quest-panel .quest-objectives')?.innerHTML;

            if (hudQuestName && hudQuestName !== 'Loading...') {
                mainQuestEl.innerHTML = `<strong>${hudQuestName}</strong><br>${hudQuestObjs || ''}`;
            } else {
                mainQuestEl.innerText = 'No active main quest';
            }
        }

        if (sideQuestsEl) {
            const hudSideQuests = document.querySelector('#side-quest-panel')?.innerHTML;
            if (hudSideQuests && !hudSideQuests.includes('No active side quests')) {
                sideQuestsEl.innerHTML = `<hr style="margin: 10px 0; opacity: 0.3;"><strong>Side Quests:</strong><br>${hudSideQuests}`;
            } else {
                sideQuestsEl.innerHTML = '';
            }
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
        this.updateQuestTracker('No active quest');
    }

    showQuestUnlocked(quest) {
        this.showNotification(`🆕 New Quest: ${quest.name}`, 'info', 3000);
        this.updateQuestTracker(quest.name); // Simple tracking of name
    }

    updateQuestTracker(text) {
        let tracker = document.getElementById('quest-tracker');
        if (!tracker) {
            tracker = document.createElement('div');
            tracker.id = 'quest-tracker';
            tracker.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                padding: 10px 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 14px;
                pointer-events: none;
                z-index: 1000;
                border-left: 4px solid #ffd700;
                text-shadow: 1px 1px 0 #000;
            `;
            document.body.appendChild(tracker);
        }
        tracker.innerHTML = `<strong>Current Objective:</strong><br>${text}`;
        tracker.style.display = text ? 'block' : 'none';
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

    // Alias for showNotification for compatibility
    showMessage(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    }

    // Get the player's name
    getPlayerName() {
        return this.game.playerName || 'Survivor';
    }
}
