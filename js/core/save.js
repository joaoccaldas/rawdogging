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
            player: {
                x: this.game.player.x,
                y: this.game.player.y,
                z: this.game.player.z,
                health: this.game.player.health,
                hunger: this.game.player.hunger,
                inventory: this.game.player.inventory,
                hotbar: this.game.player.hotbar
            },
            world: {
                seed: this.game.world.noise.seed, // Need to expose seed or save explicit chunks
                timeOfDay: this.game.world.timeOfDay,
                // Saving all chunks is heavy. Only modified blocks?
                // For this prototype, let's just save "Modified Blocks" map if possible, 
                // OR just key entities.
                // Actually, let's just save valid chunks.
                chunks: Array.from(this.game.world.chunks.entries())
            }
        };

        try {
            // LocalStorage has 5MB limit. Full chunks might blow it.
            // Optimized: Only save block IDs.
            localStorage.setItem(this.currentSlot, JSON.stringify(data));
            console.log('Game Saved to ' + this.currentSlot);
            this.showNotification('Game Saved');
        } catch (e) {
            console.error('Save failed', e);
        }
    }

    load() {
        const json = localStorage.getItem(this.currentSlot);
        if (!json) return false;

        try {
            const data = JSON.parse(json);

            // Restore Player
            Object.assign(this.game.player, data.player);
            this.game.player.updateUI();

            // Restore World
            this.game.world.timeOfDay = data.world.timeOfDay;

            // Restore Chunks
            // This requires World to be able to hydrate from JSON
            if (data.world.chunks) {
                // Reconstruct Map
                // This is tricky because JSON arrays vs Map
                // data.world.chunks is [[key, val], ...]
                data.world.chunks.forEach(([key, chunkData]) => {
                    // Need to revive Chunk object properties
                    const chunk = this.game.world.getChunk(chunkData.x, chunkData.y) || this.game.world.generateChunk(chunkData.x, chunkData.y);
                    chunk.blocks = chunkData.blocks; // Assuming direct assignment works
                    this.game.world.chunks.set(key, chunk);
                });
            }

            console.log('Game Loaded');
            return true;
        } catch (e) {
            console.error('Load failed', e);
            return false;
        }
    }

    showNotification(msg) {
        // Todo: simple toast
    }
}
