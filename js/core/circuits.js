// Circuit System - Logic gates, redstone-style circuits, and programmable computers
import { CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';

// Circuit Component Types
export const CIRCUIT_COMPONENTS = {
    WIRE: {
        id: 'wire',
        name: 'Wire',
        block: BLOCKS.WIRE,
        emoji: '⚡',
        maxSignal: 15,
        delay: 0
    },
    AND_GATE: {
        id: 'and_gate',
        name: 'AND Gate',
        emoji: '&',
        inputs: 2,
        outputs: 1,
        logic: (inputs) => inputs.every(i => i > 0) ? 15 : 0
    },
    OR_GATE: {
        id: 'or_gate',
        name: 'OR Gate',
        emoji: '|',
        inputs: 2,
        outputs: 1,
        logic: (inputs) => inputs.some(i => i > 0) ? 15 : 0
    },
    NOT_GATE: {
        id: 'not_gate',
        name: 'NOT Gate',
        emoji: '!',
        inputs: 1,
        outputs: 1,
        logic: (inputs) => inputs[0] > 0 ? 0 : 15
    },
    XOR_GATE: {
        id: 'xor_gate',
        name: 'XOR Gate',
        emoji: '^',
        inputs: 2,
        outputs: 1,
        logic: (inputs) => {
            const active = inputs.filter(i => i > 0).length;
            return active === 1 ? 15 : 0;
        }
    },
    REPEATER: {
        id: 'repeater',
        name: 'Repeater',
        emoji: '▶',
        inputs: 1,
        outputs: 1,
        delay: 1, // Ticks of delay
        logic: (inputs) => inputs[0]
    },
    COMPARATOR: {
        id: 'comparator',
        name: 'Comparator',
        emoji: '⚖️',
        inputs: 2,
        outputs: 1,
        logic: (inputs) => inputs[0] >= inputs[1] ? inputs[0] : 0
    },
    LEVER: {
        id: 'lever',
        name: 'Lever',
        emoji: '🎚️',
        inputs: 0,
        outputs: 1,
        interactive: true,
        defaultState: false
    },
    BUTTON: {
        id: 'button',
        name: 'Button',
        emoji: '🔘',
        inputs: 0,
        outputs: 1,
        interactive: true,
        pulseLength: 20 // Ticks
    },
    PRESSURE_PLATE: {
        id: 'pressure_plate',
        name: 'Pressure Plate',
        emoji: '⬜',
        inputs: 0,
        outputs: 1,
        detectsEntities: true
    },
    LAMP: {
        id: 'lamp',
        name: 'Redstone Lamp',
        emoji: '💡',
        inputs: 1,
        outputs: 0,
        lightLevel: 15
    },
    PISTON: {
        id: 'piston',
        name: 'Piston',
        emoji: '📦',
        inputs: 1,
        outputs: 0,
        pushesBlocks: true
    },
    DOOR_CONTROLLER: {
        id: 'door_controller',
        name: 'Electronic Door',
        emoji: '🚪',
        inputs: 1,
        outputs: 0,
        controlsDoor: true
    },
    SENSOR: {
        id: 'sensor',
        name: 'Daylight Sensor',
        emoji: '☀️',
        inputs: 0,
        outputs: 1,
        daylight: true
    },
    MEMORY_CELL: {
        id: 'memory_cell',
        name: 'Memory Cell',
        emoji: '💾',
        inputs: 2, // Set, Reset
        outputs: 1,
        hasMemory: true
    }
};

// Circuit Component Instance
class CircuitComponent {
    constructor(game, x, y, z, typeId) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = CIRCUIT_COMPONENTS[typeId] || CIRCUIT_COMPONENTS.WIRE;
        this.id = `circuit_${x}_${y}_${z}`;
        
        // Signal state
        this.inputSignals = new Array(this.type.inputs || 0).fill(0);
        this.outputSignal = 0;
        this.previousOutput = 0;
        
        // For interactive components
        this.state = this.type.defaultState || false;
        this.pulseTimer = 0;
        
        // For memory cells
        this.memoryState = false;
        
        // For repeaters
        this.delayBuffer = [];
        
        // Direction (0-3: N, E, S, W)
        this.direction = 0;
        
        // Connections
        this.inputConnections = [];
        this.outputConnections = [];
    }

    update(deltaTime) {
        this.previousOutput = this.outputSignal;
        
        // Handle pulse timer (for buttons)
        if (this.pulseTimer > 0) {
            this.pulseTimer -= deltaTime * 20; // Convert to ticks
            if (this.pulseTimer <= 0) {
                this.state = false;
                this.pulseTimer = 0;
            }
        }
        
        // Calculate output based on type
        switch (this.type.id) {
            case 'wire':
                this.updateWire();
                break;
            case 'lever':
            case 'button':
                this.outputSignal = this.state ? 15 : 0;
                break;
            case 'pressure_plate':
                this.updatePressurePlate();
                break;
            case 'sensor':
                this.updateDaylightSensor();
                break;
            case 'memory_cell':
                this.updateMemoryCell();
                break;
            case 'repeater':
                this.updateRepeater(deltaTime);
                break;
            default:
                if (this.type.logic) {
                    this.outputSignal = this.type.logic(this.inputSignals);
                }
        }
        
        // Propagate signal if changed
        if (this.outputSignal !== this.previousOutput) {
            this.propagateSignal();
        }
        
        // Handle output effects
        this.handleOutputEffects();
    }

    updateWire() {
        // Wire passes through the strongest input signal, minus 1
        const maxInput = Math.max(...this.inputSignals, 0);
        this.outputSignal = Math.max(0, maxInput - 1);
    }

    updatePressurePlate() {
        // Check for entities on the pressure plate
        let entityNear = false;
        
        for (const entity of this.game.entities) {
            const dist = Math.hypot(entity.x - this.x - 0.5, entity.y - this.y - 0.5);
            const zMatch = Math.abs(entity.z - this.z) < 1;
            
            if (dist < 0.8 && zMatch) {
                entityNear = true;
                break;
            }
        }
        
        // Also check player
        const player = this.game.player;
        if (player) {
            const dist = Math.hypot(player.x - this.x - 0.5, player.y - this.y - 0.5);
            const zMatch = Math.abs(player.z - this.z) < 1;
            if (dist < 0.8 && zMatch) {
                entityNear = true;
            }
        }
        
        this.outputSignal = entityNear ? 15 : 0;
    }

    updateDaylightSensor() {
        const dayProgress = this.game.world.dayProgress;
        const isDaytime = dayProgress >= CONFIG.DAWN_START && dayProgress < CONFIG.DUSK_START;
        
        if (isDaytime) {
            // Signal strength based on sun position
            const noonDistance = Math.abs(dayProgress - 0.5);
            this.outputSignal = Math.round((1 - noonDistance * 2) * 15);
        } else {
            this.outputSignal = 0;
        }
    }

    updateMemoryCell() {
        // RS flip-flop: input[0] = Set, input[1] = Reset
        if (this.inputSignals[0] > 0 && this.inputSignals[1] === 0) {
            this.memoryState = true;
        } else if (this.inputSignals[1] > 0) {
            this.memoryState = false;
        }
        
        this.outputSignal = this.memoryState ? 15 : 0;
    }

    updateRepeater(deltaTime) {
        const delay = this.type.delay || 1;
        
        // Add current input to delay buffer
        this.delayBuffer.push(this.inputSignals[0]);
        
        // Remove old values
        while (this.delayBuffer.length > delay) {
            this.delayBuffer.shift();
        }
        
        // Output the delayed value
        this.outputSignal = this.delayBuffer[0] || 0;
    }

    handleOutputEffects() {
        if (this.outputSignal <= 0) return;
        
        // Lamp lighting
        if (this.type.id === 'lamp') {
            // Update lighting (handled by torch lighting system if available)
            if (this.game.torchLighting) {
                if (this.outputSignal > 0) {
                    this.game.torchLighting.addLight(this.x, this.y, this.z, this.type.lightLevel);
                } else {
                    this.game.torchLighting.removeLight(this.x, this.y, this.z);
                }
            }
        }
        
        // Door control
        if (this.type.id === 'door_controller') {
            // Find nearby door and toggle
            const doorPos = this.findNearbyDoor();
            if (doorPos) {
                const block = this.game.world.getBlock(doorPos.x, doorPos.y, doorPos.z);
                if (block === BLOCKS.DOOR) {
                    // Open door (set to air temporarily - simplified)
                    // In a full implementation, you'd have open/closed door states
                }
            }
        }
        
        // Piston (simplified)
        if (this.type.id === 'piston' && this.outputSignal > 0 && this.previousOutput === 0) {
            this.pushBlock();
        }
    }

    findNearbyDoor() {
        const neighbors = [
            { x: this.x + 1, y: this.y, z: this.z },
            { x: this.x - 1, y: this.y, z: this.z },
            { x: this.x, y: this.y + 1, z: this.z },
            { x: this.x, y: this.y - 1, z: this.z }
        ];
        
        for (const n of neighbors) {
            const block = this.game.world.getBlock(n.x, n.y, n.z);
            if (block === BLOCKS.DOOR || block === BLOCKS.GATE) {
                return n;
            }
        }
        return null;
    }

    pushBlock() {
        const dirVectors = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 }
        ];
        const dir = dirVectors[this.direction];
        
        const targetX = this.x + dir.x;
        const targetY = this.y + dir.y;
        const pushToX = targetX + dir.x;
        const pushToY = targetY + dir.y;
        
        const blockToPush = this.game.world.getBlock(targetX, targetY, this.z);
        const targetBlock = this.game.world.getBlock(pushToX, pushToY, this.z);
        
        if (blockToPush !== BLOCKS.AIR && targetBlock === BLOCKS.AIR) {
            // Push the block
            this.game.world.setBlock(pushToX, pushToY, this.z, blockToPush);
            this.game.world.setBlock(targetX, targetY, this.z, BLOCKS.AIR);
            this.game.particles.emit(targetX + 0.5, targetY + 0.5, this.z + 0.5, '#888888', 5);
        }
    }

    propagateSignal() {
        for (const conn of this.outputConnections) {
            conn.receiveSignal(this.outputSignal, this);
        }
    }

    receiveSignal(signal, source) {
        // Find which input this signal goes to
        const inputIndex = this.inputConnections.indexOf(source);
        if (inputIndex >= 0 && inputIndex < this.inputSignals.length) {
            this.inputSignals[inputIndex] = signal;
        } else if (this.inputSignals.length > 0) {
            // Default to first input
            this.inputSignals[0] = Math.max(this.inputSignals[0], signal);
        }
    }

    // Interactive activation
    activate() {
        if (this.type.id === 'lever') {
            this.state = !this.state;
        } else if (this.type.id === 'button') {
            this.state = true;
            this.pulseTimer = this.type.pulseLength;
        }
    }

    rotate() {
        this.direction = (this.direction + 1) % 4;
    }

    serialize() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            type: Object.keys(CIRCUIT_COMPONENTS).find(k => CIRCUIT_COMPONENTS[k].id === this.type.id),
            direction: this.direction,
            state: this.state,
            memoryState: this.memoryState
        };
    }

    static deserialize(game, data) {
        const component = new CircuitComponent(game, data.x, data.y, data.z, data.type);
        component.direction = data.direction || 0;
        component.state = data.state || false;
        component.memoryState = data.memoryState || false;
        return component;
    }
}

