// Statistics System - Track player achievements and progress
import { CONFIG } from '../config.js';

export class Statistics {
    constructor(game) {
        this.game = game;
        
        // Time tracking
        this.playTime = 0; // Total seconds played
        this.daysSurvived = 0;
        this.longestSurvivalStreak = 0;
        this.deaths = 0;
        
        // Combat stats
        this.enemiesKilled = {};
        this.totalEnemiesKilled = 0;
        this.bossesKilled = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        
        // Gathering stats
        this.blocksMined = {};
        this.totalBlocksMined = 0;
        this.blocksPlaced = 0;
        this.itemsCollected = {};
        this.totalItemsCollected = 0;
        
        // Crafting stats
        this.itemsCrafted = {};
        this.totalItemsCrafted = 0;
        
        // Exploration stats
        this.distanceTraveled = 0;
        this.biomesDiscovered = new Set();
        this.highestAltitude = 0;
        this.lowestAltitude = 999;
        
        // Food stats
        this.foodEaten = {};
        this.totalFoodEaten = 0;
        
        // Taming stats
        this.animalsTamed = 0;
        
        // Last position for distance tracking
        this.lastPosition = null;
    }
    
    update(deltaTime) {
        // Update play time
        this.playTime += deltaTime;
        
        // Update days survived from world
        if (this.game.world) {
            this.daysSurvived = this.game.world.dayCount || 0;
            if (this.daysSurvived > this.longestSurvivalStreak) {
                this.longestSurvivalStreak = this.daysSurvived;
            }
        }
        
        // Track distance traveled
        if (this.game.player) {
            const player = this.game.player;
            if (this.lastPosition) {
                const dx = player.x - this.lastPosition.x;
                const dy = player.y - this.lastPosition.y;
                const dz = player.z - this.lastPosition.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < 10) { // Ignore teleports
                    this.distanceTraveled += dist;
                }
            }
            this.lastPosition = { x: player.x, y: player.y, z: player.z };
            
            // Track altitude
            if (player.z > this.highestAltitude) {
                this.highestAltitude = player.z;
            }
            if (player.z < this.lowestAltitude && player.z > 0) {
                this.lowestAltitude = player.z;
            }
        }
    }
    
    // Combat tracking
    onEnemyKilled(enemyType, isBoss = false) {
        this.enemiesKilled[enemyType] = (this.enemiesKilled[enemyType] || 0) + 1;
        this.totalEnemiesKilled++;
        if (isBoss) {
            this.bossesKilled++;
        }
    }
    
    onDamageDealt(amount) {
        this.damageDealt += amount;
    }
    
    onDamageTaken(amount) {
        this.damageTaken += amount;
    }
    
    onDeath() {
        this.deaths++;
    }
    
    // Gathering tracking
    onBlockMined(blockType) {
        this.blocksMined[blockType] = (this.blocksMined[blockType] || 0) + 1;
        this.totalBlocksMined++;
    }
    
    onBlockPlaced() {
        this.blocksPlaced++;
    }
    
    onItemCollected(itemKey, count = 1) {
        this.itemsCollected[itemKey] = (this.itemsCollected[itemKey] || 0) + count;
        this.totalItemsCollected += count;
    }
    
    // Crafting tracking
    onItemCrafted(itemKey, count = 1) {
        this.itemsCrafted[itemKey] = (this.itemsCrafted[itemKey] || 0) + count;
        this.totalItemsCrafted += count;
    }
    
    // Food tracking
    onFoodEaten(itemKey) {
        this.foodEaten[itemKey] = (this.foodEaten[itemKey] || 0) + 1;
        this.totalFoodEaten++;
    }
    
    // Exploration tracking
    onBiomeDiscovered(biomeName) {
        if (!this.biomesDiscovered.has(biomeName)) {
            this.biomesDiscovered.add(biomeName);
            this.game.ui?.showMessage(`🗺️ Discovered: ${biomeName}`, 3000);
        }
    }
    
    // Taming tracking
    onAnimalTamed() {
        this.animalsTamed++;
    }
    
    // Get formatted play time
    getFormattedPlayTime() {
        const hours = Math.floor(this.playTime / 3600);
        const minutes = Math.floor((this.playTime % 3600) / 60);
        const seconds = Math.floor(this.playTime % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }
    
    // Get summary for UI
    getSummary() {
        return {
            playTime: this.getFormattedPlayTime(),
            daysSurvived: this.daysSurvived,
            longestStreak: this.longestSurvivalStreak,
            deaths: this.deaths,
            
            enemiesKilled: this.totalEnemiesKilled,
            bossesKilled: this.bossesKilled,
            damageDealt: Math.floor(this.damageDealt),
            damageTaken: Math.floor(this.damageTaken),
            
            blocksMined: this.totalBlocksMined,
            blocksPlaced: this.blocksPlaced,
            itemsCollected: this.totalItemsCollected,
            itemsCrafted: this.totalItemsCrafted,
            
            distanceTraveled: Math.floor(this.distanceTraveled),
            biomesDiscovered: this.biomesDiscovered.size,
            
            foodEaten: this.totalFoodEaten,
            animalsTamed: this.animalsTamed,
        };
    }
    
    // Show stats modal
    showStats() {
        const summary = this.getSummary();
        
        let html = `
            <div class="stats-modal">
                <h2>📊 Statistics</h2>
                
                <div class="stats-section">
                    <h3>⏱️ Time</h3>
                    <p>Play Time: ${summary.playTime}</p>
                    <p>Days Survived: ${summary.daysSurvived}</p>
                    <p>Longest Streak: ${summary.longestStreak} days</p>
                    <p>Deaths: ${summary.deaths}</p>
                </div>
                
                <div class="stats-section">
                    <h3>⚔️ Combat</h3>
                    <p>Enemies Killed: ${summary.enemiesKilled}</p>
                    <p>Bosses Defeated: ${summary.bossesKilled}</p>
                    <p>Damage Dealt: ${summary.damageDealt}</p>
                    <p>Damage Taken: ${summary.damageTaken}</p>
                </div>
                
                <div class="stats-section">
                    <h3>⛏️ Gathering</h3>
                    <p>Blocks Mined: ${summary.blocksMined}</p>
                    <p>Blocks Placed: ${summary.blocksPlaced}</p>
                    <p>Items Collected: ${summary.itemsCollected}</p>
                    <p>Items Crafted: ${summary.itemsCrafted}</p>
                </div>
                
                <div class="stats-section">
                    <h3>🗺️ Exploration</h3>
                    <p>Distance Traveled: ${summary.distanceTraveled} blocks</p>
                    <p>Biomes Discovered: ${summary.biomesDiscovered}</p>
                </div>
                
                <div class="stats-section">
                    <h3>🍖 Survival</h3>
                    <p>Food Eaten: ${summary.foodEaten}</p>
                    <p>Animals Tamed: ${summary.animalsTamed}</p>
                </div>
                
                <button onclick="this.parentElement.remove()">Close</button>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'stats-overlay';
        modal.innerHTML = html;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const content = modal.querySelector('.stats-modal');
        content.style.cssText = `
            background: #1a1a2e;
            border: 3px solid #8b4513;
            border-radius: 10px;
            padding: 20px;
            max-width: 400px;
            color: white;
            font-family: monospace;
        `;
        
        document.body.appendChild(modal);
    }
    
    // Serialize for save
    serialize() {
        return {
            playTime: this.playTime,
            daysSurvived: this.daysSurvived,
            longestSurvivalStreak: this.longestSurvivalStreak,
            deaths: this.deaths,
            enemiesKilled: this.enemiesKilled,
            totalEnemiesKilled: this.totalEnemiesKilled,
            bossesKilled: this.bossesKilled,
            damageDealt: this.damageDealt,
            damageTaken: this.damageTaken,
            blocksMined: this.blocksMined,
            totalBlocksMined: this.totalBlocksMined,
            blocksPlaced: this.blocksPlaced,
            itemsCollected: this.itemsCollected,
            totalItemsCollected: this.totalItemsCollected,
            itemsCrafted: this.itemsCrafted,
            totalItemsCrafted: this.totalItemsCrafted,
            distanceTraveled: this.distanceTraveled,
            biomesDiscovered: [...this.biomesDiscovered],
            highestAltitude: this.highestAltitude,
            lowestAltitude: this.lowestAltitude,
            foodEaten: this.foodEaten,
            totalFoodEaten: this.totalFoodEaten,
            animalsTamed: this.animalsTamed,
        };
    }
    
    deserialize(data) {
        if (!data) return;
        
        this.playTime = data.playTime || 0;
        this.daysSurvived = data.daysSurvived || 0;
        this.longestSurvivalStreak = data.longestSurvivalStreak || 0;
        this.deaths = data.deaths || 0;
        this.enemiesKilled = data.enemiesKilled || {};
        this.totalEnemiesKilled = data.totalEnemiesKilled || 0;
        this.bossesKilled = data.bossesKilled || 0;
        this.damageDealt = data.damageDealt || 0;
        this.damageTaken = data.damageTaken || 0;
        this.blocksMined = data.blocksMined || {};
        this.totalBlocksMined = data.totalBlocksMined || 0;
        this.blocksPlaced = data.blocksPlaced || 0;
        this.itemsCollected = data.itemsCollected || {};
        this.totalItemsCollected = data.totalItemsCollected || 0;
        this.itemsCrafted = data.itemsCrafted || {};
        this.totalItemsCrafted = data.totalItemsCrafted || 0;
        this.distanceTraveled = data.distanceTraveled || 0;
        this.biomesDiscovered = new Set(data.biomesDiscovered || []);
        this.highestAltitude = data.highestAltitude || 0;
        this.lowestAltitude = data.lowestAltitude || 999;
        this.foodEaten = data.foodEaten || {};
        this.totalFoodEaten = data.totalFoodEaten || 0;
        this.animalsTamed = data.animalsTamed || 0;
    }
    
    reset() {
        this.playTime = 0;
        this.daysSurvived = 0;
        this.longestSurvivalStreak = 0;
        this.deaths = 0;
        this.enemiesKilled = {};
        this.totalEnemiesKilled = 0;
        this.bossesKilled = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.blocksMined = {};
        this.totalBlocksMined = 0;
        this.blocksPlaced = 0;
        this.itemsCollected = {};
        this.totalItemsCollected = 0;
        this.itemsCrafted = {};
        this.totalItemsCrafted = 0;
        this.distanceTraveled = 0;
        this.biomesDiscovered = new Set();
        this.highestAltitude = 0;
        this.lowestAltitude = 999;
        this.foodEaten = {};
        this.totalFoodEaten = 0;
        this.animalsTamed = 0;
        this.lastPosition = null;
    }
}
