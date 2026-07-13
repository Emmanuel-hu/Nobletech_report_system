type SnapshotEntity = {
  id?: string;
  title?: string;
  name?: string;
  code?: string;
  sequenceOrder?: number;
  [key: string]: unknown;
};

type SnapshotShape = {
  curriculum?: Record<string, unknown>;
  units?: SnapshotEntity[];
  concepts?: SnapshotEntity[];
  learningOutcomes?: SnapshotEntity[];
  resources?: SnapshotEntity[];
  visibilitySetting?: Record<string, unknown> | null;
};

type DiffBucket = {
  added: SnapshotEntity[];
  removed: SnapshotEntity[];
  changed: Array<{ before: SnapshotEntity; after: SnapshotEntity }>;
};

const toSnapshotShape = (value: unknown): SnapshotShape => {
  if (!value || typeof value !== 'object') {
    return {};
  }
  return value as SnapshotShape;
};

const signature = (entity: SnapshotEntity): string => {
  if (entity.id) {
    return entity.id;
  }
  if (entity.code) {
    return String(entity.code);
  }
  return JSON.stringify({
    title: entity.title,
    name: entity.name,
    sequenceOrder: entity.sequenceOrder,
  });
};

const diffCollection = (before: SnapshotEntity[] = [], after: SnapshotEntity[] = []): DiffBucket => {
  const left = new Map(before.map((item) => [signature(item), item]));
  const right = new Map(after.map((item) => [signature(item), item]));

  const added: SnapshotEntity[] = [];
  const removed: SnapshotEntity[] = [];
  const changed: Array<{ before: SnapshotEntity; after: SnapshotEntity }> = [];

  for (const [key, rightValue] of right) {
    const leftValue = left.get(key);
    if (!leftValue) {
      added.push(rightValue);
      continue;
    }
    if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) {
      changed.push({ before: leftValue, after: rightValue });
    }
  }

  for (const [key, leftValue] of left) {
    if (!right.has(key)) {
      removed.push(leftValue);
    }
  }

  return { added, removed, changed };
};

const renderEntityLabel = (entity: SnapshotEntity): string => {
  return String(entity.title ?? entity.name ?? entity.code ?? entity.id ?? 'Unlabelled item');
};

