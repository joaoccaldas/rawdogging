// Potion Brewing System
// Complete alchemy system with ingredients, brewing, and effects

export class PotionSystem {
    constructor(game) {
        this.game = game;
        
        // Brewing state
        this.isBrewingUIOpen = false;
        this.activeBrews = [];
        
        // Player active effects
        this.activeEffects = new Map();
        
        // Ingredient database
        this.ingredients = {
            // Base ingredients
            water_bottle: { name: 'Water Bottle', type: 'base', effect: null },
            nether_wart: { name: 'Nether Wart', type: 'modifier', effect: 'awkward' },
            
            // Effect ingredients
            glistering_melon: { name: 'Glistering Melon', type: 'effect', effect: 'healing' },
            ghast_tear: { name: 'Ghast Tear', type: 'effect', effect: 'regeneration' },
            blaze_powder: { name: 'Blaze Powder', type: 'effect', effect: 'strength' },
            sugar: { name: 'Sugar', type: 'effect', effect: 'speed' },
            rabbit_foot: { name: 'Rabbit Foot', type: 'effect', effect: 'leaping' },
            spider_eye: { name: 'Spider Eye', type: 'effect', effect: 'poison' },
            golden_carrot: { name: 'Golden Carrot', type: 'effect', effect: 'night_vision' },
            magma_cream: { name: 'Magma Cream', type: 'effect', effect: 'fire_resistance' },
            pufferfish: { name: 'Pufferfish', type: 'effect', effect: 'water_breathing' },
            phantom_membrane: { name: 'Phantom Membrane', type: 'effect', effect: 'slow_falling' },
            turtle_shell: { name: 'Turtle Shell', type: 'effect', effect: 'turtle_master' },
            
            // Modifiers
            redstone_dust: { name: 'Redstone', type: 'duration', multiplier: 2 },
            glowstone_dust: { name: 'Glowstone', type: 'potency', multiplier: 2 },
            gunpowder: { name: 'Gunpowder', type: 'splash', splashRadius: 4 },
            dragon_breath: { name: 'Dragon Breath', type: 'lingering', lingerDuration: 30 },
            fermented_spider_eye: { name: 'Fermented Spider Eye', type: 'corrupt', corruptEffect: true }
        };
        
        // Potion effects database
        this.effectDatabase = {
            healing: {
                name: 'Healing',
                color: '#FF6B6B',
                icon: '❤️',
                instant: true,
                baseValue: 4,
                description: 'Instantly restores health'
            },
            regeneration: {
                name: 'Regeneration',
                color: '#FF69B4',
                icon: '💗',
                duration: 45,
                tickRate: 2.5,
                healPerTick: 1,
                description: 'Regenerates health over time'
            },
            strength: {
                name: 'Strength',
                color: '#8B0000',
                icon: '💪',
                duration: 180,
                damageBonus: 3,
                description: 'Increases melee damage'
            },
            speed: {
                name: 'Speed',
                color: '#87CEEB',
                icon: '⚡',
                duration: 180,
                speedMultiplier: 1.4,
                description: 'Increases movement speed'
            },
            leaping: {
                name: 'Leaping',
                color: '#90EE90',
                icon: '🦘',
                duration: 180,
                jumpMultiplier: 1.5,
                description: 'Increases jump height'
            },
            poison: {
                name: 'Poison',
                color: '#006400',
                icon: '☠️',
                duration: 45,
                tickRate: 1.25,
                damagePerTick: 1,
                description: 'Deals damage over time'
            },
            night_vision: {
                name: 'Night Vision',
                color: '#000080',
                icon: '👁️',
                duration: 180,
                lightLevel: 15,
                description: 'See in the dark'
            },
            fire_resistance: {
                name: 'Fire Resistance',
                color: '#FF4500',
                icon: '🔥',
                duration: 180,
                fireImmune: true,
                description: 'Immune to fire damage'
            },
            water_breathing: {
                name: 'Water Breathing',
                color: '#1E90FF',
                icon: '🫧',
                duration: 180,
                waterBreathing: true,
                description: 'Breathe underwater'
            },
            slow_falling: {
                name: 'Slow Falling',
                color: '#E6E6FA',
                icon: '🪶',
                duration: 90,
                fallSpeed: 0.3,
                description: 'Fall slowly and take no fall damage'
            },
            invisibility: {
                name: 'Invisibility',
                color: '#DCDCDC',
                icon: '👻',
                duration: 180,
                invisible: true,
                description: 'Become invisible to enemies'
            },
            turtle_master: {
                name: 'Turtle Master',
                color: '#006666',
                icon: '🐢',
                duration: 20,
                damageResistance: 0.6,
                speedMultiplier: 0.4,
                description: 'High resistance but slow movement'
            },
            // Corrupted effects (from fermented spider eye)
            harming: {
                name: 'Harming',
                color: '#4B0082',
                icon: '💔',
                instant: true,
                baseValue: -6,
                description: 'Instantly deals damage'
            },
            weakness: {
                name: 'Weakness',
                color: '#696969',
                icon: '😵',
                duration: 90,
                damageBonus: -4,
                description: 'Decreases melee damage'
            },
            slowness: {
                name: 'Slowness',
                color: '#5F9EA0',
                icon: '🐌',
                duration: 90,
                speedMultiplier: 0.6,
                description: 'Decreases movement speed'
            }
        };
        
        // Corruption mappings
        this.corruptionMap = {
            healing: 'harming',
            poison: 'harming',
            speed: 'slowness',
            leaping: 'slowness',
            strength: 'weakness',
            night_vision: 'invisibility'
        };
        
        // Brewing recipes (effect -> required ingredient)
        this.brewingRecipes = new Map();
        this.initRecipes();
    }
    
