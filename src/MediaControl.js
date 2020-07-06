/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import AnimateHeight from 'react-animate-height';
import { CSSTransition } from 'react-transition-group';
import MediaControlButton from './MediaControlButton';
import './MediaControl.css';

MediaControl.propTypes = {
  hidden: PropTypes.bool.isRequired,
  onVideoSelectClicked: PropTypes.func.isRequired,
  isVideoPlaying: PropTypes.bool.isRequired,
  isVideoMuted: PropTypes.bool.isRequired,
  isVideoLoaded: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
  videoDuration: PropTypes.number.isRequired,
  toggleVideoMuted: PropTypes.func.isRequired,
  onPlayButtonClicked: PropTypes.func.isRequired,
  seekTo: PropTypes.func.isRequired,
  toggleFullScreen: PropTypes.func.isRequired,
  setIsMouseInControl: PropTypes.func.isRequired,
  togglePlaylist: PropTypes.func.isRequired,
  isPlaylistOpen: PropTypes.bool.isRequired,
};

const NORMAL_PROGRESS_BAR_HEIGHT = 5;
const HOVER_SEEK_PROGRESS_BAR_HEIGHT = 10;

function MediaControl({
  hidden,
  onVideoSelectClicked,
  isVideoPlaying,
  isVideoMuted,
  isVideoLoaded,
  currentTime,
  videoDuration,
  onPlayButtonClicked,
  toggleVideoMuted,
  seekTo,
  toggleFullScreen,
  setIsMouseInControl,
  togglePlaylist,
  isPlaylistOpen,
}) {
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [progressBarHeight, setProgressBarHeight] = useState(NORMAL_PROGRESS_BAR_HEIGHT);
  const [isMouseInProgressBar, setIsMouseInProgressBar] = useState(false);

  const progressBarRef = useRef(null);

  const currentProgressPercentage = currentTime === null || videoDuration === null
    ? 0 : (currentTime / videoDuration) * 100;

  const progressBarMouseEventToVideoPercentage = (e) => e.nativeEvent.offsetX / e.currentTarget.getBoundingClientRect().width * 100;
  const areaListenerMouseEventToVideoPercentage = (e) => {
    const progressBarX = progressBarRef.current.getBoundingClientRect().x;
    const percentage = Math.max(e.nativeEvent.offsetX - progressBarX, 0) / progressBarRef.current.getBoundingClientRect().width * 100;
    return Math.min(percentage, 100);
  };

  const secToMin = (seconds) => {
    const m = Math.round(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s >= 10 ? s : (`0${s}`)}`;
  };

  return (
    <CSSTransition
      in={hidden}
      timeout={250}
      classNames="media-control-anim"
    >
      <CSSTransition
        in={isPlaylistOpen}
        timeout={250}
        classNames="playlist-color"
      >
        <div
          style={styles.container}
        >
          <div style={styles.styleContainer}>
            <div
              style={{
                ...styles.mouseListenerLayer,
                ...isUserSeeking ? styles.mouseListenerLayerActive : null,
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
            <AnimateHeight
              duration={250}
              height={progressBarHeight}
              onMouseOver={() => setIsMouseInControl(true)}
              onMouseLeave={() => setIsMouseInControl(false)}
            >
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
                onClick={onVideoSelectClicked}
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
                onClick={togglePlaylist}
              />
              <MediaControlButton
                imageName="fullscreenbutton.png"
                onClick={toggleFullScreen}
              />
            </div>
          </div>
        </div>
      </CSSTransition>
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
    zIndex: 2,
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
