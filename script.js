`use strict`;
//------------------- VARIABLES & ARRAYS -----------------------

const body = document.querySelector('body');
const PLAY_POOL = document.querySelector("#pool");
const SCORE_div = document.querySelector("#score");
const SPEED_input = document.querySelector('#speed');
const SIZE_input = document.querySelector('#size');
const ACCELERATION_input = document.querySelector('#acceleration');
const RESET_SETT_input = document.querySelector('#reset_settings');


let rows_amount = getComputedStyle(PLAY_POOL)
    .getPropertyValue("grid-template-rows")
    .split(" ").length;
let columns_amount = getComputedStyle(PLAY_POOL)
    .getPropertyValue("grid-template-columns")
    .split(" ").length;
let total_amount = rows_amount * columns_amount;


const player = document.createElement("div");
player.classList.add("play_pool--player");
const food = document.createElement("div");
food.classList.add("play_pool--food");

let TAILS = [];
let intervals = [];

let gameStatus = 0;
let score = 0;
let baseAcceleration = 1;
let acceleration = .1;
let baseSpeed = 300;
let direction = "none";
let prevDirection = "none";
let bufforKey = "none";

const noob_scores = {
    players:[
        {
            name: "Noob",
            score: 200
        },
        {
            name: "Amator",
            score: 700
        },
        {
            name: "Player",
            score: 2000
        }
    ]
};
// localStorage.removeItem('scores');
let nickname = JSON.parse(localStorage.getItem('user'));
let high_scores = JSON.parse(localStorage.getItem('scores'));

//------------------- FUNCTIONS -----------------------

