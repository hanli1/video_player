/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import './App.css';
import { useDropzone } from 'react-dropzone';
import Titlebar from './Titlebar';
import MediaControl from './MediaControl';

const { dialog } = window.require('electron').remote;
const { ipcRenderer } = window.require('electron');
const { basename } = window.require('path');

const COUNT_DOWN_SECONDS = 2;
function App() {
  const videoRef = useRef(null);
  const [currentVideoPath, setCurrentVideoPath] = useState(null);
  const [countDown, setCountDown] = useState(COUNT_DOWN_SECONDS);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMouseInControl, setIsMouseInControl] = useState(false);

  useEffect(() => {
    const filePath = ipcRenderer.sendSync('get-file-data');
    if (filePath !== null && filePath !== '.') {
      setCurrentVideoPath(filePath);
    }
  }, []);

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
    setCurrentVideoPath(files.filePaths[0]);
  };

  const onPlayButtonClicked = useCallback(() => {
    if (videoRef.current.currentSrc === '') {
      return;
    }
    if (!isVideoPlaying) {
      setIsVideoPlaying(true);
      videoRef.current.play();
    } else {
      setIsVideoPlaying(false);
      videoRef.current.pause();
    }
  }, [isVideoPlaying]);

  const onDropAccepted = useCallback((acceptedFiles) => {
    setCurrentVideoPath(acceptedFiles[0].path);
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
        <Titlebar titleText={currentVideoPath === null ? 'Video Player' : basename(currentVideoPath)} />
        <div
          {...getInputProps()}
          style={styles.dragDropZone}
        >
          <video ref={videoRef} src={currentVideoPath} type="video/mp4" style={styles.video} onClick={onPlayButtonClicked} />
          <MediaControl
            hidden={shouldHideMouseAndControls}
            videoRef={videoRef}
            onVideoSelect={onVideoSelect}
            isVideoPlaying={isVideoPlaying}
            onPlayButtonClicked={onPlayButtonClicked}
            setIsMouseInControl={setIsMouseInControl}
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
