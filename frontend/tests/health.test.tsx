import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from '../src/App';

describe('Health page', () => {
  it('renders the frontend running message', () => {
    render(
      <MemoryRouter initialEntries={['/health']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('NEMP Frontend is running.')).toBeInTheDocument();
  });
});
