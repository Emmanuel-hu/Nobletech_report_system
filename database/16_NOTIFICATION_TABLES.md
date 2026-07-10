# Nobletech Education Management Platform (NEMP)

# 16_NOTIFICATION_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Notification & Communication Engine Tables |
| Document Code | NEMP-DB-NOT-016 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Notification & Communication Engine provides the centralized messaging and communication infrastructure for the Nobletech Education Management Platform (NEMP).

Rather than allowing individual modules to send emails, SMS messages, push notifications, or announcements independently, every communication passes through this engine to ensure consistency, reliability, scalability, auditability, and centralized management.

The Notification Engine integrates seamlessly with:

- Core System
- Curriculum Engine
- Assessment Engine
- CBT Engine
- Student Portfolio Engine
- Report Publishing Engine
- Certificate Engine
- Analytics Engine
- Parent Portal
- Student Portal

The engine supports both real-time and scheduled communication while maintaining complete delivery history and user notification preferences.

---

# Objectives

The Notification & Communication Engine is designed to:

- Centralize all system communications.
- Support multiple communication channels.
- Deliver notifications asynchronously.
- Respect user notification preferences.
- Support reusable notification templates.
- Trigger notifications automatically from system events.
- Support scheduled messaging.
- Track delivery status.
- Maintain complete communication history.
- Support enterprise-scale messaging queues.
- Provide delivery analytics.
- Support future communication channels without database redesign.

---

# Supported Communication Channels

The Notification Engine supports:

- Email
- SMS
- In-App Notifications
- Push Notifications
- WhatsApp Notifications
- Voice Calls (Future)
- Telegram (Future)
- Slack (Future)
- Microsoft Teams (Future)
- Discord (Future)
- Google Classroom (Future)
- Microsoft Outlook (Future)
- Webhooks
- REST API Integrations
- Mobile Application Notifications

---

# Notification Workflow

```text
System Event

↓

Notification Rule

↓

Notification Template

↓

Notification

↓

Recipients

↓

Notification Queue

↓

Delivery Channel

↓

Delivery Confirmation

↓

Notification History

↓

Analytics
```

---

# Operational Notification Tables

The Notification & Communication Engine consists of the following operational tables:

1. notification_templates
2. notification_events
3. notification_rules
4. notification_queue
5. notifications
6. notification_recipients
7. notification_delivery_logs
8. notification_preferences
9. notification_failures
10. notification_history
11. communication_campaigns
12. communication_attachments
13. notification_channels
14. communication_subscriptions

---

# Table: notification_templates

## Purpose

Stores reusable communication templates used throughout the platform.

Templates separate presentation from business logic, allowing messages to be updated without modifying application code.

Templates support multiple languages and communication channels.

---

## Examples

- Welcome Email
- Password Reset
- Student Registration
- Assessment Reminder
- CBT Reminder
- Report Published
- Certificate Issued
- Badge Award
- Promotion Notification
- Parent Meeting Reminder
- Fee Payment Reminder
- Holiday Announcement

---

## Columns

| Column | Type |
|---------|------|
| notification_template_id | UUID |
| template_name | VARCHAR(200) |
| template_category | VARCHAR(100) |
| notification_type | ENUM (Email, SMS, In-App, Push, WhatsApp, Webhook) |
| subject | VARCHAR(255) |
| message_body | TEXT |
| variables | JSONB |
| language | VARCHAR(20) |
| template_version | VARCHAR(20) |
| approval_status | ENUM (Draft, Approved, Archived) |
| is_active | BOOLEAN |
| created_by | UUID |
| approved_by | UUID NULL |
| approved_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Templates are reusable across all modules.
- Templates support dynamic placeholders.
- Templates support multiple languages.
- Only Approved Templates may be used for live notifications.
- Template Versioning preserves historical changes.
- Schools may customize templates independently where permitted.

---

# Table: notification_events

## Purpose

Defines every system event capable of triggering one or more notifications.

System Events provide the bridge between operational modules and the Notification Engine.

Whenever a business event occurs, the Notification Engine evaluates the configured rules and determines whether notifications should be generated.

---

## Examples

- Student Registered
- Student Enrolled
- Teacher Assigned
- Curriculum Published
- Assessment Published
- CBT Scheduled
- CBT Started
- CBT Completed
- Report Approved
- Report Published
- Certificate Issued
- Badge Awarded
- Portfolio Updated
- Password Changed
- User Login
- School Announcement

