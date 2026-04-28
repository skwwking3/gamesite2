const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// const ammoDisplay = document.getElementById('ammo'); <- 이 줄을 삭제하거나 주석 처리하세요

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
    // 1. 화면 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 상단 UI 그리기 (Ammo, Lives)
    // 다른 그리기 설정(정렬 등)에 방해받지 않도록 save/restore 사용
    ctx.save(); 
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; 
    ctx.textBaseline = "top"; 
    ctx.font = "bold 24px Arial";

    // Ammo 표시 (좌측 상단 첫 번째 줄)
    ctx.fillText(`Ammo: ${ammo}`, 20, 20); 
    
    // Lives 표시 (좌측 상단 두 번째 줄 - 60px 위치로 확실히 내림)
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 20, 60); 
    ctx.restore(); 

    // 3. 공 그리기
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    // 총알이 없을 때는 빨간색, 있을 때는 초록색
    ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444";
    ctx.fill();
    ctx.closePath();

    // 4. 게임 상태별 로직
    if (gameState === "PLAYING") {
        // 물리 엔진 적용
        ball.dy += ball.gravity;
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 벽 충돌 로직 (좌우 벽)
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx *= -0.8;
            ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
        }

        // 바닥 충돌 로직 (사망 판정)
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            if (lives > 0) {
                startCountdown(); // 목숨 있으면 다시 카운트다운 (총알도 여기서 장전됨)
            } else {
                gameState = "GAMEOVER";
            }
        }
    } 
    else if (gameState === "COUNTDOWN") {
        // 중앙 카운트다운 숫자 표시
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 100px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(countdownNum, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    } 
    else if (gameState === "GAMEOVER") {
        // 게임 오버 화면 표시
        ctx.save();
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 60px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "30px Arial";
        ctx.fillText("Click to Restart", canvas.width / 2, canvas.height / 2 + 80);
        ctx.restore();
    }

    // 무한 루프 실행
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