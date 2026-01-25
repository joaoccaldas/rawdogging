// Rope & Grappling Hook System
// Advanced movement mechanics with ropes and grappling

export class GrapplingSystem {
    constructor(game) {
        this.game = game;
        
        // Grappling state
        this.isGrappling = false;
        this.grapplePoint = null;
        this.ropeLength = 0;
        this.maxRopeLength = 15;
        this.minRopeLength = 2;
        
        // Swing physics
        this.swingAngle = 0;
        this.swingVelocity = 0;
        this.swingDamping = 0.98;
        this.gravity = 0.5;
        
        // Rope segments for rendering
        this.ropeSegments = [];
        this.segmentCount = 20;
        
        // Equipment types
        this.equipment = {
            rope: {
                name: 'Rope',
                maxLength: 10,
                canGrapple: false,
                canClimb: true,
                durability: 50
            },
            grappling_hook: {
                name: 'Grappling Hook',
                maxLength: 15,
                canGrapple: true,
                canClimb: true,
                canSwing: true,
                durability: 100,
                launchSpeed: 20
            },
            upgraded_grapple: {
                name: 'Upgraded Grapple',
                maxLength: 25,
                canGrapple: true,
                canClimb: true,
                canSwing: true,
                canRetract: true,
                durability: 200,
                launchSpeed: 30
            }
        };
        
        // Current equipment
        this.currentEquipment = null;
        
        // Projectile state (for grapple launch)
        this.projectile = null;
        this.projectileSpeed = 20;
        
        // Placed ropes in world
        this.placedRopes = [];
        
        // Sound cooldowns
        this.soundCooldown = 0;
    }
    
    // Check if player has grappling equipment
    hasGrappleEquipment() {
        const inventory = this.game.inventory;
        if (!inventory) return false;
        
        for (const equipId of Object.keys(this.equipment)) {
            if (inventory.hasItem(equipId)) {
                return true;
            }
        }
        return false;
    }
    
    // Get best available equipment
    getBestEquipment() {
        const inventory = this.game.inventory;
        if (!inventory) return null;
        
        // Priority: upgraded > grappling_hook > rope
        if (inventory.hasItem('upgraded_grapple')) {
            return { ...this.equipment.upgraded_grapple, id: 'upgraded_grapple' };
        }
        if (inventory.hasItem('grappling_hook')) {
            return { ...this.equipment.grappling_hook, id: 'grappling_hook' };
        }
        if (inventory.hasItem('rope')) {
            return { ...this.equipment.rope, id: 'rope' };
        }
        return null;
    }
    
    // Launch grappling hook toward target
    launchGrapple(targetX, targetY, targetZ = null) {
        const player = this.game.player;
        if (!player || this.isGrappling || this.projectile) return false;
        
        this.currentEquipment = this.getBestEquipment();
        if (!this.currentEquipment || !this.currentEquipment.canGrapple) {
            this.game.ui?.showNotification?.('You need a grappling hook!', 'warning');
            return false;
        }
        
        // Calculate direction
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.currentEquipment.maxLength) {
            this.game.ui?.showNotification?.('Too far to grapple!', 'warning');
            return false;
        }
        
        // Launch projectile
        this.projectile = {
            x: player.x,
            y: player.y,
            z: player.z + 1.5,
            vx: (dx / distance) * this.currentEquipment.launchSpeed,
            vy: (dy / distance) * this.currentEquipment.launchSpeed,
            vz: 0,
            targetX: targetX,
            targetY: targetY,
            targetZ: targetZ ?? player.z + 2
        };
        
        // Play launch sound
        this.game.audio?.play('grapple_launch');
        
