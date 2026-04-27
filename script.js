const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ammoDisplay = document.getElementById('ammo');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 게임 상태
let ammo = 2;
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    dy: 2,      // 수직 속도
    gravity: 0.15 // 중력 (내려오는 힘)
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 공 그리기
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ammo > 0 ? "#00ff88" : "#ff4444"; // 총알 없으면 빨간색
    ctx.fill();
    ctx.closePath();

    // 중력 적용
    ball.dy += ball.gravity;
    ball.y += ball.dy;

    // 바닥에 떨어지면 초기화 (게임 오버 로직 대신)
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height / 2;
        ball.dy = 0;
        ammo = 2;
    }

    ammoDisplay.innerText = ammo;
    requestAnimationFrame(draw);
}

// 클릭 이벤트 (사격)
window.addEventListener('mousedown', (e) => {
    if (ammo <= 0) return; // 총알 없으면 무시

    ammo--; // 일단 한 발 감소

    // 클릭 위치와 공의 거리 계산 (피타고라스 정리)
    const dist = Math.sqrt((e.clientX - ball.x)**2 + (e.clientY - ball.y)**2);

    // 공을 맞췄다면?
    if (dist < ball.radius) {
        ball.dy = -8; // 위로 튕겨 올라감
        ammo = 2;     // 총알 재장전!
    }
});

draw();