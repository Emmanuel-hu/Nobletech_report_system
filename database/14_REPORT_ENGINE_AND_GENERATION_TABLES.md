# Nobletech Education Management Platform (NEMP)

# 14_REPORT_ENGINE_AND_GENERATION_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Report Engine & Generation Tables (Report Publishing Engine) |
| Document Code | NEMP-DB-REP-014 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Report Publishing Engine is responsible for assembling, validating, approving, generating, publishing, distributing, verifying, archiving, and preserving all official student reports within the Nobletech Education Management Platform (NEMP).

Unlike conventional school management systems that generate PDF reports directly from examination scores, the NEMP Report Publishing Engine consolidates validated information from multiple operational modules to produce a comprehensive, secure, and verifiable academic report.

The Report Publishing Engine integrates data from:

- Student Records
- Curriculum Engine
- Assessment Engine
- Attendance Management
- Psychomotor Assessment
- Affective Domain Assessment
- Programme Components
- Projects
- Learning Outcomes
- Student Portfolio
- Achievement System
- Certificate Engine
- Teacher Remarks
- Supervisor Review
- Principal Remarks
- School Branding

The engine supports the generation of:

- Nursery Reports
- Primary Reports
- Secondary Reports
- Coding Reports
- Robotics Reports
- STEAM Reports
- Artificial Intelligence Reports
- Python Reports
- Summer Camp Reports
- Bootcamp Reports
- Graduation Reports
- Future Programme Reports

Every generated report is version-controlled, digitally verifiable, permanently archived, and suitable for printing, online access, and future validation.

---

# Objectives

The Report Publishing Engine is designed to:

- Assemble validated report data.
- Generate standardized academic reports.
- Support multiple report templates.
- Support school-specific branding.
- Support configurable report layouts.
- Validate report completeness before publication.
- Support report approval workflows.
- Generate secure PDF reports.
- Create immutable report snapshots.
- Support report versioning.
- Support QR Code and digital verification.
- Archive published reports.
- Distribute reports securely.
- Maintain complete audit trails.
- Supply report analytics.
- Support future report formats without database redesign.

---

# Report Publishing Pipeline

```text
Student

↓

Assessment Results

↓

Attendance

↓

Psychomotor Assessment

↓

Affective Domain Assessment

↓

Curriculum

↓

Projects

↓

Learning Outcomes

↓

Student Portfolio

↓

Achievements

↓

Certificates

↓

Teacher Comment

↓

Supervisor Comment

↓

Principal Comment

↓

School Branding

↓

Report Builder

↓

Validation

↓

Approval Workflow

↓

Snapshot Creation

↓

PDF Generation

↓

Verification

↓

Distribution

↓

Archive

↓

Analytics
```

---

# Operational Report Tables

The Report Publishing Engine consists of the following operational tables:

1. reports
2. report_builders
3. report_snapshots
4. report_generation_jobs
5. report_versions
6. report_approvals
7. generated_pdfs
8. report_archives
9. report_verifications
10. report_distribution
11. report_download_history
12. report_generation_logs
13. report_generation_queue
14. report_templates_cache

---

# Table: reports

## Purpose

Represents the official report record generated for a student during a specific academic session and term.

A Report serves as the primary publishing record and references the template, student, portfolio, and report generation process.

Each Report belongs to one:

- School
- Academic Session
- Academic Term
- Student
- Report Template

Reports may represent different reporting categories including:

- Term Report
- Mid-Term Report
- Coding Report
- Robotics Report
- Summer Camp Report
- Bootcamp Report
- Graduation Report

---

## Columns

| Column | Type |
|---------|------|
| report_id | UUID |
| school_id | UUID |
| session_id | UUID |
| term_id | UUID |
| class_id | UUID |
| student_id | UUID |
| student_portfolio_id | UUID NULL |
| report_template_id | UUID |
| report_type | VARCHAR(100) |
| report_number | VARCHAR(100) |
| generated_from_snapshot | BOOLEAN |
| report_status | ENUM (Draft, Under Review, Approved, Published, Archived) |
| generated_by | UUID |
| published_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Report belongs to one Student.
- Every Report belongs to one Academic Session.
- Every Report belongs to one Academic Term.
- Every Report references one Report Template.
- Reports may optionally reference the Student Portfolio.
- Published Reports become read-only.
- Every published Report generates an immutable Snapshot.

---

# Table: report_builders

## Purpose

Stores the fully assembled report dataset before report publication.

The Report Builder consolidates validated information from all operational modules into a structured dataset that can be rendered into multiple output formats without recalculating data.

Supported Outputs include:

- PDF
- HTML
- Excel (Future)
- Microsoft Word (Future)
- JSON API
- Mobile Report View

---

## Columns

| Column | Type |
|---------|------|
| report_builder_id | UUID |
| report_id | UUID |
| report_data | JSONB |
| validation_status | BOOLEAN |
| validation_errors | JSONB |
| assembly_duration | INTEGER |
| builder_version | VARCHAR(20) |
| assembled_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Report has one active Builder record.
- Report Data is assembled only from validated operational data.
- Validation must succeed before approval begins.
- Builder output may be reused for multiple report formats.
- Builder Version supports future rendering improvements without altering historical reports.

---

# Table: report_snapshots

## Purpose

Stores immutable snapshots of every published report.

A Report Snapshot preserves the exact report data that was published at a specific point in time.

Snapshots ensure that historical reports remain unchanged even if student records, assessments, curriculum, or report templates are modified later.

Snapshots serve as the legal and historical record of every published report.

---

## Columns

| Column | Type |
|---------|------|
| report_snapshot_id | UUID |
| report_id | UUID |
| snapshot_version | VARCHAR(20) |
| snapshot_reason | VARCHAR(200) |
| snapshot_json | JSONB |
| checksum | VARCHAR(255) |
| created_by | UUID |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Published Report generates one immutable Snapshot.
- Snapshots cannot be modified after creation.
- Corrections create new Snapshots rather than editing existing ones.
- Snapshot Checksums verify data integrity.
- Historical reports always reference their original Snapshot.

---

# Table: report_generation_jobs

## Purpose

Tracks report generation requests submitted to the Report Publishing Engine.

Generation Jobs support large-scale processing without affecting normal platform performance.

Supported Generation Types include:

- Single Student
- Class
- Multiple Classes
- Entire School
- Batch Processing

Generation Jobs are processed asynchronously through the Report Generation Queue.

---

## Columns

| Column | Type |
|---------|------|
| report_generation_job_id | UUID |
| school_id | UUID |
| initiated_by | UUID |
| generation_type | ENUM (Single, Class, School, Batch) |
| priority | ENUM (Low, Normal, High, Critical) |
| total_reports | INTEGER |
| completed_reports | INTEGER |
| failed_reports | INTEGER |
| retry_count | INTEGER |
| server_node | VARCHAR(100) |
| status | ENUM (Pending, Running, Completed, Failed, Cancelled) |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Jobs are processed through the Generation Queue.
- Failed Jobs may be retried automatically.
- Priority determines execution order.
- Generation statistics are updated in real time.
- Completed Jobs remain available for auditing.

---

# Table: report_versions

## Purpose

Maintains the version history of every Report.

Whenever corrections are required after publication, a new Report Version is created while preserving previous published copies.

Examples

Version 1

↓

Corrected Copy

↓

Version 2

↓

Final Copy

↓

Archived

---

## Columns

| Column | Type |
|---------|------|
| report_version_id | UUID |
| report_id | UUID |
| version_number | VARCHAR(20) |
| reason_for_change | TEXT |
| published | BOOLEAN |
| published_at | TIMESTAMP NULL |
| created_by | UUID |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Report supports Version Control.
- Published Versions are read-only.
- Previous Versions remain permanently available.
- Reports always reference the latest Published Version unless historical retrieval is requested.

---

# Table: report_approvals

## Purpose

Records the approval workflow for Report publication.

Reports must successfully complete the configured approval workflow before publication.

---

## Approval Workflow

Teacher

↓

Supervisor

↓

School Administrator

↓

Principal

↓

Published

---

## Columns

| Column | Type |
|---------|------|
| report_approval_id | UUID |
| report_id | UUID |
| approval_level | VARCHAR(100) |
| approved_by | UUID |
| approval_status | ENUM (Pending, Approved, Rejected) |
| remarks | TEXT |
| approved_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Reports cannot be published until all required approvals are completed.
- Approval workflows are configurable by school.
- Every approval action is permanently recorded.
- Rejected Reports return to Draft status for correction.
- Approval History remains immutable.

---

# Table: generated_pdfs

## Purpose

Stores metadata for every PDF generated by the Report Publishing Engine.

The actual PDF file is stored in the configured cloud storage service, while this table maintains the metadata required for retrieval, verification, auditing, and regeneration.

The PDF Engine supports:

- A4 Paper
- Letter Paper
- Portrait Layout
- Landscape Layout
- Compact Reports
- Detailed Reports
- Single-page Reports
- Multi-page Reports
- High Resolution PDFs
- Compressed PDFs

---

## Columns

