// Vehicle System - Trains, cars, drones for transportation
import { Entity } from '../entities/entity.js';
import { CONFIG, BLOCKS, BLOCK_DATA, ITEMS } from '../config.js';

// Vehicle Types
export const VEHICLE_TYPES = {
    MINECART: {
        id: 'minecart',
        name: 'Minecart',
        emoji: '🛒',
        speed: 5,
        maxSpeed: 8,
        acceleration: 2,
        capacity: 27, // Inventory slots
        requiresRail: true,
        fuelType: null, // Gravity/player powered
        tier: 1
    },
    STEAM_LOCOMOTIVE: {
        id: 'steam_locomotive',
        name: 'Steam Locomotive',
        emoji: '🚂',
        speed: 8,
        maxSpeed: 15,
        acceleration: 1,
        capacity: 0, // Engine only
        requiresRail: true,
        fuelType: ['coal', 'wood'],
        fuelConsumption: 0.5,
        canPull: 5, // Number of carts
        tier: 2
    },
    FREIGHT_CAR: {
        id: 'freight_car',
        name: 'Freight Car',
        emoji: '🚃',
        speed: 0, // Must be pulled
        capacity: 54,
        requiresRail: true,
        canBePulled: true,
        tier: 2
    },
    CAR: {
        id: 'car',
        name: 'Car',
        emoji: '🚗',
        speed: 10,
        maxSpeed: 20,
        acceleration: 5,
        capacity: 9,
        requiresRail: false,
        fuelType: ['oil_bucket', 'gasoline'],
        fuelConsumption: 0.2,
        requiresRoad: false, // Works anywhere but faster on roads
        roadSpeedBonus: 1.5,
        tier: 3
    },
    TRUCK: {
        id: 'truck',
        name: 'Truck',
        emoji: '🚚',
        speed: 8,
        maxSpeed: 15,
        acceleration: 3,
        capacity: 36,
        requiresRail: false,
        fuelType: ['oil_bucket', 'gasoline'],
        fuelConsumption: 0.4,
        roadSpeedBonus: 1.3,
        tier: 3
    },
    DRONE: {
        id: 'drone',
        name: 'Delivery Drone',
        emoji: '🛸',
        speed: 12,
        maxSpeed: 20,
        acceleration: 8,
        capacity: 4,
        flying: true,
        requiresRail: false,
        powerConsumption: 10, // Uses electricity
        range: 50, // Max distance from controller
        tier: 3
    }
};

// Vehicle Entity
export class Vehicle extends Entity {
    constructor(game, x, y, z, typeKey) {
        super(game, x, y, z);
        
        this.type = VEHICLE_TYPES[typeKey] || VEHICLE_TYPES.MINECART;
        this.emoji = this.type.emoji;
        
        this.width = 0.9;
        this.height = 0.9;
        this.depth = 1.0;
        
        // Movement
        this.speed = 0;
        this.maxSpeed = this.type.maxSpeed || this.type.speed;
        this.direction = 0; // 0-3 (N, E, S, W)
        this.moving = false;
        
        // For trains
        this.onRail = false;
        this.railDirection = null;
        this.linkedVehicles = []; // Attached cars
        this.pulledBy = null; // Reference to locomotive
        
        // Fuel
        this.fuel = 0;
        this.maxFuel = 100;
        
        // Inventory
        this.inventory = new Array(this.type.capacity).fill(null);
        
        // Passenger
        this.passenger = null;
        this.passengerOffset = { x: 0, y: 0, z: 0.5 };
        
        // Flying (for drones)
        this.targetPos = null;
        this.homePos = { x, y, z };
        this.returning = false;
        
        // State
        this.active = false;
    }

    update(deltaTime) {
        if (this.type.requiresRail) {
            this.updateRailVehicle(deltaTime);
        } else if (this.type.flying) {
            this.updateFlyingVehicle(deltaTime);
        } else {
            this.updateGroundVehicle(deltaTime);
        }
        
        // Update passenger position
        if (this.passenger) {
            this.passenger.x = this.x + this.passengerOffset.x;
            this.passenger.y = this.y + this.passengerOffset.y;
            this.passenger.z = this.z + this.passengerOffset.z;
        }
        
        // Consume fuel
        if (this.moving && this.type.fuelConsumption) {
            this.fuel -= this.type.fuelConsumption * deltaTime;
            if (this.fuel <= 0) {
                this.fuel = 0;
                this.moving = false;
                this.speed = 0;
            }
        }
        
        // Power consumption for electric vehicles
        if (this.moving && this.type.powerConsumption && this.game.machineSystem) {
            // Check if powered
            const networks = this.game.machineSystem.getNetworkStats();
            const hasPower = networks.some(n => n.powered && n.generation >= this.type.powerConsumption);
            if (!hasPower) {
                this.moving = false;
            }
        }
    }

