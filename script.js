const PLAY_POOL = document.querySelector('#pool');
const SCORE = document.querySelector('#score');
// const PLAYER_div = document.querySelector('#player');
// const FOOD_div = document.querySelector("#food");

const rows_amount = getComputedStyle(PLAY_POOL).getPropertyValue('grid-template-rows').split(" ").length;
const columns_amount = getComputedStyle(PLAY_POOL).getPropertyValue('grid-template-columns').split(" ").length;
const total_amount = rows_amount*columns_amount;


function GameStart(){
    boardCreate();

    let player_position = Math.floor(Math.random()*total_amount);
    foodCreate(player_position);

    let player = document.createElement('div');

    player.classList.add('play_pool--player');
    PLAY_POOL.replaceChild(player, PLAY_POOL.children[player_position]);

    let player_col = getComputedStyle(player).getPropertyValue('grid-column');
    console.log(player_col);

    // let direction = directionCalculate(player);
    // console.log(direction);
}

function boardCreate() {
    for (let i = 0; i < rows_amount*columns_amount; i++){
        const POOLS_div = document.createElement('div');
        POOLS_div.classList.add('play_pool--pools');
        PLAY_POOL.appendChild(POOLS_div);
    }
}

function foodCreate(player_pos) {
    let food_position = Math.floor(Math.random()*rows_amount*columns_amount);
    if (food_position == player_pos){
        foodCreate(player_pos);
    }
    else{
        let food = document.createElement('div');
        food.classList.add('play_pool--food');
        PLAY_POOL.replaceChild(food, PLAY_POOL.children[food_position]);
    }
}

function directionCalculate(player) {
    let player_row = getComputedStyle(player).getPropertyValue('grid-row-start');
    let player_col = getComputedStyle(player).getPropertyValue('grid-column-end');

    if (rows_amount > columns_amount){
        if (player_row < rows_amount) return 'top';
        else if (player_pos >= rows_amount) return 'bot';

    } else if (rows_amount < columns_amount){
        console.log(player_col);
        if (player_col < columns_amount) return 'right';
        else if (player_col >= columns_amount) return 'left';

    } else if (rows_amount == columns_amount){
        if (player_row < rows_amount) return 'top';
        else if (player_pos >= rows_amount) return 'bot';
    }
}


GameStart();