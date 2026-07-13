## Phase 2G Security and Audit Notes

- Curriculum lifecycle transitions are auditable through `curriculum_review_actions` and `curriculum_status_history`.
- Assignment activation boundaries and publication eligibility require RBAC and service-layer authorization checks.
- Database constraints enforce metadata validity, ordering, uniqueness, and composite-tenant isolation, while privileged transition policy remains a service responsibility.
# Nobletech Education Management Platform (NEMP)

# 17_SECURITY_AND_AUDIT_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Security, Identity & Audit Engine Tables |
| Document Code | NEMP-DB-SEC-017 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Security, Identity & Audit Engine provides the enterprise-grade identity management, authentication, authorization, audit logging, compliance, and security monitoring framework for the Nobletech Education Management Platform (NEMP).

It serves as the central security layer that protects all users, schools, academic data, assessments, reports, certificates, and system resources while ensuring complete accountability and traceability of every action performed across the platform.

The engine integrates with every major subsystem, including:

- Core System
- School Management
- Curriculum Engine
- Assessment Engine
- CBT Engine
- Student Portfolio Engine
- Report Publishing Engine
- Certificate Engine
- Notification Engine
- Parent Portal
- Student Portal
- Analytics Engine

Its modular architecture ensures secure multi-tenant operation while remaining scalable enough to support future enterprise security standards and regulatory compliance requirements.

---

# Objectives

The Security, Identity & Audit Engine is designed to:

- Provide centralized identity management.
- Authenticate all users securely.
- Enforce role-based and permission-based authorization.
- Isolate schools through secure multi-tenancy.
- Protect sensitive educational data.
- Manage secure user sessions.
- Support trusted device recognition.
- Secure REST API integrations.
- Record every security-sensitive action.
- Maintain immutable audit trails.
- Detect suspicious activities.
- Support configurable security policies.
- Enable compliance with future data protection regulations.
- Provide enterprise-grade monitoring and reporting.

---

# Security Architecture

```text
User

↓

Identity Verification

↓

Authentication

↓

Multi-Factor Authentication

↓

Role Assignment

↓

Permission Validation

↓

Tenant Isolation

↓

Authorized Request

↓

Business Module

↓

Audit Logging

↓

Security Monitoring

↓

Compliance

↓

Analytics
```

---

# Security Modules

The Security, Identity & Audit Engine consists of the following functional modules:

1. Identity Management
2. Authentication
3. Multi-Factor Authentication (MFA)
4. Authorization
5. Role-Based Access Control (RBAC)
6. Permission Management
7. Multi-Tenant Isolation
8. Session Management
9. Trusted Device Management
10. API Security
11. Audit Trail
12. Security Monitoring
13. Compliance Management
14. Security Policy Management

---

# Operational Security Tables

The Security Engine consists of the following operational tables:

1. users
2. roles
3. permissions
4. role_permissions
5. user_roles
6. user_sessions
7. trusted_devices
8. login_history
9. password_history
10. api_keys
11. api_access_logs
12. audit_logs
13. security_events
14. failed_login_attempts
15. account_lockouts
16. two_factor_authentication
17. password_reset_requests
18. user_preferences
19. security_policies
20. compliance_logs
21. data_access_logs
22. system_health_logs
23. permission_groups

---

# Table: users

## Purpose

Stores the identity and authentication details of every authenticated user within the platform.

Users may belong to Nobletech Academy or individual schools depending on their assigned roles.

The Users table serves as the primary identity repository for all authenticated accounts.

---

## Supported User Types

- Super Administrator
- System Administrator
- School Administrator
- Academic Administrator
- Teacher
- Supervisor
- Data Entry Officer
- Accountant
- Parent (Future)
- Student (Future)
- API User (Future)

---

## Columns

