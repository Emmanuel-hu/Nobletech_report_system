# Nobletech Education Management Platform (NEMP)

# 18_ANALYTICS_AND_DASHBOARD_TABLES

---

# Document Information

| Item | Details |
|------|---------|
| Project | Nobletech Education Management Platform (NEMP) |
| Document | Analytics, Dashboard & Business Intelligence Engine Tables |
| Document Code | NEMP-DB-ANA-018 |
| Version | 1.0 |
| Status | Approved |
| Database | PostgreSQL |

---

# Purpose

The Analytics, Dashboard & Business Intelligence Engine provides real-time operational, academic, financial, and business intelligence across the Nobletech Education Management Platform (NEMP).

The engine consolidates information from every operational module to generate dashboards, reports, charts, key performance indicators (KPIs), trends, forecasts, and executive insights that support evidence-based decision-making.

Unlike traditional reporting systems that simply display historical information, the NEMP Analytics Engine continuously transforms operational data into actionable intelligence for administrators, teachers, supervisors, and executives.

The engine integrates seamlessly with:

- Core System
- School Management
- Student Management
- Curriculum Engine
- Assessment Engine
- CBT Engine
- Student Portfolio Engine
- Report Publishing Engine
- Certificate Engine
- Notification Engine
- Security & Audit Engine
- Finance & Billing (Future)
- Parent Portal
- Student Portal

---

# Objectives

The Analytics Engine is designed to:

- Provide role-based dashboards.
- Deliver real-time operational analytics.
- Measure academic performance.
- Monitor curriculum implementation.
- Evaluate teacher performance.
- Track student growth and learning outcomes.
- Monitor CBT performance and integrity.
- Generate executive reports.
- Calculate Key Performance Indicators (KPIs).
- Support strategic planning through Business Intelligence.
- Enable historical trend analysis.
- Provide configurable analytics exports.
- Support predictive analytics and AI-driven insights in future releases.

---

# Analytics Architecture

```text
Operational Modules

↓

Data Aggregation

↓

Metrics Engine

↓

Analytics Processing

↓

Historical Snapshots

↓

Business Intelligence

↓

Dashboards

↓

Charts & Visualizations

↓

Reports

↓

Executive Insights

↓

Decision Making
```

---

# Dashboard Categories

The Analytics Engine provides specialized dashboards for different categories of users.

1. Super Administrator Dashboard
2. School Administrator Dashboard
3. Academic Administrator Dashboard
4. Finance Dashboard
5. Teacher Dashboard
6. Supervisor Dashboard
7. Curriculum Dashboard
8. Assessment Dashboard
9. CBT Dashboard
10. Student Dashboard (Future)
11. Parent Dashboard (Future)
12. Executive Dashboard

---

# Operational Analytics Tables

The Analytics & Business Intelligence Engine consists of the following operational tables:

1. dashboard_widgets
2. dashboard_layouts
3. dashboard_preferences
4. analytics_metrics
5. analytics_snapshots
6. analytics_reports
7. student_statistics
8. teacher_statistics
9. curriculum_statistics
10. assessment_statistics
11. cbt_statistics
12. report_statistics
13. attendance_statistics
14. achievement_statistics
15. portfolio_statistics
16. financial_statistics
17. subscription_statistics
18. security_statistics
19. notification_statistics
20. api_statistics
21. system_statistics
22. analytics_schedules
23. analytics_exports
24. predictive_models (Future)

---

# Table: dashboard_widgets

## Purpose

Defines reusable dashboard widgets displayed across the platform.

Widgets provide visual summaries of operational, academic, financial, and technical information.

Widgets are reusable and configurable, allowing dashboards to be customized without modifying application code.

---

## Examples

- Total Schools
- Total Students
- Active Teachers
- Curriculum Completion
- Assessment Performance
- Attendance Rate
- Reports Generated
- Certificates Issued
- Revenue Summary
- System Health
- Active Sessions
- Storage Usage

---

## Supported Widget Types

- Statistic Card
- Line Chart
- Bar Chart
- Pie Chart
- Doughnut Chart
- Gauge
- Heat Map
- Data Table
- Progress Indicator
- KPI Card
- Timeline
- Calendar
- Geographic Map

