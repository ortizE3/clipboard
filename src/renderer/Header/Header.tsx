import { useEffect, useState } from 'react';

import './Header.css';
import Reset from '../../../assets/AppIcons/reset.png';
import Pin from '../../../assets/AppIcons/pin.svg';
import Unpin from '../../../assets/AppIcons/unpin.svg';
import close from '../../../assets/AppIcons/close.png';
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
          <img className="button-img" src={!isPin ? Pin : Unpin} />
        </button>
        {props && (
          <button className="button-header" type="button" onClick={props.reset}>
            <img className="button-img" src={Reset} />
          </button>
        )}
        <button
          className="button-header"
          type="button"
          onClick={() => window.electron.close()}
        >
          <img className="button-img" src={close} />
        </button>
      </div>
    </div>
  );
}

export default Header;