const DiffSection = ({ title, bucket }: { title: string; bucket: DiffBucket }) => {
  const isEmpty = bucket.added.length === 0 && bucket.removed.length === 0 && bucket.changed.length === 0;
  return (
    <article className="card">
      <h4>{title}</h4>
      {isEmpty ? <p className="muted">No changes detected.</p> : null}
      {bucket.added.length > 0 ? (
        <>
          <p><strong>Added</strong></p>
          <ul>
            {bucket.added.map((entity) => (
              <li key={`added-${signature(entity)}`}>{renderEntityLabel(entity)}</li>
            ))}
          </ul>
        </>
      ) : null}
      {bucket.removed.length > 0 ? (
        <>
          <p><strong>Removed</strong></p>
          <ul>
            {bucket.removed.map((entity) => (
              <li key={`removed-${signature(entity)}`}>{renderEntityLabel(entity)}</li>
            ))}
          </ul>
        </>
      ) : null}
      {bucket.changed.length > 0 ? (
        <>
          <p><strong>Changed</strong></p>
          <ul>
            {bucket.changed.map((pair) => (
              <li key={`changed-${signature(pair.after)}`}>
                {renderEntityLabel(pair.before)}: previous value to new value
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
};

export const VersionComparisonView = ({
  left,
  right,
  metadata,
}: {
  left: { snapshotData?: unknown; versionNumber?: string };
  right: { snapshotData?: unknown; versionNumber?: string };
  metadata: { checksumMatch?: boolean; serializedLengthDelta?: number };
}) => {
  const leftSnapshot = toSnapshotShape(left.snapshotData);
  const rightSnapshot = toSnapshotShape(right.snapshotData);

  const metadataChanges = diffCollection(
    leftSnapshot.curriculum ? [leftSnapshot.curriculum as SnapshotEntity] : [],
    rightSnapshot.curriculum ? [rightSnapshot.curriculum as SnapshotEntity] : [],
  );

  const unitsChanges = diffCollection(leftSnapshot.units ?? [], rightSnapshot.units ?? []);
  const topicsChanges = diffCollection(
    (leftSnapshot.units ?? []).flatMap((unit) => (Array.isArray(unit.topics) ? (unit.topics as SnapshotEntity[]) : [])),
    (rightSnapshot.units ?? []).flatMap((unit) => (Array.isArray(unit.topics) ? (unit.topics as SnapshotEntity[]) : [])),
  );
  const conceptsChanges = diffCollection(
    (leftSnapshot.units ?? []).flatMap((unit) =>
      (Array.isArray(unit.topics) ? (unit.topics as SnapshotEntity[]) : []).flatMap((topic) =>
        Array.isArray(topic.concepts) ? (topic.concepts as SnapshotEntity[]) : [],
      ),
    ),
    (rightSnapshot.units ?? []).flatMap((unit) =>
      (Array.isArray(unit.topics) ? (unit.topics as SnapshotEntity[]) : []).flatMap((topic) =>
        Array.isArray(topic.concepts) ? (topic.concepts as SnapshotEntity[]) : [],
      ),
    ),
  );
  const projectsChanges = diffCollection(
    (leftSnapshot.units ?? []).flatMap((unit) => (Array.isArray(unit.projects) ? (unit.projects as SnapshotEntity[]) : [])),
    (rightSnapshot.units ?? []).flatMap((unit) => (Array.isArray(unit.projects) ? (unit.projects as SnapshotEntity[]) : [])),
  );
  const projectImplementationChanges = diffCollection(
    (leftSnapshot.units ?? []).flatMap((unit) =>
      (Array.isArray(unit.projects) ? (unit.projects as SnapshotEntity[]) : []).flatMap((project) =>
        Array.isArray(project.implementations) ? (project.implementations as SnapshotEntity[]) : [],
      ),
    ),
    (rightSnapshot.units ?? []).flatMap((unit) =>
      (Array.isArray(unit.projects) ? (unit.projects as SnapshotEntity[]) : []).flatMap((project) =>
        Array.isArray(project.implementations) ? (project.implementations as SnapshotEntity[]) : [],
      ),
    ),
  );
  const outcomeChanges = diffCollection(leftSnapshot.learningOutcomes ?? [], rightSnapshot.learningOutcomes ?? []);
  const resourceChanges = diffCollection(leftSnapshot.resources ?? [], rightSnapshot.resources ?? []);
  const visibilityChanges = diffCollection(
    leftSnapshot.visibilitySetting ? [leftSnapshot.visibilitySetting as SnapshotEntity] : [],
    rightSnapshot.visibilitySetting ? [rightSnapshot.visibilitySetting as SnapshotEntity] : [],
  );

  return (
    <section className="card" aria-label="Version comparison">
      <h3>Structured version comparison</h3>
      <p className="muted">
        Comparing {left.versionNumber ?? 'left version'} against {right.versionNumber ?? 'right version'}.
      </p>
      <p className="muted">
        Checksum match: {metadata.checksumMatch ? 'Yes' : 'No'} | Serialized length delta: {metadata.serializedLengthDelta ?? 0}
      </p>
      <div className="card-grid">
        <DiffSection title="Curriculum metadata" bucket={metadataChanges} />
        <DiffSection title="Units" bucket={unitsChanges} />
        <DiffSection title="Topics" bucket={topicsChanges} />
        <DiffSection title="Concept mappings" bucket={conceptsChanges} />
        <DiffSection title="Projects" bucket={projectsChanges} />
        <DiffSection title="Project implementations" bucket={projectImplementationChanges} />
        <DiffSection title="Learning outcomes" bucket={outcomeChanges} />
        <DiffSection title="Resources" bucket={resourceChanges} />
        <DiffSection title="Visibility settings" bucket={visibilityChanges} />
      </div>
    </section>
  );
};

export const versionComparisonUtils = {
  diffCollection,
  toSnapshotShape,
};
