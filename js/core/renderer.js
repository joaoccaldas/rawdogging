// Renderer - Handles all drawing operations
import { CONFIG, BLOCK_DATA, BLOCKS } from '../config.js';
import { InteractionUtils } from '../utils/interaction.js';

export class Renderer {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize

        this.width = 0;
        this.height = 0;

        // Damage flash overlay
        this.damageFlash = 0;
        this.damageFlashColor = 'rgba(255, 0, 0, 0)';

        // Hit feedback
        this.hitFlash = 0;
        this.hitFlashColor = 'rgba(255, 255, 0, 0)';

        // Lighting
        this.ambientLight = 1;
        this.lightSources = [];

        // Cached colors - Prehistoric atmosphere
        this.skyColors = {
            day: '#7CB9E8',    // Clearer ancient sky
            sunset: '#CD5C5C', // Dusty red sunset
            night: '#0d1117',  // Darker prehistoric night
            dawn: '#DDA0DD'    // Misty purple dawn
        };

        // Evolution Color Multipliers
        this.biomeColors = {
            [BLOCKS.GRASS]: '#228B22',
            [BLOCKS.DIRT]: '#8B4513',
            [BLOCKS.SAND]: '#F4D03F',
            [BLOCKS.WATER]: '#4169E1'
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        // Cache block faces? simpler to just draw texture
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.ctx.scale(dpr, dpr);

        if (this.game.camera) {
            this.game.camera.resize(this.width, this.height);
        }
    }

