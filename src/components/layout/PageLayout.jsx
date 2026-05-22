import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SidePanel } from './SidePanel';
import { useSidePanel } from '../../context/SidePanelContext';

/**
 * @param {{
 *   children: import('react').ReactNode;
 *   htmlClass?: string;
 *   bodyClass: string;
 *   headerVariant?: 'index' | 'default';
 *   headerClassName?: string;
 *   navClassName?: string;
 *   barClassName?: string;
 *   pageShellClassName?: string;
 *   pageShellStyle?: import('react').CSSProperties;
 *   enableHeaderBlur?: boolean;
 *   headerRef?: import('react').RefObject<HTMLElement | null>;
 *   showFooter?: boolean;
 *   footer?: import('react').ReactNode;
 * }} props
 */
export function PageLayout({
  children,
  htmlClass = '',
  bodyClass,
  headerVariant = 'default',
  headerClassName = '',
  navClassName,
  barClassName,
  pageShellClassName = 'w-full page-shell',
  pageShellStyle,
  headerRef,
  showFooter = false,
  footer = null,
}) {
  const { isOpen, closePanel } = useSidePanel();
  const location = useLocation();

  useEffect(() => {
    const html = document.documentElement;
    html.lang = 'en';
    html.className = htmlClass;
    document.body.className = bodyClass;
  }, [htmlClass, bodyClass]);

  useEffect(() => {
    closePanel();
  }, [location.pathname, closePanel]);

  useEffect(() => {
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.classList.toggle('open', isOpen);
    }
    document.body.classList.toggle('no-scroll', isOpen);
  }, [isOpen]);

  return (
    <>
      <Header
        variant={headerVariant}
        headerRef={headerRef}
        headerClassName={headerClassName}
        navClassName={navClassName}
        barClassName={barClassName}
      />
      <div className={pageShellClassName} style={pageShellStyle}>
        <SidePanel />
        {children}
      </div>
      {showFooter && footer}
    </>
  );
}
