import { Link } from 'react-router-dom';

const HomePage = (): JSX.Element => {
  return (
    <section aria-labelledby="home-heading">
      <h2 id="home-heading">NEMP Frontend Foundation</h2>
      <p>
        Phase 2I curriculum authoring and review administrative foundation is now available for
        manual workflows.
      </p>
      <p>
        Open the <Link to="/admin/curricula">Curriculum administrative workspace</Link> to access
        authoring, review, versioning, assignment, and archive actions.
      </p>
      <p aria-live="polite">Backend health-check status: Connected through curriculum APIs.</p>
    </section>
  );
};

export default HomePage;
