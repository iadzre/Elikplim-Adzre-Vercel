import { useEffect, useRef, useState } from 'react';
import { LazyImage } from '../shared/LazyImage';
import { downloadResourceFile } from '../../lib/services/resourcesService';
import { ALL_DOWNLOADS_FREE } from '../../lib/resources/marketplaceConfig';
import { formatResourceStatsLine } from '../../lib/resources/formatResourceStats';

export function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  hasAccess,
  onAccessGranted,
  onStatsUpdated,
  reviews = [],
}) {
  const closeRef = useRef(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setPreviewIndex(0);
    setMessage(null);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, resource?.id, onClose]);

  if (!resource) return null;

  const priceLabel = ALL_DOWNLOADS_FREE || resource.isFree ? 'Free' : `$${resource.price}`;
  const canDownload = ALL_DOWNLOADS_FREE || hasAccess || resource.isFree;
  const metaLine = `${formatResourceStatsLine(resource)} · ${priceLabel}`;
  const formats = Array.isArray(resource.formats) ? resource.formats : [];

  async function handleDownload() {
    setBusy(true);
    setMessage(null);
    const { data, error } = await downloadResourceFile(resource.id);
    setBusy(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      setMessage({ type: 'success', text: 'Download started.' });
      onAccessGranted();
      onStatsUpdated?.();
    }
  }

  return (
    <div
      className={`resources-modal fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 ${isOpen ? 'is-open' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-detail-title"
      aria-hidden={!isOpen}
    >
      <div className="resources-modal-panel resources-page w-full sm:max-w-4xl max-h-[94vh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-lg">
        <header className="resources-modal-header shrink-0">
          <div className="resources-modal-header__label">
            <span className="resources-modal-eyebrow josefin">Resource</span>
            <span className="resources-modal-eyebrow-sep" aria-hidden="true" />
            <span
              className={`resources-modal-badge josefin ${resource.isFree ? 'resources-modal-badge--free' : 'resources-modal-badge--paid'}`}
            >
              {resource.isFree ? 'Free' : 'Paid'}
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="resources-modal-close"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="resources-modal-body overflow-y-auto flex-1">
          <div className="resources-modal-media">
            <div className="resources-modal-preview">
              <LazyImage
                src={resource.previews[previewIndex] ?? resource.thumbnail}
                alt={`Preview of ${resource.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            {resource.previews.length > 1 && (
              <div className="resources-modal-thumbs" role="tablist" aria-label="Preview images">
                {resource.previews.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={previewIndex === i}
                    onClick={() => setPreviewIndex(i)}
                    className={`resources-modal-thumb ${previewIndex === i ? 'is-active' : ''}`}
                  >
                    <LazyImage src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="resources-modal-info">
            <h2 id="resource-detail-title" className="resources-detail-title resources-modal-title">
              {resource.title}
            </h2>
            <div className="resources-modal-divider" aria-hidden="true" />
            <p className="resources-modal-description">{resource.longDescription}</p>
            <p className="resources-modal-meta">{metaLine}</p>
            {formats.length > 0 && (
              <div className="resources-modal-formats">
                {formats.map((format) => (
                  <span key={format} className="resources-modal-format josefin">
                    {format}
                  </span>
                ))}
              </div>
            )}
            {message && (
              <p
                className={`resources-modal-message ${message.type === 'error' ? 'resources-modal-message--error' : 'resources-modal-message--success'}`}
                role="status"
              >
                {message.text}
              </p>
            )}
            {canDownload ? (
              <button
                type="button"
                disabled={busy}
                onClick={handleDownload}
                className="resources-modal-download josefin"
              >
                <span>{busy ? 'Preparing…' : 'Download file'}</span>
                {!busy && (
                  <span className="resources-modal-download__arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </button>
            ) : (
              <p className="resources-modal-locked josefin">
                Sign in and purchase to download this resource.
              </p>
            )}
            {reviews.length > 0 && (
              <section className="resources-modal-reviews" aria-label="Reviews">
                <h3 className="resources-modal-reviews__heading josefin">Reviews</h3>
                <ul className="resources-modal-reviews__list">
                  {reviews.slice(0, 3).map((r, i) => (
                    <li key={`${r.rating}-${i}`} className="resources-modal-review">
                      <span className="resources-modal-review__rating">{r.rating}★</span>
                      <span>{r.review_text || 'No comment'}</span>
                      {r.profiles?.full_name && (
                        <span className="resources-modal-review__author">· {r.profiles.full_name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}