//CREATING A GAME
function checkUser() {
    if (nickname == null){
        let new_name = window.prompt("Podaj swój nick:", "user");
        if (new_name == null || new_name == ""){
            new_name = 'Nie podałam imienia :)'
        }

        localStorage.setItem('user', JSON.stringify(new_name));
    }


    if (high_scores == null){
        localStorage.setItem('scores', JSON.stringify(noob_scores));
    }
    else{
        console.log(high_scores.players[0]);
    }
}
function GameStart() {
    speedChange();
    accelerationChange();
    sizeChange();

    boardCreate();

    let player_position = Math.floor(Math.random() * total_amount);
    gridAreaSet(player, player_position);
    PLAY_POOL.appendChild(player);

    foodCreate(player_position);
    checkUser();
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

//CONTROLS
function directionCalculate(e) {
    if (e.keyCode == 37) {
        if ("right" != prevDirection) {
            direction = "left";
        } else {
            bufforKey = "left";
        }
    } else if (e.keyCode == 38) {
        if ("down" != prevDirection) {
            direction = "up";
        } else {
            bufforKey = "up";
        }
    } else if (e.keyCode == 39) {
        if ("left" != prevDirection) {
            direction = "right";
        } else {
            bufforKey = "right";
        }
    } else if (e.keyCode == 40) {
        if ("up" != prevDirection) {
            direction = "down";
        } else {
            bufforKey = "down";
        }
    }
    else if (e.keyCode == 82) {
        breakGame();
    }
    else if (e.keyCode == 80) {
        pasueGame();
    }

    if (intervals.length == 0 && direction != "none") {
        intervalsGo();
    }

    if (gameStatus == 2){
        let WIN_div = document.querySelector('#win_div');
        WIN_div.innerHTML = '';
        WIN_div.remove();
        gameStatus = 0;
        breakGame();
    }
}
function intervalsGo() {
    if (gameStatus == '1')
    {
        let move = setInterval(function() {
            moveFunction();
        }, (baseSpeed / (baseAcceleration + TAILS.length*acceleration)));
        intervals[0] = move;
    }
    else if (gameStatus == '0')
    {
        let move = setInterval(function() {
            moveFunction();
        }, baseSpeed);
        intervals[0] = move;
        gameStatus = 1;
    }
}
function scoreCount(fRow, fCol) {
    let addScore = 10 + TAILS.length + acceleration*100

    score += addScore;
    SCORE_div.innerText = `SCORE: ${score}`;

    const SCORE_EFFECT_span = document.createElement('span');
    SCORE_EFFECT_span.classList.add('play_pool--score');

    SCORE_EFFECT_span.innerText = `+${addScore}`;

    SCORE_EFFECT_span.style.gridRowStart = fRow;
    SCORE_EFFECT_span.style.gridColumnStart = fCol;
    SCORE_EFFECT_span.style.opacity = 1;

    PLAY_POOL.appendChild(SCORE_EFFECT_span);
    setTimeout(function() {SCORE_EFFECT_span.style.opacity = 0;}, 500);
    setTimeout(function() {SCORE_EFFECT_span.remove();}, 1000);

}
function blockScroll(e){
    if (e.target != PLAY_POOL && e.target.parentNode != PLAY_POOL){
        body.style.overflow = 'auto';
    } else {
        body.style.overflow = 'hidden';
    }
}

//MOVING & EATING
function moveFunction() {
    let pRow = parseInt(
        getComputedStyle(player).getPropertyValue("grid-row-start")
    );
    let pCol = parseInt(
        getComputedStyle(player).getPropertyValue("grid-column-start")
    );

    prevDirection = direction;

    foodCollision(pRow, pCol);
    tailMove(pRow, pCol);
    wallCollision(pRow, pCol);
    tailCollision();

    if (bufforKey != "none"){
        if (prevDirection == "right" && bufforKey == "left"){}
        else if (prevDirection == "left" && bufforKey == "right"){}
        else if (prevDirection == "up" && bufforKey == "down"){}
        else if (prevDirection == "down" && bufforKey == "up"){}
        else{
            direction = bufforKey;
        }
        bufforKey = "none";
    }
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
        if (pCol + 1 != parseInt(columns_amount) + 1) {
            player.style.gridColumnStart = pCol + 1;

            player.style.borderRadius = 0;
            player.style.borderBottomRightRadius = '50%';
            player.style.borderTopRightRadius = '50%';
        }
        else breakGame();
    }

    if (direction == "down") {
        if (pRow + 1 != parseInt(rows_amount) + 1) {
            player.style.gridRowStart = pRow + 1;

            player.style.borderRadius = 0;
            player.style.borderBottomLeftRadius = '50%';
            player.style.borderBottomRightRadius = '50%';
        }
        else breakGame();
    }

    if (direction == "none"){
        breakGame();
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

        clearInterval(intervals[0]);

        intervalsGo();

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
    else if (TAILS.length+1 == total_amount)
    {
        gameWin('WIN!');
    }

}

//USER SETTINGS
function speedChange() {
    baseSpeed = 1500/SPEED_input.value;
    SPEED_input.previousElementSibling.innerText = `Base speed: ${SPEED_input.value}`;
}
function accelerationChange() {
    acceleration = ACCELERATION_input.value;
    ACCELERATION_input.previousElementSibling.innerText = `Acceleration: ${ACCELERATION_input.value}`;
}
function sizeChange(e) {
    let amount = SIZE_input.value
    SIZE_input.previousElementSibling.innerText = `AREA OF PLAY: ${amount}`;

    let size_of_pools = 350/amount;

    PLAY_POOL.style.gridTemplateRows = `repeat(${amount}, ${size_of_pools}px)`;
    PLAY_POOL.style.gridTemplateColumns = `repeat(${amount}, ${size_of_pools}px)`;

    rows_amount = amount;
    columns_amount = amount;
    total_amount = rows_amount*columns_amount;

    if (typeof e != 'undefined'){
        breakGame();
    }
}
function resetSettings() {
    speedChange();
    accelerationChange();
    sizeChange();
    breakGame();
}

//GAME ACTIONS
function pasueGame() {
    if (gameStatus == '1')
    {
        intervals.forEach(element => {
            clearInterval(element);
        });
        gameStatus = 'pause';
    }
    else if (gameStatus == 'pause')
    {
        gameStatus = 1;
        intervalsGo();
    }
}
function breakGame() {
    intervals.forEach(element => {
        clearInterval(element);
    });
    intervals = [];

    PLAY_POOL.innerHTML = '';

    TAILS = [];

    if (gameStatus !=2){
        gameStatus = 0;
    }
    score = 0;
    SCORE_div.innerText = `SCORE:`;
    direction = "none";
    prevDirection = "none";
    bufforKey = "none";

    player.style.borderRadius = '0px';

    GameStart();
}
function gameWin(message) {
    const WIN_div = document.createElement('div');
    WIN_div.classList.add('end-box');
    WIN_div.id = 'win_div';
    WIN_div.innerHTML = `${message}</br>TOP 10`;
    body.appendChild(WIN_div);

    const SCORES_ul = document.createElement('ul');
    SCORES_ul.classList.add('end-box__scores');
    WIN_div.appendChild(SCORES_ul);

    let SCORES_TABLE = [];


    async function fetchData(){
        const res = await fetch('https://my-json-server.typicode.com/soiloui/Snake/Scores');

        const data = await res.json();
        data.forEach(score => {
            SCORES_TABLE.push(score);
        });

        let SCORE_sort = SCORES_TABLE
        .sort((a, b) => a.score > b.score ? 1 : -1)
        .map((score, index) =>  `
        <li class='end-box__scores--score'>
            <h3>${index+1}. ${score.name}</h3>
            <p>Score: ${score.count}</p>
        </li>
        `)
        .join('');

        SCORES_ul.innerHTML = SCORE_sort;
    }

    fetchData()
        .catch(error=>{
            console.log(error);
        });


    window.removeEventListener("keydown", directionCalculate);
    setTimeout(function(){window.addEventListener("keydown", directionCalculate);}
    , 1500);
    gameStatus = 2;
    breakGame();
}


// ------------------- GAME TRIGGERS -----------------------

GameStart();

//LISTENERS
window.addEventListener("keydown", directionCalculate);

SPEED_input.addEventListener("change", speedChange);
SIZE_input.addEventListener("change", sizeChange);
ACCELERATION_input.addEventListener("change", accelerationChange);
RESET_SETT_input.addEventListener("click", function(){setTimeout(resetSettings)}, 15);

document.addEventListener("click", blockScroll);