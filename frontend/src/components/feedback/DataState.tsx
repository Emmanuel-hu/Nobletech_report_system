export const LoadingState = ({ label }: { label: string }) => (
  <div className="state-block" role="status" aria-live="polite">
    <p>{label}</p>
  </div>
);

export const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <div className="state-block" role="status" aria-live="polite">
    <h3>{title}</h3>
    <p>{body}</p>
  </div>
);

export const ErrorState = ({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) => (
  <div className="state-block state-error" role="alert">
    <h3>{title}</h3>
    <p>{body}</p>
    {onRetry ? (
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    ) : null}
  </div>
);
