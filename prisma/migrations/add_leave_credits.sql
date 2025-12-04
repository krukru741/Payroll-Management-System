-- Add LeaveCredit table for managing employee leave entitlements

CREATE TABLE IF NOT EXISTS "LeaveCredit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "employeeId" TEXT NOT NULL,
  "leaveType" "LeaveType" NOT NULL,
  "credits" DOUBLE PRECISION NOT NULL,
  "adjustedBy" TEXT,
  "adjustedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "LeaveCredit_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint for employeeId + leaveType
CREATE UNIQUE INDEX IF NOT EXISTS "LeaveCredit_employeeId_leaveType_key" ON "LeaveCredit"("employeeId", "leaveType");

-- Create index on employeeId for faster queries
CREATE INDEX IF NOT EXISTS "LeaveCredit_employeeId_idx" ON "LeaveCredit"("employeeId");

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE "LeaveCredit" TO postgres;
GRANT ALL PRIVILEGES ON TABLE "LeaveCredit" TO PUBLIC;
