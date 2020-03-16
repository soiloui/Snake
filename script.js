const PLAY_POOL = document.querySelector('#pool');
const SCORE = document.querySelector('#score');
// const PLAYER_div = document.querySelector('#player');
// const FOOD_div = document.querySelector("#food");

const rows_amount = getComputedStyle(PLAY_POOL).getPropertyValue('grid-template-rows').split(" ").length;
const columns_amount = getComputedStyle(PLAY_POOL).getPropertyValue('grid-template-columns').split(" ").length;



for (let i = 0; i < rows_amount*columns_amount; i++){
    const POOLS_div = document.createElement('div');
    POOLS_div.classList.add('play_pool--pools');
    PLAY_POOL.appendChild(POOLS_div);
}