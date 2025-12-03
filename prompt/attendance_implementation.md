# Attendance Page Implementation Plan

## Objective

Implement a functional and compact Attendance page that allows viewing attendance records, filtering by date/employee, and monitoring daily attendance status.

## Features

1.  **Attendance List**: Table view of attendance records.
    - Columns: Date, Employee, Time In, Time Out, Hours Worked, Status (Present, Late, Absent).
2.  **Filtering**:
    - Date Range Picker (Default: Current Period).
    - Employee Search (for Admins).
3.  **Summary Cards**:
    - Present Today.
    - Late Today.
    - Absent Today.
4.  **Actions**:
    - Export Attendance Report.

## UI Design (Compact)

- Use `compact.css` utility classes.
- Small font sizes (`text-xs`, `text-[10px]`).
- Tight padding (`p-2`, `py-1`).
- Status badges.

## Implementation Steps

1.  **Backend**:
    - Review `getAttendance` endpoint in `attendance.controller.ts`.
    - Ensure it supports date range and employee filtering.
2.  **Frontend**:
    - Create `pages/Attendance.tsx`.
    - Fetch data from `/api/attendance`.
    - Implement table and filters.
    - Implement summary cards (calculated from fetched data or separate call).
    - Update `App.tsx` to route to the new page.