    updateRailVehicle(deltaTime) {
        // Check if on rail
        const block = this.game.world.getBlock(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z) - 1);
        this.onRail = block === BLOCKS.RAIL;
        
        if (!this.onRail) {
            // Apply gravity if not on rail
            this.vz -= CONFIG.GRAVITY * 0.5;
            this.z += this.vz * deltaTime;
            
            // Ground collision
            if (this.checkGroundCollision()) {
                this.vz = 0;
            }
            return;
        }
        
        // If being pulled, follow the locomotive
        if (this.pulledBy) {
            const leader = this.pulledBy;
            const dist = Math.hypot(leader.x - this.x, leader.y - this.y);
            
            if (dist > 1.2) {
                const dx = leader.x - this.x;
                const dy = leader.y - this.y;
                const mag = Math.sqrt(dx * dx + dy * dy);
                this.vx = (dx / mag) * leader.speed * 0.95;
                this.vy = (dy / mag) * leader.speed * 0.95;
            } else {
                this.vx = leader.vx * 0.95;
                this.vy = leader.vy * 0.95;
            }
        } else if (this.moving && (this.fuel > 0 || !this.type.fuelConsumption)) {
            // Self-powered movement
            this.speed = Math.min(this.speed + this.type.acceleration * deltaTime, this.maxSpeed);
            
            // Follow rail direction
            const railDir = this.getRailDirection();
            if (railDir) {
                this.vx = railDir.x * this.speed;
                this.vy = railDir.y * this.speed;
            }
        } else {
            // Decelerate
            this.speed = Math.max(0, this.speed - 2 * deltaTime);
            this.vx *= 0.98;
            this.vy *= 0.98;
        }
        
