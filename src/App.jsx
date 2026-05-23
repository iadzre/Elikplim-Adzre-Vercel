import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SidePanelProvider } from './context/SidePanelContext';
import { useCustomCursor } from './hooks/useCustomCursor';
import { SiteMeta } from './components/shared/SiteMeta';
import { HomePage } from './pages/HomePage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';

const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const LeaveANotePage = lazy(() =>
  import('./pages/LeaveANotePage').then((m) => ({ default: m.LeaveANotePage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminHeroPage = lazy(() =>
  import('./pages/admin/AdminHeroPage').then((m) => ({ default: m.AdminHeroPage }))
);
const AdminAboutPage = lazy(() =>
  import('./pages/admin/AdminAboutPage').then((m) => ({ default: m.AdminAboutPage }))
);
const AdminProjectsPage = lazy(() =>
  import('./pages/admin/AdminProjectsPage').then((m) => ({ default: m.AdminProjectsPage }))
);
const AdminProjectFormPage = lazy(() =>
  import('./pages/admin/AdminProjectFormPage').then((m) => ({ default: m.AdminProjectFormPage }))
);
const AdminSkillsPage = lazy(() =>
  import('./pages/admin/AdminSkillsPage').then((m) => ({ default: m.AdminSkillsPage }))
);
const AdminTestimonialsPage = lazy(() =>
  import('./pages/admin/AdminTestimonialsPage').then((m) => ({ default: m.AdminTestimonialsPage }))
);
const AdminContactPage = lazy(() =>
  import('./pages/admin/AdminContactPage').then((m) => ({ default: m.AdminContactPage }))
);
const AdminNavigationPage = lazy(() =>
  import('./pages/admin/AdminNavigationPage').then((m) => ({ default: m.AdminNavigationPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);
const AdminHomeSlidesPage = lazy(() =>
  import('./pages/admin/AdminHomeSlidesPage').then((m) => ({ default: m.AdminHomeSlidesPage }))
);
const AdminCareerPage = lazy(() =>
  import('./pages/admin/AdminCareerPage').then((m) => ({ default: m.AdminCareerPage }))
);

function PageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-[#2A2F7F] josefin text-sm tracking-widest uppercase">
      Loading…
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  useCustomCursor(!isAdmin);

  useEffect(() => {
    document.documentElement.classList.toggle('admin-route', isAdmin);
    document.body.classList.toggle('admin-route', isAdmin);
    if (isAdmin) {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.documentElement.classList.remove('admin-route');
      document.body.classList.remove('admin-route');
    };
  }, [isAdmin]);

  return (
    <>
      <SiteMeta />
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/leave-a-note" element={<LeaveANotePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/hero" element={<AdminHeroPage />} />
              <Route path="/admin/home-slides" element={<AdminHomeSlidesPage />} />
              <Route path="/admin/about" element={<AdminAboutPage />} />
              <Route path="/admin/career" element={<AdminCareerPage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
              <Route path="/admin/projects/new" element={<AdminProjectFormPage />} />
              <Route path="/admin/projects/:id" element={<AdminProjectFormPage />} />
              <Route path="/admin/skills" element={<AdminSkillsPage />} />
              <Route path="/admin/testimonials" element={<AdminTestimonialsPage />} />
              <Route path="/admin/contact" element={<AdminContactPage />} />
              <Route path="/admin/navigation" element={<AdminNavigationPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SidePanelProvider>
        <AppContent />
      </SidePanelProvider>
    </BrowserRouter>
  );
}