| Column | Type |
|---------|------|
| user_id | UUID |
| school_id | UUID NULL |
| username | VARCHAR(100) |
| first_name | VARCHAR(100) |
| last_name | VARCHAR(100) |
| email | VARCHAR(255) NULL |
| phone_number | VARCHAR(30) |
| profile_photo | TEXT NULL |
| preferred_language | VARCHAR(20) |
| timezone | VARCHAR(100) |
| password_hash | TEXT |
| account_status | ENUM (Active, Inactive, Suspended, Locked) |
| email_verified | BOOLEAN |
| phone_verified | BOOLEAN |
| failed_login_count | INTEGER |
| last_login | TIMESTAMP NULL |
| last_password_change | TIMESTAMP NULL |
| password_expires_at | TIMESTAMP NULL |
| must_change_password | BOOLEAN |
| created_by | UUID NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| login_id | VARCHAR(100) |

---

---

# User Provisioning Workflow

The following workflow illustrates how user accounts are created and activated within the NEMP platform.

```text
School Administrator

↓

Create User Account

↓

System Generates Login ID

↓

System Generates Temporary Password

↓

Login Credentials Issued to User

↓

User Logs In

↓

System Requires Password Change

↓

Password Updated

↓

Account Activated

↓

Access Granted Based on Assigned Roles & Permissions
```

---


## Business Rules

- Every User has a globally unique identity.
- Email addresses should be unique where provided.
- Email is optional for pupil and student accounts.
- Passwords are stored using secure hashing algorithms.
- Account Status determines login eligibility.
- Failed Login Count contributes to automatic account lockout.
- Password expiration follows configured Security Policies.
- Users may belong to one or more Roles.
- Every User belongs to at most one School, except Super Administrators.
- School Administrators may create user accounts for teachers, supervisors, data entry staff, parents, and students where applicable.
- School Administrators may create user accounts for authorized personnel.
- The system automatically generates a unique Login ID for new users.
- The system assigns a temporary password during account creation.
- Users must change their temporary password upon first login.
- Access permissions are granted based on assigned Roles and Permissions.
- Username changes must be restricted, explicitly approved, and fully auditable.
- Usernames must not be silently reassigned to different learners.

---

# Table: roles

## Purpose

Defines reusable security roles used throughout the platform.

Roles simplify authorization by grouping permissions into logical responsibilities.

Users may be assigned one or multiple roles.

---

## Examples

- Super Administrator
- System Administrator
- School Administrator
- Academic Administrator
- Teacher
- Supervisor
- Data Entry Officer
- Accountant
- Parent
- Student

---

## Columns

| Column | Type |
|---------|------|
| role_id | UUID |
| role_name | VARCHAR(100) |
| description | TEXT |
| is_system_role | BOOLEAN |
| is_default | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- System Roles cannot be deleted.
- Multiple Users may share the same Role.
- Roles contain one or more Permissions.
- Default Roles may be assigned automatically during user creation.
- Custom Roles may be created by authorized administrators.

---

# Table: permissions

## Purpose

Defines every permission that can be assigned within the NEMP platform.

Permissions represent the smallest unit of authorization and control access to specific modules, resources, and actions.

Permissions are assigned to Roles rather than directly to Users, ensuring centralized and maintainable access control.

---

## Examples

Student Management

- Create Student
- View Student
- Edit Student
- Delete Student

Curriculum

- Create Curriculum
- Approve Curriculum
- Publish Curriculum

Assessment

- Create Assessment
- Grade Assessment
- Publish Assessment

Reports

- Generate Report
- Approve Report
- Publish Report

Certificates

- Generate Certificate
- Verify Certificate

Administration

- Manage Users
- Manage Schools
- Manage Billing
- Configure Security Policies

---

## Columns

| Column | Type |
|---------|------|
| permission_id | UUID |
| permission_code | VARCHAR(100) |
| module_name | VARCHAR(100) |
| resource | VARCHAR(100) |
| action | VARCHAR(100) |
| permission_name | VARCHAR(150) |
| description | TEXT |
| is_system_permission | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Permission Codes must be globally unique.
- Permissions cannot overlap.
- System Permissions cannot be deleted.
- Permissions may be reused across multiple Roles.
- Every secured action requires at least one Permission.

