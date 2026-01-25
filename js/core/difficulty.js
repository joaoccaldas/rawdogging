// Difficulty Settings System
// Manages game difficulty with multiple presets

export class DifficultySystem {
    constructor(game) {
        this.game = game;
        
        // Current difficulty
        this.current = 'normal';
        
        // Difficulty presets
        this.presets = {
            peaceful: {
                name: 'Peaceful',
                description: 'No hostile mobs. Focus on building and exploration.',
                icon: '🕊️',
                settings: {
                    hostileMobSpawn: false,
                    mobDamageMultiplier: 0,
                    playerDamageMultiplier: 1.0,
                    hungerDrainMultiplier: 0.5,
                    naturalRegeneration: true,
                    regenRate: 2.0,
                    keepInventoryOnDeath: true,
                    mobAggression: false,
                    bossSpawn: false,
                    resourceMultiplier: 1.5,
                    experienceMultiplier: 0.5
                }
            },
            easy: {
                name: 'Easy',
                description: 'Reduced enemy damage. Slower hunger drain.',
                icon: '😊',
                settings: {
                    hostileMobSpawn: true,
                    mobDamageMultiplier: 0.5,
                    playerDamageMultiplier: 1.0,
                    hungerDrainMultiplier: 0.75,
                    naturalRegeneration: true,
                    regenRate: 1.5,
                    keepInventoryOnDeath: false,
                    mobAggression: true,
                    bossSpawn: true,
                    resourceMultiplier: 1.25,
                    experienceMultiplier: 0.75
                }
            },
            normal: {
                name: 'Normal',
                description: 'The standard experience. Balanced challenge.',
                icon: '⚔️',
                settings: {
                    hostileMobSpawn: true,
                    mobDamageMultiplier: 1.0,
                    playerDamageMultiplier: 1.0,
                    hungerDrainMultiplier: 1.0,
                    naturalRegeneration: true,
                    regenRate: 1.0,
                    keepInventoryOnDeath: false,
                    mobAggression: true,
                    bossSpawn: true,
                    resourceMultiplier: 1.0,
                    experienceMultiplier: 1.0
                }
            },
            hard: {
                name: 'Hard',
                description: 'Increased enemy damage and aggression. Faster hunger drain.',
                icon: '💀',
                settings: {
                    hostileMobSpawn: true,
                    mobDamageMultiplier: 1.5,
                    playerDamageMultiplier: 1.0,
                    hungerDrainMultiplier: 1.5,
                    naturalRegeneration: true,
                    regenRate: 0.5,
                    keepInventoryOnDeath: false,
                    mobAggression: true,
                    bossSpawn: true,
                    resourceMultiplier: 0.85,
                    experienceMultiplier: 1.25
                }
            },
            hardcore: {
                name: 'Hardcore',
                description: 'One life only. Maximum challenge. World deletes on death.',
                icon: '☠️',
                settings: {
                    hostileMobSpawn: true,
                    mobDamageMultiplier: 2.0,
                    playerDamageMultiplier: 0.8,
                    hungerDrainMultiplier: 2.0,
                    naturalRegeneration: false,
                    regenRate: 0,
                    keepInventoryOnDeath: false,
                    mobAggression: true,
                    bossSpawn: true,
                    resourceMultiplier: 0.75,
                    experienceMultiplier: 2.0,
                    permadeath: true
                }
            },
            creative: {
                name: 'Creative',
                description: 'Unlimited resources. Flight. No damage.',
                icon: '✨',
                settings: {
                    hostileMobSpawn: false,
                    mobDamageMultiplier: 0,
                    playerDamageMultiplier: 0,
                    hungerDrainMultiplier: 0,
                    naturalRegeneration: true,
                    regenRate: 999,
                    keepInventoryOnDeath: true,
                    mobAggression: false,
                    bossSpawn: false,
                    resourceMultiplier: 999,
                    experienceMultiplier: 0,
                    flight: true,
                    instantBreak: true,
                    unlimitedResources: true,
                    invincible: true
                }
            }
        };
        
        // Custom difficulty settings
        this.customSettings = null;
    }
    
    // Set difficulty by name
    setDifficulty(difficultyName) {
        if (!this.presets[difficultyName]) {
            console.warn(`Unknown difficulty: ${difficultyName}`);
            return false;
        }
        
        const oldDifficulty = this.current;
        this.current = difficultyName;
        
        // Apply settings to game systems
        this.applySettings();
        
        // Notify player
        const preset = this.presets[difficultyName];
        this.game.ui?.showNotification?.(`Difficulty set to ${preset.icon} ${preset.name}`, 'info');
        
        // Emit event
        this.game.events?.emit?.('difficultyChanged', {
            from: oldDifficulty,
            to: difficultyName,
            settings: this.getSettings()
        });
        
        return true;
    }
    
