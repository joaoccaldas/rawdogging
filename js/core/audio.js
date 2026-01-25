export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
    }

    play(soundName) {
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (soundName) {
            case 'jump': this.playJump(); break;
            case 'mine': this.playMine(); break;
            case 'hit': this.playHit(); break;
            case 'pickup': this.playPickup(); break;
            case 'place': this.playPlace(); break;
            case 'walk': this.playWalk(); break;
            case 'splash': this.playSplash(); break;
            case 'hurt': this.playHurt(); break;
            case 'break': this.playBreak(); break;
        }
    }

    playTone(freq, type, duration, vol = 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        this.playTone(150, 'square', 0.1);
        this.playTone(300, 'square', 0.2); // Slide up effect manually
    }

    playMine() {
        // Crunch noise
        this.playTone(100 + Math.random() * 50, 'sawtooth', 0.05, 0.5);
    }

    playHit() {
        this.playTone(100, 'sawtooth', 0.1);
        this.playTone(80, 'sawtooth', 0.1);
    }

    playPickup() {
        this.playTone(400, 'sine', 0.05);
        setTimeout(() => this.playTone(600, 'sine', 0.05), 50);
    }

    playPlace() {
        this.playTone(200, 'triangle', 0.05);
    }

    playWalk() {
        // Soft footstep sound
        this.playTone(80 + Math.random() * 40, 'triangle', 0.03, 0.3);
    }

    playSplash() {
        // Water splash
        this.playTone(200, 'sawtooth', 0.1, 0.4);
        this.playTone(150, 'sawtooth', 0.15, 0.3);
    }

    playHurt() {
        // Damage taken sound
        this.playTone(200, 'sawtooth', 0.1, 0.5);
        this.playTone(100, 'square', 0.15, 0.4);
    }
    
    playBreak() {
        // Tool break sound
        this.playTone(300, 'sawtooth', 0.1, 0.5);
        this.playTone(150, 'sawtooth', 0.15, 0.4);
        this.playTone(100, 'sawtooth', 0.2, 0.3);
    }
}