---

## Columns

| Column | Type |
|---------|------|
| widget_id | UUID |
| widget_name | VARCHAR(200) |
| widget_code | VARCHAR(100) |
| widget_type | ENUM (Card, Chart, Table, Gauge, Map, Timeline, KPI) |
| module_name | VARCHAR(100) |
| widget_icon | VARCHAR(100) |
| widget_colour | VARCHAR(50) |
| configuration | JSONB |
| refresh_interval | INTEGER |
| is_system_widget | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Widgets are reusable.
- Widgets may appear on multiple dashboards.
- Widgets are configurable through JSON configuration.
- System Widgets cannot be deleted.
- Widget refresh intervals are configurable.

---

# Table: dashboard_layouts

## Purpose

Defines dashboard layouts available to different user roles.

Layouts determine the placement and arrangement of dashboard widgets.

Each role may have one default layout while users may customize their own layouts independently.

---

## Columns

| Column | Type |
|---------|------|
| layout_id | UUID |
| role_id | UUID |
| layout_name | VARCHAR(150) |
| layout_configuration | JSONB |
| default_layout | BOOLEAN |
| shared_layout | BOOLEAN |
| layout_version | VARCHAR(20) |
| created_by | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Roles may have multiple layouts.
- Only one default layout is permitted per role.
- Shared layouts may be used across multiple schools where applicable.
- Layout changes are version-controlled.

---

# Table: dashboard_preferences

## Purpose

Stores personalized dashboard settings for individual users.

Preferences allow users to customize how dashboard information is presented without affecting system-wide layouts.

---

## Examples

- Default Dashboard
- Favourite Widgets
- Hidden Widgets
- Theme
- Chart Preferences
- Refresh Frequency

---

## Columns

| Column | Type |
|---------|------|
| preference_id | UUID |
| user_id | UUID |
| default_dashboard | VARCHAR(100) |
| favourite_widgets | JSONB |
| collapsed_widgets | JSONB |
| chart_preferences | JSONB |
| theme | ENUM (Light, Dark, System) |
| refresh_interval | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Business Rules

- Every user may maintain one Dashboard Preference profile.
- Dashboard customization is user-specific.
- Preferences never modify system layouts.
- User preferences may be reset without affecting dashboard data.

---

# Table: analytics_metrics

## Purpose

Stores calculated Key Performance Indicators (KPIs) and operational metrics generated across the platform.

Metrics are calculated automatically from operational data and provide the foundation for dashboards, reports, charts, and business intelligence.

Metrics may be calculated at different organizational levels including:

- System
- School
- Session
- Term
- Class
- Programme Component
- Student
- Teacher

---

## Examples

Academic Metrics

- Average Student Score
- Pass Rate
- Promotion Rate
- Curriculum Completion

Operational Metrics

- Report Publication Rate
- Assessment Completion
- Attendance Rate

Business Metrics

- Active Schools
- Active Students
- Subscription Renewal Rate

Technical Metrics

- API Response Time
- PDF Generation Time
- Login Success Rate

---

## Columns

| Column | Type |
|---------|------|
| metric_id | UUID |
| metric_code | VARCHAR(100) |
| metric_name | VARCHAR(200) |
| metric_category | VARCHAR(100) |
| calculation_method | VARCHAR(150) |
| metric_value | DECIMAL(15,4) |
| measurement_unit | VARCHAR(50) |
| school_id | UUID NULL |
| academic_session_id | UUID NULL |
| academic_term_id | UUID NULL |
| calculated_by | UUID NULL |
| snapshot_frequency | ENUM (Real-Time, Hourly, Daily, Weekly, Monthly, Termly, Yearly) |
| calculated_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Metrics are automatically recalculated based on configured schedules.
- Metrics may be generated globally or per school.
- Metric calculations are version-controlled.
- Historical metric values are preserved through Snapshots.

---

# Table: analytics_snapshots

## Purpose

Stores historical copies of calculated metrics for trend analysis and long-term reporting.

Snapshots ensure historical values remain unchanged even when underlying operational data changes.

