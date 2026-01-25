import { CONFIG } from '../config.js';

export class SaveManager {
    constructor(game) {
        this.game = game;
        this.lastSaveTime = 0;
        this.currentSlot = 'save_1';
    }

    setSlot(slotId) {
        this.currentSlot = slotId;
    }

    update(timestamp) {
        if (timestamp - this.lastSaveTime > CONFIG.AUTO_SAVE_INTERVAL) {
            this.save();
            this.lastSaveTime = timestamp;
        }
    }

    save() {
        const data = {
            version: 2, // Increment when save format changes
            player: {
                x: this.game.player.x,
                y: this.game.player.y,
                z: this.game.player.z,
                health: this.game.player.health,
                hunger: this.game.player.hunger,
                xp: this.game.player.xp,
                level: this.game.player.level,
                inventory: this.game.player.inventory,
                hotbar: this.game.player.hotbar,
                spawnPoint: this.game.player.spawnPoint,
            },
            world: {
                seed: this.game.world.noise.seed,
                timeOfDay: this.game.world.timeOfDay,
                dayCount: this.game.world.dayCount || 0,
                chunks: Array.from(this.game.world.chunks.entries())
            },
            // Skills system
            skills: this.game.skills ? this.game.skills.serialize() : null,
            // Quest system
            quests: this.game.questManager ? this.game.questManager.serialize() : null,
            // Taming system
            taming: this.game.taming ? this.game.taming.serialize() : null,
        };

        try {
            // LocalStorage has 5MB limit. Full chunks might blow it.
            const saveString = JSON.stringify(data);
            localStorage.setItem(this.currentSlot, saveString);
            console.log(`Game Saved to ${this.currentSlot} (${(saveString.length / 1024).toFixed(1)} KB)`);
            this.showNotification('Game Saved');
        } catch (e) {
            console.error('Save failed', e);
            if (e.name === 'QuotaExceededError') {
                this.showNotification('Save failed: Storage full');
            }
        }
    }

    load() {
        const json = localStorage.getItem(this.currentSlot);
        if (!json) return false;

        try {
            const data = JSON.parse(json);

            // Restore Player
            this.game.player.x = data.player.x;
            this.game.player.y = data.player.y;
            this.game.player.z = data.player.z;
            this.game.player.health = data.player.health;
            this.game.player.hunger = data.player.hunger;
            this.game.player.xp = data.player.xp || 0;
            this.game.player.level = data.player.level || 1;
            this.game.player.inventory = data.player.inventory;
            this.game.player.hotbar = data.player.hotbar;
            if (data.player.spawnPoint) {
                this.game.player.spawnPoint = data.player.spawnPoint;
            }
            this.game.player.updateUI();

            // Restore World
            this.game.world.timeOfDay = data.world.timeOfDay;
            this.game.world.dayCount = data.world.dayCount || 0;

            // Restore Chunks
            if (data.world.chunks) {
                data.world.chunks.forEach(([key, chunkData]) => {
                    const chunk = this.game.world.getChunk(chunkData.x, chunkData.y) || this.game.world.generateChunk(chunkData.x, chunkData.y);
                    chunk.blocks = chunkData.blocks;
                    this.game.world.chunks.set(key, chunk);
                });
            }
            
            // Restore Skills
            if (data.skills && this.game.skills) {
                this.game.skills.deserialize(data.skills);
            }
            
            // Restore Quests
            if (data.quests && this.game.questManager) {
                this.game.questManager.deserialize(data.quests);
            }
            
            // Restore Taming/Pets
            if (data.taming && this.game.taming) {
                this.game.taming.deserialize(data.taming);
            }

            console.log('Game Loaded');
            return true;
        } catch (e) {
            console.error('Load failed', e);
            return false;
        }
    }
    
    // Delete a save slot
    deleteSave(slot = null) {
        const slotToDelete = slot || this.currentSlot;
        localStorage.removeItem(slotToDelete);
        console.log(`Deleted save: ${slotToDelete}`);
    }
    
    // Check if save exists
    hasSave(slot = null) {
        const slotToCheck = slot || this.currentSlot;
        return localStorage.getItem(slotToCheck) !== null;
    }
    
    // Get save info for slot selection
    getSaveInfo(slot) {
        const json = localStorage.getItem(slot);
        if (!json) return null;
        
        try {
            const data = JSON.parse(json);
            return {
                exists: true,
                dayCount: data.world?.dayCount || 0,
                level: data.player?.level || 1,
                position: data.player ? `${Math.floor(data.player.x)}, ${Math.floor(data.player.y)}` : 'Unknown',
            };
        } catch {
            return null;
        }
    }

    showNotification(msg) {
        if (this.game.ui && this.game.ui.showMessage) {
            this.game.ui.showMessage(msg, 2000);
        }
    }
}
