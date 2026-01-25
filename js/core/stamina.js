// Stamina System - Energy management for sprinting, jumping, attacks
import { CONFIG } from '../config.js';

export const STAMINA_CONFIG = {
    MAX_STAMINA: 100,
    
    // Drain rates (per second)
    SPRINT_DRAIN: 15,
    JUMP_COST: 10,
    ATTACK_COST: 8,
    SWIM_DRAIN: 12,
    CLIMB_DRAIN: 20,
    
    // Regen rates (per second)
    IDLE_REGEN: 25,
    WALK_REGEN: 10,
    HUNGRY_REGEN_MULT: 0.5, // Regen slower when hungry
    
    // Thresholds
    EXHAUSTED_THRESHOLD: 10, // Can't sprint below this
    RECOVERY_THRESHOLD: 30, // Must recover to this before sprinting again
};

export class StaminaSystem {
    constructor(game) {
        this.game = game;
        
        this.stamina = STAMINA_CONFIG.MAX_STAMINA;
        this.maxStamina = STAMINA_CONFIG.MAX_STAMINA;
        
        // State tracking
        this.isExhausted = false;
        this.isSprinting = false;
        this.lastAction = 'idle';
        
        // Visual feedback
        this.flashTimer = 0;
    }
    
    update(deltaTime) {
        const player = this.game.player;
        if (!player) return;
        
        // Check if sprinting
        this.isSprinting = player.isSprinting || false;
        
        // Determine current action
        const isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1;
        const isSwimming = player.isSwimming || player.isInWater;
        
        // Drain stamina based on action
        if (this.isSprinting && isMoving) {
            this.drain(STAMINA_CONFIG.SPRINT_DRAIN * deltaTime);
        } else if (isSwimming && isMoving) {
            this.drain(STAMINA_CONFIG.SWIM_DRAIN * deltaTime);
        } else {
            // Regenerate stamina
            let regenRate = isMoving ? STAMINA_CONFIG.WALK_REGEN : STAMINA_CONFIG.IDLE_REGEN;
            
            // Slower regen when hungry
            if (player.hunger < 30) {
                regenRate *= STAMINA_CONFIG.HUNGRY_REGEN_MULT;
            }
            
            // Buff from food
            if (player.buffStamina) {
                regenRate *= player.buffStamina;
            }
            
            this.regen(regenRate * deltaTime);
        }
        
        // Check exhaustion state
        if (this.stamina <= STAMINA_CONFIG.EXHAUSTED_THRESHOLD) {
            this.isExhausted = true;
            player.isSprinting = false;
        } else if (this.stamina >= STAMINA_CONFIG.RECOVERY_THRESHOLD) {
            this.isExhausted = false;
        }
        
        // Flash timer for low stamina warning
        if (this.stamina < 20) {
            this.flashTimer += deltaTime;
        } else {
            this.flashTimer = 0;
        }
    }
    
    drain(amount) {
        this.stamina = Math.max(0, this.stamina - amount);
        return this.stamina > 0;
    }
    
    regen(amount) {
        this.stamina = Math.min(this.maxStamina, this.stamina + amount);
    }
    
    // Called when player tries to sprint
    canSprint() {
        return !this.isExhausted && this.stamina > STAMINA_CONFIG.EXHAUSTED_THRESHOLD;
    }
    
    // Called when player jumps
    useJump() {
        if (this.stamina >= STAMINA_CONFIG.JUMP_COST) {
            this.drain(STAMINA_CONFIG.JUMP_COST);
            return true;
        }
        return false;
    }
    
    // Called when player attacks
    useAttack() {
        if (this.stamina >= STAMINA_CONFIG.ATTACK_COST * 0.5) {
            this.drain(STAMINA_CONFIG.ATTACK_COST);
            return true;
        }
        // Can still attack but slower/weaker
        return true;
    }
    
    // Get stamina percentage
    getPercentage() {
        return (this.stamina / this.maxStamina) * 100;
    }
    
    // Get color for UI bar
    getColor() {
        const pct = this.getPercentage();
        if (pct > 50) return '#51cf66'; // Green
        if (pct > 25) return '#fab005'; // Yellow
        return '#ff6b6b'; // Red
    }
    
    // Check if flashing (low stamina warning)
    isFlashing() {
        return this.stamina < 20 && Math.sin(this.flashTimer * 10) > 0;
    }
    
    // Serialize for save
    serialize() {
        return {
            stamina: this.stamina,
            isExhausted: this.isExhausted
        };
    }
    
    deserialize(data) {
        if (!data) return;
        this.stamina = data.stamina ?? STAMINA_CONFIG.MAX_STAMINA;
        this.isExhausted = data.isExhausted ?? false;
    }
    
    reset() {
        this.stamina = STAMINA_CONFIG.MAX_STAMINA;
        this.isExhausted = false;
        this.isSprinting = false;
    }
}
