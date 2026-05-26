/** Fixed spacing between career timeline entries (original 8-entry baseline). */
export const TIMELINE_LEFT_START = 4.7;
export const TIMELINE_LEFT_STEP = 12.5;
export const TIMELINE_ITEM_WIDTH = 9.4;

export const TIMELINE_SVG_START = 150;
export const TIMELINE_SVG_STEP = 200;
export const TIMELINE_SVG_Y = 128;
export const TIMELINE_SVG_HEIGHT = 256;
/** Padding after last tick so the line and last label fit inside the scroll width. */
export const TIMELINE_SVG_END_PADDING = 120;
/** Horizontal line extends beyond first/last tick (SVG units). */
export const TIMELINE_LINE_EXTEND = 48;

/** Baseline used before dynamic layout (8 published entries). */
export const TIMELINE_REFERENCE_COUNT = 8;
export const TIMELINE_REFERENCE_MIN_WIDTH = 1200;

/**
 * @param {number} count published entry count
 */
export function computeTimelineSvgLayout(count) {
  const n = Math.max(1, count);
  const lineStart = TIMELINE_SVG_START;
  const lineEnd = TIMELINE_SVG_START + (n - 1) * TIMELINE_SVG_STEP;
  const viewBoxWidth = lineEnd + TIMELINE_SVG_END_PADDING;
  const tickXs = Array.from({ length: n }, (_, i) => TIMELINE_SVG_START + i * TIMELINE_SVG_STEP);
  const linePathStart = Math.max(0, lineStart - TIMELINE_LINE_EXTEND);
  const linePathEnd = Math.min(viewBoxWidth, lineEnd + TIMELINE_LINE_EXTEND);

  return {
    viewBoxWidth,
    viewBoxHeight: TIMELINE_SVG_HEIGHT,
    lineStart,
    lineEnd,
    linePathStart,
    linePathEnd,
    tickXs,
  };
}

/**
 * Scrollable track width in pixels — grows when entries are added.
 * @param {number} count
 */
export function computeTimelineMinWidth(count) {
  const n = Math.max(1, count);
  const { viewBoxWidth } = computeTimelineSvgLayout(n);
  const referenceLayout = computeTimelineSvgLayout(TIMELINE_REFERENCE_COUNT);
  const scale = viewBoxWidth / referenceLayout.viewBoxWidth;
  return Math.max(viewBoxWidth, Math.round(TIMELINE_REFERENCE_MIN_WIDTH * scale));
}

/**
 * Left offset aligned to SVG tick centers for the given entry count.
 * @param {number} index zero-based sort order
 * @param {number} [count] total entries (defaults to index + 1)
 */
export function computeLeftOffsetPercent(index, count) {
  const n = Math.max(1, count ?? index + 1);
  const { tickXs, viewBoxWidth } = computeTimelineSvgLayout(n);
  const tick = tickXs[Math.min(index, tickXs.length - 1)];
  const centerPercent = (tick / viewBoxWidth) * 100;
  const left = centerPercent - TIMELINE_ITEM_WIDTH / 2;
  return `${Math.max(0, left).toFixed(1)}%`;
}

/**
 * @param {number} index
 * @param {number} count
 */
export function timelineTickStroke(index, count) {
  if (index === 0) return '#2A2F7F';
  if (count > 1 && index === count - 1) return '#F45D01';
  return '#d1d5db';
}

/**
 * @param {number} index
 * @param {number} count
 */
export function timelineTickStrokeWidth(index, count) {
  if (index === 0 || (count > 1 && index === count - 1)) return 2.5;
  return 1.5;
}

/**
 * @param {number} index
 * @param {number} count
 */
export function timelinePointRadius(index, count) {
  if (index === 0 || (count > 1 && index === count - 1)) return 7;
  return 5;
}

/**
 * @param {Array<Record<string, unknown>>} entries ordered list
 */
export function applyTimelineOffsets(entries) {
  const count = entries.length;
  return entries.map((entry, index) => ({
    ...entry,
    left_offset: computeLeftOffsetPercent(index, count),
  }));
}