// Programmable Computer
class Computer {
    constructor(game, x, y, z) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.z = z;
        
        this.id = `computer_${x}_${y}_${z}`;
        this.powered = false;
        this.running = false;
        
        // Program storage
        this.program = '';
        this.variables = {};
        this.outputSignals = [0, 0, 0, 0]; // 4 output channels
        this.inputSignals = [0, 0, 0, 0];  // 4 input channels
        
        // Execution state
        this.programCounter = 0;
        this.instructions = [];
        this.tickCounter = 0;
        this.maxTicksPerSecond = 20;
        
        // Console output
        this.consoleLog = [];
        this.maxLogLines = 50;
    }

    update(deltaTime) {
        if (!this.powered || !this.running) return;
        
        this.tickCounter += deltaTime;
        
        if (this.tickCounter >= 1 / this.maxTicksPerSecond) {
            this.tickCounter = 0;
            this.executeStep();
        }
    }

    loadProgram(code) {
        this.program = code;
        this.instructions = this.parseProgram(code);
        this.programCounter = 0;
        this.variables = {};
        this.consoleLog = [];
        
        this.log('Program loaded');
    }

    parseProgram(code) {
        // Simple line-based instruction parser
        // Commands: SET var value, IF var op value GOTO line, OUTPUT channel value
        //           INPUT channel var, PRINT text, WAIT ticks, GOTO line, END
        
        const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
        const instructions = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().toUpperCase();
            const parts = line.split(/\s+/);
            
            instructions.push({
                line: i,
                command: parts[0],
                args: parts.slice(1),
                raw: lines[i]
            });
        }
        
        return instructions;
    }

    executeStep() {
        if (this.programCounter >= this.instructions.length) {
            this.running = false;
            this.log('Program ended');
            return;
        }
        
        const inst = this.instructions[this.programCounter];
        
        try {
            switch (inst.command) {
                case 'SET':
                    // SET varname value
                    this.variables[inst.args[0]] = this.evaluateValue(inst.args[1]);
                    this.programCounter++;
                    break;
                    
                case 'IF':
                    // IF var op value GOTO line
                    const varVal = this.getVariable(inst.args[0]);
                    const op = inst.args[1];
                    const compareVal = this.evaluateValue(inst.args[2]);
                    const gotoLine = parseInt(inst.args[4]) - 1;
                    
                    let condition = false;
                    switch (op) {
                        case '==': case '=': condition = varVal === compareVal; break;
                        case '!=': case '<>': condition = varVal !== compareVal; break;
                        case '>': condition = varVal > compareVal; break;
                        case '<': condition = varVal < compareVal; break;
                        case '>=': condition = varVal >= compareVal; break;
                        case '<=': condition = varVal <= compareVal; break;
                    }
                    
                    if (condition) {
                        this.programCounter = gotoLine;
                    } else {
                        this.programCounter++;
                    }
                    break;
                    
                case 'OUTPUT':
                    // OUTPUT channel value
                    const channel = parseInt(inst.args[0]);
                    const value = this.evaluateValue(inst.args[1]);
                    if (channel >= 0 && channel < 4) {
                        this.outputSignals[channel] = Math.max(0, Math.min(15, value));
                    }
                    this.programCounter++;
                    break;
                    
                case 'INPUT':
                    // INPUT channel varname
                    const inChannel = parseInt(inst.args[0]);
                    const varName = inst.args[1];
                    if (inChannel >= 0 && inChannel < 4) {
                        this.variables[varName] = this.inputSignals[inChannel];
                    }
                    this.programCounter++;
                    break;
                    
                case 'PRINT':
                    // PRINT text
                    this.log(inst.args.join(' '));
                    this.programCounter++;
                    break;
                    
                case 'WAIT':
                    // WAIT - skip this tick
                    this.programCounter++;
                    break;
                    
                case 'GOTO':
                    // GOTO line
                    this.programCounter = parseInt(inst.args[0]) - 1;
                    break;
                    
                case 'END':
                    this.running = false;
                    this.log('Program ended');
                    break;
                    
                default:
                    this.log(`Unknown command: ${inst.command}`);
                    this.programCounter++;
            }
        } catch (error) {
            this.log(`Error at line ${this.programCounter + 1}: ${error.message}`);
            this.running = false;
        }
    }

    evaluateValue(val) {
        if (val === undefined) return 0;
        
        // Check if it's a variable
        if (this.variables.hasOwnProperty(val)) {
            return this.variables[val];
        }
        
        // Check if it's a number
        const num = parseFloat(val);
        if (!isNaN(num)) return num;
        
        // Otherwise return 0
        return 0;
    }

    getVariable(name) {
        return this.variables[name] || 0;
    }

    log(message) {
        this.consoleLog.push(`[${this.programCounter + 1}] ${message}`);
        while (this.consoleLog.length > this.maxLogLines) {
            this.consoleLog.shift();
        }
    }

    start() {
        if (!this.powered) {
            this.log('Computer not powered');
            return;
        }
        
        this.running = true;
        this.programCounter = 0;
        this.log('Program started');
    }

    stop() {
        this.running = false;
        this.log('Program stopped');
    }

    reset() {
        this.running = false;
        this.programCounter = 0;
        this.variables = {};
        this.outputSignals = [0, 0, 0, 0];
        this.consoleLog = [];
        this.log('Computer reset');
    }

    serialize() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            program: this.program,
            variables: this.variables,
            outputSignals: this.outputSignals,
            running: this.running,
            programCounter: this.programCounter
        };
    }

    static deserialize(game, data) {
        const computer = new Computer(game, data.x, data.y, data.z);
        if (data.program) {
            computer.loadProgram(data.program);
        }
        computer.variables = data.variables || {};
        computer.outputSignals = data.outputSignals || [0, 0, 0, 0];
        computer.running = data.running || false;
        computer.programCounter = data.programCounter || 0;
        return computer;
    }
}

