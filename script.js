const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ammo = 2;
let lives = 3;
let score = 0;
let highScore = localStorage.getItem('aimGameHighScore') || 0; 

let gameState = "COUNTDOWN"; 
let countdownNum = 3;

// 초기 중력 상수로 고정
const INITIAL_GRAVITY = 0.18; 
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 0,
    dy: 0,
    gravity: INITIAL_GRAVITY
};

function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    
    // [수정] 중력을 즉시 초기값으로 고정
    ball.gravity = INITIAL_GRAVITY; 
    ammo = 2; 

    const timer = setInterval(() => {
        countdownNum--;
        if (countdownNum <= 0) {
            clearInterval(timer);
            gameState = "PLAYING";
        }
    }, 1000);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save(); 
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; 
    ctx.textBaseline = "top"; 
    ctx.font = "bold 22px Arial";

    ctx.fillText(`Ammo: ${ammo}`, 25, 25); 
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 25, 60); 
    ctx.fillText(`Score: ${score}`, 25, 95); 
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`Best: ${highScore}`, 25, 130); 
    
    // [수정] 중력 수치를 소수점 3자리까지 정확히 표시
    ctx.fillStyle = "#aaa";
    ctx.font = "14px Arial";
    ctx.fillText(`Gravity: ${ball.gravity.toFixed(3)}`, 25, 165);
    ctx.restore(); 

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444";
    ctx.fill();
    ctx.closePath();

    if (gameState === "PLAYING") {
        // 프레임마다 아주 미세하게 중력 증가
        ball.gravity += 0.00003; 

        ball.dy += ball.gravity;
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx *= -0.8;
            ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
        }

        if (ball.y - ball.radius < 0) {
            ball.dy *= -0.5;
            ball.y = ball.radius;
        }

        if (ball.y + ball.radius > canvas.height) {
            lives--;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('aimGameHighScore', highScore);
            }

            if (lives > 0) {
                startCountdown(); 
            } else {
                gameState = "GAMEOVER";
            }
        }
    } 
    else if (gameState === "COUNTDOWN") {
        // 카운트다운 중에도 중력이 늘어나지 않도록 강제 고정
        ball.gravity = INITIAL_GRAVITY;
        
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 100px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(countdownNum, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    } 
    else if (gameState === "GAMEOVER") {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 60px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = "30px Arial";
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 100);
        ctx.restore();
    }

    requestAnimationFrame(draw);
}

window.addEventListener('mousedown', (e) => {
    if (gameState === "GAMEOVER") {
        lives = 3;
        score = 0;
        startCountdown();
        return;
    }

    if (gameState !== "PLAYING" || ammo <= 0) return;

    ammo--;
    const diffX = ball.x - e.clientX;
    const diffY = ball.y - e.clientY;
    const dist = Math.sqrt(diffX**2 + diffY**2);

    if (dist < ball.radius) {
        ball.dx = diffX * 0.3; 
        ball.dy = diffY * 0.4;
        ammo = 2; 
        score++;
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

startCountdown();
draw();