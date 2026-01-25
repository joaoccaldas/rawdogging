// Fishing System
// Complete fishing minigame with rod mechanics, bait, and catches

export class FishingSystem {
    constructor(game) {
        this.game = game;
        
        // Fishing state
        this.isFishing = false;
        this.castPosition = null;
        this.bobberPosition = null;
        this.fishingProgress = 0;
        this.currentFish = null;
        
        // Minigame state
        this.minigameActive = false;
        this.catchZone = { position: 0.5, size: 0.2 };
        this.fishPosition = 0.5;
        this.fishDirection = 1;
        this.fishSpeed = 0;
        this.catchProgress = 0;
        this.reelSpeed = 0;
        
        // Timing
        this.castTime = 0;
        this.waitTime = 0;
        this.biteTime = 0;
        this.hasBite = false;
        
        // Equipment
        this.currentRod = null;
        this.currentBait = null;
        
        // Fish database
        this.fishDatabase = {
            // Common fish
            bass: { name: 'Bass', rarity: 'common', weight: [0.5, 3], difficulty: 0.3, value: 10, season: 'any' },
            trout: { name: 'Trout', rarity: 'common', weight: [0.3, 2], difficulty: 0.25, value: 8, season: 'any' },
            perch: { name: 'Perch', rarity: 'common', weight: [0.2, 1.5], difficulty: 0.2, value: 6, season: 'any' },
            catfish: { name: 'Catfish', rarity: 'common', weight: [1, 5], difficulty: 0.35, value: 15, season: 'any' },
            
            // Uncommon fish
            salmon: { name: 'Salmon', rarity: 'uncommon', weight: [2, 8], difficulty: 0.5, value: 25, season: 'autumn' },
            pike: { name: 'Pike', rarity: 'uncommon', weight: [3, 10], difficulty: 0.55, value: 30, season: 'any' },
            carp: { name: 'Carp', rarity: 'uncommon', weight: [2, 7], difficulty: 0.4, value: 20, season: 'summer' },
            
            // Rare fish
            golden_trout: { name: 'Golden Trout', rarity: 'rare', weight: [1, 4], difficulty: 0.7, value: 100, season: 'spring' },
            sturgeon: { name: 'Sturgeon', rarity: 'rare', weight: [10, 50], difficulty: 0.75, value: 150, season: 'winter' },
            electric_eel: { name: 'Electric Eel', rarity: 'rare', weight: [5, 15], difficulty: 0.8, value: 120, season: 'any' },
            
            // Seasonal specials
            spring_koi: { name: 'Spring Koi', rarity: 'rare', weight: [2, 6], difficulty: 0.65, value: 180, season: 'spring' },
            summer_sunfish: { name: 'Summer Sunfish', rarity: 'uncommon', weight: [0.5, 2], difficulty: 0.35, value: 45, season: 'summer' },
            autumn_char: { name: 'Autumn Char', rarity: 'rare', weight: [3, 8], difficulty: 0.6, value: 130, season: 'autumn' },
            ice_fish: { name: 'Ice Fish', rarity: 'rare', weight: [1, 3], difficulty: 0.7, value: 200, season: 'winter' },
            
            // Legendary
            ghost_fish: { name: 'Ghost Fish', rarity: 'legendary', weight: [0.1, 0.5], difficulty: 0.9, value: 500, season: 'any', nightOnly: true },
            leviathan_fry: { name: 'Leviathan Fry', rarity: 'legendary', weight: [20, 100], difficulty: 0.95, value: 1000, season: 'any' },
            dragon_koi: { name: 'Dragon Koi', rarity: 'legendary', weight: [5, 15], difficulty: 0.92, value: 800, season: 'any' },
            phoenix_fish: { name: 'Phoenix Fish', rarity: 'legendary', weight: [1, 3], difficulty: 0.88, value: 750, season: 'any', eventOnly: 'blood_moon' },
            
            // Junk
            old_boot: { name: 'Old Boot', rarity: 'junk', weight: [0.5, 2], difficulty: 0.1, value: 1, isJunk: true },
            seaweed: { name: 'Seaweed', rarity: 'junk', weight: [0.1, 0.5], difficulty: 0.1, value: 2, isJunk: true },
            treasure_chest: { name: 'Treasure Chest', rarity: 'treasure', weight: [5, 20], difficulty: 0.6, value: 0, isTreasure: true }
        };
        
        // Rod configurations
        this.rodConfigs = {
            fishing_rod: { castDistance: 5, luck: 0, reelSpeed: 1, durability: 50 },
            basic_rod: { castDistance: 5, luck: 0, reelSpeed: 1, durability: 50 },
            improved_rod: { castDistance: 8, luck: 0.1, reelSpeed: 1.2, durability: 100 },
            master_rod: { castDistance: 12, luck: 0.2, reelSpeed: 1.5, durability: 200 },
            legendary_rod: { castDistance: 15, luck: 0.35, reelSpeed: 2, durability: 500 }
        };
        
        // Bait configurations
        this.baitConfigs = {
            worm: { rarityBonus: 0, biteSpeed: 1.2, name: 'Worm' },
            bait: { rarityBonus: 0, biteSpeed: 1.2, name: 'Basic Bait' },
            cricket: { rarityBonus: 0.05, biteSpeed: 1.3, name: 'Cricket' },
            minnow: { rarityBonus: 0.1, biteSpeed: 1.5, name: 'Minnow' },
            golden_lure: { rarityBonus: 0.25, biteSpeed: 2, name: 'Golden Lure' }
        };
        
        // Fishing stats
        this.stats = {
            totalCatches: 0,
            biggestFish: null,
            biggestWeight: 0,
            rarestCatch: null,
            fishCaught: {},
            legendariesCaught: 0
        };
    }
    