---

## Examples

- Daily Attendance Snapshot
- Weekly Performance Snapshot
- Monthly Revenue Snapshot
- End-of-Term Academic Snapshot
- Year-End Performance Snapshot

---

## Columns

| Column | Type |
|---------|------|
| snapshot_id | UUID |
| metric_id | UUID |
| snapshot_name | VARCHAR(200) |
| snapshot_value | DECIMAL(15,4) |
| snapshot_period | VARCHAR(100) |
| snapshot_date | DATE |
| created_at | TIMESTAMP |

---

## Business Rules

- Snapshots are immutable.
- Historical values are never recalculated.
- Snapshot frequency follows Analytics Schedules.
- Snapshots support trend charts and executive reports.

---

# Table: analytics_reports

## Purpose

Stores generated analytical reports produced by the Analytics Engine.

Reports may be generated on demand or automatically according to configured schedules.

Supported export formats include:

- PDF
- Excel
- CSV
- JSON

---

## Examples

- Executive Dashboard Report
- Student Performance Analysis
- Teacher Productivity Report
- Curriculum Coverage Report
- Assessment Summary
- Attendance Analysis
- Financial Summary

---

## Columns

| Column | Type |
|---------|------|
| analytics_report_id | UUID |
| report_name | VARCHAR(200) |
| report_type | VARCHAR(100) |
| school_id | UUID NULL |
| generated_by | UUID |
| export_format | ENUM (PDF, Excel, CSV, JSON) |
| file_url | TEXT |
| generated_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Reports may be generated manually or automatically.
- Generated Reports remain available for historical reference.
- Reports inherit user permissions.
- Export formats are configurable.

---

# Table: student_statistics

## Purpose

Stores aggregated statistics describing each student's academic growth and overall learning progress.

These statistics power Student Dashboards, Parent Dashboards, Executive Reports, and Predictive Analytics.

---

## Tracked Metrics

- Average Score
- Attendance Percentage
- Projects Completed
- Competency Level
- Learning Growth
- Portfolio Score
- Skills Verified
- Certificates Earned
- Badges Earned
- Learning Hours

---

## Columns

| Column | Type |
|---------|------|
| student_statistic_id | UUID |
| student_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| average_score | DECIMAL(6,2) |
| attendance_percentage | DECIMAL(5,2) |
| learning_growth | DECIMAL(6,2) |
| competency_level | VARCHAR(100) |
| learning_hours | DECIMAL(6,2) |
| projects_completed | INTEGER |
| skills_verified | INTEGER |
| badges_earned | INTEGER |
| certificates_earned | INTEGER |
| portfolio_score | DECIMAL(6,2) |
| updated_at | TIMESTAMP |

---

## Business Rules

- Statistics are generated automatically.
- Values are recalculated after assessments and report publication.
- Historical values are retained through Analytics Snapshots.
- Student Statistics feed Predictive Analytics.

---

# Table: teacher_statistics

## Purpose

Stores aggregated teaching performance indicators for every teacher.

Statistics support performance evaluation, workload monitoring, professional development, and administrative decision-making.

---

## Tracked Metrics

- Classes Assigned
- Students Managed
- Curriculum Completion
- Assessments Completed
- Reports Published
- Average Student Performance
- Attendance Submission Rate
- Feedback Timeliness

---

## Columns

| Column | Type |
|---------|------|
| teacher_statistic_id | UUID |
| teacher_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| classes_assigned | INTEGER |
| students_managed | INTEGER |
| assessments_completed | INTEGER |
| reports_generated | INTEGER |
| curriculum_completion_percentage | DECIMAL(5,2) |
| average_class_score | DECIMAL(6,2) |
| attendance_submission_rate | DECIMAL(5,2) |
| average_feedback_time | DECIMAL(6,2) |
| updated_at | TIMESTAMP |

---

## Business Rules

- Teacher Statistics are updated automatically.
- Performance indicators support appraisal processes.
- Data contributes to Executive Dashboards.
- Historical trends are retained.

---

# Table: curriculum_statistics

## Purpose

