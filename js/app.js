// Deklaracje zmiennych przechowujących parametry symulacji
let CELL_SIZE = 0;
let GRID_WIDTH = 0;
let GRID_HEIGHT = 0;
let FIRE_PROB = 0;
let TREE_DENSITY = 0;

// Zmienna przechowująca stan planszy symulacji
let grid;

// Flagi kontrolujące stan symulacji
let fireStarted;
let fireSources = [];
let isForestBurned = false;
let burnedTreesCount = 0;
let changesApplied = false;

// Funkcja do zastosowania zmian wprowadzonych przez użytkownika
function applyChanges() {
    CELL_SIZE = parseInt(document.getElementById("cell-size").value);
    GRID_WIDTH = parseInt(document.getElementById("grid-width").value);
    GRID_HEIGHT = parseInt(document.getElementById("grid-height").value);
    TREE_DENSITY = parseInt(document.getElementById("tree-density").value);
    FIRE_PROB = parseFloat(document.getElementById("fire-prob").value) / 100;
    let animationSpeed = parseInt(document.getElementById("animation-speed").value);

    // Sprawdzenie, czy wszystkie parametry są większe niż zero
    if (![CELL_SIZE, GRID_WIDTH, GRID_HEIGHT, TREE_DENSITY, FIRE_PROB, animationSpeed].every(param => param > 0)) {
        alert("Nie można uruchomić symulacji. Proszę ustawić wartości większe niż zero dla każdego parametru w formularzu.");
        return;
    }

    // Inicjalizacja symulacji
    setup();

    // Ustawienie prędkości animacji
    frameRate(animationSpeed);

    // Ustawienie flagi na true, co oznacza, że zmiany zostały zastosowane
    changesApplied = true;

    // Jeśli wszystkie parametry są większe niż zero, pokaż planszę
    if (CELL_SIZE > 0 && GRID_WIDTH > 0 && GRID_HEIGHT > 0 && TREE_DENSITY > 0 && FIRE_PROB > 0 && animationSpeed > 0) {
        document.querySelector('main').style.display = 'block';
    }
}

// Obsługa zdarzenia zmiany gęstości drzew w formularzu
document.getElementById("tree-density").addEventListener("input", function () {
    document.getElementById("tree-density-output").textContent = `${this.value} %`;
});

// Obsługa zdarzenia zmiany prawdopodobieństwa zapłonu w formularzu
document.getElementById("fire-prob").addEventListener("input", function () {
    document.getElementById("fire-prob-value").textContent = `${this.value} %`;
});

// Obsługa zdarzenia zmiany prędkości animacji w formularzu
document.getElementById("animation-speed").addEventListener("input", function () {
    document.getElementById("animation-speed-value").textContent = `${this.value} FPS`;
});


// Funkcja resetująca symulację do początkowego stanu
function resetSimulation() {
    grid = Array.from({ length: GRID_WIDTH }, () =>
        Array.from({ length: GRID_HEIGHT }, () => (random() < TREE_DENSITY / 100 ? "tree" : "empty"))
    );
    fireSources = [];
    fireStarted = false;
    isForestBurned = false;
    burnedTreesCount = 0;
}

// Inicjalizacja planszy przed rozpoczęciem symulacji
function setup() {
    createCanvas(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    resetSimulation();
}

// Funkcja rysująca planszę
function draw() {
    if (changesApplied) {
        // Dostosowanie rozmiaru canvas do nowych parametrów
        resizeCanvas(GRID_WIDTH * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);

        // Rysowanie siatki
        drawGrid();

        // Aktualizacja siatki w kolejnych krokach symulacji
        if (fireStarted) {
            updateGrid();
        }

        // Sprawdzenie, czy cały las spłonął
        if (!isForestBurned && isEntireForestBurned()) {
            showBurnedMessage();
            isForestBurned = true;
        }

        // Rysowanie statystyk
        drawStatistics();
    }
}


// Funkcja rysująca siatkę na podstawie stanu planszy
function drawGrid() {
    // noStroke();

    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            let state = grid[i][j];
            fill(getCellColor(state));
            rect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

// Funkcja zwracająca kolor komórki na podstawie jej stanu
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

// Funkcja obsługująca kliknięcie myszy (rozpoczęcie pożaru w wybranej komórce)
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

// Funkcja aktualizująca stan planszy w kolejnych krokach symulacji
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
            } else if (grid[i][j] == "fire") {
                newGrid[i][j] = "ash";
            }
        }
    }

    grid = newGrid;
}

// Funkcja sprawdzająca, czy dana komórka ma sąsiada w stanie "fire"
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

// Funkcja sprawdzająca, czy cały las został spalony
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

// Funkcja rysująca statystyki na stronie
function drawStatistics() {
    const statisticsContainer = document.getElementById("statistics-container");

    statisticsContainer.innerHTML = `
        <p>Ilość żywych drzew: ${countLivingTrees()}</p>
        <p>Spalonych drzew: ${burnedTreesCount}</p>
    `;
}

// Funkcja zliczająca ilość żywych drzew na planszy
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

// Funkcja wyświetlająca komunikat o spaleniu całego lasu
function showBurnedMessage() {
    alert("Cały las został spalony!");
}
