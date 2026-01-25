// Machine System - Industrial Age power and automation
import { CONFIG, BLOCKS, BLOCK_DATA, ITEMS } from '../config.js';

// Machine Types
export const MACHINE_TYPES = {
    STEAM_ENGINE: {
        id: 'steam_engine',
        name: 'Steam Engine',
        block: BLOCKS.STEAM_ENGINE,
        emoji: '🚂',
        powerOutput: 100,
        fuelConsumption: 1,
        fuelTypes: ['coal', 'wood', 'charcoal'],
        maxFuel: 64,
        tier: 1
    },
    BOILER: {
        id: 'boiler',
        name: 'Boiler',
        block: BLOCKS.BOILER,
        emoji: '♨️',
        powerOutput: 50,
        fuelConsumption: 0.5,
        fuelTypes: ['coal', 'wood', 'oil_bucket'],
        maxFuel: 64,
        tier: 1,
        heatsNearby: true
    },
    CRUSHER: {
        id: 'crusher',
        name: 'Crusher',
        block: BLOCKS.CRUSHER,
        emoji: '⚙️',
        powerInput: 20,
        processTime: 5,
        recipes: {
            'cobblestone': { output: 'gravel', count: 1 },
            'gravel': { output: 'sand', count: 1 },
            'iron_ore': { output: 'crushed_iron', count: 2 },
            'gold_ore': { output: 'crushed_gold', count: 2 },
            'copper_ore': { output: 'crushed_copper', count: 2 }
        },
        tier: 1
    },
    ASSEMBLER: {
        id: 'assembler',
        name: 'Assembler',
        block: BLOCKS.ASSEMBLER,
        emoji: '🔧',
        powerInput: 30,
        processTime: 3,
        recipes: {
            'gear': { inputs: { 'iron_ingot': 2 }, output: 'gear', count: 1 },
            'circuit': { inputs: { 'copper_ingot': 2, 'iron_ingot': 1 }, output: 'circuit', count: 1 },
            'steel_plate': { inputs: { 'steel_ingot': 2 }, output: 'steel_plate', count: 1 }
        },
        tier: 2
    },
    CONVEYOR_BELT: {
        id: 'conveyor_belt',
        name: 'Conveyor Belt',
        block: BLOCKS.CONVEYOR_BELT,
        emoji: '➡️',
        powerInput: 5,
        speed: 2, // blocks per second
        tier: 1
    },
    SOLAR_PANEL: {
        id: 'solar_panel',
        name: 'Solar Panel',
        block: BLOCKS.SOLAR_PANEL,
        emoji: '☀️',
        powerOutput: 30,
        dayOnly: true,
        tier: 3
    },
    WIND_TURBINE: {
        id: 'wind_turbine',
        name: 'Wind Turbine',
        block: BLOCKS.WIND_TURBINE,
        emoji: '💨',
        powerOutput: 40,
        weatherBonus: { rain: 1.5, storm: 2.0 },
        tier: 3
    },
    BATTERY: {
        id: 'battery',
        name: 'Battery Bank',
        block: BLOCKS.BATTERY,
        emoji: '🔋',
        powerStorage: 1000,
        chargeRate: 50,
        dischargeRate: 100,
        tier: 3
    },
    COMPUTER: {
        id: 'computer',
        name: 'Computer Terminal',
        block: BLOCKS.COMPUTER,
        emoji: '💻',
        powerInput: 10,
        programmable: true,
        tier: 3
    }
};

// Machine Instance
class Machine {
    constructor(game, x, y, z, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = MACHINE_TYPES[type] || MACHINE_TYPES.STEAM_ENGINE;
        
        this.id = `machine_${x}_${y}_${z}`;
        this.active = false;
        this.powered = false;
        
        // Power
        this.powerGenerated = 0;
        this.powerConsumed = 0;
        
        // Fuel (for generators)
        this.fuel = 0;
        this.maxFuel = this.type.maxFuel || 0;
        this.fuelType = null;
        
        // Processing (for processors)
        this.inputInventory = [];
        this.outputInventory = [];
        this.maxInventory = 16;
        this.processProgress = 0;
        this.currentRecipe = null;
        
        // Conveyor
        this.direction = 0; // 0-3 (N, E, S, W)
        this.itemsOnBelt = [];
        
        // Battery
        this.storedPower = 0;
        this.maxStoredPower = this.type.powerStorage || 0;
        
        // Network
        this.networkId = null;
        
        // Animation
        this.animTimer = 0;
    }