---

## Columns

| Column | Type |
|---------|------|
| notification_event_id | UUID |
| event_name | VARCHAR(200) |
| event_code | VARCHAR(100) |
| module_name | VARCHAR(150) |
| module_reference | VARCHAR(150) |
| priority | ENUM (Low, Normal, High, Critical) |
| description | TEXT |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Event belongs to one operational module.
- Event Codes must remain unique.
- Events may trigger multiple Notification Rules.
- Inactive Events shall not generate notifications.
- Priority determines notification processing urgency.

---

# Table: notification_rules

## Purpose

Defines how system events trigger notifications.

Notification Rules connect System Events with Notification Templates and determine:

- Who receives the notification.
- Which communication channel is used.
- Whether delivery is immediate or delayed.
- Retry policies.
- Delivery conditions.

This enables the Notification Engine to automate communication without requiring changes to application code.

---

## Example

System Event

Report Published

↓

Recipients

- Student
- Parent
- Class Teacher

↓

Delivery Channels

- Email
- In-App Notification
- SMS

---

## Columns

| Column | Type |
|---------|------|
| notification_rule_id | UUID |
| notification_event_id | UUID |
| notification_template_id | UUID |
| recipient_type | ENUM (Student, Parent, Teacher, Supervisor, Administrator, System, Custom) |
| delivery_channel | ENUM (Email, SMS, In-App, Push, WhatsApp, Webhook) |
| priority | ENUM (Low, Normal, High, Critical) |
| delay_minutes | INTEGER |
| send_once | BOOLEAN |
| retry_policy | VARCHAR(100) |
| enabled | BOOLEAN |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Rule references one System Event.
- One Event may trigger multiple Rules.
- Rules determine recipients and delivery channels.
- Delayed delivery supports scheduled notifications.
- Disabled Rules shall not generate notifications.
- Retry Policies determine behaviour after delivery failures.

---

# Table: notification_queue

## Purpose

Stores notifications waiting for delivery.

Rather than sending notifications immediately, the Notification Engine places them into a processing queue where background workers deliver them asynchronously.

The Queue supports:

- High-volume messaging
- Background processing
- Automatic retries
- Priority-based execution
- Scheduled delivery

---

## Columns

| Column | Type |
|---------|------|
| notification_queue_id | UUID |
| notification_id | UUID |
| priority | ENUM (Low, Normal, High, Critical) |
| worker_node | VARCHAR(100) NULL |
| queue_status | ENUM (Pending, Processing, Completed, Failed, Cancelled) |
| retry_count | INTEGER |
| scheduled_at | TIMESTAMP |
| last_attempt | TIMESTAMP NULL |
| expires_at | TIMESTAMP NULL |
| processed_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- All outbound notifications pass through the Queue.
- Queue processing is asynchronous.
- Priority determines processing order.
- Failed deliveries may be retried automatically.
- Expired Queue Items are cancelled automatically.
- Queue history supports monitoring and analytics.

---

# Table: notifications

## Purpose

Represents every notification generated by the platform.

A Notification is created after a System Event triggers one or more Notification Rules.

Notifications may be delivered through one or multiple communication channels.

---

## Examples

- Welcome to Nobletech Academy
- Your CBT Examination Starts Tomorrow
- Your Report Has Been Published
- Congratulations! You Earned a Badge
- Your Certificate Is Ready

---

## Columns

| Column | Type |
|---------|------|
| notification_id | UUID |
| notification_event_id | UUID |
| notification_template_id | UUID |
| reference_module | VARCHAR(150) |
| reference_id | UUID |
| title | VARCHAR(255) |
| message | TEXT |
| priority | ENUM (Low, Normal, High, Critical) |
| expires_at | TIMESTAMP NULL |
| status | ENUM (Draft, Queued, Processing, Delivered, Failed, Cancelled) |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every Notification originates from one System Event.
- Notifications may reference any operational module.
- Notifications may be delivered through multiple channels.
- Notifications support expiration.
- Notification Status reflects the current delivery lifecycle.

---

# Table: notification_recipients

## Purpose

Stores the recipients assigned to each Notification.

