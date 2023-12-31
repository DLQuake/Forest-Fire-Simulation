let CELL_SIZE = 0;
let GRID_WIDTH = 0;
let GRID_HEIGHT = 0;
let FIRE_PROB = 0;
let TREE_DENSITY = 0;

let grid;
let fireStarted;
let fireSources = [];
let isForestBurned = false;
let burnedTreesCount = 0;
let changesApplied = false;


function applyChanges() {
    CELL_SIZE = parseInt(document.getElementById("cell-size").value);
    GRID_WIDTH = parseInt(document.getElementById("grid-width").value);
    GRID_HEIGHT = parseInt(document.getElementById("grid-height").value);
    TREE_DENSITY = parseInt(document.getElementById("tree-density").value);
    FIRE_PROB = parseFloat(document.getElementById("fire-prob").value);
    const animationSpeed = parseInt(document.getElementById("animation-speed").value);

    if (CELL_SIZE === 0 || GRID_WIDTH === 0 || GRID_HEIGHT === 0 || TREE_DENSITY === 0 || FIRE_PROB === 0 || animationSpeed === 0) {
        alert("Nie można uruchomić symulacji. Proszę ustawić wartości większe niż zero dla każdego parametru w formularzu.");
        return;
    }

    setup();

    frameRate(animationSpeed);

    changesApplied = true;

    if (CELL_SIZE > 0 && GRID_WIDTH > 0 && GRID_HEIGHT > 0 && TREE_DENSITY> 0 && FIRE_PROB > 0 && animationSpeed > 0) {
        document.querySelector('main').style.display = 'block';
    }
}

document.getElementById("tree-density").addEventListener("input", function() {
    document.getElementById("tree-density-output").value = this.value + "%";
});

document.getElementById("fire-prob").addEventListener("input", function () {
    const probabilityValue = parseFloat((this.value / 100).toFixed(2));
    document.getElementById("fire-prob-value").textContent = `${this.value}%`;
    this.value = probabilityValue * 100;
});

document.getElementById("animation-speed").addEventListener("input", function () {
    document.getElementById("animation-speed-value").textContent = this.value;
});

function resetSimulation() {
    grid = Array.from({ length: GRID_WIDTH }, () =>
        Array.from({ length: GRID_HEIGHT }, () => (random() < TREE_DENSITY / 100 ? "tree" : "empty"))
    );
    fireSources = [];
    fireStarted = false;
    isForestBurned = false;
    burnedTreesCount = 0;
}


function setup() {
    createCanvas(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    resetSimulation();
}


function draw() {
    if (changesApplied) {
        resizeCanvas(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

        drawGrid();
        if (!fireStarted) {
            for (let source of fireSources) {
                startFire(source.x, source.y);
            }
        }
        else {
            updateGrid();
            if (!isForestBurned && isEntireForestBurned()) {
                showBurnedMessage();
                isForestBurned = true;
            }
        }

        drawStatistics();
    }
}

function drawGrid() {
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            let state = grid[i][j];
            fill(getCellColor(state));
            rect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function getCellColor(state) {
    switch (state) {
        case "fire":
            return color(255, 0, 0);
        case "tree":
            return color(0, 255, 0);
        case "ash":
            return color(100, 100, 100);
        default:
            return color(150, 75, 0);
    }
}

function mousePressed() {
    let i = floor(mouseX / CELL_SIZE);
    let j = floor(mouseY / CELL_SIZE);
    if (i >= 0 && i < GRID_WIDTH && j >= 0 && j < GRID_HEIGHT && grid[i][j] == "tree") {
        fireSources.push({ x: i, y: j });
        grid[i][j] = "fire";
        fireStarted = true;
        burnedTreesCount++;
    }
}

function updateGrid() {
    let newGrid = Array.from({ length: GRID_WIDTH }, () => Array(GRID_HEIGHT));
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            newGrid[i][j] = grid[i][j];
            if (grid[i][j] == "tree" && hasBurningNeighbor(i, j)) {
                let r = random();
                if (r < FIRE_PROB) {
                    newGrid[i][j] = "fire";
                    burnedTreesCount++;
                }
            }
            else if (grid[i][j] == "fire") {
                newGrid[i][j] = "ash";
            }
        }
    }

    grid = newGrid;
}

function hasBurningNeighbor(i, j) {
    for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {

            if (di === 0 && dj === 0) {
                continue;
            }

            let ni = i + di;
            let nj = j + dj;

            if (ni >= 0 && ni < GRID_WIDTH && nj >= 0 && nj < GRID_HEIGHT) {
                if (grid[ni][nj] === "fire") {
                    return true;
                }
            }
        }
    }

    return false;
}

function isEntireForestBurned() {
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            if (grid[i][j] === "tree") {
                return false;
            }
        }
    }
    return true;
}

function drawStatistics() {
    const statisticsContainer = document.getElementById("statistics-container");

    statisticsContainer.innerHTML = `
        <p>Ilość żywych drzew: ${countLivingTrees()}</p>
        <p>Spalonych drzew: ${burnedTreesCount}</p>
    `;
}

function countLivingTrees() {
    let count = 0;
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            if (grid[i][j] === "tree") {
                count++;
            }
        }
    }
    return count;
}

function showBurnedMessage() {
    alert("Cały las został spalony!");
}
