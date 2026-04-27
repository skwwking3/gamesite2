const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ammoDisplay = document.getElementById('ammo');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 게임 상태
let ammo = 2;
let lives = 3;
let gameState = "COUNTDOWN"; // COUNTDOWN, PLAYING, GAMEOVER
let countdownNum = 3;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 0,        // 수평 속도 추가
    dy: 0,        // 수직 속도
    gravity: 0.15
};

// 카운트다운 타이머
function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;

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

    // UI 그리기 (목숨 및 총알)
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Ammo: ${ammo}`, 20, 40);
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 20, 80);

    // 공 그리기
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444";
    ctx.fill();
    ctx.closePath();

    if (gameState === "PLAYING") {
        // 물리 적용
        ball.dy += ball.gravity;
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 벽 충돌 (옆으로 튕기기)
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx *= -0.8;
        }

        // 바닥에 떨어졌을 때
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            if (lives > 0) {
                startCountdown(); // 목숨 남았으면 다시 카운트다운
            } else {
                gameState = "GAMEOVER";
            }
        }
    } else if (gameState === "COUNTDOWN") {
        ctx.fillStyle = "white";
        ctx.font = "80px Arial";
        ctx.textAlign = "center";
        ctx.fillText(countdownNum, canvas.width / 2, canvas.height / 2 - 100);
        ctx.textAlign = "start";
    } else if (gameState === "GAMEOVER") {
        ctx.fillStyle = "white";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "30px Arial";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 60);
        ctx.textAlign = "start";
    }

    requestAnimationFrame(draw);
}

// 클릭 이벤트
window.addEventListener('mousedown', (e) => {
    if (gameState === "GAMEOVER") {
        lives = 3;
        ammo = 2;
        startCountdown();
        return;
    }

    if (gameState !== "PLAYING" || ammo <= 0) return;

    ammo--;

    // 클릭 위치와 공 중심 사이의 거리(차이) 계산
    const diffX = ball.x - e.clientX;
    const diffY = ball.y - e.clientY;
    const dist = Math.sqrt(diffX**2 + diffY**2);

    // 공을 맞췄을 때
    if (dist < ball.radius) {
        // 반대 방향으로 날아가는 힘 계산 (멀리 누를수록 강하게)
        // 힘의 세기 조절을 위해 0.2 등의 상수를 곱함
        ball.dx = diffX * 0.3; 
        ball.dy = diffY * 0.4; // 위쪽으로 더 잘 튀도록 설정
        
        ammo = 2; // 재장전
    }
});

startCountdown();
draw();