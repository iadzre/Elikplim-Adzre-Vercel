import { Link, useLocation } from 'react-router-dom';
import { useSidePanel } from '../../context/SidePanelContext';
import { CloseIcon } from '../shared/CloseIcon';

export function SidePanel() {
  const { isOpen, closePanel } = useSidePanel();
  const location = useLocation();

  const navLinkClass = (path) =>
    `text-[#F45D01] josefin font-bold tracking-2x mb-1 uppercase text-sm transition-colors duration-300 hover:text-[#F45D01] hover:scale-105 block${
      location.pathname === path ? ' active' : ''
    }`;

  return (
    <>
      <div
        id="side-panel"
        className={`side-panel${isOpen ? ' open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="side-panel-content">
          <button
            id="closeSidePanel"
            type="button"
            onClick={closePanel}
            aria-label="Close menu"
            className="absolute top-4 right-4 text-[#2A2F7F] hover:text-[#F45D01] transition-all duration-300 hover:scale-110 focus:outline-none"
          >
            <CloseIcon />
          </button>
          <nav className="mb-8 md:hidden" aria-label="Mobile navigation">
            <ul className="space-y-1">
              <li>
                <Link
                  to="/about"
                  className={navLinkClass('/about')}
                  aria-current={location.pathname === '/about' ? 'page' : undefined}
                  onClick={closePanel}
                >
                  About Me
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className={navLinkClass('/projects')}
                  aria-current={location.pathname === '/projects' ? 'page' : undefined}
                  onClick={closePanel}
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/leave-a-note"
                  className={navLinkClass('/leave-a-note')}
                  aria-current={location.pathname === '/leave-a-note' ? 'page' : undefined}
                  onClick={closePanel}
                >
                  Leave a Note
                </Link>
              </li>
            </ul>
          </nav>
          <section className="welcome-section mb-8">
            <p className="text-[#F45D01] josefin tracking-2x mb-2 uppercase text-xs">
              HELLO, HII....i am
            </p>
            <p className="text-[#2A2F7F] josefin tracking-2x mb-2 uppercase text-xs">
              Illustrator | Filmmaker | Photographer | Storyteller
            </p>
            <h3 className="text-[#2A2F7F] josefin tracking-2x mb-4 uppercase text-xs">
              GET IN TOUCH LET&apos;S WORK
            </h3>
            <p className="text-[#2A2F7F] josefin tracking-2x mb-2 uppercase text-xs opacity-70">
              HAVE A QUESTION OR WANT TO COLLABORATE?
            </p>
            <a
              href="tel:+233546335150"
              className="text-[#2A2F7F] text-sm font-light block hover:text-[#F45D01] hover:scale-105 transition-all duration-300 montserrat tracking-2x uppercase"
            >
              +233 (0) 54-633-5150
            </a>
          </section>
          <section className="footer-section">
            <div className="text-xs text-[#2A2F7F] josefin tracking-2x uppercase opacity-70">
              <p>© 2025 ALL RIGHTS RESERVED.</p>
              <p className="mt-2">DESIGNED WITH ♥ by ELIKPLIM ADZRE</p>
            </div>
          </section>
        </div>
      </div>
      <div
        className={`overlay${isOpen ? ' open' : ''}`}
        onClick={closePanel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closePanel();
          }
        }}
        role="button"
        tabIndex={isOpen ? 0 : -1}
        aria-label="Close menu overlay"
        aria-hidden={!isOpen}
      />
    </>
  );
}
