# Nobletech Education Management Platform (NEMP)

# 02_USER_SECURITY_TABLES

---

# Purpose

This document defines the database tables for users, roles, permissions, authentication, sessions, login history, password reset, and access control.

---

# Tables

1. users
2. roles
3. permissions
4. role_permissions
5. user_roles
6. user_sessions
7. login_history
8. password_reset_tokens

---

# Table: users

| Column | Type | Description |
|------|------|-------------|
| user_id | UUID | Primary key |
| school_id | UUID NULL | School user belongs to |
| first_name | VARCHAR(100) | First name |
| last_name | VARCHAR(100) | Last name |
| email | VARCHAR(150) | Login email |
| phone_number | VARCHAR(50) | Phone number |
| password_hash | TEXT | Encrypted password |
| status | VARCHAR(50) | Active, Inactive, Suspended |
| last_login_at | TIMESTAMP | Last login time |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |
| created_by | UUID | Created by |
| updated_by | UUID | Updated by |
| is_active | BOOLEAN | Active status |
| deleted_at | TIMESTAMP NULL | Soft delete |

---

# Table: roles

| Column | Type | Description |
|------|------|-------------|
| role_id | UUID | Primary key |
| role_name | VARCHAR(100) | Role name |
| role_code | VARCHAR(50) | Unique role code |
| description | TEXT | Role description |
| created_at | TIMESTAMP | Date created |
| updated_at | TIMESTAMP | Date updated |

Roles include:

- Super Administrator
- School Administrator
- Supervisor
- Teacher
- Data Entry Staff

---

# Table: permissions

| Column | Type | Description |
|------|------|-------------|
| permission_id | UUID | Primary key |
| permission_name | VARCHAR(150) | Permission name |
| permission_code | VARCHAR(100) | Unique permission code |
| module_name | VARCHAR(100) | Related module |
| description | TEXT | Permission description |
| created_at | TIMESTAMP | Date created |

---

# Table: role_permissions

| Column | Type | Description |
|------|------|-------------|
| role_permission_id | UUID | Primary key |
| role_id | UUID | Foreign key to roles |
| permission_id | UUID | Foreign key to permissions |
| created_at | TIMESTAMP | Date assigned |

---

# Table: user_roles

| Column | Type | Description |
|------|------|-------------|
| user_role_id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| role_id | UUID | Foreign key to roles |
| school_id | UUID NULL | School context |
| assigned_by | UUID | User who assigned role |
| assigned_at | TIMESTAMP | Date assigned |

---

# Table: user_sessions

| Column | Type | Description |
|------|------|-------------|
| session_id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| refresh_token_hash | TEXT | Hashed refresh token |
| ip_address | VARCHAR(100) | IP address |
| device_info | TEXT | Browser/device details |
| expires_at | TIMESTAMP | Expiry date |
| revoked_at | TIMESTAMP NULL | Revocation date |
| created_at | TIMESTAMP | Date created |

---

# Table: login_history

| Column | Type | Description |
|------|------|-------------|
| login_history_id | UUID | Primary key |
| user_id | UUID NULL | User reference |
| email_attempted | VARCHAR(150) | Email used |
| status | VARCHAR(50) | Success or Failed |
| ip_address | VARCHAR(100) | IP address |
| device_info | TEXT | Device details |
| failure_reason | TEXT NULL | Reason for failure |
| created_at | TIMESTAMP | Login attempt date |

---

# Table: password_reset_tokens

| Column | Type | Description |
|------|------|-------------|
| reset_token_id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| token_hash | TEXT | Hashed reset token |
| expires_at | TIMESTAMP | Expiry date |
| used_at | TIMESTAMP NULL | Date used |
| created_at | TIMESTAMP | Date created |

---

# Business Rules

- Passwords must never be stored in plain text.
- Users may have more than one role.
- School users must only access records belonging to their assigned school.
- Super Administrators may access all schools.
- All login attempts must be recorded.
- Password reset tokens must expire.
- Deleted users should be soft deleted, not permanently removed.
- Every permission must belong to a module.

---

# Relationships

users

↓

user_roles

↓

roles

↓

role_permissions

↓

permissions

users

↓

user_sessions

users

↓

login_history

users

↓

password_reset_tokens

---

# End of Document