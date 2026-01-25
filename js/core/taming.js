// Taming System - Befriend and control animals
import { CONFIG, ENEMIES } from '../config.js';

// Tameable animal types
export const TAMEABLE = {
    WOLF: {
        type: 'WOLF',
        name: 'Wolf',
        emoji: '🐺',
        baseChance: 0.15,
        favoriteFood: ['raw_meat', 'cooked_meat'],
        health: 30,
        damage: 6,
        speed: 3,
        abilities: ['attack', 'follow', 'guard']
    },
    BOAR: {
        type: 'BOAR',
        name: 'Boar',
        emoji: '🐗',
        baseChance: 0.2,
        favoriteFood: ['berry', 'apple', 'mushroom'],
        health: 25,
        damage: 4,
        speed: 2.5,
        abilities: ['attack', 'follow', 'carry']
    }
};

export class TamingSystem {
    constructor(game) {
        this.game = game;
        this.pets = []; // Player's tamed animals
        this.maxPets = 1; // Default, can be increased by perks
        this.tamingCooldown = 0;
    }
    
    update(deltaTime) {
        // Update cooldown
        if (this.tamingCooldown > 0) {
            this.tamingCooldown -= deltaTime;
        }
        
        // Update pets
        for (const pet of this.pets) {
            this.updatePet(pet, deltaTime);
        }
        
        // Remove dead pets
        this.pets = this.pets.filter(p => p.health > 0);
    }
    
    updatePet(pet, deltaTime) {
        if (!this.game.player) return;
        
        const player = this.game.player;
        const dx = player.x - pet.x;
        const dy = player.y - pet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        switch (pet.state) {
            case 'follow':
                // Follow player if too far
                if (dist > 3) {
                    const speed = pet.speed * deltaTime;
                    pet.x += (dx / dist) * speed;
                    pet.y += (dy / dist) * speed;
                    
                    // Set Z to ground level
                    const groundZ = this.game.world.getHeight(
                        Math.floor(pet.x), 
                        Math.floor(pet.y)
                    );
                    pet.z = groundZ + 1;
                }
                
                // Look for enemies to attack
                if (pet.abilities.includes('attack')) {
                    this.petAttack(pet);
                }
                break;
                
            case 'guard':
                // Stay in place and attack nearby enemies
                if (pet.abilities.includes('attack')) {
                    this.petAttack(pet);
                }
                break;
                
            case 'stay':
                // Do nothing
                break;
        }
        
        // Update pet's attack cooldown
        if (pet.attackCooldown > 0) {
            pet.attackCooldown -= deltaTime;
        }
    }
    
    petAttack(pet) {
        if (pet.attackCooldown > 0) return;
        
        // Find nearest enemy
        const enemies = this.game.entities.filter(e => 
            e.constructor.name === 'Enemy' && !e.isDead
        );
        
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        for (const enemy of enemies) {
            const dx = enemy.x - pet.x;
            const dy = enemy.y - pet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 5 && dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        }
        
        if (nearestEnemy && nearestDist < 2) {
            // Attack!
            let damage = pet.damage;
            
            // Apply skill bonuses
            if (this.game.skillsManager) {
                damage *= (1 + this.game.skillsManager.getSkillBonus('taming', 'petDamage'));
                damage *= (1 + this.game.skillsManager.getPerkEffect('alpha_bond', 'petDamageBonus'));
            }
            
            nearestEnemy.takeDamage(damage, pet);
            pet.attackCooldown = 1; // 1 second cooldown
            
            // Play attack sound
            if (this.game.audio) {
                this.game.audio.play('attack');
            }
        } else if (nearestEnemy && nearestDist < 5) {
            // Move toward enemy
            const dx = nearestEnemy.x - pet.x;
            const dy = nearestEnemy.y - pet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            pet.x += (dx / dist) * pet.speed * 0.016;
            pet.y += (dy / dist) * pet.speed * 0.016;
        }
    }
    
