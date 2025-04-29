import { useLayoutEffect, useState } from 'react';
import ClipProps from '../Models/ClipProps';
import close from '../../../assets/AppIcons/close.png';

import './Clip.css';

function Clip({ ...props }: ClipProps) {
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [ellipsisSize, setEllipsisSize] = useState(70);
  useLayoutEffect(() => {
    function updateSize() {
      const windowSize = window.innerWidth;
      if (windowSize < 300) {
        setEllipsisSize(70);
      } else if (windowSize < 700) {
        setEllipsisSize(150);
      } else if (windowSize < 1200) {
        setEllipsisSize(300);
      } else {
        setEllipsisSize(800);
      }
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleHover = () => {
    setShowDelete(true);
  };

  const ellipsis = (text: string) => {
    if (text.length >= ellipsisSize) {
      return `${text.substring(0, ellipsisSize)}...`;
    }
    return text;
  };

  if (props.clipboard.show === false) {
    return null;
  }
  return (
    <div
      className="clip-container"
      onMouseOver={handleHover}
      onMouseLeave={() => setShowDelete(false)}
    >
      <button
        type="button"
        className="copied-element"
        key={props.clipboard.text + props.index}
        onClick={async () => {
          props.updateClipboard(props.clipboard);
        }}
      >
        {!props.clipboard.isImage && ellipsis(props.clipboard.text)}
        {props.clipboard.isImage && props.clipboard.text && (
          <img className="copied-element-img" src={props.clipboard.text} />
        )}
      </button>
      {showDelete && (
        <div className="button-img-container">
          <button
            className="button-header"
            type="button"
            onClick={() => props.removeClipboard(props.index)}
          >
            <img className="button-img" src={close} alt="delete clipboard." />
          </button>
        </div>
      )}
    </div>
  );
}

export default Clip;
