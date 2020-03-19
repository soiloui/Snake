`use strict`;
const PLAY_POOL = document.querySelector("#pool");
const SCORE = document.querySelector("#score");

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
let TAILS = [];

let gameStatus = 0;
let acceleration = 5;
let speed = 1000;
let direction = "none";
let prevDirection = "none";

function GameStart() {
    boardCreate();

    let player_position = Math.floor(Math.random() * total_amount);

    gridAreaSet(player, player_position);
    PLAY_POOL.appendChild(player);

    foodCreate(player_position);
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

function boardCreate() {
    for (let i = 1; i <= total_amount; i++) {
        const POOLS_div = document.createElement("div");

        POOLS_div.classList.add("play_pool--pools");
        PLAY_POOL.appendChild(POOLS_div);

        gridAreaSet(POOLS_div, i);
    }
}

function foodCreate(player_position) {
    let food_position = Math.floor(Math.random() * total_amount);

    if (food_position == player_position) {
        foodCreate(player_position);
    } else {
        food.classList.add("play_pool--food");
        PLAY_POOL.appendChild(food);

        gridAreaSet(food, food_position);
    }
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
        }, speed / acceleration);
        gameStatus = 1;
    }

    prevDirection = direction;

    let playerRowStartNumber = parseInt(
        getComputedStyle(player).getPropertyValue("grid-row-start")
    );
    let playerColumnStartNumber = parseInt(
        getComputedStyle(player).getPropertyValue("grid-column-start")
    );

    foodCollision(playerRowStartNumber, playerColumnStartNumber);
    tailMove(playerRowStartNumber, playerColumnStartNumber);

    if (direction == "left") {
        if (playerColumnStartNumber - 1 != 0) {
            player.style.gridColumnStart = playerColumnStartNumber - 1;
        } else breakGame();
    }

    if (direction == "up") {
        if (playerRowStartNumber - 1 != 0) {
            player.style.gridRowStart = playerRowStartNumber - 1;
        } else breakGame();
    }

    if (direction == "right") {
        if (playerColumnStartNumber + 1 != columns_amount + 1) {
            player.style.gridColumnStart = playerColumnStartNumber + 1;
        } else breakGame();
    }

    if (direction == "down") {
        if (playerRowStartNumber + 1 != rows_amount + 1) {
            player.style.gridRowStart = playerRowStartNumber + 1;
        } else breakGame();
    }
}

function tailMove(pRow, pCol) {
    if (TAILS.length > 0) {
        let tail_POSITION = [];

        TAILS.forEach((element, index) => {
            if (index != 0){
                tail_POSITION.push(
                    parseInt(
                        getComputedStyle(TAILS[index - 1]).getPropertyValue(
                            "grid-row-start"
                        )
                    ) +
                        "" +
                        parseInt(
                            getComputedStyle(TAILS[index - 1]).getPropertyValue(
                                "grid-column-start"
                            )
                        )
                );
            }
        });

        TAILS.forEach((element, index) => {
            if (index == 0) {
                element.style.gridRowStart = pRow;
                element.style.gridColumnStart = pCol;
            } else if (index > 0) {
                element.style.gridRowStart = parseInt(
                    tail_POSITION[index - 1].substring(0, 1)
                );
                element.style.gridColumnStart = parseInt(
                    tail_POSITION[index - 1].substring(1, 2)
                );
            }
        });
        console.log(tail_POSITION);
    }
}

function foodCollision(pRow, pCol) {
    let foodColumnStartNumber = parseInt(
        getComputedStyle(food).getPropertyValue("grid-column-start")
    );
    let foodRowStartNumber = parseInt(
        getComputedStyle(food).getPropertyValue("grid-row-start")
    );

    if (pCol == foodColumnStartNumber && pRow == foodRowStartNumber) {
        clearInterval(move);
        move = setInterval(function() {
            moveFunction();
        }, speed / acceleration);
        acceleration += 0.5;
        PLAY_POOL.removeChild(food);

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
            tail.style.gridRowStart = foodRowStartNumber;
            tail.style.gridColumnStart = foodColumnStartNumber;
        }

        console.log(TAILS);
        foodCreate();
    }
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
    direction = "none";
    acceleration = 5;
    speed = 1000;

    GameStart();
}

GameStart();

window.addEventListener("keydown", directionCalculate);