        return true;
    }
    
    // Attach grapple to point
    attachGrapple(x, y, z) {
        const player = this.game.player;
        if (!player) return false;
        
        // Check if valid attach point
        if (!this.isValidGrapplePoint(x, y, z)) {
            this.detach();
            return false;
        }
        
        this.grapplePoint = { x, y, z };
        this.isGrappling = true;
        this.projectile = null;
        
        // Calculate initial rope length and angle
        const dx = player.x - x;
        const dy = player.y - y;
        this.ropeLength = Math.sqrt(dx * dx + dy * dy);
        this.swingAngle = Math.atan2(dy, dx);
        this.swingVelocity = 0;
        
        // Initialize rope segments
        this.initRopeSegments();
        
        // Play attach sound
        this.game.audio?.play('grapple_attach');
        
        return true;
    }
    
    // Check if point is valid for grappling
    isValidGrapplePoint(x, y, z) {
        if (!this.game.world) return false;
        
        // Check for solid block
        const block = this.game.world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
        return block && block !== 'air' && block !== 'water';
    }
    
    // Detach grapple
    detach() {
        if (this.isGrappling) {
            this.game.audio?.play('grapple_detach');
        }
        
        this.isGrappling = false;
        this.grapplePoint = null;
        this.projectile = null;
        this.ropeSegments = [];
    }
    
    // Adjust rope length (climb up/down)
    adjustRopeLength(delta) {
        if (!this.isGrappling || !this.currentEquipment?.canClimb) return;
        
        this.ropeLength += delta;
        this.ropeLength = Math.max(this.minRopeLength, Math.min(this.currentEquipment.maxLength, this.ropeLength));
    }
    
    // Retract quickly (pull toward grapple point)
    retract() {
        if (!this.isGrappling || !this.currentEquipment?.canRetract) return;
        
        // Quick retraction
        this.ropeLength = Math.max(this.minRopeLength, this.ropeLength - 0.5);
    }
    
    // Apply swing input
    swing(direction) {
        if (!this.isGrappling || !this.currentEquipment?.canSwing) return;
        
        // Add angular velocity based on input
        this.swingVelocity += direction * 0.02;
    }
    
    // Initialize rope segment positions
    initRopeSegments() {
        const player = this.game.player;
        if (!player || !this.grapplePoint) return;
        
        this.ropeSegments = [];
        
        for (let i = 0; i <= this.segmentCount; i++) {
            const t = i / this.segmentCount;
            this.ropeSegments.push({
                x: this.grapplePoint.x + (player.x - this.grapplePoint.x) * t,
                y: this.grapplePoint.y + (player.y - this.grapplePoint.y) * t,
                z: this.grapplePoint.z + (player.z + 1 - this.grapplePoint.z) * t,
                vx: 0,
                vy: 0,
                vz: 0
            });
        }
    }
    
    // Place a climbable rope at position
    placeRope(x, y, z, length = 10) {
        const inventory = this.game.inventory;
        if (!inventory?.hasItem('rope')) {
            this.game.ui?.showNotification?.('You need rope to place!', 'warning');
            return false;
        }
        
        // Check for valid anchor point
        if (!this.isValidGrapplePoint(x, y, z)) {
            this.game.ui?.showNotification?.('Cannot place rope here!', 'warning');
            return false;
        }
        
        // Consume rope
        inventory.removeItem('rope', 1);
        
        // Add placed rope
        const rope = {
            id: `rope_${Date.now()}`,
            x: x,
            y: y,
            z: z,
            length: length
        };
        
        this.placedRopes.push(rope);
        
        this.game.audio?.play('rope_place');
        
        return true;
    }
    
    // Remove a placed rope
    removeRope(ropeId) {
        const index = this.placedRopes.findIndex(r => r.id === ropeId);
        if (index >= 0) {
            this.placedRopes.splice(index, 1);
            this.game.inventory?.addItem?.({ id: 'rope', amount: 1 });
            return true;
        }
        return false;
    }
    
    // Check if player can grab a placed rope
    canGrabPlacedRope() {
        const player = this.game.player;
        if (!player) return null;
        
        for (const rope of this.placedRopes) {
            const dx = player.x - rope.x;
            const dy = player.y - rope.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if close enough and at correct height
            if (distance < 1 && player.z >= rope.z - rope.length && player.z <= rope.z) {
                return rope;
            }
        }
        return null;
    }
    
    update(deltaTime) {
        // Update projectile
        if (this.projectile) {
            this.updateProjectile(deltaTime);
        }
        
        // Update grappling physics
        if (this.isGrappling) {
            this.updateSwing(deltaTime);
            this.updateRopeSegments(deltaTime);
        }
        
        // Sound cooldown
        if (this.soundCooldown > 0) {
            this.soundCooldown -= deltaTime;
        }
    }
    
    updateProjectile(deltaTime) {
        const p = this.projectile;
        
        // Move projectile
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.z += p.vz * deltaTime;
        
        // Check if reached target or hit something
        const player = this.game.player;
        if (!player) {
            this.projectile = null;
            return;
        }
        
        const dx = p.x - player.x;
        const dy = p.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if past max distance
        if (distance > this.currentEquipment.maxLength) {
            this.detach();
            return;
        }
        
        // Check collision with world
        const block = this.game.world?.getBlock(
            Math.floor(p.x),
            Math.floor(p.y),
            Math.floor(p.z)
        );
        
        if (block && block !== 'air' && block !== 'water') {
            // Hit something - try to attach
            this.attachGrapple(p.x, p.y, p.z);
        }
    }
    
    updateSwing(deltaTime) {
        const player = this.game.player;
        if (!player || !this.grapplePoint) return;
        
        // Apply gravity to swing
        const gravityForce = this.gravity * Math.cos(this.swingAngle);
        this.swingVelocity += gravityForce * deltaTime;
        
        // Apply damping
        this.swingVelocity *= this.swingDamping;
        
        // Update angle
        this.swingAngle += this.swingVelocity;
        
        // Calculate new player position on rope
        const newX = this.grapplePoint.x + Math.cos(this.swingAngle) * this.ropeLength;
        const newY = this.grapplePoint.y + Math.sin(this.swingAngle) * this.ropeLength;
        
        // Check for collision before moving
        if (!this.game.world?.isColliding?.(newX, newY, player.z)) {
            player.x = newX;
            player.y = newY;
            
            // Transfer some swing momentum to player velocity when detaching
            player.pendingVelocity = {
                x: -Math.sin(this.swingAngle) * this.swingVelocity * this.ropeLength * 0.5,
                y: Math.cos(this.swingAngle) * this.swingVelocity * this.ropeLength * 0.5
            };
        } else {
            // Hit something while swinging
            this.swingVelocity *= -0.5; // Bounce
            
            if (this.soundCooldown <= 0) {
                this.game.audio?.play('impact');
                this.soundCooldown = 0.2;
            }
        }
    }
    
    updateRopeSegments(deltaTime) {
        const player = this.game.player;
        if (!player || !this.grapplePoint || this.ropeSegments.length === 0) return;
        
        // Update segment positions with simple verlet physics
        // First segment is always at grapple point
        this.ropeSegments[0].x = this.grapplePoint.x;
        this.ropeSegments[0].y = this.grapplePoint.y;
        this.ropeSegments[0].z = this.grapplePoint.z;
        
        // Last segment is always at player
        const last = this.ropeSegments[this.ropeSegments.length - 1];
        last.x = player.x;
        last.y = player.y;
        last.z = player.z + 1;
        
        // Simple interpolation for middle segments with sag
        for (let i = 1; i < this.ropeSegments.length - 1; i++) {
            const t = i / (this.ropeSegments.length - 1);
            const seg = this.ropeSegments[i];
            
            // Linear interpolation
            seg.x = this.grapplePoint.x + (player.x - this.grapplePoint.x) * t;
            seg.y = this.grapplePoint.y + (player.y - this.grapplePoint.y) * t;
            seg.z = this.grapplePoint.z + (player.z + 1 - this.grapplePoint.z) * t;
            
            // Add sag (catenary-like curve)
            const sagAmount = Math.sin(t * Math.PI) * (this.ropeLength * 0.1);
            seg.z -= sagAmount;
        }
    }
    
    render(ctx) {
        const camera = this.game.camera;
        if (!camera) return;
        
        // Render projectile
        if (this.projectile) {
            this.renderProjectile(ctx, camera);
        }
        
        // Render grapple rope
        if (this.isGrappling && this.ropeSegments.length > 0) {
            this.renderRope(ctx, camera);
            this.renderGrapplePoint(ctx, camera);
        }
        
        // Render placed ropes
        this.renderPlacedRopes(ctx, camera);
    }
    
    renderProjectile(ctx, camera) {
        const screen = camera.worldToScreen(
            this.projectile.x,
            this.projectile.y,
            this.projectile.z
        );
        
        // Hook
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Line to player
        const player = this.game.player;
        if (player) {
            const playerScreen = camera.worldToScreen(player.x, player.y, player.z + 1.5);
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(playerScreen.x, playerScreen.y);
            ctx.lineTo(screen.x, screen.y);
            ctx.stroke();
        }
    }
    
    renderRope(ctx, camera) {
        if (this.ropeSegments.length < 2) return;
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        
        const first = camera.worldToScreen(
            this.ropeSegments[0].x,
            this.ropeSegments[0].y,
            this.ropeSegments[0].z
        );
        ctx.moveTo(first.x, first.y);
        
        for (let i = 1; i < this.ropeSegments.length; i++) {
            const seg = this.ropeSegments[i];
            const screen = camera.worldToScreen(seg.x, seg.y, seg.z);
            ctx.lineTo(screen.x, screen.y);
        }
        
        ctx.stroke();
        
        // Darker outline
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    renderGrapplePoint(ctx, camera) {
        if (!this.grapplePoint) return;
        
        const screen = camera.worldToScreen(
            this.grapplePoint.x,
            this.grapplePoint.y,
            this.grapplePoint.z
        );
        
        // Hook icon
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    renderPlacedRopes(ctx, camera) {
        for (const rope of this.placedRopes) {
            const topScreen = camera.worldToScreen(rope.x, rope.y, rope.z);
            const bottomScreen = camera.worldToScreen(rope.x, rope.y, rope.z - rope.length);
            
            // Rope line
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(topScreen.x, topScreen.y);
            ctx.lineTo(bottomScreen.x, bottomScreen.y);
            ctx.stroke();
            
            // Knots
            const knotCount = Math.floor(rope.length / 2);
            for (let i = 0; i <= knotCount; i++) {
                const t = i / knotCount;
                const knotZ = rope.z - rope.length * t;
                const knotScreen = camera.worldToScreen(rope.x, rope.y, knotZ);
                
                ctx.fillStyle = '#5D3A1A';
                ctx.beginPath();
                ctx.arc(knotScreen.x, knotScreen.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Serialize for saving
    serialize() {
        return {
            placedRopes: this.placedRopes
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        if (data?.placedRopes) {
            this.placedRopes = data.placedRopes;
        }
    }
}
