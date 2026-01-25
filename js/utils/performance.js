// Performance Optimization Utilities
// Provides object pooling, throttling, and other performance helpers

/**
 * Object Pool for reducing garbage collection
 */
export class ObjectPool {
    constructor(factory, initialSize = 100) {
        this.factory = factory;
        this.pool = [];
        this.active = new Set();
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }
    
    /**
     * Get an object from the pool
     * @returns {Object} Pooled object
     */
    get() {
        let obj;
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.factory();
        }
        this.active.add(obj);
        return obj;
    }
    
    /**
     * Return an object to the pool
     * @param {Object} obj - Object to return
     */
    release(obj) {
        if (this.active.has(obj)) {
            this.active.delete(obj);
            // Reset object if it has a reset method
            if (obj.reset) {
                obj.reset();
            }
            this.pool.push(obj);
        }
    }
    
    /**
     * Release all active objects
     */
    releaseAll() {
        for (const obj of this.active) {
            if (obj.reset) obj.reset();
            this.pool.push(obj);
        }
        this.active.clear();
    }
    
    /**
     * Get pool statistics
     */
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.active.size,
            total: this.pool.length + this.active.size
        };
    }
}

/**
 * Throttle function calls
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function calls
 */
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Simple Spatial Hash for entity lookups
 */
export class SpatialHash {
    constructor(cellSize = 16) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }
    
    _hash(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }
    
    insert(entity) {
        const key = this._hash(entity.x, entity.y);
        if (!this.cells.has(key)) {
            this.cells.set(key, new Set());
        }
        this.cells.get(key).add(entity);
        entity._spatialKey = key;
    }
    
    update(entity) {
        const newKey = this._hash(entity.x, entity.y);
        if (entity._spatialKey !== newKey) {
            this.remove(entity);
            this.insert(entity);
        }
    }
    
    remove(entity) {
        if (entity._spatialKey && this.cells.has(entity._spatialKey)) {
            this.cells.get(entity._spatialKey).delete(entity);
        }
    }
    
    clear() {
        this.cells.clear();
    }
    
    /**
     * Query entities in range
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} range - Search radius
     * @returns {Array} Entities in range
     */
    query(x, y, range) {
        const results = [];
        const cellRange = Math.ceil(range / this.cellSize);
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        
        for (let dx = -cellRange; dx <= cellRange; dx++) {
            for (let dy = -cellRange; dy <= cellRange; dy++) {
                const key = `${cx + dx},${cy + dy}`;
                const cell = this.cells.get(key);
                if (cell) {
                    for (const entity of cell) {
                        const dist = Math.sqrt((entity.x - x) ** 2 + (entity.y - y) ** 2);
                        if (dist <= range) {
                            results.push(entity);
                        }
                    }
                }
            }
        }
        
        return results;
    }
}

/**
 * Frame rate limiter / animator
 */
export class FrameLimiter {
    constructor(targetFPS = 60) {
        this.targetFPS = targetFPS;
        this.frameInterval = 1000 / targetFPS;
        this.lastFrame = 0;
        this.deltaTime = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        this.frameCount = 0;
    }
    
    shouldUpdate(timestamp) {
        const elapsed = timestamp - this.lastFrame;
        
        if (elapsed >= this.frameInterval) {
            this.deltaTime = Math.min(elapsed / 1000, 0.1); // Cap at 100ms
            this.lastFrame = timestamp - (elapsed % this.frameInterval);
            
            // FPS calculation
            this.frameCount++;
            if (timestamp - this.fpsUpdateTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.fpsUpdateTime = timestamp;
            }
            
            return true;
        }
        return false;
    }
    
    getFPS() {
        return this.fps;
    }
    
    getDeltaTime() {
        return this.deltaTime;
    }
}

/**
 * Chunk visibility culling helper
 */
export class ViewCuller {
    constructor(viewportWidth, viewportHeight, margin = 100) {
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.margin = margin;
    }
    
    resize(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }
    
    /**
     * Check if a world position is visible on screen
     */
    isVisible(screenX, screenY, objectWidth = 64, objectHeight = 64) {
        return (
            screenX + objectWidth > -this.margin &&
            screenX < this.viewportWidth + this.margin &&
            screenY + objectHeight > -this.margin &&
            screenY < this.viewportHeight + this.margin
        );
    }
    
    /**
     * Get visible bounds in world coordinates
     */
    getVisibleBounds(camera) {
        const topLeft = camera.screenToWorld(0, 0);
        const bottomRight = camera.screenToWorld(this.viewportWidth, this.viewportHeight);
        
        return {
            minX: topLeft.x - this.margin / 32,
            maxX: bottomRight.x + this.margin / 32,
            minY: topLeft.y - this.margin / 32,
            maxY: bottomRight.y + this.margin / 32
        };
    }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.history = {};
        this.historySize = 60; // Keep 60 frames of history
    }
    
    startMeasure(name) {
        if (!this.metrics[name]) {
            this.metrics[name] = { start: 0, total: 0, count: 0, avg: 0 };
            this.history[name] = [];
        }
        this.metrics[name].start = performance.now();
    }
    
    endMeasure(name) {
        if (this.metrics[name] && this.metrics[name].start > 0) {
            const duration = performance.now() - this.metrics[name].start;
            this.metrics[name].total += duration;
            this.metrics[name].count++;
            this.metrics[name].avg = this.metrics[name].total / this.metrics[name].count;
            
            // Add to history
            this.history[name].push(duration);
            if (this.history[name].length > this.historySize) {
                this.history[name].shift();
            }
            
            this.metrics[name].start = 0;
        }
    }
    
    getMetric(name) {
        return this.metrics[name] || null;
    }
    
    getAllMetrics() {
        const result = {};
        for (const [name, metric] of Object.entries(this.metrics)) {
            result[name] = {
                avg: metric.avg.toFixed(2),
                last: this.history[name]?.slice(-1)[0]?.toFixed(2) || 0,
                count: metric.count
            };
        }
        return result;
    }
    
    reset() {
        this.metrics = {};
        this.history = {};
    }
}

/**
 * Batch renderer helper - groups draw calls
 */
export class BatchRenderer {
    constructor(maxBatchSize = 1000) {
        this.maxBatchSize = maxBatchSize;
        this.batches = new Map();
    }
    
    /**
     * Add item to batch
     * @param {string} texture - Texture/sprite key
     * @param {Object} data - Draw data (x, y, width, height, etc.)
     */
    add(texture, data) {
        if (!this.batches.has(texture)) {
            this.batches.set(texture, []);
        }
        this.batches.get(texture).push(data);
    }
    
    /**
     * Flush all batches
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Function} drawFn - Function to draw each batch
     */
    flush(ctx, drawFn) {
        for (const [texture, items] of this.batches) {
            drawFn(ctx, texture, items);
        }
        this.clear();
    }
    
    clear() {
        this.batches.clear();
    }
}
