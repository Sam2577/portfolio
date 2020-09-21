import { useRef, useEffect, useState } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import { unmountComponentAtNode } from 'react-dom';
import _ from 'lodash';
import './snake.css';
import Backdrop from '@material-ui/core/Backdrop';
import levels from './levels';
import { createStore } from 'redux'

const UP = 'up';
const DOWN = 'down';
const LEFT = 'left';
const RIGHT = 'right';
const BOX_SIZE = 9;
const BOX_SIZE_PX = `${BOX_SIZE}px`;
const NUMBER_OF_FOOD = 1;

let CURRENT_DIR = RIGHT;


// most state is held in redux (state that does not need to cause a re-render),
// some state items are held in both local state and redux state, to make them more
// accessable to multiple components, but are always in synch with each other.
let originalState = {
    headX: 10,
    headY: 67,
    direction: 'right',
    lastDirection: 'right',
    currentLevel: 1,
    freeSpots: [],
    walls: [],
    superSnake: false,
    food: [],
    gold: [],
    snakeColor: '#f5bb00',
    growSnake: false,
    timeouts: []
}

// reducer function for redux. These functions are called by redux when store.dispatch([action object])
// is called. The reducer merges two objects: the original state object merges with properties given in
// new object (the one returned from action creator function) to create a new state object, which is returned.
function reducer(state=originalState, action) {
    const functionMap = {
        'up' : () => Object.assign({}, state, { headY: state.headY - 1 } ),
        'down' : () => Object.assign({}, state, { headY: state.headY + 1 } ),
        'left' : () => Object.assign({}, state, { headX: state.headX - 1 } ),
        'right' : () => Object.assign({}, state, { headX: state.headX + 1 } ),
        'setDirection': () => Object.assign({}, state, { direction: action.direction } ),
        'setLastDirection': () => Object.assign({}, state, { lastDirection: action.lastDirection } ),

        //  "[ ...state.freeSpots, action.location ]" below is the functional way to "append", since it
        // doesnt mutate an object (it create a new object, leaving the original object alone/unchanged)
        'setFreeSpot': () => Object.assign({}, state, { freeSpots: [ ...state.freeSpots, action.location ]  } ),
        'setWall': () => Object.assign({}, state, { walls: [ ...state.walls, action.wall  ] } ),

        // " _.filter(state.freeSpots, item => item !== action.location)" below is the functional way to remove items
        // from a list, since it creates a new array, and leaves the original array unchanged. 1st parameter is the array
        // to iterate over, and second parameter is a filter function ran on every item in the given array. If the return
        // value is true, the item is added to the new array being created, and if false, it is not added.
        'removeFreeSpot': () => Object.assign({}, state, { freeSpots: _.filter(state.freeSpots, item => item !== action.location) } ),
        'setSuperSnake': () => Object.assign({}, state, { superSnake: action.superSnake } ),
        'removeWall': () => Object.assign({}, state, { walls: _.filter(state.walls, wall => wall !== action.wall ) } ),
        'levelUp': () => Object.assign({}, originalState, { currentLevel: state.currentLevel + 1 } ),
        'setFood': () => Object.assign({}, state, { food: action.food } ),
        'setGold': () => Object.assign({}, state, { gold: action.gold } ),
        'removeFood': () => Object.assign({}, state, { food: _.filter(state.food, food => food !== action.food ) }),
        'removeGold': () => Object.assign({}, state, { gold: _.filter(state.gold, gold => gold !== action.gold ) }),
        'setSnakeColor': () => Object.assign({}, state, { snakeColor: action.color }),
        'setGrowSnake': () => Object.assign({}, state, { growSnake: action.grow }),
        'resetGame': () => Object.assign( {}, originalState, {} )
    }
    // can use if instead of try/catch because no error thrown if action.type doesnt exist (comes back 'undefined')
    if (functionMap[action.type]){
        return functionMap[action.type]();
    }
    return state;
}

const store = createStore(reducer);

