/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import { getImagePath } from './Utils';

MediaControlButton.propTypes = {
  imageName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

function MediaControlButton({
  imageName,
  onClick,
}) {
  return (
    <div style={styles.mediaControlButton} onClick={onClick}>
      <img src={getImagePath(imageName)} style={styles.mediaControlButtonImage} />
    </div>
  );
}

const styles = {
  mediaControlButton: {
    backgroundColor: 'transparent',
    padding: 8,
    margin: 4,
    display: 'inline-block',
    cursor: 'pointer',
    height: 30,
  },
  mediaControlButtonImage: {
    width: 30,
    maxHeight: '100%',
    filter: 'invert(100%)',
  },
};

export default MediaControlButton;
