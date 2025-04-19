/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Clipboard from './Models/Clipboard';
import Header from './Header/Header';

function Hello() {
  const [previousText, setPreviousText] = useState<Clipboard>(new Clipboard());
  const [clipboardList, setClipboardList] = useState<Clipboard[]>([]);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [searchText, setSearchText] = useState<string>('');

  function isDiffText(str1: string, str2: string) {
    return str2 && str1 !== str2;
  }

  const updateClipboard = async (text: string) => {
    await window.electron.clipboard.writeText(text);
  };

  function reset() {
    clearInterval(intervalId);
    updateClipboard('');
    setClipboardList([]);
    setPreviousText(new Clipboard());
  }

  useEffect(() => {
    updateClipboard('');
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const clipboard = await window.electron.clipboard.readText();
      if (clipboard && isDiffText(previousText?.text, clipboard)) {
        const newClipboard = new Clipboard();
        newClipboard.text = clipboard;
        if (clipboard && clipboard.length > 70) {
          newClipboard.displayText = `${clipboard.substring(0, 70)}...`;
        } else {
          newClipboard.displayText = clipboard;
        }
        setPreviousText(newClipboard);
        setClipboardList([newClipboard, ...clipboardList]);
      }
    }, 500);
    setIntervalId(interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [previousText, clipboardList]);

  const showClip = (text: string) => {
    if (!searchText) {
      return true;
    }
    const query = searchText.toLowerCase();
    return text.toLowerCase().includes(query);
  };

  return (
    <div className="clipboard-background">
      <Header reset={reset} />
      {clipboardList &&
        clipboardList.map(
          (clipboard, index) =>
            showClip(clipboard.text) && (
              <button
                type="button"
                className="copied-element"
                key={`${clipboard.text + index}`}
                onClick={async () => {
                  updateClipboard(clipboard.text);
                }}
              >
                {clipboard.displayText}
              </button>
            ),
        )}
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
