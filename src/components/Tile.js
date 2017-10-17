import React from 'react';
import PropTypes from 'prop-types';

const Tile = ({width, height, left, top, color = 'black'}) => {
  return (
    <rect width={width} height={height} x={left} y={top} fill={color}/>
  );
};

Tile.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  color: PropTypes.string,
};

export default Tile;