    update(deltaTime) {
        this.animTimer += deltaTime;
        
        switch (this.type.id) {
            case 'steam_engine':
            case 'boiler':
                this.updateGenerator(deltaTime);
                break;
            case 'crusher':
            case 'assembler':
                this.updateProcessor(deltaTime);
                break;
            case 'conveyor_belt':
                this.updateConveyor(deltaTime);
                break;
            case 'solar_panel':
                this.updateSolar(deltaTime);
                break;
            case 'wind_turbine':
                this.updateWindTurbine(deltaTime);
                break;
            case 'battery':
                this.updateBattery(deltaTime);
                break;
        }
    }

    updateGenerator(deltaTime) {
        if (this.fuel > 0) {
            // Consume fuel
            this.fuel -= this.type.fuelConsumption * deltaTime;
            this.fuel = Math.max(0, this.fuel);
            
            this.active = true;
            this.powerGenerated = this.type.powerOutput;
            
            // Emit smoke particles
            if (this.animTimer > 0.5) {
                this.animTimer = 0;
                this.game.particles.emit(this.x + 0.5, this.y + 0.5, this.z + 1.5, '#555555', 3);
            }
        } else {
            this.active = false;
            this.powerGenerated = 0;
        }
    }

    updateProcessor(deltaTime) {
        if (!this.powered) {
            this.active = false;
            return;
        }
        
        // Check if we have items to process
        if (this.inputInventory.length > 0 && !this.currentRecipe) {
            // Find matching recipe
            const inputItem = this.inputInventory[0];
            if (this.type.recipes[inputItem.id]) {
                this.currentRecipe = {
                    ...this.type.recipes[inputItem.id],
                    inputItem: inputItem.id
                };
                this.processProgress = 0;
            }
        }
        
        // Process current recipe
        if (this.currentRecipe && this.outputInventory.length < this.maxInventory) {
            this.active = true;
            this.powerConsumed = this.type.powerInput;
            
            this.processProgress += deltaTime;
            
            if (this.processProgress >= this.type.processTime) {
                // Complete processing
                this.inputInventory.shift();
                this.outputInventory.push({
                    id: this.currentRecipe.output,
                    count: this.currentRecipe.count
                });
                
                this.game.particles.emit(this.x + 0.5, this.y + 0.5, this.z + 1, '#ffcc00', 5);
                this.currentRecipe = null;
                this.processProgress = 0;
            }
        } else {
            this.active = false;
            this.powerConsumed = 0;
        }
    }

    updateConveyor(deltaTime) {
        if (!this.powered) {
            this.active = false;
            return;
        }
        
        this.active = true;
        this.powerConsumed = this.type.powerInput;
        
        // Move items along belt
        const speed = this.type.speed * deltaTime;
        const dirVectors = [
            { x: 0, y: -1 }, // North
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }  // West
        ];
        const dir = dirVectors[this.direction];
        
