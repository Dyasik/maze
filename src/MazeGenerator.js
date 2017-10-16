import { randRange } from './utils';
import { SVG_NS_URI } from './constants';

const DEFAULT_LINE_WIDTH = 5,
      DEFAULT_WALL_COLOR = 'black',
      DEFAULT_PATH_COLOR = 'white';

/**
 * Class representing maze generator.
 */
export default class MazeGenerator {
  /**
   * @constructor
   * @param {object} [options] - Maze parameters.
   * @param {number} options.lineWidth - Maze's walls and paths width.
   * @param {string} options.wallColor - Maze's walls' color.
   * @param {string} options.pathColor - Maze's paths' color.
   */
  constructor(options) {
    this.configure(options);
  }

  /**
   * Set Maze's draw configuration.
   * @param {object} [options] - Maze parameters (optional only for internal use).
   * @param {number} options.lineWidth - Maze's walls and paths width.
   * @param {string} options.wallColor - Maze's walls' color.
   * @param {string} options.pathColor - Maze's paths' color.
   */
  configure(options) {
    this.lineWidth = options.lineWidth || DEFAULT_LINE_WIDTH;
    this.wallColor = options.wallColor || DEFAULT_WALL_COLOR;
    this.pathColor = options.pathColor || DEFAULT_PATH_COLOR;
  }

