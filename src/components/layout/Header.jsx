import { Link, useLocation } from 'react-router-dom';
import { PORTFOLIO_LOGO } from '../../assets/branding';
import { useSidePanel } from '../../context/SidePanelContext';
import { MainNavLinks } from './MainNavLinks';

/**
 * @param {{
 *   variant?: 'index' | 'default';
 *   headerRef?: import('react').RefObject<HTMLElement | null>;
 *   headerClassName?: string;
 *   navClassName?: string;
 *   barClassName?: string;
 * }} props
 */
export function Header({
  variant = 'default',
  headerRef,
  headerClassName = '',
  navClassName = 'text-[#2A2F7F]',
  barClassName = 'bg-[#2A2F7F]',
}) {
  const { isOpen, togglePanel } = useSidePanel();
  const location = useLocation();
  const isIndex = variant === 'index';

  const logoClass = isIndex ? 'h-5 sm:h-6 brightness-0 invert' : 'h-5 sm:h-6';

  const defaultHeaderBg = isIndex ? 'bg-transparent' : 'bg-[#f3fcf0]';

  const navColor = isIndex ? 'text-[#f3fcf0]' : navClassName;
  const barColor = isIndex ? 'bg-white' : barClassName;

  return (
    <header
      id="mainHeader"
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 flex items-center w-full px-4 sm:px-6 md:px-12 py-6 md:py-8 z-50 ${defaultHeaderBg} transition-all duration-300 ${headerClassName}`}
    >
      <Link to="/" className="hover:opacity-80 transition-opacity duration-300 flex-shrink-0">
        <img src={PORTFOLIO_LOGO} alt="elikplim adzre" className={logoClass} decoding="async" />
      </Link>
      <nav
        aria-label="Main navigation"
        className={`absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-10 xl:gap-14 2xl:gap-16 ${navColor} text-xs xl:text-sm tracking-2x uppercase josefin`}
      >
        <MainNavLinks
          location={location}
          className="contents"
          linkClassName={(pathname, href) =>
            `transition-colors duration-300 hover:text-[#F45D01] hover:scale-105 whitespace-nowrap${pathname === href ? ' active' : ''}`
          }
        />
      </nav>
      <div className="flex items-center ml-auto flex-shrink-0">
        <button
          id="hamburger"
          type="button"
          onClick={togglePanel}
          className="flex flex-col justify-center items-center w-10 h-10 ml-auto group focus:outline-none relative z-[60] cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="side-panel"
          style={{ pointerEvents: 'auto' }}
        >
          <span
            className={`block w-6 h-0.5 ${barColor} rounded-full transition-all duration-300 hamburger-bar-1 pointer-events-none`}
          />
          <span
            className={`block w-6 h-0.5 ${barColor} rounded-full transition-all duration-300 hamburger-bar-2 pointer-events-none`}
          />
        </button>
      </div>
    </header>
  );
}
