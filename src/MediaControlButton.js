/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getImagePath } from './Utils';

MediaControlButton.propTypes = {
  imageName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

function MediaControlButton({
  imageName,
  onClick,
  disabled = false,
}) {
  const [isMouseOverButton, setIsMouseOverButton] = useState(false);
  return (
    <div
      style={{
        ...styles.mediaControlButton,
        ...!disabled && styles.enabledButton,
      }}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      onMouseOver={() => setIsMouseOverButton(true)}
      onMouseOut={() => setIsMouseOverButton(false)}
    >
      <img
        src={getImagePath(imageName)}
        style={{
          ...styles.mediaControlButtonImage,
          ...isMouseOverButton && !disabled ? styles.mediaControlButtonImageHover : null,
          ...disabled ? styles.mediaControlButtonImageDisabled : null,
        }}
      />
    </div>
  );
}

const styles = {
  mediaControlButton: {
    backgroundColor: 'transparent',
    padding: 8,
    margin: 4,
    display: 'inline-block',
    height: 30,
  },
  enabledButton: {
    cursor: 'pointer',
  },
  mediaControlButtonImage: {
    width: 30,
    maxHeight: '100%',
    filter: 'invert(90%)',
  },
  mediaControlButtonImageHover: {
    filter: 'invert(100%)',
  },
  mediaControlButtonImageDisabled: {
    filter: 'invert(50%)',
  },
};

export default MediaControlButton;
