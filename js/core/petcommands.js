// Pet Commands System - Control tamed animals with commands
import { CONFIG } from '../config.js';

export const PET_COMMANDS = {
    FOLLOW: {
        id: 'follow',
        name: 'Follow',
        icon: '🚶',
        description: 'Pet follows you',
        default: true
    },
    STAY: {
        id: 'stay',
        name: 'Stay',
        icon: '🛑',
        description: 'Pet stays in place'
    },
    ATTACK: {
        id: 'attack',
        name: 'Attack',
        icon: '⚔️',
        description: 'Pet attacks your target'
    },
    DEFEND: {
        id: 'defend',
        name: 'Defend',
        icon: '🛡️',
        description: 'Pet defends you from attackers'
    },
    PATROL: {
        id: 'patrol',
        name: 'Patrol',
        icon: '👀',
        description: 'Pet patrols an area'
    },
    WANDER: {
        id: 'wander',
        name: 'Wander',
        icon: '🌀',
        description: 'Pet wanders freely nearby'
    },
    GATHER: {
        id: 'gather',
        name: 'Gather',
        icon: '🧺',
        description: 'Pet gathers nearby items'
    },
    HUNT: {
        id: 'hunt',
        name: 'Hunt',
        icon: '🎯',
        description: 'Pet hunts wildlife for you'
    }
};

export const PET_ABILITIES = {
    WOLF: ['follow', 'stay', 'attack', 'defend', 'hunt'],
    BOAR: ['follow', 'stay', 'attack', 'defend'],
    RABBIT: ['follow', 'stay', 'wander', 'gather'],
    DEER: ['follow', 'stay', 'wander'],
    MAMMOTH: ['follow', 'stay', 'defend'],
    SABERTOOTH: ['follow', 'stay', 'attack', 'defend', 'hunt', 'patrol'],
    EAGLE: ['follow', 'stay', 'patrol', 'hunt'],
    BEAR: ['follow', 'stay', 'attack', 'defend', 'gather']
};

class PetController {
    constructor(entity, system) {
        this.entity = entity;
        this.system = system;
        
        this.currentCommand = 'follow';
        this.commandTarget = null;
        
        // Patrol waypoints
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        
        // Stay position
        this.stayPosition = null;
        
        // Attack target
        this.attackTarget = null;
        
        // Gather radius
        this.gatherRadius = 5;
        
        // Behavior timers
        this.commandUpdateTimer = 0;
        this.actionCooldown = 0;
    }
    
    get availableCommands() {
        const entityType = this.entity.type?.toUpperCase() || 'WOLF';
        return PET_ABILITIES[entityType] || ['follow', 'stay'];
    }
    
    // Set command
    setCommand(commandId, target = null) {
        if (!this.availableCommands.includes(commandId)) {
            return false;
        }
        
        this.currentCommand = commandId;
        this.commandTarget = target;
        
        // Reset state based on command
        switch (commandId) {
            case 'stay':
                this.stayPosition = { 
                    x: this.entity.x, 
                    y: this.entity.y, 
                    z: this.entity.z 
                };
                break;
            case 'patrol':
                if (!this.patrolPoints.length) {
                    // Add current position as first patrol point
                    this.addPatrolPoint(this.entity.x, this.entity.y, this.entity.z);
                }
                break;
            case 'attack':
                this.attackTarget = target;
                break;
        }
        
        return true;
    }
    
    // Add patrol point
    addPatrolPoint(x, y, z) {
        this.patrolPoints.push({ x, y, z });
    }
    
    // Clear patrol points
    clearPatrolPoints() {
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
    }
    
    // Get next patrol point
    getNextPatrolPoint() {
        if (this.patrolPoints.length === 0) return null;
        
        const point = this.patrolPoints[this.currentPatrolIndex];
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        return point;
    }
    
    // Update behavior
    update(deltaTime, game) {
        this.commandUpdateTimer += deltaTime;
        
        if (this.actionCooldown > 0) {
            this.actionCooldown -= deltaTime;
        }
        
        // Don't update too frequently
        if (this.commandUpdateTimer < 0.1) return;
        this.commandUpdateTimer = 0;
        
        const player = game.player;
        if (!player) return;
        
        switch (this.currentCommand) {
            case 'follow':
                this.doFollow(player);
                break;
            case 'stay':
                this.doStay();
                break;
            case 'attack':
                this.doAttack(game);
                break;
            case 'defend':
                this.doDefend(player, game);
                break;
            case 'patrol':
                this.doPatrol();
                break;
            case 'wander':
                this.doWander();
                break;
            case 'gather':
                this.doGather(game);
                break;
            case 'hunt':
                this.doHunt(game);
                break;
        }
    }
    