        // Move
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Update linked cars
        for (const car of this.linkedVehicles) {
            car.pulledBy = this;
        }
    }

    updateGroundVehicle(deltaTime) {
        if (!this.moving || this.fuel <= 0) {
            this.speed = Math.max(0, this.speed - 5 * deltaTime);
        } else {
            // Check if on road for speed bonus
            const block = this.game.world.getBlock(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z) - 1);
            const onRoad = block === BLOCKS.ASPHALT || block === BLOCKS.COBBLESTONE;
            const speedMult = onRoad ? (this.type.roadSpeedBonus || 1) : 1;
            
            this.speed = Math.min(this.speed + this.type.acceleration * deltaTime, this.maxSpeed * speedMult);
        }
        
        // Direction vectors
        const dirVectors = [
            { x: 0, y: -1 }, // North
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }  // West
        ];
        const dir = dirVectors[this.direction];
        
        this.vx = dir.x * this.speed;
        this.vy = dir.y * this.speed;
        
        // Move with collision
        const nextX = this.x + this.vx * deltaTime;
        const nextY = this.y + this.vy * deltaTime;
        
        if (!this.checkCollision(nextX, this.y, this.z)) {
            this.x = nextX;
        } else {
            this.speed = 0;
        }
        
        if (!this.checkCollision(this.x, nextY, this.z)) {
            this.y = nextY;
        } else {
            this.speed = 0;
        }
        
        // Gravity
        if (!this.checkGroundCollision()) {
            this.vz -= CONFIG.GRAVITY;
            this.z += this.vz * deltaTime;
        }
    }

    updateFlyingVehicle(deltaTime) {
        if (!this.targetPos && !this.returning) {
            // Hover in place
            this.vx *= 0.9;
            this.vy *= 0.9;
            return;
        }
        
        const target = this.returning ? this.homePos : this.targetPos;
        if (!target) return;
        
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dz = target.z - this.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 0.5) {
            // Reached target
            if (this.returning) {
                this.returning = false;
                this.moving = false;
            } else {
                // Drop off items and return
                this.dropOffItems();
                this.returning = true;
            }
            this.targetPos = null;
        } else {
            // Move towards target
            this.speed = Math.min(this.speed + this.type.acceleration * deltaTime, this.maxSpeed);
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
            this.vz = (dz / dist) * this.speed;
        }
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.z += this.vz * deltaTime;
        
        // Range check
        const homeDistance = Math.hypot(this.x - this.homePos.x, this.y - this.homePos.y);
        if (homeDistance > this.type.range) {
            this.returning = true;
        }
    }

    getRailDirection() {
        // Simple rail direction detection
        const neighbors = [
            { x: 0, y: -1, dir: { x: 0, y: -1 } }, // North
            { x: 1, y: 0, dir: { x: 1, y: 0 } },   // East
            { x: 0, y: 1, dir: { x: 0, y: 1 } },   // South
            { x: -1, y: 0, dir: { x: -1, y: 0 } }  // West
        ];
        
        const bx = Math.floor(this.x);
        const by = Math.floor(this.y);
        const bz = Math.floor(this.z) - 1;
        
        // Find connected rails
        const connected = [];
        for (const n of neighbors) {
            const block = this.game.world.getBlock(bx + n.x, by + n.y, bz);
            if (block === BLOCKS.RAIL) {
                connected.push(n.dir);
            }
        }
        
        if (connected.length === 0) return null;
        
        // Prefer continuing in current direction
        if (this.railDirection) {
            const continuing = connected.find(d => 
                d.x === this.railDirection.x && d.y === this.railDirection.y
            );
            if (continuing) return continuing;
        }
        
        // Otherwise pick first available
        this.railDirection = connected[0];
        return connected[0];
    }

    checkCollision(x, y, z) {
        const world = this.game.world;
        const margin = 0.1;
        
        for (let bx = Math.floor(x + margin); bx <= Math.floor(x + this.width - margin); bx++) {
            for (let by = Math.floor(y + margin); by <= Math.floor(y + this.height - margin); by++) {
                for (let bz = Math.floor(z); bz <= Math.floor(z + this.depth); bz++) {
                    const block = world.getBlock(bx, by, bz);
                    if (block !== BLOCKS.AIR && block !== BLOCKS.WATER && BLOCK_DATA[block]?.solid) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkGroundCollision() {
        const block = this.game.world.getBlock(
            Math.floor(this.x + this.width / 2),
            Math.floor(this.y + this.height / 2),
            Math.floor(this.z) - 1
        );
        
        if (block !== BLOCKS.AIR && block !== BLOCKS.WATER && BLOCK_DATA[block]?.solid) {
            this.z = Math.floor(this.z);
            this.vz = 0;
            return true;
        }
        return false;
    }

    // Player enters vehicle
    mount(player) {
        if (this.passenger) return false;
        
        this.passenger = player;
        player.mountedVehicle = this;
        player.vx = 0;
        player.vy = 0;
        player.vz = 0;
        
        return true;
    }

    // Player exits vehicle
    dismount() {
        if (!this.passenger) return;
        
        const player = this.passenger;
        player.mountedVehicle = null;
        player.x = this.x + 1;
        player.y = this.y;
        player.z = this.z + 1;
        
        this.passenger = null;
        this.moving = false;
    }

    // Start/stop moving
    setMoving(moving) {
        this.moving = moving;
        if (!moving) {
            this.speed = Math.max(0, this.speed - 1);
        }
    }

    // Turn
    turn(direction) {
        if (direction === 'left') {
            this.direction = (this.direction + 3) % 4;
        } else {
            this.direction = (this.direction + 1) % 4;
        }
    }

    // Link train cars
    linkCar(car) {
        if (this.linkedVehicles.length >= (this.type.canPull || 0)) return false;
        if (!car.type.canBePulled) return false;
        
        this.linkedVehicles.push(car);
        car.pulledBy = this;
        return true;
    }

    unlinkCar(car) {
        const index = this.linkedVehicles.indexOf(car);
        if (index !== -1) {
            this.linkedVehicles.splice(index, 1);
            car.pulledBy = null;
            return true;
        }
        return false;
    }

    // Add fuel
    addFuel(itemId, amount) {
        if (!this.type.fuelType || !this.type.fuelType.includes(itemId)) {
            return 0;
        }
        
        const fuelValue = itemId === 'coal' ? 20 : itemId === 'wood' ? 10 : 30;
        const toAdd = Math.min(amount * fuelValue, this.maxFuel - this.fuel);
        this.fuel += toAdd;
        
        return Math.ceil(toAdd / fuelValue);
    }

    // Inventory management
    addItem(itemId, count = 1) {
        for (let i = 0; i < this.inventory.length; i++) {
            if (!this.inventory[i]) {
                this.inventory[i] = { id: itemId, count };
                return true;
            } else if (this.inventory[i].id === itemId) {
                this.inventory[i].count += count;
                return true;
            }
        }
        return false;
    }

    removeItem(index) {
        if (index >= 0 && index < this.inventory.length && this.inventory[index]) {
            const item = this.inventory[index];
            this.inventory[index] = null;
            return item;
        }
        return null;
    }

    // Drone delivery
    setTarget(x, y, z) {
        if (!this.type.flying) return false;
        
        const dist = Math.hypot(x - this.homePos.x, y - this.homePos.y);
        if (dist > this.type.range) return false;
        
        this.targetPos = { x, y, z };
        this.moving = true;
        return true;
    }

    dropOffItems() {
        // Drop items at current location
        for (let i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i]) {
                this.game.world.dropItem(this.x, this.y, this.z + 1, this.inventory[i].id, this.inventory[i].count);
                this.inventory[i] = null;
            }
        }
    }

    // Serialization
    serialize() {
        return {
            type: Object.keys(VEHICLE_TYPES).find(k => VEHICLE_TYPES[k].id === this.type.id),
            x: this.x,
            y: this.y,
            z: this.z,
            direction: this.direction,
            fuel: this.fuel,
            inventory: this.inventory,
            homePos: this.homePos
        };
    }

    static deserialize(game, data) {
        const vehicle = new Vehicle(game, data.x, data.y, data.z, data.type);
        vehicle.direction = data.direction || 0;
        vehicle.fuel = data.fuel || 0;
        vehicle.inventory = data.inventory || new Array(vehicle.type.capacity).fill(null);
        vehicle.homePos = data.homePos || { x: data.x, y: data.y, z: data.z };
        return vehicle;
    }
}

// Vehicle System Manager
export class VehicleSystem {
    constructor(game) {
        this.game = game;
        this.vehicles = [];
    }

    init() {
        console.log('Vehicle System initialized');
    }

    update(deltaTime) {
        for (const vehicle of this.vehicles) {
            vehicle.update(deltaTime);
        }
    }

    spawnVehicle(x, y, z, typeKey) {
        const vehicle = new Vehicle(this.game, x, y, z, typeKey);
        this.vehicles.push(vehicle);
        this.game.entities.push(vehicle);
        
        console.log(`Spawned ${vehicle.type.name} at (${x}, ${y}, ${z})`);
        return vehicle;
    }

    removeVehicle(vehicle) {
        const index = this.vehicles.indexOf(vehicle);
        if (index !== -1) {
            this.vehicles.splice(index, 1);
        }
        
        const entityIndex = this.game.entities.indexOf(vehicle);
        if (entityIndex !== -1) {
            this.game.entities.splice(entityIndex, 1);
        }
        
        // Dismount passenger
        if (vehicle.passenger) {
            vehicle.dismount();
        }
    }

    getVehicleAt(x, y, z, range = 1.5) {
        for (const vehicle of this.vehicles) {
            const dist = Math.hypot(vehicle.x - x, vehicle.y - y, vehicle.z - z);
            if (dist < range) {
                return vehicle;
            }
        }
        return null;
    }

    getNearbyVehicles(x, y, z, range = 10) {
        return this.vehicles.filter(v => {
            const dist = Math.hypot(v.x - x, v.y - y);
            return dist < range;
        });
    }

    // Handle player vehicle interaction
    interactVehicle(player, x, y, z) {
        // Check if player is in a vehicle
        if (player.mountedVehicle) {
            player.mountedVehicle.dismount();
            return { action: 'dismounted' };
        }
        
        // Find nearby vehicle
        const vehicle = this.getVehicleAt(x, y, z);
        if (vehicle) {
            if (vehicle.mount(player)) {
                return { action: 'mounted', vehicle };
            }
        }
        
        return null;
    }

    // Place vehicle from item
    placeVehicle(player, itemId, x, y, z) {
        const vehicleType = Object.keys(VEHICLE_TYPES).find(k => 
            VEHICLE_TYPES[k].id === itemId || `${VEHICLE_TYPES[k].id}_item` === itemId
        );
        
        if (!vehicleType) return null;
        
        const type = VEHICLE_TYPES[vehicleType];
        
        // Check placement requirements
        if (type.requiresRail) {
            const blockBelow = this.game.world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z) - 1);
            if (blockBelow !== BLOCKS.RAIL) {
                this.game.ui?.showMessage('Must be placed on rails!', 2000);
                return null;
            }
        }
        
        return this.spawnVehicle(x, y, z, vehicleType);
    }

    // Serialization
    serialize() {
        return {
            vehicles: this.vehicles.map(v => v.serialize())
        };
    }

    deserialize(data) {
        if (!data || !data.vehicles) return;
        
        this.vehicles = [];
        
        for (const vData of data.vehicles) {
            const vehicle = Vehicle.deserialize(this.game, vData);
            this.vehicles.push(vehicle);
            this.game.entities.push(vehicle);
        }
    }

    reset() {
        // Remove all vehicles
        for (const vehicle of this.vehicles) {
            if (vehicle.passenger) {
                vehicle.dismount();
            }
            const index = this.game.entities.indexOf(vehicle);
            if (index !== -1) {
                this.game.entities.splice(index, 1);
            }
        }
        this.vehicles = [];
    }
}
