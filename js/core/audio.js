export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
        this.sfxVolume = 0.5;
        this.enabled = true;
    }

    play(soundName, volume = 1) {
        if (!this.enabled) return;
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
            case 'eat': this.playEat(); break;
            case 'craft': this.playCraft(); break;
            case 'death': this.playDeath(); break;
            case 'critical': this.playCritical(); break;
            case 'quest_complete': this.playQuestComplete(); break;
            case 'level_up': this.playLevelUp(); break;
            case 'attack': this.playAttack(); break;
            case 'open': this.playOpen(); break;
            case 'close': this.playClose(); break;
            case 'fire': this.playFire(); break;
            case 'tame': this.playTame(); break;
            case 'growl': this.playGrowl(); break;
            case 'boss_spawn': this.playBossSpawn(); break;
            case 'boss_death': this.playBossDeath(); break;
            case 'step': this.playStep(); break;
        }
    }

    playTone(freq, type, duration, vol = 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol * this.masterVolume * this.sfxVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    
    playNoise(duration, vol = 1) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol * this.masterVolume * this.sfxVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start();
        noise.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        this.playTone(150, 'square', 0.1);
        this.playTone(300, 'square', 0.2);
    }

    playMine() {
        this.playTone(100 + Math.random() * 50, 'sawtooth', 0.05, 0.5);
        this.playNoise(0.05, 0.3);
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
        this.playNoise(0.05, 0.2);
    }

    playWalk() {
        this.playTone(80 + Math.random() * 40, 'triangle', 0.03, 0.3);
    }

    playSplash() {
        this.playTone(200, 'sawtooth', 0.1, 0.4);
        this.playTone(150, 'sawtooth', 0.15, 0.3);
        this.playNoise(0.2, 0.3);
    }

    playHurt() {
        this.playTone(200, 'sawtooth', 0.1, 0.5);
        this.playTone(100, 'square', 0.15, 0.4);
    }
    
    playBreak() {
        this.playTone(300, 'sawtooth', 0.1, 0.5);
        this.playTone(150, 'sawtooth', 0.15, 0.4);
        this.playTone(100, 'sawtooth', 0.2, 0.3);
    }
    
    playEat() {
        this.playNoise(0.1, 0.3);
        setTimeout(() => this.playNoise(0.1, 0.25), 100);
        setTimeout(() => this.playNoise(0.1, 0.2), 200);
    }
    
    playCraft() {
        this.playTone(300, 'sine', 0.1);
        setTimeout(() => this.playTone(400, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(500, 'sine', 0.15), 200);
    }
    
    playDeath() {
        this.playTone(200, 'sawtooth', 0.2, 0.6);
        this.playTone(150, 'sawtooth', 0.3, 0.5);
        this.playTone(100, 'sawtooth', 0.4, 0.4);
    }
    
    playCritical() {
        this.playTone(500, 'sine', 0.1, 0.5);
        this.playTone(700, 'sine', 0.15, 0.4);
    }
    
    playQuestComplete() {
        this.playTone(400, 'sine', 0.15);
        setTimeout(() => this.playTone(500, 'sine', 0.15), 150);
        setTimeout(() => this.playTone(600, 'sine', 0.15), 300);
        setTimeout(() => this.playTone(800, 'sine', 0.3), 450);
    }
    
    playLevelUp() {
        this.playTone(300, 'sine', 0.1);
        setTimeout(() => this.playTone(400, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(500, 'sine', 0.1), 200);
        setTimeout(() => this.playTone(600, 'sine', 0.1), 300);
        setTimeout(() => this.playTone(800, 'sine', 0.3), 400);
    }
    
    playAttack() {
        this.playTone(200, 'sawtooth', 0.1, 0.5);
        this.playNoise(0.08, 0.3);
    }
    
    playOpen() {
        this.playTone(250, 'sine', 0.1);
        this.playTone(350, 'sine', 0.1);
    }
    
    playClose() {
        this.playTone(350, 'sine', 0.1);
        this.playTone(250, 'sine', 0.1);
    }
    
    playFire() {
        this.playNoise(0.3, 0.2);
        this.playTone(100, 'sawtooth', 0.2, 0.1);
    }
    
    playTame() {
        this.playTone(400, 'sine', 0.1);
        setTimeout(() => this.playTone(500, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(600, 'sine', 0.2), 200);
    }
    
    playGrowl() {
        this.playTone(80, 'sawtooth', 0.3, 0.4);
        this.playTone(60, 'sawtooth', 0.2, 0.3);
    }
    
    playBossSpawn() {
        // Dramatic boss spawn sound
        this.playTone(100, 'sawtooth', 0.3, 0.6);
        setTimeout(() => this.playTone(80, 'sawtooth', 0.3, 0.5), 200);
        setTimeout(() => this.playTone(60, 'sawtooth', 0.5, 0.4), 400);
        setTimeout(() => {
            this.playTone(200, 'square', 0.2, 0.7);
            this.playTone(150, 'square', 0.3, 0.5);
        }, 700);
    }
    
    playBossDeath() {
        // Epic boss death sound
        this.playTone(300, 'sawtooth', 0.2, 0.6);
        setTimeout(() => this.playTone(400, 'sine', 0.2, 0.5), 150);
        setTimeout(() => this.playTone(500, 'sine', 0.2, 0.5), 300);
        setTimeout(() => this.playTone(600, 'sine', 0.3, 0.6), 450);
        setTimeout(() => {
            this.playTone(800, 'sine', 0.5, 0.5);
            this.playNoise(0.3, 0.3);
        }, 600);
    }
    
    playStep() {
        // Footstep sound for block gravity
        this.playTone(60 + Math.random() * 20, 'triangle', 0.05, 0.2);
        this.playNoise(0.03, 0.15);
    }
    
    setVolume(type, value) {
        if (type === 'master') {
            this.masterVolume = Math.max(0, Math.min(1, value));
        } else if (type === 'sfx') {
            this.sfxVolume = Math.max(0, Math.min(1, value));
        }
    }
    
    toggle(enabled) {
        this.enabled = enabled;
    }
}
