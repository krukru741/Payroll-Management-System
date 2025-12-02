# Phase 2 Design Specifications

## 1. Database ERD (Prisma Schema)

This schema defines the data models and relationships for the PostgreSQL database.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  MANAGER
  EMPLOYEE
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum CivilStatus {
  SINGLE
  MARRIED
  WIDOWED
  SEPARATED
}

enum Department {
  ENGINEERING
  HR
  FINANCE
  SALES
  MARKETING
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  username      String    @unique
  password      String    // Hashed
  role          UserRole  @default(EMPLOYEE)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  employee      Employee? @relation(fields: [employeeId], references: [id])
  employeeId    String?   @unique
  auditLogs     AuditLog[]
}

model Employee {
  id            String    @id // Custom ID like EMP-001
  firstName     String
  lastName      String
  middleName    String?
  email         String    @unique
  
  // Profile
  birthDate     DateTime
  age           Int?
  gender        Gender
  civilStatus   CivilStatus
  address       String
  contactNo     String
  avatarUrl     String?

  // Employment
  department    Department
  position      String
  status        EmployeeStatus @default(ACTIVE)
  dateHired     DateTime
  dateResigned  DateTime?

  // Compensation
  basicSalary   Float
  ratePerHour   Float?
  ratePerDay    Float?

  // Government IDs
  sssNo         String?
  philHealthNo  String?
  pagIbigNo     String?
  tinNo         String?

  // Emergency Contact
  ecFullName    String?
  ecContactNo   String?
  ecRelation    String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user          User?
  attendance    Attendance[]
  payrolls      Payroll[]
  leaves        LeaveRequest[]
  loans         Loan[]
  documents     Document[]
}

model Attendance {
  id            String    @id @default(cuid())
  date          DateTime
  timeIn        DateTime?
  timeOut       DateTime?
  status        String    // PRESENT, LATE, ABSENT, HALF_DAY
  hoursWorked   Float     @default(0)
  overtimeHours Float     @default(0)
  
  employee      Employee  @relation(fields: [employeeId], references: [id])
  employeeId    String

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([employeeId, date])
}

model Payroll {
  id            String    @id @default(cuid())
  periodStart   DateTime
  periodEnd     DateTime
  payoutDate    DateTime?
  
  // Earnings
  basicPay      Float
  overtimePay   Float
  allowances    Float     @default(0)
  grossPay      Float

  // Deductions
  sssDeduction        Float
  philHealthDeduction Float
  pagIbigDeduction    Float
  taxDeduction        Float
  otherDeductions     Float     @default(0)
  totalDeductions     Float

  // Net
  netPay        Float

  // Employer Shares (Memo)
  erSSS         Float
  erPhilHealth  Float
  erPagIbig     Float

  status        String    // DRAFT, FINALIZED, PAID

  employee      Employee  @relation(fields: [employeeId], references: [id])
  employeeId    String

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model LeaveRequest {
  id            String    @id @default(cuid())
  type          String    // VACATION, SICK, EMERGENCY
  startDate     DateTime
  endDate       DateTime
  reason        String
  status        String    @default("PENDING") // PENDING, APPROVED, REJECTED
  
  employee      Employee  @relation(fields: [employeeId], references: [id])
  employeeId    String

  approvedBy    String?
  rejectionReason String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Loan {
  id            String    @id @default(cuid())
  type          String    // SSS, PAGIBIG, COMPANY
  principal     Float
  balance       Float
  monthlyAmort  Float
  status        String    // ACTIVE, PAID

  employee      Employee  @relation(fields: [employeeId], references: [id])
  employeeId    String

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Document {
  id            String    @id @default(cuid())
  name          String
  type          String
  url           String
  size          Int

  employee      Employee  @relation(fields: [employeeId], references: [id])
  employeeId    String

  uploadedAt    DateTime  @default(now())
}

model AuditLog {
  id            String    @id @default(cuid())
  action        String    // LOGIN, CREATE_EMPLOYEE, PROCESS_PAYROLL
  details       String?
  ipAddress     String?
  
  user          User?     @relation(fields: [userId], references: [id])
  userId        String?

  timestamp     DateTime  @default(now())
}
```

## 2. API Route Specifications

All API routes follow the prefix `/api/v1`.
Responses follow the standard format: `{ success: boolean, data?: any, error?: string }`

### Authentication

**POST /api/auth/login**
- **Body**: `{ username, password }`
- **Response**: `{ token, user: { id, name, role, ... } }`

**POST /api/auth/register**
- **Body**: `{ username, password, email, employeeId? }`
- **Auth**: Admin only

### Employees

**GET /api/employees**
- **Query**: `page`, `limit`, `search`, `department`
- **Auth**: Admin, Manager (Team), Employee (Self - restricted)
- **Response**: List of employees with pagination metadata.

**GET /api/employees/:id**
- **Auth**: Admin, Manager (Team), Employee (Self)
- **Response**: Detailed employee profile.

**POST /api/employees**
- **Body**: Full employee object (see Prisma model)
- **Auth**: Admin only
- **Response**: Created employee object.

**PUT /api/employees/:id**
- **Body**: Partial employee object
- **Auth**: Admin, Manager (Team - restricted fields)
- **Response**: Updated employee object.

**DELETE /api/employees/:id**
- **Auth**: Admin only
- **Response**: `{ success: true }`

### Payroll

**POST /api/payroll/calculate**
- **Body**: `{ periodStart, periodEnd, employeeIds[] }`
- **Description**: Triggers the calculation engine for selected employees. Returns draft payroll records.
- **Auth**: Admin, Manager (HR)

**GET /api/payroll**
- **Query**: `periodStart`, `periodEnd`, `employeeId`
- **Auth**: Admin, Manager (Team), Employee (Self)

**POST /api/payroll/finalize**
- **Body**: `{ payrollIds[] }`
- **Description**: Marks payroll records as FINALIZED and generates payslips.
- **Auth**: Admin, Manager (HR)

### Attendance

**POST /api/attendance/clock-in**
- **Body**: `{ employeeId, timestamp, location? }`
- **Auth**: Employee (Self), Admin

**POST /api/attendance/clock-out**
- **Body**: `{ employeeId, timestamp }`

### Leaves

**POST /api/leaves**
- **Body**: `{ type, startDate, endDate, reason }`
- **Auth**: Employee

**PUT /api/leaves/:id/status**
- **Body**: `{ status: "APPROVED" | "REJECTED", reason? }`
- **Auth**: Admin, Manager
