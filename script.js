const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ammo = 2;
let lives = 3;
let score = 0;
let highScore = localStorage.getItem('aimGameHighScore') || 0; 

let gameState = "START"; 
let countdownNum = 3;

let isFrozen = false; 
let canFreeze = true; 

const INITIAL_GRAVITY = 0.18; 
let speedMultiplier = 1.0; 

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
    speedMultiplier = 1.0; 
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
        ctx.fillText(canFreeze ? "❄️ Skill: READY (R-Click)" : "❄️ Skill: USED", 25, 165);
        
        ctx.fillStyle = "#aaa";
        ctx.font = "14px Arial";
        ctx.fillText(`Velocity Multiplier: x${speedMultiplier.toFixed(2)}`, 25, 200);
        ctx.restore(); 
    }

    if (gameState === "START") {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#00ff88";
        ctx.textAlign = "center";
        ctx.font = "bold 60px Arial";
        ctx.fillText("AIM JUGGLING", canvas.width / 2, canvas.height / 2 - 150);
        
        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        // [수정] 좌클릭 설명에서 Reload 문구 삭제
        ctx.fillText("• Left Click: Shoot the ball to bounce it back up", canvas.width / 2, canvas.height / 2 - 60);
        ctx.fillText("• Right Click: Ice Skill (3s Freeze + Reset Gravity + Reload)", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("• Warning: You only have 2 bullets! Use them carefully.", canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("• Game speed increases rapidly over time.", canvas.width / 2, canvas.height / 2 + 60);
        
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 35px Arial";
        ctx.fillText("Press [ ENTER ] to Start", canvas.width / 2, canvas.height / 2 + 160);
        ctx.restore();
    }
    else if (gameState === "PLAYING") {
        drawBall();
        if (!isFrozen) {
            speedMultiplier += 0.0002; 
            
            ball.dy += ball.gravity * speedMultiplier;
            ball.x += ball.dx * speedMultiplier;
            ball.y += ball.dy * speedMultiplier;

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
        ctx.font = "30px Arial";
        ctx.fillText(`Score: ${score} | Best: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillStyle = "#ffd700";
        ctx.fillText("Press [ ENTER ] to Restart", canvas.width / 2, canvas.height / 2 + 110);
        ctx.restore();
    }

    requestAnimationFrame(draw);
}

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

window.addEventListener('mousedown', (e) => {
    if (gameState !== "PLAYING" || isFrozen) return;

    if (e.button === 0) { 
        if (ammo <= 0) return;
        ammo--;
        const diffX = ball.x - e.clientX;
        const diffY = ball.y - e.clientY;
        const dist = Math.sqrt(diffX**2 + diffY**2);

        if (dist < ball.radius) {
            ball.dx = diffX * 0.3; 
            ball.dy = diffY * 0.4;
            // [복구] 공을 맞추면 다시 장전되는 로직 유지
            ammo = 2; 
            score++;
        }
    } else if (e.button === 2) { 
        if (canFreeze) useFreezeSkill();
    }
});

function useFreezeSkill() {
    isFrozen = true;
    canFreeze = false; 
    ball.gravity = INITIAL_GRAVITY;
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