---

# Table: role_permissions

## Purpose

Maps Permissions to Roles.

This table enables Role-Based Access Control (RBAC) by allowing each Role to inherit one or more Permissions.

---

## Columns

| Column | Type |
|---------|------|
| role_permission_id | UUID |
| role_id | UUID |
| permission_id | UUID |
| granted_by | UUID |
| granted_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- A Role may contain multiple Permissions.
- A Permission may belong to multiple Roles.
- Duplicate Role-Permission combinations are not allowed.
- Permission assignments are fully auditable.

---

# Table: user_roles

## Purpose

Assigns Roles to Users.

Supports users holding multiple Roles simultaneously, allowing flexible responsibility assignment across schools and operational modules.

---

## Examples

Teacher + CBT Coordinator

Administrator + Supervisor

Academic Head + Report Reviewer

---

## Columns

| Column | Type |
|---------|------|
| user_role_id | UUID |
| user_id | UUID |
| role_id | UUID |
| assigned_by | UUID |
| assignment_reason | TEXT NULL |
| effective_from | TIMESTAMP |
| effective_to | TIMESTAMP NULL |
| is_active | BOOLEAN |
| assigned_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Users may have multiple active Roles.
- Role assignments may have validity periods.
- Expired Roles automatically become inactive.
- Role assignments remain available for auditing.

---

# Table: user_sessions

## Purpose

Tracks every authenticated session established within the platform.

Session Management ensures secure authentication, supports concurrent sessions where permitted, and enables administrators to monitor and terminate active sessions.

---

## Columns

| Column | Type |
|---------|------|
| session_id | UUID |
| user_id | UUID |
| jwt_token_id | UUID |
| refresh_token | TEXT |
| ip_address | VARCHAR(100) |
| country | VARCHAR(100) NULL |
| city | VARCHAR(100) NULL |
| browser | VARCHAR(150) |
| operating_system | VARCHAR(150) |
| device_type | VARCHAR(50) |
| session_expiry | TIMESTAMP |
| login_time | TIMESTAMP |
| last_activity | TIMESTAMP |
| logout_time | TIMESTAMP NULL |
| logout_reason | VARCHAR(100) NULL |
| is_current_session | BOOLEAN |
| status | ENUM (Active, Expired, Revoked) |
| created_at | TIMESTAMP |

---

## Business Rules

- Every successful login creates a new Session.
- Sessions automatically expire after inactivity.
- Administrators may revoke active Sessions.
- Refresh Tokens support secure session renewal.
- Session activity is continuously monitored.

---

# Table: trusted_devices

## Purpose

Stores devices approved for secure access.

Trusted Devices reduce unnecessary verification while supporting future device approval workflows and multi-factor authentication.

---

## Columns

| Column | Type |
|---------|------|
| trusted_device_id | UUID |
| user_id | UUID |
| device_name | VARCHAR(150) |
| browser | VARCHAR(150) |
| operating_system | VARCHAR(150) |
| device_type | VARCHAR(50) |
| fingerprint | TEXT |
| approved | BOOLEAN |
| approved_at | TIMESTAMP NULL |
| last_used | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Users may register multiple Trusted Devices.
- Device Fingerprints must remain unique.
- Unapproved Devices require additional verification.
- Device activity supports security investigations.

---

# Table: login_history

## Purpose

Maintains a permanent history of authentication activity.

Login History provides administrators with visibility into user access patterns and supports security monitoring and forensic investigations.

---

## Tracked Events

- Successful Login
- Failed Login
- Logout
- Session Timeout
- Account Lockout
- Password Reset Login
- Multi-Factor Authentication Success
- Multi-Factor Authentication Failure

---

## Columns

