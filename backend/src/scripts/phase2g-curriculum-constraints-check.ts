import path from 'node:path';

import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';

const repoRoot = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const prisma = new PrismaClient();

class RollbackSignal extends Error {
  constructor() {
    super('__ROLLBACK__');
  }
}

type TestResult = {
  name: string;
  passed: boolean;
  details: string;
};

const results: TestResult[] = [];

const nowTag = Date.now().toString(36);
let seq = 0;

const nextTag = (prefix: string): string => {
  seq += 1;
  return `${prefix}_${nowTag}_${seq}`;
};

const record = (name: string, passed: boolean, details: string): void => {
  results.push({ name, passed, details });
};

const isUniqueViolation = (error: unknown): boolean => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
};

const isConstraintViolation = (error: unknown): boolean => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2003' || error.code === 'P2004';
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('constraint') ||
    message.includes('violates') ||
    message.includes('foreign key') ||
    message.includes('check')
  );
};

const runAllowsWithRollback = async (
  name: string,
  fn: (tx: Prisma.TransactionClient) => Promise<void>,
): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
      throw new RollbackSignal();
    });
    record(name, false, 'Transaction unexpectedly committed.');
  } catch (error) {
    if (error instanceof RollbackSignal) {
      record(name, true, 'Allowed behavior observed; transaction rolled back.');
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    record(name, false, `Unexpected error: ${message}`);
  }
};

const runRejects = async (
  name: string,
  fn: (tx: Prisma.TransactionClient) => Promise<void>,
  predicate: (error: unknown) => boolean,
  expectedLabel: string,
): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      await fn(tx);
    });
    record(name, false, 'Expected rejection did not occur.');
  } catch (error) {
    if (predicate(error)) {
      record(name, true, `Expected ${expectedLabel} rejection observed.`);
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    record(name, false, `Unexpected error type: ${message}`);
  }
};

const createSchool = async (tx: Prisma.TransactionClient, code: string) => {
  return tx.school.create({
    data: {
      code,
      name: `${code}-name`,
      status: 'ACTIVE',
    },
  });
};

const createUser = async (tx: Prisma.TransactionClient, schoolId: string, label: string) => {
  return tx.user.create({
    data: {
      schoolId,
      firstName: 'Verifier',
      lastName: 'User',
      username: `${label}_${nextTag('u')}`,
      email: null,
      passwordHash: 'hash-placeholder',
      status: 'ACTIVE',
      mustChangePassword: false,
    },
  });
};

const createProgrammeComponent = async (tx: Prisma.TransactionClient, code: string) => {
  return tx.programmeComponent.create({
    data: {
      code,
      name: `${code}-name`,
      status: 'ACTIVE',
      requiresDevice: false,
      requiresInternet: false,
      requiresKit: false,
    },
  });
};

const createSchoolProgrammeComponent = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  programmeComponentId: string,
  createdById: string,
) => {
  return tx.schoolProgrammeComponent.create({
    data: {
      schoolId,
      programmeComponentId,
      displayName: `SPC-${nextTag('spc')}`,
      localCode: `SPC-${nextTag('c')}`,
      createdById,
    },
  });
};

const createAcademicSessionTermClass = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  createdById: string,
) => {
  const session = await tx.academicSession.create({
    data: {
      schoolId,
      name: `Session-${nextTag('sess')}`,
      code: `SES-${nextTag('code')}`,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-07-31'),
      status: 'PLANNED',
      createdById,
    },
  });

  const term = await tx.term.create({
    data: {
      schoolId,
      academicSessionId: session.id,
      name: `Term-${nextTag('term')}`,
      code: `TRM-${nextTag('code')}`,
      sequenceOrder: 1,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-15'),
      status: 'PLANNED',
    },
  });

  const academicClass = await tx.academicClass.create({
    data: {
      schoolId,
      name: `Class-${nextTag('class')}`,
      code: `CL-${nextTag('code')}`,
      levelOrder: 1,
      educationLevel: 'PRIMARY',
      status: 'ACTIVE',
    },
  });

  return { session, term, academicClass };
};

