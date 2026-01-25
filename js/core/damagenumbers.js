// Damage Numbers System - Floating combat text
import { CONFIG } from '../config.js';

export const DAMAGE_NUMBER_CONFIG = {
    // Display settings
    SHOW_DAMAGE: true,
    SHOW_HEALING: true,
    SHOW_XP: true,
    SHOW_CRITICAL: true,
    SHOW_STATUS: true,
    
    // Animation
    FLOAT_SPEED: 50, // pixels per second
    FLOAT_DURATION: 1.5, // seconds
    FADE_START: 0.7, // start fading at 70% through duration
    SPREAD_RANGE: 20, // random horizontal offset
    
    // Scaling
    BASE_FONT_SIZE: 16,
    CRITICAL_SCALE: 1.5,
    HEALING_SCALE: 1.2,
    XP_SCALE: 1.0,
    
    // Colors
    COLORS: {
        DAMAGE: '#FF4444',
        CRITICAL: '#FF0000',
        HEALING: '#44FF44',
        XP: '#FFFF44',
        MANA: '#4444FF',
        STAMINA: '#44FFFF',
        POISON: '#88FF88',
        FIRE: '#FF8844',
        ICE: '#88CCFF',
        MISS: '#888888',
        BLOCKED: '#AAAAAA',
        ABSORBED: '#8888FF'
    },
    
    // Special effects
    SHAKE_CRITICAL: true,
    SHAKE_AMOUNT: 3,
    PULSE_HEALING: true,
    COMBO_MULTIPLIER_DISPLAY: true,
    
    // Stacking
    STACK_SIMILAR: true,
    STACK_WINDOW: 200, // ms to stack similar damage
    
    // Performance
    MAX_NUMBERS: 50,
    CLEANUP_INTERVAL: 100 // ms
};

