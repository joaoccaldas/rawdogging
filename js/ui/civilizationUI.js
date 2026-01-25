/**
 * Civilization UI
 * Displays settlement stats, resources, buildings, and technology tree
 */

import { BUILDING_TYPES, TECHNOLOGIES, PROFESSIONS } from '../core/civilization.js';

export class CivilizationUI {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.activeTab = 'overview';
        this.selectedBuilding = null;
        
        this.createUI();
    }
    
    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'civilization-ui';
        this.container.className = 'civ-ui hidden';
        this.container.innerHTML = `
            <div class="civ-header">
                <h2>🏛️ Civilization Manager</h2>
                <button class="civ-close" id="civ-close">✕</button>
            </div>
            
            <div class="civ-tabs">
                <button class="civ-tab active" data-tab="overview">Overview</button>
                <button class="civ-tab" data-tab="buildings">Buildings</button>
                <button class="civ-tab" data-tab="technology">Technology</button>
                <button class="civ-tab" data-tab="villagers">Villagers</button>
            </div>
            
            <div class="civ-content">
                <div class="civ-panel" id="civ-overview"></div>
                <div class="civ-panel hidden" id="civ-buildings"></div>
                <div class="civ-panel hidden" id="civ-technology"></div>
                <div class="civ-panel hidden" id="civ-villagers"></div>
            </div>
        `;
        
        document.body.appendChild(this.container);
        
        // Add styles
        this.addStyles();
        
        // Event listeners
        this.container.querySelector('#civ-close').addEventListener('click', () => this.hide());
        
        this.container.querySelectorAll('.civ-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                if (!this.game.ui?.isInputActive()) {
                    this.toggle();
                }
            }
        });
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .civ-ui {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 800px;
                max-width: 95vw;
                max-height: 85vh;
                background: linear-gradient(135deg, #2a1810 0%, #1a0f0a 100%);
                border: 3px solid #8B4513;
                border-radius: 10px;
                color: #f4d03f;
                font-family: 'Georgia', serif;
                z-index: 1000;
                box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .civ-ui.hidden {
                display: none;
            }
            
            .civ-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(139, 69, 19, 0.3);
                border-bottom: 2px solid #8B4513;
            }
            
            .civ-header h2 {
                margin: 0;
                font-size: 24px;
                text-shadow: 2px 2px 4px #000;
            }
            
            .civ-close {
                background: #8B0000;
                border: 2px solid #CD5C5C;
                color: white;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.2s;
            }
            
            .civ-close:hover {
                background: #CD5C5C;
                transform: scale(1.1);
            }
            
            .civ-tabs {
                display: flex;
                background: rgba(0,0,0,0.3);
                padding: 5px;
                gap: 5px;
            }
            
            .civ-tab {
                flex: 1;
                padding: 10px 15px;
                background: rgba(139, 69, 19, 0.3);
                border: 2px solid transparent;
                color: #c9a66b;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
                font-size: 14px;
            }
            
            .civ-tab:hover {
                background: rgba(139, 69, 19, 0.5);
            }
            
            .civ-tab.active {
                background: rgba(139, 69, 19, 0.7);
                border-color: #f4d03f;
                color: #f4d03f;
            }
            
            .civ-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }
            
            .civ-panel.hidden {
                display: none;
            }
            
            /* Overview Panel */
            .civ-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .civ-stat-card {
                background: rgba(0,0,0,0.3);
                border: 2px solid #8B4513;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            }
            
            .civ-stat-card .stat-icon {
                font-size: 32px;
                margin-bottom: 5px;
            }
            
            .civ-stat-card .stat-value {
                font-size: 28px;
                font-weight: bold;
                color: #f4d03f;
            }
            
            .civ-stat-card .stat-label {
                font-size: 12px;
                color: #c9a66b;
                text-transform: uppercase;
            }
            
            .civ-resources {
                background: rgba(0,0,0,0.3);
                border: 2px solid #8B4513;
                border-radius: 8px;
                padding: 15px;
            }
            
            .civ-resources h3 {
                margin: 0 0 15px 0;
                color: #f4d03f;
                border-bottom: 1px solid #8B4513;
                padding-bottom: 10px;
            }
            
            .resource-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            
            .resource-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px;
                background: rgba(139, 69, 19, 0.2);
                border-radius: 5px;
            }
            
            .resource-icon {
                font-size: 24px;
            }
            
            .resource-info {
                flex: 1;
            }
            
            .resource-name {
                font-size: 12px;
                color: #c9a66b;
            }
            
            .resource-amount {
                font-size: 18px;
                font-weight: bold;
            }
            
            /* Buildings Panel */
            .building-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .building-card {
                background: rgba(0,0,0,0.3);
                border: 2px solid #5a3d2b;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .building-card:hover {
                border-color: #f4d03f;
                transform: translateY(-2px);
            }
            
            .building-card.locked {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .building-card.locked:hover {
                border-color: #5a3d2b;
                transform: none;
            }
            
            .building-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .building-name {
                font-size: 16px;
                font-weight: bold;
                color: #f4d03f;
            }
            
            .building-age {
                font-size: 11px;
                padding: 3px 8px;
                background: #8B4513;
                border-radius: 10px;
                text-transform: uppercase;
            }
            
            .building-desc {
                font-size: 13px;
                color: #c9a66b;
                margin-bottom: 10px;
            }
            
            .building-cost {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .cost-item {
                font-size: 12px;
                padding: 3px 8px;
                background: rgba(0,0,0,0.3);
                border-radius: 3px;
            }
            
            .cost-item.insufficient {
                color: #ff6b6b;
            }
            
            /* Technology Panel */
            .tech-tree {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .tech-age {
                background: rgba(0,0,0,0.3);
                border: 2px solid #8B4513;
                border-radius: 8px;
                padding: 15px;
            }
            
            .tech-age h3 {
                margin: 0 0 15px 0;
                color: #f4d03f;
            }
            
            .tech-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }
            
            .tech-card {
                background: rgba(0,0,0,0.3);
                border: 2px solid #5a3d2b;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .tech-card:hover {
                border-color: #f4d03f;
            }
            
            .tech-card.unlocked {
                border-color: #228B22;
                background: rgba(34, 139, 34, 0.2);
            }
            
            .tech-card.locked {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .tech-name {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .tech-cost {
                font-size: 12px;
                color: #c9a66b;
            }
            
            /* Villagers Panel */
            .villager-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .villager-row {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border: 2px solid #5a3d2b;
                border-radius: 8px;
            }
            
            .villager-avatar {
                width: 40px;
                height: 40px;
                background: #8B4513;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .villager-info {
                flex: 1;
            }
            
            .villager-name {
                font-weight: bold;
            }
            
            .villager-profession {
                font-size: 12px;
                color: #c9a66b;
            }
            
            .profession-select {
                padding: 5px 10px;
                background: #2a1810;
                border: 2px solid #8B4513;
                color: #f4d03f;
                border-radius: 5px;
                cursor: pointer;
            }
            
            /* Happiness Bar */
            .happiness-bar {
                width: 100%;
                height: 20px;
                background: rgba(0,0,0,0.5);
                border-radius: 10px;
                overflow: hidden;
                margin-top: 10px;
            }
            
            .happiness-fill {
                height: 100%;
                transition: width 0.5s;
            }
            
            .happiness-fill.high { background: linear-gradient(90deg, #228B22, #32CD32); }
            .happiness-fill.medium { background: linear-gradient(90deg, #DAA520, #FFD700); }
            .happiness-fill.low { background: linear-gradient(90deg, #8B0000, #FF4500); }
            
            /* Build button */
            .build-btn {
                margin-top: 10px;
                padding: 8px 15px;
                background: #228B22;
                border: 2px solid #32CD32;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.2s;
            }
            
            .build-btn:hover {
                background: #32CD32;
            }
            
            .build-btn:disabled {
                background: #555;
                border-color: #666;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    show() {
        this.visible = true;
        this.container.classList.remove('hidden');
        this.update();
        
        // Pause game when UI is open
        if (this.game.paused !== undefined) {
            this.wasPaused = this.game.paused;
            this.game.paused = true;
        }
    }
    
    hide() {
        this.visible = false;
        this.container.classList.add('hidden');
        
        // Restore pause state
        if (this.wasPaused !== undefined) {
            this.game.paused = this.wasPaused;
        }
    }
    
    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        this.container.querySelectorAll('.civ-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update panels
        this.container.querySelectorAll('.civ-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        this.container.querySelector(`#civ-${tabName}`).classList.remove('hidden');
        
        this.update();
    }
    
    update() {
        if (!this.visible) return;
        
        const civ = this.game.civilization;
        if (!civ) return;
        
        switch (this.activeTab) {
            case 'overview':
                this.renderOverview(civ);
                break;
            case 'buildings':
                this.renderBuildings(civ);
                break;
            case 'technology':
                this.renderTechnology(civ);
                break;
            case 'villagers':
                this.renderVillagers(civ);
                break;
        }
    }
    
    renderOverview(civ) {
        const stats = civ.getStats();
        const panel = this.container.querySelector('#civ-overview');
        
        const happinessClass = stats.happiness > 70 ? 'high' : stats.happiness > 40 ? 'medium' : 'low';
        
        panel.innerHTML = `
            <div class="civ-stats-grid">
                <div class="civ-stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${stats.population}</div>
                    <div class="stat-label">Population</div>
                </div>
                <div class="civ-stat-card">
                    <div class="stat-icon">😊</div>
                    <div class="stat-value">${stats.happiness}%</div>
                    <div class="stat-label">Happiness</div>
                    <div class="happiness-bar">
                        <div class="happiness-fill ${happinessClass}" style="width: ${stats.happiness}%"></div>
                    </div>
                </div>
                <div class="civ-stat-card">
                    <div class="stat-icon">🔬</div>
                    <div class="stat-value">${stats.researchPoints}</div>
                    <div class="stat-label">Research</div>
                </div>
                <div class="civ-stat-card">
                    <div class="stat-icon">🏛️</div>
                    <div class="stat-value">${stats.settlements}</div>
                    <div class="stat-label">Settlements</div>
                </div>
            </div>
            
            <div class="civ-resources">
                <h3>📦 Stockpile</h3>
                <div class="resource-grid">
                    <div class="resource-item">
                        <span class="resource-icon">🍖</span>
                        <div class="resource-info">
                            <div class="resource-name">Food</div>
                            <div class="resource-amount">${Math.floor(stats.stockpile.food)}</div>
                        </div>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🪵</span>
                        <div class="resource-info">
                            <div class="resource-name">Wood</div>
                            <div class="resource-amount">${Math.floor(stats.stockpile.wood)}</div>
                        </div>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🪨</span>
                        <div class="resource-info">
                            <div class="resource-name">Stone</div>
                            <div class="resource-amount">${Math.floor(stats.stockpile.stone)}</div>
                        </div>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">⛏️</span>
                        <div class="resource-info">
                            <div class="resource-name">Ore</div>
                            <div class="resource-amount">${Math.floor(stats.stockpile.ore)}</div>
                        </div>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">🔧</span>
                        <div class="resource-info">
                            <div class="resource-name">Tools</div>
                            <div class="resource-amount">${Math.floor(stats.stockpile.tools)}</div>
                        </div>
                    </div>
                    <div class="resource-item">
                        <span class="resource-icon">⚔️</span>
                        <div class="resource-info">
                            <div class="resource-name">Weapons</div>
                            <div class="resource-amount">${Math.floor(stats.stockpile.weapons)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="civ-resources" style="margin-top: 15px;">
                <h3>🏆 Milestones (${stats.milestones})</h3>
                <p style="color: #c9a66b;">Current Age: <strong style="color: #f4d03f;">${stats.currentAge.toUpperCase()} AGE</strong></p>
                <p style="color: #c9a66b;">Technologies Unlocked: ${stats.technologies}</p>
            </div>
        `;
    }
    
    renderBuildings(civ) {
        const panel = this.container.querySelector('#civ-buildings');
        
        let html = '<div class="building-grid">';
        
        for (const [key, building] of Object.entries(BUILDING_TYPES)) {
            const canBuild = civ.canBuildBuilding(key);
            const costs = [];
            
            for (const [itemId, amount] of Object.entries(building.cost)) {
                const stockpileKey = civ.getStockpileKey(parseInt(itemId));
                const have = civ.stockpile[stockpileKey] || 0;
                const sufficient = have >= amount;
                costs.push(`<span class="cost-item ${sufficient ? '' : 'insufficient'}">${this.getItemName(itemId)}: ${amount}</span>`);
            }
            
            html += `
                <div class="building-card ${canBuild ? '' : 'locked'}" data-building="${key}">
                    <div class="building-header">
                        <span class="building-name">${building.name}</span>
                        <span class="building-age">${building.age}</span>
                    </div>
                    <div class="building-desc">${building.description}</div>
                    <div class="building-cost">${costs.join('')}</div>
                    ${building.housingCapacity > 0 ? `<div style="margin-top: 5px; font-size: 12px;">🏠 Housing: +${building.housingCapacity}</div>` : ''}
                    ${canBuild ? `<button class="build-btn" data-building="${key}">Build (${building.buildTime}s)</button>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        panel.innerHTML = html;
        
        // Add click handlers
        panel.querySelectorAll('.build-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startBuildMode(e.target.dataset.building);
            });
        });
    }
    
    renderTechnology(civ) {
        const panel = this.container.querySelector('#civ-technology');
        
        const ages = ['stone', 'tribal', 'bronze'];
        let html = '<div class="tech-tree">';
        
        for (const age of ages) {
            const ageTechs = Object.entries(TECHNOLOGIES).filter(([k, t]) => t.age === age);
            if (ageTechs.length === 0) continue;
            
            html += `
                <div class="tech-age">
                    <h3>🏛️ ${age.charAt(0).toUpperCase() + age.slice(1)} Age</h3>
                    <div class="tech-grid">
            `;
            
            for (const [key, tech] of ageTechs) {
                const unlocked = civ.isTechnologyUnlocked(key);
                const canUnlock = !unlocked && tech.prerequisites.every(p => civ.isTechnologyUnlocked(p));
                const locked = !unlocked && !canUnlock;
                
                html += `
                    <div class="tech-card ${unlocked ? 'unlocked' : locked ? 'locked' : ''}" data-tech="${key}">
                        <div class="tech-name">${unlocked ? '✓ ' : ''}${tech.name}</div>
                        <div class="tech-cost">${unlocked ? 'Unlocked' : `Cost: ${tech.cost.research} RP`}</div>
                        ${!unlocked && canUnlock ? `<button class="build-btn" data-tech="${key}" style="margin-top: 8px;">Research</button>` : ''}
                    </div>
                `;
            }
            
            html += '</div></div>';
        }
        
        html += '</div>';
        panel.innerHTML = html;
        
        // Add click handlers
        panel.querySelectorAll('.build-btn[data-tech]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                civ.unlockTechnology(e.target.dataset.tech);
                this.update();
            });
        });
    }
    
    renderVillagers(civ) {
        const panel = this.container.querySelector('#civ-villagers');
        
        let html = '<div class="villager-list">';
        
        for (const [id, settlement] of civ.settlements) {
            html += `<h3 style="margin: 10px 0;">🏘️ ${settlement.name} (${settlement.villagers.length}/${settlement.getHousingCapacity()})</h3>`;
            
            for (const villager of settlement.villagers) {
                const prof = villager.civProfession || PROFESSIONS.IDLE;
                
                html += `
                    <div class="villager-row">
                        <div class="villager-avatar" style="background: ${prof.color}">👤</div>
                        <div class="villager-info">
                            <div class="villager-name">${villager.name || 'Villager'}</div>
                            <div class="villager-profession">${prof.name}</div>
                        </div>
                        <select class="profession-select" data-villager="${villager.id}">
                            ${Object.entries(PROFESSIONS).map(([k, p]) => 
                                `<option value="${k}" ${prof.id === p.id ? 'selected' : ''}>${p.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        panel.innerHTML = html;
        
        // Add change handlers
        panel.querySelectorAll('.profession-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const villagerId = e.target.dataset.villager;
                const profKey = e.target.value;
                
                // Find villager and update
                for (const [id, settlement] of civ.settlements) {
                    const villager = settlement.villagers.find(v => v.id == villagerId);
                    if (villager) {
                        villager.civProfession = PROFESSIONS[profKey];
                        break;
                    }
                }
                
                this.game.ui?.showMessage(`Villager assigned to ${PROFESSIONS[profKey].name}`, 'info');
            });
        });
    }
    
    getItemName(itemId) {
        const id = parseInt(itemId);
        const names = {
            100: 'Wood', 101: 'Stone', 102: 'Thatch', 103: 'Clay',
            104: 'Iron Ore', 105: 'Gold Ore', 106: 'Planks'
        };
        return names[id] || `Item ${id}`;
    }
    
    startBuildMode(buildingType) {
        this.hide();
        this.game.buildMode = {
            active: true,
            building: buildingType,
            data: BUILDING_TYPES[buildingType]
        };
        this.game.ui?.showMessage(`Click to place ${BUILDING_TYPES[buildingType].name}. Press ESC to cancel.`, 'info');
    }
}
