// Boss Health Bar & Combat UI System
// Displays dramatic boss health bars and combat information

export class BossHealthBarSystem {
    constructor(game) {
        this.game = game;
        
        // Current boss being tracked
        this.activeBoss = null;
        this.bossMaxHealth = 0;
        
        // Animation
        this.healthBarWidth = 0;
        this.targetWidth = 0;
        this.damageFlash = 0;
        this.shakeOffset = 0;
        
        // Visual settings
        this.barWidth = 500;
        this.barHeight = 30;
        this.padding = 20;
        
        // Intro animation
        this.introProgress = 0;
        this.showingIntro = false;
        
        // Create UI elements
        this.createUI();
    }
    
    createUI() {
        this.element = document.createElement('div');
        this.element.id = 'boss-health-bar';
        this.element.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            width: 600px;
            text-align: center;
            z-index: 1500;
            opacity: 0;
            transition: transform 0.5s ease, opacity 0.5s ease;
            pointer-events: none;
        `;
        
        this.element.innerHTML = `
            <div id="boss-name" style="
                font-size: 28px;
                font-family: 'Courier New', monospace;
                color: #ff6666;
                text-shadow: 0 0 10px #ff0000, 2px 2px 0 #000;
                margin-bottom: 10px;
                letter-spacing: 3px;
            "></div>
            
            <div id="boss-bar-container" style="
                background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
                border: 3px solid #8b0000;
                border-radius: 5px;
                padding: 4px;
                box-shadow: 0 0 20px rgba(139, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.5);
            ">
                <div id="boss-bar-bg" style="
                    background: linear-gradient(180deg, #2a0a0a 0%, #1a0505 100%);
                    border-radius: 3px;
                    height: ${this.barHeight}px;
                    position: relative;
                    overflow: hidden;
                ">
                    <div id="boss-bar-damage" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        height: 100%;
                        background: linear-gradient(180deg, #ffaaaa 0%, #ff6666 100%);
                        width: 100%;
                        transition: width 0.3s ease;
                    "></div>
                    <div id="boss-bar-health" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        height: 100%;
                        background: linear-gradient(180deg, #ff4444 0%, #cc0000 50%, #8b0000 100%);
                        width: 100%;
                        box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.3);
                    "></div>
                    <div id="boss-bar-shine" style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 40%;
                        background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%);
                        pointer-events: none;
                    "></div>
                </div>
            </div>
            
            <div id="boss-health-text" style="
                font-size: 16px;
                font-family: 'Courier New', monospace;
                color: #aaa;
                margin-top: 8px;
            "></div>
        `;
        
        document.body.appendChild(this.element);
    }
    
    setBoss(boss) {
        if (!boss) {
            this.clearBoss();
            return;
        }
        
        this.activeBoss = boss;
        this.bossMaxHealth = boss.maxHealth || boss.health || 100;
        this.healthBarWidth = 100;
        this.targetWidth = 100;
        
        // Update name
        document.getElementById('boss-name').textContent = boss.name || 'BOSS';
        
        // Show with intro animation
        this.showIntro();
    }
    
    showIntro() {
        this.showingIntro = true;
        this.introProgress = 0;
        
        // Dramatic entrance
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateX(-50%) translateY(0)';
        
        // Screen shake effect
        if (this.game.camera) {
            this.game.camera.shake?.(0.5, 10);
        }
        
        // Play boss music/sound
        if (this.game.audio) {
            this.game.audio.play('boss_intro');
        }
        
        // Slow motion intro (optional)
        setTimeout(() => {
            this.showingIntro = false;
        }, 1500);
    }
    
    clearBoss() {
        this.activeBoss = null;
        
        // Hide with animation
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateX(-50%) translateY(-100px)';
    }
    
    update(deltaTime) {
        if (!this.activeBoss) return;
        
        // Check if boss is dead
        if (this.activeBoss.health <= 0 || this.activeBoss.dead) {
            this.onBossDefeated();
            return;
        }
        
        // Calculate target health percentage
        const healthPercent = Math.max(0, (this.activeBoss.health / this.bossMaxHealth) * 100);
        
        // Detect damage
        if (healthPercent < this.targetWidth) {
            this.damageFlash = 1;
            this.shakeOffset = 5;
        }
        
        this.targetWidth = healthPercent;
        
        // Smooth health bar animation
        const speed = deltaTime * 100;
        if (Math.abs(this.healthBarWidth - this.targetWidth) > 0.1) {
            this.healthBarWidth += (this.targetWidth - this.healthBarWidth) * Math.min(1, speed);
        } else {
            this.healthBarWidth = this.targetWidth;
        }
        
        // Decay flash and shake
        this.damageFlash = Math.max(0, this.damageFlash - deltaTime * 3);
        this.shakeOffset *= 0.9;
        
        // Update UI
        this.updateUI();
    }
    
    updateUI() {
        if (!this.activeBoss) return;
        
        // Health bar width
        const healthBar = document.getElementById('boss-bar-health');
        const damageBar = document.getElementById('boss-bar-damage');
        
        healthBar.style.width = `${this.healthBarWidth}%`;
        damageBar.style.width = `${this.targetWidth + 2}%`;
        
        // Shake effect
        const container = document.getElementById('boss-bar-container');
        const shakeX = (Math.random() - 0.5) * this.shakeOffset * 2;
        const shakeY = (Math.random() - 0.5) * this.shakeOffset * 2;
        container.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        
        // Flash effect
        if (this.damageFlash > 0) {
            healthBar.style.filter = `brightness(${1 + this.damageFlash})`;
        } else {
            healthBar.style.filter = 'none';
        }
        
        // Health text
        const healthText = document.getElementById('boss-health-text');
        healthText.textContent = `${Math.ceil(this.activeBoss.health)} / ${this.bossMaxHealth}`;
        
        // Color change at low health
        if (this.healthBarWidth < 25) {
            healthBar.style.background = 'linear-gradient(180deg, #ff8800 0%, #ff4400 50%, #cc2200 100%)';
            document.getElementById('boss-name').style.animation = 'pulse 0.5s infinite';
        } else {
            healthBar.style.background = 'linear-gradient(180deg, #ff4444 0%, #cc0000 50%, #8b0000 100%)';
            document.getElementById('boss-name').style.animation = 'none';
        }
    }
    
    onBossDefeated() {
        // Victory animation
        const nameEl = document.getElementById('boss-name');
        nameEl.textContent = 'DEFEATED!';
        nameEl.style.color = '#00ff00';
        nameEl.style.textShadow = '0 0 10px #00ff00, 2px 2px 0 #000';
        
        // Play victory sound
        if (this.game.audio) {
            this.game.audio.play('victory');
        }
        
        // Hide after delay
        setTimeout(() => {
            this.clearBoss();
        }, 3000);
        
        // Update statistics
        if (this.game.statistics) {
            this.game.statistics.increment('bossesKilled');
        }
    }
    
    // Check if any entity should be tracked as boss
    checkForBoss(entity) {
        if (entity.isBoss && !this.activeBoss) {
            this.setBoss(entity);
        }
    }
    
    render(ctx) {
        // Canvas-based rendering (if needed for additional effects)
        // The main UI is HTML-based for smooth animations
    }
    
    serialize() {
        return {
            activeBossId: this.activeBoss?.id || null
        };
    }
    
    deserialize(data) {
        // Boss state is typically not persisted
    }
    
    reset() {
        this.clearBoss();
    }
}

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
`;
document.head.appendChild(style);