        for (let i = this.itemsOnBelt.length - 1; i >= 0; i--) {
            const item = this.itemsOnBelt[i];
            item.progress += speed;
            
            if (item.progress >= 1) {
                // Item reached end, transfer to next machine/drop
                this.itemsOnBelt.splice(i, 1);
                this.transferItemToNext(item, dir);
            }
        }
    }

    transferItemToNext(item, dir) {
        const nextX = this.x + dir.x;
        const nextY = this.y + dir.y;
        
        // Check for machine at next position
        const nextMachine = this.game.machineSystem?.getMachineAt(nextX, nextY, this.z);
        
        if (nextMachine) {
            if (nextMachine.type.id === 'conveyor_belt') {
                // Transfer to next conveyor
                nextMachine.itemsOnBelt.push({ ...item, progress: 0 });
            } else if (nextMachine.inputInventory && nextMachine.inputInventory.length < nextMachine.maxInventory) {
                // Transfer to processor
                nextMachine.inputInventory.push({ id: item.id, count: 1 });
            }
        } else {
            // Drop as item entity
            this.game.world.dropItem(nextX + 0.5, nextY + 0.5, this.z + 1, item.id, 1);
        }
    }

    updateSolar(deltaTime) {
        const dayProgress = this.game.world.dayProgress;
        const isDaytime = dayProgress >= CONFIG.DAWN_START && dayProgress < CONFIG.DUSK_START;
        
        if (isDaytime) {
            this.active = true;
            // Power varies by time of day (peak at noon)
            const noonDistance = Math.abs(dayProgress - 0.5);
            const efficiency = 1 - noonDistance * 2;
            this.powerGenerated = this.type.powerOutput * Math.max(0.3, efficiency);
        } else {
            this.active = false;
            this.powerGenerated = 0;
        }
    }

    updateWindTurbine(deltaTime) {
        let efficiency = 0.7 + Math.sin(this.animTimer * 0.5) * 0.1; // Base variable output
        
        // Weather bonus
        if (this.game.weather) {
            const weather = this.game.weather.currentWeather;
            if (weather === 'rain') efficiency *= this.type.weatherBonus.rain;
            if (weather === 'storm') efficiency *= this.type.weatherBonus.storm;
        }
        
        this.active = true;
        this.powerGenerated = this.type.powerOutput * efficiency;
    }

    updateBattery(deltaTime) {
        const network = this.game.machineSystem?.getNetwork(this.networkId);
        if (!network) return;
        
        const surplus = network.totalGeneration - network.totalConsumption;
        
        if (surplus > 0 && this.storedPower < this.maxStoredPower) {
            // Charge battery
            const chargeAmount = Math.min(surplus, this.type.chargeRate * deltaTime);
            this.storedPower = Math.min(this.maxStoredPower, this.storedPower + chargeAmount);
            this.active = true;
        } else if (surplus < 0 && this.storedPower > 0) {
            // Discharge battery
            const dischargeAmount = Math.min(-surplus, this.type.dischargeRate * deltaTime);
            this.storedPower = Math.max(0, this.storedPower - dischargeAmount);
            this.powerGenerated = dischargeAmount / deltaTime;
            this.active = true;
        } else {
            this.active = false;
            this.powerGenerated = 0;
        }
    }

    // Add fuel
    addFuel(itemId, amount) {
        if (!this.type.fuelTypes || !this.type.fuelTypes.includes(itemId)) {
            return 0;
        }
        
        const spaceAvailable = this.maxFuel - this.fuel;
        const toAdd = Math.min(amount, spaceAvailable);
        this.fuel += toAdd;
        
        if (toAdd > 0) {
            this.fuelType = itemId;
        }
        
        return toAdd;
    }

    // Add item for processing
    addInput(itemId, amount = 1) {
        if (this.inputInventory.length >= this.maxInventory) return 0;
        
        const existing = this.inputInventory.find(i => i.id === itemId);
        if (existing) {
            existing.count += amount;
        } else {
            this.inputInventory.push({ id: itemId, count: amount });
        }
        return amount;
    }

    // Take output
    takeOutput() {
        if (this.outputInventory.length === 0) return null;
        return this.outputInventory.shift();
    }

    // Set direction (for conveyors)
    setDirection(dir) {
        this.direction = dir % 4;
    }

    rotate() {
        this.direction = (this.direction + 1) % 4;
    }

    // Serialization
    serialize() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            type: Object.keys(MACHINE_TYPES).find(k => MACHINE_TYPES[k].id === this.type.id),
            fuel: this.fuel,
            fuelType: this.fuelType,
            inputInventory: this.inputInventory,
            outputInventory: this.outputInventory,
            direction: this.direction,
            storedPower: this.storedPower,
            processProgress: this.processProgress
        };
    }

    static deserialize(game, data) {
        const machine = new Machine(game, data.x, data.y, data.z, data.type);
        machine.fuel = data.fuel || 0;
        machine.fuelType = data.fuelType;
        machine.inputInventory = data.inputInventory || [];
        machine.outputInventory = data.outputInventory || [];
        machine.direction = data.direction || 0;
        machine.storedPower = data.storedPower || 0;
        machine.processProgress = data.processProgress || 0;
        return machine;
    }
}

// Power Network
class PowerNetwork {
    constructor(id) {
        this.id = id;
        this.machines = new Set();
        this.totalGeneration = 0;
        this.totalConsumption = 0;
        this.powered = false;
    }

