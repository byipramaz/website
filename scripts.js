function gameStart() {
    const canvas = document.getElementById('game');
    const context = canvas.getContext('2d');
    const grid = 32;
    const tetrominoSequence = [];
    const playfield = [];
    let count = 0;
    let score = 0; // Initialize score inside gameStart
    let tetromino = null;
    let rAF = null;
    let gameOver = false;

    const startButton = document.getElementById('button1');

    function updateScore() {
        document.getElementById('score').innerText = score;
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function generateSequence() {
        const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z', 'G'];
        while (sequence.length) {
            const rand = getRandomInt(0, sequence.length - 1);
            const name = sequence.splice(rand, 1)[0];
            tetrominoSequence.push(name);
        }
    }
    
    function getNextTetromino() {
        if (tetrominoSequence.length === 0) {
            generateSequence();
        }
        const name = tetrominoSequence.pop();
        const matrix = tetrominos[name];
        const col = Math.floor(playfield[0].length / 2) - Math.ceil(matrix[0].length / 2);
        const row = name === 'I' ? -1 : -2;
        return {
            name: name,
            matrix: matrix,
            row: row,
            col: col
        };
    }
    
    function rotate(matrix) {
        const N = matrix.length - 1;
        const result = matrix.map((row, i) =>
            row.map((val, j) => matrix[N - j][i])
        );
        return result;
    }
    
    function isValidMove(matrix, cellRow, cellCol) {
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] && (
                    cellCol + col < 0 ||
                    cellCol + col >= playfield[0].length ||
                    cellRow + row >= playfield.length ||
                    playfield[cellRow + row][cellCol + col])
                ) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function placeTetromino() {
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    if (tetromino.row + row < 0) {
                        return showGameOver();
                    }
                    playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
                }
            }
        }
    
        let clearedLines = 0;
    
        for (let row = playfield.length - 1; row >= 0;) {
            if (playfield[row].every(cell => !!cell)) {
                clearedLines++;
                for (let r = row; r >= 0; r--) {
                    for (let c = 0; c < playfield[r].length; c++) {
                        playfield[r][c] = playfield[r - 1][c];
                    }
                }
            } else {
                row--;
            }
        }
    
        if (clearedLines > 0) {
            score += 100 * clearedLines;
            updateScore();
        }
    
        tetromino = getNextTetromino();
    }
    
    function showGameOver() {
        cancelAnimationFrame(rAF);
        gameOver = true;
        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '36px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Oyun Bitti!', canvas.width / 2, canvas.height / 2);

        // Change button text to "Yeniden Başla"
        startButton.textContent = 'Yeniden Başla';
    }
    
    for (let row = -2; row < 20; row++) {
        playfield[row] = [];
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }
    
    const tetrominos = {
        'I': [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        'J': [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'L': [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'O': [
            [1, 1],
            [1, 1],
        ],
        'S': [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        'Z': [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        'T': [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        'G': [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ]
    };
    
    const colors = {
        'I': '#3498db',
        'O': '#f1c40f',
        'T': '#9b59b6',
        'S': '#2ecc71',
        'Z': '#e74c3c',
        'J': '#2980b9',
        'L': '#e67e22',
        'G': '#FF69B4'
    };
    
    
    tetromino = getNextTetromino();
    
    function loop() {

        rAF = requestAnimationFrame(loop);
        context.clearRect(0, 0, canvas.width, canvas.height);
    
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                if (playfield[row][col]) {
                    const name = playfield[row][col];
                    context.fillStyle = colors[name];
                    context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
                }
            }
        }
    
        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('ahmet: ' + score, 10, 10);

        if (tetromino) {
            if (++count > 35) {
                tetromino.row++;
                count = 0;
                if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                    tetromino.row--;
                    placeTetromino();
                }
            }
    
            context.fillStyle = colors[tetromino.name];
            for (let row = 0; row < tetromino.matrix.length; row++) {
                for (let col = 0; col < tetromino.matrix[row].length; col++) {
                    if (tetromino.matrix[row][col]) {
                        context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                    }
                }
            }
        }
    }
    
    document.addEventListener('keydown', function (e) {
        if (gameOver) return;
    
        if (e.which === 37 || e.which === 39) {
            const col = e.which === 37
                ? tetromino.col - 1
                : tetromino.col + 1;
            if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                tetromino.col = col;
            }
        }
    
        if (e.which === 38) {
            const matrix = rotate(tetromino.matrix);
            if (isValidMove(matrix, tetromino.row, tetromino.col)) {
                tetromino.matrix = matrix;
            }
        }
    
        if (e.which === 40) {
            const row = tetromino.row + 1;
            if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
                tetromino.row = row - 1;
                placeTetromino();
                return;
            }
            tetromino.row = row;
        }
    });
    
    const toggleButton = document.getElementById('button2');
    const formDiv = document.getElementById('form');
    
    toggleButton.addEventListener('click', function() {
        if (formDiv.style.display === 'flex') {
            formDiv.style.display = 'none';
            toggleButton.textContent = 'Skoru Kaydet';
        } else {
            formDiv.style.display = 'flex';
            toggleButton.textContent = 'Gizle';
        }
    });
    
    // Change button text to "Yeniden Başla" when game starts
    startButton.textContent = 'Yeniden Başla';
    
    updateScore(); // Update the score display at the start
    rAF = requestAnimationFrame(loop);

    function moveTetrominoLeft() {
        if (tetromino) {
            const col = tetromino.col - 1;
            if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                tetromino.col = col;
            }
        }
    }
    
    function moveTetrominoRight() {
        if (tetromino) {
            const col = tetromino.col + 1;
            if (isValidMove(tetromino.matrix, tetromino.row, col)) {
                tetromino.col = col;
            }
        }
    }
    
    function rotateTetrominoClockwise() {
        if (tetromino) {
            const row = tetromino.row + 1;
            if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
                tetromino.row = row - 1;
                placeTetromino();
                return;
            }
            tetromino.row = row;
        }
    }
    
    function speedUpTetromino() {
        if (tetromino) {
            const matrix = rotate(tetromino.matrix);
            if (isValidMove(matrix, tetromino.row, tetromino.col)) {
                tetromino.matrix = matrix;
            }
        }
    }

    let touchStartX = null;
    let touchStartY = null;

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    }

    function handleTouchMove(event) {
    if (!touchStartX || !touchStartY) {
    return;
    }

    let touchEndX = event.touches[0].clientX;
    let touchEndY = event.touches[0].clientY;

    let deltaX = touchStartX - touchEndX;
    let deltaY = touchStartY - touchEndY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            // Sol kaydırma (hareket etme)
            moveTetrominoLeft();
        } else {
            // Sağ kaydırma (hareket etme)
            moveTetrominoRight();
        }
    } else {
        if (deltaY > 0) {
            // Aşağı kaydırma (hızlandırma)
            speedUpTetromino();
        } else {
            // Yukarı kaydırma (döndürme)
            rotateTetrominoClockwise();
        }
    }


    // Değişkenleri sıfırla
    touchStartX = null;
    touchStartY = null;
    }

    function handleTouchEnd(event) {
    // Dokunmatik ekran serbest bırakıldığında yapılacaklar
    }

}



if (window.innerWidth <= 768) {
    gameStart();
}
