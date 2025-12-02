# Payroll Management System - System Prompt Specification

A comprehensive, phased, and refactor-ready system prompt for building, maintaining, and improving a Payroll Management System (HRIS). Designed for developers, AI agents, and automated systems.

---

## **1. PURPOSE OF THIS SYSTEM PROMPT**

{{ ... }}

* Always prioritize **clarity**, **modularity**, **security**, and **maintainability**.
* Follow best practices for backend, frontend, DB, API, and documentation.
* All generated artifacts must be deterministic and reproducible.
* Never expose private keys, credentials, or unsafe scripts.
* All code must follow naming conventions per section 6.
* Any ambiguity must be resolved logically and consistently.

---

## **3. SYSTEM ARCHITECTURE OVERVIEW**

The Payroll Management System consists of:

### **Technology Stack**

* **Frontend**: React 19, Next.js 16 (App Router), TypeScript
* **Styling**: Tailwind CSS 4 with custom gradient theme
* **Backend**: Next.js API Routes (serverless)
* **Database**: PostgreSQL with Prisma ORM 5.22
* **Authentication**: NextAuth 4.24 (JWT-based, credentials provider)
* **State Management**: TanStack React Query 5.90
* **Form Handling**: React Hook Form 7.66 + Zod 4.1 validation
* **UI Components**: Radix UI primitives + custom components
* **Icons**: Lucide React
* **PDF Generation**: jsPDF + jsPDF-AutoTable
* **Excel Export**: XLSX
* **Testing**: Jest + React Testing Library
* **Infrastructure**: Vercel-ready, serverless architecture

### **Core Modules**

* Employee Information Management
* Time & Attendance Tracking
* Payroll Processing & Calculations
* Leave Management
* Overtime & Cash Advance Filing
* Loan Management
* Adjustment Requests
* Document Management
* Reports & Analytics
* Audit Logging
* Notifications
* User & Role Management
* System Settings

---

## **4. DATABASE SCHEMA (PRISMA)**

### **Core Models**

#### **User**
* Authentication and authorization
* Links to Employee record
* Supports NextAuth session management
* Fields: id, username, email, password (hashed), role, employeeId

#### **Employee**
* Complete employee profile
* Personal information (firstname, lastname, middlename, birthdate, gender, civilStatus, address, contactNo, age)
* Employment details (employeeNo, department, position, employmentStatus, dateHired)
* Compensation (ratePerHour, ratePerDay, basicSalary)
* Government IDs (sssNo, philhealthNo, pagibigNo, tinNo)
* Emergency contact information
* Profile photo URL

#### **Attendance**
* Daily time tracking (timeIn, timeOut)
* Status tracking (PRESENT, ABSENT, LATE, HALF_DAY)
* Overtime hours calculation
* Links to Employee

#### **Payroll**
* Payroll records per employee per period
* Earnings: rate, hoursWorked, overtimeHours, grossPay
* Deductions: sss, philhealth, pagibig, lateDeduction, cashAdvance
* Net pay calculation
* Period tracking (periodStart, periodEnd, payrollDate)
* Status management

#### **LeaveRequest**
* Leave applications (VACATION, SICK, EMERGENCY, OTHER)
* Approval workflow (PENDING, APPROVED, REJECTED)
* Date range tracking

#### **LeaveBalance**
* Annual leave balances per employee
* Tracks totalDays, usedDays, remainingDays
* Per leave type and year

#### **OvertimeFiling**
* Overtime requests with date, time range, hours
* Approval workflow
* Reason tracking

#### **CashAdvance**
* Cash advance requests
* Repayment tracking (periods, amount per period, remaining balance)
* Status management (PENDING, APPROVED, REJECTED, COMPLETED)

#### **Loan**
* Employee loans (EMERGENCY, EDUCATIONAL, HOUSING, PERSONAL)
* Interest rate and repayment schedule
* Monthly deduction calculation
* Balance tracking

#### **AdjustmentRequest**
* Payroll, attendance, deduction adjustments
* Original vs requested value tracking
* Document attachment support
* Approval workflow

#### **Document**
* Employee document storage
* Document type categorization
* File metadata (size, URL, expiration)

#### **Notification**
* User notifications
* Read/unread status
* Action URLs

