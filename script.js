const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ammoDisplay = document.getElementById('ammo');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ammo = 2;
let lives = 3;
let gameState = "COUNTDOWN"; 
let countdownNum = 3;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 0,
    dy: 0,
    gravity: 0.15
};

function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    
    // 리셋 시 공 위치와 속도 초기화
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    
    // 요청하신 기능: 목숨이 깎이고 새로 시작할 때 총알 장전
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

    // 1. UI 겹침 버그 수정 (좌표와 정렬 조정)
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; // 정렬을 왼쪽으로 고정
    ctx.font = "bold 24px Arial";
    ctx.fillText(`Ammo: ${ammo}`, 30, 50);  // y좌표 50
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 30, 90); // y좌표 90으로 간격 벌림

    // 공 그리기
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
                gameState = "GAMEOVER";
            }
        }
    } else if (gameState === "COUNTDOWN") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "bold 100px Arial";
        ctx.textAlign = "center";
        ctx.fillText(countdownNum, canvas.width / 2, canvas.height / 2);
    } else if (gameState === "GAMEOVER") {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "bold 60px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "30px Arial";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 60);
    }

    requestAnimationFrame(draw);
}

window.addEventListener('mousedown', (e) => {
    if (gameState === "GAMEOVER") {
        lives = 3;
        startCountdown();
        return;
    }

    if (gameState !== "PLAYING" || ammo <= 0) return;

    // 사격 시 총알 감소
    ammo--;

    const diffX = ball.x - e.clientX;
    const diffY = ball.y - e.clientY;
    const dist = Math.sqrt(diffX**2 + diffY**2);

    if (dist < ball.radius) {
        ball.dx = diffX * 0.3; 
        ball.dy = diffY * 0.4;
        ammo = 2; // 맞추면 다시 장전
    }
});

startCountdown();
draw();