const chai = require('chai');
const assert = chai.assert;

// ***************************************************************************** //
// NOTE:
// This code is not imported into the project anywhere because it exists as a Amazon AWS
// Lambda function/ API Gateway endpoint. I am just including it in the project for
// completeness.
// (exports.handler function is the function Amazon AWS API Gateway calls when a
// valid GET is made to my API)
// ***************************************************************************** //

const BLANK = '0';
const COMPUTER = 'O';
const PLAYER = 'X';

// a valid player choice is a string "X" or string "O". Use chai.js assert to verify this.
const isValidPlayer = (choice) => assert(choice === 'X' || choice === 'O', "given player is not a string X or O");

// a valid board is an array of 3 arrays, with each sub-array consisting of a valid player or character
// representing a blank spot (BLANK constant, currently set to '0', but can be changed).
const isValidBoard = (board) => {
    assert( Array.isArray(board), "given board is not an array" );
    assert( board.length === 3, "given board does not have length of 3" );
    board.forEach(row => assert( Array.isArray(row), "at least one of board's items is not an array" ) );
    board.forEach(row => row.forEach(item => item === BLANK ? null : isValidPlayer(item)  ) );
}

// helper function that finds the number of blank spots on a given board
function depth(board){
    let count = 0;
    board.forEach(row => row.forEach(item => { if (item === BLANK) { count++ } } ));
    return count;
}

// helper function. given a board and current player, check if current player has won the game
function checkWin(board, player){
    if (
            // top row win
            board[0][0] === board[0][1] && board[0][1] === board[0][2] && board[0][2] === player ||
            // middle row win
            board[1][0] === board[1][1] && board[1][1] === board[1][2] && board[1][2] === player ||
            // bottom row win
            board[2][0] === board[2][1] && board[2][1] === board[2][2] && board[2][2] === player ||
            // left column win
            board[0][0] === board[1][0] && board[1][0] === board[2][0] && board[2][0] === player ||
            // middle column win
            board[0][1] === board[1][1] && board[1][1] === board[2][1] && board[2][1] === player ||
            // right column win
            board[0][2] === board[1][2] && board[1][2] === board[2][2] && board[2][2] === player ||
            // diagonal top left to bottom right win
            board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[2][2] === player ||
            // diagonal top right to bottom left win
            board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[2][0] === player
        ) {
            return true;
        }
        return false;
}
// helper function to score a board. (minimax boards are scored as -1, 0, or 1)
function scoreBoard(board) {
    // if maximizing player wins, return 1
    if (checkWin(board, 1)) {
        return 1;
    } else {
        // if minimizing player wins, return -1
        if (checkWin(board, -1)) {
            return -1;
        };
    };
    // no one has won the current board, so return 0
    return 0;
}

// return the locations for all BLANK spots on a given board.
function* getOpenSpots(board) {
    let openSpots = [];
    for (let x in board){
        for (let y in board[x]){
            if (board[x][y] === BLANK) {
                yield [x,y];
            };
        };
    };
}

function minimax(board, depth, isMax){
    let savedBest = {
        score: isMax ? -Infinity: Infinity,
        depth: depth,
        location: [-1, -1]
    };
    // score can be -1 (minimizing player win), 0 (no winner), or 1(maximizing player win)
    let winResult = scoreBoard(board);

    // if score is not 0 (so its 1 or -1), a player has won at this position, so return with that score
    // also, if the depth is 0, then the board is full and no one has won, so the score will be returned
    // as 0 (tie game)
    if (winResult === -1 || winResult === 1 || depth === 0) {
        return { score: winResult, depth: depth, location: [-1, -1] };
    }
    // score = 0 and depth > 0 (game not over)
    let openSpots = getOpenSpots(board);

    // iterate all open spots
    for (let [x, y] of openSpots) {

        // put our piece on current empty spot (1 if max player, -1 if min player)
        board[x][y] = isMax ? 1 : -1;

        // find the score of current board
        let best = minimax(board, depth - 1, !isMax);

        // remove our piece from current empty spot since that position has been evaluated
        board[x][y] = BLANK;

        if (isMax) {
            // we are the maximizing player, so find the max between current score and saved best score
            if (best.score > savedBest.score) {
                best.location = [x, y];
                savedBest = best;
            }
        } else {
            // we are the minimizing player, so find the minimum between current score and saved best score
            if (best.score < savedBest.score) {
                best.location = [x, y];
                savedBest = best;
            }
        }
        // If given the choice between blocking the other player from winning and placing piece in
        // the winning position, choose to place the winning piece. (both options represent a
        // win, but we want the computer to choose the one that happens in less moves (higher depth))
        // if (best.score === savedBest.score) {
        //     if (best.depth > savedBest.depth) {
        //         best.location = [x, y];
        //         savedBest = best;
        //     }
        // }
    }
    // return the "best" as determined by current player
    return savedBest;
}

function encodeBoard(board) {
    return board.map(row => row.map( choice => {
        //const endcodeMapping = { [PLAYER]: -1, [COMPUTER]: 1, [BLANK]:BLANK };
        const encodeMap = { 'X': -1, 'O': 1, '0': '0'};
        return encodeMap[choice];
    } ) );
}

exports.handler = async (event) => {

    // obtain the board being passed to this api by getting url parameters passed in.
    // example url passed in: [ DOMAIN NAME ]/O00/0X0/O00/X (last character represents the current player)
    // example board: [ ['X', '0', '0'], ['0', '0', 'O'], ['X', 'O', '0'] ]
    let theBoard = [
        [ ...event['pathParameters']['row1'] ],
        [ ...event['pathParameters']['row2'] ],
        [ ...event['pathParameters']['row3'] ]
    ];

    const playerChoice = event['pathParameters']['playerChoice'];

    // check that board and player are valid (chai.js asserts are used)
    isValidPlayer(playerChoice);
    isValidBoard(theBoard);

    // turn a board consisting of x's, o's and characters representing blank spots (currently "0")
    // into a board of 1's, -1's, and characters representing blank spots.
    let finalGrid = encodeBoard(theBoard);

    // minimax takes a grid (of 1's, -1's, and chars representing blank spots), a depth
    // (number of blank spots), and a current player (starts as the computer, which is the max player)
    let answer = minimax(finalGrid, depth(finalGrid), 1);

    const response = {
        statusCode: 200,
        // headers needed here to provide CORS access
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(answer),
    };
    return response;
};
