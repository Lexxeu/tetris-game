document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const previewCanvas = document.getElementById("previewCanvas");
  const ctx = canvas.getContext("2d");
  const previewCtx = previewCanvas.getContext("2d");
  const toggleBtn = document.getElementById("toggleBtn");
  const scoreDisplay = document.getElementById("score");
  const gameMusic = document.getElementById("gameMusic");
  const moveSound = document.getElementById("moveSound");
  const rotateSound = document.getElementById("rotateSound");
  const lineClearSound = document.getElementById("lineClearSound");
  const dropSound = document.getElementById("dropSound");

  const blockSize = 30; // Size of each block in pixels
  const gridWidth = canvas.width / blockSize;
  const gridHeight = canvas.height / blockSize;
  const previewWidth = previewCanvas.width / blockSize;
  const previewHeight = previewCanvas.height / blockSize;
  let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0)); // Initialize grid

  const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: "cyan" }, // I-shape
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      color: "red",
    }, // Z-shape
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      color: "green",
    }, // S-shape
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "yellow",
    }, // O-shape
    {
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
      color: "purple",
    }, // T-shape
    {
      shape: [
        [1, 1, 1],
        [1, 0, 0],
      ],
      color: "orange",
    }, // L-shape
    {
      shape: [
        [1, 1, 1],
        [0, 0, 1],
      ],
      color: "blue",
    }, // J-shape
  ];

  let currentTetromino = null;
  let currentPosition = { x: 4, y: 0 }; // Starting position
  let gameInterval;
  let isPaused = true;
  let nextTetromino = getRandomTetromino(); // Prepare the next Tetromino
  let score = 0; // Initialize score

  // Scoring rules
  const pointsPerLine = 100;
  const pointsPerLineCleared = (lines) => lines * pointsPerLine * lines; // Example: 100 pts per line, multiplied by the number of lines

  function getRandomTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoes.length);
    return tetrominoes[randomIndex];
  }

  function drawTetromino() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw the grid
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = grid[y][x];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
          // Draw the border
          ctx.strokeStyle = "black"; // Border color
          ctx.lineWidth = 1; // Border width
          ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }

    // Draw the current Tetromino
    if (!currentTetromino) return;

    const shape = currentTetromino.shape;
    const color = currentTetromino.color;
    ctx.fillStyle = color;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const xPos = (currentPosition.x + x) * blockSize;
          const yPos = (currentPosition.y + y) * blockSize;
          ctx.fillRect(xPos, yPos, blockSize, blockSize);
          // Draw the border
          ctx.strokeStyle = "black"; // Border color
          ctx.lineWidth = 1; // Border width
          ctx.strokeRect(xPos, yPos, blockSize, blockSize);
        }
      }
    }
  }

  function drawPreview() {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear preview canvas

    if (!nextTetromino) return;

    const shape = nextTetromino.shape;
    const color = nextTetromino.color;
    previewCtx.fillStyle = color;

    // Center the preview Tetromino
    const startX = Math.floor((previewWidth - shape[0].length) / 2);
    const startY = Math.floor((previewHeight - shape.length) / 2);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const xPos = (startX + x) * blockSize;
          const yPos = (startY + y) * blockSize;
          previewCtx.fillRect(xPos, yPos, blockSize, blockSize);
          // Draw the border
          previewCtx.strokeStyle = "black"; // Border color
          previewCtx.lineWidth = 1; // Border width
          previewCtx.strokeRect(xPos, yPos, blockSize, blockSize);
        }
      }
    }
  }

  function isPositionValid(shape, offsetX, offsetY) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridX = offsetX + x;
          const gridY = offsetY + y;

          if (gridX < 0 || gridX >= gridWidth || gridY >= gridHeight) {
            return false; // Out of bounds
          }
          if (gridY >= 0 && grid[gridY][gridX]) {
            return false; // Collision with existing blocks
          }
        }
      }
    }
    return true;
  }

  function placeTetromino() {
    const shape = currentTetromino.shape;
    const color = currentTetromino.color;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          grid[currentPosition.y + y][currentPosition.x + x] = color;
        }
      }
    }
    const linesCleared = clearFullLines();
    if (linesCleared > 0) {
      lineClearSound.play();
    }
    updateScore(linesCleared);
  }

  function clearFullLines() {
    let linesCleared = 0;
    for (let y = gridHeight - 1; y >= 0; y--) {
      if (grid[y].every((cell) => cell)) {
        grid.splice(y, 1);
        grid.unshift(Array(gridWidth).fill(0));
        linesCleared++;
        y++; // Recheck the current line
      }
    }
    return linesCleared;
  }

  function updateScore(linesCleared) {
    if (linesCleared > 0) {
      score += pointsPerLineCleared(linesCleared);
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  function dropTetromino() {
    const shape = currentTetromino.shape;
    if (isPositionValid(shape, currentPosition.x, currentPosition.y + 1)) {
      currentPosition.y++;
    } else {
      placeTetromino();
      currentTetromino = nextTetromino;
      nextTetromino = getRandomTetromino();
      drawPreview();
      dropSound.play();
      currentPosition = { x: 4, y: 0 };
      if (
        !isPositionValid(
          currentTetromino.shape,
          currentPosition.x,
          currentPosition.y
        )
      ) {
        gameOver();
      }
    }
    drawTetromino();
  }

  function dropTetrominoInstantly() {
    while (
      isPositionValid(
        currentTetromino.shape,
        currentPosition.x,
        currentPosition.y + 1
      )
    ) {
      currentPosition.y++;
    }
    placeTetromino();
    dropSound.play();
    currentTetromino = nextTetromino;
    nextTetromino = getRandomTetromino();
    drawPreview();
    currentPosition = { x: 4, y: 0 };
    if (
      !isPositionValid(
        currentTetromino.shape,
        currentPosition.x,
        currentPosition.y
      )
    ) {
      gameOver();
    }
    drawTetromino();
  }

  function startGame() {
    if (!currentTetromino) {
      currentTetromino = nextTetromino;
      nextTetromino = getRandomTetromino();
      drawPreview();
    }
    isPaused = false;
    gameMusic.play(); // Play the music
    gameInterval = setInterval(dropTetromino, 1000);
  }

  function pauseGame() {
    isPaused = true;
    gameMusic.pause(); // Pause the music
    clearInterval(gameInterval);
  }

  function rotateTetromino() {
    const shape = currentTetromino.shape;
    const rotatedShape = shape[0]
      .map((_, i) => shape.map((row) => row[i]))
      .reverse();
    if (isPositionValid(rotatedShape, currentPosition.x, currentPosition.y)) {
      currentTetromino.shape = rotatedShape;
      rotateSound.play();
    }
    drawTetromino();
  }

  function moveTetromino(direction) {
    const shape = currentTetromino.shape;
    let newX = currentPosition.x;
    let newY = currentPosition.y;

    if (direction === "left") {
      newX--;
    } else if (direction === "right") {
      newX++;
    } else if (direction === "down") {
      newY++;
    }

    if (isPositionValid(shape, newX, newY)) {
      currentPosition.x = newX;
      currentPosition.y = newY;
      moveSound.play();
    }
    drawTetromino();
  }

  function gameOver() {
    pauseGame();
    alert("Game Over!");
    grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0)); // Reset grid
    score = 0; // Reset score
    scoreDisplay.textContent = "Score: 0";
    currentTetromino = null; // Reset current Tetromino
    nextTetromino = getRandomTetromino(); // Get a new Tetromino
    drawPreview(); // Draw the preview of the next Tetromino
  }

  document.addEventListener("keydown", (e) => {
    if (isPaused) return;
    if (e.key === "ArrowLeft") {
      moveTetromino("left");
    } else if (e.key === "ArrowRight") {
      moveTetromino("right");
    } else if (e.key === "ArrowDown") {
      moveTetromino("down");
    } else if (e.key === "ArrowUp") {
      rotateTetromino();
    } else if (e.key === " ") {
      // Spacebar for instant drop
      dropTetrominoInstantly();
    }
  });

  toggleBtn.addEventListener("click", () => {
    if (isPaused) {
      startGame();
    } else {
      pauseGame();
    }
  });

  // Initialize
  drawPreview(); // Draw the initial preview
});
