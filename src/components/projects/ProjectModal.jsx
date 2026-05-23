import { useEffect } from 'react';
import { mediaUrl } from '../../lib/mediaUrl';

/**
 * @param {ReturnType<import('../../hooks/useProjectModal').useProjectModal>} props
 */
export function ProjectModal(props) {
  const modal = props;
  const {
    isOpen,
    closeModal,
    showNext,
    showPrev,
    viewMode,
    currentImageSrc,
    totalItems,
    currentIndex,
    videoRef,
    isPlaying,
    isMuted,
    volume,
    seekValue,
    timeLabel,
    togglePlayPause,
    toggleMute,
    onSeek,
    onVolumeChange,
    hasMultiple,
  } = modal;

  const modalClass = `project-modal fixed inset-0 z-[2000] items-center justify-center bg-black/90 backdrop-blur-sm${
    isOpen ? ' show' : ' hidden'
  }`;

  useEffect(() => {
    if (!isOpen) return;
    document.getElementById('closeModal')?.focus();
  }, [isOpen]);

  return (
    <div
      id="projectModal"
      className={modalClass}
      onClick={(e) => e.target === e.currentTarget && closeModal()}
      role="dialog"
      aria-modal="true"
      aria-label="Project gallery"
      aria-hidden={!isOpen}
    >
      <button
        id="closeModal"
        type="button"
        onClick={closeModal}
        aria-label="Close gallery"
        className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-[#F45D01] transition-colors duration-300 z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        id="prevImage"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          showPrev();
        }}
        aria-label="Previous item"
        className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-[#F45D01] transition-colors duration-300 z-10${hasMultiple ? '' : ' hidden'}`}
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        id="nextImage"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          showNext();
        }}
        aria-label="Next item"
        className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-[#F45D01] transition-colors duration-300 z-10${hasMultiple ? '' : ' hidden'}`}
      >
        <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="modal-content-container w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="modal-content max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center relative">
          <div
            id="modalImageContainer"
            className={`${viewMode === 'image' ? 'flex' : 'hidden'} w-full h-full items-center justify-center`}
          >
            <img
              id="modalImage"
              className="max-w-full max-h-full object-contain rounded-lg"
              alt="Project preview"
              src={currentImageSrc ? mediaUrl(currentImageSrc) : ''}
            />
            <div
              id="imageCounter"
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full${hasMultiple ? '' : ' hidden'}`}
            >
              <span id="currentImageIndex">{currentIndex + 1}</span> /{' '}
              <span id="totalImages">{totalItems}</span>
            </div>
          </div>
          <div
            id="modalVideoContainer"
            className={`${viewMode === 'video' ? 'relative' : 'hidden'} max-w-full max-h-full`}
          >
            <video
              id="modalVideo"
              ref={videoRef}
              className="max-w-full max-h-full object-contain rounded-lg"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <div
              id="videoControls"
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-center gap-3 opacity-0 transition-opacity duration-300"
            >
              <button
                id="videoPlayPause"
                type="button"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="w-10 h-10 flex items-center justify-center text-white hover:text-[#F45D01] transition-colors duration-300"
              >
                <svg
                  id="playIcon"
                  className={`w-6 h-6${isPlaying ? ' hidden' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <svg
                  id="pauseIcon"
                  className={`w-6 h-6${isPlaying ? '' : ' hidden'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              </button>
              <div className="flex-1 max-w-md">
                <input
                  type="range"
                  id="videoSeek"
                  min="0"
                  max="100"
                  value={seekValue}
                  aria-label="Video progress"
                  onChange={(e) => onSeek(Number(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#F45D01]"
                />
              </div>
              <span id="videoTime" className="text-white text-xs min-w-[80px] text-right">
                {timeLabel}
              </span>
              <button
                id="videoMute"
                type="button"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="w-8 h-8 flex items-center justify-center text-white hover:text-[#F45D01] transition-colors duration-300"
              >
                <svg
                  id="volumeIcon"
                  className={`w-5 h-5${isMuted || volume === 0 ? ' hidden' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <svg
                  id="muteIcon"
                  className={`w-5 h-5${isMuted || volume === 0 ? '' : ' hidden'}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38.31 2.63.95 3.69 1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              </button>
              <div className="w-20">
                <input
                  type="range"
                  id="videoVolume"
                  min="0"
                  max="100"
                  value={volume}
                  aria-label="Video volume"
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#F45D01]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
