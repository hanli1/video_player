import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import WindowButton from './WindowButton';

const { remote } = window.require('electron');

Titlebar.propTypes = {
  titleText: PropTypes.string.isRequired,
};

function Titlebar({ titleText }) {
  const window = remote.getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(window.isMaximized());
  const [isFullScreen, setIsFullScreen] = useState(window.isFullScreen());

  useEffect(() => {
    window.addListener('resize', () => {
      setIsMaximized(window.isMaximized);
    });
    window.addListener('enter-full-screen', () => {
      setIsFullScreen(window.isFullScreen);
    });
    window.addListener('leave-full-screen', () => {
      setIsFullScreen(window.isFullScreen);
    });
  }, []);

  return (!isFullScreen
    && (
    <div style={styles.container}>
      <div style={{
        ...styles.draggableRegion,
        ...isMaximized ? styles.draggableRegionMaximized : styles.draggableRegionNotMaximized,
      }}
      >
        <div style={styles.titleText}>{titleText}</div>
        <div style={styles.windowButtonGroup}>
          <WindowButton
            srcSet={getSrcSetForButton('min')}
            onHoverStyle={styles.windowButtonHover}
            onActiveStyle={styles.windowButtonActive}
            onClick={() => window.minimize()}
          />
          {
            isMaximized
              ? (
                <WindowButton
                  srcSet={getSrcSetForButton('restore')}
                  onHoverStyle={styles.windowButtonHover}
                  onActiveStyle={styles.windowButtonActive}
                  onClick={() => {
                    window.unmaximize();
                    setIsMaximized(false);
                  }}
                />
              ) : (
                <WindowButton
                  srcSet={getSrcSetForButton('max')}
                  onHoverStyle={styles.windowButtonHover}
                  onActiveStyle={styles.windowButtonActive}
                  onClick={() => {
                    window.maximize();
                    setIsMaximized(true);
                  }}
                />
              )
          }
          <WindowButton
            srcSet={getSrcSetForButton('close')}
            onHoverStyle={styles.closeButtonHover}
            onActiveStyle={styles.closeButtonActive}
            onClick={() => window.close()}
          />
        </div>
      </div>
    </div>
    )
  );
}

const getImagePath = (imagePath) => process.env.PUBLIC_URL + imagePath;

function getSrcSetForButton(name) {
  const w10 = getImagePath(`/windowsIcons/${name}-w-10.png`);
  const w12 = getImagePath(`/windowsIcons/${name}-w-12.png`);
  const w15 = getImagePath(`/windowsIcons/${name}-w-15.png`);
  const w20 = getImagePath(`/windowsIcons/${name}-w-20.png`);
  const w24 = getImagePath(`/windowsIcons/${name}-w-24.png`);
  const w30 = getImagePath(`/windowsIcons/${name}-w-30.png`);

  return `${w10} 1x, ${w12} 1.25x, ${w15} 1.5x, ${w15} 1.75x, ${w20} 2x, ${w20} 2.25x, ${w24} 2.5x, ${w30} 3x, ${w20} 3.5x`;
}
const styles = {
  closeButtonActive: {
    backgroundColor: '#F1707A',
  },
  closeButtonHover: {
    backgroundColor: '#E81123',
  },
  windowButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  windowButtonHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    height: 32,
    width: '100%',
    display: 'flex',
    backgroundColor: 'black',
  },
  draggableRegion: {
    WebkitAppRegion: 'drag',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  draggableRegionNotMaximized: {
    margin: 4,
  },
  draggableRegionMaximized: {
    margin: 0,
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
    WebkitAppRegion: 'no-drag',
    flexDirection: 'row',
    display: 'flex',
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
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
};

export default Titlebar;
