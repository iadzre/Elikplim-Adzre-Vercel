import { useState, useCallback, useEffect, useRef } from 'react';
import { mediaUrl } from '../lib/mediaUrl';

function isVideoFile(src) {
  const videoExtensions = ['.mp4', '.mov', '.webm', '.avi'];
  return videoExtensions.some((ext) => src.toLowerCase().endsWith(ext));
}

function formatTime(seconds) {
  if (Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function useProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideos, setCurrentVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentMixedMedia, setCurrentMixedMedia] = useState([]);
  const [currentMixedIndex, setCurrentMixedIndex] = useState(0);
  const [viewMode, setViewMode] = useState('image');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [seekValue, setSeekValue] = useState(0);
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00');

  const videoRef = useRef(null);
  const mixedMediaRef = useRef([]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setCurrentImages([]);
    setCurrentImageIndex(0);
    setCurrentVideos([]);
    setCurrentVideoIndex(0);
    mixedMediaRef.current = [];
    setCurrentMixedMedia([]);
    setCurrentMixedIndex(0);
    document.body.classList.remove('no-scroll');
  }, []);

  const updateTimeUI = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime || 0;
    const duration = video.duration || 0;
    setTimeLabel(`${formatTime(current)} / ${formatTime(duration)}`);
    if (duration > 0) {
      setSeekValue((current / duration) * 100);
    }
  }, []);

  const loadVideoAtIndex = useCallback(
    (index, sources) => {
      const video = videoRef.current;
      if (!video || !sources[index]) return;
      video.pause();
      video.currentTime = 0;
      video.src = mediaUrl(sources[index]);
      video.load();
      video.volume = volume / 100;
      setIsPlaying(false);
      updateTimeUI();
    },
    [volume, updateTimeUI]
  );

  const goToMixedIndex = useCallback((index) => {
    const item = mixedMediaRef.current[index];
    setCurrentMixedIndex(index);
    setViewMode(item?.type === 'video' ? 'video' : 'image');
  }, []);

  const openModal = useCallback((mediaType, mediaSrcs) => {
    const sources = Array.isArray(mediaSrcs)
      ? mediaSrcs
      : String(mediaSrcs)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    if (mediaType === 'mixed') {
      const mixed = sources.map((src) => ({
        src,
        type: isVideoFile(src) ? 'video' : 'image',
      }));
      setCurrentMixedMedia(mixed);
      mixedMediaRef.current = mixed;
      setCurrentMixedIndex(0);
      setCurrentImages([]);
      setCurrentVideos([]);
      setViewMode(mixed[0]?.type === 'video' ? 'video' : 'image');
    } else if (mediaType === 'video') {
      setCurrentVideos(sources);
      setCurrentVideoIndex(0);
      mixedMediaRef.current = [];
      setCurrentMixedMedia([]);
      setCurrentImages([]);
      setViewMode('video');
    } else {
      setCurrentImages(sources);
      setCurrentImageIndex(0);
      setCurrentVideos([]);
      mixedMediaRef.current = [];
      setCurrentMixedMedia([]);
      setViewMode('image');
    }

    setIsOpen(true);
    document.body.classList.add('no-scroll');
  }, []);

  const showNext = useCallback(() => {
    if (currentMixedMedia.length > 1) {
      const next = (currentMixedIndex + 1) % currentMixedMedia.length;
      goToMixedIndex(next);
      return;
    }
    if (viewMode === 'video' && currentVideos.length > 1) {
      const next = (currentVideoIndex + 1) % currentVideos.length;
      setCurrentVideoIndex(next);
      loadVideoAtIndex(next, currentVideos);
      return;
    }
    if (currentImages.length > 1) {
      setCurrentImageIndex((i) => (i + 1) % currentImages.length);
    }
  }, [
    currentMixedMedia,
    currentMixedIndex,
    goToMixedIndex,
    viewMode,
    currentVideos,
    currentVideoIndex,
    loadVideoAtIndex,
    currentImages,
  ]);

  const showPrev = useCallback(() => {
    if (currentMixedMedia.length > 1) {
      const prev =
        (currentMixedIndex - 1 + currentMixedMedia.length) % currentMixedMedia.length;
      goToMixedIndex(prev);
      return;
    }
    if (viewMode === 'video' && currentVideos.length > 1) {
      const prev =
        (currentVideoIndex - 1 + currentVideos.length) % currentVideos.length;
      setCurrentVideoIndex(prev);
      loadVideoAtIndex(prev, currentVideos);
      return;
    }
    if (currentImages.length > 1) {
      setCurrentImageIndex(
        (i) => (i - 1 + currentImages.length) % currentImages.length
      );
    }
  }, [
    currentMixedMedia,
    currentMixedIndex,
    goToMixedIndex,
    viewMode,
    currentVideos,
    currentVideoIndex,
    loadVideoAtIndex,
    currentImages,
  ]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
      setVolume(video.volume * 100);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, []);

  const onSeek = useCallback((value) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = (value / 100) * video.duration;
    setSeekValue(value);
    updateTimeUI();
  }, [updateTimeUI]);

  const onVolumeChange = useCallback((value) => {
    const video = videoRef.current;
    setVolume(value);
    if (video) {
      video.volume = value / 100;
      video.muted = value === 0;
      setIsMuted(value === 0);
    }
  }, []);

  const totalItems =
    currentMixedMedia.length ||
    (viewMode === 'video' ? currentVideos.length : currentImages.length);

  const currentIndex =
    currentMixedMedia.length > 0
      ? currentMixedIndex
      : viewMode === 'video'
        ? currentVideoIndex
        : currentImageIndex;

  const currentImageSrc =
    viewMode === 'image' && currentMixedMedia.length > 0
      ? currentMixedMedia[currentMixedIndex]?.type === 'image'
        ? currentMixedMedia[currentMixedIndex].src
        : ''
      : currentImages[currentImageIndex] || '';

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === ' ' && viewMode === 'video') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeModal, showNext, showPrev, togglePlayPause, viewMode]);

  useEffect(() => {
    if (!isOpen || viewMode !== 'video') return;

    if (currentMixedMedia.length > 0) {
      const item = currentMixedMedia[currentMixedIndex];
      const video = videoRef.current;
      if (item?.type === 'video' && video) {
        video.pause();
        video.currentTime = 0;
        video.src = mediaUrl(item.src);
        video.load();
        video.volume = volume / 100;
        setIsPlaying(false);
      }
      return;
    }

    if (currentVideos.length > 0) {
      loadVideoAtIndex(currentVideoIndex, currentVideos);
    }
  }, [
    isOpen,
    viewMode,
    currentMixedMedia,
    currentMixedIndex,
    currentVideos,
    currentVideoIndex,
    loadVideoAtIndex,
    volume,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => updateTimeUI();
    const onLoadedMetadata = () => {
      video.volume = volume / 100;
      updateTimeUI();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [isOpen, viewMode, updateTimeUI, volume]);

  return {
    isOpen,
    openModal,
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
    hasMultiple: totalItems > 1,
  };
}