#### **AuditLog**
* System activity tracking
* User action logging
* Entity change tracking
* IP address logging

#### **Settings**
* Company information
* Payroll configuration (cycle, overtime rate)
* Tax and deduction settings
* System preferences

---

## **5. DEVELOPMENT PHASES**

### **PHASE 1 — Requirements & Scoping**

1. Identify core HRIS modules
2. Define functional requirements
3. Define non-functional requirements
4. Identify target users (Admin, Manager, Employee)
5. Document workflows (DTR, Payroll, Leave, Filing)
6. Produce requirements specification

### **PHASE 2 — System Design**

1. Create architecture blueprint
2. Create database ERD (Prisma schema)
3. Define API routes and specifications
4. Define role-based permissions (RBAC)
5. Draft UI layout and wireframes
6. Specify integrations (SSS, Pag-IBIG, PhilHealth calculations)

### **PHASE 3 — Environment Setup**

1. Initialize Next.js project with TypeScript
2. Configure Prisma with PostgreSQL
3. Set up NextAuth authentication
4. Configure environment variables (.env)
5. Set up Tailwind CSS with custom theme
6. Install and configure dependencies

### **PHASE 4 — Database Design & Migration**

1. Design Prisma schema with all models
2. Create indexes for performance
3. Define relationships and cascades
4. Run initial migration (`prisma migrate dev`)
5. Create seed data for development
6. Test database connections

### **PHASE 5 — Backend Development**

1. Implement API routes in `/app/api`
2. Create service layer for business logic
3. Implement input validation with Zod
4. Add authentication middleware
5. Implement RBAC authorization
6. Add error handling and logging
7. Create utility functions for calculations

### **PHASE 6 — Frontend Development**

1. Create responsive layouts with Tailwind
2. Build reusable UI components
3. Implement forms with React Hook Form + Zod
4. Set up React Query for data fetching
5. Create dashboard pages for each module
6. Implement error and loading states
7. Add client-side validation

### **PHASE 7 — Payroll Engine Implementation**

1. Implement gross pay calculation
2. Add SSS contribution tables and formulas
3. Add PhilHealth contribution formulas
4. Add Pag-IBIG contribution formulas
5. Implement withholding tax calculation
6. Add 13th month pay computation
7. Create payslip generation (PDF)
8. Implement payroll history tracking

### **PHASE 8 — Testing & QA**

1. Write unit tests with Jest
2. Write integration tests for API routes
3. Test authentication flows
4. Test payroll calculations accuracy
5. Perform UAT validation
6. Test responsive design
7. Test browser compatibility

### **PHASE 9 — Deployment**

1. Configure production database
2. Set up environment variables
3. Deploy to Vercel or similar platform
4. Configure SSL/HTTPS
5. Set up database backups
6. Configure monitoring and logging
7. Performance optimization

### **PHASE 10 — Maintenance & Refactoring**

1. Monitor performance metrics
2. Update dependencies regularly
3. Refactor code for optimization
4. Add new features based on feedback
5. Patch security vulnerabilities
6. Update documentation

---

## **6. CODING STANDARDS**

### **Naming Conventions**

* **camelCase** → variables, functions, methods
* **PascalCase** → components, classes, types, interfaces
* **snake_case** → database fields (Prisma schema)
* **CONSTANT_CASE** → environment variables, constants
* **kebab-case** → file names, routes

### **TypeScript Rules**

* Always use explicit types for function parameters and return values
* Use interfaces for object shapes
* Use type for unions and intersections
* Avoid `any` type; use `unknown` if necessary
* Use strict mode

### **Backend Rules (API Routes)**

* One route handler per file in `/app/api`
* Validate all inputs with Zod schemas
* Use try-catch for error handling
* Return consistent response format: `{ success, data?, error? }`
* Use HTTP status codes correctly
* Implement proper authentication checks
* Log important actions to AuditLog

### **Frontend Rules**

* Keep components small and focused (<200 lines)
* Use React Server Components where possible
* Use Client Components only when needed (interactivity, hooks)
* Implement proper loading and error states
* Use Tailwind CSS classes, avoid inline styles
* Use custom hooks for reusable logic
* Implement proper form validation

### **Database Rules**

