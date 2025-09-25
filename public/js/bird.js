document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    
    // Game variables
    let gameRunning = false;
    let score = 0;
    let highScore = 0;
    let animationFrameId;
    
    // Bird variables
    const bird = {
        x: 100,
        y: 300,
        width: 30,
        height: 24,
        velocity: 0,
        gravity: 1.0,
        jumpForce: -10,
        color: '#00ffff'
    };
    
    // Pipe variables
    const pipes = [];
    const pipeWidth = 60;
    const pipeGap = 150;
    const pipeSpeed = 3;
    let pipeTimer = 0;
    const pipeInterval = 1500; // milliseconds
    
    // Game controls (spacePressed agora só controla o estado da tecla, não a ação contínua)
    let spacePressed = false; 
    
    // Event listeners para teclado
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            // Se o jogo não estiver a correr, inicia ao pressionar Espaço
            if (!gameRunning) {
                startGame();
            }
            // Faz o pássaro pular apenas uma vez por pressão de tecla
            // Evita saltos contínuos se a tecla for mantida pressionada
            if (!spacePressed) { // Verifica se a tecla já está pressionada para evitar repetição
                bird.velocity = bird.jumpForce;
                spacePressed = true; // Marca como pressionada
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spacePressed = false; // Reseta o estado da tecla
        }
    });
    
    // Event listener para touchscreen no canvas
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Previne o scroll da página em dispositivos móveis
        if (!gameRunning) {
            startGame();
        }
        bird.velocity = bird.jumpForce; // Faz o pássaro pular ao toque
    });

    // O event listener de 'click' já existia e também funciona para toques,
    // mas 'touchstart' é mais imediato para jogos em mobile.
    // Manter o 'click' para compatibilidade com mouse em desktops.
    canvas.addEventListener('click', () => {
        if (!gameRunning) {
            startGame();
        }
        bird.velocity = bird.jumpForce; // Faz o pássaro pular ao clique
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Start game function
    function startGame() {
        gameRunning = true;
        score = 0;
        bird.y = 300;
        bird.velocity = 0;
        pipes.length = 0;
        pipeTimer = 0;
        
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        scoreDisplay.textContent = '0';
        
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
        // Update bird
        // Removida a lógica 'if (spacePressed)' daqui.
        // O salto agora é ativado diretamente pelos event listeners (keydown, touchstart, click).
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Check if bird hits the ground or ceiling
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameOver();
        }
        
        // Update pipes
        pipeTimer += 16; // assuming ~60fps
        
        if (pipeTimer > pipeInterval) {
            createPipe();
            pipeTimer = 0;
        }
        
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeSpeed;
            
            // Check if bird passes the pipe
            if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
                pipes[i].passed = true;
                score++;
                scoreDisplay.textContent = score;
            }
            
            // Check collision with pipe
            if (
                bird.x + bird.width > pipes[i].x &&
                bird.x < pipes[i].x + pipeWidth &&
                (bird.y < pipes[i].topHeight || bird.y + bird.height > pipes[i].topHeight + pipeGap)
            ) {
                gameOver();
            }
            
            // Remove pipes that are off screen
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw pipes
        ctx.fillStyle = '#ff00ff';
        pipes.forEach(pipe => {
            // Top pipe
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            
            // Bottom pipe
            ctx.fillRect(
                pipe.x, 
                pipe.topHeight + pipeGap, 
                pipeWidth, 
                canvas.height - pipe.topHeight - pipeGap
            );
            
            // Pipe edges
            ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
            ctx.fillRect(pipe.x - 3, 0, 3, pipe.topHeight);
            ctx.fillRect(pipe.x - 3, pipe.topHeight + pipeGap, 3, canvas.height - pipe.topHeight - pipeGap);
            
            // Pipe glow
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
            ctx.fillRect(
                pipe.x, 
                pipe.topHeight + pipeGap, 
                pipeWidth, 
                canvas.height - pipe.topHeight - pipeGap
            );
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#ff00ff';
        });
        
        // Draw bird
        ctx.fillStyle = bird.color;
        ctx.beginPath();
        ctx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Bird eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Create a new pipe
    function createPipe() {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        pipes.push({
            x: canvas.width,
            topHeight,
            passed: false
        });
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        finalScoreDisplay.textContent = `Score: ${score}`;
        gameOverScreen.style.display = 'flex';
        
        if (score > highScore) {
            highScore = score;
        }
    }
    
    // Initial draw
    draw();
});