# Contributing to Nobletech Education Management Platform (NEMP)

First of all, thank you for your interest in contributing to the **Nobletech Education Management Platform (NEMP)**.

This document outlines the standards, workflow, and expectations for contributing to the project.

Our goal is to maintain a clean, secure, scalable, and enterprise-grade codebase while ensuring consistency across all development activities.

---

# Project Overview

NEMP is an enterprise-level Education Management Platform designed to support:

- School Administration
- Student Management
- Teacher Management
- Curriculum Management
- Coding & Robotics Education
- Assessment Management
- Computer-Based Testing (CBT)
- Report Generation
- Portfolio Management
- File Management
- Analytics
- Artificial Intelligence Integration

The project follows modern software engineering principles and industry best practices.

---

# Development Principles

Every contribution should follow these principles:

- Simplicity
- Readability
- Scalability
- Maintainability
- Security
- Performance
- Consistency
- Documentation First
- Test Before Merge

---

# Before You Contribute

Before writing code:

- Read the project documentation.
- Understand the database architecture.
- Review the system blueprint.
- Review the coding standards.
- Review the development roadmap.
- Ensure your work aligns with the approved architecture.

---

# Development Workflow

Every new feature should follow this process:

```text
Requirement

↓

Design

↓

Implementation

↓

Testing

↓

Code Review

↓

Approval

↓

Merge
```

No code should be merged directly into the main branch.

---

# Branch Strategy

Use descriptive branch names.

Examples:

```text
feature/student-management

feature/report-engine

feature/cbt-module

feature/file-storage

feature/authentication

bugfix/report-pdf

hotfix/login

refactor/api-validation

docs/database-update
```

---

# Commit Message Format

Commit messages should clearly describe the purpose of the change.

Examples:

```text
feat: add student management module

feat: implement JWT authentication

fix: correct report calculation logic

fix: resolve attendance validation issue

docs: update PostgreSQL schema documentation

refactor: improve curriculum service structure

test: add assessment API tests
```

Avoid vague commit messages such as:

```text
update

changes

fix

done

work
```

---

# Coding Standards

All code must follow the project's coding standards.

Requirements include:

- Meaningful variable names
- Small reusable functions
- Proper folder organization
- Consistent formatting
- Proper error handling
- Clear documentation
- No duplicated logic
- No unused code

---

# Database Standards

Database changes must:

- Use PostgreSQL.
- Follow the approved schema.
- Use migration files.
- Preserve referential integrity.
- Avoid breaking existing data.
- Include rollback support where practical.

Direct database changes outside migrations are not permitted.

---

# API Standards

All APIs should:

- Follow REST principles.
- Validate requests.
- Return consistent responses.
- Use appropriate HTTP status codes.
- Include authentication where required.
- Support pagination when necessary.
- Return meaningful error messages.

---

# Frontend Standards

Frontend contributions should:

- Use reusable components.
- Follow approved UI/UX guidelines.
- Be responsive.
- Support accessibility.
- Avoid unnecessary duplication.
- Keep business logic out of presentation components.

---

# Security Requirements

All contributors must consider security.

Examples include:

- Validate all inputs.
- Protect against SQL injection.
- Protect against XSS.
- Protect against CSRF where applicable.
- Never expose secrets.
- Never commit API keys.
- Never commit passwords.
- Never commit production credentials.

---

# Testing Requirements

Every new feature should include appropriate testing.

Testing may include:

- Unit Tests
- Integration Tests
- API Tests
- End-to-End Tests
- Manual Verification

Bug fixes should include regression testing where appropriate.

---

# Documentation Requirements

Documentation should be updated whenever changes affect:

- Database
- API
- Authentication
- User Interface
- Business Rules
- Configuration
- Deployment

Documentation is considered part of the feature.

---

# Pull Request Guidelines

Before submitting a pull request, ensure:

- The project builds successfully.
- Tests pass.
- Documentation is updated.
- No unnecessary files are included.
- No secrets are committed.
- Code follows project standards.

Each pull request should include:

- Summary of changes
- Reason for the change
- Testing performed
- Screenshots (if applicable)
- Related issue (if applicable)

---

# Code Review Process

Every contribution should be reviewed before merging.

Reviewers will verify:

- Code quality
- Architecture compliance
- Performance
- Security
- Maintainability
- Documentation
- Testing

Changes may be requested before approval.

---

# Reporting Issues

When reporting an issue, include:

- Clear description
- Expected behaviour
- Actual behaviour
- Steps to reproduce
- Environment information
- Screenshots or logs where applicable

---

# Feature Requests

Feature requests should include:

- Problem statement
- Proposed solution
- Expected benefits
- Possible implementation approach

New features should align with the project's architecture and objectives.

---

# Communication

Contributors should maintain respectful and professional communication.

Constructive feedback is encouraged.

Discussions should focus on improving the project.

---

# Code of Conduct

All contributors are expected to follow the project's Code of Conduct.

Professionalism, respect, collaboration, and integrity are expected at all times.

---

# License

By contributing to this project, you agree that your contributions will be governed by the project's license.

---

# Acknowledgement

Thank you for contributing to the **Nobletech Education Management Platform (NEMP)**.

Your contributions help improve an enterprise platform designed to enhance digital education, coding, robotics, STEAM learning, and school management.

---

**End of Contributing Guide**