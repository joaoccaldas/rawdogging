// Bestiary & Encyclopedia System
// Tracks discovered creatures, items, and biomes

export class BestiarySystem {
    constructor(game) {
        this.game = game;
        
        // Discovery state
        this.discoveries = {
            creatures: new Map(),
            items: new Map(),
            biomes: new Map(),
            blocks: new Map()
        };
        
        // UI state
        this.isOpen = false;
        this.currentTab = 'creatures';
        this.selectedEntry = null;
        this.scrollOffset = 0;
        
        // Stats tracking
        this.stats = {
            creaturesKilled: {},
            itemsCrafted: {},
            blocksPlaced: {},
            blocksMined: {}
        };
        
        // Initialize database
        this.initDatabase();
    }
    
    initDatabase() {
        // Creature database
        this.creatureDatabase = {
            // Passive
            chicken: { name: 'Chicken', category: 'passive', description: 'A common farm bird. Drops feathers and eggs.', drops: ['feather', 'egg'], health: 4, rarity: 'common' },
            pig: { name: 'Pig', category: 'passive', description: 'Oink oink! A source of pork.', drops: ['porkchop'], health: 10, rarity: 'common' },
            cow: { name: 'Cow', category: 'passive', description: 'Provides leather and beef. Can be milked.', drops: ['leather', 'beef'], health: 10, rarity: 'common' },
            sheep: { name: 'Sheep', category: 'passive', description: 'Fluffy! Shear for wool.', drops: ['wool'], health: 8, rarity: 'common' },
            rabbit: { name: 'Rabbit', category: 'passive', description: 'Hops around. Drops rabbit hide.', drops: ['rabbit_hide', 'rabbit_meat'], health: 3, rarity: 'common' },
            
            // Hostile
            zombie: { name: 'Zombie', category: 'hostile', description: 'Undead that hunts at night. Slow but persistent.', drops: ['rotten_flesh'], health: 20, damage: 3, rarity: 'common' },
            skeleton: { name: 'Skeleton', category: 'hostile', description: 'Ranged undead archer. Drops bones and arrows.', drops: ['bone', 'arrow'], health: 20, damage: 4, rarity: 'common' },
            spider: { name: 'Spider', category: 'hostile', description: 'Eight-legged horror. Can climb walls.', drops: ['string', 'spider_eye'], health: 16, damage: 2, rarity: 'common' },
            creeper: { name: 'Creeper', category: 'hostile', description: 'Ssssss... BOOM! Keep your distance.', drops: ['gunpowder'], health: 20, damage: 25, rarity: 'uncommon' },
            
            // Bosses
            boss_golem: { name: 'Stone Golem', category: 'boss', description: 'Ancient guardian of the mountains. Extremely tough.', drops: ['golem_heart', 'diamond'], health: 200, damage: 15, rarity: 'legendary' },
            boss_dragon: { name: 'Elder Dragon', category: 'boss', description: 'The ultimate challenge. Breathes fire and commands the sky.', drops: ['dragon_scale', 'dragon_egg'], health: 500, damage: 30, rarity: 'mythic' }
        };
        
        // Item database (simplified, would be larger)
        this.itemDatabase = {
            wood: { name: 'Wood', category: 'resource', description: 'Basic building material from trees.', rarity: 'common' },
            stone: { name: 'Stone', category: 'resource', description: 'Solid rock for building and crafting.', rarity: 'common' },
            iron_ore: { name: 'Iron Ore', category: 'resource', description: 'Raw iron found underground. Smelt to get ingots.', rarity: 'uncommon' },
            diamond: { name: 'Diamond', category: 'resource', description: 'Rare and precious gem. Makes the best tools.', rarity: 'rare' },
            wood_pickaxe: { name: 'Wooden Pickaxe', category: 'tool', description: 'Basic mining tool. Mine stone with this.', rarity: 'common' },
            iron_sword: { name: 'Iron Sword', category: 'weapon', description: 'Reliable combat weapon.', rarity: 'uncommon' }
        };
        
        // Biome database
        this.biomeDatabase = {
            plains: { name: 'Plains', description: 'Flat grasslands perfect for building.', resources: ['grass', 'flowers', 'wood'], dangers: 'low' },
            forest: { name: 'Forest', description: 'Dense woodland rich in wood and wildlife.', resources: ['wood', 'mushrooms', 'berries'], dangers: 'medium' },
            desert: { name: 'Desert', description: 'Scorching sands with cacti and pyramids.', resources: ['sand', 'cactus', 'sandstone'], dangers: 'medium' },
            mountains: { name: 'Mountains', description: 'Tall peaks with valuable ores inside.', resources: ['stone', 'iron_ore', 'coal'], dangers: 'high' },
            swamp: { name: 'Swamp', description: 'Murky wetland with unique flora.', resources: ['clay', 'lily_pad', 'slime'], dangers: 'high' },
            tundra: { name: 'Tundra', description: 'Frozen wasteland. Bundle up!', resources: ['ice', 'snow', 'packed_ice'], dangers: 'high' },
            volcano: { name: 'Volcano', description: 'Dangerous but rich in obsidian and rare ores.', resources: ['obsidian', 'magma', 'lava'], dangers: 'extreme' }
        };
    }
    
