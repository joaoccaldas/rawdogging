// Visual Effects System - Eating, Drinking, Healing
// Satisfying visual/audio feedback for consumption actions

export class ConsumptionEffects {
    constructor(game) {
        this.game = game;
        
        // Active effects
        this.activeEffects = [];
        
        // Effect presets
        this.presets = {
            eat: {
                particles: 8,
                colors: ['#8B4513', '#A0522D', '#DEB887', '#F5DEB3'],
                sound: 'eat',
                hudPulse: 'hunger',
                floatText: null
            },
            drink: {
                particles: 10,
                colors: ['#4169E1', '#6495ED', '#87CEEB', '#B0E0E6'],
                sound: 'drink',
                hudPulse: 'thirst',
                floatText: null
            },
            heal: {
                particles: 12,
                colors: ['#FF69B4', '#FF1493', '#FF6B6B', '#FFB6C1'],
                sound: 'heal',
                hudPulse: 'health',
                floatText: '+HP'
            },
            buff: {
                particles: 15,
                colors: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C'],
                sound: 'powerup',
                hudPulse: null,
                floatText: 'BUFF!'
            },
            levelup: {
                particles: 30,
                colors: ['#00FF00', '#7FFF00', '#ADFF2F', '#98FB98'],
                sound: 'levelup',
                hudPulse: 'xp',
                floatText: 'LEVEL UP!'
            }
        };
        
        // HUD pulse state
        this.hudPulses = {
            health: { active: false, intensity: 0 },
            hunger: { active: false, intensity: 0 },
            thirst: { active: false, intensity: 0 },
            xp: { active: false, intensity: 0 }
        };
    }
    
    // Trigger eating effect
    eat(foodItem, healAmount = 0, hungerRestore = 0) {
        const player = this.game.player;
        if (!player) return;
        
        // Particles from mouth area
        this.spawnConsumptionParticles('eat', player.x, player.y, player.z + 1.5);
        
        // Play crunch sound
        this.playSound('eat');
        
        // Pulse hunger bar
        this.triggerHudPulse('hunger', 1);
        
        // If also heals, pulse health
        if (healAmount > 0) {
            this.triggerHudPulse('health', 0.5);
            this.showFloatingText(player, `+${healAmount}`, '#FF69B4');
        }
        
        // Show food name
        if (foodItem?.name) {
            this.showFloatingText(player, foodItem.name, '#DEB887', -30);
        }
        
        // Screen effect
        this.addScreenEffect('satisfaction');
    }
    
    // Trigger drinking effect
    drink(drinkItem, thirstRestore = 0) {
        const player = this.game.player;
        if (!player) return;
        
        // Water particles
        this.spawnConsumptionParticles('drink', player.x, player.y, player.z + 1.5);
        
        // Gulp sound
        this.playSound('drink');
        
        // Pulse thirst bar if exists
        this.triggerHudPulse('thirst', 1);
        
        // Refreshing screen tint
        this.addScreenEffect('refresh');
    }
    
    // Trigger healing effect
    heal(amount, source = 'item') {
        const player = this.game.player;
        if (!player) return;
        
        // Pink/red healing particles
        this.spawnHealingParticles(player.x, player.y, player.z + 1);
        
        // Sound
        this.playSound('heal');
        
        // Pulse health bar
        this.triggerHudPulse('health', 1);
        
        // Floating number
        this.showFloatingText(player, `+${amount}`, '#FF69B4');
        
        // Screen flash
        this.addScreenEffect('heal');
    }
    
    // Trigger buff gained effect
    gainBuff(buffName, duration) {
        const player = this.game.player;
        if (!player) return;
        
        // Golden sparkles
        this.spawnConsumptionParticles('buff', player.x, player.y, player.z + 1);
        
        // Sound
        this.playSound('powerup');
        
        // Show buff name
        this.showFloatingText(player, buffName, '#FFD700');
        
        // Screen effect
        this.addScreenEffect('buff');
    }
    