  /**
   * Generates maze as a 2D array using depth-first algorithm.
   * @param {number} width - Total number of columns in the array.
   * @param {number} height - Total number of rows in the array.
   * @returns {object} - start cell, end cell and 2d array where
   *                     "true" cells are walls and "false" cells are paths.
   */
  generateArray(width, height) {
    if (!width || !height) {
      throw 'Width or height isn\'t provided.'
    }

    const perimeter = (width + height - 2) * 2;
    /**
     * Calculates row and column of the cell, found by going to it along
     * the perimeter from the left top corner.
     * @param {number} length - Length of the path to the cell.
     * @returns {object} - Row and col values for the cell.
     */
    const getCellByPerimeterPathLength = (length) => {
      if (length > perimeter - height) {
        // entrance or exit is on the left side;
        // adjust the row so that it's not in the wall row
        let tempRow = perimeter - length;
        if (tempRow % 2 === 0) {
          tempRow--;
        }
        return {
          row: tempRow,
          col: 0
        }
      } else if (length > perimeter - height - width + 1) {
        // entrance or exit is on the bottom side;
        // adjust the column so that it's not in the wall column
        let tempCol = perimeter - height - length + 1;
        if (tempCol % 2 === 0) {
          tempCol++;
        }
        return {
          row: height - 1,
          col: tempCol
        }
      } else if (length > perimeter - 2*height - width + 2) {
        // entrance or exit is on the right side;
        // adjust the row so that it's not in the wall row
        let tempRow = length - height + 1;
        if (tempRow % 2 === 0) {
          tempRow--;
        }
        return {
          row: tempRow,
          col: width - 1
        }
      } else {
        // entrance or exit is on the top side
        // adjust the column so that it's not in the wall column
        let tempCol = length;
        if (tempCol % 2 === 0) {
          tempCol++;
        }
        return {
          row: 0,
          col: tempCol
        }
      }
    };

    // randomly define the entrance and exit cells
    const entrance = getCellByPerimeterPathLength(randRange(perimeter / 2));
    const exit = getCellByPerimeterPathLength(
      randRange(perimeter / 2, perimeter)
    );

    // create array for calculations
    const calcMaze = [];
    for (let i = 0; i < height; i++) {
      calcMaze.push(new Array(width));
      for (let j = 0; j < width; j++) {
        let isWall = false;
        // fill the walls grid
        if (!(i % 2) || !(j % 2)) {
          isWall = true;
        }
        // make entrance and exit not walls
        if ((i === entrance.row && j === entrance.col)
          || (i === exit.row && j === exit.col)) {
          isWall = false;
        }
        calcMaze[i][j] = {
          visited: false,
          isWall, i, j
        };
      }
    }

    /**
     * Returns true if there are unvisited cells in the calculation array.
     * @returns {boolean}
     */
    const haveUnvisitedCells = () => {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          if (!calcMaze[i][j].isWall && !calcMaze[i][j].visited) {
            return true;
          }
        }
      }
    };

    // MAIN ALGORITHM START
    // --------------------
    let currentCell = calcMaze[entrance.row][entrance.col];
    currentCell.visited = true;
    let stack = [];
    while (haveUnvisitedCells()) {
      const neighbourgs = [];
      /**
       * Adds adjacent by d cells neighbours to neighbours array.
       * @param {number} d - Distance between current cells and the neighs.
       */
      const getNeighs = (d) => {
        [
          [currentCell.i - d, currentCell.j],
          [currentCell.i, currentCell.j - d],
          [currentCell.i, currentCell.j + d],
          [currentCell.i + d, currentCell.j]
        ].forEach((pair) => {
          let tempNeigh = calcMaze[pair[0]] ? calcMaze[pair[0]][pair[1]] : null;
          if (tempNeigh && !tempNeigh.isWall && !tempNeigh.visited) {
            neighbourgs.push(tempNeigh);
          }
        });
      };
      getNeighs(1);
      if (!neighbourgs.length) {
        getNeighs(2);
      }

      if (neighbourgs.length) {
        const newCell = neighbourgs[randRange(neighbourgs.length)];
        stack.push(currentCell);
        // remove the wall between the cells (if any)
        if (Math.sqrt(Math.pow(newCell.i - currentCell.i, 2) + 
            Math.pow(newCell.j - currentCell.j, 2)) === 2) {
          /**
           * Returns the coordinate of the wall between current and new cell.
           * @param {string} coord - Coordinate to calculate.
           * @returns {number}
           */
          const getWallCoord = (coord) => {
            return newCell[coord] === currentCell[coord] ?
              newCell[coord]
              :
              (
                newCell[coord] > currentCell[coord] ?
                  currentCell[coord] + 1
                  :
                  currentCell[coord] - 1
              );
          };
          const wallCell = calcMaze[getWallCoord('i')][getWallCoord('j')];
          wallCell.isWall = false;
          wallCell.visited = true;
        }
        currentCell = newCell;
        newCell.visited = true;
      } else if (stack.length) {
        currentCell = stack.pop();
      } else {
        break;
      }
    }

    return {
      from: entrance,
      to: exit,
      maze: calcMaze.map((row) => {
        return row.map((cell) => {
          return cell.isWall;
        });
      })
    };
  }

  /**
   * Generates maze using SVG and appends it to the given <div>.
   * @param {HTMLElement} div - Root element of the future maze.
   * @param {number} width - Maze's width in pixels.
   * @param {number} height - Maze's height in pixels.
   * @param {object} [options] - Maze parameters.
   * @param {number} options.lineWidth - Maze's walls and paths width.
   * @param {string} options.wallColor - Maze's walls' color.
   * @param {string} options.pathColor - Maze's paths' color.
   * @returns {object} - Start cell, end cell and 2d array where
   *                     "true" cells are walls and "false" cells are paths.
   */
  generateSVG(div, width, height, options) {
    if (!div) {
      throw 'No root element provided.';
    }
    if (!width || !height) {
      throw 'Maze sizes are not provided.'
    }

    if (options) {
      this.configure(options);
    }

    const root = document.createElementNS(SVG_NS_URI, 'svg');
    root.setAttributeNS(null, 'width', width + '');
    root.setAttributeNS(null, 'height', height + '');
    root.style.backgroundColor = this.pathColor;

    // create the field
    const rows = height / this.lineWidth;
    const cols = width / this.lineWidth;

    // calculate the maze
    const result = this.generateArray(cols, rows);

    // create the wall sample
    const wallSample = document.createElementNS(SVG_NS_URI, 'rect');
    wallSample.setAttributeNS(null, 'width', this.lineWidth);
    wallSample.setAttributeNS(null, 'height', this.lineWidth);
    wallSample.setAttributeNS(null, 'fill', this.wallColor);

    // fill the field
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!result.maze[i][j]) {
          continue;
        }
        const tile = wallSample.cloneNode(true);
        tile.setAttributeNS(null, 'x', (j * this.lineWidth) + '');
        tile.setAttributeNS(null, 'y', (i * this.lineWidth) + '');
        root.appendChild(tile);
      }
    }

    div.appendChild(root);

    return result;
  }

  generateCanvas() {

  }
}