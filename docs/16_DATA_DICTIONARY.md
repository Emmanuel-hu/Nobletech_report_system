# Nobletech Education Management Platform (NEMP)

# System Architecture Specification

Version: 1.0

Document Status: Approved

Document Type: System Architecture Specification (SAS)

Project Owner: Nobletech Academy

Last Updated: July 2026

---

# Purpose

This document defines the overall technical architecture of the Nobletech Education Management Platform (NEMP).

It describes how every component of the platform communicates, how data flows through the system, and how the application will be deployed, secured, maintained, and expanded.

This document serves as the technical blueprint for software development.

---

# System Vision

The Nobletech Education Management Platform (NEMP) is a cloud-based, multi-tenant Software-as-a-Service (SaaS) platform designed to manage Coding, Robotics, ICT, STEAM, and future educational services for multiple schools from a single centralized system.

Each school operates independently while sharing the same secure platform.

The platform is designed for scalability, maintainability, security, and future expansion.

---

# Overall System Architecture

                        Internet
                            │
                            ▼
             www.nobletechacademy.com
               (WordPress Website)
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼                                     ▼
 Course Information                    School Portal
 Registration                           Login Button
                                               │
                                               ▼
                              app.nobletechacademy.com
                                               │
                ┌──────────────────────────────┴──────────────────────────────┐
                ▼                                                             ▼
        React Frontend                                            Authentication
                │                                                             │
                └──────────────────────────────┬──────────────────────────────┘
                                               ▼
                                    REST API (Node.js)
                                               │
                ┌──────────────┬───────────────┼──────────────┬───────────────┐
                ▼              ▼               ▼              ▼
         School Module   Student Module   Report Module   User Module
                │              │               │              │
                └──────────────┴───────────────┴──────────────┘
                                               │
                                               ▼
                                      Business Logic Layer
                                               │
                           ┌───────────────────┼───────────────────┐
                           ▼                   ▼                   ▼
                    PostgreSQL          File Storage         PDF Engine
                           │                   │                   │
                           └───────────────────┴───────────────────┘
                                               │
                                               ▼
                                    Download / Print Reports

---

# Deployment Architecture

The platform consists of two independent systems.

## Public Website

Purpose

Marketing website

Technology

WordPress

Domain

https://www.nobletechacademy.com

Responsibilities

- Home Page
- About Us
- Services
- Blog
- Contact
- Student Registration
- News
- SEO
- Redirect users to the Education Platform

---

## Education Management Platform

Purpose

School Management Application

Technology

React.js

Domain

https://app.nobletechacademy.com

Responsibilities

- Authentication
- School Management
- Student Management
- Teacher Management
- Assessment Management
- Report Generation
- Analytics
- Settings

---

## Backend API

Purpose

Business Logic

Technology

Node.js

Express.js

Recommended Domain

https://api.nobletechacademy.com

Responsibilities

- Authentication
- Database Access
- Business Rules
- Report Processing
- PDF Generation
- Notifications

---

## Database Server

Technology

PostgreSQL

Responsibilities

- Store all platform data
- Multi-school data isolation
- Secure backups
- High performance queries

---

## File Storage

Stores

- School Logos
- Student Photographs
- Principal Signatures
- Teacher Signatures
- School Stamps
- Generated Reports
- Uploaded Templates

---

# Architecture Style

The platform follows the following architectural patterns.

- Cloud Native
- Multi-Tenant SaaS
- Modular Architecture
- Layered Architecture
- REST API Architecture
- Component-Based Frontend
- Role-Based Access Control (RBAC)

---

# Technology Stack

## Frontend

- React.js
- TypeScript
- Tailwind CSS
- React Router
- React Query

---

## Backend

- Node.js
- Express.js

---

## Database

- PostgreSQL

---

## Authentication

- JWT
- Refresh Tokens
- Role-Based Access Control

---

## PDF Engine

Recommended Options

- React PDF
- PDFMake
- Puppeteer (for complex report rendering)

---

## File Storage

Cloud Storage

Examples

