const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ammo = 2;
let lives = 3;
let score = 0;
let highScore = localStorage.getItem('aimGameHighScore') || 0; 

// [수정] 첫 상태를 START로 설정하여 설명 화면부터 보이게 합니다.
let gameState = "START"; 
let countdownNum = 3;

let isFrozen = false; 
let canFreeze = true; 

const INITIAL_GRAVITY = 0.18; 
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dx: 0,
    dy: 0,
    gravity: INITIAL_GRAVITY
};

// 카운트다운 함수
function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    isFrozen = false; 
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
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

    // --- 게임 플레이 중이거나 카운트다운일 때만 상단 UI 표시 ---
    if (gameState === "PLAYING" || gameState === "COUNTDOWN") {
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
        ctx.fillStyle = canFreeze ? "#00d4ff" : "#555";
        ctx.fillText(canFreeze ? "❄️ Skill: READY" : "❄️ Skill: USED", 25, 165);
        ctx.restore(); 
    }

    // --- 상태별 화면 ---
    if (gameState === "START") {
        // [추가] 초기 게임 설명 화면
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#00ff88";
        ctx.textAlign = "center";
        ctx.font = "bold 50px Arial";
        ctx.fillText("AIM JUGGLING", canvas.width / 2, canvas.height / 2 - 150);
        
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("• 좌클릭: 공 맞추기 (맞추면 반대방향으로 이동 & 장전)", canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText("• 우클릭: 얼음 스킬 (3초간 정지 + 중력리셋 + 장전 / 게임당 1회)", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("• 주의: 총알은 단 2발! 맞추지 못하면 장전되지 않습니다.", canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("• 시간이 갈수록 중력이 급격히 무거워집니다.", canvas.width / 2, canvas.height / 2 + 60);
        
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 30px Arial";
        ctx.fillText("Press [ ENTER ] to Start", canvas.width / 2, canvas.height / 2 + 150);
        ctx.restore();
    }
    else if (gameState === "PLAYING") {
        // 물리 엔진 (공 그리기 포함)
        drawBall();
        if (!isFrozen) {
            ball.gravity += 0.0001; 
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
                if (lives > 0) startCountdown(); 
                else gameState = "GAMEOVER";
            }
        }
    } 
    else if (gameState === "COUNTDOWN") {
        drawBall();
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
        ctx.font = "25px Arial";
        ctx.fillText(`Final Score: ${score} / Best: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillStyle = "#ffd700";
        ctx.fillText("Press [ ENTER ] to Restart", canvas.width / 2, canvas.height / 2 + 110);
        ctx.restore();
    }

    requestAnimationFrame(draw);
}

// 공 그리기 부분을 함수로 분리
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    if (isFrozen) {
        ctx.fillStyle = "#00d4ff"; 
        ctx.shadowBlur = 25;
        ctx.shadowColor = "#00d4ff";
    } else {
        ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444";
        ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.closePath();
}

// [수정] 키보드 이벤트 추가 (엔터 키 체크)
window.addEventListener('keydown', (e) => {
    if (e.code === "Enter" || e.keyCode === 13) {
        if (gameState === "START" || gameState === "GAMEOVER") {
            lives = 3;
            score = 0;
            canFreeze = true; 
            startCountdown();
        }
    }
});

// 마우스 이벤트
window.addEventListener('mousedown', (e) => {
    if (gameState !== "PLAYING" || isFrozen) return;

    if (e.button === 0) { // 좌클릭
        if (ammo <= 0) return;
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
    } else if (e.button === 2) { // 우클릭
        if (canFreeze) {
            useFreezeSkill();
        }
    }
});

function useFreezeSkill() {
    isFrozen = true;
    canFreeze = false; 
    ball.gravity = INITIAL_GRAVITY;
    ammo = 2; 
    setTimeout(() => { isFrozen = false; }, 3000);
}

window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// draw 함수만 호출 (startCountdown은 엔터 키 누를 때 실행됨)
draw();