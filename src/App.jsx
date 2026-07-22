import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SidePanelProvider } from './context/SidePanelContext';
import { SiteDataProvider } from './context/SiteDataContext';
import { useCustomCursor } from './hooks/useCustomCursor';
import { SiteMeta } from './components/shared/SiteMeta';
import { HomePage } from './pages/HomePage';

const AdminProtectedRoute = lazy(() =>
  import('./components/admin/adminEntry.js').then((m) => ({ default: m.ProtectedRoute }))
);
const AdminLayout = lazy(() =>
  import('./components/admin/adminEntry.js').then((m) => ({ default: m.AdminLayout }))
);

const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const ResourcesPage = lazy(() =>
  import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage }))
);
const ResourceDetailPage = lazy(() =>
  import('./pages/ResourceDetailPage').then((m) => ({ default: m.ResourceDetailPage }))
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
const AdminShopResourcesPage = lazy(() =>
  import('./pages/admin/AdminShopResourcesPage').then((m) => ({ default: m.AdminShopResourcesPage }))
);
const AdminShopResourceFormPage = lazy(() =>
  import('./pages/admin/AdminShopResourceFormPage').then((m) => ({ default: m.AdminShopResourceFormPage }))
);
const AdminShopCategoriesPage = lazy(() =>
  import('./pages/admin/AdminShopCategoriesPage').then((m) => ({ default: m.AdminShopCategoriesPage }))
);
const AdminShopProfilesPage = lazy(() =>
  import('./pages/admin/AdminShopProfilesPage').then((m) => ({ default: m.AdminShopProfilesPage }))
);
const AdminShopReviewsPage = lazy(() =>
  import('./pages/admin/AdminShopReviewsPage').then((m) => ({ default: m.AdminShopReviewsPage }))
);
const AdminShopPurchasesPage = lazy(() =>
  import('./pages/admin/AdminShopPurchasesPage').then((m) => ({ default: m.AdminShopPurchasesPage }))
);
const AdminShopNewsletterPage = lazy(() =>
  import('./pages/admin/AdminShopNewsletterPage').then((m) => ({ default: m.AdminShopNewsletterPage }))
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
    if (isAdmin) {
      document.documentElement.className = 'admin-route';
      document.body.className = 'admin-route';
      document.body.classList.remove('overflow-hidden', 'no-scroll');
      document.documentElement.classList.remove('no-scroll');
      return () => {
        document.documentElement.classList.remove('admin-route');
        document.body.classList.remove('admin-route');
      };
    }

    document.documentElement.classList.remove('admin-route');
    document.body.classList.remove('admin-route');
    return undefined;
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
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:slug" element={<ResourceDetailPage />} />
          <Route path="/leave-a-note" element={<LeaveANotePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/hero" element={<AdminHeroPage />} />
              <Route path="/admin/home-slides" element={<AdminHomeSlidesPage />} />
              <Route path="/admin/about" element={<AdminAboutPage />} />
              <Route path="/admin/career" element={<AdminCareerPage />} />
              <Route path="/admin/projects" element={<AdminProjectsPage />} />
              <Route path="/admin/projects/new" element={<AdminProjectFormPage />} />
              <Route path="/admin/projects/:id" element={<AdminProjectFormPage />} />
              <Route path="/admin/shop/resources" element={<AdminShopResourcesPage />} />
              <Route path="/admin/shop/resources/new" element={<AdminShopResourceFormPage />} />
              <Route path="/admin/shop/resources/:id" element={<AdminShopResourceFormPage />} />
              <Route path="/admin/shop/categories" element={<AdminShopCategoriesPage />} />
              <Route path="/admin/shop/profiles" element={<AdminShopProfilesPage />} />
              <Route path="/admin/shop/reviews" element={<AdminShopReviewsPage />} />
              <Route path="/admin/shop/purchases" element={<AdminShopPurchasesPage />} />
              <Route path="/admin/shop/newsletter" element={<AdminShopNewsletterPage />} />
              <Route path="/admin/skills" element={<AdminSkillsPage />} />
              <Route path="/admin/testimonials" element={<AdminTestimonialsPage />} />
              <Route path="/admin/contact" element={<AdminContactPage />} />
              <Route path="/admin/notes" element={<Navigate to="/admin/testimonials" replace />} />
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
      <SiteDataProvider>
        <SidePanelProvider>
          <AppContent />
        </SidePanelProvider>
      </SiteDataProvider>
    </BrowserRouter>
  );
}