Measures curriculum implementation, teaching progress, and programme completion across schools and classes.

Curriculum Statistics enable administrators to monitor curriculum delivery and identify delays or gaps.

---

## Tracked Metrics

- Concepts Completed
- Topics Completed
- Projects Completed
- Learning Outcomes Achieved
- Curriculum Completion
- Delivery Progress
- Average Completion Time

---

## Columns

| Column | Type |
|---------|------|
| curriculum_statistic_id | UUID |
| curriculum_id | UUID |
| school_id | UUID |
| completion_percentage | DECIMAL(5,2) |
| concepts_completed | INTEGER |
| topics_completed | INTEGER |
| projects_completed | INTEGER |
| learning_outcomes_completed | INTEGER |
| average_completion_time | DECIMAL(6,2) |
| curriculum_delay_days | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- Statistics are calculated continuously.
- Curriculum delays are highlighted on dashboards.
- Completion rates support academic planning.
- Historical performance is retained through Analytics Snapshots.

---

# Table: assessment_statistics

## Purpose

Stores aggregated statistics for assessments conducted across the platform.

Assessment Statistics help administrators evaluate student performance, assessment quality, grading consistency, and learning outcomes.

These statistics support curriculum improvement, teacher evaluation, and academic planning.

---

## Tracked Metrics

- Average Score
- Highest Score
- Lowest Score
- Median Score
- Pass Rate
- Grade Distribution
- Competency Distribution
- Difficulty Index
- Discrimination Index
- Assessment Completion Rate

---

## Columns

| Column | Type |
|---------|------|
| assessment_statistic_id | UUID |
| assessment_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| average_score | DECIMAL(6,2) |
| highest_score | DECIMAL(6,2) |
| lowest_score | DECIMAL(6,2) |
| median_score | DECIMAL(6,2) |
| pass_rate | DECIMAL(5,2) |
| completion_rate | DECIMAL(5,2) |
| difficulty_index | DECIMAL(5,2) |
| discrimination_index | DECIMAL(5,2) |
| grade_distribution | JSONB |
| competency_distribution | JSONB |
| updated_at | TIMESTAMP |

---

## Business Rules

- Statistics are automatically recalculated after assessment publication.
- Grade distributions are stored in JSON format.
- Historical values are preserved through Analytics Snapshots.
- Assessment quality indicators support curriculum review.

---

# Table: cbt_statistics

## Purpose

Stores analytical information about Computer-Based Tests (CBT).

These statistics evaluate examination quality, candidate performance, security, and system efficiency.

---

## Tracked Metrics

- Total Candidates
- Completion Rate
- Average Completion Time
- Average Score
- Pass Rate
- Average Attempts
- Question Accuracy
- Time per Question
- Browser Violations
- Security Incidents

---

## Columns

| Column | Type |
|---------|------|
| cbt_statistic_id | UUID |
| examination_id | UUID |
| school_id | UUID |
| total_candidates | INTEGER |
| completed_candidates | INTEGER |
| average_score | DECIMAL(6,2) |
| average_completion_time | INTEGER |
| average_time_per_question | DECIMAL(6,2) |
| pass_rate | DECIMAL(5,2) |
| average_attempts | DECIMAL(6,2) |
| question_accuracy | DECIMAL(5,2) |
| browser_violations | INTEGER |
| security_incidents | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- CBT statistics are generated automatically after examinations.
- Security incidents are synchronized with the Security Engine.
- Statistics support examination quality improvement.
- Historical performance remains available for analysis.

---

# Table: report_statistics

## Purpose

Measures report generation efficiency and publishing activities.

These statistics monitor report production performance, approval workflows, downloads, and verification activities.

---

## Tracked Metrics

- Reports Generated
- Reports Published
- Reports Corrected
- Average Approval Time
- Average Generation Time
- Average PDF Size
- Downloads
- Verifications
- Rejected Reports

---

## Columns

