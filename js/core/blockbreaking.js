// Block Breaking Animation System
// Shows cracks, progress bar, and particles when mining blocks

import { BLOCK_DATA, BLOCKS } from '../config.js';

export class BlockBreakingSystem {
    constructor(game) {
        this.game = game;
        
        // Current breaking state
        this.currentBlock = null; // {x, y, z, blockType}
        this.breakProgress = 0; // 0-1
        this.breakTime = 0;
        this.totalBreakTime = 0;
        
        // Visual settings
        this.crackStages = 10; // Number of crack stages
        this.showProgressBar = true;
        this.progressBarWidth = 40;
        this.progressBarHeight = 6;
        
        // Particle settings
        this.particlesPerStage = 3;
        
        // Pre-generate crack textures
        this.crackTextures = [];
        this.generateCrackTextures();
    }
    
    generateCrackTextures() {
        for (let stage = 0; stage < this.crackStages; stage++) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Draw cracks based on stage
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.lineWidth = 1 + (stage / this.crackStages) * 2;
            
            const crackCount = 2 + Math.floor(stage * 0.8);
            
            for (let i = 0; i < crackCount; i++) {
                this.drawCrack(ctx, stage);
            }
            
            this.crackTextures.push(canvas);
        }
    }
    
    drawCrack(ctx, stage) {
        const intensity = (stage + 1) / this.crackStages;
        const segments = 3 + Math.floor(intensity * 4);
        
        // Random start point near center
        let x = 20 + Math.random() * 24;
        let y = 20 + Math.random() * 24;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        for (let i = 0; i < segments; i++) {
            const angle = Math.random() * Math.PI * 2;
            const length = 5 + Math.random() * 10 * intensity;
            x += Math.cos(angle) * length;
            y += Math.sin(angle) * length;
            
            // Keep within bounds
            x = Math.max(5, Math.min(59, x));
            y = Math.max(5, Math.min(59, y));
            
            ctx.lineTo(x, y);
            
            // Branch occasionally
            if (Math.random() > 0.6 && stage > 3) {
                const branchAngle = angle + (Math.random() - 0.5) * Math.PI;
                const branchLength = 3 + Math.random() * 5;
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(branchAngle) * branchLength,
                    y + Math.sin(branchAngle) * branchLength
                );
                ctx.moveTo(x, y);
            }
        }
        
        ctx.stroke();
    }
    
    startBreaking(x, y, z, blockType) {
        // Calculate break time based on block hardness and tool
        const blockData = BLOCK_DATA[blockType];
        if (!blockData || blockType === BLOCKS.AIR || blockType === BLOCKS.BEDROCK) {
            return false;
        }
        
        const hardness = blockData.hardness || 1;
        const player = this.game.player;
        
        // Get tool multiplier
        let toolMultiplier = 1;
        const heldItem = player?.getHeldItem?.();
        if (heldItem) {
            const toolType = this.getToolType(heldItem.id);
            const requiredTool = blockData.toolRequired;
            const preferredTool = blockData.toolPreferred;
            
            if (toolType === requiredTool || toolType === preferredTool) {
                toolMultiplier = this.getToolSpeed(heldItem.id);
            } else if (requiredTool && toolType !== requiredTool) {
                toolMultiplier = 0.3; // Wrong tool penalty
            }
        } else if (blockData.toolRequired) {
            toolMultiplier = 0.2; // No tool when one is required
        }
        
        // Apply skill bonuses
        const miningSkill = this.game.skills?.getSkillLevel?.('mining') || 0;
        const skillBonus = 1 + (miningSkill * 0.05);
        
        // Calculate total break time
        this.totalBreakTime = (hardness / toolMultiplier) / skillBonus;
        this.breakTime = 0;
        this.breakProgress = 0;
        
        this.currentBlock = { x, y, z, blockType };
        
        // Play start sound
        if (this.game.audio) {
            this.game.audio.play('dig');
        }
        
        return true;
    }
    
    getToolType(itemId) {
        if (!itemId) return null;
        const id = itemId.toLowerCase();
        if (id.includes('pickaxe')) return 'pickaxe';
        if (id.includes('axe')) return 'axe';
        if (id.includes('shovel')) return 'shovel';
        if (id.includes('hoe')) return 'hoe';
        if (id.includes('sword')) return 'sword';
        return null;
    }
    
    getToolSpeed(itemId) {
        if (!itemId) return 1;
        const id = itemId.toLowerCase();
        if (id.includes('diamond')) return 8;
        if (id.includes('gold')) return 12;
        if (id.includes('iron')) return 6;
        if (id.includes('bronze')) return 4;
        if (id.includes('stone')) return 4;
        if (id.includes('copper')) return 3;
        if (id.includes('wood') || id.includes('bone')) return 2;
        return 1;
    }
    
    update(deltaTime, isStillMining) {
        if (!this.currentBlock) return;
        
        if (!isStillMining) {
            this.cancelBreaking();
            return;
        }
        
        // Progress breaking
        this.breakTime += deltaTime;
        const prevProgress = this.breakProgress;
        this.breakProgress = Math.min(1, this.breakTime / this.totalBreakTime);
        
        // Check for stage change (for particles)
        const prevStage = Math.floor(prevProgress * this.crackStages);
        const currentStage = Math.floor(this.breakProgress * this.crackStages);
        
        if (currentStage > prevStage) {
            this.spawnBreakParticles();
            
            // Play crack sound
            if (this.game.audio) {
                this.game.audio.play('dig');
            }
        }
        
        // Check if complete
        if (this.breakProgress >= 1) {
            this.completeBreaking();
        }
    }
    
    spawnBreakParticles() {
        if (!this.currentBlock || !this.game.particles) return;
        
        const { x, y, z, blockType } = this.currentBlock;
        const blockData = BLOCK_DATA[blockType];
        const color = blockData?.color || '#888888';
        
        for (let i = 0; i < this.particlesPerStage; i++) {
            this.game.particles.emit({
                x: x + 0.5 + (Math.random() - 0.5) * 0.8,
                y: y + 0.5 + (Math.random() - 0.5) * 0.8,
                z: z + 0.5 + (Math.random() - 0.5) * 0.8,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                vz: Math.random() * 2,
                color: color,
                size: 3 + Math.random() * 3,
                life: 0.5 + Math.random() * 0.5,
                gravity: 0.5
            });
        }
    }
    
    completeBreaking() {
        if (!this.currentBlock) return;
        
        const { x, y, z, blockType } = this.currentBlock;
        
        // Spawn lots of particles
        for (let i = 0; i < 15; i++) {
            this.spawnBreakParticles();
        }
        
        // Play break sound
        if (this.game.audio) {
            this.game.audio.play('break');
        }
        
        // Actually break the block (handled by player/world)
        // This system just handles the visual/timing
        
        this.currentBlock = null;
        this.breakProgress = 0;
        this.breakTime = 0;
    }
    
    cancelBreaking() {
        this.currentBlock = null;
        this.breakProgress = 0;
        this.breakTime = 0;
    }
    
    isBreaking() {
        return this.currentBlock !== null;
    }
    
    getBreakProgress() {
        return this.breakProgress;
    }
    
    getCurrentBlock() {
        return this.currentBlock;
    }
    
    render(ctx) {
        if (!this.currentBlock || this.breakProgress <= 0) return;
        
        const { x, y, z } = this.currentBlock;
        const camera = this.game.camera;
        
        // Get screen position
        const screen = camera.worldToScreen(x + 0.5, y + 0.5, z);
        const zoom = camera.zoom;
        
        // Draw crack overlay on block
        const crackStage = Math.min(
            this.crackStages - 1,
            Math.floor(this.breakProgress * this.crackStages)
        );
        const crackTexture = this.crackTextures[crackStage];
        
        if (crackTexture) {
            const size = 64 * zoom;
            ctx.globalAlpha = 0.6 + (this.breakProgress * 0.4);
            ctx.drawImage(
                crackTexture,
                screen.x - size / 2,
                screen.y - size / 2,
                size,
                size
            );
            ctx.globalAlpha = 1;
        }
        
        // Draw progress bar
        if (this.showProgressBar) {
            const barX = screen.x - this.progressBarWidth / 2;
            const barY = screen.y - 50 * zoom;
            
            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(barX - 2, barY - 2, this.progressBarWidth + 4, this.progressBarHeight + 4);
            
            // Progress
            const progressWidth = this.progressBarWidth * this.breakProgress;
            
            // Color gradient based on progress
            const hue = 120 - (this.breakProgress * 120); // Green to red
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.fillRect(barX, barY, progressWidth, this.progressBarHeight);
            
            // Border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX - 1, barY - 1, this.progressBarWidth + 2, this.progressBarHeight + 2);
        }
    }
    
    // Get current block being mined (for external checks)
    getMiningTarget() {
        return this.currentBlock;
    }
    
    serialize() {
        return {
            currentBlock: this.currentBlock,
            breakProgress: this.breakProgress,
            breakTime: this.breakTime,
            totalBreakTime: this.totalBreakTime
        };
    }
    
    deserialize(data) {
        if (!data) return;
        this.currentBlock = data.currentBlock;
        this.breakProgress = data.breakProgress || 0;
        this.breakTime = data.breakTime || 0;
        this.totalBreakTime = data.totalBreakTime || 0;
    }
    
    reset() {
        this.currentBlock = null;
        this.breakProgress = 0;
        this.breakTime = 0;
        this.totalBreakTime = 0;
    }
}
