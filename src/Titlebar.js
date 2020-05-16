/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useRef } from 'react';

function Titlebar() {
  return (
    <div style={styles.container}>
      <div style={styles.draggableRegion} />
    </div>
  );
}

const styles = {
  container: {
    height: 32,
    display: 'flex',
    background: 'red',
  },
  draggableRegion: {
    webkitAppRegion: 'drag',
    margin: 4,
    flexGrow: 1,
  },
};

export default Titlebar;
