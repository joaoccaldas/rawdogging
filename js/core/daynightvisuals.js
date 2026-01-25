// Day/Night Visual System - Stars, moon phases, sky gradients
import { CONFIG } from '../config.js';

export const DAY_NIGHT_VISUAL_CONFIG = {
    // Time settings (0 = midnight, 0.5 = noon)
    DAWN_START: 0.2,
    DAWN_END: 0.3,
    DUSK_START: 0.7,
    DUSK_END: 0.8,
    
    // Sky colors at different times
    SKY_COLORS: {
        MIDNIGHT: { top: '#0a0a20', bottom: '#1a1a40' },
        DAWN: { top: '#2a1a40', bottom: '#ff6b35' },
        MORNING: { top: '#4a90cc', bottom: '#87ceeb' },
        NOON: { top: '#4169e1', bottom: '#87ceeb' },
        AFTERNOON: { top: '#5a8ac4', bottom: '#87ceeb' },
        DUSK: { top: '#4a2060', bottom: '#ff4500' },
        NIGHT: { top: '#0a0a20', bottom: '#1a1a40' }
    },
    
    // Stars
    STAR_COUNT: 200,
    STAR_TWINKLE_SPEED: 2,
    STAR_MIN_SIZE: 1,
    STAR_MAX_SIZE: 3,
    SHOOTING_STAR_CHANCE: 0.001, // per frame
    
    // Moon
    MOON_PHASES: 8, // New, Waxing Crescent, First Quarter, Waxing Gibbous, Full, Waning Gibbous, Third Quarter, Waning Crescent
    MOON_CYCLE_DAYS: 8, // Game days per lunar cycle
    MOON_SIZE: 40,
    MOON_GLOW_SIZE: 60,
    
    // Sun
    SUN_SIZE: 50,
    SUN_GLOW_SIZE: 80,
    SUN_RAYS: 12,
    
    // Clouds
    CLOUD_COUNT: 5,
    CLOUD_SPEED: 10, // pixels per second
    CLOUD_MIN_SIZE: 60,
    CLOUD_MAX_SIZE: 150,
    
    // Weather effects on sky
    RAIN_SKY_DARKEN: 0.3,
    STORM_SKY_DARKEN: 0.5,
    FOG_OPACITY: 0.4
};