// action creator functions for redux ( they return the object given to the reducer to merge with state)
const setSnakeHead = intent =>  { return { type: intent } };
const setSnakeDir = direction => { return { type: 'setDirection', direction } };
const setLastDirection = lastDirection => { return { type: 'setLastDirection', lastDirection } };
const setFreeSpot = location => { return { type: 'setFreeSpot', location } };
const setWall = wall => { return { type: 'setWall', wall } };
const removeFreeSpot = location => { return { type: 'removeFreeSpot', location } };
const setSuperSnake = superSnake => { return { type: 'setSuperSnake', superSnake } };
const removeWallFromStore = wall => { return { type: 'removeWall', wall } };
const levelUp = () => { return { type: 'levelUp' } };
const setFood = food => { return { type: 'setFood', food } };
const setGold = gold => { return { type: 'setGold', gold } };
const removeFood = food => { return { type: 'removeFood', food} };
const removeGold = gold => { return { type: 'removeGold', gold} };
const setSnakeColor = color => { return { type: 'setSnakeColor', color } };
const setGrowSnake = grow => { return { type: 'setGrowSnake', grow } };
const addTimeout = timeout => { return { type: 'addTimeout', timeout }};
const clearTimeouts = () => { return { type: 'clearTimeouts' } };
const resetGame = () => { return { type: 'resetGame' }};

//////////////////////////////////////////////////////////////

// walls (& all the dom elements making up the gameplay) are positioned absolutely,
// by multiplying their row/column positions by the size of an element.
// example: lets say blocks are all 10px. Element at row 3, column 2 is absolutely positioned
// at row=(3 * 10px), column=(2 * 10px), so row(css 'top')=30px, column(css 'left')=20px.
class Wall extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div
                style={ {
                    position: 'absolute',
                    top: `${ this.props.loc.i * BOX_SIZE}px`,
                    left: `${this.props.loc.j * BOX_SIZE}px`,
                    width: BOX_SIZE_PX,
                    height: BOX_SIZE_PX,
                    backgroundColor: this.props.color
                } }>
            </div>
        )
    }
}

class AllWalls extends React.Component {
    constructor(props){
        super(props);
    }

	static buildWalls(){
        // the grid map will be used below to create individual Walls. A distinction
        // is made between inner and outer walls because when the snake eats (collides with)
        // a 'goldFood' item, it becomes a 'superSnake', that can break through INNER walls
        // for 30 seconds, but CANNOT break through the OUTER walls.
        const gridMap = {
            'x': (i,j) => <Wall key={`inner-${i},${j}}`} inner={true} loc={{i, j}} color={ '#e28413' }/>,
            'o': (i,j) => <Wall key={`outer-${i},${j}}`} loc={{i, j}} color={ '#e28413' } />
        }
        // iterate over current-level character map (held in associated 'levels.js', and for each character,
        // create a Wall element based on its indexes (row/col indexes), which represent its position. If the
        // character is blank (" "), save its position in 'freeSpots' state, by dispatching to the redux store,
        // else create a Wall (inner or outer) and save a reference to it. Dispatch 'setWall' function, and pass
        // it the wall component reference.
		levels[store.getState().currentLevel].map((row, rowIndex) => Array.from(row).map( (item, columnIndex) => {
					if (item === ' '){
						store.dispatch(setFreeSpot( { row: rowIndex, col: columnIndex } ));
					} else {
						const wall = gridMap[item](rowIndex, columnIndex);
						store.dispatch(setWall(wall));
					}
				}
			)
		)
	}
    componentDidUpdate(){
        // dont run this function if game is over.
		if (this.props.gameOver){
            return;
        }
        // wall/snake collision detection. A collision is defined as two elements occupying the same position.
        // Since this method is called every time the snake moves (due to its parent updating on every snake move),
        // we check if there is a wall at the snake head's current position, and if there is, we check if we are
        // currently a 'superSnake' who can 'break through' walls, and if there isnt, we end the game. If we are
        // a superSnake, we check that the wall is an inner wall (outer walls cannot be broken through, ever), and
        // if we are a superSnake, we remove the wall.
        const foundWall = store.getState().walls.find( wall => wall.props.loc.i === store.getState().headY && wall.props.loc.j === store.getState().headX);
        if (foundWall){
            if (foundWall.props.inner && store.getState().superSnake){
                store.dispatch(removeWallFromStore(foundWall));
            } else {
                this.props.setGameOver(true);
            }
        }
    }
    // we can just render the array of walls directly because the array is made up of React components,
    // and JSX will render an array of react components.
    render(){
        return store.getState().walls;
    }
}


