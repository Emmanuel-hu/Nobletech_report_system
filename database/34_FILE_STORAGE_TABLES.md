# Nobletech Education Management Platform (NEMP)

# 34_FILE_STORAGE_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | File Storage Tables |
| Document Code | NEMP-DB-034 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |
| Primary Storage | Azure Blob Storage (Provider Independent Design) |

---

# Purpose

The File Storage Module provides centralized management of all digital assets used throughout the Nobletech Education Management Platform (NEMP).

Rather than storing files directly inside the database, NEMP stores file metadata while the actual files reside in a secure object storage service.

This architecture improves scalability, performance, maintainability, backup efficiency, and cloud portability.

The design remains storage-provider independent, allowing Azure Blob Storage, Amazon S3, Google Cloud Storage, or future providers to be used with minimal application changes.

---

# Objectives

The File Storage Module aims to:

- Centralize digital asset management.
- Store file metadata separately from file content.
- Support secure cloud storage.
- Enable file versioning.
- Support document lifecycle management.
- Maintain audit history.
- Improve scalability.
- Support multi-tenant storage.
- Enable secure file sharing.
- Support future storage providers.

---

# Storage Architecture

```text
Application

↓

Upload Service

↓

Storage Service

↓

Object Storage

↓

Metadata Database

↓

Application Access
```

Actual files reside in object storage, while metadata is maintained within PostgreSQL.

---

# Storage Principles

The File Storage Module follows these principles:

- Metadata in Database
- Files in Object Storage
- Immutable File References
- Secure Access
- Multi-Tenant Isolation
- Version Control
- Auditability
- Encryption
- Scalability
- Provider Independence

---

# Storage Categories

The platform manages the following categories of files:

- Student Passports
- Teacher Passports
- Parent Documents
- School Logos
- Report PDFs
- Certificates
- Portfolio Files
- Assignment Uploads
- CBT Attachments
- Project Files
- Images
- Videos
- Audio Files
- Curriculum Documents
- Lesson Resources
- AI Generated Files
- Temporary Files
- Archived Files
- System Documents

---

# Operational Tables

The File Storage Module consists of the following tables:

1. storage_providers
2. storage_locations
3. folders
4. files
5. file_versions
6. file_categories
7. file_permissions
8. file_access_logs
9. file_shares
10. storage_quotas
11. upload_sessions
12. file_retention_policies
13. archived_files
14. deleted_files
15. storage_statistics

---

# Table: storage_providers

## Purpose

Stores supported storage providers.

Examples:

- Azure Blob Storage
- Amazon S3
- Google Cloud Storage
- Local Storage (Development)

---

## Columns

| Column | Type |
|---------|------|
| storage_provider_id | UUID |
| provider_name | VARCHAR(100) |
| provider_type | VARCHAR(100) |
| endpoint_url | TEXT |
| default_provider | BOOLEAN |
| active | BOOLEAN |
| created_at | TIMESTAMP |

---

# Table: storage_locations

## Purpose

Defines logical storage containers or buckets.

Examples:

- student-passports
- certificates
- reports
- school-branding
- portfolios

---

## Columns

| Column | Type |
|---------|------|
| storage_location_id | UUID |
| storage_provider_id | UUID |
| location_name | VARCHAR(150) |
| container_name | VARCHAR(255) |
| base_path | TEXT |
| encrypted | BOOLEAN |
| active | BOOLEAN |
| created_at | TIMESTAMP |

---

# Table: folders

## Purpose

Represents the logical folder structure used within the application.

Folders organize files without depending on the physical layout in cloud storage.

Examples:

- Students
- Reports
- Certificates
- Portfolios
- Schools
- Temporary Uploads

---

## Columns

| Column | Type |
|---------|------|
| folder_id | UUID |
| school_id | UUID NULL |
| parent_folder_id | UUID NULL |
| folder_name | VARCHAR(255) |
| folder_path | TEXT |
| description | TEXT |
| created_by | UUID |
| created_at | TIMESTAMP |

---

# Table: files

## Purpose

Stores metadata for every uploaded file.

The actual binary content is stored in object storage.

---

## Examples

