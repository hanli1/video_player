import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { motion } from 'framer-motion';
import { Button, List, Segment } from 'semantic-ui-react';

const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const path = window.require('path');

Playlist.propTypes = {
  isOpen: PropTypes.string.isRequired,
  setCurrentVideoPath: PropTypes.func.isRequired,
};

function Playlist({
  isOpen,
  setCurrentVideoPath,
}) {
  const [filesData, setFilesData] = useState([]);
  return (
    <motion.div
      style={styles.playlist}
      animate={isOpen ? 'open' : 'closed'}
      variants={{
        closed: {
          opacity: 0,
          x: 100,
        },
        open: {
          opacity: 1,
          x: 0,
        },
      }}
      transition={{ duration: 0.25 }}
    >
      <Segment inverted textAlign="left">
        <Button
          inverted
          onClick={async () => {
            const o = await dialog.showOpenDialog({ properties: ['openDirectory'] });
            if (o.filePaths.length === 0) {
              return;
            }
            const folderPath = o.filePaths[0];
            fs.readdir(folderPath, (err, files) => {
              setFilesData(files.map((file) => ({
                name: file,
                path: path.resolve(folderPath, file),
              })));
            });
          }}
        >
          Select Directory
        </Button>
        {filesData.length !== 0
          && (
          <List selection divided inverted relaxed>
            {
            filesData.map((fileData) => (
              <List.Item
                key={fileData.path}
                onClick={() => setCurrentVideoPath(fileData.path)}
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
    </motion.div>
  );
}
const styles = {
  playlist: {
    width: 400,
    top: 32,
    bottom: 84,
    position: 'absolute',
    right: 0,
    backgroundColor: 'black',
    zIndex: 1,
    overflow: 'auto',
  },
};

export default Playlist;
