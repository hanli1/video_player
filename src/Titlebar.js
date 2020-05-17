import React, { useState } from 'react';
import PropTypes from 'prop-types';

import WindowButton from './WindowButton';

const { remote } = window.require('electron');

Titlebar.propTypes = {
  titleText: PropTypes.string.isRequired,
};

function Titlebar({ titleText }) {
  const window = remote.getCurrentWindow();

  const getImagePath = (imagePath) => process.env.PUBLIC_URL + imagePath;

  const closeW10 = getImagePath('/windowsIcons/close-w-10.png');
  const closeW12 = getImagePath('/windowsIcons/close-w-12.png');
  const closeW15 = getImagePath('/windowsIcons/close-w-15.png');
  const closeW20 = getImagePath('/windowsIcons/close-w-20.png');
  const closeW24 = getImagePath('/windowsIcons/close-w-24.png');
  const closeW30 = getImagePath('/windowsIcons/close-w-30.png');
  const closeButtonSrcSet = `${closeW10} 1x, ${closeW12} 1.25x, ${closeW15} 1.5x, ${closeW15} 1.75x, ${closeW20} 2x, ${closeW20} 2.25x, ${closeW24} 2.5x, ${closeW30} 3x, ${closeW20} 3.5x`;

  return (
    <div style={styles.container}>
      <div style={styles.draggableRegion}>
        <div style={styles.titleText}>{titleText}</div>
        <div style={styles.windowButtonGroup}>
          <WindowButton
            srcSet={closeButtonSrcSet}
            onHoverStyle={styles.closeButtonHover}
            onActiveStyle={styles.closeButtonActive}
            onClick={() => window.minimize()}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  closeButtonActive: {
    backgroundColor: '#F1707A',
  },
  closeButtonHover: {
    backgroundColor: '#E81123',
  },
  container: {
    height: 32,
    width: '100%',
    display: 'flex',
    backgroundColor: 'grey',
  },
  draggableRegion: {
    webkitAppRegion: 'drag',
    margin: 4,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  windowButton: {
    width: 48,
    height: 32,
    userSelect: 'none',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  windowButtonGroup: {
    marginRight: -4,
    webkitAppRegion: 'no-drag',
  },
  windowButtonImage: {
    height: 'auto',
    margin: 'auto',
  },
  titleText: {
    fontSize: 12,
    marginLeft: 8,
    display: 'flex',
    flexGrow: 1,
    height: '100%',
    alignItems: 'center',
    color: 'white',
  },
};

export default Titlebar;