    // Get current settings
    getSettings() {
        if (this.customSettings) {
            return this.customSettings;
        }
        return this.presets[this.current]?.settings || this.presets.normal.settings;
    }
    
    // Get specific setting value
    getSetting(settingName) {
        const settings = this.getSettings();
        return settings[settingName];
    }
    
    // Set custom difficulty settings
    setCustomSettings(settings) {
        this.customSettings = { ...this.presets.normal.settings, ...settings };
        this.current = 'custom';
        this.applySettings();
    }
    
    // Apply current settings to game systems
    applySettings() {
        const settings = this.getSettings();
        
        // Apply to player if exists
        if (this.game.player) {
            this.game.player.invincible = settings.invincible || false;
            this.game.player.canFly = settings.flight || false;
        }
        
        // Apply to stamina system
        if (this.game.stamina) {
            this.game.stamina.hungerDrainMultiplier = settings.hungerDrainMultiplier;
            this.game.stamina.thirstDrainMultiplier = settings.hungerDrainMultiplier;
        }
        
        // Apply mob spawn settings
        if (this.game.mobSpawner) {
            this.game.mobSpawner.hostileEnabled = settings.hostileMobSpawn;
        }
        
        // Store for systems that query directly
        this.appliedSettings = settings;
    }
    
    // Calculate damage from mob to player
    calculateMobDamage(baseDamage) {
        const multiplier = this.getSetting('mobDamageMultiplier') || 1;
        return baseDamage * multiplier;
    }
    
    // Calculate damage from player to mob
    calculatePlayerDamage(baseDamage) {
        const multiplier = this.getSetting('playerDamageMultiplier') || 1;
        return baseDamage * multiplier;
    }
    
    // Check if hostile mobs should spawn
    shouldSpawnHostile() {
        return this.getSetting('hostileMobSpawn') !== false;
    }
    
    // Check if bosses can spawn
    canSpawnBoss() {
        return this.getSetting('bossSpawn') !== false;
    }
    
    // Check if player should keep inventory on death
    keepInventoryOnDeath() {
        return this.getSetting('keepInventoryOnDeath') === true;
    }
    
    // Check if this is a permadeath world
    isPermadeath() {
        return this.getSetting('permadeath') === true;
    }
    
    // Check if creative mode
    isCreative() {
        return this.current === 'creative' || this.getSetting('unlimitedResources') === true;
    }
    
    // Get resource drop multiplier
    getResourceMultiplier() {
        return this.getSetting('resourceMultiplier') || 1;
    }
    
    // Get XP multiplier
    getExperienceMultiplier() {
        return this.getSetting('experienceMultiplier') || 1;
    }
    
    // Get natural regeneration rate
    getRegenRate() {
        if (!this.getSetting('naturalRegeneration')) return 0;
        return this.getSetting('regenRate') || 1;
    }
    
    // Check if blocks break instantly (creative)
    instantBreak() {
        return this.getSetting('instantBreak') === true;
    }
    
    // Render difficulty selector UI
    renderDifficultySelector(ctx, x, y, width, height) {
        const presetList = Object.entries(this.presets);
        const buttonHeight = 60;
        const padding = 10;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, width, height);
        
        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT DIFFICULTY', x + width/2, y + 40);
        
        // Difficulty buttons
        let buttonY = y + 70;
        for (const [key, preset] of presetList) {
            const isSelected = this.current === key;
            
            // Button background
            ctx.fillStyle = isSelected ? 'rgba(100, 150, 255, 0.5)' : 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(x + padding, buttonY, width - padding * 2, buttonHeight);
            
            // Border
            ctx.strokeStyle = isSelected ? '#6496FF' : '#444';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + padding, buttonY, width - padding * 2, buttonHeight);
            
            // Icon and name
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 18px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`${preset.icon} ${preset.name}`, x + padding + 15, buttonY + 25);
            
            // Description
            ctx.fillStyle = '#AAA';
            ctx.font = '12px Courier New';
            ctx.fillText(preset.description, x + padding + 15, buttonY + 45);
            
            buttonY += buttonHeight + 5;
        }
        
        ctx.restore();
    }
    
    // Serialize for saving
    serialize() {
        return {
            current: this.current,
            customSettings: this.customSettings
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            this.current = data.current || 'normal';
            this.customSettings = data.customSettings || null;
            this.applySettings();
        }
    }
}
