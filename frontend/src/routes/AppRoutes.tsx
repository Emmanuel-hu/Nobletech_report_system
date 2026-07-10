import { Navigate, Route, Routes } from 'react-router-dom';

import HealthPage from '../pages/HealthPage';
import HomePage from '../pages/HomePage';

const AppRoutes = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
