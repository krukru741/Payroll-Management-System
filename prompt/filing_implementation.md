# Filing Page Implementation Plan

## Overview

The Filing page is a centralized hub for employees to submit and manage three types of requests:

1. **Leave Applications** - Request time off (vacation, sick leave, emergency leave, etc.)
2. **Overtime Applications** - Request approval for overtime work
3. **Cash Advance Requests** - Request salary advances

Managers and Admins can review, approve, or reject these requests.

## User Roles & Permissions

### Employee

- File new leave, overtime, and cash advance requests
- View their own request history
- Edit pending requests
- Cancel pending requests
- View request status and approval history

### Manager

- View requests from their department employees
- Approve/reject leave and overtime requests
- Recommend cash advance requests (final approval by Admin)
- View team request statistics

### Admin

- View all requests across the organization
- Approve/reject all types of requests
- Final approval for cash advance requests
- Generate reports on leave balances, overtime hours, and cash advances
- Set policies (max leave days, overtime rates, cash advance limits)

## Phase 1: Database Schema & Backend Setup

### 1.1 Prisma Schema Updates

Add the following models to `prisma/schema.prisma`:

```prisma
// Leave Request Model
model LeaveRequest {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  leaveType     LeaveType
  startDate     DateTime
  endDate       DateTime
  totalDays     Float    // Can be 0.5 for half-day
  reason        String

  status        RequestStatus @default(PENDING)

  // Approval chain
  reviewedById  String?
  reviewedBy    User?    @relation("LeaveReviewer", fields: [reviewedById], references: [id])
  reviewedAt    DateTime?
  reviewNotes   String?

  // Attachments (e.g., medical certificate)
  attachmentUrl String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([employeeId])
  @@index([status])
  @@index([startDate])
}

enum LeaveType {
  VACATION
  SICK_LEAVE
  EMERGENCY_LEAVE
  MATERNITY_LEAVE
  PATERNITY_LEAVE
  BEREAVEMENT_LEAVE
  UNPAID_LEAVE
  OTHER
}

// Overtime Request Model
model OvertimeRequest {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  date          DateTime
  startTime     DateTime
  endTime       DateTime
  totalHours    Float
  reason        String
  projectTask   String?  // What they worked on

  status        RequestStatus @default(PENDING)

  // Approval chain
  reviewedById  String?
  reviewedBy    User?    @relation("OvertimeReviewer", fields: [reviewedById], references: [id])
  reviewedAt    DateTime?
  reviewNotes   String?

  // Payroll integration
  overtimeRate  Float?   // Multiplier (e.g., 1.5x, 2.0x)
  overtimePay   Float?   // Calculated amount
  isPaid        Boolean  @default(false)
  paidInPayrollId String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([employeeId])
  @@index([status])
  @@index([date])
}

// Cash Advance Request Model
model CashAdvanceRequest {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  amount        Float
  reason        String
  repaymentPlan String   // e.g., "3 months", "Next payroll"

  status        RequestStatus @default(PENDING)

  // Approval chain (may require multiple approvals)
  managerApproval      ApprovalStatus @default(PENDING)
  managerApprovedById  String?
  managerApprovedBy    User?    @relation("CashAdvanceManagerApprover", fields: [managerApprovedById], references: [id])
  managerApprovedAt    DateTime?
  managerNotes         String?

  adminApproval        ApprovalStatus @default(PENDING)
  adminApprovedById    String?
  adminApprovedBy      User?    @relation("CashAdvanceAdminApprover", fields: [adminApprovedById], references: [id])
  adminApprovedAt      DateTime?
  adminNotes           String?

  // Disbursement
  isDisbursed   Boolean  @default(false)
  disbursedAt   DateTime?
  disbursedBy   String?

  // Repayment tracking
  isFullyRepaid Boolean  @default(false)
  repaidAmount  Float    @default(0)
  remainingBalance Float

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([employeeId])
  @@index([status])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### 1.2 Backend Controllers

#### Leave Controller (`server/controllers/leave.controller.ts`)

**Endpoints:**

- `POST /api/leave/request` - File a leave request
- `GET /api/leave` - Get leave requests (filtered by employee, status, date range)
- `GET /api/leave/:id` - Get specific leave request
- `PUT /api/leave/:id` - Update leave request (only if pending)
- `DELETE /api/leave/:id` - Cancel leave request
- `POST /api/leave/:id/approve` - Approve leave request
- `POST /api/leave/:id/reject` - Reject leave request
- `GET /api/leave/balance/:employeeId` - Get leave balance

#### Overtime Controller (`server/controllers/overtime.controller.ts`)

**Endpoints:**

- `POST /api/overtime/request` - File an overtime request
- `GET /api/overtime` - Get overtime requests
- `GET /api/overtime/:id` - Get specific overtime request
- `PUT /api/overtime/:id` - Update overtime request
- `DELETE /api/overtime/:id` - Cancel overtime request
- `POST /api/overtime/:id/approve` - Approve overtime request
- `POST /api/overtime/:id/reject` - Reject overtime request
- `GET /api/overtime/summary/:employeeId` - Get overtime summary

#### Cash Advance Controller (`server/controllers/cashadvance.controller.ts`)

**Endpoints:**

- `POST /api/cash-advance/request` - File a cash advance request
- `GET /api/cash-advance` - Get cash advance requests
- `GET /api/cash-advance/:id` - Get specific request
- `PUT /api/cash-advance/:id` - Update request
- `DELETE /api/cash-advance/:id` - Cancel request
- `POST /api/cash-advance/:id/manager-approve` - Manager approval
- `POST /api/cash-advance/:id/admin-approve` - Admin final approval
- `POST /api/cash-advance/:id/reject` - Reject request
- `POST /api/cash-advance/:id/disburse` - Mark as disbursed
- `GET /api/cash-advance/outstanding/:employeeId` - Get outstanding balance

## Phase 2: Frontend UI Components

### 2.1 Filing Page Layout

**Main Sections:**

1. **Header with Quick Stats**

   - Pending requests count (badge)
   - Approved this month
   - Rejected this month

2. **Action Buttons (Top Right)**

   - "File Leave" button
   - "File Overtime" button
   - "Request Cash Advance" button

3. **Tabs/Sections**

   - **My Requests** (Employee view)
   - **Team Requests** (Manager view)
   - **All Requests** (Admin view)

4. **Filter Bar**

   - Request type (Leave, Overtime, Cash Advance)
   - Status (Pending, Approved, Rejected, Cancelled)
   - Date range
   - Search by employee name (for managers/admins)

5. **Requests Table**
   - Columns: Type Icon, Request Type, Employee, Date/Period, Amount/Days, Reason, Status, Actions
   - Color-coded status badges
   - Actions: View Details, Approve, Reject, Edit, Cancel

### 2.2 File Leave Modal

**Form Fields:**

- Leave Type (dropdown)
- Start Date (date picker)
- End Date (date picker)
- Total Days (auto-calculated, editable for half-days)
- Reason (textarea)
- Attachment (optional file upload for medical certificates)

**Validation:**

- Start date cannot be in the past
- End date must be after start date
- Check leave balance
- Check for overlapping leave requests

**Display:**

- Current leave balance
- Remaining balance after this request

### 2.3 File Overtime Modal

**Form Fields:**

- Date (date picker)
- Start Time (time picker)
- End Time (time picker)
- Total Hours (auto-calculated)
- Reason (textarea)
- Project/Task (optional text input)

**Validation:**

- Date cannot be more than 7 days in the past
- End time must be after start time
- Maximum 12 hours per request

**Display:**

- Overtime rate (e.g., 1.5x for weekdays, 2.0x for weekends)
- Estimated overtime pay

### 2.4 Request Cash Advance Modal

**Form Fields:**

- Amount (number input with currency)
- Reason (textarea)
- Repayment Plan (dropdown: "Next Payroll", "2 Months", "3 Months", etc.)

**Validation:**

- Amount must be > 0
- Maximum amount based on salary (e.g., 50% of monthly salary)
- Check for existing outstanding cash advances

**Display:**

- Maximum allowable amount
- Current outstanding balance (if any)
- Estimated deduction per payroll

### 2.5 Request Details Modal

**Sections:**

- Request information (type, dates, amount, reason)
- Employee information (name, department, position)
- Status timeline (submitted → manager review → admin review → approved/rejected)
- Approval/Rejection notes
- Actions (Approve, Reject, Cancel - based on role and status)

## Phase 3: Request Workflows

### 3.1 Leave Request Workflow

1. Employee files leave request
2. System checks leave balance
3. Request goes to Manager for approval
4. Manager approves/rejects
5. If approved, leave balance is deducted
6. Employee receives notification

**Auto-Approval Rules (Optional):**

- Sick leave < 1 day with medical certificate
- Emergency leave (notify manager after)

### 3.2 Overtime Request Workflow

1. Employee files overtime request
2. Request goes to Manager for approval
3. Manager approves/rejects
4. If approved, overtime hours are added to payroll calculation
5. Overtime pay is included in next payroll

**Validation:**

- Cannot exceed company policy limits (e.g., max 60 hours/month)
- Requires justification for weekend/holiday overtime

### 3.3 Cash Advance Workflow

1. Employee files cash advance request
2. Request goes to Manager for initial approval
3. If manager approves, goes to Admin for final approval
4. If admin approves, Finance disburses the amount
5. Repayment is automatically deducted from payroll

**Validation:**

- Maximum 50% of monthly salary
- No new requests if outstanding balance exists
- Minimum employment period (e.g., 3 months)

## Phase 4: Advanced Features

### 4.1 Leave Balance Management

- Track leave balances per employee
- Annual leave accrual (e.g., 1.25 days per month)
- Leave balance expiry (use-it-or-lose-it)
- Leave balance report

### 4.2 Notifications

- Email/in-app notifications for:
  - New request submitted
  - Request approved/rejected
  - Request requires action (for managers/admins)
  - Leave balance low
  - Cash advance repayment reminder

### 4.3 Calendar Integration

- Show approved leaves on a team calendar
- Prevent scheduling conflicts
- Export to Google Calendar/Outlook

### 4.4 Reports & Analytics

- Leave utilization report
- Overtime trends
- Cash advance outstanding balances
- Approval/rejection rates
- Department-wise statistics

### 4.5 Bulk Operations

- Bulk approve/reject (for managers/admins)
- Bulk export to CSV/Excel

## Phase 5: Integration & Polish

### 5.1 Payroll Integration

- Approved overtime automatically added to payroll
- Cash advance repayments automatically deducted
- Leave without pay affects salary calculation

### 5.2 Attendance Integration

- Approved leaves marked in attendance
- Prevent clock-in on approved leave days

### 5.3 Mobile Responsiveness

- Optimized for mobile filing
- Push notifications

### 5.4 Audit Trail

- Track all changes to requests
- Who approved/rejected and when
- Edit history

## Implementation Order

### Sprint 1: Core Leave Functionality

1. Database schema for LeaveRequest
2. Leave backend API
3. File Leave modal
4. Leave requests table
5. Approve/Reject functionality
6. Leave balance tracking

### Sprint 2: Overtime Functionality

1. Database schema for OvertimeRequest
2. Overtime backend API
3. File Overtime modal
4. Overtime requests table
5. Approve/Reject functionality
6. Overtime pay calculation

### Sprint 3: Cash Advance Functionality

1. Database schema for CashAdvanceRequest
2. Cash Advance backend API
3. Request Cash Advance modal
4. Cash advance requests table
5. Two-level approval workflow
6. Repayment tracking

### Sprint 4: Enhancements & Integration

1. Notifications system
2. Calendar view for leaves
3. Reports and analytics
4. Payroll integration
5. Attendance integration
6. Mobile optimization

## UI/UX Considerations

1. **Quick Actions**: Prominent buttons for filing requests
2. **Status Visibility**: Clear status badges with colors
3. **Approval Flow**: Visual timeline showing approval stages
4. **Smart Defaults**: Pre-fill forms with sensible defaults
5. **Inline Validation**: Real-time validation as user types
6. **Confirmation Dialogs**: Confirm before approving/rejecting
7. **Success Feedback**: Toast notifications for actions
8. **Empty States**: Helpful messages when no requests exist

## Business Rules

### Leave Rules

- Minimum 1 day notice for vacation leave
- Sick leave requires medical certificate if > 2 days
- Maximum 5 consecutive vacation days without manager approval
- Cannot file leave if already on leave

### Overtime Rules

- Overtime rate: 1.25x (weekday), 1.5x (weekend), 2.0x (holiday)
- Maximum 4 hours overtime per day
- Maximum 60 hours overtime per month
- Requires pre-approval (no backdating > 7 days)

### Cash Advance Rules

- Maximum 50% of monthly salary
- Minimum 3 months employment
- Maximum 1 active cash advance at a time
- Automatic repayment via payroll deduction
- Interest-free (company policy)

## Success Metrics

- Request submission time < 2 minutes
- Approval/rejection time < 24 hours
- 90% of requests processed within 48 hours
- Zero calculation errors for overtime pay
- 100% cash advance repayment tracking accuracy

## Future Enhancements

- AI-powered request recommendations
- Predictive leave balance warnings
- Integration with project management tools
- Voice-based request filing
- Chatbot for request status queries
- Blockchain for immutable audit trail
