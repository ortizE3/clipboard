import Clipboard from './Clipboard';

export default class ClipProps {
  clipboard: Clipboard = new Clipboard();
  index: number = 0;
  updateClipboard: any = () => {};
}
