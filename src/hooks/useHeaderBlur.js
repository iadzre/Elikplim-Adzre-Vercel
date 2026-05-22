import { useEffect, useRef } from 'react';

/**
 * @param {boolean} enabled
 */
export function useHeaderBlur(enabled = true) {
  const headerRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTopRef.current && scrollTop > 50) {
        header.classList.remove('header-blur');
      } else if (scrollTop < lastScrollTopRef.current && scrollTop > 50) {
        header.classList.add('header-blur');
      } else if (scrollTop <= 50) {
        header.classList.remove('header-blur');
      }

      lastScrollTopRef.current = scrollTop;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  return headerRef;
}
