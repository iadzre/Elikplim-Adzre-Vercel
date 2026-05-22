/** Static fallbacks when Supabase is unavailable or tables are empty (paths match supabase/seed.sql). */

/** @type {import('../lib/contentMappers').HomeSlide[]} */
export const FALLBACK_HOME_SLIDES = [
  { id: 'fallback-1', src: '/images/slider/_DSF2248.jpg', alt: 'Slide 1' },
  { id: 'fallback-2', src: '/images/slider/DSCF6665.jpg', alt: 'Slide 2' },
  { id: 'fallback-3', src: '/images/slider/3d model 03.png', alt: 'Slide 3' },
  { id: 'fallback-4', src: '/images/slider/3d model. 01.jpg', alt: 'Slide 4' },
  { id: 'fallback-5', src: '/images/slider/Christa Valley_Page_05.jpg', alt: 'Slide 5' },
];
