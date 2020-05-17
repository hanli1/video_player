/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useRef } from 'react';
import './App.css';
import Titlebar from './Titlebar';
import MediaControl from './MediaControl';

const { dialog } = window.require('electron').remote;
const { basename } = window.require('path');

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
function App() {
  const [currentVideoPath, setCurrentVideoPath] = useState(null);

  const videoPlayerRefContainer = useRef(null);

  const onVideoSelect = async () => {
    const allowedFormats = [
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
    ];
    const files = await dialog.showOpenDialog({ filters: allowedFormats, properties: ['openFile'] });
    setCurrentVideoPath(files.filePaths[0]);
  };

  return (
    <>
      <div style={styles.container}>
        <Titlebar titleText={currentVideoPath === null ? 'Video Player' : basename(currentVideoPath)} />
        <button type="submit" onClick={onVideoSelect}>Select video</button>
        <video ref={videoPlayerRefContainer} src={currentVideoPath} type="video/mp4" style={styles.video} />
        <MediaControl videoRef={videoPlayerRefContainer} />
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
