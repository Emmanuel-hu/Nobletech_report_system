import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '../components/layout/AdminLayout';
import { CurriculumArchivePage } from '../pages/admin/curricula/CurriculumArchivePage';
import { CurriculumAssignmentsPage } from '../pages/admin/curricula/CurriculumAssignmentsPage';
import { CurriculumCreatePage } from '../pages/admin/curricula/CurriculumCreatePage';
import { CurriculumDashboardPage } from '../pages/admin/curricula/CurriculumDashboardPage';
import { CurriculumDetailPage } from '../pages/admin/curricula/CurriculumDetailPage';
import { CurriculumEditPage } from '../pages/admin/curricula/CurriculumEditPage';
import { CurriculumListPage } from '../pages/admin/curricula/CurriculumListPage';
import { CurriculumReviewPage } from '../pages/admin/curricula/CurriculumReviewPage';
import { CurriculumStructurePage } from '../pages/admin/curricula/CurriculumStructurePage';
import { CurriculumVersionsPage } from '../pages/admin/curricula/CurriculumVersionsPage';
import HealthPage from '../pages/HealthPage';
import HomePage from '../pages/HomePage';

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="curricula" element={<CurriculumDashboardPage />} />
        <Route path="curricula/list" element={<CurriculumListPage />} />
        <Route path="curricula/create" element={<CurriculumCreatePage />} />
        <Route path="curricula/:curriculumId" element={<CurriculumDetailPage />} />
        <Route path="curricula/:curriculumId/edit" element={<CurriculumEditPage />} />
        <Route path="curricula/:curriculumId/structure" element={<CurriculumStructurePage />} />
        <Route path="curricula/:curriculumId/review" element={<CurriculumReviewPage />} />
        <Route path="curricula/:curriculumId/versions" element={<CurriculumVersionsPage />} />
        <Route path="curricula/:curriculumId/assignments" element={<CurriculumAssignmentsPage />} />
        <Route path="curricula/:curriculumId/archive" element={<CurriculumArchivePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
