// NPC Trading System - Villagers for bartering and trading
import { CONFIG } from '../config.js';

export const NPC_TYPES = {
    TRADER: {
        id: 'trader',
        name: 'Wandering Trader',
        icon: '🧔',
        dialoguePrefix: 'Greetings traveler!',
        tradeCategory: 'general'
    },
    HUNTER: {
        id: 'hunter',
        name: 'Hunter',
        icon: '🏹',
        dialoguePrefix: 'Need supplies for the hunt?',
        tradeCategory: 'hunting'
    },
    BLACKSMITH: {
        id: 'blacksmith',
        name: 'Blacksmith',
        icon: '⚒️',
        dialoguePrefix: 'Looking for quality tools?',
        tradeCategory: 'tools'
    },
    HERBALIST: {
        id: 'herbalist',
        name: 'Herbalist',
        icon: '🌿',
        dialoguePrefix: 'Herbs and remedies for sale!',
        tradeCategory: 'potions'
    },
    FARMER: {
        id: 'farmer',
        name: 'Farmer',
        icon: '👨‍🌾',
        dialoguePrefix: 'Fresh produce here!',
        tradeCategory: 'food'
    },
    SHAMAN: {
        id: 'shaman',
        name: 'Shaman',
        icon: '🧙',
        dialoguePrefix: 'Seek the wisdom of the spirits...',
        tradeCategory: 'magic'
    }
};

export const TRADE_OFFERS = {
    general: [
        { sell: 'torch', sellQty: 5, buy: 'stone', buyQty: 10 },
        { sell: 'rope', sellQty: 2, buy: 'fiber', buyQty: 20 },
        { sell: 'leather', sellQty: 1, buy: 'hide', buyQty: 3 },
        { sell: 'arrow', sellQty: 10, buy: 'stick', buyQty: 10, also: { item: 'flint', qty: 5 } },
        { sell: 'bandage', sellQty: 3, buy: 'cloth', buyQty: 5 }
    ],
    hunting: [
        { sell: 'bow', sellQty: 1, buy: 'stick', buyQty: 15, also: { item: 'fiber', qty: 10 } },
        { sell: 'arrow', sellQty: 20, buy: 'flint', buyQty: 10 },
        { sell: 'trap', sellQty: 2, buy: 'stick', buyQty: 8, also: { item: 'rope', qty: 2 } },
        { sell: 'bait', sellQty: 5, buy: 'meat', buyQty: 2 },
        { sell: 'fur_coat', sellQty: 1, buy: 'fur', buyQty: 5, also: { item: 'leather', qty: 2 } }
    ],
    tools: [
        { sell: 'stone_pickaxe', sellQty: 1, buy: 'stone', buyQty: 20, also: { item: 'stick', qty: 5 } },
        { sell: 'stone_axe', sellQty: 1, buy: 'stone', buyQty: 15, also: { item: 'stick', qty: 5 } },
        { sell: 'bronze_ingot', sellQty: 1, buy: 'copper_ore', buyQty: 3 },
        { sell: 'iron_ingot', sellQty: 1, buy: 'iron_ore', buyQty: 3 },
        { sell: 'repair_kit', sellQty: 1, buy: 'leather', buyQty: 2, also: { item: 'stone', qty: 5 } }
    ],
    potions: [
        { sell: 'health_potion', sellQty: 1, buy: 'berries', buyQty: 10, also: { item: 'herb', qty: 3 } },
        { sell: 'stamina_potion', sellQty: 1, buy: 'mushroom', buyQty: 5, also: { item: 'herb', qty: 2 } },
        { sell: 'antidote', sellQty: 1, buy: 'herb', buyQty: 5, also: { item: 'fang', qty: 1 } },
        { sell: 'herb', sellQty: 3, buy: 'berries', buyQty: 5 },
        { sell: 'healing_salve', sellQty: 2, buy: 'herb', buyQty: 3, also: { item: 'fat', qty: 1 } }
    ],
    food: [
        { sell: 'bread', sellQty: 3, buy: 'wheat', buyQty: 5 },
        { sell: 'cooked_meat', sellQty: 2, buy: 'meat', buyQty: 3 },
        { sell: 'meat_stew', sellQty: 1, buy: 'meat', buyQty: 2, also: { item: 'carrot', qty: 2 } },
        { sell: 'wheat_seeds', sellQty: 5, buy: 'wheat', buyQty: 1 },
        { sell: 'carrot_seeds', sellQty: 5, buy: 'carrot', buyQty: 1 }
    ],
    magic: [
        { sell: 'enchanted_stone', sellQty: 1, buy: 'crystal', buyQty: 3, also: { item: 'ancient_dust', qty: 1 } },
        { sell: 'spirit_essence', sellQty: 1, buy: 'bone', buyQty: 10, also: { item: 'herb', qty: 5 } },
        { sell: 'rune_stone', sellQty: 1, buy: 'stone', buyQty: 20, also: { item: 'crystal', qty: 1 } },
        { sell: 'talisman', sellQty: 1, buy: 'fang', buyQty: 3, also: { item: 'leather', qty: 2 } },
        { sell: 'scroll_identify', sellQty: 1, buy: 'ancient_dust', buyQty: 2 }
    ]
};

