class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.gameSpeed = 150; // 默认中速
        this.currentSpeedLevel = 'normal';
        
        this.highScoreElement.textContent = this.highScore;
        
        this.initializeEventListeners();
        this.generateFood();
        this.draw();
    }
    
    initializeEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', this.startGame.bind(this));
        document.getElementById('pauseBtn').addEventListener('click', this.togglePause.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restartGame.bind(this));
        document.getElementById('playAgainBtn').addEventListener('click', this.restartGame.bind(this));
        
        // 速度控制事件监听
        document.getElementById('slowBtn').addEventListener('click', () => this.setSpeed('slow'));
        document.getElementById('normalBtn').addEventListener('click', () => this.setSpeed('normal'));
        document.getElementById('fastBtn').addEventListener('click', () => this.setSpeed('fast'));
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const { key } = e;
        
        if (key === 'ArrowLeft' && this.dx !== 1) {
            this.dx = -1;
            this.dy = 0;
        } else if (key === 'ArrowUp' && this.dy !== 1) {
            this.dx = 0;
            this.dy = -1;
        } else if (key === 'ArrowRight' && this.dx !== -1) {
            this.dx = 1;
            this.dy = 0;
        } else if (key === 'ArrowDown' && this.dy !== -1) {
            this.dx = 0;
            this.dy = 1;
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.dx = 1;
        this.dy = 0;
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.update();
                this.draw();
            }
        }, this.gameSpeed);
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? '继续' : '暂停';
    }
    
    restartGame() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'none';
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
        
        this.generateFood();
        this.draw();
    }
    
    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        for (let segment of this.snake) {
            if (this.food.x === segment.x && this.food.y === segment.y) {
                this.generateFood();
                return;
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#4ecdc4';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            if (i === 0) {
                this.ctx.fillStyle = '#ff6b6b';
            } else {
                this.ctx.fillStyle = '#4ecdc4';
            }
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        }
        
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 1,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    setSpeed(level) {
        // 如果游戏正在运行，不允许改变速度
        if (this.gameRunning) return;
        
        // 移除之前的活跃状态
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 设置新的速度
        this.currentSpeedLevel = level;
        switch(level) {
            case 'slow':
                this.gameSpeed = 250;
                document.getElementById('slowBtn').classList.add('active');
                break;
            case 'normal':
                this.gameSpeed = 150;
                document.getElementById('normalBtn').classList.add('active');
                break;
            case 'fast':
                this.gameSpeed = 100;
                document.getElementById('fastBtn').classList.add('active');
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});