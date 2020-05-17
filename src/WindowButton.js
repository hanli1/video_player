/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

WindowButton.propTypes = {
  srcSet: PropTypes.string.isRequired,
  onHoverStyle: PropTypes.object.isRequired,
  onActiveStyle: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

function WindowButton({
  srcSet, onHoverStyle, onActiveStyle, onClick,
}) {
  const [isHover, setIsHover] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const clearFocus = () => {
    setIsHover(false);
    setIsActive(false);
  };

  return (
    <div
      style={{
        ...styles.windowButton,
        ...isHover ? onHoverStyle : {},
        ...isActive ? onActiveStyle : {},
      }}
      onMouseOver={() => setIsHover(true)}
      onMouseOut={(clearFocus)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={clearFocus}
      onClick={onClick}
    >
      <img
        style={styles.windowButtonImage}
        className="icon"
        alt=""
        srcSet={srcSet}
        draggable="false"
      />
    </div>
  );
}

const styles = {
  windowButton: {
    width: 48,
    height: 32,
    userSelect: 'none',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  windowButtonImage: {
    height: 'auto',
    margin: 'auto',
  },
};

export default WindowButton;