// Circuit System Manager
export class CircuitSystem {
    constructor(game) {
        this.game = game;
        this.components = new Map(); // key: "x,y,z" -> CircuitComponent
        this.computers = new Map();  // key: "x,y,z" -> Computer
        this.updateQueue = [];
        this.tickCounter = 0;
    }

    init() {
        console.log('Circuit System initialized');
    }

    update(deltaTime) {
        this.tickCounter += deltaTime;
        
        // Update at fixed rate
        if (this.tickCounter >= 0.05) { // 20 ticks per second
            this.tickCounter = 0;
            
            // Update all components
            for (const component of this.components.values()) {
                component.update(deltaTime);
            }
            
            // Update computers
            for (const computer of this.computers.values()) {
                computer.update(deltaTime);
            }
        }
    }

    addComponent(x, y, z, typeKey) {
        const key = `${x},${y},${z}`;
        
        if (this.components.has(key)) {
            return this.components.get(key);
        }
        
        const component = new CircuitComponent(this.game, x, y, z, typeKey);
        this.components.set(key, component);
        
        // Auto-connect to adjacent components
        this.connectToNeighbors(component);
        
        console.log(`Added ${component.type.name} at (${x}, ${y}, ${z})`);
        return component;
    }

    removeComponent(x, y, z) {
        const key = `${x},${y},${z}`;
        const component = this.components.get(key);
        
        if (component) {
            // Disconnect from neighbors
            for (const conn of component.inputConnections) {
                const idx = conn.outputConnections.indexOf(component);
                if (idx !== -1) conn.outputConnections.splice(idx, 1);
            }
            for (const conn of component.outputConnections) {
                const idx = conn.inputConnections.indexOf(component);
                if (idx !== -1) conn.inputConnections.splice(idx, 1);
            }
            
            this.components.delete(key);
            return true;
        }
        return false;
    }

