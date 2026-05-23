import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { SoftwareSlider } from '../components/about/SoftwareSlider';
import { CareerTimeline } from '../components/about/CareerTimeline';
import profilePhoto from '../assets/profile.png';
import { LazyImage } from '../components/shared/LazyImage';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { useAboutContent } from '../hooks/useAboutContent';
import { usePageTitle } from '../hooks/usePageTitle';

export function AboutPage() {
  const headerRef = useHeaderBlur(true);
  const { bioParagraphs, skills, name, title, profileImageUrl, loading, error } = useAboutContent();

  usePageTitle('About Me');

  const profileSrc = profileImageUrl || profilePhoto;

  return (
    <PageLayout
      htmlClass="about-me-page-html"
      bodyClass="about-me-page min-h-screen flex flex-col"
      headerRef={headerRef}
      pageShellClassName="w-full page-shell"
      showFooter
      footer={<Footer />}
    >
      <main className="w-full overflow-x-hidden">
        <section className="min-h-screen flex items-center justify-center w-full pt-24 sm:pt-28 md:pt-32 py-16 md:py-20">
          <div className="w-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-1 text-[#F45D01] josefin">
                    HELLO, HII....i am
                  </p>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl uppercase tracking-[0.05em] font-medium text-[#2A2F7F] mb-0 leading-[1.1] gazzetta-bold">
                    {name}
                  </h1>
                </div>
                <div className="-mt-3 md:-mt-4">
                  <p className="text-[#F45D01] josefin tracking-2x uppercase text-xs">{title}</p>
                </div>
                <div className="space-y-1.5 md:space-y-2 pt-4 md:pt-2 border-t border-[#2A2F7F]">
                  {loading && <ContentMessage message="Loading bio…" className="text-left" />}
                  {error && !loading && (
                    <ContentMessage
                      message="Unable to load bio content from Supabase."
                      className="text-left"
                    />
                  )}
                  {!loading &&
                    !error &&
                    bioParagraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-xs md:text-base text-gray-700 gotham-book max-w-3xl mx-auto${index > 0 ? ' mt-2' : ''}`}
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#F45D01] mb-2 josefin">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {!loading &&
                      !error &&
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#2A2F7F] hover:text-[#F45D01] josefin px-2.5 py-1 border border-[#2A2F7F] hover:border-[#F45D01]"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-lg aspect-square bg-white border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-xl hover:border-[#F45D01] transition-all duration-500 group">
                  <LazyImage
                    src={profileSrc}
                    alt={name}
                    eager
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <SoftwareSlider />
        <CareerTimeline />
      </main>
    </PageLayout>
  );
}
