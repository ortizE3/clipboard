import { useEffect, useState } from 'react';

import './Header.css';
import HeaderProps from '../Models/HeaderProps';

function Header(props: HeaderProps) {
  const [isPin, setIsPin] = useState(false);

  const pinHandler = () => {
    setIsPin(!isPin);
  };

  useEffect(() => {
    window.electron.Pin.PinHandler(isPin);
  }, [isPin]);

  return (
    <div className="header">
      <h4 className="title">Clipboard</h4>
      <div className="button-container">
        <button className="button-header" type="button" onClick={pinHandler}>
          {!isPin ? 'Pin' : 'Unpin'}
        </button>
        {props && (
          <button className="button-header" type="button" onClick={props.reset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
