export const VersionComparisonView = ({
  left,
  right,
  metadata,
}: {
  left: Record<string, unknown>;
  right: Record<string, unknown>;
  metadata: Record<string, unknown>;
}) => {
  return (
    <section className="card" aria-label="Version comparison">
      <h3>Version comparison snapshot</h3>
      <p className="muted">Snapshot-based structural comparison. Diff fields are shown as raw JSON during foundation phase.</p>
      <div className="grid-two">
        <article>
          <h4>Left version</h4>
          <pre>{JSON.stringify(left, null, 2)}</pre>
        </article>
        <article>
          <h4>Right version</h4>
          <pre>{JSON.stringify(right, null, 2)}</pre>
        </article>
      </div>
      <article>
        <h4>Metadata</h4>
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </article>
    </section>
  );
};