| Column | Type |
|---------|------|
| report_statistic_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| reports_generated | INTEGER |
| reports_published | INTEGER |
| reports_corrected | INTEGER |
| reports_rejected | INTEGER |
| average_generation_time | INTEGER |
| average_approval_time | INTEGER |
| average_pdf_size | BIGINT |
| downloads | INTEGER |
| verifications | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- Statistics update automatically after report publication.
- Download statistics synchronize with the Report Engine.
- Verification statistics synchronize with QR verification records.
- Historical values are retained.

---

# Table: attendance_statistics

## Purpose

Provides attendance analytics across students, classes, and schools.

Attendance Statistics support early intervention, student welfare monitoring, and academic planning.

---

## Tracked Metrics

- Attendance Percentage
- Daily Attendance
- Monthly Attendance
- Term Attendance
- Excused Absence
- Unexcused Absence
- Late Arrivals
- Early Departures
- Attendance Trend

---

## Columns

| Column | Type |
|---------|------|
| attendance_statistic_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| attendance_percentage | DECIMAL(5,2) |
| excused_absences | INTEGER |
| unexcused_absences | INTEGER |
| late_arrivals | INTEGER |
| early_departures | INTEGER |
| attendance_trend | VARCHAR(50) |
| updated_at | TIMESTAMP |

---

## Business Rules

- Attendance statistics are updated daily.
- Trends are calculated automatically.
- Attendance contributes to Predictive Analytics.
- Historical attendance remains available.

---

# Table: achievement_statistics

## Purpose

Measures student achievements across all academic and extracurricular programmes.

Achievement Statistics recognize excellence and support reward programmes.

---

## Tracked Metrics

- Badges Awarded
- Certificates Issued
- Competition Wins
- Top Skills
- Top Performers
- Programme Completion
- Awards Received

---

## Columns

| Column | Type |
|---------|------|
| achievement_statistic_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| badges_awarded | INTEGER |
| certificates_issued | INTEGER |
| competition_wins | INTEGER |
| awards_received | INTEGER |
| top_skill | VARCHAR(200) |
| top_performer_id | UUID NULL |
| updated_at | TIMESTAMP |

---

## Business Rules

- Achievement statistics synchronize with the Assessment and Portfolio Engines.
- Awards contribute to student recognition dashboards.
- Historical achievement data is retained permanently.

---

# Table: portfolio_statistics

## Purpose

Tracks the growth and usage of student digital portfolios.

Portfolio Statistics provide insights into student engagement, project completion, evidence uploads, and portfolio visibility.

---

## Tracked Metrics

- Portfolio Count
- Projects Uploaded
- Evidence Files
- Skills Verified
- Portfolio Views
- Portfolio Downloads
- Portfolio Shares
- Featured Projects

---

## Columns

| Column | Type |
|---------|------|
| portfolio_statistic_id | UUID |
| school_id | UUID |
| academic_session_id | UUID |
| academic_term_id | UUID |
| portfolio_count | INTEGER |
| projects_uploaded | INTEGER |
| evidence_files | INTEGER |
| skills_verified | INTEGER |
| portfolio_views | INTEGER |
| portfolio_downloads | INTEGER |
| portfolio_shares | INTEGER |
| featured_projects | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- Portfolio statistics synchronize automatically with the Student Portfolio Engine.
- Portfolio engagement supports student development analysis.
- Public portfolio views are tracked separately from internal views.
- Historical portfolio analytics are retained indefinitely.

---

# Table: financial_statistics

## Purpose

Stores financial performance metrics for schools and the overall platform.

Financial Statistics support revenue analysis, payment monitoring, subscription tracking, budgeting, and executive financial reporting.

---

## Tracked Metrics

- Revenue
- Outstanding Fees
- Payments Received
- Refunds
- Expenses
- Net Income
- Subscription Income

---

## Columns

| Column | Type |
|---------|------|
| financial_statistic_id | UUID |
| school_id | UUID NULL |
| academic_session_id | UUID NULL |
| academic_term_id | UUID NULL |
| total_revenue | DECIMAL(15,2) |
| total_expenses | DECIMAL(15,2) |
| outstanding_fees | DECIMAL(15,2) |
| subscription_income | DECIMAL(15,2) |
| refunds | DECIMAL(15,2) |
| net_income | DECIMAL(15,2) |
| updated_at | TIMESTAMP |