    addComputer(x, y, z) {
        const key = `${x},${y},${z}`;
        
        if (this.computers.has(key)) {
            return this.computers.get(key);
        }
        
        const computer = new Computer(this.game, x, y, z);
        this.computers.set(key, computer);
        
        console.log(`Added computer at (${x}, ${y}, ${z})`);
        return computer;
    }

    removeComputer(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.computers.delete(key);
    }

    getComponentAt(x, y, z) {
        return this.components.get(`${x},${y},${z}`);
    }

    getComputerAt(x, y, z) {
        return this.computers.get(`${x},${y},${z}`);
    }

    connectToNeighbors(component) {
        const neighbors = [
            { x: component.x + 1, y: component.y, z: component.z },
            { x: component.x - 1, y: component.y, z: component.z },
            { x: component.x, y: component.y + 1, z: component.z },
            { x: component.x, y: component.y - 1, z: component.z },
            { x: component.x, y: component.y, z: component.z + 1 },
            { x: component.x, y: component.y, z: component.z - 1 }
        ];
        
        for (const n of neighbors) {
            const neighbor = this.getComponentAt(n.x, n.y, n.z);
            if (neighbor) {
                // Connect bidirectionally for wires, directionally for gates
                if (component.type.id === 'wire' || neighbor.type.id === 'wire') {
                    if (!component.outputConnections.includes(neighbor)) {
                        component.outputConnections.push(neighbor);
                    }
                    if (!neighbor.inputConnections.includes(component)) {
                        neighbor.inputConnections.push(component);
                    }
                }
            }
        }
    }

