/** Fixed spacing between career timeline entries (matches original 8-entry layout). */
export const TIMELINE_LEFT_START = 4.7;
export const TIMELINE_LEFT_STEP = 12.5;
export const TIMELINE_ITEM_WIDTH = 9.4;

export const TIMELINE_SVG_START = 150;
export const TIMELINE_SVG_STEP = 200;
export const TIMELINE_SVG_Y = 128;
export const TIMELINE_SVG_HEIGHT = 256;
export const TIMELINE_SVG_END_PADDING = 50;

/**
 * @param {number} index zero-based sort order
 */
export function computeLeftOffsetPercent(index) {
  const left = TIMELINE_LEFT_START + index * TIMELINE_LEFT_STEP;
  return `${left.toFixed(1)}%`;
}

/**
 * @param {number} count published entry count
 */
export function computeTimelineSvgLayout(count) {
  const n = Math.max(1, count);
  const lineStart = TIMELINE_SVG_START;
  const lineEnd = TIMELINE_SVG_START + (n - 1) * TIMELINE_SVG_STEP;
  const viewBoxWidth = lineEnd + TIMELINE_SVG_END_PADDING;
  const tickXs = Array.from({ length: n }, (_, i) => TIMELINE_SVG_START + i * TIMELINE_SVG_STEP);

  return {
    viewBoxWidth,
    viewBoxHeight: TIMELINE_SVG_HEIGHT,
    lineStart,
    lineEnd,
    tickXs,
  };
}

/**
 * @param {number} count
 */
export function computeTimelineMinWidth(count) {
  return computeTimelineSvgLayout(count).viewBoxWidth;
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
 * @param {Array<Record<string, unknown>>} entries ordered list
 */
export function applyTimelineOffsets(entries) {
  return entries.map((entry, index) => ({
    ...entry,
    left_offset: computeLeftOffsetPercent(index),
  }));
}