| Column | Type |
|---------|------|
| login_history_id | UUID |
| user_id | UUID NULL |
| session_id | UUID NULL |
| authentication_method | ENUM (Password, Email OTP, SMS OTP, TOTP, API Key, Future WebAuthn) |
| login_status | ENUM (Successful, Failed, Locked, Expired) |
| failure_reason | TEXT NULL |
| ip_address | VARCHAR(100) |
| country | VARCHAR(100) NULL |
| city | VARCHAR(100) NULL |
| browser | VARCHAR(150) |
| operating_system | VARCHAR(150) |
| device_type | VARCHAR(50) |
| login_time | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every authentication attempt generates a Login History record.
- Failed attempts are linked to the Failed Login Attempts table.
- Login History is immutable.
- Authentication methods are configurable.
- Login History supports enterprise security analytics.

---

# Table: password_history

## Purpose

Maintains a history of previously used passwords for each user.

This prevents password reuse and enforces password rotation policies as defined by the platform's Security Policies.

Password history strengthens account security while supporting regulatory compliance.

---

## Columns

| Column | Type |
|---------|------|
| password_history_id | UUID |
| user_id | UUID |
| password_hash | TEXT |
| changed_by | UUID |
| change_reason | VARCHAR(150) |
| changed_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Passwords are stored using secure hashing algorithms.
- Password History is immutable.
- Previously used passwords cannot be reused within the configured retention period.
- Password rotation policies are controlled by Security Policies.
- Every password change creates one Password History record.

---

# Table: api_keys

## Purpose

Stores API credentials used by external systems and integrations.

API Keys provide secure authentication for third-party services interacting with the NEMP platform.

Supported integrations include:

- Mobile Applications
- School Portals
- Payment Gateways
- Learning Management Systems
- Government Systems
- Third-Party Educational Platforms

---

## Columns

| Column | Type |
|---------|------|
| api_key_id | UUID |
| school_id | UUID NULL |
| key_name | VARCHAR(150) |
| api_key_hash | TEXT |
| permissions | JSONB |
| allowed_ips | JSONB |
| rate_limit | INTEGER |
| expires_at | TIMESTAMP |
| status | ENUM (Active, Revoked, Expired) |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- API Keys are securely hashed.
- API Keys may be restricted by IP Address.
- API Keys inherit configurable permissions.
- Expired Keys cannot authenticate.
- Revoked Keys become immediately invalid.

---

# Table: api_access_logs

## Purpose

Maintains a complete history of API requests processed by the platform.

API Logs provide visibility into external integrations and support troubleshooting, monitoring, security analysis, and rate-limiting.

---

## Columns

| Column | Type |
|---------|------|
| api_access_log_id | UUID |
| api_key_id | UUID |
| endpoint | VARCHAR(255) |
| request_method | VARCHAR(20) |
| request_payload | JSONB |
| response_payload | JSONB |
| response_code | INTEGER |
| response_time_ms | INTEGER |
| user_agent | TEXT |
| ip_address | VARCHAR(100) |
| created_at | TIMESTAMP |

---

## Business Rules

- Every API request generates one Access Log.
- Sensitive information is masked before storage.
- API Logs support security investigations.
- Logs remain immutable.
- Response Time supports performance analytics.

---

# Table: audit_logs

## Purpose

Provides a permanent, immutable record of all security-sensitive and business-critical activities performed within the platform.

The Audit Log serves as the official system audit trail and supports accountability, compliance, troubleshooting, and forensic investigations.

Unlike module-specific history tables, Audit Logs provide a centralized record across the entire NEMP ecosystem.

---

## Examples

- Student Created
- Curriculum Approved
- Assessment Published
- CBT Generated
- Report Published
- Certificate Issued
- User Deleted
- Permission Updated
- Security Policy Changed

---

## Columns

| Column | Type |
|---------|------|
| audit_log_id | UUID |
| tenant_id | UUID NULL |
| user_id | UUID |
| performed_by | UUID |
| module_name | VARCHAR(100) |
| entity_type | VARCHAR(100) |
| entity_id | UUID |
| action | VARCHAR(150) |
| old_value | JSONB |
| new_value | JSONB |
| ip_address | VARCHAR(100) |
| browser | VARCHAR(150) |
| device | VARCHAR(150) |
| created_at | TIMESTAMP |

---

