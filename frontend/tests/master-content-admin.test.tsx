import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import type { AuthSession } from '../src/types/auth';

const renderApp = (route: string, session?: AuthSession) => {
  return render(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider initialSession={session}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe('Master-content administration routes', () => {
  it('renders master-content dashboard route', () => {
    renderApp('/admin/master-content');

    expect(screen.getByText('Master-content administration dashboard')).toBeInTheDocument();
  });

  it('renders master-content review queue route', () => {
    renderApp('/admin/master-content/review-queue');

    expect(screen.getByText('Review queue')).toBeInTheDocument();
  });

  it('gates master-content routes when permission is missing', () => {
    const restrictedSession: AuthSession = {
      userId: 'u-1',
      schoolId: 's-1',
      permissions: ['curriculum.view'],
    };

    renderApp('/admin/master-content', restrictedSession);

    expect(screen.getByText('Permission required')).toBeInTheDocument();
  });
});
