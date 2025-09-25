document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const highScoreDisplay = document.getElementById('high-score-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const ground = document.getElementById('ground'); // Este elemento não é usado no JS, mas mantido.
    
    // Game variables
    let gameRunning = false;
    let score = 0;
    let highScore = 0;
    let animationFrameId;
    let gameSpeed = 5;
    let speedIncreaseTimer = 0;
    
    // Dino variables
    const dino = {
        x: 50,
        y: 230, // Posição Y inicial do dino no chão
        width: 40,
        height: 60,
        velocity: 0,
        gravity: 0.8,
        jumpForce: -15,
        isJumping: false,
        frame: 0
    };
    
    // Obstacle variables
    const obstacles = [];
    const obstacleTypes = [
        { width: 30, height: 50, color: '#ff00ff' }, // Small cyber crate
        { width: 50, height: 30, color: '#00ffff' },  // Low hurdle
        { width: 40, height: 60, color: '#ff00ff' }  // Tall cyber crate
    ];
    let obstacleTimer = 0;
    const obstacleInterval = 1500; // milliseconds
    
    // Game controls (flags para teclado e touchscreen)
    let upPressed = false;
    let downPressed = false;

    // Variáveis para controle de toque (touchscreen)
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 30; // Distância mínima em pixels para considerar um swipe
    
    // Event listeners para teclado
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === 'ArrowUp') {
            upPressed = true;
            if (!gameRunning) {
                startGame();
            }
        }
        if (e.key === 'ArrowDown') {
            downPressed = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.key === 'ArrowUp') {
            upPressed = false;
        }
        if (e.key === 'ArrowDown') {
            downPressed = false;
        }
    });
    
    // Event listeners para touchscreen no canvas
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Previne o scroll da página em dispositivos móveis
        if (!gameRunning) {
            startGame();
        }
        touchStartX = e.touches[0].clientX; // Guarda a posição X inicial do toque
        touchStartY = e.touches[0].clientY; // Guarda a posição Y inicial do toque
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].clientX; // Guarda a posição X final do toque
        const touchEndY = e.changedTouches[0].clientY; // Guarda a posição Y final do toque

        const deltaX = touchEndX - touchStartX; // Diferença horizontal
        const deltaY = touchEndY - touchStartY; // Diferença vertical

        // Determina se é um swipe vertical dominante ou um tap
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
            if (deltaY < 0) { // Swipe para cima (Jump)
                // Simula a tecla 'ArrowUp' pressionada por um breve momento
                upPressed = true;
                setTimeout(() => { upPressed = false; }, 50); // Reseta rapidamente
            } else { // Swipe para baixo (Duck)
                // Simula a tecla 'ArrowDown' pressionada por um breve momento
                downPressed = true;
                setTimeout(() => { downPressed = false; }, 50); // Reseta rapidamente
            }
        } else if (Math.abs(deltaX) <= swipeThreshold && Math.abs(deltaY) <= swipeThreshold) {
            // Se for um "tap" (toque sem arrastar muito), considera um salto
            upPressed = true;
            setTimeout(() => { upPressed = false; }, 50); // Reseta rapidamente
        }
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Start game function
    function startGame() {
        gameRunning = true;
        score = 0;
        dino.y = 230; // Garante que o dino começa no chão
        dino.velocity = 0;
        dino.isJumping = false;
        dino.frame = 0;
        obstacles.length = 0;
        obstacleTimer = 0;
        gameSpeed = 5;
        speedIncreaseTimer = 0;
        
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        scoreDisplay.textContent = '0';
        highScoreDisplay.textContent = `HI: ${highScore}`; // Atualiza o high score ao iniciar
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        gameLoop();
    }
    
    // Game loop
    function gameLoop() {
        update();
        draw();
        
        if (gameRunning) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }
    
    // Update game state
    function update() {
        // Update dino
        if (upPressed && !dino.isJumping) {
            dino.velocity = dino.jumpForce;
            dino.isJumping = true;
        }
        
        // Ducking mechanic
        if (downPressed && !dino.isJumping) {
            dino.height = 30;
            dino.y = 260; // Ajusta a posição Y para o agachamento
        } else if (!dino.isJumping) { // Retorna à altura normal se não estiver agachado nem pulando
            dino.height = 60;
            dino.y = 230; // Posição Y normal no chão
        }
        
        dino.velocity += dino.gravity;
        dino.y += dino.velocity;
        
        // Check if dino lands
        if (dino.y > 230) { // Se o dino cair abaixo do chão, ajusta para o chão
            dino.y = 230;
            dino.velocity = 0;
            dino.isJumping = false;
        }
        
        // Update score
        score++;
        scoreDisplay.textContent = Math.floor(score / 10);
        
        // Increase game speed over time
        speedIncreaseTimer++;
        if (speedIncreaseTimer > 500) {
            gameSpeed += 0.5;
            speedIncreaseTimer = 0;
        }
        
        // Update obstacles
        obstacleTimer += 16; // assuming ~60fps
        
        if (obstacleTimer > obstacleInterval) {
            createObstacle();
            obstacleTimer = Math.random() * 500; // Randomize next obstacle
        }
        
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= gameSpeed;
            
            // Check collision with dino
            if (
                dino.x + dino.width > obstacles[i].x &&
                dino.x < obstacles[i].x + obstacles[i].width &&
                dino.y + dino.height > obstacles[i].y &&
                dino.y < obstacles[i].y + obstacles[i].height
            ) {
                gameOver();
            }
            
            // Remove obstacles that are off screen
            if (obstacles[i].x + obstacles[i].width < 0) {
                obstacles.splice(i, 1);
            }
        }
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines (mantido, mas pode ser removido se não for estético)
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Linhas verticais
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Linhas horizontais
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw dino
        ctx.fillStyle = '#00ffff';
        
        // Dino body
        ctx.beginPath();
        ctx.moveTo(dino.x, dino.y + dino.height);
        ctx.lineTo(dino.x + dino.width * 0.3, dino.y + dino.height * 0.7);
        ctx.lineTo(dino.x + dino.width * 0.7, dino.y + dino.height * 0.7);
        ctx.lineTo(dino.x + dino.width, dino.y + dino.height);
        ctx.lineTo(dino.x + dino.width * 0.8, dino.y + dino.height * 0.3);
        ctx.lineTo(dino.x + dino.width * 0.5, dino.y);
        ctx.lineTo(dino.x + dino.width * 0.2, dino.y + dino.height * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Dino eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(dino.x + dino.width * 0.6, dino.y + dino.height * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Dino glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw obstacles
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Obstacle details
            if (obstacle.width === 30) { // Small crate
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 20, 40);
            } else if (obstacle.width === 50) { // Low hurdle
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(obstacle.x + 10, obstacle.y - 5, 30, 5);
            }
            
            // Obstacle glow
            ctx.shadowColor = obstacle.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.shadowBlur = 0;
        });
        
        // Draw ground
        ctx.fillStyle = '#333';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Ground details
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 20);
            ctx.lineTo(x + 20, canvas.height - 10);
            ctx.stroke();
        }
    }
    
    // Create a new obstacle
    function createObstacle() {
        const type = Math.floor(Math.random() * obstacleTypes.length);
        const obstacle = {
            ...obstacleTypes[type],
            x: canvas.width,
            y: canvas.height - 20 - obstacleTypes[type].height
        };
        
        obstacles.push(obstacle);
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        const finalScore = Math.floor(score / 10);
        finalScoreDisplay.textContent = `Score: ${finalScore}`;
        gameOverScreen.style.display = 'flex';
        
        if (finalScore > highScore) {
            highScore = finalScore;
            highScoreDisplay.textContent = `HI: ${highScore}`;
        }
    }
    
    // Initial draw
    draw();
});