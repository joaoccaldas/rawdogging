// Screenshot & Photo Mode System
// Capture beautiful moments with filters and camera controls

export class PhotoModeSystem {
    constructor(game) {
        this.game = game;
        
        // Photo mode state
        this.isActive = false;
        this.isPaused = false;
        
        // Camera controls
        this.camera = {
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
            rotation: 0,
            fov: 1
        };
        
        // Filter settings
        this.filters = {
            none: { name: 'None', css: '' },
            vintage: { name: 'Vintage', css: 'sepia(0.4) contrast(1.1) brightness(1.1)' },
            noir: { name: 'Noir', css: 'grayscale(1) contrast(1.3)' },
            cold: { name: 'Cold', css: 'saturate(0.8) hue-rotate(180deg) brightness(1.1)' },
            warm: { name: 'Warm', css: 'saturate(1.3) sepia(0.2) brightness(1.05)' },
            dramatic: { name: 'Dramatic', css: 'contrast(1.4) saturate(1.2) brightness(0.9)' },
            dream: { name: 'Dream', css: 'blur(1px) brightness(1.2) saturate(1.3)' },
            pixel: { name: 'Pixel', css: 'contrast(1.5) saturate(0.8)' }, // Combined with pixelation
            sunset: { name: 'Sunset', css: 'sepia(0.3) saturate(1.5) hue-rotate(-10deg)' },
            midnight: { name: 'Midnight', css: 'brightness(0.7) saturate(0.6) hue-rotate(200deg)' }
        };
        
        this.currentFilter = 'none';
        
        // Frame options
        this.frames = {
            none: { name: 'None' },
            polaroid: { name: 'Polaroid', padding: 20, bottomPadding: 60 },
            cinematic: { name: 'Cinematic', bars: 0.1 },
            vignette: { name: 'Vignette', intensity: 0.5 },
            border: { name: 'Border', width: 5, color: '#FFF' }
        };
        
        this.currentFrame = 'none';
        
        // UI visibility toggles
        this.showUI = false;
        this.showPlayer = true;
        this.showEntities = true;
        this.showParticles = true;
        this.showWeather = true;
        
        // Time control (freeze time of day)
        this.frozenTime = null;
        
        // Screenshot gallery
        this.gallery = [];
        this.maxGallerySize = 50;
        
        // Controls help
        this.controls = [
            { key: 'WASD', action: 'Move Camera' },
            { key: 'Q/E', action: 'Zoom In/Out' },
            { key: 'R/F', action: 'Rotate' },
            { key: '1-9', action: 'Select Filter' },
            { key: 'Tab', action: 'Cycle Frame' },
            { key: 'H', action: 'Toggle HUD' },
            { key: 'P', action: 'Toggle Player' },
            { key: 'Space', action: 'Take Screenshot' },
            { key: 'Esc', action: 'Exit Photo Mode' }
        ];
    }
    
    // Enter photo mode
    enter() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.isPaused = true;
        
        // Store original camera state
        this.originalCamera = {
            x: this.game.camera?.x || 0,
            y: this.game.camera?.y || 0,
            zoom: this.game.camera?.zoom || 1
        };
        
        // Reset photo camera
        this.camera = {
            offsetX: 0,
            offsetY: 0,
            zoom: 1,
            rotation: 0,
            fov: 1
        };
        
        // Freeze game time
        this.frozenTime = this.game.world?.timeOfDay;
        
        // Hide game UI
        this.showUI = false;
        