A single Notification may be delivered to multiple recipients through different communication channels.

Recipient delivery is tracked independently.

---

## Examples

Notification

↓

Student

↓

Parent

↓

Teacher

↓

Administrator

---

## Columns

| Column | Type |
|---------|------|
| notification_recipient_id | UUID |
| notification_id | UUID |
| user_id | UUID |
| delivery_channel | ENUM (Email, SMS, In-App, Push, WhatsApp, Webhook) |
| delivery_status | ENUM (Pending, Delivered, Read, Failed) |
| delivery_reference | VARCHAR(255) NULL |
| delivered_at | TIMESTAMP NULL |
| opened_at | TIMESTAMP NULL |
| clicked_at | TIMESTAMP NULL |
| read_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- One Notification may have multiple Recipients.
- Each Recipient maintains an independent delivery status.
- Opened and Read timestamps are recorded when supported.
- Delivery References link to external messaging providers.
- Recipient History supports communication analytics.

---

# Table: notification_delivery_logs

## Purpose

Maintains a detailed log of every notification delivery attempt.

Delivery Logs provide operational visibility into message transmission across all supported communication channels and external providers.

They are essential for:

- Delivery Monitoring
- Troubleshooting
- Performance Analysis
- Provider Auditing
- Compliance Reporting

---

## Supported Providers

Examples include:

- SMTP Email Server
- Microsoft 365
- Gmail SMTP
- Twilio SMS
- Termii SMS
- Firebase Cloud Messaging
- WhatsApp Business API
- Slack API
- Microsoft Teams
- Webhooks
- Custom REST APIs

---

## Columns

| Column | Type |
|---------|------|
| notification_delivery_log_id | UUID |
| notification_id | UUID |
| notification_recipient_id | UUID |
| notification_channel_id | UUID |
| provider_name | VARCHAR(150) |
| provider_reference | VARCHAR(255) NULL |
| request_payload | JSONB |
| response_payload | JSONB |
| response_code | VARCHAR(100) |
| response_message | TEXT |
| latency_ms | INTEGER |
| delivery_status | ENUM (Success, Failed, Pending) |
| delivered_at | TIMESTAMP NULL |
| created_at | TIMESTAMP |

---

## Business Rules

- Every delivery attempt generates one Delivery Log.
- Multiple Delivery Logs may exist for retries.
- Provider responses are stored for diagnostics.
- Delivery latency supports performance monitoring.
- Delivery Logs remain immutable.

---

# Table: notification_preferences

## Purpose

Stores communication preferences for every user.

Preferences allow users to control how and when they receive notifications while ensuring critical system notifications are still delivered.

Preferences may be configured by communication channel and notification category.

---

## Examples

Receive Email ✔

Receive SMS ✘

Receive Push ✔

Receive WhatsApp ✔

Receive Assessment Notifications ✔

Receive Marketing Messages ✘

Receive School Announcements ✔

---

## Columns

| Column | Type |
|---------|------|
| notification_preference_id | UUID |
| user_id | UUID |
| email_enabled | BOOLEAN |
| sms_enabled | BOOLEAN |
| in_app_enabled | BOOLEAN |
| push_enabled | BOOLEAN |
| whatsapp_enabled | BOOLEAN |
| assessment_notifications | BOOLEAN |
| report_notifications | BOOLEAN |
| cbt_notifications | BOOLEAN |
| certificate_notifications | BOOLEAN |
| portfolio_notifications | BOOLEAN |
| announcement_notifications | BOOLEAN |
| marketing_notifications | BOOLEAN |
| allow_critical_notifications | BOOLEAN |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every User has one Notification Preference record.
- Users may update preferences at any time.
- Critical Notifications override channel preferences when permitted.
- Preferences apply across all operational modules.
- Notification Rules respect user preferences before delivery.

---

# Table: notification_failures

## Purpose

Stores failed notification deliveries that require retry, investigation, or administrative intervention.

Failures may result from provider outages, invalid recipient information, authentication issues, or temporary network interruptions.

---

## Examples

- Email Address Not Found
- SMS Gateway Offline
- WhatsApp Authentication Failed
- SMTP Timeout
- Invalid Recipient
- Network Error
- Provider Rate Limit Exceeded

---

## Columns

