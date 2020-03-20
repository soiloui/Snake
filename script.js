`use strict`;
const PLAY_POOL = document.querySelector("#pool");
const SCORE_div = document.querySelector("#score");

const rows_amount = getComputedStyle(PLAY_POOL)
    .getPropertyValue("grid-template-rows")
    .split(" ").length;
const columns_amount = getComputedStyle(PLAY_POOL)
    .getPropertyValue("grid-template-columns")
    .split(" ").length;
const total_amount = rows_amount * columns_amount;

const player = document.createElement("div");
player.classList.add("play_pool--player");
const food = document.createElement("div");
food.classList.add("play_pool--food");

let TAILS = [];

let gameStatus = 0;
let score = 0;
let baseAcceleration = 1;
let acceleration = .1;
let baseSpeed = 300;
let direction = "none";
let prevDirection = "none";

function GameStart() {
    boardCreate();

    let player_position = Math.floor(Math.random() * total_amount);

    gridAreaSet(player, player_position);
    PLAY_POOL.appendChild(player);

    foodCreate(player_position);
}
function boardCreate() {
    for (let i = 1; i <= total_amount; i++) {
        const POOLS_div = document.createElement("div");

        POOLS_div.classList.add("play_pool--pools");
        PLAY_POOL.appendChild(POOLS_div);

        gridAreaSet(POOLS_div, i);
    }
}

function gridAreaSet(element, position) {
    let row = Math.floor(position / columns_amount);
    let col = position % columns_amount;

    if (row == 0) {
        row = rows_amount;
    }
    if (col == 0) {
        col = columns_amount;
    }

    element.style.gridArea = `${row} / ${col}`;
}
function directionCalculate(e) {
    if (e.keyCode == 37 && prevDirection != "right") {
        direction = "left";
    } else if (e.keyCode == 38 && prevDirection != "down") {
        direction = "up";
    } else if (e.keyCode == 39 && prevDirection != "left") {
        direction = "right";
    } else if (e.keyCode == 40 && prevDirection != "up") {
        direction = "down";
    }

    if (gameStatus == 0) {
        moveFunction();
    }
}

