/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

MediaControl.propTypes = {
  videoRef: PropTypes.object.isRequired,
};

const NORMAL_PROGRESS_BAR_HEIGHT = 5;
const HOVER_SEEK_PROGRESS_BAR_HEIGHT = 10;

function MediaControl({
  videoRef,
}) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentProgressPercentage, setCurrentProgressPercentage] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [progressBarHeight, setProgressBarHeight] = useState(NORMAL_PROGRESS_BAR_HEIGHT);
  const [isMouseInProgressBar, setIsMouseInProgressBar] = useState(false);

  const onPlayButtonClicked = () => {
    setIsVideoPlaying(!isVideoPlaying);
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
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
    if (videoRef.current.currentSrc !== '') {
      videoRef.current.currentTime = (seekToVideoPercentage / 100 * videoRef.current.duration);
    }
  };

  const mouseEventToVideoPercentage = (e) => e.nativeEvent.offsetX / e.currentTarget.getBoundingClientRect().width * 100;

  return (
    <>
      <div
        style={{
          ...styles.mouseListenerLayer,
          ...isUserSeeking ? styles.mouseListenerLayerActive : {},
        }}
        onMouseMove={(e) => {
          if (isUserSeeking) {
            setProgressBarHeight(HOVER_SEEK_PROGRESS_BAR_HEIGHT);
            seekTo(mouseEventToVideoPercentage(e));
          }
        }}
        onMouseUp={() => {
          if (!isMouseInProgressBar) {
            setProgressBarHeight(NORMAL_PROGRESS_BAR_HEIGHT);
          }
          setIsUserSeeking(false);
        }}
      />
      <div style={styles.container}>
        <div
          style={{ ...styles.progressBar, ...{ height: progressBarHeight } }}
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
            seekTo(mouseEventToVideoPercentage(e));
          }}
          onMouseMove={(e) => {
            if (isUserSeeking) {
              seekTo(mouseEventToVideoPercentage(e));
            }
          }}
          onMouseUp={() => {
            setIsUserSeeking(false);
          }}
        >
          <div style={{
            ...styles.currentProgressBar,
            ...{ height: progressBarHeight },
            ...{ width: `${currentProgressPercentage}%` },
          }}
          />
        </div>
        <div>
          <button type="submit" onClick={onPlayButtonClicked}>
            {
          isVideoPlaying ? 'Pause' : 'Play'
        }
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    WebkitAppRegion: 'no-drag',
  },
  currentProgressBar: {
    width: '50%',
    backgroundColor: '#7CB518',
    userDrag: 'none',
    userSelect: 'none',
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#8F8389',
    zIndex: 100, // put above mouse listening zone so no visual glitch on click seek
    userDrag: 'none',
    userSelect: 'none',
  },
  mouseListenerLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  mouseListenerLayerActive: {
    pointerEvents: 'auto',
  },
};

export default MediaControl;
