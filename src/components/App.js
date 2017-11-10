import React from 'react';
import MazeGenerator from '../MazeGenerator';
import Tile from './Tile';
import { aStar } from 'visual-path-finding/src/utils/algorithms';
import * as PathfindingConstants from 'visual-path-finding/src/utils/constants';

import '../styles.less';

const FIELD = {
  WIDTH: 45,
  HEIGHT: 55,
  LINE_WIDTH: 10,
  WALL_COLOR: 'black',
  PATH_COLOR: 'white',
  FOUND_PATH_COLOR: 'deepskyblue',
  OPEN_PATH_COLOR: 'royalblue',
  CLOSED_PATH_COLOR: 'blueviolet',
};

export default class App extends React.Component {
  constructor() {
    super();

    this.handleStart = this.handleStart.bind(this);
    this.handleRegenerate = this.handleRegenerate.bind(this);

    this.mazeGenerator = new MazeGenerator();
     this.animator = {
      /**
       * Starts (or resumes) animation of the pathfinding based on given buffer.
       * Buffer is an array of the states to animate PLUS the "path" field,
       * containing the result path.
       * @param {object} [buffer] - Animation buffer (to animate) or
       *                            nothing (to resume).
       */
      start: function(buffer) {
        if (buffer) {
          this._buffer = buffer;
          this._i = 0;
          this.hasAnimation = true;
        }

        this.isAnimating = true;
        this._timeout = setTimeout(function draw(anim) {
          if (anim._i < anim._buffer.length && anim._i >= 0) {
            anim.setState({
              ...anim._buffer[anim._i++],
            });
            anim._timeout = setTimeout(draw, anim.delay, anim);
          } else {
            // negative counter is used to animate final path instead
            // of the path finding
            if (anim._i >= 0) {
              // if counter is >= 0, path animation hasn't been launched
              // yet, so the initial state must be set (= -1);
              // otherwise just continue path animation
              anim._i = -1;
            }
            clearTimeout(anim._timeout);
            anim._timeout = setTimeout(function drawPath(anim) {
              const i = -anim._i;
              anim.setState({
                pathCells: anim._buffer.path.slice(0, i),
              });
              if (i === anim._buffer.path.length) {
                clearTimeout(anim._timeout);
                anim.isAnimating = false;
                anim.hasAnimation = false;
                // call callbacks
                anim._animationEndCallbacks.forEach(cb => cb());
              }
              anim._i--;
              anim._timeout = setTimeout(drawPath, anim.path_delay, anim);
            }, anim.path_delay, anim);
          }
        }, this.delay, this);
      },
      /**
       * Pauses the animation.
       */
      stop: function() {
        clearTimeout(this._timeout);
        this.isAnimating = false;
      },
      // is the animation running at the moment
      isAnimating: false,
      // is there an active animation (running or paused)
      hasAnimation: false,
      // for drawing animation
      setState: this.setState.bind(this),
      // path finding animation delay
      delay: 10,
      // result path animation delay
      path_delay: 1,
      // private buffer
      _buffer: {},
      // animation counter
      _i: NaN,
      // timeout id
      _timeout: NaN,
      _animationEndCallbacks: [
        (function() {
          this.refs.start.innerHTML = 'FINISHED';
        }).bind(this),
      ],
    };

    this.state = {
      ...this.mazeGenerator.generateArray(FIELD.WIDTH, FIELD.HEIGHT),
      pathCells: [],
      openCells: [],
      closedCells: [],
    };
  }