    // Discover a creature
    discoverCreature(creatureId, killedBy = null) {
        if (this.discoveries.creatures.has(creatureId)) {
            // Update kill count
            const entry = this.discoveries.creatures.get(creatureId);
            entry.encounters++;
            if (killedBy) entry.kills++;
            return false;
        }
        
        const data = this.creatureDatabase[creatureId];
        if (!data) return false;
        
        this.discoveries.creatures.set(creatureId, {
            id: creatureId,
            discoveredAt: Date.now(),
            encounters: 1,
            kills: killedBy ? 1 : 0
        });
        
        // Notification
        this.showDiscoveryNotification('creature', data);
        
        // Achievement check
        this.checkDiscoveryAchievements();
        
        return true;
    }
    
    // Discover an item
    discoverItem(itemId) {
        if (this.discoveries.items.has(itemId)) return false;
        
        const data = this.itemDatabase[itemId];
        if (!data) return false;
        
        this.discoveries.items.set(itemId, {
            id: itemId,
            discoveredAt: Date.now()
        });
        
        this.showDiscoveryNotification('item', data);
        this.checkDiscoveryAchievements();
        
        return true;
    }
    
    // Discover a biome
    discoverBiome(biomeId) {
        if (this.discoveries.biomes.has(biomeId)) return false;
        
        const data = this.biomeDatabase[biomeId];
        if (!data) return false;
        
        this.discoveries.biomes.set(biomeId, {
            id: biomeId,
            discoveredAt: Date.now()
        });
        
        this.showDiscoveryNotification('biome', data);
        this.checkDiscoveryAchievements();
        
        return true;
    }
    
    showDiscoveryNotification(type, data) {
        const rarityColors = {
            common: '#AAA',
            uncommon: '#55FF55',
            rare: '#5555FF',
            legendary: '#FF55FF',
            mythic: '#FFAA00'
        };
        
        const color = rarityColors[data.rarity] || '#FFF';
        const icon = type === 'creature' ? '🐾' : type === 'item' ? '📦' : '🗺️';
        
        this.game.ui?.showNotification?.(
            `${icon} Discovered: ${data.name}!`,
            'discovery',
            3000
        );
        
        // Play discovery sound
        this.game.audio?.play('discovery');
    }
    
    checkDiscoveryAchievements() {
        const totalCreatures = this.discoveries.creatures.size;
        const totalItems = this.discoveries.items.size;
        const totalBiomes = this.discoveries.biomes.size;
        
        // Achievement thresholds
        if (totalCreatures >= 5) this.game.achievements?.unlock?.('bestiary_5');
        if (totalCreatures >= 20) this.game.achievements?.unlock?.('bestiary_20');
        if (totalBiomes >= 5) this.game.achievements?.unlock?.('explorer_5');
    }
    
    // Check if discovered
    isDiscovered(type, id) {
        return this.discoveries[type]?.has(id) || false;
    }
    
    // Get discovery percentage
    getDiscoveryPercent(type) {
        let total = 0;
        let discovered = 0;
        
        switch (type) {
            case 'creatures':
                total = Object.keys(this.creatureDatabase).length;
                discovered = this.discoveries.creatures.size;
                break;
            case 'items':
                total = Object.keys(this.itemDatabase).length;
                discovered = this.discoveries.items.size;
                break;
            case 'biomes':
                total = Object.keys(this.biomeDatabase).length;
                discovered = this.discoveries.biomes.size;
                break;
        }
        
        return total > 0 ? discovered / total : 0;
    }
    