// just like walls, Food items are positioned absolutely using their positions in the
// character map multiplied by the size that all elements are set to ("BOX_SIZE" constant).
const Food = (props) => {
    return(
        <div
            style={ {
                position: 'absolute',
                top: `${ Number(props.row) * BOX_SIZE }px`,
                left: `${ Number(props.col) * BOX_SIZE }px`,
                width: BOX_SIZE_PX,
                height: BOX_SIZE_PX,
                borderRadius: '2px',
                boxShadow: '1px 1px 1px rgb(0,0,0,.3)',
                backgroundColor: props.color
            } }>
        </div>
    )
}


class AllFood extends React.Component {

    constructor( props ){
        super( props );
    }

    static buildFood = () => {
        // create a range of samples of free spots to place food items at.
        // once we choose a free spot, remove it from list of free spots to avoid
        // multiple food items choosing the same spot.
    	const food = _.range( NUMBER_OF_FOOD ).map((id) => {
    	  const spot = _.sample(store.getState().freeSpots);
    	  store.dispatch(removeFreeSpot(spot));
    	  return <Food key={`food-${id}`} color={'#ef271b'} row={spot.row} col={spot.col}  />;
    	})
        // create gold food
    	const gold = _.range( 1 ).map((id) => {
    	  const spot = _.sample(store.getState().freeSpots);
    	  store.dispatch(removeFreeSpot(spot));
    	  return <Food key={`gold-${id}`} color={'gold'} row={spot.row} col={spot.col}  />;
    	})
        // update store state with the spots we generated for food/gold items.
    	store.dispatch(setFood(food));
    	store.dispatch(setGold(gold));
    }

    componentDidUpdate(){

        // if (this.props.buildFood){
        //     this.buildFood();
        //     this.props.setBuildFood(false);
        // }
        // collision detection between food and snake head. check snake head location
        // against all food locations to see if they share a loaction (are colliding).
        // remove the food if so.
        const foundFood = store.getState().food.find( food => food.props.row === store.getState().headY && food.props.col === store.getState().headX);
        if (foundFood){ store.dispatch(removeFood(foundFood)) };

        // collision detection between snake head and all gold food.
        const foundGold = store.getState().gold.find( gold => gold.props.row === store.getState().headY && gold.props.col === store.getState().headX);

        // collision detection logic for snake and gold item. Logic for this is mostly in
        // the startCountdown() method passed in as prop, below, but here we call that
        // function and then remove the gold piece from redux state (and therefore the display).
        if (foundGold){
            //store.dispatch(clearTimeouts());
            this.props.startCountdown();
			store.dispatch(removeGold(foundGold));
        }
        if (foundFood || foundGold){
            store.dispatch(setGrowSnake(true));
            setTimeout(() => {
                store.dispatch(setGrowSnake(false));
            }, 500);
        }
    }
    // render the redux state food and gold arrays directly,
    // because they hold react components/JSX
    render(){
        return [ store.getState().food, store.getState().gold ]
    }
}

class Snake extends React.Component {