| Column | Type |
|---------|------|
| generated_pdf_id | UUID |
| report_id | UUID |
| report_snapshot_id | UUID |
| file_name | VARCHAR(255) |
| file_url | TEXT |
| file_size | BIGINT |
| page_count | INTEGER |
| paper_size | VARCHAR(20) |
| orientation | VARCHAR(20) |
| pdf_version | VARCHAR(20) |
| compression_level | VARCHAR(50) |
| checksum | VARCHAR(255) |
| generated_by | UUID |
| generated_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Published Report shall generate at least one PDF.
- PDFs are generated from immutable Report Snapshots.
- PDF Checksums verify file integrity.
- Multiple PDF formats may exist for the same Report.
- PDF metadata remains permanently available for auditing.

---

# Table: report_archives

## Purpose

Stores archival information for published reports.

Archiving preserves historical reports while reducing operational workload on the live database.

Archived reports remain searchable and retrievable according to school retention policies.

---

## Columns

| Column | Type |
|---------|------|
| report_archive_id | UUID |
| report_id | UUID |
| archive_reason | VARCHAR(200) |
| retention_until | DATE NULL |
| archived_by | UUID |
| archived_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Only Published Reports may be archived.
- Archived Reports remain immutable.
- Schools define their own retention periods.
- Archived Reports remain available for historical retrieval.
- Archiving never deletes report data.

---

# Table: report_verifications

## Purpose

Provides digital verification and authenticity checking for every published report.

Each published report receives unique verification credentials that allow parents, schools, employers, universities, and external organizations to verify report authenticity.

Supported Verification Methods

- Verification Code
- QR Code
- Barcode
- Secure Verification Hash
- Digital Signature
- Online Verification Portal

---

## Columns

| Column | Type |
|---------|------|
| report_verification_id | UUID |
| report_id | UUID |
| verification_code | VARCHAR(120) |
| qr_code | TEXT |
| barcode | TEXT |
| verification_hash | VARCHAR(255) |
| digital_signature | TEXT |
| verification_url | TEXT |
| verification_status | BOOLEAN |
| verification_attempts | INTEGER |
| verified_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Published Report receives a Verification Record.
- Verification Codes must be unique.
- Verification Hashes protect against tampering.
- QR Codes link directly to the Online Verification Portal.
- Verification Attempts are recorded for auditing.
- Digital Signatures support future electronic signature standards.

---

# Table: report_distribution

## Purpose

Tracks every report delivery made by the platform.

The Distribution Engine supports multiple delivery channels while maintaining complete delivery history.

Supported Delivery Channels

- Parent Portal
- Student Portal
- Email
- SMS Notification (Future)
- WhatsApp (Future)
- Mobile Application (Future)
- Secure Download Link

---

## Columns

| Column | Type |
|---------|------|
| report_distribution_id | UUID |
| report_id | UUID |
| delivery_method | VARCHAR(100) |
| recipient | VARCHAR(255) |
| delivery_reference | VARCHAR(255) |
| delivery_status | ENUM (Pending, Delivered, Failed, Expired) |
| read_status | BOOLEAN |
| opened_at | TIMESTAMP NULL |
| delivered_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Reports may be distributed through multiple channels.
- Delivery attempts shall be recorded.
- Read Status is updated when supported by the delivery channel.
- Distribution records remain permanently available.
- Distribution supports future notification services.

---

# Table: report_download_history

## Purpose

Maintains a complete audit trail of every report download performed within the platform.

This table records who downloaded a report, when it was downloaded, from which device, and through which channel.

Download History supports:

- Security Auditing
- Usage Analytics
- Parent Portal Monitoring
- Student Portal Monitoring
- Compliance Reporting

---

## Columns

| Column | Type |
|---------|------|
| report_download_history_id | UUID |
| report_id | UUID |
| downloaded_by | UUID |
| download_source | VARCHAR(100) |
| ip_address | VARCHAR(100) |
| browser | VARCHAR(150) |
| device_information | TEXT |
| downloaded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every download shall be recorded.
- Download History supports security auditing.
- Download records remain immutable.
- Download statistics support Analytics.
- Schools may define download retention policies.

---

# Table: report_generation_logs

## Purpose

Stores detailed operational logs generated during report publishing.

Generation Logs assist administrators and developers in monitoring report generation performance, troubleshooting errors, and auditing system activities.

Tracked Events include:

- Rendering Time
- Missing Data
- Template Errors
- Validation Errors
- PDF Compression
- QR Code Generation
- Barcode Generation
- Storage Upload
- Distribution Failures

---

## Columns