- Passport Photograph
- School Logo
- Report PDF
- Robotics Project
- Coding Assignment
- Student Portfolio

---

## Columns

| Column | Type |
|---------|------|
| file_id | UUID |
| school_id | UUID |
| folder_id | UUID |
| storage_location_id | UUID |
| category_id | UUID |
| original_filename | VARCHAR(255) |
| stored_filename | VARCHAR(255) |
| file_extension | VARCHAR(20) |
| mime_type | VARCHAR(100) |
| file_size_bytes | BIGINT |
| checksum | VARCHAR(255) |
| storage_path | TEXT |
| uploaded_by | UUID |
| upload_date | TIMESTAMP |
| current_version | INTEGER |
| active | BOOLEAN |

---

# Business Rules

- Files must never be stored directly inside PostgreSQL unless specifically required for small system assets.
- All uploads should generate metadata records.
- Object storage must be abstracted from application logic.
- Every file belongs to a storage location.
- Every file belongs to a category.
- Folder hierarchy is logical rather than physical.
- Storage providers should be interchangeable.
- Multi-tenant isolation is mandatory.
- File metadata must remain auditable.
- Every upload must be validated before storage.

---

# Relationship Overview

```text
Application

↓

Upload Service

↓

Storage Provider

↓

Storage Location

↓

Folders

↓

Files

↓

Metadata

↓

Object Storage
```

---

# End of Part 1

# Table: file_versions

## Purpose

Maintains the complete version history of every file stored within NEMP.

Versioning enables recovery of previous file revisions, audit tracking, and document history management.

---

## Examples

- Updated Student Passport
- Revised Report PDF
- Updated School Logo
- New Certificate Template
- Improved Robotics Project

---

## Columns

| Column | Type |
|---------|------|
| file_version_id | UUID |
| file_id | UUID |
| version_number | INTEGER |
| storage_path | TEXT |
| file_size_bytes | BIGINT |
| checksum | VARCHAR(255) |
| change_description | TEXT |
| uploaded_by | UUID |
| uploaded_at | TIMESTAMP |
| is_current_version | BOOLEAN |

---

# Table: file_categories

## Purpose

Defines standardized categories for files stored throughout the platform.

Categories simplify organization, searching, reporting, permissions, and lifecycle management.

---

## Examples

- Student Passport
- Teacher Passport
- Parent Document
- School Logo
- Report PDF
- Certificate
- Assignment
- Portfolio
- CBT Attachment
- Curriculum Resource
- AI Generated File
- Temporary Upload

---

## Columns

| Column | Type |
|---------|------|
| category_id | UUID |
| category_name | VARCHAR(150) |
| category_code | VARCHAR(50) |
| description | TEXT |
| default_retention_days | INTEGER |
| requires_versioning | BOOLEAN |
| active | BOOLEAN |
| created_at | TIMESTAMP |

---

# Table: file_permissions

## Purpose

Defines access permissions for individual files.

Permissions determine who may view, download, update, share, or delete files.

---

## Permission Types

- View
- Download
- Upload
- Update
- Delete
- Share
- Archive
- Restore

---

## Columns

| Column | Type |
|---------|------|
| file_permission_id | UUID |
| file_id | UUID |
| role_id | UUID NULL |
| user_id | UUID NULL |
| permission_type | ENUM(View,Download,Upload,Update,Delete,Share,Archive,Restore) |
| granted_by | UUID |
| granted_at | TIMESTAMP |
| expires_at | TIMESTAMP NULL |

---

# Table: file_access_logs

## Purpose

Records every access to stored files.

The audit trail supports compliance, security investigations, and usage reporting.

---

## Logged Activities

- View
- Download
- Upload
- Replace
- Delete
- Restore
- Share
- Print

---

## Columns

| Column | Type |
|---------|------|
| file_access_log_id | UUID |
| file_id | UUID |
| school_id | UUID |
| user_id | UUID |
| activity | VARCHAR(100) |
| ip_address | VARCHAR(100) |
| user_agent | TEXT |
| access_time | TIMESTAMP |
| successful | BOOLEAN |

---

# Table: file_shares

## Purpose

Stores file sharing information.

