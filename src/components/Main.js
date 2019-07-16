import React from 'react';

const board = [ [], [], [], [], [], [], [], [], [] ];

const row = [ [], [], [], [], [], [], [], [], [] ];
const col = [ [], [], [], [], [], [], [], [], [] ];
const block = [ [], [], [], [], [], [], [], [], [] ];

class Cell extends React.Component {
    render() {
        return (
            <div className="cell" tabIndex="0" onKeyDown={ (e) => this.props.onKeyDown(e, this.props.id) }>{ this.props.value }</div>
        );
    }
}

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cells: Array(81).fill(0),
            solved: false,
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
        init();
    }

    renderCell(i) {
        return <Cell
            key={ i }
            id={ i }
            value={ (this.state.cells[i] !== 0) ? ( (this.state.solved) ? board[Math.floor(i / 9)][i % 9] : this.state.cells[i] ) : '' }
            onKeyDown={ this.handleKeyDown }
        />
    }

    handleKeyDown(event, id) {
        let keyCode = event.keyCode;
        const cells = this.state.cells.slice();
        if ( (keyCode >= 49 && keyCode <= 57) && this.state.cells[id] === 0 ) {
            cells[id] = keyCode - 48;
        }
        else if ( keyCode === 8 && this.state.cells[id] !== 0 ) {
            cells[id] = 0;
            this.removeValuesFromBoard();
        }
        else {
            event.preventDefault();
        }
        this.setState ({
            cells: cells,
            solved: false,
        });
    }

    reinsertValuesIntoBoard() {
        let index = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                let num = this.state.cells[index++];
                insert(num, r, c);
                board[r][c] = num;
            }
        }
    }

    removeValuesFromBoard() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                remove(r, c);
                board[r][c] = 0;
            }
        }
    }

    solve() {
        if (!this.state.solved) {
            this.reinsertValuesIntoBoard();
            if (!is_valid_board() || !solve(0, 0)) {
                this.removeValuesFromBoard();
            }
            else {
                const cells = this.state.cells.slice();
                for (let i = 0, index = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++, index++) {
                        cells[index] = board[i][j];
                    }
                }
                this.setState({
                    cells: cells,
                    solved: true,
                });
            }
        }
    }

    reset() {
        this.removeValuesFromBoard();
        this.setState ({   
            cells: Array(81).fill(0),
            solved: false,
        });
    }
 
    render() {
        let top = 0;
        let mid = 9;
        let bot = 18;
        let gameRows = [];
        for (let row = 1; row <= 3; row++) {
            let block = [];
            for (let blk = 1; blk <= 3; blk++) {
                let brow = [];
                for (let blockrow = 1; blockrow <= 3; blockrow++) {
                    let cells = [];
                    for (let cell = 1; cell <= 3; cell++) {
                        if (blockrow === 1) cells.push(this.renderCell(top++));
                        else if (blockrow === 2) cells.push(this.renderCell(mid++));
                        else if (blockrow === 3) cells.push(this.renderCell(bot++));
                    }
                    brow.push(<div key={top+mid+bot} className="block-row">{cells}</div>);
                }
                block.push(<div key={top+mid+bot+1} className="block">{brow}</div>);
            }
            gameRows.push(<div key={top+mid+bot+2} className="game-row">{block}</div>);
            top += 18;
            mid += 18;
            bot += 18;
        }

        return (
            <div className="main">
                <div className="game">
                    {gameRows}
                </div>
                <div className="controls">
                    <button onClick={ () => this.solve() }>Solve</button>
                    <button onClick={ () => this.reset() }>Reset</button>
                </div>
            </div>
        );
    }
}

function is_valid_board() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            for (let num = 1; num <= 9; num++) {
                if ( row[r][num] > 1 || col[c][num] > 1 || block[ (Math.floor(r / 3)) * 3 + (Math.floor(c / 3)) ][num] > 1 ) {
                    return false;
                }
            }
        }
    }
    return true;
}

function insert( num, r, c ) {
    const blk = (Math.floor(r / 3)) * 3 + (Math.floor(c / 3));
    board[r][c] = num;
	row[r][ num ]++;
    col[c][ num ]++;
	block[ blk ][ num ]++;
}

function remove( r, c ) {
    const num = board[r][c];
    const blk = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    board[r][c] = 0;
	row[r][ num ]--;
	col[c][ num ]--;
	block[ blk ][ num ]--;
}

function already_in( num, r, c ) {
    const blk = (Math.floor(r / 3)) * 3 + (Math.floor(c / 3));
    return row[r][num] || col[c][num] || block[blk][num];
}

function solved() {
    for (let i = 0; i < 9; i++) {
        for (let num = 1; num <= 9; num++) {
            if (!row[i][num] || !col[i][num] || !block[i][num]) return false;
        }
    }
    return true;
}

function solve( r, c ) {
    if (r === 9 && c === 9) {
        return solved();
    }

    if (board[r][c]) {
        if (c + 1 < 9) return solve(r, c + 1);
        else if (r + 1 < 9) return solve(r + 1, 0);
        else return solve(9, 9);
    }

    for (let num = 1; num <= 9; num++) {
        if ( already_in(num, r, c) ) continue;
        let solved = false;
        insert(num, r, c);
        if (c + 1 < 9) solved = solve(r, c + 1);
        else if (r + 1 < 9) solved = solve(r + 1, 0);
        else solved = solve(9, 9);

        if (solved) return true;
        remove(r, c);
    }

    return false;
}

function init() {
    for (let i = 0; i < 9; i++) {
        for (let j = 1; j <= 9; j++) {
            row[i][j] = 0;
            col[i][j] = 0;
            block[i][j] = 0;
        }
    }
}