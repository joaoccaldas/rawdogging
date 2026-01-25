// Death Screen & Respawn System
// Handles player death, shows stats, and manages respawn

export class DeathSystem {
    constructor(game) {
        this.game = game;
        
        // Death state
        this.isDead = false;
        this.deathTime = 0;
        this.respawnTimer = 5; // Seconds before respawn enabled
        this.respawnCountdown = 0;
        
        // Death info
        this.deathCause = '';
        this.deathLocation = { x: 0, y: 0, z: 0 };
        this.deathStats = {};
        
        // Respawn options
        this.respawnOptions = [];
        this.selectedOption = 0;
        
        // Animation
        this.fadeAlpha = 0;
        this.fadeSpeed = 0.5;
        
        // UI elements
        this.visible = false;
        this.element = null;
        
        this.createUI();
    }
    
    createUI() {
        this.element = document.createElement('div');
        this.element.id = 'death-screen';
        this.element.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(139, 0, 0, 0);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Courier New', monospace;
            transition: background 0.5s ease;
        `;
        
        this.element.innerHTML = `
            <div id="death-content" style="
                text-align: center;
                color: #fff;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s;
            ">
                <h1 id="death-title" style="
                    font-size: 64px;
                    color: #ff0000;
                    text-shadow: 0 0 20px #ff0000, 0 0 40px #8b0000;
                    margin-bottom: 20px;
                    letter-spacing: 10px;
                ">YOU DIED</h1>
                
                <p id="death-cause" style="
                    font-size: 24px;
                    color: #ffaaaa;
                    margin-bottom: 30px;
                "></p>
                
                <div id="death-stats" style="
                    background: rgba(0, 0, 0, 0.5);
                    padding: 20px 40px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    border: 2px solid #8b0000;
                ">
                    <h3 style="color: #ff6666; margin-bottom: 15px;">Session Statistics</h3>
                    <div id="stats-grid" style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                        text-align: left;
                    "></div>
                </div>
                
                <div id="respawn-options" style="
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    align-items: center;
                ">
                    <p id="respawn-timer" style="color: #888; font-size: 18px;"></p>
                    <button id="respawn-spawn" class="respawn-btn" style="
                        padding: 15px 40px;
                        font-size: 20px;
                        background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
                        color: #888;
                        border: 2px solid #555;
                        border-radius: 8px;
                        cursor: not-allowed;
                        transition: all 0.3s ease;
                        font-family: inherit;
                    ">Respawn at World Spawn</button>
                    <button id="respawn-home" class="respawn-btn" style="
                        padding: 15px 40px;
                        font-size: 20px;
                        background: linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%);
                        color: #888;
                        border: 2px solid #555;
                        border-radius: 8px;
                        cursor: not-allowed;
                        transition: all 0.3s ease;
                        font-family: inherit;
                        display: none;
                    ">Respawn at Home Beacon</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.element);
        
        // Button event listeners
        document.getElementById('respawn-spawn').addEventListener('click', () => {
            if (this.respawnCountdown <= 0) {
                this.respawn('spawn');
            }
        });
        
