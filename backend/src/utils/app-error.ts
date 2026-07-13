export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TENANT_SCOPE_VIOLATION'
  | 'LIFECYCLE_CONFLICT'
  | 'VERSION_CONFLICT'
  | 'DUPLICATE_ASSIGNMENT'
  | 'PUBLICATION_REQUIREMENT_FAILURE'
  | 'DATABASE_CONFLICT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly statusCode: number;

  readonly code: AppErrorCode;

  readonly details?: unknown;

  constructor(statusCode: number, code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown): AppError =>
  new AppError(400, 'VALIDATION_ERROR', message, details);

export const unauthorized = (message = 'Authentication required.'): AppError =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'You do not have permission for this action.'): AppError =>
  new AppError(403, 'FORBIDDEN', message);

export const notFound = (message: string): AppError => new AppError(404, 'NOT_FOUND', message);

export const lifecycleConflict = (message: string): AppError =>
  new AppError(409, 'LIFECYCLE_CONFLICT', message);

export const versionConflict = (message: string): AppError =>
  new AppError(409, 'VERSION_CONFLICT', message);

export const tenantScopeViolation = (message: string): AppError =>
  new AppError(403, 'TENANT_SCOPE_VIOLATION', message);

export const publicationRequirementFailure = (message: string): AppError =>
  new AppError(422, 'PUBLICATION_REQUIREMENT_FAILURE', message);

export const duplicateAssignment = (message: string): AppError =>
  new AppError(409, 'DUPLICATE_ASSIGNMENT', message);

export const databaseConflict = (message: string): AppError =>
  new AppError(409, 'DATABASE_CONFLICT', message);
