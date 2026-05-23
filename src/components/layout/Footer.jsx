import { SocialLinks } from './SocialLinks';
import { useContactInfo } from '../../hooks/useContactInfo';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export function Footer() {
  const { findByPlatform } = useContactInfo();
  const { settings } = useSiteSettings();

  const email = findByPlatform('email');
  const emailHref = email?.value ? `mailto:${email.value}` : 'mailto:iadzre@gmail.com';
  const emailLabel = email?.value || 'iadzre@gmail.com';

  const tagline =
    settings.footer_text ||
    'We Narrate Journeys that Inspire, Transform and Last a Lifetime.';

  const copyright = settings.copyright_text || '© 2025 ALL RIGHTS RESERVED';

  return (
    <footer className="w-full px-4 sm:px-6 md:px-12 pt-8 md:pt-10 pb-4 md:pb-6 bg-[#f3fcf0] relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="flex flex-col justify-center">
            <p className="text-xs md:text-sm text-[#F45D01] josefin tracking-2x uppercase leading-relaxed max-w-md">
              {tagline}
            </p>
          </div>
          <div className="flex flex-col justify-center md:items-end">
            <h4 className="text-[10px] md:text-xs text-[#F45D01] josefin tracking-2x uppercase mb-1">
              Want to collaborate?
            </h4>
            <p className="text-[10px] md:text-xs text-gray-600 josefin tracking-2x uppercase mb-1">
              USE THIS EMAIL
            </p>
            <a
              href={emailHref}
              className="text-[#2A2F7F] text-xs md:text-base hover:text-[#F45D01] transition-colors duration-300 josefin font-bold tracking-2x uppercase inline-block"
            >
              {emailLabel}
            </a>
          </div>
        </div>
        <div className="border-t border-gray-300/40 mb-4 md:mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] md:text-xs text-gray-500 josefin tracking-2x uppercase order-2 md:order-1">
            <p>{copyright}</p>
          </div>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