    initRecipes() {
        // Map ingredients to effects
        for (const [id, ingredient] of Object.entries(this.ingredients)) {
            if (ingredient.type === 'effect' && ingredient.effect) {
                this.brewingRecipes.set(ingredient.effect, id);
            }
        }
    }
    
    // Create a potion
    createPotion(effect, potency = 1, duration = 1, type = 'normal') {
        const effectData = this.effectDatabase[effect];
        if (!effectData) return null;
        
        const potion = {
            id: `potion_${effect}`,
            name: `Potion of ${effectData.name}`,
            effect: effect,
            potency: potency,
            durationMultiplier: duration,
            type: type, // normal, splash, lingering
            color: effectData.color,
            icon: effectData.icon
        };
        
        // Modify name based on potency/duration
        if (potency > 1) {
            potion.name += ` II`;
        }
        if (duration > 1) {
            potion.name = `Extended ${potion.name}`;
        }
        if (type === 'splash') {
            potion.name = `Splash ${potion.name}`;
        } else if (type === 'lingering') {
            potion.name = `Lingering ${potion.name}`;
        }
        
        return potion;
    }
    
    // Start brewing process
    startBrew(basePotion, ingredient) {
        const ingredientData = this.ingredients[ingredient];
        if (!ingredientData) return false;
        
        const brew = {
            id: `brew_${Date.now()}`,
            basePotion: basePotion,
            ingredient: ingredient,
            progress: 0,
            brewTime: 20, // 20 seconds
            result: null
        };
        
        // Determine result
        brew.result = this.calculateBrewResult(basePotion, ingredientData);
        
        this.activeBrews.push(brew);
        return brew;
    }
    