    addMachine(machine) {
        this.machines.add(machine);
        machine.networkId = this.id;
    }

    removeMachine(machine) {
        this.machines.delete(machine);
        machine.networkId = null;
    }

    update() {
        this.totalGeneration = 0;
        this.totalConsumption = 0;
        
        for (const machine of this.machines) {
            this.totalGeneration += machine.powerGenerated;
            this.totalConsumption += machine.powerConsumed;
        }
        
        this.powered = this.totalGeneration >= this.totalConsumption;
        
        // Update powered state for all machines
        for (const machine of this.machines) {
            if (machine.type.powerInput) {
                machine.powered = this.powered;
            }
        }
    }
}

// Machine System Manager
export class MachineSystem {
    constructor(game) {
        this.game = game;
        this.machines = new Map(); // key: "x,y,z" -> Machine
        this.networks = new Map(); // networkId -> PowerNetwork
        this.nextNetworkId = 1;
        
        // Pollution tracking
        this.pollution = new Map(); // chunkKey -> pollution level
        this.globalPollution = 0;
    }

    init() {
        console.log('Machine System initialized');
    }

    update(deltaTime) {
        // Update all machines
        for (const machine of this.machines.values()) {
            machine.update(deltaTime);
        }
        
        // Update power networks
        for (const network of this.networks.values()) {
            network.update();
        }
        
        // Update pollution
        this.updatePollution(deltaTime);
    }

    addMachine(x, y, z, typeKey) {
        const key = `${x},${y},${z}`;
        
        if (this.machines.has(key)) {
            console.warn(`Machine already exists at ${key}`);
            return null;
        }
        
        const machine = new Machine(this.game, x, y, z, typeKey);
        this.machines.set(key, machine);
        
        // Connect to power network
        this.connectToNetwork(machine);
        
        console.log(`Added ${machine.type.name} at (${x}, ${y}, ${z})`);
        return machine;
    }

    removeMachine(x, y, z) {
        const key = `${x},${y},${z}`;
        const machine = this.machines.get(key);
        
        if (machine) {
            // Remove from network
            if (machine.networkId !== null) {
                const network = this.networks.get(machine.networkId);
                if (network) {
                    network.removeMachine(machine);
                    if (network.machines.size === 0) {
                        this.networks.delete(machine.networkId);
                    }
                }
            }
            
            this.machines.delete(key);
            console.log(`Removed machine at (${x}, ${y}, ${z})`);
            return true;
        }
        return false;
    }

    getMachineAt(x, y, z) {
        return this.machines.get(`${x},${y},${z}`);
    }

    connectToNetwork(machine) {
        // Find adjacent machines and their networks
        const adjacentNetworks = new Set();
        const neighbors = [
            { x: machine.x + 1, y: machine.y, z: machine.z },
            { x: machine.x - 1, y: machine.y, z: machine.z },
            { x: machine.x, y: machine.y + 1, z: machine.z },
            { x: machine.x, y: machine.y - 1, z: machine.z },
            { x: machine.x, y: machine.y, z: machine.z + 1 },
            { x: machine.x, y: machine.y, z: machine.z - 1 }
        ];
        
        // Also check for wire blocks
        for (const n of neighbors) {
            const neighborMachine = this.getMachineAt(n.x, n.y, n.z);
            if (neighborMachine && neighborMachine.networkId !== null) {
                adjacentNetworks.add(neighborMachine.networkId);
            }
            
            // Check for wire block
            const block = this.game.world.getBlock(n.x, n.y, n.z);
            if (block === BLOCKS.WIRE || block === BLOCKS.METAL_PIPE) {
                // Wire block - need to trace connections
                // For simplicity, just check if any adjacent machine
                for (const nn of neighbors) {
                    const nm = this.getMachineAt(nn.x, nn.y, nn.z);
                    if (nm && nm.networkId !== null) {
                        adjacentNetworks.add(nm.networkId);
                    }
                }
            }
        }
        
        if (adjacentNetworks.size === 0) {
            // Create new network
            const network = new PowerNetwork(this.nextNetworkId++);
            network.addMachine(machine);
            this.networks.set(network.id, network);
        } else if (adjacentNetworks.size === 1) {
            // Join existing network
            const networkId = adjacentNetworks.values().next().value;
            this.networks.get(networkId).addMachine(machine);
        } else {
            // Merge networks
            const networkIds = Array.from(adjacentNetworks);
            const mainNetwork = this.networks.get(networkIds[0]);
            mainNetwork.addMachine(machine);
            
            for (let i = 1; i < networkIds.length; i++) {
                const otherNetwork = this.networks.get(networkIds[i]);
                for (const m of otherNetwork.machines) {
                    mainNetwork.addMachine(m);
                }
                this.networks.delete(networkIds[i]);
            }
        }
    }