    doFollow(player) {
        const followDistance = 2;
        const dx = player.x - this.entity.x;
        const dy = player.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > followDistance) {
            // Move towards player
            const speed = this.entity.speed || 2;
            this.entity.vx = (dx / dist) * speed * 0.5;
            this.entity.vy = (dy / dist) * speed * 0.5;
        } else {
            // Stay near player
            this.entity.vx = 0;
            this.entity.vy = 0;
        }
    }
    
    doStay() {
        if (!this.stayPosition) {
            this.stayPosition = { x: this.entity.x, y: this.entity.y, z: this.entity.z };
        }
        
        const dx = this.stayPosition.x - this.entity.x;
        const dy = this.stayPosition.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.5) {
            const speed = this.entity.speed || 2;
            this.entity.vx = (dx / dist) * speed * 0.3;
            this.entity.vy = (dy / dist) * speed * 0.3;
        } else {
            this.entity.vx = 0;
            this.entity.vy = 0;
        }
    }
    
    doAttack(game) {
        // Find target
        let target = this.attackTarget;
        
        if (!target || target.dead) {
            // Find nearest enemy
            target = this.findNearestEnemy(game);
        }
        
        if (!target) {
            // No target, follow player
            this.doFollow(game.player);
            return;
        }
        
        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const attackRange = 1.5;
        
        if (dist <= attackRange && this.actionCooldown <= 0) {
            // Attack
            const damage = this.entity.attack || 10;
            target.takeDamage?.(damage);
            this.actionCooldown = 1; // 1 second cooldown
        } else if (dist > attackRange) {
            // Move towards target
            const speed = this.entity.speed || 2;
            this.entity.vx = (dx / dist) * speed;
            this.entity.vy = (dy / dist) * speed;
        }
    }
    
    doDefend(player, game) {
        // Find enemies near player
        const enemies = [];
        const defendRadius = 8;
        
        for (const entity of game.entities || []) {
            if (entity === this.entity || entity.tamed || entity.friendly) continue;
            
            const dx = player.x - entity.x;
            const dy = player.y - entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < defendRadius) {
                enemies.push({ entity, distance: dist });
            }
        }
        
        if (enemies.length > 0) {
            // Attack nearest enemy
            enemies.sort((a, b) => a.distance - b.distance);
            this.attackTarget = enemies[0].entity;
            this.doAttack(game);
        } else {
            // No threats, follow player
            this.doFollow(player);
        }
    }
    
    doPatrol() {
        const target = this.getNextPatrolPoint();
        if (!target) {
            this.doWander();
            return;
        }
        
        const dx = target.x - this.entity.x;
        const dy = target.y - this.entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
            const speed = this.entity.speed || 2;
            this.entity.vx = (dx / dist) * speed * 0.5;
            this.entity.vy = (dy / dist) * speed * 0.5;
        } else {
            // Reached waypoint, get next
            this.currentPatrolIndex++;
            if (this.currentPatrolIndex >= this.patrolPoints.length) {
                this.currentPatrolIndex = 0;
            }
        }
    }
    
    doWander() {
        if (this.actionCooldown > 0) return;
        
        // Random movement
        const angle = Math.random() * Math.PI * 2;
        const speed = (this.entity.speed || 2) * 0.3;
        
        this.entity.vx = Math.cos(angle) * speed;
        this.entity.vy = Math.sin(angle) * speed;
        
        this.actionCooldown = 2 + Math.random() * 3;
    }
    
    doGather(game) {
        // Find nearest item
        const items = game.items || [];
        let nearest = null;
        let nearestDist = this.gatherRadius;
        
        for (const item of items) {
            const dx = item.x - this.entity.x;
            const dy = item.y - this.entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < nearestDist) {
                nearest = item;
                nearestDist = dist;
            }
        }
        
        if (nearest) {
            const dx = nearest.x - this.entity.x;
            const dy = nearest.y - this.entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.5) {
                // Pick up item
                game.inventory?.addItem(nearest.itemId, nearest.quantity || 1);
                game.removeItem?.(nearest);
                game.ui?.showMessage(`🧺 Pet gathered ${nearest.itemId}`, 2000);
            } else {
                // Move towards item
                const speed = this.entity.speed || 2;
                this.entity.vx = (dx / dist) * speed * 0.5;
                this.entity.vy = (dy / dist) * speed * 0.5;
            }
        } else {
            // No items, wander
            this.doWander();
        }
    }
    
    doHunt(game) {
        // Find prey
        const target = this.findNearestPrey(game);
        
        if (target) {
            this.attackTarget = target;
            this.doAttack(game);
        } else {
            // No prey, patrol
            this.doWander();
        }
    }
    
    findNearestEnemy(game) {
        const entities = game.entities || [];
        let nearest = null;
        let nearestDist = 20;
        
        for (const entity of entities) {
            if (entity === this.entity || entity.tamed || entity.friendly) continue;
            if (entity.dead) continue;
            
            const dx = entity.x - this.entity.x;
            const dy = entity.y - this.entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < nearestDist) {
                nearest = entity;
                nearestDist = dist;
            }
        }
        
        return nearest;
    }
    
    findNearestPrey(game) {
        const preyTypes = ['rabbit', 'deer', 'boar'];
        const entities = game.entities || [];
        let nearest = null;
        let nearestDist = 15;
        
        for (const entity of entities) {
            if (entity === this.entity || entity.tamed) continue;
            if (entity.dead) continue;
            if (!preyTypes.includes(entity.type?.toLowerCase())) continue;
            
            const dx = entity.x - this.entity.x;
            const dy = entity.y - this.entity.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < nearestDist) {
                nearest = entity;
                nearestDist = dist;
            }
        }
        
        return nearest;
    }
    
    serialize() {
        return {
            entityId: this.entity.id,
            currentCommand: this.currentCommand,
            patrolPoints: this.patrolPoints,
            stayPosition: this.stayPosition
        };
    }
}