class TraderNPC {
    constructor(type, x, y, z) {
        const npcType = NPC_TYPES[type.toUpperCase()] || NPC_TYPES.TRADER;
        
        this.id = `npc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        this.type = npcType.id;
        this.name = npcType.name;
        this.icon = npcType.icon;
        this.dialoguePrefix = npcType.dialoguePrefix;
        
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Trade offers
        this.tradeCategory = npcType.tradeCategory;
        this.offers = this.generateOffers();
        
        // Refresh timer
        this.refreshTimer = 0;
        this.refreshInterval = 300; // 5 minutes
        
        // Reputation with player
        this.reputation = 0;
        
        // Current dialogue
        this.dialogue = npcType.dialoguePrefix;
        
        // Movement
        this.wanderTimer = 0;
        this.vx = 0;
        this.vy = 0;
    }
    
    generateOffers() {
        const categoryOffers = TRADE_OFFERS[this.tradeCategory] || TRADE_OFFERS.general;
        
        // Select 3-5 random offers
        const numOffers = 3 + Math.floor(Math.random() * 3);
        const shuffled = [...categoryOffers].sort(() => Math.random() - 0.5);
        
        return shuffled.slice(0, numOffers).map((offer, index) => ({
            id: `offer_${index}`,
            ...offer,
            available: true
        }));
    }
    
    refreshOffers() {
        this.offers = this.generateOffers();
        this.dialogue = `${this.dialoguePrefix} I have new wares!`;
    }
    
    update(deltaTime) {
        // Update refresh timer
        this.refreshTimer += deltaTime;
        if (this.refreshTimer >= this.refreshInterval) {
            this.refreshTimer = 0;
            this.refreshOffers();
        }
        
        // Wander behavior
        this.wanderTimer -= deltaTime;
        if (this.wanderTimer <= 0) {
            this.wanderTimer = 3 + Math.random() * 5;
            
            if (Math.random() < 0.3) {
                // Move randomly
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.5;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
            } else {
                // Stop
                this.vx = 0;
                this.vy = 0;
            }
        }
        
        // Apply movement
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
    
    canTrade(offerIndex, inventory) {
        const offer = this.offers[offerIndex];
        if (!offer || !offer.available) return false;
        
        // Check if player has required items
        if (!inventory.hasItem(offer.buy, offer.buyQty)) return false;
        
        // Check additional required item
        if (offer.also && !inventory.hasItem(offer.also.item, offer.also.qty)) return false;
        
        return true;
    }
    
    executeTrade(offerIndex, inventory) {
        const offer = this.offers[offerIndex];
        if (!this.canTrade(offerIndex, inventory)) return false;
        
        // Remove required items
        inventory.removeItem(offer.buy, offer.buyQty);
        if (offer.also) {
            inventory.removeItem(offer.also.item, offer.also.qty);
        }
        
        // Give sold items
        inventory.addItem(offer.sell, offer.sellQty);
        
        // Increase reputation
        this.reputation++;
        
        // Update dialogue
        const responses = [
            'Pleasure doing business!',
            'A fair trade!',
            'Thank you, traveler!',
            'Come back anytime!',
            'May fortune favor you!'
        ];
        this.dialogue = responses[Math.floor(Math.random() * responses.length)];
        
        return true;
    }
    
    getGreeting() {
        if (this.reputation >= 10) {
            return `Welcome back, friend! ${this.dialoguePrefix}`;
        } else if (this.reputation >= 5) {
            return `Ah, a returning customer! ${this.dialoguePrefix}`;
        }
        return this.dialoguePrefix;
    }
    
    serialize() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            z: this.z,
            offers: this.offers,
            refreshTimer: this.refreshTimer,
            reputation: this.reputation
        };
    }
    
    static deserialize(data) {
        const npc = new TraderNPC(data.type, data.x, data.y, data.z);
        npc.id = data.id;
        npc.offers = data.offers || npc.offers;
        npc.refreshTimer = data.refreshTimer || 0;
        npc.reputation = data.reputation || 0;
        return npc;
    }
}

export class NPCTradingSystem {
    constructor(game) {
        this.game = game;
        
        // All NPCs
        this.npcs = new Map();
        
        // Currently interacting NPC
        this.activeNPC = null;
        
        // Interaction range
        this.interactionRange = 3;
        
        // Spawn settings
        this.maxNPCs = 8;
        this.spawnCooldown = 0;
        this.spawnInterval = 60; // 1 minute between spawn attempts
        
        // NPC spawn weights by biome
        this.biomeSpawnWeights = {
            forest: { HUNTER: 3, HERBALIST: 2, FARMER: 1 },
            plains: { FARMER: 3, TRADER: 2, HERBALIST: 1 },
            desert: { TRADER: 3, SHAMAN: 2 },
            snow: { HUNTER: 3, TRADER: 2, SHAMAN: 1 },
            swamp: { HERBALIST: 3, SHAMAN: 2 },
            mountains: { BLACKSMITH: 3, HUNTER: 2 },
            default: { TRADER: 2, FARMER: 1, HUNTER: 1 }
        };
        
        // Initialize with some starter NPCs
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Spawn initial NPCs near player spawn
        setTimeout(() => {
            this.spawnInitialNPCs();
        }, 5000); // Wait for world to generate
    }
    
    spawnInitialNPCs() {
        const player = this.game.player;
        if (!player) return;
        
        // Spawn 2-3 initial NPCs
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            this.trySpawnNPC();
        }
    }
    
    update(deltaTime) {
        // Initialize on first update
        if (!this.initialized) {
            this.init();
        }
        
        // Update all NPCs
        for (const npc of this.npcs.values()) {
            npc.update(deltaTime);
            
            // Remove NPCs too far from player
            const dist = this.getDistanceToNPC(npc);
            if (dist > 100) {
                this.npcs.delete(npc.id);
            }
        }
        
        // Check if active NPC is still in range
        if (this.activeNPC) {
            const dist = this.getDistanceToNPC(this.activeNPC);
            if (dist > this.interactionRange + 1) {
                this.closeTrading();
            }
        }
        
        // Spawn new NPCs periodically
        this.spawnCooldown -= deltaTime;
        if (this.spawnCooldown <= 0 && this.npcs.size < this.maxNPCs) {
            this.spawnCooldown = this.spawnInterval;
            if (Math.random() < 0.5) { // 50% chance each interval
                this.trySpawnNPC();
            }
        }
    }
    
    getDistanceToNPC(npc) {
        const player = this.game.player;
        if (!player) return Infinity;
        
        const dx = player.x - npc.x;
        const dy = player.y - npc.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Spawn NPC near player
    spawnNPC(type, x, y, z) {
        const npc = new TraderNPC(type, x, y, z);
        this.npcs.set(npc.id, npc);
        
        this.game.ui?.showMessage(`${npc.icon} ${npc.name} has arrived!`, 3000);
        
        return npc;
    }
    
    // Try to spawn a random NPC
    trySpawnNPC() {
        const player = this.game.player;
        if (!player) return null;
        
        // Get current biome
        const biome = this.game.world?.getBiomeAt?.(player.x, player.y) || 'default';
        
        // Get spawn weights for this biome
        const weights = this.biomeSpawnWeights[biome] || this.biomeSpawnWeights.default;
        
        // Weighted random selection
        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        let selectedType = 'TRADER';
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                selectedType = type;
                break;
            }
        }
        
        // Spawn at random position near player (but off-screen)
        const angle = Math.random() * Math.PI * 2;
        const distance = 25 + Math.random() * 15; // Spawn 25-40 units away
        
        const x = player.x + Math.cos(angle) * distance;
        const y = player.y + Math.sin(angle) * distance;
        
        // Get ground level at spawn position
        let z = player.z;
        if (this.game.world) {
            const groundZ = this.game.world.getGroundLevel?.(Math.floor(x), Math.floor(y));
            if (groundZ !== undefined && groundZ > 0) {
                z = groundZ + 1;
            }
        }
        
        // Check if valid spawn (not in water, etc.)
        const blockAtSpawn = this.game.world?.getBlock?.(Math.floor(x), Math.floor(y), Math.floor(z - 1));
        if (blockAtSpawn === 0 || blockAtSpawn === 5) { // 0=air, 5=water typically
            return null; // Invalid spawn, try again next time
        }
        
        return this.spawnNPC(selectedType, x, y, z);
    }
    
    // Remove NPC
    removeNPC(npcId) {
        if (this.activeNPC?.id === npcId) {
            this.activeNPC = null;
        }
        return this.npcs.delete(npcId);
    }
    
    // Get nearby NPCs
    getNearbyNPCs() {
        const player = this.game.player;
        if (!player) return [];
        
        const nearby = [];
        for (const npc of this.npcs.values()) {
            const dist = this.getDistanceToNPC(npc);
            if (dist <= this.interactionRange) {
                nearby.push({ npc, distance: dist });
            }
        }
        
        return nearby.sort((a, b) => a.distance - b.distance).map(n => n.npc);
    }
    
    // Interact with nearest NPC
    interactWithNearestNPC() {
        const nearby = this.getNearbyNPCs();
        if (nearby.length > 0) {
            this.activeNPC = nearby[0];
            this.game.ui?.showMessage(
                `${this.activeNPC.icon} ${this.activeNPC.getGreeting()}`,
                3000
            );
            return this.activeNPC;
        }
        return null;
    }
    
    // Execute trade with active NPC
    executeTrade(offerIndex) {
        if (!this.activeNPC) return false;
        
        const inventory = this.game.inventory;
        if (!inventory) return false;
        
        if (this.activeNPC.executeTrade(offerIndex, inventory)) {
            this.game.ui?.showMessage(`✅ ${this.activeNPC.dialogue}`, 2000);
            
            // Achievement tracking
            this.game.achievements?.incrementProgress?.('trades_completed', 1);
            
            return true;
        } else {
            this.game.ui?.showMessage('❌ Cannot complete trade - missing items!', 2000);
            return false;
        }
    }
    
    // Close trading UI
    closeTrading() {
        if (this.activeNPC) {
            this.game.ui?.showMessage(`${this.activeNPC.icon} Safe travels!`, 2000);
        }
        this.activeNPC = null;
    }
    
    // Get active NPC's offers
    getActiveOffers() {
        if (!this.activeNPC) return [];
        return this.activeNPC.offers;
    }
    
    // Check if trade is possible
    canTrade(offerIndex) {
        if (!this.activeNPC) return false;
        return this.activeNPC.canTrade(offerIndex, this.game.inventory);
    }
    
    // Render NPCs
    render(ctx, camera) {
        for (const npc of this.npcs.values()) {
            const screenPos = camera.worldToScreen(npc.x, npc.y, npc.z);
            
            // NPC body
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(screenPos.x - 8, screenPos.y - 20, 16, 20);
            
            // NPC icon
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(npc.icon, screenPos.x, screenPos.y - 30);
            
            // Name tag
            ctx.font = '10px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText(npc.name, screenPos.x, screenPos.y + 10);
            ctx.fillText(npc.name, screenPos.x, screenPos.y + 10);
            
            // Highlight if active
            if (this.activeNPC?.id === npc.id) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenPos.x - 15, screenPos.y - 40, 30, 55);
            }
        }
    }
    
    // Render trade UI
    renderTradeUI(ctx) {
        if (!this.activeNPC) return;
        
        const canvas = ctx.canvas;
        const panelWidth = 350;
        const panelHeight = 300;
        const x = canvas.width / 2 - panelWidth / 2;
        const y = canvas.height / 2 - panelHeight / 2;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.activeNPC.icon} ${this.activeNPC.name}`, x + panelWidth / 2, y + 25);
        
