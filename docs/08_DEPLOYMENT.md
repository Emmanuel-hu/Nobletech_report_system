# Nobletech Education Management Platform (NEMP)

# Development Guide

Version 1.0

---

# Purpose

This document defines the software development standards, coding practices, workflows, tools, and implementation strategy for the Nobletech Education Management Platform.

It serves as the guide for all developers and AI-assisted development tools such as GitHub Copilot.

---

# Development Methodology

The project follows a Design-First Development approach.

Every feature must be:

1. Analysed
2. Designed
3. Documented
4. Reviewed
5. Developed
6. Tested
7. Deployed
8. Monitored

---

# Technology Stack

Frontend

React.js

Backend

Node.js

Express.js

Database

PostgreSQL

Authentication

JWT

Storage

Cloud Storage

Version Control

Git

Repository

GitHub

IDE

Visual Studio Code

AI Assistant

GitHub Copilot

---

# Coding Standards

- Write clean and readable code.
- Use meaningful variable names.
- Follow SOLID principles.
- Avoid duplicate code.
- Use reusable components.
- Comment only where necessary.
- Use TypeScript where applicable.

---

# Folder Structure

frontend/

backend/

database/

docs/

shared/

uploads/

Phase 2L deployment note:

- Local-development storage for curriculum source files now defaults to `uploads/` under repo root and must remain git-ignored.
- Production deployment must provide a writable storage root or compatible provider configuration before source-file ingestion is enabled outside local development.

tests/

scripts/

---

# Git Workflow

Feature Branch

↓

Development

↓

Code Review

↓

Testing

↓

Main Branch

---

# Branch Naming Convention

feature/

bugfix/

hotfix/

release/

---

# Commit Message Convention

feat:

fix:

refactor:

docs:

style:

test:

build:

chore:

Examples

feat: add school management module

fix: resolve PDF layout issue

docs: update database design

---

# GitHub Copilot Workflow

1. Review documentation.

2. Read module specification.

3. Generate frontend code.

4. Generate backend code.

5. Generate API.

6. Generate database migration.

7. Review generated code.

8. Test.

9. Commit.

---

# Code Review Checklist

Code follows standards

No duplicate code

Proper error handling

Security considered

Validation implemented

Responsive UI

Reusable components

Proper API responses

---

# Development Principles

Never hardcode school data.

Everything configurable.

Every school isolated.

Always validate user input.

Log important actions.

Secure every endpoint.

Generate reports from data, not static PDFs.

---

# Definition of Done

A feature is complete only when:

Business rules implemented.

Database completed.

API completed.

UI completed.

Testing passed.

Documentation updated.

Reviewed.

Approved.

Merged.

---

# Future Improvements

Continuous Integration (CI)

Continuous Deployment (CD)

Automated Testing

Docker Support

Kubernetes Deployment

AI-Assisted Code Review