- AWS S3
- Cloudflare R2
- Hostinger Object Storage

---

## Hosting

Recommended

- Hostinger VPS
- DigitalOcean
- Microsoft Azure
- AWS

---

# Domain Structure

www.nobletechacademy.com

Public Website

----------------------------

app.nobletechacademy.com

Education Management Platform

----------------------------

api.nobletechacademy.com

Backend API

----------------------------

files.nobletechacademy.com

File Storage (Future)

----------------------------

status.nobletechacademy.com

System Status (Future)

---

# System Layers

Presentation Layer

- React Interface
- Forms
- Dashboards
- Reports

↓

Application Layer

- Business Logic
- Validation
- Authorization

↓

Service Layer

- PDF Engine
- Notifications
- Analytics

↓

Data Layer

- PostgreSQL
- File Storage

↓

Infrastructure Layer

- Hosting
- Monitoring
- Backup
- Security

---

# Core Modules

Version 1.0 includes

- Authentication
- School Management
- User Management
- Student Management
- Academic Structure
- Assessment Management
- Report Management
- Report Template Engine
- PDF Generation
- Dashboard
- Analytics
- Settings

---

# Data Flow

User

↓

Login

↓

Authentication

↓

Dashboard

↓

Module

↓

Business Logic

↓

Database

↓

Response

↓

Display Result

---

# Report Generation Flow

Teacher

↓

Enter Scores

↓

Save Draft

↓

Supervisor Review

↓

Approval

↓

Generate PDF

↓

Download

↓

Print

---

# Multi-Tenant Architecture

Each school operates independently.

Each school has its own:

- Users
- Students
- Teachers
- Branding
- Assessments
- Subjects
- Reports
- Templates
- Academic Sessions
- Analytics

No school can access another school's data.

---

# Security Architecture

The platform shall implement

- HTTPS
- JWT Authentication
- Password Hashing
- Refresh Tokens
- Role-Based Permissions
- Audit Logs
- Session Timeout
- Rate Limiting
- SQL Injection Prevention
- XSS Protection
- CSRF Protection
- Secure Headers

Future

- Multi-Factor Authentication (MFA)

---

# Backup Strategy

Automatic Daily Backup

↓

Encrypted Storage

↓

Restore Verification

↓

Disaster Recovery

---

# Performance Requirements

Dashboard

Less than 3 seconds

Report Generation

Less than 5 seconds

API Response

Less than 1 second

Scalable to support

- Unlimited Schools
- Unlimited Students
- Concurrent Users

---

# Scalability Strategy

The platform shall support:

- Horizontal Scaling
- Modular Expansion
- Cloud Deployment
- API Versioning
- Independent Feature Development

---

# Future Integrations

Google Classroom

Microsoft Teams

Google Drive

Microsoft OneDrive

Zoom

WhatsApp

SMS Gateway

Email Services

Payment Gateway

AI APIs

Microsoft 365

Google Workspace

---

# Artificial Intelligence Architecture (Future)

AI services may be used for:

- Teacher Comment Suggestions
- Principal Comment Suggestions
- Student Performance Analysis
- Academic Predictions
- Learning Recommendations
- Behaviour Analysis
- Intelligent Search
- Automated Report Insights

---

# Monitoring

Monitor

- Server Health
- Database Performance
- API Performance
- User Activity
- Error Logs
- Security Events
- PDF Generation Queue

---

# Design Principles

Every component of the platform must be:

- Secure
- Scalable
- Reliable
- Maintainable
- Modular
- Configurable
- Cloud-Based
- Responsive
- Extensible

---

# Acceptance Criteria

This architecture shall be considered complete when:

- All major components are defined.
- Deployment architecture is documented.
- Technology stack is approved.
- Security architecture is documented.
- Multi-tenant architecture is defined.
- Data flow is documented.
- Core modules are identified.
- Scalability strategy is documented.
- Future integrations are identified.

---

# Approval

Prepared By

Nobletech Academy

Software Architecture

ChatGPT

Project Owner

Nobletech Academy

Document Version

1.0

Status

Approved