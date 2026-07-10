# Nobletech Report System (NRS)

# Workflows

Version: 1.0

---

# Purpose

This document defines how users interact with the system from login until report generation.

It serves as the operational guide for developers, testers, UI designers and GitHub Copilot.

---

# Main Workflow

Login

↓

Dashboard

↓

Select School

↓

Select Session

↓

Select Term

↓

Select Class

↓

Student List

↓

Open Student Report

↓

Enter Assessment

↓

Save Draft

↓

Submit Report

↓

Supervisor Review

↓

Approve Report

↓

Generate PDF

↓

Download

↓

Print

---

# Login Workflow

User enters

Email

Password

↓

Authenticate

↓

Success

↓

Dashboard

If authentication fails

↓

Display error message

↓

Allow retry

---

# School Selection Workflow

User selects school

↓

System loads

Logo

Colours

Template

Grading System

Subjects

Assessment Template

Learning Targets

Instructor Information

---

# Student Assessment Workflow

Teacher opens student report

↓

Enter Practical Score

↓

Select Coding Skills Rating

↓

Select Robotics Skills Rating

↓

Select STEAM Skills Rating

↓

Complete Project Evaluation

↓

Enter General Comment

↓

Save Draft

---

# Save Draft Workflow

Teacher clicks Save Draft

↓

System validates data

↓

Save progress

↓

Allow future editing

---

# Report Submission Workflow

Teacher clicks Submit

↓

Validation

↓

Check Required Fields

↓

Lock Draft

↓

Send to Supervisor

↓

Status becomes

Pending Approval

---

# Approval Workflow

Supervisor opens report

↓

Review

↓

Approve

OR

Reject

↓

If Approved

↓

Report Locked

↓

Generate PDF

↓

Ready for Download

---

# PDF Workflow

Approved Report

↓

Load School Branding

↓

Load Student Information

↓

Load Assessment Data

↓

Load Instructor Signature

↓

Render Report

↓

Generate PDF

↓

Store Copy

↓

Download

↓

Print

---

# Student Search Workflow

Search by

Name

Admission Number

Class

Parent Name

↓

Display Student List

↓

Open Report

---

# Multi-School Workflow

Super Admin

↓

View All Schools

↓

Select School

↓

Manage School

School Administrator

↓

Can only view assigned school

---

# User Management Workflow

Create User

↓

Assign Role

↓

Assign School

↓

Activate Account

↓

User Login

---

# School Branding Workflow

Admin uploads

Logo

↓

Upload Signature

↓

Choose Primary Colour

↓

Choose Secondary Colour

↓

Choose Report Template

↓

Save

↓

Apply to all Reports

---

# Bulk Student Import Workflow

Download Excel Template

↓

Complete Student Information

↓

Upload Excel

↓

Validate Data

↓

Import Students

↓

Display Import Summary

---

# Audit Workflow

Every action records

User

Action

Date

Time

IP Address

Affected Record

---

# Error Handling Workflow

Validation Error

↓

Display Friendly Message

↓

Highlight Incorrect Field

↓

Prevent Submission

---

# Future Workflows

Parent Portal

Student Portal

CBT

Certificate Generation

Online Payment

AI Report Assistant

Mobile Application
