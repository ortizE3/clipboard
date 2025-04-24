// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  NativeImage,
} from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard-read-text'),
    writeText: (text: string) =>
      ipcRenderer.invoke('clipboard-write-text', text),
    readImage: () => ipcRenderer.invoke('clipboard-read-image'),
    writeImage: (image: string) =>
      ipcRenderer.invoke('clipboard-write-image', image),
    clear: () => ipcRenderer.invoke('clear-clipboard'),
  },

  Pin: {
    PinHandler: (pin: boolean) => ipcRenderer.invoke('pin-event', pin),
  },
  close: () => ipcRenderer.invoke('close-app'),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
