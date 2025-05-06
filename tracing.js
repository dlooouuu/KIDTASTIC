const letterGrid = document.getElementById('letter-grid');
const tracingArea = document.getElementById('tracing-area');
const traceImage = document.getElementById('trace-image');
const canvas = document.getElementById('trace-canvas');
const ctx = canvas.getContext('2d');
const backToGridBtn = document.getElementById('back-to-grid');
const completionMessage = document.getElementById('completion-message');
const nextBtn = document.getElementById('next-btn');
let currentLetterIndex = 0;
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

function resizeCanvas() {
    canvas.width = tracingArea.clientWidth;
    canvas.height = tracingArea.clientHeight;
    if (currentLetterIndex >= 0) {
        drawHints(letters[currentLetterIndex]);
    }
}

function drawHints(letter) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff4e50';
    ctx.font = '30px Comic Sans MS';
    const x = canvas.width / 2;
    const y = canvas.height / 2;

    // Add numbered hints and arrows based on the letter
    if (letter === 'a') {
        ctx.fillText('1', x - 50, y + 50);
        ctx.fillText('2', x + 50, y - 50);
        ctx.fillText('3', x + 50, y + 50);
        ctx.fillText('4', x - 50, y - 50);
        ctx.fillText('5', x, y - 10);
        ctx.fillText('6', x, y + 10);

        // Draw arrows
        ctx.strokeStyle = '#ff4e50';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(x - 50, y + 50);
        ctx.lineTo(x + 50, y - 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 50, y - 50);
        ctx.lineTo(x + 50, y + 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 50, y - 50);
        ctx.lineTo(x + 50, y - 50);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    // Add more letter-specific hints as needed
}

window.addEventListener('resize', resizeCanvas);

document.querySelectorAll('.letter-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        currentLetterIndex = index;
        traceImage.src = `picture/${letters[currentLetterIndex]}.png`;
        letterGrid.style.display = 'none';
        tracingArea.style.display = 'flex';
        completionMessage.style.display = 'none';
        resizeCanvas();
        drawHints(letters[currentLetterIndex]);
    });
});

backToGridBtn.addEventListener('click', () => {
    letterGrid.style.display = 'grid';
    tracingArea.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentLetterIndex = 0;
    completionMessage.style.display = 'none';
});

nextBtn.addEventListener('click', () => {
    currentLetterIndex = (currentLetterIndex + 1) % letters.length;
    traceImage.src = `picture/${letters[currentLetterIndex]}.png`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHints(letters[currentLetterIndex]);
    completionMessage.style.display = 'none';
});

let isDrawing = false;
let drawCount = 0;
canvas.addEventListener('mousedown', () => {
    isDrawing = true;
    drawCount = 0;
});
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    if (drawCount > 50) { // Arbitrary threshold to determine if tracing is "complete"
        completionMessage.style.display = 'block';
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.fillStyle = '#ff4e50';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        drawCount++;
    }
});

canvas.addEventListener('touchstart', (e) => {
    isDrawing = true;
    drawCount = 0;
    e.preventDefault();
});

canvas.addEventListener('touchend', () => {
    isDrawing = false;
    if (drawCount > 50) {
        completionMessage.style.display = 'block';
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        ctx.fillStyle = '#ff4e50';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        drawCount++;
    }
    e.preventDefault();
});