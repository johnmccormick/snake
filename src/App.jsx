import { useEffect, useState } from "react";
import "./App.css";

const snake = {
  locked: false,
  vx: 1,
  vy: 0,
  body: [
    { x: 3, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ],
};
const fruit = { x: 1, y: 1 };
const game = { running: false, gameOver: false, win: false, tick: 0 };
let gameInterval = null;
let headSymbol = '>';

const GRID_SIZE = 15;
const GAME_INTERVAL_MS = 100;

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const makeRow = ({ snake, fruit, y }) => {
  let result = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    let cell = <></>;
    if (y === fruit.y && x === fruit.x) cell = "o";
    snake.body.forEach((body, index) => {
      if (y === body.y && x === body.x) cell = index === 0 ? headSymbol : "x";
    });
    result.push(
      <div key={x} className="cell">
        {cell}
      </div>
    );
  }
  return result;
};

const makeGrid = ({ snake, fruit }) => {
  let result = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    result.push(
      <div key={y} className="row">
        {makeRow({ snake, fruit, y })}
      </div>
    );
  }
  return result;
};

const processKeyPress = (e) => {
  // console.log(e.key);
  if (snake.locked === false) {
    if (e.key === "ArrowUp" && snake.vy === 0) {
      snake.vx = 0;
      snake.vy = -1;
      headSymbol = "ʌ"
      snake.locked = true;
    }
    if (e.key === "ArrowDown" && snake.vy === 0) {
      snake.vx = 0;
      snake.vy = 1;
      headSymbol = "v"
      snake.locked = true;
    }
    if (e.key === "ArrowLeft" && snake.vx === 0) {
      snake.vx = -1;
      snake.vy = 0;
      headSymbol = "<"
      snake.locked = true;
    }
    if (e.key === "ArrowRight" && snake.vx === 0) {
      snake.vx = 1;
      snake.vy = 0;
      headSymbol = ">"
      snake.locked = true;
    }
  }
};

function App() {
  const [gameState, setGameState] = useState(game);

  if (!gameInterval && gameState.running)
    gameInterval = setInterval(() => {
      // First check for collisions...
      let collision = false;
      if (
        snake.body[0].x + snake.vx < 0 ||
        snake.body[0].x + snake.vx >= GRID_SIZE ||
        snake.body[0].y + snake.vy < 0 ||
        snake.body[0].y + snake.vy >= GRID_SIZE
      ) {
        collision = true;
      }

      for (let i = snake.body.length - 1; i > 0; i--) {
        if (
          snake.body[0].x + snake.vx === snake.body[i].x &&
          snake.body[0].y + snake.vy === snake.body[i].y
        ) {
          console.log(
            "snake.body[0].x + snake.vx:",
            snake.body[0].x + snake.vx
          );
          console.log("snake.body[i].x:", snake.body[i].x);
          console.log(
            "snake.body[0].y + snake.vy:",
            snake.body[0].y + snake.vy
          );
          console.log("snake.body[i].x:", snake.body[i].x);
          collision = true;
          break;
        }
      }

      if (collision === true) {
        clearInterval(gameInterval);
        gameInterval = null;
        game.running = false;
        game.gameOver = true;
        setGameState({ ...game });
        return;
      }

      // Game running, and no collisions? Great. Lets check for fruit.
      let hitFruit = false;
      if (
        snake.body[0].x + snake.vx === fruit.x &&
        snake.body[0].y + snake.vy === fruit.y
      ) {
        hitFruit = true;
      }

      // If we hit fruit, we can just add the position to snake body
      if (hitFruit) {
        snake.body.unshift({ x: fruit.x, y: fruit.y });

        // If we have eaten all the fruit, it's game over
        if (snake.body.length >= GRID_SIZE * GRID_SIZE) {
          clearInterval(gameInterval);
          gameInterval = null;
          game.running = false;
          game.gameOver = true;
          game.win = true;
          setGameState({ ...game });
          return;
        } 

        // Then repositon the fruit outside the snake body
        let validFruitPosition = false;
        while (!validFruitPosition) {
          validFruitPosition = true;
          let newFruitX = getRandomInt(GRID_SIZE);
          let newFruitY = getRandomInt(GRID_SIZE);
          for (let i = 0; i < snake.body.length; i++) {
            if (
              newFruitX === snake.body[i].x &&
              newFruitY === snake.body[i].y
            ) {
              validFruitPosition = false;
              break;
            }
          }
          if (validFruitPosition) {
            fruit.x = newFruitX;
            fruit.y = newFruitY;
          }
        }
      } else {
        // ...otherwise, move it along
        for (let i = snake.body.length - 1; i > 0; i--) {
          snake.body[i].x = snake.body[i - 1].x;
          snake.body[i].y = snake.body[i - 1].y;
        }
        snake.body[0].x += snake.vx;
        snake.body[0].y += snake.vy;
      }

      // Remaining clock, key unlock + of course, update the state!
      game.tick += 1;
      snake.locked = false;
      setGameState({ ...game });
    }, GAME_INTERVAL_MS);

  // useEffect(() => {
  //   console.log("gs", gameState);
  // }, [gameState]);

  return (
    <>
      <div
        className="outer-wrapper"
        onKeyDown={(e) => processKeyPress(e)}
        tabIndex="0"
      >
        <div className="inner-wrapper">
          <div>
            {/* <p>Tick {gameState.tick}</p> */}
            {gameState.gameOver ? <h1>{gameState.win ? 'You win' : 'Game over'}!</h1> : <h1>Snake</h1>}
          </div>
          <div className="grid">{makeGrid({ snake, fruit })}</div>
          <p
            className="start"
            onClick={() => {
              game.running = true;
              setGameState({ ...game });
            }}
          >
            {gameState.running || gameState.gameOver ? "" : "start"}
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
  