import { CONFIG, BLOCK_DATA, BLOCKS } from '../config.js';

export class ParticleSystem {
    constructor(game) {
        this.game = game;
        this.particles = [];
    }

    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(deltaTime);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    emit(x, y, z, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, z, color));
        }
    }

    emitText(x, y, z, text, color = '#fff', size = 20) {
        const p = new Particle(x, y, z, color);
        p.text = text;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = (Math.random() - 0.5) * 1.5;
        p.vz = 3; // Float up faster
        p.decay = 0.8; // Duration
        p.size = size;
        this.particles.push(p);
    }

    emitItemPickup(x, y, z, emoji, name, count = 1) {
        const p = new Particle(x, y, z, '#ffffff');
        p.text = `${emoji} +${count} ${name}`;
        p.vx = 0;
        p.vy = 0;
        p.vz = 2.5;
        p.decay = 1.0;
        p.size = 22;
        this.particles.push(p);
    }

    // Spawn predefined particle effects
    spawn(effectType, x, y, z, count = 5) {
        switch (effectType) {
            case 'dust':
                // Small dust particles (for block falling, footsteps)
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, '#8b7355');
                    p.size = 1 + Math.random() * 2;
                    p.vz = Math.random() * 2;
                    p.vx = (Math.random() - 0.5) * 2;
                    p.vy = (Math.random() - 0.5) * 2;
                    p.decay = 3;
                    this.particles.push(p);
                }
                break;

            case 'fire':
                // Fire sparks (for torches, campfires)
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, Math.random() < 0.5 ? '#ff6600' : '#ffcc00');
                    p.size = 2 + Math.random() * 3;
                    p.vz = 2 + Math.random() * 3;
                    p.vx = (Math.random() - 0.5) * 1;
                    p.vy = (Math.random() - 0.5) * 1;
                    p.decay = 2;
                    this.particles.push(p);
                }
                break;

            case 'smoke':
                // Smoke particles
                for (let i = 0; i < count; i++) {
                    const gray = Math.floor(80 + Math.random() * 80);
                    const p = new Particle(x, y, z, `rgb(${gray},${gray},${gray})`);
                    p.size = 3 + Math.random() * 4;
                    p.vz = 1 + Math.random() * 2;
                    p.vx = (Math.random() - 0.5) * 0.5;
                    p.vy = (Math.random() - 0.5) * 0.5;
                    p.decay = 1;
                    this.particles.push(p);
                }
                break;

            case 'water':
                // Water splash
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, '#4488ff');
                    p.size = 2 + Math.random() * 2;
                    p.vz = 2 + Math.random() * 4;
                    p.vx = (Math.random() - 0.5) * 4;
                    p.vy = (Math.random() - 0.5) * 4;
                    p.decay = 2;
                    this.particles.push(p);
                }
                break;

            case 'blood':
                // Blood splatter (for combat)
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, '#aa0000');
                    p.size = 2 + Math.random() * 2;
                    p.vz = 1 + Math.random() * 3;
                    p.vx = (Math.random() - 0.5) * 5;
                    p.vy = (Math.random() - 0.5) * 5;
                    p.decay = 1.5;
                    this.particles.push(p);
                }
                break;

            case 'heart':
                // Hearts (for taming, healing)
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, '#ff6699');
                    p.emoji = '❤️';
                    p.size = 16;
                    p.vz = 1.5;
                    p.vx = (Math.random() - 0.5) * 2;
                    p.vy = (Math.random() - 0.5) * 2;
                    p.decay = 1;
                    this.particles.push(p);
                }
                break;

            case 'star':
                // Stars (for level up, achievements)
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, '#ffdd00');
                    p.emoji = '⭐';
                    p.size = 20;
                    p.vz = 2 + Math.random() * 2;
                    p.vx = (Math.random() - 0.5) * 4;
                    p.vy = (Math.random() - 0.5) * 4;
                    p.decay = 1;
                    this.particles.push(p);
                }
                break;

            case 'xp':
                // XP orbs
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, '#00ff88');
                    p.size = 4 + Math.random() * 2;
                    p.vz = 3 + Math.random() * 2;
                    p.vx = (Math.random() - 0.5) * 3;
                    p.vy = (Math.random() - 0.5) * 3;
                    p.decay = 1.5;
                    this.particles.push(p);
                }
                break;

            case 'block_break':
                // Block breaking particles - use block color
                const colors = ['#8b4513', '#666666', '#228b22', '#d2b48c'];
                for (let i = 0; i < count; i++) {
                    const p = new Particle(x, y, z, colors[Math.floor(Math.random() * colors.length)]);
                    p.size = 3 + Math.random() * 3;
                    p.vz = 2 + Math.random() * 3;
                    p.vx = (Math.random() - 0.5) * 6;
                    p.vy = (Math.random() - 0.5) * 6;
                    p.decay = 2;
                    this.particles.push(p);
                }
                break;

            case 'critical':
                // Critical hit indicator
                const p = new Particle(x, y, z, '#ffff00');
                p.text = '💥';
                p.size = 24;
                p.vz = 2;
                p.decay = 1.5;
                this.particles.push(p);
                break;

            default:
                this.emit(x, y, z, '#ffffff', count);
        }
    }

    // Emit block-specific particles when mining
    emitBlockParticles(x, y, z, blockId, count = 8) {
        const blockData = BLOCK_DATA[blockId];
        let color = '#666666';

        // Determine color based on block type
        if (blockId === BLOCKS.GRASS) color = '#228b22';
        else if (blockId === BLOCKS.DIRT) color = '#8b4513';
        else if (blockId === BLOCKS.STONE) color = '#808080';
        else if (blockId === BLOCKS.SAND) color = '#f4d03f';
        else if (blockId === BLOCKS.WOOD) color = '#8b4513';
        else if (blockId === BLOCKS.LEAVES) color = '#228b22';
        else if (blockId === BLOCKS.COAL_ORE) color = '#333333';
        else if (blockId === BLOCKS.IRON_ORE) color = '#d4a574';
        else if (blockId === BLOCKS.GOLD_ORE) color = '#ffd700';
        else if (blockId === BLOCKS.DIAMOND_ORE) color = '#00ffff';

        for (let i = 0; i < count; i++) {
            const p = new Particle(x + 0.5, y + 0.5, z + 0.5, color);
            p.size = 2 + Math.random() * 3;
            p.vz = 1 + Math.random() * 3;
            p.vx = (Math.random() - 0.5) * 4;
            p.vy = (Math.random() - 0.5) * 4;
            p.decay = 2;
            this.particles.push(p);
        }
    }

    render(renderer) {
        // Render particles
        // Sort by Z?
        this.particles.forEach(p => {
            const screen = renderer.game.camera.worldToScreen(p.x, p.y, p.z);
            const camera = renderer.game.camera; // Access camera for zoom
            renderer.ctx.fillStyle = p.color;
            renderer.ctx.globalAlpha = p.life;

            if (p.emoji) {
                renderer.ctx.font = `${p.size * camera.zoom}px Arial`;
                renderer.ctx.textAlign = 'center';
                renderer.ctx.textBaseline = 'middle';
                renderer.ctx.fillText(p.emoji, screen.x, screen.y);
            } else if (p.text) {
                renderer.ctx.font = `bold ${p.size * camera.zoom * 0.5}px monospace`;
                renderer.ctx.textAlign = 'center';
                renderer.ctx.textBaseline = 'middle';
                // Stroke
                renderer.ctx.strokeStyle = 'black';
                renderer.ctx.lineWidth = 2;
                renderer.ctx.strokeText(p.text, screen.x, screen.y);
                renderer.ctx.fillText(p.text, screen.x, screen.y);
            } else {
                const size = p.size * camera.zoom;
                renderer.ctx.fillRect(screen.x - size / 2, screen.y - size / 2, size, size);
            }
            renderer.ctx.globalAlpha = 1;
        });
    }
}

class Particle {
    constructor(x, y, z, color) {
        this.x = x + (Math.random() - 0.5) * 0.5;
        this.y = y + (Math.random() - 0.5) * 0.5;
        this.z = z + (Math.random() - 0.5) * 0.5;
        this.color = color;
        this.text = null; // Added for text support
        this.emoji = null; // Added for emoji support

        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.vz = Math.random() * 4;

        this.life = 1.0;
        this.decay = 2.0; // Life per second
        this.size = 2 + Math.random() * 2;
    }

    update(deltaTime) {
        this.life -= this.decay * deltaTime;

        // Physics
        this.vz -= CONFIG.GRAVITY * 2 * deltaTime;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.z += this.vz * deltaTime;

        if (this.z < 0) {
            this.z = 0;
            this.vz = -this.vz * 0.5;
            this.vx *= 0.5;
            this.vy *= 0.5;
        }
    }
}