        this.game.ui?.showNotification?.('📷 Photo Mode - Press H for controls', 'info');
    }
    
    // Exit photo mode
    exit() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.isPaused = false;
        
        // Restore camera
        if (this.game.camera && this.originalCamera) {
            this.game.camera.x = this.originalCamera.x;
            this.game.camera.y = this.originalCamera.y;
            this.game.camera.zoom = this.originalCamera.zoom;
        }
        
        // Unfreeze time
        this.frozenTime = null;
        
        // Reset filter
        this.currentFilter = 'none';
        this.applyFilter();
    }
    
    // Toggle photo mode
    toggle() {
        if (this.isActive) {
            this.exit();
        } else {
            this.enter();
        }
    }
    
    // Move camera
    moveCamera(dx, dy) {
        if (!this.isActive) return;
        
        this.camera.offsetX += dx * 5 / this.camera.zoom;
        this.camera.offsetY += dy * 5 / this.camera.zoom;
    }
    
    // Zoom camera
    zoom(delta) {
        if (!this.isActive) return;
        
        this.camera.zoom = Math.max(0.25, Math.min(4, this.camera.zoom + delta * 0.1));
    }
    
    // Rotate camera
    rotate(delta) {
        if (!this.isActive) return;
        
        this.camera.rotation += delta * 5;
        this.camera.rotation = ((this.camera.rotation % 360) + 360) % 360;
    }
    
    // Set filter
    setFilter(filterName) {
        if (!this.filters[filterName]) return;
        
        this.currentFilter = filterName;
        this.applyFilter();
    }
    
    // Cycle through filters
    cycleFilter(direction = 1) {
        const filterNames = Object.keys(this.filters);
        const currentIndex = filterNames.indexOf(this.currentFilter);
        const newIndex = (currentIndex + direction + filterNames.length) % filterNames.length;
        this.setFilter(filterNames[newIndex]);
    }
    
    // Apply CSS filter to canvas
    applyFilter() {
        const canvas = this.game.canvas || document.querySelector('canvas');
        if (!canvas) return;
        
        const filter = this.filters[this.currentFilter];
        canvas.style.filter = filter?.css || '';
    }
    
    // Set frame
    setFrame(frameName) {
        if (!this.frames[frameName]) return;
        this.currentFrame = frameName;
    }
    
    // Cycle through frames
    cycleFrame() {
        const frameNames = Object.keys(this.frames);
        const currentIndex = frameNames.indexOf(this.currentFrame);
        const newIndex = (currentIndex + 1) % frameNames.length;
        this.setFrame(frameNames[newIndex]);
    }
    
    // Take screenshot
    async takeScreenshot() {
        if (!this.isActive) return;
        
        const canvas = this.game.canvas || document.querySelector('canvas');
        if (!canvas) return;
        
        // Flash effect
        this.flashEffect();
        
        // Play shutter sound
        this.game.audio?.play('camera_shutter');
        
        try {
            // Create screenshot canvas with frame
            const screenshotCanvas = document.createElement('canvas');
            const ctx = screenshotCanvas.getContext('2d');
            
            const frame = this.frames[this.currentFrame];
            
            // Calculate dimensions based on frame
            let width = canvas.width;
            let height = canvas.height;
            let offsetX = 0;
            let offsetY = 0;
            
            if (frame.padding) {
                width = canvas.width + frame.padding * 2;
                height = canvas.height + frame.padding + (frame.bottomPadding || frame.padding);
                offsetX = frame.padding;
                offsetY = frame.padding;
            }
            
            screenshotCanvas.width = width;
            screenshotCanvas.height = height;
            
            // Draw frame background
            if (frame.padding) {
                ctx.fillStyle = '#FFF';
                ctx.fillRect(0, 0, width, height);
            }
            
            // Draw game canvas
            ctx.drawImage(canvas, offsetX, offsetY);
            
            // Apply frame effects
            if (frame.bars) {
                // Cinematic bars
                const barHeight = height * frame.bars;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, width, barHeight);
                ctx.fillRect(0, height - barHeight, width, barHeight);
            }
            
            if (frame.vignette) {
                // Vignette effect
                const gradient = ctx.createRadialGradient(
                    width / 2, height / 2, 0,
                    width / 2, height / 2, Math.max(width, height) / 2
                );
                gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, `rgba(0,0,0,${frame.intensity})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
            
            if (frame.width) {
                // Simple border
                ctx.strokeStyle = frame.color;
                ctx.lineWidth = frame.width;
                ctx.strokeRect(0, 0, width, height);
            }
            
            // Convert to data URL
            const dataUrl = screenshotCanvas.toDataURL('image/png');
            
            // Add to gallery
            const screenshot = {
                id: Date.now(),
                dataUrl: dataUrl,
                timestamp: new Date().toISOString(),
                filter: this.currentFilter,
                frame: this.currentFrame,
                location: this.getLocationName()
            };
            
            this.gallery.unshift(screenshot);
            
            // Trim gallery if too large
            if (this.gallery.length > this.maxGallerySize) {
                this.gallery.pop();
            }
            
            // Trigger download
            this.downloadScreenshot(dataUrl, screenshot.id);
            
            this.game.ui?.showNotification?.('📷 Screenshot saved!', 'success');
            
            return screenshot;
            
        } catch (error) {
            console.error('Screenshot failed:', error);
            this.game.ui?.showNotification?.('Screenshot failed!', 'error');
        }
    }
    
    // Download screenshot
    downloadScreenshot(dataUrl, id) {
        const link = document.createElement('a');
        link.download = `rawdog_screenshot_${id}.png`;
        link.href = dataUrl;
        link.click();
    }
    
    // Flash effect when taking photo
    flashEffect() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0.8;
            pointer-events: none;
            z-index: 9999;
            animation: photoFlash 0.3s ease-out forwards;
        `;
        
        // Add animation keyframes if not exists
        if (!document.getElementById('photoFlashStyle')) {
            const style = document.createElement('style');
            style.id = 'photoFlashStyle';
            style.textContent = `
                @keyframes photoFlash {
                    0% { opacity: 0.8; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }
    
    // Get current location name for screenshot metadata
    getLocationName() {
        const player = this.game.player;
        if (!player) return 'Unknown';
        
        const biome = this.game.world?.getBiomeAt?.(player.x, player.y) || 'unknown';
        return `${biome} (${Math.floor(player.x)}, ${Math.floor(player.y)})`;
    }
    
    // Handle input
    handleInput(key) {
        if (!this.isActive) return false;
        
        switch (key.toLowerCase()) {
            case 'w': this.moveCamera(0, -1); break;
            case 's': this.moveCamera(0, 1); break;
            case 'a': this.moveCamera(-1, 0); break;
            case 'd': this.moveCamera(1, 0); break;
            case 'q': this.zoom(1); break;
            case 'e': this.zoom(-1); break;
            case 'r': this.rotate(1); break;
            case 'f': this.rotate(-1); break;
            case 'h': this.showUI = !this.showUI; break;
            case 'p': this.showPlayer = !this.showPlayer; break;
            case 'tab': this.cycleFrame(); return true;
            case ' ': this.takeScreenshot(); return true;
            case 'escape': this.exit(); return true;
            case '1': this.setFilter('none'); break;
            case '2': this.setFilter('vintage'); break;
            case '3': this.setFilter('noir'); break;
            case '4': this.setFilter('cold'); break;
            case '5': this.setFilter('warm'); break;
            case '6': this.setFilter('dramatic'); break;
            case '7': this.setFilter('dream'); break;
            case '8': this.setFilter('sunset'); break;
            case '9': this.setFilter('midnight'); break;
            default: return false;
        }
        return true;
    }
    
    update(deltaTime) {
        if (!this.isActive) return;
        
        // Apply camera offset to game camera
        if (this.game.camera) {
            this.game.camera.photoModeOffset = {
                x: this.camera.offsetX,
                y: this.camera.offsetY
            };
            this.game.camera.zoom = this.camera.zoom;
        }
    }
    
    render(ctx) {
        if (!this.isActive) return;
        
        const canvas = ctx.canvas;
        
        // Apply rotation transform if needed
        if (this.camera.rotation !== 0) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(this.camera.rotation * Math.PI / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }
        
        // Render UI overlay
        if (this.showUI) {
            this.renderUI(ctx);
        } else {
            // Minimal indicator
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '16px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText('📷 Photo Mode (H for controls)', 10, 30);
        }
        
        if (this.camera.rotation !== 0) {
            ctx.restore();
        }
    }
    
    renderUI(ctx) {
        const canvas = ctx.canvas;
        
        ctx.save();
        
        // Semi-transparent panel on left
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 220, 350);
        
        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 18px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText('📷 PHOTO MODE', 20, 35);
        
        // Current settings
        ctx.font = '14px Courier New';
        ctx.fillStyle = '#AAA';
        
        let y = 60;
        ctx.fillText(`Filter: ${this.filters[this.currentFilter].name}`, 20, y);
        y += 20;
        ctx.fillText(`Frame: ${this.frames[this.currentFrame].name}`, 20, y);
        y += 20;
        ctx.fillText(`Zoom: ${this.camera.zoom.toFixed(1)}x`, 20, y);
        y += 20;
        ctx.fillText(`Rotation: ${this.camera.rotation.toFixed(0)}°`, 20, y);
        y += 30;
        
        // Controls
        ctx.fillStyle = '#6496FF';
        ctx.fillText('─── Controls ───', 20, y);
        y += 20;
        
        ctx.fillStyle = '#888';
        ctx.font = '12px Courier New';
        for (const control of this.controls) {
            ctx.fillText(`${control.key}: ${control.action}`, 20, y);
            y += 16;
        }
        
        // Filter preview strip at bottom
        const filterNames = Object.keys(this.filters);
        const stripY = canvas.height - 60;
        const stripWidth = 60;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, stripY - 10, canvas.width, 70);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('Filters (1-9)', canvas.width / 2, stripY);
        
        let filterX = (canvas.width - filterNames.length * stripWidth) / 2;
        for (let i = 0; i < Math.min(9, filterNames.length); i++) {
            const name = filterNames[i];
            const isSelected = this.currentFilter === name;
            
            ctx.fillStyle = isSelected ? '#6496FF' : '#444';
            ctx.fillRect(filterX, stripY + 10, stripWidth - 5, 30);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '10px Courier New';
            ctx.fillText(`${i + 1}`, filterX + stripWidth / 2 - 2, stripY + 22);
            ctx.fillText(this.filters[name].name.substring(0, 6), filterX + stripWidth / 2 - 2, stripY + 35);
            
            filterX += stripWidth;
        }
        
        ctx.restore();
    }
    
    // Serialize for saving
    serialize() {
        return {
            gallery: this.gallery.slice(0, 10) // Only save last 10 metadata (not images)
                .map(s => ({ ...s, dataUrl: null }))
        };
    }
    
    // Deserialize from save
    deserialize(data) {
        // Gallery isn't restored from save (images are downloaded)
    }
}