    clear() {
        this.ctx.fillStyle = this.getSkyColor();
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    getSkyColor() {
        const timeOfDay = this.game.world?.timeOfDay || 0.5;
        const ageIndex = this.game.ageProgression?.currentAgeIndex || 0;

        let baseColor;
        if (timeOfDay < CONFIG.DAWN_START) {
            baseColor = this.skyColors.night;
        } else if (timeOfDay < 0.3) {
            const t = (timeOfDay - CONFIG.DAWN_START) / 0.1;
            baseColor = this.lerpColor(this.skyColors.night, this.skyColors.dawn, t);
        } else if (timeOfDay < 0.35) {
            const t = (timeOfDay - 0.3) / 0.05;
            baseColor = this.lerpColor(this.skyColors.dawn, this.skyColors.day, t);
        } else if (timeOfDay < CONFIG.DUSK_START) {
            baseColor = this.skyColors.day;
        } else if (timeOfDay < 0.8) {
            const t = (timeOfDay - CONFIG.DUSK_START) / 0.1;
            baseColor = this.lerpColor(this.skyColors.day, this.skyColors.sunset, t);
        } else if (timeOfDay < 0.9) {
            const t = (timeOfDay - 0.8) / 0.1;
            baseColor = this.lerpColor(this.skyColors.sunset, this.skyColors.night, t);
        } else {
            baseColor = this.skyColors.night;
        }

        // Apply Age-Based Atmospheric Shift
        if (ageIndex === 1) { // Tribal Age - Warmer, golden hour atmosphere
            return this.lerpColor(baseColor, '#FFD700', 0.1);
        }
        return baseColor;
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r},${g},${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    setAmbientLight(value) {
        this.ambientLight = Math.max(0.2, Math.min(1, value));
    }

    render() {
        try {
            this.clear();

            const camera = this.game.camera;
            if (!camera) return;

            this.ctx.save(); // Safety save

            // Get visible chunks and sort blocks for rendering
            this.renderWorld();
            this.renderEntities();

            // Render wildlife (ambient creatures)
            if (this.game.wildlife) {
                this.game.wildlife.render(this.ctx, camera);
            }

            // Render throwable projectiles
            if (this.game.throwables) {
                this.game.throwables.render(this.ctx, camera);
            }

            // Render home beacon markers
            if (this.game.homeBeacons) {
                this.game.homeBeacons.render(this.ctx, camera);
            }

            // Render block breaking progress
            if (this.game.blockBreaking?.render) {
                this.game.blockBreaking.render(this.ctx, camera);
            }

            // Render block placement preview
            if (this.game.blockPreview?.render) {
                this.game.blockPreview.render(this.ctx, camera);
            }

            // Render grappling hook rope
            if (this.game.grappling?.render) {
                this.game.grappling.render(this.ctx, camera);
            }

            // Render fishing line
            if (this.game.fishing?.render) {
                this.game.fishing.render(this.ctx, camera);
            }

            // Particles
            this.renderParticles();

            // Render weather effects (rain, snow, etc.)
            if (this.game.weather) {
                this.game.weather.render(this.ctx, this.width, this.height);
            }

            // Highlight Block
            this.renderHighlight();

            // Attack Swipe
            this.renderAttackSwipe();

            // Cursor
            this.renderCursor();

            // Render minimap (UI overlay)
            if (this.game.minimap) {
                this.game.minimap.render(this.ctx);
            }

            // Render boss health bars
            if (this.game.bossHealthBar?.render) {
                this.game.bossHealthBar.render(this.ctx);
            }


            // Render bestiary overlay (when open)
            if (this.game.bestiary?.render) {
                this.game.bestiary.render(this.ctx);
            }

            // Render fishing minigame UI
            if (this.game.fishing?.isActive && this.game.fishing?.renderMinigame) {
                this.game.fishing.renderMinigame(this.ctx);
            }

            // Render potion brewing UI
            if (this.game.potions?.isBrewingUIOpen && this.game.potions?.render) {
                this.game.potions.render(this.ctx);
            }

            // Render death screen
            if (this.game.deathScreen?.render) {
                this.game.deathScreen.render(this.ctx);
            }

            // Render photo mode UI
            if (this.game.photoMode?.isActive && this.game.photoMode?.render) {
                this.game.photoMode.render(this.ctx);
            }

            // Render seasonal event banner
            if (this.game.seasonalEvents?.render) {
                this.game.seasonalEvents.render(this.ctx);
            }

            // Render dungeon portals
            if (this.game.dungeons?.render) {
                this.game.dungeons.render(this.ctx, this.game.camera);
            }

            // Render damage/hit flash overlays
            this.renderDamageOverlay();

            this.ctx.restore();
        } catch (e) {
            console.error('Render Error:', e);
            // Attempt to restore context to avoid permanent breakage
            this.ctx.restore();
        }
    }

    renderCursor() {
        if (!this.game.input?.mouse) return;
        const mouseX = this.game.input.mouse.x;
        const mouseY = this.game.input.mouse.y;

        // Don't render if mouse hasn't moved
        if (mouseX === 0 && mouseY === 0) return;

        // Draw a small crosshair at mouse position
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;

        const size = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(mouseX - size, mouseY);
        this.ctx.lineTo(mouseX + size, mouseY);
        this.ctx.moveTo(mouseX, mouseY - size);
        this.ctx.lineTo(mouseX, mouseY + size);
        this.ctx.stroke();
    }

    renderAttackSwipe() {
        const player = this.game.player;
        if (!player) return;

        const now = Date.now();
        const duration = 200; // ms
        const elapsed = now - player.lastAttackTime;

        if (elapsed < duration) {
            const progress = elapsed / duration;
            const screen = this.game.camera.worldToScreen(player.x, player.y, player.z + 1);

            this.ctx.save();
            this.ctx.translate(screen.x, screen.y);

            // Determine direction based on mouse? 
            // Player doesn't store facing angle explicitly yet, just moves.
            // Let's use mouse pos for angle.
            const mouse = this.game.input.mouse; // Screen coords
            const angle = Math.atan2(mouse.y - screen.y, mouse.x - screen.x);

            this.ctx.rotate(angle);

            // Draw Arc
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 40, -Math.PI / 4 + progress * Math.PI / 2, Math.PI / 4 + progress * Math.PI / 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
            this.ctx.lineWidth = 5;
            this.ctx.stroke();

            this.ctx.restore();
        }
    }

    // Damage overlay - red vignette when taking damage, yellow when dealing damage
    renderDamageOverlay() {
        // Update flash values (decay)
        if (this.damageFlash > 0) {
            this.damageFlash -= 0.05;
            if (this.damageFlash < 0) this.damageFlash = 0;
        }
        if (this.hitFlash > 0) {
            this.hitFlash -= 0.08;
            if (this.hitFlash < 0) this.hitFlash = 0;
        }

        // Draw damage received flash (red vignette)
        if (this.damageFlash > 0) {
            const gradient = this.ctx.createRadialGradient(
                this.width / 2, this.height / 2, this.width * 0.3,
                this.width / 2, this.height / 2, this.width * 0.8
            );
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(180, 0, 0, ${this.damageFlash * 0.5})`);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Draw hit dealt flash (brief yellow/white flash on edges)
        if (this.hitFlash > 0) {
            const gradient = this.ctx.createRadialGradient(
                this.width / 2, this.height / 2, this.width * 0.4,
                this.width / 2, this.height / 2, this.width * 0.7
            );
            gradient.addColorStop(0, 'rgba(255, 220, 100, 0)');
            gradient.addColorStop(1, `rgba(255, 200, 50, ${this.hitFlash * 0.25})`);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    // Called when player takes damage
    flashDamage(intensity = 0.7) {
        this.damageFlash = Math.min(1, intensity);
    }

    // Called when player deals damage
    flashHit(intensity = 0.5) {
        this.hitFlash = Math.min(1, intensity);
    }

    renderHighlight() {
        if (!this.game.player || !this.game.input?.mouse) return;

        const player = this.game.player;
        const mouseX = this.game.input.mouse.x;
        const mouseY = this.game.input.mouse.y;

        // Get player screen position
        const playerScreen = this.game.camera.worldToScreen(player.x, player.y, player.z);

        // Calculate direction from player to mouse on screen
        const dx = mouseX - playerScreen.x;
        const dy = mouseY - playerScreen.y;

        // Convert screen direction to isometric world direction
        const isoX = (dx / (CONFIG.TILE_WIDTH / 2) + dy / (CONFIG.TILE_HEIGHT / 2)) / 2;
        const isoY = (dy / (CONFIG.TILE_HEIGHT / 2) - dx / (CONFIG.TILE_WIDTH / 2)) / 2;

        // Normalize and scale to get target offset
        const mag = Math.sqrt(isoX * isoX + isoY * isoY);
        let targetOffsetX = 0, targetOffsetY = 0;
        if (mag > 0.5) {
            const scale = Math.min(3, mag) / mag;
            targetOffsetX = isoX * scale;
            targetOffsetY = isoY * scale;
        }

        const bx = Math.floor(player.x + targetOffsetX);
        const by = Math.floor(player.y + targetOffsetY);

        const playerZ = Math.floor(player.z);
        let bz = this.game.world.getHeight(bx, by);

        if (Math.abs(bz - playerZ) > 2) {
            for (let checkZ = playerZ; checkZ >= playerZ - 2; checkZ--) {
                const checkBlock = this.game.world.getBlock(bx, by, checkZ);
                if (checkBlock !== BLOCKS.AIR && checkBlock !== BLOCKS.WATER) {
                    bz = checkZ;
                    break;
                }
            }
        }

        // Check range
        const dist = Math.hypot(bx + 0.5 - player.x, by + 0.5 - player.y, bz - player.z);
        if (dist > player.interactionRange) return;

        // Only highlight if there's a mineable block
        const block = this.game.world.getBlock(bx, by, bz);
        if (block === BLOCKS.AIR || block === BLOCKS.BEDROCK) return;

        // Draw wireframe box around the target block
        const screen = this.game.camera.worldToScreen(bx + 0.5, by + 0.5, bz);
        const zoom = this.game.camera.zoom;
        const halfW = (CONFIG.TILE_WIDTH / 2) * zoom;
        const quartH = (CONFIG.TILE_HEIGHT / 2) * zoom;
        const depth = CONFIG.TILE_DEPTH * zoom;

        // Top face diamond
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        // Top point
        this.ctx.moveTo(screen.x, screen.y - depth - quartH);
        // Right point
        this.ctx.lineTo(screen.x + halfW, screen.y - depth);
        // Bottom point
        this.ctx.lineTo(screen.x, screen.y - depth + quartH);
        // Left point
        this.ctx.lineTo(screen.x - halfW, screen.y - depth);
        this.ctx.closePath();
        this.ctx.stroke();

        // Draw vertical lines for the cube outline
        this.ctx.beginPath();
        // Right edge
        this.ctx.moveTo(screen.x + halfW, screen.y - depth);
        this.ctx.lineTo(screen.x + halfW, screen.y);
        // Left edge
        this.ctx.moveTo(screen.x - halfW, screen.y - depth);
        this.ctx.lineTo(screen.x - halfW, screen.y);
        // Front edge
        this.ctx.moveTo(screen.x, screen.y - depth + quartH);
        this.ctx.lineTo(screen.x, screen.y + quartH);
        this.ctx.stroke();
    }

    renderWorld() {
        const cam = this.game.camera;
        const world = this.game.world;
        const player = this.game.player;

        // Determine render order: Z up, then Y up, then X?
        // Isometric painter's algorithm: draw furthest first.
        // Back to front.

        const chunks = cam.getVisibleChunks();

        // Collect visible blocks to sort?
        // Optimization: Loop x/y in correct order.
        // For standard iso: x=0,y=0 is top. x=max,y=max is bottom.
        // We want to draw low X, low Y first?
        // Wait, screen coords: 
        // x+y+ = down.
        // x-y- = up.
        // So simple loop order X then Y works if Z is handled.

        const renderDist = CONFIG.RENDER_DISTANCE * CONFIG.CHUNK_SIZE;
        const minX = Math.floor(cam.x - renderDist);
        const maxX = Math.floor(cam.x + renderDist);
        const minY = Math.floor(cam.y - renderDist);
        const maxY = Math.floor(cam.y + renderDist);

        // Render order:
        // We need X+Y to be increasing for painter's algo on ground.
        // And Z increasing.

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                // Calculate light for this column
                const dist = Math.hypot(x - player.x, y - player.y);
                let light = 1;

                // Day/Night cycle
                const time = world.timeOfDay;
                let ambient = 1;
                if (time < CONFIG.DAWN_START || time > CONFIG.DUSK_START) {
                    ambient = 0.2; // Night
                } else if (time < CONFIG.DAWN_START + 0.1) {
                    ambient = 0.2 + (time - CONFIG.DAWN_START) * 8; // Dawn
                } else if (time > CONFIG.DUSK_START - 0.1) {
                    ambient = 1 - (time - (CONFIG.DUSK_START - 0.1)) * 8; // Dusk
                }

                // Torch light (simple distance check from player)
                if (dist < 8) {
                    light = Math.max(ambient, 1 - (dist / 8));
                } else {
                    light = ambient;
                }

                // Iterate Z
                const isPlayerUnderRoof = world.getHeight(player.x, player.y) > player.z + 1.5;

                for (let z = 0; z < CONFIG.WORLD_HEIGHT; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block !== BLOCKS.AIR) {
                        // Roof Transparency: If player is under a roof, fade out blocks above them
                        let alpha = 1;
                        if (isPlayerUnderRoof && z > player.z + 1) {
                            // Check if block is roughly between camera and player
                            // Camera is at a higher Y (isometric view), so blocks at higher Y are "roof"
                            if (y >= player.y - 2) {
                                alpha = 0.2;
                            }
                        }

                        // Occlusion Culling: Only draw if visible
                        if (this.isBlockVisible(world, x, y, z)) {
                            this.drawBlock(x, y, z, block, light, alpha);
                        }
                    }
                }
            }
        }
    }

    isBlockVisible(world, x, y, z) {
        const top = world.getBlock(x, y, z + 1);
        // Translucent blocks like water (1) or air (0) should reveal neighbors
        const isTranslucent = (id) => {
            if (id === 0) return true;
            const data = BLOCK_DATA[id];
            return data && (data.transparent || data.opacity < 1);
        };

        if (isTranslucent(top)) return true;

        const south = world.getBlock(x, y + 1, z);
        if (isTranslucent(south)) return true;

        const east = world.getBlock(x + 1, y, z);
        if (isTranslucent(east)) return true;

        return false;
    }

    renderBlock(worldX, worldY, worldZ, blockType) {
        const camera = this.game.camera;
        const blockData = BLOCK_DATA[blockType];
        if (!blockData || blockData.transparent && blockType === BLOCKS.AIR) return;

        // Calculate light level
        const lightLevel = this.calculateLightLevel(worldX, worldY, worldZ);

        // Draw isometric cube
        this.drawBlock(worldX, worldY, worldZ, blockType, lightLevel);
    }

    drawBlock(x, y, z, block, light = 1, alpha = 1) {
        const ctx = this.ctx;
        const ageIndex = this.game.ageProgression?.currentAgeIndex || 0;
        
        const screen = this.game.camera.worldToScreen(x, y, z);

        // Sprite Dimensions
        const sprite = this.game.spriteManager.getBlockSprite(block);
        if (!sprite) return;

        const zoom = this.game.camera.zoom;
        const w = 64 * zoom; 
        const h = 96 * zoom; 

        const drawX = screen.x - (w / 2);
        const drawY = screen.y - (32 * zoom); 

        ctx.save();
        if (alpha < 1) ctx.globalAlpha = alpha;
        
        // Procedural Evolution Color Shift
        if (ageIndex > 0 && this.biomeColors[block]) {
            ctx.drawImage(sprite, drawX, drawY, w, h);
            
            // Apply Age-Based Tint (Shift towards more vibrant/saturated colors as civilization grows)
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.2 * Math.min(ageIndex, 2); // Cap effect
            ctx.fillStyle = ageIndex === 1 ? '#ffaa00' : '#00ffaa'; // Tribal = Warm/Golden, Bronze = Lush
            ctx.fillRect(drawX, drawY, w, h);
            ctx.restore();
        } else {
            ctx.drawImage(sprite, drawX, drawY, w, h);
        }

        // Apply Lighting (darkness mask)
        if (light < 1) {
            const shadow = this.game.spriteManager.shadowMask;
            if (shadow) {
                ctx.globalAlpha = 1 - light;
                ctx.drawImage(shadow, drawX, drawY, w, h);
            }
        }
        ctx.restore();
    }

    calculateLightLevel(x, y, z) {
        // Use the LightingSystem if available
        if (this.game.lighting) {
            return this.game.lighting.getLightLevel(x, y, z);
        }

        // Fallback to basic lighting
        let light = this.ambientLight;

        // Height bonus
        light += (z / CONFIG.WORLD_HEIGHT) * 0.2;

        // Check for nearby light sources
        for (const source of this.lightSources) {
            const dist = Math.sqrt(
                Math.pow(x - source.x, 2) +
                Math.pow(y - source.y, 2) +
                Math.pow(z - source.z, 2)
            );
            if (dist < source.radius) {
                light += source.intensity * (1 - dist / source.radius);
            }
        }

        return Math.min(1, Math.max(0.2, light));
    }

    renderEntities() {
        const camera = this.game.camera;
        const entities = this.game.entities || [];

        // Sort entities by depth
        const sortedEntities = [...entities].sort((a, b) => {
            return (a.x + a.y + a.z * 0.1) - (b.x + b.y + b.z * 0.1);
        });

        for (const entity of sortedEntities) {
            this.renderEntity(entity);
        }

        // Render player last (on top)
        if (this.game.player) {
            this.renderEntity(this.game.player);
        }
    }

    renderEntity(entity) {
        const camera = this.game.camera;
        const screen = camera.worldToScreen(entity.x, entity.y, entity.z);

        const size = (entity.size || 1) * 32 * camera.zoom;

        this.ctx.save();

        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(screen.x, screen.y + size * 0.3, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Damage flash effect
        if (entity.invincibleTime > 0) {
            this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.5;
        }

        // Check if this is the player and we have a sprite
        if (entity === this.game.player) {
            const playerSprite = this.game.spriteManager.getPlayerSprite('idle');
            if (playerSprite && playerSprite.complete && playerSprite.naturalWidth > 0) {
                // Calculate sprite dimensions maintaining aspect ratio
                const spriteHeight = size * 2.5;
                const aspectRatio = playerSprite.naturalWidth / playerSprite.naturalHeight;
                const spriteWidth = spriteHeight * aspectRatio;

                // Draw the player sprite centered above the position
                this.ctx.drawImage(
                    playerSprite,
                    screen.x - spriteWidth / 2,
                    screen.y - spriteHeight + size * 0.3,
                    spriteWidth,
                    spriteHeight
                );
            } else {
                // Fallback to emoji if sprite not loaded
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(entity.emoji || '🧍', screen.x, screen.y - size * 0.5);
            }
        } else {
            // Check if this is an enemy with a sprite
            const enemySpriteName = entity.stats?.sprite;
            const enemySprite = enemySpriteName ? this.game.spriteManager.getEnemySprite(enemySpriteName) : null;

            if (enemySprite && enemySprite.complete && enemySprite.naturalWidth > 0) {
                // Use the entity's size multiplier (default 1, SABER_CAT uses 2)
                const sizeMultiplier = entity.stats?.size || 1;
                const spriteHeight = size * 2.5 * sizeMultiplier;
                const aspectRatio = enemySprite.naturalWidth / enemySprite.naturalHeight;
                const spriteWidth = spriteHeight * aspectRatio;

                // Draw the enemy sprite centered above the position
                this.ctx.drawImage(
                    enemySprite,
                    screen.x - spriteWidth / 2,
                    screen.y - spriteHeight + size * 0.3,
                    spriteWidth,
                    spriteHeight
                );
            } else {
                // Draw entity emoji for non-player entities
                this.ctx.font = `${size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(entity.emoji || '📦', screen.x, screen.y - size * 0.5);
            }
        }

        // Health bar for entities
        if (entity.health !== undefined && entity.maxHealth && entity !== this.game.player) {
            const barWidth = size;
            const barHeight = 6;
            const healthPercent = entity.health / entity.maxHealth;

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(screen.x - barWidth / 2, screen.y - size - 10, barWidth, barHeight);

            this.ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
            this.ctx.fillRect(screen.x - barWidth / 2, screen.y - size - 10, barWidth * healthPercent, barHeight);
        }

        // Pet Inventory Indicator - show pack icon for tamed animals with storage
        if (entity.tamed && this.game.petInventory) {
            // Check if this pet has inventory initialized (simpler check)
            const hasStorage = this.game.petInventory.petInventories.has(entity.id);
            
            if (hasStorage) {
                // Draw pack indicator
                const indicatorSize = size * 0.4;
                const indicatorX = screen.x + size * 0.3;
                const indicatorY = screen.y - size * 0.8;
                
                // Pack background
                this.ctx.fillStyle = 'rgba(101, 67, 33, 0.9)'; // Brown pack color
                this.ctx.beginPath();
                this.ctx.roundRect(indicatorX - indicatorSize/2, indicatorY - indicatorSize/2, 
                                 indicatorSize, indicatorSize, indicatorSize * 0.2);
                this.ctx.fill();
                
                // Pack icon
                this.ctx.font = `${indicatorSize * 0.7}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#F4D03F';
                this.ctx.fillText('🎒', indicatorX, indicatorY);
                
                // Distance check for interaction hint
                const player = this.game.player;
                if (player) {
                    const dx = entity.x - player.x;
                    const dy = entity.y - player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= 5) { // Within interaction range
                        // Add pulsing effect
                        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
                        this.ctx.shadowColor = '#FFD700';
                        this.ctx.shadowBlur = 10 * pulse;
                        
                        // Show "P" key hint
                        this.ctx.font = `${size * 0.3}px Arial`;
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeText('[P]', indicatorX, indicatorY + indicatorSize * 0.8);
                        this.ctx.fillText('[P]', indicatorX, indicatorY + indicatorSize * 0.8);
                        
                        // Reset shadow
                        this.ctx.shadowBlur = 0;
                    }
                }
            }
        }

        this.ctx.restore();
    }

    renderParticles() {
        const camera = this.game.camera;
        const particles = this.game.particles?.particles || [];

        for (const particle of particles) {
            const screen = camera.worldToScreen(particle.x, particle.y, particle.z);

            this.ctx.globalAlpha = particle.alpha || 1;
            this.ctx.fillStyle = particle.color || '#ffffff';

            if (particle.emoji) {
                this.ctx.font = `${particle.size * camera.zoom}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(particle.emoji, screen.x, screen.y);
            } else if (particle.text) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life; // Fade
                this.ctx.font = `bold ${20 * camera.zoom}px Arial`; // Fixed size base
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText(particle.text, screen.x, screen.y - (1 - particle.life) * 50); // Floating up visual
                this.ctx.fillStyle = particle.color;
                this.ctx.fillText(particle.text, screen.x, screen.y - (1 - particle.life) * 50);
                this.ctx.restore();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(screen.x, screen.y, particle.size * camera.zoom, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.globalAlpha = 1;
    }

    renderMiningProgress() {
        const mining = this.game.mining;
        if (!mining || !mining.currentBlock) return;

        const camera = this.game.camera;
        const block = mining.currentBlock;
        const screen = camera.worldToScreen(block.x, block.y, block.z);

        const progress = mining.progress / mining.maxProgress;
        const w = CONFIG.TILE_WIDTH * camera.zoom;
        const h = CONFIG.TILE_HEIGHT * camera.zoom;

        // Draw crack overlay
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;

        const cracks = Math.floor(progress * 5);
        for (let i = 0; i < cracks; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const length = w * 0.3 * (0.5 + Math.random() * 0.5);

            this.ctx.beginPath();
            this.ctx.moveTo(screen.x, screen.y - h / 2);
            this.ctx.lineTo(
                screen.x + Math.cos(angle) * length,
                screen.y - h / 2 + Math.sin(angle) * length
            );
            this.ctx.stroke();
        }

        // Progress bar
        const barWidth = w * 0.8;
        const barHeight = 4;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(screen.x - barWidth / 2, screen.y - h - 10, barWidth, barHeight);

        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(screen.x - barWidth / 2, screen.y - h - 10, barWidth * progress, barHeight);
    }

    renderDarknessOverlay() {
        const timeOfDay = this.game.world?.timeOfDay || 0.5;

        // Calculate darkness based on time
        let darkness = 0;
        if (timeOfDay < CONFIG.DAWN_START || timeOfDay > 0.9) {
            darkness = 0.5;
        } else if (timeOfDay < 0.35) {
            darkness = 0.5 * (1 - (timeOfDay - CONFIG.DAWN_START) / 0.15);
        } else if (timeOfDay > CONFIG.DUSK_START) {
            darkness = 0.5 * ((timeOfDay - CONFIG.DUSK_START) / 0.2);
        }

        if (darkness > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 30, ${darkness})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Update ambient light
        this.setAmbientLight(1 - darkness);
    }

    // Debug rendering
    renderDebug() {
        const player = this.game.player;
        if (!player) return;

        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 4;

        const debugInfo = [
            `FPS: ${this.game.fps?.toFixed(0) || 0}`,
            `Player: ${player.x.toFixed(2)}, ${player.y.toFixed(2)}, ${player.z.toFixed(2)}`,
            `Cam: ${this.game.camera.x.toFixed(2)}, ${this.game.camera.y.toFixed(2)}`,
            `Grounded: ${player.grounded}`,
            `Chunk: ${Math.floor(player.x / CONFIG.CHUNK_SIZE)}, ${Math.floor(player.y / CONFIG.CHUNK_SIZE)}`,
            `Time: ${((this.game.world?.timeOfDay || 0) * 24).toFixed(1)}h`,
        ];

        debugInfo.forEach((text, i) => {
            this.ctx.fillText(text, 20, 200 + i * 25);
        });

        this.ctx.shadowBlur = 0;

        // Debug: Draw Player Screen Box
        const screen = this.game.camera.worldToScreen(player.x, player.y, player.z);
        // console.log(`Debug Box: ${screen.x}, ${screen.y}`);
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screen.x - 10, screen.y - 10, 20, 20);
    }
}
