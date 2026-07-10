# Nobletech Report System (NRS)

# Business Rules

Version: 1.0

---

# Purpose

This document defines the business logic and operational rules that govern the Nobletech Report System.

Business rules ensure data consistency, security, and standardization across all schools using the platform.

---

# School Rules

1. Every school must have a unique profile.

2. Every school must have its own branding.

3. Every school may have its own report template.

4. Every school may use its own grading system.

5. Every school has its own users.

---

# User Rules

1. Every user must belong to one school.

2. Every user must have at least one role.

3. Users can only access information they are authorized to view.

4. Passwords must never be stored in plain text.

5. Users can only log in with active accounts.

---

# Student Rules

1. Every student belongs to one school.

2. Every student belongs to one class.

3. Every student belongs to one academic session.

4. Admission numbers must be unique within a school.

5. Student records cannot be permanently deleted.

---

# Teacher Rules

1. Teachers can only access assigned classes.

2. Teachers cannot edit another teacher's reports unless authorized.

3. Teachers can save reports as drafts.

4. Teachers can submit reports for approval.

---

# Assessment Rules

1. Every assessment belongs to one student.

2. Every assessment belongs to one term.

3. Every assessment belongs to one session.

4. Scores must be within configured limits.

5. The system calculates totals automatically.

6. The system calculates grades automatically.

7. Remarks are generated automatically unless manually overridden.

---

# Skills Assessment Rules

1. Schools may define their own coding skills.

2. Schools may define their own robotics skills.

3. Schools may define their own STEAM skills.

4. Skills can be reordered by administrators.

---

# Report Rules

1. Every report belongs to one student.

2. Every report belongs to one school.

3. Every report belongs to one session.

4. Every report belongs to one term.

5. Reports are generated from approved templates.

6. Reports can be saved as drafts.

7. Reports must be approved before final PDF generation.

8. Approved reports become read-only unless reopened by an administrator.

---

# PDF Rules

1. Every generated PDF must match the approved school template.

2. Logos, colours, signatures and stamps are applied automatically.

3. PDFs must be printable on A4 paper.

4. PDFs may be downloaded unlimited times.

---

# Security Rules

1. All communication must use HTTPS.

2. Passwords must be encrypted.

3. Every important action is recorded.

4. Session timeout must occur after inactivity.

5. Failed login attempts should be monitored.

---

# Audit Rules

The following actions must be logged:

Login

Logout

Create Student

Edit Student

Delete Student

Generate Report

Print Report

Download PDF

Update School Branding

Update Assessment Template

---

# Future Rules

Parent Portal

Student Portal

AI Comment Generator

AI Performance Analytics

Online Payments

Certificate Generator

CBT Module