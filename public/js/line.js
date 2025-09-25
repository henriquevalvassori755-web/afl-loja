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
    
    // Game variables
    let gameRunning = false;
    let score = 0;
    let highScore = 0;
    let animationFrameId;
    let gameSpeed = 5;
    let speedIncreaseTimer = 0;
    
    // Lane positions
    const lanes = [75, 150, 225]; // Three lanes
    let currentLane = 1; // Middle lane
    
    // Player bike
    const bike = {
        x: lanes[currentLane],
        y: 500,
        width: 20,
        height: 40,
        color: '#00ffff'
    };
    
    // Cars
    const cars = [];
    const carColors = ['#ff00ff', '#00ffff', '#ff0099', '#00ff99'];
    let carTimer = 0;
    const carInterval = 1000; // milliseconds
    
    // Variáveis para controle de toque (touchscreen)
    let touchStartX = 0;
    // let touchStartY = 0; // Não é necessário para swipes horizontais
    let touchEndX = 0;
    // let touchEndY = 0; // Não é necessário para swipes horizontais
    const swipeThreshold = 50; // Distância mínima em pixels para considerar um swipe
    
    // Event listeners para teclado
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'a':
            case 'ArrowLeft':
                currentLane = Math.max(0, currentLane - 1);
                bike.x = lanes[currentLane];
                break;
            case 'd':
            case 'ArrowRight':
                currentLane = Math.min(2, currentLane + 1);
                bike.x = lanes[currentLane];
                break;
        }
    });
    
    // Event listeners para touchscreen no canvas
    canvas.addEventListener('touchstart', (e) => {
        if (!gameRunning) { // Se o jogo não estiver a correr, inicia ao tocar
            startGame();
        }
        e.preventDefault(); // Previne o comportamento padrão do navegador (ex: scroll)
        touchStartX = e.touches[0].clientX; // Guarda a posição X inicial do toque
        // touchStartY = e.touches[0].clientY; // Guarda a posição Y inicial do toque (se fosse para swipes verticais)
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!gameRunning) return;
        e.preventDefault(); // Previne o comportamento padrão do navegador (ex: scroll)
        // Não fazemos nada aqui para swipes simples, a lógica é no touchend
    });

    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning) return;
        e.preventDefault(); // Previne o comportamento padrão do navegador (ex: scroll)
        touchEndX = e.changedTouches[0].clientX; // Guarda a posição X final do toque
        // touchEndY = e.changedTouches[0].clientY; // Guarda a posição Y final do toque

        const deltaX = touchEndX - touchStartX; // Calcula a diferença horizontal

        // Verifica se houve um swipe significativo na horizontal
        if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) { // Swipe para a esquerda
                currentLane = Math.max(0, currentLane - 1);
                bike.x = lanes[currentLane];
            } else { // Swipe para a direita
                currentLane = Math.min(2, currentLane + 1);
                bike.x = lanes[currentLane];
            }
        }
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Start game function
    function startGame() {
        gameRunning = true;
        score = 0;
        currentLane = 1;
        bike.x = lanes[currentLane];
        bike.y = 500;
        cars.length = 0;
        carTimer = 0;
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
        // Increase score and difficulty
        score++;
        scoreDisplay.textContent = Math.floor(score / 10);
        
        speedIncreaseTimer++;
        if (speedIncreaseTimer > 500) {
            gameSpeed += 0.2;
            speedIncreaseTimer = 0;
        }
        
        // Generate cars
        carTimer += 16; // assuming ~60fps
        if (carTimer > carInterval) {
            generateCar();
            carTimer = 0;
        }
        
        // Update cars
        for (let i = cars.length - 1; i >= 0; i--) {
            cars[i].y += gameSpeed;
            
            // Check collision
            if (
                Math.abs(bike.x - cars[i].x) < 25 &&
                Math.abs(bike.y - cars[i].y) < 30
            ) {
                gameOver();
            }
            
            // Remove cars that are off screen
            if (cars[i].y > 650) {
                cars.splice(i, 1);
            }
        }
    }
    
    // Generate a new car
    function generateCar() {
        const lane = Math.floor(Math.random() * 3);
        const color = carColors[Math.floor(Math.random() * carColors.length)];
        
        cars.push({
            x: lanes[lane],
            y: -50,
            width: 40,
            height: 70,
            color: color,
            lane: lane
        });
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw road markings
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let y = 0; y < 600; y += 40) {
            ctx.beginPath();
            ctx.moveTo(100, y);
            ctx.lineTo(100, y + 20);
            ctx.moveTo(200, y);
            ctx.lineTo(200, y + 20);
            ctx.stroke();
        }
        
        // Draw cars
        cars.forEach(car => {
            // Car body
            ctx.fillStyle = car.color;
            ctx.fillRect(car.x - 20, car.y - 35, car.width, car.height);
            
            // Car windows
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(car.x - 15, car.y - 25, 30, 20);
            ctx.fillRect(car.x - 15, car.y + 5, 30, 10);
            
            // Car glow
            ctx.shadowColor = car.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(car.x - 20, car.y - 35, car.width, car.height);
            ctx.shadowBlur = 0;
        });
        
        // Draw bike
        ctx.fillStyle = bike.color;
        
        // Bike body
        ctx.beginPath();
        ctx.moveTo(bike.x, bike.y - 10);
        ctx.lineTo(bike.x + 15, bike.y + 20);
        ctx.lineTo(bike.x - 15, bike.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // Bike wheels
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(bike.x - 10, bike.y + 25, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bike.x + 10, bike.y + 25, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Bike glow
        ctx.shadowColor = bike.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Bike light
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(bike.x, bike.y - 15, 3, 0, Math.PI * 2);
        ctx.fill();
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