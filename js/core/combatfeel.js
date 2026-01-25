// Combat Feel System - Enhanced combat feedback and hitboxes
import { CONFIG } from '../config.js';

export class CombatFeelSystem {
    constructor(game) {
        this.game = game;
        
        // Hit-stop effect (freeze frames)
        this.hitStopDuration = 0;
        this.hitStopTime = 0;
        
        // Attack state tracking
        this.isAttacking = false;
        this.attackProgress = 0;
        this.attackDuration = 0.25; // seconds
        this.attackCooldown = 0;
        
        // Combo tracking
        this.comboCount = 0;
        this.comboTimer = 0;
        this.maxComboTime = 1.5; // seconds between hits
        
        // Screen effects
        this.screenShakeIntensity = 0;
        this.screenFlashColor = null;
        this.screenFlashAlpha = 0;
        
        // Hit feedback queue
        this.hitFeedbackQueue = [];
    }
    
    update(deltaTime) {
        // Handle hit-stop
        if (this.hitStopTime > 0) {
            this.hitStopTime -= deltaTime;
            return true; // Return true to signal game should pause physics
        }
        
        // Update attack animation
        if (this.isAttacking) {
            this.attackProgress += deltaTime / this.attackDuration;
            if (this.attackProgress >= 1) {
                this.isAttacking = false;
                this.attackProgress = 0;
            }
        }
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Combo timeout
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }
        
        // Decay screen effects
        if (this.screenFlashAlpha > 0) {
            this.screenFlashAlpha -= deltaTime * 5;
        }
        
        // Process hit feedback queue
        this.processHitFeedback(deltaTime);
        