Files may be shared internally or externally using secure access rules.

---

## Examples

- Share Report with Parent
- Share Certificate
- Share Project Portfolio
- Share Curriculum Resource

---

## Columns

| Column | Type |
|---------|------|
| file_share_id | UUID |
| file_id | UUID |
| shared_by | UUID |
| shared_with_user_id | UUID NULL |
| shared_email | VARCHAR(255) NULL |
| share_token | VARCHAR(255) |
| access_level | ENUM(View,Download) |
| expiry_date | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Shared files associated with external learning activities should use expiring secure tokens.
- `shared_email` is optional and must not be the only recovery or access control mechanism for learner-linked resources.
- Third-party credentials, class codes, and join codes must never be stored as plain text in file metadata or sharing payloads.
- External sharing actions must be tenant-aware and fully auditable.

Phase 2F compatibility note:

- Curriculum source and master-resource foundation stores only file references and file metadata fields (`file_reference`, `original_file_name`, `mime_type`, `file_size`, `checksum`) and does not store raw binary payloads in database columns.
- File upload orchestration, provider APIs, and object-storage synchronization remain deferred to file-storage implementation milestones.

Phase 2L curriculum source foundation (implemented):

- Added a dedicated `curriculum_source_files` operational metadata table linked to `curriculum_sources` for version-safe source file lifecycle.
- Added `CurriculumStorageProvider` (`LOCAL`, `AZURE_BLOB`, `AWS_S3`, `GCP_STORAGE`) and `CurriculumSourceFileStatus` (`ACTIVE`, `ARCHIVED`, `DELETED`) enums.
- Implemented provider abstraction in backend services with Local provider support enabled for development.
- Implemented secured curriculum source file upload, replace, reorder, make-primary, archive, delete, download, and preview APIs.
- Enforced tenancy scope, lifecycle editability, RBAC, optimistic concurrency checks, MIME allow-list validation, and upload size limits.
- Added audit logging for privileged and state-changing source-file operations.
- OCR, AI extraction, parsing, and generation remain deferred and out of scope for this milestone.

Phase 2L validation note:

- Phase 2L validation scopes the migration checksum audit to the Phase 2L migration set so inherited historical checksum drift does not block this milestone's file-storage verification.

---

# Table: storage_quotas

## Purpose

Defines storage allocation for each school.

Quotas help control storage usage and support subscription plans.

---

## Examples

- Maximum Storage
- Current Usage
- Remaining Storage

---

## Columns

| Column | Type |
|---------|------|
| storage_quota_id | UUID |
| school_id | UUID |
| allocated_storage_gb | DECIMAL(12,2) |
| used_storage_gb | DECIMAL(12,2) |
| remaining_storage_gb | DECIMAL(12,2) |
| warning_threshold_percentage | INTEGER |
| updated_at | TIMESTAMP |

---

# Table: upload_sessions

## Purpose

Tracks file upload operations.

This supports resumable uploads, large file handling, and failure recovery.

---

## Columns

| Column | Type |
|---------|------|
| upload_session_id | UUID |
| school_id | UUID |
| user_id | UUID |
| upload_token | VARCHAR(255) |
| upload_status | ENUM(Pending,Uploading,Completed,Failed,Cancelled) |
| total_files | INTEGER |
| uploaded_files | INTEGER |
| total_size_bytes | BIGINT |
| created_at | TIMESTAMP |
| completed_at | TIMESTAMP NULL |

---

# Table: file_retention_policies

## Purpose

Defines how long different categories of files should be retained before archival or deletion.

Retention policies support regulatory compliance and storage optimization.

---

## Examples

- Student Records
- Report PDFs
- Certificates
- CBT Uploads
- Temporary Files

---

## Columns

| Column | Type |
|---------|------|
| retention_policy_id | UUID |
| category_id | UUID |
| retention_days | INTEGER |
| archive_before_delete | BOOLEAN |
| automatic_deletion | BOOLEAN |
| legal_hold_supported | BOOLEAN |
| updated_at | TIMESTAMP |

---

# Table: archived_files

## Purpose

Tracks files moved into long-term archival storage.