    // Get current season
    getCurrentSeason() {
        if (this.game.seasonalEvents?.currentSeason) {
            return this.game.seasonalEvents.currentSeason;
        }
        // Default based on game time
        const day = this.game.world?.day || 0;
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        return seasons[Math.floor(day / 7) % 4];
    }
    
    // Check if can fish at position
    canFishAt(x, y) {
        if (!this.game.world) return false;
        
        // Check if there's water nearby
        const block = this.game.world.getBlock(Math.floor(x), Math.floor(y), 0);
        return block === 'water' || block === 'deep_water';
    }
    
    // Start fishing with rod item
    useFishingRod() {
        const player = this.game.player;
        if (!player) return false;
        
        // Check for water nearby
        const facingAngle = player.facingAngle || 0;
        const checkX = player.x + Math.cos(facingAngle) * 3;
        const checkY = player.y + Math.sin(facingAngle) * 3;
        
        if (!this.canFishAt(checkX, checkY)) {
            this.game.ui?.showNotification?.('No water in that direction!', 'warning');
            return false;
        }
        
        return this.startCast();
    }
    
    // Start casting
    startCast() {
        const player = this.game.player;
        if (!player) return false;
        
        // Check for fishing rod
        const heldItem = player.getHeldItem?.() || this.game.inventory?.getSelectedItem?.();
        if (!heldItem || !heldItem.id.includes('rod')) {
            this.game.ui?.showNotification?.('You need a fishing rod!', 'warning');
            return false;
        }
        
        this.currentRod = this.rodConfigs[heldItem.id] || this.rodConfigs.basic_rod;
        
        // Check for bait
        const baitItem = this.game.inventory?.findItem?.(item => 
            this.baitConfigs[item.id] !== undefined
        );
        this.currentBait = baitItem ? this.baitConfigs[baitItem.id] : null;
        
        this.isFishing = true;
        this.castTime = 0;
        this.waitTime = 0;
        this.hasBite = false;
        this.minigameActive = false;
        
        return true;
    }
    
    // Complete the cast (determine landing position)
    completeCast(power = 1) {
        const player = this.game.player;
        if (!player || !this.isFishing) return;
        
        // Calculate cast position
        const distance = this.currentRod.castDistance * power;
        const angle = player.facingAngle || 0;
        
        this.bobberPosition = {
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            z: 0.2
        };
        
        // Check if valid water position
        if (!this.canFishAt(this.bobberPosition.x, this.bobberPosition.y)) {
            this.game.ui?.showNotification?.('No water there!', 'warning');
            this.cancelFishing();
            return;
        }
        
        // Play cast sound
        this.game.audio?.play('cast');
        
        // Spawn splash particles
        this.spawnSplash(this.bobberPosition.x, this.bobberPosition.y);
        
        // Determine wait time for bite
        let baseWait = 3 + Math.random() * 7; // 3-10 seconds
        if (this.currentBait) {
            baseWait /= this.currentBait.biteSpeed;
        }
        
        this.biteTime = baseWait;
        this.waitTime = 0;
    }
    
    // Check for bite (called during wait)
    checkBite() {
        if (!this.isFishing || this.minigameActive || this.hasBite) return;
        
        if (this.waitTime >= this.biteTime) {
            this.triggerBite();
        }
    }
    
