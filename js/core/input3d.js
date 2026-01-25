/**
 * 3D Input Manager
 * Handles keyboard and mouse input for 3D gameplay
 * WASD movement relative to camera direction
 */

import { CONFIG } from '../config.js';

export class Input3D {
    constructor(game) {
        this.game = game;
        
        // Key states
        this.keys = {};
        
        // Mouse state
        this.mouse = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            leftDown: false,
            rightDown: false,
            middleDown: false
        };
        
        // Action states
        this.actions = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            crouch: false,
            mine: false,
            use: false,
            attack: false,
            inventory: false,
            dash: false
        };
        
        // Mobile support
        this.mobileEnabled = false;
        this.joystick = { active: false, x: 0, y: 0 };
        this.touchButtons = {};
        
        // Sensitivity
        this.autoSprintThreshold = 0.9;
        
        this.init();
    }
    
    init() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Mobile detection
        this.detectMobile();
        
        if (this.mobileEnabled) {
            this.initMobileControls();
        }
        
        console.log('Input3D: Initialized');
    }
    
    detectMobile() {
        this.mobileEnabled = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (window.innerWidth <= 1024 && 'ontouchstart' in window);
            
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = this.mobileEnabled ? 'flex' : 'none';
        }
    }
    
    initMobileControls() {
        // Virtual joystick for movement
        const joystickBase = document.getElementById('joystick-base');
        const joystickStick = document.getElementById('joystick-stick');
        
        if (joystickBase && joystickStick) {
            this.setupJoystick(joystickBase, joystickStick);
        }
        
        // Action buttons
        this.setupMobileButton('btn-mine', 
            () => this.actions.mine = true,
            () => this.actions.mine = false
        );
        
        this.setupMobileButton('btn-use',
            () => this.actions.use = true,
            () => this.actions.use = false
        );
        
        this.setupMobileButton('btn-jump',
            () => this.actions.jump = true,
            () => this.actions.jump = false
        );
        
        this.setupMobileButton('btn-attack',
            () => this.actions.attack = true,
            () => this.actions.attack = false
        );
        
        this.setupMobileButton('btn-inventory',
            () => this.game.ui?.toggleInventory(),
            () => {}
        );
    }
    
    setupJoystick(base, stick) {
        let origin = { x: 0, y: 0 };
        const maxDist = 40;
        
        const onStart = (e) => {
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const rect = base.getBoundingClientRect();
            origin = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.joystick.active = true;
            base.classList.add('active');
        };
        
        const onMove = (e) => {
            if (!this.joystick.active) return;
            e.preventDefault();
            
            const touch = e.touches ? e.touches[0] : e;
            let dx = touch.clientX - origin.x;
            let dy = touch.clientY - origin.y;
            
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }
            
            stick.style.transform = `translate(${dx}px, ${dy}px)`;
            
            this.joystick.x = dx / maxDist;
            this.joystick.y = dy / maxDist;
        };
        
        const onEnd = () => {
            this.joystick.active = false;
            this.joystick.x = 0;
            this.joystick.y = 0;
            stick.style.transform = 'translate(0, 0)';
            base.classList.remove('active');
        };
        
        base.addEventListener('touchstart', onStart, { passive: false });
        base.addEventListener('mousedown', onStart);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchend', onEnd);
        window.addEventListener('mouseup', onEnd);
    }
    
    setupMobileButton(id, onDown, onUp) {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('active');
            onDown();
        }, { passive: false });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
            onUp();
        }, { passive: false });
        
        // Mouse fallback for testing
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btn.classList.add('active');
            onDown();
        });
        
        btn.addEventListener('mouseup', (e) => {
            btn.classList.remove('active');
            onUp();
        });
        
        btn.addEventListener('mouseleave', (e) => {
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                onUp();
            }
        });
    }
    
    onKeyDown(e) {
        this.keys[e.code] = true;
        
        // Prevent default for game keys
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Tab', 'KeyE'].includes(e.code)) {
            e.preventDefault();
        }
        
        switch (e.code) {
            case 'KeyW':
                this.actions.forward = true;
                break;
            case 'KeyS':
                this.actions.backward = true;
                break;
            case 'KeyA':
                this.actions.left = true;
                break;
            case 'KeyD':
                this.actions.right = true;
                break;
            case 'Space':
                this.actions.jump = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.actions.sprint = true;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.actions.crouch = true;
                break;
            case 'KeyE':
            case 'Tab':
                e.preventDefault();
                this.game.ui?.toggleInventory();
                break;
            case 'KeyC':
                // Toggle Civilization UI
                e.preventDefault();
                this.game.civilizationUI?.toggle();
                break;
            case 'KeyF':
                this.actions.mine = true;
                break;
            case 'KeyQ':
                this.actions.use = true;
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
                const slot = parseInt(e.code.replace('Digit', '')) - 1;
                this.game.player?.selectHotbarSlot(slot);
                break;
            case 'Escape':
                // Cancel build mode first if active
                if (this.game.buildMode?.active) {
                    this.game.cancelBuildMode();
                    break;
                }
                // Set menu requested flag before releasing pointer lock
                this.game.menuRequested = true;
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
                break;
        }
    }
    
    onKeyUp(e) {
        this.keys[e.code] = false;
        
        switch (e.code) {
            case 'KeyW':
                this.actions.forward = false;
                break;
            case 'KeyS':
                this.actions.backward = false;
                break;
            case 'KeyA':
                this.actions.left = false;
                break;
            case 'KeyD':
                this.actions.right = false;
                break;
            case 'Space':
                this.actions.jump = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.actions.sprint = false;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                this.actions.crouch = false;
                break;
            case 'KeyF':
                this.actions.mine = false;
                break;
            case 'KeyQ':
                this.actions.use = false;
                break;
        }
    }
    
    onMouseDown(e) {
        // Only track mouse down if pointer is locked (in-game)
        // This prevents accidental mining when clicking to gain pointer lock
        const isLocked = document.pointerLockElement !== null;
        
        if (isLocked) {
            console.log('Input3D: Mouse down (locked), button:', e.button);
            
            // Handle build mode
            if (this.game.buildMode?.active) {
                if (e.button === 0) { // Left click to place
                    this.game.placeBuildModeBuilding();
                } else if (e.button === 2) { // Right click to cancel
                    this.game.cancelBuildMode();
                }
                return;
            }
            
            switch (e.button) {
                case 0: // Left click
                    this.mouse.leftDown = true;
                    this.actions.mine = true;
                    break;
                case 1: // Middle click
                    this.mouse.middleDown = true;
                    break;
                case 2: // Right click
                    this.mouse.rightDown = true;
                    this.actions.use = true;
                    break;
            }
        } else {
            console.log('Input3D: Mouse down ignored (not locked)');
        }
    }
    
    onMouseUp(e) {
        // Always handle mouse up to reset state
        switch (e.button) {
            case 0:
                this.mouse.leftDown = false;
                this.actions.mine = false;
                break;
            case 1:
                this.mouse.middleDown = false;
                break;
            case 2:
                this.mouse.rightDown = false;
                this.actions.use = false;
                break;
        }
    }
    
    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    /**
     * Get movement direction in world space based on camera orientation
     */
    getMovement() {
        let moveX = 0;
        let moveY = 0;
        
        // Keyboard input
        if (this.actions.forward) moveY -= 1;
        if (this.actions.backward) moveY += 1;
        if (this.actions.left) moveX -= 1;
        if (this.actions.right) moveX += 1;
        
        // Mobile joystick input
        if (this.joystick.active) {
            moveX = this.joystick.x;
            moveY = this.joystick.y;
        }
        
        // Normalize diagonal movement
        const mag = Math.sqrt(moveX * moveX + moveY * moveY);
        if (mag > 1) {
            moveX /= mag;
            moveY /= mag;
        }
        
        return { x: moveX, y: moveY };
    }
    
    /**
     * Get movement relative to camera direction
     * Camera forward/right vectors are in Three.js coords
     * World uses: X=right, Y=forward, Z=up
     * Three uses: X=right, Y=up, Z=forward
     */
    getWorldMovement(camera3d) {
        const input = this.getMovement();
        
        if (input.x === 0 && input.y === 0) {
            return { x: 0, y: 0 };
        }
        
        if (!camera3d) {
            // Fallback without camera
            return { x: input.x, y: -input.y };
        }
        
        // Get camera forward and right vectors (in Three.js coords)
        const forward = camera3d.getForwardDirection();
        const right = camera3d.getRightDirection();
        
        // input.y: negative = forward (W key), positive = backward (S key)
        // input.x: negative = left (A key), positive = right (D key)
        
        // Camera forward.x is Three.X = World.X
        // Camera forward.z is Three.Z = World.Y
        
        // Calculate world movement
        // Forward (W, input.y=-1): move in camera forward direction
        // Right (D, input.x=+1): move in camera right direction
        const worldX = (forward.x * (-input.y) + right.x * input.x);
        const worldY = (forward.z * (-input.y) + right.z * input.x);
        
        return { x: worldX, y: worldY };
    }
    
    isMining() {
        return this.actions.mine || this.mouse.leftDown;
    }
    
    isUsing() {
        return this.actions.use || this.mouse.rightDown;
    }
    
    isJumping() {
        return this.actions.jump;
    }
    
    isSprinting() {
        // Auto-sprint on mobile when joystick pushed to edge
        if (this.mobileEnabled && this.joystick.active) {
            const magnitude = Math.sqrt(this.joystick.x ** 2 + this.joystick.y ** 2);
            if (magnitude >= this.autoSprintThreshold) {
                return true;
            }
        }
        return this.actions.sprint;
    }
    
    isAttacking() {
        return this.actions.attack;
    }
    
    checkDash() {
        const dash = this.actions.dash;
        this.actions.dash = false;
        return dash;
    }
    
    resetActions() {
        // Reset one-shot actions
        this.actions.inventory = false;
    }
}