---

## Business Rules

- Financial Statistics synchronize with the Finance & Billing module.
- Revenue calculations are automatic.
- Historical financial records remain immutable.

---

# Table: subscription_statistics

## Purpose

Tracks subscription performance across schools using the NEMP platform.

---

## Tracked Metrics

- Active Schools
- Active Subscriptions
- Expired Subscriptions
- Renewals
- Trial Schools
- Subscription Growth

---

## Columns

| Column | Type |
|---------|------|
| subscription_statistic_id | UUID |
| active_subscriptions | INTEGER |
| expired_subscriptions | INTEGER |
| trial_subscriptions | INTEGER |
| renewals | INTEGER |
| subscription_growth_rate | DECIMAL(5,2) |
| updated_at | TIMESTAMP |

---

## Business Rules

- Subscription statistics are generated automatically.
- Renewal trends support executive forecasting.

---

# Table: security_statistics

## Purpose

Provides analytical insights into platform security and authentication.

---

## Tracked Metrics

- Successful Logins
- Failed Logins
- Locked Accounts
- Active Sessions
- Security Incidents
- MFA Adoption Rate

---

## Columns

| Column | Type |
|---------|------|
| security_statistic_id | UUID |
| successful_logins | INTEGER |
| failed_logins | INTEGER |
| locked_accounts | INTEGER |
| active_sessions | INTEGER |
| security_incidents | INTEGER |
| mfa_enabled_users | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- Statistics synchronize with the Security & Audit Engine.
- Critical incidents trigger executive alerts where configured.

---

# Table: notification_statistics

## Purpose

Measures communication performance across the Notification Engine.

---

## Tracked Metrics

- Emails Sent
- SMS Sent
- Push Notifications
- WhatsApp Messages
- Delivery Rate
- Read Rate
- Failed Deliveries

---

## Columns

| Column | Type |
|---------|------|
| notification_statistic_id | UUID |
| emails_sent | INTEGER |
| sms_sent | INTEGER |
| push_notifications | INTEGER |
| whatsapp_messages | INTEGER |
| delivery_rate | DECIMAL(5,2) |
| read_rate | DECIMAL(5,2) |
| failed_deliveries | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- Statistics synchronize automatically with the Notification Engine.
- Delivery metrics support communication optimization.

---

# Table: api_statistics

## Purpose

Tracks API usage and integration performance.

---

## Tracked Metrics

- API Calls
- Average Response Time
- Failed Requests
- Rate Limit Violations
- External Integrations

---

## Columns

| Column | Type |
|---------|------|
| api_statistic_id | UUID |
| total_api_calls | BIGINT |
| failed_requests | BIGINT |
| average_response_time | DECIMAL(8,2) |
| rate_limit_violations | INTEGER |
| active_integrations | INTEGER |
| updated_at | TIMESTAMP |

---

## Business Rules

- API Statistics are updated continuously.
- Historical trends support infrastructure planning.

---

# Table: system_statistics

## Purpose

Monitors platform performance and infrastructure health.

---

## Tracked Metrics

- Active Users
- Database Size
- Storage Usage
- CPU Usage
- Memory Usage
- Queue Size
- PDF Generation
- Background Jobs

---

## Columns

| Column | Type |
|---------|------|
| system_statistic_id | UUID |
| statistic_name | VARCHAR(200) |
| statistic_value | DECIMAL(15,2) |
| measurement_unit | VARCHAR(50) |
| recorded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Statistics are collected automatically.
- Critical thresholds trigger system alerts.

---

# Table: analytics_schedules

## Purpose

Defines automatic analytics generation schedules.

Supported schedules include:

- Hourly
- Daily
- Weekly
- Monthly
- Termly
- Yearly

---

## Columns

| Column | Type |
|---------|------|
| analytics_schedule_id | UUID |
| schedule_name | VARCHAR(150) |
| schedule_frequency | ENUM (Hourly, Daily, Weekly, Monthly, Termly, Yearly) |
| report_type | VARCHAR(100) |
| enabled | BOOLEAN |
| last_run | TIMESTAMP NULL |
| next_run | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Business Rules