* Use Prisma migrations for all schema changes
* Never modify database directly
* Use transactions for related operations
* Add indexes for frequently queried fields
* Use proper data types (Decimal for money)
* Implement soft deletes where appropriate

---

## **7. SECURITY GUIDELINES**

* **Password Security**: Hash with bcryptjs (12+ rounds)
* **Authentication**: Use NextAuth with JWT strategy
* **Authorization**: Implement RBAC checks in API routes
* **Input Validation**: Validate all inputs with Zod
* **SQL Injection**: Use Prisma ORM (parameterized queries)
* **XSS Protection**: Sanitize user inputs, use React's built-in escaping
* **CSRF Protection**: Use NextAuth's built-in CSRF tokens
* **Environment Variables**: Never commit .env files
* **Sensitive Data**: Never log passwords or tokens
* **Rate Limiting**: Implement for authentication endpoints
* **HTTPS**: Enforce in production
* **Audit Logging**: Log all critical actions

---

## **8. API ROUTE PATTERNS**

### **Standard Response Format**

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }
```

### **Common Patterns**

```typescript
// GET /api/employees - List with pagination
GET /api/employees?page=1&limit=10&search=john

// GET /api/employees/[id] - Get single
GET /api/employees/cm123abc

// POST /api/employees - Create
POST /api/employees
Body: { firstname, lastname, ... }

// PUT /api/employees/[id] - Update
PUT /api/employees/cm123abc
Body: { position, department, ... }

// DELETE /api/employees/[id] - Delete
DELETE /api/employees/cm123abc
```

### **Authentication Check**

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### **Role-Based Authorization**

```typescript
import { hasPermission } from "@/lib/rbac"