    // Interact with circuit component
    interactComponent(x, y, z) {
        const component = this.getComponentAt(x, y, z);
        if (component && component.type.interactive) {
            component.activate();
            return true;
        }
        return false;
    }

    // Get signal strength at position
    getSignalAt(x, y, z) {
        const component = this.getComponentAt(x, y, z);
        return component ? component.outputSignal : 0;
    }

    // Check if block placed is a circuit component
    onBlockPlaced(x, y, z, blockId) {
        if (blockId === BLOCKS.WIRE) {
            this.addComponent(x, y, z, 'WIRE');
        } else if (blockId === BLOCKS.COMPUTER) {
            this.addComputer(x, y, z);
        }
        // Add more block->component mappings as needed
    }

    onBlockRemoved(x, y, z, blockId) {
        if (blockId === BLOCKS.WIRE) {
            this.removeComponent(x, y, z);
        } else if (blockId === BLOCKS.COMPUTER) {
            this.removeComputer(x, y, z);
        }
    }

    // Serialization
    serialize() {
        return {
            components: Array.from(this.components.values()).map(c => c.serialize()),
            computers: Array.from(this.computers.values()).map(c => c.serialize())
        };
    }

    deserialize(data) {
        if (!data) return;
        
        this.components.clear();
        this.computers.clear();
        
        if (data.components) {
            for (const cData of data.components) {
                const component = CircuitComponent.deserialize(this.game, cData);
                this.components.set(`${cData.x},${cData.y},${cData.z}`, component);
            }
            
            // Reconnect all components
            for (const component of this.components.values()) {
                this.connectToNeighbors(component);
            }
        }
        
        if (data.computers) {
            for (const cData of data.computers) {
                const computer = Computer.deserialize(this.game, cData);
                this.computers.set(`${cData.x},${cData.y},${cData.z}`, computer);
            }
        }
    }

    reset() {
        this.components.clear();
        this.computers.clear();
    }
}
