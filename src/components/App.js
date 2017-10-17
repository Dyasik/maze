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
  FOUND_PATH_COLOR: 'royalblue',
};

export default class App extends React.Component {
  constructor() {
    super();

    this.handleStart = this.handleStart.bind(this);
    this.handleRegenerate = this.handleRegenerate.bind(this);

    this.mazeGenerator = new MazeGenerator();

    this.state = {
      ...this.mazeGenerator.generateArray(FIELD.WIDTH, FIELD.HEIGHT),
      pathCells: [],
    };
  }

  handleStart() {
    if (this.state.pathCells.length) {
      return;
    }

    const {maze, from, to} = this.state;
    const map = maze.map(row => row.map(cell => ({
      type: cell ?
        PathfindingConstants.TILE_TYPE.OBSTACLE
        :
        PathfindingConstants.TILE_TYPE.EMPTY
    })));
    map[from.row][from.col].type = PathfindingConstants.TILE_TYPE.START;
    map[to.row][to.col].type = PathfindingConstants.TILE_TYPE.TARGET;

    this.setState({
      pathCells: aStar(from.row + ',' + from.col, to.row + ',' + to.col, map)
    });
  }

  handleRegenerate() {
    this.setState({
      ...this.mazeGenerator.generateArray(FIELD.WIDTH, FIELD.HEIGHT),
      pathCells: [],
    });
  }

  renderHead() {
    return (
      <div className="head">
        <div className="buttons">
          <button onClick={this.handleStart}>START</button>
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
          <Tile key={i + ',' + j}
                width={FIELD.LINE_WIDTH}
                height={FIELD.LINE_WIDTH}
                left={j * FIELD.LINE_WIDTH}
                top={i * FIELD.LINE_WIDTH}
                color={FIELD.WALL_COLOR}/>
        );
      }
    }
    // path
    if (this.state.pathCells && this.state.pathCells.length) {
      this.state.pathCells.forEach((cell) => {
        const [i, j] = cell.split(',');
        cells.push(
          <Tile key={i + ',' + j}
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