    // Trigger level up effect
    levelUp(newLevel) {
        const player = this.game.player;
        if (!player) return;
        
        // Massive particle burst
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.spawnConsumptionParticles('levelup', player.x, player.y, player.z + 1);
            }, i * 200);
        }
        
        // Sound
        this.playSound('levelup');
        
        // Floating text
        this.showFloatingText(player, `LEVEL ${newLevel}!`, '#00FF00', 0, true);
        
        // Big screen effect
        this.addScreenEffect('levelup');
        
        // Pulse XP bar
        this.triggerHudPulse('xp', 1.5);
    }
    
    spawnConsumptionParticles(type, x, y, z) {
        if (!this.game.particles) return;
        
        const preset = this.presets[type];
        if (!preset) return;
        
        for (let i = 0; i < preset.particles; i++) {
            const color = preset.colors[Math.floor(Math.random() * preset.colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            
            this.game.particles.emit({
                x: x + (Math.random() - 0.5) * 0.5,
                y: y + (Math.random() - 0.5) * 0.5,
                z: z,
                vx: Math.cos(angle) * speed * 0.5,
                vy: Math.sin(angle) * speed * 0.5,
                vz: 1 + Math.random() * 2,
                color: color,
                size: 3 + Math.random() * 4,
                life: 0.5 + Math.random() * 0.5,
                gravity: 0.3
            });
        }
    }
    
    spawnHealingParticles(x, y, z) {
        if (!this.game.particles) return;
        
        // Spiral pattern for healing
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 4;
            const radius = 0.5;
            const delay = i * 30;
            
            setTimeout(() => {
                this.game.particles.emit({
                    x: x + Math.cos(angle) * radius,
                    y: y + Math.sin(angle) * radius,
                    z: z + (i / 15) * 2,
                    vx: Math.cos(angle) * 0.5,
                    vy: Math.sin(angle) * 0.5,
                    vz: 2,
                    color: '#FF69B4',
                    size: 4 + Math.random() * 3,
                    life: 0.8,
                    gravity: -0.5 // Float up
                });
            }, delay);
        }
    }
    
    showFloatingText(entity, text, color, offsetY = 0, large = false) {
        const effect = {
            type: 'floatingText',
            text: text,
            color: color,
            x: entity.x,
            y: entity.y,
            z: entity.z + 2,
            offsetY: offsetY,
            life: 1.5,
            maxLife: 1.5,
            large: large,
            velocity: 0
        };
        
        this.activeEffects.push(effect);
    }
    
    playSound(soundId) {
        if (this.game.audio) {
            this.game.audio.play(soundId);
        }
    }
    
    triggerHudPulse(barType, intensity = 1) {
        if (this.hudPulses[barType]) {
            this.hudPulses[barType].active = true;
            this.hudPulses[barType].intensity = intensity;
        }
    }
    
    addScreenEffect(type) {
        const effect = {
            type: 'screen',
            screenType: type,
            life: 0.5,
            maxLife: 0.5
        };
        
        this.activeEffects.push(effect);
    }
    
    update(deltaTime) {
        // Update active effects
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.life -= deltaTime;
            
            if (effect.type === 'floatingText') {
                effect.velocity += deltaTime * 50;
                effect.z += deltaTime * 1.5;
            }
            
            if (effect.life <= 0) {
                this.activeEffects.splice(i, 1);
            }
        }
        
        // Update HUD pulses
        for (const [key, pulse] of Object.entries(this.hudPulses)) {
            if (pulse.active) {
                pulse.intensity -= deltaTime * 3;
                if (pulse.intensity <= 0) {
                    pulse.active = false;
                    pulse.intensity = 0;
                }
            }
        }
    }
    
    render(ctx) {
        const camera = this.game.camera;
        
        for (const effect of this.activeEffects) {
            if (effect.type === 'floatingText') {
                this.renderFloatingText(ctx, effect, camera);
            } else if (effect.type === 'screen') {
                this.renderScreenEffect(ctx, effect);
            }
        }
    }
    
    renderFloatingText(ctx, effect, camera) {
        const screen = camera.worldToScreen(effect.x, effect.y, effect.z);
        const progress = 1 - (effect.life / effect.maxLife);
        const alpha = effect.life / effect.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = effect.large ? 'bold 28px Courier New' : 'bold 18px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(effect.text, screen.x + 2, screen.y + effect.offsetY - effect.velocity + 2);
        
        // Text
        ctx.fillStyle = effect.color;
        ctx.fillText(effect.text, screen.x, screen.y + effect.offsetY - effect.velocity);
        
        ctx.restore();
    }
    
    renderScreenEffect(ctx, effect) {
        const progress = 1 - (effect.life / effect.maxLife);
        const alpha = (1 - progress) * 0.3;
        
        let color;
        switch (effect.screenType) {
            case 'satisfaction':
                color = `rgba(255, 200, 100, ${alpha})`;
                break;
            case 'refresh':
                color = `rgba(100, 200, 255, ${alpha})`;
                break;
            case 'heal':
                color = `rgba(255, 100, 150, ${alpha})`;
                break;
            case 'buff':
                color = `rgba(255, 215, 0, ${alpha})`;
                break;
            case 'levelup':
                color = `rgba(100, 255, 100, ${alpha * 2})`;
                break;
            default:
                return;
        }
        
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }
    
    // Get HUD pulse intensity for UI rendering
    getHudPulse(barType) {
        return this.hudPulses[barType]?.intensity || 0;
    }
    
    reset() {
        this.activeEffects = [];
        for (const pulse of Object.values(this.hudPulses)) {
            pulse.active = false;
            pulse.intensity = 0;
        }
    }
}