class DamageNumber {
    constructor(value, x, y, type, options = {}) {
        this.id = `dmg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Value and type
        this.value = value;
        this.type = type; // 'damage', 'critical', 'healing', 'xp', 'miss', etc.
        this.text = options.text || this.formatValue(value, type);
        
        // Position (world coordinates)
        this.worldX = x;
        this.worldY = y;
        this.worldZ = options.z || 0;
        
        // Screen position (calculated during render)
        this.screenX = 0;
        this.screenY = 0;
        
        // Animation
        this.startTime = Date.now();
        this.duration = options.duration || DAMAGE_NUMBER_CONFIG.FLOAT_DURATION;
        this.floatSpeed = options.floatSpeed || DAMAGE_NUMBER_CONFIG.FLOAT_SPEED;
        this.offsetY = 0;
        this.offsetX = (Math.random() - 0.5) * DAMAGE_NUMBER_CONFIG.SPREAD_RANGE;
        
        // Appearance
        this.color = options.color || this.getColorForType(type);
        this.fontSize = options.fontSize || this.getFontSizeForType(type);
        this.alpha = 1;
        this.scale = 1;
        
        // Effects
        this.isCritical = type === 'critical';
        this.isHealing = type === 'healing';
        this.shakeOffset = { x: 0, y: 0 };
        this.pulsePhase = 0;
        
        // Combo info
        this.comboMultiplier = options.comboMultiplier || 1;
        this.showCombo = options.showCombo || false;
        
        // State
        this.finished = false;
        this.stacked = false;
    }
    
    formatValue(value, type) {
        if (type === 'miss') return 'MISS';
        if (type === 'blocked') return 'BLOCKED';
        if (type === 'absorbed') return 'ABSORBED';
        if (type === 'immune') return 'IMMUNE';
        if (type === 'xp') return `+${value} XP`;
        if (type === 'healing') return `+${value}`;
        if (type === 'critical') return `${value}!`;
        return `-${Math.abs(value)}`;
    }
    
    getColorForType(type) {
        switch (type) {
            case 'damage': return DAMAGE_NUMBER_CONFIG.COLORS.DAMAGE;
            case 'critical': return DAMAGE_NUMBER_CONFIG.COLORS.CRITICAL;
            case 'healing': return DAMAGE_NUMBER_CONFIG.COLORS.HEALING;
            case 'xp': return DAMAGE_NUMBER_CONFIG.COLORS.XP;
            case 'mana': return DAMAGE_NUMBER_CONFIG.COLORS.MANA;
            case 'stamina': return DAMAGE_NUMBER_CONFIG.COLORS.STAMINA;
            case 'poison': return DAMAGE_NUMBER_CONFIG.COLORS.POISON;
            case 'fire': return DAMAGE_NUMBER_CONFIG.COLORS.FIRE;
            case 'ice': return DAMAGE_NUMBER_CONFIG.COLORS.ICE;
            case 'miss': return DAMAGE_NUMBER_CONFIG.COLORS.MISS;
            case 'blocked': return DAMAGE_NUMBER_CONFIG.COLORS.BLOCKED;
            case 'absorbed': return DAMAGE_NUMBER_CONFIG.COLORS.ABSORBED;
            default: return DAMAGE_NUMBER_CONFIG.COLORS.DAMAGE;
        }
    }
    
    getFontSizeForType(type) {
        const base = DAMAGE_NUMBER_CONFIG.BASE_FONT_SIZE;
        
        switch (type) {
            case 'critical': return base * DAMAGE_NUMBER_CONFIG.CRITICAL_SCALE;
            case 'healing': return base * DAMAGE_NUMBER_CONFIG.HEALING_SCALE;
            case 'xp': return base * DAMAGE_NUMBER_CONFIG.XP_SCALE;
            case 'miss':
            case 'blocked':
                return base * 0.9;
            default:
                return base;
        }
    }
    
    update(deltaTime) {
        if (this.finished) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const progress = elapsed / this.duration;
        
        if (progress >= 1) {
            this.finished = true;
            return;
        }
        
        // Float upward
        this.offsetY -= this.floatSpeed * deltaTime;
        
        // Fade out
        if (progress > DAMAGE_NUMBER_CONFIG.FADE_START) {
            const fadeProgress = (progress - DAMAGE_NUMBER_CONFIG.FADE_START) / 
                                (1 - DAMAGE_NUMBER_CONFIG.FADE_START);
            this.alpha = 1 - fadeProgress;
        }
        
        // Critical shake
        if (this.isCritical && DAMAGE_NUMBER_CONFIG.SHAKE_CRITICAL && progress < 0.3) {
            this.shakeOffset.x = (Math.random() - 0.5) * DAMAGE_NUMBER_CONFIG.SHAKE_AMOUNT;
            this.shakeOffset.y = (Math.random() - 0.5) * DAMAGE_NUMBER_CONFIG.SHAKE_AMOUNT;
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }
        
        // Healing pulse
        if (this.isHealing && DAMAGE_NUMBER_CONFIG.PULSE_HEALING) {
            this.pulsePhase += deltaTime * 10;
            this.scale = 1 + Math.sin(this.pulsePhase) * 0.1;
        }
        
        // Pop-in effect at start
        if (progress < 0.1) {
            this.scale = 0.5 + (progress / 0.1) * 0.5;
        }
    }
    
    render(ctx, camera) {
        if (this.finished || this.alpha <= 0) return;
        
        // Convert world position to screen
        const screenPos = camera.worldToScreen(this.worldX, this.worldY, this.worldZ);
        this.screenX = screenPos.x + this.offsetX + this.shakeOffset.x;
        this.screenY = screenPos.y + this.offsetY + this.shakeOffset.y;
        
        ctx.save();
        
        // Apply transformations
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.screenX, this.screenY);
        ctx.scale(this.scale, this.scale);
        
        // Draw text
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow/outline for visibility
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, 0, 0);
        
        // Main text
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
        
        // Combo multiplier
        if (this.showCombo && this.comboMultiplier > 1) {
            ctx.font = `bold ${this.fontSize * 0.6}px Arial`;
            ctx.fillStyle = '#FFAA00';
            ctx.fillText(`x${this.comboMultiplier.toFixed(1)}`, 0, -this.fontSize);
        }
        
        ctx.restore();
    }
    
    // Stack with another damage number
    stackWith(other) {
        this.value += other.value;
        this.text = this.formatValue(this.value, this.type);
        this.fontSize = Math.min(this.fontSize + 2, DAMAGE_NUMBER_CONFIG.BASE_FONT_SIZE * 2);
        this.stacked = true;
    }
}

export class DamageNumberSystem {
    constructor(game) {
        this.game = game;
        
        // Active damage numbers
        this.numbers = [];
        
        // Performance tracking
        this.lastCleanup = 0;
        
        // Settings
        this.enabled = true;
        this.showDamage = DAMAGE_NUMBER_CONFIG.SHOW_DAMAGE;
        this.showHealing = DAMAGE_NUMBER_CONFIG.SHOW_HEALING;
        this.showXP = DAMAGE_NUMBER_CONFIG.SHOW_XP;
        this.showCritical = DAMAGE_NUMBER_CONFIG.SHOW_CRITICAL;
        this.showStatus = DAMAGE_NUMBER_CONFIG.SHOW_STATUS;
    }
    
    update(deltaTime) {
        if (!this.enabled) return;
        
        // Update all numbers
        for (const num of this.numbers) {
            num.update(deltaTime);
        }
        
        // Periodic cleanup
        const now = Date.now();
        if (now - this.lastCleanup > DAMAGE_NUMBER_CONFIG.CLEANUP_INTERVAL) {
            this.cleanup();
            this.lastCleanup = now;
        }
    }
    
    // Cleanup finished numbers
    cleanup() {
        this.numbers = this.numbers.filter(n => !n.finished);
        
        // Limit max numbers
        while (this.numbers.length > DAMAGE_NUMBER_CONFIG.MAX_NUMBERS) {
            this.numbers.shift();
        }
    }
    
    // Spawn a damage number
    spawn(value, x, y, type, options = {}) {
        if (!this.enabled) return null;
        
        // Check if type is enabled
        if (type === 'damage' && !this.showDamage) return null;
        if (type === 'healing' && !this.showHealing) return null;
        if (type === 'xp' && !this.showXP) return null;
        if (type === 'critical' && !this.showCritical) return null;
        
        // Try to stack with existing number
        if (DAMAGE_NUMBER_CONFIG.STACK_SIMILAR) {
            const existing = this.findStackableNumber(value, x, y, type);
            if (existing) {
                existing.stackWith(new DamageNumber(value, x, y, type, options));
                return existing;
            }
        }
        
        const damageNum = new DamageNumber(value, x, y, type, options);
        this.numbers.push(damageNum);
        
        return damageNum;
    }
    
    // Find a number that can be stacked with
    findStackableNumber(value, x, y, type) {
        const now = Date.now();
        
        for (const num of this.numbers) {
            if (num.type !== type) continue;
            if (num.finished) continue;
            if (now - num.startTime > DAMAGE_NUMBER_CONFIG.STACK_WINDOW) continue;
            
            const dx = num.worldX - x;
            const dy = num.worldY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 1) {
                return num;
            }
        }
        
        return null;
    }
    
    // Convenience methods
    showDamageNumber(damage, x, y, options = {}) {
        return this.spawn(damage, x, y, 'damage', options);
    }
    
    showCriticalHit(damage, x, y, options = {}) {
        // Screen shake for critical
        if (this.game.camera?.shake) {
            this.game.camera.shake(3, 100);
        }
        
        return this.spawn(damage, x, y, 'critical', options);
    }
    
    showHealing(amount, x, y, options = {}) {
        return this.spawn(amount, x, y, 'healing', options);
    }
    
    showXP(amount, x, y, options = {}) {
        return this.spawn(amount, x, y, 'xp', options);
    }
    
    showMiss(x, y, options = {}) {
        return this.spawn(0, x, y, 'miss', options);
    }
    
    showBlocked(x, y, options = {}) {
        return this.spawn(0, x, y, 'blocked', options);
    }
    
    showStatusDamage(damage, x, y, statusType, options = {}) {
        if (!this.showStatus) return null;
        
        let type = 'damage';
        if (statusType === 'poison' || statusType === 'POISON') type = 'poison';
        else if (statusType === 'burning' || statusType === 'BURNING') type = 'fire';
        else if (statusType === 'frozen' || statusType === 'FROZEN') type = 'ice';
        
        return this.spawn(damage, x, y, type, {
            ...options,
            fontSize: DAMAGE_NUMBER_CONFIG.BASE_FONT_SIZE * 0.8
        });
    }
    
    // Show combo damage with multiplier
    showComboDamage(damage, x, y, comboMultiplier, options = {}) {
        return this.spawn(damage, x, y, damage > 50 ? 'critical' : 'damage', {
            ...options,
            comboMultiplier,
            showCombo: DAMAGE_NUMBER_CONFIG.COMBO_MULTIPLIER_DISPLAY
        });
    }
    
    // Custom text display
    showText(text, x, y, color, options = {}) {
        const damageNum = new DamageNumber(0, x, y, 'custom', {
            ...options,
            text,
            color
        });
        this.numbers.push(damageNum);
        return damageNum;
    }
    
    // Render all damage numbers
    render(ctx, camera) {
        if (!this.enabled) return;
        
        for (const num of this.numbers) {
            num.render(ctx, camera);
        }
    }
    
    // Toggle settings
    toggle(setting) {
        switch (setting) {
            case 'damage':
                this.showDamage = !this.showDamage;
                break;
            case 'healing':
                this.showHealing = !this.showHealing;
                break;
            case 'xp':
                this.showXP = !this.showXP;
                break;
            case 'critical':
                this.showCritical = !this.showCritical;
                break;
            case 'status':
                this.showStatus = !this.showStatus;
                break;
            case 'all':
                this.enabled = !this.enabled;
                break;
        }
    }
    
    // Clear all numbers
    clear() {
        this.numbers = [];
    }
    
    // Serialize
    serialize() {
        return {
            enabled: this.enabled,
            showDamage: this.showDamage,
            showHealing: this.showHealing,
            showXP: this.showXP,
            showCritical: this.showCritical,
            showStatus: this.showStatus
        };
    }
    
    deserialize(data) {
        if (data) {
            this.enabled = data.enabled ?? true;
            this.showDamage = data.showDamage ?? true;
            this.showHealing = data.showHealing ?? true;
            this.showXP = data.showXP ?? true;
            this.showCritical = data.showCritical ?? true;
            this.showStatus = data.showStatus ?? true;
        }
    }
    
    reset() {
        this.numbers = [];
        this.enabled = true;
    }
}