const createCurriculumBase = async (tx: Prisma.TransactionClient, label: string) => {
  const school = await createSchool(tx, `SCH-${nextTag(label)}`);
  const user = await createUser(tx, school.id, `${label}_user`);
  const component = await createProgrammeComponent(tx, `PC-${nextTag(label)}`);
  const schoolComponent = await createSchoolProgrammeComponent(tx, school.id, component.id, user.id);
  const scope = await createAcademicSessionTermClass(tx, school.id, user.id);

  const curriculum = await tx.curriculum.create({
    data: {
      schoolId: school.id,
      schoolProgrammeComponentId: schoolComponent.id,
      title: `Curriculum-${nextTag(label)}`,
      code: `CUR-${nextTag(label)}`,
      description: 'Operational curriculum test record',
      status: 'DRAFT',
      creationMethod: 'MANUAL',
      createdById: user.id,
    },
  });

  return { school, user, component, schoolComponent, scope, curriculum };
};

const createVersion = async (
  tx: Prisma.TransactionClient,
  curriculumId: string,
  createdById: string,
  status: 'DRAFT' | 'PUBLISHED' | 'GENERATED_DRAFT' | 'REVISION_REQUIRED' = 'DRAFT',
  versionNumber?: string,
) => {
  return tx.curriculumVersion.create({
    data: {
      curriculumId,
      versionNumber: versionNumber ?? `1.${nextTag('v')}`,
      majorVersion: 1,
      minorVersion: 0,
      patchVersion: 0,
      versionLabel: 'v1.0.0',
      status,
      snapshotData: { capture: 'full' },
      snapshotChecksum: status === 'PUBLISHED' ? `sha-${nextTag('sum')}` : null,
      createdById,
      approvedById: status === 'PUBLISHED' ? createdById : null,
      approvedAt: status === 'PUBLISHED' ? new Date('2026-10-10T09:00:00Z') : null,
      publishedById: status === 'PUBLISHED' ? createdById : null,
      publishedAt: status === 'PUBLISHED' ? new Date('2026-10-11T09:00:00Z') : null,
      isCurrent: true,
      isPublished: status === 'PUBLISHED',
    },
  });
};

const createUnitTopic = async (tx: Prisma.TransactionClient, curriculumId: string, userId: string) => {
  const unit = await tx.curriculumUnit.create({
    data: {
      curriculumId,
      title: `Unit-${nextTag('unit')}`,
      code: `U-${nextTag('code')}`,
      sequenceOrder: 1,
      createdById: userId,
    },
  });

  const topic = await tx.curriculumTopic.create({
    data: {
      curriculumUnitId: unit.id,
      title: `Topic-${nextTag('topic')}`,
      code: `T-${nextTag('code')}`,
      sequenceOrder: 1,
      createdById: userId,
    },
  });

  return { unit, topic };
};