    tryTame(enemy) {
        if (this.tamingCooldown > 0) {
            if (this.game.ui) {
                this.game.ui.showNotification('Taming on cooldown!', 'warning');
            }
            return false;
        }
        
        // Check if we have room for more pets
        const maxPets = this.maxPets + 
            (this.game.skillsManager?.getPerkEffect('beast_friend', 'maxPets') || 0);
        
        if (this.pets.length >= maxPets) {
            if (this.game.ui) {
                this.game.ui.showNotification('You already have maximum pets!', 'warning');
            }
            return false;
        }
        
        // Check if enemy is tameable
        const tameableData = TAMEABLE[enemy.type];
        if (!tameableData) {
            if (this.game.ui) {
                this.game.ui.showNotification('This creature cannot be tamed!', 'warning');
            }
            return false;
        }
        
        // Check if player has favorite food
        const player = this.game.player;
        let hasFood = false;
        let foodIndex = -1;
        let foodType = null;
        
        for (let i = 0; i < player.inventory.length; i++) {
            const item = player.inventory[i];
            if (item && tameableData.favoriteFood.includes(item.name.toLowerCase().replace(' ', '_'))) {
                hasFood = true;
                foodIndex = i;
                foodType = item.name;
                break;
            }
        }
        
        // Also check hotbar
        if (!hasFood) {
            for (let i = 0; i < player.hotbar.length; i++) {
                const item = player.hotbar[i];
                if (item && tameableData.favoriteFood.includes(
                    item.name.toLowerCase().replace(' ', '_')
                )) {
                    hasFood = true;
                    foodIndex = i;
                    foodType = item.name;
                    break;
                }
            }
        }
        
        if (!hasFood) {
            if (this.game.ui) {
                this.game.ui.showNotification(
                    `Need ${tameableData.favoriteFood.join(' or ')} to tame!`, 
                    'warning'
                );
            }
            return false;
        }
        
        // Calculate tame chance
        let chance = tameableData.baseChance;
        
        // Add skill bonus
        if (this.game.skillsManager) {
            chance += this.game.skillsManager.getSkillBonus('taming', 'tameChance');
        }
        
        // Low health enemy is easier to tame
        const healthPercent = enemy.health / enemy.maxHealth;
        if (healthPercent < 0.5) {
            chance += 0.2;
        }
        
        // Consume food
        if (foodIndex !== -1) {
            if (player.inventory[foodIndex]) {
                player.inventory[foodIndex].count--;
                if (player.inventory[foodIndex].count <= 0) {
                    player.inventory[foodIndex] = null;
                }
            }
        }
        
        // Set cooldown
        this.tamingCooldown = 5;
        
        // Roll for taming
        if (Math.random() < chance) {
            // Success!
            this.addPet(enemy, tameableData);
            
            // Add skill XP
            if (this.game.skillsManager) {
                this.game.skillsManager.addSkillXp('taming', 20);
            }
            
            // Remove enemy from world
            enemy.isDead = true;
            
            // Play sound and show notification
            if (this.game.audio) {
                this.game.audio.play('tame');
            }
            if (this.game.ui) {
                this.game.ui.showNotification(
                    `${tameableData.emoji} Tamed a ${tameableData.name}!`, 
                    'success'
                );
            }
            
            return true;
        } else {
            // Failed
            if (this.game.ui) {
                this.game.ui.showNotification('Taming failed! Try again.', 'warning');
            }
            
            // Add some skill XP even on failure
            if (this.game.skillsManager) {
                this.game.skillsManager.addSkillXp('taming', 5);
            }
            
            return false;
        }
    }
    
    addPet(enemy, tameableData) {
        let health = tameableData.health;
        
        // Apply skill bonuses
        if (this.game.skillsManager) {
            health *= (1 + this.game.skillsManager.getSkillBonus('taming', 'petHealth'));
        }
        
        const pet = {
            id: Date.now(),
            type: tameableData.type,
            name: tameableData.name,
            emoji: tameableData.emoji,
            x: enemy.x,
            y: enemy.y,
            z: enemy.z,
            health: health,
            maxHealth: health,
            damage: tameableData.damage,
            speed: tameableData.speed,
            abilities: [...tameableData.abilities],
            state: 'follow', // follow, guard, stay
            attackCooldown: 0
        };
        
        this.pets.push(pet);
    }
    
    setPetState(petId, state) {
        const pet = this.pets.find(p => p.id === petId);
        if (pet) {
            pet.state = state;
        }
    }
    
    dismissPet(petId) {
        this.pets = this.pets.filter(p => p.id !== petId);
    }
    
    healPet(petId, amount) {
        const pet = this.pets.find(p => p.id === petId);
        if (pet) {
            pet.health = Math.min(pet.maxHealth, pet.health + amount);
        }
    }
    
    // Serialize for save
    serialize() {
        return {
            pets: this.pets.map(p => ({
                type: p.type,
                name: p.name,
                emoji: p.emoji,
                health: p.health,
                maxHealth: p.maxHealth,
                damage: p.damage,
                speed: p.speed,
                abilities: p.abilities,
                state: p.state
            }))
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data.pets) {
            this.pets = data.pets.map(p => ({
                ...p,
                id: Date.now() + Math.random(),
                x: this.game.player?.x || 0,
                y: this.game.player?.y || 0,
                z: this.game.player?.z || 20,
                attackCooldown: 0
            }));
        }
    }
    
    // Reset for new game
    reset() {
        this.pets = [];
        this.tamingCooldown = 0;
    }
}
