const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- 게임 상태 변수 ---
let ammo = 2;
let lives = 3;
let score = 0;
// 로컬 스토리지에서 최고 기록 불러오기
let highScore = localStorage.getItem('aimGameHighScore') || 0; 

let gameState = "COUNTDOWN"; 
let countdownNum = 3;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 0,
    dy: 0,
    gravity: 0.18 // 살짝 무거워진 중력
};

// --- 카운트다운 및 리셋 함수 ---
function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    
    // 공 위치 및 속도 초기화
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    
    // 재시작 시 총알 2발로 장전
    ammo = 2; 

    const timer = setInterval(() => {
        countdownNum--;
        if (countdownNum <= 0) {
            clearInterval(timer);
            gameState = "PLAYING";
        }
    }, 1000);
}

// --- 메인 그리기 함수 ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. UI 그리기 (save/restore로 설정 꼬임 방지)
    ctx.save(); 
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; 
    ctx.textBaseline = "top"; 
    ctx.font = "bold 22px Arial";

    ctx.fillText(`Ammo: ${ammo}`, 25, 25); 
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 25, 60); 
    ctx.fillText(`Score: ${score}`, 25, 95); 
    ctx.fillStyle = "#ffd700"; // 최고 기록은 금색
    ctx.fillText(`Best: ${highScore}`, 25, 130); 
    ctx.restore(); 

    // 2. 공 그리기
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444"; // 총알 없으면 빨간색
    ctx.fill();
    ctx.closePath();

    // 3. 게임 상태별 로직
    if (gameState === "PLAYING") {
        ball.dy += ball.gravity;
        ball.x += ball.dx;
        ball.y += ball.dy;

        // [벽 충돌] 좌우 벽
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx *= -0.8;
            ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
        }

        // [벽 충돌] 천장 (뚫고 나가지 않게)
        if (ball.y - ball.radius < 0) {
            ball.dy *= -0.5; // 반동을 주어 튕겨 내려옴
            ball.y = ball.radius;
        }

        // [바닥 충돌] 사망 판정
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            // 최고 기록 갱신 체크
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

// --- 마우스 클릭 이벤트 ---
window.addEventListener('mousedown', (e) => {
    // 게임 오버 상태에서 클릭 시 전체 리셋
    if (gameState === "GAMEOVER") {
        lives = 3;
        score = 0;
        startCountdown();
        return;
    }

    if (gameState !== "PLAYING" || ammo <= 0) return;

    ammo--; // 사격

    const diffX = ball.x - e.clientX;
    const diffY = ball.y - e.clientY;
    const dist = Math.sqrt(diffX**2 + diffY**2);

    // 공 적중 판정
    if (dist < ball.radius) {
        ball.dx = diffX * 0.3; // 중심에서 멀어질수록 반대 방향 힘 증가
        ball.dy = diffY * 0.4;
        ammo = 2; // 재장전
        score++; // 점수 획득
    }
});

// 화면 크기 조절 대응
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 게임 시작
startCountdown();
draw();