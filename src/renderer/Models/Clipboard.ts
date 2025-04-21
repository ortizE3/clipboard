import { NativeImage } from "electron";

export default class Clipboard {
  text: string = '';

  displayText: string = '';

  isImage: boolean = false;

  image: NativeImage | undefined = undefined;

  show: boolean = true;
}