    constructor( props ) {
        super( props );
        this.gameInterval = null;

        // snake starts here on each level.
        this.originalSnakeStartLocation = [ { x: 10, y: 67 }, { x: 10 - 1, y: 67 }, { x: 10 - 2, y: 67 }, { x: 10 - 3, y: 67 } ]
        this.state = {
            snake: this.originalSnakeStartLocation
        };
    }
    gameLoop = () => {
        // dont run the game loop if the game is over
        if (this.props.gamePaused){
            return;
        }

        if (this.props.gameOver){
            clearInterval(this.gameInterval);
            return;
        }

        // set the new snake head location based on the state 'direction' property (which was
        // set based on the arrow key that the user pressed on the keyboard)
        store.dispatch(setSnakeHead(store.getState().direction));

        // set parent head location state to redux head location state. This way, redux
        // state remains the "single source of truth", but updating parent component
        // (App) local state on every game loop is what drives the  snake game,
        // because it causes all of its child components to be evaluated for
        //  re-render (and run their componentDidUpdate() methods.)
        this.props.setHead( store.getState().headX, store.getState().headY);

        // now that new head location is set, call moveSnake() which sets the snake array
        // to the new array (the only 2 elements that would possibly need to be re-rendered
        // though, are the head (always) and possibly the tail (if redux state 'growSnake'=false))
        this.moveSnake(store.getState().headX, store.getState().headY);

        // If there are no more items left in redux state food and gold arrays,
        // remove a specific outer wall element from top wall. This is the opening/door
        // that allows the snake to exit the level, so they can move to next level.
        this.openTheDoorIfAllFoodIsGone();

        // if the 'door' is open from openTheDoorIfAllFoodIsGone(), then the snake can
        // exit the level. levelUpIfSnakeIsThroughTheDoor() checks if the snake tail has
        // exited the grid, and initiates a 'level up' if so.
        this.levelUpIfSnakeIsThroughTheDoor();
    }
    // set snake array to the new array (based on new snake head location);
    // 1. create temp array so we can assign new array to state (to avoid mutating state)
    // 2. if growSnake is false, pop off last snake element (if true, leave last snake element)
    // 3. add new snake head location to the array at 0th index
    // 4. assign the temp array to state to become the new array (react should only rerender
    //    the changed elements).
    moveSnake = (x, y) => {
        let temp = [...this.state.snake];
        if (!store.getState().growSnake){ temp.pop() };
        temp.unshift( { x, y });
        this.setState( { snake: [...temp] } );
    }
    // levelUpIfSnakeIsThroughTheDoor() checks if the snake tail has exited the grid,
    // and initiates a 'level up' if so. Specifically, it checks the tail's y position,
    // which will be less than 0 if it exits the grid. If tail's y position is < 0...
    // 1. stop the game loop. (dont want functions that build the new level to be called multiple times.)
    // 2. set gameInterval property to null. (indicator to the snake to set itself back
    //    to its origninal/starting position (and build food/gold), in Snake's componentDidUpdate() method, below)
    // 3. dispatch redux 'clearTimeouts' in case any timeouts are still running when level is completed.
    // 4. call parent component's levelUp(), which increments redux state/local state level, and resets other
    //    state back to its original state.
    levelUpIfSnakeIsThroughTheDoor = () => {
        if (this.state.snake[this.state.snake.length - 1].y < 0){
            clearInterval(this.gameInterval);
            this.gameInterval = null;
            //store.dispatch(clearTimeouts());
            this.props.levelUp();
        }
    }
    // If there are no more items left in redux state food and gold arrays,
    // remove a specific outer wall element from top wall. This is the opening/door
    // that allows the snake to exit the level, so they can move to next level.
    openTheDoorIfAllFoodIsGone = () => {
        if (!store.getState().food.length && !store.getState().gold.length){
            const door = store.getState().walls.find( wall => wall.props.loc.i === 0 && wall.props.loc.j === 50);
            store.dispatch(removeWallFromStore(door));
        }
    }
    // if snake unmounts, game is over, so clear the game interval and any timeouts
    componentWillUnmount(){
        clearInterval(this.gameInterval);
        //store.dispatch(clearTimeouts());
        this.gameInterval = null;
    }
    startGame = () => {
        this.props.wrapperRef.current.focus();
        this.gameInterval = setInterval(this.gameLoop, 50);
    }
    // setting focus to the parent App component on mount is a quirk needed to allow the todo app to
    // function correctly when snake game is being played. (previous version of snake game
    // set keydown event listeners (for arrow keys used to control snake) on window object, and used
    // preventDefault() in them (to prevent the window from scrolling up/down on arrow key presses),
    // which caused the todo app to not respond. So now, I set those listeners on the game element
    // instead of the window object, but that means that the game object needs to reveive focus()
    // in order for them to work. Since clicking away from the game element woud cause the game
    // to stop reacting to keypresses, I implemented "pause" logic to pause the game when this occurs.
    // Ability to pause is helpful to the game anyway, but also helps the user not lose the ability to
    // control the snake when/if they click away from the game element).
    componentDidMount(){
        this.startGame();
    }
    componentDidUpdate(){

        // if gameInterval is null, we have leveled up (or game is just starting), so put
        // snake in its starting spot, build food, and start the game interval (All Walls
        // component takes care of building new walls) TODO: build walls here instead?
        if (!this.gameInterval){
            this.state.snake = this.originalSnakeStartLocation;
            //buildFood();
            this.gameInterval = setInterval(this.gameLoop, 50);
        }
        // storing off the current direction as redux state 'lastDirection', is a solution
        // to this problem: We have to disallow the snake from moving in the opposite direction
        // of its current direction (example: if moving right, snake cant immediately move left
        // because it would collide with itself). Initially, I used the opposite of the current
        // direction as the direction it was not allowed to move, but a bug surfaced where I
        // could quicky hit a valid direction, then the disallowed direction so quickly that the
        // state changed before render occured, so the snake never moved in the valid direction
        // before moving in the disallowed direction, and it collided with itself. Storing off
        // the last direction as state, and comparing against that solved this issue. Mentioning
        // this here because we set the last direction here, but the actual logic that handles this
        // is present in the keydown event listeners below (in Snake's componentDidMount())
        store.dispatch(setLastDirection(store.getState().direction ) );

        // snake self-collision detection. Do not compare snake head location to 0th item
        // because 0th item is the snake head, and it would always be colliding with itself
        // For any other item in the snake array: compare its location to the snake head location,
        // and if they share same location, they are colliding, so game is over.
        this.state.snake.map( ( snakeElement, index ) => {
            if (index === 0){
                return; // head will always be colliding with itself, so dont compare head location to 0th item (itself/head)
            }
            if (store.getState().headX === snakeElement.x && store.getState().headY === snakeElement.y){
				clearInterval(this.gameInterval);
                this.gameInterval = null;
                this.props.setGameOver(true);
            }
        } );

    }
    render(){
        // snake array is kept in order of snake head = 0th item and snake tail = last
        // item, so we can use the index in combonation with each item's location object
        // to set each elmement's position
        return this.state.snake.map( ( { x, y }, index) => {
                return(
                    <div key={`snake-${index}`}
                        style={{
                            position: 'absolute',
                            top: `${ Number(this.state.snake[index].y) * BOX_SIZE }px`,
                            left: `${ Number(this.state.snake[index].x) * BOX_SIZE }px`,
                            width: BOX_SIZE_PX,
                            height: BOX_SIZE_PX,
                            backgroundColor: store.getState().snakeColor
                        }}>
                    </div>
                )
            }
        )
    }
}