    getNetwork(networkId) {
        return this.networks.get(networkId);
    }

    updatePollution(deltaTime) {
        this.globalPollution = 0;
        
        for (const machine of this.machines.values()) {
            if (machine.active && machine.type.fuelConsumption) {
                // Fuel-burning machines produce pollution
                const chunkX = Math.floor(machine.x / CONFIG.CHUNK_SIZE);
                const chunkY = Math.floor(machine.y / CONFIG.CHUNK_SIZE);
                const key = `${chunkX},${chunkY}`;
                
                const pollution = (this.pollution.get(key) || 0) + machine.type.fuelConsumption * deltaTime;
                this.pollution.set(key, pollution);
                this.globalPollution += pollution;
            }
        }
        
        // Pollution decay
        for (const [key, value] of this.pollution.entries()) {
            const newValue = value * 0.9999; // Slow decay
            if (newValue < 0.1) {
                this.pollution.delete(key);
            } else {
                this.pollution.set(key, newValue);
            }
        }
    }

    getPollutionAt(x, y) {
        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE);
        const chunkY = Math.floor(y / CONFIG.CHUNK_SIZE);
        return this.pollution.get(`${chunkX},${chunkY}`) || 0;
    }

    // Interact with machine (for UI)
    interactWithMachine(x, y, z, player) {
        const machine = this.getMachineAt(x, y, z);
        if (!machine) return null;
        
        return {
            type: machine.type,
            active: machine.active,
            powered: machine.powered,
            fuel: machine.fuel,
            maxFuel: machine.maxFuel,
            inputInventory: machine.inputInventory,
            outputInventory: machine.outputInventory,
            processProgress: machine.processProgress,
            processTime: machine.type.processTime,
            storedPower: machine.storedPower,
            maxStoredPower: machine.maxStoredPower,
            powerGenerated: machine.powerGenerated,
            powerConsumed: machine.powerConsumed,
            direction: machine.direction
        };
    }

    // Get network stats for UI
    getNetworkStats() {
        const stats = [];
        for (const network of this.networks.values()) {
            stats.push({
                id: network.id,
                machineCount: network.machines.size,
                generation: network.totalGeneration,
                consumption: network.totalConsumption,
                powered: network.powered
            });
        }
        return stats;
    }

    // Check if machine block placed
    onBlockPlaced(x, y, z, blockId) {
        const machineType = Object.keys(MACHINE_TYPES).find(
            k => MACHINE_TYPES[k].block === blockId
        );
        
        if (machineType) {
            this.addMachine(x, y, z, machineType);
        }
    }

    // Check if machine block removed
    onBlockRemoved(x, y, z, blockId) {
        const machineType = Object.keys(MACHINE_TYPES).find(
            k => MACHINE_TYPES[k].block === blockId
        );
        
        if (machineType) {
            this.removeMachine(x, y, z);
        }
    }

    // Serialization
    serialize() {
        return {
            machines: Array.from(this.machines.values()).map(m => m.serialize()),
            pollution: Array.from(this.pollution.entries()),
            globalPollution: this.globalPollution
        };
    }

    deserialize(data) {
        if (!data) return;
        
        this.machines.clear();
        this.networks.clear();
        this.nextNetworkId = 1;
        
        if (data.machines) {
            for (const mData of data.machines) {
                const machine = Machine.deserialize(this.game, mData);
                this.machines.set(`${mData.x},${mData.y},${mData.z}`, machine);
                this.connectToNetwork(machine);
            }
        }
        
        if (data.pollution) {
            this.pollution = new Map(data.pollution);
        }
        
        this.globalPollution = data.globalPollution || 0;
    }

    reset() {
        this.machines.clear();
        this.networks.clear();
        this.pollution.clear();
        this.globalPollution = 0;
        this.nextNetworkId = 1;
    }
}
