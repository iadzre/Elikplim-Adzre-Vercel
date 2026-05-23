/** @typedef {'free' | 'premium'} ResourceTier */

/**
 * @typedef {Object} ResourceItem
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} description
 * @property {string} longDescription
 * @property {string} categoryId
 * @property {number} price
 * @property {boolean} isFree
 * @property {boolean} featured
 * @property {number} rating
 * @property {number} downloadCount
 * @property {string[]} tags
 * @property {string} thumbnail
 * @property {string[]} previews
 * @property {string[]} features
 * @property {string[]} includes
 * @property {string[]} formats
 * @property {string[]} compatibility
 * @property {string} license
 * @property {string} [videoPreview]
 */

export const RESOURCE_CATEGORIES = [
  { id: 'ui-kits', label: 'UI Kits', description: 'Interfaces & design systems', icon: '◫' },
  { id: 'templates', label: 'Templates', description: 'Layouts ready to ship', icon: '▣' },
  { id: 'brand', label: 'Brand Assets', description: 'Identity & visual language', icon: '◎' },
  { id: 'motion', label: 'Motion Packs', description: 'Loops, transitions & reels', icon: '▶' },
  { id: 'mockups', label: 'Mockups', description: 'Devices & presentation scenes', icon: '▦' },
  { id: 'guides', label: 'Guides', description: 'Playbooks & frameworks', icon: '≡' },
  { id: 'production', label: 'Production Systems', description: 'Workflows that scale', icon: '⚙' },
  { id: 'design', label: 'Design Resources', description: 'Textures, type & utilities', icon: '✦' },
  { id: 'code', label: 'Code Components', description: 'React & front-end blocks', icon: '</>' },
  { id: 'business', label: 'Business Documents', description: 'Proposals & client kits', icon: '▤' },
];

