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
const food = document.createElement("div");


let gameStatus = 0;
let acceleration = 5;
let speed = 1000;
let direction = 'up';


function GameStart() {
    boardCreate();

    let player_position = Math.floor(Math.random() * total_amount);

    player.classList.add("play_pool--player");
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
    if (e.keyCode == 37) {
        direction = 'left';
    } else if (e.keyCode == 38) {
        direction = 'up';
    } else if (e.keyCode == 39) {
        direction = 'right';
    } else if (e.keyCode == 40) {
        direction = 'down';
    }

    if (gameStatus == 0){
        moveFunction();
    }
}

function moveFunction() {
    if (gameStatus == 0){
        move = setInterval(function(){moveFunction()}, speed/acceleration);
        gameStatus = 1;
    }

    let playerColumnStartNumber = parseInt(
        getComputedStyle(player)
        .getPropertyValue("grid-column-start")
    );
    let playerRowStartNumber = parseInt(
        getComputedStyle(player)
        .getPropertyValue("grid-row-start")
    );

    foodCollision(playerRowStartNumber, playerColumnStartNumber);

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

function foodCollision(pRow, pCol){
    let foodColumnStartNumber = parseInt(
        getComputedStyle(food)
        .getPropertyValue("grid-column-start")
    );
    let foodRowStartNumber = parseInt(
        getComputedStyle(food)
        .getPropertyValue("grid-row-start")
    );

    if (pCol == foodColumnStartNumber
        && pRow == foodRowStartNumber){
            acceleration += 0.5;
            PLAY_POOL.removeChild(food);
            foodCreate();
        }
}

function breakGame() {
    clearInterval(move);
    PLAY_POOL.removeChild(player);
    PLAY_POOL.removeChild(food);
    gameStatus = 0;
    acceleration = 5;
    GameStart();
}

GameStart();

window.addEventListener("keydown", directionCalculate);