## Business Rules

- Every business-critical action creates one Audit Log.
- Audit Logs are immutable.
- Audit Logs cannot be deleted through the application.
- Audit Logs support complete activity reconstruction.
- Tenant information enables secure multi-school auditing.

---

# Table: security_events

## Purpose

Records security-related events detected by the platform.

Security Events support proactive monitoring, incident response, threat detection, and compliance reporting.

---

## Examples

- Unauthorized Access Attempt
- Permission Denied
- Suspicious Login
- API Abuse
- SQL Injection Attempt
- Cross-Site Scripting Attempt
- Multiple Failed Logins
- Session Hijacking Attempt
- Token Expired
- Account Lockout

---

## Columns

| Column | Type |
|---------|------|
| security_event_id | UUID |
| user_id | UUID NULL |
| event_code | VARCHAR(100) |
| event_type | VARCHAR(150) |
| severity | ENUM (Low, Medium, High, Critical) |
| details | JSONB |
| resolved | BOOLEAN |
| resolved_by | UUID NULL |
| resolved_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Every detected security incident generates a Security Event.
- Critical Events may trigger automatic notifications.
- Security Events remain available for auditing.
- Resolution history is permanently retained.

---

# Table: failed_login_attempts

## Purpose

Tracks unsuccessful authentication attempts made against user accounts.

Failed Login Attempts are used to detect brute-force attacks, credential stuffing, and unauthorized access attempts.

---

## Columns

| Column | Type |
|---------|------|
| failed_login_attempt_id | UUID |
| login_identifier | VARCHAR(255) |
| ip_address | VARCHAR(100) |
| browser | VARCHAR(150) |
| operating_system | VARCHAR(150) |
| device_type | VARCHAR(50) |
| failure_reason | VARCHAR(255) |
| attempted_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every failed authentication attempt is recorded.
- Multiple failures may trigger Account Lockout.
- Failed Login records support threat detection.
- Failure history is immutable.
- Failed Login statistics contribute to Security Analytics.

---

# Table: account_lockouts

## Purpose

Automatically locks user accounts after repeated failed authentication attempts or suspicious activities.

Account Lockouts help protect the platform against brute-force attacks, credential stuffing, and unauthorized access attempts.

Lockouts may be triggered automatically or manually by authorized administrators.

---

## Columns

| Column | Type |
|---------|------|
| account_lockout_id | UUID |
| user_id | UUID |
| reason | TEXT |
| failed_attempts | INTEGER |
| lockout_duration_minutes | INTEGER |
| automatic_unlock | BOOLEAN |
| locked_by | UUID NULL |
| locked_at | TIMESTAMP |
| unlocked_by | UUID NULL |
| unlocked_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Account Lockouts may occur automatically or manually.
- Automatic Unlock follows configured Security Policies.
- Administrators may unlock accounts manually.
- Lockout history remains permanently available.
- Lockouts generate Security Events.

---

# Table: two_factor_authentication

## Purpose

Stores Multi-Factor Authentication (MFA) settings for users.

MFA provides an additional layer of protection beyond passwords.

Supported authentication methods include:

- Email OTP
- SMS OTP
- Time-based One-Time Password (TOTP)
- Authenticator Applications
- Recovery Codes
- WebAuthn (Future)

---

## Columns

| Column | Type |
|---------|------|
| two_factor_authentication_id | UUID |
| user_id | UUID |
| authentication_method | ENUM (Email OTP, SMS OTP, TOTP, Authenticator App, Recovery Code, WebAuthn) |
| secret_key | TEXT |
| recovery_codes | JSONB |
| enabled | BOOLEAN |
| verified_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Users may configure multiple authentication methods.
- Secret Keys are encrypted before storage.
- Recovery Codes are generated securely.
- MFA requirements follow Security Policies.
- MFA configuration changes are audited.

---

# Table: password_reset_requests

## Purpose

Tracks password reset requests initiated by users or administrators.

Password Reset Requests provide a secure recovery process while preventing token reuse.

---

## Columns

