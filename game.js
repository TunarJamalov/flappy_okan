const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas'ı tam ekran yap
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// İlk boyutlandırma
resizeCanvas();

// Pencere boyutu değiştiğinde canvas'ı yeniden boyutlandır
window.addEventListener('resize', () => {
    resizeCanvas();
    resetGame();
});

// Kuş resmi
const birdImage = new Image();
birdImage.src = 'bokaningifideneme1.gif'; // Kuş resminizin yolu

// Kuş boyutlarını ayarlayalım
const bird = {
    x: canvas.width * 0.2,
    y: canvas.height / 2,
    width: Math.min(canvas.width * 0.08, 80),  // Boyutu biraz büyüttük
    height: Math.min(canvas.width * 0.08, 80), // Boyutu biraz büyüttük
    gravity: 0.3,
    velocity: 0,
    jump: -7
};

const pipes = [];
const pipeWidth = Math.min(canvas.width * 0.08, 80); // Responsive boru genişliği
const pipeGap = Math.min(canvas.height * 0.35, 250); // Borular arasındaki boşluğu azalt
let score = 0;
let gameOver = false;

// Boruları oluştur
function createPipe() {
    const minHeight = canvas.height * 0.1; // Minimum yükseklik
    const maxHeight = canvas.height * 0.5; // Maximum yüksekliği 0.4'ten 0.3'e düşürdük
    const gapPosition = Math.random() * (maxHeight - minHeight) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: gapPosition,
        bottomY: gapPosition + pipeGap
    });
}

// Her 2.5 saniyede bir boru oluştur
setInterval(createPipe, 5000);

// Kuşun zıplaması
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        bird.velocity = bird.jump;
    }
    if (e.code === 'Space' && gameOver) {
        resetGame();
    }
});

// Oyunu sıfırla
function resetGame() {
    bird.x = canvas.width * 0.2;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.width = Math.min(canvas.width * 0.08, 80);
    bird.height = Math.min(canvas.width * 0.08, 80);
    pipes.length = 0;
    score = 0;
    gameOver = false;
}

// Çarpışma kontrolü
function checkCollision() {
    for (const pipe of pipes) {
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipeWidth &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
            return true;
        }
    }
    return bird.y < 0 || bird.y + bird.height > canvas.height;
}

// Oyun döngüsü
function gameLoop() {
    // Arkaplanı gradyan yaparak daha güzel gösterelim
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e90ff');
    gradient.addColorStop(1, '#87CEEB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        // Kuşu güncelle
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Boruları güncelle
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= 1.5;

            // Boruları daha güzel çiz
            ctx.fillStyle = '#2ecc71';
            // Üst boru
            ctx.fillRect(pipes[i].x, 0, pipeWidth, pipes[i].topHeight);
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(pipes[i].x + pipeWidth - 10, 0, 10, pipes[i].topHeight);
            
            // Alt boru
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(
                pipes[i].x,
                pipes[i].bottomY,
                pipeWidth,
                canvas.height - pipes[i].bottomY
            );
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(
                pipes[i].x + pipeWidth - 10,
                pipes[i].bottomY,
                10,
                canvas.height - pipes[i].bottomY
            );

            // Skoru güncelle
            if (pipes[i].x + pipeWidth < bird.x && !pipes[i].passed) {
                score++;
                pipes[i].passed = true;
            }

            // Ekrandan çıkan boruları sil
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }

        // Kuşu çiz
        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        ctx.rotate(Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5));

        // Kuş resmini çiz
        ctx.drawImage(
            birdImage,
            -bird.width / 2,
            -bird.height / 2,
            bird.width,
            bird.height
        );
        ctx.restore();

        // Çarpışma kontrolü
        if (checkCollision()) {
            gameOver = true;
        }
    } else {
        // Oyun sonu ekranını daha güzel yap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.min(canvas.width * 0.06, 30)}px Arial`;
        ctx.fillText('Game Over!', centerX - 70, centerY);
        ctx.fillText(`Score: ${score}`, centerX - 50, centerY + 40);
        ctx.font = `bold ${Math.min(canvas.width * 0.04, 20)}px Arial`;
        ctx.fillText('Press Space to Restart', centerX - 90, centerY + 80);
    }

    // Skoru responsive şekilde göster
    const scoreSize = Math.min(canvas.width * 0.05, 24);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${scoreSize}px Arial`;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(`Score: ${score}`, 10, scoreSize + 6);
    ctx.fillText(`Score: ${score}`, 10, scoreSize + 6);

    requestAnimationFrame(gameLoop);
}

// Oyunu başlat
gameLoop(); 