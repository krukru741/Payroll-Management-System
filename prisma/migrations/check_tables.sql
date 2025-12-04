-- Check if Filing System Tables Exist
-- Run this first to see what tables are in your database

-- List all tables in the public schema
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- If the tables don't exist, you need to run the migration first
-- The tables should be named exactly: LeaveRequest, OvertimeRequest, CashAdvanceRequest