| Column | Type |
|---------|------|
| password_reset_request_id | UUID |
| user_id | UUID |
| reset_token | TEXT |
| recovery_method | ENUM (Admin Verification, Guardian Verification, Recovery Code, Email, Other) |
| requested_ip | VARCHAR(100) |
| requested_by | UUID NULL |
| expires_at | TIMESTAMP |
| used | BOOLEAN |
| used_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Reset Tokens are securely generated.
- Tokens expire automatically.
- Used Tokens cannot be reused.
- Every Password Reset Request is audited.
- Recovery and reset must not depend only on learner email availability.

---

# Table: user_preferences

## Purpose

Stores personal platform preferences for authenticated users.

These preferences personalize the user experience without affecting authentication or authorization.

---

## Examples

- Preferred Language
- Time Zone
- Theme (Light/Dark)
- Dashboard Layout
- Accessibility Preferences
- Date & Time Format

---

## Columns

| Column | Type |
|---------|------|
| user_preference_id | UUID |
| user_id | UUID |
| preferred_language | VARCHAR(20) |
| timezone | VARCHAR(100) |
| theme | ENUM (Light, Dark, System) |
| dashboard_layout | VARCHAR(100) |
| accessibility_settings | JSONB |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every User may have one Preference Profile.
- Preferences may be updated at any time.
- Accessibility settings remain user-specific.
- Preference changes do not affect system security.

---

# Table: security_policies

## Purpose

Stores configurable security policies applied across the platform.

Security Policies allow administrators to enforce security requirements without modifying application code.

---

## Examples

- Minimum Password Length
- Password Expiry
- Maximum Failed Login Attempts
- Session Timeout
- MFA Requirement
- API Rate Limits

---

## Columns

| Column | Type |
|---------|------|
| security_policy_id | UUID |
| policy_name | VARCHAR(150) |
| policy_category | VARCHAR(100) |
| policy_value | JSONB |
| description | TEXT |
| applies_to | ENUM (System, School) |
| school_id | UUID NULL |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Policies may be global or school-specific.
- School Policies override global defaults where permitted.
- Policy changes generate Audit Logs.
- Only authorized users may modify policies.

---

# Table: compliance_logs

## Purpose

Maintains records required for regulatory compliance and internal governance.

Supports compliance with present and future educational and data protection regulations.

Examples include:

- NDPR
- GDPR
- FERPA
- COPPA

---

## Columns

| Column | Type |
|---------|------|
| compliance_log_id | UUID |
| regulation_name | VARCHAR(100) |
| compliance_action | VARCHAR(200) |
| user_id | UUID NULL |
| details | JSONB |
| recorded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Compliance Logs are immutable.
- Compliance records support external audits.
- Logs are retained according to retention policies.

---

# Table: data_access_logs

## Purpose

Tracks access to sensitive platform data.

This table records who viewed confidential information without necessarily modifying it.

Examples include:

- Student Records
- Assessment Results
- Report Cards
- Certificates
- Portfolios
- Financial Information

---

## Columns

| Column | Type |
|---------|------|
| data_access_log_id | UUID |
| user_id | UUID |
| module_name | VARCHAR(100) |
| entity_type | VARCHAR(100) |
| entity_id | UUID |
| access_type | ENUM (View, Download, Export, Print) |
| ip_address | VARCHAR(100) |
| accessed_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every access to protected information is logged.
- Data Access Logs support compliance and investigations.
- Logs remain immutable.
- Export and Print actions receive additional monitoring.

---

# Table: system_health_logs

## Purpose

Stores operational health information for platform infrastructure.

Supports proactive monitoring and troubleshooting.

Tracked Metrics include:

- CPU Usage
- Memory Usage
- Disk Usage
- Database Performance
- Queue Performance
- API Availability
- Background Worker Status

---

## Columns