export class PetCommandSystem {
    constructor(game) {
        this.game = game;
        
        // Pet controllers indexed by entity id
        this.controllers = new Map();
        
        // Selected pet for commands
        this.selectedPet = null;
    }
    
    update(deltaTime) {
        // Update all pet controllers
        for (const controller of this.controllers.values()) {
            if (controller.entity.tamed) {
                controller.update(deltaTime, this.game);
            }
        }
        
        // Remove controllers for dead or untamed pets
        for (const [id, controller] of this.controllers.entries()) {
            if (controller.entity.dead || !controller.entity.tamed) {
                this.controllers.delete(id);
            }
        }
    }
    
    // Register a tamed pet
    registerPet(entity) {
        if (this.controllers.has(entity.id)) return;
        
        const controller = new PetController(entity, this);
        this.controllers.set(entity.id, controller);
        
        return controller;
    }
    
    // Unregister a pet
    unregisterPet(entityId) {
        this.controllers.delete(entityId);
        if (this.selectedPet?.id === entityId) {
            this.selectedPet = null;
        }
    }
    
    // Get controller for entity
    getController(entityId) {
        return this.controllers.get(entityId);
    }
    
    // Select a pet
    selectPet(entity) {
        if (this.controllers.has(entity.id)) {
            this.selectedPet = entity;
            this.game.ui?.showMessage(`🐾 Selected ${entity.name || entity.type}`, 2000);
            return true;
        }
        return false;
    }
    
    // Deselect pet
    deselectPet() {
        this.selectedPet = null;
    }
    
    // Issue command to selected pet
    issueCommand(commandId, target = null) {
        if (!this.selectedPet) {
            this.game.ui?.showMessage('❌ No pet selected', 2000);
            return false;
        }
        
        const controller = this.controllers.get(this.selectedPet.id);
        if (!controller) return false;
        
        if (controller.setCommand(commandId, target)) {
            const command = PET_COMMANDS[commandId.toUpperCase()];
            this.game.ui?.showMessage(
                `${command?.icon || '🐾'} ${this.selectedPet.name || this.selectedPet.type}: ${command?.name || commandId}`,
                2000
            );
            return true;
        }
        
        return false;
    }
    
    // Issue command to all pets
    issueCommandToAll(commandId, target = null) {
        for (const controller of this.controllers.values()) {
            controller.setCommand(commandId, target);
        }
        
        const command = PET_COMMANDS[commandId.toUpperCase()];
        this.game.ui?.showMessage(
            `${command?.icon || '🐾'} All pets: ${command?.name || commandId}`,
            2000
        );
    }
    
    // Get all tamed pets
    getAllPets() {
        return Array.from(this.controllers.values()).map(c => c.entity);
    }
    
    // Get pet count
    getPetCount() {
        return this.controllers.size;
    }
    
    // Add patrol point for selected pet
    addPatrolPointToSelected(x, y, z) {
        if (!this.selectedPet) return false;
        
        const controller = this.controllers.get(this.selectedPet.id);
        if (!controller) return false;
        
        controller.addPatrolPoint(x, y, z);
        this.game.ui?.showMessage(`📍 Added patrol point (${controller.patrolPoints.length} total)`, 2000);
        return true;
    }
    
    // Clear patrol points for selected pet
    clearPatrolPointsForSelected() {
        if (!this.selectedPet) return false;
        
        const controller = this.controllers.get(this.selectedPet.id);
        if (!controller) return false;
        
        controller.clearPatrolPoints();
        this.game.ui?.showMessage('🗑️ Cleared patrol points', 2000);
        return true;
    }
    
    // Serialize
    serialize() {
        const data = [];
        for (const controller of this.controllers.values()) {
            data.push(controller.serialize());
        }
        return { controllers: data };
    }
    
    deserialize(data, entities) {
        if (!data?.controllers) return;
        
        for (const controllerData of data.controllers) {
            // Find entity by id
            const entity = entities.find(e => e.id === controllerData.entityId);
            if (entity) {
                const controller = this.registerPet(entity);
                controller.currentCommand = controllerData.currentCommand || 'follow';
                controller.patrolPoints = controllerData.patrolPoints || [];
                controller.stayPosition = controllerData.stayPosition;
            }
        }
    }
    
    reset() {
        this.controllers.clear();
        this.selectedPet = null;
    }
}