    // Toggle bestiary UI
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.selectedEntry = null;
            this.scrollOffset = 0;
        }
    }
    
    open() {
        this.isOpen = true;
        this.selectedEntry = null;
    }
    
    close() {
        this.isOpen = false;
    }
    
    // Set active tab
    setTab(tab) {
        this.currentTab = tab;
        this.selectedEntry = null;
        this.scrollOffset = 0;
    }
    
    // Select entry
    selectEntry(id) {
        this.selectedEntry = id;
    }
    
    update(deltaTime) {
        // Update animations if needed
    }
    
    render(ctx) {
        if (!this.isOpen) return;
        
        const canvas = ctx.canvas;
        const width = 700;
        const height = 500;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        ctx.save();
        
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Main panel
        ctx.fillStyle = 'rgba(30, 30, 40, 0.95)';
        ctx.fillRect(x, y, width, height);
        
        // Border
        ctx.strokeStyle = '#6496FF';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('📖 BESTIARY & ENCYCLOPEDIA', x + width / 2, y + 40);
        
        // Tabs
        this.renderTabs(ctx, x, y + 60, width);
        
        // Content area
        const contentY = y + 110;
        const contentHeight = height - 130;
        
        // Entry list (left side)
        this.renderEntryList(ctx, x + 10, contentY, 200, contentHeight - 20);
        
        // Entry details (right side)
        if (this.selectedEntry) {
            this.renderEntryDetails(ctx, x + 220, contentY, width - 240, contentHeight - 20);
        } else {
            ctx.fillStyle = '#666';
            ctx.font = '16px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('Select an entry to view details', x + 220 + (width - 240) / 2, contentY + 100);
        }
        
        // Close hint
        ctx.fillStyle = '#888';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Press B or ESC to close', x + width / 2, y + height - 10);
        
        ctx.restore();
    }
    
    renderTabs(ctx, x, y, width) {
        const tabs = [
            { id: 'creatures', label: '🐾 Creatures', count: this.discoveries.creatures.size },
            { id: 'items', label: '📦 Items', count: this.discoveries.items.size },
            { id: 'biomes', label: '🗺️ Biomes', count: this.discoveries.biomes.size }
        ];
        
        const tabWidth = width / tabs.length;
        
        tabs.forEach((tab, i) => {
            const tabX = x + i * tabWidth;
            const isActive = this.currentTab === tab.id;
            
            // Tab background
            ctx.fillStyle = isActive ? 'rgba(100, 150, 255, 0.3)' : 'rgba(50, 50, 50, 0.5)';
            ctx.fillRect(tabX, y, tabWidth - 5, 35);
            
            // Tab text
            ctx.fillStyle = isActive ? '#6496FF' : '#AAA';
            ctx.font = isActive ? 'bold 14px Courier New' : '14px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`${tab.label} (${tab.count})`, tabX + tabWidth / 2 - 2, y + 23);
        });
    }
    
    renderEntryList(ctx, x, y, width, height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y, width, height);
        
        let database, discoveries;
        switch (this.currentTab) {
            case 'creatures':
                database = this.creatureDatabase;
                discoveries = this.discoveries.creatures;
                break;
            case 'items':
                database = this.itemDatabase;
                discoveries = this.discoveries.items;
                break;
            case 'biomes':
                database = this.biomeDatabase;
                discoveries = this.discoveries.biomes;
                break;
        }
        
        const entries = Object.entries(database);
        const entryHeight = 30;
        let entryY = y + 5 - this.scrollOffset;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();
        
        for (const [id, data] of entries) {
            if (entryY + entryHeight < y || entryY > y + height) {
                entryY += entryHeight;
                continue;
            }
            
            const isDiscovered = discoveries.has(id);
            const isSelected = this.selectedEntry === id;
            
            // Background
            if (isSelected) {
                ctx.fillStyle = 'rgba(100, 150, 255, 0.4)';
                ctx.fillRect(x + 2, entryY, width - 4, entryHeight - 2);
            }
            
            // Name or ???
            ctx.fillStyle = isDiscovered ? '#FFF' : '#555';
            ctx.font = '14px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(isDiscovered ? data.name : '???', x + 10, entryY + 20);
            
            // Rarity indicator
            if (isDiscovered && data.rarity) {
                const rarityColors = {
                    common: '#AAA',
                    uncommon: '#55FF55',
                    rare: '#5555FF',
                    legendary: '#FF55FF',
                    mythic: '#FFAA00'
                };
                ctx.fillStyle = rarityColors[data.rarity] || '#AAA';
                ctx.fillText('●', x + width - 20, entryY + 20);
            }
            
            entryY += entryHeight;
        }
        
        ctx.restore();
        
        // Scroll indicator
        const totalHeight = entries.length * entryHeight;
        if (totalHeight > height) {
            const scrollPercent = this.scrollOffset / (totalHeight - height);
            const scrollBarHeight = (height / totalHeight) * height;
            const scrollBarY = y + scrollPercent * (height - scrollBarHeight);
            
            ctx.fillStyle = 'rgba(100, 150, 255, 0.5)';
            ctx.fillRect(x + width - 5, scrollBarY, 4, scrollBarHeight);
        }
    }
    
    renderEntryDetails(ctx, x, y, width, height) {
        let database, discovery;
        switch (this.currentTab) {
            case 'creatures':
                database = this.creatureDatabase;
                discovery = this.discoveries.creatures.get(this.selectedEntry);
                break;
            case 'items':
                database = this.itemDatabase;
                discovery = this.discoveries.items.get(this.selectedEntry);
                break;
            case 'biomes':
                database = this.biomeDatabase;
                discovery = this.discoveries.biomes.get(this.selectedEntry);
                break;
        }
        
        const data = database[this.selectedEntry];
        if (!data || !discovery) return;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y, width, height);
        
        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 22px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(data.name, x + 15, y + 35);
        
        // Rarity badge
        if (data.rarity) {
            const rarityColors = {
                common: '#AAA',
                uncommon: '#55FF55',
                rare: '#5555FF',
                legendary: '#FF55FF',
                mythic: '#FFAA00'
            };
            ctx.fillStyle = rarityColors[data.rarity];
            ctx.font = '12px Courier New';
            ctx.fillText(data.rarity.toUpperCase(), x + 15, y + 55);
        }
        
        // Description
        ctx.fillStyle = '#CCC';
        ctx.font = '14px Courier New';
        this.wrapText(ctx, data.description, x + 15, y + 85, width - 30, 20);
        
        // Stats based on type
        let statY = y + 140;
        ctx.fillStyle = '#AAA';
        ctx.font = '13px Courier New';
        
        if (this.currentTab === 'creatures') {
            ctx.fillText(`Health: ${data.health}`, x + 15, statY);
            if (data.damage) ctx.fillText(`Damage: ${data.damage}`, x + 15, statY + 20);
            if (data.drops) {
                ctx.fillText(`Drops: ${data.drops.join(', ')}`, x + 15, statY + 40);
            }
            
            // Player stats
            ctx.fillStyle = '#6496FF';
            ctx.fillText(`Encounters: ${discovery.encounters}`, x + 15, statY + 80);
            ctx.fillText(`Kills: ${discovery.kills}`, x + 15, statY + 100);
        } else if (this.currentTab === 'biomes') {
            if (data.resources) {
                ctx.fillText(`Resources: ${data.resources.join(', ')}`, x + 15, statY);
            }
            ctx.fillText(`Danger Level: ${data.dangers}`, x + 15, statY + 20);
        }
        
        // Discovery date
        ctx.fillStyle = '#666';
        ctx.font = '11px Courier New';
        const date = new Date(discovery.discoveredAt);
        ctx.fillText(`Discovered: ${date.toLocaleDateString()}`, x + 15, y + height - 15);
    }
    
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, x, currentY);
                line = word + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    // Handle input
    handleScroll(delta) {
        if (!this.isOpen) return;
        this.scrollOffset = Math.max(0, this.scrollOffset + delta * 30);
    }
    
    handleClick(mouseX, mouseY) {
        if (!this.isOpen) return false;
        
        // Check tab clicks, entry clicks, etc.
        // Implementation would check bounds and update state
        
        return true;
    }
    
    // Serialize for saving
    serialize() {
        return {
            creatures: Array.from(this.discoveries.creatures.entries()),
            items: Array.from(this.discoveries.items.entries()),
            biomes: Array.from(this.discoveries.biomes.entries()),
            blocks: Array.from(this.discoveries.blocks.entries()),
            stats: this.stats
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            if (data.creatures) this.discoveries.creatures = new Map(data.creatures);
            if (data.items) this.discoveries.items = new Map(data.items);
            if (data.biomes) this.discoveries.biomes = new Map(data.biomes);
            if (data.blocks) this.discoveries.blocks = new Map(data.blocks);
            if (data.stats) this.stats = data.stats;
        }
    }
}