const main = async (): Promise<void> => {
  await runRejects(
    '1) Duplicate curriculum code in same school is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_same_school');
      await tx.curriculum.create({
        data: {
          schoolId: base.school.id,
          schoolProgrammeComponentId: base.schoolComponent.id,
          title: 'Duplicate Curriculum',
          code: base.curriculum.code,
          createdById: base.user.id,
        },
      });
    },
    isUniqueViolation,
    'same-school code unique-constraint',
  );

  await runAllowsWithRollback('2) Same curriculum code across different schools is allowed', async (tx) => {
    const a = await createCurriculumBase(tx, 'same_code_a');
    const b = await createCurriculumBase(tx, 'same_code_b');
    await tx.curriculum.update({ where: { id: b.curriculum.id }, data: { code: a.curriculum.code } });
  });

  await runRejects(
    '3) Invalid curriculum approval metadata is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'approval_meta');
      await tx.curriculum.update({
        where: { id: base.curriculum.id },
        data: { status: 'APPROVED', approvedAt: null, approvedById: null },
      });
    },
    isConstraintViolation,
    'approval metadata check',
  );

  await runRejects(
    '4) Invalid publication metadata is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'publish_meta');
      await tx.curriculum.update({
        where: { id: base.curriculum.id },
        data: { status: 'PUBLISHED', approvedAt: null, approvedById: null, publishedAt: null, publishedById: null },
      });
    },
    isConstraintViolation,
    'publication metadata check',
  );

  await runRejects(
    '5) Publication before approval is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'publish_before_approve');
      await tx.curriculum.update({
        where: { id: base.curriculum.id },
        data: {
          status: 'PUBLISHED',
          approvedById: base.user.id,
          approvedAt: new Date('2026-10-12T09:00:00Z'),
          publishedById: base.user.id,
          publishedAt: new Date('2026-10-11T09:00:00Z'),
          publicationChecksum: `sha-${nextTag('pub')}`,
          currentVersionId: null,
        },
      });
    },
    isConstraintViolation,
    'publication chronology check',
  );

  await runRejects(
    '6) Duplicate curriculum version number is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_version');
      await createVersion(tx, base.curriculum.id, base.user.id, 'DRAFT', '1.0.0');
      await tx.curriculumVersion.create({
        data: {
          curriculumId: base.curriculum.id,
          versionNumber: '1.0.0',
          majorVersion: 1,
          minorVersion: 0,
          patchVersion: 0,
          versionLabel: 'v1.0.0-dup',
          status: 'DRAFT',
          snapshotData: { capture: 'full' },
          createdById: base.user.id,
          isCurrent: false,
          isPublished: false,
        },
      });
    },
    isUniqueViolation,
    'version number unique-constraint',
  );

  await runRejects(
    '7) Only one current editable version is permitted',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'editable_current');
      await createVersion(tx, base.curriculum.id, base.user.id, 'DRAFT', '1.0.0');
      await tx.curriculumVersion.create({
        data: {
          curriculumId: base.curriculum.id,
          versionNumber: '1.0.1',
          majorVersion: 1,
          minorVersion: 0,
          patchVersion: 1,
          versionLabel: 'v1.0.1',
          status: 'REVISION_REQUIRED',
          snapshotData: { capture: 'full' },
          createdById: base.user.id,
          isCurrent: true,
          isPublished: false,
        },
      });
    },
    isUniqueViolation,
    'current editable version partial unique-index',
  );

  await runRejects(
    '8) Published version requires immutable snapshot metadata',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'published_snapshot');
      await tx.curriculumVersion.create({
        data: {
          curriculumId: base.curriculum.id,
          versionNumber: '2.0.0',
          majorVersion: 2,
          minorVersion: 0,
          patchVersion: 0,
          versionLabel: 'v2.0.0',
          status: 'PUBLISHED',
          snapshotData: { capture: 'full' },
          snapshotChecksum: null,
          createdById: base.user.id,
          approvedById: base.user.id,
          approvedAt: new Date('2026-10-11T09:00:00Z'),
          publishedById: base.user.id,
          publishedAt: new Date('2026-10-12T09:00:00Z'),
          isCurrent: false,
          isPublished: true,
        },
      });
    },
    isConstraintViolation,
    'published snapshot metadata check',
  );

  await runRejects(
    '9) Duplicate unit sequence is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_unit_seq');
      await tx.curriculumUnit.create({
        data: { curriculumId: base.curriculum.id, title: 'Unit A', sequenceOrder: 1, createdById: base.user.id },
      });
      await tx.curriculumUnit.create({
        data: { curriculumId: base.curriculum.id, title: 'Unit B', sequenceOrder: 1, createdById: base.user.id },
      });
    },
    isUniqueViolation,
    'unit sequence unique-constraint',
  );

  await runRejects(
    '10) Duplicate topic sequence is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_topic_seq');
      const unit = await tx.curriculumUnit.create({
        data: { curriculumId: base.curriculum.id, title: 'Unit A', sequenceOrder: 1, createdById: base.user.id },
      });
      await tx.curriculumTopic.create({
        data: { curriculumUnitId: unit.id, title: 'Topic A', sequenceOrder: 1, createdById: base.user.id },
      });
      await tx.curriculumTopic.create({
        data: { curriculumUnitId: unit.id, title: 'Topic B', sequenceOrder: 1, createdById: base.user.id },
      });
    },
    isUniqueViolation,
    'topic sequence unique-constraint',
  );

  await runRejects(
    '11) Duplicate topic-concept link is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_topic_concept');
      const { topic } = await createUnitTopic(tx, base.curriculum.id, base.user.id);
      const concept = await tx.curriculumConcept.create({
        data: {
          curriculumId: base.curriculum.id,
          schoolId: base.school.id,
          name: 'Concept A',
          definition: 'Definition',
          createdById: base.user.id,
        },
      });
      await tx.curriculumTopicConcept.create({
        data: { curriculumTopicId: topic.id, curriculumConceptId: concept.id, createdById: base.user.id },
      });
      await tx.curriculumTopicConcept.create({
        data: { curriculumTopicId: topic.id, curriculumConceptId: concept.id, createdById: base.user.id },
      });
    },
    isUniqueViolation,
    'topic-concept unique-constraint',
  );

  await runRejects(
    '12) Duplicate topic-project link is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_topic_project');
      const { unit, topic } = await createUnitTopic(tx, base.curriculum.id, base.user.id);
      const project = await tx.curriculumProject.create({
        data: {
          curriculumUnitId: unit.id,
          title: 'Project A',
          description: 'Desc',
          sequenceOrder: 1,
          createdById: base.user.id,
        },
      });
      await tx.curriculumTopicProject.create({ data: { curriculumTopicId: topic.id, curriculumProjectId: project.id } });
      await tx.curriculumTopicProject.create({ data: { curriculumTopicId: topic.id, curriculumProjectId: project.id } });
    },
    isUniqueViolation,
    'topic-project unique-constraint',
  );

  await runRejects(
    '13) Duplicate project-implementation sequence is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_impl_seq');
      const { unit } = await createUnitTopic(tx, base.curriculum.id, base.user.id);
      const project = await tx.curriculumProject.create({
        data: {
          curriculumUnitId: unit.id,
          title: 'Project A',
          description: 'Desc',
          sequenceOrder: 1,
          createdById: base.user.id,
        },
      });
      await tx.curriculumProjectImplementation.create({
        data: {
          curriculumProjectId: project.id,
          title: 'Impl A',
          implementationType: 'SIMULATION_ONLY',
          description: 'Implementation',
          sequenceOrder: 1,
          createdById: base.user.id,
        },
      });
      await tx.curriculumProjectImplementation.create({
        data: {
          curriculumProjectId: project.id,
          title: 'Impl B',
          implementationType: 'SIMULATION_ONLY',
          description: 'Implementation',
          sequenceOrder: 1,
          createdById: base.user.id,
        },
      });
    },
    isUniqueViolation,
    'project implementation sequence unique-constraint',
  );

  await runRejects(
    '14) Duplicate topic-learning-outcome link is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_topic_lo');
      const { topic } = await createUnitTopic(tx, base.curriculum.id, base.user.id);
      const outcome = await tx.curriculumLearningOutcome.create({
        data: { curriculumId: base.curriculum.id, statement: 'Outcome A', createdById: base.user.id },
      });
      await tx.curriculumTopicLearningOutcome.create({
        data: { curriculumTopicId: topic.id, curriculumLearningOutcomeId: outcome.id },
      });
      await tx.curriculumTopicLearningOutcome.create({
        data: { curriculumTopicId: topic.id, curriculumLearningOutcomeId: outcome.id },
      });
    },
    isUniqueViolation,
    'topic-learning-outcome unique-constraint',
  );

  await runRejects(
    '15) Duplicate project-learning-outcome link is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_project_lo');
      const { unit } = await createUnitTopic(tx, base.curriculum.id, base.user.id);
      const project = await tx.curriculumProject.create({
        data: {
          curriculumUnitId: unit.id,
          title: 'Project A',
          description: 'Desc',
          sequenceOrder: 1,
          createdById: base.user.id,
        },
      });
      const outcome = await tx.curriculumLearningOutcome.create({
        data: { curriculumId: base.curriculum.id, statement: 'Outcome A', createdById: base.user.id },
      });
      await tx.curriculumProjectLearningOutcome.create({
        data: { curriculumProjectId: project.id, curriculumLearningOutcomeId: outcome.id },
      });
      await tx.curriculumProjectLearningOutcome.create({
        data: { curriculumProjectId: project.id, curriculumLearningOutcomeId: outcome.id },
      });
    },
    isUniqueViolation,
    'project-learning-outcome unique-constraint',
  );

  await runRejects(
    '16) Only one visibility setting per curriculum is allowed',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'visibility');
      await tx.curriculumVisibilitySetting.create({ data: { curriculumId: base.curriculum.id } });
      await tx.curriculumVisibilitySetting.create({ data: { curriculumId: base.curriculum.id } });
    },
    isUniqueViolation,
    'curriculum visibility unique-constraint',
  );

  await runRejects(
    '17) Duplicate active assignment in same scope is rejected',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'dup_assignment_scope');
      const version = await createVersion(tx, base.curriculum.id, base.user.id, 'PUBLISHED', '1.0.0');
      await tx.curriculum.update({
        where: { id: base.curriculum.id },
        data: {
          status: 'PUBLISHED',
          approvedById: base.user.id,
          approvedAt: new Date('2026-10-11T09:00:00Z'),
          publishedById: base.user.id,
          publishedAt: new Date('2026-10-12T09:00:00Z'),
          publicationChecksum: `sha-${nextTag('pub')}`,
          currentVersionId: version.id,
        },
      });

      const common = {
        schoolId: base.school.id,
        curriculumId: base.curriculum.id,
        curriculumVersionId: version.id,
        academicSessionId: base.scope.session.id,
        termId: base.scope.term.id,
        academicClassId: base.scope.academicClass.id,
        schoolProgrammeComponentId: base.schoolComponent.id,
        assignedById: base.user.id,
        effectiveFrom: new Date('2026-09-01'),
      };

      await tx.curriculumAssignment.create({ data: { ...common, status: 'ACTIVE' } });
      await tx.curriculumAssignment.create({ data: { ...common, status: 'PLANNED' } });
    },
    isUniqueViolation,
    'active assignment scope partial unique-index',
  );

  await runAllowsWithRollback('18) Historical completed or archived assignments remain possible', async (tx) => {
    const base = await createCurriculumBase(tx, 'historical_assignment');
    const version = await createVersion(tx, base.curriculum.id, base.user.id, 'PUBLISHED', '1.0.0');
    await tx.curriculum.update({
      where: { id: base.curriculum.id },
      data: {
        status: 'PUBLISHED',
        approvedById: base.user.id,
        approvedAt: new Date('2026-10-11T09:00:00Z'),
        publishedById: base.user.id,
        publishedAt: new Date('2026-10-12T09:00:00Z'),
        publicationChecksum: `sha-${nextTag('pub')}`,
        currentVersionId: version.id,
      },
    });

    const common = {
      schoolId: base.school.id,
      curriculumId: base.curriculum.id,
      curriculumVersionId: version.id,
      academicSessionId: base.scope.session.id,
      termId: base.scope.term.id,
      academicClassId: base.scope.academicClass.id,
      schoolProgrammeComponentId: base.schoolComponent.id,
      assignedById: base.user.id,
      effectiveFrom: new Date('2026-09-01'),
    };

    await tx.curriculumAssignment.create({ data: { ...common, status: 'ACTIVE' } });
    await tx.curriculumAssignment.create({
      data: {
        ...common,
        status: 'COMPLETED',
        completedAt: new Date('2026-12-12T12:00:00Z'),
        effectiveTo: new Date('2026-12-12'),
      },
    });
  });

  await runRejects(
    '19) Assignment version must belong to selected curriculum',
    async (tx) => {
      const a = await createCurriculumBase(tx, 'assign_mismatch_a');
      const b = await createCurriculumBase(tx, 'assign_mismatch_b');
      const versionA = await createVersion(tx, a.curriculum.id, a.user.id, 'PUBLISHED', '1.0.0');

      await tx.curriculumAssignment.create({
        data: {
          schoolId: b.school.id,
          curriculumId: b.curriculum.id,
          curriculumVersionId: versionA.id,
          academicSessionId: b.scope.session.id,
          termId: b.scope.term.id,
          academicClassId: b.scope.academicClass.id,
          schoolProgrammeComponentId: b.schoolComponent.id,
          assignedById: b.user.id,
          status: 'PLANNED',
          effectiveFrom: new Date('2026-09-01'),
        },
      });
    },
    isConstraintViolation,
    'assignment curriculum-version composite FK',
  );

  await runRejects(
    '20) Cross-school curriculum relationships are rejected',
    async (tx) => {
      const a = await createCurriculumBase(tx, 'cross_school_a');
      const b = await createCurriculumBase(tx, 'cross_school_b');
      await tx.curriculum.create({
        data: {
          schoolId: a.school.id,
          schoolProgrammeComponentId: b.schoolComponent.id,
          title: 'Cross-school invalid',
          code: `CS-${nextTag('bad')}`,
          createdById: a.user.id,
        },
      });
    },
    isConstraintViolation,
    'composite school FK isolation',
  );

  await runAllowsWithRollback('21) Review actions are retrievable; immutable edits remain service-controlled', async (tx) => {
    const base = await createCurriculumBase(tx, 'review_actions');
    const action = await tx.curriculumReviewAction.create({
      data: {
        curriculumId: base.curriculum.id,
        decision: 'COMMENTED',
        previousStatus: 'DRAFT',
        resultingStatus: 'UNDER_REVIEW',
        actorUserId: base.user.id,
        comment: 'Review trail test',
      },
    });

    const readBack = await tx.curriculumReviewAction.findUnique({ where: { id: action.id } });
    if (!readBack) {
      throw new Error('Review action not retrievable.');
    }

    record(
      '21a) Review action immutability note',
      true,
      'Retrievability verified. Strict immutability requires service-level write restrictions and audit policy.',
    );
  });

  await runRejects(
    '22) Published versions cannot be cascade-deleted with curriculum',
    async (tx) => {
      const base = await createCurriculumBase(tx, 'published_delete');
      const version = await createVersion(tx, base.curriculum.id, base.user.id, 'PUBLISHED', '1.0.0');
      await tx.curriculum.update({
        where: { id: base.curriculum.id },
        data: {
          status: 'PUBLISHED',
          approvedById: base.user.id,
          approvedAt: new Date('2026-10-11T09:00:00Z'),
          publishedById: base.user.id,
          publishedAt: new Date('2026-10-12T09:00:00Z'),
          publicationChecksum: `sha-${nextTag('pub')}`,
          currentVersionId: version.id,
        },
      });
      await tx.curriculum.delete({ where: { id: base.curriculum.id } });
    },
    isConstraintViolation,
    'restrict delete on published version relation',
  );

  await runAllowsWithRollback('23) Master-content links remain optional', async (tx) => {
    const base = await createCurriculumBase(tx, 'master_optional');
    const unit = await tx.curriculumUnit.create({
      data: {
        curriculumId: base.curriculum.id,
        title: 'Unit no master',
        sequenceOrder: 1,
        createdById: base.user.id,
      },
    });
    await tx.curriculumTopic.create({
      data: {
        curriculumUnitId: unit.id,
        title: 'Topic no master',
        sequenceOrder: 1,
        createdById: base.user.id,
      },
    });
  });

  await runAllowsWithRollback('24) Archived curriculum remains retrievable', async (tx) => {
    const base = await createCurriculumBase(tx, 'archived_retrieve');
    const archived = await tx.curriculum.update({
      where: { id: base.curriculum.id },
      data: {
        status: 'ARCHIVED',
        archivedById: base.user.id,
        archivedAt: new Date('2026-12-31T23:59:00Z'),
        archiveReason: 'Lifecycle completion',
      },
    });

    const readBack = await tx.curriculum.findUnique({ where: { id: archived.id } });
    if (!readBack || readBack.status !== 'ARCHIVED') {
      throw new Error('Archived curriculum retrieval failed.');
    }
  });

  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  console.log('\nPhase 2G Curriculum Constraint Verification Results\n');
  for (const result of results) {
    const badge = result.passed ? 'PASS' : 'FAIL';
    console.log(`[${badge}] ${result.name} :: ${result.details}`);
  }

  console.log(`\nTotals: ${passed} passed, ${failed} failed, ${results.length} total checks.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
};

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Phase 2G curriculum verification script failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