| Column | Type |
|---------|------|
| report_generation_log_id | UUID |
| report_generation_job_id | UUID |
| report_id | UUID NULL |
| log_level | ENUM (Info, Warning, Error) |
| message | TEXT |
| execution_time | INTEGER |
| stack_trace | TEXT NULL |
| resolved | BOOLEAN |
| created_at | TIMESTAMP |

---

## Business Rules

- Every Generation Job may produce multiple Log entries.
- Error Logs remain available for diagnostics.
- Stack Traces are stored only for Error logs.
- Logs support future monitoring dashboards.

---

# Table: report_generation_queue

## Purpose

Manages queued report generation requests.

Instead of generating reports immediately, requests are placed into a processing queue, enabling reliable batch processing and improved scalability.

The Queue supports:

- Single Report Generation
- Class Reports
- School-wide Reports
- Scheduled Generation
- Background Processing

---

## Columns

| Column | Type |
|---------|------|
| report_generation_queue_id | UUID |
| report_generation_job_id | UUID |
| queue_position | INTEGER |
| priority | ENUM (Low, Normal, High, Critical) |
| assigned_worker | VARCHAR(100) NULL |
| queue_status | ENUM (Waiting, Processing, Completed, Failed, Cancelled) |
| retry_count | INTEGER |
| scheduled_at | TIMESTAMP NULL |
| started_at | TIMESTAMP NULL |
| completed_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Queue Items are processed in priority order.
- Failed Queue Items may be retried automatically.
- Queue Workers process jobs asynchronously.
- Queue processing supports horizontal scaling.
- Queue history remains available for operational auditing.

---

# Table: report_templates_cache

## Purpose

Stores temporary cached report template configurations used during report generation.

Rather than repeatedly querying multiple template tables during every report generation request, the Report Publishing Engine loads the required configuration into cache for faster rendering.

Cached Information includes:

- Report Template
- Branding Profile
- Display Rules
- PDF Layout
- Header Configuration
- Footer Configuration
- Signature Layout
- QR Settings

---

## Columns

| Column | Type |
|---------|------|
| report_template_cache_id | UUID |
| report_template_id | UUID |
| cache_data | JSONB |
| cache_version | VARCHAR(20) |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Cache is automatically regenerated when templates change.
- Expired Cache entries are refreshed automatically.
- Cached data improves report generation performance.
- Cache never replaces the original template configuration.

---

# Business Rules

- Every Report is generated from validated operational data.
- Report validation must complete successfully before approval.
- Reports must complete the configured approval workflow before publication.
- Every Published Report generates an immutable Snapshot.
- Report Snapshots shall never be modified.
- Every Published Report generates one or more PDF outputs.
- Reports support multiple layouts and output formats.
- Every Published Report receives a Verification Record.
- Report Distribution supports multiple delivery channels.
- Every download is recorded for auditing.
- Every report generation activity is logged.
- Queue Processing supports asynchronous report generation.
- Template Cache improves report generation performance.
- Archived Reports remain permanently available according to retention policies.
- Report data powers Parent Portal, Student Portal, Analytics, Public Verification, and future mobile applications.

---

# Relationship Overview

```text
Student

↓

Report

↓

Report Builder

↓

Validation

↓

Approval Workflow

↓

Report Snapshot

↓

PDF Generation

↓

Verification

↓

Distribution

↓

Archive

↓

Download History

↓

Analytics
```

---

# Future Enhancements

The Report Publishing Engine is designed for long-term extensibility.

Future capabilities include:

- AI-generated narrative report summaries
- AI-assisted report quality validation
- Multi-language report generation
- Digital signatures compliant with international standards
- Parent acknowledgement workflow
- Scheduled report publication
- Bulk email scheduling
- Mobile wallet report cards
- Offline PDF synchronization
- Microsoft Word export
- Microsoft Excel export
- HTML report rendering
- JSON API report generation
- Cloud-native distributed rendering
- Real-time report generation analytics
- AI-powered report personalization

---

# Summary

The Report Publishing Engine is the publishing layer of the Nobletech Education Management Platform (NEMP).

It transforms validated academic, behavioural, attendance, assessment, curriculum, portfolio, and achievement data into secure, version-controlled, digitally verifiable, and professionally branded reports.

By combining report assembly, validation, approval workflows, immutable snapshots, PDF generation, verification, distribution, archiving, caching, and asynchronous queue processing, the engine provides an enterprise-grade reporting solution that is scalable, auditable, and future-ready.

Its modular architecture integrates seamlessly with the Curriculum Engine, Assessment Engine, Student Portfolio Engine, Certificate Engine, Analytics Engine, Parent Portal, Student Portal, and future Notification Engine, ensuring that report publishing remains reliable and extensible as the platform grows.

---

# End of Document