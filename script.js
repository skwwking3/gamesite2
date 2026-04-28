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
    ctx.fillText(canFreeze ? "❄️ Skill: READY (Right Click)" : "❄️ Skill: USED", 25, 165);
    
    ctx.fillStyle = "#aaa";
    ctx.font = "14px Arial";
    ctx.fillText(`Gravity: ${ball.gravity.toFixed(3)}`, 25, 200);
    ctx.restore(); 

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

    if (gameState === "PLAYING") {
        if (!isFrozen) {
            // [수정] 중력 상승 속도 대폭 증가 (0.00005 -> 0.0001)
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
    if (e.button === 0) { 
        if (gameState === "GAMEOVER") {
            lives = 3;
            score = 0;
            canFreeze = true; 
            startCountdown();
            return;
        }
        if (gameState !== "PLAYING" || ammo <= 0 || isFrozen) return;

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
    } else if (e.button === 2) { 
        if (gameState === "PLAYING" && canFreeze && !isFrozen) {
            useFreezeSkill();
        }
    }
});

function useFreezeSkill() {
    isFrozen = true;
    canFreeze = false; 
    ball.gravity = INITIAL_GRAVITY; // 중력 초기화
    ammo = 2; // [추가] 얼음 스킬 사용 시 총알 장전
    
    setTimeout(() => {
        isFrozen = false;
    }, 3000);
}

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

startCountdown();
draw();