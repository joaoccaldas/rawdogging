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
            const playerSprite = this.game.spriteManager.getPlayerSprite('caveman');
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

        // Draw Interaction Indicator (Range check)
        const mouseX = this.game.input.mouse.x;
        const mouseY = this.game.input.mouse.y;

        let inRange = false;
        // Check distance to targeted block or enemy using InteractionUtils
        const hit = InteractionUtils.getSelection(this.game, CONFIG.MINING_RANGE);
        if (hit) {
            inRange = true;
        }

        // Crosshair circle
        this.ctx.beginPath();
        this.ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2);
        this.ctx.strokeStyle = inRange ? 'rgba(74, 222, 128, 0.8)' : 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }