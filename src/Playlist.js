/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Button, List, Segment, Transition,
} from 'semantic-ui-react';

const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const path = window.require('path');
const Store = window.require('electron-store');

const store = new Store();

Playlist.propTypes = {
  isFullScreen: PropTypes.bool.isRequired,
  isOpen: PropTypes.string.isRequired,
  onVideoSelected: PropTypes.func.isRequired,
  setIsMouseInControl: PropTypes.func.isRequired,
};

function Playlist({
  isFullScreen,
  isOpen,
  onVideoSelected,
  setIsMouseInControl,
}) {
  const [openedDirectory, setOpenedDirectory] = useState(null);
  useEffect(() => {
    const playlistDirectory = store.get('playlistDirectory');
    if (playlistDirectory !== undefined) {
      setOpenedDirectory(playlistDirectory);
    }
  }, []);

  const getFilesFromFolderPath = (folderPath) => {
    if (folderPath === null) {
      return [];
    }
    return fs.readdirSync(folderPath).map((file) => ({
      name: file,
      path: path.resolve(folderPath, file),
    }));
  };

  return (
    <Transition
      visible={isOpen}
      animation="fade left"
      duration={250}
    >
      <Segment
        inverted
        fluid
        style={{
          ...styles.playlist,
          ...isFullScreen && styles.fullScreen,
        }}
        onMouseOver={() => setIsMouseInControl(true)}
        onMouseLeave={() => setIsMouseInControl(false)}
      >
        <Button
          fluid
          inverted
          onClick={async () => {
            const o = await dialog.showOpenDialog({ properties: ['openDirectory'] });
            if (o.filePaths.length === 0) {
              store.delete('playlistDirectory');
              return;
            }
            const folderPath = o.filePaths[0];
            setOpenedDirectory(folderPath);
            store.set('playlistDirectory', folderPath);
          }}
        >
          Select Directory
        </Button>
        {openedDirectory !== null
          && (
          <List selection divided inverted relaxed>
            {
            getFilesFromFolderPath(openedDirectory).map((fileData) => (
              <List.Item
                key={fileData.path}
                onClick={() => onVideoSelected(fileData.path)}
              >
                <List.Content>
                  <List.Header>{fileData.name}</List.Header>
                  {fileData.path}
                </List.Content>
              </List.Item>
            ))
          }
          </List>
          )}
      </Segment>
    </Transition>
  );
}
const styles = {
  playlist: {
    backgroundColor: 'rgba(27, 28, 29, 0.8)',
    margin: 0,
    width: 400,
    top: 32,
    bottom: 103,
    position: 'absolute',
    right: 0,
    zIndex: 1,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  fullScreen: {
    top: 0,
  },
};

export default Playlist;