    // Fish is biting!
    triggerBite() {
        this.hasBite = true;
        
        // Determine what fish
        this.currentFish = this.selectFish();
        
        // Play bite sound
        this.game.audio?.play('splash');
        
        // Show notification
        this.game.ui?.showNotification?.('Something\'s biting!', 'info');
        
        // Player has limited time to react
        this.biteTimer = 2; // 2 seconds to react
    }
    
    // Select fish based on location, rod, bait, time, season
    selectFish() {
        let luck = this.currentRod?.luck || 0;
        if (this.currentBait) luck += this.currentBait.rarityBonus;
        
        const currentSeason = this.getCurrentSeason();
        const isNight = this.game.world?.isNightTime?.() || false;
        const activeEvents = this.game.worldEvents?.getActiveEvents?.() || [];
        const activeEventIds = activeEvents.map(e => e.type);
        
        // Build weighted selection
        const fishList = Object.entries(this.fishDatabase);
        const weighted = [];
        
        for (const [id, fish] of fishList) {
            // Check season availability
            if (fish.season && fish.season !== 'any' && fish.season !== currentSeason) {
                continue; // Fish not available this season
            }
            
            // Check night-only fish
            if (fish.nightOnly && !isNight) {
                continue;
            }
            
            // Check event-only fish
            if (fish.eventOnly && !activeEventIds.includes(fish.eventOnly)) {
                continue;
            }
            
            let weight = 1;
            
            switch (fish.rarity) {
                case 'junk': weight = 20 - luck * 50; break;
                case 'common': weight = 50; break;
                case 'uncommon': weight = 20 + luck * 20; break;
                case 'rare': weight = 5 + luck * 30; break;
                case 'legendary': weight = 1 + luck * 10; break;
                case 'treasure': weight = 3 + luck * 15; break;
            }
            
            // Bonus for seasonal fish during their season
            if (fish.season === currentSeason) {
                weight *= 2;
            }
            
            // Bonus during Aurora event for rare fish
            if (activeEventIds.includes('aurora') && (fish.rarity === 'rare' || fish.rarity === 'legendary')) {
                weight *= 1.5;
            }
            
            weight = Math.max(0, weight);
            weighted.push({ id, fish, weight });
        }
        
        // Select
        const total = weighted.reduce((sum, w) => sum + w.weight, 0);
        let roll = Math.random() * total;
        
        for (const w of weighted) {
            roll -= w.weight;
            if (roll <= 0) {
                // Calculate actual weight
                const minW = w.fish.weight[0];
                const maxW = w.fish.weight[1];
                const actualWeight = minW + Math.random() * (maxW - minW);
                
                return {
                    id: w.id,
                    ...w.fish,
                    actualWeight: Math.round(actualWeight * 100) / 100
                };
            }
        }
        
        return { id: 'bass', ...this.fishDatabase.bass, actualWeight: 1 };
    }
    
    // Start minigame when player reacts to bite
    startMinigame() {
        if (!this.hasBite || !this.currentFish) return;
        
        this.minigameActive = true;
        this.catchProgress = 0;
        this.fishPosition = 0.5;
        this.fishDirection = 1;
        this.fishSpeed = this.currentFish.difficulty * 2;
        
        // Catch zone size based on rod and fish difficulty
        this.catchZone.size = 0.15 + (this.currentRod?.reelSpeed || 1) * 0.05 - this.currentFish.difficulty * 0.1;
        this.catchZone.size = Math.max(0.1, Math.min(0.3, this.catchZone.size));
    }
    
    // Reel in (hold to move catch zone up)
    reel(isReeling) {
        if (!this.minigameActive) return;
        
        if (isReeling) {
            this.reelSpeed = 0.03 * (this.currentRod?.reelSpeed || 1);
        } else {
            this.reelSpeed = -0.02; // Zone falls when not reeling
        }
    }
    
    // Cancel fishing
    cancelFishing() {
        this.isFishing = false;
        this.hasBite = false;
        this.minigameActive = false;
        this.currentFish = null;
        this.bobberPosition = null;
    }
    
