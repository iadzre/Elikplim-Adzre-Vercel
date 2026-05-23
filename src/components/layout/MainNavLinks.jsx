import { Link } from 'react-router-dom';
import { useNavLinks } from '../../hooks/useNavLinks';

/**
 * @param {{
 *   location: import('react-router-dom').Location;
 *   className?: string;
 *   linkClassName?: (pathname: string, href: string) => string;
 *   onNavigate?: () => void;
 *   listClassName?: string;
 *   itemTag?: 'none' | 'li';
 * }} props
 */
export function MainNavLinks({
  location,
  className = '',
  linkClassName,
  onNavigate,
  listClassName = '',
  itemTag = 'none',
}) {
  const { links } = useNavLinks();

  const defaultLinkClass = (href) => {
    const active = location.pathname === href;
    return `transition-colors duration-300 hover:text-[#F45D01] hover:scale-105 whitespace-nowrap${active ? ' active' : ''}`;
  };

  const nodes = links.map((link) => {
    const classForLink = linkClassName
      ? linkClassName(location.pathname, link.href)
      : defaultLinkClass(link.href);

    const el = (
      <Link
        key={link.id}
        to={link.href}
        aria-current={location.pathname === link.href ? 'page' : undefined}
        className={classForLink}
        onClick={onNavigate}
      >
        {link.label}
      </Link>
    );

    if (itemTag === 'li') {
      return <li key={link.id}>{el}</li>;
    }
    return el;
  });

  if (itemTag === 'li') {
    return <ul className={listClassName}>{nodes}</ul>;
  }

  return <div className={className}>{nodes}</div>;
}