/** @type {ResourceItem[]} */
export const RESOURCES = [
  {
    id: 'res-01',
    slug: 'cinematic-ui-kit',
    title: 'Cinematic UI Kit',
    description: 'Editorial interfaces with motion-ready components and dark/light variants.',
    longDescription:
      'A production-grade UI kit built for creative studios and SaaS brands. Includes navigation systems, hero modules, pricing tables, and case-study layouts — all aligned to a refined typographic scale.',
    categoryId: 'ui-kits',
    price: 49,
    isFree: false,
    featured: true,
    rating: 4.9,
    downloadCount: 2840,
    tags: ['Figma', 'Web', 'SaaS'],
    thumbnail: '/images/Prj04/cover.jpg',
    previews: ['/images/Prj04/cover.jpg', '/images/Prj06/Cover.jpg', '/images/slider/3d model 03.png'],
    features: ['120+ components', 'Auto-layout grids', 'Dark & light modes', 'Documentation included'],
    includes: ['Figma library', 'PDF style guide', 'Icon subset', 'Changelog'],
    formats: ['Figma', 'PDF'],
    compatibility: ['Figma 116+', 'FigJam'],
    license: 'Commercial use for unlimited client projects. No resale of source files.',
  },
  {
    id: 'res-02',
    slug: 'portfolio-template-system',
    title: 'Portfolio Template System',
    description: 'Modular case-study templates for designers and filmmakers.',
    longDescription:
      'Ship portfolio updates in hours, not weeks. Pre-built project grids, narrative scroll sections, and testimonial modules that match premium creative sites.',
    categoryId: 'templates',
    price: 0,
    isFree: true,
    featured: true,
    rating: 4.8,
    downloadCount: 9120,
    tags: ['Free', 'Portfolio', 'Framer-ready'],
    thumbnail: '/images/Prj12/cover.jpg',
    previews: ['/images/Prj12/cover.jpg', '/images/Prj02/cover.jpg'],
    features: ['8 page templates', 'Responsive breakpoints', 'CMS notes', 'Export checklist'],
    includes: ['Figma file', 'Notion doc', 'Asset list'],
    formats: ['Figma', 'PNG'],
    compatibility: ['Figma', 'Webflow', 'Framer'],
    license: 'Free for personal and commercial use. Attribution appreciated.',
  },
  {
    id: 'res-03',
    slug: 'brand-starter-pack',
    title: 'Brand Starter Pack',
    description: 'Logo grids, color systems, and stationery mockups for new identities.',
    longDescription:
      'Everything needed to present a cohesive brand on day one — from logo clearspace templates to social profile frames.',
    categoryId: 'brand',
    price: 35,
    isFree: false,
    featured: true,
    rating: 4.7,
    downloadCount: 1560,
    tags: ['Branding', 'Identity'],
    thumbnail: '/images/Prj01/cover.jpg',
    previews: ['/images/Prj01/cover.jpg', '/images/Prj05/fb cover.jpg'],
    features: ['Logo suite', 'Color tokens', 'Type pairings', 'Stationery mockups'],
    includes: ['AI + PSD', 'PDF brand book', 'Social templates'],
    formats: ['AI', 'PSD', 'PDF'],
    compatibility: ['Illustrator', 'Photoshop'],
    license: 'Single-seat license. Client work permitted.',
  },
  {
    id: 'res-04',
    slug: 'reel-transition-pack',
    title: 'Reel Transition Pack',
    description: 'Twenty seamless transitions for short-form and documentary edits.',
    longDescription:
      'Hand-crafted motion presets designed for Premiere Pro and DaVinci Resolve. Subtle, cinematic, never template-heavy.',
    categoryId: 'motion',
    price: 29,
    isFree: false,
    featured: false,
    rating: 4.9,
    downloadCount: 3210,
    tags: ['Premiere', 'Resolve', 'Social'],
    thumbnail: '/images/Prj13/cover.jpg',
    previews: ['/images/Prj13/cover.jpg'],
    features: ['20 transitions', '4K ready', 'Sound design tips', 'Tutorial walkthrough'],
    includes: ['MOGRT', 'DRFX', 'Preview renders'],
    formats: ['MOGRT', 'DRFX', 'MP4'],
    compatibility: ['Premiere Pro 2022+', 'DaVinci Resolve 18+'],
    license: 'Unlimited exports for owned channels and client delivery.',
    videoPreview: '/images/Prj13/cover.jpg',
  },
  {
    id: 'res-05',
    slug: 'device-mockup-studio',
    title: 'Device Mockup Studio',
    description: 'High-resolution device frames with natural lighting scenes.',
    longDescription:
      'Present UI and photography in context. Includes MacBook, iPhone, and tablet angles with editable smart objects.',
    categoryId: 'mockups',
    price: 0,
    isFree: true,
    featured: false,
    rating: 4.6,
    downloadCount: 6740,
    tags: ['Free', 'PSD', 'Presentation'],
    thumbnail: '/images/Prj08/cover.jpg',
    previews: ['/images/Prj08/cover.jpg', '/images/Prj14/cover.jpg'],
    features: ['12 scenes', 'Smart objects', 'Shadow controls'],
    includes: ['PSD pack', 'Lighting guide'],
    formats: ['PSD'],
    compatibility: ['Photoshop 2020+'],
    license: 'Free commercial use.',
  },
  {
    id: 'res-06',
    slug: 'client-onboarding-guide',
    title: 'Client Onboarding Guide',
    description: 'Notion + PDF playbook for creative project kickoffs.',
    longDescription:
      'Reduce revision cycles with structured discovery questions, timeline templates, and approval checkpoints.',
    categoryId: 'guides',
    price: 19,
    isFree: false,
    featured: false,
    rating: 4.8,
    downloadCount: 980,
    tags: ['Business', 'Notion'],
    thumbnail: '/images/Prj10/cover.jpg',
    previews: ['/images/Prj10/cover.jpg'],
    features: ['32-page guide', 'Email scripts', 'Scope templates'],
    includes: ['Notion duplicate', 'PDF export', 'Checklists'],
    formats: ['Notion', 'PDF'],
    compatibility: ['Notion', 'Any PDF reader'],
    license: 'Internal agency use. One seat.',
  },
  {
    id: 'res-07',
    slug: 'production-handoff-kit',
    title: 'Production Handoff Kit',
    description: 'Deliverable checklists for photo, video, and design teams.',
    longDescription:
      'Standardize exports, naming, and client delivery with battle-tested production workflows.',
    categoryId: 'production',
    price: 24,
    isFree: false,
    featured: false,
    rating: 4.7,
    downloadCount: 720,
    tags: ['Workflow', 'Team'],
    thumbnail: '/images/Prj11/cover.jpg',
    previews: ['/images/Prj11/cover.jpg'],
    features: ['Shot lists', 'Export presets', 'QC sheets'],
    includes: ['Spreadsheet', 'PDF SOP', 'Slack templates'],
    formats: ['XLSX', 'PDF'],
    compatibility: ['Google Sheets', 'Excel'],
    license: 'Studio license — up to 10 seats.',
  },
  {
    id: 'res-08',
    slug: 'texture-grain-library',
    title: 'Texture & Grain Library',
    description: 'Subtle overlays for posters, web, and motion graphics.',
    longDescription:
      'Curated film grain, paper, and halftone assets that add depth without visual noise.',
    categoryId: 'design',
    price: 0,
    isFree: true,
    featured: false,
    rating: 4.5,
    downloadCount: 11200,
    tags: ['Free', 'Textures'],
    thumbnail: '/images/slider/Christa Valley_Page_05.jpg',
    previews: ['/images/slider/Christa Valley_Page_05.jpg', '/images/slider/DSCF6665.jpg'],
    features: ['80 textures', 'Tileable', '16-bit PNG'],
    includes: ['PNG pack', 'Usage guide'],
    formats: ['PNG'],
    compatibility: ['Any design tool'],
    license: 'Free with optional credit.',
  },
  {
    id: 'res-09',
    slug: 'react-section-blocks',
    title: 'React Section Blocks',
    description: 'Accessible marketing sections with Tailwind-friendly markup.',
    longDescription:
      'Drop-in hero, feature, pricing, and FAQ components styled for modern portfolios and product sites.',
    categoryId: 'code',
    price: 39,
    isFree: false,
    featured: false,
    rating: 4.8,
    downloadCount: 1340,
    tags: ['React', 'Tailwind', 'A11y'],
    thumbnail: '/images/Prj06/Cover.jpg',
    previews: ['/images/Prj06/Cover.jpg', '/images/Prj04/cover.jpg'],
    features: ['18 sections', 'ARIA labels', 'Dark mode tokens'],
    includes: ['Source ZIP', 'Storybook notes', 'README'],
    formats: ['JSX', 'CSS'],
    compatibility: ['React 18+', 'Vite'],
    license: 'Commercial projects. No redistribution of source.',
  },
  {
    id: 'res-10',
    slug: 'proposal-contract-bundle',
    title: 'Proposal & Contract Bundle',
    description: 'Lawyer-reviewed templates for creative freelancers.',
    longDescription:
      'Professional proposals, statements of work, and contracts formatted for design and production services.',
    categoryId: 'business',
    price: 45,
    isFree: false,
    featured: false,
    rating: 4.9,
    downloadCount: 2100,
    tags: ['Legal', 'Freelance'],
    thumbnail: '/images/Prj03/golden nugget 2.jpg',
    previews: ['/images/Prj03/golden nugget 2.jpg'],
    features: ['6 documents', 'Editable clauses', 'Invoice template'],
    includes: ['DOCX', 'PDF', 'Google Docs links'],
    formats: ['DOCX', 'PDF'],
    compatibility: ['Word', 'Google Docs'],
    license: 'Single business entity. Not legal advice.',
  },
  {
    id: 'res-11',
    slug: 'motion-lower-thirds',
    title: 'Motion Lower Thirds',
    description: 'Minimal lower thirds for interviews and documentaries.',
    longDescription:
      'Clean typography-driven overlays with easy text replacement and brand color slots.',
    categoryId: 'motion',
    price: 18,
    isFree: false,
    featured: false,
    rating: 4.6,
    downloadCount: 890,
    tags: ['After Effects', 'Documentary'],
    thumbnail: '/images/Prj09/cover.jpg',
    previews: ['/images/Prj09/cover.jpg'],
    features: ['12 styles', '4K', 'Font included'],
    includes: ['AEP', 'MOGRT'],
    formats: ['AEP', 'MOGRT'],
    compatibility: ['After Effects 2021+'],
    license: 'Client delivery permitted.',
  },
  {
    id: 'res-12',
    slug: 'editorial-type-scale',
    title: 'Editorial Type Scale',
    description: 'Typographic system for editorial and portfolio sites.',
    longDescription:
      'Modular scale, pairing recommendations, and CSS variables for Gazzetta-inspired layouts.',
    categoryId: 'design',
    price: 0,
    isFree: true,
    featured: false,
    rating: 4.7,
    downloadCount: 4450,
    tags: ['Free', 'Typography'],
    thumbnail: '/images/slider/3d model. 01.jpg',
    previews: ['/images/slider/3d model. 01.jpg'],
    features: ['Type scale', 'CSS tokens', 'Figma styles'],
    includes: ['CSS', 'Figma', 'PDF specimen'],
    formats: ['CSS', 'Figma', 'PDF'],
    compatibility: ['Any stack'],
    license: 'Free commercial use.',
  },
];

export const RESOURCE_STATS = {
  totalResources: RESOURCES.length,
  totalDownloads: '18k+',
  avgRating: '4.8',
  freeCount: RESOURCES.filter((r) => r.isFree).length,
};

export const RESOURCE_TESTIMONIALS = [
  {
    quote: 'The UI kit saved us two weeks on a client rebrand. Everything feels intentional.',
    author: 'Amara K.',
    role: 'Design Director',
  },
  {
    quote: 'Finally resources that match the quality of the portfolio work — not generic templates.',
    author: 'James O.',
    role: 'Creative Lead',
  },
  {
    quote: 'Motion packs are subtle and professional. Exactly what our documentary needed.',
    author: 'Priya M.',
    role: 'Editor',
  },
];

export const RESOURCE_CLIENT_LOGOS = ['Atlantic', 'Studio North', 'Form & Film', 'Kora', 'Baseline'];
