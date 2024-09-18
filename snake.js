const canvas = document.getElementById('snakeGame');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const playButton = document.getElementById('playButton');
const highScoresButton = document.getElementById('highScoresButton');
const menuContainer = document.getElementById('menuContainer');
const gameContainer = document.getElementById('gameContainer');
const highScoresContainer = document.getElementById('highScoresContainer');
const highScoresList = document.getElementById('highScoresList');
const backToMenuButton = document.getElementById('backToMenu');

const gridSize = 20;
let snake = [{ x: 80, y: 160 }];
let direction = { x: 0, y: -gridSize };
let apple = { x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize, y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize };
let obstacles = [];
let isGameOver = false;
let score = 0;
let speed = 150;
const originalSpeed = 150;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        apple = { x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize, y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize };

        if (score % 50 === 0) {
            obstacles.push({
                x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize,
                y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize
            });
        }
    } else {
        snake.pop();
    }

    // Draw apple
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x, apple.y, gridSize, gridSize);

    // Draw snake
    ctx.fillStyle = '#00ffcc';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, gridSize, gridSize));

    // Draw obstacles
    ctx.fillStyle = 'yellow';
    obstacles.forEach(obstacle => ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize));

    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || snakeCollision(head) || obstacleCollision(head)) {
        gameOver();
    }

    setTimeout(gameLoop, speed);
}

function snakeCollision(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function obstacleCollision(head) {
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) return true;
    }
    return false;
}

function gameOver() {
    isGameOver = true;
    alert("Game Over! Press OK to restart.");
    saveHighScore(score);
    resetGame();
}

function resetGame() {
    snake = [{ x: 160, y: 160 }];
    direction = { x: 0, y: -gridSize };
    apple = { x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize, y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize };
    obstacles = [];
    score = 0;
    speed = originalSpeed;
    scoreDisplay.textContent = `Score: ${score}`;
    isGameOver = false;
}

function saveHighScore(score) {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);  // Keep top 5 scores
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function showHighScores() {
    highScoresList.innerHTML = '';
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoresList.appendChild(li);
    });
}

// Handle menu buttons
playButton.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    gameLoop();
});

highScoresButton.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    highScoresContainer.style.display = 'block';
    showHighScores();
});

backToMenuButton.addEventListener('click', () => {
    highScoresContainer.style.display = 'none';
    menuContainer.style.display = 'block';
});

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -gridSize };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: gridSize };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -gridSize, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: gridSize, y: 0 };
            break;
    }
});

// Optimized Touchscreen Controls using touchstart and touchend
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine direction based on swipe distance and ignore small swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 50 && direction.x === 0) {
            direction = { x: gridSize, y: 0 }; // Swipe right
        } else if (deltaX < -50 && direction.x === 0) {
            direction = { x: -gridSize, y: 0 }; // Swipe left
        }
    } else {
        // Vertical swipe
        if (deltaY > 50 && direction.y === 0) {
            direction = { x: 0, y: gridSize }; // Swipe down
        } else if (deltaY < -50 && direction.y === 0) {
            direction = { x: 0, y: -gridSize }; // Swipe up
        }
    }
});