Archived files remain recoverable according to organizational policy.

---

## Columns

| Column | Type |
|---------|------|
| archived_file_id | UUID |
| original_file_id | UUID |
| archive_location | TEXT |
| archived_by | UUID |
| archived_at | TIMESTAMP |
| archive_reason | TEXT |
| restoration_allowed | BOOLEAN |

---

# Table: deleted_files

## Purpose

Maintains records of deleted files for audit and recovery purposes.

Deletion within NEMP is generally logical rather than immediate physical removal.

---

## Columns

| Column | Type |
|---------|------|
| deleted_file_id | UUID |
| original_file_id | UUID |
| deleted_by | UUID |
| deleted_at | TIMESTAMP |
| deletion_reason | TEXT |
| permanent_delete_date | TIMESTAMP NULL |
| restored | BOOLEAN |

---

# Table: storage_statistics

## Purpose

Stores aggregated storage metrics for reporting, monitoring, and capacity planning.

Statistics help administrators monitor storage consumption across schools.

---

## Examples

- Total Files
- Total Storage Used
- Average File Size
- Monthly Upload Growth
- Storage by Category

---

## Columns

| Column | Type |
|---------|------|
| storage_statistics_id | UUID |
| school_id | UUID |
| total_files | BIGINT |
| total_storage_bytes | BIGINT |
| average_file_size | BIGINT |
| largest_file_size | BIGINT |
| monthly_upload_count | INTEGER |
| monthly_storage_growth_bytes | BIGINT |
| calculated_at | TIMESTAMP |

---

# File Upload Workflow

Every uploaded file should follow a standardized workflow.

```text
User Selects File

↓

Validate File

↓

Virus Scan (Future)

↓

Create Upload Session

↓

Upload to Object Storage

↓

Generate Metadata

↓

Create Database Record

↓

Generate Audit Log

↓

Update Storage Statistics

↓

Upload Complete
```

---

# File Versioning Workflow

```text
Existing File

↓

Upload New Version

↓

Create Version Record

↓

Update Current Version

↓

Retain Previous Versions

↓

Refresh Metadata
```

Previous versions remain recoverable unless retention policies specify otherwise.

---

# File Classification Model

Every uploaded file should belong to one category.

```text
Academic

├── Reports

├── Assignments

├── Portfolios

├── Certificates

Administrative

├── Logos

├── Staff Documents

├── Policies

Media

├── Images

├── Videos

├── Audio

System

├── Temporary Files

├── AI Files

├── Archived Files
```

---

# Business Rules

- Every uploaded file must belong to a category.
- Every upload creates a metadata record.
- Version history must be preserved for version-controlled categories.
- File permissions must be enforced before access.
- File access must be audited.
- Storage quotas must be monitored continuously.
- Upload sessions should support recovery from interruptions.
- Retention policies should govern archival and deletion.
- Deleted files should remain recoverable until permanent deletion.
- Storage statistics should be updated automatically after every file operation.

---

# End of Part 2

# File Lifecycle Management

Every file stored within NEMP should follow a controlled lifecycle from creation to permanent deletion.

The lifecycle ensures traceability, security, compliance, and efficient storage utilization.

---

# File Lifecycle

```text
Upload

↓

Validation

↓

Classification

↓

Storage

↓

Usage

↓

Version Updates

↓

Archive

↓

Retention Period

↓

Permanent Deletion
```

Each stage should be recorded in the audit trail.

---

# File States

A file may exist in one of the following states:

| State | Description |
|---------|-------------|
| Pending Upload | Upload has started but is incomplete |
| Uploaded | Successfully stored |
| Active | Available for normal use |
| Shared | Available through approved sharing |
| Archived | Moved to long-term storage |
| Deleted | Logically deleted |
| Restored | Recovered from deletion |
| Permanently Deleted | Removed according to retention policy |

The current state should always be reflected in the metadata.

---

# File Validation

Every uploaded file should undergo validation before storage.

Validation includes:

- File Type Validation
- MIME Type Verification
- File Extension Verification
- Maximum File Size
- Filename Validation
- Duplicate Detection
- Checksum Generation
- Malware Scan (Future)

