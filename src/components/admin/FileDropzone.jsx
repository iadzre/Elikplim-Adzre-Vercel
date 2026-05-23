import { useRef, useState } from 'react';

/**
 * @param {{
 *   accept?: string;
 *   label?: string;
 *   onFile: (file: File) => void;
 *   disabled?: boolean;
 * }} props
 */
export function FileDropzone({ accept, label = 'Drop file here or click to browse', onFile, disabled }) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [drag, setDrag] = useState(false);

  function handleFile(file) {
    if (file) onFile(file);
  }

  return (
    <div
      className={`admin-dropzone${drag ? ' dragover' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (!disabled && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {label}
    </div>
  );
}
