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

const INITIAL_GRAVITY = 0.18; 
let speedMultiplier = 1.0; 
let globalGravity = INITIAL_GRAVITY;

let balls = [];

function initBalls(count) {
    balls = [];
    currentBallCount = count;
    for (let i = 0; i < count; i++) {
        balls.push({
            x: canvas.width / 2 + (i * 100 - 50),
            y: canvas.height / 2,
            radius: 30,
            dx: i === 0 ? -4 : 4,
            dy: -7
        });
    }
}

function startCountdown() {
    gameState = "COUNTDOWN";
    countdownNum = 3;
    isFrozen = false; 
    speedMultiplier = 1.0; 
    globalGravity = INITIAL_GRAVITY;
    ammo = 2; 

    balls.forEach((b, i) => {
        b.x = canvas.width / 2 + (i * 100 - 50);
        b.y = canvas.height / 2;
        b.dx = i === 0 ? -4 : 4;
        b.dy = -7;
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
    else if (gameState === "PLAYING") {
        if (!isFrozen) {
            // [밸런스] 공 2개일 때는 속도 상승을 조금 더 완만하게 (이전 버전 느낌)
            const increment = currentBallCount === 1 ? 0.0002 : 0.00012;
            speedMultiplier += increment; 
            globalGravity += (increment * 0.8); 

            balls.forEach(b => {
                // 프레임 드랍처럼 보이지 않게 속도 계산 방식 보정
                b.dy += globalGravity;
                
                // 위치 이동 시 multiplier를 부드럽게 적용
                b.x += b.dx * speedMultiplier;
                b.y += b.dy * speedMultiplier;

                if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) {
                    b.dx *= -0.8;
                    b.x = b.x < b.radius ? b.radius : canvas.width - b.radius;
                }
                if (b.y - b.radius < 0) {
                    b.dy *= -0.5;
                    b.y = b.radius;
                }
                
                if (b.y + b.radius > canvas.height) {
                    handleDeath();
                }
            });
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
    else if (gameState === "GAMEOVER") drawGameOver();

    requestAnimationFrame(draw);
}

// --- UI & Screens ---

function drawUI() {
    ctx.save(); 
    ctx.fillStyle = "white";
    ctx.textAlign = "left"; 
    ctx.textBaseline = "top"; 
    ctx.font = "bold 22px Arial";
    ctx.fillText(`Ammo: ${ammo}`, 25, 25); 
    ctx.fillText(`Lives: ${"❤️".repeat(lives)}`, 25, 60); 
    ctx.fillText(`Score: ${score}`, 25, 95); 
    
    let currentBest = currentBallCount === 1 ? highScore1 : highScore2;
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`Best (${currentBallCount} Ball): ${currentBest}`, 25, 130); 
    
    ctx.fillStyle = canFreeze ? "#00d4ff" : "#555";
    ctx.fillText(canFreeze ? "❄️ Skill: READY (R-Click)" : "❄️ Skill: USED", 25, 165);
    ctx.restore(); 
}

function drawStartScreen() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00ff88";
    ctx.textAlign = "center";
    ctx.font = "bold 60px Arial";
    ctx.fillText("AIM JUGGLING", canvas.width / 2, canvas.height / 2 - 150);
    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText("• Left Click: Shoot the ball to bounce it back up", canvas.width / 2, canvas.height / 2 - 60);
    ctx.fillText("• Right Click: Ice Skill (3s Freeze + Reset Physics + Reload)", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("• Warning: Only 2 bullets! Don't miss.", canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("• Game speed and gravity increase over time.", canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 35px Arial";
    ctx.fillText("Press [ ENTER ] to Continue", canvas.width / 2, canvas.height / 2 + 160);
    ctx.restore();
}

function drawSelectScreen() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 45px Arial";
    ctx.fillText("SELECT MODE", canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = "28px Arial";
    ctx.fillStyle = "#00ff88";
    ctx.fillText(`[ 1 ] 1 BALL Mode (Best: ${highScore1})`, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "#ff4444";
    ctx.fillText(`[ 2 ] 2 BALLS Mode (Best: ${highScore2})`, canvas.width / 2, canvas.height / 2 + 60);
    ctx.restore();
}

function drawGameOver() {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 60px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "30px Arial";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillStyle = "#ffd700";
    ctx.fillText("Press [ ENTER ] to Restart", canvas.width / 2, canvas.height / 2 + 110);
    ctx.restore();
}

function drawBall(b) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
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

function handleDeath() {
    lives--;
    if (currentBallCount === 1) {
        if (score > highScore1) {
            highScore1 = score;
            localStorage.setItem('aimGameHighScore1', highScore1);
        }
    } else {
        if (score > highScore2) {
            highScore2 = score;
            localStorage.setItem('aimGameHighScore2', highScore2);
        }
    }
    if (lives > 0) startCountdown(); 
    else gameState = "GAMEOVER";
}

// --- Events ---

window.addEventListener('keydown', (e) => {
    if (e.code === "Enter" || e.keyCode === 13) {
        if (gameState === "START" || gameState === "GAMEOVER") {
            gameState = "SELECT";
        }
    }
    if (gameState === "SELECT") {
        if (e.key === "1") {
            lives = 3; score = 0; canFreeze = true;
            initBalls(1);
            startCountdown();
        } else if (e.key === "2") {
            lives = 3; score = 0; canFreeze = true;
            initBalls(2);
            startCountdown();
        }
    }
});

window.addEventListener('mousedown', (e) => {
    if (gameState !== "PLAYING" || isFrozen) return;

    if (e.button === 0) { 
        if (ammo <= 0) return;
        ammo--;
        
        let hit = false;
        balls.forEach(b => {
            const diffX = b.x - e.clientX;
            const diffY = b.y - e.clientY;
            const dist = Math.sqrt(diffX**2 + diffY**2);

            if (dist < b.radius) {
                // [수정] 튕기는 힘(Force)을 더 강력하게 상향 (0.35/0.45 -> 0.5/0.6)
                b.dx = diffX * 0.5; 
                b.dy = diffY * 0.6;
                hit = true;
                score++;
            }
        });
        if (hit) ammo = 2;
    } else if (e.button === 2) { 
        if (canFreeze) useFreezeSkill();
    }
});

function useFreezeSkill() {
    isFrozen = true;
    canFreeze = false; 
    globalGravity = INITIAL_GRAVITY;
    speedMultiplier = 1.0; 
    ammo = 2; 
    setTimeout(() => { isFrozen = false; }, 3000);
}

window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

draw();