const GameOver = (props) => {
	return(
		<Backdrop style={{color: 'black', zIndex: '3'}} open={ true } onClick={ props.resetGameState }>
			<div style={{ position: 'absolute', alignSelf: 'center', zIndex: '2', color: 'red', fontSize: '5em'}}>
				<h1>GAME OVER</h1>
			</div>
		</Backdrop>
	)
}

const PlayerWins = (props) => {
	return(
		<Backdrop style={{color: 'black', zIndex: '3'}} open={ true } onClick={ props.resetGameState }>
			<div style={{ position: 'absolute', alignSelf: 'center', zIndex: '2', color: 'red', fontSize: '5em'}}>
				<h1>You Win!</h1>
			</div>
		</Backdrop>
	)
}

const GamePaused = (props) => {

	return(
		<Backdrop style={{color: 'black', zIndex: '3'}} open={ true } onClick={ props.restartGame }>
			<div style={{ position: 'absolute', alignSelf: 'center', zIndex: '2', color: 'red', fontSize: '5em'}}>
				<h1>PAUSED</h1>
			</div>
		</Backdrop>
	)
}

const StartGameModal = (props) => {

    const wrapperStyles = {
        outline: 'none',
        position: 'relative',
        alignSelf: 'center',
        zIndex: '2',
        width: '100%',
        height:'auto',
        margin: 'auto auto'
    }
    const buttonStyles = {
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        borderRadius: '10px',
        zIndex: '2',
        margin: 'auto',
        width: '200px',
        height: '100px',
        fontSize: '2.5em'
    }
    const directionsStyles = {
        position: 'absolute',
        padding: '20px',
        margin: '20px',
        zIndex: '3',
        bottom:'0',
        right: '0',
        width: '50%',
        height: 'auto',
        backgroundColor: 'rgba(255,255,255, .8)',
        borderRadius: '5px'
    }
    const imgStyles = {
        position: 'relative',
        top:'0',
        left: '0',
        borderRadius: '20px',
        border: '3px solid black',
        width: '100%',
        height: 'auto',
        boxShadow: '7px 7px 10px rgba(0,0,0,.5)'
    }
	return(
		<div id="modal" style={wrapperStyles}>

				<button style={buttonStyles}
				  onClick={ props.mountSnake }>
					  START GAME
				</button>

                <div style={directionsStyles}>
                    <em>Directions:</em> Use the arrow keys to control the snake's direction. The goal: eat all of the food (red and gold items), and dont run into walls (unless
                    you are a super snake, explained in a moment). If you eat all of the food, a door will open at the top of the level and if you can exit through it succesfully,
                    you will move on to the next level. If you eat the gold food item, you will be a "super snake" for 30 seconds, which means you will see a countdown timer of 30 seconds
                    appear and for those 30 seconds, you can break through the walls (the inner walls only, running into outer walls always causes game over). Eating food causes
                    the snake to grow, and running into yourself ends the game! The game will be paused if you click anywhere outside of the game, and clicking the pause screen
                    will unpause the game.
                </div>

				<img src="snakeModal.svg" style={imgStyles}/>
		  </div>
	)
}

