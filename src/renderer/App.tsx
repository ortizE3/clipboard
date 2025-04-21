/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { NativeImage } from 'electron';

import Clipboard from './Models/Clipboard';
import Header from './Header/Header';

import './App.css';

function Hello() {
  const [previousClip, setPreviousClip] = useState<Clipboard>(new Clipboard());
  const [previousImage, setPreviousImage] = useState<Clipboard>(
    new Clipboard(),
  );
  const [clipboardList, setClipboardList] = useState<Clipboard[]>([]);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>('');

  function isDiffText(str1: string, str2: string) {
    return str2 && str1 !== str2;
  }

  const updateClipboard = async (clipboard: Clipboard) => {
    if (clipboard) {
      if (clipboard.isImage && clipboard.image) {
        await window.electron.clipboard.writeImage(clipboard.text);
      } else {
        await window.electron.clipboard.writeText(clipboard.text);
      }
    }
  };

  const clearClipboard = async () => {
    await window.electron.clipboard.clear();
  };

  function reset() {
    clearInterval(intervalId);
    clearClipboard();
    setClipboardList([]);
    setPreviousClip(new Clipboard());
  }

  useEffect(() => {
    clearClipboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const clipboard = await window.electron.clipboard.readText();
      if (clipboard && isDiffText(previousClip?.text, clipboard)) {
        const newClipboard = new Clipboard();
        newClipboard.text = clipboard;
        if (clipboard && clipboard.length > 70) {
          newClipboard.displayText = `${clipboard.substring(0, 70)}...`;
        } else {
          newClipboard.displayText = clipboard;
        }
        setPreviousClip(newClipboard);
        setClipboardList([newClipboard, ...clipboardList]);
      }

      const image: NativeImage = await window.electron.clipboard.readImage();
      const imageText = image?.toDataURL();
      if (
        image &&
        !image.isEmpty() &&
        isDiffText(previousImage?.text, imageText)
      ) {
        const newClipboard = new Clipboard();
        newClipboard.isImage = true;
        newClipboard.image = image;
        console.log(image)
        newClipboard.text = image.toDataURL();
        setPreviousImage(newClipboard);
        setClipboardList([newClipboard, ...clipboardList]);
      }
    }, 300);
    setIntervalId(interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [previousClip, clipboardList]);

  const showClip = (text: string) => {
    if (!searchText) {
      return true;
    }
    const query = searchText.toLowerCase();
    return text.toLowerCase().includes(query);
  };

  const displayClip = (clipboard: Clipboard, index: number) => {
    if (clipboard.displayText && showClip(clipboard.text)) {
      return (
        <button
          type="button"
          className="copied-element"
          key={clipboard.text + index}
          onClick={async () => {
            updateClipboard(clipboard);
          }}
        >
          {clipboard.displayText}
        </button>
      );
    }
    if (clipboard.isImage && clipboard.text && showClip(clipboard.text)) {
      return (
        <button
          type="button"
          className="copied-element"
          key={clipboard.text + index}
          onClick={async () => {
            updateClipboard(clipboard);
          }}
        >
          <img className="copied-element-img" src={clipboard.text} />
        </button>
      );
    }

    return null;
  };

  return (
    <div className="clipboard-background">
      <Header reset={reset} />
      {clipboardList &&
        clipboardList.map((clipboard, index) => displayClip(clipboard, index))}
      <input
        className="search-box"
        type="text"
        placeholder="Search Previous Clipboards..."
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
