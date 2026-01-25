// Input Handler - Keyboard + Touch + Gamepad
import { CONFIG } from '../config.js';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false, button: 0 };
        this.touch = { active: false, x: 0, y: 0 };
        this.joystick = { x: 0, y: 0, active: false };
        this.actions = {
            mine: false,
            attack: false,
            jump: false,
            inventory: false,
            use: false,
            sprint: false,
            dash: false,
        };

        this.joystickBase = null;
        this.joystickStick = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.joystickRadius = 35;

        this.mobileEnabled = CONFIG.MOBILE_CONTROLS_ENABLED;

        this.init();
    }

    init() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Clear keys when window loses focus (prevents stuck keys)
        window.addEventListener('blur', () => {
            this.keys = {};
            this.joystick = { x: 0, y: 0, active: false };
            this.actions = {
                mine: false,
                attack: false,
                jump: false,
                inventory: false,
                use: false,
                sprint: false,
                dash: false,
            };
        });

        // Also clear on visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.keys = {};
                this.joystick = { x: 0, y: 0, active: false };
            }
        });

        // Mouse
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // Touch controls (enabled based on config)
        if (this.mobileEnabled) {
            canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
            canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
            canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
            this.setupMobileControls();
        } else {
            // Hide mobile controls UI if disabled
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) mobileControls.style.display = 'none';
        }
    }

    setupMobileControls() {
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickStick = document.getElementById('joystick-stick');

        if (this.joystickBase) {
            this.joystickBase.addEventListener('touchstart', (e) => this.onJoystickStart(e));
            this.joystickBase.addEventListener('touchmove', (e) => this.onJoystickMove(e));
            this.joystickBase.addEventListener('touchend', (e) => this.onJoystickEnd(e));
        }

        // Action buttons
        const btnMine = document.getElementById('btn-mine');
        const btnAttack = document.getElementById('btn-attack');
        const btnJump = document.getElementById('btn-jump');
        const btnInventory = document.getElementById('btn-inventory');
        const btnSprint = document.getElementById('btn-sprint');
        const btnDash = document.getElementById('btn-dash');
        const btnUse = document.getElementById('btn-use');

        // Helper for touch button handling with visual feedback
        const setupButton = (btn, startAction, endAction) => {
            if (!btn) return;
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('active');
                startAction();
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
                endAction();
            });
            btn.addEventListener('touchcancel', (e) => {
                btn.classList.remove('active');
                endAction();
            });
        };

        setupButton(btnMine, 
            () => { this.actions.mine = true; this.actions.attack = true; },
            () => { this.actions.mine = false; this.actions.attack = false; }
        );
        
        setupButton(btnAttack, 
            () => this.actions.attack = true,
            () => this.actions.attack = false
        );
        
        setupButton(btnJump, 
            () => this.actions.jump = true,
            () => this.actions.jump = false
        );
        
        setupButton(btnUse, 
            () => this.actions.use = true,
            () => this.actions.use = false
        );
        
        setupButton(btnSprint, 
            () => this.actions.sprint = true,
            () => this.actions.sprint = false
        );
        
        setupButton(btnDash, 
            () => { this.actions.dash = true; },
            () => { /* dash is consumed immediately */ }
        );

        if (btnInventory) {
            btnInventory.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btnInventory.classList.add('active');
                this.actions.inventory = true;
                this.game.ui?.toggleInventory();
            });
            btnInventory.addEventListener('touchend', () => {
                btnInventory.classList.remove('active');
                this.actions.inventory = false;
            });
        }

        // Auto-sprint when joystick pushed to edge
        this.autoSprintThreshold = 0.9;
    }

    onKeyDown(e) {
        this.keys[e.code] = true;

        // Handle specific key actions
        switch (e.code) {
            case 'KeyE':
            case 'Tab':
                e.preventDefault();
                this.game.ui?.toggleInventory();
                break;
            case 'KeyF':
                // F key for mining (alternative to left click)
                this.actions.mine = true;
                break;
            case 'KeyQ':
                // Q key for placing (alternative to right click)
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
            case 'Space':
                this.actions.jump = true;
                break;
            case 'Escape':
                this.game.ui?.closeAllModals();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.actions.sprint = true;
                break;
            case 'KeyC':
                this.actions.dash = true;
                break;
        }
    }

    onKeyUp(e) {
        this.keys[e.code] = false;

        if (e.code === 'Space') {
            this.actions.jump = false;
        }
        if (e.code === 'KeyF') {
            this.actions.mine = false;
        }
        if (e.code === 'KeyQ') {
            this.actions.use = false;
        }
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            this.actions.sprint = false;
        }
        if (e.code === 'KeyC') {
            this.actions.dash = false;
        }
    }

    onMouseDown(e) {
        this.mouse.down = true;
        this.mouse.button = e.button;

        if (e.button === 0) { // Left click - mine/attack
            this.actions.mine = true;
            this.actions.attack = true;
        } else if (e.button === 2) { // Right click - use/place
            this.actions.use = true;
        }
    }

    onMouseUp(e) {
        this.mouse.down = false;

        if (e.button === 0) {
            this.actions.mine = false;
            this.actions.attack = false;
        } else if (e.button === 2) {
            this.actions.use = false;
        }
    }

    onMouseMove(e) {
        const rect = e.target.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    onWheel(e) {
        const delta = Math.sign(e.deltaY);
        this.game.player?.scrollHotbar(delta);
    }

    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        this.touch.active = true;
        this.touch.x = touch.clientX - rect.left;
        this.touch.y = touch.clientY - rect.top;
        this.mouse.x = this.touch.x;
        this.mouse.y = this.touch.y;
    }

    onTouchEnd(e) {
        this.touch.active = false;
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const rect = e.target.getBoundingClientRect();
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
            this.mouse.x = this.touch.x;
            this.mouse.y = this.touch.y;
        }
    }

    onJoystickStart(e) {
        e.preventDefault();
        e.stopPropagation();
        const rect = this.joystickBase.getBoundingClientRect();
        this.joystickCenter.x = rect.left + rect.width / 2;
        this.joystickCenter.y = rect.top + rect.height / 2;
        this.joystick.active = true;
        this.updateJoystick(e.touches[0]);
    }

    onJoystickMove(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.joystick.active) {
            this.updateJoystick(e.touches[0]);
        }
    }

    onJoystickEnd(e) {
        e.preventDefault();
        this.joystick.active = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
        if (this.joystickStick) {
            this.joystickStick.style.transform = 'translate(0, 0)';
        }
    }

    updateJoystick(touch) {
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = this.joystickRadius;

        let normalizedX = dx / maxDistance;
        let normalizedY = dy / maxDistance;

        if (distance > maxDistance) {
            normalizedX = (dx / distance);
            normalizedY = (dy / distance);
        }

        this.joystick.x = Math.max(-1, Math.min(1, normalizedX));
        this.joystick.y = Math.max(-1, Math.min(1, normalizedY));

        // Visual feedback
        const visualX = this.joystick.x * maxDistance;
        const visualY = this.joystick.y * maxDistance;
        if (this.joystickStick) {
            this.joystickStick.style.transform = `translate(${visualX}px, ${visualY}px)`;
        }
    }

    getMovement() {
        let dx = 0;
        let dy = 0;

        // Keyboard
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

        // Joystick (mobile controls)
        if (this.mobileEnabled && this.joystick.active) {
            if (Math.abs(this.joystick.x) > 0.2 || Math.abs(this.joystick.y) > 0.2) {
                dx = this.joystick.x;
                dy = this.joystick.y;
            }
        }

        // Normalize diagonal movement
        if (dx !== 0 || dy !== 0) {
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 1) {
                dx /= mag;
                dy /= mag;
            }
        }

        return { x: dx, y: dy };
    }

    isJumping() {
        return this.actions.jump || this.keys['Space'];
    }

    isMining() {
        return this.actions.mine || (this.mouse.down && this.mouse.button === 0);
    }

    isAttacking() {
        return this.actions.attack;
    }

    isUsing() {
        return this.actions.use || (this.mouse.down && this.mouse.button === 2);
    }

    isSprinting() {
        // Auto-sprint when joystick pushed to edge on mobile
        if (this.mobileEnabled && this.joystick.active) {
            const magnitude = Math.sqrt(this.joystick.x ** 2 + this.joystick.y ** 2);
            if (magnitude >= (this.autoSprintThreshold || 0.9)) {
                return true;
            }
        }
        return this.actions.sprint;
    }

    checkDash() {
        const dash = this.actions.dash;
        this.actions.dash = false; // Consume dash action
        return dash;
    }

    getMouseWorldPosition(camera) {
        return camera.screenToWorld(this.mouse.x, this.mouse.y);
    }

    resetActions() {
        // Reset one-shot actions
        this.actions.inventory = false;
    }
}
