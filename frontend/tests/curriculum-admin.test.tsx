import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import type { AuthSession } from '../src/types/auth';

const renderApp = (route: string, session?: AuthSession) => {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider initialSession={session}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe('Curriculum administrative routes', () => {
  it('renders dashboard capabilities for authorized users', () => {
    renderApp('/admin/curricula');

    expect(screen.getByText('Administrative foundation workspace')).toBeInTheDocument();
    expect(screen.getByText('Implemented foundation capabilities')).toBeInTheDocument();
  });

  it('blocks dashboard when curriculum.view permission is missing', () => {
    const restrictedSession: AuthSession = {
      userId: 'u-1',
      schoolId: 's-1',
      permissions: ['curriculum.create'],
    };

    renderApp('/admin/curricula', restrictedSession);

    expect(screen.getByText('Permission required')).toBeInTheDocument();
  });

  it('shows health route without curriculum contexts', () => {
    renderApp('/health');

    expect(screen.getByText('NEMP Frontend is running.')).toBeInTheDocument();
  });

  it('renders source administration foundation route', () => {
    renderApp('/admin/curricula/sources');

    expect(screen.getByText('Curriculum source and master-content administration')).toBeInTheDocument();
    expect(screen.getByText('Source register')).toBeInTheDocument();
  });

  it('renders master-content dashboard route', () => {
    renderApp('/admin/master-content');

    expect(screen.getByText('Master-content administration dashboard')).toBeInTheDocument();
  });

  it('blocks the source-processing review queue when permission is missing', () => {
    const restrictedSession: AuthSession = {
      userId: 'u-1',
      schoolId: 's-1',
      permissions: ['curriculum.view'],
    };

    renderApp('/admin/curriculum-processing/review-queue', restrictedSession);

    expect(screen.getByText('Permission required')).toBeInTheDocument();
    expect(screen.getByText('You do not currently hold curriculum_source.processing.view.')).toBeInTheDocument();
  });
});
