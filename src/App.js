/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';
import './App.css';


const { dialog } = window.require('electron').remote;

function App() {
  const [currentVideoPath, setCurrentVideoPath] = useState('');
  const onVideoSelect = async () => {
    const allowedFormats = [
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
    ];

    const files = await dialog.showOpenDialog({ filters: allowedFormats, properties: ['openFile'] });
    setCurrentVideoPath(files.filePaths[0]);
  };

  return (
    <div style={styles.container}>
      <button type="submit" onClick={onVideoSelect}>Select video</button>
      <video src={currentVideoPath} type="video/mp4" style={styles.video} />
    </div>
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
