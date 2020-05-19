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
  const [currentVideoPath, setCurrentVideoPath] = useState(null);
  const [countDown, setCountDown] = useState(COUNT_DOWN_SECONDS);
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    ipcRenderer.on('openedWithFilePath', (event, message) => {
      setCurrentVideoPath(message);
    });
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

  const onDrop = useCallback((acceptedFiles) => {
    setCurrentVideoPath(acceptedFiles[0].path);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <div
        style={styles.container}
        onMouseMove={() => { setCountDown(COUNT_DOWN_SECONDS); }}
        onClick={() => { setCountDown(COUNT_DOWN_SECONDS); }}
        {...getRootProps()}
      >
        <Titlebar titleText={currentVideoPath === null ? 'Video Player' : basename(currentVideoPath)} />
        <div
          {...getInputProps()}
          style={styles.dragDropZone}
        >
          <video ref={videoRef} src={currentVideoPath} type="video/mp4" style={styles.video} onClick={onPlayButtonClicked} />
          <MediaControl
            hidden={countDown === 0 && isVideoPlaying}
            videoRef={videoRef}
            onVideoSelect={onVideoSelect}
            isVideoPlaying={isVideoPlaying}
            onPlayButtonClicked={onPlayButtonClicked}
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
  },
  dragDropZone: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  video: {
    width: '100%',
    flexGrow: 1,
  },
};

export default App;
