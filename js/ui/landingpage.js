/**
 * Landing Page - Animated Story Intro
 * A pixelated animation explaining the game's prehistoric survival story
 */

export class LandingPage {
    constructor() {
        this.canvas = document.getElementById('story-canvas');
        this.ctx = this.canvas?.getContext('2d');
        this.textElement = document.getElementById('story-text');
        this.landingPage = document.getElementById('landing-page');
        this.skipBtn = document.getElementById('skip-intro');
        
        // If canvas doesn't exist, mark as completed (skip intro)
        if (!this.canvas || !this.ctx) {
            this.completed = true;
            return;
        }

        this.currentScene = 0;
        this.sceneProgress = 0;
        this.animationFrame = null;
        this.lastTime = 0;
        this.completed = false;

        // Story scenes with text and duration
        this.scenes = [
            {
                text: "300,000 years ago...",
                duration: 3000,
                draw: (progress) => this.drawScene1(progress)
            },
            {
                text: "The world was wild and untamed.",
                duration: 4000,
                draw: (progress) => this.drawScene2(progress)
            },
            {
                text: "Massive beasts roamed the frozen lands...",
                duration: 4000,
                draw: (progress) => this.drawScene3(progress)
            },
            {
                text: "And you... you are alone.",
                duration: 3000,
                draw: (progress) => this.drawScene4(progress)
            },
            {
                text: "Survive. Adapt. Thrive.",
                duration: 3000,
                draw: (progress) => this.drawScene5(progress)
            },
            {
                text: "This is your story.",
                duration: 3000,
                draw: (progress) => this.drawScene6(progress)
            },
            {
                text: "...",
                duration: 4000,
                draw: (progress) => this.drawEyesOpening(progress)
            }
        ];

        this.sceneStartTime = 0;
        this.onComplete = null;

        // Pixel art colors
        this.colors = {
            sky: '#1a2a3a',
            ground: '#4a3728',
            grass: '#3d5c3d',
            sun: '#f4a460',
            moon: '#e8e8d0',
            snow: '#e8e8e8',
            mountain: '#5a4a3a',
            tree: '#2d4a2d',
            water: '#3a5a7a',
            fire: '#ff6b35',
            player: '#c4a480',
            mammoth: '#8b7355'
        };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.skip());
        }

        // Also skip on click/tap anywhere
        this.canvas.addEventListener('click', () => this.skip());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.pixelSize = Math.max(4, Math.floor(this.canvas.width / 160));
    }

    start(onComplete) {
        this.onComplete = onComplete;
        this.currentScene = 0;
        this.sceneStartTime = performance.now();
        this.completed = false;
        this.landingPage.classList.remove('hidden');
        this.animate(performance.now());
    }

    skip() {
        if (this.completed) return;
        this.completed = true;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.fadeOut();
    }

    fadeOut() {
        this.landingPage.style.transition = 'opacity 0.5s ease';
        this.landingPage.style.opacity = '0';

        setTimeout(() => {
            this.landingPage.classList.add('hidden');
            this.landingPage.style.opacity = '1';
            if (this.onComplete) {
                this.onComplete();
            }
        }, 500);
    }

    animate(timestamp) {
        if (this.completed) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        const scene = this.scenes[this.currentScene];
        const sceneTime = timestamp - this.sceneStartTime;
        const progress = Math.min(1, sceneTime / scene.duration);

        // Clear canvas
        if (this.currentScene === this.scenes.length - 1) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#1a0f0a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw current scene
        scene.draw(progress);

        // Update text
        this.updateText(scene.text, progress);

        // Check if scene is complete
        if (progress >= 1) {
            this.currentScene++;
            this.sceneStartTime = timestamp;

            if (this.currentScene >= this.scenes.length) {
                this.completed = true;
                setTimeout(() => this.fadeOut(), 500);
                return;
            }
        }

        this.animationFrame = requestAnimationFrame((t) => this.animate(t));
    }

    updateText(text, progress) {
        // Fade in text at start of scene
        if (progress < 0.1) {
            this.textElement.classList.add('visible');
        }
        // Fade out near end
        if (progress > 0.9) {
            this.textElement.classList.remove('visible');
        }

        this.textElement.textContent = text;
    }

    // Helper: Draw a pixelated rectangle
    drawPixelRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        const px = this.pixelSize;
        const sx = Math.floor(x / px) * px;
        const sy = Math.floor(y / px) * px;
        const sw = Math.ceil(w / px) * px;
        const sh = Math.ceil(h / px) * px;
        this.ctx.fillRect(sx, sy, sw, sh);
    }

    // Helper: Draw pixelated circle
    drawPixelCircle(cx, cy, r, color) {
        this.ctx.fillStyle = color;
        const px = this.pixelSize;
        for (let x = cx - r; x <= cx + r; x += px) {
            for (let y = cy - r; y <= cy + r; y += px) {
                if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) {
                    this.ctx.fillRect(Math.floor(x / px) * px, Math.floor(y / px) * px, px, px);
                }
            }
        }
    }

    // Helper: Draw stars
    drawStars(count) {
        this.ctx.fillStyle = '#ffffff';
        const seed = 12345;
        for (let i = 0; i < count; i++) {
            const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * this.canvas.width;
            const y = ((seed * (i + 2) * 9301 + 49297) % 233280) / 233280 * this.canvas.height * 0.5;
            const twinkle = Math.sin(performance.now() * 0.003 + i) * 0.5 + 0.5;
            this.ctx.globalAlpha = twinkle;
            this.ctx.fillRect(Math.floor(x / this.pixelSize) * this.pixelSize,
                Math.floor(y / this.pixelSize) * this.pixelSize,
                this.pixelSize, this.pixelSize);
        }
        this.ctx.globalAlpha = 1;
    }

    // Scene 1: Dark sky with title appearing
    drawScene1(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const px = this.pixelSize;

        // Night sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#1a2a3a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Stars twinkling
        this.drawStars(50);

        // Moon rising
        const moonY = h * 0.3 - progress * h * 0.1;
        this.drawPixelCircle(w * 0.8, moonY, 40, this.colors.moon);
    }

    // Scene 2: Wild landscape
    drawScene2(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const px = this.pixelSize;

        // Dawn sky
        const skyProgress = progress;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h * 0.6);
        gradient.addColorStop(0, `rgb(${26 + skyProgress * 80}, ${42 + skyProgress * 60}, ${58 + skyProgress * 40})`);
        gradient.addColorStop(1, `rgb(${100 + skyProgress * 100}, ${80 + skyProgress * 80}, ${60 + skyProgress * 60})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Mountains
        for (let i = 0; i < 5; i++) {
            const mx = w * (i * 0.25 - 0.1);
            const mh = h * (0.3 + Math.random() * 0.2);
            this.drawMountain(mx, h * 0.6, w * 0.4, mh, '#3a3028');
        }

        // Ground
        this.drawPixelRect(0, h * 0.7, w, h * 0.3, this.colors.ground);

        // Grass patches
        for (let x = 0; x < w; x += px * 3) {
            if (Math.random() > 0.5) {
                this.drawPixelRect(x, h * 0.68, px, px * 3, this.colors.grass);
            }
        }
    }

    // Scene 3: Mammoth walking
    drawScene3(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const px = this.pixelSize;

        // Snowy sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#4a5a6a');
        gradient.addColorStop(1, '#8a9aaa');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Snow falling
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
            const x = ((i * 9301 + performance.now() * 0.05) % w);
            const y = ((i * 7919 + performance.now() * 0.1) % h);
            this.ctx.fillRect(Math.floor(x / px) * px, Math.floor(y / px) * px, px, px);
        }

        // Snowy ground
        this.drawPixelRect(0, h * 0.7, w, h * 0.3, this.colors.snow);

        // Mammoth walking across
        const mammothX = -100 + progress * (w + 200);
        this.drawMammoth(mammothX, h * 0.55);
    }

    // Scene 4: Lone player
    drawScene4(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const px = this.pixelSize;

        // Dusk sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#2a1a3a');
        gradient.addColorStop(0.5, '#5a3a4a');
        gradient.addColorStop(1, '#3a2a2a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Stars
        this.drawStars(30);

        // Ground
        this.drawPixelRect(0, h * 0.75, w, h * 0.25, this.colors.ground);

        // Player silhouette in center
        const playerX = w * 0.5;
        const playerY = h * 0.65;
        this.drawPlayer(playerX, playerY, progress);
    }

    // Scene 5: Fire and hope
    drawScene5(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const px = this.pixelSize;

        // Dark night
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, w, h);

        // Stars
        this.drawStars(40);

        // Ground
        this.drawPixelRect(0, h * 0.75, w, h * 0.25, '#2a1a15');

        // Campfire in center
        const fireX = w * 0.5;
        const fireY = h * 0.72;
        this.drawCampfire(fireX, fireY, progress);

        // Light glow from fire
        const glowRadius = 100 + Math.sin(performance.now() * 0.01) * 20;
        const glow = this.ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, glowRadius);
        glow.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
        glow.addColorStop(1, 'rgba(255, 107, 53, 0)');
        this.ctx.fillStyle = glow;
        this.ctx.fillRect(fireX - glowRadius, fireY - glowRadius, glowRadius * 2, glowRadius * 2);

        // Player sitting by fire
        this.drawPlayer(fireX - 60, h * 0.65, 1, true);
    }

    // Scene 6: Sunrise / New beginning
    drawScene6(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const px = this.pixelSize;

        // Sunrise gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, `rgb(${50 + progress * 150}, ${100 + progress * 100}, ${150 + progress * 50})`);
        gradient.addColorStop(0.5, `rgb(${200 + progress * 55}, ${150 + progress * 50}, ${100})`);
        gradient.addColorStop(1, `rgb(${150 + progress * 50}, ${100 + progress * 50}, ${80})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Sun rising
        const sunY = h * 0.6 - progress * h * 0.3;
        this.drawPixelCircle(w * 0.5, sunY, 50 + progress * 20, this.colors.sun);

        // Light rays
        this.ctx.globalAlpha = progress * 0.3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + performance.now() * 0.0005;
            this.ctx.strokeStyle = '#fff4e0';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(w * 0.5, sunY);
            this.ctx.lineTo(
                w * 0.5 + Math.cos(angle) * 200,
                sunY + Math.sin(angle) * 200
            );
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;

        // Ground
        this.drawPixelRect(0, h * 0.75, w, h * 0.25, this.colors.grass);

        // Player walking forward
        const playerX = w * 0.4 + progress * w * 0.2;
        this.drawPlayer(playerX, h * 0.65, progress);
    }

    // Helper: Draw mountain
    drawMountain(x, baseY, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, baseY);
        this.ctx.lineTo(x + width / 2, baseY - height);
        this.ctx.lineTo(x + width, baseY);
        this.ctx.closePath();
        this.ctx.fill();

        // Snow cap
        this.ctx.fillStyle = this.colors.snow;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.3, baseY - height * 0.7);
        this.ctx.lineTo(x + width / 2, baseY - height);
        this.ctx.lineTo(x + width * 0.7, baseY - height * 0.7);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // Helper: Draw mammoth
    drawMammoth(x, y) {
        const px = this.pixelSize;
        const color = this.colors.mammoth;

        // Body
        this.drawPixelRect(x, y, px * 12, px * 8, color);

        // Head
        this.drawPixelRect(x + px * 10, y - px * 2, px * 6, px * 6, color);

        // Trunk
        this.drawPixelRect(x + px * 14, y + px * 2, px * 2, px * 6, color);

        // Tusks
        this.ctx.fillStyle = '#f5f5dc';
        this.ctx.fillRect(x + px * 12, y + px * 2, px * 4, px * 1);

        // Legs
        this.drawPixelRect(x + px * 1, y + px * 8, px * 2, px * 4, color);
        this.drawPixelRect(x + px * 4, y + px * 8, px * 2, px * 4, color);
        this.drawPixelRect(x + px * 7, y + px * 8, px * 2, px * 4, color);
        this.drawPixelRect(x + px * 10, y + px * 8, px * 2, px * 4, color);

        // Fur texture
        this.ctx.fillStyle = '#7a6345';
        for (let i = 0; i < 5; i++) {
            this.ctx.fillRect(x + px * (2 + i * 2), y + px, px, px);
        }
    }

    // Helper: Draw player
    drawPlayer(x, y, progress, sitting = false) {
        const px = this.pixelSize;

        // Body
        this.ctx.fillStyle = this.colors.player;
        this.drawPixelRect(x - px * 2, y, px * 4, px * 6, this.colors.player);

        // Head
        this.drawPixelRect(x - px * 1.5, y - px * 3, px * 3, px * 3, '#d4b896');

        // Hair
        this.ctx.fillStyle = '#4a3a2a';
        this.drawPixelRect(x - px * 2, y - px * 4, px * 4, px * 2, '#4a3a2a');

        // Club/weapon
        if (!sitting) {
            this.ctx.fillStyle = '#6a4a2a';
            this.drawPixelRect(x + px * 2, y + px, px * 1, px * 4, '#6a4a2a');
        }

        // Legs
        if (!sitting) {
            const legOffset = Math.sin(progress * Math.PI * 4) * px;
            this.drawPixelRect(x - px * 1, y + px * 6, px * 1, px * 3, this.colors.player);
            this.drawPixelRect(x, y + px * 6, px * 1, px * 3, this.colors.player);
        }
    }

    // Helper: Draw campfire
    drawCampfire(x, y, progress) {
        const px = this.pixelSize;

        // Logs
        this.ctx.fillStyle = '#4a3a2a';
        this.drawPixelRect(x - px * 3, y, px * 6, px * 2, '#4a3a2a');
        this.drawPixelRect(x - px * 2, y - px, px * 4, px * 1, '#5a4a3a');

        // Flames (animated)
        const flameColors = ['#ff6b35', '#ff8c42', '#ffb347', '#ffd700'];
        for (let i = 0; i < 5; i++) {
            const flameHeight = px * (3 + Math.sin(performance.now() * 0.01 + i) * 2);
            const flameX = x - px * 2 + i * px;
            const color = flameColors[i % flameColors.length];
            this.drawPixelRect(flameX, y - flameHeight, px, flameHeight, color);
        }

        // Sparks
        this.ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 3; i++) {
            const sparkX = x + Math.sin(performance.now() * 0.005 + i * 2) * px * 3;
            const sparkY = y - px * 5 - ((performance.now() * 0.02 + i * 100) % 50);
            this.ctx.globalAlpha = 1 - ((performance.now() * 0.02 + i * 100) % 50) / 50;
            this.ctx.fillRect(Math.floor(sparkX / px) * px, Math.floor(sparkY / px) * px, px, px);
        }
        this.ctx.globalAlpha = 1;
    }

    // Final Scene: Opening eyes
    drawEyesOpening(progress) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Final state is the bright world revealed underneath via clearRect in animate()

        // Now draw eyelids (black bars that retreat)
        this.ctx.fillStyle = '#000000';

        // progress 0-0.3: Eyes closed (black)
        // progress 0.3-1.0: Eyes opening (bars moving)

        let openAmount = 0;
        if (progress > 0.3) {
            // Map 0.3-1.0 to 0.0-1.0
            openAmount = (progress - 0.3) / 0.7;
            // Add some "confusion" shake
            const shake = Math.sin(progress * 50) * 5 * (1 - openAmount);
            this.ctx.translate(shake, shake);
        }

        const eyelidHeight = (h / 2) * (1 - openAmount);

        // Top eyelid
        this.ctx.fillRect(0, 0, w, eyelidHeight);
        // Bottom eyelid
        this.ctx.fillRect(0, h - eyelidHeight, w, eyelidHeight);

        // Vignette effect to simulate blurry peripheral vision
        const grad = this.ctx.createRadialGradient(w / 2, h / 2, h / 4, w / 2, h / 2, h);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(0,0,0,${0.8 * (1 - openAmount)})`);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, w, h);

        if (progress > 0.3 && progress < 0.4) {
            this.textElement.textContent = "Where... am I?";
            this.textElement.classList.add('visible');
        } else if (progress > 0.6 && progress < 0.7) {
            this.textElement.textContent = "My body... it feels strange.";
            this.textElement.classList.add('visible');
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
