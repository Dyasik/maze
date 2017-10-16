import MazeGenerator from './MazeGenerator';
import { SVG_NS_URI } from './constants';
import { aStar } from 'visual-path-finding/src/utils/algorithms';
import * as PathfindingConstants from 'visual-path-finding/src/utils/constants';

import './styles.less';

const root = document.getElementById('root'),
      start = document.getElementById('start'),
      regen = document.getElementById('regenerate');

const mazeGenerator = new MazeGenerator({
    lineWidth: 10,
    wallColor: 'black',
    pathColor: 'white',
});

let {from, to, maze} = mazeGenerator.generateSVG(root, 350, 350);

regen.addEventListener('click', () => {
  root.innerHTML = '';
  ({from, to, maze} = mazeGenerator.generateSVG(root, 350, 350));
});

start.addEventListener('click', () => {
  const map = maze.map(row => row.map(cell => ({
    type: cell ?
      PathfindingConstants.TILE_TYPE.OBSTACLE
      :
      PathfindingConstants.TILE_TYPE.EMPTY
  })));
  map[from.row][from.col].type = PathfindingConstants.TILE_TYPE.START;
  map[to.row][to.col].type = PathfindingConstants.TILE_TYPE.TARGET;

  const path = aStar(from.row + ',' + from.col, to.row + ',' + to.col, map);
  // svg
  const wallSample = document.createElementNS(SVG_NS_URI, 'rect');
  wallSample.setAttributeNS(null, 'width', mazeGenerator.lineWidth + '');
  wallSample.setAttributeNS(null, 'height', mazeGenerator.lineWidth + '');
  wallSample.setAttributeNS(null, 'fill', 'forestgreen');

  path.forEach((cell) => {
    const tile = wallSample.cloneNode(true);
    const [i, j] = cell.split(',');
    tile.setAttributeNS(null, 'x', (j * mazeGenerator.lineWidth) + '');
    tile.setAttributeNS(null, 'y', (i * mazeGenerator.lineWidth) + '');
    root.firstChild.appendChild(tile);
  });
});
