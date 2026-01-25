// Seasonal Events System
// Time-limited events with unique content, rewards, and themed changes

export class SeasonalEventsSystem {
    constructor(game) {
        this.game = game;
        
        // Current active event
        this.activeEvent = null;
        this.eventProgress = {};
        
        // Event definitions
        this.events = {
            // Spring Events
            spring_festival: {
                name: 'Spring Festival',
                description: 'Flowers bloom everywhere! Special crops and decorations available.',
                season: 'spring',
                startDay: 1,
                duration: 14,
                icon: '🌸',
                rewards: ['flower_crown', 'spring_cape', 'blossom_pet'],
                worldChanges: {
                    flowerSpawnRate: 3,
                    specialCrops: ['rainbow_tulip', 'golden_daisy'],
                    ambientParticles: 'petals'
                },
                quests: [
                    { id: 'collect_flowers', name: 'Flower Collector', goal: 100, type: 'collect', item: 'flower' },
                    { id: 'plant_garden', name: 'Master Gardener', goal: 50, type: 'plant', item: 'crop' }
                ]
            },
            
            easter: {
                name: 'Egg Hunt',
                description: 'Hidden eggs appear throughout the world! Find them for prizes.',
                season: 'spring',
                startDay: 10,
                duration: 7,
                icon: '🥚',
                rewards: ['bunny_ears', 'golden_egg', 'chocolate_sword'],
                worldChanges: {
                    hiddenEggs: true,
                    eggSpawnRate: 50,
                    specialMobs: ['easter_bunny']
                },
                quests: [
                    { id: 'find_eggs', name: 'Egg Hunter', goal: 50, type: 'collect', item: 'easter_egg' },
                    { id: 'golden_eggs', name: 'Golden Discovery', goal: 5, type: 'collect', item: 'golden_egg' }
                ]
            },
            
            // Summer Events
            summer_solstice: {
                name: 'Summer Solstice',
                description: 'The longest day! Special fire-themed activities and bonuses.',
                season: 'summer',
                startDay: 21,
                duration: 3,
                icon: '☀️',
                rewards: ['sun_amulet', 'flame_wings', 'solar_sword'],
                worldChanges: {
                    dayLength: 2,
                    temperature: 1.2,
                    fireResistance: true
                },
                quests: [
                    { id: 'light_bonfires', name: 'Bonfire Night', goal: 10, type: 'build', item: 'bonfire' },
                    { id: 'sun_worship', name: 'Sun Praiser', goal: 1, type: 'special', item: 'sunrise_view' }
                ]
            },
            
            beach_party: {
                name: 'Beach Party',
                description: 'Summer fun at the beaches! Special water activities and items.',
                season: 'summer',
                startDay: 1,
                duration: 30,
                icon: '🏖️',
                rewards: ['surfboard', 'beach_outfit', 'sandcastle_blueprint'],
                worldChanges: {
                    beachLootBonus: 2,
                    specialFish: ['tropical_fish', 'treasure_fish'],
                    waterSpeed: 1.5
                },
                quests: [
                    { id: 'build_sandcastle', name: 'Castle Builder', goal: 3, type: 'build', item: 'sandcastle' },
                    { id: 'catch_fish', name: 'Summer Fishing', goal: 30, type: 'catch', item: 'fish' }
                ]
            },
            
            // Fall Events
            harvest_festival: {
                name: 'Harvest Festival',
                description: 'Celebrate the bountiful harvest with special crops and feasts!',
                season: 'fall',
                startDay: 15,
                duration: 14,
                icon: '🎃',
                rewards: ['cornucopia', 'harvest_hat', 'golden_scythe'],
                worldChanges: {
                    cropYield: 2,
                    specialCrops: ['giant_pumpkin', 'golden_wheat'],
                    ambientParticles: 'leaves'
                },
                quests: [
                    { id: 'harvest_crops', name: 'Master Harvester', goal: 200, type: 'harvest', item: 'crop' },
                    { id: 'cook_feast', name: 'Festival Chef', goal: 10, type: 'craft', item: 'feast_dish' }
                ]
            },
            
            halloween: {
                name: 'Halloween',
                description: 'Spooky season! Monsters are stronger but drop special loot.',
                season: 'fall',
                startDay: 25,
                duration: 7,
                icon: '👻',
                rewards: ['witch_hat', 'vampire_cape', 'ghost_companion'],
                worldChanges: {
                    monsterSpawnRate: 2,
                    nightLength: 1.5,
                    specialMobs: ['headless_horseman', 'pumpkin_king', 'witch'],
                    ambientEffects: 'fog'
                },
                quests: [
                    { id: 'defeat_monsters', name: 'Monster Hunter', goal: 100, type: 'kill', item: 'monster' },
                    { id: 'collect_candy', name: 'Trick or Treat', goal: 50, type: 'collect', item: 'candy' },
                    { id: 'defeat_boss', name: 'Pumpkin Slayer', goal: 1, type: 'kill', item: 'pumpkin_king' }
                ]
            },
            
            // Winter Events
            winter_wonderland: {
                name: 'Winter Wonderland',
                description: 'Snow blankets the world! Special winter activities available.',
                season: 'winter',
                startDay: 1,
                duration: 30,
                icon: '❄️',
                rewards: ['snow_globe', 'ice_skates', 'snowflake_wand'],
                worldChanges: {
                    snowfall: true,
                    iceFormation: true,
                    specialMobs: ['snow_golem', 'ice_elemental']
                },
                quests: [
                    { id: 'build_snowman', name: 'Snowman Builder', goal: 5, type: 'build', item: 'snowman' },
                    { id: 'ice_fishing', name: 'Ice Fisher', goal: 20, type: 'catch', item: 'winter_fish' }
                ]
            },
            
            christmas: {
                name: 'Winterfest',
                description: 'A time of giving! Special presents and festive decorations.',
                season: 'winter',
                startDay: 20,
                duration: 12,
                icon: '🎄',
                rewards: ['santa_hat', 'reindeer_mount', 'gift_cannon'],
                worldChanges: {
                    giftSpawns: true,
                    decorations: true,
                    specialNPCs: ['santa', 'elf'],
                    ambientParticles: 'snow'
                },
                quests: [
                    { id: 'give_gifts', name: 'Gift Giver', goal: 20, type: 'give', item: 'gift' },
                    { id: 'decorate', name: 'Decorator', goal: 30, type: 'place', item: 'decoration' },
                    { id: 'help_santa', name: 'Santa\'s Helper', goal: 1, type: 'special', item: 'santa_quest' }
                ]
            },
            
            new_year: {
                name: 'New Year Celebration',
                description: 'Ring in the new year with fireworks and festivities!',
                season: 'winter',
                startDay: 30,
                duration: 3,
                icon: '🎆',
                rewards: ['party_hat', 'confetti_cannon', 'lucky_charm'],
                worldChanges: {
                    fireworks: true,
                    xpBonus: 2,
                    luckBonus: 1.5
                },
                quests: [
                    { id: 'fireworks', name: 'Pyrotechnician', goal: 20, type: 'use', item: 'firework' },
                    { id: 'party', name: 'Party Animal', goal: 1, type: 'special', item: 'new_year_party' }
                ]
            }
        };
        
        // Season definitions
        this.seasons = {
            spring: { startMonth: 3, endMonth: 5 },
            summer: { startMonth: 6, endMonth: 8 },
            fall: { startMonth: 9, endMonth: 11 },
            winter: { startMonth: 12, endMonth: 2 }
        };
        
        // Player event data
        this.playerData = {
            completedQuests: new Set(),
            earnedRewards: new Set(),
            questProgress: {}
        };
    }
    
