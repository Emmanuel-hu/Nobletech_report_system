import { Link } from 'react-router-dom';

import { PermissionGate } from '../../../components/layout/PermissionGate';

const capabilities = [
  'Curriculum metadata authoring',
  'Curriculum listing and filtering',
  'Curriculum detail viewing',
  'Curriculum metadata editing',
  'Curriculum unit CRUD',
  'Curriculum unit reordering',
  'Curriculum topic CRUD',
  'Curriculum topic reordering',
  'Topic to concept mapping',
  'Project CRUD',
  'Project implementation variant editing',
  'Topic to project mapping',
  'Learning outcome CRUD',
  'Outcome mapping to topics',
  'Outcome mapping to projects',
  'Resource CRUD',
  'Visibility setting management',
  'Review submission',
  'Revision request handling',
  'Approval action',
  'Publication action',
  'Assignment creation',
  'Assignment status transitions',
  'Version history viewing',
  'Version comparison',
  'Archive action',
  'Audit timeline viewing',
  'Retry and error recovery states',
  'Unsaved change protection',
];

export const CurriculumDashboardPage = () => {
  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Phase 2I</p>
        <h2>Administrative foundation workspace</h2>
        <p>
          Manual curriculum authoring and review operations are active. AI-assisted generation and regeneration remain intentionally
          disabled in this milestone.
        </p>
      </header>

      <PermissionGate permission="curriculum.view">
        <div className="card">
          <h3>Implemented foundation capabilities</h3>
          <ul className="capability-list">
            {capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </div>

        <div className="card-grid">
          <Link className="action-card" to="/admin/curricula/list">
            <h3>Open curriculum list</h3>
            <p>Search, filter, inspect status, and navigate to detail workflows.</p>
          </Link>
          <Link className="action-card" to="/admin/curricula/create">
            <h3>Create curriculum</h3>
            <p>Start metadata authoring with permission validation and basic concurrency fields.</p>
          </Link>
        </div>
      </PermissionGate>
    </section>
  );
};
