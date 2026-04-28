const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ammo = 2;
let lives = 3;
let score = 0;
let highScore1 = localStorage.getItem('aimGameHighScore1') || 0; 
let highScore2 = localStorage.getItem('aimGameHighScore2') || 0; 
let currentBallCount = 1;

let gameState = "START"; 
let countdownNum = 3;
let isFrozen = false; 
let canFreeze = true; 

// --- [물리 엔진 설정] ---
const INITIAL_GRAVITY = 0.18;

// 1번 공 모드 (Expert)
let speed1 = 1.0;
let grav1 = INITIAL_GRAVITY;

// 2번 공 모드 (Easy/Relaxed) - 시작 속도 자체를 0.8로 낮게 설정 가능
let speed2 = 1.0; 
let grav2 = INITIAL_GRAVITY;

let balls = [];

function resetCurrentPhysics() {
    if (currentBallCount === 1) {
        speed1 = 1.0;
        grav1 = INITIAL_GRAVITY;
    } else {
        speed2 = 1.0; // 2번 공은 초기 속도 배율 자체를 낮게 유지
        grav2 = INITIAL_GRAVITY;
    }
}

function initBalls(count) {
    balls = [];
    currentBallCount = count;
    resetCurrentPhysics(); 
    
    for (let i = 0; i < count; i++) {
        balls.push({
            x: canvas.width / 2 + (i * 100 - 50), 
            y: canvas.height / 2,
            radius: 30,
            dx: 0, 
            dy: -8 
        });
    }
}

function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    isFrozen = false; 
    resetCurrentPhysics(); 
    ammo = 2; 

    balls.forEach((b, i) => {
        b.x = canvas.width / 2 + (i * 100 - 50);
        b.y = canvas.height / 2;
        b.dx = 0;
        b.dy = -8;
    });

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

    if (gameState === "PLAYING" || gameState === "COUNTDOWN") {
        drawUI();
        balls.forEach(drawBall);
    }

    if (gameState === "START") drawStartScreen();
    else if (gameState === "SELECT") drawSelectScreen();
    else if (gameState === "COUNTDOWN") {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "bold 120px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(countdownNum, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
    else if (gameState === "PLAYING") {
        if (!isFrozen) {
            // [중요] 각 모드별 변수가 실제로 공의 업데이트 함수에 확실히 전달되도록 함
            if (currentBallCount === 1) {
                speed1 += 0.00025;
                grav1 += 0.00015; // 중력 가속도도 수동으로 조절
                updateBalls(speed1, grav1);
            } else {
                // 2번 공: 아주 미세하게 증가하도록 설정 (0.00002)
                speed2 += 0.00002;
                grav2 += 0.00001; 
                updateBalls(speed2, grav2);
            }
        }
    } 
    else if (gameState === "GAMEOVER") drawGameOver();

    requestAnimationFrame(draw);
}

function updateBalls(m, g) {
    balls.forEach(b => {
        // 중력 적용
        b.dy += g;
        
        // 실제 좌표 이동 (m 배율이 x, y 모두에 확실히 곱해짐)
        b.x += (b.dx * m);
        b.y += (b.dy * m);

        // 벽 충돌
        if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) {
            b.dx *= -0.8;
            b.x = b.x < b.radius ? b.radius : canvas.width - b.radius;
        }
        // 천장 충돌
        if (b.y - b.radius < 0) {
            b.dy *= -0.5;
            b.y = b.radius;
        }
        // 바닥 낙하 (사망)
        if (b.y + b.radius > canvas.height) {
            handleDeath();
        }
    });
}

// --- 나머지 스킬 및 UI 로직 (기존과 동일하게 유지) ---

function useFreezeSkill() {
    isFrozen = true;
    canFreeze = false; 
    resetCurrentPhysics(); 
    ammo = 2; 

    setTimeout(() => { 
        isFrozen = false; 
        balls.forEach(b => { b.dx = 0; b.dy = -8; });
    }, 3000);
}

