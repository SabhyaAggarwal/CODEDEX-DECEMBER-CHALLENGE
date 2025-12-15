// Chronos Shift - A Phaser Game about The Changing of Time
// Theme: Day/Night cycle affects platforms and gameplay

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.timeState = 'day'; // 'day' or 'night'
        this.isTransitioning = false;
        this.score = 0;
        this.gemsCollected = 0;
        this.totalGems = 6;
    }

    preload() {
        // We'll create graphics programmatically since we can't load external assets
    }

    create() {
        // Background layers
        this.createBackground();
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.createPlatforms();
        
        // Create special time-sensitive platforms
        this.dayPlatforms = this.physics.add.staticGroup();
        this.nightPlatforms = this.physics.add.staticGroup();
        this.createTimePlatforms();
        
        // Create player
        this.createPlayer();
        
        // Create collectibles
        this.gems = this.physics.add.group();
        this.createGems();
        
        // Create enemies
        this.enemies = this.physics.add.group();
        this.createEnemies();
        
        // Physics collisions
        this.setupCollisions();
        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.timeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // UI
        this.createUI();
        
        // Camera
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        // Initial time state setup
        this.updateTimeState();
    }

    createBackground() {
        // Sky gradient
        this.dayBg = this.add.rectangle(400, 300, 800, 600, 0x87CEEB);
        this.nightBg = this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
        this.nightBg.setAlpha(0);
        
        // Sun
        this.sun = this.add.circle(700, 100, 40, 0xFFD700);
        this.sunGlow = this.add.circle(700, 100, 50, 0xFFA500, 0.3);
        
        // Moon
        this.moon = this.add.circle(700, 100, 35, 0xF0F0F0);
        this.moon.setAlpha(0);
        this.moonGlow = this.add.circle(700, 100, 45, 0xE0E0FF, 0.3);
        this.moonGlow.setAlpha(0);
        
        // Stars
        this.stars = [];
        for (let i = 0; i < 30; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(50, 750),
                Phaser.Math.Between(50, 400),
                Phaser.Math.Between(1, 3),
                0xFFFFFF
            );
            star.setAlpha(0);
            this.stars.push(star);
        }
        
        // Clouds (day)
        this.clouds = [];
        for (let i = 0; i < 3; i++) {
            const cloud = this.add.ellipse(
                Phaser.Math.Between(100, 700),
                Phaser.Math.Between(80, 200),
                80, 40, 0xFFFFFF, 0.7
            );
            this.clouds.push(cloud);
        }
    }

    createPlatforms() {
        // Ground
        const ground = this.add.rectangle(400, 580, 800, 40, 0x4a5d23);
        this.platforms.add(ground);
        
        // Static platforms that exist in both time states
        const platformData = [
            { x: 200, y: 450, w: 150, h: 20 },
            { x: 600, y: 400, w: 150, h: 20 },
            { x: 400, y: 300, w: 120, h: 20 },
            { x: 100, y: 200, w: 100, h: 20 },
            { x: 700, y: 250, w: 100, h: 20 },
        ];
        
        platformData.forEach(p => {
            const platform = this.add.rectangle(p.x, p.y, p.w, p.h, 0x8B4513);
            this.platforms.add(platform);
        });
    }

    createTimePlatforms() {
        // Platforms that only exist during DAY
        const dayPlatformData = [
            { x: 300, y: 350, w: 100, h: 20 },
            { x: 500, y: 180, w: 120, h: 20 },
        ];
        
        dayPlatformData.forEach(p => {
            const platform = this.add.rectangle(p.x, p.y, p.w, p.h, 0xFFD700);
            platform.setStrokeStyle(2, 0xFFA500);
            this.dayPlatforms.add(platform);
            // Add visual indicator
            const text = this.add.text(p.x, p.y, '☀', { fontSize: '16px', color: '#fff' });
            text.setOrigin(0.5);
            platform.dayIcon = text;
        });
        
        // Platforms that only exist during NIGHT
        const nightPlatformData = [
            { x: 150, y: 320, w: 100, h: 20 },
            { x: 650, y: 150, w: 120, h: 20 },
        ];
        
        nightPlatformData.forEach(p => {
            const platform = this.add.rectangle(p.x, p.y, p.w, p.h, 0x4B0082);
            platform.setStrokeStyle(2, 0x8A2BE2);
            platform.setAlpha(0.3); // Start invisible in day mode
            this.nightPlatforms.add(platform);
            // Add visual indicator
            const text = this.add.text(p.x, p.y, '☾', { fontSize: '16px', color: '#fff' });
            text.setOrigin(0.5);
            text.setAlpha(0.3);
            platform.nightIcon = text;
        });
    }

    createPlayer() {
        // Create player character
        this.player = this.add.container(100, 500);
        
        // Body
        const body = this.add.rectangle(0, 0, 30, 40, 0x00CED1);
        // Head
        const head = this.add.circle(0, -25, 12, 0xFFDBAC);
        // Eyes
        const leftEye = this.add.circle(-5, -27, 2, 0x000000);
        const rightEye = this.add.circle(5, -27, 2, 0x000000);
        
        this.player.add([body, head, leftEye, rightEye]);
        
        // Add physics
        this.physics.world.enable(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(30, 40);
        this.player.body.setGravityY(500);
        
        // Player properties
        this.player.isGrounded = false;
    }

    createGems() {
        const gemPositions = [
            { x: 200, y: 400, type: 'day' },
            { x: 400, y: 250, type: 'both' },
            { x: 700, y: 200, type: 'both' },
            { x: 300, y: 300, type: 'day' },
            { x: 150, y: 270, type: 'night' },
            { x: 650, y: 100, type: 'night' },
        ];
        
        gemPositions.forEach(pos => {
            const gem = this.add.container(pos.x, pos.y);
            
            // Gem shape
            const gemShape = this.add.star(0, 0, 6, 5, 10, pos.type === 'day' ? 0xFFD700 : 
                                         pos.type === 'night' ? 0x9370DB : 0x00FF00);
            gemShape.setStrokeStyle(2, 0xFFFFFF);
            gem.add(gemShape);
            
            this.physics.world.enable(gem);
            gem.body.setAllowGravity(false);
            gem.body.setSize(20, 20);
            gem.timeType = pos.type;
            gem.collected = false;
            
            this.gems.add(gem);
            
            // Floating animation
            this.tweens.add({
                targets: gem,
                y: pos.y - 10,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createEnemies() {
        const enemyPositions = [
            { x: 600, y: 350, range: 100 },
            { x: 400, y: 250, range: 80 },
        ];
        
        enemyPositions.forEach(pos => {
            const enemy = this.add.container(pos.x, pos.y);
            
            // Enemy body
            const body = this.add.rectangle(0, 0, 25, 25, 0xFF4444);
            const eye = this.add.circle(5, -3, 3, 0x000000);
            enemy.add([body, eye]);
            
            this.physics.world.enable(enemy);
            enemy.body.setCollideWorldBounds(true);
            enemy.body.setVelocityX(50);
            enemy.body.setSize(25, 25);
            enemy.startX = pos.x;
            enemy.range = pos.range;
            
            this.enemies.add(enemy);
        });
    }

    setupCollisions() {
        // Player collisions with platforms
        this.physics.add.collider(this.player, this.platforms, () => {
            this.player.isGrounded = true;
        });
        
        this.physics.add.collider(this.player, this.dayPlatforms, () => {
            if (this.timeState === 'day') {
                this.player.isGrounded = true;
            }
        });
        
        this.physics.add.collider(this.player, this.nightPlatforms, () => {
            if (this.timeState === 'night') {
                this.player.isGrounded = true;
            }
        });
        
        // Enemy collisions
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.dayPlatforms);
        this.physics.add.collider(this.enemies, this.nightPlatforms);
        
        // Player collects gems
        this.physics.add.overlap(this.player, this.gems, this.collectGem, null, this);
        
        // Player hits enemy
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    }

    createUI() {
        // Score text
        this.scoreText = this.add.text(16, 16, 'Gems: 0/6', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(100);
        
        // Time indicator
        this.timeText = this.add.text(400, 16, 'DAY', {
            fontSize: '28px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        this.timeText.setOrigin(0.5, 0);
        this.timeText.setScrollFactor(0);
        this.timeText.setDepth(100);
        
        // Instructions
        this.instructionText = this.add.text(400, 560, 'Press T to change time! Collect all gems!', {
            fontSize: '16px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        });
        this.instructionText.setOrigin(0.5);
        this.instructionText.setScrollFactor(0);
        this.instructionText.setDepth(100);
    }

    collectGem(player, gem) {
        if (gem.collected) return;
        
        // Check if gem is accessible in current time state
        if (gem.timeType === 'day' && this.timeState !== 'day') return;
        if (gem.timeType === 'night' && this.timeState !== 'night') return;
        
        gem.collected = true;
        this.gemsCollected++;
        this.score += 100;
        
        // Visual feedback
        this.tweens.add({
            targets: gem,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => gem.destroy()
        });
        
        // Sound effect (visual representation)
        this.createCollectEffect(gem.x, gem.y);
        
        this.updateScore();
        
        // Check win condition
        if (this.gemsCollected >= this.totalGems) {
            this.winGame();
        }
    }

    createCollectEffect(x, y) {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 3, 0xFFFF00);
            const angle = (Math.PI * 2 * i) / 8;
            particles.push(particle);
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    hitEnemy(player, enemy) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        
        // Stop player
        this.player.body.setVelocity(0, 0);
        
        // Visual feedback
        this.tweens.add({
            targets: this.player,
            alpha: 0,
            duration: 300,
            yoyo: true,
            repeat: 2
        });
        
        // Game over text
        const gameOverText = this.add.text(400, 300, 'GAME OVER!', {
            fontSize: '64px',
            fill: '#FF0000',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold'
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        gameOverText.setDepth(200);
        
        const restartText = this.add.text(400, 370, 'Click to Restart', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        restartText.setOrigin(0.5);
        restartText.setScrollFactor(0);
        restartText.setDepth(200);
        
        this.input.once('pointerdown', () => {
            this.scene.restart();
            this.isGameOver = false;
            this.gemsCollected = 0;
            this.score = 0;
        });
    }

    winGame() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        
        // Victory text
        const winText = this.add.text(400, 250, 'YOU WIN!', {
            fontSize: '72px',
            fill: '#00FF00',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold'
        });
        winText.setOrigin(0.5);
        winText.setScrollFactor(0);
        winText.setDepth(200);
        
        const scoreDisplay = this.add.text(400, 330, `Final Score: ${this.score}`, {
            fontSize: '32px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 6
        });
        scoreDisplay.setOrigin(0.5);
        scoreDisplay.setScrollFactor(0);
        scoreDisplay.setDepth(200);
        
        const restartText = this.add.text(400, 390, 'Click to Play Again', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        restartText.setOrigin(0.5);
        restartText.setScrollFactor(0);
        restartText.setDepth(200);
        
        // Celebration effect
        this.createCelebration();
        
        this.input.once('pointerdown', () => {
            this.scene.restart();
            this.isGameOver = false;
            this.gemsCollected = 0;
            this.score = 0;
        });
    }

    createCelebration() {
        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(i * 100, () => {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                const particle = this.add.star(x, y, 5, 5, 10, Phaser.Display.Color.RandomRGB().color);
                
                this.tweens.add({
                    targets: particle,
                    scale: 2,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => particle.destroy()
                });
            });
        }
    }

    updateScore() {
        this.scoreText.setText(`Gems: ${this.gemsCollected}/${this.totalGems}`);
    }

    toggleTime() {
        if (this.isTransitioning || this.isGameOver) return;
        
        this.isTransitioning = true;
        this.timeState = this.timeState === 'day' ? 'night' : 'day';
        
        // Visual transition
        this.updateTimeState();
        
        this.time.delayedCall(500, () => {
            this.isTransitioning = false;
        });
    }

    updateTimeState() {
        const isDayNow = this.timeState === 'day';
        
        // Animate background
        this.tweens.add({
            targets: this.nightBg,
            alpha: isDayNow ? 0 : 0.9,
            duration: 500
        });
        
        // Animate sun/moon
        this.tweens.add({
            targets: [this.sun, this.sunGlow],
            alpha: isDayNow ? 1 : 0,
            duration: 500
        });
        
        this.tweens.add({
            targets: [this.moon, this.moonGlow],
            alpha: isDayNow ? 0 : 1,
            duration: 500
        });
        
        // Animate stars
        this.stars.forEach(star => {
            this.tweens.add({
                targets: star,
                alpha: isDayNow ? 0 : Phaser.Math.FloatBetween(0.5, 1),
                duration: 500
            });
        });
        
        // Animate clouds
        this.clouds.forEach(cloud => {
            this.tweens.add({
                targets: cloud,
                alpha: isDayNow ? 0.7 : 0.2,
                duration: 500
            });
        });
        
        // Update time-sensitive platforms
        this.dayPlatforms.children.entries.forEach(platform => {
            this.tweens.add({
                targets: platform,
                alpha: isDayNow ? 1 : 0.3,
                duration: 300
            });
            if (platform.dayIcon) {
                this.tweens.add({
                    targets: platform.dayIcon,
                    alpha: isDayNow ? 1 : 0.3,
                    duration: 300
                });
            }
        });
        
        this.nightPlatforms.children.entries.forEach(platform => {
            this.tweens.add({
                targets: platform,
                alpha: isDayNow ? 0.3 : 1,
                duration: 300
            });
            if (platform.nightIcon) {
                this.tweens.add({
                    targets: platform.nightIcon,
                    alpha: isDayNow ? 0.3 : 1,
                    duration: 300
                });
            }
        });
        
        // Update physics for time platforms
        if (isDayNow) {
            this.dayPlatforms.children.entries.forEach(p => {
                p.body.checkCollision.up = true;
                p.body.checkCollision.down = true;
                p.body.checkCollision.left = true;
                p.body.checkCollision.right = true;
            });
            this.nightPlatforms.children.entries.forEach(p => {
                p.body.checkCollision.up = false;
                p.body.checkCollision.down = false;
                p.body.checkCollision.left = false;
                p.body.checkCollision.right = false;
            });
        } else {
            this.dayPlatforms.children.entries.forEach(p => {
                p.body.checkCollision.up = false;
                p.body.checkCollision.down = false;
                p.body.checkCollision.left = false;
                p.body.checkCollision.right = false;
            });
            this.nightPlatforms.children.entries.forEach(p => {
                p.body.checkCollision.up = true;
                p.body.checkCollision.down = true;
                p.body.checkCollision.left = true;
                p.body.checkCollision.right = true;
            });
        }
        
        // Update time text
        this.timeText.setText(isDayNow ? 'DAY' : 'NIGHT');
        this.timeText.setColor(isDayNow ? '#FFD700' : '#9370DB');
    }

    update() {
        if (this.isGameOver) return;
        
        this.player.isGrounded = false;
        
        // Player movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(200);
        } else {
            this.player.body.setVelocityX(0);
        }
        
        // Jump
        if ((this.spaceKey.isDown || this.cursors.up.isDown) && this.player.body.touching.down) {
            this.player.body.setVelocityY(-400);
        }
        
        // Time toggle
        if (Phaser.Input.Keyboard.JustDown(this.timeKey)) {
            this.toggleTime();
        }
        
        // Enemy AI
        this.enemies.children.entries.forEach(enemy => {
            if (Math.abs(enemy.x - enemy.startX) > enemy.range) {
                enemy.body.setVelocityX(-enemy.body.velocity.x);
            }
        });
        
        // Animate clouds
        this.clouds.forEach(cloud => {
            cloud.x += 0.2;
            if (cloud.x > 850) cloud.x = -50;
        });
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: GameScene
};

// Initialize the game
const game = new Phaser.Game(config);
