/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import AnimateHeight from 'react-animate-height';
import { CSSTransition } from 'react-transition-group';
import { getImagePath } from './Utils';
import MediaControlButton from './MediaControlButton';

import './MediaControl.css';

const { remote } = window.require('electron');

MediaControl.propTypes = {
  videoRef: PropTypes.object.isRequired,
  onVideoSelect: PropTypes.func.isRequired,
  hidden: PropTypes.bool.isRequired,
  isVideoPlaying: PropTypes.bool.isRequired,
  onPlayButtonClicked: PropTypes.func.isRequired,
};

const NORMAL_PROGRESS_BAR_HEIGHT = 5;
const HOVER_SEEK_PROGRESS_BAR_HEIGHT = 10;

function MediaControl({
  videoRef,
  onVideoSelect,
  hidden,
  isVideoPlaying,
  onPlayButtonClicked,
}) {
  const [currentProgressPercentage, setCurrentProgressPercentage] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [progressBarHeight, setProgressBarHeight] = useState(NORMAL_PROGRESS_BAR_HEIGHT);
  const [isMouseInProgressBar, setIsMouseInProgressBar] = useState(false);

  const [currentTime, setCurrentTime] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [isMouseInControl, setIsMouseInControl] = useState(false);

  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const progressBarRef = useRef(null);

  useEffect(
    () => {
      setIsVideoLoaded(videoRef.current.currentSrc !== '');
    },
    [videoRef],
  );

  useEffect(
    () => {
      videoRef.current.addEventListener('timeupdate', (e) => {
        setCurrentTime(e.srcElement.currentTime);
        if (!Number.isNaN(e.srcElement.duration)) {
          setVideoDuration(e.srcElement.duration);
        }
        setCurrentProgressPercentage((e.srcElement.currentTime / e.srcElement.duration) * 100);
      });
      videoRef.current.addEventListener('loadeddata', (e) => {
        setCurrentTime(e.srcElement.currentTime);
        if (!Number.isNaN(e.srcElement.duration)) {
          setVideoDuration(e.srcElement.duration);
        }
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
        toggleFullScreen();
      }
      if (event.keyCode === 37) {
        videoRef.current.currentTime -= 5;
      }
      if (event.keyCode === 39) {
        videoRef.current.currentTime += 5;
      }
      if (event.keyCode === 32) {
        onPlayButtonClicked();
      }
      if (event.keyCode === 27) {
        win.setFullScreen(false);
      }
    });
    listeners.forEach((listener) => window.addEventListener('keydown', listener));
    return () => {
      listeners.forEach((listener) => window.removeEventListener('keydown', listener));
    };
  }, [isVideoPlaying, remote]);

  const secToMin = (seconds) => {
    const m = Math.round(seconds / 60);
    const s = Math.round(seconds % 60);

    return `${m}:${s >= 10 ? s : (`0${s}`)}`;
  };

  const toggleVideoMuted = () => {
    if (videoRef.current.currentSrc === '') {
      return;
    }
    if (isVideoMuted) {
      videoRef.current.muted = false;
      setIsVideoMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsVideoMuted(true);
    }
  };

  const toggleFullScreen = () => {
    const win = remote.getCurrentWindow();
    win.setFullScreen(!win.isFullScreen());
  };

  return (
    <CSSTransition
      in={hidden && !isMouseInControl}
      timeout={250}
      classNames="media-control-anim"
    >
      <div
        style={styles.container}
        onMouseOver={() => setIsMouseInControl(true)}
        onMouseLeave={() => setIsMouseInControl(false)}
      >
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
          <div style={styles.controlsContainer}>
            <MediaControlButton
              imageName={isVideoPlaying ? 'pausebutton.png' : 'playbutton.png'}
              onClick={onPlayButtonClicked}
              disabled={!isVideoLoaded}
            />
            <MediaControlButton
              imageName="selectfilebutton.png"
              onClick={onVideoSelect}
            />
            <MediaControlButton
              imageName={isVideoMuted ? 'soundmuted.png' : 'soundon.png'}
              onClick={toggleVideoMuted}
              disabled={!isVideoLoaded}
            />
            <div style={styles.timeText}>
              <span>
                {currentTime !== null && videoDuration !== null
                && `${secToMin(currentTime)} / ${secToMin(videoDuration)}`}
              </span>
            </div>
            <MediaControlButton
              imageName="playlistbutton.png"
              onClick={onVideoSelect}
            />
            <MediaControlButton
              imageName="fullscreenbutton.png"
              onClick={toggleFullScreen}
            />
          </div>
        </div>
      </div>
    </CSSTransition>
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
    paddingBottom: 5,
  },
  currentProgressBar: {
    height: HOVER_SEEK_PROGRESS_BAR_HEIGHT,
    width: '50%',
    backgroundColor: '#7CB518',
    userDrag: 'none',
    userSelect: 'none',
  },
  progressBar: {
    cursor: 'pointer',
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
  timeText: {
    padding: 8,
    margin: 4,
    color: 'white',
    fontSize: 24,
    flexGrow: 1,
  },
  controlsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
};

export default MediaControl;
