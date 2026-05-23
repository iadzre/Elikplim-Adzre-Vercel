import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SidePanelProvider } from './context/SidePanelContext';
import { useCustomCursor } from './hooks/useCustomCursor';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { LeaveANotePage } from './pages/LeaveANotePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminHeroPage } from './pages/admin/AdminHeroPage';
import { AdminAboutPage } from './pages/admin/AdminAboutPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminProjectFormPage } from './pages/admin/AdminProjectFormPage';
import { AdminSkillsPage } from './pages/admin/AdminSkillsPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminContactPage } from './pages/admin/AdminContactPage';
import { AdminNavigationPage } from './pages/admin/AdminNavigationPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';

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
      document.body.classList.remove('overflow-hidden');
    }
  }, [isAdmin]);

  return (
    <>
      <ScrollToTop />
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
            <Route path="/admin/about" element={<AdminAboutPage />} />
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