    // Get current real-world season
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        
        for (const [season, range] of Object.entries(this.seasons)) {
            if (range.startMonth <= range.endMonth) {
                if (month >= range.startMonth && month <= range.endMonth) {
                    return season;
                }
            } else {
                // Handles winter (Dec-Feb)
                if (month >= range.startMonth || month <= range.endMonth) {
                    return season;
                }
            }
        }
        return 'spring';
    }
    
    // Get current day of season
    getDayOfSeason() {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Simplified: just use day of month
        return day;
    }
    
    // Check for active events
    checkActiveEvents() {
        const season = this.getCurrentSeason();
        const day = this.getDayOfSeason();
        
        for (const [id, event] of Object.entries(this.events)) {
            if (event.season === season) {
                const eventEnd = event.startDay + event.duration;
                
                if (day >= event.startDay && day < eventEnd) {
                    if (!this.activeEvent || this.activeEvent.id !== id) {
                        this.startEvent(id);
                    }
                    return;
                }
            }
        }
        
        // No active event
        if (this.activeEvent) {
            this.endEvent();
        }
    }
    
    // Start an event
    startEvent(eventId) {
        const event = this.events[eventId];
        if (!event) return;
        
        this.activeEvent = {
            id: eventId,
            ...event,
            startTime: Date.now()
        };
        
        // Initialize quest progress
        for (const quest of event.quests) {
            if (!this.playerData.questProgress[quest.id]) {
                this.playerData.questProgress[quest.id] = 0;
            }
        }
        
        // Apply world changes
        this.applyWorldChanges(event.worldChanges);
        
        // Notification
        this.game.ui?.showNotification?.(
            `${event.icon} ${event.name} has begun!`,
            'event',
            5000
        );
        
        console.log(`Event started: ${event.name}`);
    }
    
    // End current event
    endEvent() {
        if (!this.activeEvent) return;
        
        // Revert world changes
        this.revertWorldChanges();
        
        this.game.ui?.showNotification?.(
            `${this.activeEvent.icon} ${this.activeEvent.name} has ended!`,
            'event',
            5000
        );
        
        this.activeEvent = null;
    }
    
    // Apply event world changes
    applyWorldChanges(changes) {
        if (!changes) return;
        
        // Store original values for reverting
        this.originalSettings = {};
        
        if (changes.monsterSpawnRate && this.game.mobSpawner) {
            this.originalSettings.monsterSpawnRate = this.game.mobSpawner.spawnRateMultiplier || 1;
            this.game.mobSpawner.spawnRateMultiplier = changes.monsterSpawnRate;
        }
        
        if (changes.cropYield && this.game.farming) {
            this.originalSettings.cropYield = this.game.farming.yieldMultiplier || 1;
            this.game.farming.yieldMultiplier = changes.cropYield;
        }
        
        if (changes.xpBonus && this.game.player) {
            this.originalSettings.xpBonus = this.game.player.xpMultiplier || 1;
            this.game.player.xpMultiplier = changes.xpBonus;
        }
        
        // Add event-specific ambient particles
        if (changes.ambientParticles) {
            this.startAmbientParticles(changes.ambientParticles);
        }
    }
    
    // Revert world changes
    revertWorldChanges() {
        if (!this.originalSettings) return;
        
        if (this.originalSettings.monsterSpawnRate && this.game.mobSpawner) {
            this.game.mobSpawner.spawnRateMultiplier = this.originalSettings.monsterSpawnRate;
        }
        
        if (this.originalSettings.cropYield && this.game.farming) {
            this.game.farming.yieldMultiplier = this.originalSettings.cropYield;
        }
        
        if (this.originalSettings.xpBonus && this.game.player) {
            this.game.player.xpMultiplier = this.originalSettings.xpBonus;
        }
        
        this.stopAmbientParticles();
        this.originalSettings = null;
    }
    
    // Start ambient particles for event
    startAmbientParticles(type) {
        this.ambientParticleType = type;
        this.ambientParticleTimer = 0;
    }
    
    // Stop ambient particles
    stopAmbientParticles() {
        this.ambientParticleType = null;
    }
    
    // Progress a quest
    progressQuest(questId, amount = 1) {
        if (!this.activeEvent) return;
        
        const quest = this.activeEvent.quests.find(q => q.id === questId);
        if (!quest) return;
        
        if (this.playerData.completedQuests.has(questId)) return;
        
        this.playerData.questProgress[questId] = 
            (this.playerData.questProgress[questId] || 0) + amount;
        
        // Check completion
        if (this.playerData.questProgress[questId] >= quest.goal) {
            this.completeQuest(questId);
        }
    }
    
    // Complete a quest
    completeQuest(questId) {
        if (!this.activeEvent) return;
        
        const quest = this.activeEvent.quests.find(q => q.id === questId);
        if (!quest) return;
        
        this.playerData.completedQuests.add(questId);
        
        this.game.ui?.showNotification?.(
            `✅ Quest Complete: ${quest.name}!`,
            'success',
            3000
        );
        
        this.game.audio?.play('quest_complete');
        
        // Check if all quests complete for bonus reward
        this.checkAllQuestsComplete();
    }
    
    // Check if all event quests are complete
    checkAllQuestsComplete() {
        if (!this.activeEvent) return;
        
        const allComplete = this.activeEvent.quests.every(q => 
            this.playerData.completedQuests.has(q.id)
        );
        
        if (allComplete) {
            this.grantEventReward();
        }
    }
    
    // Grant event completion reward
    grantEventReward() {
        if (!this.activeEvent) return;
        
        const rewardId = `${this.activeEvent.id}_complete`;
        if (this.playerData.earnedRewards.has(rewardId)) return;
        
        this.playerData.earnedRewards.add(rewardId);
        
        // Grant all event rewards
        for (const reward of this.activeEvent.rewards) {
            this.game.inventory?.addItem?.({
                id: reward,
                name: reward.replace(/_/g, ' '),
                isEventItem: true,
                eventId: this.activeEvent.id
            });
        }
        
        this.game.ui?.showNotification?.(
            `🎉 Event Complete! Rewards earned!`,
            'legendary',
            5000
        );
        
        // Achievement
        this.game.achievements?.unlock?.(`event_${this.activeEvent.id}`);
    }
    
    // Get remaining time for event
    getRemainingTime() {
        if (!this.activeEvent) return null;
        
        const season = this.getCurrentSeason();
        const day = this.getDayOfSeason();
        const eventEnd = this.activeEvent.startDay + this.activeEvent.duration;
        
        const daysLeft = eventEnd - day;
        
        return {
            days: daysLeft,
            formatted: daysLeft === 1 ? '1 day left' : `${daysLeft} days left`
        };
    }
    
    // Get quest progress
    getQuestProgress(questId) {
        if (!this.activeEvent) return null;
        
        const quest = this.activeEvent.quests.find(q => q.id === questId);
        if (!quest) return null;
        
        return {
            current: this.playerData.questProgress[questId] || 0,
            goal: quest.goal,
            completed: this.playerData.completedQuests.has(questId)
        };
    }
    
    update(deltaTime) {
        // Check for event changes periodically
        this.eventCheckTimer = (this.eventCheckTimer || 0) + deltaTime;
        if (this.eventCheckTimer >= 60) { // Check every minute
            this.eventCheckTimer = 0;
            this.checkActiveEvents();
        }
        
        // Spawn ambient particles
        if (this.ambientParticleType && this.game.particles) {
            this.ambientParticleTimer += deltaTime;
            
            if (this.ambientParticleTimer >= 0.1) {
                this.ambientParticleTimer = 0;
                this.spawnAmbientParticle();
            }
        }
    }
    
    spawnAmbientParticle() {
        const player = this.game.player;
        if (!player) return;
        
        const configs = {
            petals: { color: '#FFB7C5', size: 4, gravity: 0.3 },
            leaves: { color: '#CD853F', size: 5, gravity: 0.4 },
            snow: { color: '#FFFFFF', size: 3, gravity: 0.2 },
            confetti: { colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'], size: 4, gravity: 0.3 }
        };
        
        const config = configs[this.ambientParticleType];
        if (!config) return;
        
        const x = player.x + (Math.random() - 0.5) * 30;
        const y = player.y + (Math.random() - 0.5) * 30;
        const z = player.z + 10 + Math.random() * 5;
        
        const color = config.colors ? 
            config.colors[Math.floor(Math.random() * config.colors.length)] : 
            config.color;
        
        this.game.particles.emit({
            x, y, z,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            vz: -1,
            color: color,
            size: config.size,
            life: 3 + Math.random() * 2,
            gravity: config.gravity
        });
    }
    
    render(ctx) {
        if (!this.activeEvent) return;
        
        // Render event banner at top of screen
        this.renderEventBanner(ctx);
    }
    
    renderEventBanner(ctx) {
        const canvas = ctx.canvas;
        const event = this.activeEvent;
        const remaining = this.getRemainingTime();
        
        ctx.save();
        
        // Banner background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 150, 5, 300, 35);
        
        // Event info
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(
            `${event.icon} ${event.name} - ${remaining?.formatted || ''}`,
            canvas.width / 2,
            27
        );
        
        ctx.restore();
    }
    
    // Render event quests panel
    renderQuestsPanel(ctx, x, y) {
        if (!this.activeEvent) return;
        
        const event = this.activeEvent;
        const panelWidth = 250;
        const panelHeight = 30 + event.quests.length * 40;
        
        ctx.save();
        
        // Panel background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`${event.icon} Event Quests`, x + 10, y + 20);
        
        // Quests
        let questY = y + 45;
        for (const quest of event.quests) {
            const progress = this.getQuestProgress(quest.id);
            const percent = progress.current / progress.goal;
            
            // Quest name
            ctx.fillStyle = progress.completed ? '#00FF00' : '#FFF';
            ctx.font = '12px Courier New';
            ctx.fillText(quest.name, x + 10, questY);
            
            // Progress bar
            ctx.fillStyle = '#333';
            ctx.fillRect(x + 10, questY + 5, panelWidth - 20, 10);
            
            ctx.fillStyle = progress.completed ? '#00FF00' : '#6496FF';
            ctx.fillRect(x + 10, questY + 5, (panelWidth - 20) * Math.min(1, percent), 10);
            
            // Progress text
            ctx.fillStyle = '#AAA';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText(
                progress.completed ? '✓' : `${progress.current}/${progress.goal}`,
                x + panelWidth - 10,
                questY
            );
            ctx.textAlign = 'left';
            
            questY += 40;
        }
        
        ctx.restore();
    }
    
    // Serialize for saving
    serialize() {
        return {
            playerData: {
                completedQuests: Array.from(this.playerData.completedQuests),
                earnedRewards: Array.from(this.playerData.earnedRewards),
                questProgress: this.playerData.questProgress
            }
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.playerData) {
            this.playerData.completedQuests = new Set(data.playerData.completedQuests || []);
            this.playerData.earnedRewards = new Set(data.playerData.earnedRewards || []);
            this.playerData.questProgress = data.playerData.questProgress || {};
        }
        
        // Check for active events on load
        this.checkActiveEvents();
    }
}
