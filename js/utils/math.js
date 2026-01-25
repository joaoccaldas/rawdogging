// Simple Perlin Noise implementation
export class Noise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(512);
        this.perm = new Uint8Array(512);
        this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
                      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
                      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
        
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }
    
    dot(g, x, y) {
        return g[0]*x + g[1]*y;
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
        
        const n00 = this.dot(this.grad3[this.perm[X+this.perm[Y]] % 12], x, y);
        const n01 = this.dot(this.grad3[this.perm[X+this.perm[Y+1]] % 12], x, y-1);
        const n10 = this.dot(this.grad3[this.perm[X+1+this.perm[Y]] % 12], x-1, y);
        const n11 = this.dot(this.grad3[this.perm[X+1+this.perm[Y+1]] % 12], x-1, y-1);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        return this.mix(
            this.mix(n00, n10, u),
            this.mix(n01, n11, u),
            v
        );
    }
}