const Countdown = props => {

    const countdownStyles = {
        position: 'absolute',
        right: '70px',
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3em',
        backgroundColor: 'rgba(255,255,255, .4)',
        boxShadow: '3px 3px 3px rgba(0,0,0, .3)',
        borderRadius: '5px',
        border: '1px solid black',
        fontFamily: 'cinzel, sans-serif',
        padding: '10px'
    }
    return(
        <div style={ countdownStyles }>
            <div style={{ fontSize: '.3em'}}>Snake can break through <br /> walls for another: </div>
            :{ props.countdown } <br />
            <div style={{ fontSize: '.3em'}}>seconds</div>
        </div>
    )
}

class App extends React.Component {

    constructor(props){
        super(props);
        this.wrapperRef = React.createRef();

        this.timeoutId = null;

        // state held in component (instead of redux) is here because changes to these items need to cause a re-render
        this.originalState = {
            // changing level in state causes component and child components to re-render with new level elements(new walls,food,snake location).
            level: 1,
            // headX and headY update on every game loop, and since they are held as state, their
            // child components are evaluated for re-render too (on every game loop).
            headX: 10,
            headY: 67,
			mountSnake: false,
            // gameOver causes display to re-render with the game over backdrop
            // (and if user clicks on it, the backdrop property (above) becomes false which causes
            // the backdrop to be removed)
			gameOver: false,
            // GamePaused screen conditionally renders in JSX below based on gamePaused boolean
            gamePaused: false,
            // countdown is the countdown timer value used for various game logic (like when to set superSnake back to
            // false, when to change snake color back to origninal color, what value to display in timer (in JSX below) etc)
            countdown: 29,
            // a Countdown component displays conditionally in JSX below, based on this boolean value.
            displayCountdown: false,
            playerWins: false
        };

        this.state = this.originalState;
    }
    clearSuperSnake = () => {
        //    1. clear any timeout that might exist.
        //    2. set redux superSnake back to false (meaning if collision between snake and wall occurs, game over occurs),
        //       set snake color back to original color (visual indicator that snake is no
        //       longer a "superSnake"),
        //    3. set state.displayCountdown back to false (remove countdown)
        //    4. set state.countdown back to original 29 seconds.
        clearTimeout(this.timeoutId);
        store.dispatch(setSuperSnake(false));
        store.dispatch(setSnakeColor('#f5bb00'));
        this.setState( { displayCountdown: false, countdown: 29 } );
    }

