import { lazy, Suspense, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Footer } from '../components/layout/Footer';
import { ProjectTile } from '../components/projects/ProjectTile';
const ProjectModal = lazy(() =>
  import('../components/projects/ProjectModal').then((m) => ({ default: m.ProjectModal }))
);
import { ClientCommentsCarousel } from '../components/projects/ClientCommentsCarousel';
import { useHeaderBlur } from '../hooks/useHeaderBlur';
import { ContentMessage } from '../components/shared/ContentMessage';
import { useProjects } from '../hooks/useProjects';
import { useTestimonials } from '../hooks/useTestimonials';
import { useProjectModal } from '../hooks/useProjectModal';

export function ProjectsPage() {
  const headerRef = useHeaderBlur(true);
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { testimonials, loading: testimonialsLoading, error: testimonialsError } = useTestimonials();
  const modal = useProjectModal();

  useEffect(() => {
    document.title = 'Elikplim Adzre - Projects';
  }, []);

  return (
    <>
      <PageLayout
        htmlClass="projects-page-html"
        bodyClass="projects-page bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen flex flex-col"
        headerRef={headerRef}
        pageShellClassName="w-full page-shell flex-1 flex flex-col"
        showFooter
        footer={<Footer />}
      >
        <main className="w-full flex flex-col bg-gradient-to-b from-[#f3fcf0] to-[#f5f1ca] min-h-screen pb-16 md:pb-20">
          <section className="w-full flex flex-col">
            <div className="text-center mb-6 px-4 md:px-8 pt-24 sm:pt-28 md:pt-32">
              <p className="text-xs uppercase tracking-[0.4em] text-[#F45D01] josefin">Projects & case studies</p>
              <p className="text-sm md:text-base text-[#2A2F7F] mt-2 max-w-3xl mx-auto">
                Curated drops from branding labs, product experiments and editorial playgrounds. Each tile mirrors a Behance-style square so you can scan quickly and dive deeper later.
              </p>
            </div>
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 pb-16 md:pb-20">
              {projectsError && (
                <ContentMessage message="Unable to load projects from Supabase. Run migrations and seed.sql, then verify environment variables." />
              )}
              {projectsLoading && !projectsError && <ContentMessage message="Loading projects…" />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
                {!projectsLoading &&
                  !projectsError &&
                  projects.map((project) => (
                  <ProjectTile
                    key={project.id}
                    project={project}
                    onOpen={modal.openModal}
                  />
                  ))}
              </div>
            </div>
          </section>
          {testimonialsError && (
            <ContentMessage message="Unable to load testimonials from Supabase." />
          )}
          {!testimonialsError && (
            <ClientCommentsCarousel testimonials={testimonials} loading={testimonialsLoading} />
          )}
        </main>
      </PageLayout>
      <Suspense fallback={null}>
        <ProjectModal {...modal} />
      </Suspense>
    </>
  );
}
