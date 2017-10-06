import MazeGenerator from './MazeGenerator';

import './styles.less';

const root = document.getElementById('root'),
      start = document.getElementById('start'),
      regen = document.getElementById('regenerate');

const mazeGenerator = new MazeGenerator({
    lineWidth: 10,
    wallColor: 'black',
    pathColor: 'white',
});

mazeGenerator.generateSVG(root, 350, 350);

regen.addEventListener('click', () => {
  root.innerHTML = '';
  mazeGenerator.generateSVG(root, 350, 350);
});
