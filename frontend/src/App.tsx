import { Link } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';

const App = (): JSX.Element => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Nobletech Education Management Platform</h1>
        <p>Foundation frontend shell for the approved NEMP architecture.</p>
        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/health">Health</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