        // Offers
        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        
        const offers = this.activeNPC.offers;
        let offerY = y + 55;
        
        for (let i = 0; i < offers.length; i++) {
            const offer = offers[i];
            const canAfford = this.canTrade(i);
            
            // Offer background
            ctx.fillStyle = canAfford ? 'rgba(0, 100, 0, 0.3)' : 'rgba(100, 0, 0, 0.3)';
            ctx.fillRect(x + 10, offerY - 12, panelWidth - 20, 35);
            
            // Trade info
            ctx.fillStyle = canAfford ? '#FFFFFF' : '#888888';
            
            let buyText = `${offer.buyQty}x ${offer.buy}`;
            if (offer.also) {
                buyText += ` + ${offer.also.qty}x ${offer.also.item}`;
            }
            
            ctx.fillText(`Give: ${buyText}`, x + 20, offerY);
            ctx.fillStyle = '#4CAF50';
            ctx.fillText(`Get: ${offer.sellQty}x ${offer.sell}`, x + 20, offerY + 15);
            
            // Trade button
            ctx.fillStyle = canAfford ? '#4CAF50' : '#666666';
            ctx.fillRect(x + panelWidth - 70, offerY - 8, 55, 25);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Trade', x + panelWidth - 43, offerY + 8);
            ctx.textAlign = 'left';
            ctx.font = '14px Arial';
            
            offerY += 45;
        }
        
        // Close hint
        ctx.fillStyle = '#888888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press [E] to close', x + panelWidth / 2, y + panelHeight - 15);
    }
    
    // Serialize
    serialize() {
        return {
            npcs: Array.from(this.npcs.values()).map(npc => npc.serialize()),
            spawnCooldown: this.spawnCooldown
        };
    }
    
    deserialize(data) {
        if (data?.npcs) {
            this.npcs.clear();
            for (const npcData of data.npcs) {
                const npc = TraderNPC.deserialize(npcData);
                this.npcs.set(npc.id, npc);
            }
        }
        if (data?.spawnCooldown !== undefined) {
            this.spawnCooldown = data.spawnCooldown;
        }
    }
    
    reset() {
        this.npcs.clear();
        this.activeNPC = null;
        this.spawnCooldown = 0;
    }
}
