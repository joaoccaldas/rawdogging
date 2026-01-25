import { CONFIG } from '../config.js';

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

    emitText(x, y, z, text, color = '#fff') {
        const p = new Particle(x, y, z, color);
        p.text = text;
        p.vx = (Math.random() - 0.5) * 1;
        p.vy = (Math.random() - 0.5) * 1;
        p.vz = 2; // Fly up
        p.decay = 1.0; // Slower fade
        p.size = 20; // Text size
        this.particles.push(p);
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
