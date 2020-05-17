/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import AnimateHeight from 'react-animate-height';
import { getImagePath } from './Utils';

const { remote } = window.require('electron');

MediaControl.propTypes = {
  videoRef: PropTypes.object.isRequired,
  onVideoSelect: PropTypes.func.isRequired,
};

const NORMAL_PROGRESS_BAR_HEIGHT = 5;
const HOVER_SEEK_PROGRESS_BAR_HEIGHT = 10;

function MediaControl({
  videoRef,
  onVideoSelect,
}) {
  const [currentProgressPercentage, setCurrentProgressPercentage] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [progressBarHeight, setProgressBarHeight] = useState(NORMAL_PROGRESS_BAR_HEIGHT);
  const [isMouseInProgressBar, setIsMouseInProgressBar] = useState(false);

  const progressBarRef = useRef(null);

  const onPlayButtonClicked = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  useEffect(
    () => {
      videoRef.current.addEventListener('timeupdate', (e) => {
        setCurrentProgressPercentage((e.srcElement.currentTime / e.srcElement.duration) * 100);
      });
    },
    [],
  );

  const seekTo = (seekToVideoPercentage) => {
    if (videoRef.current.currentSrc !== '' && !videoRef.current.seeking) {
      videoRef.current.currentTime = (seekToVideoPercentage / 100 * videoRef.current.duration);
    }
  };

  const progressBarMouseEventToVideoPercentage = (e) => e.nativeEvent.offsetX / e.currentTarget.getBoundingClientRect().width * 100;
  const areaListenerMouseEventToVideoPercentage = (e) => {
    const progressBarX = progressBarRef.current.getBoundingClientRect().x;
    const percentage = Math.max(e.nativeEvent.offsetX - progressBarX, 0) / progressBarRef.current.getBoundingClientRect().width * 100;
    return Math.min(percentage, 100);
  };


  useEffect(() => {
    const win = remote.getCurrentWindow();

    const listeners = [];
    listeners.push((event) => {
      if (event.keyCode === 70) {
        win.setFullScreen(!win.isFullScreen());
      }
    });
    listeners.push((event) => {
      if (event.keyCode === 37) {
        videoRef.current.currentTime -= 5;
      }
    });
    listeners.push((event) => {
      if (event.keyCode === 39) {
        videoRef.current.currentTime += 5;
      }
    });
    listeners.push((event) => {
      if (event.keyCode === 32) {
        onPlayButtonClicked();
      }
    });
    listeners.forEach((listener) => window.addEventListener('keydown', listener));
    return () => {
      listeners.forEach((listener) => window.removeEventListener('keydown', listener));
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.styleContainer}>

        <div
          style={{
            ...styles.mouseListenerLayer,
            ...isUserSeeking ? styles.mouseListenerLayerActive : {},
          }}
          onMouseMove={(e) => {
            if (isUserSeeking) {
              setProgressBarHeight(HOVER_SEEK_PROGRESS_BAR_HEIGHT);
              seekTo(areaListenerMouseEventToVideoPercentage(e));
            }
          }}
          onMouseUp={() => {
            if (!isMouseInProgressBar) {
              setProgressBarHeight(NORMAL_PROGRESS_BAR_HEIGHT);
            }
            setIsUserSeeking(false);
          }}
        />
        <AnimateHeight duration={250} height={progressBarHeight}>
          <div
            ref={progressBarRef}
            style={styles.progressBar}
            onMouseOver={() => {
              setIsMouseInProgressBar(true);
              setProgressBarHeight(HOVER_SEEK_PROGRESS_BAR_HEIGHT);
            }}
            onMouseOut={() => {
              setIsMouseInProgressBar(false);
              setProgressBarHeight(NORMAL_PROGRESS_BAR_HEIGHT);
            }}
            onMouseDown={(e) => {
              setIsUserSeeking(true);
              seekTo(progressBarMouseEventToVideoPercentage(e));
            }}
            onMouseMove={(e) => {
              if (isUserSeeking) {
                seekTo(progressBarMouseEventToVideoPercentage(e));
              }
            }}
            onMouseUp={() => {
              setIsUserSeeking(false);
            }}
          >
            <div style={{
              ...styles.currentProgressBar,
              ...{ width: `${currentProgressPercentage}%` },
            }}
            />
          </div>
        </AnimateHeight>
        <div>
          {
            videoRef.current && !videoRef.current.paused
              ? (
                <div style={styles.mediaControlButton} onClick={onPlayButtonClicked}>
                  <img src={getImagePath('/pausebutton.png')} style={styles.mediaControlButtonImage} />
                </div>
              ) : (
                <div style={styles.mediaControlButton} onClick={onPlayButtonClicked}>
                  <img src={getImagePath('/playbutton.png')} style={styles.mediaControlButtonImage} />
                </div>
              )
          }
          <div style={styles.mediaControlButton} onClick={onVideoSelect}>
            <img src={getImagePath('/selectfilebutton.png')} style={styles.mediaControlButtonImage} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    WebkitAppRegion: 'no-drag',
    width: '100%',
  },
  styleContainer: {
    margin: 20,
  },
  currentProgressBar: {
    height: HOVER_SEEK_PROGRESS_BAR_HEIGHT,
    width: '50%',
    backgroundColor: '#7CB518',
    userDrag: 'none',
    userSelect: 'none',
  },
  progressBar: {
    height: HOVER_SEEK_PROGRESS_BAR_HEIGHT,
    width: '100%',
    backgroundColor: '#8F8389',
    zIndex: 100, // put above mouse listening zone so no visual glitch on click seek
    userDrag: 'none',
    userSelect: 'none',
  },
  mouseListenerLayer: {
    width: '100%',
    height: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  mouseListenerLayerActive: {
    pointerEvents: 'auto',
  },
  mediaControlButton: {
    backgroundColor: 'transparent',
    padding: 8,
    margin: 4,
    display: 'inline-block',
    cursor: 'pointer',
    height: 30,
  },
  mediaControlButtonImage: {
    width: 30,
    maxHeight: '100%',
    filter: 'invert(100%)',
  },
};

export default MediaControl;