    timeoutHandler = () => {
        // the handler for the timeout called by this.startCountdown(), which
        // itself is called when snake 'eats' a gold food item. When called...
        // 1. decrement state.countdown integer by one.
        // 2. If state.countdown is greater than 0 (meaning we are still counting down),
        //    set another timeout for another second with itself as the handler.
        // 3. If state.countdown has reached zero, call clearSuperSnake()
        this.setState( (previousState) => {
            return { countdown: previousState.countdown - 1 };
        })
        if (this.state.countdown > 0 ){
            this.timeoutId = setTimeout( this.timeoutHandler, 1000 );
        } else {
            this.clearSuperSnake();
        }
    }

    startCountdown = () => {
        // startCountdown() is called by AllFood (passed as a prop) when snake eats gold food (collides with
        // gold food item) When this happens...
        // 1. set state.displayCountdown to true (logic is in JSX to display countdown when true)
        // 1. set superSnake to true (meaning that when snake collides with an inner wall,
        //    the wall will be removed instead of game being over)
        // 3. set snake color to red (visual indicator that snake is a superSnake)
        // 4. set a one second timeout to call this.timeoutHandlder again.
        this.setState( { displayCountdown: true } );
        store.dispatch(setSuperSnake(true));
        store.dispatch(setSnakeColor('red'));
        this.timeoutId = setTimeout( this.timeoutHandler, 1000)
    }
    componentDidMount(){
        AllWalls.buildWalls();
        AllFood.buildFood();
    }
    resetGameState = () => {
        //store.dispatch(clearTimeouts());
        store.dispatch(resetGame());
        this.setState( this.originalState );
        // componentDidMount() logic also here because when a new game starts
        // the component is not re-mounted. (but this function WILL run, just
        // prior to new game starting)
        AllWalls.buildWalls();
        AllFood.buildFood();

    }
	setGameOver = gameOver => {
        if (gameOver){
            clearTimeout(this.timeoutId);
        }
        this.setState( { gameOver } );
    };
    pauseGame = () => {
        if (this.state.mountSnake){
            this.setState( { gamePaused: true } );
        }
        if (this.state.displayCountdown){
            // If a countdown is underway (snake is superSnake), decrement countdown timer
            // by one if player pauses game ( player incurs slight penalty for pausing,
            // otherwise they could potentially keep quickly pausing/unpausing without the
            // timer decrementing). This way the countdown is guaranteed to decrement by
            // at least one whenever game is paused).
            this.setState( (previousState) => {
                return { countdown: previousState.countdown - 1 };
            })
        }
        clearTimeout(this.timeoutId);
    }
    restartGame = () => {
        this.setState( { gamePaused: false } );
        if (this.state.displayCountdown){
            this.timeoutId = setTimeout( this.timeoutHandler, 1000);
        }
    }

