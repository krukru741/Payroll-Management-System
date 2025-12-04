-- Auto-Calculated Leave & Overtime Schema Updates
-- Run this migration to add new fields for auto-calculation functionality

-- ============================================
-- STEP 1: Add new fields to LeaveRequest
-- ============================================

ALTER TABLE "LeaveRequest" 
  ALTER COLUMN "endDate" DROP NOT NULL,
  ALTER COLUMN "totalDays" DROP NOT NULL;

ALTER TABLE "LeaveRequest"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "completedBy" TEXT,
  ADD COLUMN "manualCompletion" BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- STEP 2: Add new fields to OvertimeRequest
-- ============================================

ALTER TABLE "OvertimeRequest"
  ALTER COLUMN "endTime" DROP NOT NULL,
  ALTER COLUMN "totalHours" DROP NOT NULL;

ALTER TABLE "OvertimeRequest"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "completedBy" TEXT,
  ADD COLUMN "manualCompletion" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "isBackdated" BOOLEAN NOT NULL DEFAULT false;

-- ============================================
-- STEP 3: Add indexes for new fields
-- ============================================

CREATE INDEX "LeaveRequest_isActive_idx" ON "LeaveRequest"("isActive");
CREATE INDEX "OvertimeRequest_isActive_idx" ON "OvertimeRequest"("isActive");

-- ============================================
-- STEP 4: Update existing records
-- ============================================

-- Mark all existing leave requests as completed (not active)
UPDATE "LeaveRequest" 
SET "isActive" = false, 
    "completedAt" = "updatedAt",
    "manualCompletion" = true
WHERE "endDate" IS NOT NULL;

-- Mark all existing overtime requests as completed (not active)
UPDATE "OvertimeRequest"
SET "isActive" = false,
    "completedAt" = "updatedAt", 
    "manualCompletion" = true
WHERE "endTime" IS NOT NULL;

-- ============================================
-- STEP 5: Verify Migration
-- ============================================

-- Check LeaveRequest columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'LeaveRequest' 
AND column_name IN ('endDate', 'totalDays', 'isActive', 'completedAt', 'completedBy', 'manualCompletion')
ORDER BY column_name;

-- Check OvertimeRequest columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'OvertimeRequest' 
AND column_name IN ('endTime', 'totalHours', 'isActive', 'completedAt', 'completedBy', 'manualCompletion', 'isBackdated')
ORDER BY column_name;

-- ============================================
-- Migration Complete!
-- ============================================
-- After running this script successfully, run:
-- npx prisma db pull
-- npx prisma generate
-- to update the Prisma Client with the schema changes.