Files failing validation should be rejected before reaching storage.

---

# Supported File Types

The platform should support commonly used educational file formats.

### Documents

- PDF
- DOCX
- XLSX
- PPTX
- TXT
- CSV

### Images

- JPG
- JPEG
- PNG
- WEBP
- SVG

### Audio

- MP3
- WAV
- AAC

### Video

- MP4
- WEBM
- MOV

### Compressed Files

- ZIP

Additional file types may be enabled through configuration.

---

# Maximum Upload Size

Upload limits should be configurable.

Recommended defaults:

| Category | Maximum Size |
|-----------|-------------:|
| Passport Photograph | 5 MB |
| School Logo | 10 MB |
| Assignment | 50 MB |
| Portfolio Project | 200 MB |
| CBT Attachment | 50 MB |
| Report PDF | 20 MB |
| Certificate | 20 MB |
| Video | 500 MB |

Upload limits should be controlled through `storage_settings`.

---

# File Naming Strategy

Stored filenames should be system-generated.

Example:

```text
4c72dd8e-a62c-46d1-90fd-f6a9e8b0ef14.pdf
```

Original filenames should be preserved only as metadata.

This approach:

- Prevents filename collisions.
- Improves security.
- Simplifies storage management.

---

# Directory Structure

Logical storage organization should follow a consistent hierarchy.

Example:

```text
School

↓

Academic Session

↓

Term

↓

Module

↓

Category

↓

File
```

Illustration:

```text
school-001/

2026-2027/

First-Term/

Reports/

Primary-5/

report.pdf
```

The physical storage structure may differ from the logical hierarchy.

---

# File Metadata Standards

Every stored file should include comprehensive metadata.

Recommended metadata:

- File ID
- Original Filename
- Stored Filename
- MIME Type
- Extension
- File Size
- Storage Provider
- Storage Location
- Upload Date
- Uploaded By
- Current Version
- Category
- Checksum
- School
- Owner

Metadata enables efficient search and governance.

---

# File Ownership

Every file should have a clearly defined owner.

Possible owners include:

- Student
- Teacher
- Parent
- School
- System
- Administrator

Ownership determines access permissions and lifecycle policies.

---

# File Association

Files should be linked to business entities rather than existing independently.

Examples:

```text
Student

↓

Passport Photograph
```

```text
Assessment

↓

Student Submission
```

```text
Report

↓

Generated PDF
```

```text
Certificate

↓

Certificate PDF
```

```text
School

↓

Logo
```

Association improves traceability throughout the platform.

---

# File Search

The platform should support efficient file discovery.

Search filters include:

- Filename
- Category
- File Type
- Upload Date
- Uploaded By
- School
- Owner
- Tags
- Size

Search should operate on metadata rather than binary file contents.

---

# File Tagging

Optional tags improve organization.

Examples:

- Robotics
- Coding
- Primary 5
- Graduation
- Examination
- STEM
- Portfolio

Multiple tags may be assigned to a file.

---

# Duplicate Detection

Duplicate uploads should be detected using checksums.

Workflow:

```text
Upload File

↓

Generate Checksum

↓

Existing Checksum?

↓

Yes

↓

Notify User

↓

Reuse or Replace

↓

No

↓

Store File
```

Duplicate detection reduces unnecessary storage consumption.

---

# Storage Optimization

Storage utilization should be optimized through:

- Duplicate Detection
- Compression (Where Appropriate)
- Lifecycle Policies
- Archiving
- Automatic Cleanup
- Intelligent Storage Tiering (Future)

Optimization should not compromise data integrity.

---

# Storage Capacity Monitoring

Storage usage should be monitored continuously.

Recommended metrics:

- Total Storage Used
- Storage by School
- Storage by Category
- Monthly Growth
- Largest Files
- Duplicate Files
- Archive Size

Capacity planning should use these metrics.

---

# File Integrity Verification

Stored files should be periodically verified.

Verification methods include:

- Checksum Validation
- Metadata Validation
- Storage Accessibility
- Version Consistency

Integrity failures should trigger alerts.

---

# File Recovery

Deleted or archived files should support recovery.

Recovery workflow:

```text
Locate File

↓

Validate Permission

↓

Restore Metadata

↓

Restore Storage Object

↓

Audit Recovery

↓

File Available
```

Recovery actions should be fully audited.

---

# Storage Cleanup

Routine cleanup should remove unnecessary storage consumption.

Cleanup targets include:

- Expired Temporary Files
- Cancelled Upload Sessions
- Expired Shared Links
- Obsolete File Versions
- Orphan Metadata

Cleanup should follow retention policies.

---

# Business Rules

- Every file must pass validation before storage.
- Files should receive system-generated storage names.
- Original filenames must be preserved as metadata.
- Every file must have a defined owner.
- Files should be associated with business entities.
- Duplicate uploads should be detected using checksums.
- Storage utilization should be monitored continuously.
- File integrity should be verified periodically.
- Recovery operations must be audited.
- Cleanup operations should follow approved retention policies.

---

# End of Part 3

# Enterprise File Storage Governance

This section establishes the enterprise governance framework for file storage and digital asset management within the Nobletech Education Management Platform (NEMP).

The objective is to ensure that every digital asset is securely stored, properly classified, efficiently managed, and fully auditable throughout its lifecycle.

These governance standards apply to:

- Student Files
- Teacher Files
- Parent Documents
- School Branding Assets
- Report PDFs
- Certificates
- CBT Uploads
- Assignment Submissions
- Portfolio Files
- Multimedia Files
- AI-Generated Files
- System Documents

---

# File Storage Governance Principles

NEMP adopts the following file storage governance principles:

- Secure by Design
- Metadata First
- Cloud Storage Independence
- Multi-Tenant Isolation
- Least Privilege Access
- Version Preservation
- Auditability
- Lifecycle Management
- Scalability
- Continuous Improvement

These principles govern all file storage operations throughout the platform.

---

# Enterprise File Governance Model

```text
Upload Request

↓

Validation

↓

Classification

↓

Storage

↓

Metadata Registration

↓

Permission Assignment

↓

Application Usage

↓

Audit Logging

↓

Retention Management

↓

Archive

↓

Deletion
```

Every file should follow this governance model.

---

# Storage Security

Every stored file must be protected against unauthorized access.

Security requirements include:

- Encrypted Transmission (HTTPS/TLS)
- Encryption at Rest
- Role-Based Access Control (RBAC)
- Tenant Isolation
- Permission Validation
- Secure File URLs
- Time-Limited Download Links
- Audit Logging

Security controls should apply regardless of the storage provider.

---

# Sensitive Files

Certain files require enhanced protection.

Examples include:

- Student Identification Documents
- Teacher Employment Documents
- Parent Identification
- Examination Materials
- Financial Documents
- Medical Records (if supported)
- Administrative Reports

Additional controls may include:

- Restricted Access
- Short-Lived Download Links
- Watermarking (Future)
- Download Restrictions
- Enhanced Audit Logging

---

# File Access Control

File access should follow the Principle of Least Privilege.

| Role | Typical Access |
|------|----------------|
| Super Administrator | Full Access |
| School Administrator | School Files |
| Academic Administrator | Academic Files |
| Teacher | Assigned Academic Files |
| Student | Own Files Only |
| Parent | Child's Files Only |
| System Services | Authorized System Files |

Every access request should be validated before a file is served.

---

# Secure File Access Workflow

```text
User Requests File

↓

Authenticate User

↓

Validate School

↓

Validate Permission

↓

Generate Secure Access URL

↓

Log Access

↓

Deliver File
```

Unauthorized requests should be denied and logged.

---

# Audit Requirements

Every significant file activity should generate an audit record.

Examples include:

- Upload
- Download
- Preview
- Share
- Replace
- Archive
- Restore
- Delete
- Permission Change

Audit records should remain immutable.

---

# File Compliance

File management should align with recognized industry best practices, including:

- OWASP File Upload Security Guidance
- Secure Software Development Lifecycle (SSDLC)
- Principle of Least Privilege
- Cloud Security Best Practices
- Multi-Tenant SaaS Architecture Standards

Compliance should be reviewed periodically.

---

# File Retention Governance