  handleStart() {
    if (this.state.pathCells.length && !this.animator.hasAnimation) {
      // animation has already played
      return;
    }

    if (this.animator.isAnimating) {
      this.animator.stop();
      this.refs.start.innerHTML = 'START';
    } else if (!this.animator.hasAnimation) {
      const {maze, from, to} = this.state;
      const map = maze.map(row => row.map(cell => ({
        type: cell ?
          PathfindingConstants.TILE_TYPE.OBSTACLE
          :
          PathfindingConstants.TILE_TYPE.EMPTY
      })));
      map[from.row][from.col].type = PathfindingConstants.TILE_TYPE.START;
      map[to.row][to.col].type = PathfindingConstants.TILE_TYPE.TARGET;

      const cellsBuffer = [];
      cellsBuffer.path = aStar(from.row + ',' + from.col, to.row + ',' + to.col, map,
        (openCells, closedCells) => {
          cellsBuffer.push({
            openCells: [...openCells],
            closedCells: [...closedCells],
          });
        }
      );
      this.refs.start.innerHTML = 'STOP';
      this.animator.start(cellsBuffer);
    } else {
      // resume
      this.animator.start();
      this.refs.start.innerHTML = 'STOP';
    }
  }

  handleRegenerate() {
    this.animator.stop();
    this.animator.hasAnimation = false;
    this.refs.start.innerHTML = 'START';
    this.setState({
      ...this.mazeGenerator.generateArray(FIELD.WIDTH, FIELD.HEIGHT),
      pathCells: [],
      openCells: [],
      closedCells: [],
    });
  }

  renderHead() {
    return (
      <div className="head">
        <div className="buttons">
          <button onClick={this.handleStart} ref="start">START</button>
          <button onClick={this.handleRegenerate}>REGENERATE</button>
        </div>
      </div>
    );
  }

  renderMaze() {
    let cells = [];
    // walls
    for (let i = 0; i < FIELD.HEIGHT; i++) {
      for (let j = 0; j < FIELD.WIDTH; j++) {
        if (!this.state.maze[i][j]) {
          continue;
        }
        cells.push(
          <Tile key={'wall:' + i + ',' + j}
                width={FIELD.LINE_WIDTH}
                height={FIELD.LINE_WIDTH}
                left={j * FIELD.LINE_WIDTH}
                top={i * FIELD.LINE_WIDTH}
                color={FIELD.WALL_COLOR}/>
        );
      }
    }
    // open tiles
    if (this.state.openCells && this.state.openCells.length) {
      this.state.openCells.forEach((cell) => {
        const [i, j] = cell.split(',');
        cells.push(
          <Tile key={'opened:' + i + ',' + j}
                width={FIELD.LINE_WIDTH}
                height={FIELD.LINE_WIDTH}
                left={j * FIELD.LINE_WIDTH}
                top={i * FIELD.LINE_WIDTH}
                color={FIELD.OPEN_PATH_COLOR}/>
        );
      });
    }
    // closed tiles
    if (this.state.closedCells && this.state.closedCells.length) {
      this.state.closedCells.forEach((cell) => {
        const [i, j] = cell.split(',');
        cells.push(
          <Tile key={'closed:' + i + ',' + j}
                width={FIELD.LINE_WIDTH}
                height={FIELD.LINE_WIDTH}
                left={j * FIELD.LINE_WIDTH}
                top={i * FIELD.LINE_WIDTH}
                color={FIELD.CLOSED_PATH_COLOR}/>
        );
      });
    }
    // path
    if (this.state.pathCells && this.state.pathCells.length) {
      this.state.pathCells.forEach((cell) => {
        const [i, j] = cell.split(',');
        cells.push(
          <Tile key={'path:' + i + ',' + j}
                width={FIELD.LINE_WIDTH}
                height={FIELD.LINE_WIDTH}
                left={j * FIELD.LINE_WIDTH}
                top={i * FIELD.LINE_WIDTH}
                color={FIELD.FOUND_PATH_COLOR}/>
        );
      });
    }

    return (
      <svg ref={'field'}
           width={FIELD.WIDTH * FIELD.LINE_WIDTH}
           height={FIELD.HEIGHT * FIELD.LINE_WIDTH}
           style={{backgroundColor: FIELD.PATH_COLOR}}>
        { cells }
      </svg>
    );
  }

  render() {
    return (
      <div>
        {this.renderHead()}
        {this.renderMaze()}
      </div>
    );
  }
}