        document.getElementById('respawn-home').addEventListener('click', () => {
            if (this.respawnCountdown <= 0) {
                this.respawn('home');
            }
        });
    }
    
    die(cause = 'Unknown') {
        if (this.isDead) return;
        
        const player = this.game.player;
        if (!player) return;
        
        this.isDead = true;
        this.deathTime = Date.now();
        this.deathCause = cause;
        this.deathLocation = { x: player.x, y: player.y, z: player.z };
        this.respawnCountdown = this.respawnTimer;
        
        // Collect death stats
        this.collectDeathStats();
        
        // Drop inventory (optional - configurable)
        if (this.game.difficulty?.dropItemsOnDeath !== false) {
            this.dropInventory();
        }
        
        // Show death screen
        this.show();
        
        // Play death sound
        if (this.game.audio) {
            this.game.audio.play('death');
        }
        
        // Pause game updates (optional)
        // this.game.paused = true;
        
        // Update statistics
        if (this.game.statistics) {
            this.game.statistics.increment('deaths');
        }
    }
    
    collectDeathStats() {
        const player = this.game.player;
        const stats = this.game.statistics;
        
        this.deathStats = {
            'Survival Time': this.formatTime(stats?.get?.('playTime') || 0),
            'Blocks Mined': stats?.get?.('blocksMined') || 0,
            'Blocks Placed': stats?.get?.('blocksPlaced') || 0,
            'Enemies Killed': stats?.get?.('enemiesKilled') || 0,
            'Items Crafted': stats?.get?.('itemsCrafted') || 0,
            'Distance Traveled': Math.floor(stats?.get?.('distanceTraveled') || 0) + 'm',
            'Level Reached': player?.level || 1,
            'XP Earned': player?.xp || 0
        };
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    }
    
    dropInventory() {
        const player = this.game.player;
        if (!player?.inventory) return;
        
        // Create item drops at death location
        for (let i = 0; i < player.inventory.length; i++) {
            const item = player.inventory[i];
            if (item) {
                this.game.world?.spawnItemDrop?.(
                    this.deathLocation.x + (Math.random() - 0.5) * 2,
                    this.deathLocation.y + (Math.random() - 0.5) * 2,
                    this.deathLocation.z + 1,
                    item.id,
                    item.count
                );
            }
        }
        
        // Clear inventory
        // player.inventory = new Array(player.inventory.length).fill(null);
    }
    
    show() {
        this.visible = true;
        this.element.style.display = 'flex';
        
        // Trigger animations
        requestAnimationFrame(() => {
            this.element.style.background = 'rgba(139, 0, 0, 0.85)';
            document.getElementById('death-content').style.opacity = '1';
            document.getElementById('death-content').style.transform = 'translateY(0)';
        });
        
        // Update death cause
        document.getElementById('death-cause').textContent = this.deathCause;
        
        // Update stats
        const statsGrid = document.getElementById('stats-grid');
        statsGrid.innerHTML = '';
        for (const [label, value] of Object.entries(this.deathStats)) {
            statsGrid.innerHTML += `
                <div style="color: #aaa;">${label}:</div>
                <div style="color: #fff; text-align: right;">${value}</div>
            `;
        }
        
        // Check for home beacon
        const homeBeacon = this.game.homeBeacons?.getActiveBeacon?.();
        const homeBtn = document.getElementById('respawn-home');
        if (homeBeacon) {
            homeBtn.style.display = 'block';
        } else {
            homeBtn.style.display = 'none';
        }
    }
    
    hide() {
        this.visible = false;
        this.element.style.background = 'rgba(139, 0, 0, 0)';
        document.getElementById('death-content').style.opacity = '0';
        document.getElementById('death-content').style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 500);
    }
    
    update(deltaTime) {
        if (!this.isDead) return;
        
        // Update respawn countdown
        if (this.respawnCountdown > 0) {
            this.respawnCountdown -= deltaTime;
            
            const timerEl = document.getElementById('respawn-timer');
            if (this.respawnCountdown > 0) {
                timerEl.textContent = `Respawn available in ${Math.ceil(this.respawnCountdown)}...`;
            } else {
                timerEl.textContent = 'Choose respawn location';
                this.enableRespawnButtons();
            }
        }
    }
    
    enableRespawnButtons() {
        const buttons = document.querySelectorAll('.respawn-btn');
        buttons.forEach(btn => {
            btn.style.background = 'linear-gradient(180deg, #4a7a4a 0%, #2a4a2a 100%)';
            btn.style.color = '#fff';
            btn.style.borderColor = '#5a8a5a';
            btn.style.cursor = 'pointer';
            
            btn.onmouseenter = () => {
                btn.style.background = 'linear-gradient(180deg, #5a9a5a 0%, #3a6a3a 100%)';
                btn.style.transform = 'scale(1.05)';
            };
            btn.onmouseleave = () => {
                btn.style.background = 'linear-gradient(180deg, #4a7a4a 0%, #2a4a2a 100%)';
                btn.style.transform = 'scale(1)';
            };
        });
    }
    
    respawn(location = 'spawn') {
        if (this.respawnCountdown > 0) return;
        
        const player = this.game.player;
        if (!player) return;
        
        let spawnX = 0, spawnY = 0, spawnZ = 20;
        
        if (location === 'home') {
            const beacon = this.game.homeBeacons?.getActiveBeacon?.();
            if (beacon) {
                spawnX = beacon.x;
                spawnY = beacon.y;
                spawnZ = beacon.z + 1;
            }
        }
        
        // Find safe spawn height
        const groundZ = this.game.world?.getHeight?.(spawnX, spawnY) || 15;
        spawnZ = Math.max(spawnZ, groundZ + 2);
        
        // Reset player
        player.x = spawnX;
        player.y = spawnY;
        player.z = spawnZ;
        player.health = player.maxHealth || 100;
        player.hunger = player.maxHunger || 100;
        player.vx = 0;
        player.vy = 0;
        player.vz = 0;
        
        // Reset status effects
        if (this.game.statusEffects) {
            this.game.statusEffects.clearAll?.();
        }
        
        // Hide death screen
        this.hide();
        this.isDead = false;
        
        // Resume game
        // this.game.paused = false;
        
        // Play respawn sound
        if (this.game.audio) {
            this.game.audio.play('levelup');
        }
        
        // Show message
        if (this.game.ui) {
            this.game.ui.showMessage('You have respawned', 3000);
        }
        
        // Camera follow
        if (this.game.camera) {
            this.game.camera.follow(player);
        }
    }
    
    isPlayerDead() {
        return this.isDead;
    }
    
    serialize() {
        return {
            isDead: this.isDead,
            deathLocation: this.deathLocation
        };
    }
    
    deserialize(data) {
        if (!data) return;
        // Generally don't restore death state
    }
    
    reset() {
        this.isDead = false;
        this.hide();
    }
}
