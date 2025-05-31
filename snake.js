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
    if (i === 0) {
      ctx.fillStyle = '#007a00'; // 머리: 진한 초록
    } else if (i === snake.length - 1) {
      ctx.fillStyle = '#ffe066'; // 꼬리: 노란색
    } else {
      ctx.fillStyle = '#66ff66'; // 몸통: 연한 초록
    }
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Food
  ctx.fillStyle = '#f00';
  ctx.fillRect(food.x, food.y, box, box);

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
