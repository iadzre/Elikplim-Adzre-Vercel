import { useEffect, useRef } from 'react';
import { LazyImage } from '../shared/LazyImage';
import { SOFTWARE_ICONS } from '../../assets/branding';

const SOFTWARE_ITEMS = [
  {
    href: 'https://www.adobe.com/creativecloud.html',
    icon: SOFTWARE_ICONS.adobe,
    alt: 'Adobe Creative Suite',
    label: 'Adobe',
    external: true,
  },
  {
    href: 'https://www.adobe.com/products/premiere.html',
    icon: SOFTWARE_ICONS.premiere,
    alt: 'Premiere Pro',
    label: 'Premiere',
    external: true,
  },
  {
    href: 'https://www.adobe.com/products/photoshop-lightroom.html',
    icon: SOFTWARE_ICONS.lightroom,
    alt: 'Lightroom',
    label: 'Lightroom',
    external: true,
  },
  { icon: SOFTWARE_ICONS.blender, alt: 'Blender', label: 'Blender', external: false },
  { icon: SOFTWARE_ICONS.afterEffects, alt: 'After Effects', label: 'After Effects', external: false },
  { icon: SOFTWARE_ICONS.photoshop, alt: 'Photoshop', label: 'Photoshop', external: false },
  { icon: SOFTWARE_ICONS.illustrator, alt: 'Illustrator', label: 'Illustrator', external: false },
  { icon: SOFTWARE_ICONS.indesign, alt: 'InDesign', label: 'InDesign', external: false },
  {
    href: 'https://www.blackmagicdesign.com/products/davinciresolve',
    icon: SOFTWARE_ICONS.davinci,
    alt: 'DaVinci Resolve',
    label: 'DaVinci Resolve',
    external: true,
  },
];

function SoftwareItem({ item }) {
  const content = (
    <>
      <LazyImage
        src={item.icon}
        alt={item.alt}
        className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-transform duration-300 object-contain"
      />
      <span className="text-[9px] md:text-[10px] lg:text-xs text-gray-700 josefin uppercase tracking-wider whitespace-nowrap">
        {item.label}
      </span>
    </>
  );

  if (item.external && item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center gap-3 md:gap-4 group cursor-pointer hover:opacity-80 transition-opacity duration-300"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex-shrink-0 flex items-center gap-3 md:gap-4 group">
      {content}
    </div>
  );
}

export function SoftwareSlider() {
  const trackRef = useRef(null);
  const positionRef = useRef(0);
  const originalItemCountRef = useRef(SOFTWARE_ITEMS.length);
  const originalItemWidthRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const softwareSlider = trackRef.current;
    if (!softwareSlider) return;

    const getGap = () => {
      if (window.innerWidth >= 1024) return 64;
      if (window.innerWidth >= 768) return 48;
      return 32;
    };

    const initSlider = () => {
      const allItems = Array.from(softwareSlider.children);
      if (allItems.length > originalItemCountRef.current) {
        allItems.slice(originalItemCountRef.current).forEach((item) => item.remove());
      }

      const gap = getGap();
      const firstItem = softwareSlider.children[0];
      if (firstItem && originalItemCountRef.current > 0) {
        originalItemWidthRef.current =
          (firstItem.offsetWidth + gap) * originalItemCountRef.current;

        const itemsToClone = Array.from(softwareSlider.children);
        for (let i = 0; i < 2; i += 1) {
          itemsToClone.forEach((item) => {
            softwareSlider.appendChild(item.cloneNode(true));
          });
        }
      }
    };

    const animate = () => {
      positionRef.current -= 0.5;
      if (Math.abs(positionRef.current) >= originalItemWidthRef.current) {
        positionRef.current += originalItemWidthRef.current;
      }
      softwareSlider.style.transform = `translateX(${positionRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    initSlider();
    animate();

    let resizeTimeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        positionRef.current = 0;
        initSlider();
      }, 250);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="flex items-center justify-center w-full py-8 md:py-12 bg-white">
      <div className="w-full">
        <div className="w-full">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#2A2F7F] mb-4 md:mb-6 text-center josefin px-4 sm:px-6 md:px-12">
            Software & Tools
          </p>
          <div className="relative overflow-hidden w-full">
            <div id="software-slider" className="overflow-hidden w-full">
              <div
                ref={trackRef}
                id="software-slider-track"
                className="flex items-center gap-8 md:gap-12 lg:gap-16 transition-transform duration-500 ease-in-out"
              >
                {SOFTWARE_ITEMS.map((item) => (
                  <SoftwareItem key={item.label} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
