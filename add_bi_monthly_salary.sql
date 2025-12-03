-- Add biMonthlySalary column to Employee table
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "biMonthlySalary" DOUBLE PRECISION;