class Star {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight * 0.6; // Upper 60% of screen
        this.size = DAY_NIGHT_VISUAL_CONFIG.STAR_MIN_SIZE + 
                   Math.random() * (DAY_NIGHT_VISUAL_CONFIG.STAR_MAX_SIZE - DAY_NIGHT_VISUAL_CONFIG.STAR_MIN_SIZE);
        this.brightness = Math.random();
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 1 + Math.random() * 2;
        this.color = this.randomStarColor();
    }
    
    randomStarColor() {
        const colors = ['#FFFFFF', '#FFFFEE', '#EEEEFF', '#FFEEDD', '#DDEEFF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(time) {
        this.brightness = 0.5 + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.5;
    }
    
    render(ctx, alpha) {
        if (alpha <= 0) return;
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.brightness * alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class ShootingStar {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight * 0.4;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        this.speed = 300 + Math.random() * 200;
        this.length = 50 + Math.random() * 50;
        this.alpha = 1;
        this.lifetime = 1 + Math.random() * 0.5;
        this.age = 0;
    }
    
    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.y += Math.sin(this.angle) * this.speed * deltaTime;
        this.age += deltaTime;
        this.alpha = 1 - (this.age / this.lifetime);
    }
    
    render(ctx) {
        if (this.alpha <= 0) return;
        
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        
        const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, `rgba(255, 255, 255, ${this.alpha})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
    
    isFinished() {
        return this.age >= this.lifetime;
    }
}

class Cloud {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = 50 + Math.random() * 100;
        this.width = DAY_NIGHT_VISUAL_CONFIG.CLOUD_MIN_SIZE + 
                    Math.random() * (DAY_NIGHT_VISUAL_CONFIG.CLOUD_MAX_SIZE - DAY_NIGHT_VISUAL_CONFIG.CLOUD_MIN_SIZE);
        this.height = this.width * 0.5;
        this.speed = DAY_NIGHT_VISUAL_CONFIG.CLOUD_SPEED * (0.5 + Math.random() * 0.5);
        this.opacity = 0.3 + Math.random() * 0.4;
        this.canvasWidth = canvasWidth;
        
        // Cloud shape (multiple circles)
        this.bubbles = [];
        const bubbleCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < bubbleCount; i++) {
            this.bubbles.push({
                offsetX: (i / bubbleCount - 0.5) * this.width * 0.8,
                offsetY: (Math.random() - 0.5) * this.height * 0.4,
                radius: this.height * 0.4 + Math.random() * this.height * 0.3
            });
        }
    }
    
    update(deltaTime) {
        this.x += this.speed * deltaTime;
        if (this.x > this.canvasWidth + this.width) {
            this.x = -this.width;
        }
    }
    
    render(ctx, tint = '#FFFFFF') {
        ctx.fillStyle = tint;
        ctx.globalAlpha = this.opacity;
        
        for (const bubble of this.bubbles) {
            ctx.beginPath();
            ctx.arc(
                this.x + bubble.offsetX,
                this.y + bubble.offsetY,
                bubble.radius,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
}

export class DayNightVisualSystem {
    constructor(game) {
        this.game = game;
        
        // Time (0-1, 0 = midnight, 0.5 = noon)
        this.timeOfDay = 0.5;
        this.dayCount = 0;
        this.timeSpeed = 1 / 600; // Full day in 600 seconds (10 minutes)
        
        // Celestial objects
        this.stars = [];
        this.shootingStars = [];
        this.clouds = [];
        
        // Moon phase (0-7)
        this.moonPhase = 0;
        
        // Animation time
        this.animationTime = 0;
        
        // Canvas dimensions (updated on resize)
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // Initialize
        this.initStars();
        this.initClouds();
    }
    
    initStars() {
        this.stars = [];
        for (let i = 0; i < DAY_NIGHT_VISUAL_CONFIG.STAR_COUNT; i++) {
            this.stars.push(new Star(this.canvasWidth, this.canvasHeight));
        }
    }
    
    initClouds() {
        this.clouds = [];
        for (let i = 0; i < DAY_NIGHT_VISUAL_CONFIG.CLOUD_COUNT; i++) {
            this.clouds.push(new Cloud(this.canvasWidth, this.canvasHeight));
        }
    }
    
    update(deltaTime) {
        this.animationTime += deltaTime;
        
        // Update time of day
        const previousTime = this.timeOfDay;
        this.timeOfDay += this.timeSpeed * deltaTime;
        
        if (this.timeOfDay >= 1) {
            this.timeOfDay -= 1;
            this.dayCount++;
            this.moonPhase = this.dayCount % DAY_NIGHT_VISUAL_CONFIG.MOON_CYCLE_DAYS;
        }
        
        // Update stars
        for (const star of this.stars) {
            star.update(this.animationTime);
        }
        
        // Random shooting stars at night
        if (this.isNight() && Math.random() < DAY_NIGHT_VISUAL_CONFIG.SHOOTING_STAR_CHANCE) {
            this.shootingStars.push(new ShootingStar(this.canvasWidth, this.canvasHeight));
        }
        
        // Update shooting stars
        for (const star of this.shootingStars) {
            star.update(deltaTime);
        }
        this.shootingStars = this.shootingStars.filter(s => !s.isFinished());
        
        // Update clouds
        for (const cloud of this.clouds) {
            cloud.update(deltaTime);
        }
    }
    
    // Check time periods
    isDay() {
        return this.timeOfDay >= DAY_NIGHT_VISUAL_CONFIG.DAWN_END && 
               this.timeOfDay < DAY_NIGHT_VISUAL_CONFIG.DUSK_START;
    }
    
    isNight() {
        return this.timeOfDay < DAY_NIGHT_VISUAL_CONFIG.DAWN_START || 
               this.timeOfDay >= DAY_NIGHT_VISUAL_CONFIG.DUSK_END;
    }
    
    isDawn() {
        return this.timeOfDay >= DAY_NIGHT_VISUAL_CONFIG.DAWN_START && 
               this.timeOfDay < DAY_NIGHT_VISUAL_CONFIG.DAWN_END;
    }
    
    isDusk() {
        return this.timeOfDay >= DAY_NIGHT_VISUAL_CONFIG.DUSK_START && 
               this.timeOfDay < DAY_NIGHT_VISUAL_CONFIG.DUSK_END;
    }
    
    // Get current sky colors
    getSkyColors() {
        const config = DAY_NIGHT_VISUAL_CONFIG;
        
        if (this.timeOfDay < config.DAWN_START) {
            return config.SKY_COLORS.MIDNIGHT;
        } else if (this.timeOfDay < config.DAWN_END) {
            // Interpolate midnight -> dawn
            const t = (this.timeOfDay - config.DAWN_START) / (config.DAWN_END - config.DAWN_START);
            return this.interpolateColors(config.SKY_COLORS.MIDNIGHT, config.SKY_COLORS.DAWN, t);
        } else if (this.timeOfDay < 0.4) {
            // Dawn -> Morning
            const t = (this.timeOfDay - config.DAWN_END) / (0.4 - config.DAWN_END);
            return this.interpolateColors(config.SKY_COLORS.DAWN, config.SKY_COLORS.MORNING, t);
        } else if (this.timeOfDay < 0.5) {
            // Morning -> Noon
            const t = (this.timeOfDay - 0.4) / 0.1;
            return this.interpolateColors(config.SKY_COLORS.MORNING, config.SKY_COLORS.NOON, t);
        } else if (this.timeOfDay < 0.6) {
            // Noon -> Afternoon
            const t = (this.timeOfDay - 0.5) / 0.1;
            return this.interpolateColors(config.SKY_COLORS.NOON, config.SKY_COLORS.AFTERNOON, t);
        } else if (this.timeOfDay < config.DUSK_START) {
            return config.SKY_COLORS.AFTERNOON;
        } else if (this.timeOfDay < config.DUSK_END) {
            // Afternoon -> Dusk
            const t = (this.timeOfDay - config.DUSK_START) / (config.DUSK_END - config.DUSK_START);
            return this.interpolateColors(config.SKY_COLORS.AFTERNOON, config.SKY_COLORS.DUSK, t);
        } else if (this.timeOfDay < 0.9) {
            // Dusk -> Night
            const t = (this.timeOfDay - config.DUSK_END) / (0.9 - config.DUSK_END);
            return this.interpolateColors(config.SKY_COLORS.DUSK, config.SKY_COLORS.NIGHT, t);
        } else {
            return config.SKY_COLORS.NIGHT;
        }
    }
    
    // Interpolate between two color sets
    interpolateColors(from, to, t) {
        const parseColor = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
        };
        
        const toHex = (c) => {
            const r = Math.round(c.r).toString(16).padStart(2, '0');
            const g = Math.round(c.g).toString(16).padStart(2, '0');
            const b = Math.round(c.b).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        };
        
        const lerp = (a, b, t) => a + (b - a) * t;
        
        const fromTop = parseColor(from.top);
        const toTop = parseColor(to.top);
        const fromBottom = parseColor(from.bottom);
        const toBottom = parseColor(to.bottom);
        
        return {
            top: toHex({
                r: lerp(fromTop.r, toTop.r, t),
                g: lerp(fromTop.g, toTop.g, t),
                b: lerp(fromTop.b, toTop.b, t)
            }),
            bottom: toHex({
                r: lerp(fromBottom.r, toBottom.r, t),
                g: lerp(fromBottom.g, toBottom.g, t),
                b: lerp(fromBottom.b, toBottom.b, t)
            })
        };
    }
    
    // Get sun/moon position (0-1 across sky)
    getCelestialPosition() {
        // Sun rises at dawn, sets at dusk
        // Moon rises at dusk, sets at dawn
        
        if (this.isDay() || this.isDawn() || this.isDusk()) {
            // Sun position
            const dayStart = DAY_NIGHT_VISUAL_CONFIG.DAWN_START;
            const dayEnd = DAY_NIGHT_VISUAL_CONFIG.DUSK_END;
            return (this.timeOfDay - dayStart) / (dayEnd - dayStart);
        } else {
            // Moon position
            let nightTime = this.timeOfDay;
            if (nightTime >= DAY_NIGHT_VISUAL_CONFIG.DUSK_END) {
                nightTime -= DAY_NIGHT_VISUAL_CONFIG.DUSK_END;
            } else {
                nightTime += (1 - DAY_NIGHT_VISUAL_CONFIG.DUSK_END);
            }
            const nightDuration = DAY_NIGHT_VISUAL_CONFIG.DAWN_START + (1 - DAY_NIGHT_VISUAL_CONFIG.DUSK_END);
            return nightTime / nightDuration;
        }
    }
    
    // Render the sky
    render(ctx) {
        this.canvasWidth = ctx.canvas.width;
        this.canvasHeight = ctx.canvas.height;
        
        // Draw sky gradient
        const colors = this.getSkyColors();
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(1, colors.bottom);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Weather effects
        this.applyWeatherEffects(ctx);
        
        // Draw stars (only at night/dusk/dawn)
        const starAlpha = this.getStarAlpha();
        if (starAlpha > 0) {
            for (const star of this.stars) {
                star.render(ctx, starAlpha);
            }
            
            // Shooting stars
            for (const star of this.shootingStars) {
                star.render(ctx);
            }
        }
        
        // Draw celestial body (sun or moon)
        const celestialPos = this.getCelestialPosition();
        const celestialX = celestialPos * this.canvasWidth;
        const celestialY = this.canvasHeight * 0.1 + 
                          Math.sin(celestialPos * Math.PI) * this.canvasHeight * 0.3;
        
        if (this.isNight()) {
            this.renderMoon(ctx, celestialX, celestialY);
        } else {
            this.renderSun(ctx, celestialX, celestialY);
        }
        
        // Draw clouds
        const cloudTint = this.isNight() ? '#333355' : 
                         (this.isDusk() || this.isDawn()) ? '#ffccaa' : '#FFFFFF';
        for (const cloud of this.clouds) {
            cloud.render(ctx, cloudTint);
        }
    }
    
    // Get star visibility (0-1)
    getStarAlpha() {
        const config = DAY_NIGHT_VISUAL_CONFIG;
        
        if (this.timeOfDay < config.DAWN_START || this.timeOfDay >= config.DUSK_END) {
            return 1; // Full night
        } else if (this.timeOfDay < config.DAWN_END) {
            // Fading out at dawn
            return 1 - (this.timeOfDay - config.DAWN_START) / (config.DAWN_END - config.DAWN_START);
        } else if (this.timeOfDay >= config.DUSK_START) {
            // Fading in at dusk
            return (this.timeOfDay - config.DUSK_START) / (config.DUSK_END - config.DUSK_START);
        }
        return 0; // Day
    }
    
    // Render the sun
    renderSun(ctx, x, y) {
        const size = DAY_NIGHT_VISUAL_CONFIG.SUN_SIZE;
        const glowSize = DAY_NIGHT_VISUAL_CONFIG.SUN_GLOW_SIZE;
        
        // Glow
        const glow = ctx.createRadialGradient(x, y, size * 0.5, x, y, glowSize);
        glow.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        glow.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
        glow.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Sun rays
        const rayCount = DAY_NIGHT_VISUAL_CONFIG.SUN_RAYS;
        ctx.strokeStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + this.animationTime * 0.1;
            const rayLength = glowSize * (1 + Math.sin(this.animationTime * 2 + i) * 0.2);
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            ctx.lineTo(x + Math.cos(angle) * rayLength, y + Math.sin(angle) * rayLength);
            ctx.stroke();
        }
        
        // Sun body
        const sunGradient = ctx.createRadialGradient(x - size * 0.2, y - size * 0.2, 0, x, y, size);
        sunGradient.addColorStop(0, '#FFFFEE');
        sunGradient.addColorStop(0.5, '#FFEE44');
        sunGradient.addColorStop(1, '#FFAA00');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Render the moon with phase
    renderMoon(ctx, x, y) {
        const size = DAY_NIGHT_VISUAL_CONFIG.MOON_SIZE;
        const glowSize = DAY_NIGHT_VISUAL_CONFIG.MOON_GLOW_SIZE;
        
        // Moon glow
        const glow = ctx.createRadialGradient(x, y, size * 0.5, x, y, glowSize);
        glow.addColorStop(0, 'rgba(200, 200, 255, 0.5)');
        glow.addColorStop(0.5, 'rgba(150, 150, 200, 0.2)');
        glow.addColorStop(1, 'rgba(100, 100, 150, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon body
        ctx.fillStyle = '#EEEEFF';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Moon phase shadow
        const phase = this.moonPhase / DAY_NIGHT_VISUAL_CONFIG.MOON_PHASES;
        ctx.fillStyle = '#1a1a40';
        
        if (phase < 0.5) {
            // Waxing (shadow on left)
            const shadowWidth = (0.5 - phase) * 2 * size;
            ctx.beginPath();
            ctx.ellipse(x - shadowWidth * 0.3, y, shadowWidth, size, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (phase > 0.5) {
            // Waning (shadow on right)
            const shadowWidth = (phase - 0.5) * 2 * size;
            ctx.beginPath();
            ctx.ellipse(x + shadowWidth * 0.3, y, shadowWidth, size, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // phase == 0.5 is full moon, no shadow
        
        // Moon craters
        ctx.fillStyle = 'rgba(200, 200, 220, 0.5)';
        const craters = [
            { x: -0.3, y: -0.2, r: 0.15 },
            { x: 0.2, y: 0.3, r: 0.1 },
            { x: 0.1, y: -0.3, r: 0.08 },
            { x: -0.1, y: 0.2, r: 0.12 }
        ];
        for (const crater of craters) {
            ctx.beginPath();
            ctx.arc(x + crater.x * size, y + crater.y * size, crater.r * size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Apply weather effects to sky
    applyWeatherEffects(ctx) {
        const weather = this.game.weather;
        if (!weather) return;
        
        const weatherType = weather.currentWeather || 'clear';
        
        switch (weatherType) {
            case 'rain':
            case 'heavy_rain':
                ctx.fillStyle = `rgba(50, 50, 70, ${DAY_NIGHT_VISUAL_CONFIG.RAIN_SKY_DARKEN})`;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                break;
                
            case 'storm':
            case 'thunderstorm':
                ctx.fillStyle = `rgba(30, 30, 50, ${DAY_NIGHT_VISUAL_CONFIG.STORM_SKY_DARKEN})`;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                break;
                
            case 'fog':
                ctx.fillStyle = `rgba(180, 180, 180, ${DAY_NIGHT_VISUAL_CONFIG.FOG_OPACITY})`;
                ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
                break;
        }
    }
    
    // Set time manually
    setTime(time) {
        this.timeOfDay = Math.max(0, Math.min(1, time));
    }
    
    // Set time speed
    setTimeSpeed(speed) {
        this.timeSpeed = speed;
    }
    
    // Get formatted time string
    getTimeString() {
        const hours = Math.floor(this.timeOfDay * 24);
        const minutes = Math.floor((this.timeOfDay * 24 - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Get moon phase name
    getMoonPhaseName() {
        const phases = [
            'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
            'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'
        ];
        return phases[this.moonPhase];
    }
    
    // Get ambient light level (for other systems)
    getAmbientLight() {
        if (this.isNight()) return 0.2;
        if (this.isDawn() || this.isDusk()) return 0.5;
        return 1.0;
    }
    
    // Serialize
    serialize() {
        return {
            timeOfDay: this.timeOfDay,
            dayCount: this.dayCount,
            moonPhase: this.moonPhase,
            timeSpeed: this.timeSpeed
        };
    }
    
    deserialize(data) {
        if (data) {
            this.timeOfDay = data.timeOfDay ?? 0.5;
            this.dayCount = data.dayCount ?? 0;
            this.moonPhase = data.moonPhase ?? 0;
            this.timeSpeed = data.timeSpeed ?? (1 / 600);
        }
    }
    
    reset() {
        this.timeOfDay = 0.5;
        this.dayCount = 0;
        this.moonPhase = 0;
        this.shootingStars = [];
        this.initStars();
        this.initClouds();
    }
}
