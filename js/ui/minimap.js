import { CONFIG, BLOCKS, BLOCK_DATA } from '../config.js';

export class Minimap {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.canvas = null;
        this.ctx = null;

        this.size = 150; // Size in pixels
        this.zoom = 4; // Pixels per block
        this.updateTimer = 0;

        this.init();
    }

    init() {
        // Create DOM elements
        this.container = document.createElement('div');
        this.container.id = 'minimap-container';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.ctx = this.canvas.getContext('2d');

        // Add Compass decoration (N/S/E/W) - handled via CSS layered mostly

        this.container.appendChild(this.canvas);
        document.getElementById('hud')?.appendChild(this.container) || document.body.appendChild(this.container);

        // Initial render
        this.update(0);
    }

    update(deltaTime) {
        if (!this.game.player) return;

        // Update at 10fps to save performance
        this.updateTimer += deltaTime;
        if (this.updateTimer < 0.1) return;
        this.updateTimer = 0;

        this.render();
    }

    render() {
        const ctx = this.ctx;
        const player = this.game.player;
        const world = this.game.world;

        // Clear
        ctx.fillStyle = '#111'; // Void color
        ctx.fillRect(0, 0, this.size, this.size);

        // Calculate range
        // Canvas center is player.
        // Screen width covers (size / zoom) blocks.
        const range = Math.ceil((this.size / this.zoom) / 2);

        const cx = Math.floor(player.x);
        const cy = Math.floor(player.y);

        // Lock rotation? Or rotate map?
        // Simple minimap: Top is North (+Y? No, usually -Y or +Y depending on coord sys).
        // Our Input: W moves (0, -1) -> North is -Y.
        // Let's keep Top = -Y (North).

        // Iterate blocks in range
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const wx = cx + dx;
                const wy = cy + dy;

                // Get top visible block
                const h = world.getHeight(wx, wy);
                // We could get specific block color, but let's approximate by Height/Biome
                // Or simplified: Get block at height.
                const blockId = world.getBlock(wx, wy, h);
                const blockData = BLOCK_DATA[blockId];

                // Color mapping
                let color = '#333';
                if (blockData) {
                    if (blockId === BLOCKS.GRASS) color = '#4ade80';
                    else if (blockId === BLOCKS.DIRT) color = '#8B4513';
                    else if (blockId === BLOCKS.STONE || blockId === BLOCKS.COBBLESTONE) color = '#888';
                    else if (blockId === BLOCKS.WATER) color = '#3b82f6';
                    else if (blockId === BLOCKS.SAND) color = '#fcd34d';
                    else if (blockId === BLOCKS.SNOW) color = '#fff';
                    else if (blockId === BLOCKS.WOOD || blockId === BLOCKS.LEAVES) color = '#22543d';
                    else if (blockId === BLOCKS.STONE_BRICKS) color = '#555';

                    // Shading by height
                    const hDiff = h - 20; // Around ground level
                    if (hDiff > 5) {
                        // Lighter
                        color = this.adjustColor(color, 20);
                    } else if (hDiff < -5) {
                        // Darker
                        color = this.adjustColor(color, -20);
                    }
                }

                // Draw pixel
                // Map center (size/2) corresponds to (cx, cy)
                const sx = (this.size / 2) + (dx * this.zoom);
                const sy = (this.size / 2) + (dy * this.zoom);

                ctx.fillStyle = color;
                ctx.fillRect(Math.floor(sx), Math.floor(sy), this.zoom, this.zoom);
            }
        }

        // Draw Primal Relics Markers (Blinking)
        if (world.relicPositions) {
            const blink = Math.sin(Date.now() / 200) > 0;

            world.relicPositions.forEach(relic => {
                const rsx = (this.size / 2) + ((relic.x - cx) * this.zoom);
                const rsy = (this.size / 2) + ((relic.y - cy) * this.zoom);

                // If on screen and blinking is currently "on"
                if (blink && rsx >= 0 && rsx <= this.size && rsy >= 0 && rsy <= this.size) {
                    ctx.fillStyle = '#ff00ff'; // Magenta for relics
                    ctx.beginPath();
                    ctx.arc(rsx, rsy, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Optional label
                    ctx.font = '10px Arial';
                    ctx.fillText('✨', rsx - 5, rsy - 6);
                }
            });
        }

        // Draw Ancient Cave Marker
        if (world.ancientCavePos) {
            const caveX = world.ancientCavePos.x;
            const caveY = world.ancientCavePos.y;

            const dsx = (this.size / 2) + ((caveX - cx) * this.zoom);
            const dsy = (this.size / 2) + ((caveY - cy) * this.zoom);

            // If on screen
            if (dsx >= 0 && dsx <= this.size && dsy >= 0 && dsy <= this.size) {
                ctx.fillStyle = '#ffd700'; // Gold
                ctx.beginPath();
                ctx.arc(dsx, dsy, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Emoji or label
                ctx.font = '10px Arial';
                ctx.fillText('🏰', dsx - 5, dsy - 7);
            }
        }

        // Draw Player Marker
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        const center = this.size / 2;
        ctx.arc(center, center, 3, 0, Math.PI * 2);
        ctx.fill();

        // Direction arrow?
        // Player facing is tricky without rotation angle, but velocity helps.
        if (player.vx || player.vy) {
            const angle = Math.atan2(player.vy, player.vx);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.lineTo(center + Math.cos(angle) * 8, center + Math.sin(angle) * 8);
            ctx.stroke();
        }
    }

    adjustColor(hex, amt) {
        let usePound = false;
        if (hex[0] === "#") {
            hex = hex.slice(1);
            usePound = true;
        }
        let num = parseInt(hex, 16);
        let r = (num >> 16) + amt;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
}
