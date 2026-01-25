// Tutorial & Onboarding System
// Guides new players through game mechanics

export class TutorialSystem {
    constructor(game) {
        this.game = game;
        
        // Tutorial state
        this.active = false;
        this.completed = false;
        this.currentStep = 0;
        this.stepProgress = {};
        
        // Skip tutorial flag
        this.skipped = false;
        
        // Tutorial steps
        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to Rawdog!',
                description: 'A survival adventure awaits. Let\'s learn the basics!',
                type: 'message',
                duration: 4000,
                icon: '🎮'
            },
            {
                id: 'movement',
                title: 'Movement',
                description: 'Use WASD or Arrow Keys to move around.',
                type: 'action',
                requirement: { type: 'move', distance: 10 },
                icon: '🚶'
            },
            {
                id: 'look',
                title: 'Look Around',
                description: 'Move your mouse to look around the world.',
                type: 'action',
                requirement: { type: 'look', amount: 90 },
                icon: '👀'
            },
            {
                id: 'gather_wood',
                title: 'Gather Resources',
                description: 'Approach a tree and left-click to gather wood.',
                type: 'action',
                requirement: { type: 'gather', item: 'wood', amount: 5 },
                highlight: 'tree',
                icon: '🌲'
            },
            {
                id: 'open_inventory',
                title: 'Inventory',
                description: 'Press I or TAB to open your inventory.',
                type: 'action',
                requirement: { type: 'openUI', ui: 'inventory' },
                icon: '🎒'
            },
            {
                id: 'craft_basics',
                title: 'Crafting',
                description: 'Press C to open crafting. Make a wooden pickaxe!',
                type: 'action',
                requirement: { type: 'craft', item: 'wood_pickaxe' },
                icon: '🔨'
            },
            {
                id: 'mine_stone',
                title: 'Mining',
                description: 'Use your pickaxe on stone to mine it.',
                type: 'action',
                requirement: { type: 'gather', item: 'stone', amount: 5 },
                highlight: 'stone',
                icon: '⛏️'
            },
            {
                id: 'place_block',
                title: 'Building',
                description: 'Select a block and right-click to place it.',
                type: 'action',
                requirement: { type: 'place', amount: 1 },
                icon: '🧱'
            },
            {
                id: 'survival_tips',
                title: 'Survival Tips',
                description: 'Watch your health, hunger, and thirst bars. Eat food and drink water to survive!',
                type: 'message',
                duration: 5000,
                icon: '❤️'
            },
            {
                id: 'complete',
                title: 'Tutorial Complete!',
                description: 'You\'re ready to explore! Press H for help anytime.',
                type: 'message',
                duration: 4000,
                icon: '🎉'
            }
        ];
        
        // Hints for later game
        this.hints = [
            { trigger: 'firstNight', message: 'Night is falling! Monsters spawn in the dark. Find shelter!', icon: '🌙' },
            { trigger: 'lowHealth', message: 'Your health is low! Eat food to heal.', icon: '💔' },
            { trigger: 'lowHunger', message: 'You\'re getting hungry! Find food soon.', icon: '🍖' },
            { trigger: 'lowThirst', message: 'You\'re thirsty! Find water to drink.', icon: '💧' },
            { trigger: 'firstDeath', message: 'You died! Your items dropped where you fell.', icon: '☠️' },
            { trigger: 'firstBoss', message: 'A powerful enemy approaches! Prepare for battle!', icon: '👹' },
            { trigger: 'newBiome', message: 'You discovered a new biome!', icon: '🗺️' },
            { trigger: 'firstCave', message: 'Caves contain valuable resources... and dangers!', icon: '🕳️' }
        ];
        
        // Shown hints (don't repeat)
        this.shownHints = new Set();
        
        // UI state
        this.displayTime = 0;
        this.fadeAlpha = 0;
    }
    
    // Start tutorial for new player
    start() {
        this.active = true;
        this.completed = false;
        this.currentStep = 0;
        this.stepProgress = {};
        this.displayTime = 0;
        
        console.log('Tutorial started');
    }
    
    // Skip tutorial
    skip() {
        this.active = false;
        this.skipped = true;
        this.game.ui?.showNotification?.('Tutorial skipped. Press H for help.', 'info');
    }
    
    // Get current step
    getCurrentStep() {
        if (this.currentStep >= this.steps.length) {
            return null;
        }
        return this.steps[this.currentStep];
    }
    
    // Progress current step
    progress(action, data = {}) {
        if (!this.active || this.completed) return;
        
        const step = this.getCurrentStep();
        if (!step || step.type === 'message') return;
        
        const req = step.requirement;
        if (!req) return;
        
        // Check if action matches requirement
        if (action !== req.type) return;
        
        // Initialize progress
        if (!this.stepProgress[step.id]) {
            this.stepProgress[step.id] = 0;
        }
        
        // Update progress based on requirement type
        switch (req.type) {
            case 'move':
                this.stepProgress[step.id] += data.distance || 1;
                break;
            case 'look':
                this.stepProgress[step.id] += data.angle || 1;
                break;
            case 'gather':
                if (!req.item || data.item === req.item || data.item?.includes?.(req.item)) {
                    this.stepProgress[step.id] += data.amount || 1;
                }
                break;
            case 'craft':
                if (data.item === req.item || !req.item) {
                    this.stepProgress[step.id] = req.amount || 1;
                }
                break;
            case 'place':
                this.stepProgress[step.id] += 1;
                break;
            case 'openUI':
                if (data.ui === req.ui || !req.ui) {
                    this.stepProgress[step.id] = 1;
                }
                break;
            default:
                this.stepProgress[step.id] += 1;
        }
        
        // Check completion
        const target = req.amount || 1;
        if (this.stepProgress[step.id] >= target) {
            this.completeStep();
        }
    }
    
    // Complete current step
    completeStep() {
        const step = this.getCurrentStep();
        if (!step) return;
        
        console.log(`Tutorial step completed: ${step.id}`);
        
        // Play completion sound
        this.game.audio?.play('tutorial_complete');
        
        // Move to next step
        this.currentStep++;
        this.displayTime = 0;
        
        // Check if tutorial is complete
        if (this.currentStep >= this.steps.length) {
            this.complete();
        }
    }
    
    // Complete entire tutorial
    complete() {
        this.active = false;
        this.completed = true;
        
        console.log('Tutorial completed!');
        
        // Achievement
        this.game.achievements?.unlock?.('tutorial_complete');
        
        // Notify
        this.game.ui?.showNotification?.('🎉 Tutorial complete! Good luck!', 'success');
    }
    
    // Show contextual hint
    showHint(trigger) {
        if (this.shownHints.has(trigger)) return;
        
        const hint = this.hints.find(h => h.trigger === trigger);
        if (!hint) return;
        
        this.shownHints.add(trigger);
        
        this.game.ui?.showNotification?.(
            `${hint.icon} ${hint.message}`,
            'info',
            5000
        );
    }
    
    update(deltaTime) {
        if (!this.active) return;
        
        const step = this.getCurrentStep();
        if (!step) return;
        
        // Handle timed message steps
        if (step.type === 'message') {
            this.displayTime += deltaTime * 1000;
            
            if (this.displayTime >= step.duration) {
                this.completeStep();
            }
        }
        
        // Update fade
        this.fadeAlpha = Math.min(1, this.fadeAlpha + deltaTime * 3);
    }
    
    render(ctx) {
        if (!this.active) return;
        
        const step = this.getCurrentStep();
        if (!step) return;
        
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        
        ctx.save();
        ctx.globalAlpha = this.fadeAlpha;
        
        // Tutorial box at top of screen
        const boxWidth = 500;
        const boxHeight = 120;
        const boxX = centerX - boxWidth / 2;
        const boxY = 20;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#6496FF';
        ctx.lineWidth = 3;
        this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
        ctx.stroke();
        
        // Icon
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.fillText(step.icon || '📖', boxX + 40, boxY + 55);
        
        // Title
        ctx.font = 'bold 20px Courier New';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#6496FF';
        ctx.fillText(step.title, boxX + 80, boxY + 40);
        
        // Description
        ctx.font = '16px Courier New';
        ctx.fillStyle = '#DDD';
        this.wrapText(ctx, step.description, boxX + 80, boxY + 65, boxWidth - 100, 20);
        
        // Progress bar for action steps
        if (step.type === 'action' && step.requirement) {
            const progress = this.stepProgress[step.id] || 0;
            const target = step.requirement.amount || 1;
            const percent = Math.min(1, progress / target);
            
            const barWidth = boxWidth - 40;
            const barHeight = 8;
            const barY = boxY + boxHeight - 20;
            
            // Background
            ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.fillRect(boxX + 20, barY, barWidth, barHeight);
            
            // Fill
            ctx.fillStyle = '#6496FF';
            ctx.fillRect(boxX + 20, barY, barWidth * percent, barHeight);
            
            // Text
            ctx.font = '12px Courier New';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#AAA';
            ctx.fillText(`${Math.floor(progress)}/${target}`, boxX + boxWidth - 25, barY - 5);
        }
        
        // Skip button
        ctx.font = '12px Courier New';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#888';
        ctx.fillText('Press ESC to skip tutorial', boxX + boxWidth - 10, boxY + boxHeight + 20);
        
        // Highlight target objects if specified
        if (step.highlight) {
            this.renderHighlight(ctx, step.highlight);
        }
        
        ctx.restore();
    }
    
    renderHighlight(ctx, targetType) {
        if (!this.game.world || !this.game.camera) return;
        
        // Find nearby targets of the specified type
        // This would highlight trees, stones, etc.
        // Implementation depends on world structure
    }
    
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
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
    
    // Serialize for saving
    serialize() {
        return {
            completed: this.completed,
            skipped: this.skipped,
            currentStep: this.currentStep,
            stepProgress: this.stepProgress,
            shownHints: Array.from(this.shownHints)
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data) {
            this.completed = data.completed || false;
            this.skipped = data.skipped || false;
            this.currentStep = data.currentStep || 0;
            this.stepProgress = data.stepProgress || {};
            this.shownHints = new Set(data.shownHints || []);
            
            // Don't restart if completed or skipped
            this.active = !this.completed && !this.skipped;
        }
    }
}