Every file category should follow an approved retention policy.

Examples:

| Category | Retention Guidance |
|----------|--------------------|
| Student Academic Records | According to organizational policy |
| Certificates | Long-term retention |
| Report PDFs | According to organizational policy |
| Assignment Uploads | Configurable |
| Temporary Uploads | Short-term |
| System Logs | According to operational policy |

Retention periods should be configurable through the Settings Module.

---

# Archiving Strategy

Files no longer required for active operations should be archived rather than immediately deleted.

Archiving objectives include:

- Reduce Active Storage
- Preserve Historical Records
- Improve Performance
- Support Compliance
- Enable Recovery

Archived files should remain searchable through metadata.

---

# Permanent Deletion

Permanent deletion should occur only when:

- Retention Policy Expires
- Legal Hold Does Not Apply
- Administrative Approval Exists (where required)
- Audit Requirements Are Satisfied

Permanent deletion should remove both metadata and stored content where appropriate.

---

# Storage Monitoring

Operations should continuously monitor:

- Storage Utilization
- Upload Failures
- Download Failures
- Permission Violations
- Malware Detection Events (Future)
- Storage Provider Availability
- Archive Growth
- Quota Consumption

Monitoring supports proactive storage management.

---

# Storage Performance

Storage services should be optimized through:

- Metadata Indexing
- Content Delivery Optimization (Future CDN)
- Intelligent Caching
- File Compression (where appropriate)
- Efficient Object Naming
- Storage Tiering (Future)

Performance optimization should not compromise security or integrity.

---

# Disaster Recovery

File storage forms part of the platform disaster recovery strategy.

Recovery should include:

- Metadata Restoration
- Object Storage Restoration
- Version Recovery
- Permission Restoration
- Storage Configuration Recovery

Recovery procedures should be tested periodically.

---

# AI-Assisted File Management

Artificial Intelligence may assist with:

- Automatic File Classification
- Duplicate Detection
- Image Tagging
- OCR Processing (Future)
- Intelligent Search
- Storage Optimization
- Metadata Suggestions
- Document Categorization

AI recommendations should always remain subject to human oversight.

---

# Operational Reporting

Administrative reports should include:

- Storage Usage by School
- Storage Usage by Category
- Largest Files
- Upload Activity
- Download Activity
- Archive Statistics
- Quota Consumption
- File Growth Trends
- Version Statistics
- Deleted File Summary

Reports support capacity planning and operational decision-making.

---

# Future Enhancements

The File Storage Module supports future enterprise capabilities including:

- Content Delivery Network (CDN) Integration
- AI-Based Image Recognition
- Optical Character Recognition (OCR)
- Automatic Thumbnail Generation
- Video Streaming Optimization
- Digital Watermarking
- Secure External File Sharing
- Storage Tier Automation
- Cross-Region Replication
- Intelligent Storage Cost Optimization
- AI-Based Duplicate Prediction
- Enterprise Digital Asset Management (DAM)

These enhancements can be implemented without redesigning the underlying storage architecture.

---

# Relationship Overview

```text
Upload Service

↓

Validation

↓

Storage Provider

↓

Metadata

↓

Permissions

↓

Audit Logging

↓

Application Access

↓

Retention Management

↓

Archive

↓

Deletion
```

---

# Summary

The File Storage Tables establish the enterprise digital asset management architecture for the Nobletech Education Management Platform (NEMP). By separating file metadata from binary content and leveraging secure object storage, the platform achieves scalability, performance, portability, and strong governance while remaining independent of any specific cloud storage provider.

Through structured metadata management, role-based access control, version history, lifecycle management, storage quotas, retention policies, auditing, and enterprise security controls, the File Storage Module provides a secure and maintainable foundation for managing all digital assets across the platform.

Designed to support future growth, the architecture accommodates advanced capabilities such as AI-assisted file classification, intelligent search, OCR, digital watermarking, CDN integration, automated storage optimization, and enterprise digital asset management without requiring structural redesign.

This document serves as the definitive reference for all file storage, metadata management, object storage integration, document lifecycle management, digital asset governance, and storage operations throughout the NEMP ecosystem.

---

# End of Document