    // Catch success
    catchFish() {
        if (!this.currentFish) return;
        
        const fish = this.currentFish;
        
        // Consume bait
        if (this.currentBait) {
            this.game.inventory?.removeItem?.(Object.keys(this.baitConfigs).find(
                k => this.baitConfigs[k] === this.currentBait
            ), 1);
        }
        
        // Reduce rod durability
        if (this.game.toolDurability && this.currentRod) {
            const rodId = Object.keys(this.rodConfigs).find(
                k => this.rodConfigs[k] === this.currentRod
            );
            if (rodId) {
                this.game.toolDurability.useTool?.(rodId);
            }
        }
        
        // Handle different catch types
        if (fish.isTreasure) {
            // Open treasure
            this.openTreasure();
        } else if (!fish.isJunk) {
            // Add fish to inventory
            this.game.player?.addItem?.(fish.id, 1);
            
            // Update stats
            this.stats.totalCatches++;
            this.stats.fishCaught[fish.id] = (this.stats.fishCaught[fish.id] || 0) + 1;
            
            if (fish.actualWeight > this.stats.biggestWeight) {
                this.stats.biggestWeight = fish.actualWeight;
                this.stats.biggestFish = fish.id;
            }
            
            // Track legendary catches
            if (fish.rarity === 'legendary') {
                this.stats.legendariesCaught++;
                this.stats.rarestCatch = fish.id;
                
                // Achievement
                this.game.achievements?.unlock?.('legendary_angler');
                
                // Special effects for legendary
                this.game.particles?.spawn?.(this.bobberPosition.x, this.bobberPosition.y, 1, {
                    type: 'magic',
                    count: 30,
                    color: '#FFD700'
                });
            }
            
            // Discover in bestiary
            this.game.bestiary?.discoverCreature?.(`fish_${fish.id}`);
        } else {
            // Junk
            this.game.player?.addItem?.(fish.id, 1);
        }
        
        // Notification with color based on rarity
        const rarityColors = {
            junk: '#888888',
            common: '#FFFFFF',
            uncommon: '#55FF55',
            rare: '#5555FF',
            legendary: '#FFAA00',
            treasure: '#FFD700'
        };
        
        this.game.ui?.showNotification?.(
            `🎣 Caught: ${fish.name} (${fish.actualWeight}kg)`,
            fish.rarity === 'legendary' ? 'success' : 'info'
        );
        
        // Effects
        this.game.audio?.play('catch');
        this.spawnCatchParticles();
        
        // XP based on rarity
        const xpByRarity = {
            junk: 2,
            common: 5,
            uncommon: 15,
            rare: 40,
            legendary: 150,
            treasure: 50
        };
        const xp = xpByRarity[fish.rarity] || fish.value || 5;
        this.game.player?.addXP?.(xp);
        
        // Fishing skill XP
        this.game.skills?.addXP?.('fishing', xp);
        
        // Check achievements
        this.game.achievements?.checkProgress?.('fish_caught', 1);
        if (this.stats.totalCatches >= 100) {
            this.game.achievements?.unlock?.('master_angler');
        }
        
        this.cancelFishing();
    }
    
    // Fish escaped
    fishEscaped() {
        this.game.ui?.showNotification?.('The fish got away!', 'warning');
        this.game.audio?.play('splash');
        this.cancelFishing();
    }
    
    openTreasure() {
        // Random loot
        const lootTable = [
            { id: 'gold_coin', amount: [5, 20] },
            { id: 'diamond', amount: [1, 3] },
            { id: 'ancient_relic', amount: [1, 1] },
            { id: 'enchanted_book', amount: [1, 1] }
        ];
        
        const loot = lootTable[Math.floor(Math.random() * lootTable.length)];
        const amount = loot.amount[0] + Math.floor(Math.random() * (loot.amount[1] - loot.amount[0] + 1));
        
        this.game.inventory?.addItem?.({
            id: loot.id,
            amount: amount
        });
        
        this.game.ui?.showNotification?.(`Found treasure: ${loot.id} x${amount}!`, 'success');
    }
    
