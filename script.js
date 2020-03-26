`use strict`;
//------------------- VARIABLES & ARRAYS -----------------------

const body = document.querySelector('body');
const PLAY_POOL = document.querySelector("#pool");
const SCORE_div = document.querySelector("#score");
const SPEED_input = document.querySelector('#speed');
const SIZE_input = document.querySelector('#size');
const ACCELERATION_input = document.querySelector('#acceleration');
const RESET_SETT_input = document.querySelector('#reset_settings');
const NICKNAME_btn = document.querySelector('#NICKNAME_btn');
const HIGHSCORE_btn = document.querySelector('#HIGHSCORE_btn');

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


// localStorage.removeItem('scores');
// localStorage.removeItem('user');
let nickname = null;
let prevNickname = JSON.parse(localStorage.getItem('user'));
if (prevNickname == null){
    prevNickname = 'user';
}
let high_scores = null;
//------------------- FUNCTIONS -----------------------

//CREATING A GAME
function checkUser() {
    nickname = JSON.parse(localStorage.getItem('user'));
    if (nickname == null){
        let nickname = window.prompt("Podaj swój nick:", prevNickname);
        if (nickname == null || nickname == ""){
            nickname = prevNickname;
        }
        localStorage.setItem('user', JSON.stringify(nickname));

        if (nickname.length>15){
            window.alert("Max 15 characters!")
            localStorage.removeItem('user');
            checkUser();
        } else{
            prevNickname = nickname;
        }
    }

    const NICKNAME_span = document.querySelector('#NICKNAME_span');
    NICKNAME_span.innerText = `Nickname: ${JSON.parse(localStorage.getItem('user'))}`;

    high_scores = JSON.parse(localStorage.getItem('scores'));
    if (high_scores == null){
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
        localStorage.setItem('scores', JSON.stringify(noob_scores));
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
        } else if(gameStatus == 1) {
            bufforKey = "left";
        }
    } else if (e.keyCode == 38) {
        if ("down" != prevDirection) {
            direction = "up";
        } else if(gameStatus == 1) {
            bufforKey = "up";
        }
    } else if (e.keyCode == 39) {
        if ("left" != prevDirection) {
            direction = "right";
        } else if(gameStatus == 1) {
            bufforKey = "right";
        }
    } else if (e.keyCode == 40) {
        if ("up" != prevDirection) {
            direction = "down";
        } else if(gameStatus == 1) {
            bufforKey = "down";
        }
    }
    else if (e.keyCode == 82) {
        breakGame();
    }
    else if (e.keyCode == 80) {
        pasueGame();
    }


    let WIN_div_exist = 0;
    let WIN_div = document.querySelector('#win_div');
    if ((gameStatus == 2 || gameStatus == 0 || gameStatus == 'pause') && WIN_div != null){
        WIN_div_exist = 1;
        WIN_div.innerHTML = '';
        WIN_div.remove();
        if (gameStatus == 2){
            gameStatus = 0;
            breakGame();
        }
    }

    if (intervals.length == 0 && direction != "none" && WIN_div_exist == 0) {
        intervalsGo();
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
    // let addScore = 10 + TAILS.length + acceleration*100
    let addScore = Math.floor(10 + ((TAILS.length+1)*10 / rows_amount) + (acceleration*100 / (baseSpeed/100)));

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
function offClick(e){
    if (e.target != PLAY_POOL && e.target.parentNode != PLAY_POOL){
        body.style.overflow = 'auto';
    } else {
        body.style.overflow = 'hidden';
    }

    let WIN_div = document.querySelector('#win_div');
    if (WIN_div != null && e.target != WIN_div){
        WIN_div.innerHTML = '';
        WIN_div.remove();
        if (gameStatus == 2){
            gameStatus = 0;
            breakGame();
        }
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
        foodCreate(0, pRow, pCol);
    }
}
function foodCreate(player_position, pRow, pCol) {
    let food_position = Math.floor(Math.random() * total_amount);
    let fRow = Math.floor(food_position / columns_amount);
    let fCol = food_position % columns_amount;
    if (fRow == 0) {
        fRow = rows_amount;
    }
    if (fCol == 0) {
        fCol = columns_amount;
    }

    if (food_position == player_position || (pRow == fRow && pCol == fCol))
    {
        foodCreate(player_position, pRow, pCol);
    }
    else if (TAILS.length == 0)
    {
        PLAY_POOL.appendChild(food);
        gridAreaSet(food, food_position);
    }
    else if (TAILS.length > 0 && TAILS.length != total_amount-1)
    {
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
            foodCreate(player_position, pRow, pCol);
        }

    }
    else if (TAILS.length+1 == total_amount)
    {
        gameWin('WIN!', 1200, 'win');
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
    checkUser();
    let SCORES_TABLE = high_scores.players;
    if (SCORES_TABLE.length<10 && score > 0){
        gameWin('HIGHSCORE!', 1200, 'win');
    }
    else if (score > SCORES_TABLE[SCORES_TABLE.length-1].score && score > 0){
        gameWin('HIGHSCORE!', 1200, 'win');
    }


    intervals.forEach(element => {
        clearInterval(element);
    });
    intervals = [];
    TAILS = [];
    PLAY_POOL.innerHTML = '';


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
function gameWin(message, time, trigger) {
    const WIN_div = document.createElement('div');
    WIN_div.classList.add('end-box');
    WIN_div.id = 'win_div';
    WIN_div.innerHTML = `<h2 class="end-box--header">${message}</h2><h3 class="end-box--TOP-header">TOP 10</h3>`;
    if (trigger == 'win'){
        WIN_div.innerHTML += `<h4 class="end-box--TOP-header">Score: ${score}</h4>`;
    }
    body.appendChild(WIN_div);

    const SCORES_ul = document.createElement('ul');
    SCORES_ul.classList.add('end-box__scores');
    WIN_div.appendChild(SCORES_ul);

    checkUser();
    let SCORES_TABLE = high_scores.players;
    if (score > 0){
        SCORES_TABLE.push({name: nickname, score: score});
    }
    localStorage.removeItem('scores');


    let SCORE_sort = SCORES_TABLE
        .sort((a, b) => a.score < b.score ? 1 : -1)
        .map((person, index) =>  `
        <li class='end-box__scores--score'>
            <h4>${index+1}. ${person.name}</h4>
            <p>Score: ${person.score}</p>
        </li>
        `)
        .filter((person, index) =>
        (index < 10))
        .join('');


    high_scores.players = SCORES_TABLE.filter((person, index) =>
    (index < 10));
    localStorage.setItem('scores', JSON.stringify(high_scores));
    SCORES_ul.innerHTML = SCORE_sort;



    window.removeEventListener("keydown", directionCalculate);
    setTimeout(function(){
        window.addEventListener("keydown", directionCalculate);}, time);

    document.removeEventListener("click", offClick);
    setTimeout(function(){
        document.addEventListener("click", offClick);}, time);

    if (trigger == 'win'){
        gameStatus = 2;
    } else if (trigger == 'info'){
        if (gameStatus == 1){
            pasueGame();
        }
    }
}


// ------------------- GAME TRIGGERS -----------------------

GameStart();

//LISTENERS
window.addEventListener("keydown", directionCalculate);
document.addEventListener("click", offClick);

SPEED_input.addEventListener("change", speedChange);
SIZE_input.addEventListener("change", sizeChange);
ACCELERATION_input.addEventListener("change", accelerationChange);
RESET_SETT_input.addEventListener("click", function(){setTimeout(resetSettings)}, 15);
HIGHSCORE_btn.addEventListener("click", function(){
    gameWin('HIGHSCORES', 50, 'info');
});
NICKNAME_btn.addEventListener("click", function(){
    localStorage.removeItem('user');
    checkUser();
});