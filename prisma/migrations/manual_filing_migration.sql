-- Filing System Database Migration
-- Run this script manually in your PostgreSQL database (HrisDb)
-- This script creates the necessary enums and tables for the Filing system

-- ============================================
-- STEP 1: Create Enums
-- ============================================

-- Leave Type Enum
CREATE TYPE "LeaveType" AS ENUM (
  'VACATION',
  'SICK_LEAVE',
  'EMERGENCY_LEAVE',
  'MATERNITY_LEAVE',
  'PATERNITY_LEAVE',
  'BEREAVEMENT_LEAVE',
  'UNPAID_LEAVE',
  'OTHER'
);

-- Request Status Enum
CREATE TYPE "RequestStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

-- Approval Status Enum (for multi-level approvals)
CREATE TYPE "ApprovalStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- ============================================
-- STEP 2: Drop existing LeaveRequest table (if exists)
-- ============================================
-- WARNING: This will delete all existing leave request data!
-- If you want to preserve data, you'll need to migrate it first.

DROP TABLE IF EXISTS "LeaveRequest" CASCADE;

-- ============================================
-- STEP 3: Create Enhanced LeaveRequest Table
-- ============================================

CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- STEP 4: Create OvertimeRequest Table
-- ============================================

CREATE TABLE "OvertimeRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "projectTask" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "overtimeRate" DOUBLE PRECISION,
    "overtimePay" DOUBLE PRECISION,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidInPayrollId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- STEP 5: Create CashAdvanceRequest Table
-- ============================================

CREATE TABLE "CashAdvanceRequest" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "repaymentPlan" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "managerApproval" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "managerApprovedById" TEXT,
    "managerApprovedAt" TIMESTAMP(3),
    "managerNotes" TEXT,
    "adminApproval" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "adminApprovedById" TEXT,
    "adminApprovedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "isDisbursed" BOOLEAN NOT NULL DEFAULT false,
    "disbursedAt" TIMESTAMP(3),
    "disbursedBy" TEXT,
    "isFullyRepaid" BOOLEAN NOT NULL DEFAULT false,
    "repaidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingBalance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashAdvanceRequest_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- STEP 6: Create Indexes for Performance
-- ============================================

-- LeaveRequest Indexes
CREATE INDEX "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");
CREATE INDEX "LeaveRequest_startDate_idx" ON "LeaveRequest"("startDate");

-- OvertimeRequest Indexes
CREATE INDEX "OvertimeRequest_employeeId_idx" ON "OvertimeRequest"("employeeId");
CREATE INDEX "OvertimeRequest_status_idx" ON "OvertimeRequest"("status");
CREATE INDEX "OvertimeRequest_date_idx" ON "OvertimeRequest"("date");

-- CashAdvanceRequest Indexes
CREATE INDEX "CashAdvanceRequest_employeeId_idx" ON "CashAdvanceRequest"("employeeId");
CREATE INDEX "CashAdvanceRequest_status_idx" ON "CashAdvanceRequest"("status");

-- ============================================
-- STEP 7: Add Foreign Key Constraints
-- ============================================

-- LeaveRequest Foreign Keys
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" 
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_reviewedById_fkey" 
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- OvertimeRequest Foreign Keys
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_employeeId_fkey" 
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_reviewedById_fkey" 
    FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CashAdvanceRequest Foreign Keys
ALTER TABLE "CashAdvanceRequest" ADD CONSTRAINT "CashAdvanceRequest_employeeId_fkey" 
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CashAdvanceRequest" ADD CONSTRAINT "CashAdvanceRequest_managerApprovedById_fkey" 
    FOREIGN KEY ("managerApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CashAdvanceRequest" ADD CONSTRAINT "CashAdvanceRequest_adminApprovedById_fkey" 
    FOREIGN KEY ("adminApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- STEP 8: Verify Migration
-- ============================================

-- Check if enums were created
SELECT typname FROM pg_type WHERE typname IN ('LeaveType', 'RequestStatus', 'ApprovalStatus');

-- Check if tables were created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    AND tablename IN ('LeaveRequest', 'OvertimeRequest', 'CashAdvanceRequest');

-- Count rows (should be 0 for new tables)
SELECT 
    'LeaveRequest' as table_name, COUNT(*) as row_count FROM "LeaveRequest"
UNION ALL
SELECT 
    'OvertimeRequest' as table_name, COUNT(*) as row_count FROM "OvertimeRequest"
UNION ALL
SELECT 
    'CashAdvanceRequest' as table_name, COUNT(*) as row_count FROM "CashAdvanceRequest";

-- ============================================
-- Migration Complete!
-- ============================================
-- After running this script successfully, run:
-- npx prisma generate
-- to update the Prisma Client with the new models.
