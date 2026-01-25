import { CONFIG } from '../config.js';

export class SaveManager {
    constructor(game) {
        this.game = game;
        this.lastSaveTime = 0;
        this.currentSlot = 'save_1';
        this.saveVersion = 4; // Increment when save format changes
        
        // Version migration handlers
        this.migrations = {
            1: this.migrateV1toV2.bind(this),
            2: this.migrateV2toV3.bind(this),
            3: this.migrateV3toV4.bind(this)
        };
    }
    
    // Validate save data structure
    validateSaveData(data) {
        const errors = [];
        
        // Required fields
        if (!data.version) errors.push('Missing version');
        if (!data.player) errors.push('Missing player data');
        if (!data.world) errors.push('Missing world data');
        
        // Player validation
        if (data.player) {
            if (typeof data.player.x !== 'number' || isNaN(data.player.x)) {
                errors.push('Invalid player x position');
                data.player.x = 0;
            }
            if (typeof data.player.y !== 'number' || isNaN(data.player.y)) {
                errors.push('Invalid player y position');
                data.player.y = 0;
            }
            if (typeof data.player.z !== 'number' || isNaN(data.player.z)) {
                errors.push('Invalid player z position');
                data.player.z = 10;
            }
            if (typeof data.player.health !== 'number' || data.player.health <= 0) {
                errors.push('Invalid player health');
                data.player.health = CONFIG.PLAYER_MAX_HEALTH;
            }
        }
        
        if (errors.length > 0) {
            console.warn('Save validation issues:', errors);
        }
        
        return { valid: errors.length === 0, errors, data };
    }
    
    // Migrate save data from older versions
    migrateSave(data) {
        let currentVersion = data.version || 1;
        
        while (currentVersion < this.saveVersion) {
            const migrator = this.migrations[currentVersion];
            if (migrator) {
                console.log(`Migrating save from v${currentVersion} to v${currentVersion + 1}`);
                data = migrator(data);
                currentVersion++;
                data.version = currentVersion;
            } else {
                console.warn(`No migration handler for v${currentVersion}`);
                break;
            }
        }
        
        return data;
    }
    
    // Migration: v1 -> v2 (added world seeds)
    migrateV1toV2(data) {
        if (!data.world) data.world = {};
        if (!data.world.seeds) {
            data.world.seeds = {
                noise: Math.random() * 65536,
                biome: Math.random() * 65536,
                humidity: Math.random() * 65536,
                temperature: Math.random() * 65536
            };
        }
        return data;
    }
    
    // Migration: v2 -> v3 (added skills and quests)
    migrateV2toV3(data) {
        if (!data.skills) data.skills = null;
        if (!data.quests) data.quests = null;
        return data;
    }
    
    // Migration: v3 -> v4 (added age progression and equipment)
    migrateV3toV4(data) {
        if (!data.ageProgression) data.ageProgression = null;
        if (!data.player.equipment) {
            data.player.equipment = { head: null, chest: null, legs: null, feet: null };
        }
        return data;
    }
    
    // Create a backup before saving
    createBackup() {
        try {
            const existing = localStorage.getItem(this.currentSlot);
            if (existing) {
                // Keep up to 3 rotating backups
                localStorage.setItem(this.currentSlot + '_backup_2', localStorage.getItem(this.currentSlot + '_backup_1') || '');
                localStorage.setItem(this.currentSlot + '_backup_1', localStorage.getItem(this.currentSlot + '_backup') || '');
                localStorage.setItem(this.currentSlot + '_backup', existing);
                return true;
            }
        } catch (e) {
            console.warn('Backup creation failed:', e);
        }
        return false;
    }
    
    // Recover from backup
    recoverFromBackup(backupIndex = 0) {
        const backupKeys = ['_backup', '_backup_1', '_backup_2'];
        const key = this.currentSlot + (backupKeys[backupIndex] || '_backup');
        
        const backup = localStorage.getItem(key);
        if (backup) {
            try {
                const data = JSON.parse(backup);
                console.log(`Recovering from backup: ${key}`);
                return data;
            } catch (e) {
                console.error('Backup corrupted:', e);
            }
        }
        return null;
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
            version: this.saveVersion, // Use class property
            timestamp: Date.now(),
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
            ageProgression: this.game.ageProgression ? this.game.ageProgression.serialize() : null,
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
            // ====== CIVILIZATION SYSTEM ======
            civilization: this.game.civilization?.serialize() || null,
            // ====== 3D CAMERA STATE ======
            camera3d: this.game.camera3d ? {
                yaw: this.game.camera3d.yaw,
                pitch: this.game.camera3d.pitch
            } : null,
        };

        try {
            // Create backup before overwriting
            this.createBackup();

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
        let json = localStorage.getItem(this.currentSlot);
        
        // Try to recover from backup if main save is missing or corrupted
        if (!json) {
            console.log('No save found, checking backups...');
            for (let i = 0; i < 3; i++) {
                const backupData = this.recoverFromBackup(i);
                if (backupData) {
                    json = JSON.stringify(backupData);
                    break;
                }
            }
        }
        
        if (!json) return false;

        try {
            let data = JSON.parse(json);
            
            // Migrate old saves to current version
            if (data.version < this.saveVersion) {
                data = this.migrateSave(data);
            }
            
            // Validate and fix data
            const validation = this.validateSaveData(data);
            if (!validation.valid) {
                console.warn('Save data had issues, attempting to continue with fixes');
            }
            data = validation.data;
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

            // Restore Age Progression
            if (data.ageProgression && this.game.ageProgression) {
                this.game.ageProgression.deserialize(data.ageProgression);
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
            
            // ====== RESTORE CIVILIZATION SYSTEM ======
            if (data.civilization && this.game.civilization) {
                this.game.civilization.deserialize(data.civilization);
            }
            
            // ====== RESTORE 3D CAMERA STATE ======
            if (data.camera3d && this.game.camera3d) {
                this.game.camera3d.yaw = data.camera3d.yaw || 0;
                this.game.camera3d.pitch = data.camera3d.pitch || 0;
            }
            
            // ====== REBUILD 3D MESHES IF IN 3D MODE ======
            if (this.game.is3D && this.game.renderer3d) {
                console.log('Rebuilding 3D chunk meshes after load...');
                // Clear existing meshes
                this.game.renderer3d.clearAllChunkMeshes();
                // Mark all loaded chunks as dirty
                this.game.world.chunks.forEach((chunk, key) => {
                    this.game.dirtyChunks?.add(key);
                });
                // Rebuild meshes
                if (this.game.buildInitialMeshes) {
                    this.game.buildInitialMeshes();
                }
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
