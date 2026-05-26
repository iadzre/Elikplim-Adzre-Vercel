/**
 * Start a file download from a signed storage URL (cross-origin safe when
 * Content-Disposition is set on the URL).
 * @param {string} url
 * @param {string} [fileName]
 */
export function triggerFileDownload(url, fileName) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener noreferrer';
  if (fileName) {
    anchor.download = fileName;
  }
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