    calculateBrewResult(basePotion, ingredientData) {
        // Water bottle + nether wart = awkward potion
        if (!basePotion && ingredientData.effect === 'awkward') {
            return { id: 'awkward_potion', name: 'Awkward Potion', isBase: true };
        }
        
        // Awkward potion + effect ingredient = effect potion
        if (basePotion?.isBase && ingredientData.type === 'effect') {
            return this.createPotion(ingredientData.effect);
        }
        
        // Effect potion + modifier
        if (basePotion?.effect) {
            if (ingredientData.type === 'duration') {
                return this.createPotion(
                    basePotion.effect,
                    basePotion.potency || 1,
                    (basePotion.durationMultiplier || 1) * ingredientData.multiplier,
                    basePotion.type
                );
            }
            if (ingredientData.type === 'potency') {
                return this.createPotion(
                    basePotion.effect,
                    (basePotion.potency || 1) * ingredientData.multiplier,
                    basePotion.durationMultiplier || 1,
                    basePotion.type
                );
            }
            if (ingredientData.type === 'splash') {
                return this.createPotion(
                    basePotion.effect,
                    basePotion.potency || 1,
                    basePotion.durationMultiplier || 1,
                    'splash'
                );
            }
            if (ingredientData.type === 'lingering') {
                return this.createPotion(
                    basePotion.effect,
                    basePotion.potency || 1,
                    basePotion.durationMultiplier || 1,
                    'lingering'
                );
            }
            if (ingredientData.type === 'corrupt') {
                const corruptedEffect = this.corruptionMap[basePotion.effect];
                if (corruptedEffect) {
                    return this.createPotion(
                        corruptedEffect,
                        basePotion.potency || 1,
                        basePotion.durationMultiplier || 1,
                        basePotion.type
                    );
                }
            }
        }
        
        return null;
    }
    
    // Drink a potion
    drinkPotion(potion) {
        if (!potion?.effect) return false;
        
        const effectData = this.effectDatabase[potion.effect];
        if (!effectData) return false;
        
        // Play drink sound
        this.game.audio?.play('drink');
        
        // Apply effect
        this.applyEffect(potion.effect, potion.potency || 1, potion.durationMultiplier || 1);
        
        // Visual feedback
        this.game.consumptionEffects?.drink?.(potion);
        
        return true;
    }
    
    // Throw splash potion
    throwSplashPotion(potion, targetX, targetY) {
        if (potion.type !== 'splash') return false;
        
        // Create projectile
        // On impact, apply effect to all entities in radius
        const splashRadius = 4;
        const entities = this.game.entities?.getInRadius?.(targetX, targetY, splashRadius) || [];
        
        for (const entity of entities) {
            const distance = Math.sqrt(
                Math.pow(entity.x - targetX, 2) +
                Math.pow(entity.y - targetY, 2)
            );
            
            // Effect strength decreases with distance
            const strength = 1 - (distance / splashRadius);
            
            if (entity === this.game.player) {
                this.applyEffect(potion.effect, potion.potency * strength, potion.durationMultiplier * strength);
            } else if (entity.applyPotionEffect) {
                entity.applyPotionEffect(potion.effect, potion.potency * strength, potion.durationMultiplier * strength);
            }
        }
        
        // Splash particles
        this.game.particles?.burst?.(targetX, targetY, 0.5, {
            count: 20,
            color: this.effectDatabase[potion.effect]?.color || '#FFF'
        });
        
        return true;
    }
    
    // Apply effect to player
    applyEffect(effectName, potency = 1, durationMultiplier = 1) {
        const effectData = this.effectDatabase[effectName];
        if (!effectData) return;
        
        // Instant effects
        if (effectData.instant) {
            const value = effectData.baseValue * potency;
            if (value > 0) {
                this.game.player?.heal?.(value);
            } else {
                this.game.player?.damage?.(-value);
            }
            return;
        }
        
        // Duration effects
        const effect = {
            name: effectName,
            data: effectData,
            potency: potency,
            remainingTime: effectData.duration * durationMultiplier,
            maxTime: effectData.duration * durationMultiplier,
            tickAccumulator: 0
        };
        
        // Replace existing effect of same type (with stronger/longer one)
        const existing = this.activeEffects.get(effectName);
        if (existing) {
            if (effect.remainingTime > existing.remainingTime || effect.potency > existing.potency) {
                this.activeEffects.set(effectName, effect);
            }
        } else {
            this.activeEffects.set(effectName, effect);
        }
        
        // Apply immediate modifiers
        this.applyModifiers();
        
        // Notification
        this.game.ui?.showNotification?.(
            `${effectData.icon} ${effectData.name} (${Math.floor(effect.remainingTime)}s)`,
            'info'
        );
    }
    