| Column | Type |
|---------|------|
| notification_failure_id | UUID |
| notification_delivery_log_id | UUID |
| notification_id | UUID |
| notification_recipient_id | UUID |
| error_type | VARCHAR(150) |
| error_message | TEXT |
| retry_attempts | INTEGER |
| resolved | BOOLEAN |
| resolved_by | UUID NULL |
| resolved_at | TIMESTAMP NULL |
| last_attempt_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Every failed delivery creates a Failure Record.
- Failures may trigger automatic retries.
- Resolved Failures remain available for auditing.
- Failure statistics support operational dashboards.
- Permanent Failures may require administrator intervention.

---

# Table: notification_history

## Purpose

Maintains a permanent audit trail of every notification lifecycle event.

Unlike Delivery Logs, which record communication attempts, Notification History records business-level actions performed on notifications.

History supports:

- Security Auditing
- Compliance
- Activity Tracking
- Operational Monitoring
- User Support

---

## Tracked Actions

- Notification Created
- Notification Queued
- Notification Sent
- Notification Delivered
- Notification Read
- Notification Failed
- Notification Cancelled
- Notification Expired
- Notification Deleted (Logical)
- Notification Retried

---

## Columns

| Column | Type |
|---------|------|
| notification_history_id | UUID |
| notification_id | UUID |
| action | VARCHAR(150) |
| performed_by | UUID NULL |
| ip_address | VARCHAR(100) NULL |
| device_information | TEXT NULL |
| details | JSONB |
| created_at | TIMESTAMP |

---

## Business Rules

- Every significant Notification event generates one History record.
- History records are immutable.
- History supports complete audit reconstruction.
- IP Address and Device Information are recorded where applicable.
- Notification History remains permanently available according to retention policies.

---

# Table: communication_campaigns

## Purpose

Stores broadcast communication campaigns initiated by authorized users.

Unlike system-generated notifications, Campaigns are manually or automatically scheduled communications sent to groups of recipients.

Campaigns support:

- School-wide Announcements
- Parent Broadcasts
- Teacher Notices
- Student Updates
- Fee Payment Reminders
- Event Invitations
- Holiday Notifications
- Emergency Alerts
- Marketing Campaigns
- Newsletters

Campaigns may be delivered through multiple communication channels simultaneously.

---

## Columns

| Column | Type |
|---------|------|
| communication_campaign_id | UUID |
| campaign_name | VARCHAR(200) |
| campaign_type | ENUM (Announcement, Reminder, Marketing, Emergency, Newsletter, Event, Custom) |
| target_audience | ENUM (Students, Parents, Teachers, Staff, Administrators, Custom) |
| notification_template_id | UUID NULL |
| scheduled_at | TIMESTAMP NULL |
| started_at | TIMESTAMP NULL |
| completed_at | TIMESTAMP NULL |
| delivery_status | ENUM (Draft, Scheduled, Running, Completed, Cancelled) |
| total_recipients | INTEGER |
| successful_deliveries | INTEGER |
| failed_deliveries | INTEGER |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Campaigns may target one or multiple user groups.
- Campaigns support immediate or scheduled delivery.
- Campaign delivery statistics are permanently retained.
- Campaigns may reuse Notification Templates.
- Cancelled Campaigns retain historical records.

---

# Table: communication_attachments

## Purpose

Stores files attached to Notifications and Communication Campaigns.

Attachments allow messages to include supporting resources and documents.

Supported Attachment Types include:

- PDF Documents
- Images
- Videos
- Certificates
- Report Cards
- Curriculum PDFs
- Assessment Reports
- Presentation Files
- ZIP Archives
- External Links

---

## Columns

| Column | Type |
|---------|------|
| communication_attachment_id | UUID |
| notification_id | UUID NULL |
| communication_campaign_id | UUID NULL |
| file_name | VARCHAR(255) |
| file_type | VARCHAR(100) |
| file_url | TEXT |
| file_size | BIGINT |
| uploaded_by | UUID |
| uploaded_at | TIMESTAMP |

---

## Business Rules

- Attachments may belong to either a Notification or a Campaign.
- Multiple Attachments may be associated with one Notification.
- Files are stored using the platform's configured storage provider.
- Attachment metadata is retained for auditing.

---

# Table: notification_channels

## Purpose

Stores configuration settings for all communication providers used by the platform.