function moveFunction() {
    if (gameStatus == 0) {
        move = setInterval(function() {
            moveFunction();
        }, baseSpeed);
        gameStatus = 1;
    }

    prevDirection = direction;

    let pRow = parseInt(
        getComputedStyle(player).getPropertyValue("grid-row-start")
    );
    let pCol = parseInt(
        getComputedStyle(player).getPropertyValue("grid-column-start")
    );

    tailMove(pRow, pCol);
    wallCollision(pRow, pCol);
    foodCollision(pRow, pCol);
    tailCollision();
}
function wallCollision(pRow, pCol){
    if (direction == "left") {
        if (pCol - 1 != 0) {
            player.style.gridColumnStart = pCol - 1;

            player.style.borderRadius = 0;
            player.style.borderBottomLeftRadius = '50%';
            player.style.borderTopLeftRadius = '50%';
        }
        else breakGame();
    }

    if (direction == "up") {
        if (pRow - 1 != 0) {
            player.style.gridRowStart = pRow - 1;

            player.style.borderRadius = 0;
            player.style.borderTopLeftRadius = '50%';
            player.style.borderTopRightRadius = '50%';
        }
        else breakGame();
    }

    if (direction == "right") {
        if (pCol + 1 != columns_amount + 1) {
            player.style.gridColumnStart = pCol + 1;

            player.style.borderRadius = 0;
            player.style.borderBottomRightRadius = '50%';
            player.style.borderTopRightRadius = '50%';
        }
        else breakGame();
    }

    if (direction == "down") {
        if (pRow + 1 != rows_amount + 1) {
            player.style.gridRowStart = pRow + 1;

            player.style.borderRadius = 0;
            player.style.borderBottomLeftRadius = '50%';
            player.style.borderBottomRightRadius = '50%';
        }
        else breakGame();
    }
}
function tailCollision(){
    let pRow = parseInt(getComputedStyle(player).getPropertyValue("grid-row-start"));
    let pCol = parseInt(getComputedStyle(player).getPropertyValue("grid-column-start"));

    for (let i = 0; i < TAILS.length; i++){
        if (pRow == parseInt(getComputedStyle(TAILS[i]).getPropertyValue('grid-row-start'))
        && pCol == parseInt(getComputedStyle(TAILS[i]).getPropertyValue('grid-column-start'))
        )
        {
            breakGame();
        }
    }
}
function tailMove(pRow, pCol) {
    if (TAILS.length > 0) {
        let row_POSITION = [];
        let col_POSITION = [];

        TAILS.forEach((element, index) => {
            if (index != 0){
                row_POSITION.push(
                    parseInt(
                    getComputedStyle(TAILS[index - 1])
                    .getPropertyValue("grid-row-start")
                    ));

                col_POSITION.push(
                    parseInt(
                    getComputedStyle(TAILS[index - 1])
                    .getPropertyValue("grid-column-start")
                    ));
            }
        });

        TAILS.forEach((element, index) => {
            if (index == 0) {
                element.style.gridRowStart = pRow;
                element.style.gridColumnStart = pCol;
            } else if (index > 0) {
                element.style.gridRowStart = parseInt(
                    row_POSITION[index - 1]
                );
                element.style.gridColumnStart = parseInt(
                    col_POSITION[index - 1]
                );
            }
        });
    }
}
function tailCreate(fRow, fCol){
    let tail = document.createElement("div");
    tail.classList.add("play_pool--tail");
    PLAY_POOL.appendChild(tail);
    TAILS.push(tail);

    if (TAILS.length > 1) {
        TAILS.forEach((element, index) => {
            if (index + 1 == TAILS.length) {
                tail.style.gridRowStart = parseInt(
                    getComputedStyle(TAILS[index - 1]).getPropertyValue(
                        "grid-row-start"
                    )
                );

                tail.style.gridColumnStart = parseInt(
                    getComputedStyle(TAILS[index - 1]).getPropertyValue(
                        "grid-column-start"
                    )
                );
            }
        });
    } else {
        tail.style.gridRowStart = fRow;
        tail.style.gridColumnStart = fCol;
    }
}
function foodCollision(pRow, pCol) {
    let fCol = parseInt(
        getComputedStyle(food).getPropertyValue("grid-column-start")
    );
    let fRow = parseInt(
        getComputedStyle(food).getPropertyValue("grid-row-start")
    );

    if (pCol == fCol && pRow == fRow) {
        clearInterval(move);

        move = setInterval(function() {
            moveFunction();
        }, (baseSpeed / (baseAcceleration + TAILS.length*acceleration)));

        PLAY_POOL.removeChild(food);

        scoreCount(fRow, fCol);
        tailCreate(fRow, fCol);
        foodCreate();
    }
}
function foodCreate(player_position) {
    let food_position = Math.floor(Math.random() * total_amount);

    if (food_position == player_position)
    {
        foodCreate(player_position);
    }
    else if (TAILS.length == 0)
    {
        PLAY_POOL.appendChild(food);
        gridAreaSet(food, food_position);
    }
    else if (TAILS.length > 0 && TAILS.length != total_amount-1)
    {
        let fRow = Math.floor(food_position / columns_amount);
        let fCol = food_position % columns_amount;
        if (fRow == 0) {
            fRow = rows_amount;
        }
        if (fCol == 0) {
            fCol = columns_amount;
        }

        let stop = 0;


        for (let i = 0; i < TAILS.length; i++){
            if (fRow == parseInt(getComputedStyle(TAILS[i]).getPropertyValue('grid-row-start'))
            && fCol == parseInt(getComputedStyle(TAILS[i]).getPropertyValue('grid-column-start'))
            && stop == 0
            )
            {
                stop = 1;
            }
        }

        if (stop != 1)
        {
            PLAY_POOL.appendChild(food);
            food.style.gridRowStart = fRow;
            food.style.gridColumnStart = fCol;
        }
        else
        {
            foodCreate(player_position);
        }

    }

}

function scoreCount(fRow, fCol) {
    score += 10 + TAILS.length;
    SCORE_div.innerText = `SCORE: ${score}`;

    const SCORE_EFFECT_span = document.createElement('span');
    SCORE_EFFECT_span.classList.add('play_pool--score');

    SCORE_EFFECT_span.innerText = `+ ${10 + TAILS.length}`;

    SCORE_EFFECT_span.style.gridRowStart = fRow;
    SCORE_EFFECT_span.style.gridColumnStart = fCol;
    SCORE_EFFECT_span.style.opacity = 1;

    PLAY_POOL.appendChild(SCORE_EFFECT_span);
    setTimeout(function() {SCORE_EFFECT_span.style.opacity = 0;}, 500);
    setTimeout(function() {SCORE_EFFECT_span.remove();}, 1000);

}

function breakGame() {
    clearInterval(move);

    PLAY_POOL.removeChild(player);
    PLAY_POOL.removeChild(food);
    if (TAILS.length > 0) {
        TAILS.forEach((element, index) => {
            PLAY_POOL.removeChild(TAILS[index]);
        });
    }

    TAILS = [];

    gameStatus = 0;
    score = 0;
    SCORE_div.innerText = `SCORE:`;
    direction = "none";
    speed = baseSpeed;

    GameStart();
}

GameStart();

window.addEventListener("keydown", directionCalculate);
