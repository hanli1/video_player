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

function MediaControl({
  videoRef,
}) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentProgressPercentage, setCurrentProgressPercentage] = useState(0);

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

  return (
    <div style={styles.container}>
      <div
        style={styles.progressBar}
        onMouseDown={(e) => {
          console.log('drag');
          seekTo(e.nativeEvent.offsetX / e.currentTarget.getBoundingClientRect().width * 100);
        }}
      >
        <div style={{
          ...styles.currentProgressBar,
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
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    WebkitAppRegion: 'no-drag',
  },
  currentProgressBar: {
    width: '50%',
    backgroundColor: '#7CB518',
    height: 5,
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#8F8389',
    height: 5,
  },
};

export default MediaControl;
