// Simple Perlin Noise implementation with 2D and 3D support
export class Noise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.p = new Uint8Array(512);
        this.perm = new Uint8Array(512);
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        
        // Seed the permutation table
        const random = this.seededRandom(seed);
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(random() * 256);
        }
        
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }
    
    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    dot2(g, x, y) {
        return g[0]*x + g[1]*y;
    }
    
    dot3(g, x, y, z) {
        return g[0]*x + g[1]*y + g[2]*z;
    }
    
    mix(a, b, t) {
        return (1-t)*a + t*b;
    }
    
    fade(t) {
        return t*t*t*(t*(t*6-15)+10);
    }
    
    perlin2(x, y) {
        let X = Math.floor(x), Y = Math.floor(y);
        x = x - X; y = y - Y;
        X = X & 255; Y = Y & 255;
        
        const n00 = this.dot2(this.grad3[this.perm[X+this.perm[Y]] % 12], x, y);
        const n01 = this.dot2(this.grad3[this.perm[X+this.perm[Y+1]] % 12], x, y-1);
        const n10 = this.dot2(this.grad3[this.perm[X+1+this.perm[Y]] % 12], x-1, y);
        const n11 = this.dot2(this.grad3[this.perm[X+1+this.perm[Y+1]] % 12], x-1, y-1);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        return this.mix(
            this.mix(n00, n10, u),
            this.mix(n01, n11, u),
            v
        );
    }
    
    perlin3(x, y, z) {
        // Find unit cube containing point
        let X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        x = x - X; y = y - Y; z = z - Z;
        X = X & 255; Y = Y & 255; Z = Z & 255;
        
        // Hash coordinates of 8 cube corners
        const perm = this.perm;
        const grad3 = this.grad3;
        
        const gi000 = perm[X + perm[Y + perm[Z]]] % 12;
        const gi001 = perm[X + perm[Y + perm[Z + 1]]] % 12;
        const gi010 = perm[X + perm[Y + 1 + perm[Z]]] % 12;
        const gi011 = perm[X + perm[Y + 1 + perm[Z + 1]]] % 12;
        const gi100 = perm[X + 1 + perm[Y + perm[Z]]] % 12;
        const gi101 = perm[X + 1 + perm[Y + perm[Z + 1]]] % 12;
        const gi110 = perm[X + 1 + perm[Y + 1 + perm[Z]]] % 12;
        const gi111 = perm[X + 1 + perm[Y + 1 + perm[Z + 1]]] % 12;
        
        // Calculate noise contributions from each corner
        const n000 = this.dot3(grad3[gi000], x, y, z);
        const n100 = this.dot3(grad3[gi100], x - 1, y, z);
        const n010 = this.dot3(grad3[gi010], x, y - 1, z);
        const n110 = this.dot3(grad3[gi110], x - 1, y - 1, z);
        const n001 = this.dot3(grad3[gi001], x, y, z - 1);
        const n101 = this.dot3(grad3[gi101], x - 1, y, z - 1);
        const n011 = this.dot3(grad3[gi011], x, y - 1, z - 1);
        const n111 = this.dot3(grad3[gi111], x - 1, y - 1, z - 1);
        
        // Compute fade curves
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        // Interpolate
        const nx00 = this.mix(n000, n100, u);
        const nx01 = this.mix(n001, n101, u);
        const nx10 = this.mix(n010, n110, u);
        const nx11 = this.mix(n011, n111, u);
        
        const nxy0 = this.mix(nx00, nx10, v);
        const nxy1 = this.mix(nx01, nx11, v);
        
        return this.mix(nxy0, nxy1, w);
    }
}
