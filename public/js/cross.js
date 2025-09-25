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
    let gameSpeed = 2; // Velocidade base do jogo
    let lanes = [];
    
    // Player variables
    const player = {
        x: 200,
        y: 550,
        width: 30,
        height: 30,
        color: '#00ffff'
    };
    
    // Obstacles (cars, rivers, logs)
    const obstacleTypes = [
        { type: 'car', width: 50, height: 30, color: '#ff00ff', speed: 3 }, // Cybercar
        { type: 'car', width: 70, height: 25, color: '#00ffff', speed: -4 }, // Reverse cybercar
        { type: 'river', width: 400, height: 40, color: 'rgba(0, 50, 100, 0.3)' }, // Neon river (fundo)
        { type: 'log', width: 80, height: 30, color: '#663300', speed: 2 } // Floating log
    ];
    
    // Variáveis para controle de toque (touchscreen)
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 30; // Distância mínima em pixels para considerar um swipe
    
    // Initialize lanes (road, river, safe zones)
    function initLanes() {
        // Limpa as pistas existentes
        lanes = [];
        // Adiciona uma pista segura no início
        lanes.push({ y: 560, type: 'safe', obstacles: [] }); // Pista inicial do jogador
        lanes.push({ y: 520, type: 'safe', obstacles: [] });

        for (let i = 2; i < 15; i++) { // Começa de 2 porque as 2 primeiras são seguras
            const type = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'road' : 'river') : 'safe';
            lanes.push({
                y: i * 40,
                type: type,
                obstacles: []
            });
        }
    }
    
    // Generate obstacles for lanes
    function generateObstacles() {
        lanes.forEach(lane => {
            if (lane.type === 'road' || lane.type === 'river') {
                const obstacleCount = Math.floor(Math.random() * 3) + 1; // 1 a 3 obstáculos
                for (let i = 0; i < obstacleCount; i++) {
                    const obstacleType = lane.type === 'road' ? 
                        (Math.random() > 0.5 ? obstacleTypes[0] : obstacleTypes[1]) : // Carros para estradas
                        obstacleTypes[3]; // Toras para rios
                    
                    lane.obstacles.push({
                        ...obstacleType,
                        x: Math.random() * (canvas.width - obstacleType.width), // Posição X aleatória
                        y: lane.y // A posição Y é a da pista
                    });
                }
            }
        });
    }
    
    // Event listeners para teclado
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                player.y -= 40;
                score++; // Aumenta o score ao avançar
                scoreDisplay.textContent = score;
                break;
            case 'ArrowDown':
                if (player.y < canvas.height - player.height) player.y += 40;
                break;
            case 'ArrowLeft':
                if (player.x > 0) player.x -= 40;
                break;
            case 'ArrowRight':
                if (player.x < canvas.width - player.width) player.x += 40;
                break;
        }
    });

    // Event listeners para touchscreen no canvas
    canvas.addEventListener('touchstart', (e) => {
        if (!gameRunning) {
            startGame();
            return; // Impede que o primeiro toque também mova o jogador
        }
        e.preventDefault(); // Previne o scroll da página em dispositivos móveis
        touchStartX = e.touches[0].clientX; // Guarda a posição X inicial do toque
        touchStartY = e.touches[0].clientY; // Guarda a posição Y inicial do toque
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!gameRunning) return;
        e.preventDefault(); // Previne o comportamento padrão do navegador (ex: scroll)
    });

    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning) return;
        e.preventDefault();
        touchEndX = e.changedTouches[0].clientX; // Guarda a posição X final do toque
        touchEndY = e.changedTouches[0].clientY; // Guarda a posição Y final do toque

        const deltaX = touchEndX - touchStartX; // Diferença horizontal
        const deltaY = touchEndY - touchStartY; // Diferença vertical

        // Determina se é um swipe horizontal ou vertical dominante
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            // Swipe Horizontal
            if (deltaX < 0) { // Swipe para a esquerda
                if (player.x > 0) player.x -= 40;
            } else { // Swipe para a direita
                if (player.x < canvas.width - player.width) player.x += 40;
            }
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
            // Swipe Vertical
            if (deltaY < 0) { // Swipe para cima
                player.y -= 40;
                score++; // Aumenta o score ao avançar
                scoreDisplay.textContent = score;
            } else { // Swipe para baixo
                if (player.y < canvas.height - player.height) player.y += 40;
            }
        }
    });
    
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Start game function
    function startGame() {
        gameRunning = true;
        score = 0;
        player.x = 200;
        player.y = 550;
        
        initLanes(); // Reinicia as pistas
        generateObstacles(); // Gera novos obstáculos para as pistas
        
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
        // Move obstacles
        lanes.forEach(lane => {
            if (lane.type === 'road' || lane.type === 'river') {
                lane.obstacles.forEach(obstacle => {
                    obstacle.x += obstacle.speed;
                    
                    // Wrap around screen
                    if (obstacle.speed > 0 && obstacle.x > canvas.width) {
                        obstacle.x = -obstacle.width;
                    } else if (obstacle.speed < 0 && obstacle.x < -obstacle.width) {
                        obstacle.x = canvas.width;
                    }
                    
                    // Check collision with player
                    if (
                        player.y < lane.y + 40 && // Player está na linha do obstáculo
                        player.y + player.height > lane.y &&
                        player.x + player.width > obstacle.x &&
                        player.x < obstacle.x + obstacle.width
                    ) {
                        if (lane.type === 'road') {
                            gameOver(); // Colisão com carro na estrada
                        } else if (lane.type === 'river' && obstacle.type !== 'log') {
                            gameOver(); // Caiu na água sem estar no tronco
                        }
                    }
                });
            }
        });
        
        // Check if player falls in river without log
        const currentPlayerLane = lanes.find(lane => player.y >= lane.y && player.y < lane.y + 40);
        if (currentPlayerLane && currentPlayerLane.type === 'river') {
            let onLog = false;
            currentPlayerLane.obstacles.forEach(obstacle => {
                if (obstacle.type === 'log' &&
                    player.x + player.width > obstacle.x &&
                    player.x < obstacle.x + obstacle.width
                ) {
                    onLog = true;
                    player.x += obstacle.speed; // Move with log
                }
            });
            
            if (!onLog) {
                gameOver();
            }
        }
        
        // Check if player reaches top (new lane generation)
        // Quando o jogador avança para uma nova "tela" de pistas
        if (player.y < 100) {
            player.y += 400; // Move o jogador para baixo na tela
            // Move todas as pistas existentes para baixo
            lanes.forEach(lane => lane.y += 400);
            // Remove as pistas que saíram da tela por baixo
            lanes = lanes.filter(lane => lane.y < canvas.height);
            
            // Adiciona novas pistas no topo
            for (let i = 0; i < 10; i++) { // Adiciona um número suficiente de novas pistas
                const type = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'road' : 'river') : 'safe';
                const newLaneY = lanes.length > 0 ? lanes[0].y - 40 : -40; // Posição acima da pista mais alta
                lanes.unshift({ // Adiciona no início do array
                    y: newLaneY,
                    type: type,
                    obstacles: []
                });
                
                // Adiciona obstáculos às novas pistas
                if (type === 'road' || type === 'river') {
                    const obstacleCount = Math.floor(Math.random() * 2) + 1;
                    for (let j = 0; j < obstacleCount; j++) {
                        const obstacleType = type === 'road' ? 
                            (Math.random() > 0.5 ? obstacleTypes[0] : obstacleTypes[1]) :
                            obstacleTypes[3];
                        
                        lanes[0].obstacles.push({
                            ...obstacleType,
                            x: Math.random() * (canvas.width - obstacleType.width),
                            y: lanes[0].y
                        });
                    }
                }
            }
            // Ordena as pistas por posição Y para garantir a renderização correta
            lanes.sort((a, b) => a.y - b.y);
        }
        // Verifica se o jogador saiu dos limites laterais
        if (player.x < 0 || player.x + player.width > canvas.width) {
            gameOver();
        }
    }
    
    // Draw everything
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw lanes
        lanes.forEach(lane => {
            if (lane.type === 'road') {
                ctx.fillStyle = '#111122';
            } else if (lane.type === 'river') {
                ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
            } else { // safe zone
                ctx.fillStyle = '#0a0a20';
            }
            
            ctx.fillRect(0, lane.y, canvas.width, 40); // Usa canvas.width para preencher a largura total
            
            // Draw lane markings
            if (lane.type === 'road') {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                for (let x = 0; x < canvas.width; x += 40) { // Ajustado para canvas.width
                    ctx.beginPath();
                    ctx.moveTo(x, lane.y + 20);
                    ctx.lineTo(x + 20, lane.y + 20);
                    ctx.stroke();
                }
            } else if (lane.type === 'river') {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                for (let x = 0; x < canvas.width; x += 20) { // Ajustado para canvas.width
                    ctx.beginPath();
                    ctx.moveTo(x, lane.y + 10);
                    ctx.lineTo(x + 10, lane.y + 30);
                    ctx.stroke();
                }
            }
            
            // Draw obstacles
            lane.obstacles.forEach(obstacle => {
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                // Add details to cars
                if (obstacle.type === 'car') {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
                    
                    // Car windows
                    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                    ctx.fillRect(obstacle.x + 10, obstacle.y + 10, obstacle.width - 20, 5);
                }
                
                // Add details to logs
                if (obstacle.type === 'log') {
                    ctx.strokeStyle = '#996633';
                    ctx.lineWidth = 2;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.arc(obstacle.x + 20 + (i * 20), obstacle.y + 15, 5, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
                
                // Glow effect
                ctx.shadowColor = obstacle.color;
                ctx.shadowBlur = 10;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                ctx.shadowBlur = 0;
            });
        });
        
        // Draw player
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Player glow
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Player eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2 + 5, player.y + player.height / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        finalScoreDisplay.textContent = `Score: ${score}`;
        gameOverScreen.style.display = 'flex';
        
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `HI: ${highScore}`;
        }
    }
    
    // Initial draw
    initLanes();
    draw();
});