import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';

import _ from 'lodash';
import './the.css';

const BLANK = 0;
const PLAYER = "X";
const PLAYER_CLASS = PLAYER;
const COMPUTER = PLAYER === 'X' ? 'O' : 'X';
const COMPUTER_CLASS = COMPUTER;

const ID_NAMES = [ ["one", "two", "three"], ["four", "five", "six"], ["seven", "eight", "nine"] ];

const COORDINATES = { one:[0,0], two:[0,1], three:[0,2], four:[1,0], five:[1,1], six:[1,2], seven:[2,0], eight:[2,1], nine:[2,2] };

const CLASSNAMES = { 0: "free shadow", X: 'X', O: "O" };

// the client side component that calls the tic-tac-toe API to get computer's move
// (and displays/renders the board)
class TicTacToe extends React.Component {

    constructor(props){
        super(props);

        this.setComputer = this.setComputer.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.checkForWin = this.checkForWin.bind(this);

        this.originalState = {
            // board state starts as all spots blank.
            board: [ [BLANK,BLANK,BLANK], [BLANK,BLANK,BLANK], [BLANK,BLANK,BLANK] ],
            playersTurn: true,
            gameOver: false,
            tieGame: false,
            // winner stays null until(& if) there is a winner( & game is therefore over).
            winner: null
        };

        this.state = this.originalState;
    }
    async setComputer() {
        // create string versions of each row to pass to api
    	let row1 = `${this.state.board[0][0]}${this.state.board[0][1]}${this.state.board[0][2]}`;
    	let row2 = `${this.state.board[1][0]}${this.state.board[1][1]}${this.state.board[1][2]}`;
    	let row3 = `${this.state.board[2][0]}${this.state.board[2][1]}${this.state.board[2][2]}`;

        // give board and player to api in form it expects
    	return fetch(`https://9dhhgmwsye.execute-api.us-west-1.amazonaws.com/prod/${row1}/${row2}/${row3}/${PLAYER}`)
        .then(response => response.json())
        .then(json => {
            // the api returns its next move in the form of board coordinates
            let x = json.location[0];
            let y = json.location[1];

            // set the board item associated with returned x, y coordinates to COMPUTER (COMPUTER="O" currently)
            this.state.board[x][y] = COMPUTER;

            // set state.playersTurn=true to remove "thinking.." backdrop and allow click handler to respond to users clicks again
            this.setState({playersTurn: true});
        })
        .catch(error => console.log("Error setting the board:", error));

    };
    checkForWin(player){
        if (
                this.state.board[0][0] === this.state.board[0][1] && this.state.board[0][1] === this.state.board[0][2] && this.state.board[0][2] === player ||
                this.state.board[1][0] === this.state.board[1][1] && this.state.board[1][1] === this.state.board[1][2] && this.state.board[1][2] === player ||
                this.state.board[2][0] === this.state.board[2][1] && this.state.board[2][1] === this.state.board[2][2] && this.state.board[2][2] === player ||

                this.state.board[0][0] === this.state.board[1][0] && this.state.board[1][0] === this.state.board[2][0] && this.state.board[2][0] === player ||
                this.state.board[0][1] === this.state.board[1][1] && this.state.board[1][1] === this.state.board[2][1] && this.state.board[2][1] === player ||
                this.state.board[0][2] === this.state.board[1][2] && this.state.board[1][2] === this.state.board[2][2] && this.state.board[2][2] === player ||

                this.state.board[0][0] === this.state.board[1][1] && this.state.board[1][1] === this.state.board[2][2] && this.state.board[2][2] === player ||
                this.state.board[0][2] === this.state.board[1][1] && this.state.board[1][1] === this.state.board[2][0] && this.state.board[2][0] === player
            ) {
                return true;
            }
            return false;
    }
    async handleClick(event){
        // only respond to user clicks if game is not over, it is the player's turn, and they are clicking on a blank spot
        if (!this.state.gameOver && this.state.playersTurn && event.target.classList.contains('free')){

            // give turn back to computer since we are now handling the users click
            this.setState( {playersTurn: false});

            // get the coordinates of the board spot associated with clicked element
            let [x, y] = COORDINATES[event.target.id];

            // set the board spot chosen by user to PLAYER (currently PLAYER="X")
            this.state.board[x][y] = PLAYER;

            // if player's move didnt result in them winning...
            if (!this.checkForWin(PLAYER)){

                // call the api to get computer's move.
                await this.setComputer();

                // if computer's returned move caused them to win, set appropriate state.
                if (this.checkForWin(COMPUTER)){
                    this.setState({gameOver: true, winner: COMPUTER});
                }
            } else {
                // player's move caused them to win, so set appropriate state.
                this.setState({gameOver: true, winner: PLAYER});
            }

            // if we are at this point, then neither computer or player won on
            // their latest move, so check if we have a tie game (no blank spots left)
            let tieGame = true;
            for (let row of this.state.board){
                for (let item of row){
                    if (item === BLANK){
                        tieGame = false;
                    }
                }
            }
            if (tieGame){
                this.setState({tieGame: true, gameOver: true})
            }
        };
    }
    resetGameState = () => {
        this.setState( this.originalState );
        // the previous line setting state back to original state does not result in
        // the board being set back to its original state, and I am not sure why yet.
        // Setting it individually here, after the previous line, works (for some reason)
        this.setState( { board: [ [BLANK,BLANK,BLANK], [BLANK,BLANK,BLANK], [BLANK,BLANK,BLANK] ] } );
    }
    render(){
            // conditional rendering based on game state ( computer may be "thinking" (waiting for reply from API),
            // displaying who won (if game is over), or displaying "tie game" (if tie game))
            return(
                <div style={{marginTop: '60px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    { !this.state.playersTurn && !this.state.gameOver &&
                        <div style={{position: 'absolute', alignSelf: 'center', zIndex: '2', color: 'red', fontSize: '3em'}}>
                            <h1>Thinking...</h1>
                            <Backdrop style={{color: 'black', zIndex: '3'}} open={true} >
                                <CircularProgress style={{color: 'red'}}/>
                            </Backdrop>

                        </div>
                    }
                    {
                        this.state.gameOver && !this.state.tieGame &&
                        <Backdrop style={{color: 'black', zIndex: '3'}} open={true} onClick={ this.resetGameState }>
                            <div style={{ position: 'absolute', alignSelf: 'center', zIndex: '2', color: 'red', fontSize: '5em'}}>
                                <h1>{this.state.winner} wins!!!</h1>
                            </div>
                        </Backdrop>
                    }
                    {
                        this.state.tieGame &&
                        <Backdrop style={{color: 'black', zIndex: '3'}} open={true} onClick={ this.resetGameState }>
                            <div style={{ position: 'absolute', alignSelf: 'center', zIndex: '2', color: 'red', fontSize: '5em'}}>
                                <h1>Tie Game</h1>
                            </div>
                        </Backdrop>
                    }
                    {
                        <div id='tttgrid'>
                            {
                                _.flatten(ID_NAMES).map( (id, index) => {
                                    /* lots of mappings going on in 'className' property, but in the end we are just mapping
                                        the id names ("one", "two", "three" etc) to their classnames ( "free shadow" for blank
                                        spots, "O" for spots containing "O", and "X" for spots containing "X") */
                                    return(
                                        <div id={id}
                                            key={index}
                                            className={ CLASSNAMES[ this.state.board[ COORDINATES[id][0] ][ COORDINATES[id][1] ] ] }
                                            onClick={this.handleClick} >
                                        </div>
                                    )
                                })
                            }
                        </div>
                    }

                </div>
            )
    }
}
export default TicTacToe;