    spawnSplash(x, y) {
        if (!this.game.particles) return;
        
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            this.game.particles.emit({
                x: x,
                y: y,
                z: 0.2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: 2 + Math.random() * 2,
                color: '#4169E1',
                size: 3 + Math.random() * 3,
                life: 0.5,
                gravity: 1
            });
        }
    }
    
    spawnCatchParticles() {
        if (!this.game.particles || !this.bobberPosition) return;
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.game.particles.emit({
                x: this.bobberPosition.x,
                y: this.bobberPosition.y,
                z: 0.5,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: 3 + Math.random() * 2,
                color: Math.random() > 0.5 ? '#4169E1' : '#87CEEB',
                size: 4 + Math.random() * 4,
                life: 0.8,
                gravity: 0.8
            });
        }
    }
    
    update(deltaTime) {
        if (!this.isFishing) return;
        
        if (!this.minigameActive) {
            // Waiting for bite
            this.waitTime += deltaTime;
            this.checkBite();
            
            // Check bite timeout
            if (this.hasBite) {
                this.biteTimer -= deltaTime;
                if (this.biteTimer <= 0) {
                    this.fishEscaped();
                }
            }
            
            // Bobber animation
            if (this.bobberPosition) {
                this.bobberPosition.z = 0.2 + Math.sin(Date.now() / 300) * 0.05;
                if (this.hasBite) {
                    this.bobberPosition.z -= 0.15 + Math.sin(Date.now() / 50) * 0.1;
                }
            }
        } else {
            // Minigame active
            this.updateMinigame(deltaTime);
        }
    }
    
    updateMinigame(deltaTime) {
        // Move fish erratically
        if (Math.random() < 0.05) {
            this.fishDirection *= -1;
        }
        if (Math.random() < 0.02) {
            this.fishSpeed = this.currentFish.difficulty * (1 + Math.random());
        }
        
        this.fishPosition += this.fishDirection * this.fishSpeed * deltaTime;
        this.fishPosition = Math.max(0, Math.min(1, this.fishPosition));
        
        if (this.fishPosition <= 0 || this.fishPosition >= 1) {
            this.fishDirection *= -1;
        }
        
        // Move catch zone
        this.catchZone.position += this.reelSpeed;
        this.catchZone.position = Math.max(0, Math.min(1, this.catchZone.position));
        
        // Check if fish is in catch zone
        const zoneStart = this.catchZone.position - this.catchZone.size / 2;
        const zoneEnd = this.catchZone.position + this.catchZone.size / 2;
        
        if (this.fishPosition >= zoneStart && this.fishPosition <= zoneEnd) {
            this.catchProgress += deltaTime * 0.3;
        } else {
            this.catchProgress -= deltaTime * 0.2;
        }
        
        this.catchProgress = Math.max(0, Math.min(1, this.catchProgress));
        
        // Check win/lose
        if (this.catchProgress >= 1) {
            this.catchFish();
        } else if (this.catchProgress <= 0 && this.fishPosition < zoneStart - 0.2) {
            this.fishEscaped();
        }
    }
    
    render(ctx) {
        if (!this.isFishing) return;
        
        // Render bobber in world
        if (this.bobberPosition && this.game.camera) {
            this.renderBobber(ctx);
        }
        
        // Render minigame UI
        if (this.minigameActive) {
            this.renderMinigame(ctx);
        }
        
        // Render bite indicator
        if (this.hasBite && !this.minigameActive) {
            this.renderBiteIndicator(ctx);
        }
    }
    
    renderBobber(ctx) {
        const screen = this.game.camera.worldToScreen(
            this.bobberPosition.x,
            this.bobberPosition.y,
            this.bobberPosition.z
        );
        
        // Bobber
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Line to player
        if (this.game.player) {
            const playerScreen = this.game.camera.worldToScreen(
                this.game.player.x,
                this.game.player.y,
                this.game.player.z + 1.5
            );
            
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(playerScreen.x, playerScreen.y);
            ctx.lineTo(screen.x, screen.y);
            ctx.stroke();
        }
    }
    
    renderMinigame(ctx) {
        const canvas = ctx.canvas;
        const barWidth = 40;
        const barHeight = 200;
        const x = canvas.width - 80;
        const y = (canvas.height - barHeight) / 2;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 10, y - 30, barWidth + 20, barHeight + 60);
        
        // Bar background
        ctx.fillStyle = '#1a3a5c';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Catch zone
        const zoneY = y + (1 - this.catchZone.position - this.catchZone.size / 2) * barHeight;
        const zoneHeight = this.catchZone.size * barHeight;
        
        ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
        ctx.fillRect(x, zoneY, barWidth, zoneHeight);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, zoneY, barWidth, zoneHeight);
        
        // Fish indicator
        const fishY = y + (1 - this.fishPosition) * barHeight;
        
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐟', x + barWidth / 2, fishY + 6);
        
        // Progress bar
        const progBarY = y + barHeight + 10;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, progBarY, barWidth, 10);
        ctx.fillStyle = this.catchProgress > 0.7 ? '#00FF00' : this.catchProgress > 0.3 ? '#FFFF00' : '#FF6600';
        ctx.fillRect(x, progBarY, barWidth * this.catchProgress, 10);
        
        // Instructions
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('HOLD TO REEL', x + barWidth / 2, y - 10);
        
        ctx.restore();
    }
    
    renderBiteIndicator(ctx) {
        const canvas = ctx.canvas;
        const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
        
        ctx.save();
        ctx.fillStyle = `rgba(255, 100, 100, ${0.5 + pulse * 0.5})`;
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('! BITE ! Press SPACE/CLICK !', canvas.width / 2, canvas.height / 2 - 50);
        ctx.restore();
    }
    
    // Serialize for saving
    serialize() {
        return {
            stats: this.stats
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.stats) {
            this.stats = data.stats;
        }
    }
}