    // setHead is passed as prop to Snake so Snake can call it with new head location received from redux.
    setHead = (x,y) => { this.setState( { headX: x, headY: y } ) };

    // handler for clicking "Start Game" conditional rendering used in below JSX to remove the start game modal,
    // and mount the snake (which causes game loop to start) when clicked.
	mountSnake = () => { this.setState( { mountSnake: true } ) };

    // the game basically starts here. User presses arrow key -> new snake direction/head location set in redux->
    // App local state set to be equal to that new head location -> App and child components evaluated for re-render
    // and their componentDidUpdate() methods called (because of state change)-> re-render -> game loop runs again.
    // (although this could be a bit misleading because a key press is not needed, the snake continues to run in the
    // same direction it is already going if there is no key press because the current snake direction is always
    // used to create the new head location).
    handleKeyDown = event => {
        // preventDefault to prevent page from scrolling down when down button is pressed (prevent normal downpress response in browser)
        event.preventDefault();
        if (event.keyCode == 39 && store.getState().lastDirection !== 'left') {
            store.dispatch(setSnakeDir(RIGHT));
        }
        if (event.keyCode == 40 && store.getState().lastDirection !== 'up') {
            store.dispatch(setSnakeDir(DOWN));
        }
        if (event.keyCode == 37 && store.getState().lastDirection !== 'right') {
            store.dispatch(setSnakeDir(LEFT));
        }
        if (event.keyCode == 38 && store.getState().lastDirection !== 'down') {
            store.dispatch(setSnakeDir(UP));
        }
    }

    incrementLevel = () => {
        // redux levelUp() causes appropriate redux state to change, and local state.level
        // change causes the app to re-render with the updated state.
        // incrementLevel() is passed to AllFood (as 'props.levelUp()') so that AllFood
        // has access to call it when

        this.clearSuperSnake();

        if (this.state.level === Object.keys(levels).length){
            this.setState( { gameOver: true, playerWins: true } );
            return;
        }

        store.dispatch(levelUp());
        this.setState( { level: store.getState().currentLevel } );

        AllWalls.buildWalls();
        AllFood.buildFood();
    }

    render(){
        const gameWrapperStyles = {
            outline: 'none',
            position: 'relative',
            width: `${BOX_SIZE * Array.from(levels[1][0]).length}px`,
            height: '85vh'
        }
        // tabIndex="0" property on the wrapper is needed so it can receive focus()
        return (
            <React.Fragment>
            <div ref={this.wrapperRef} tabIndex="0" onBlur={ this.pauseGame } onKeyDown={this.handleKeyDown} style={ gameWrapperStyles } >

    	              <AllWalls gameOver={this.state.gameOver} setGameOver={this.setGameOver} level={this.state.level} />

    	              <AllFood level={this.state.level} startCountdown={ this.startCountdown }/>

    	              {
    					  this.state.mountSnake ?
        					    <Snake
                                    wrapperRef={ this.wrapperRef }
                                    gamePaused={ this.state.gamePaused }
                                    gameOver={ this.state.gameOver }
                                    setGameOver={ this.setGameOver }
                                    setHead={ this.setHead }
                                    levelUp={ this.incrementLevel }
                                    countdown={ this.state.countdown }
                                />
    					  : <StartGameModal mountSnake={this.mountSnake} />
    				  }
                      {
                           this.state.gamePaused && !this.state.gameOver && !this.state.playerWins ? <GamePaused restartGame={ this.restartGame } /> : null
                      }
                      {
                           this.state.gameOver && !this.state.playerWins ? <GameOver resetGameState={ this.resetGameState } /> : null
                      }
                      {
                           this.state.playerWins ? <PlayerWins resetGameState={ this.resetGameState } /> : null
                      }
            </div>
            {
                this.state.displayCountdown ? <Countdown countdown={this.state.countdown} /> : null
            }
            </React.Fragment>
        );
    }
}

export default App;