    // Remove effect
    removeEffect(effectName) {
        this.activeEffects.delete(effectName);
        this.applyModifiers();
    }
    
    // Clear all effects
    clearEffects() {
        this.activeEffects.clear();
        this.applyModifiers();
    }
    
    // Apply stat modifiers based on active effects
    applyModifiers() {
        const player = this.game.player;
        if (!player) return;
        
        // Reset to base values
        player.speedMultiplier = 1;
        player.damageBonus = 0;
        player.jumpMultiplier = 1;
        player.fireImmune = false;
        player.waterBreathing = false;
        player.invisible = false;
        player.damageResistance = 0;
        
        // Apply each effect
        for (const [name, effect] of this.activeEffects) {
            const data = effect.data;
            
            if (data.speedMultiplier) {
                player.speedMultiplier *= data.speedMultiplier;
            }
            if (data.damageBonus) {
                player.damageBonus += data.damageBonus * effect.potency;
            }
            if (data.jumpMultiplier) {
                player.jumpMultiplier *= data.jumpMultiplier;
            }
            if (data.fireImmune) {
                player.fireImmune = true;
            }
            if (data.waterBreathing) {
                player.waterBreathing = true;
            }
            if (data.invisible) {
                player.invisible = true;
            }
            if (data.damageResistance) {
                player.damageResistance = Math.max(player.damageResistance, data.damageResistance);
            }
        }
    }
    
    // Check if player has effect
    hasEffect(effectName) {
        return this.activeEffects.has(effectName);
    }
    
    // Get remaining time of effect
    getEffectTime(effectName) {
        return this.activeEffects.get(effectName)?.remainingTime || 0;
    }
    
    update(deltaTime) {
        // Update active brews
        for (let i = this.activeBrews.length - 1; i >= 0; i--) {
            const brew = this.activeBrews[i];
            brew.progress += deltaTime;
            
            if (brew.progress >= brew.brewTime) {
                // Brewing complete
                if (brew.result) {
                    this.game.inventory?.addItem?.(brew.result);
                    this.game.ui?.showNotification?.(`Brewed: ${brew.result.name}`, 'success');
                    this.game.audio?.play('brew_complete');
                }
                this.activeBrews.splice(i, 1);
            }
        }
        
        // Update active effects on player
        for (const [name, effect] of this.activeEffects) {
            effect.remainingTime -= deltaTime;
            
            // Handle tick-based effects
            if (effect.data.tickRate) {
                effect.tickAccumulator += deltaTime;
                
                while (effect.tickAccumulator >= effect.data.tickRate) {
                    effect.tickAccumulator -= effect.data.tickRate;
                    
                    // Apply tick effect
                    if (effect.data.healPerTick) {
                        this.game.player?.heal?.(effect.data.healPerTick * effect.potency);
                    }
                    if (effect.data.damagePerTick) {
                        this.game.player?.damage?.(effect.data.damagePerTick * effect.potency);
                    }
                }
            }
            
            // Remove expired effects
            if (effect.remainingTime <= 0) {
                this.removeEffect(name);
            }
        }
    }
    
