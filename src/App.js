/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import { useDropzone } from 'react-dropzone';
import Titlebar from './Titlebar';
import MediaControl from './MediaControl';
import Playlist from './Playlist';

const { remote } = window.require('electron');
const { dialog } = window.require('electron').remote;
const { ipcRenderer } = window.require('electron');
const { basename } = window.require('path');

const COUNT_DOWN_SECONDS = 2;
function App() {
  const videoRef = useRef(null);
  const [currentVideoPath, setCurrentVideoPath] = useState(null);
  const [countDown, setCountDown] = useState(COUNT_DOWN_SECONDS);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);

  const [isMouseInControl, setIsMouseInControl] = useState(false);
  const [isPlaylistOpen, setIsPlayListOpen] = useState(false);

  const isVideoLoaded = videoRef.current != null && videoRef.current.currentSrc !== '';

  useEffect(
    () => {
      // do it so react animation can set color on control bar
      setIsPlayListOpen(true);
      const filePath = ipcRenderer.sendSync('get-file-data');
      if (filePath !== null && filePath !== '.') {
        setCurrentVideoPathAndResetButtonStates(filePath);
      }

      videoRef.current.addEventListener('timeupdate', (e) => {
        setCurrentTime(e.srcElement.currentTime);
        if (!Number.isNaN(e.srcElement.duration)) {
          setVideoDuration(e.srcElement.duration);
        }
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

  useEffect(() => {
    const listeners = [];
    listeners.push((event) => {
      if (event.keyCode !== null) {
        setCountDown(COUNT_DOWN_SECONDS);
      }
    });
    listeners.forEach((listener) => window.addEventListener('keydown', listener));
    return () => {
      listeners.forEach((listener) => window.removeEventListener('keydown', listener));
    };
  }, []);

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
  }, [isVideoPlaying, isVideoLoaded, remote]);

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setCountDown(Math.max(countDown - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countDown]);

  const onVideoSelect = async () => {
    const allowedFormats = [
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
    ];
    const files = await dialog.showOpenDialog({ filters: allowedFormats, properties: ['openFile'] });
    if (files.filePaths.length === 0) {
      return;
    }
    setCurrentVideoPathAndResetButtonStates(files.filePaths[0]);
  };

  const onPlayButtonClicked = () => {
    if (!isVideoLoaded) {
      return;
    }
    if (!isVideoPlaying) {
      setIsVideoPlaying(true);
      videoRef.current.play();
    } else {
      setIsVideoPlaying(false);
      videoRef.current.pause();
    }
  };

  const toggleVideoMuted = () => {
    if (!isVideoLoaded) {
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

  const seekTo = (seekToVideoPercentage) => {
    if (isVideoLoaded && !videoRef.current.seeking) {
      videoRef.current.currentTime = (seekToVideoPercentage / 100 * videoRef.current.duration);
    }
  };

  const toggleFullScreen = () => {
    const win = remote.getCurrentWindow();
    win.setFullScreen(!win.isFullScreen());
  };

  const setCurrentVideoPathAndResetButtonStates = (videoPath) => {
    if (currentVideoPath !== videoPath) {
      setIsVideoPlaying(false);
      setCurrentVideoPath(videoPath);
    }
  };

  const onDropAccepted = useCallback((acceptedFiles) => {
    setCurrentVideoPathAndResetButtonStates(acceptedFiles[0].path);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ accept: 'video/mp4', onDropAccepted });
  const shouldHideMouseAndControls = countDown === 0 && isVideoPlaying && !isMouseInControl;

  return (
    <>
      <div
        style={{
          ...styles.container,
          ...shouldHideMouseAndControls ? styles.disableMouse : null,
        }}
        onMouseMove={() => { setCountDown(COUNT_DOWN_SECONDS); }}
        onClick={() => { setCountDown(COUNT_DOWN_SECONDS); }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getRootProps()}
      >
        <div
          {...getInputProps()}
          style={styles.dragDropZone}
        >
          <Titlebar titleText={currentVideoPath === null ? 'Video Player' : basename(currentVideoPath)} />
          <Playlist
            isFullScreen={remote.getCurrentWindow().isFullScreen()}
            isOpen={isPlaylistOpen && !shouldHideMouseAndControls}
            onVideoSelected={(videoPath) => {
              setCurrentVideoPathAndResetButtonStates(videoPath);
              setIsPlayListOpen(false);
            }}
            setIsMouseInControl={setIsMouseInControl}
          />
          <video ref={videoRef} src={currentVideoPath} type="video/mp4" style={styles.video} onClick={onPlayButtonClicked} />
          <MediaControl
            hidden={shouldHideMouseAndControls}
            videoRef={videoRef}
            onVideoSelectClicked={onVideoSelect}
            isVideoPlaying={isVideoPlaying}
            isVideoMuted={isVideoMuted}
            isVideoLoaded={isVideoLoaded}
            currentTime={currentTime}
            videoDuration={videoDuration}
            toggleVideoMuted={toggleVideoMuted}
            onPlayButtonClicked={onPlayButtonClicked}
            seekTo={seekTo}
            toggleFullScreen={toggleFullScreen}
            setIsMouseInControl={setIsMouseInControl}
            togglePlaylist={() => {
              setIsPlayListOpen(!isPlaylistOpen);
            }}
            isPlaylistOpen={isPlaylistOpen}
          />
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderStyle: 'none',
    outline: 'none',
  },
  disableMouse: {
    cursor: 'none',
  },
  dragDropZone: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'none',
    outline: 'none',
  },
  video: {
    width: '100%',
    flexGrow: 1,
  },
};

export default App;
