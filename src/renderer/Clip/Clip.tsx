import ClipProps from '../Models/ClipProps';

function Clip(props: ClipProps) {
  if (props.clipboard.show === false) {
    return null;
  }
  return (
    <button
      type="button"
      className="copied-element"
      key={props.clipboard.text + props.index}
      onClick={async () => {
        props.updateClipboard(props.clipboard);
      }}
    >
      {props.clipboard.displayText && props.clipboard.displayText}
      {props.clipboard.isImage && props.clipboard.text && (
        <img className="copied-element-img" src={props.clipboard.text} />
      )}
    </button>
  );
}

export default Clip;