function drawUI() {
    ctx.save(); 
    ctx.fillStyle = "white"; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.font = "bold 22px Arial";
    ctx.fillText(`Ammo: ${ammo}`, 25, 25); 
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 25, 60); 
    ctx.fillText(`Score: ${score}`, 25, 95); 
    let currentBest = currentBallCount === 1 ? highScore1 : highScore2;
    let curS = currentBallCount === 1 ? speed1 : speed2;
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`Best: ${currentBest}`, 25, 130); 
    ctx.fillStyle = canFreeze ? "#00d4ff" : "#555";
    ctx.fillText(canFreeze ? "❄️ Skill: READY" : "❄️ Skill: USED", 25, 165);
    ctx.fillStyle = "#aaa"; ctx.font = "14px Arial";
    ctx.fillText(`Speed Mult: x${curS.toFixed(3)}`, 25, 200);
    ctx.restore(); 
}

function drawStartScreen() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff88"; ctx.textAlign = "center"; ctx.font = "bold 60px Arial";
    ctx.fillText("AIM JUGGLING", canvas.width / 2, canvas.height / 2 - 150);
    ctx.fillStyle = "white"; ctx.font = "20px Arial";
    ctx.fillText("• Left Click: Shoot / Right Click: Ice", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("• 2 Balls mode is much slower now.", canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#ffd700"; ctx.font = "bold 35px Arial";
    ctx.fillText("Press [ ENTER ]", canvas.width / 2, canvas.height / 2 + 100);
    ctx.restore();
}

function drawSelectScreen() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 45px Arial";
    ctx.fillText("SELECT MODE", canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = "28px Arial";
    ctx.fillStyle = "#ff4444"; ctx.fillText(`[ 1 ] 1 BALL (HARD)`, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#00ff88"; ctx.fillText(`[ 2 ] 2 BALLS (EASY)`, canvas.width / 2, canvas.height / 2 + 60);
    ctx.restore();
}

function drawGameOver() {
    ctx.save();
    ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 60px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "30px Arial"; ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillStyle = "#ffd700"; ctx.fillText("Press [ ENTER ] to Restart", canvas.width / 2, canvas.height / 2 + 110);
    ctx.restore();
}

function drawBall(b) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = isFrozen ? "#00d4ff" : (ammo > 0 ? "#00ff88" : "#ff4444");
    ctx.fill(); ctx.closePath();
}

function handleDeath() {
    lives--;
    if (currentBallCount === 1) {
        if (score > highScore1) { highScore1 = score; localStorage.setItem('aimGameHighScore1', highScore1); }
    } else {
        if (score > highScore2) { highScore2 = score; localStorage.setItem('aimGameHighScore2', highScore2); }
    }
    if (lives > 0) startCountdown(); 
    else gameState = "GAMEOVER";
}

window.addEventListener('keydown', (e) => {
    if (e.code === "Enter" || e.keyCode === 13) {
        if (gameState === "START" || gameState === "GAMEOVER") gameState = "SELECT";
    }
    if (gameState === "SELECT") {
        if (e.key === "1") { lives = 3; score = 0; canFreeze = true; initBalls(1); startCountdown(); }
        else if (e.key === "2") { lives = 3; score = 0; canFreeze = true; initBalls(2); startCountdown(); }
    }
});

window.addEventListener('mousedown', (e) => {
    if (gameState !== "PLAYING" || isFrozen) return;
    if (e.button === 0) { 
        if (ammo <= 0) return;
        ammo--;
        let hit = false;
        balls.forEach(b => {
            const dist = Math.sqrt((b.x - e.clientX)**2 + (b.y - e.clientY)**2);
            if (dist < b.radius) {
                b.dx = (b.x - e.clientX) * 0.4; b.dy = (b.y - e.clientY) * 0.5;
                hit = true; score++;
            }
        });
        if (hit) ammo = 2;
    } else if (e.button === 2) { if (canFreeze) useFreezeSkill(); }
});

window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
draw();