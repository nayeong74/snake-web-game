const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // 한 칸의 크기
const canvasSize = 400;
let snake, direction, food, score, gameInterval, isGameOver, speed;

function init() {
  snake = [ { x: 9 * box, y: 9 * box } ];
  direction = 'RIGHT';
  food = randomFood();
  score = 0;
  speed = 180; // 처음 속도를 더 느리게(180ms)
  isGameOver = false;
  document.getElementById('score').textContent = `점수: ${score}`;
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Snake
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    // 머리
    if (i === 0) {
      // 타원형 머리
      ctx.save();
      ctx.translate(s.x + box/2, s.y + box/2);
      if (direction === 'LEFT' || direction === 'RIGHT') {
        ctx.scale(1.2, 1);
      } else {
        ctx.scale(1, 1.2);
      }
      ctx.beginPath();
      ctx.arc(0, 0, box/2, 0, Math.PI * 2);
      ctx.fillStyle = '#3a9a3a';
      ctx.shadowColor = '#185c18';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
      // 눈
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = '#fff';
      let eye1, eye2;
      if (direction === 'LEFT') {
        eye1 = {x: 5, y: 7}; eye2 = {x: 5, y: 13};
      } else if (direction === 'RIGHT') {
        eye1 = {x: 15, y: 7}; eye2 = {x: 15, y: 13};
      } else if (direction === 'UP') {
        eye1 = {x: 7, y: 5}; eye2 = {x: 13, y: 5};
      } else {
        eye1 = {x: 7, y: 15}; eye2 = {x: 13, y: 15};
      }
      ctx.beginPath();
      ctx.arc(eye1.x, eye1.y, 2.2, 0, Math.PI * 2);
      ctx.arc(eye2.x, eye2.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      // 검은 눈동자
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(eye1.x, eye1.y, 1, 0, Math.PI * 2);
      ctx.arc(eye2.x, eye2.y, 1, 0, Math.PI * 2);
      ctx.fill();
      // 입
      ctx.strokeStyle = '#b44';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (direction === 'LEFT') ctx.arc(4, 10, 2, Math.PI/4, -Math.PI/4, true);
      else if (direction === 'RIGHT') ctx.arc(16, 10, 2, (3*Math.PI)/4, (5*Math.PI)/4, false);
      else if (direction === 'UP') ctx.arc(10, 4, 2, Math.PI/4, (3*Math.PI)/4, false);
      else ctx.arc(10, 16, 2, -Math.PI/4, -3*Math.PI/4, true);
      ctx.stroke();
      ctx.restore();
    }
    // 몸통
    else if (i < snake.length - 1) {
      ctx.save();
      ctx.translate(s.x, s.y);
      // 몸통 색상
      ctx.fillStyle = i % 2 === 0 ? '#6ee66e' : '#4dc24d';
      ctx.fillRect(0, 0, box, box);
      // 줄무늬
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, 3); ctx.lineTo(box-3, box-3);
      ctx.moveTo(3, box-3); ctx.lineTo(box-3, 3);
      ctx.stroke();
      ctx.restore();
    }
    // 꼬리
    else {
      ctx.save();
      ctx.translate(s.x + box/2, s.y + box/2);
      ctx.beginPath();
      ctx.ellipse(0, 0, box/2.5, box/3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe066';
      ctx.shadowColor = '#bfa23a';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }
  }

  // Food (입체 사과)
  ctx.save();
  ctx.translate(food.x + box/2, food.y + box/2);
  // 사과 본체
  let grad = ctx.createRadialGradient(-3, -3, 5, 0, 0, box/2-2);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(0.3, '#ff5f5f');
  grad.addColorStop(1, '#c10000');
  ctx.beginPath();
  ctx.arc(0, 0, box/2-2, 0, Math.PI*2);
  ctx.fillStyle = grad;
  ctx.shadowColor = '#a00';
  ctx.shadowBlur = 8;
  ctx.fill();
  // 사과 꼭지
  ctx.beginPath();
  ctx.moveTo(0, -box/2+4);
  ctx.lineTo(0, -box/2+10);
  ctx.strokeStyle = '#7a3e06';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 잎사귀
  ctx.beginPath();
  ctx.ellipse(5, -box/2+8, 3, 1.5, Math.PI/6, 0, Math.PI*2);
  ctx.fillStyle = '#3a9a3a';
  ctx.fill();
  ctx.restore();

  // Move snake
  let head = { ...snake[0] };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Game over conditions
  if (
    head.x < 0 || head.x >= canvasSize ||
    head.y < 0 || head.y >= canvasSize ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    clearInterval(gameInterval);
    isGameOver = true;
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText('게임 오버!', 120, 200);
    return;
  }

  snake.unshift(head);

  // Food eaten
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = `점수: ${score}`;
    food = randomFood();
    // 점수가 5의 배수일 때마다 속도 증가(난이도 상승)
    if (score % 5 === 0 && speed > 60) {
      speed -= 15; // 난이도 상승 폭을 더 크게
      clearInterval(gameInterval);
      gameInterval = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }
}

document.addEventListener('keydown', e => {
  if (isGameOver) return;
  if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
  else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

function resetGame() {
  init();
}

init();
