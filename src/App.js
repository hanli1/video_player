/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Titlebar from './Titlebar';
import MediaControl from './MediaControl';

const { dialog } = window.require('electron').remote;
const { basename } = window.require('path');

const COUNT_DOWN_SECONDS = 2;
function App() {
  const [currentVideoPath, setCurrentVideoPath] = useState(null);
  const [countDown, setCountDown] = useState(COUNT_DOWN_SECONDS);
  const videoPlayerRefContainer = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
    setCurrentVideoPath(files.filePaths[0]);
  };

  return (
    <>
      <div
        style={styles.container}
        onMouseMove={() => { setCountDown(COUNT_DOWN_SECONDS); }}
        onClick={() => { setCountDown(COUNT_DOWN_SECONDS); }}
      >
        <Titlebar titleText={currentVideoPath === null ? 'Video Player' : basename(currentVideoPath)} />
        <video ref={videoPlayerRefContainer} src={currentVideoPath} type="video/mp4" style={styles.video} />
        <MediaControl
          hidden={countDown === 0 && isVideoPlaying}
          videoRef={videoPlayerRefContainer}
          onVideoSelect={onVideoSelect}
          isVideoPlaying={isVideoPlaying}
          setIsVideoPlaying={setIsVideoPlaying}
        />
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
  video: {
    width: '100%',
    flexGrow: 1,
  },
};

export default App;
