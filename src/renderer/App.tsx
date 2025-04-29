/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useLayoutEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { NativeImage } from 'electron';
import Clipboard from './Models/Clipboard';
import Header from './Header/Header';
import Clip from './Clip/Clip';
import useDebouncedEffect from '../Hooks/CustomHook';

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

  const saveClipboardState = () => {
    localStorage.setItem('clipboardList', JSON.stringify(clipboardList ?? []));
  };

  const loadClipboardState = () => {
    const clipboards = localStorage.getItem('clipboardList');
    if (clipboards) {
      const parsedClipboards = JSON.parse(clipboards) as Clipboard[];
      if (parsedClipboards && parsedClipboards.length > 0) {
        setClipboardList(parsedClipboards);
      }
    }
  };

  useEffect(() => {
    clearClipboard();
    loadClipboardState();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const clipboard = await window.electron.clipboard.readText();
      if (clipboard && isDiffText(previousClip?.text, clipboard)) {
        const newClipboard = new Clipboard();
        newClipboard.text = clipboard;
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
        newClipboard.text = image.toDataURL();
        setPreviousImage(newClipboard);
        setClipboardList([newClipboard, ...clipboardList]);
      }
    }, 300);
    setIntervalId(interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        saveClipboardState();
      }
    };
  }, [previousClip, clipboardList]);

  const searchClips = () => {
    for (let i = 0; i < clipboardList.length; i += 1) {
      const clip = clipboardList[i];
      const query = searchText.toLowerCase();
      clip.show = searchText ? clip.text.toLowerCase().includes(query) : true;
    }
    if (clipboardList && clipboardList.length > 0) {
      setClipboardList([...clipboardList]);
    }
  };

  const removeClip = (index: number) => {
    const newClipboardList = [...clipboardList];
    newClipboardList.splice(index, 1);
    setClipboardList(newClipboardList);
  };

  useDebouncedEffect(
    () => {
      searchClips();
    },
    [searchText],
    300,
  );

  return (
    <div className="clipboard-background">
      <Header reset={reset} />
      <div className="clipboard-container">
        {clipboardList &&
          clipboardList.map((clipboard, index) => (
            <Clip
              key={index}
              clipboard={clipboard}
              index={index}
              removeClipboard={removeClip}
              updateClipboard={updateClipboard}
            />
          ))}
      </div>
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
