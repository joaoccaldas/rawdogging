export class Entity {
    constructor(game, x, y, z) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;

        this.width = 0.6;
        this.height = 0.6;
        this.depth = 1.8; // Height in Z

        this.onGround = false;
        this.isDead = false;

        this.emoji = '📦';
        this.size = 1;
    }

    update(deltaTime) {
        // Base update logic
    }

    render(renderer) {
        // Handled by renderer using public properties
    }
}
