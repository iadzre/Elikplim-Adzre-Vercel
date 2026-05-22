import { useEffect } from 'react';

export function useCustomCursor() {
  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let rafId = 0;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const addHoverEffect = (element) => {
      element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    };

    const setupInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], .cursor-pointer, [class*="cursor-pointer"], .project-tile, .project-tile *'
      );
      interactiveElements.forEach((el) => addHoverEffect(el));
    };

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.4;
      cursorY += (mouseY - cursorY) * 0.4;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      rafId = requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', onMouseMove);
    setupInteractiveElements();
    animateCursor();

    const observer = new MutationObserver(() => setupInteractiveElements());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      cursor.remove();
    };
  }, []);
}
