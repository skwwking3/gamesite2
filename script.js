const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 게임 상태 및 점수 관련
let ammo = 2;
let lives = 3;
let score = 0;
// 브라우저에 저장된 최고 기록 가져오기 (없으면 0)
let highScore = localStorage.getItem('aimGameHighScore') || 0; 

let gameState = "COUNTDOWN"; 
let countdownNum = 3;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 0,
    dy: 0,
    gravity: 0.18 // 중력을 0.15에서 0.18로 살짝 높였습니다.
};

function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
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

    // --- UI 영역 (기존 겹침 버그 해결 구조) ---
    ctx.save(); 
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; 
    ctx.textBaseline = "top"; 
    ctx.font = "bold 22px Arial";

    ctx.fillText(`Ammo: ${ammo}`, 25, 25); 
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 25, 60); 
    ctx.fillText(`Score: ${score}`, 25, 95); // 현재 점수
    ctx.fillStyle = "#ffd700"; // 최고 기록은 금색으로 표시
    ctx.fillText(`Best: ${highScore}`, 25, 130); 
    ctx.restore(); 

    // --- 공 그리기 ---
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444";
    ctx.fill();
    ctx.closePath();

    if (gameState === "PLAYING") {
        ball.dy += ball.gravity;
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx *= -0.8;
            ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
        }

        if (ball.y + ball.radius > canvas.height) {
            lives--;
            if (lives > 0) {
                startCountdown(); 
            } else {
                // 게임 오버 시 최고 기록 저장 로직
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('aimGameHighScore', highScore);
                }
                gameState = "GAMEOVER";
            }
        }
    } 
    else if (gameState === "COUNTDOWN") {
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
        score = 0; // 새 게임 시작 시 점수 초기화
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
        score++; // 공을 맞출 때마다 점수 1점 추가
    }
});

startCountdown();
draw();