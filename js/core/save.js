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
            version: 3, // Increment when save format changes
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
                firstSteps: this.game.firstSteps,
                introCinematic: this.game.introCinematic
            },
            world: {
                seeds: {
                    noise: this.game.world.noise.seed,
                    biome: this.game.world.biomeNoise.seed,
                    humidity: this.game.world.humidityNoise.seed,
                    temperature: this.game.world.temperatureNoise.seed
                },
                timeOfDay: this.game.world.timeOfDay,
                dayCount: this.game.world.dayCount || 0,
                // Only save chunks that have been modified
                chunks: Array.from(this.game.world.chunks.values())
                    .filter(c => c.isModified)
                    .map(c => c.serialize())
            },
            // Skills system
            skills: this.game.skills ? this.game.skills.serialize() : null,
            // Quest system
            quests: this.game.questManager ? this.game.questManager.serialize() : null,
            // Taming system
            taming: this.game.taming ? this.game.taming.serialize() : null,
            // ====== NEW SYSTEMS ======
            weather: this.game.weather ? this.game.weather.serialize() : null,
            armor: this.game.armor ? this.game.armor.serialize() : null,
            statistics: this.game.statistics ? this.game.statistics.serialize() : null,
            temperature: this.game.temperature ? this.game.temperature.serialize() : null,
            foodBuffs: this.game.foodBuffs ? this.game.foodBuffs.serialize() : null,
            homeBeacons: this.game.homeBeacons ? this.game.homeBeacons.serialize() : null,
            // ====== 20 NEW SYSTEMS ======
            stamina: this.game.stamina?.serialize() || null,
            statusEffects: this.game.statusEffects?.serialize() || null,
            craftingStations: this.game.craftingStations?.serialize() || null,
            storage: this.game.storage?.serialize() || null,
            farming: this.game.farming?.serialize() || null,
            petCommands: this.game.petCommands?.serialize() || null,
            combos: this.game.combos?.serialize() || null,
            achievements: this.game.achievements?.serialize() || null,
            mapMarkers: this.game.mapMarkers?.serialize() || null,
            worldEvents: this.game.worldEvents?.serialize() || null,
            enchantments: this.game.enchantments?.serialize() || null,
            swimming: this.game.swimming?.serialize() || null,
            npcTrading: this.game.npcTrading?.serialize() || null,
            bossSummoning: this.game.bossSummoning?.serialize() || null,
            dayNightVisuals: this.game.dayNightVisuals?.serialize() || null,
            buildingSnapGrid: this.game.buildingSnapGrid?.serialize() || null,
            torchLighting: this.game.torchLighting?.serialize() || null,
            damageNumbers: this.game.damageNumbers?.serialize() || null,
            // ====== 20 ADDITIONAL FEATURE SYSTEMS ======
            toolDurability: this.game.toolDurability?.serialize() || null,
            difficulty: this.game.difficulty?.serialize() || null,
            bestiary: this.game.bestiary?.serialize() || null,
            mapCraft: this.game.mapCraft?.serialize() || null,
            fishing: this.game.fishing?.serialize() || null,
            potions: this.game.potions?.serialize() || null,
            grappling: this.game.grappling?.serialize() || null,
            dungeons: this.game.dungeons?.serialize() || null,
            seasonalEvents: this.game.seasonalEvents?.serialize() || null,
            blueprints: this.game.blueprints?.serialize() || null,
        };

        try {
            // Backup existing save if present - try but don't fail if backup exceeds quota
            try {
                const existing = localStorage.getItem(this.currentSlot);
                if (existing) {
                    localStorage.setItem(this.currentSlot + '_backup', existing);
                }
            } catch (backupError) {
                console.warn('Backup failed, likely quota limit but proceeding with primary save', backupError);
            }

            // LocalStorage has 5MB limit. Full chunks might blow it.
            const saveString = JSON.stringify(data);
            localStorage.setItem(this.currentSlot, saveString);
            console.log(`Game Saved to ${this.currentSlot} (${(saveString.length / 1024).toFixed(1)} KB)`);
            this.showNotification('Game Saved (Backup Created)');
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
            this.game.firstSteps = data.player.firstSteps || false;
            this.game.introCinematic = data.player.introCinematic || false;
            this.game.player.updateUI();

            // Restore World Seeds for deterministic generation
            if (data.world.seeds) {
                this.game.world.noise.seed = data.world.seeds.noise;
                this.game.world.biomeNoise.seed = data.world.seeds.biome;
                this.game.world.humidityNoise.seed = data.world.seeds.humidity;
                this.game.world.temperatureNoise.seed = data.world.seeds.temperature;

                // Re-initialize noise objects with restored seeds
                this.game.world.noise = new (this.game.world.noise.constructor)(data.world.seeds.noise);
                this.game.world.biomeNoise = new (this.game.world.biomeNoise.constructor)(data.world.seeds.biome);
                this.game.world.humidityNoise = new (this.game.world.humidityNoise.constructor)(data.world.seeds.humidity);
                this.game.world.temperatureNoise = new (this.game.world.temperatureNoise.constructor)(data.world.seeds.temperature);
            }

            // Restore Chunks (Modified ones only)
            if (data.world.chunks && this.game.world.loadSerializedChunks) {
                this.game.world.loadSerializedChunks(data.world.chunks);
                // Mark loaded chunks as modified so they persist on next save
                this.game.world.chunks.forEach(chunk => {
                    chunk.isModified = true;
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

            // ====== RESTORE NEW SYSTEMS ======

            // Restore Weather
            if (data.weather && this.game.weather) {
                this.game.weather.deserialize(data.weather);
            }

            // Restore Armor
            if (data.armor && this.game.armor) {
                this.game.armor.deserialize(data.armor);
            }

            // Restore Statistics
            if (data.statistics && this.game.statistics) {
                this.game.statistics.deserialize(data.statistics);
            }

            // Restore Temperature
            if (data.temperature && this.game.temperature) {
                this.game.temperature.deserialize(data.temperature);
            }

            // Restore Food Buffs
            if (data.foodBuffs && this.game.foodBuffs) {
                this.game.foodBuffs.deserialize(data.foodBuffs);
            }

            // Restore Home Beacons
            if (data.homeBeacons && this.game.homeBeacons) {
                this.game.homeBeacons.deserialize(data.homeBeacons);
            }

            // ====== RESTORE 20 NEW SYSTEMS ======
            if (data.stamina && this.game.stamina) this.game.stamina.deserialize(data.stamina);
            if (data.statusEffects && this.game.statusEffects) this.game.statusEffects.deserialize(data.statusEffects);
            if (data.craftingStations && this.game.craftingStations) this.game.craftingStations.deserialize(data.craftingStations);
            if (data.storage && this.game.storage) this.game.storage.deserialize(data.storage);
            if (data.farming && this.game.farming) this.game.farming.deserialize(data.farming);
            if (data.petCommands && this.game.petCommands) this.game.petCommands.deserialize(data.petCommands);
            if (data.combos && this.game.combos) this.game.combos.deserialize(data.combos);
            if (data.achievements && this.game.achievements) this.game.achievements.deserialize(data.achievements);
            if (data.mapMarkers && this.game.mapMarkers) this.game.mapMarkers.deserialize(data.mapMarkers);
            if (data.worldEvents && this.game.worldEvents) this.game.worldEvents.deserialize(data.worldEvents);
            if (data.enchantments && this.game.enchantments) this.game.enchantments.deserialize(data.enchantments);
            if (data.swimming && this.game.swimming) this.game.swimming.deserialize(data.swimming);
            if (data.npcTrading && this.game.npcTrading) this.game.npcTrading.deserialize(data.npcTrading);
            if (data.bossSummoning && this.game.bossSummoning) this.game.bossSummoning.deserialize(data.bossSummoning);
            if (data.dayNightVisuals && this.game.dayNightVisuals) this.game.dayNightVisuals.deserialize(data.dayNightVisuals);
            if (data.buildingSnapGrid && this.game.buildingSnapGrid) this.game.buildingSnapGrid.deserialize(data.buildingSnapGrid);
            if (data.torchLighting && this.game.torchLighting) this.game.torchLighting.deserialize(data.torchLighting);
            if (data.damageNumbers && this.game.damageNumbers) this.game.damageNumbers.deserialize(data.damageNumbers);

            // ====== RESTORE 20 ADDITIONAL FEATURE SYSTEMS ======
            if (data.toolDurability && this.game.toolDurability) this.game.toolDurability.deserialize(data.toolDurability);
            if (data.difficulty && this.game.difficulty) this.game.difficulty.deserialize(data.difficulty);
            if (data.bestiary && this.game.bestiary) this.game.bestiary.deserialize(data.bestiary);
            if (data.mapCraft && this.game.mapCraft) this.game.mapCraft.deserialize(data.mapCraft);
            if (data.fishing && this.game.fishing) this.game.fishing.deserialize(data.fishing);
            if (data.potions && this.game.potions) this.game.potions.deserialize(data.potions);
            if (data.grappling && this.game.grappling) this.game.grappling.deserialize(data.grappling);
            if (data.dungeons && this.game.dungeons) this.game.dungeons.deserialize(data.dungeons);
            if (data.seasonalEvents && this.game.seasonalEvents) this.game.seasonalEvents.deserialize(data.seasonalEvents);
            if (data.blueprints && this.game.blueprints) this.game.blueprints.deserialize(data.blueprints);

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
