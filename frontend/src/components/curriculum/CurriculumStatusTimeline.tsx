import type { CurriculumStatusHistory } from '../../types/curriculum';

export const CurriculumStatusTimeline = ({ history }: { history: CurriculumStatusHistory[] }) => {
  if (history.length === 0) {
    return <p className="muted">No state transition history is available yet.</p>;
  }

  return (
    <ol className="timeline" aria-label="Curriculum status history">
      {history.map((entry) => (
        <li key={entry.id}>
          <div className="timeline-dot" aria-hidden="true" />
          <div>
            <p>
              <strong>{entry.previousStatus}</strong> to <strong>{entry.newStatus}</strong>
            </p>
            <p className="muted">Changed by {entry.changedById} at {new Date(entry.changedAt).toLocaleString()}</p>
            {entry.reason ? <p>{entry.reason}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
};