This allows communication providers to be configured without modifying application code.

Supported providers include:

- SMTP Email
- Microsoft 365
- Gmail SMTP
- Twilio
- Termii
- Firebase Cloud Messaging
- WhatsApp Business API
- Slack API
- Microsoft Teams
- Discord
- Webhooks
- Custom REST APIs

---

## Columns

| Column | Type |
|---------|------|
| notification_channel_id | UUID |
| channel_name | VARCHAR(150) |
| channel_type | ENUM (Email, SMS, In-App, Push, WhatsApp, Webhook, API) |
| provider_name | VARCHAR(150) |
| configuration | JSONB |
| priority | INTEGER |
| is_active | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Channel configurations are managed by Super Administrators.
- Multiple Providers may exist for the same Channel Type.
- Channels may be prioritized for failover.
- Configuration changes are logged.

---

# Table: communication_subscriptions

## Purpose

Allows users to subscribe to optional communication categories.

Unlike Notification Preferences, which control delivery methods, Subscriptions determine the types of optional communications a user wishes to receive.

Examples include:

- Coding & Robotics News
- School Events
- Summer Camp Updates
- Bootcamp Announcements
- AI Programme Updates
- Competitions
- Scholarships
- Product Updates
- Newsletters

---

## Columns

| Column | Type |
|---------|------|
| communication_subscription_id | UUID |
| user_id | UUID |
| subscription_category | VARCHAR(150) |
| subscribed | BOOLEAN |
| subscribed_at | TIMESTAMP |
| unsubscribed_at | TIMESTAMP NULL |
| updated_at | TIMESTAMP |

---

## Business Rules

- Users may subscribe to multiple communication categories.
- Subscriptions affect only optional communications.
- Mandatory system notifications ignore subscription settings.
- Subscription history is retained for auditing.

---

# Business Rules

- All system-generated communications originate from predefined System Events.
- Notification Templates are reusable and version-controlled.
- Notification Rules determine recipients, channels, and delivery timing.
- All outbound communications pass through the Notification Queue.
- Delivery attempts are fully logged.
- User Notification Preferences are respected unless overridden by Critical Notifications.
- Every Notification maintains a permanent audit history.
- Campaigns support scheduled and broadcast messaging.
- Attachments are securely linked to Notifications or Campaigns.
- Communication Providers are centrally managed through Notification Channels.
- User Subscriptions control optional communications without affecting mandatory system messages.
- Every communication action supports enterprise auditing and analytics.

---

# Relationship Overview

```text
System Event

↓

Notification Rule

↓

Notification Template

↓

Notification

↓

Recipients

↓

Notification Queue

↓

Notification Channel

↓

Delivery Service

↓

Delivery Logs

↓

Notification History

↓

Communication Campaigns

↓

Analytics
```

---

# Future Enhancements

The Notification & Communication Engine is designed for continuous expansion.

Future capabilities include:

- WhatsApp Business API Integration
- Firebase Push Notifications
- Microsoft Teams Integration
- Slack Integration
- Discord Integration
- Google Classroom Notifications
- Microsoft Outlook Integration
- Voice Call Notifications
- AI-generated Notification Content
- AI-powered Delivery Optimization
- Multi-language Template Translation
- Smart Recipient Segmentation
- Scheduled Campaign Automation
- Parent Broadcast Messaging
- Student Broadcast Messaging
- SMS Failover Routing
- Email Failover Routing
- Delivery Performance Analytics
- Communication Dashboards
- Mobile Application Messaging
- Read Receipt Analytics
- Click-through Analytics

---

# Summary

The Notification & Communication Engine serves as the centralized communication infrastructure of the Nobletech Education Management Platform (NEMP).

It provides a secure, scalable, configurable, and auditable messaging framework that supports system-generated notifications, scheduled campaigns, broadcast communications, user preferences, multi-channel delivery, provider management, and enterprise-grade communication analytics.

Its modular architecture integrates seamlessly with the Core System, Curriculum Engine, Assessment Engine, CBT Engine, Student Portfolio Engine, Report Publishing Engine, Certificate Engine, Analytics Engine, Parent Portal, and Student Portal, ensuring consistent and reliable communication across the entire NEMP ecosystem while remaining flexible enough to support future communication technologies without requiring structural database redesign.

---

# End of Document