    // Render active effects HUD
    render(ctx) {
        if (this.activeEffects.size === 0) return;
        
        const startX = 10;
        let y = 150;
        const iconSize = 24;
        const spacing = 28;
        
        ctx.save();
        
        for (const [name, effect] of this.activeEffects) {
            const data = effect.data;
            const timePercent = effect.remainingTime / effect.maxTime;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(startX, y, 100, iconSize);
            
            // Icon
            ctx.font = '18px Arial';
            ctx.fillText(data.icon, startX + 3, y + 19);
            
            // Time bar background
            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(startX + 26, y + 4, 70, 8);
            
            // Time bar fill
            ctx.fillStyle = data.color;
            ctx.fillRect(startX + 26, y + 4, 70 * timePercent, 8);
            
            // Time text
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'left';
            const timeStr = effect.remainingTime > 60 ?
                `${Math.floor(effect.remainingTime / 60)}:${String(Math.floor(effect.remainingTime % 60)).padStart(2, '0')}` :
                `${Math.floor(effect.remainingTime)}s`;
            ctx.fillText(timeStr, startX + 28, y + 22);
            
            // Potency indicator
            if (effect.potency > 1) {
                ctx.fillStyle = '#FFD700';
                ctx.fillText(`x${effect.potency}`, startX + 80, y + 22);
            }
            
            y += spacing;
        }
        
        ctx.restore();
    }
    
    // Toggle brewing UI
    toggleBrewingUI() {
        this.isBrewingUIOpen = !this.isBrewingUIOpen;
    }
    
    // Serialize for saving
    serialize() {
        return {
            activeEffects: Array.from(this.activeEffects.entries()).map(([name, effect]) => ({
                name,
                potency: effect.potency,
                remainingTime: effect.remainingTime,
                maxTime: effect.maxTime
            })),
            activeBrews: this.activeBrews
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            this.activeEffects.clear();
            
            if (data.activeEffects) {
                for (const effectData of data.activeEffects) {
                    const fullData = this.effectDatabase[effectData.name];
                    if (fullData) {
                        this.activeEffects.set(effectData.name, {
                            name: effectData.name,
                            data: fullData,
                            potency: effectData.potency,
                            remainingTime: effectData.remainingTime,
                            maxTime: effectData.maxTime,
                            tickAccumulator: 0
                        });
                    }
                }
                this.applyModifiers();
            }
            
            if (data.activeBrews) {
                this.activeBrews = data.activeBrews;
            }
        }
    }
    
    // Use potion from inventory item
    useItem(itemId) {
        // Parse potion item id (format: healing_potion, speed_potion, etc.)
        const potionMapping = {
            'healing_potion': 'healing',
            'speed_potion': 'speed',
            'strength_potion': 'strength',
            'invisibility_potion': 'invisibility',
            'regeneration_potion': 'regeneration',
            'fire_resistance_potion': 'fire_resistance',
            'water_breathing_potion': 'water_breathing',
            'night_vision_potion': 'night_vision',
            'leaping_potion': 'leaping',
            'slow_falling_potion': 'slow_falling'
        };
        
        const effect = potionMapping[itemId];
        if (!effect) return false;
        
        // Create and drink the potion
        const potion = this.createPotion(effect);
        if (potion) {
            this.drinkPotion(potion);
            this.game.player?.removeItem?.(itemId, 1);
            return true;
        }
        
        return false;
    }
    
    // Get active effect icons for HUD display
    getActiveEffectIcons() {
        const icons = [];
        for (const [name, effect] of this.activeEffects) {
            icons.push({
                icon: effect.data.icon,
                name: effect.data.name,
                time: effect.remainingTime,
                color: effect.data.color
            });
        }
        return icons;
    }
    
    // Reset system
    reset() {
        this.activeEffects.clear();
        this.activeBrews = [];
        this.isBrewingUIOpen = false;
        
        // Reset player modifiers
        const player = this.game.player;
        if (player) {
            player.speedMultiplier = 1;
            player.damageBonus = 0;
            player.jumpMultiplier = 1;
            player.fireImmune = false;
            player.waterBreathing = false;
            player.invisible = false;
            player.damageResistance = 0;
        }
    }
}
