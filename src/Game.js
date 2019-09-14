import React from 'react';
import './Game.css';

//rozmiar komórki i wielkość tablicy
const CELL_SIZE = 20;
const WIDTH = 400;
const HEIGHT = 400;


class Cell extends React.Component {
    //definicja komórki i jak to ma wyglądać
    render() {
        const { x, y } = this.props;
        return (
            <div className="Cell" style={{
                left: `${CELL_SIZE * x + 1}px`,
                top: `${CELL_SIZE * y + 1}px`,
                width: `${CELL_SIZE - 1}px`,
                height: `${CELL_SIZE - 1}px`,
            }} />
        );
    }
}


class Game extends React.Component {

    constructor() {
        super();
        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;

        this.board = this.makeEmptyBoard();
    }

    state = {
        cells: [],
        isRunning: false,
        interval: 25,
    }

    makeEmptyBoard() {
        let board = [];//---------------------------------pusta tablica button clear
        for (let y = 0; y < this.rows; y++) {//---------------
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }

        return board;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();//---------Metoda Element.getBoundingClientRect() zwraca rozmiar  oraz  położenie elementu względem okna widoku
        const doc = document.documentElement;

        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop,
        };
    }

    makeCells() {////----tworzy komórke
        let cells = [];////----- def pustej do dołożenia
        for (let y = 0; y < this.rows; y++) {//--- leci po y sprawdza od wysokości, przez wszystkie
            for (let x = 0; x < this.cols; x++) {//---sprawdza po x, sprawdza po szer, przez wszystki
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
            console.log('tworzy komórki')
        }

        return cells;
    }
    /// obsługa dostawianych komórek 
    handleClick = (event) => {//////-----nazwa funckcji = (cokolwiek) =>

        const elemOffset = this.getElementOffset();//---Metoda Element.getBoundingClientRect() zwraca rozmiar  oraz  położenie elementu względem okna widoku (viewport).
        const offsetX = event.clientX - elemOffset.x;// -- odpłynołem 
        const offsetY = event.clientY - elemOffset.y;//--- tu też 

        const x = Math.floor(offsetX / CELL_SIZE); // --- def x z parametru random z określonych parametrów wewnątrz funckji
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }

        this.setState({ cells: this.makeCells() });
        console.log('zaznacza komórkę przez gracza')//--- widać w konsoli /zbadaj strone
    }

    runGame = () => {
        this.setState({ isRunning: true });
        this.runIteration();
        console.log('start game')
    }

    stopGame = () => {
        this.setState({ isRunning: false });
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
            console.log('stop game')
        }
    }
    //-------tworzy nową tablicę
    runIteration() {
        let newBoard = this.makeEmptyBoard();

        for (let y = 0; y < this.rows; y++) {//-----sprawdza wiersze 
            for (let x = 0; x < this.cols; x++) {//----sprawdza kolumny
                let neighbors = this.calculateNeighbors(this.board, x, y); ///-----definicja sąsiadów = wywołuje metode sprawdzającą z aktulnej tablicy
                if (this.board[y][x]) {
                    if (neighbors === 2 || neighbors === 3) {// 2) jesli ma 2 lub 3 sąsiadów przeżywa do nastepnej generacji
                        newBoard[y][x] = true;//----komórka zostaje
                    } else {
                        newBoard[y][x] = false;/// w innym przypdku umiera punkt 3)
                    }
                } else {
                    if (!this.board[y][x] && neighbors === 3) {//-----4)Każda martwa komórka z dokładnie trzema żywymi sąsiadami staje się żywą komórką.
                        newBoard[y][x] = true;
                    }
                }
            }
        }

        this.board = newBoard;
        this.setState({ cells: this.makeCells() });

        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    calculateNeighbors(board, x, y) {///---------zlicza sąsiadów
        let neighbors = 0;///---- na początek zdefiniowanie sąsiadów jako komórki w około tej jednej [0,0]
        const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];//-----parametry komórek sąsiadujących/ indexy w około sąsiada
        for (let i = 0; i < dirs.length; i++) { ///----index równa sięzero, sprawdza po długości czy któreś występują jak występują
            const dir = dirs[i];///// --------- definijuje pojedyńcze miejesce z tablicy dirs dodaje konkretne miejsca
            let y1 = y + dir[0]; ////---- i tak y1 to
            let x1 = x + dir[1];

            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                neighbors++;//--- jeśli x1 jest większe równe od zera --i--- x1 mniejsze niż w tej kolumnie --i-- jeśli y1 jest większe równe od zera --i--- y1 mniejsze niż w tej kolumnie i
            }
        }

        return neighbors;
    }
    /////////////////////////////----------------------interwał czasowy odświeża tablice sprawdza stan
    handleIntervalChange = (event) => {
        this.setState({ interval: event.target.value });
    }
    ////////////////////////---------------------button obługuje clear
    handleClear = () => {
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() });
    }
    ///////////////-----------------------------button obsługuje random
    handleRandom = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);//---- action script 3.0 zawsze wyszuka większą lub mniejszą liczbę np 0 lub 1 ale co w przypadku 0.2 lub 0.9 nie bardzo kumam
            }
        }

        this.setState({ cells: this.makeCells() });// bierze parametry wygenerowane tu  i ładuje je do funkcji makeCells
    }
    /////////////////////////-----------------wypluwa na stronke tablice, komórki, random, start, stop, cleaar
    render() {
        const { cells, isRunning } = this.state;
        return (
            <div>
                <div className="Board"
                    style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }}
                    onClick={this.handleClick}
                    ref={(n) => { this.boardRef = n; }}>

                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
                    ))}
                </div>

                <div className="controls">
                    Refresh board: <input value={this.state.interval} onChange={this.handleIntervalChange} /> msec
                    {isRunning ?
                        <button className="button" onClick={this.stopGame}>Stop</button> :
                        <button className="button" onClick={this.runGame}>Run</button>
                    }
                    <button className="button" onClick={this.handleRandom}>Random</button>
                    <button className="button" onClick={this.handleClear}>Clear</button>
                </div>
            </div>
        );
    }
}


export default Game;