- Scheduled jobs execute automatically.
- Failed schedules are logged.
- Administrators may enable or disable schedules.

---

# Table: analytics_exports

## Purpose

Tracks exported analytics reports.

Supported formats:

- PDF
- Excel
- CSV
- JSON

---

## Columns

| Column | Type |
|---------|------|
| analytics_export_id | UUID |
| analytics_report_id | UUID |
| export_format | ENUM (PDF, Excel, CSV, JSON) |
| exported_by | UUID |
| file_url | TEXT |
| exported_at | TIMESTAMP |

---

## Business Rules

- Export history is retained permanently.
- Export permissions follow Role-Based Access Control.

---

# Table: predictive_models (Future)

## Purpose

Supports future AI-powered predictive analytics.

Planned capabilities include:

- Student Performance Prediction
- Attendance Risk Prediction
- Dropout Risk Analysis
- Curriculum Completion Forecast
- Fee Payment Prediction
- Resource Demand Forecasting
- Teacher Workload Forecasting

---

## Columns

| Column | Type |
|---------|------|
| predictive_model_id | UUID |
| model_name | VARCHAR(200) |
| model_type | VARCHAR(100) |
| model_version | VARCHAR(50) |
| accuracy_score | DECIMAL(5,2) |
| training_date | TIMESTAMP |
| status | ENUM (Training, Active, Retired) |
| created_at | TIMESTAMP |

---

# Business Rules

- Dashboards are role-based.
- Widgets are configurable.
- KPI calculations are automated.
- Analytics never modify operational data.
- Historical snapshots remain immutable.
- Long-running analytics execute asynchronously.
- Schools only access their own analytics.
- Super Administrators may access global analytics.
- Scheduled analytics execute automatically.
- Export permissions follow Role-Based Access Control.
- Predictive Analytics remain optional until enabled.

---

# Key Performance Indicators (KPIs)

## Academic KPIs

- Average Student Performance
- Pass Rate
- Promotion Rate
- Curriculum Completion
- Attendance Rate
- Competency Growth

## Teacher KPIs

- Assessment Completion Rate
- Curriculum Coverage
- Report Submission Rate
- Student Performance
- Feedback Timeliness

## Business KPIs

- Active Schools
- Active Students
- Subscription Renewal Rate
- Revenue Growth
- Outstanding Fees

## Technical KPIs

- API Availability
- Average Response Time
- Login Success Rate
- PDF Generation Time
- Database Performance
- System Availability

## Executive KPIs

- School Growth
- Platform Adoption
- Operational Efficiency
- User Engagement
- System Reliability
- Financial Sustainability

---

# Relationship Overview

```text
Operational Modules

↓

Data Aggregation

↓

Metrics Engine

↓

Analytics Processing

↓

Historical Snapshots

↓

Business Intelligence

↓

Dashboards

↓

Charts & Visualizations

↓

Reports

↓

Executive Insights

↓

Decision Making
```

---

# Future Enhancements

- AI-generated Executive Summaries
- Predictive Student Performance Analysis
- Early Intervention Alerts
- Machine Learning Recommendations
- Real-time Anomaly Detection
- Cross-School Benchmarking
- Interactive Drill-Down Dashboards
- Custom Analytics Builder
- Scheduled Executive Reports
- Data Warehouse Integration
- Power BI Integration
- Microsoft Excel Live Integration
- Google Looker Studio Integration
- Natural Language Analytics Queries

---

# Summary

The Analytics, Dashboard & Business Intelligence Engine is the strategic intelligence layer of the Nobletech Education Management Platform (NEMP).

It transforms operational, academic, financial, and technical data into actionable insights that empower administrators, teachers, supervisors, and executives to make informed decisions, monitor institutional performance, optimize educational outcomes, and drive continuous improvement.

Its enterprise-ready architecture integrates seamlessly with every operational engine—including Curriculum, Assessment, CBT, Student Portfolio, Report Publishing, Notification, Security, Finance, and Future AI Services—providing a scalable foundation for analytics, reporting, forecasting, and business intelligence without requiring structural database redesign.

---

# End of Document