| Column | Type |
|---------|------|
| system_health_log_id | UUID |
| component_name | VARCHAR(150) |
| metric_name | VARCHAR(150) |
| metric_value | DECIMAL(10,2) |
| status | ENUM (Healthy, Warning, Critical) |
| recorded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Metrics are collected automatically.
- Critical Metrics may trigger Notifications.
- Historical Metrics support trend analysis.
- Health Logs remain available for diagnostics.

---

# Table: permission_groups

## Purpose

Groups related permissions into reusable collections.

Permission Groups simplify role management by allowing administrators to assign collections of permissions instead of individual permissions.

---

## Examples

- Student Management
- Curriculum Management
- Assessment Management
- Report Management
- Financial Management
- Security Administration

---

## Columns

| Column | Type |
|---------|------|
| permission_group_id | UUID |
| group_name | VARCHAR(150) |
| description | TEXT |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Permission Groups may contain multiple Permissions.
- Roles may inherit one or more Permission Groups.
- Permission Groups simplify system administration.
- Group changes are fully audited.

---

# Business Rules

- Every authenticated request must pass Identity Verification, Authentication, Authorization, and Tenant Validation.
- Users may have multiple active Roles.
- Permissions are assigned through Roles and Permission Groups.
- Passwords are securely hashed and never stored in plain text.
- Multi-Factor Authentication is configurable per User or School.
- Sessions automatically expire according to Security Policies.
- API access requires valid credentials and authorization.
- Every business-critical action generates an immutable Audit Log.
- Security Events automatically trigger monitoring and alerts where configured.
- Sensitive data access is fully audited.
- Security Policies are configurable without code changes.
- Compliance records are retained according to regulatory requirements.
- All security-related tables support enterprise monitoring, auditing, and analytics.

Curriculum governance audit requirements:

- Every curriculum lifecycle transition must be logged with previous_status, new_status, actor, timestamp, tenant, and reason.
- Approval and publication events must be captured as separate audit events.
- Generated curriculum actions (generate, regenerate section, convert to draft) must be explicitly tagged in audit metadata.
- Master-to-operational derivation actions must preserve source lineage identifiers in audit payloads.
- Publish, archive, and restore version actions must include immutable version references.

---

# Relationship Overview

```text
Identity

↓

Authentication

↓

Multi-Factor Authentication

↓

Roles

↓

Permissions

↓

Permission Groups

↓

Tenant Validation

↓

Business Modules

↓

Audit Logging

↓

Security Monitoring

↓

Compliance

↓

Analytics
```

---

# Future Enhancements

The Security, Identity & Audit Engine is designed for continuous enhancement.

Future capabilities include:

- Single Sign-On (SSO)
- OAuth 2.0
- OpenID Connect
- SAML Authentication
- WebAuthn / Passkeys
- Biometric Authentication
- Adaptive Risk-Based Authentication
- AI-powered Threat Detection
- Security Information and Event Management (SIEM) Integration
- Zero Trust Security Architecture
- Continuous Session Validation
- Behavioural Analytics
- Automated Compliance Reporting
- Security Dashboard
- Security Scorecards
- Advanced Penetration Detection
- Hardware Security Key Support

---

# Summary

The Security, Identity & Audit Engine is the governance and protection framework of the Nobletech Education Management Platform (NEMP).

It provides enterprise-grade identity management, authentication, authorization, multi-tenant isolation, session management, API security, audit logging, compliance monitoring, and operational security across the entire platform.

Its modular architecture integrates seamlessly with every NEMP subsystem—including the Curriculum Engine, Assessment Engine, CBT Engine, Student Portfolio Engine, Report Publishing Engine, Notification Engine, Certificate Engine, Parent Portal, Student Portal, and Analytics Engine—ensuring that every action is authenticated, authorized, monitored, and auditable while remaining flexible enough to accommodate future security standards and regulatory requirements without requiring structural database redesign.

---

# End of Document

## Phase 2H Update: Security and Audit Enforcement

- Curriculum authoring endpoints now require authenticated identity and permission-based authorization.
- School-scoped tenant isolation checks are enforced in service and repository operations.
- Privileged and state-changing curriculum operations write structured audit records with actor and action metadata.