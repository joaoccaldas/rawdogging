import { Renderer } from './core/renderer.js';
import { UIManager } from './ui/ui.js';

// Minimal Game class for testing purposes
class Game {
    constructor() {
        console.log('Game: Minimal Game constructor called.');
        this.renderer = new Renderer(this);
        this.ui = new UIManager(this);
        console.log('Game: Renderer and UIManager initialized.');
        this.paused = true; // Start paused at menu
    }

    // Minimal stubs for methods Renderer and UIManager might call
    get camera() { return { resize: () => console.log('Camera: resize called') }; }
    get world() { return { timeOfDay: 0.5 }; } // Placeholder
    get input() { return { mouse: { x: 0, y: 0 }, keys: {} }; } // Placeholder
    get player() { return { x: 0, y: 0, z: 0, interactionRange: 5, updateUI: () => console.log('Player: updateUI called') }; } // Placeholder
    get spriteManager() { return { getBlockSprite: () => null, getPlayerSprite: () => null, shadowMask: null, init: async () => console.log('SpriteManager: init called') }; } // Placeholder
    togglePause(paused) { console.log(`Game: togglePause called with ${paused}`); this.paused = paused; }
    startNewGame() { console.log('Game: startNewGame called (stub).'); }
    saveManager = { load: () => console.log('SaveManager: load called (stub)'), save: () => console.log('SaveManager: save called (stub)') };
    introCinematic = false;
    firstSteps = false;

    // ... other minimal stubs as needed ...
}

// Start Game
window.onload = () => {
    console.log('window.onload triggered.');
    const game = new Game();
    window.game = game;
    console.log('Game object instantiated and assigned to window.');
    window.addEventListener('resize', () => game.resize());
};