        return false;
    }
    
    // Start an attack animation
    startAttack() {
        if (this.attackCooldown > 0) return false;
        
        this.isAttacking = true;
        this.attackProgress = 0;
        this.attackCooldown = this.attackDuration + 0.1;
        
        return true;
    }
    
    // Get attack swing angle for rendering
    getAttackSwingAngle() {
        if (!this.isAttacking) return 0;
        
        // Swing from -45 to 45 degrees
        const swing = Math.sin(this.attackProgress * Math.PI) * 0.8;
        return swing;
    }
    
    // Called when player hits something
    onPlayerHit(target, damage, isCritical = false) {
        // Add combo
        this.comboCount++;
        this.comboTimer = this.maxComboTime;
        
        // Stronger hit-stop for crits
        const hitStopBase = isCritical ? 0.08 : 0.04;
        this.hitStopTime = hitStopBase + Math.min(0.05, damage * 0.005);
        
        // Camera shake scaled to damage
        const shakeIntensity = Math.min(8, 2 + damage * 0.3);
        this.game.camera?.addShake(shakeIntensity, 0.15);
        
        // Screen flash
        this.screenFlashColor = isCritical ? '#ffd700' : '#ff6b6b';
        this.screenFlashAlpha = isCritical ? 0.4 : 0.2;
        
        // Impact particles
        this.spawnHitParticles(target, isCritical);
        
        // Audio
        const hitSound = isCritical ? 'critical_hit' : 'hit';
        this.game.audio?.play(hitSound);
        
        // Combo display
        if (this.comboCount > 1) {
            this.showComboNumber();
        }
        
        // Queue knockback visual
        this.hitFeedbackQueue.push({
            target,
            time: 0.1,
            type: isCritical ? 'critical' : 'normal'
        });
    }
    
    // Called when player takes damage
    onPlayerDamaged(damage, source) {
        // Screen flash
        this.screenFlashColor = '#ff0000';
        this.screenFlashAlpha = Math.min(0.6, 0.2 + damage * 0.05);
        
        // Camera shake
        const shakeIntensity = Math.min(10, 3 + damage * 0.4);
        this.game.camera?.addShake(shakeIntensity, 0.25);
        
        // Reset combo on taking damage
        this.comboCount = 0;
        this.comboTimer = 0;
    }
    
    spawnHitParticles(target, isCritical) {
        const x = target.x || 0;
        const y = target.y || 0;
        const z = (target.z || 0) + 1;
        
        const particles = this.game.particles;
        if (!particles) return;
        
        // Impact spark particles
        const count = isCritical ? 15 : 8;
        const color = isCritical ? '#ffd700' : '#ff4444';
        
        particles.emit(x, y, z, color, count);
        
        // Radial impact lines for crits
        if (isCritical) {
            particles.emitText(x, y, z + 0.5, '⚡CRITICAL!', '#ffd700', 24);
        }
    }
    
    showComboNumber() {
        const player = this.game.player;
        if (!player) return;
        
        let comboText = `${this.comboCount}x COMBO!`;
        let color = '#ffffff';
        
        if (this.comboCount >= 10) {
            comboText = `🔥 ${this.comboCount}x COMBO!`;
            color = '#ff4444';
        } else if (this.comboCount >= 5) {
            comboText = `⚡ ${this.comboCount}x COMBO!`;
            color = '#ffd700';
        }
        
        this.game.particles?.emitText(
            player.x, 
            player.y, 
            player.z + 2.5, 
            comboText, 
            color, 
            18
        );
    }
    
    processHitFeedback(deltaTime) {
        this.hitFeedbackQueue = this.hitFeedbackQueue.filter(feedback => {
            feedback.time -= deltaTime;
            return feedback.time > 0;
        });
    }
    
    // Check if attack can hit based on hitbox
    checkHitbox(attacker, target, range = 2) {
        const dx = target.x - attacker.x;
        const dy = target.y - attacker.y;
        const dz = Math.abs((target.z || 0) - (attacker.z || 0));
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Height check - can hit 2 blocks vertically
        if (dz > 2) return { hit: false };
        
        // Distance check
        if (distance > range) return { hit: false };
        
        // Facing direction check (optional, 120 degree cone)
        const facingAngle = attacker.facingAngle || Math.atan2(attacker.vy || 0, attacker.vx || 0);
        const targetAngle = Math.atan2(dy, dx);
        
        let angleDiff = targetAngle - facingAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        // 120 degree cone (60 degrees each side)
        const inCone = Math.abs(angleDiff) < Math.PI / 3;
        
        return {
            hit: true,
            distance,
            inCone,
            angleDiff
        };
    }
    
    // Calculate critical hit
    calculateCritical(baseDamage) {
        const player = this.game.player;
        
        // Base crit chance: 5%
        let critChance = 0.05;
        
        // Bonus from combo
        critChance += Math.min(0.15, this.comboCount * 0.02);
        
        // Bonus from age progression
        const ageBonusMult = this.game.ageProgression?.getBonus('damageBonus') || 1;
        
        const isCritical = Math.random() < critChance;
        
        if (isCritical) {
            return {
                damage: Math.floor(baseDamage * 1.5 * ageBonusMult),
                isCritical: true
            };
        }
        
        return {
            damage: Math.floor(baseDamage * ageBonusMult),
            isCritical: false
        };
    }
    
    // Apply damage to target with full feedback
    applyDamage(attacker, target, baseDamage) {
        // Calculate critical
        const { damage, isCritical } = this.calculateCritical(baseDamage);
        
        // Check hitbox
        const hitCheck = this.checkHitbox(attacker, target, CONFIG.ATTACK_RANGE || 2);
        
        if (!hitCheck.hit) {
            return { hit: false, damage: 0 };
        }
        
        // Apply damage to target
        if (target.takeDamage) {
            target.takeDamage(damage, attacker);
        } else if (target.health !== undefined) {
            target.health -= damage;
        }
        
        // Trigger feedback
        this.onPlayerHit(target, damage, isCritical);
        
        return { hit: true, damage, isCritical };
    }
    
    // Render combat effects
    render(ctx) {
        // Screen flash overlay
        if (this.screenFlashAlpha > 0 && this.screenFlashColor) {
            ctx.save();
            ctx.globalAlpha = this.screenFlashAlpha;
            ctx.fillStyle = this.screenFlashColor;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
    
    // Serialize
    serialize() {
        return {
            comboCount: this.comboCount,
            comboTimer: this.comboTimer
        };
    }
    
    // Deserialize
    deserialize(data) {
        if (data) {
            this.comboCount = data.comboCount || 0;
            this.comboTimer = data.comboTimer || 0;
        }
    }
    
    reset() {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.isAttacking = false;
        this.attackProgress = 0;
        this.hitStopTime = 0;
    }
}