if (!hasPermission(session.user.role, "employees", "create")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

---

## **9. PAYROLL CALCULATION FORMULAS**

### **Gross Pay**

```typescript
grossPay = (ratePerHour * hoursWorked) + (ratePerHour * overtimeHours * overtimeRate)
```

### **SSS Contribution** (2024 Tables)

* Based on monthly salary compensation
* Employee and employer shares
* Maximum contribution cap

### **PhilHealth Contribution** (2024 Tables)

* 5% of monthly basic salary
* Shared equally between employee and employer (2.5% each)
* Minimum and maximum contribution limits

### **Pag-IBIG Contribution**

* Employee: 1-2% of monthly basic salary
* Employer: 2% of monthly basic salary
* Minimum ₱100, Maximum ₱5,000

### **Withholding Tax**

* Based on BIR tax tables (graduated rates)
* Considers tax exemptions and deductions
* Monthly or semi-monthly computation

### **Net Pay**

```typescript
netPay = grossPay - (sss + philhealth + pagibig + withholdingTax + lateDeduction + cashAdvance + loanDeduction + otherDeductions)
```

---

## **10. UI DESIGN SYSTEM**

### **Color Palette (Gradient Theme)**

#### **Primary Colors**
* Teal: `#076653` (primary-500)
* Light Green: `#E2FBCE` (primary-200)
* Dark Teal: `#0C342C` (primary-800)
* Deep Teal: `#06231D` (primary-900)

#### **Secondary Colors**
* Lime: `#E3EF26` (secondary-400)
* Light Cream: `#FFFDEE` (primary-50)

#### **Gradients**
* **Primary**: `linear-gradient(135deg, #E2FBCE 0%, #076653 100%)`
* **Accent**: `linear-gradient(135deg, #E3EF26 0%, #0C342C 100%)`
* **Light**: `linear-gradient(135deg, #FFFDEE 0%, #E3EF26 100%)`
* **Dark**: `linear-gradient(135deg, #076653 0%, #06231D 100%)`

### **Typography**

* **Font Family**: Inter (sans-serif)
* **Headings**: Font weight 600-700
* **Body**: Font weight 400
* **Small Text**: Font size 0.875rem

### **Component Patterns**

* **Cards**: White background, subtle shadow, rounded corners
* **Buttons**: Gradient backgrounds, hover effects, disabled states
* **Forms**: Labeled inputs, inline validation, error messages
* **Tables**: Striped rows, sortable headers, pagination
* **Modals**: Radix Dialog with backdrop
* **Toasts**: Sonner for notifications

### **Responsive Design**

* Mobile-first approach
* Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
* Collapsible navigation on mobile
* Responsive tables (horizontal scroll or card layout)

---

## **11. ROLE-BASED ACCESS CONTROL (RBAC)**

### **Roles**

1. **Admin**: Full system access
2. **Manager**: Department-level access
3. **Employee**: Self-service access

### **Permissions Matrix**

| Module | Admin | Manager | Employee |
|--------|-------|---------|----------|
| Employees | CRUD | Read (team) | Read (self) |
| Attendance | CRUD | CRUD (team) | Read (self) |
| Payroll | CRUD | Read (team) | Read (self) |
| Leave Requests | Approve/Reject | Approve/Reject (team) | Create/Read (self) |
| Overtime | Approve/Reject | Approve/Reject (team) | Create/Read (self) |
| Cash Advance | Approve/Reject | Approve/Reject (team) | Create/Read (self) |
| Loans | Approve/Reject | Approve/Reject (team) | Create/Read (self) |
| Documents | CRUD | Read (team) | Upload/Read (self) |
| Reports | Full Access | Team Reports | Personal Reports |
| Settings | CRUD | Read | None |
| Users | CRUD | None | None |
| Audit Logs | Read | None | None |

### **Implementation**

* Stored in `lib/rbac.ts`
* Checked in API routes and UI components
* Session-based role verification

---

## **12. USER ONBOARDING FLOW**

### **New Employee Registration**

1. Admin creates employee record in system
2. Admin creates user account linked to employee
3. Employee receives credentials
4. First login redirects to onboarding

### **Onboarding Steps**

1. **Welcome Screen**: System introduction
2. **Profile Completion**: Verify personal information
3. **Contact Details**: Update contact information
4. **Government IDs**: Enter SSS, PhilHealth, Pag-IBIG, TIN
5. **Emergency Contact**: Add emergency contact details
6. **Profile Photo**: Upload profile picture (optional)
7. **Review & Submit**: Confirm all information
8. **Completion**: Redirect to dashboard

### **Progress Tracking**

* Save progress automatically
* Allow partial completion
* Mark onboarding as complete in database
* Prevent dashboard access until complete

---

## **13. MODULE SPECIFICATIONS**

### **Dashboard**

* Overview cards (total employees, pending requests, payroll summary)
* Recent activities
* Quick actions
* Notifications panel
* Charts and analytics

### **Employee Management**

* Employee list with search and filters
* Employee profile view/edit
* Employment history
* Document attachments
* Status management (Active, Inactive, Resigned)

### **Attendance**

* Daily attendance logging
* Time in/out tracking
* Attendance calendar view
* Late/absent tracking
* Overtime hours recording
* Export attendance reports

### **Payroll**

* Payroll period selection
* Automated payroll calculation
* Deduction management
* Payslip generation (PDF)
* Payroll history
* Export payroll reports (Excel, PDF)

### **Leave Management**

* Leave request submission
* Leave balance tracking
* Approval workflow
* Leave calendar
* Leave type configuration

### **Filing System**

* Overtime requests
* Cash advance applications
* Loan applications
* Adjustment requests
* Approval workflows
* Status tracking

### **Reports & Analytics**

* Employee reports
* Attendance reports
* Payroll reports
* Leave reports
* Custom date range selection
* Export to Excel/PDF
* Data visualization (charts)

### **Document Management**

* Document upload
* Document categorization
* Expiration tracking
* Secure file storage
* Download/preview

### **Settings**

* Company information
* Payroll configuration
* Tax settings
* System preferences
* User management

---

## **14. REFACTORING GUIDELINES**

### **General Rules**

* Never rewrite entire modules unless absolutely necessary
* Maintain backward compatibility
* Remove dead code and unused imports
* Reduce code complexity
* Split large functions (<50 lines ideal)
* Extract repeated logic into utilities
* Improve variable and function naming
* Ensure consistent error handling

### **Backend Refactoring**

* Move business logic from API routes to service functions
* Create reusable database query functions
* Standardize validation schemas
* Implement consistent error responses
* Add proper TypeScript types

### **Frontend Refactoring**

* Split large components into smaller ones
* Extract logic into custom hooks
* Create reusable UI components
* Remove console.logs
* Optimize re-renders with React.memo
* Use proper loading and error states

### **Database Refactoring**

* Always use Prisma migrations
* Add indexes for performance
* Optimize queries (select only needed fields)
* Use transactions for data integrity
* Implement proper cascading deletes

---

## **15. TESTING STRATEGY**

### **Unit Tests**

* Test utility functions
* Test calculation functions (payroll, deductions)
* Test validation schemas
* Test custom hooks

### **Integration Tests**

* Test API routes
* Test database operations
* Test authentication flows
* Test authorization checks

### **E2E Tests** (Future)

* Test critical user flows
* Test form submissions
* Test data persistence

### **Test Coverage Goals**

* Utility functions: 90%+
* API routes: 80%+
* Components: 70%+

---

## **16. PERFORMANCE OPTIMIZATION**

### **Database**

* Use indexes on frequently queried fields
* Implement pagination for large datasets
* Use `select` to fetch only needed fields
* Optimize N+1 queries with `include`
* Use database-level aggregations

### **Frontend**

* Use React Server Components for static content
* Implement code splitting
* Lazy load heavy components
* Optimize images (Next.js Image component)
* Use React Query for caching
* Implement virtual scrolling for large lists

### **API**

* Implement response caching where appropriate
* Use efficient data serialization
* Minimize payload sizes
* Implement rate limiting

---

## **17. PROHIBITED PATTERNS**

* ❌ Hardcoded credentials or API keys
* ❌ Direct SQL queries (use Prisma)
* ❌ Unhandled promise rejections
* ❌ Large components (>200 lines)
* ❌ Mixed naming conventions
* ❌ Duplicate business logic
* ❌ Poor or missing error messages
* ❌ Missing input validation
* ❌ Logging sensitive data
* ❌ Using `any` type in TypeScript
* ❌ Inline styles (use Tailwind)
* ❌ Committing .env files

---

## **18. BEST PRACTICES**

### **Code Quality**

* Write self-documenting code
* Add comments for complex logic
* Keep functions small and focused
* Follow single responsibility principle
* Use meaningful variable names
* Prefer composition over inheritance

### **Git Workflow**

* Write descriptive commit messages
* Use feature branches
* Review code before merging
* Keep commits atomic and focused

### **Documentation**

* Document API endpoints
* Document complex algorithms
* Keep README updated
* Document environment variables
* Maintain changelog

### **Security**

* Validate all user inputs
* Sanitize data before display
* Use parameterized queries (Prisma)
* Implement proper authentication
* Follow principle of least privilege
* Keep dependencies updated

---

## **19. DEPLOYMENT CHECKLIST**

### **Pre-Deployment**

- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed data created (if needed)
- [ ] SSL certificate configured
- [ ] Performance optimization complete
- [ ] Security audit passed

### **Post-Deployment**

- [ ] Verify application is accessible
- [ ] Test authentication flow
- [ ] Test critical user paths
- [ ] Monitor error logs
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Update documentation

---

## **20. MAINTENANCE GUIDELINES**

### **Regular Tasks**

* **Weekly**: Review error logs, monitor performance
* **Monthly**: Update dependencies, security patches
* **Quarterly**: Database optimization, code refactoring
* **Annually**: Major version upgrades, architecture review

### **Dependency Updates**

* Test in development first
* Check for breaking changes
* Update one major dependency at a time
* Run full test suite after updates

### **Database Maintenance**

* Regular backups (automated)
* Monitor database size and performance
* Archive old data as needed
* Optimize queries based on logs

---

## **21. CHANGELOG TEMPLATE**

```markdown
## [Version X.Y.Z] — YYYY-MM-DD

### Added
- New feature descriptions

### Changed
- Modified functionality descriptions

### Fixed
- Bug fix descriptions

### Removed
- Deprecated feature removals

### Security
- Security-related changes
```

---

## **22. FINAL DIRECTIVES**

* System must remain consistent across all modules
* All contributors must follow this system prompt
* All updates must be incremental and tested
* Refactoring must never break existing workflows
* Documentation must always be kept up-to-date
* Security must be prioritized in all decisions
* User experience must be intuitive and responsive
* Code quality must be maintained at high standards

---

**END OF SYSTEM PROMPT**
