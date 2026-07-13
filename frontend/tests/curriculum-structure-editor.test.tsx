import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { curriculumClient } from '../src/api/curriculumClient';
import { CurriculumStructurePage } from '../src/pages/admin/curricula/CurriculumStructurePage';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import type { CurriculumDetail, CurriculumEditorLookups } from '../src/types/curriculum';
import type { AuthSession } from '../src/types/auth';
import { ApiClientError } from '../src/types/api';

vi.mock('../src/api/curriculumClient', () => ({
  curriculumClient: {
    getCurriculum: vi.fn(),
    getEditorLookups: vi.fn(),
    createTopic: vi.fn(),
    updateTopic: vi.fn(),
    deleteTopic: vi.fn(),
    reorderTopics: vi.fn(),
    addTopicConcept: vi.fn(),
    updateTopicConcept: vi.fn(),
    deleteTopicConcept: vi.fn(),
    createConcept: vi.fn(),
    updateConcept: vi.fn(),
    deleteConcept: vi.fn(),
    reorderTopicConcepts: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    linkProjectTopic: vi.fn(),
    deleteProjectTopicLink: vi.fn(),
    createProjectImplementation: vi.fn(),
    updateProjectImplementation: vi.fn(),
    deleteProjectImplementation: vi.fn(),
    reorderProjectImplementations: vi.fn(),
    createLearningOutcome: vi.fn(),
    updateLearningOutcome: vi.fn(),
    deleteLearningOutcome: vi.fn(),
    linkTopicOutcome: vi.fn(),
    linkProjectOutcome: vi.fn(),
    deleteTopicOutcomeLink: vi.fn(),
    deleteProjectOutcomeLink: vi.fn(),
    createResource: vi.fn(),
    updateResource: vi.fn(),
    deleteResource: vi.fn(),
    updateVisibility: vi.fn(),
  },
}));

const baseRecord: CurriculumDetail = {
  id: 'curr-1',
  title: 'Robotics Curriculum',
  code: 'ROB-1',
  description: 'Description',
  schoolId: 'school-1',
  schoolProgrammeComponentId: 'spc-1',
  status: 'DRAFT',
  currentVersionId: 'version-1',
  currentVersionNumber: '1.0.0',
  publicationChecksum: null,
  createdById: 'user-1',
  updatedAt: '2026-07-13T10:00:00.000Z',
  publishedAt: null,
  submittedAt: null,
  approvedAt: null,
  submittedById: null,
  approvedById: null,
  publishedById: null,
  units: [
    {
      id: 'unit-1',
      title: 'Unit One',
      code: 'U1',
      description: 'Unit one',
      sequenceOrder: 1,
      estimatedWeeks: 5,
      updatedAt: '2026-07-13T10:00:00.000Z',
      topics: [
        {
          id: 'topic-1',
          title: 'Topic One',
          code: 'T1',
          description: 'Topic description',
          sequenceOrder: 1,
          weekNumber: 1,
          recommendedDurationMinutes: 45,
          difficultyLevel: 'MEDIUM',
          teacherNote: 'Teacher note',
          updatedAt: '2026-07-13T10:00:00.000Z',
          masterTopicId: null,
          conceptLinks: [
            {
              id: 'mapping-1',
              curriculumConceptId: null,
              masterConceptId: 'master-concept-1',
              sequenceOrder: 1,
              teacherNote: null,
              importanceLevel: 'HIGH',
              expectedDepth: 'APPLY',
              instructionalEmphasis: 'PRACTICE',
              isCore: true,
              assessmentRelevance: 'HIGH',
              updatedAt: '2026-07-13T10:00:00.000Z',
            },
          ],
          topicProjects: [],
          topicLearningOutcomes: [],
        },
      ],
      projects: [
        {
          id: 'project-1',
          title: 'Project One',
          description: 'Project description',
          sequenceOrder: 1,
          objective: 'Objective',
          expectedOutput: 'Output',
          estimatedDurationMinutes: 120,
          difficultyLevel: 'MEDIUM',
          safetyNote: 'Safety',
          updatedAt: '2026-07-13T10:00:00.000Z',
          implementations: [
            {
              id: 'impl-1',
              title: 'Group build',
              implementationType: 'GROUP',
              description: 'Implementation',
              sequenceOrder: 1,
              estimatedDurationMinutes: 60,
              requiredInternet: false,
              requiredDeviceCount: 10,
              learnerInstructions: null,
              teacherInstructions: null,
              safetyInstructions: null,
              updatedAt: '2026-07-13T10:00:00.000Z',
            },
          ],
          topicLinks: [],
          projectLearningOutcomes: [],
        },
      ],
    },
  ],
  concepts: [
    {
      id: 'concept-1',
      name: 'Operational Concept',
      code: 'OC-1',
      definition: 'Definition',
      explanation: null,
      masterConceptId: null,
      updatedAt: '2026-07-13T10:00:00.000Z',
    },
  ],
  learningOutcomes: [
    {
      id: 'outcome-1',
      statement: 'Learner can debug',
      code: 'LO-1',
      bloomLevel: 'APPLY',
      measurableVerb: 'debug',
      masterLearningOutcomeId: null,
      updatedAt: '2026-07-13T10:00:00.000Z',
    },
  ],
  resources: [
    {
      id: 'resource-1',
      curriculumTopicId: 'topic-1',
      title: 'Starter kit',
      description: 'Resource',
      resourceType: 'KIT',
      quantityRequired: '1',
      requiresInternet: false,
      requiresLogin: false,
      safetyNote: null,
      masterResourceId: null,
      externalUrl: null,
      internalFileReference: null,
      updatedAt: '2026-07-13T10:00:00.000Z',
    },
  ],
  versions: [],
  assignments: [],
  reviewActions: [],
  statusHistory: [],
  visibilitySetting: {
    showProgrammeComponents: true,
    showTools: true,
    showResources: true,
    showProjects: true,
    showLearningOutcomes: true,
    showTeacherNotes: true,
    showStudentNotes: true,
    visibleToTeachers: true,
    visibleToLearners: false,
    visibleToGuardians: false,
    updatedAt: '2026-07-13T10:00:00.000Z',
  },
};

