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
import { CurriculumSourceAdminPage } from '../pages/admin/curricula/CurriculumSourceAdminPage';
import { CurriculumSourceProcessingComparePage } from '../pages/admin/curricula/CurriculumSourceProcessingComparePage';
import { CurriculumSourceProcessingCreatePage } from '../pages/admin/curricula/CurriculumSourceProcessingCreatePage';
import { CurriculumSourceProcessingReviewPage } from '../pages/admin/curricula/CurriculumSourceProcessingReviewPage';
import { CurriculumSourceProcessingReviewQueuePage } from '../pages/admin/curricula/CurriculumSourceProcessingReviewQueuePage';
import { CurriculumSourceProcessingSessionsPage } from '../pages/admin/curricula/CurriculumSourceProcessingSessionsPage';
import { CurriculumSourceProcessingWorkspacePage } from '../pages/admin/curricula/CurriculumSourceProcessingWorkspacePage';
import { CurriculumVersionsPage } from '../pages/admin/curricula/CurriculumVersionsPage';
import { MasterContentDashboardPage } from '../pages/admin/master-content/MasterContentDashboardPage';
import { MasterContentEntityPage } from '../pages/admin/master-content/MasterContentEntityPage';
import { MasterContentReviewQueuePage } from '../pages/admin/master-content/MasterContentReviewQueuePage';
import { MasterContentPromotionsPage } from '../pages/admin/master-content/MasterContentPromotionsPage';
import { MasterContentPromotionCreatePage } from '../pages/admin/master-content/MasterContentPromotionCreatePage';
import { MasterContentPromotionDetailPage } from '../pages/admin/master-content/MasterContentPromotionDetailPage';
import { MasterContentPromotionReviewPage } from '../pages/admin/master-content/MasterContentPromotionReviewPage';
import { MasterContentPromotionReviewQueuePage } from '../pages/admin/master-content/MasterContentPromotionReviewQueuePage';
import { MasterContentPromotionComparePage } from '../pages/admin/master-content/MasterContentPromotionComparePage';
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
        <Route path="curricula/sources" element={<CurriculumSourceAdminPage />} />
        <Route path="curriculum-sources/:sourceId/processing" element={<CurriculumSourceProcessingSessionsPage />} />
        <Route path="curriculum-sources/:sourceId/processing/new" element={<CurriculumSourceProcessingCreatePage />} />
        <Route path="curriculum-sources/:sourceId/processing/:sessionId" element={<CurriculumSourceProcessingWorkspacePage />} />
        <Route path="curriculum-sources/:sourceId/processing/:sessionId/review" element={<CurriculumSourceProcessingReviewPage />} />
        <Route path="curriculum-sources/:sourceId/processing/:sessionId/compare" element={<CurriculumSourceProcessingComparePage />} />
        <Route path="curriculum-processing/review-queue" element={<CurriculumSourceProcessingReviewQueuePage />} />
        <Route path="curricula/:curriculumId" element={<CurriculumDetailPage />} />
        <Route path="curricula/:curriculumId/edit" element={<CurriculumEditPage />} />
        <Route path="curricula/:curriculumId/structure" element={<CurriculumStructurePage />} />
        <Route path="curricula/:curriculumId/review" element={<CurriculumReviewPage />} />
        <Route path="curricula/:curriculumId/versions" element={<CurriculumVersionsPage />} />
        <Route path="curricula/:curriculumId/assignments" element={<CurriculumAssignmentsPage />} />
        <Route path="curricula/:curriculumId/archive" element={<CurriculumArchivePage />} />
        <Route path="master-content" element={<MasterContentDashboardPage />} />
        <Route path="master-content/review-queue" element={<MasterContentReviewQueuePage />} />
        <Route path="master-content/:entityType" element={<MasterContentEntityPage />} />
        {/* Phase 2N: Master Content Promotion routes */}
        <Route path="master-content-promotions" element={<MasterContentPromotionsPage />} />
        <Route path="master-content-promotions/new" element={<MasterContentPromotionCreatePage />} />
        <Route path="master-content-promotions/review-queue" element={<MasterContentPromotionReviewQueuePage />} />
        <Route path="master-content-promotions/:promotionId" element={<MasterContentPromotionDetailPage />} />
        <Route path="master-content-promotions/:promotionId/review" element={<MasterContentPromotionReviewPage />} />
        <Route path="master-content-promotions/:promotionId/compare" element={<MasterContentPromotionComparePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