const lookups: CurriculumEditorLookups = {
  sessions: [],
  terms: [],
  academicClasses: [],
  schoolProgrammeComponents: [],
  teachers: [],
  publishedVersions: [],
  masterConcepts: [
    {
      id: 'master-concept-1',
      schoolId: null,
      name: 'Motion',
      code: 'M-1',
      definition: 'Master concept definition',
    },
  ],
  masterLearningOutcomes: [
    {
      id: 'master-outcome-1',
      schoolId: null,
      statement: 'Design a simulation',
      code: 'MLO-1',
      bloomLevel: 'CREATE',
      measurableVerb: 'design',
    },
  ],
  masterResources: [
    {
      id: 'master-resource-1',
      schoolId: null,
      title: 'Simulation app',
      description: 'Master resource',
      resourceType: 'SOFTWARE',
    },
  ],
  curriculum: {
    id: 'curr-1',
    schoolProgrammeComponentId: 'spc-1',
    status: 'DRAFT',
  },
};

const renderPage = (session?: AuthSession) => {
  return render(
    <MemoryRouter initialEntries={['/admin/curricula/curr-1/structure']}>
      <AuthProvider
        initialSession={
          session ?? {
            userId: 'user-1',
            schoolId: 'school-1',
            permissions: ['curriculum.view', 'curriculum.edit', 'curriculum.reorder'],
          }
        }
      >
        <NotificationProvider>
          <Routes>
            <Route path="/admin/curricula/:curriculumId/structure" element={<CurriculumStructurePage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
};

describe('CurriculumStructurePage workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(curriculumClient.getCurriculum).mockResolvedValue(structuredClone(baseRecord));
    vi.mocked(curriculumClient.getEditorLookups).mockResolvedValue(structuredClone(lookups));

    const mutators = [
      curriculumClient.createTopic,
      curriculumClient.updateTopic,
      curriculumClient.deleteTopic,
      curriculumClient.reorderTopics,
      curriculumClient.addTopicConcept,
      curriculumClient.updateTopicConcept,
      curriculumClient.deleteTopicConcept,
      curriculumClient.createConcept,
      curriculumClient.updateConcept,
      curriculumClient.deleteConcept,
      curriculumClient.reorderTopicConcepts,
      curriculumClient.createProject,
      curriculumClient.updateProject,
      curriculumClient.deleteProject,
      curriculumClient.linkProjectTopic,
      curriculumClient.deleteProjectTopicLink,
      curriculumClient.createProjectImplementation,
      curriculumClient.updateProjectImplementation,
      curriculumClient.deleteProjectImplementation,
      curriculumClient.reorderProjectImplementations,
      curriculumClient.createLearningOutcome,
      curriculumClient.updateLearningOutcome,
      curriculumClient.deleteLearningOutcome,
      curriculumClient.linkTopicOutcome,
      curriculumClient.linkProjectOutcome,
      curriculumClient.deleteTopicOutcomeLink,
      curriculumClient.deleteProjectOutcomeLink,
      curriculumClient.createResource,
      curriculumClient.updateResource,
      curriculumClient.deleteResource,
      curriculumClient.updateVisibility,
    ];

    mutators.forEach((method) => {
      vi.mocked(method).mockResolvedValue(structuredClone(baseRecord));
    });
  });

  it('creates topics with full payload fields', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Curriculum structure editor');

    await user.type(screen.getAllByLabelText('Topic title')[0], 'New Topic');
    await user.type(screen.getAllByLabelText('Topic code')[0], 'NT-1');
    await user.type(screen.getAllByLabelText('Week number')[0], '3');
    await user.type(screen.getAllByLabelText('Duration (minutes)')[0], '90');
    await user.type(screen.getAllByLabelText('Difficulty')[0], 'EASY');
    await user.type(screen.getAllByLabelText('Teacher note')[0], 'Note');
    await user.click(screen.getByRole('button', { name: 'Create topic' }));

    await waitFor(() => expect(curriculumClient.createTopic).toHaveBeenCalled());
  });

  it('blocks structural actions in immutable lifecycle states', async () => {
    vi.mocked(curriculumClient.getCurriculum).mockResolvedValue({
      ...structuredClone(baseRecord),
      status: 'PUBLISHED',
    });

    renderPage();

    await screen.findByText('Read-only lifecycle state');
    expect(screen.getByRole('button', { name: 'Create topic' })).toBeDisabled();
  });

  it('blocks edit actions when curriculum.edit permission is absent', async () => {
    renderPage({ userId: 'user-1', schoolId: 'school-1', permissions: ['curriculum.view'] });

    await screen.findByText('Permission denied');
    expect(screen.getByRole('button', { name: 'Create topic' })).toBeDisabled();
  });

  it('links master concept and updates mappings', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Master concept search and linking');

    await user.selectOptions(screen.getByLabelText('Approved master concept'), 'master-concept-1');
    await user.click(screen.getByRole('button', { name: 'Link master concept' }));

    await waitFor(() => expect(curriculumClient.addTopicConcept).toHaveBeenCalled());

    await user.click(screen.getAllByRole('button', { name: 'Update mapping' })[0]);
    await waitFor(() => expect(curriculumClient.updateTopicConcept).toHaveBeenCalled());
  });

  it('creates project implementations and supports reordering', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Project implementations (1)');

    await user.type(screen.getAllByLabelText('Title')[2], 'Implementation B');
    await user.click(screen.getByRole('button', { name: 'Create implementation' }));
    await waitFor(() => expect(curriculumClient.createProjectImplementation).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Move implementation down' }));
    await waitFor(() => expect(curriculumClient.reorderProjectImplementations).toHaveBeenCalled());
  });

  it('creates outcomes and prevents duplicate topic mapping requests', async () => {
    const user = userEvent.setup();
    const duplicateRecord: CurriculumDetail = structuredClone(baseRecord);
    duplicateRecord.units[0]!.topics[0]!.topicLearningOutcomes = [
      {
        id: 'tol-1',
        curriculumTopicId: 'topic-1',
        curriculumLearningOutcomeId: 'outcome-1',
        sequenceOrder: 1,
      },
    ];
    vi.mocked(curriculumClient.getCurriculum).mockResolvedValue(duplicateRecord);

    renderPage();

    await screen.findByText('Learning outcomes and mappings');

    await user.selectOptions(screen.getAllByLabelText('Link to topic')[0], 'topic-1');
    await user.click(screen.getAllByRole('button', { name: 'Link topic' })[0]);

    expect(curriculumClient.linkTopicOutcome).not.toHaveBeenCalled();
  });

  it('creates resources and updates visibility with concurrency token', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Curriculum resources');

    const resourceSection = screen.getByText('Curriculum resources').closest('article');
    expect(resourceSection).toBeTruthy();
    await user.type(within(resourceSection as HTMLElement).getAllByLabelText('Title')[0], 'Laptop');
    await user.click(screen.getByRole('button', { name: 'Create resource' }));
    await waitFor(() => expect(curriculumClient.createResource).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Save visibility settings' }));
    await waitFor(() => expect(curriculumClient.updateVisibility).toHaveBeenCalled());
  });

  it('shows dedicated concurrency conflict state for stale updates', async () => {
    const user = userEvent.setup();
    vi.mocked(curriculumClient.updateTopic).mockRejectedValue(
      new ApiClientError(409, 'VERSION_CONFLICT', 'Curriculum draft has changed since last read.'),
    );

    renderPage();

    await screen.findByText('Curriculum structure editor');
    await user.click(screen.getAllByRole('button', { name: 'Update topic' })[0]);

    expect(await screen.findByText('Concurrency conflict')).toBeInTheDocument();
  });
});
